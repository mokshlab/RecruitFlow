# Deployment Guide - RecruitFlow Platform

Step-by-step guide to deploy the RecruitFlow application to production.

---

## Overview

**Architecture**: Separated frontend and backend deployment
- **Frontend**: React SPA on Vercel
- **Backend**: Node.js API on Render
- **Database**: MongoDB Atlas (Cloud)

**Deployment Flow**:
```
GitHub Repo → Vercel (Frontend) + Render (Backend) → MongoDB Atlas
```

---

## Prerequisites

- [x] GitHub account
- [x] Vercel account (free tier)
- [x] Render account (free tier)
- [x] MongoDB Atlas account (free tier)
- [x] Git installed locally

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Click **"Build a Database"**
4. Select **"M0 Free"** tier
5. Choose cloud provider and region (preferably closest to your users)
6. Click **"Create Cluster"**

### 1.2 Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username and **strong password** (save these!)
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Whitelist IP Addresses

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Required for Render/Vercel dynamic IPs
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/recruit_flow_db?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend (Render)

### 2.1 Prepare Backend

Ensure `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### 2.2 Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `recruitflow-api` (or your choice)
   - **Region**: Closest to users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 2.3 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**, add:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/recruit_flow_db?retryWrites=true&w=majority
JWT_SECRET=<generate-random-64-char-string>
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=<secure-password-min-12-chars>
FRONTEND_URL=https://your-app.vercel.app
```

**Generate JWT Secret**:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (3-5 minutes)
3. Copy backend URL: `https://recruitflow-api.onrender.com`

### 2.5 Verify Deployment

```bash
# Test health endpoint
curl https://recruitflow-api.onrender.com/api/health

# Should return:
# {"status":"OK","timestamp":"...","database":"connected"}
```

---

## Step 3: Deploy Frontend (Vercel)

### 3.1 Prepare Frontend

1. **Update API URLs** in frontend code (if hardcoded)
2. Ensure `frontend/package.json` has build script:
   ```json
   {
     "scripts": {
       "build": "react-scripts build"
     }
   }
   ```

### 3.2 Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

### 3.3 Set Environment Variables

Click **"Environment Variables"**, add:

```env
REACT_APP_API_URL=https://recruitflow-api.onrender.com
REACT_APP_API_BASE_URL=https://recruitflow-api.onrender.com/api
GENERATE_SOURCEMAP=false
CI=true
```

**Important**: 
- `REACT_APP_*` variables are embedded at build time
- Don't include sensitive data (API keys, secrets)
- Set `GENERATE_SOURCEMAP=false` to reduce bundle size

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Copy frontend URL: `https://recruitflow.vercel.app`

---

## Step 4: Update Backend CORS

### 4.1 Update FRONTEND_URL

1. Go to Render dashboard → Your service
2. Click **"Environment"**
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://recruitflow.vercel.app
   ```
4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## Step 5: Seed Production Database

### Option A: Using Render Shell

1. Go to Render dashboard → Your service
2. Click **"Shell"** tab
3. Run:
   ```bash
   node config/seedDatabase.js
   ```

### Option B: From Local Machine

1. Update local `.env` with production `MONGO_URI`
2. Run:
   ```bash
   cd backend
   node config/seedDatabase.js
   ```
3. Revert local `.env` to development settings

**Creates**:
- 1 default admin
- 6 sample users
- 9 job listings
- 5 applications
- 8 bookmarks

---

## Step 6: Verification

### 6.1 Test Frontend

1. Visit `https://recruitflow.vercel.app`
2. Verify homepage loads
3. Test user registration
4. Test login with demo credentials:
   - Email: `demo.user@example.com`
   - Password: `User@1234`

### 6.2 Test Admin Panel

1. Visit `https://recruitflow.vercel.app/admin-dashboard`
2. Login with superadmin credentials:
   - Username: `admin`
   - Password: `<your-admin-password>`
3. Or login with test admin:
   - Username: `testadmin`
   - Password: `Check#2026`
4. Verify dashboard shows statistics

### 6.3 Test Real-time Features

1. Open user portal in one browser
2. Open admin panel in another
3. Apply for a job as user
4. Verify admin receives real-time notification

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution 1**: Check CORS configuration
- Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- Check for trailing slashes (should not have)

**Solution 2**: Check environment variables
- Verify `REACT_APP_API_URL` in Vercel settings
- Rebuild frontend after changing env vars

### Issue: Database connection failed

**Solution**: Check MongoDB Atlas
- Verify connection string is correct
- Ensure IP `0.0.0.0/0` is whitelisted
- Check database user has correct permissions

### Issue: Admin login not working

**Solution**: Check admin credentials
- Verify `DEFAULT_ADMIN_USERNAME` and `DEFAULT_ADMIN_PASSWORD`
- Ensure seed script was run
- Check admin exists in database

### Issue: Render service sleeping (Free tier)

**Symptom**: First request takes 30+ seconds

**Solution**: 
- Free tier services sleep after 15 minutes of inactivity
- Consider upgrading or use a ping service
- Warn users about cold start delay

---

## Post-Deployment Checklist

- [ ] Frontend accessible at Vercel URL
- [ ] Backend health check returns 200 OK
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Real-time notifications working
- [ ] File uploads working (resume/photo)
- [ ] Job search and filters working
- [ ] MongoDB Atlas shows data
- [ ] CORS errors resolved
- [ ] HTTPS working on both frontend and backend

---

## Custom Domain (Optional)

### For Vercel (Frontend)

1. Go to Vercel project → **"Settings"** → **"Domains"**
2. Add your custom domain: `recruitflow.yourdomain.com`
3. Configure DNS records as instructed
4. Update `FRONTEND_URL` in Render

### For Render (Backend)

1. Go to Render service → **"Settings"** → **"Custom Domain"**
2. Add your custom domain: `api.recruitflow.yourdomain.com`
3. Configure DNS CNAME record
4. Update `REACT_APP_API_URL` in Vercel

---

## Monitoring & Maintenance

### Render Logs

View logs in Render dashboard → **"Logs"** tab
- Check for errors
- Monitor API requests
- Debug issues

### Vercel Analytics

View analytics in Vercel dashboard → **"Analytics"**
- Page views
- Performance metrics
- Error tracking

### MongoDB Atlas Monitoring

View metrics in Atlas dashboard → **"Metrics"**
- Database operations
- Connection count
- Storage usage

---

## Scaling Considerations

### When to Upgrade

**Render Free Tier Limits**:
- 512 MB RAM
- Shared CPU
- Service sleeps after 15 min inactivity

**Upgrade if**:
- Consistent traffic (no sleeping)
- Need more memory/CPU
- Require custom domain with SSL

**Vercel Free Tier Limits**:
- 100 GB bandwidth/month
- Unlimited builds

**Upgrade if**:
- High traffic (>100GB/month)
- Need team collaboration
- Require advanced analytics

**MongoDB Atlas Free Tier Limits**:
- 512 MB storage
- Shared cluster

**Upgrade if**:
- Data exceeds 500 MB
- Need automated backups
- Require dedicated cluster

---

For local development setup, see [main README](../README.md).
