from django.urls import path
from . import api_views

app_name = 'payments'

urlpatterns = [
    # API endpoints for subscription plans
    path('plans/', api_views.SubscriptionPlanListView.as_view(), name='subscription_plans_api'),
    
    # Payment and subscription management
    path('create-checkout-session/', api_views.create_checkout_session, name='create_checkout_session'),
    path('subscription-status/', api_views.subscription_status, name='subscription_status'),
    path('payment-history/', api_views.payment_history, name='payment_history'),
    path('cancel-subscription/', api_views.cancel_subscription, name='cancel_subscription'),
    
    # Discount management
    path('validate-discount/', api_views.validate_discount, name='validate_discount'),
    path('apply-discount/', api_views.apply_discount, name='apply_discount'),
    
    # Payment processing
    path('process-payment-success/', api_views.process_payment_success, name='process_payment_success'),
    
    # Usage statistics
    path('usage-stats/', api_views.usage_stats, name='usage_stats'),
]