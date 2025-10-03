# 247 Exams - Exam Portal Application

A comprehensive exam management system built with Django REST Framework and Next.js.

## 🏗️ Architecture

- **Backend**: Django REST Framework with JWT authentication
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: PostgreSQL (SQLite for development)
- **Server**: Gunicorn with Nginx reverse proxy
- **Containerization**: Docker & Docker Compose

## 🚀 Production Deployment on Hostinger VPS with Dokploy

### Prerequisites

1. **Hostinger VPS KVM 2** with Ubuntu
2. **Dokploy** installed on your server
3. **Domain name** pointed to your server IP
4. **GitHub repository**: https://github.com/gauri1991/247examsmain.git

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Dokploy (follow official documentation)
curl -sSL https://dokploy.com/install.sh | sh
```

### Step 2: Environment Configuration

1. **Copy environment template**:
   ```bash
   cp .env.production.example .env.production
   ```

2. **Configure production variables**:
   ```bash
   # Generate a secure secret key
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   
   # Edit .env.production with your values
   nano .env.production
   ```

3. **Required environment variables**:
   - `SECRET_KEY`: Django secret key (generate new one)
   - `DB_PASSWORD`: Secure database password
   - `ALLOWED_HOSTS`: Your domain names
   - `DOMAIN_NAME`: Primary domain
   - `NEXT_PUBLIC_API_URL`: API URL for frontend
   - `CORS_ALLOWED_ORIGINS`: Allowed frontend origins

### Step 3: Dokploy Deployment

1. **Create new project** in Dokploy dashboard
2. **Connect GitHub repository**: `https://github.com/gauri1991/247examsmain.git`
3. **Upload dokploy.json** configuration
4. **Set environment variables** in Dokploy dashboard
5. **Deploy application**

### Step 4: Manual Docker Deployment (Alternative)

```bash
# Clone repository
git clone https://github.com/gauri1991/247examsmain.git
cd 247examsmain

# Configure environment
cp .env.production.example .env.production
# Edit .env.production with your values

# Deploy
chmod +x deploy.sh
./deploy.sh
```

## 🛠️ Local Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
247exams/
├── backend/                 # Django backend
│   ├── exam_api/           # Main Django project
│   ├── core/               # Core app
│   ├── users/              # User management
│   ├── exams/              # Exam management
│   ├── questions/          # Question bank
│   ├── payments/           # Payment processing
│   ├── Dockerfile          # Backend container
│   ├── gunicorn.conf.py    # Gunicorn configuration
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   ├── Dockerfile          # Frontend container
│   └── package.json        # Node dependencies
├── nginx/                  # Nginx configuration
├── docker-compose.yml      # Multi-container setup
├── dokploy.json           # Dokploy configuration
└── deploy.sh              # Deployment script
```

## 🔧 Configuration Files

### Backend Configuration
- `backend/exam_api/settings.py` - Django settings
- `backend/.env` - Environment variables
- `backend/gunicorn.conf.py` - Gunicorn server config

### Frontend Configuration
- `frontend/next.config.ts` - Next.js configuration
- `frontend/.env.local` - Frontend environment

### Infrastructure
- `docker-compose.yml` - Service orchestration
- `nginx/nginx.conf` - Reverse proxy config
- `dokploy.json` - Dokploy deployment config

## 🔒 Security Features

- **Environment-based configuration**
- **JWT authentication**
- **CORS protection**
- **Rate limiting**
- **Security headers**
- **SSL/HTTPS support**
- **Database password encryption**

## 🚀 Production Features

- **Docker containerization**
- **PostgreSQL database**
- **Gunicorn WSGI server**
- **Nginx reverse proxy**
- **Static file serving**
- **Health checks**
- **Logging configuration**
- **Auto-restart policies**

## 📊 Health Checks

- **Backend**: `http://your-domain.com/health/`
- **Frontend**: `http://your-domain.com/api/health`
- **Nginx**: `http://your-domain.com/health`

## 🔄 Deployment Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose up --build -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**:
   ```bash
   docker-compose logs db
   docker-compose exec db pg_isready -U postgres
   ```

2. **Backend errors**:
   ```bash
   docker-compose logs backend
   docker-compose exec backend python manage.py check
   ```

3. **Frontend build issues**:
   ```bash
   docker-compose logs frontend
   ```

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

## 📞 Support

For deployment issues or questions, please:
1. Check the logs first
2. Verify environment variables
3. Ensure all services are healthy
4. Contact support with specific error messages

## 🔐 Default Admin Access

After deployment, access the admin panel at `https://your-domain.com/admin/`

Default credentials (change immediately):
- Username: `admin`
- Password: `admin123`

## 📝 License

This project is proprietary software. All rights reserved.