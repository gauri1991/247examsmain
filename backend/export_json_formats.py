#!/usr/bin/env python3

import os
import django
import sys
import json
from datetime import datetime

# Setup Django
sys.path.append('/home/gss/Documents/projects/dts/247exams/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

from questions.models import QuestionBank, Question, QuestionOption
from exams.models import Exam, Test, Organization

def export_question_bank_format():
    """Export question bank format with real data"""
    question_bank = QuestionBank.objects.first()
    if not question_bank:
        # Create a comprehensive sample format
        return {
            "question_bank": {
                "id": "sample-uuid-here",
                "name": "Sample Mathematics Question Bank",
                "description": "Comprehensive mathematics questions for competitive exams",
                "category": "mathematics",
                "exam_type": "ssc",
                "organization": "Staff Selection Commission",
                "year": 2024,
                "subject": "Mathematics",
                "topic": "Arithmetic",
                "subtopic": "Percentage",
                "difficulty_level": "intermediate", 
                "target_audience": "competitive_exam",
                "language": "english",
                "state_specific": "",
                "tags": ["percentage", "arithmetic", "basic_math"],
                "custom_fields": {
                    "exam_pattern": "tier_1",
                    "marks_per_question": 2,
                    "negative_marking": 0.5
                },
                "question_types_included": ["mcq", "mathematical_calculation"],
                "is_public": False,
                "is_featured": True,
                "default_difficulty": "intermediate",
                "default_marks": 1.0,
                "default_time_per_question": 60,
                "questions": []
            }
        }
    
    # Get real questions for this bank
    questions = Question.objects.filter(question_bank=question_bank)[:5]
    
    question_data = []
    for q in questions:
        options = []
        for opt in q.options.all():
            options.append({
                "option_text": opt.option_text,
                "is_correct": opt.is_correct,
                "order": opt.order
            })
        
        question_data.append({
            "id": str(q.id),
            "question_text": q.question_text,
            "question_type": q.question_type,
            "difficulty": q.difficulty,
            "marks": float(q.marks),
            "negative_marks": float(q.negative_marks),
            "time_limit": q.time_limit,
            "topic": q.topic,
            "subtopic": q.subtopic,
            "explanation": q.explanation,
            "tags": q.tags,
            "options": options,
            "correct_answers": q.correct_answers,
            "case_sensitive": q.case_sensitive,
            "expected_answer": q.expected_answer,
            "min_words": q.min_words,
            "max_words": q.max_words,
            "image": q.image.url if q.image else None
        })
    
    return {
        "question_bank": {
            "id": str(question_bank.id),
            "name": question_bank.name,
            "description": question_bank.description,
            "category": question_bank.category,
            "exam_type": question_bank.exam_type,
            "organization": question_bank.organization,
            "year": question_bank.year,
            "subject": question_bank.subject,
            "topic": question_bank.topic,
            "subtopic": question_bank.subtopic,
            "difficulty_level": question_bank.difficulty_level,
            "target_audience": question_bank.target_audience,
            "language": question_bank.language,
            "state_specific": question_bank.state_specific,
            "tags": question_bank.tags,
            "custom_fields": question_bank.custom_fields,
            "question_types_included": question_bank.question_types_included,
            "is_public": question_bank.is_public,
            "is_featured": question_bank.is_featured,
            "default_difficulty": question_bank.default_difficulty,
            "default_marks": float(question_bank.default_marks),
            "default_time_per_question": question_bank.default_time_per_question,
            "total_questions": question_bank.total_questions,
            "questions": question_data
        }
    }

def export_exam_format():
    """Export exam format with real data"""
    exam = Exam.objects.first()
    if not exam:
        return {
            "exam": {
                "id": "sample-uuid-here",
                "name": "Sample SSC CGL Examination",
                "description": "Staff Selection Commission Combined Graduate Level Examination",
                "organization": {
                    "id": "org-uuid",
                    "name": "Staff Selection Commission",
                    "short_name": "SSC",
                    "organization_type": "government"
                },
                "category": "general_knowledge",
                "exam_type": "ssc",
                "subject": "General Studies",
                "topic": "Comprehensive",
                "subtopic": "All Topics",
                "difficulty_level": "intermediate",
                "target_audience": "competitive_exam",
                "language": "english",
                "state_specific": "",
                "year": 2024,
                "tags": ["ssc", "cgl", "government_exam"],
                "custom_fields": {
                    "tier": "tier_1",
                    "total_posts": 5000,
                    "application_fee": 200
                },
                "status": "ready",
                "is_active": True,
                "is_featured": True,
                "tests": []
            }
        }
    
    # Get real tests for this exam
    tests = Test.objects.filter(exam=exam)[:3]
    test_data = []
    
    for test in tests:
        test_data.append({
            "id": str(test.id),
            "title": test.title,
            "description": test.description,
            "duration_minutes": test.duration_minutes,
            "total_marks": test.total_marks,
            "pass_percentage": float(test.pass_percentage),
            "status": test.status,
            "is_published": test.is_published,
            "randomize_questions": test.randomize_questions,
            "show_result_immediately": test.show_result_immediately,
            "allow_review": test.allow_review,
            "max_attempts": test.max_attempts,
            "start_time": test.start_time.isoformat() if test.start_time else None,
            "end_time": test.end_time.isoformat() if test.end_time else None,
            "question_selection": {
                "mode": "rule_based",
                "total_questions": 100,
                "question_banks": ["bank-id-1", "bank-id-2"],
                "difficulty_distribution": {
                    "basic": 30,
                    "intermediate": 50,
                    "advanced": 20
                },
                "category_distribution": {
                    "mathematics": 25,
                    "reasoning": 25,
                    "english": 25,
                    "general_knowledge": 25
                }
            }
        })
    
    return {
        "exam": {
            "id": str(exam.id),
            "name": exam.name,
            "description": exam.description,
            "organization": {
                "id": str(exam.organization.id) if exam.organization else None,
                "name": exam.organization.name if exam.organization else None,
                "short_name": exam.organization.short_name if exam.organization else None,
                "organization_type": exam.organization.organization_type if exam.organization else None
            },
            "category": exam.category,
            "exam_type": exam.exam_type,
            "subject": exam.subject,
            "topic": exam.topic,
            "subtopic": exam.subtopic,
            "difficulty_level": exam.difficulty_level,
            "target_audience": exam.target_audience,
            "language": exam.language,
            "state_specific": exam.state_specific,
            "year": exam.year,
            "tags": exam.tags,
            "custom_fields": exam.custom_fields,
            "status": exam.status,
            "is_active": exam.is_active,
            "is_featured": exam.is_featured,
            "tests": test_data
        }
    }

def export_test_format():
    """Export test format with real data"""
    test = Test.objects.first()
    if not test:
        return {
            "test": {
                "id": "sample-uuid-here",
                "exam_id": "parent-exam-uuid",
                "title": "Sample Mathematics Test",
                "description": "Basic mathematics test covering arithmetic and algebra",
                "duration_minutes": 120,
                "total_marks": 100,
                "pass_percentage": 40.0,
                "status": "ready",
                "is_published": False,
                "randomize_questions": True,
                "show_result_immediately": True,
                "allow_review": True,
                "max_attempts": 3,
                "start_time": None,
                "end_time": None,
                "question_selection": {
                    "mode": "rule_based",
                    "total_questions": 50,
                    "question_banks": ["bank-id-1", "bank-id-2"],
                    "difficulty_distribution": {
                        "basic": 20,
                        "intermediate": 60,
                        "advanced": 20
                    },
                    "category_distribution": {
                        "arithmetic": 30,
                        "algebra": 30,
                        "geometry": 40
                    },
                    "question_type_distribution": {
                        "mcq": 80,
                        "fill_blank": 20
                    }
                },
                "sections": []
            }
        }
    
    return {
        "test": {
            "id": str(test.id),
            "exam_id": str(test.exam.id),
            "title": test.title,
            "description": test.description,
            "duration_minutes": test.duration_minutes,
            "total_marks": test.total_marks,
            "pass_percentage": float(test.pass_percentage),
            "status": test.status,
            "is_published": test.is_published,
            "randomize_questions": test.randomize_questions,
            "show_result_immediately": test.show_result_immediately,
            "allow_review": test.allow_review,
            "max_attempts": test.max_attempts,
            "start_time": test.start_time.isoformat() if test.start_time else None,
            "end_time": test.end_time.isoformat() if test.end_time else None,
            "question_selection": {
                "mode": "rule_based",
                "total_questions": 50,
                "question_banks": [],  # Would be filled from TestQuestionBank relationships
                "difficulty_distribution": {
                    "basic": 30,
                    "intermediate": 50,
                    "advanced": 20
                },
                "category_distribution": {
                    "mathematics": 100
                }
            },
            "sections": [
                {
                    "id": str(section.id),
                    "name": section.name,
                    "description": section.description,
                    "order": section.order
                } for section in test.sections.all()
            ]
        }
    }

def main():
    """Export all JSON formats"""
    export_dir = "/home/gss/Documents/projects/dts/247exams/export_data"
    
    # Question Bank Format
    qb_format = export_question_bank_format()
    with open(f"{export_dir}/question_bank_format.json", "w", encoding="utf-8") as f:
        json.dump(qb_format, f, indent=2, ensure_ascii=False)
    
    # Exam Format  
    exam_format = export_exam_format()
    with open(f"{export_dir}/exam_format.json", "w", encoding="utf-8") as f:
        json.dump(exam_format, f, indent=2, ensure_ascii=False)
    
    # Test Format
    test_format = export_test_format()
    with open(f"{export_dir}/test_format.json", "w", encoding="utf-8") as f:
        json.dump(test_format, f, indent=2, ensure_ascii=False)
    
    # Combined format showing relationships
    combined_format = {
        "export_info": {
            "generated_at": datetime.now().isoformat(),
            "version": "1.0",
            "description": "247exams JSON format specifications for external content creation"
        },
        "question_bank": qb_format["question_bank"],
        "exam": exam_format["exam"], 
        "test": test_format["test"]
    }
    
    with open(f"{export_dir}/combined_format.json", "w", encoding="utf-8") as f:
        json.dump(combined_format, f, indent=2, ensure_ascii=False)
    
    print(f"✅ JSON formats exported to {export_dir}/")
    print("Files created:")
    print("- question_bank_format.json")
    print("- exam_format.json") 
    print("- test_format.json")
    print("- combined_format.json")

if __name__ == "__main__":
    main()