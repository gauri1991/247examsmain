#!/usr/bin/env python
"""
Script to create test user in production database.
Run this in Dokploy backend container:
    python create_user_in_production.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from users.models import User, UserProfile

def create_test_user():
    phone = '8302012630'
    password = 'admin123'

    # Check if user exists
    if User.objects.filter(phone=phone).exists():
        print(f'⚠️  User {phone} already exists!')
        user = User.objects.get(phone=phone)

        # Update password
        user.set_password(password)
        user.is_active = True
        user.is_verified = True
        user.save()
        print(f'✅ Updated password and activated user')
    else:
        # Create user
        user = User.objects.create_user(
            username=phone,
            phone=phone,
            email=f'{phone}@247exams.com',
            password=password,
            first_name='Test',
            last_name='User',
            role='student',
            is_active=True,
            is_verified=True
        )

        # Create profile
        UserProfile.objects.get_or_create(user=user)

        print(f'✅ Created user {phone}')

    # Show details
    print(f'\nUser Details:')
    print(f'  Phone: {user.phone}')
    print(f'  Username: {user.username}')
    print(f'  Email: {user.email}')
    print(f'  Is Active: {user.is_active}')
    print(f'  Is Verified: {user.is_verified}')
    print(f'  Role: {user.role}')
    print(f'  Password: admin123')

if __name__ == '__main__':
    create_test_user()
