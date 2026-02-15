# 🚀 Vercel Deployment Guide

## Current Issue
Your frontend is deployed on Vercel, but the backend is not running. The app needs both frontend AND backend to work.

## Solution: Deploy Backend + Update Frontend

### Step 1: Deploy Backend to Render (Free)

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `venkat-karthik/n8n-structure-generator`
4. Configure EXACTLY as follows:
   - **Name**: `n8n-backend` (or any name you prefer)
   - **Region**: Oregon (US West) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ IMPORTANT!
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   - Key: `GEMINI_API_KEY`, Value: your Gemini API key
   - Key: `PERPLEXITY_API_KEY`, Value: your Perplexity API key
6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Once deployed, copy your backend URL from the top of the page (e.g., `https://n8n-backend-xyz.onrender.com`)

**Important Notes:**
- Make sure "Root Directory" is set to `backend` - this is critical!
- The free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up

### Step 2: Update Frontend with Backend URL

Open `app.js` and find this line (around line 10):
```javascript
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://your-backend-url.onrender.com'; // Replace with your actual backend URL
```

Replace `https://your-backend-url.onrender.com` with your actual Render backend URL.

### Step 3: Push Changes to GitHub

```bash
git add app.js
git commit -m "Update backend URL for production"
git push origin main
```

Vercel will automatically redeploy your frontend with the new backend URL.

---

## Alternative: Deploy Everything to Render

If you want both frontend and backend on the same platform:

### Option A: Two Separate Services on Render

1. **Backend Service** (as described above)
2. **Frontend Service**:
   - New Static Site
   - Build Command: (leave empty)
   - Publish Directory: `.` (root)

### Option B: Single Service with Express Serving Frontend

Modify `backend/server.js` to serve static files:

```javascript
// Add this after other middleware
app.use(express.static(path.join(__dirname, '..')));

// Add this at the end, before app.listen
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});
```

Then deploy as a single web service with root directory as `.` (root).

---

## Quick Fix: Use Environment Variable

Better approach - use environment variable in `app.js`:

```javascript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
```

Then in Vercel, add environment variable:
- Key: `VITE_BACKEND_URL`
- Value: `https://your-backend-url.onrender.com`

---

## Recommended Setup

**Frontend (Vercel):**
- Automatic deployments from GitHub
- Free tier
- Fast CDN

**Backend (Render):**
- Free tier (sleeps after 15 min inactivity)
- Wakes up on first request (may take 30 seconds)
- Secure environment variables

**Total Cost:** $0/month

---

## Testing

After deployment:
1. Visit your Vercel URL
2. Open browser console (F12)
3. Look for "✅ Backend connected" message
4. Try generating a workflow
5. If it works, you're done!

---

## Troubleshooting

**Error: "Backend server is not running"**
- Check if backend is deployed and running on Render
- Verify backend URL in `app.js` is correct
- Check Render logs for errors

**Error: "CORS error"**
- Backend `server.js` already has CORS enabled
- Make sure you're using HTTPS for backend URL

**Backend is slow**
- Render free tier sleeps after 15 min
- First request wakes it up (30 sec delay)
- Consider upgrading to paid tier ($7/month) for always-on

---

## Need Help?

1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check browser console for errors (F12)
