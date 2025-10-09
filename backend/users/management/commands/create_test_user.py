from django.core.management.base import BaseCommand
from users.models import User, UserProfile


class Command(BaseCommand):
    help = 'Create a test user with phone and password'

    def add_arguments(self, parser):
        parser.add_argument('phone', type=str, help='Phone number')
        parser.add_argument('password', type=str, help='Password')
        parser.add_argument('--first-name', type=str, default='Test', help='First name')
        parser.add_argument('--last-name', type=str, default='User', help='Last name')
        parser.add_argument('--role', type=str, default='student', help='User role')

    def handle(self, *args, **options):
        phone = options['phone']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        role = options['role']

        # Check if user already exists
        if User.objects.filter(phone=phone).exists():
            self.stdout.write(self.style.WARNING(f'⚠️  User with phone {phone} already exists!'))
            user = User.objects.get(phone=phone)

            # Update password
            user.set_password(password)
            user.is_active = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Updated password for existing user'))
        else:
            # Create new user
            user = User.objects.create_user(
                username=phone,
                phone=phone,
                email=f'{phone}@mobile.247exams.com',
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=role,
                is_active=True,
                is_verified=True
            )

            # Create user profile
            UserProfile.objects.get_or_create(user=user)

            self.stdout.write(self.style.SUCCESS(f'\n✅ User created successfully!'))

        # Show user details
        self.stdout.write(f'\nUser details:')
        self.stdout.write(f'  Username: {user.username}')
        self.stdout.write(f'  Phone: {user.phone}')
        self.stdout.write(f'  Email: {user.email}')
        self.stdout.write(f'  Name: {user.first_name} {user.last_name}')
        self.stdout.write(f'  Role: {user.role}')
        self.stdout.write(f'  Is Active: {user.is_active}')
        self.stdout.write(f'  Is Verified: {user.is_verified}')
