# Dopamine Down - Installation Guide

## 🚀 Quick Start

### Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the `DopamineDown` folder
   - Select the folder and click "Select Folder"

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Dopamine Down"
   - Click the pin icon to keep it visible

### Using the Extension

1. **Click the extension icon** in your Chrome toolbar
2. **Toggle Focus Mode** to start tracking and blocking distractions
3. **Set your focus duration** (default is 25 minutes - Pomodoro style)
4. **Adjust sensitivity** to control how strict the distraction detection is

## 📋 Requirements

- **Google Chrome** (version 88 or higher)
- **Developer Mode** enabled in Chrome

## 🎨 Features Available

### Current Features ✅
- Focus Mode with customizable duration
- Basic distraction detection
- Real-time statistics (focus time, distractions caught)
- Material Design UI
- Gentle warning overlays
- Sensitivity adjustment
- Daily stats tracking

### Coming Soon 🚧
- AI-powered intelligent distraction detection
- Detailed productivity analytics
- Custom whitelist/blacklist management
- Break reminders
- Productivity streaks
- Export statistics

## 🔧 Configuration

### Settings
Open the extension popup and configure:
- **Focus Mode**: Enable/disable active monitoring
- **Duration**: Set focus session length (5-180 minutes)
- **Sensitivity**: Low, Medium, or High detection strictness

### Keyboard Shortcuts (Coming Soon)
- `Ctrl+Shift+F` - Quick toggle focus mode
- `Ctrl+Shift+S` - View statistics

## 🐛 Troubleshooting

### Extension Not Loading?
- Make sure Developer Mode is enabled
- Check that all files are present in the folder
- Try reloading the extension (click the refresh icon)

### Popup Not Showing?
- Right-click the extension icon and select "Inspect popup"
- Check the console for any errors

### Icons Not Displaying?
- The extension needs proper icon files (see `assets/icons/README.md`)
- You can use placeholder images for testing

### Stats Not Updating?
- Open the extension popup to refresh stats
- Check Chrome's background service worker console

## 📁 Project Structure

```
DopamineDown/
├── manifest.json          # Extension configuration
├── popup/                 # Extension popup
│   ├── popup.html        # Popup UI
│   ├── popup.css         # Material Design styles
│   └── popup.js          # Popup logic
├── background/           # Background service worker
│   └── background.js     # Core extension logic
├── content/              # Content scripts (runs on web pages)
│   ├── content.js        # Page analysis & warnings
│   └── content.css       # Warning overlay styles
├── assets/              # Icons and images
│   └── icons/           # Extension icons (16, 32, 48, 128)
├── utils/               # Utility functions
│   ├── helpers.js       # Helper functions
│   └── config.js        # Configuration constants
└── package.json         # Project metadata
```

## 🎯 Next Steps

1. **Generate Icons**: Create PNG icons in the required sizes
2. **Test Focus Mode**: Try browsing distracting sites with focus mode on
3. **Customize Settings**: Adjust sensitivity to your preference
4. **Track Progress**: Use the stats to monitor your productivity

## 💡 Tips

- Start with **medium sensitivity** to get familiar with the extension
- Use **25-minute focus sessions** (Pomodoro technique) for best results
- Review your **daily stats** to track improvement
- Gradually increase sensitivity as you build better habits

## 🔗 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Material Design Guidelines](https://material.io/design)
- [Project Repository](https://github.com/umerkha2007/DopamineDown)

## 📝 Development

For development and contribution guidelines, see the main README.md

---

**Need Help?** Open an issue on GitHub or check the troubleshooting section above!
