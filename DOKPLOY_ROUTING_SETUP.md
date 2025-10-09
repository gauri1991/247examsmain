# Dokploy Routing Configuration Guide

This guide will help you configure Dokploy to properly route requests between frontend and backend services.

## Current Issue

Frontend at `https://247exams.com` calls `https://247exams.com/api/v1/...` but all requests go to the frontend service because there's no routing rule for `/api` paths.

## Solution: Configure Traefik Routing in Dokploy

### Architecture

```
Browser Request
    ↓
Dokploy (Traefik Proxy)
    ↓
    ├─→ /api/*    → Backend Service (port 8000)
    ├─→ /admin/*  → Backend Service (port 8000)
    ├─→ /static/* → Backend Service (port 8000)
    ├─→ /media/*  → Backend Service (port 8000)
    └─→ /*        → Frontend Service (port 3000)
```

## Step-by-Step Configuration

### Step 1: Configure Backend Service Routing

1. **Open Dokploy Dashboard**
2. **Navigate to:** Projects → 247exams → Backend Service
3. **Go to:** Settings or Configuration tab
4. **Find:** "Domains" or "Routing" or "Labels" section

5. **Add these Traefik labels** (exact location depends on Dokploy UI):

   ```yaml
   # Enable Traefik for this service
   traefik.enable=true

   # Router for API endpoints
   traefik.http.routers.backend-api.rule=Host(`247exams.com`) && PathPrefix(`/api`)
   traefik.http.routers.backend-api.entrypoints=websecure
   traefik.http.routers.backend-api.tls=true
   traefik.http.routers.backend-api.priority=100

   # Router for admin panel
   traefik.http.routers.backend-admin.rule=Host(`247exams.com`) && PathPrefix(`/admin`)
   traefik.http.routers.backend-admin.entrypoints=websecure
   traefik.http.routers.backend-admin.tls=true
   traefik.http.routers.backend-admin.priority=100

   # Router for static files
   traefik.http.routers.backend-static.rule=Host(`247exams.com`) && PathPrefix(`/static`)
   traefik.http.routers.backend-static.entrypoints=websecure
   traefik.http.routers.backend-static.tls=true
   traefik.http.routers.backend-static.priority=100

   # Router for media files
   traefik.http.routers.backend-media.rule=Host(`247exams.com`) && PathPrefix(`/media`)
   traefik.http.routers.backend-media.entrypoints=websecure
   traefik.http.routers.backend-media.tls=true
   traefik.http.routers.backend-media.priority=100

   # Load balancer configuration
   traefik.http.services.backend.loadbalancer.server.port=8000
   ```

### Step 2: Configure Frontend Service Routing

1. **Navigate to:** Projects → 247exams → Frontend Service
2. **Go to:** Settings or Configuration tab
3. **Find:** "Domains" or "Routing" or "Labels" section

4. **Add these Traefik labels**:

   ```yaml
   # Enable Traefik for this service
   traefik.enable=true

   # Router for frontend (catch-all)
   traefik.http.routers.frontend.rule=Host(`247exams.com`)
   traefik.http.routers.frontend.entrypoints=websecure
   traefik.http.routers.frontend.tls=true
   traefik.http.routers.frontend.priority=1

   # Load balancer configuration
   traefik.http.services.frontend.loadbalancer.server.port=3000
   ```

### Alternative: Dokploy UI Method

If Dokploy has a simpler UI for routing:

#### Backend Service:
- **Domain:** `247exams.com`
- **Add Path Rules:**
  - Path: `/api` → Priority: 100
  - Path: `/admin` → Priority: 100
  - Path: `/static` → Priority: 100
  - Path: `/media` → Priority: 100
- **Port:** `8000`
- **Enable HTTPS:** Yes

#### Frontend Service:
- **Domain:** `247exams.com`
- **Path:** `/` (or leave blank for catch-all)
- **Priority:** `1` (lowest)
- **Port:** `3000`
- **Enable HTTPS:** Yes

### Step 3: Important Configuration Points

1. **Network Configuration**
   - Ensure both services are on the **same Docker network**
   - Usually Dokploy handles this automatically

2. **Service Names**
   - Backend service name in Docker should match what's referenced
   - Frontend service name in Docker should match

3. **Priority is Key**
   - Backend paths: Priority `100` (higher = matched first)
   - Frontend catch-all: Priority `1` (lower = matched last)

4. **Entry Points**
   - `websecure` = HTTPS (port 443)
   - `web` = HTTP (port 80)
   - Use `websecure` for production

### Step 4: Apply Changes

1. **Save** all label/routing configurations
2. **Redeploy** backend service
3. **Redeploy** frontend service
4. **Wait** for services to be healthy (check status)

### Step 5: Verify Routing

After deployment, test these URLs in your browser:

1. **Frontend (should work):**
   ```
   https://247exams.com/
   ```

2. **Backend API (should return JSON, not HTML):**
   ```
   https://247exams.com/api/v1/
   ```
   Expected: JSON response or 404 from Django

3. **Backend Admin (should show Django admin):**
   ```
   https://247exams.com/admin/
   ```
   Expected: Django admin login page

### Step 6: Test Login

Once routing is verified:
1. Go to `https://247exams.com/auth/sign-in`
2. Try logging in
3. Open browser console (F12)
4. Check that API requests go to `https://247exams.com/api/v1/...`
5. Verify responses are JSON from Django (not HTML from Next.js)

## Troubleshooting

### Issue: Still getting Next.js 404 for /api requests

**Check:**
- Backend service has Traefik labels configured
- Backend service is running and healthy
- Priority values are correct (backend > frontend)
- Redeploy was successful

### Issue: SSL/Certificate errors

**Check:**
- Both services use `entrypoints=websecure`
- TLS is enabled: `tls=true`
- Certificate is valid for `247exams.com`

### Issue: Backend not reachable

**Check:**
- Backend service port is `8000`
- Backend service is listening on `0.0.0.0:8000` (not just `127.0.0.1`)
- Backend service health check is passing

### Issue: CORS errors

**Verify backend environment variables:**
```bash
CORS_ALLOWED_ORIGINS=https://247exams.com,https://www.247exams.com
ALLOWED_HOSTS=247exams.com,www.247exams.com,localhost,127.0.0.1
```

## How to Add Labels in Dokploy

Depending on your Dokploy version, labels can be added in:

1. **Docker Compose Override** (if Dokploy supports it)
2. **Service Settings → Labels** (UI field)
3. **Advanced Settings → Traefik Configuration**
4. **Environment Variables** (some platforms)

### Example: Docker Compose Labels Section

```yaml
services:
  backend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend-api.rule=Host(`247exams.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.backend-api.entrypoints=websecure"
      - "traefik.http.routers.backend-api.tls=true"
      - "traefik.http.routers.backend-api.priority=100"
      - "traefik.http.services.backend.loadbalancer.server.port=8000"
```

## Expected Result

After configuration:

✅ `https://247exams.com/` → Frontend (Next.js)
✅ `https://247exams.com/api/v1/...` → Backend (Django API)
✅ `https://247exams.com/admin/` → Backend (Django Admin)
✅ Login works on mobile and desktop
✅ No CORS errors
✅ No mixed content warnings

## Need Help?

If you're stuck, check:
1. Dokploy logs for Traefik errors
2. Backend service logs: `docker logs <backend-container>`
3. Frontend service logs: `docker logs <frontend-container>`
4. Traefik dashboard (if enabled in Dokploy)

---

**Note:** The exact UI/method for adding these labels depends on your Dokploy version. Look for:
- "Traefik Labels"
- "Routing Rules"
- "Service Configuration"
- "Advanced Settings"
