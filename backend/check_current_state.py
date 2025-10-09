import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from questions.models import QuestionBank, TestQuestionBank, Question
from exams.models import Test

print(f'Question Banks: {QuestionBank.objects.count()}')
print(f'Questions: {Question.objects.count()}')
print(f'Tests: {Test.objects.count()}')
print(f'TestQuestionBank links: {TestQuestionBank.objects.count()}')

print('\nQuestion Banks:')
for qb in QuestionBank.objects.all():
    print(f'  - {qb.name}: {qb.questions.count()} questions')

print('\nTests and their linked question banks:')
for test in Test.objects.all():
    qb_count = test.test_question_banks.count()
    if qb_count > 0:
        print(f'  ✅ {test.title}: {qb_count} banks linked')
        for tqb in test.test_question_banks.all():
            print(f'     - {tqb.question_bank.name}')
    else:
        print(f'  ❌ {test.title}: NO banks linked')