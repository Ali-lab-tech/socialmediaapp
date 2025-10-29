# Quick Vercel Deployment Steps

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login to Vercel
```bash
vercel login
```

## Step 3: Add Environment Variables

Add these in Vercel Dashboard (Settings > Environment Variables) or via CLI:

**Frontend Variable:**
- VUE_APP_API_URL = https://your-project.vercel.app/api (set after first deploy)

**Backend Variables (All under "production" environment):**
- DB_HOST = your-database-host
- DB_PORT = 3306
- DB_USER = your-database-user
- DB_PASS = your-database-password
- DB_NAME = your-database-name
- JWT_SECRET = your-jwt-secret-key
- NODE_ENV = production
- FRONTEND_URL = https://your-project.vercel.app

## Step 4: Deploy

```bash
cd /Users/mac/Desktop/SocialMediaApp
vercel
```

Follow prompts, then:
```bash
vercel --prod
```

## Step 5: Update VUE_APP_API_URL

After first deployment, update `VUE_APP_API_URL` with your actual Vercel URL and redeploy.

## Important Notes:

1. **Database must be accessible from internet** - Use cloud MySQL service
2. **File uploads are ephemeral** - Consider using Cloudinary/S3 for production
3. **CORS is configured** - May need to restrict after deployment

See DEPLOYMENT.md for detailed instructions.
