"""
URL configuration for exam_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from core.views import health_check as core_health_check

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root endpoint with available endpoints"""
    return Response({
        'message': '247 Exams API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/v1/auth/',
            'users': '/api/v1/users/',
            'exams': '/api/v1/exams/',
            'questions': '/api/v1/questions/',
            'payments': '/api/v1/payments/',
            'admin': '/admin/',
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'service': '247 Exams API',
        'version': '1.0.0'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', core_health_check, name='core_health_check'),
    path('api/v1/', api_root, name='api_root'),
    path('api/v1/health/', health_check, name='health_check'),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/exams/', include('exams.api_urls')),
    path('api/v1/questions/', include('questions.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('api/v1/core/', include('core.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
