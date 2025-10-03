from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from exams.models import (
    Exam, Test, TestSection, Organization, ExamMetadata,
    Syllabus, Subject, SyllabusNode, LearningContent
)
from decimal import Decimal
import json

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate sample exam data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample exam data...')
        
        # Get or create admin user
        admin_user = User.objects.filter(email='admin@247exams.com').first()
        if not admin_user:
            admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                self.stdout.write(self.style.ERROR('No admin user found'))
                return
        
        # Create Organizations
        self.stdout.write('Creating organizations...')
        org1, _ = Organization.objects.get_or_create(
            name='UPSC - Union Public Service Commission',
            defaults={
                'description': 'Premier central recruiting agency for the Government of India',
                'website': 'https://upsc.gov.in',
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        org2, _ = Organization.objects.get_or_create(
            name='SSC - Staff Selection Commission',
            defaults={
                'description': 'Government organization to recruit staff for various posts',
                'website': 'https://ssc.nic.in',
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        org3, _ = Organization.objects.get_or_create(
            name='Banking - IBPS',
            defaults={
                'description': 'Institute of Banking Personnel Selection',
                'website': 'https://ibps.in',
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        # Note: Subjects will be created along with syllabus since they require a syllabus FK
        
        # Create Exams with all 60+ categories
        self.stdout.write('Creating exams...')
        
        # UPSC Exams
        upsc_exam, _ = Exam.objects.get_or_create(
            name='UPSC Civil Services Examination 2025',
            defaults={
                'description': 'Civil Services Examination for IAS, IPS, IFS and other services',
                'category': 'UPSC_CSE',
                'exam_type': 'competitive',
                'difficulty_level': 'hard',
                'organization': org1,
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        # Create metadata for UPSC  
        from datetime import date, datetime
        from django.utils import timezone
        
        ExamMetadata.objects.get_or_create(
            exam=upsc_exam,
            defaults={
                'notification_date': date(2025, 2, 1),
                'form_start_date': timezone.make_aware(datetime(2025, 2, 2, 10, 0)),
                'form_end_date': timezone.make_aware(datetime(2025, 2, 22, 18, 0)),
                'fee_payment_last_date': timezone.make_aware(datetime(2025, 2, 22, 23, 59)),
                'exam_start_date': date(2025, 5, 25),
                'result_date': date(2025, 6, 30),
                'min_age': 21,
                'max_age': 32,
                'eligibility_criteria': 'Bachelor\'s degree from a recognized university',
                'fee_structure': json.dumps({
                    'general': 100,
                    'obc': 100,
                    'sc_st': 0,
                    'female': 0
                }),
                'official_notification_url': 'https://upsc.gov.in/examinations/civil-services-prelims-2025',
                'syllabus_url': 'https://upsc.gov.in/sites/default/files/CSP-2025-Syllabus.pdf'
            }
        )
        
        # SSC Exams
        ssc_cgl, _ = Exam.objects.get_or_create(
            name='SSC CGL Tier-1 2025',
            defaults={
                'description': 'Combined Graduate Level Examination for Group B and C posts',
                'category': 'SSC_CGL',
                'exam_type': 'competitive',
                'difficulty_level': 'medium',
                'organization': org2,
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        ssc_chsl, _ = Exam.objects.get_or_create(
            name='SSC CHSL 2025',
            defaults={
                'description': 'Combined Higher Secondary Level Examination',
                'category': 'SSC_CHSL',
                'exam_type': 'competitive',
                'difficulty_level': 'medium',
                'organization': org2,
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        # Banking Exams
        ibps_po, _ = Exam.objects.get_or_create(
            name='IBPS PO Prelims 2025',
            defaults={
                'description': 'Probationary Officer recruitment examination',
                'category': 'BANK_PO',
                'exam_type': 'competitive',
                'difficulty_level': 'medium',
                'organization': org3,
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        sbi_po, _ = Exam.objects.get_or_create(
            name='SBI PO Prelims 2025',
            defaults={
                'description': 'State Bank of India Probationary Officer examination',
                'category': 'SBI_PO',
                'exam_type': 'competitive',
                'difficulty_level': 'medium',
                'organization': org3,
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        # Engineering Exams
        gate_exam, _ = Exam.objects.get_or_create(
            name='GATE 2025 - Computer Science',
            defaults={
                'description': 'Graduate Aptitude Test in Engineering',
                'category': 'GATE',
                'exam_type': 'entrance',
                'difficulty_level': 'hard',
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        jee_main, _ = Exam.objects.get_or_create(
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
        
        # Medical Exams
        neet_exam, _ = Exam.objects.get_or_create(
            name='NEET UG 2025',
            defaults={
                'description': 'National Eligibility cum Entrance Test for Medical',
                'category': 'NEET',
                'exam_type': 'entrance',
                'difficulty_level': 'hard',
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        # Create Syllabus for UPSC
        self.stdout.write('Creating syllabus...')
        upsc_syllabus, _ = Syllabus.objects.get_or_create(
            exam=upsc_exam,
            defaults={
                'description': 'Complete syllabus for UPSC Civil Services Preliminary Examination',
                'total_marks': 400,
                'exam_pattern': 'Two papers - General Studies (200 marks) and CSAT (200 marks)',
                'estimated_hours': 500,
                'is_active': True,
                'created_by': admin_user
            }
        )
        
        # Create Subjects for this syllabus
        gs_subject = Subject.objects.create(
            syllabus=upsc_syllabus,
            name='General Studies',
            code='GS',
            description='General Studies for UPSC',
            order=1
        )
        
        history_subject = Subject.objects.create(
            syllabus=upsc_syllabus,
            name='Indian History',
            code='HIST',
            description='Indian History topics',
            order=2
        )
        
        # Create Syllabus Nodes (hierarchical structure)
        gs_node = SyllabusNode.objects.create(
            syllabus=upsc_syllabus,
            name='General Studies Paper I',
            description='Complete GS Paper 1 syllabus',
            node_type='module',
            subject=gs_subject,
            order=1,
            estimated_hours=250,
            is_mandatory=True,
            difficulty_level='hard'
        )
        
        # Create sub-nodes
        history_node = SyllabusNode.objects.create(
            syllabus=upsc_syllabus,
            parent=gs_node,
            name='Indian History',
            description='Ancient, Medieval and Modern Indian History',
            node_type='unit',
            subject=history_subject,
            order=1,
            estimated_hours=60,
            is_mandatory=True,
            difficulty_level='medium'
        )
        
        ancient_history = SyllabusNode.objects.create(
            syllabus=upsc_syllabus,
            parent=history_node,
            name='Ancient India',
            description='Indus Valley to Gupta Period',
            node_type='topic',
            subject=history_subject,
            order=1,
            estimated_hours=20,
            is_mandatory=True,
            difficulty_level='medium'
        )
        
        # Create Learning Content
        content1 = LearningContent.objects.create(
            node=ancient_history,
            title='Introduction to Indus Valley Civilization',
            content_type='video',
            content_data=json.dumps({
                'video_url': 'https://example.com/video1',
                'duration': 45,
                'transcript': 'Sample transcript...'
            }),
            estimated_duration_minutes=45,
            difficulty_level='easy',
            prerequisites=json.dumps([]),
            learning_objectives=json.dumps([
                'Understand the discovery of IVC',
                'Learn about major sites',
                'Understand town planning'
            ]),
            is_published=True,
            created_by=admin_user
        )
        
        # Create Tests for each exam
        self.stdout.write('Creating tests...')
        
        # UPSC Tests
        upsc_test1 = Test.objects.create(
            exam=upsc_exam,
            title='UPSC Prelims Mock Test 1 - Full Length',
            description='Complete mock test covering entire UPSC Prelims syllabus',
            duration_minutes=120,
            total_marks=200,
            pass_percentage=33,
            is_published=True,
            randomize_questions=False,
            show_result_immediately=True,
            allow_review=True,
            max_attempts=3,
            created_by=admin_user
        )
        
        upsc_test2 = Test.objects.create(
            exam=upsc_exam,
            title='Indian History - Practice Test',
            description='Topic-wise test on Ancient and Medieval Indian History',
            duration_minutes=60,
            total_marks=100,
            pass_percentage=40,
            is_published=True,
            randomize_questions=True,
            show_result_immediately=True,
            allow_review=True,
            max_attempts=5,
            created_by=admin_user
        )
        
        # SSC Tests
        ssc_test1 = Test.objects.create(
            exam=ssc_cgl,
            title='SSC CGL Tier-1 Mock Test 1',
            description='Full length mock test for SSC CGL Tier-1',
            duration_minutes=60,
            total_marks=200,
            pass_percentage=30,
            is_published=True,
            randomize_questions=False,
            show_result_immediately=True,
            allow_review=True,
            max_attempts=3,
            created_by=admin_user
        )
        
        # Banking Tests
        bank_test1 = Test.objects.create(
            exam=ibps_po,
            title='IBPS PO Prelims Mock Test 1',
            description='Complete mock test for IBPS PO Preliminary exam',
            duration_minutes=60,
            total_marks=100,
            pass_percentage=40,
            is_published=True,
            randomize_questions=True,
            show_result_immediately=True,
            allow_review=True,
            created_by=admin_user
        )
        
        # JEE Tests
        jee_test1 = Test.objects.create(
            exam=jee_main,
            title='JEE Main Mock Test - Physics',
            description='Subject-wise mock test for JEE Main Physics',
            duration_minutes=60,
            total_marks=120,
            pass_percentage=35,
            is_published=True,
            randomize_questions=False,
            show_result_immediately=True,
            allow_review=True,
            max_attempts=2,
            created_by=admin_user
        )
        
        # Create Test Sections
        self.stdout.write('Creating test sections...')
        
        # UPSC Test Sections
        TestSection.objects.create(
            test=upsc_test1,
            name='General Studies',
            description='Questions from all GS topics',
            order=1
        )
        
        TestSection.objects.create(
            test=upsc_test1,
            name='Current Affairs',
            description='Recent current affairs questions',
            order=2
        )
        
        # SSC Test Sections
        TestSection.objects.create(
            test=ssc_test1,
            name='General Intelligence & Reasoning',
            description='Reasoning and analytical ability',
            order=1
        )
        
        TestSection.objects.create(
            test=ssc_test1,
            name='General Awareness',
            description='Static GK and Current Affairs',
            order=2
        )
        
        TestSection.objects.create(
            test=ssc_test1,
            name='Quantitative Aptitude',
            description='Mathematics and numerical ability',
            order=3
        )
        
        TestSection.objects.create(
            test=ssc_test1,
            name='English Comprehension',
            description='English language skills',
            order=4
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created sample exam data:'))
        self.stdout.write(f'  - {Organization.objects.count()} organizations')
        self.stdout.write(f'  - {Subject.objects.count()} subjects')
        self.stdout.write(f'  - {Exam.objects.count()} exams')
        self.stdout.write(f'  - {Test.objects.count()} tests')
        self.stdout.write(f'  - {TestSection.objects.count()} test sections')
        self.stdout.write(f'  - {Syllabus.objects.count()} syllabi')
        self.stdout.write(f'  - {SyllabusNode.objects.count()} syllabus nodes')
        self.stdout.write(f'  - {LearningContent.objects.count()} learning content items')