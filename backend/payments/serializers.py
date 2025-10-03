"""
Serializers for Payments Module - Production Ready
"""

from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from .models import SubscriptionPlan, UserSubscription, Payment, Discount, PaymentHistory


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for SubscriptionPlan model
    """
    features_list = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'plan_type', 'description', 'price', 'billing_cycle',
            'max_tests', 'max_questions', 'pdf_extraction', 'analytics_access',
            'priority_support', 'custom_branding', 'api_access', 'trial_days',
            'is_popular', 'is_active', 'features_list', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'features_list']
    
    def get_features_list(self, obj):
        """Generate features list based on plan capabilities"""
        features = []
        
        # Tests and questions limits
        if obj.max_tests == -1:
            features.append("Unlimited Tests")
        else:
            features.append(f"{obj.max_tests} Tests per month")
            
        if obj.max_questions == -1:
            features.append("Unlimited Questions per test")
        else:
            features.append(f"{obj.max_questions} Questions per test")
        
        # Additional features
        if obj.pdf_extraction:
            features.append("PDF Question Extraction")
        if obj.analytics_access:
            features.append("Advanced Analytics & Reports")
        if obj.priority_support:
            features.append("Priority Customer Support")
        if obj.custom_branding:
            features.append("Custom Branding Options")
        if obj.api_access:
            features.append("API Access for Integration")
        if obj.trial_days > 0:
            features.append(f"{obj.trial_days} Days Free Trial")
            
        # Default features for all plans
        features.extend([
            "Access to Question Bank",
            "Practice Tests & Mock Exams",
            "Performance Tracking",
            "Mobile & Desktop Access",
            "24/7 Platform Availability"
        ])
        
        return features


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for UserSubscription model
    """
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_type = serializers.CharField(source='plan.plan_type', read_only=True)
    is_active = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    usage_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSubscription
        fields = [
            'id', 'plan', 'plan_name', 'plan_type', 'status', 'start_date', 
            'end_date', 'auto_renew', 'tests_used', 'questions_used',
            'is_active', 'days_remaining', 'usage_percentage', 'cancelled_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'plan', 'plan_name', 'plan_type', 'is_active', 
            'days_remaining', 'usage_percentage', 'created_at', 'updated_at'
        ]
    
    def get_is_active(self, obj):
        """Check if subscription is currently active"""
        return obj.status == 'active' and obj.end_date > timezone.now()
    
    def get_days_remaining(self, obj):
        """Calculate days remaining in subscription"""
        if obj.end_date > timezone.now():
            return (obj.end_date - timezone.now()).days
        return 0
    
    def get_usage_percentage(self, obj):
        """Calculate usage percentage for tests and questions"""
        usage = {}
        
        if obj.plan.max_tests > 0:
            usage['tests'] = min((obj.tests_used / obj.plan.max_tests) * 100, 100)
        else:
            usage['tests'] = 0  # Unlimited
            
        if obj.plan.max_questions > 0:
            usage['questions'] = min((obj.questions_used / obj.plan.max_questions) * 100, 100)
        else:
            usage['questions'] = 0  # Unlimited
            
        return usage


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for Payment model
    """
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    gateway_display = serializers.CharField(source='get_gateway_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    formatted_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'subscription', 'plan_name', 'amount', 'formatted_amount',
            'currency', 'gateway', 'gateway_display', 'gateway_payment_id',
            'status', 'status_display', 'payment_date', 'failure_reason',
            'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'plan_name', 'gateway_display', 'status_display',
            'formatted_amount', 'created_at', 'updated_at'
        ]
    
    def get_formatted_amount(self, obj):
        """Format amount with currency symbol"""
        if obj.currency == 'INR':
            return f"₹{obj.amount:,.2f}"
        elif obj.currency == 'USD':
            return f"${obj.amount:,.2f}"
        else:
            return f"{obj.amount:,.2f} {obj.currency}"


class DiscountSerializer(serializers.ModelSerializer):
    """
    Serializer for Discount model
    """
    applicable_plans = SubscriptionPlanSerializer(many=True, read_only=True)
    applicable_plan_names = serializers.SerializerMethodField()
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)
    is_valid = serializers.SerializerMethodField()
    usage_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = Discount
        fields = [
            'id', 'code', 'discount_type', 'discount_type_display', 'value',
            'max_uses', 'used_count', 'valid_from', 'valid_until',
            'applicable_plans', 'applicable_plan_names', 'is_active',
            'is_valid', 'usage_stats', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'used_count', 'applicable_plans', 'applicable_plan_names',
            'discount_type_display', 'is_valid', 'usage_stats',
            'created_at', 'updated_at'
        ]
    
    def get_applicable_plan_names(self, obj):
        """Get names of applicable plans"""
        return [plan.name for plan in obj.applicable_plans.all()]
    
    def get_is_valid(self, obj):
        """Check if discount is currently valid"""
        return obj.is_valid
    
    def get_usage_stats(self, obj):
        """Get usage statistics for the discount"""
        remaining_uses = obj.max_uses - obj.used_count if obj.max_uses > 0 else -1
        usage_percentage = (obj.used_count / obj.max_uses * 100) if obj.max_uses > 0 else 0
        
        return {
            'used_count': obj.used_count,
            'max_uses': obj.max_uses,
            'remaining_uses': remaining_uses,
            'usage_percentage': round(usage_percentage, 2)
        }


class PaymentHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for PaymentHistory model
    """
    subscription_plan = serializers.CharField(source='subscription.plan.name', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = [
            'id', 'subscription', 'subscription_plan', 'action', 'description',
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'subscription_plan', 'created_at']


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """
    Serializer for creating checkout session
    """
    plan_id = serializers.UUIDField(required=True)
    success_url = serializers.URLField(required=True)
    cancel_url = serializers.URLField(required=True)
    discount_code = serializers.CharField(required=False, allow_blank=True)
    
    def validate_plan_id(self, value):
        """Validate that plan exists and is active"""
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription plan")
        return value


class ValidateDiscountSerializer(serializers.Serializer):
    """
    Serializer for validating discount codes
    """
    code = serializers.CharField(required=True, max_length=50)
    plan_id = serializers.UUIDField(required=False)
    
    def validate_code(self, value):
        """Validate discount code format"""
        if not value.strip():
            raise serializers.ValidationError("Discount code cannot be empty")
        return value.upper().strip()


class ApplyDiscountSerializer(serializers.Serializer):
    """
    Serializer for applying discount to amount
    """
    code = serializers.CharField(required=True, max_length=50)
    amount = serializers.DecimalField(required=True, max_digits=10, decimal_places=2, min_value=0)
    
    def validate_amount(self, value):
        """Validate amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value


class SubscriptionUsageSerializer(serializers.Serializer):
    """
    Serializer for subscription usage statistics
    """
    tests_used = serializers.IntegerField(read_only=True)
    tests_limit = serializers.IntegerField(read_only=True)
    tests_percentage = serializers.FloatField(read_only=True)
    questions_used = serializers.IntegerField(read_only=True)
    questions_limit = serializers.IntegerField(read_only=True)
    questions_percentage = serializers.FloatField(read_only=True)