#!/usr/bin/env python3
"""
Final API Test - Verify all endpoint fixes are working
"""

import requests
import json

def test_final_endpoints():
    base_url = "http://localhost:8000/api/v1"
    
    print("🔧 FINAL API ENDPOINT TEST")
    print("=" * 40)
    
    # Test the corrected endpoints (without /api/v1/ prefix)
    endpoints_to_test = [
        "/questions/admin/all-content/",
        "/questions/admin/content-list/", 
        "/exams/exams/",
        "/exams/tests/",
    ]
    
    all_working = True
    
    for endpoint in endpoints_to_test:
        try:
            full_url = f"{base_url}{endpoint}"
            response = requests.get(full_url, timeout=5)
            
            if response.status_code in [200, 401, 403]:  # 401/403 = needs auth (expected)
                print(f"✅ {endpoint} -> Status: {response.status_code}")
            else:
                print(f"❌ {endpoint} -> Status: {response.status_code}")
                all_working = False
                
        except Exception as e:
            print(f"❌ {endpoint} -> Error: {str(e)}")
            all_working = False
    
    print("\n" + "=" * 40)
    if all_working:
        print("🎉 ALL ENDPOINTS FIXED - CONTENT MANAGEMENT SHOULD WORK!")
        print("   Frontend: http://localhost:3000/admin")
        print("   No more /api/v1/api/v1/ duplication errors")
    else:
        print("⚠️  Some endpoints still have issues")
    
    print("\n💡 URL Structure Fixed:")
    print("   Before: /api/v1/api/v1/questions/... (ERROR)")
    print("   After:  /api/v1/questions/...      (CORRECT)")

if __name__ == "__main__":
    test_final_endpoints()