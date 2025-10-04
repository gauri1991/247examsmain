from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views, admin_views

urlpatterns = [
    # Traditional Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Mobile Authentication
    path('mobile/send-otp/', views.MobileSendOTPView.as_view(), name='mobile_send_otp'),
    path('mobile/verify-otp/', views.MobileVerifyOTPView.as_view(), name='mobile_verify_otp'),
    path('mobile/register/', views.MobileRegistrationView.as_view(), name='mobile_register'),
    path('mobile/login/', views.MobileLoginView.as_view(), name='mobile_login'),
    
    # Mobile + Password Authentication
    path('mobile/password/register/', views.MobilePasswordRegistrationView.as_view(), name='mobile_password_register'),
    path('mobile/password/login/', views.MobilePasswordLoginView.as_view(), name='mobile_password_login'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/details/', views.ProfileDetailView.as_view(), name='profile_details'),
    path('profile/change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('dashboard/activity/', views.recent_activity, name='recent_activity'),
    
    # Admin endpoints
    path('admin/list/', admin_views.admin_user_list, name='admin_user_list'),
    path('admin/<str:user_id>/toggle-status/', admin_views.admin_toggle_user_status, name='admin_toggle_user_status'),
    path('admin/<str:user_id>/toggle-admin/', admin_views.admin_toggle_admin_role, name='admin_toggle_admin_role'),
    path('admin/<str:user_id>/delete/', admin_views.admin_delete_user, name='admin_delete_user'),
    path('admin/<str:user_id>/detail/', admin_views.admin_user_detail, name='admin_user_detail'),
]