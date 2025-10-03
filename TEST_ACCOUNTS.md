# 247 Exams - Test Accounts

## 🚀 Server Status
- **Frontend**: http://localhost:3000 (Next.js)
- **Backend API**: http://localhost:8000 (Django)
- **Admin Panel**: http://localhost:8000/admin/

## 👥 Test User Accounts

All accounts use the same password: `test123`

### 🎓 Student Account
- **Email**: `student@247exams.com`
- **Password**: `test123`
- **Role**: Student
- **Name**: John Student
- **Phone**: +91 9876543210

### 👨‍🏫 Teacher Account
- **Email**: `teacher@247exams.com`
- **Password**: `test123`
- **Role**: Teacher
- **Name**: Sarah Teacher
- **Phone**: +91 9876543211

### 🔧 Admin Account
- **Email**: `admin@247exams.com`
- **Password**: `test123`
- **Role**: Admin
- **Name**: Admin User
- **Phone**: +91 9876543212
- **Privileges**: Staff + Superuser access

## 🔗 API Endpoints

### Authentication
```bash
# Login
POST http://localhost:8000/api/v1/auth/login/
Content-Type: application/json

{
  "email": "student@247exams.com",
  "password": "test123"
}

# Register new user
POST http://localhost:8000/api/v1/auth/register/
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "newpass123",
  "confirm_password": "newpass123",
  "first_name": "New",
  "last_name": "User",
  "role": "student"
}
```

### User Profile
```bash
# Get profile (requires Authorization header)
GET http://localhost:8000/api/v1/auth/profile/
Authorization: Bearer <access_token>

# Dashboard stats
GET http://localhost:8000/api/v1/auth/dashboard/stats/
Authorization: Bearer <access_token>

# Recent activity
GET http://localhost:8000/api/v1/auth/dashboard/activity/
Authorization: Bearer <access_token>
```

## 🧪 Testing Instructions

1. **Frontend Testing**:
   - Go to http://localhost:3000
   - Click "Sign In"
   - Use any of the test accounts above
   - Test different user roles and their access levels

2. **API Testing**:
   - Use the curl commands provided above
   - Test authentication flows
   - Verify role-based access control

3. **Admin Panel Testing**:
   - Go to http://localhost:8000/admin/
   - Login with admin@247exams.com / test123
   - View and manage all data models

## 📊 Sample Data Available

- **Categories**: UPSC, SSC, Banking, Railway
- **Exams**: 1 UPSC Civil Services Preliminary Exam
- **Questions**: 3 sample questions with multiple choice options
- **Question Bank**: UPSC General Studies

## 🔄 Development Workflow

1. **Start Backend**: `source venv/bin/activate && python manage.py runserver 8000`
2. **Start Frontend**: `npm run dev` (in frontend directory)
3. **Make changes**: Edit code and see live updates
4. **Test**: Use the accounts above for testing

## 🛠️ Useful Commands

```bash
# Backend (Django)
source venv/bin/activate
python manage.py runserver 8000
python manage.py makemigrations
python manage.py migrate
python create_test_users.py

# Frontend (Next.js)
npm run dev
npm run build
npm run start
```

---
✨ **Ready for development and testing!**

===================================================================================

✅ All user passwords have been updated to admin123

  The following 6 users can now login with password admin123:
  - student1 (student@test.com)
  - teacher1 (teacher@test.com)
  - admin1 (admin@test.com)
  - student247 (student@247exams.com)
  - teacher247 (teacher@247exams.com) - Staff user
  - admin247 (admin@247exams.com) - Superuser/Admin