#!/usr/bin/env python
"""
Create sample data for the exam platform
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from users.models import User
from exams.models import Category, Exam
from questions.models import QuestionBank, Question, QuestionOption


def create_sample_data():
    print("Creating sample data...")
    
    # Create categories
    categories = [
        {'name': 'UPSC', 'description': 'Union Public Service Commission Exams', 'icon': '🏛️'},
        {'name': 'SSC', 'description': 'Staff Selection Commission Exams', 'icon': '📋'},
        {'name': 'Banking', 'description': 'Banking Sector Exams', 'icon': '🏦'},
        {'name': 'Railway', 'description': 'Railway Recruitment Board Exams', 'icon': '🚂'},
    ]
    
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")
    
    # Create a sample admin user
    admin_user, created = User.objects.get_or_create(
        email='admin@247exams.com',
        defaults={
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.email}")
    
    # Create sample exams
    upsc_category = Category.objects.get(name='UPSC')
    exam, created = Exam.objects.get_or_create(
        title='UPSC Civil Services Preliminary Exam',
        defaults={
            'description': 'Practice test for UPSC CSE Prelims with General Studies questions',
            'category': upsc_category,
            'difficulty': 'advanced',
            'duration_minutes': 120,
            'total_questions': 100,
            'passing_score': 50,
            'created_by': admin_user,
            'tags': ['upsc', 'prelims', 'general-studies'],
        }
    )
    if created:
        print(f"Created exam: {exam.title}")
    
    # Create question bank
    question_bank, created = QuestionBank.objects.get_or_create(
        name='UPSC General Studies',
        defaults={
            'description': 'General Studies questions for UPSC preparation',
            'subject': 'General Studies',
            'difficulty': 'advanced',
            'created_by': admin_user,
        }
    )
    if created:
        print(f"Created question bank: {question_bank.name}")
    
    # Create sample questions
    sample_questions = [
        {
            'question_text': 'Which of the following is the largest planet in our solar system?',
            'options': [
                {'text': 'Earth', 'correct': False},
                {'text': 'Jupiter', 'correct': True},
                {'text': 'Saturn', 'correct': False},
                {'text': 'Mars', 'correct': False},
            ],
            'explanation': 'Jupiter is the largest planet in our solar system with a diameter of about 142,984 km.',
            'topic': 'Astronomy',
            'difficulty': 'easy'
        },
        {
            'question_text': 'The Indian Constitution was adopted on which date?',
            'options': [
                {'text': '15th August 1947', 'correct': False},
                {'text': '26th January 1950', 'correct': False},
                {'text': '26th November 1949', 'correct': True},
                {'text': '2nd October 1948', 'correct': False},
            ],
            'explanation': 'The Indian Constitution was adopted by the Constituent Assembly on 26th November 1949, though it came into effect on 26th January 1950.',
            'topic': 'Indian Polity',
            'difficulty': 'medium'
        },
        {
            'question_text': 'Which river is known as the lifeline of Egypt?',
            'options': [
                {'text': 'Amazon', 'correct': False},
                {'text': 'Nile', 'correct': True},
                {'text': 'Euphrates', 'correct': False},
                {'text': 'Thames', 'correct': False},
            ],
            'explanation': 'The Nile River is known as the lifeline of Egypt as it provides water and fertile soil to the otherwise desert country.',
            'topic': 'Geography',
            'difficulty': 'easy'
        }
    ]
    
    for q_data in sample_questions:
        question, created = Question.objects.get_or_create(
            question_text=q_data['question_text'],
            defaults={
                'question_bank': question_bank,
                'question_type': 'mcq',
                'explanation': q_data['explanation'],
                'difficulty': q_data['difficulty'],
                'topic': q_data['topic'],
                'created_by': admin_user,
                'is_verified': True,
            }
        )
        
        if created:
            print(f"Created question: {question.question_text[:50]}...")
            
            # Create options
            for i, option_data in enumerate(q_data['options'], 1):
                QuestionOption.objects.create(
                    question=question,
                    option_text=option_data['text'],
                    is_correct=option_data['correct'],
                    order=i
                )
    
    print("\n✅ Sample data creation completed!")
    print("\nYou can now:")
    print("1. Login to admin panel: http://localhost:8000/admin/")
    print("   - Username: admin@247exams.com")
    print("   - Password: admin123")
    print("2. Test API endpoints: http://localhost:8000/api/v1/")


if __name__ == '__main__':
    create_sample_data()