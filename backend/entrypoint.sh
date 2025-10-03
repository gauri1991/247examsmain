#!/bin/bash

set -e

echo "🚀 Starting 247 Exams Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
echo "🔍 Database config: Host=${DB_HOST:-localhost}, Port=${DB_PORT:-5432}, User=${DB_USER:-postgres}"

# Use default values if environment variables are empty
DB_HOST_CHECK=${DB_HOST:-localhost}
DB_PORT_CHECK=${DB_PORT:-5432}
DB_USER_CHECK=${DB_USER:-postgres}

while ! pg_isready -h "$DB_HOST_CHECK" -p "$DB_PORT_CHECK" -U "$DB_USER_CHECK"; do
    echo "💤 Database is not ready - sleeping"
    sleep 2
done
echo "✅ Database is ready!"

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if it doesn't exist
echo "👤 Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@247exams.com', 'admin123')
    print('✅ Superuser created: admin/admin123')
else:
    print('✅ Superuser already exists')
"

echo "🎯 Starting Gunicorn server..."
exec gunicorn --config gunicorn.conf.py exam_api.wsgi:application