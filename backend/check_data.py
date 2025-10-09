#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from exams.models import Test, Exam
from questions.models import QuestionBank

# Check object counts
print("=== DATABASE OBJECT COUNTS ===")
print(f"Tests: {Test.objects.count()}")
print(f"Exams: {Exam.objects.count()}")
print(f"QuestionBanks: {QuestionBank.objects.count()}")

# Check specific test IDs that are causing issues
print("\n=== SPECIFIC TEST IDS ===")
test_ids = Test.objects.values_list('id', flat=True)
print(f"All test IDs: {list(test_ids)}")

exam_ids = Exam.objects.values_list('id', flat=True)
print(f"All exam IDs: {list(exam_ids)}")

# Check for any orphaned data
print("\n=== CHECKING FOR ISSUES ===")
tests_with_missing_question_banks = []
for test in Test.objects.all():
    try:
        requirements = test.check_question_requirements()
        if not requirements:
            tests_with_missing_question_banks.append(test.id)
    except Exception as e:
        print(f"Error checking requirements for test {test.id}: {e}")

if tests_with_missing_question_banks:
    print(f"Tests with missing question banks: {tests_with_missing_question_banks}")
else:
    print("All tests have valid question bank links")