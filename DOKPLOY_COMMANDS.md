# Dokploy Terminal Commands Reference

## Finding the App Directory

When you open terminal in Dokploy, you might be in the root `/` directory. You need to find where the Django app is located.

### Step 1: Find the app directory

```bash
# Try these common locations:
cd /app && pwd
# OR
cd /code && pwd
# OR
ls -la / | grep -E "app|code|backend"
```

### Step 2: Run commands from app directory

Once you find it (usually `/app`):

```bash
cd /app
python manage.py create_test_user 8302012630 admin123
```

---

## Quick Commands for Production

### Create Test User
```bash
cd /app
python manage.py create_test_user 8302012630 admin123
```

### Check if User Exists
```bash
cd /app
python manage.py check_user 8302012630
```

### Reset Admin Password
```bash
cd /app
python manage.py reset_admin
```

### See All Management Commands
```bash
cd /app
python manage.py help
```

---

## One-Liner Commands (if /app is correct)

```bash
cd /app && python manage.py create_test_user 8302012630 admin123
```

```bash
cd /app && python manage.py check_user 8302012630
```

```bash
cd /app && python manage.py reset_admin
```

---

## Troubleshooting

### If you get "No such file or directory"

1. Find where manage.py is:
```bash
find / -name "manage.py" 2>/dev/null | grep -v venv
```

2. Navigate to that directory and run commands there

### If you get "Permission denied"

You might need to use the app user:
```bash
su - app
cd /app
python manage.py create_test_user 8302012630 admin123
```

---

## After Creating User

Test login at: `https://247exams.com/auth/sign-in`
- Mobile: `8302012630`
- Password: `admin123`
