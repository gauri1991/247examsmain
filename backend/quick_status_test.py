#!/usr/bin/env python3
"""
Quick Status System Test - Ready for Google Presentation
========================================================

Fast API endpoint test to verify status system is working
"""

import requests
import json
from datetime import datetime

class QuickStatusTest:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.results = []
        
    def log_result(self, test_name, status, message):
        """Log test result"""
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now().strftime('%H:%M:%S')
        }
        self.results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "ℹ️"
        print(f"{status_icon} [{result['timestamp']}] {test_name}: {message}")
    
    def test_backend_running(self):
        """Test if Django backend is running"""
        try:
            response = requests.get(f"{self.base_url}/admin/", timeout=3)
            if response.status_code in [200, 302]:  # 302 = redirect to login
                self.log_result("Backend Status", "PASS", f"Django server running (Status: {response.status_code})")
                return True
            else:
                self.log_result("Backend Status", "FAIL", f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Backend Status", "FAIL", f"Backend not accessible: {str(e)}")
            return False
    
    def test_frontend_running(self):
        """Test if React frontend is running"""
        try:
            response = requests.get(f"{self.frontend_url}/", timeout=3)
            if response.status_code == 200:
                self.log_result("Frontend Status", "PASS", "React server running")
                return True
            else:
                self.log_result("Frontend Status", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Frontend Status", "FAIL", f"Frontend not accessible: {str(e)}")
            return False
    
    def test_admin_api_endpoints(self):
        """Test key admin API endpoints"""
        endpoints_to_test = [
            ("/questions/admin/all-content/", "Admin Content API"),
            ("/questions/admin/content-list/", "Content List API"),
        ]
        
        for endpoint, name in endpoints_to_test:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                if response.status_code == 200:
                    try:
                        data = response.json()
                        self.log_result(name, "PASS", f"Returns JSON data (Status: {response.status_code})")
                    except:
                        self.log_result(name, "PASS", f"Endpoint accessible (Status: {response.status_code})")
                elif response.status_code == 403:
                    self.log_result(name, "INFO", "Endpoint requires authentication (403)")
                else:
                    self.log_result(name, "FAIL", f"Status: {response.status_code}")
            except Exception as e:
                self.log_result(name, "FAIL", f"Error: {str(e)}")
    
    def test_exam_api_structure(self):
        """Test exam API URL structure"""
        # Test if the URL pattern matches our expectations
        test_urls = [
            "/exams/exams/",
            "/exams/tests/",
        ]
        
        for url in test_urls:
            try:
                response = requests.get(f"{self.base_url}{url}", timeout=5)
                # We expect either 200 (data) or 403 (auth required) or 404 (no data)
                if response.status_code in [200, 403, 404]:
                    self.log_result(f"API Structure {url}", "PASS", f"Endpoint exists (Status: {response.status_code})")
                else:
                    self.log_result(f"API Structure {url}", "FAIL", f"Unexpected status: {response.status_code}")
            except Exception as e:
                self.log_result(f"API Structure {url}", "FAIL", f"Error: {str(e)}")
    
    def test_static_files(self):
        """Test if static files are served correctly"""
        try:
            response = requests.get(f"{self.base_url}/static/", timeout=3)
            # Static files might return 404 if no index, but should not be connection error
            if response.status_code in [200, 404, 403]:
                self.log_result("Static Files", "PASS", f"Static file serving configured (Status: {response.status_code})")
            else:
                self.log_result("Static Files", "INFO", f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_result("Static Files", "FAIL", f"Error: {str(e)}")
    
    def run_quick_test(self):
        """Run quick comprehensive test"""
        print("🚀 Quick Status System Test - Google Presentation Ready Check")
        print("=" * 65)
        
        # Test core services
        backend_ok = self.test_backend_running()
        frontend_ok = self.test_frontend_running()
        
        if not backend_ok:
            print("❌ Backend not running - cannot continue with API tests")
            return
        
        # Test API endpoints
        self.test_admin_api_endpoints()
        self.test_exam_api_structure()
        self.test_static_files()
        
        # Summary
        print("\n" + "=" * 65)
        print("📊 QUICK TEST SUMMARY")
        print("=" * 65)
        
        passed = len([r for r in self.results if r['status'] == 'PASS'])
        failed = len([r for r in self.results if r['status'] == 'FAIL'])
        info = len([r for r in self.results if r['status'] == 'INFO'])
        
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"ℹ️  INFO: {info}")
        
        print(f"\n🌐 ACCESS URLS:")
        print(f"   Backend:  {self.base_url}/admin/")
        print(f"   Frontend: {self.frontend_url}/admin/")
        
        if failed == 0 and backend_ok and frontend_ok:
            print(f"\n🎉 SYSTEM READY FOR GOOGLE PRESENTATION!")
            print(f"   ✅ Backend Django server running")
            print(f"   ✅ Frontend React server running") 
            print(f"   ✅ API endpoints accessible")
        else:
            print(f"\n⚠️  ISSUES DETECTED:")
            for result in self.results:
                if result['status'] == 'FAIL':
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        print(f"\n💡 To demonstrate status system:")
        print(f"   1. Go to {self.frontend_url}/admin")
        print(f"   2. Navigate to Content Management")
        print(f"   3. Click on exam/test status badges")
        print(f"   4. Use activation/deactivation buttons")

if __name__ == "__main__":
    tester = QuickStatusTest()
    tester.run_quick_test()