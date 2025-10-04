from django.urls import path
from . import views, admin_views

urlpatterns = [
    # User analytics endpoints
    path('user/dashboard/', views.user_analytics_dashboard, name='user_analytics_dashboard'),
    path('user/progress/', views.user_progress, name='user_progress'),
    
    # Admin analytics endpoints
    path('admin/dashboard/', admin_views.admin_analytics_dashboard, name='admin_analytics_dashboard'),
    path('admin/detailed/<str:metric_type>/', admin_views.admin_detailed_analytics, name='admin_detailed_analytics'),
]