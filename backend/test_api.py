#!/usr/bin/env python
import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

# Create a test client and user
client = Client()
User = get_user_model()

# Try to find an admin user or create one for testing
try:
    admin_user = User.objects.filter(is_staff=True, is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.create_superuser('admin', 'admin@test.com', 'password123')
    
    # Login the user
    client.force_login(admin_user)
    
    # Test the API endpoint
    response = client.get('/api/v1/questions/admin/all-content/')
    
    if response.status_code == 200:
        data = response.json()
        print("=== API Response Structure ===")
        print(f"Success: {data.get('success')}")
        print(f"Tests count: {len(data.get('data', {}).get('tests', []))}")
        print(f"Exams count: {len(data.get('data', {}).get('exams', []))}")
        
        # Check if tests have status field
        tests = data.get('data', {}).get('tests', [])
        if tests:
            first_test = tests[0]
            print(f"\n=== First Test Structure ===")
            print(f"ID: {first_test.get('id')}")
            print(f"Name: {first_test.get('name')}")
            print(f"Status: {first_test.get('status')}")
            print(f"Has status field: {'status' in first_test}")
        
        # Check if exams have status field  
        exams = data.get('data', {}).get('exams', [])
        if exams:
            first_exam = exams[0]
            print(f"\n=== First Exam Structure ===")
            print(f"ID: {first_exam.get('id')}")
            print(f"Name: {first_exam.get('name')}")
            print(f"Status: {first_exam.get('status')}")
            print(f"Has status field: {'status' in first_exam}")
    else:
        print(f"API Error: {response.status_code}")
        print(response.content.decode())
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()