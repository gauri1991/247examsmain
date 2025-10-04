from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    ExamViewSet, TestViewSet, TestAttemptViewSet,
    OrganizationViewSet, SyllabusViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'tests', TestViewSet, basename='test')
router.register(r'test-attempts', TestAttemptViewSet, basename='testattempt')
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'syllabus', SyllabusViewSet, basename='syllabus')

urlpatterns = [
    path('', include(router.urls)),
]