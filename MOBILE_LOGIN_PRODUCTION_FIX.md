# 🚨 Mobile Login Fix for 247exams.com Production

## Problem
Mobile devices cannot login to 247exams.com while laptop/desktop works fine.

## Root Cause
CORS (Cross-Origin Resource Sharing) configuration in production is blocking mobile browser requests.

## Solution

### 1. Update Production Environment Variables

**On your Hostinger VPS**, update/create the `.env` file with:

```bash
# Production Configuration for 247exams.com
SECRET_KEY=your-very-secure-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=247exams.com,www.247exams.com

# CORS Settings - THIS FIXES MOBILE LOGIN
CORS_ALLOWED_ORIGINS=https://247exams.com,https://www.247exams.com,http://247exams.com,http://www.247exams.com

# Additional mobile-friendly settings
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_ALL_ORIGINS=False

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
```

### 2. Restart Production Server

After updating the environment variables:

```bash
# On Hostinger VPS
sudo systemctl restart nginx
sudo systemctl restart your-django-app  # or however you restart Django
```

### 3. Test Mobile Login

Try these endpoints from mobile device:

```bash
# Test mobile password login
POST https://247exams.com/api/v1/auth/mobile/password/login/
{
    "phone": "your_phone_number",
    "password": "your_password"
}

# Test mobile OTP login
POST https://247exams.com/api/v1/auth/mobile/login/
{
    "phone": "your_phone_number", 
    "otp": "123456"
}
```

### 4. Additional Debugging

If still not working, check these:

**A. Browser Console on Mobile:**
- Open Chrome/Safari developer tools on mobile
- Look for CORS errors in console
- Check Network tab for failed requests

**B. Server Logs:**
```bash
# Check Django logs for CORS errors
tail -f /var/log/your-app/error.log
```

**C. Temporary Testing Fix:**
If you need immediate testing, temporarily add this to production settings:
```python
CORS_ALLOW_ALL_ORIGINS = True  # REMOVE AFTER TESTING
```

### 5. Frontend API URL

Make sure your frontend is pointing to the correct production API:

```javascript
// In frontend/.env.local or .env.production
NEXT_PUBLIC_API_URL=https://247exams.com/api/v1
```

## Expected Result

After applying this fix:
- ✅ Mobile devices can login successfully
- ✅ Desktop continues to work
- ✅ All CORS errors resolved
- ✅ Production security maintained

## Why This Happens

1. **Development** (`DEBUG=True`): CORS allows all origins
2. **Production** (`DEBUG=False`): CORS only allows specified origins
3. **Mobile browsers** send requests from different user-agents/origins
4. **Without proper CORS setup**: Mobile requests get blocked

## Next Steps

1. Apply the environment variable changes
2. Restart production server
3. Test mobile login
4. Monitor server logs for any remaining issues

If the issue persists after this fix, it might be related to:
- SSL certificate issues
- Network/firewall blocking mobile traffic
- Different mobile API endpoint configuration