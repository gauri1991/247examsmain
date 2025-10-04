from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from exams.models import TestAttempt
from questions.models import Question

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_analytics_dashboard(request):
    """Get analytics data for user dashboard"""
    try:
        user = request.user
        
        # Get user's exam statistics
        exam_attempts = TestAttempt.objects.filter(user=user)
        total_attempts = exam_attempts.count()
        completed_attempts = exam_attempts.filter(status='completed').count()
        
        avg_score = 0
        if completed_attempts > 0:
            avg_score = exam_attempts.filter(status='completed').aggregate(Avg('percentage'))['score__avg'] or 0
        
        # Recent exam attempts
        recent_attempts = exam_attempts.order_by('-start_time')[:5]
        recent_data = []
        
        for attempt in recent_attempts:
            recent_data.append({
                'id': str(attempt.id),
                'exam_title': attempt.test.title if attempt.test else 'Unknown',
                'score': attempt.percentage,
                'status': attempt.status,
                'started_at': attempt.start_time.isoformat(),
                'completed_at': attempt.end_time.isoformat() if attempt.end_time else None
            })
        
        data = {
            'total_attempts': total_attempts,
            'completed_exams': completed_attempts,
            'average_score': round(avg_score, 1),
            'recent_attempts': recent_data
        }
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_progress(request):
    """Get user's learning progress"""
    try:
        user = request.user
        
        # Calculate progress metrics
        exam_attempts = TestAttempt.objects.filter(user=user)
        
        # Progress by month
        from django.db.models.functions import TruncMonth
        monthly_progress = exam_attempts.annotate(
            month=TruncMonth('started_at')
        ).values('month').annotate(
            count=Count('id'),
            avg_score=Avg('percentage')
        ).order_by('-month')[:6]
        
        progress_data = []
        for item in monthly_progress:
            progress_data.append({
                'month': item['month'].isoformat() if item['month'] else None,
                'attempts': item['count'],
                'avg_score': round(item['avg_score'] or 0, 1)
            })
        
        # Category-wise performance
        category_performance = []
        
        data = {
            'monthly_progress': progress_data,
            'category_performance': category_performance
        }
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch progress: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
