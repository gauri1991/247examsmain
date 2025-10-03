#!/bin/bash

set -e

echo "🚀 Starting 247 Exams Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
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