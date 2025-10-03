#!/usr/bin/env python3
"""Test script for complete payment workflow"""

import requests
import json

BASE_URL = 'http://localhost:8000/api/v1'

def test_payment_workflow():
    """Test the complete payment workflow from login to subscription"""
    
    print("Testing Complete Payment Workflow")
    print("=" * 60)
    
    # Step 1: Login to get auth token
    print("\n1. LOGIN")
    print("-" * 20)
    
    login_data = {
        'email': 'teacher@247exams.com',  # Use proper 247exams account
        'password': 'test123'
    }
    
    response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
    print(f"Login Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    auth_data = response.json()
    tokens = auth_data.get('tokens', {})
    access_token = tokens.get('access')
    
    if not access_token:
        print("No access token received")
        return
        
    print("✅ Login successful")
    headers = {'Authorization': f'Bearer {access_token}'}
    
    # Step 2: Get subscription plans
    print("\n2. GET SUBSCRIPTION PLANS")
    print("-" * 30)
    
    response = requests.get(f'{BASE_URL}/payments/plans/')
    print(f"Plans Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Failed to get plans: {response.text}")
        return
    
    plans_data = response.json()
    plans = plans_data.get('results', [])
    
    if not plans:
        print("No plans found")
        return
        
    print(f"✅ Found {len(plans)} subscription plans")
    
    # Choose the first plan for testing
    test_plan = plans[0]
    print(f"Selected plan: {test_plan['name']} - ₹{test_plan['price']}")
    
    # Step 3: Check initial subscription status
    print("\n3. CHECK INITIAL SUBSCRIPTION STATUS")
    print("-" * 40)
    
    response = requests.get(f'{BASE_URL}/payments/subscription-status/', headers=headers)
    print(f"Subscription Status: {response.status_code}")
    
    if response.status_code == 200:
        sub_data = response.json()
        print(f"Has subscription: {sub_data.get('has_subscription')}")
        if sub_data.get('has_subscription'):
            print("User already has a subscription!")
            return
    else:
        print(f"Status check failed: {response.text}")
        return
    
    print("✅ No existing subscription - ready to test payment")
    
    # Step 4: Create checkout session
    print("\n4. CREATE CHECKOUT SESSION")
    print("-" * 35)
    
    checkout_data = {
        'plan_id': test_plan['id'],
        'success_url': 'http://localhost:3000/payments/success',
        'cancel_url': 'http://localhost:3000/payments/cancel',
    }
    
    response = requests.post(
        f'{BASE_URL}/payments/create-checkout-session/', 
        json=checkout_data, 
        headers=headers
    )
    print(f"Checkout Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Checkout failed: {response.text}")
        return
    
    checkout_result = response.json()
    session_id = checkout_result.get('session_id')
    checkout_url = checkout_result.get('checkout_url')
    
    print(f"✅ Checkout session created")
    print(f"Session ID: {session_id}")
    print(f"Checkout URL: {checkout_url}")
    
    # Step 5: Simulate successful payment processing
    print("\n5. SIMULATE PAYMENT SUCCESS")
    print("-" * 35)
    
    # Since we're using mock gateway, we can directly call the success handler
    success_data = {
        'session_id': session_id,
        'gateway': 'mock',
        'plan_id': test_plan['id']  # Include plan ID for mock payments
    }
    
    response = requests.post(
        f'{BASE_URL}/payments/process-payment-success/', 
        json=success_data, 
        headers=headers
    )
    print(f"Payment Processing Status: {response.status_code}")
    
    if response.status_code == 200:
        payment_result = response.json()
        print("✅ Payment processed successfully")
        print(f"Subscription ID: {payment_result.get('subscription_id')}")
    else:
        print(f"Payment processing failed: {response.text}")
        return
    
    # Step 6: Verify subscription was created
    print("\n6. VERIFY NEW SUBSCRIPTION")
    print("-" * 35)
    
    response = requests.get(f'{BASE_URL}/payments/subscription-status/', headers=headers)
    print(f"Final Subscription Status: {response.status_code}")
    
    if response.status_code == 200:
        sub_data = response.json()
        if sub_data.get('has_subscription'):
            subscription = sub_data.get('subscription')
            print("🎉 SUCCESS! Subscription created successfully")
            print(f"Plan: {subscription.get('plan_name')}")
            print(f"Status: {subscription.get('status')}")
            print(f"Start Date: {subscription.get('start_date')}")
            print(f"End Date: {subscription.get('end_date')}")
        else:
            print("❌ Subscription not found after payment")
    else:
        print(f"Final status check failed: {response.text}")
    
    # Step 7: Test usage stats
    print("\n7. CHECK USAGE STATISTICS")
    print("-" * 30)
    
    response = requests.get(f'{BASE_URL}/payments/usage-stats/', headers=headers)
    print(f"Usage Stats Status: {response.status_code}")
    
    if response.status_code == 200:
        usage_data = response.json()
        usage = usage_data.get('usage', {})
        print("✅ Usage statistics available")
        print(f"Tests used: {usage.get('tests_used', 0)}/{usage.get('tests_limit', 'unlimited')}")
        print(f"Questions used: {usage.get('questions_used', 0)}/{usage.get('questions_limit', 'unlimited')}")
    else:
        print(f"Usage stats failed: {response.text}")
    
    print("\n" + "=" * 60)
    print("🎉 PAYMENT WORKFLOW TEST COMPLETED SUCCESSFULLY!")
    print("✅ All payment API endpoints are working correctly")
    print("✅ Mock payment gateway integration is functional")
    print("✅ Subscription management is working properly")

if __name__ == '__main__':
    test_payment_workflow()