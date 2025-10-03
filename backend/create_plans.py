#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from payments.models import SubscriptionPlan
from decimal import Decimal

# Create sample subscription plans
plans = [
    {
        'name': 'Basic Plan',
        'plan_type': 'basic',
        'description': 'Perfect for students starting their exam preparation',
        'price': Decimal('299.00'),
        'billing_cycle': 'monthly',
        'max_tests': 10,
        'max_questions': 100,
        'pdf_extraction': False,
        'analytics_access': False,
        'trial_days': 7,
        'is_popular': False
    },
    {
        'name': 'Pro Plan',
        'plan_type': 'pro',
        'description': 'Best value for serious exam preparation',
        'price': Decimal('599.00'),
        'billing_cycle': 'monthly',
        'max_tests': 50,
        'max_questions': 500,
        'pdf_extraction': True,
        'analytics_access': True,
        'priority_support': True,
        'trial_days': 14,
        'is_popular': True
    },
    {
        'name': 'Enterprise Plan',
        'plan_type': 'enterprise',
        'description': 'Unlimited access for institutes and professionals',
        'price': Decimal('1299.00'),
        'billing_cycle': 'monthly',
        'max_tests': -1,  # Unlimited
        'max_questions': -1,  # Unlimited
        'pdf_extraction': True,
        'analytics_access': True,
        'priority_support': True,
        'custom_branding': True,
        'api_access': True,
        'trial_days': 30,
        'is_popular': False
    },
    {
        'name': 'Annual Pro',
        'plan_type': 'pro',
        'description': '2 months free with annual billing',
        'price': Decimal('5990.00'),
        'billing_cycle': 'yearly',
        'max_tests': 50,
        'max_questions': 500,
        'pdf_extraction': True,
        'analytics_access': True,
        'priority_support': True,
        'trial_days': 14,
        'is_popular': False
    }
]

for plan_data in plans:
    plan, created = SubscriptionPlan.objects.get_or_create(
        name=plan_data['name'],
        defaults=plan_data
    )
    if created:
        print(f'Created plan: {plan.name} - ${plan.price}/{plan.billing_cycle}')
    else:
        print(f'Plan already exists: {plan.name}')

print(f'Total plans: {SubscriptionPlan.objects.count()}')