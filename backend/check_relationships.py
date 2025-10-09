import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from questions.models import TestQuestionBank, QuestionBank
from exams.models import Test

print(f'Total tests: {Test.objects.count()}')
print(f'Total question banks: {QuestionBank.objects.count()}')
print(f'TestQuestionBank links: {TestQuestionBank.objects.count()}')
print('\nFirst 5 tests:')
for test in Test.objects.all()[:5]:
    qb_count = test.test_question_banks.count()
    print(f'Test: {test.title}, Question Banks linked: {qb_count}')
    if qb_count > 0:
        for tqb in test.test_question_banks.all():
            print(f'  - {tqb.question_bank.name}: {tqb.question_count} questions requested')