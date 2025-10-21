# Wingman Deployment Guide

This guide will help you deploy your Wingman app to the internet in ~15 minutes!

## Prerequisites
- GitHub account (for code hosting)
- Neon account (for database)
- Render account (for backend)
- Vercel account (for frontend)

All services have free tiers - no credit card required!

---

## Step 1: Push Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   cd C:\Users\brani\Desktop\wingman
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Name it `wingman` (or whatever you prefer)
   - Click "Create repository"
   - Don't initialize with README (we already have code)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wingman.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Set Up Neon Database (Free PostgreSQL)

1. **Create Neon Account**:
   - Go to https://neon.tech
   - Sign up with GitHub (easiest)

2. **Create a Database**:
   - Click "Create a project"
   - Name it `wingman-db`
   - Select region closest to you
   - Click "Create project"

3. **Copy Connection String**:
   - You'll see a connection string like:
     ```
     postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **SAVE THIS!** You'll need it for Render

---

## Step 3: Deploy Backend to Render

1. **Create Render Account**:
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository (`wingman`)
   - Click "Connect"

3. **Configure Service**:
   - **Name**: `wingman-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Add Environment Variables** (click "Advanced"):
   ```
   DATABASE_URL = [Your Neon connection string from Step 2]
   JWT_SECRET = [Generate a random string, e.g., "your-super-secret-jwt-key-change-this-12345"]
   PORT = 5000
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = your-app-password-here
   FRONTEND_URL = [Leave blank for now - we'll update this after deploying frontend]
   GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = your-google-client-secret
   GOOGLE_CALLBACK_URL = [Leave blank for now - will be https://your-backend.onrender.com/api/auth/google/callback]
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - **Save the URL** (e.g., `https://wingman-backend-abc123.onrender.com`)

6. **Update Google OAuth Callback**:
   - Go back to Environment Variables
   - Update `GOOGLE_CALLBACK_URL` to `https://your-backend-url.onrender.com/api/auth/google/callback`
   - The service will redeploy automatically

---

## Step 4: Deploy Frontend to Vercel

1. **Create Vercel Account**:
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your `wingman` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Add Environment Variables**:
   ```
   REACT_APP_API_URL = https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual Render backend URL from Step 3)

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - **Save the URL** (e.g., `https://wingman-abc123.vercel.app`)

---

## Step 5: Update Backend with Frontend URL

1. **Go back to Render**:
   - Open your `wingman-backend` service
   - Go to "Environment"
   - Update `FRONTEND_URL` to your Vercel URL (e.g., `https://wingman-abc123.vercel.app`)
   - Service will redeploy automatically

2. **Update Google OAuth in Google Console**:
   - Go to https://console.cloud.google.com
   - Navigate to "APIs & Services" → "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Add Authorized redirect URIs:
     - `https://your-backend-url.onrender.com/api/auth/google/callback`
   - Add Authorized JavaScript origins:
     - `https://your-frontend-url.vercel.app`
   - Click "Save"

---

## Step 6: Test Your Deployment! 🎉

1. **Visit your Vercel URL** (e.g., `https://wingman-abc123.vercel.app`)
2. **Register a new account**
3. **Test all features**:
   - Create goals
   - Invite a partner
   - Chat with partner
   - View partner's goals

---

## Troubleshooting

### Backend Issues
- Check Render logs: Dashboard → wingman-backend → Logs
- Common issues:
  - Database connection: Verify `DATABASE_URL` is correct
  - Migrations failed: Check Prisma schema and migrations

### Frontend Issues
- Check Vercel logs: Dashboard → wingman → Deployments → [Latest] → View Function Logs
- Common issues:
  - API not connecting: Verify `REACT_APP_API_URL` is correct
  - CORS errors: Check backend `FRONTEND_URL` matches your Vercel URL

### Still Having Issues?
- Backend health check: Visit `https://your-backend-url.onrender.com/api/health`
- Should return: `{"status":"ok"}`

---

## Important Notes

⚠️ **Free Tier Limitations**:
- Render free tier: Backend will sleep after 15 minutes of inactivity (takes ~30 seconds to wake up on first request)
- Neon free tier: 3GB storage, which is plenty for testing
- Vercel free tier: Unlimited for personal projects

🔐 **Security**:
- Your `.env` file is NOT committed to GitHub (it's in `.gitignore`)
- Never share your `JWT_SECRET`, `DATABASE_URL`, or API keys publicly

📧 **Email Configuration**:
- Currently using your Gmail credentials
- For production, consider using SendGrid or similar email service

---

## Your Deployed URLs

After completing the steps above, fill these in:

- **Frontend**: _______________________________
- **Backend**: _______________________________
- **Database**: Neon (connection string saved securely)

---

Congratulations! Your Wingman app is now live on the internet! 🚀
