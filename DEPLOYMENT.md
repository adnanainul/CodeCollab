# 🚀 CodeCollab Deployment Guide

Quick guide to deploy your CodeCollab application to production.

## ✅ Code Preparation Complete

All necessary code changes have been made:
- ✅ Environment variables configured
- ✅ Client updated to use API_URL from env
- ✅ Server CORS updated for production
- ✅ Socket.IO configured for production

---

## 📋 Deployment Checklist

### Step 1: MongoDB Atlas Setup (10 min)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. Create database user:
   - Username: `codecollab_user`
   - Password: (generate strong password, save it!)
4. Network Access: Add `0.0.0.0/0`
5. Get connection string:
   ```
   mongodb+srv://codecollab_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/codecollab
   ```

### Step 2: Deploy Server to Render (15 min)

1. Go to [Render.com](https://render.com) → Sign up/Login
2. Click "New +" → "Web Service"
3. Connect GitHub → Select `adnanainul/CodeCollab`
4. Configure:
   - **Name**: `codecollab-server`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Environment Variables** (click "Advanced"):
   ```
   MONGO_URI = mongodb+srv://codecollab_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/codecollab
   PORT = 4000
   NODE_ENV = production
   CLIENT_URL = (leave blank for now, will add after Vercel)
   ```

6. Click "Create Web Service"
7. **Save your server URL**: `https://codecollab-server-xxxx.onrender.com`

### Step 3: Update Production Environment

1. Open `client/.env.production`
2. Replace with your Render URL:
   ```env
   REACT_APP_API_URL=https://codecollab-server-xxxx.onrender.com
   REACT_APP_SOCKET_URL=https://codecollab-server-xxxx.onrender.com
   ```

### Step 4: Deploy Client to Vercel (10 min)

1. Go to [Vercel.com](https://vercel.com) → Sign up/Login
2. Click "Add New" → "Project"
3. Import `adnanainul/CodeCollab` from GitHub
4. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Environment Variables**:
   ```
   REACT_APP_API_URL = https://codecollab-server-xxxx.onrender.com
   REACT_APP_SOCKET_URL = https://codecollab-server-xxxx.onrender.com
   ```

6. Click "Deploy"
7. **Save your Vercel URL**: `https://codecollab-xyz.vercel.app`

### Step 5: Update Server with Client URL

1. Go back to Render dashboard
2. Open your `codecollab-server` service
3. Go to "Environment" → Add variable:
   ```
   CLIENT_URL = https://codecollab-xyz.vercel.app
   ```
4. Server will auto-redeploy (~2 minutes)

### Step 6: Test Your App! 🎉

1. Visit your Vercel URL
2. Register a new account
3. Login
4. Join a room
5. Test code collaboration!

---

## 🔧 Quick Commands (if needed)

### Commit and Push Latest Changes:
```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### If Render auto-deploy is off:
- Manual deploy from Render dashboard

### If Vercel auto-deploy is off:
- Push to GitHub triggers auto-deploy

---

## 🐛 Troubleshooting

**WebSocket connection fails:**
- Check CLIENT_URL in Render matches your Vercel URL
- Verify CORS in server.js includes your Vercel domain

**API calls fail:**
- Check environment variables in Vercel
- Open browser console for errors
- Verify server is running on Render

**Server spins down (Render free tier):**
- Normal behavior - first request takes ~30 seconds
- Consider paid tier for instant response

**Build fails:**
- Check build logs in Vercel/Render dashboard
- Verify all dependencies are in package.json

---

## 📱 Your App URLs

After deployment, you'll have:
- **Frontend**: https://codecollab-xyz.vercel.app
- **Backend**: https://codecollab-server-xxxx.onrender.com
- **Database**: MongoDB Atlas (managed)

---

## 🎯 Next Steps After Deployment

1. **Share your app!**
2. **Custom domain** (optional):
   - Vercel: Settings → Domains → Add
3. **Monitor usage**:
   - Render dashboard for server logs
   - MongoDB Atlas for database metrics
4. **Update README** with live demo link

---

## 💡 Tips

- **Free tier limitations**: Server spins down after 15 min inactivity
- **First load**: May take 20-30 seconds after spin-down
- **Updates**: Push to GitHub auto-deploys both services
- **Rollback**: Vercel/Render dashboards have rollback options

---

Ready to deploy? Follow the steps above! 🚀

Need help? Check the detailed [deployment_plan.md](file:///C:/Users/91745/.gemini/antigravity/brain/2c0f88ff-1683-45b8-8ed9-0bcf0e2ef16c/deployment_plan.md)
