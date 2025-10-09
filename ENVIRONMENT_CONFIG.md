# Environment Configuration Guide

This guide explains how to configure the 247exams application for different environments.

## 📁 Environment Files Structure

```
247exams/
├── .env                           # Docker Compose variables (ignored by git)
├── .env.example                   # Docker Compose template (tracked)
├── backend/
│   ├── .env                       # Local development (ignored by git)
│   ├── .env.example              # Template (tracked)
│   └── .env.production           # Production template (tracked)
└── frontend/
    ├── .env.local                # Local development (ignored by git)
    ├── .env.example              # Template (tracked)
    └── .env.production           # Production template (tracked)
```

## 🚀 Quick Start

### Local Development (Without Docker)

1. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your local settings
   python manage.py runserver
   ```

   Default backend runs at: `http://127.0.0.1:8000`

2. **Frontend Setup:**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local - should point to backend
   npm run dev
   ```

   Default frontend runs at: `http://localhost:3000`

### Local Development (With Docker)

1. **Setup Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Docker settings
   ```

2. **Start Services:**
   ```bash
   docker-compose up --build
   ```

   Access application at: `http://localhost`

## 🔧 Configuration Details

### Backend Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Generate with: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'` |
| `DEBUG` | Debug mode | `True` (dev) / `False` (prod) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1,247exams.com` |
| `DB_ENGINE` | Database engine | `django.db.backends.sqlite3` (dev) / `django.db.backends.postgresql` (prod) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000,https://247exams.com` |

#### Database Variables (PostgreSQL)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | Database name | `247exams` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your-secure-password` |
| `DB_HOST` | Database host | `localhost` (dev) / `db` (docker) / host (prod) |
| `DB_PORT` | Database port | `5432` |

### Frontend Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | See table below |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `https://247exams.com` |
| `NODE_ENV` | Node environment | `development` / `production` |

#### API URL by Environment

| Environment | API URL | Notes |
|-------------|---------|-------|
| **Local Dev (no Docker)** | `http://127.0.0.1:8000/api/v1` | Direct backend connection |
| **Local Docker** | `http://localhost/api/v1` | Through nginx proxy |
| **Production** | `https://247exams.com/api/v1` | Through nginx proxy (NO port number!) |

## 🌍 Environment Configurations

### Development Environment (backend/.env)

```bash
SECRET_KEY=dev-django-insecure-+jgjj18+!qeldfo@i96h=jm2c7dkj194*nq16_le$obs75so+2
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,192.168.29.81

DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECURE_SSL_REDIRECT=False
```

### Development Environment (frontend/.env.local)

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

### Production Environment (backend/.env.production)

**⚠️ IMPORTANT:** Update these values before deploying:

```bash
SECRET_KEY=your-very-secure-production-secret-key-here  # CHANGE THIS!
DEBUG=False
ALLOWED_HOSTS=247exams.com,www.247exams.com,localhost,127.0.0.1

DB_ENGINE=django.db.backends.postgresql
DB_NAME=247exams
DB_USER=postgres
DB_PASSWORD=SecurePass247$2024  # CHANGE THIS!
DB_HOST=portal247exams-db-9p4xbu  # Your production DB host
DB_PORT=5432

CORS_ALLOWED_ORIGINS=https://247exams.com,https://www.247exams.com
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
CORS_ALLOW_CREDENTIALS=True
```

### Production Environment (frontend/.env.production)

```bash
# ✅ CORRECT - Routes through nginx proxy
NEXT_PUBLIC_API_URL=https://247exams.com/api/v1

# ❌ WRONG - Don't expose backend port
# NEXT_PUBLIC_API_URL=https://247exams.com:8000/api/v1

NEXT_PUBLIC_APP_URL=https://247exams.com
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🐳 Docker Compose Environment (.env)

```bash
# Django Configuration
SECRET_KEY=docker-dev-secret-key-change-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DB_NAME=247exams
DB_USER=postgres
DB_PASSWORD=dev_postgres_password_123

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost/api/v1  # Through nginx
```

## 🔒 Security Checklist for Production

Before deploying to production, ensure:

- [ ] `SECRET_KEY` is changed to a secure random string
- [ ] `DEBUG` is set to `False`
- [ ] `DB_PASSWORD` is changed to a strong password
- [ ] `ALLOWED_HOSTS` includes only your production domains
- [ ] `CORS_ALLOWED_ORIGINS` includes only your production domains
- [ ] Frontend `NEXT_PUBLIC_API_URL` does NOT include port numbers
- [ ] `SECURE_SSL_REDIRECT` is set to `True`
- [ ] SSL certificates are properly configured in nginx
- [ ] Database backups are configured
- [ ] Email settings are configured (if using email features)

## 🚨 Common Issues

### Issue: "CORS policy" error on mobile/production

**Cause:** Frontend is using `https://247exams.com:8000/api/v1` instead of `https://247exams.com/api/v1`

**Solution:** Remove the port from `NEXT_PUBLIC_API_URL` in production. The nginx proxy handles routing.

### Issue: Frontend can't connect to backend in Docker

**Cause:** Using `http://localhost:8000` instead of `http://localhost/api/v1`

**Solution:** When running in Docker, nginx proxies all `/api/` requests to the backend. Use `http://localhost/api/v1`.

### Issue: Database connection failed in production

**Cause:** Database environment variables not set correctly

**Solution:** Verify `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` match your production database settings.

## 📝 Notes

1. **Never commit `.env` files with sensitive data** - They are ignored by git
2. **Production `.env.production` files are templates** - Update values before deployment
3. **API URL routing:**
   - Local dev: Direct to backend port (`http://127.0.0.1:8000`)
   - Docker/Production: Through nginx proxy (no port in URL)
4. **CORS configuration must match frontend origin exactly** including protocol (http/https)

## 🔗 Related Files

- `docker-compose.yml` - Docker orchestration
- `nginx/nginx.conf` - Nginx reverse proxy configuration
- `backend/exam_api/settings.py` - Django settings (reads from .env)
- `.gitignore` - Controls which files are tracked

## 📞 Support

If you encounter issues with environment configuration:

1. Check that all required variables are set
2. Verify URLs match the environment (local/docker/production)
3. Review the Common Issues section above
4. Check logs: `docker-compose logs backend` or `docker-compose logs frontend`
