#!/usr/bin/env python3
"""Test script for payments API"""

import requests
import json

BASE_URL = 'http://localhost:8000/api/v1'

def test_payments_api():
    """Test the payments API endpoints"""
    
    print("Testing Payments API Endpoints")
    print("=" * 50)
    
    # Test 1: List subscription plans (no auth needed)
    print("\n1. Testing GET /payments/plans/")
    try:
        response = requests.get(f'{BASE_URL}/payments/plans/')
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Handle paginated response
            if 'results' in data:
                plans = data['results']
                print(f"Found {len(plans)} subscription plans:")
                for plan in plans:
                    print(f"  - {plan['name']}: ₹{plan['price']}/{plan['billing_cycle']}")
            else:
                print(f"Unexpected response format: {data}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error connecting to API: {e}")
    
    # Test 2: Test authentication required endpoints
    print("\n2. Testing subscription-status (requires auth)")
    try:
        response = requests.get(f'{BASE_URL}/payments/subscription-status/')
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("✓ Correctly requires authentication")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Login and get token
    print("\n3. Testing login to get auth token")
    login_data = {
        'email': 'student@test.com',
        'password': 'test123'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            auth_data = response.json()
            print(f"Login response keys: {list(auth_data.keys())}")
            
            # Extract token from nested structure
            tokens = auth_data.get('tokens', {})
            access_token = tokens.get('access')
            print("✓ Login successful, got access token")
            print(f"Token preview: {access_token[:50]}..." if access_token else "No token received")
            
            # Test authenticated request
            headers = {'Authorization': f'Bearer {access_token}'}
            
            print("\n4. Testing authenticated subscription status")
            response = requests.get(f'{BASE_URL}/payments/subscription-status/', headers=headers)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Has subscription: {data.get('has_subscription')}")
                if data.get('subscription'):
                    sub = data['subscription']
                    print(f"Subscription: {sub.get('plan_name')} - {sub.get('status')}")
            else:
                print(f"Response: {response.text}")
        else:
            print(f"Login failed: {response.text}")
    
    except Exception as e:
        print(f"Error during login test: {e}")
    
    print("\n" + "=" * 50)
    print("Payment API testing completed!")

if __name__ == '__main__':
    test_payments_api()