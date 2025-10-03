from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate

from .models import User, UserProfile, MobileOTP
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    PasswordChangeSerializer, UserProfileSerializer,
    MobileSendOTPSerializer, MobileVerifyOTPSerializer,
    MobileRegistrationSerializer, MobileLoginSerializer
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
    
    # This would be replaced with actual statistics from related models
    stats = {
        'tests_taken': 24,
        'average_score': 78,
        'study_streak': 12,
        'rank': 156,
        'total_students': 3000,  # For percentage calculation
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_activity(request):
    """Get recent user activity"""
    user = request.user
    
    # This would be replaced with actual activity from related models
    activities = [
        {
            'id': 1,
            'title': 'UPSC Prelims Mock Test #5',
            'subtitle': 'General Studies Paper 1',
            'score': 85,
            'timestamp': '2 hours ago'
        },
        {
            'id': 2,
            'title': 'SSC CGL Practice Set #12',
            'subtitle': 'Quantitative Aptitude',
            'score': 72,
            'timestamp': '1 day ago'
        },
        {
            'id': 3,
            'title': 'Banking Awareness Quiz',
            'subtitle': 'Current Affairs',
            'score': 91,
            'timestamp': '2 days ago'
        }
    ]
    
    return Response(activities, status=status.HTTP_200_OK)


class MobileSendOTPView(generics.GenericAPIView):
    """Send OTP to mobile number"""
    serializer_class = MobileSendOTPSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data['phone']
        purpose = serializer.validated_data['purpose']
        
        # Generate and save OTP
        mobile_otp = MobileOTP.generate_otp(phone, purpose)
        
        # In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
        # For development, we'll log it
        print(f"OTP for {phone}: {mobile_otp.otp}")
        
        return Response({
            'message': f'OTP sent to {phone}',
            'phone': phone,
            'expires_in': 300  # 5 minutes
        }, status=status.HTTP_200_OK)


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
