from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile, MobileOTP


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin with enhanced features"""

    list_display = [
        'username',
        'email',
        'phone',
        'full_name',
        'role_badge',
        'subscription_badge',
        'is_verified',
        'is_staff',
        'is_superuser',
        'is_active',
        'date_joined'
    ]

    list_filter = [
        'role',
        'subscription_type',
        'is_verified',
        'is_staff',
        'is_superuser',
        'is_active',
        'is_active_subscriber',
        'date_joined'
    ]

    search_fields = [
        'username',
        'email',
        'phone',
        'first_name',
        'last_name'
    ]

    ordering = ['-date_joined']

    readonly_fields = [
        'id',
        'date_joined',
        'last_login',
        'created_at',
        'updated_at',
        'has_active_subscription'
    ]

    fieldsets = (
        ('Authentication', {
            'fields': ('id', 'username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Permissions', {
            'fields': (
                'role',
                'is_active',
                'is_verified',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions'
            )
        }),
        ('Subscription', {
            'fields': (
                'subscription_type',
                'subscription_start',
                'subscription_end',
                'is_active_subscriber',
                'has_active_subscription'
            )
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'email',
                'phone',
                'password1',
                'password2',
                'role',
                'is_staff',
                'is_superuser'
            ),
        }),
    )

    def role_badge(self, obj):
        """Display role with color badge"""
        colors = {
            'student': '#3b82f6',  # blue
            'teacher': '#10b981',  # green
            'admin': '#ef4444',    # red
        }
        color = colors.get(obj.role, '#6b7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 4px; font-size: 11px; font-weight: 600;">{}</span>',
            color,
            obj.role.upper()
        )
    role_badge.short_description = 'Role'

    def subscription_badge(self, obj):
        """Display subscription with color badge"""
        colors = {
            'free': '#6b7280',      # gray
            'basic': '#3b82f6',     # blue
            'premium': '#f59e0b',   # yellow/gold
        }
        color = colors.get(obj.subscription_type, '#6b7280')
        icon = '🆓' if obj.subscription_type == 'free' else '⭐' if obj.subscription_type == 'premium' else '📦'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; '
            'border-radius: 4px; font-size: 11px; font-weight: 600;">{} {}</span>',
            color,
            icon,
            obj.subscription_type.upper()
        )
    subscription_badge.short_description = 'Subscription'

    actions = ['activate_users', 'deactivate_users', 'verify_users', 'make_admin', 'make_teacher']

    def activate_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} user(s) activated successfully.')
    activate_users.short_description = "Activate selected users"

    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} user(s) deactivated successfully.')
    deactivate_users.short_description = "Deactivate selected users"

    def verify_users(self, request, queryset):
        count = queryset.update(is_verified=True)
        self.message_user(request, f'{count} user(s) verified successfully.')
    verify_users.short_description = "Verify selected users"

    def make_admin(self, request, queryset):
        count = queryset.update(role='admin', is_staff=True)
        self.message_user(request, f'{count} user(s) promoted to admin.')
    make_admin.short_description = "Make selected users admin"

    def make_teacher(self, request, queryset):
        count = queryset.update(role='teacher')
        self.message_user(request, f'{count} user(s) assigned as teacher.')
    make_teacher.short_description = "Make selected users teacher"

    def get_actions(self, request):
        """Override to add warning message for delete action"""
        actions = super().get_actions(request)
        # Keep delete action but it's now safe - content won't be deleted
        return actions


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User Profile admin interface"""

    list_display = [
        'user',
        'user_email',
        'city',
        'state',
        'country',
        'language',
        'email_notifications',
        'created_at'
    ]

    list_filter = [
        'language',
        'email_notifications',
        'country',
        'state'
    ]

    search_fields = [
        'user__username',
        'user__email',
        'user__phone',
        'city',
        'state',
        'country'
    ]

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Profile Info', {
            'fields': ('bio', 'avatar', 'date_of_birth')
        }),
        ('Location', {
            'fields': ('city', 'state', 'country')
        }),
        ('Preferences', {
            'fields': ('language', 'timezone', 'email_notifications')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def user_email(self, obj):
        return obj.user.email or obj.user.phone or 'N/A'
    user_email.short_description = 'Email/Phone'


@admin.register(MobileOTP)
class MobileOTPAdmin(admin.ModelAdmin):
    """Mobile OTP admin interface"""

    list_display = [
        'phone',
        'otp',
        'purpose',
        'status_badge',
        'attempts',
        'created_at',
        'expires_at',
        'is_expired_now'
    ]

    list_filter = [
        'purpose',
        'is_verified',
        'created_at'
    ]

    search_fields = [
        'phone',
        'otp'
    ]

    readonly_fields = [
        'created_at',
        'is_expired_now'
    ]

    ordering = ['-created_at']

    fieldsets = (
        ('OTP Details', {
            'fields': ('phone', 'otp', 'purpose')
        }),
        ('Status', {
            'fields': ('is_verified', 'attempts', 'created_at', 'expires_at', 'is_expired_now')
        }),
    )

    def status_badge(self, obj):
        """Display verification status with badge"""
        if obj.is_verified:
            return format_html(
                '<span style="background-color: #10b981; color: white; padding: 3px 8px; '
                'border-radius: 4px; font-size: 11px; font-weight: 600;">✓ VERIFIED</span>'
            )
        elif obj.is_expired():
            return format_html(
                '<span style="background-color: #ef4444; color: white; padding: 3px 8px; '
                'border-radius: 4px; font-size: 11px; font-weight: 600;">⏱ EXPIRED</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #f59e0b; color: white; padding: 3px 8px; '
                'border-radius: 4px; font-size: 11px; font-weight: 600;">⏳ PENDING</span>'
            )
    status_badge.short_description = 'Status'

    def is_expired_now(self, obj):
        """Check if OTP is expired"""
        return obj.is_expired()
    is_expired_now.boolean = True
    is_expired_now.short_description = 'Expired'
