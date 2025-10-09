from rest_framework import serializers
from django.utils import timezone
from .models import FeatureCategory, Feature, FeatureChangeLog, FeatureConfiguration, FeatureRolePermission


class FeatureCategorySerializer(serializers.ModelSerializer):
    features_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FeatureCategory
        fields = ['id', 'name', 'display_name', 'description', 'icon', 'order', 'features_count']
        
    def get_features_count(self, obj):
        return obj.features.count()


class FeatureDependencySerializer(serializers.ModelSerializer):
    """Lightweight serializer for feature dependencies"""
    class Meta:
        model = Feature
        fields = ['id', 'key', 'name', 'is_enabled', 'priority']


class FeatureRolePermissionSerializer(serializers.ModelSerializer):
    """Serializer for role-based feature permissions"""
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    feature_key = serializers.CharField(source='feature.key', read_only=True)
    
    class Meta:
        model = FeatureRolePermission
        fields = ['id', 'feature', 'feature_name', 'feature_key', 'role', 'is_enabled', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class FeatureSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.display_name', read_only=True)
    dependencies = FeatureDependencySerializer(source='depends_on', many=True, read_only=True)
    conflicts = FeatureDependencySerializer(source='conflicts_with', many=True, read_only=True)
    dependent_features = FeatureDependencySerializer(many=True, read_only=True)
    can_be_disabled = serializers.SerializerMethodField()
    dependencies_satisfied = serializers.SerializerMethodField()
    role_permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = Feature
        fields = [
            'id', 'key', 'name', 'description', 'category', 'category_name',
            'is_enabled', 'is_beta', 'priority', 'feature_type',
            'dependencies', 'conflicts', 'dependent_features',
            'requires_restart', 'affects_performance', 'user_roles',
            'config_options', 'can_be_disabled', 'dependencies_satisfied',
            'role_permissions', 'created_at', 'updated_at', 'enabled_at', 'enabled_by'
        ]
        read_only_fields = ['created_at', 'updated_at', 'enabled_at', 'enabled_by']
        
    def get_can_be_disabled(self, obj):
        return obj.can_be_disabled()
        
    def get_dependencies_satisfied(self, obj):
        return all(dep.is_enabled for dep in obj.depends_on.all())
    
    def get_role_permissions(self, obj):
        permissions = {}
        for perm in obj.role_permissions.all():
            permissions[perm.role] = perm.is_enabled
        # Ensure all roles are represented
        for role, _ in FeatureRolePermission.ROLE_CHOICES:
            if role not in permissions:
                permissions[role] = False
        return permissions


class FeatureToggleSerializer(serializers.Serializer):
    """Serializer for toggling feature status"""
    is_enabled = serializers.BooleanField()
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        feature = self.context['feature']
        is_enabled = data['is_enabled']
        
        if is_enabled:
            # Check dependencies
            for dependency in feature.depends_on.all():
                if not dependency.is_enabled:
                    raise serializers.ValidationError(
                        f"Cannot enable '{feature.name}' because dependency '{dependency.name}' is disabled."
                    )
            
            # Check conflicts
            for conflict in feature.conflicts_with.all():
                if conflict.is_enabled:
                    raise serializers.ValidationError(
                        f"Cannot enable '{feature.name}' because it conflicts with '{conflict.name}' which is currently enabled."
                    )
        else:
            # Check if any enabled features depend on this one
            enabled_dependents = feature.dependent_features.filter(is_enabled=True)
            if enabled_dependents.exists():
                dependent_names = ', '.join([dep.name for dep in enabled_dependents])
                raise serializers.ValidationError(
                    f"Cannot disable '{feature.name}' because these features depend on it: {dependent_names}"
                )
        
        return data


class FeatureChangeLogSerializer(serializers.ModelSerializer):
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.first_name', read_only=True)
    
    class Meta:
        model = FeatureChangeLog
        fields = [
            'id', 'feature', 'feature_name', 'changed_by', 'changed_by_name',
            'action', 'previous_state', 'new_state', 'reason', 'timestamp',
            'ip_address', 'user_agent'
        ]


class FeatureConfigurationSerializer(serializers.ModelSerializer):
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    
    class Meta:
        model = FeatureConfiguration
        fields = [
            'id', 'feature', 'feature_name', 'config_schema',
            'current_config', 'default_config', 'last_updated', 'updated_by'
        ]
        read_only_fields = ['last_updated']


class FeatureRoleToggleSerializer(serializers.Serializer):
    """Serializer for toggling role-based feature permissions"""
    feature_key = serializers.CharField(max_length=100)
    role = serializers.ChoiceField(choices=FeatureRolePermission.ROLE_CHOICES)
    is_enabled = serializers.BooleanField()
    
    def validate_feature_key(self, value):
        if not Feature.objects.filter(key=value).exists():
            raise serializers.ValidationError(f"Feature with key '{value}' does not exist.")
        return value


class FeatureBulkToggleSerializer(serializers.Serializer):
    """Serializer for bulk toggle operations"""
    feature_keys = serializers.ListField(
        child=serializers.CharField(max_length=100),
        allow_empty=False
    )
    is_enabled = serializers.BooleanField()
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate_feature_keys(self, value):
        existing_keys = set(Feature.objects.filter(key__in=value).values_list('key', flat=True))
        invalid_keys = set(value) - existing_keys
        if invalid_keys:
            raise serializers.ValidationError(f"Invalid feature keys: {', '.join(invalid_keys)}")
        return value