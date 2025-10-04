from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserProfile, MobileOTP
import re


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'bio', 'avatar', 'date_of_birth', 'city', 'state', 'country',
            'language', 'timezone', 'email_notifications'
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    has_active_subscription = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'role', 'is_verified', 'full_name', 'profile',
            'subscription_type', 'subscription_start', 'subscription_end', 
            'is_active_subscriber', 'has_active_subscription',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'is_verified', 'subscription_type', 'subscription_start', 
            'subscription_end', 'is_active_subscriber', 'has_active_subscription',
            'created_at', 'updated_at'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'phone', 'role', 'password', 'confirm_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Password confirmation doesn't match password.")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def create(self, validated_data):
        # Remove confirm_password from validated_data
        validated_data.pop('confirm_password')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    raise serializers.ValidationError('Invalid credentials.')
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                attrs['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError("New password confirmation doesn't match.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class MobileSendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    purpose = serializers.ChoiceField(choices=[
        ('registration', 'Registration'),
        ('login', 'Login'),
    ], default='registration')
    
    def validate_phone(self, value):
        # Clean the phone number (remove non-digits)
        clean_phone = re.sub(r'[^0-9]', '', value)
        
        # Validate phone number format (basic validation)
        if len(clean_phone) < 10 or len(clean_phone) > 15:
            raise serializers.ValidationError("Invalid phone number format")
        
        return clean_phone
    
    def validate(self, attrs):
        phone = attrs['phone']
        purpose = attrs['purpose']
        
        # For registration, check if phone already exists
        if purpose == 'registration':
            if User.objects.filter(phone=phone).exists():
                raise serializers.ValidationError("Phone number already registered. Try signing in.")
        
        # For login, check if phone exists
        elif purpose == 'login':
            if not User.objects.filter(phone=phone).exists():
                raise serializers.ValidationError("Phone number not registered. Please sign up first.")
        
        return attrs


class MobileVerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=[
        ('registration', 'Registration'),
        ('login', 'Login'),
    ], default='registration')
    
    def validate_phone(self, value):
        # Clean the phone number (remove non-digits)
        return re.sub(r'[^0-9]', '', value)
    
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits")
        return value


class MobileRegistrationSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    
    def validate_phone(self, value):
        return re.sub(r'[^0-9]', '', value)
    
    def validate(self, attrs):
        phone = attrs['phone']
        otp = attrs['otp']
        
        # Verify OTP
        is_valid, message = MobileOTP.verify_otp(phone, otp, 'registration')
        if not is_valid:
            raise serializers.ValidationError(message)
        
        # Check if user already exists
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Phone number already registered")
        
        return attrs
    
    def create(self, validated_data):
        phone = validated_data['phone']
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        
        # Create user with phone as username and email
        user = User.objects.create_user(
            username=phone,
            email=f"{phone}@mobile.247exams.com",
            phone=phone,
            first_name=first_name,
            last_name=last_name,
            role='student',
            is_verified=True  # Auto-verify since OTP was successful
        )
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class MobileLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_phone(self, value):
        return re.sub(r'[^0-9]', '', value)
    
    def validate(self, attrs):
        phone = attrs['phone']
        otp = attrs['otp']
        
        # Verify OTP
        is_valid, message = MobileOTP.verify_otp(phone, otp, 'login')
        if not is_valid:
            raise serializers.ValidationError(message)
        
        # Get user
        try:
            user = User.objects.get(phone=phone)
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            attrs['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("Phone number not registered")
        
        return attrs


class MobilePasswordRegistrationSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    
    def validate_phone(self, value):
        return re.sub(r'[^0-9]', '', value)
    
    def validate(self, attrs):
        phone = attrs['phone']
        otp = attrs['otp']
        password = attrs['password']
        confirm_password = attrs['confirm_password']
        
        # Check password confirmation
        if password != confirm_password:
            raise serializers.ValidationError("Password confirmation doesn't match")
        
        # Verify OTP
        is_valid, message = MobileOTP.verify_otp(phone, otp, 'registration')
        if not is_valid:
            raise serializers.ValidationError(message)
        
        # Check if user already exists
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Phone number already registered")
        
        return attrs
    
    def create(self, validated_data):
        phone = validated_data['phone']
        password = validated_data['password']
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')
        
        # Create user with phone as username and email
        user = User.objects.create_user(
            username=phone,
            email=f"{phone}@mobile.247exams.com",
            phone=phone,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='student',
            is_verified=True
        )
        
        # Note: Subscription activation happens after payment
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class MobilePasswordLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)
    
    def validate_phone(self, value):
        return re.sub(r'[^0-9]', '', value)
    
    def validate(self, attrs):
        phone = attrs['phone']
        password = attrs['password']
        
        # Get user and check password
        try:
            user = User.objects.get(phone=phone)
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid credentials")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            attrs['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        
        return attrs