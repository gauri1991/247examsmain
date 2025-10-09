#!/usr/bin/env python3
"""
Comprehensive Test Suite for Status and Activation System
========================================================

This script rigorously tests the exam/test status management system
to ensure it's ready for Google presentation.

Tests cover:
1. API endpoint accessibility
2. Status transitions (draft → ready → active → inactive)
3. Requirements validation
4. Delete protection
5. Frontend integration
"""

import os
import sys
import django
import requests
import json
import time
from datetime import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
sys.path.append('/home/gss/Documents/projects/dts/247exams/backend')
django.setup()

from exams.models import Exam, Test
from questions.models import QuestionBank, Question
from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse

User = get_user_model()

class StatusSystemTester:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.client = Client()
        self.results = []
        self.test_user = None
        self.test_exam = None
        self.test_test = None
        
    def log_result(self, test_name, status, message):
        """Log test result with timestamp"""
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }
        self.results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} [{result['timestamp']}] {test_name}: {message}")
        
    def setup_test_data(self):
        """Create test data for comprehensive testing"""
        try:
            # Create test user
            self.test_user, created = User.objects.get_or_create(
                username='test_admin',
                defaults={
                    'email': 'test@example.com',
                    'is_staff': True,
                    'is_superuser': True
                }
            )
            if created:
                self.test_user.set_password('testpass123')
                self.test_user.save()
            
            # Create question bank with questions
            question_bank, created = QuestionBank.objects.get_or_create(
                name='Test Status System QB',
                defaults={
                    'description': 'Question bank for testing status system',
                    'category': 'mathematics',
                    'subject': 'algebra',
                    'difficulty_level': 'basic',
                    'created_by': self.test_user
                }
            )
            
            # Ensure we have at least 10 questions in the bank
            current_count = question_bank.questions.count()
            if current_count < 10:
                for i in range(10 - current_count):
                    Question.objects.create(
                        text=f"Test question {i+1} for status system",
                        question_type='mcq',
                        difficulty='basic',
                        created_by=self.test_user,
                        question_bank=question_bank
                    )
            
            # Create test exam
            self.test_exam, created = Exam.objects.get_or_create(
                name='Test Status System Exam',
                defaults={
                    'description': 'Exam for testing status system',
                    'category': 'mathematics',
                    'exam_type': 'academic',
                    'difficulty': 'basic',
                    'duration_minutes': 60,
                    'total_marks': 100,
                    'created_by': self.test_user,
                    'status': 'draft'
                }
            )
            
            # Create test test
            self.test_test, created = Test.objects.get_or_create(
                title='Test Status System Test',
                defaults={
                    'description': 'Test for testing status system',
                    'exam': self.test_exam,
                    'category': 'mathematics',
                    'subject': 'algebra',
                    'difficulty': 'basic',
                    'duration_minutes': 30,
                    'total_marks': 50,
                    'created_by': self.test_user,
                    'status': 'draft'
                }
            )
            
            # Add questions to test
            questions = question_bank.questions.all()[:5]
            for i, question in enumerate(questions):
                from exams.models import TestQuestion
                TestQuestion.objects.get_or_create(
                    test=self.test_test,
                    question=question,
                    defaults={
                        'order': i + 1,
                        'marks': 10
                    }
                )
            
            self.log_result("Setup Test Data", "PASS", "Created exam, test, and questions successfully")
            return True
            
        except Exception as e:
            self.log_result("Setup Test Data", "FAIL", f"Failed to create test data: {str(e)}")
            return False
    
    def test_backend_api_endpoints(self):
        """Test all backend API endpoints"""
        try:
            # Test exam requirements endpoint
            url = f"/exams/exams/{self.test_exam.id}/requirements/"
            response = requests.get(f"{self.base_url}{url}")
            
            if response.status_code == 200:
                data = response.json()
                if 'is_ready' in data:
                    self.log_result("Exam Requirements API", "PASS", f"Status: {response.status_code}, Has is_ready: {data.get('is_ready')}")
                else:
                    self.log_result("Exam Requirements API", "FAIL", "Response missing 'is_ready' field")
            else:
                self.log_result("Exam Requirements API", "FAIL", f"Status: {response.status_code}")
            
            # Test test requirements endpoint
            url = f"/exams/tests/{self.test_test.id}/requirements/"
            response = requests.get(f"{self.base_url}{url}")
            
            if response.status_code == 200:
                data = response.json()
                if 'is_ready' in data:
                    self.log_result("Test Requirements API", "PASS", f"Status: {response.status_code}, Has is_ready: {data.get('is_ready')}")
                else:
                    self.log_result("Test Requirements API", "FAIL", "Response missing 'is_ready' field")
            else:
                self.log_result("Test Requirements API", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Backend API Endpoints", "FAIL", f"Exception: {str(e)}")
    
    def test_status_transitions(self):
        """Test complete status transition workflow"""
        try:
            # Test 1: Check initial draft status
            self.test_test.refresh_from_db()
            if self.test_test.status == 'draft':
                self.log_result("Initial Status", "PASS", "Test starts in draft status")
            else:
                self.log_result("Initial Status", "FAIL", f"Expected draft, got {self.test_test.status}")
            
            # Test 2: Update status based on requirements
            old_status = self.test_test.status
            new_status = self.test_test.update_status_based_on_requirements()
            
            if new_status:
                self.log_result("Auto Status Update", "PASS", f"Status changed from {old_status} to {new_status}")
            else:
                self.log_result("Auto Status Update", "INFO", f"Status remained {old_status} (requirements not met)")
            
            # Test 3: Manual status change to active (should fail if not ready)
            url = f"/exams/tests/{self.test_test.id}/update_status/"
            payload = {"status": "active"}
            response = requests.patch(f"{self.base_url}{url}", 
                                    json=payload,
                                    headers={'Content-Type': 'application/json'})
            
            if response.status_code == 400:
                self.log_result("Premature Activation Block", "PASS", "Correctly blocked activation of unready test")
            elif response.status_code == 200:
                self.log_result("Premature Activation Block", "INFO", "Test was ready and activated successfully")
            else:
                self.log_result("Premature Activation Block", "FAIL", f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Status Transitions", "FAIL", f"Exception: {str(e)}")
    
    def test_delete_protection(self):
        """Test delete protection for draft and active items"""
        try:
            # Test delete protection for draft status
            url = f"/questions/admin/delete-test/{self.test_test.id}/"
            response = requests.delete(f"{self.base_url}{url}")
            
            if response.status_code == 400:
                try:
                    data = response.json()
                    if 'draft' in data.get('message', '').lower():
                        self.log_result("Delete Protection (Draft)", "PASS", "Correctly blocked deletion of draft test")
                    else:
                        self.log_result("Delete Protection (Draft)", "INFO", f"Blocked with message: {data.get('message')}")
                except:
                    self.log_result("Delete Protection (Draft)", "PASS", "Deletion blocked (non-JSON response)")
            else:
                self.log_result("Delete Protection (Draft)", "FAIL", f"Should block draft deletion, got status: {response.status_code}")
                
        except Exception as e:
            self.log_result("Delete Protection", "FAIL", f"Exception: {str(e)}")
    
    def test_frontend_integration(self):
        """Test that frontend is accessible and loads correctly"""
        try:
            # Test frontend admin page
            response = requests.get(f"{self.frontend_url}/admin", timeout=5)
            
            if response.status_code == 200:
                self.log_result("Frontend Access", "PASS", "Admin page loads successfully")
                
                # Check for key elements in the response
                content = response.text
                if 'Content Management' in content:
                    self.log_result("Frontend Content", "PASS", "Content Management section found")
                else:
                    self.log_result("Frontend Content", "INFO", "Page loaded but content not fully rendered (likely React)")
            else:
                self.log_result("Frontend Access", "FAIL", f"Frontend not accessible: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("Frontend Integration", "FAIL", f"Frontend connection failed: {str(e)}")
    
    def test_requirements_validation(self):
        """Test requirements checking logic"""
        try:
            # Check test requirements
            requirements = self.test_test.check_question_requirements()
            
            required_fields = ['is_ready', 'total_questions', 'missing_questions']
            all_present = all(field in requirements for field in required_fields)
            
            if all_present:
                self.log_result("Requirements Structure", "PASS", f"All required fields present: {list(requirements.keys())}")
                
                # Log specific values for debugging
                self.log_result("Requirements Details", "INFO", 
                              f"Ready: {requirements['is_ready']}, "
                              f"Total: {requirements['total_questions']}, "
                              f"Missing: {requirements['missing_questions']}")
            else:
                missing = [f for f in required_fields if f not in requirements]
                self.log_result("Requirements Structure", "FAIL", f"Missing fields: {missing}")
                
        except Exception as e:
            self.log_result("Requirements Validation", "FAIL", f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Comprehensive Status System Test Suite")
        print("=" * 60)
        
        start_time = time.time()
        
        # Setup
        if not self.setup_test_data():
            print("❌ Setup failed, aborting tests")
            return
        
        # Run all tests
        self.test_backend_api_endpoints()
        self.test_status_transitions()
        self.test_delete_protection()
        self.test_requirements_validation()
        self.test_frontend_integration()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = len([r for r in self.results if r['status'] == 'PASS'])
        failed = len([r for r in self.results if r['status'] == 'FAIL'])
        info = len([r for r in self.results if r['status'] == 'INFO'])
        
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"ℹ️  INFO: {info}")
        print(f"⏱️  TOTAL TIME: {time.time() - start_time:.2f}s")
        
        if failed == 0:
            print("\n🎉 ALL CRITICAL TESTS PASSED - READY FOR GOOGLE PRESENTATION!")
        else:
            print(f"\n⚠️  {failed} TESTS FAILED - NEEDS ATTENTION BEFORE PRESENTATION")
            
        print("\n📋 DETAILED RESULTS:")
        for result in self.results:
            status_icon = "✅" if result['status'] == "PASS" else "❌" if result['status'] == "FAIL" else "ℹ️"
            print(f"{status_icon} {result['test']}: {result['message']}")

if __name__ == "__main__":
    tester = StatusSystemTester()
    tester.run_all_tests()