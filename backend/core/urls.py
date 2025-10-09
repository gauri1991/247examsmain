from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .feature_views import (
    FeatureCategoryViewSet, FeatureViewSet, 
    FeatureChangeLogViewSet, FeatureConfigurationViewSet
)

# Create router for API endpoints
router = DefaultRouter()
router.register(r'feature-categories', FeatureCategoryViewSet)
router.register(r'features', FeatureViewSet)
router.register(r'feature-logs', FeatureChangeLogViewSet)
router.register(r'feature-configs', FeatureConfigurationViewSet)

urlpatterns = [
    path('', views.home, name='home'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('recent-activity/', views.recent_activity, name='recent-activity'),
    path('logout/', views.logout_view, name='logout'),
    path('api/', include(router.urls)),
]