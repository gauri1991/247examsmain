from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from exams.models import Exam, Test, TestSection, Organization
import json

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate simple exam data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating simple exam data...')
        
        # Get or create admin user
        admin_user = User.objects.filter(email='admin@247exams.com').first()
        if not admin_user:
            admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                self.stdout.write(self.style.ERROR('No admin user found'))
                return
        
        # Create a few simple exams without complex relationships
        self.stdout.write('Creating exams...')
        
        # UPSC Exam
        upsc_exam, created = Exam.objects.get_or_create(
            name='UPSC Civil Services 2025',
            defaults={
                'description': 'Civil Services Examination for IAS, IPS, IFS',
                'category': 'UPSC_CSE',
                'exam_type': 'competitive',
                'difficulty_level': 'hard',
                'is_active': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created: {upsc_exam.name}')
        
        # SSC CGL Exam
        ssc_exam, created = Exam.objects.get_or_create(
            name='SSC CGL 2025',
            defaults={
                'description': 'Combined Graduate Level Examination',
                'category': 'SSC_CGL',
                'exam_type': 'competitive',
                'difficulty_level': 'medium',
                'is_active': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created: {ssc_exam.name}')
        
        # Banking Exam
        bank_exam, created = Exam.objects.get_or_create(
            name='IBPS PO 2025',
            defaults={
                'description': 'Probationary Officer Recruitment',
                'category': 'BANK_PO',
                'exam_type': 'competitive',
                'difficulty_level': 'medium',
                'is_active': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created: {bank_exam.name}')
        
        # JEE Main
        jee_exam, created = Exam.objects.get_or_create(
            name='JEE Main 2025',
            defaults={
                'description': 'Joint Entrance Examination for Engineering',
                'category': 'JEE_MAIN',
                'exam_type': 'entrance',
                'difficulty_level': 'hard',
                'is_active': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created: {jee_exam.name}')
        
        # NEET
        neet_exam, created = Exam.objects.get_or_create(
            name='NEET UG 2025',
            defaults={
                'description': 'National Eligibility cum Entrance Test',
                'category': 'NEET',
                'exam_type': 'entrance',
                'difficulty_level': 'hard',
                'is_active': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created: {neet_exam.name}')
        
        # Create Tests for each exam
        self.stdout.write('Creating tests...')
        
        # UPSC Tests
        test1, created = Test.objects.get_or_create(
            exam=upsc_exam,
            title='UPSC Prelims Mock Test 1',
            defaults={
                'description': 'Full length mock test for UPSC Prelims',
                'duration_minutes': 120,
                'total_marks': 200,
                'pass_percentage': 33,
                'is_published': True,
                'randomize_questions': False,
                'show_result_immediately': True,
                'allow_review': True,
                'max_attempts': 3,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created test: {test1.title}')
            # Create sections
            TestSection.objects.create(test=test1, name='General Studies', order=1)
            TestSection.objects.create(test=test1, name='Current Affairs', order=2)
        
        test2, created = Test.objects.get_or_create(
            exam=upsc_exam,
            title='Indian History Practice Test',
            defaults={
                'description': 'Topic-wise test on Indian History',
                'duration_minutes': 60,
                'total_marks': 100,
                'pass_percentage': 40,
                'is_published': True,
                'randomize_questions': True,
                'show_result_immediately': True,
                'allow_review': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created test: {test2.title}')
        
        # SSC Test
        test3, created = Test.objects.get_or_create(
            exam=ssc_exam,
            title='SSC CGL Mock Test 1',
            defaults={
                'description': 'Complete mock test for SSC CGL',
                'duration_minutes': 60,
                'total_marks': 200,
                'pass_percentage': 30,
                'is_published': True,
                'randomize_questions': False,
                'show_result_immediately': True,
                'allow_review': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created test: {test3.title}')
            TestSection.objects.create(test=test3, name='Reasoning', order=1)
            TestSection.objects.create(test=test3, name='General Awareness', order=2)
            TestSection.objects.create(test=test3, name='Quantitative Aptitude', order=3)
            TestSection.objects.create(test=test3, name='English', order=4)
        
        # Banking Test
        test4, created = Test.objects.get_or_create(
            exam=bank_exam,
            title='IBPS PO Prelims Mock 1',
            defaults={
                'description': 'Preliminary exam mock test',
                'duration_minutes': 60,
                'total_marks': 100,
                'pass_percentage': 40,
                'is_published': True,
                'randomize_questions': True,
                'show_result_immediately': True,
                'allow_review': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created test: {test4.title}')
            TestSection.objects.create(test=test4, name='Reasoning Ability', order=1)
            TestSection.objects.create(test=test4, name='Quantitative Aptitude', order=2)
            TestSection.objects.create(test=test4, name='English Language', order=3)
        
        # JEE Test
        test5, created = Test.objects.get_or_create(
            exam=jee_exam,
            title='JEE Main Physics Mock',
            defaults={
                'description': 'Subject-wise mock test for Physics',
                'duration_minutes': 60,
                'total_marks': 120,
                'pass_percentage': 35,
                'is_published': True,
                'randomize_questions': False,
                'show_result_immediately': True,
                'allow_review': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created test: {test5.title}')
        
        # NEET Test
        test6, created = Test.objects.get_or_create(
            exam=neet_exam,
            title='NEET Biology Mock Test',
            defaults={
                'description': 'Biology mock test for NEET',
                'duration_minutes': 90,
                'total_marks': 360,
                'pass_percentage': 50,
                'is_published': True,
                'randomize_questions': False,
                'show_result_immediately': True,
                'allow_review': True,
                'created_by': admin_user
            }
        )
        if created:
            self.stdout.write(f'  Created test: {test6.title}')
            TestSection.objects.create(test=test6, name='Botany', order=1)
            TestSection.objects.create(test=test6, name='Zoology', order=2)
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created sample data:'))
        self.stdout.write(f'  - {Exam.objects.filter(is_active=True).count()} active exams')
        self.stdout.write(f'  - {Test.objects.filter(is_published=True).count()} published tests')
        self.stdout.write(f'  - {TestSection.objects.count()} test sections')