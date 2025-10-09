from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import FeatureCategory, Feature, FeatureChangeLog, FeatureConfiguration, FeatureRolePermission
from .serializers import (
    FeatureCategorySerializer, FeatureSerializer, FeatureToggleSerializer,
    FeatureChangeLogSerializer, FeatureConfigurationSerializer,
    FeatureBulkToggleSerializer, FeatureRolePermissionSerializer, FeatureRoleToggleSerializer
)


class FeatureCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for feature categories"""
    queryset = FeatureCategory.objects.all()
    serializer_class = FeatureCategorySerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return FeatureCategory.objects.prefetch_related('features').all()


class FeatureViewSet(viewsets.ModelViewSet):
    """ViewSet for feature management"""
    queryset = Feature.objects.all()
    serializer_class = FeatureSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'key'
    
    def get_queryset(self):
        queryset = Feature.objects.select_related('category', 'enabled_by').prefetch_related(
            'depends_on', 'conflicts_with', 'dependent_features', 'role_permissions'
        )
        
        # Filter by category if specified
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name=category)
            
        # Filter by enabled status
        enabled = self.request.query_params.get('enabled')
        if enabled is not None:
            queryset = queryset.filter(is_enabled=enabled.lower() == 'true')
            
        # Filter by beta status
        beta = self.request.query_params.get('beta')
        if beta is not None:
            queryset = queryset.filter(is_beta=beta.lower() == 'true')
            
        return queryset
    
    def create_change_log(self, feature, action, previous_state=None, new_state=None, reason=""):
        """Create a change log entry"""
        request = self.request
        FeatureChangeLog.objects.create(
            feature=feature,
            changed_by=request.user,
            action=action,
            previous_state=previous_state,
            new_state=new_state,
            reason=reason,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=True, methods=['post'])
    def toggle(self, request, key=None):
        """Toggle feature on/off"""
        feature = self.get_object()
        serializer = FeatureToggleSerializer(
            data=request.data,
            context={'feature': feature}
        )
        
        if serializer.is_valid():
            previous_state = feature.is_enabled
            new_state = serializer.validated_data['is_enabled']
            reason = serializer.validated_data.get('reason', '')
            
            with transaction.atomic():
                feature.is_enabled = new_state
                if new_state:
                    feature.enabled_at = timezone.now()
                    feature.enabled_by = request.user
                
                feature.save()
                
                # Create change log
                action = 'ENABLED' if new_state else 'DISABLED'
                self.create_change_log(feature, action, previous_state, new_state, reason)
            
            return Response({
                'success': True,
                'message': f"Feature '{feature.name}' has been {'enabled' if new_state else 'disabled'}",
                'feature': FeatureSerializer(feature).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def bulk_toggle(self, request):
        """Bulk toggle multiple features"""
        serializer = FeatureBulkToggleSerializer(data=request.data)
        
        if serializer.is_valid():
            feature_keys = serializer.validated_data['feature_keys']
            is_enabled = serializer.validated_data['is_enabled']
            reason = serializer.validated_data.get('reason', '')
            
            features = Feature.objects.filter(key__in=feature_keys)
            updated_features = []
            errors = []
            
            with transaction.atomic():
                for feature in features:
                    try:
                        # Validate dependencies/conflicts for each feature
                        toggle_serializer = FeatureToggleSerializer(
                            data={'is_enabled': is_enabled, 'reason': reason},
                            context={'feature': feature}
                        )
                        
                        if toggle_serializer.is_valid():
                            previous_state = feature.is_enabled
                            feature.is_enabled = is_enabled
                            if is_enabled:
                                feature.enabled_at = timezone.now()
                                feature.enabled_by = request.user
                            
                            feature.save()
                            
                            # Create change log
                            action = 'ENABLED' if is_enabled else 'DISABLED'
                            self.create_change_log(feature, action, previous_state, is_enabled, reason)
                            
                            updated_features.append(feature.key)
                        else:
                            errors.append({
                                'feature': feature.key,
                                'errors': toggle_serializer.errors
                            })
                    except Exception as e:
                        errors.append({
                            'feature': feature.key,
                            'errors': [str(e)]
                        })
            
            return Response({
                'success': True,
                'updated_features': updated_features,
                'errors': errors,
                'message': f"Bulk {'enabled' if is_enabled else 'disabled'} {len(updated_features)} features"
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def dependencies(self, request, key=None):
        """Get feature dependencies tree"""
        feature = self.get_object()
        
        def get_dependency_tree(feat, visited=None):
            if visited is None:
                visited = set()
            
            if feat.id in visited:
                return {'circular_dependency': True}
            
            visited.add(feat.id)
            
            dependencies = []
            for dep in feat.depends_on.all():
                dep_data = {
                    'id': dep.id,
                    'key': dep.key,
                    'name': dep.name,
                    'is_enabled': dep.is_enabled,
                    'dependencies': get_dependency_tree(dep, visited.copy())
                }
                dependencies.append(dep_data)
            
            return dependencies
        
        dependency_tree = get_dependency_tree(feature)
        
        return Response({
            'feature': feature.key,
            'dependency_tree': dependency_tree,
            'can_be_enabled': all(dep.is_enabled for dep in feature.depends_on.all())
        })
    
    @action(detail=True, methods=['get'])
    def impact(self, request, key=None):
        """Get impact analysis for disabling a feature"""
        feature = self.get_object()
        
        def get_dependent_tree(feat, visited=None):
            if visited is None:
                visited = set()
            
            if feat.id in visited:
                return {'circular_dependency': True}
            
            visited.add(feat.id)
            
            dependents = []
            for dep in feat.dependent_features.all():
                dep_data = {
                    'id': dep.id,
                    'key': dep.key,
                    'name': dep.name,
                    'is_enabled': dep.is_enabled,
                    'dependents': get_dependent_tree(dep, visited.copy())
                }
                dependents.append(dep_data)
            
            return dependents
        
        dependent_tree = get_dependent_tree(feature)
        enabled_dependents = feature.dependent_features.filter(is_enabled=True)
        
        return Response({
            'feature': feature.key,
            'can_be_disabled': not enabled_dependents.exists(),
            'dependent_tree': dependent_tree,
            'enabled_dependents': [dep.key for dep in enabled_dependents]
        })
    
    @action(detail=False, methods=['post'])
    def toggle_role_permission(self, request):
        """Toggle role-based permission for a feature"""
        serializer = FeatureRoleToggleSerializer(data=request.data)
        
        if serializer.is_valid():
            feature_key = serializer.validated_data['feature_key']
            role = serializer.validated_data['role']
            is_enabled = serializer.validated_data['is_enabled']
            
            feature = get_object_or_404(Feature, key=feature_key)
            
            # Get or create the role permission
            role_permission, created = FeatureRolePermission.objects.get_or_create(
                feature=feature,
                role=role,
                defaults={'is_enabled': is_enabled}
            )
            
            if not created:
                role_permission.is_enabled = is_enabled
                role_permission.save()
            
            return Response({
                'success': True,
                'message': f"Role permission for '{feature.name}' - {role} has been {'enabled' if is_enabled else 'disabled'}",
                'feature_key': feature_key,
                'role': role,
                'is_enabled': is_enabled
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeatureChangeLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for feature change logs"""
    queryset = FeatureChangeLog.objects.all()
    serializer_class = FeatureChangeLogSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = FeatureChangeLog.objects.select_related('feature', 'changed_by')
        
        # Filter by feature
        feature_key = self.request.query_params.get('feature')
        if feature_key:
            queryset = queryset.filter(feature__key=feature_key)
            
        return queryset.order_by('-timestamp')


class FeatureConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for feature configurations"""
    queryset = FeatureConfiguration.objects.all()
    serializer_class = FeatureConfigurationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return FeatureConfiguration.objects.select_related('feature', 'updated_by')
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)