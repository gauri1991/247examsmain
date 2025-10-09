from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import FeatureCategory, Feature, FeatureChangeLog, FeatureConfiguration, FeatureRolePermission


@admin.register(FeatureCategory)
class FeatureCategoryAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'name', 'order', 'created_at']
    list_editable = ['order']
    list_filter = ['created_at']
    search_fields = ['display_name', 'name', 'description']
    ordering = ['order', 'display_name']


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'category', 'is_enabled_display', 'is_beta', 'priority', 'feature_type', 'created_at']
    list_filter = ['is_enabled', 'is_beta', 'priority', 'feature_type', 'category', 'requires_restart', 'affects_performance']
    search_fields = ['name', 'key', 'description']
    filter_horizontal = ['depends_on', 'conflicts_with']
    readonly_fields = ['enabled_at', 'enabled_by', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('key', 'name', 'description', 'category')
        }),
        ('Status & Type', {
            'fields': ('is_enabled', 'is_beta', 'priority', 'feature_type')
        }),
        ('Dependencies & Conflicts', {
            'fields': ('depends_on', 'conflicts_with'),
            'classes': ('collapse',)
        }),
        ('Configuration', {
            'fields': ('requires_restart', 'affects_performance', 'user_roles', 'config_options'),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': ('enabled_at', 'enabled_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def is_enabled_display(self, obj):
        if obj.is_enabled:
            return format_html('<span style="color: green;">✓ Enabled</span>')
        else:
            return format_html('<span style="color: red;">✗ Disabled</span>')
    is_enabled_display.short_description = 'Status'
    
    def save_model(self, request, obj, form, change):
        if change and 'is_enabled' in form.changed_data:
            if obj.is_enabled:
                obj.enabled_at = timezone.now()
                obj.enabled_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(FeatureChangeLog)
class FeatureChangeLogAdmin(admin.ModelAdmin):
    list_display = ['feature', 'action', 'changed_by', 'timestamp', 'previous_state', 'new_state']
    list_filter = ['action', 'timestamp', 'previous_state', 'new_state']
    search_fields = ['feature__name', 'feature__key', 'reason']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'


@admin.register(FeatureRolePermission)
class FeatureRolePermissionAdmin(admin.ModelAdmin):
    list_display = ['feature', 'role', 'is_enabled_display', 'created_at']
    list_filter = ['role', 'is_enabled', 'feature__category', 'created_at']
    search_fields = ['feature__name', 'feature__key']
    readonly_fields = ['created_at', 'updated_at']
    
    def is_enabled_display(self, obj):
        if obj.is_enabled:
            return format_html('<span style="color: green;">✓ Enabled</span>')
        else:
            return format_html('<span style="color: red;">✗ Disabled</span>')
    is_enabled_display.short_description = 'Status'


@admin.register(FeatureConfiguration)
class FeatureConfigurationAdmin(admin.ModelAdmin):
    list_display = ['feature', 'last_updated', 'updated_by']
    list_filter = ['last_updated']
    search_fields = ['feature__name', 'feature__key']
    readonly_fields = ['last_updated']
