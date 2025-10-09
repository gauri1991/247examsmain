from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Create or reset admin superuser with known credentials'

    def handle(self, *args, **options):
        username = 'admin'
        email = 'admin@247exams.com'
        password = 'admin247exams'  # Change this to your desired password

        # Check if admin user exists
        try:
            user = User.objects.get(username=username)
            self.stdout.write(self.style.WARNING(f'⚠️  Admin user "{username}" already exists!'))

            # Reset password
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.email = email
            user.save()

            self.stdout.write(self.style.SUCCESS(f'✅ Password reset for admin user'))
        except User.DoesNotExist:
            # Create new superuser
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Created new admin superuser'))

        # Show credentials
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('Django Admin Credentials:'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'URL: /django-admin/')
        self.stdout.write(self.style.SUCCESS('='*50 + '\n'))

        self.stdout.write(self.style.WARNING('⚠️  IMPORTANT: Change this password after first login!'))
