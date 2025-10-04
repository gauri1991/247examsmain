# 247Exams Production Deployment Guide

## PostgreSQL Migration from SQLite

### 🚀 Ready for Production Deployment

The application has been fully tested and is ready for PostgreSQL deployment.

### Prerequisites

1. **PostgreSQL Database**
   - PostgreSQL 12+ installed and running
   - Database created: `247exams`
   - User with full permissions to the database

2. **Environment Variables**
   Set the following environment variables in production:

   ```bash
   # Database Configuration
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=247exams
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost  # or your database host
   DB_PORT=5432

   # Security Settings (for production)
   DEBUG=False
   SECRET_KEY=your_super_secret_key_here
   ALLOWED_HOSTS=your-domain.com,www.your-domain.com
   
   # SSL Settings (recommended for production)
   SECURE_SSL_REDIRECT=True
   SECURE_HSTS_SECONDS=31536000
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   ```

### Deployment Steps

#### 1. Backend Deployment

```bash
# Clone the repository
git clone <your-repo-url>
cd 247exams/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env file or set in your deployment platform)
export DB_ENGINE=django.db.backends.postgresql
export DB_NAME=247exams
export DB_USER=your_user
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432

# Run database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run the server (for testing)
python manage.py runserver
```

#### 2. Frontend Deployment

```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Migration Verification ✅

**Database Compatibility:**
- ✅ PostgreSQL driver (`psycopg2-binary==2.9.9`) included in requirements.txt
- ✅ Database settings configured for PostgreSQL with environment variables
- ✅ All migrations are PostgreSQL compatible
- ✅ UUID fields properly configured for PostgreSQL
- ✅ No SQLite-specific features used

**Recent Migrations:**
- ✅ `users/0003_user_is_active_subscriber_user_subscription_end_and_more.py`
- ✅ All exam and question models migrations
- ✅ Analytics and payment models migrations

**Application Features Tested:**
- ✅ User authentication (mobile + password)
- ✅ Test timer synchronization with server-side validation
- ✅ Complete exam taking interface with CBT format
- ✅ Auto-save functionality
- ✅ Results calculation and display
- ✅ Dashboard statistics
- ✅ Subscription management

### Performance Optimizations

The application includes:
- Database query optimization with `select_related` and `prefetch_related`
- Pagination for large datasets
- Proper indexing on foreign keys and frequently queried fields
- Efficient serializers with read-only fields
- Compressed static files with WhiteNoise

### Security Features

- ✅ Server-side timer validation (30-second grace period)
- ✅ Anti-cheat measures (fullscreen enforcement, keyboard blocking)
- ✅ CSRF protection
- ✅ JWT authentication with refresh tokens
- ✅ Input validation and sanitization
- ✅ SQL injection protection via Django ORM

### Monitoring & Maintenance

1. **Database Backups**
   ```bash
   # Create backup
   pg_dump 247exams > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # Restore backup
   psql 247exams < backup_file.sql
   ```

2. **Log Monitoring**
   - Monitor Django logs for errors
   - Set up log rotation
   - Monitor database performance

3. **Regular Maintenance**
   ```bash
   # Update dependencies
   pip install -r requirements.txt --upgrade
   
   # Run new migrations
   python manage.py migrate
   
   # Clear expired sessions
   python manage.py clearsessions
   ```

### Troubleshooting

**Common Issues:**

1. **Migration Errors**
   ```bash
   # If migrations fail, check database connection
   python manage.py dbshell
   
   # Fake migrations if needed (only if absolutely necessary)
   python manage.py migrate --fake-initial
   ```

2. **Static Files Issues**
   ```bash
   # Clear and recollect static files
   rm -rf staticfiles/
   python manage.py collectstatic --clear
   ```

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check firewall settings
   - Verify database credentials

### Production Checklist ✅

- [x] PostgreSQL compatibility verified
- [x] All migrations created and tested
- [x] Environment variables documented
- [x] Security settings configured
- [x] Static files handling with WhiteNoise
- [x] Error handling and logging
- [x] Performance optimizations implemented
- [x] Timer synchronization working correctly
- [x] Test interface fully functional
- [x] User management system complete

**🎉 The application is ready for production deployment with PostgreSQL!**