#!/usr/bin/env python3

import requests
import json

def test_activation():
    """Test exam/test activation functionality"""
    base_url = "http://localhost:8000"
    
    # First, login to get a token
    login_url = f"{base_url}/api/v1/auth/mobile/password/login/"
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
            print(f"Access token obtained: {bool(access_token)}")
            
            if access_token:
                # Get list of ready exams and tests
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
                
                # Get ready tests directly from database
                print("Getting ready tests from database...")
                import sys
                import os
                import django
                
                # Setup Django environment
                os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
                sys.path.append('/home/gss/Documents/projects/dts/247exams/backend')
                django.setup()
                
                from exams.models import Exam, Test
                ready_exams = list(Exam.objects.filter(status='ready')[:1])
                ready_tests = list(Test.objects.filter(status='ready')[:1])
                
                print(f"\n2. Found {len(ready_exams)} ready exams and {len(ready_tests)} ready tests")
                    
                # Test activating a ready exam
                if ready_exams:
                    exam = ready_exams[0]
                    print(f"\n3. Testing activation of exam: {exam.name}")
                    
                    # Test requirements first
                    req_url = f"{base_url}/api/v1/exams/exams/{exam.id}/requirements/"
                    req_response = requests.get(req_url, headers=headers)
                    print(f"Requirements check: {req_response.status_code}")
                    if req_response.status_code == 200:
                        req_data = req_response.json()
                        print(f"Is ready: {req_data.get('is_ready')}")
                    
                    # Test activation
                    activation_url = f"{base_url}/api/v1/exams/exams/{exam.id}/update_status/"
                    activation_data = {"status": "active"}
                    activation_response = requests.patch(activation_url, json=activation_data, headers=headers)
                    
                    print(f"Activation Status: {activation_response.status_code}")
                    print(f"Activation Response: {activation_response.text}")
                    
                    return activation_response.status_code == 200
                
                # Test activating a ready test
                elif ready_tests:
                    test = ready_tests[0]
                    print(f"\n3. Testing activation of test: {test.title}")
                    
                    # Test requirements first
                    req_url = f"{base_url}/api/v1/exams/tests/{test.id}/requirements/"
                    req_response = requests.get(req_url, headers=headers)
                    print(f"Requirements check: {req_response.status_code}")
                    if req_response.status_code == 200:
                        req_data = req_response.json()
                        print(f"Is ready: {req_data.get('is_ready')}")
                    
                    # Test activation
                    activation_url = f"{base_url}/api/v1/exams/tests/{test.id}/update_status/"
                    activation_data = {"status": "active"}
                    activation_response = requests.patch(activation_url, json=activation_data, headers=headers)
                    
                    print(f"Activation Status: {activation_response.status_code}")
                    print(f"Activation Response: {activation_response.text}")
                    
                    return activation_response.status_code == 200
                else:
                    print("No ready exams or tests found to activate")
                    return False
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
    success = test_activation()
    print(f"\nTest result: {'SUCCESS' if success else 'FAILED'}")