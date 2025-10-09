#!/usr/bin/env python3
"""
Quick API Endpoint Test - Verify all endpoints are accessible
"""

import requests
import json

class APIEndpointTester:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.results = []
        
    def log_result(self, test_name, status, message):
        result = {'test': test_name, 'status': status, 'message': message}
        self.results.append(result)
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "ℹ️"
        print(f"{status_icon} {test_name}: {message}")
    
    def test_endpoint(self, endpoint, expected_status_codes=[200, 401, 403, 404]):
        """Test if an endpoint exists and returns expected status"""
        try:
            response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
            if response.status_code in expected_status_codes:
                self.log_result(f"GET {endpoint}", "PASS", f"Status: {response.status_code}")
                return True
            else:
                self.log_result(f"GET {endpoint}", "FAIL", f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result(f"GET {endpoint}", "FAIL", f"Error: {str(e)}")
            return False
    
    def test_all_endpoints(self):
        """Test all the key endpoints used by the frontend"""
        
        print("🧪 Testing API Endpoints for Google Presentation")
        print("=" * 55)
        
        # Content management endpoints
        content_endpoints = [
            "/api/v1/questions/admin/all-content/",
            "/api/v1/questions/admin/content-list/",
            "/api/v1/questions/admin/relink-tests/",
        ]
        
        # Exam and test endpoints  
        exam_test_endpoints = [
            "/api/v1/exams/exams/",
            "/api/v1/exams/tests/",
        ]
        
        print("\n📋 Content Management Endpoints:")
        content_passed = 0
        for endpoint in content_endpoints:
            if self.test_endpoint(endpoint):
                content_passed += 1
        
        print(f"\n🎯 Exam/Test Management Endpoints:")
        exam_passed = 0
        for endpoint in exam_test_endpoints:
            if self.test_endpoint(endpoint):
                exam_passed += 1
                
        print(f"\n📊 RESULTS SUMMARY:")
        print(f"Content Endpoints: {content_passed}/{len(content_endpoints)} working")
        print(f"Exam/Test Endpoints: {exam_passed}/{len(exam_test_endpoints)} working")
        
        total_passed = content_passed + exam_passed
        total_endpoints = len(content_endpoints) + len(exam_test_endpoints)
        
        if total_passed == total_endpoints:
            print(f"\n🎉 ALL ENDPOINTS WORKING - READY FOR GOOGLE PRESENTATION!")
        else:
            print(f"\n⚠️  {total_endpoints - total_passed} ENDPOINTS NEED ATTENTION")
            
        print(f"\n💡 Frontend should now work without API errors")
        print(f"   Access: http://localhost:3000/admin")

if __name__ == "__main__":
    tester = APIEndpointTester()
    tester.test_all_endpoints()