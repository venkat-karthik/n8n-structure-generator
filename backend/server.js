require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Set your frontend URL in production
  methods: ['POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini API proxy
app.post('/api/gemini', async (req, res) => {
  try {
    const { systemPrompt, userPrompt, model } = req.body;
    
    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const selectedModel = model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', errorBody);
      return res.status(response.status).json({ 
        error: `Gemini API error: ${response.status}`,
        details: errorBody 
      });
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return res.status(500).json({ error: 'Gemini returned an empty response' });
    }

    res.json({ 
      text: data.candidates[0].content.parts[0].text,
      model: selectedModel 
    });

  } catch (error) {
    console.error('Gemini proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Perplexity API proxy
app.post('/api/perplexity', async (req, res) => {
  try {
    const { systemPrompt, userPrompt, model } = req.body;
    
    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const selectedModel = model || 'sonar-pro';
    const url = 'https://api.perplexity.ai/chat/completions';

    const body = {
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      top_p: 0.9,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Perplexity API error:', errorBody);
      return res.status(response.status).json({ 
        error: `Perplexity API error: ${response.status}`,
        details: errorBody 
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Perplexity returned an empty response' });
    }

    res.json({ 
      text: data.choices[0].message.content,
      model: selectedModel 
    });

  } catch (error) {
    console.error('Perplexity proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🔑 Perplexity API: ${process.env.PERPLEXITY_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});
