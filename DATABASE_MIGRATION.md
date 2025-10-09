# Database Migration Guide (SQLite → PostgreSQL)

This guide explains how to migrate your data from SQLite to PostgreSQL using the `migrate_db` management command.

## Overview

The `migrate_db` command allows you to:
- Export data from SQLite to JSON fixtures
- Load JSON fixtures into PostgreSQL
- Perform both operations in sequence

## Prerequisites

### For Local Development

1. **SQLite Database** (source) - your current development database
2. **PostgreSQL Database** (target) - your production database setup

### For Production (Dokploy)

- Access to Dokploy backend container terminal
- Fixture files available in the container

---

## Migration Process

### Step 1: Export Data from SQLite (Local)

First, ensure your local environment is using SQLite:

```bash
# Check your current database
cd backend
source venv/bin/activate
python manage.py migrate_db --export

# This creates:
# - database_export.json (combined)
# - users_data.json
# - exams_data.json
# - questions_data.json
# - payments_data.json
# - core_data.json
```

**Output:**
```
📊 Current Database:
   Engine: django.db.backends.sqlite3
   Name: /path/to/db.sqlite3

📤 EXPORTING DATA
==================================================

📦 Exporting all data to: ./database_export.json
✅ Combined export: ./database_export.json

📦 Exporting individual app data...
   ✅ users                → users_data.json (45.2 KB)
   ✅ exams                → exams_data.json (123.4 KB)
   ✅ questions            → questions_data.json (89.1 KB)
   ✅ payments             → payments_data.json (12.3 KB)
   ✅ core                 → core_data.json (5.6 KB)

✅ Export completed!
   Files saved to: .
```

### Step 2: Commit Fixture Files

```bash
# Add fixture files to git (they're in .gitignore by default, so we need to force add)
git add -f *_data.json database_export.json

# Commit
git commit -m "📊 Add database fixtures for SQLite to PostgreSQL migration"

# Push to repository
git push origin main
```

### Step 3: Deploy to Production

1. Push your code to GitHub/GitLab
2. In Dokploy, redeploy your backend service
3. The fixture files will now be available in the container

### Step 4: Load Data into PostgreSQL (Production)

Open Dokploy terminal for your backend container:

```bash
# Navigate to app directory
cd /app

# Load all fixtures into PostgreSQL
python manage.py migrate_db --load

# This will load:
# - users_data.json
# - exams_data.json
# - questions_data.json
# - payments_data.json
# - core_data.json
```

**Output:**
```
📊 Current Database:
   Engine: django.db.backends.postgresql
   Name: exam_api_db

📥 LOADING DATA
==================================================

   Loading users data...
   ✅ users                → Loaded successfully (45.2 KB)

   Loading exams data...
   ✅ exams                → Loaded successfully (123.4 KB)

   Loading questions data...
   ✅ questions            → Loaded successfully (89.1 KB)

   Loading payments data...
   ✅ payments             → Loaded successfully (12.3 KB)

   Loading core data...
   ✅ core                 → Loaded successfully (5.6 KB)

✅ Load completed!
   Loaded: 5 apps
```

---

## Command Options

### Basic Usage

```bash
# Export only
python manage.py migrate_db --export

# Load only
python manage.py migrate_db --load

# Export and load (useful for testing)
python manage.py migrate_db --export --load
```

### Advanced Options

```bash
# Export specific apps only
python manage.py migrate_db --export --apps="users,exams"

# Use custom output directory
python manage.py migrate_db --export --output-dir="./fixtures"

# Use custom fixture name
python manage.py migrate_db --export --fixture-name="my_backup.json"

# Load from custom directory
python manage.py migrate_db --load --output-dir="./fixtures"
```

### Full Example with All Options

```bash
python manage.py migrate_db \
  --export \
  --apps="users,exams,questions" \
  --output-dir="/app/backups" \
  --fixture-name="production_backup_2025_10_09.json"
```

---

## Common Scenarios

### Scenario 1: First-Time Migration (Development → Production)

