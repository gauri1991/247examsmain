#!/usr/bin/env python3
"""Quick test of login endpoint"""

import requests
import json

BASE_URL = 'http://localhost:8000/api/v1'

def test_login():
    print("Testing Login with All Available Accounts")
    print("=" * 50)
    
    # Test accounts
    accounts = [
        {'email': 'student@247exams.com', 'password': 'test123'},
        {'email': 'teacher@247exams.com', 'password': 'test123'},
        {'email': 'admin@247exams.com', 'password': 'test123'},
        {'email': 'student@test.com', 'password': 'test123'},
        {'email': 'teacher@test.com', 'password': 'test123'},
        {'email': 'admin@test.com', 'password': 'test123'},
    ]
    
    for i, account in enumerate(accounts, 1):
        print(f"\n{i}. Testing {account['email']}")
        print("-" * 30)
        
        try:
            response = requests.post(f'{BASE_URL}/auth/login/', json=account)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Login successful!")
                print(f"User: {data.get('user', {}).get('email', 'N/A')}")
                print(f"Tokens: {'✅' if data.get('tokens') else '❌'}")
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {'error': response.text}
                print(f"❌ Login failed: {error_data}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_login()