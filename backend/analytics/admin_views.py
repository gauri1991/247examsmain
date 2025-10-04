from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from questions.models import Question, QuestionBank
from exams.models import Exam, Test, TestAttempt

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_analytics_dashboard(request):
    """Get analytics data for admin dashboard"""
    try:
        # Get time range from query params
        time_range = request.GET.get('range', '30days')
        
        # Calculate date range
        end_date = timezone.now()
        if time_range == '7days':
            start_date = end_date - timedelta(days=7)
        elif time_range == '30days':
            start_date = end_date - timedelta(days=30)
        elif time_range == '90days':
            start_date = end_date - timedelta(days=90)
        elif time_range == '1year':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        # User Statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(last_login__gte=start_date).count()
        new_users_period = User.objects.filter(date_joined__gte=start_date).count()
        
        # Calculate growth rate
        previous_period_start = start_date - (end_date - start_date)
        previous_period_users = User.objects.filter(
            date_joined__gte=previous_period_start,
            date_joined__lt=start_date
        ).count()
        
        if previous_period_users > 0:
            growth_rate = ((new_users_period - previous_period_users) / previous_period_users) * 100
        else:
            growth_rate = 100 if new_users_period > 0 else 0
        
        # Exam Statistics
        total_exams = Exam.objects.count()
        exam_attempts = TestAttempt.objects.filter(start_time__gte=start_date)
        completed_exams = exam_attempts.filter(status='completed').count()
        
        # Calculate average score and pass rate
        completed_attempts = exam_attempts.filter(status='completed')
        if completed_attempts.exists():
            avg_score = completed_attempts.aggregate(Avg('percentage'))['score__avg'] or 0
            pass_rate = (completed_attempts.filter(percentage__gte=60).count() / completed_attempts.count()) * 100
        else:
            avg_score = 0
            pass_rate = 0
        
        # Question Statistics
        total_questions = Question.objects.count()
        total_question_banks = QuestionBank.objects.count()
        
        # Questions per category (top 10)
        questions_by_category = QuestionBank.objects.values('category').annotate(
            count=Count('questions')
        ).order_by('-count')[:10]
        
        questions_per_category = []
        for item in questions_by_category:
            category_display = item['category'].replace('_', ' ').title()
            questions_per_category.append({
                'category': category_display,
                'count': item['count']
            })
        
        # Activity Statistics
        daily_active = User.objects.filter(last_login__gte=end_date - timedelta(days=1)).count()
        weekly_active = User.objects.filter(last_login__gte=end_date - timedelta(days=7)).count()
        monthly_active = User.objects.filter(last_login__gte=end_date - timedelta(days=30)).count()
        
        # Calculate average session duration (mock data for now)
        avg_session_minutes = 25
        avg_session_duration = f"{avg_session_minutes}m"
        
        # Recent Activity (last 20 items)
        recent_activity = []
        
        # Get recent exam attempts
        recent_attempts = TestAttempt.objects.select_related('user', 'test').order_by('-start_time')[:10]
        for attempt in recent_attempts:
            recent_activity.append({
                'id': str(attempt.id),
                'type': 'exam',
                'user': attempt.user.username if attempt.user else 'Unknown',
                'action': f'completed test "{attempt.test.title if attempt.test else "Unknown"}"' if attempt.status == 'completed' else f'started test "{attempt.test.title if attempt.test else "Unknown"}"',
                'timestamp': attempt.start_time.isoformat()
            })
        
        # Get recent user registrations
        recent_users = User.objects.order_by('-date_joined')[:5]
        for user in recent_users:
            recent_activity.append({
                'id': str(user.id),
                'type': 'user',
                'user': user.username,
                'action': 'joined the platform',
                'timestamp': user.date_joined.isoformat()
            })
        
        # Sort by timestamp
        recent_activity.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activity = recent_activity[:10]
        
        # Top Performers (based on exam scores)
        top_performers_data = TestAttempt.objects.filter(
            status='completed',
            start_time__gte=start_date
        ).values('user').annotate(
            avg_score=Avg('percentage'),
            exam_count=Count('id')
        ).order_by('-avg_score')[:5]
        
        top_performers = []
        for performer in top_performers_data:
            try:
                user = User.objects.get(id=performer['user'])
                top_performers.append({
                    'id': str(user.id),
                    'name': user.get_full_name() or user.username,
                    'score': round(performer['avg_score'] or 0, 1),
                    'examsCompleted': performer['exam_count']
                })
            except User.DoesNotExist:
                continue
        
        # Compile all analytics data
        analytics_data = {
            'userStats': {
                'totalUsers': total_users,
                'activeUsers': active_users,
                'newUsersThisMonth': new_users_period,
                'userGrowthRate': round(growth_rate, 1)
            },
            'examStats': {
                'totalExams': total_exams,
                'completedExams': completed_exams,
                'averageScore': round(avg_score, 1),
                'passRate': round(pass_rate, 1)
            },
            'questionStats': {
                'totalQuestions': total_questions,
                'totalQuestionBanks': total_question_banks,
                'questionsPerCategory': questions_per_category
            },
            'activityStats': {
                'dailyActiveUsers': daily_active,
                'weeklyActiveUsers': weekly_active,
                'monthlyActiveUsers': monthly_active,
                'avgSessionDuration': avg_session_duration
            },
            'recentActivity': recent_activity,
            'topPerformers': top_performers
        }
        
        return Response({
            'success': True,
            'data': analytics_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_detailed_analytics(request, metric_type):
    """Get detailed analytics for a specific metric"""
    try:
        # Get time range from query params
        time_range = request.GET.get('range', '30days')
        
        # Calculate date range
        end_date = timezone.now()
        if time_range == '7days':
            start_date = end_date - timedelta(days=7)
            interval_days = 1
        elif time_range == '30days':
            start_date = end_date - timedelta(days=30)
            interval_days = 1
        elif time_range == '90days':
            start_date = end_date - timedelta(days=90)
            interval_days = 7
        elif time_range == '1year':
            start_date = end_date - timedelta(days=365)
            interval_days = 30
        else:
            start_date = end_date - timedelta(days=30)
            interval_days = 1
        
        data = {}
        
        if metric_type == 'users':
            # Daily user registrations
            registrations = []
            current = start_date
            while current <= end_date:
                next_date = current + timedelta(days=interval_days)
                count = User.objects.filter(
                    date_joined__gte=current,
                    date_joined__lt=next_date
                ).count()
                registrations.append({
                    'date': current.date().isoformat(),
                    'count': count
                })
                current = next_date
            
            data['registrations'] = registrations
            data['totalUsers'] = User.objects.count()
            data['activeToday'] = User.objects.filter(
                last_login__gte=end_date - timedelta(days=1)
            ).count()
            
        elif metric_type == 'exams':
            # Exam completion over time
            completions = []
            current = start_date
            while current <= end_date:
                next_date = current + timedelta(days=interval_days)
                count = TestAttempt.objects.filter(
                    end_time__gte=current,
                    end_time__lt=next_date,
                    status='completed'
                ).count()
                completions.append({
                    'date': current.date().isoformat(),
                    'count': count
                })
                current = next_date
            
            data['completions'] = completions
            data['totalAttempts'] = TestAttempt.objects.filter(
                start_time__gte=start_date
            ).count()
            data['completionRate'] = 0
            if data['totalAttempts'] > 0:
                completed = TestAttempt.objects.filter(
                    start_time__gte=start_date,
                    status='completed'
                ).count()
                data['completionRate'] = round((completed / data['totalAttempts']) * 100, 1)
            
        elif metric_type == 'questions':
            # Question distribution by difficulty
            difficulty_dist = Question.objects.values('difficulty').annotate(
                count=Count('id')
            )
            
            data['difficultyDistribution'] = [
                {'difficulty': item['difficulty'], 'count': item['count']}
                for item in difficulty_dist
            ]
            
            # Questions by type
            type_dist = Question.objects.values('question_type').annotate(
                count=Count('id')
            )
            
            data['typeDistribution'] = [
                {'type': item['question_type'], 'count': item['count']}
                for item in type_dist
            ]
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch detailed analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)