# ⚡ Quick Start - Backend Proxy Setup

## 🎯 What Changed?

Your app now uses a **secure backend** to hide API keys!

**Before:** API keys visible in browser ❌
**After:** API keys hidden on server ✅

---

## 🚀 Start in 3 Steps

### 1️⃣ Install Backend

```bash
cd backend
npm install
```

### 2️⃣ Start Backend

```bash
npm start
```

Should see:
```
🚀 Backend server running on port 3000
🔑 Gemini API: ✅ Configured
🔑 Perplexity API: ✅ Configured
```

### 3️⃣ Start Frontend

**Open NEW terminal** (keep backend running):

```bash
cd ..
python -m http.server 8000
```

**Open browser:** `http://localhost:8000`

---

## ✅ Test It

1. Select "Lead Qualifier" template
2. Click "Generate Workflow"
3. Should work! 🎉

---

## 🐛 Not Working?

### Backend not starting?

```bash
cd backend
npm install
npm start
```

### Frontend can't connect?

Check console (F12) for errors.

Backend must be running on port 3000.

### Still issues?

See `BACKEND_SETUP_GUIDE.md` for detailed help.

---

## 📁 Project Structure

```
your-project/
├── index.html          # Frontend
├── app.js              # Frontend (updated)
├── style.css           # Styles
└── backend/
    ├── server.js       # Backend server
    ├── .env            # API keys (secret!)
    └── package.json    # Dependencies
```

---

## 🔒 Security

✅ API keys hidden on server
✅ Rate limiting (100 req/15min)
✅ CORS protection
✅ Security headers
✅ Input validation

---

## 🚀 Deploy Later

When ready to deploy:

1. **Backend:** Deploy to Heroku/Railway/Render
2. **Frontend:** Deploy to Netlify/Vercel
3. Update `API_URL` in `app.js`

See `BACKEND_SETUP_GUIDE.md` for deployment instructions.

---

## 💡 Tips

- Keep backend terminal open while developing
- Backend runs on port 3000
- Frontend runs on port 8000
- Both must be running!

---

**That's it! Your app is now secure and ready to use!** 🎉
