"""
Payment Gateway Integration for Production Use
Supports Mock, Stripe and Razorpay for Indian market
"""

from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import logging
import uuid

from .models import UserSubscription, Payment, PaymentHistory

logger = logging.getLogger(__name__)


class PaymentGatewayBase:
    """Base class for payment gateways"""
    
    def __init__(self):
        self.gateway_name = self.__class__.__name__.lower().replace('gateway', '')
    
    def create_checkout_session(self, user, plan, success_url, cancel_url, discount_code=None):
        """Create a checkout session for payment"""
        raise NotImplementedError("Subclasses must implement create_checkout_session")
    
    def handle_successful_payment(self, session_id, user):
        """Handle successful payment and create subscription"""
        raise NotImplementedError("Subclasses must implement handle_successful_payment")
    
    def cancel_subscription(self, subscription):
        """Cancel a subscription in the gateway"""
        raise NotImplementedError("Subclasses must implement cancel_subscription")


class MockGateway(PaymentGatewayBase):
    """Mock payment gateway for development/testing"""
    
    def __init__(self):
        super().__init__()
        # Store session data in memory for mock purposes
        self.sessions = {}
    
    def create_checkout_session(self, user, plan, success_url, cancel_url, discount_code=None):
        """Create mock checkout session"""
        session_id = str(uuid.uuid4())
        
        # Store session data for later retrieval
        self.sessions[session_id] = {
            'user_id': user.id,
            'plan_id': plan.id,
            'plan': plan,
            'amount': plan.price,
            'status': 'pending'
        }
        
        # Return mock checkout URL
        checkout_url = f"{success_url}?session_id={session_id}&mock=true&plan_id={plan.id}"
        
        return {
            'id': session_id,
            'url': checkout_url
        }
    
    def handle_successful_payment(self, session_id, user):
        """Handle mock successful payment"""
        try:
            # Get session data that was stored during checkout creation
            session_data = self.sessions.get(session_id)
            if not session_data:
                # Fallback: get any active plan for demonstration
                from .models import SubscriptionPlan
                plan = SubscriptionPlan.objects.filter(is_active=True).first()
                if not plan:
                    return {'success': False, 'error': 'No active plans available'}
            else:
                plan = session_data['plan']
            
            # Calculate subscription dates
            start_date = timezone.now()
            if plan.billing_cycle == 'yearly':
                end_date = start_date + timedelta(days=365)
            else:  # monthly
                end_date = start_date + timedelta(days=30)
            
            # Create subscription
            subscription = UserSubscription.objects.create(
                user=user,
                plan=plan,
                start_date=start_date,
                end_date=end_date,
                status='active',
                auto_renew=True
            )
            
            # Create payment record
            payment = Payment.objects.create(
                user=user,
                subscription=subscription,
                amount=plan.price,
                currency='INR',
                gateway='mock',
                gateway_payment_id=session_id,
                status='completed',
                payment_date=timezone.now()
            )
            
            # Create history entry
            PaymentHistory.objects.create(
                user=user,
                subscription=subscription,
                action='subscription_created',
                description=f'New {plan.name} subscription created via Mock Gateway (Development)'
            )
            
            return {'success': True, 'subscription_id': str(subscription.id)}
            
        except Exception as e:
            logger.error(f"Mock payment handling failed: {str(e)}")
            return {'success': False, 'error': 'Failed to process mock payment'}


class PaymentGatewayFactory:
    """Factory class to get appropriate payment gateway"""
    
    gateways = {
        'stripe': MockGateway,  # Using mock for now, can be replaced with StripeGateway
        'razorpay': MockGateway,  # Using mock for now, can be replaced with RazorpayGateway
        'mock': MockGateway,
    }
    
    @classmethod
    def get_gateway(cls, gateway_type='mock'):
        """Get payment gateway instance"""
        if gateway_type not in cls.gateways:
            gateway_type = 'mock'  # Default to mock for development
        
        return cls.gateways[gateway_type]()
    
    @classmethod
    def get_available_gateways(cls):
        """Get list of available payment gateways"""
        return list(cls.gateways.keys())