#!/usr/bin/env python
import os
import django
import json
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from exams.models import Exam
from django.contrib.auth import get_user_model

User = get_user_model()

# Get or create a user for the exams
try:
    admin_user = User.objects.get(email='admin@247exams.com')
except User.DoesNotExist:
    admin_user = User.objects.create_user(
        email='admin@247exams.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        role='admin'
    )

# Load the exported data
with open('exams_export.json', 'r') as f:
    exam_data = json.load(f)

# Clear existing exams
Exam.objects.all().delete()

# Category mapping from original data to our choices
CATEGORY_MAPPING = {
    'Banking': 'banking',
    'Civil Services': 'general_knowledge',
    'Clerical': 'general_knowledge', 
    'Defence': 'general_knowledge',
    'Engineering': 'engineering',
    'Finance': 'commerce',
    'Forest Service': 'general_knowledge',
    'Government Jobs': 'general_knowledge',
    'Insurance': 'commerce',
    'Management': 'business_studies',
    'Medical': 'medical',
    'Nursing': 'medical',
    'Police': 'general_knowledge',
    'Railway': 'general_knowledge',
    'Research': 'general_knowledge',
    'Scholarship': 'general_knowledge',
    'Security': 'general_knowledge',
    'Teaching': 'general_knowledge',
    'Technical': 'engineering',
    'University Admission': 'general_knowledge',
    'asdasd': 'other',
    'engineering': 'engineering',
    'general': 'general_knowledge',
}

EXAM_TYPE_MAPPING = {
    'other': 'other',
    '': 'other',
    None: 'other'
}

# Import exams
imported_count = 0
for exam_info in exam_data:
    try:
        # Map categories and exam types
        original_category = exam_info.get('category', '')
        mapped_category = CATEGORY_MAPPING.get(original_category, 'other')
        
        original_exam_type = exam_info.get('exam_type', '')
        mapped_exam_type = EXAM_TYPE_MAPPING.get(original_exam_type, 'other')
        
        # Determine proper exam type based on exam name
        exam_name = exam_info['name'].lower()
        if 'upsc' in exam_name or 'civil service' in exam_name:
            mapped_exam_type = 'upsc'
        elif 'ssc' in exam_name:
            mapped_exam_type = 'ssc'
        elif 'bank' in exam_name or 'sbi' in exam_name or 'ibps' in exam_name:
            mapped_exam_type = 'banking'
        elif 'railway' in exam_name or 'rrb' in exam_name:
            mapped_exam_type = 'railway'
        elif 'nda' in exam_name or 'cds' in exam_name or 'afcat' in exam_name or 'defence' in exam_name:
            mapped_exam_type = 'defense'
        elif 'gate' in exam_name:
            mapped_exam_type = 'engineering'
        elif 'neet' in exam_name or 'aiims' in exam_name or 'medical' in exam_name:
            mapped_exam_type = 'medical'
        elif 'cat' in exam_name or 'mat' in exam_name or 'xat' in exam_name or 'management' in exam_name or 'cmat' in exam_name:
            mapped_exam_type = 'management'
        elif 'clat' in exam_name or 'lsat' in exam_name or 'law' in exam_name:
            mapped_exam_type = 'law'
        elif 'net' in exam_name or 'tet' in exam_name or 'ctet' in exam_name or 'teaching' in exam_name:
            mapped_exam_type = 'teaching'
        elif 'police' in exam_name:
            mapped_exam_type = 'police'
        elif 'insurance' in exam_name or 'lic' in exam_name or 'gic' in exam_name:
            mapped_exam_type = 'insurance'
        elif 'judiciary' in exam_name or 'judicial' in exam_name:
            mapped_exam_type = 'judiciary'
        elif 'psc' in exam_name:
            mapped_exam_type = 'state_psc'
        
        exam = Exam.objects.create(
            name=exam_info['name'],
            description=exam_info['description'] or f"Comprehensive preparation for {exam_info['name']}",
            category=mapped_category,
            exam_type=mapped_exam_type,
            difficulty_level=exam_info.get('difficulty_level', 'intermediate'),
            target_audience=exam_info.get('target_audience', 'competitive_exam'),
            language=exam_info.get('language', 'english'),
            state_specific=exam_info.get('state_specific', ''),
            tags=exam_info.get('tags', []),
            year=exam_info.get('year'),
            is_active=exam_info.get('is_active', True),
            is_featured=exam_info.get('is_featured', False),
            created_by=admin_user
        )
        imported_count += 1
        print(f"✓ Imported: {exam.name} (Category: {mapped_category}, Type: {mapped_exam_type})")
        
    except Exception as e:
        print(f"✗ Failed to import {exam_info.get('name', 'Unknown')}: {e}")

print(f"\n🎉 Successfully imported {imported_count} out of {len(exam_data)} exams!")

# Print summary
print(f"\nExam Type Distribution:")
type_counts = {}
for exam in Exam.objects.all():
    type_counts[exam.exam_type] = type_counts.get(exam.exam_type, 0) + 1

for exam_type, count in sorted(type_counts.items()):
    print(f"  {exam_type}: {count}")