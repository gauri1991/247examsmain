from django.core.management.base import BaseCommand
from core.models import Feature, FeatureRolePermission


class Command(BaseCommand):
    help = 'Setup role-based permissions for existing features'

    def handle(self, *args, **options):
        self.stdout.write('Setting up role-based permissions for features...')
        
        # Get all features
        features = Feature.objects.all()
        created_count = 0
        
        for feature in features:
            # Create permissions for each role if they don't exist
            for role, role_display in FeatureRolePermission.ROLE_CHOICES:
                permission, created = FeatureRolePermission.objects.get_or_create(
                    feature=feature,
                    role=role,
                    defaults={'is_enabled': self.get_default_permission(feature, role)}
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        f'Created permission: {feature.name} - {role_display} ({"Enabled" if permission.is_enabled else "Disabled"})'
                    )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} role permissions')
        )

    def get_default_permission(self, feature, role):
        """Get default permission for feature-role combination"""
        # Admin gets access to everything by default
        if role == 'ADMIN':
            return True
        
        # Teacher gets access to most educational features
        if role == 'TEACHER':
            if feature.category.name in ['EXAM_FEATURES', 'CONTENT_MANAGEMENT', 'ANALYTICS']:
                return True
            if feature.key in ['grade_calculator', 'progress_tracking', 'dashboard_analytics']:
                return True
            return False
        
        # Student gets basic interface features
        if role == 'STUDENT':
            if feature.category.name in ['STUDENT_UI', 'STUDENT_DASHBOARD']:
                return True
            if feature.key in ['exam_timer', 'auto_save', 'progress_tracking']:
                return True
            return False
        
        return False