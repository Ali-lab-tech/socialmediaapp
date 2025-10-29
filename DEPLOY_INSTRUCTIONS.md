# 🚀 Vercel Deployment Instructions

## Quick Start

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /Users/mac/Desktop/SocialMediaApp
vercel
```

When prompted:
- **Link to existing project?** → No
- **Project name?** → `social-media-app` (or your choice)
- **Directory?** → `./` (current)

### Step 4: Add Environment Variables

After first deployment, add environment variables in Vercel Dashboard:

**Go to:** Project → Settings → Environment Variables

**Add these variables:**

1. **VUE_APP_API_URL**
   - Value: `https://your-project.vercel.app/api` (update after first deploy)
   - Environment: Production, Preview, Development

2. **DB_HOST**
   - Value: Your MySQL host
   - Environment: Production

3. **DB_PORT**
   - Value: `3306`
   - Environment: Production

4. **DB_USER**
   - Value: Your database username
   - Environment: Production

5. **DB_PASS**
   - Value: Your database password
   - Environment: Production

6. **DB_NAME**
   - Value: Your database name
   - Environment: Production

7. **JWT_SECRET**
   - Value: Your secret key
   - Environment: Production

8. **NODE_ENV**
   - Value: `production`
   - Environment: Production

9. **FRONTEND_URL**
   - Value: `https://your-project.vercel.app`
   - Environment: Production

### Step 5: Update VUE_APP_API_URL

After first deployment, you'll get a URL. Update `VUE_APP_API_URL` to:
```
https://your-actual-project-name.vercel.app/api
```

### Step 6: Deploy to Production

```bash
vercel --prod
```

## ⚠️ Important Notes

### Database
- Must be accessible from internet
- Recommended: PlanetScale, Aiven, AWS RDS, DigitalOcean

### File Uploads
- Files in `/uploads` are temporary
- For production, use Cloudinary or AWS S3

## ✅ Files Updated for Deployment

1. ✅ `vercel.json` - Vercel configuration
2. ✅ `backend/backend-app/api/index.ts` - Serverless function entry
3. ✅ `frontend/frontendapp/src/config/api.js` - Centralized API config
4. ✅ All components updated to use `apiConfig`
5. ✅ Environment variables configured

## 🎉 Done!

Your app should now be live at `https://your-project.vercel.app`

For detailed info, see `DEPLOYMENT.md`

