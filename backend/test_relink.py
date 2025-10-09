import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from questions.models import TestQuestionBank
from exams.models import Test

print("Testing re-link functionality...")
print(f"Tests with original JSON data: {Test.objects.exclude(original_json_data__isnull=True).count()}")
print(f"Current TestQuestionBank links: {TestQuestionBank.objects.count()}")

# Simulate what the endpoint does
for test in Test.objects.all()[:1]:
    if test.original_json_data and 'question_bank_references' in test.original_json_data:
        print(f"\nTest: {test.title}")
        print(f"Question bank references in JSON:")
        for ref in test.original_json_data['question_bank_references']:
            print(f"  - {ref.get('bank_name')}: {ref.get('question_count')} questions")