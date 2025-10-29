# 🚀 Vercel Deployment Guide - Quick Start

## Prerequisites ✅

1. Vercel account (https://vercel.com)
2. Production MySQL database (accessible from internet)
3. Production credentials ready

## Quick Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

From project root:

```bash
cd /Users/mac/Desktop/SocialMediaApp
vercel
```

Follow the prompts:
- **Link to existing project?** → No (first time)
- **What's your project's name?** → `social-media-app` (or your choice)
- **In which directory is your code located?** → `./`

### 4. Add Environment Variables

After first deployment, you'll get a URL. Then add environment variables:

**Via Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these:

```
VUE_APP_API_URL = https://your-project.vercel.app/api
DB_HOST = your-db-host
DB_PORT = 3306  
DB_USER = your-db-user
DB_PASS = your-db-password
DB_NAME = your-db-name
JWT_SECRET = your-secret-key
NODE_ENV = production
FRONTEND_URL = https://your-project.vercel.app
```

**Via CLI:**
```bash
vercel env add VUE_APP_API_URL production
vercel env add DB_HOST production
vercel env add DB_PORT production
vercel env add DB_USER production
vercel env add DB_PASS production
vercel env add DB_NAME production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
vercel env add FRONTEND_URL production
```

### 5. Redeploy

After adding environment variables:

```bash
vercel --prod
```

## ⚠️ Important Notes

### Database
- Your MySQL database MUST be accessible from the internet
- Recommended: Use PlanetScale, Aiven, AWS RDS, or similar cloud services
- Update firewall to allow Vercel IP ranges (or use 0.0.0.0/0 for testing)

### File Uploads
- Files in `/uploads` are **temporary** - they'll be lost on redeploy
- For production, consider:
  - Cloudinary (free tier available)
  - AWS S3
  - Vercel Blob Storage

### CORS
- Currently allows all origins
- After deployment, you may want to restrict to your Vercel domain

## 🔧 Troubleshooting

**Build fails?**
- Check `vercel logs`
- Ensure all dependencies in package.json
- Check TypeScript errors

**API not working?**
- Verify environment variables are set
- Check `/api` routes in vercel.json
- View function logs in Vercel dashboard

**Database connection fails?**
- Verify credentials
- Check database allows external connections
- Review firewall settings

## 📝 File Structure

The project is configured for Vercel with:
- `vercel.json` - Vercel configuration
- `backend/backend-app/api/` - Serverless functions
- `frontend/frontendapp/src/config/api.js` - Centralized API config
- Environment variables for production

## 🎉 After Deployment

1. Visit your site: `https://your-project.vercel.app`
2. Test registration/login
3. Test creating posts
4. Check API endpoints work

For detailed instructions, see `DEPLOYMENT.md`

