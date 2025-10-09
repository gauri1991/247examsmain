#!/usr/bin/env python3

import requests
import json

# Test the requirements endpoint directly
def test_requirements_endpoint():
    # First, login to get a token
    login_url = "http://localhost:8000/api/v1/auth/mobile/password/login/"
    login_data = {
        "phone": "9252517941",  # Admin phone from database
        "password": "admin123"
    }
    
    print("1. Testing login...")
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            access_token = login_result.get('tokens', {}).get('access')
            print(f"Access token obtained: {access_token[:50]}..." if access_token else "No token in response")
            
            if access_token:
                # Test requirements endpoint with authentication
                test_id = "543ab83f-9421-43b5-a119-ea245e45bc02"  # JEE Mathematics Test
                requirements_url = f"http://localhost:8000/api/v1/exams/tests/{test_id}/requirements/"
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                print(f"\n2. Testing requirements endpoint: {requirements_url}")
                requirements_response = requests.get(requirements_url, headers=headers)
                print(f"Requirements Status: {requirements_response.status_code}")
                print(f"Requirements Response: {requirements_response.text}")
                
                return requirements_response.status_code == 200
            else:
                print("No access token received")
                return False
        else:
            print(f"Login failed: {login_response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = test_requirements_endpoint()
    print(f"\nTest result: {'SUCCESS' if success else 'FAILED'}")