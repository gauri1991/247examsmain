#!/usr/bin/env python3
"""Simulate exact frontend request"""

import requests
import json

def test_frontend_request():
    print("Simulating Frontend Login Request")
    print("=" * 40)
    
    url = 'http://localhost:8000/api/v1/auth/login/'
    
    # Simulate exactly what frontend sends
    payload = {
        'email': 'student@247exams.com',
        'password': 'test123'
    }
    
    headers = {
        'Content-Type': 'application/json',
    }
    
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    print(f"Payload: {payload}")
    print()
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        if response.headers.get('content-type', '').startswith('application/json'):
            response_data = response.json()
            print(f"Response Data: {json.dumps(response_data, indent=2)}")
        else:
            print(f"Response Text: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

    # Also test with a non-existent user
    print("\n" + "=" * 40)
    print("Testing with NON-EXISTENT user")
    print("=" * 40)
    
    payload_bad = {
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    }
    
    print(f"Payload: {payload_bad}")
    
    try:
        response = requests.post(url, json=payload_bad, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            response_data = response.json()
            print(f"Response Data: {json.dumps(response_data, indent=2)}")
        else:
            print(f"Response Text: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_frontend_request()