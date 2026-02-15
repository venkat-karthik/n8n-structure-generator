# N8N Workflow Generator - Backend

Secure backend proxy for API calls to Google Gemini and Perplexity AI.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

### 3. Run Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Gemini API Proxy
```
POST /api/gemini
```

Request:
```json
{
  "systemPrompt": "You are a helpful assistant",
  "userPrompt": "Generate a workflow",
  "model": "gemini-2.0-flash" // optional
}
```

Response:
```json
{
  "text": "Generated response...",
  "model": "gemini-2.0-flash"
}
```

### Perplexity API Proxy
```
POST /api/perplexity
```

Request:
```json
{
  "systemPrompt": "You are a helpful assistant",
  "userPrompt": "Generate a workflow",
  "model": "sonar-pro" // optional
}
```

Response:
```json
{
  "text": "Generated response...",
  "model": "sonar-pro"
}
```

## 🔒 Security Features

- ✅ **Helmet.js** - Security headers
- ✅ **CORS** - Cross-origin protection
- ✅ **Rate Limiting** - 100 requests per 15 minutes per IP
- ✅ **Environment Variables** - API keys never exposed
- ✅ **Input Validation** - Request validation
- ✅ **Error Handling** - Graceful error responses

## 🌐 Deployment

### Option 1: Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set PERPLEXITY_API_KEY=your_key
heroku config:set FRONTEND_URL=https://your-frontend.com

# Deploy
git push heroku main
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### Option 3: Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Set environment variables
5. Deploy!

### Option 4: Vercel (Serverless)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 📊 Monitoring

### Check Server Status

```bash
curl http://localhost:3000/health
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

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PERPLEXITY_API_KEY` | Perplexity AI API key | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: *) |

### Rate Limiting

Default: 100 requests per 15 minutes per IP

To change, edit `server.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## 🐛 Troubleshooting

### "API key not configured"
- Check `.env` file exists
- Verify API keys are set
- Restart server after changing `.env`

### "CORS error"
- Set `FRONTEND_URL` in `.env`
- Make sure frontend URL matches exactly

### "Too many requests"
- Rate limit exceeded
- Wait 15 minutes or adjust rate limit

### "Port already in use"
- Change `PORT` in `.env`
- Or kill process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill
  ```

## 📝 Development

### Project Structure

```
backend/
├── server.js           # Main server file
├── package.json        # Dependencies
├── .env               # Environment variables (secret!)
├── .env.example       # Example env file
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

### Adding New Endpoints

```javascript
app.post('/api/new-endpoint', async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🚀 Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set proper `FRONTEND_URL`
- [ ] Use strong API keys
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Set up backups
- [ ] Test all endpoints
- [ ] Load test
- [ ] Set up alerts

## 📞 Support

For issues or questions, check the main project README.
