#!/usr/bin/env python
"""
Export data from SQLite to JSON fixtures for PostgreSQL migration
"""
import os
import sys
import django
from django.core.management import call_command
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exam_api.settings')
django.setup()

def export_sqlite_data():
    """Export all data from SQLite database to JSON fixtures"""
    
    # List of apps and models to export
    apps_to_export = [
        'users',
        'exams', 
        'questions',
        'payments',
        'core',
        # Don't export analytics since it's new
    ]
    
    print("🗄️ Exporting SQLite data to fixtures...")
    
    try:
        # Export all data to a single fixture file
        call_command(
            'dumpdata',
            *apps_to_export,
            format='json',
            indent=2,
            output='sqlite_data_export.json',
            verbosity=2
        )
        print("✅ Data exported successfully to sqlite_data_export.json")
        
        # Also create individual app exports for easier management
        for app in apps_to_export:
            try:
                call_command(
                    'dumpdata',
                    app,
                    format='json', 
                    indent=2,
                    output=f'{app}_data.json',
                    verbosity=1
                )
                print(f"✅ {app} data exported to {app}_data.json")
            except Exception as e:
                print(f"⚠️ Could not export {app}: {e}")
                
    except Exception as e:
        print(f"❌ Error exporting data: {e}")
        return False
        
    return True

if __name__ == '__main__':
    success = export_sqlite_data()
    if success:
        print("\n🎉 Data export completed!")
        print("Next steps:")
        print("1. Commit these changes to git")
        print("2. Deploy backend with PostgreSQL")
        print("3. Load the fixtures into PostgreSQL")
    else:
        print("\n❌ Data export failed!")
        sys.exit(1)