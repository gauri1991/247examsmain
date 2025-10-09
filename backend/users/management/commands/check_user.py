from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Check if a user exists and show their details'

    def add_arguments(self, parser):
        parser.add_argument('phone', type=str, help='Phone number to check')

    def handle(self, *args, **options):
        phone = options['phone']

        try:
            user = User.objects.get(phone=phone)
            self.stdout.write(self.style.SUCCESS(f'\n✅ User found!'))
            self.stdout.write(f'  Username: {user.username}')
            self.stdout.write(f'  Phone: {user.phone}')
            self.stdout.write(f'  Email: {user.email}')
            self.stdout.write(f'  First Name: {user.first_name}')
            self.stdout.write(f'  Last Name: {user.last_name}')
            self.stdout.write(f'  Role: {user.role}')
            self.stdout.write(f'  Is Active: {user.is_active}')
            self.stdout.write(f'  Is Verified: {user.is_verified}')
            self.stdout.write(f'  Is Staff: {user.is_staff}')
            self.stdout.write(f'  Is Superuser: {user.is_superuser}')
            self.stdout.write(f'  Has usable password: {user.has_usable_password()}')
            self.stdout.write(f'  Created: {user.created_at}')

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'\n❌ User with phone {phone} does not exist!'))

            # Show all users
            total_users = User.objects.count()
            self.stdout.write(f'\nTotal users in database: {total_users}')

            if total_users > 0:
                self.stdout.write('\nFirst 10 users:')
                for user in User.objects.all()[:10]:
                    self.stdout.write(f'  - {user.phone} ({user.username}) - Active: {user.is_active}')
