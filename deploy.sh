#!/bin/bash

# Deployment script for 247 Exams
set -e

echo "🚀 Starting deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Please create it based on .env.production.example"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

echo "📦 Building and starting services..."

# Build and start services
docker-compose --env-file .env.production up --build -d

echo "⏳ Waiting for services to be healthy..."

# Wait for database to be ready
echo "Waiting for database..."
until docker-compose exec db pg_isready -U $DB_USER; do
    sleep 2
done

echo "🗄️ Running database migrations..."
docker-compose exec backend python manage.py migrate

echo "👤 Creating superuser (if needed)..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

echo "📊 Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

echo "🏥 Checking service health..."
sleep 10

# Check if services are healthy
if docker-compose ps | grep -q "unhealthy"; then
    echo "❌ Some services are unhealthy"
    docker-compose ps
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at: http://localhost"
echo "🔧 Admin panel: http://localhost/admin"

# Show running services
echo "📋 Running services:"
docker-compose ps