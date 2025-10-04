#!/usr/bin/env python
import os
import sys
import django

# Add the project root to the Python path
sys.path.append('/home/gss/Documents/projects/dts/247exams/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

def create_admin_user():
    """Create admin user with specified credentials"""
    username = "9252517941"
    phone = "9252517941"
    email = f"admin{username}@247exams.com"  # Use unique email
    password = "admin123"
    
    try:
        # Check if user already exists by phone OR username
        user = None
        if User.objects.filter(phone=phone).exists():
            user = User.objects.get(phone=phone)
            print(f"User with phone {phone} already exists. Updating admin privileges...")
        elif User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            print(f"User with username {username} already exists. Updating admin privileges...")
        
        if user:
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.phone = phone  # Ensure phone is set
            user.set_password(password)
            user.save()
            print(f"✅ Updated user {username} with admin privileges")
        else:
            # Try to create new admin user
            try:
                user = User.objects.create_user(
                    username=username,
                    phone=phone,
                    email=email,
                    password=password,
                    is_staff=True,
                    is_superuser=True,
                    is_active=True,
                    first_name="Admin",
                    last_name="User"
                )
                print(f"✅ Created admin user: {username}")
            except IntegrityError as e:
                if "email" in str(e):
                    # Email conflict, try with different email
                    import time
                    email = f"admin{username}_{int(time.time())}@247exams.com"
                    user = User.objects.create_user(
                        username=username,
                        phone=phone,
                        email=email,
                        password=password,
                        is_staff=True,
                        is_superuser=True,
                        is_active=True,
                        first_name="Admin",
                        last_name="User"
                    )
                    print(f"✅ Created admin user with unique email: {username}")
                else:
                    raise e
        
        print(f"📋 Admin credentials:")
        print(f"   Username/Mobile: {username}")
        print(f"   Email: {user.email}")
        print(f"   Password: {password}")
        print(f"   Staff: {user.is_staff}")
        print(f"   Superuser: {user.is_superuser}")
        print(f"   Active: {user.is_active}")
        
    except IntegrityError as e:
        print(f"❌ Error creating admin user: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    create_admin_user()