```bash
# 1. Local: Export from SQLite
cd backend
source venv/bin/activate
python manage.py migrate_db --export

# 2. Local: Commit and push
git add -f *_data.json
git commit -m "Add database fixtures"
git push

# 3. Dokploy: Redeploy backend

# 4. Dokploy Terminal: Load into PostgreSQL
cd /app
python manage.py migrate_db --load
```

### Scenario 2: Update Production Data

If you've made changes locally and want to update production:

```bash
# 1. Local: Export latest data
python manage.py migrate_db --export

# 2. Commit and push
git add -f *_data.json
git commit -m "Update database fixtures"
git push

# 3. Dokploy: Redeploy backend

# 4. Dokploy Terminal: Clear old data and load new
cd /app
python manage.py flush --noinput  # WARNING: This deletes all data!
python manage.py migrate_db --load
```

### Scenario 3: Backup Production Data

```bash
# In Dokploy terminal
cd /app

# Export current production data
python manage.py migrate_db --export --fixture-name="backup_$(date +%Y%m%d).json"

# Download the backup files from Dokploy file manager
```

### Scenario 4: Testing Migration Locally

```bash
# 1. Start with SQLite
python manage.py migrate_db --export

# 2. Switch to PostgreSQL in settings
# Update DATABASE_URL in .env to use PostgreSQL

# 3. Run migrations on PostgreSQL
python manage.py migrate

# 4. Load the data
python manage.py migrate_db --load

# 5. Test your application
python manage.py runserver
```

---

## Troubleshooting

### Error: "File not found"

**Problem:** Fixture files don't exist in the specified directory.

**Solution:**
```bash
# Check if files exist
ls -la *_data.json

# If not, export first
python manage.py migrate_db --export
```

### Error: "Integrity constraint violation"

**Problem:** Foreign key constraints or unique constraints are violated.

**Solution:**
```bash
# Clear the database first
python manage.py flush --noinput

# Run migrations
python manage.py migrate

# Then load data
python manage.py migrate_db --load
```

### Error: "Could not connect to database"

**Problem:** PostgreSQL connection settings are incorrect.

**Solution:**
```bash
# Check your .env.production file
cat .env.production | grep DATABASE_URL

# Verify PostgreSQL is running
python manage.py check --database default
```

### Warning: Some apps skipped

**Problem:** Fixture files missing for some apps.

**Solution:** This is usually okay - analytics app might not have data yet, for example.

---

## Important Notes

### ⚠️ Data Loss Warning

The `loaddata` command will **add** data to the database, not replace it. If you want a clean migration:

```bash
# Clear all data first
python manage.py flush --noinput

# Run migrations
python manage.py migrate

# Load fixtures
python manage.py migrate_db --load
```

### 🔒 Security

- Don't commit fixtures with sensitive production data to public repositories
- Use `.gitignore` to exclude fixture files: `*_data.json`
- For production migrations, transfer files securely (SCP, SFTP, etc.)

### 📊 File Sizes

Fixture files can be large depending on your data:
- Small database: ~1-10 MB
- Medium database: ~10-100 MB
- Large database: ~100+ MB

For very large databases, consider:
- Exporting in batches
- Using PostgreSQL's native dump/restore tools (`pg_dump`/`pg_restore`)
- Streaming data migration

---

## Alternative: Django's Native Commands

You can also use Django's built-in commands directly:

```bash
# Export
python manage.py dumpdata users exams questions payments core \
  --format=json --indent=2 --output=backup.json

# Load
python manage.py loaddata backup.json
```

But `migrate_db` provides better:
- Progress feedback
- Error handling
- File organization
- Flexibility

---

## Quick Reference

| Task | Command |
|------|---------|
| Export from SQLite | `python manage.py migrate_db --export` |
| Load into PostgreSQL | `python manage.py migrate_db --load` |
| Export specific apps | `python manage.py migrate_db --export --apps="users,exams"` |
| Export to directory | `python manage.py migrate_db --export --output-dir="./backups"` |
| View database info | `python manage.py migrate_db --export` (shows at start) |
| Clear database | `python manage.py flush --noinput` |
| Check database | `python manage.py check --database default` |

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your database settings in `.env` files
3. Ensure migrations are up to date: `python manage.py migrate`
4. Check Django logs for detailed error messages
