import os
import sys
import django
import json

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from django.contrib.auth import get_user_model
from exams.models import Exam, Test
from questions.models import TestQuestionBank

User = get_user_model()

# Get admin user
admin = User.objects.filter(is_superuser=True).first()
if admin:
    print(f"Admin user: {admin.username}")
else:
    print("No admin user found")

print("\n📊 Exam and Test Status:")
print("=" * 50)

for exam in Exam.objects.all()[:5]:
    print(f"\n📚 Exam: {exam.name}")
    print(f"   Status: {exam.status}")
    
    for test in exam.tests.all():
        qb_count = test.test_question_banks.count()
        total_questions = 0
        
        for tqb in test.test_question_banks.all():
            bank = tqb.question_bank
            available = bank.questions.count()
            requested = tqb.question_count
            total_questions += min(available, requested)
        
        if qb_count > 0:
            print(f"   ✅ Test: {test.title}")
            print(f"      Question Banks: {qb_count}")
            print(f"      Total Questions: {total_questions}")
        else:
            print(f"   ❓ Test: {test.title}")
            print(f"      No question banks linked!")

print("\n" + "=" * 50)
print(f"Total TestQuestionBank links: {TestQuestionBank.objects.count()}")
print(f"Tests with question banks: {Test.objects.filter(test_question_banks__isnull=False).distinct().count()}/{Test.objects.count()}")