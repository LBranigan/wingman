# Wingman MVP - Build Checklist

Use this checklist to track your progress building the Wingman application.

## ✅ Pre-Development Setup

- [ ] Install Node.js (v18+)
- [ ] Install PostgreSQL (v14+)
- [ ] Install Git
- [ ] Install VS Code or preferred editor
- [ ] Create GitHub account
- [ ] Create Railway account (for backend hosting)
- [ ] Create Vercel account (for frontend hosting)

---

## ✅ Backend Development

### Initial Setup
- [ ] Create `backend` folder
- [ ] Run `npm init -y`
- [ ] Install dependencies (express, cors, dotenv, bcryptjs, jsonwebtoken)
- [ ] Install Prisma dependencies
- [ ] Run `npx prisma init`
- [ ] Create `.env` file with DATABASE_URL and JWT_SECRET

### Database
- [ ] Create PostgreSQL database (`wingman_db`)
- [ ] Configure `prisma/schema.prisma` with data models
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Run `npx prisma generate`
- [ ] Verify database tables created

### Folder Structure
- [ ] Create `src` folder
- [ ] Create `src/routes` folder
- [ ] Create `src/middleware` folder
- [ ] Create `src/utils` folder (optional)

### Core Files
- [ ] Create `src/server.js` (main server file)
- [ ] Create `src/middleware/auth.js` (authentication middleware)
- [ ] Add scripts to `package.json` (start, dev)

### Route Files
- [ ] Create `src/routes/auth.js` (register, login)
- [ ] Create `src/routes/users.js` (get profile, update profile)
- [ ] Create `src/routes/match.js` (request match, unmatch)
- [ ] Create `src/routes/goals.js` (CRUD operations)
- [ ] Create `src/routes/comments.js` (create comments)

### Testing Backend
- [ ] Start server with `npm run dev`
- [ ] Server runs on port 5000 without errors
- [ ] Test health endpoint: http://localhost:5000/api/health

---

## ✅ Frontend Development

### Initial Setup
- [ ] Create `frontend` folder
- [ ] Run `npx create-react-app .`
- [ ] Install dependencies (react-router-dom, axios, lucide-react)
- [ ] Install Tailwind CSS dependencies
- [ ] Configure Tailwind (`tailwind.config.js`)
- [ ] Update `src/index.css` with Tailwind directives
- [ ] Create `.env` file with REACT_APP_API_URL

### Folder Structure
- [ ] Create `src/components` folder
- [ ] Create `src/pages` folder
- [ ] Create `src/services` folder
- [ ] Create `src/contexts` folder

### Core Files
- [ ] Create `src/services/api.js` (API service with axios)
- [ ] Create `src/contexts/AuthContext.js` (authentication context)
- [ ] Update `src/App.js` (routing setup)

### Components
- [ ] Create `src/components/Layout.js` (main layout with nav)

### Pages
- [ ] Create `src/pages/LoginPage.js`
- [ ] Create `src/pages/RegisterPage.js`
- [ ] Create `src/pages/DashboardPage.js` (user's goals)
- [ ] Create `src/pages/PartnerPage.js` (partner's goals + comments)

### Testing Frontend
- [ ] Start app with `npm start`
- [ ] App opens in browser at http://localhost:3000
- [ ] No console errors
- [ ] Can navigate to login/register pages

---

## ✅ Integration Testing

### Authentication Flow
- [ ] Can register a new user
- [ ] Registration redirects to dashboard
- [ ] Can logout
- [ ] Can login with existing credentials
- [ ] Login redirects to dashboard
- [ ] Token persists in localStorage
- [ ] Protected routes work correctly

### User Matching
- [ ] Create 2 test accounts
- [ ] First user can request matching
- [ ] Second user can request matching
- [ ] Both users get matched together
- [ ] Partner info displays correctly
- [ ] Can view partner's profile

### Goals Management
- [ ] Can create a new goal
- [ ] Goal appears in list
- [ ] Can toggle goal completion
- [ ] Completion status updates correctly
- [ ] Can delete a goal
- [ ] Progress bar updates correctly
- [ ] Goals are week-specific

### Partner Interaction
- [ ] Can view partner's goals
- [ ] Can add comments to partner's goals
- [ ] Comments appear in real-time (after refresh)
- [ ] Can see own comments vs partner's comments
- [ ] Comment attribution is correct

### Error Handling
- [ ] Invalid login shows error message
- [ ] Duplicate email registration shows error
- [ ] API errors display user-friendly messages
- [ ] Loading states work correctly

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] Remove console.log statements
- [ ] Remove commented-out code
- [ ] Update .env.example files (without real credentials)
- [ ] Add .gitignore (node_modules, .env, etc.)
- [ ] Code is well-organized and readable

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] Passwords are hashed with bcrypt
- [ ] Database credentials not in code
- [ ] CORS properly configured
- [ ] SQL injection prevented (using Prisma)

### Documentation
- [ ] README.md created
- [ ] Installation instructions documented
- [ ] API endpoints documented (optional but helpful)
- [ ] Environment variables documented

---

## ✅ Deployment

### Version Control
- [ ] Initialize Git repository
- [ ] Add all files to Git
- [ ] Create initial commit
- [ ] Create GitHub repository
- [ ] Push code to GitHub

### Backend Deployment (Railway)
- [ ] Create Railway project
- [ ] Add PostgreSQL database to Railway
- [ ] Connect GitHub repository
- [ ] Set environment variables in Railway:
  - [ ] DATABASE_URL (auto-set by Railway)
  - [ ] JWT_SECRET
  - [ ] PORT (optional, Railway auto-sets)
- [ ] Deploy succeeds
- [ ] Health check endpoint works
- [ ] Note backend URL for frontend

### Frontend Deployment (Vercel)
- [ ] Import GitHub repository to Vercel
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `build`
- [ ] Set environment variable:
  - [ ] REACT_APP_API_URL (Railway backend URL)
- [ ] Deploy succeeds
- [ ] App loads without errors
- [ ] Can perform full user flow

### Post-Deployment Testing
- [ ] Register new user on production
- [ ] Create goals
- [ ] Match with another user (test with friend or second account)
- [ ] Add comments
- [ ] Verify all features work
- [ ] Test on mobile browser
- [ ] Test on different browsers (Chrome, Firefox, Safari)

---

## ✅ Post-Launch

### Monitoring
- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for errors
- [ ] Monitor database performance
- [ ] Set up alerts (optional)

### User Testing
- [ ] Share with friends/beta testers
- [ ] Collect feedback
- [ ] Document bugs/issues
- [ ] Prioritize fixes

### Future Enhancements
- [ ] Email notifications
- [ ] Password reset functionality
- [ ] Profile pictures
- [ ] Weekly progress reports
- [ ] Mobile app
- [ ] Push notifications
- [ ] Achievement system
- [ ] Better matching algorithm

---

## 📊 Progress Tracking

**Overall Progress:**
- Backend: ____ / 25 tasks complete
- Frontend: ____ / 20 tasks complete
- Integration: ____ / 15 tasks complete
- Deployment: ____ / 20 tasks complete

**Total: ____ / 80 tasks complete**

---

## 🎉 Completion

When all checkboxes are marked:
- [ ] Take screenshots of your working app
- [ ] Share with friends
- [ ] Update your portfolio
- [ ] Celebrate! 🎊

**Congratulations on building Wingman!**

---

## 📝 Notes

Use this space to track issues, questions, or ideas:

```
[Date] - [Note]
Example: 2025-01-15 - Need to fix comment sorting by date
```