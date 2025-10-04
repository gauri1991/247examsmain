from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)

from .models import User, UserProfile, MobileOTP
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    PasswordChangeSerializer, UserProfileSerializer,
    MobileSendOTPSerializer, MobileVerifyOTPSerializer,
    MobileRegistrationSerializer, MobileLoginSerializer,
    MobilePasswordRegistrationSerializer, MobilePasswordLoginSerializer
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """User login endpoint"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """Get and update detailed user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class PasswordChangeView(generics.GenericAPIView):
    """Change user password"""
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for the user"""
    user = request.user
    
    # Import necessary models
    from exams.models import TestAttempt
    from django.db.models import Avg, Count, Q
    from django.utils import timezone
    from datetime import datetime, timedelta
    
    # Get user's test attempts
    user_attempts = TestAttempt.objects.filter(
        user=user,
        status__in=['submitted', 'evaluated']
    )
    
    # Calculate stats
    tests_taken = user_attempts.count()
    
    # Average score from completed tests
    avg_score_data = user_attempts.aggregate(avg_score=Avg('percentage'))
    average_score = round(avg_score_data['avg_score'] or 0, 1)
    
    # Study streak calculation (consecutive days with test activity)
    study_streak = 0
    if tests_taken > 0:
        # Get recent attempts ordered by date
        recent_attempts = user_attempts.values('start_time__date').distinct().order_by('-start_time__date')[:30]
        
        current_date = timezone.now().date()
        consecutive_days = 0
        
        for attempt in recent_attempts:
            attempt_date = attempt['start_time__date']
            if attempt_date == current_date or attempt_date == current_date - timedelta(days=consecutive_days):
                consecutive_days += 1
                current_date = attempt_date
            else:
                break
        
        study_streak = consecutive_days
    
    # Calculate rank among all users
    total_students = User.objects.filter(role='student').count()
    
    if average_score > 0:
        # Count users with better average scores
        better_users = User.objects.filter(
            test_attempts__status__in=['submitted', 'evaluated']
        ).annotate(
            user_avg_score=Avg('test_attempts__percentage')
        ).filter(
            user_avg_score__gt=average_score
        ).count()
        
        rank = better_users + 1
    else:
        rank = total_students
    
    stats = {
        'tests_taken': tests_taken,
        'average_score': average_score,
        'study_streak': study_streak,
        'rank': rank,
        'total_students': total_students,
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_activity(request):
    """Get recent user activity"""
    user = request.user
    
    # Import necessary models
    from exams.models import TestAttempt
    from django.utils import timezone
    from datetime import datetime, timedelta
    
    # Get user's recent test attempts
    recent_attempts = TestAttempt.objects.filter(
        user=user,
        status__in=['submitted', 'evaluated']
    ).select_related('test', 'test__exam').order_by('-start_time')[:10]
    
    activities = []
    
    for attempt in recent_attempts:
        # Calculate time difference for timestamp
        time_diff = timezone.now() - attempt.start_time
        
        if time_diff.days == 0:
            if time_diff.seconds < 3600:  # Less than 1 hour
                minutes = time_diff.seconds // 60
                timestamp = f"{minutes} minutes ago" if minutes > 1 else "Just now"
            else:  # Less than 24 hours
                hours = time_diff.seconds // 3600
                timestamp = f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif time_diff.days == 1:
            timestamp = "1 day ago"
        else:
            timestamp = f"{time_diff.days} days ago"
        
        # Get exam and test details
        test = attempt.test
        exam = test.exam if test else None
        
        activity = {
            'id': attempt.id,
            'title': test.title if test else 'Unknown Test',
            'subtitle': exam.title if exam else 'General Knowledge',
            'score': round(attempt.percentage) if attempt.percentage else 0,
            'timestamp': timestamp
        }
        activities.append(activity)
    
    # If no activities, return empty list
    if not activities:
        activities = []
    
    return Response(activities, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class MobileSendOTPView(generics.GenericAPIView):
    """Send OTP to mobile number"""
    serializer_class = MobileSendOTPSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            logger.info(f"OTP Send Validation Error - Data: {request.data}, Errors: {serializer.errors}")
            return Response({
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        phone = serializer.validated_data['phone']
        purpose = serializer.validated_data['purpose']
        
        # Generate and save OTP
        mobile_otp = MobileOTP.generate_otp(phone, purpose)
        
        # In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
        # For development/testing, we'll log it
        print(f"FIXED OTP for {phone}: {mobile_otp.otp} (always 123456)")
        logger.info(f"FIXED OTP for {phone}: {mobile_otp.otp} (always 123456)")
        
        return Response({
            'message': f'OTP sent to {phone}',
            'phone': phone,
            'expires_in': 300  # 5 minutes
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class MobileVerifyOTPView(generics.GenericAPIView):
    """Verify OTP for mobile number"""
    serializer_class = MobileVerifyOTPSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        otp = serializer.validated_data['otp']
        purpose = serializer.validated_data['purpose']
        
        # Verify OTP
        is_valid, message = MobileOTP.verify_otp(phone, otp, purpose)
        
        if is_valid:
            return Response({
                'message': message,
                'phone': phone,
                'verified': True
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': message,
                'verified': False
            }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class MobileRegistrationView(generics.CreateAPIView):
    """Register user with mobile OTP"""
    serializer_class = MobileRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class MobileLoginView(generics.GenericAPIView):
    """Login user with mobile OTP"""
    serializer_class = MobileLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class MobilePasswordRegistrationView(generics.CreateAPIView):
    """Register user with mobile + password (requires payment)"""
    serializer_class = MobilePasswordRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful - payment required for activation',
            'requires_payment': True
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class MobilePasswordLoginView(generics.GenericAPIView):
    """Login user with mobile + password"""
    serializer_class = MobilePasswordLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
