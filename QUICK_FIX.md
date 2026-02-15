# ⚡ Quick Fix: Deploy Without Backend

If you want to deploy immediately without setting up a backend, here's a quick solution that lets users provide their own API keys.

## Changes Needed

### 1. Add API Key Input to UI

Add this to `index.html` after the provider dropdown (around line 50):

```html
<!-- API Key Input (shown when needed) -->
<div id="api-key-section" style="display: none; margin-top: 15px;">
  <label for="api-key-input" style="display: block; margin-bottom: 5px; color: var(--text-secondary);">
    API Key (stored locally in your browser)
  </label>
  <input 
    type="password" 
    id="api-key-input" 
    placeholder="Enter your API key"
    style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary);"
  />
  <small style="color: var(--text-secondary); display: block; margin-top: 5px;">
    Get your key: 
    <a href="https://aistudio.google.com/app/apikey" target="_blank" id="api-key-link">Google Gemini</a> | 
    <a href="https://www.perplexity.ai/settings/api" target="_blank">Perplexity</a>
  </small>
</div>
```

### 2. Update JavaScript to Use User Keys

Replace the backend API calls in `app.js` with direct API calls using user-provided keys.

Find the `attemptGeneration` function and replace it with:

```javascript
async function attemptGeneration(prompt, provider, attempt = 1) {
  const maxAttempts = 3;
  
  try {
    // Get API key from localStorage or input
    const apiKey = localStorage.getItem(`${provider}-api-key`) || 
                   document.getElementById('api-key-input')?.value;
    
    if (!apiKey) {
      showToast('Please enter your API key', 'error');
      document.getElementById('api-key-section').style.display = 'block';
      return null;
    }
    
    // Save key for future use
    localStorage.setItem(`${provider}-api-key`, apiKey);
    
    let response;
    
    if (provider === 'gemini') {
      // Direct Gemini API call
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API call failed');
      
      return data.candidates[0].content.parts[0].text;
      
    } else if (provider === 'perplexity') {
      // Direct Perplexity API call
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: prompt }]
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API call failed');
      
      return data.choices[0].message.content;
    }
    
  } catch (error) {
    console.error(`Attempt ${attempt} failed:`, error);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      showToast('Invalid API key. Please check your key.', 'error');
      localStorage.removeItem(`${provider}-api-key`);
      document.getElementById('api-key-section').style.display = 'block';
      return null;
    }
    
    if (attempt < maxAttempts) {
      showToast(`Attempt ${attempt} failed, retrying...`, 'warning');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return attemptGeneration(prompt, provider, attempt + 1);
    }
    
    throw error;
  }
}
```

### 3. Show API Key Input Based on Provider

Add this function to show/hide API key input:

```javascript
// Show API key input when provider changes
document.getElementById('ai-provider')?.addEventListener('change', (e) => {
  const provider = e.target.value;
  const apiKey = localStorage.getItem(`${provider}-api-key`);
  const apiKeySection = document.getElementById('api-key-section');
  const apiKeyLink = document.getElementById('api-key-link');
  
  if (!apiKey) {
    apiKeySection.style.display = 'block';
    
    // Update link based on provider
    if (provider === 'gemini') {
      apiKeyLink.href = 'https://aistudio.google.com/app/apikey';
      apiKeyLink.textContent = 'Get Gemini API Key';
    } else {
      apiKeyLink.href = 'https://www.perplexity.ai/settings/api';
      apiKeyLink.textContent = 'Get Perplexity API Key';
    }
  } else {
    apiKeySection.style.display = 'none';
  }
});
```

### 4. Remove Backend Check

Remove or comment out the `checkBackend()` function call since we're not using a backend anymore.

## Pros & Cons

### ✅ Pros:
- Works immediately on Vercel/Netlify
- No backend setup needed
- No server costs
- Users control their own API usage

### ❌ Cons:
- Users need to get their own API keys
- API keys stored in browser (less secure than backend)
- Users responsible for API costs
- More friction for users

## Deploy

After making these changes:

```bash
git add .
git commit -m "Add user API key support for static deployment"
git push origin main
```

Vercel will automatically redeploy.

---

## Which Option Should You Choose?

**Use Backend (Recommended):**
- Better user experience
- More secure
- You control API usage
- Professional solution

**Use User Keys (Quick Fix):**
- Faster to deploy
- No backend maintenance
- Good for demos/testing
- Users need technical knowledge

Choose based on your needs!
