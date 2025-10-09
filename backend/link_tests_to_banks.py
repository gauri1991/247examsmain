import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from questions.models import TestQuestionBank, QuestionBank
from exams.models import Test

# Create a mapping between test titles and appropriate question banks
test_to_bank_mapping = {
    'English Language': 'English Grammar Question Bank',
    'General Science': 'Physics Mechanics Question Bank',  # Use physics as a general science bank
    'Mathematics Foundation': 'Basic Mathematics Question Bank',
    'Computer Science Fundamentals': 'Computer Science Question Bank',
    'General Knowledge': 'General Knowledge Question Bank',
    'Reasoning Ability': 'Logical Reasoning Question Bank',
    'Advanced Mathematics': 'Advanced Mathematics Question Bank',
    'Physics': 'Advanced Physics Question Bank',
    'Chemistry': 'Organic Chemistry Question Bank',
    'Biology': 'Biology Genetics Question Bank',
    'Literature': 'English Literature Question Bank',
    'Logical Reasoning': 'Logical Reasoning Question Bank',
    'Advanced Physics': 'Advanced Physics Question Bank',
    'English Literature': 'English Literature Question Bank',
}

# Link each test to its corresponding question bank
created_count = 0
for test in Test.objects.all():
    # Try direct mapping first
    bank_name = test_to_bank_mapping.get(test.title)
    
    if bank_name:
        matching_banks = QuestionBank.objects.filter(name=bank_name)
    else:
        # Try fuzzy matching
        matching_banks = None
        # Try to find by keywords
        for keyword in ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer', 'Reasoning', 'General']:
            if keyword.lower() in test.title.lower():
                matching_banks = QuestionBank.objects.filter(name__icontains=keyword)
                if matching_banks.exists():
                    break
    
    if matching_banks and matching_banks.exists():
        bank = matching_banks.first()
        # Create the link if it doesn't exist
        link, created = TestQuestionBank.objects.get_or_create(
            test=test,
            question_bank=bank,
            defaults={
                'question_count': min(50, bank.questions.count()),  # Request up to 50 questions
                'selection_method': 'random'
            }
        )
        if created:
            created_count += 1
            print(f'✅ Linked test "{test.title}" to question bank "{bank.name}"')
        else:
            print(f'ℹ️  Test "{test.title}" already linked to "{bank.name}"')
    else:
        print(f'⚠️  No matching question bank found for test "{test.title}"')

print(f'\n📊 Summary: Created {created_count} new test-to-question-bank links')
print(f'Total TestQuestionBank links: {TestQuestionBank.objects.count()}')

# Show the updated status
print('\n📋 Test Status:')
for test in Test.objects.all()[:10]:
    qb_count = test.test_question_banks.count()
    total_questions = sum(tqb.question_count for tqb in test.test_question_banks.all())
    status = '✅' if qb_count > 0 else '❌'
    print(f'{status} Test: {test.title}, Banks: {qb_count}, Questions: {total_questions}')