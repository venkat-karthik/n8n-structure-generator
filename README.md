# 🚀 N8N Agent Blueprint Studio

> Generate import-ready n8n workflow JSON files using AI with powerful features and beautiful UI

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![AI](https://img.shields.io/badge/AI-Gemini%20%7C%20Perplexity-purple)

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Generation** - Generate workflows using Google Gemini or Perplexity AI
- **Smart Validation** - Comprehensive validation with automatic repair
- **Multiple Templates** - 5 pre-built templates + unlimited custom templates
- **Multi-Format Export** - JSON, YAML, and Markdown export options

### 📊 Analytics & Insights
- **Workflow Statistics** - Detailed analytics with visual charts
- **Complexity Analysis** - Automatic complexity scoring (Simple/Moderate/Complex)
- **AI Optimization** - Smart suggestions for workflow improvements
- **Validation Scoring** - 0-100 quality score based on best practices

### 💾 Data Management
- **Workflow History** - Automatically saves last 10 workflows
- **Favorites System** - Star and save your best workflows
- **Custom Templates** - Create reusable workflow templates
- **Shareable Links** - Generate URLs to share workflows instantly

### 🎨 User Experience
- **Dark/Light Themes** - Beautiful themes with smooth transitions
- **Keyboard Shortcuts** - Power user features (⌘+Enter, ⌘+S, ⌘+K)
- **AI Prompt Suggestions** - Smart suggestions to get started
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🔧 Developer Features
- **Mermaid Visualization** - Visual workflow diagrams
- **Plain Language Explanations** - AI-generated workflow descriptions
- **Import Instructions** - Step-by-step guide for n8n import
- **No Backend Required** - 100% client-side application

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your browser. That's it!

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000`

## 📖 Usage Guide

### 1. Select a Template
Click one of the template pills:
- 📱 Telegram Bot
- ✉️ Gmail Auto-Reply
- ⭐ Lead Qualifier
- ⏰ Scheduled Agent
- ✨ Blank (Expert Mode)

### 2. Describe Your Workflow
Write a detailed description of what you want to build, or click a prompt suggestion.

### 3. Generate
Click "Generate Workflow" or press `⌘+Enter`

### 4. Review & Optimize
- Check the **Statistics** tab for insights
- Review **Optimization** suggestions
- Read the **Explanation** for understanding
- View the **Visualizer** for a diagram

### 5. Export & Use
- Download as JSON for n8n import
- Export as YAML for documentation
- Export as Markdown for sharing
- Generate a shareable link

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + Enter` | Generate Workflow |
| `⌘/Ctrl + S` | Download JSON |
| `⌘/Ctrl + K` | Copy to Clipboard |

## 🎯 Feature Highlights

### Workflow History 📜
Never lose your work! The last 10 workflows are automatically saved and accessible from the sidebar.

### AI Optimization 🤖
Get smart suggestions to improve your workflows:
- Missing error handling detection
- Inefficient node spacing warnings
- Best practices recommendations
- Impact-based prioritization

### Statistics Dashboard 📈
Comprehensive analytics including:
- Node count and types
- Connection analysis
- Estimated execution time
- Visual distribution charts

### Custom Templates 📋
Save any workflow as a reusable template:
1. Generate a workflow
2. Click "Save as Template"
3. Access from Templates tab
4. Reuse anytime

### Shareable Links 🔗
Share workflows instantly:
1. Click "Share Link"
2. Link copied to clipboard
3. Send to anyone
4. They can load it instantly

## 🎨 Themes

### Dark Mode (Default)
Beautiful dark theme optimized for long coding sessions.

### Light Mode
Clean light theme for bright environments.

Toggle with the 🌙/☀️ button in the header.

## 📊 Workflow Complexity

Workflows are automatically analyzed and scored:

- 🟢 **Simple** - Straightforward, easy to maintain
- 🟡 **Moderate** - Some complexity, well-structured
- 🔴 **Complex** - Advanced logic, needs careful review

## 🔒 Privacy & Storage

### What's Stored Locally:
- Last 10 workflow history items
- Unlimited favorites
- Custom templates
- Theme preference

### What's NOT Stored:
- No personal information
- No tracking data
- No analytics
- No cookies

All data stays in your browser's localStorage.

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📱 Mobile Support

Fully responsive design with:
- Touch-optimized interactions
- Mobile-friendly sidebar
- Adaptive layouts
- Optimized typography

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Modern CSS with custom properties
- **AI**: Google Gemini & Perplexity AI APIs
- **Visualization**: Mermaid.js
- **Storage**: localStorage
- **No Dependencies**: Pure vanilla implementation

## 📁 Project Structure

```
n8n-agent-blueprint-studio/
├── index.html              # Main HTML file
├── app.js                  # Application logic
├── style.css               # Styles and themes
├── README.md               # This file
├── FEATURES.md             # Feature overview
├── NEW_FEATURES_COMPLETE.md # Complete feature list
├── FIXES_APPLIED.md        # Bug fixes documentation
└── TEST_FIXES.md           # Testing guide
```

## 🐛 Troubleshooting

### Issue: Functions not working
**Solution:** Make sure JavaScript is enabled and app.js is loaded

### Issue: Sidebar not opening
**Solution:** Check browser console for errors, clear cache

### Issue: Theme not persisting
**Solution:** Ensure localStorage is enabled in browser settings

### Issue: Workflow not generating
**Solution:** Check internet connection (AI APIs require network)

## 🔮 Future Enhancements

Potential additions:
- [ ] Backend integration (Firebase/Supabase)
- [ ] User authentication
- [ ] Workflow marketplace
- [ ] Real-time collaboration
- [ ] Version control
- [ ] Automated testing
- [ ] n8n API direct import
- [ ] Workflow diff viewer

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 💡 Tips & Tricks

1. **Use Templates** - Start with a template for faster results
2. **Be Specific** - Detailed prompts generate better workflows
3. **Check Optimization** - Always review AI suggestions
4. **Save Favorites** - Star your best workflows for quick access
5. **Use Shortcuts** - Keyboard shortcuts speed up your workflow
6. **Export YAML** - Great for documentation and version control
7. **Share Links** - Collaborate without accounts

## 🎓 Learning Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Workflow Best Practices](https://docs.n8n.io/workflows/best-practices/)
- [Node Reference](https://docs.n8n.io/integrations/)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review TEST_FIXES.md for testing guide
3. Check browser console for errors
4. Open an issue on GitHub

## 🌟 Acknowledgments

- n8n team for the amazing workflow automation platform
- Google Gemini for AI capabilities
- Perplexity AI for advanced reasoning
- Mermaid.js for visualization

---

**Built with ❤️ for the n8n community**

🚀 Start building amazing workflows today!
