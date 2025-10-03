#!/usr/bin/env python3
"""
Create sample test data for demonstration.
"""

import os
import sys
import django
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

# Add the current directory to Python path
sys.path.append('/home/gss/Documents/projects/dts/247exams/backend')

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

# Now import from current database
from exams.models import Exam, Test, TestAttempt

def create_sample_tests():
    """Create sample tests for existing exams"""
    User = get_user_model()
    
    # Get or create a default user
    try:
        admin_user = User.objects.get(email='admin@247exams.com')
    except User.DoesNotExist:
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@247exams.com',
            first_name='Admin',
            last_name='User',
            password='admin123'
        )
    
    # Get current user for test attempts
    try:
        test_user = User.objects.first()
        if not test_user:
            test_user = admin_user
    except:
        test_user = admin_user
    
    print(f"Creating tests with admin user: {admin_user.username}")
    print(f"Creating test attempts for user: {test_user.username}")
    
    with transaction.atomic():
        # Get first 5 exams
        exams = Exam.objects.all()[:5]
        
        for exam in exams:
            print(f"Creating tests for exam: {exam.name}")
            
            # Create 2-3 tests per exam
            test_count = random.randint(2, 4)
            
            for i in range(test_count):
                # Create test
                test = Test.objects.create(
                    exam=exam,
                    title=f"{exam.name} - Practice Test {i+1}",
                    description=f"Comprehensive practice test for {exam.name}. Test your knowledge and preparation level.",
                    duration_minutes=random.randint(60, 180),
                    total_marks=random.randint(50, 200),
                    pass_percentage=random.uniform(40.0, 60.0),
                    is_published=True,
                    randomize_questions=random.choice([True, False]),
                    show_result_immediately=True,
                    allow_review=True,
                    max_attempts=random.randint(1, 3),
                    created_by=admin_user
                )
                
                print(f"  Created test: {test.title}")
                
                # Create some test attempts
                attempt_count = random.randint(1, 3)
                
                for j in range(attempt_count):
                    # Random test performance
                    total_questions = random.randint(20, 100)
                    attempted_questions = random.randint(int(total_questions * 0.7), total_questions)
                    correct_answers = random.randint(int(attempted_questions * 0.3), int(attempted_questions * 0.9))
                    marks_obtained = (correct_answers / total_questions) * test.total_marks
                    percentage = (marks_obtained / test.total_marks) * 100
                    
                    # Random timing
                    days_ago = random.randint(1, 30)
                    start_time = timezone.now() - timedelta(days=days_ago, hours=random.randint(1, 6))
                    duration_seconds = random.randint(1800, test.duration_minutes * 60)  # 30 min to full duration
                    end_time = start_time + timedelta(seconds=duration_seconds)
                    
                    # Random status
                    statuses = ['completed', 'completed', 'completed', 'in_progress', 'abandoned']  # Weighted towards completed
                    status = random.choice(statuses)
                    
                    if status == 'in_progress':
                        end_time = None
                        attempted_questions = random.randint(1, int(total_questions * 0.5))
                        correct_answers = random.randint(0, attempted_questions)
                        marks_obtained = (correct_answers / total_questions) * test.total_marks if total_questions > 0 else 0
                        percentage = (marks_obtained / test.total_marks) * 100 if test.total_marks > 0 else 0
                    elif status == 'abandoned':
                        attempted_questions = random.randint(1, int(total_questions * 0.3))
                        correct_answers = random.randint(0, attempted_questions)
                        marks_obtained = (correct_answers / total_questions) * test.total_marks if total_questions > 0 else 0
                        percentage = (marks_obtained / test.total_marks) * 100 if test.total_marks > 0 else 0
                    
                    attempt = TestAttempt.objects.create(
                        test=test,
                        user=test_user,
                        attempt_number=j + 1,
                        status=status,
                        start_time=start_time,
                        end_time=end_time,
                        time_spent_seconds=duration_seconds if status != 'in_progress' else random.randint(600, 3600),
                        total_questions=total_questions,
                        attempted_questions=attempted_questions,
                        correct_answers=correct_answers,
                        marks_obtained=marks_obtained,
                        percentage=percentage
                    )
                    
                    print(f"    Created attempt: {attempt.id} ({status}, {percentage:.1f}%)")

if __name__ == "__main__":
    print("=== Creating Sample Tests and Attempts ===")
    create_sample_tests()
    
    # Print summary
    total_tests = Test.objects.count()
    total_attempts = TestAttempt.objects.count()
    published_tests = Test.objects.filter(is_published=True).count()
    
    print(f"\nSummary:")
    print(f"Total Tests: {total_tests}")
    print(f"Published Tests: {published_tests}")
    print(f"Total Test Attempts: {total_attempts}")
    print("\n=== Sample data creation completed! ===")