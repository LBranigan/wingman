# Quick Start - Deploy in 15 Minutes! ⚡

Follow these steps in order:

## 1️⃣ Push to GitHub (5 minutes)

```bash
# Open terminal in C:\Users\brani\Desktop\wingman
cd C:\Users\brani\Desktop\wingman

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Create repo on GitHub:
# 1. Go to https://github.com/new
# 2. Name: wingman
# 3. Click "Create repository"
# 4. Copy the commands or use these:

git remote add origin https://github.com/YOUR_USERNAME/wingman.git
git branch -M main
git push -u origin main
```

## 2️⃣ Set Up Database (3 minutes)

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project: `wingman-db`
4. **COPY THE CONNECTION STRING** - looks like:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Save it somewhere safe!

## 3️⃣ Deploy Backend (5 minutes)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect `wingman` repo
5. Fill in:
   - Name: `wingman-backend`
   - Root Directory: `backend`
   - Build: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start: `npm start`
6. Add Environment Variables (Advanced button):
   - `DATABASE_URL`: [Your Neon connection string]
   - `JWT_SECRET`: `my-super-secret-jwt-key-12345`
   - `EMAIL_HOST`: `smtp.gmail.com`
   - `EMAIL_PORT`: `587`
   - `EMAIL_USER`: `your-email@gmail.com`
   - `EMAIL_PASSWORD`: `your-app-password-here`
   - `FRONTEND_URL`: [Leave blank for now]
   - `GOOGLE_CLIENT_ID`: `your-google-client-id.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET`: `your-google-client-secret`
   - `GOOGLE_CALLBACK_URL`: [Leave blank for now]
7. Click "Create Web Service"
8. **SAVE THE URL** when it's deployed!

## 4️⃣ Deploy Frontend (2 minutes)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `wingman` repo
5. Fill in:
   - Framework: Create React App
   - Root Directory: `frontend`
6. Add Environment Variable:
   - `REACT_APP_API_URL`: `https://your-render-url.onrender.com/api`
7. Click "Deploy"
8. **SAVE THE URL** when it's deployed!

## 5️⃣ Update URLs (2 minutes)

### Update Backend Environment Variables:
1. Go back to Render → wingman-backend → Environment
2. Update these:
   - `FRONTEND_URL`: `https://your-vercel-url.vercel.app`
   - `GOOGLE_CALLBACK_URL`: `https://your-render-url.onrender.com/api/auth/google/callback`
3. Save (auto-redeploys)

### Update Google OAuth:
1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials
3. Edit OAuth 2.0 Client
4. Add Authorized redirect URIs:
   - `https://your-render-url.onrender.com/api/auth/google/callback`
5. Add Authorized JavaScript origins:
   - `https://your-vercel-url.vercel.app`
6. Save

## 6️⃣ Test! 🎉

Visit your Vercel URL and test:
- ✅ Register account
- ✅ Create goals
- ✅ Invite partner
- ✅ Chat
- ✅ View partner goals

---

## Need Help?

Check backend health: `https://your-render-url.onrender.com/api/health`

Should return: `{"status":"ok"}`

See full details in `DEPLOYMENT_GUIDE.md`
