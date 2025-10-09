from django.db import models
from django.core.exceptions import ValidationError


class FeatureCategory(models.Model):
    """Categories for organizing features"""
    CATEGORY_CHOICES = [
        ('STUDENT_UI', 'Student Interface'),
        ('STUDENT_DASHBOARD', 'Student Dashboard'),
        ('EXAM_FEATURES', 'Exam Features'),
        ('CONTENT_MANAGEMENT', 'Content Management'),
        ('ANALYTICS', 'Analytics & Reporting'),
        ('ADMIN_TOOLS', 'Admin Tools'),
        ('PAYMENT_SYSTEM', 'Payment System'),
        ('COMMUNICATION', 'Communication'),
        ('SECURITY', 'Security Features'),
        ('INTEGRATIONS', 'External Integrations'),
    ]
    
    name = models.CharField(max_length=50, choices=CATEGORY_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon name for UI")
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'display_name']
        
    def __str__(self):
        return self.display_name


class Feature(models.Model):
    """Individual features that can be toggled on/off"""
    
    # Feature priority levels
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    # Feature types
    TYPE_CHOICES = [
        ('UI_COMPONENT', 'UI Component'),
        ('FUNCTIONALITY', 'Functionality'),
        ('INTEGRATION', 'Integration'),
        ('SECURITY', 'Security'),
        ('ANALYTICS', 'Analytics'),
        ('WORKFLOW', 'Workflow'),
    ]
    
    key = models.CharField(max_length=100, unique=True, help_text="Unique identifier for the feature")
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(FeatureCategory, on_delete=models.CASCADE, related_name='features')
    is_enabled = models.BooleanField(default=False)
    is_beta = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    feature_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='FUNCTIONALITY')
    
    # Dependencies
    depends_on = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='dependent_features')
    conflicts_with = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='conflicting_features')
    
    # Additional metadata
    requires_restart = models.BooleanField(default=False, help_text="Whether enabling this feature requires system restart")
    affects_performance = models.BooleanField(default=False)
    user_roles = models.JSONField(default=list, help_text="User roles that can access this feature")
    config_options = models.JSONField(default=dict, help_text="Additional configuration options")
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    enabled_at = models.DateTimeField(null=True, blank=True)
    enabled_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='enabled_features')
    
    class Meta:
        ordering = ['category__order', 'priority', 'name']
        
    def __str__(self):
        return f"{self.name} ({'Enabled' if self.is_enabled else 'Disabled'})"
    
    def clean(self):
        """Validate feature dependencies and conflicts"""
        if self.is_enabled:
            # Check if all dependencies are enabled
            for dependency in self.depends_on.all():
                if not dependency.is_enabled:
                    raise ValidationError(f"Cannot enable '{self.name}' because dependency '{dependency.name}' is disabled.")
            
            # Check for conflicts
            for conflict in self.conflicts_with.all():
                if conflict.is_enabled:
                    raise ValidationError(f"Cannot enable '{self.name}' because it conflicts with '{conflict.name}' which is currently enabled.")
    
    def get_dependencies_status(self):
        """Get status of all dependencies"""
        dependencies = []
        for dep in self.depends_on.all():
            dependencies.append({
                'feature': dep,
                'is_satisfied': dep.is_enabled
            })
        return dependencies
    
    def get_dependent_features(self):
        """Get features that depend on this feature"""
        return self.dependent_features.all()
    
    def can_be_disabled(self):
        """Check if this feature can be disabled (no enabled dependents)"""
        enabled_dependents = self.dependent_features.filter(is_enabled=True)
        return not enabled_dependents.exists()


class FeatureChangeLog(models.Model):
    """Log of feature toggle changes"""
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='change_logs')
    changed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=[
        ('ENABLED', 'Enabled'),
        ('DISABLED', 'Disabled'),
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('DELETED', 'Deleted'),
    ])
    previous_state = models.BooleanField(null=True, blank=True)
    new_state = models.BooleanField(null=True, blank=True)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.feature.name} - {self.action} at {self.timestamp}"


class FeatureRolePermission(models.Model):
    """Role-based permissions for features"""
    
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('TEACHER', 'Teacher'),
        ('ADMIN', 'Admin'),
    ]
    
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name='role_permissions')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['feature', 'role']
        ordering = ['feature__category__order', 'feature__name', 'role']
    
    def __str__(self):
        return f"{self.feature.name} - {self.role} ({'Enabled' if self.is_enabled else 'Disabled'})"


class FeatureConfiguration(models.Model):
    """Additional configuration for features"""
    feature = models.OneToOneField(Feature, on_delete=models.CASCADE, related_name='configuration')
    config_schema = models.JSONField(default=dict, help_text="JSON schema for configuration validation")
    current_config = models.JSONField(default=dict, help_text="Current configuration values")
    default_config = models.JSONField(default=dict, help_text="Default configuration values")
    last_updated = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Config for {self.feature.name}"
