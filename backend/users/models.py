from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
import random
import string


class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    
    SUBSCRIPTION_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('premium', 'Premium'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, blank=True, null=True)
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_verified = models.BooleanField(default=False)
    
    # Subscription fields
    subscription_type = models.CharField(max_length=10, choices=SUBSCRIPTION_CHOICES, default='free')
    subscription_start = models.DateTimeField(blank=True, null=True)
    subscription_end = models.DateTimeField(blank=True, null=True)
    is_active_subscriber = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        
    def __str__(self):
        return self.email or self.phone or self.username
        
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def has_active_subscription(self):
        """Check if user has an active subscription"""
        if not self.subscription_end:
            return False
        return timezone.now() <= self.subscription_end
    
    def activate_subscription(self, subscription_type='basic', duration_days=365):
        """Activate user subscription for specified duration"""
        from django.utils import timezone
        self.subscription_type = subscription_type
        self.subscription_start = timezone.now()
        self.subscription_end = timezone.now() + timezone.timedelta(days=duration_days)
        self.is_active_subscriber = True
        self.save()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    avatar = models.URLField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Preferences
    language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
    email_notifications = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        
    def __str__(self):
        return f"{self.user.email} Profile"


class MobileOTP(models.Model):
    """Model to store OTP for mobile verification"""
    phone = models.CharField(max_length=15, db_index=True)
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=[
        ('registration', 'Registration'),
        ('login', 'Login'),
        ('password_reset', 'Password Reset'),
    ], default='registration')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'mobile_otps'
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # OTP expires in 5 minutes
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def can_retry(self):
        return self.attempts < 3
    
    @classmethod
    def generate_otp(cls, phone, purpose='registration'):
        """Generate a new OTP for the given phone number"""
        # Invalidate existing OTPs for this phone and purpose
        cls.objects.filter(phone=phone, purpose=purpose, is_verified=False).update(is_verified=True)
        
        # Use fixed OTP for testing - TODO: Change this in production
        otp = '123456'  # Fixed OTP for testing
        
        # Create new OTP record
        mobile_otp = cls.objects.create(
            phone=phone,
            otp=otp,
            purpose=purpose
        )
        
        return mobile_otp
    
    @classmethod
    def verify_otp(cls, phone, otp, purpose='registration'):
        """Verify OTP for the given phone number"""
        try:
            mobile_otp = cls.objects.get(
                phone=phone,
                otp=otp,
                purpose=purpose,
                is_verified=False
            )
            
            # Check if OTP is expired
            if mobile_otp.is_expired():
                return False, "OTP has expired"
            
            # Check attempts
            mobile_otp.attempts += 1
            mobile_otp.save()
            
            if mobile_otp.attempts > 3:
                return False, "Too many attempts. Please request a new OTP"
            
            # Mark as verified
            mobile_otp.is_verified = True
            mobile_otp.save()
            
            return True, "OTP verified successfully"
            
        except cls.DoesNotExist:
            return False, "Invalid OTP"
    
    def __str__(self):
        return f"OTP for {self.phone} - {self.purpose}"
