#!/usr/bin/env python3
"""
Migration script to copy Test and TestAttempt data from original test_platform database
to the new 247exams database.
"""

import os
import sys
import django
from django.db import transaction
from django.contrib.auth import get_user_model

# Add the current directory to Python path
sys.path.append('/home/gss/Documents/projects/dts/247exams/backend')
sys.path.append('/home/gss/Documents/projects/dts/test_platform')

# Configure Django settings for the destination database (247exams)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

# Now import from current database
from exams.models import Exam, Test, TestAttempt

def setup_original_db():
    """Setup connection to original database"""
    import sqlite3
    original_db_path = '/home/gss/Documents/projects/dts/test_platform/db.sqlite3'
    return sqlite3.connect(original_db_path)

def migrate_tests():
    """Migrate tests from original database to new database"""
    User = get_user_model()
    original_conn = setup_original_db()
    cursor = original_conn.cursor()
    
    print("Starting test migration...")
    
    try:
        with transaction.atomic():
            # Get all tests from original database
            cursor.execute("""
                SELECT 
                    id, exam_id, title, description, duration_minutes, total_marks, 
                    pass_percentage, is_published, randomize_questions, 
                    show_result_immediately, allow_review, max_attempts,
                    start_time, end_time, created_by_id, created_at, updated_at
                FROM tests 
                ORDER BY created_at
            """)
            
            original_tests = cursor.fetchall()
            migrated_count = 0
            skipped_count = 0
            
            # Get or create a default user for tests without valid created_by
            try:
                default_user = User.objects.get(email='admin@247exams.com')
            except User.DoesNotExist:
                default_user = User.objects.create_user(
                    username='migration_admin',
                    email='admin@247exams.com',
                    first_name='Migration',
                    last_name='Admin',
                    password='temporarypassword123'
                )
            
            for test_data in original_tests:
                (test_id, exam_id, title, description, duration_minutes, total_marks,
                 pass_percentage, is_published, randomize_questions,
                 show_result_immediately, allow_review, max_attempts,
                 start_time, end_time, created_by_id, created_at, updated_at) = test_data
                
                # Check if test already exists
                if Test.objects.filter(id=test_id).exists():
                    print(f"Test {test_id} already exists, skipping...")
                    skipped_count += 1
                    continue
                
                # Check if the exam exists in the new database
                try:
                    exam = Exam.objects.get(id=exam_id)
                except Exam.DoesNotExist:
                    print(f"Exam {exam_id} not found for test {test_id}, skipping...")
                    skipped_count += 1
                    continue
                
                # Get the created_by user
                try:
                    if created_by_id:
                        created_by = User.objects.get(id=created_by_id)
                    else:
                        created_by = default_user
                except User.DoesNotExist:
                    created_by = default_user
                
                # Create the test
                test = Test.objects.create(
                    id=test_id,
                    exam=exam,
                    title=title,
                    description=description,
                    duration_minutes=duration_minutes,
                    total_marks=total_marks,
                    pass_percentage=pass_percentage,
                    is_published=bool(is_published),
                    randomize_questions=bool(randomize_questions),
                    show_result_immediately=bool(show_result_immediately),
                    allow_review=bool(allow_review),
                    max_attempts=max_attempts or 1,
                    start_time=start_time,
                    end_time=end_time,
                    created_by=created_by
                )
                
                # Set the created_at and updated_at manually
                Test.objects.filter(id=test_id).update(
                    created_at=created_at,
                    updated_at=updated_at
                )
                
                print(f"Migrated test: {title}")
                migrated_count += 1
            
            print(f"Test migration completed!")
            print(f"Migrated: {migrated_count} tests")
            print(f"Skipped: {skipped_count} tests")
            
    except Exception as e:
        print(f"Error during test migration: {e}")
        raise
    
    finally:
        original_conn.close()

def migrate_test_attempts():
    """Migrate test attempts from original database to new database"""
    User = get_user_model()
    original_conn = setup_original_db()
    cursor = original_conn.cursor()
    
    print("Starting test attempt migration...")
    
    try:
        with transaction.atomic():
            # Get all test attempts from original database
            cursor.execute("""
                SELECT 
                    id, test_id, user_id, attempt_number, status, start_time, end_time,
                    time_spent_seconds, total_questions, attempted_questions, 
                    correct_answers, marks_obtained, percentage
                FROM test_attempts 
                ORDER BY start_time
            """)
            
            original_attempts = cursor.fetchall()
            migrated_count = 0
            skipped_count = 0
            
            for attempt_data in original_attempts:
                (attempt_id, test_id, user_id, attempt_number, status, start_time, 
                 end_time, time_spent_seconds, total_questions, attempted_questions,
                 correct_answers, marks_obtained, percentage) = attempt_data
                
                # Check if test attempt already exists
                if TestAttempt.objects.filter(id=attempt_id).exists():
                    print(f"Test attempt {attempt_id} already exists, skipping...")
                    skipped_count += 1
                    continue
                
                # Check if the test exists in the new database
                try:
                    test = Test.objects.get(id=test_id)
                except Test.DoesNotExist:
                    print(f"Test {test_id} not found for attempt {attempt_id}, skipping...")
                    skipped_count += 1
                    continue
                
                # Check if the user exists in the new database
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    print(f"User {user_id} not found for attempt {attempt_id}, skipping...")
                    skipped_count += 1
                    continue
                
                # Create the test attempt
                attempt = TestAttempt.objects.create(
                    id=attempt_id,
                    test=test,
                    user=user,
                    attempt_number=attempt_number or 1,
                    status=status or 'in_progress',
                    start_time=start_time,
                    end_time=end_time,
                    time_spent_seconds=time_spent_seconds or 0,
                    total_questions=total_questions or 0,
                    attempted_questions=attempted_questions or 0,
                    correct_answers=correct_answers or 0,
                    marks_obtained=marks_obtained or 0,
                    percentage=percentage or 0
                )
                
                print(f"Migrated test attempt: {attempt_id} for user {user.username}")
                migrated_count += 1
            
            print(f"Test attempt migration completed!")
            print(f"Migrated: {migrated_count} attempts")
            print(f"Skipped: {skipped_count} attempts")
            
    except Exception as e:
        print(f"Error during test attempt migration: {e}")
        raise
    
    finally:
        original_conn.close()

def update_exam_test_counts():
    """Update test counts for exams"""
    print("Updating exam test counts...")
    
    for exam in Exam.objects.all():
        test_count = exam.tests.filter(is_published=True).count()
        # Update the count in a way that doesn't trigger model validation
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE exams SET custom_fields = JSON_SET(COALESCE(custom_fields, '{}'), '$.tests_count', %s) WHERE id = %s",
                [test_count, str(exam.id)]
            )
    
    print("Updated exam test counts.")

if __name__ == "__main__":
    print("=== 247Exams Test Migration Script ===")
    
    # Run migrations
    migrate_tests()
    migrate_test_attempts()
    update_exam_test_counts()
    
    print("=== Migration completed successfully! ===")
    
    # Print summary statistics
    total_tests = Test.objects.count()
    total_attempts = TestAttempt.objects.count()
    published_tests = Test.objects.filter(is_published=True).count()
    
    print(f"\nFinal Statistics:")
    print(f"Total Tests: {total_tests}")
    print(f"Published Tests: {published_tests}")
    print(f"Total Test Attempts: {total_attempts}")