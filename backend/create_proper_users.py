#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from users.models import User

# Create the proper test accounts
users_to_create = [
    {
        'username': 'student247',
        'email': 'student@247exams.com',
        'password': 'test123',
        'first_name': 'Test',
        'last_name': 'Student',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'teacher247',
        'email': 'teacher@247exams.com',
        'password': 'test123',
        'first_name': 'Test',
        'last_name': 'Teacher',
        'is_staff': True,
        'is_superuser': False,
    },
    {
        'username': 'admin247',
        'email': 'admin@247exams.com',
        'password': 'test123',
        'first_name': 'Test',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': True,
    }
]

for user_data in users_to_create:
    email = user_data['email']
    password = user_data.pop('password')
    
    user, created = User.objects.get_or_create(
        email=email,
        defaults=user_data
    )
    
    if created:
        user.set_password(password)
        user.save()
        print(f'Created user: {user.email} ({user.username})')
    else:
        # Update password anyway
        user.set_password(password)
        user.save()
        print(f'Updated user: {user.email} ({user.username})')

print(f'\nTotal users: {User.objects.count()}')
print('All users:')
for user in User.objects.all():
    print(f'  - {user.email} ({user.username}) - Staff: {user.is_staff}, Admin: {user.is_superuser}')