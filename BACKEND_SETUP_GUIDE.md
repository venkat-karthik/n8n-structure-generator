# 🚀 Backend Setup Guide - Complete Instructions

## ✅ What You Have Now

Your project now uses a **secure backend proxy** to hide API keys!

```
Project Structure:
├── frontend/
│   ├── index.html
│   ├── app.js (updated to use backend)
│   └── style.css
└── backend/
    ├── server.js (API proxy)
    ├── package.json
    ├── .env (your API keys - secret!)
    └── README.md
```

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- `express` - Web server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting

### Step 2: Start Backend Server

```bash
npm start
```

You should see:
```
🚀 Backend server running on port 3000
📍 Health check: http://localhost:3000/health
🔑 Gemini API: ✅ Configured
🔑 Perplexity API: ✅ Configured
```

### Step 3: Start Frontend

Open a **new terminal** (keep backend running):

```bash
cd ..  # Go back to project root
python -m http.server 8000
```

### Step 4: Test It!

Open browser: `http://localhost:8000`

1. Select a template
2. Click "Generate Workflow"
3. Should work! 🎉

---

## 🔍 How It Works

### Before (Insecure):
```
Browser → Google Gemini API (with exposed key)
```

### After (Secure):
```
Browser → Your Backend → Google Gemini API (key hidden)
```

**Your API keys never leave the server!** ✅

---

## 📁 Backend Files Explained

### `server.js`
Main server file with:
- `/health` - Check if server is running
- `/api/gemini` - Proxy for Gemini API
- `/api/perplexity` - Proxy for Perplexity API
- Rate limiting (100 requests per 15 min)
- Security headers
- Error handling

### `.env`
Your secret API keys:
```
GEMINI_API_KEY=your_key_here
PERPLEXITY_API_KEY=your_key_here
PORT=3000
FRONTEND_URL=http://localhost:8000
```

**⚠️ NEVER commit this file to Git!**

### `package.json`
Dependencies and scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## 🧪 Testing

### Test Backend Health

```bash
curl http://localhost:3000/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Gemini Endpoint

```bash
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "You are helpful",
    "userPrompt": "Say hello"
  }'
```

### Test Perplexity Endpoint

```bash
curl -X POST http://localhost:3000/api/perplexity \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "You are helpful",
    "userPrompt": "Say hello"
  }'
```

---

## 🚀 Deployment

### Option 1: Heroku (Free Tier)

```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # Mac
# or download from https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
cd backend
heroku create your-app-name

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set PERPLEXITY_API_KEY=your_key
heroku config:set FRONTEND_URL=https://your-frontend.com

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main

# Your backend is live at:
# https://your-app-name.herokuapp.com
```

### Option 2: Railway (Easiest)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repo
5. Select `backend` folder
6. Add environment variables:
   - `GEMINI_API_KEY`
   - `PERPLEXITY_API_KEY`
   - `FRONTEND_URL`
7. Deploy!

### Option 3: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Deploy!

### Option 4: Vercel (Serverless)

```bash
cd backend
npm install -g vercel
vercel
```

---

## 🔧 Update Frontend for Production

After deploying backend, update `app.js`:

```javascript
// Change this line (around line 6):
const API_URL = 'http://localhost:3000/api';

// To your deployed backend URL:
const API_URL = 'https://your-backend.herokuapp.com/api';
```

Then deploy your frontend to:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

---

## 🐛 Troubleshooting

### "Backend not available"

**Check if backend is running:**
```bash
curl http://localhost:3000/health
```

**If not running:**
```bash
cd backend
npm start
```

### "CORS error"

**Update `.env` in backend:**
```
FRONTEND_URL=http://localhost:8000
```

**Restart backend after changing `.env`**

### "API key not configured"

**Check `.env` file exists:**
```bash
cd backend
cat .env
```

**Should contain:**
```
GEMINI_API_KEY=AIzaSy...
PERPLEXITY_API_KEY=pplx-...
```

### "Port 3000 already in use"

**Kill process on port 3000:**
```bash
lsof -ti:3000 | xargs kill
```

**Or change port in `.env`:**
```
PORT=3001
```

### "Module not found"

**Reinstall dependencies:**
```bash
cd backend
rm -rf node_modules
npm install
```

---

## 📊 Monitoring

### Check Server Logs

```bash
cd backend
npm start
```

Watch for:
- ✅ "Backend server running"
- ✅ "Gemini API: ✅ Configured"
- ✅ "Perplexity API: ✅ Configured"

### Check Request Logs

Server logs every request:
```
POST /api/gemini 200 1234ms
POST /api/perplexity 200 2345ms
```

---

## 🔒 Security Features

Your backend includes:

1. **Helmet.js** - Security headers
2. **CORS** - Only your frontend can access
3. **Rate Limiting** - 100 requests per 15 min per IP
4. **Environment Variables** - Keys never in code
5. **Input Validation** - Validates all requests
6. **Error Handling** - Doesn't leak sensitive info

---

## 💰 Cost Estimate

### Backend Hosting:
- **Heroku:** Free tier available
- **Railway:** $5/month (500 hours free)
- **Render:** Free tier available
- **Vercel:** Free for hobby projects

### API Costs:
- **Google Gemini:** ~$0.00025 per request
- **Perplexity:** Depends on plan

**Example:** 1000 requests/month = ~$0.25

---

## 🎉 You're Done!

Your app now has:
- ✅ Secure API key storage
- ✅ Backend proxy
- ✅ Rate limiting
- ✅ Professional architecture
- ✅ Ready for production

**Next Steps:**
1. Deploy backend to Heroku/Railway/Render
2. Update frontend API_URL
3. Deploy frontend to Netlify/Vercel
4. Share your app! 🚀

---

## 📞 Need Help?

Check:
- `backend/README.md` - Backend documentation
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `README.md` - User guide

---

**Congratulations! You now have a secure, production-ready application!** 🎉
