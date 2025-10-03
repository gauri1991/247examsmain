#!/usr/bin/env python
"""
Create test user accounts for each profile type
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from users.models import User, UserProfile


def create_test_users():
    print("Creating test user accounts...")
    
    # Common password for all test users
    password = 'test123'
    
    # Test users data
    test_users = [
        {
            'email': 'student@247exams.com',
            'username': 'student_user',
            'first_name': 'John',
            'last_name': 'Student',
            'role': 'student',
            'phone': '+91 9876543210'
        },
        {
            'email': 'teacher@247exams.com',
            'username': 'teacher_user',
            'first_name': 'Sarah',
            'last_name': 'Teacher',
            'role': 'teacher',
            'phone': '+91 9876543211'
        },
        {
            'email': 'admin@247exams.com',
            'username': 'admin_user',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'phone': '+91 9876543212',
            'is_staff': True,
            'is_superuser': True
        }
    ]
    
    created_users = []
    
    for user_data in test_users:
        email = user_data['email']
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            # Update password to ensure it's consistent
            user.set_password(password)
            user.save()
            print(f"✓ Updated existing user: {email} ({user.role})")
        else:
            # Create new user
            is_staff = user_data.pop('is_staff', False)
            is_superuser = user_data.pop('is_superuser', False)
            
            user = User.objects.create_user(
                password=password,
                is_staff=is_staff,
                is_superuser=is_superuser,
                is_verified=True,  # Pre-verify test accounts
                **user_data
            )
            
            # Create user profile if it doesn't exist
            profile, profile_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': f'Test {user.role} account for development and testing',
                    'city': 'New Delhi',
                    'state': 'Delhi',
                    'country': 'India',
                    'language': 'en',
                    'timezone': 'Asia/Kolkata'
                }
            )
            
            print(f"✓ Created new user: {email} ({user.role})")
        
        created_users.append({
            'email': email,
            'role': user.role,
            'password': password
        })
    
    print(f"\n🎉 Test users setup completed!")
    print(f"Common password for all accounts: '{password}'")
    print("\n📋 Available test accounts:")
    print("-" * 50)
    
    for user in created_users:
        print(f"Email: {user['email']}")
        print(f"Role: {user['role'].title()}")
        print(f"Password: {user['password']}")
        print("-" * 30)
    
    print("\n🔗 Usage:")
    print("1. Frontend Login: Use any of the above emails with password 'test123'")
    print("2. Admin Panel: http://localhost:8000/admin/ (use admin@247exams.com)")
    print("3. API Testing: Use these credentials for API endpoint testing")
    
    print("\n📱 API Test Examples:")
    print("# Login as student:")
    print("curl -X POST http://localhost:8000/api/v1/auth/login/ \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"email\":\"student@247exams.com\",\"password\":\"test123\"}'")
    
    print("\n# Login as teacher:")
    print("curl -X POST http://localhost:8000/api/v1/auth/login/ \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"email\":\"teacher@247exams.com\",\"password\":\"test123\"}'")


if __name__ == '__main__':
    create_test_users()