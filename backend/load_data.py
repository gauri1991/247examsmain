#!/usr/bin/env python
"""
Load exported data fixtures into PostgreSQL database
"""
import os
import sys
import django
from django.core.management import call_command
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

def load_fixtures():
    """Load data fixtures into PostgreSQL database"""
    
    fixtures = [
        'users_data.json',
        'exams_data.json', 
        'questions_data.json',
        'payments_data.json',
        'core_data.json',
    ]
    
    print("📥 Loading data fixtures into PostgreSQL...")
    
    try:
        for fixture in fixtures:
            if os.path.exists(fixture):
                print(f"Loading {fixture}...")
                call_command('loaddata', fixture, verbosity=2)
                print(f"✅ {fixture} loaded successfully")
            else:
                print(f"⚠️ {fixture} not found, skipping...")
                
        print("\n🎉 All fixtures loaded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading fixtures: {e}")
        return False

if __name__ == '__main__':
    success = load_fixtures()
    if not success:
        sys.exit(1)