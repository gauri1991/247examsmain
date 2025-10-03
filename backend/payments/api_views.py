"""
API Views for Payments Module - Production Ready
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
import uuid
import logging

from .models import SubscriptionPlan, UserSubscription, Payment, Discount, PaymentHistory
from .serializers import (
    SubscriptionPlanSerializer, 
    UserSubscriptionSerializer, 
    PaymentSerializer,
    DiscountSerializer
)
from .payment_gateways import PaymentGatewayFactory

logger = logging.getLogger(__name__)


class SubscriptionPlanListView(generics.ListAPIView):
    """
    List all active subscription plans
    """
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Create a checkout session for subscription payment
    """
    try:
        plan_id = request.data.get('plan_id')
        success_url = request.data.get('success_url')
        cancel_url = request.data.get('cancel_url')
        discount_code = request.data.get('discount_code')

        if not all([plan_id, success_url, cancel_url]):
            return Response({
                'error': 'plan_id, success_url, and cancel_url are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get the subscription plan
        plan = get_object_or_404(SubscriptionPlan, id=plan_id, is_active=True)
        
        # Check if user already has an active subscription
        existing_subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()
        
        if existing_subscription:
            return Response({
                'error': 'You already have an active subscription'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create payment gateway instance
        gateway = PaymentGatewayFactory.get_gateway('stripe')  # Default to Stripe for now
        
        # Create checkout session
        session_data = gateway.create_checkout_session(
            user=request.user,
            plan=plan,
            success_url=success_url,
            cancel_url=cancel_url,
            discount_code=discount_code
        )

        return Response({
            'checkout_url': session_data['url'],
            'session_id': session_data['id']
        })

    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        return Response({
            'error': 'Failed to create checkout session'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    """
    Get current user's subscription status
    """
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()

        if subscription:
            serializer = UserSubscriptionSerializer(subscription)
            return Response({
                'has_subscription': True,
                'subscription': serializer.data
            })
        else:
            return Response({
                'has_subscription': False,
                'subscription': None
            })

    except Exception as e:
        logger.error(f"Error getting subscription status: {str(e)}")
        return Response({
            'error': 'Failed to get subscription status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """
    Get user's payment history
    """
    try:
        payments = Payment.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    except Exception as e:
        logger.error(f"Error getting payment history: {str(e)}")
        return Response({
            'error': 'Failed to get payment history'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """
    Cancel user's active subscription
    """
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()

        if not subscription:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Cancel the subscription
        subscription.status = 'cancelled'
        subscription.cancelled_at = timezone.now()
        subscription.auto_renew = False
        subscription.save()

        # Create history entry
        PaymentHistory.objects.create(
            user=request.user,
            subscription=subscription,
            action='subscription_cancelled',
            description=f'Subscription {subscription.plan.name} cancelled by user'
        )

        return Response({
            'message': 'Subscription cancelled successfully'
        })

    except Exception as e:
        logger.error(f"Error cancelling subscription: {str(e)}")
        return Response({
            'error': 'Failed to cancel subscription'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_discount(request):
    """
    Validate discount code and return discount details
    """
    try:
        code = request.data.get('code')
        plan_id = request.data.get('plan_id')

        if not code:
            return Response({
                'error': 'Discount code is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            discount = Discount.objects.get(code__iexact=code)
        except Discount.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Invalid discount code'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if discount is valid
        if not discount.is_valid:
            return Response({
                'valid': False,
                'error': 'Discount code has expired or reached usage limit'
            })

        # Check if discount applies to the selected plan
        if plan_id and discount.applicable_plans.exists():
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id)
                if plan not in discount.applicable_plans.all():
                    return Response({
                        'valid': False,
                        'error': 'Discount code is not applicable to this plan'
                    })
            except SubscriptionPlan.DoesNotExist:
                return Response({
                    'error': 'Invalid plan ID'
                }, status=status.HTTP_400_BAD_REQUEST)

        serializer = DiscountSerializer(discount)
        return Response({
            'valid': True,
            'discount': serializer.data
        })

    except Exception as e:
        logger.error(f"Error validating discount: {str(e)}")
        return Response({
            'error': 'Failed to validate discount'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_discount(request):
    """
    Apply discount to a payment amount
    """
    try:
        code = request.data.get('code')
        amount = request.data.get('amount')

        if not all([code, amount]):
            return Response({
                'error': 'Code and amount are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            discount = Discount.objects.get(code__iexact=code)
            amount = Decimal(str(amount))
        except (Discount.DoesNotExist, ValueError):
            return Response({
                'error': 'Invalid discount code or amount'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not discount.is_valid:
            return Response({
                'error': 'Discount code is not valid'
            }, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = discount.calculate_discount(amount)
        final_amount = amount - discount_amount

        return Response({
            'original_amount': float(amount),
            'discount_amount': float(discount_amount),
            'final_amount': float(final_amount),
            'discount': DiscountSerializer(discount).data
        })

    except Exception as e:
        logger.error(f"Error applying discount: {str(e)}")
        return Response({
            'error': 'Failed to apply discount'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment_success(request):
    """
    Process successful payment and create subscription
    """
    try:
        session_id = request.data.get('session_id')
        gateway_type = request.data.get('gateway', 'mock')
        plan_id = request.data.get('plan_id')  # Add plan_id for mock payments

        if not session_id:
            return Response({
                'error': 'Session ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # For mock payments, handle differently
        if gateway_type == 'mock':
            # Get plan directly for mock payments
            if not plan_id:
                return Response({
                    'error': 'Plan ID is required for mock payments'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response({
                    'error': 'Invalid plan ID'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create subscription directly for mock
            from datetime import timedelta
            start_date = timezone.now()
            if plan.billing_cycle == 'yearly':
                end_date = start_date + timedelta(days=365)
            else:  # monthly
                end_date = start_date + timedelta(days=30)
            
            # Create subscription
            subscription = UserSubscription.objects.create(
                user=request.user,
                plan=plan,
                start_date=start_date,
                end_date=end_date,
                status='active',
                auto_renew=True
            )
            
            # Create payment record
            Payment.objects.create(
                user=request.user,
                subscription=subscription,
                plan=plan,
                amount=plan.price,
                currency='INR',
                gateway='mock',
                gateway_transaction_id=session_id,
                status='completed',
                paid_at=timezone.now()
            )
            
            # Create history entry
            PaymentHistory.objects.create(
                user=request.user,
                subscription=subscription,
                action='subscription_created',
                description=f'New {plan.name} subscription created via Mock Gateway (Development)'
            )
            
            return Response({
                'message': 'Payment processed successfully',
                'subscription_id': str(subscription.id)
            })
        
        else:
            # Handle real payment gateways
            gateway = PaymentGatewayFactory.get_gateway(gateway_type)
            result = gateway.handle_successful_payment(session_id, request.user)

            if result['success']:
                return Response({
                    'message': 'Payment processed successfully',
                    'subscription_id': result['subscription_id']
                })
            else:
                return Response({
                    'error': result['error']
                }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Error processing payment success: {str(e)}")
        return Response({
            'error': 'Failed to process payment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usage_stats(request):
    """
    Get current user's usage statistics
    """
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()

        if not subscription:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Calculate usage percentages
        tests_percentage = 0
        questions_percentage = 0

        if subscription.plan.max_tests > 0:
            tests_percentage = (subscription.tests_used / subscription.plan.max_tests) * 100

        if subscription.plan.max_questions > 0:
            questions_percentage = (subscription.questions_used / subscription.plan.max_questions) * 100

        return Response({
            'subscription': UserSubscriptionSerializer(subscription).data,
            'usage': {
                'tests_used': subscription.tests_used,
                'tests_limit': subscription.plan.max_tests,
                'tests_percentage': min(tests_percentage, 100),
                'questions_used': subscription.questions_used,
                'questions_limit': subscription.plan.max_questions,
                'questions_percentage': min(questions_percentage, 100),
            }
        })

    except Exception as e:
        logger.error(f"Error getting usage stats: {str(e)}")
        return Response({
            'error': 'Failed to get usage statistics'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)