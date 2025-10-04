from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import UserSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_user_list(request):
    """Get list of all users for admin dashboard"""
    try:
        users = User.objects.all().order_by('-date_joined')
        
        data = []
        for user in users:
            data.append({
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'phone_number': getattr(user, 'phone_number', ''),
                'full_name': user.get_full_name() or user.username,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'subscription_status': getattr(user, 'subscription_status', 'free'),
                'subscription_plan': getattr(user, 'subscription_plan', None)
            })
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch users: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_toggle_user_status(request, user_id):
    """Toggle user active status"""
    try:
        user = User.objects.get(id=user_id)
        is_active = request.data.get('is_active')
        
        if is_active is not None:
            user.is_active = is_active
            user.save()
            
            return Response({
                'success': True,
                'message': f'User status updated successfully',
                'is_active': user.is_active
            })
        
        return Response({
            'success': False,
            'message': 'is_active field is required'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to update user status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_toggle_admin_role(request, user_id):
    """Toggle user admin role"""
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent removing admin rights from yourself
        if user.id == request.user.id:
            return Response({
                'success': False,
                'message': 'You cannot modify your own admin status'
            }, status=status.HTTP_403_FORBIDDEN)
        
        is_staff = request.data.get('is_staff')
        
        if is_staff is not None:
            user.is_staff = is_staff
            user.save()
            
            return Response({
                'success': True,
                'message': f'Admin role updated successfully',
                'is_staff': user.is_staff
            })
        
        return Response({
            'success': False,
            'message': 'is_staff field is required'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to update admin role: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_delete_user(request, user_id):
    """Delete a user account"""
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response({
                'success': False,
                'message': 'You cannot delete your own account'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent deleting superusers
        if user.is_superuser:
            return Response({
                'success': False,
                'message': 'Cannot delete superuser accounts'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to delete user: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_user_detail(request, user_id):
    """Get detailed information about a specific user"""
    try:
        user = User.objects.get(id=user_id)
        
        # Get user's exam history
        from exams.models import TestAttempt
        exam_attempts = TestAttempt.objects.filter(user=user).order_by('-start_time')[:10]
        
        exam_history = []
        for attempt in exam_attempts:
            exam_history.append({
                'id': str(attempt.id),
                'exam_name': attempt.test.title if attempt.test else 'Unknown',
                'score': attempt.percentage,
                'status': attempt.status,
                'started_at': attempt.start_time.isoformat(),
                'completed_at': attempt.end_time.isoformat() if attempt.end_time else None
            })
        
        data = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'phone_number': getattr(user, 'phone_number', ''),
            'full_name': user.get_full_name() or user.username,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'subscription_status': getattr(user, 'subscription_status', 'free'),
            'subscription_plan': getattr(user, 'subscription_plan', None),
            'exam_history': exam_history,
            'total_exams': exam_attempts.count()
        }
        
        return Response({
            'success': True,
            'data': data
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch user details: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)