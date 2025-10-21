# Wingman - Quick Start Guide for Beginners

This guide will walk you through setting up Wingman step-by-step, even if you're new to web development.

## 📋 What You'll Need

Before starting, install these tools on your computer:

### 1. Install Node.js
- Go to https://nodejs.org
- Download the LTS (Long Term Support) version
- Run the installer
- Verify installation by opening Terminal/Command Prompt and typing:
  ```bash
  node --version
  npm --version
  ```

### 2. Install PostgreSQL
- Go to https://www.postgresql.org/download/
- Download for your operating system
- Run the installer (remember the password you set!)
- Verify installation:
  ```bash
  psql --version
  ```

### 3. Install a Code Editor
- Download VS Code: https://code.visualstudio.com
- Install it on your computer

### 4. Create accounts (for deployment later)
- GitHub: https://github.com (free)
- Railway: https://railway.app (free tier)
- Vercel: https://vercel.com (free tier)

---

## 🚀 Step-by-Step Setup

### Part 1: Create the Project Folders

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you want to create the project:
   ```bash
   cd Desktop
   ```
3. Create the project:
   ```bash
   mkdir wingman
   cd wingman
   mkdir backend frontend
   ```

### Part 2: Set Up the Database

1. Open Terminal and start PostgreSQL:
   ```bash
   # Mac/Linux
   psql -U postgres
   
   # Windows (use pgAdmin or psql from Start menu)
   ```

2. Create the database:
   ```sql
   CREATE DATABASE wingman_db;
   \q
   ```

### Part 3: Set Up the Backend

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Initialize the project:
   ```bash
   npm init -y
   ```

3. Install all required packages:
   ```bash
   npm install express cors dotenv bcryptjs jsonwebtoken
   npm install prisma @prisma/client
   npm install --save-dev nodemon
   ```

4. Initialize Prisma:
   ```bash
   npx prisma init
   ```

5. Open the project in VS Code:
   ```bash
   code .
   ```

6. Create the `.env` file in the `backend` folder:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/wingman_db?schema=public"
   JWT_SECRET="your-super-secret-key-change-this-123456"
   PORT=5000
   ```
   **Important:** Replace `YOUR_PASSWORD` with your PostgreSQL password!

7. Copy the database schema:
   - Open `prisma/schema.prisma`
   - Replace everything with the schema from the main instructions

8. Create the database tables:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

9. Create the folder structure:
   ```bash
   mkdir src
   mkdir src/routes src/middleware
   ```

10. Create all the backend files:
    - Copy each file from the main instructions into the correct location
    - `src/server.js`
    - `src/middleware/auth.js`
    - `src/routes/auth.js`
    - `src/routes/users.js`
    - `src/routes/goals.js`
    - `src/routes/comments.js`
    - `src/routes/match.js`

11. Update `package.json` to add scripts:
    ```json
    {
      "scripts": {
        "start": "node src/server.js",
        "dev": "nodemon src/server.js"
      }
    }
    ```

12. Start the backend:
    ```bash
    npm run dev
    ```
    You should see: "Server running on port 5000"

### Part 4: Set Up the Frontend

1. Open a NEW terminal window (keep the backend running)
2. Navigate to frontend folder:
   ```bash
   cd ../frontend
   ```

3. Create React app:
   ```bash
   npx create-react-app .
   ```

4. Install required packages:
   ```bash
   npm install react-router-dom axios lucide-react
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

5. Configure Tailwind:
   - Open `tailwind.config.js`
   - Replace with:
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

6. Update `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

7. Create the folder structure:
   ```bash
   mkdir src/components src/pages src/services src/contexts
   ```

8. Create `.env` file in frontend folder:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

9. Create all frontend files:
   - Copy files from the provided components:
     - `src/services/api.js`
     - `src/contexts/AuthContext.js`
     - `src/components/Layout.js`
     - `src/pages/LoginPage.js`
     - `src/pages/RegisterPage.js`
     - `src/pages/DashboardPage.js`
     - `src/pages/PartnerPage.js`
     - `src/App.js`

10. Start the frontend:
    ```bash
    npm start
    ```
    Your browser should open to http://localhost:3000

---

## ✅ Testing Your Application

Now you should have both running:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Test the App:

1. **Create Account**
   - Go to http://localhost:3000
   - Click "Sign up"
   - Fill in the form
   - Click "Create Account"

2. **Create Goals**
   - You should be logged in automatically
   - Add some weekly goals
   - Mark some as complete

3. **Test Matching** (You'll need 2 accounts)
   - Open an incognito/private browser window
   - Create a second account
   - In one account, click "Find a Partner"
   - Refresh both browsers - they should be matched!

4. **Test Comments**
   - Go to "Partner" tab
   - See your partner's goals
   - Add comments

---

## 🐛 Common Problems & Solutions

### Problem: "npm: command not found"
**Solution:** Node.js isn't installed. Go back to "What You'll Need" section.

### Problem: "Cannot connect to database"
**Solutions:**
1. Make sure PostgreSQL is running
2. Check your password in the `.env` file
3. Make sure the database `wingman_db` exists

### Problem: "Port 5000 already in use"
**Solutions:**
1. Change PORT in backend `.env` to 5001
2. Update frontend `.env` REACT_APP_API_URL to use 5001

### Problem: "Cannot find module"
**Solution:** Run `npm install` in that folder again

### Problem: Frontend can't connect to backend
**Solutions:**
1. Make sure backend is running (`npm run dev` in backend folder)
2. Check that REACT_APP_API_URL in frontend `.env` matches backend PORT
3. Restart the frontend after changing `.env`

### Problem: CORS errors
**Solution:** Backend already has CORS enabled. Make sure you're using http://localhost:3000 for frontend.

---

## 📱 Next Steps

### Deploy to Production

Once everything works locally:

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy Backend to Railway:**
   - Go to railway.app
   - Create new project
   - Add PostgreSQL database
   - Deploy from GitHub
   - Add environment variables in Railway dashboard

3. **Deploy Frontend to Vercel:**
   - Go to vercel.com
   - Import GitHub repository
   - Set REACT_APP_API_URL to your Railway backend URL
   - Deploy

---

## 💡 Tips for Success

1. **Keep both terminals open** - one for backend, one for frontend
2. **Check the console** - Look for error messages in:
   - Terminal (backend errors)
   - Browser console (frontend errors - press F12)
3. **Save your files** - Changes won't apply until you save
4. **Restart if needed** - Sometimes you need to restart the servers
5. **Read error messages** - They usually tell you what's wrong

---

## 📚 Learning Resources

If you want to learn more about the technologies:

- **React:** https://react.dev/learn
- **Node.js:** https://nodejs.org/en/learn
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🆘 Need Help?

If you get stuck:
1. Read the error message carefully
2. Check the "Common Problems" section above
3. Google the exact error message
4. Check that all files are in the correct locations
5. Make sure all dependencies are installed (`npm install`)

Remember: Everyone gets stuck sometimes. Debugging is part of the learning process!

---

**Good luck building Wingman! 🤝**