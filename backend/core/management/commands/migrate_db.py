from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command
from django.conf import settings
import os
import sys


class Command(BaseCommand):
    help = 'Migrate data from SQLite to PostgreSQL (or between databases)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--export',
            action='store_true',
            help='Export data from current database to JSON fixtures',
        )
        parser.add_argument(
            '--load',
            action='store_true',
            help='Load data from JSON fixtures into current database',
        )
        parser.add_argument(
            '--apps',
            type=str,
            help='Comma-separated list of apps to export/load (default: users,exams,questions,payments,core)',
            default='users,exams,questions,payments,core',
        )
        parser.add_argument(
            '--output-dir',
            type=str,
            help='Directory to save/load fixture files (default: current directory)',
            default='.',
        )
        parser.add_argument(
            '--fixture-name',
            type=str,
            help='Name for combined fixture file (default: database_export.json)',
            default='database_export.json',
        )

    def handle(self, *args, **options):
        export = options['export']
        load = options['load']
        apps_str = options['apps']
        output_dir = options['output_dir']
        fixture_name = options['fixture_name']

        # Parse apps list
        apps_to_process = [app.strip() for app in apps_str.split(',')]

        # Validate that at least one action is specified
        if not export and not load:
            raise CommandError('You must specify --export, --load, or both')

        # Show current database info
        db_engine = settings.DATABASES['default']['ENGINE']
        db_name = settings.DATABASES['default']['NAME']
        self.stdout.write(self.style.SUCCESS(f'\n📊 Current Database:'))
        self.stdout.write(f'   Engine: {db_engine}')
        self.stdout.write(f'   Name: {db_name}\n')

        # Perform export
        if export:
            self.export_data(apps_to_process, output_dir, fixture_name)

        # Perform load
        if load:
            self.load_data(apps_to_process, output_dir)

        self.stdout.write(self.style.SUCCESS('\n✅ Database migration completed successfully!\n'))

    def export_data(self, apps, output_dir, fixture_name):
        """Export data from current database to JSON fixtures"""
        self.stdout.write(self.style.WARNING(f'\n📤 EXPORTING DATA'))
        self.stdout.write('=' * 50)

        try:
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)

            # Export combined fixture
            combined_path = os.path.join(output_dir, fixture_name)
            self.stdout.write(f'\n📦 Exporting all data to: {combined_path}')

            call_command(
                'dumpdata',
                *apps,
                format='json',
                indent=2,
                output=combined_path,
                verbosity=1
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Combined export: {combined_path}'))

            # Export individual app fixtures
            self.stdout.write(f'\n📦 Exporting individual app data...')
            for app in apps:
                try:
                    app_fixture = os.path.join(output_dir, f'{app}_data.json')
                    call_command(
                        'dumpdata',
                        app,
                        format='json',
                        indent=2,
                        output=app_fixture,
                        verbosity=0
                    )

                    # Get file size
                    size = os.path.getsize(app_fixture)
                    size_kb = size / 1024
                    self.stdout.write(self.style.SUCCESS(f'   ✅ {app:20s} → {app}_data.json ({size_kb:.1f} KB)'))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'   ⚠️  {app:20s} → Error: {e}'))

            self.stdout.write(self.style.SUCCESS(f'\n✅ Export completed!'))
            self.stdout.write(f'   Files saved to: {output_dir}')

        except Exception as e:
            raise CommandError(f'Export failed: {e}')

    def load_data(self, apps, output_dir):
        """Load data from JSON fixtures into current database"""
        self.stdout.write(self.style.WARNING(f'\n📥 LOADING DATA'))
        self.stdout.write('=' * 50)

        try:
            loaded_count = 0
            skipped_count = 0

            # Load individual app fixtures
            for app in apps:
                fixture_path = os.path.join(output_dir, f'{app}_data.json')

                if not os.path.exists(fixture_path):
                    self.stdout.write(self.style.WARNING(f'   ⚠️  {app:20s} → File not found, skipping...'))
                    skipped_count += 1
                    continue

                try:
                    self.stdout.write(f'\n   Loading {app} data...')
                    call_command('loaddata', fixture_path, verbosity=1)

                    # Get file size
                    size = os.path.getsize(fixture_path)
                    size_kb = size / 1024
                    self.stdout.write(self.style.SUCCESS(f'   ✅ {app:20s} → Loaded successfully ({size_kb:.1f} KB)'))
                    loaded_count += 1

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'   ❌ {app:20s} → Error: {e}'))
                    skipped_count += 1

            self.stdout.write(self.style.SUCCESS(f'\n✅ Load completed!'))
            self.stdout.write(f'   Loaded: {loaded_count} apps')
            if skipped_count > 0:
                self.stdout.write(self.style.WARNING(f'   Skipped: {skipped_count} apps'))

        except Exception as e:
            raise CommandError(f'Load failed: {e}')
