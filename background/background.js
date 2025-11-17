// Background service worker for Dopamine Down extension

// State management
let focusMode = {
  active: false,
  duration: 25,
  startTime: null,
  timer: null
};

let settings = {
  sensitivity: 2,
  focusDuration: 25,
  apiKey: '' // Store API key for AI integration
};

let stats = {
  todayFocusTime: 0,
  todayDistractions: 0,
  lastReset: new Date().toDateString()
};

// Track which tabs have already been counted as distractions in current session
let countedDistractions = new Set();

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Dopamine Down extension installed');
  
  // Set default settings
  await chrome.storage.sync.set({
    focusMode: false,
    focusDuration: 25,
    sensitivity: 2
  });

  // Initialize stats
  await chrome.storage.local.set({
    todayFocusTime: 0,
    todayDistractions: 0,
    lastReset: new Date().toDateString(),
    focusModeActive: false,
    focusStartTime: null,
    focusSessions: [],
    distractions: [],
    stats: {
      totalFocusTime: 0,
      totalDistractions: 0,
      currentStreak: 0,
      bestStreak: 0,
      blockedCount: 0
    }
  });

  // Create context menu
  try {
    await chrome.contextMenus.create({
      id: 'quickFocus',
      title: 'Quick Focus Mode (25 min)',
      contexts: ['all']
    });
  } catch (error) {
    console.error('Error creating context menu:', error);
  }
});

// Load settings and stats on startup
chrome.runtime.onStartup.addListener(async () => {
  await loadSettings();
  await loadStats();
  await checkDailyReset();
});

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async response
});

// Handle messages
async function handleMessage(message, sender, sendResponse) {
  try {
    switch (message.action) {
      case 'startFocusMode':
        await startFocusMode(message.duration);
        sendResponse({ success: true });
        break;

      case 'stopFocusMode':
        await stopFocusMode();
        sendResponse({ success: true });
        break;

      case 'updateSensitivity':
        settings.sensitivity = message.level;
        await chrome.storage.sync.set({ sensitivity: message.level });
        sendResponse({ success: true });
        break;

      case 'updateFocusDuration':
        settings.focusDuration = message.duration;
        await chrome.storage.sync.set({ focusDuration: message.duration });
        sendResponse({ success: true });
        break;

      case 'checkDistraction':
        const isDistraction = await analyzeContent(message.url, message.title, message.content);
        sendResponse({ isDistraction });
        break;

      case 'reportDistraction':
        await recordDistraction(sender.tab?.id, message.url);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Start focus mode
async function startFocusMode(duration) {
  focusMode.active = true;
  focusMode.duration = duration || settings.focusDuration;
  focusMode.startTime = Date.now();

  // Save focus mode state to storage
  await chrome.storage.local.set({
    focusModeActive: true,
    focusStartTime: focusMode.startTime
  });

  // Set timer to end focus mode
  focusMode.timer = setTimeout(async () => {
    await endFocusMode();
  }, focusMode.duration * 60 * 1000);

  // Update badge
  chrome.action.setBadgeText({ text: '🎯' });
  chrome.action.setBadgeBackgroundColor({ color: '#6200ea' });

  // Notify all tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, { action: 'focusModeStarted' }).catch(() => {});
  });

  console.log(`Focus mode started for ${duration} minutes`);
}

// Stop focus mode
async function stopFocusMode() {
  if (focusMode.timer) {
    clearTimeout(focusMode.timer);
  }

  // Calculate focus time in minutes
  if (focusMode.startTime) {
    const focusMinutes = Math.floor((Date.now() - focusMode.startTime) / 60000);
    await updateFocusTime(focusMinutes * 60);
    
    // Record this focus session
    await recordFocusSession(focusMinutes);
  }

  focusMode.active = false;
  focusMode.startTime = null;

  // Update storage
  await chrome.storage.local.set({
    focusModeActive: false,
    focusStartTime: null
  });

  // Clear badge
  chrome.action.setBadgeText({ text: '' });

  // Notify all tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, { action: 'focusModeStopped' }).catch(() => {});
  });

  console.log('Focus mode stopped');
}

// End focus mode (when timer completes)
async function endFocusMode() {
  const focusMinutes = focusMode.duration;
  await updateFocusTime(focusMinutes * 60);
  
  // Record this focus session
  await recordFocusSession(focusMinutes);
  
  focusMode.active = false;
  focusMode.startTime = null;
  
  // Update storage
  await chrome.storage.local.set({
    focusModeActive: false,
    focusStartTime: null
  });
  
  chrome.action.setBadgeText({ text: '' });

  // Show completion notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../assets/icons/logo - 128 x 128.png',
    title: 'Focus Session Complete! 🎉',
    message: `Great job! You focused for ${focusMode.duration} minutes.`
  });

  // Notify popup
  chrome.runtime.sendMessage({ action: 'focusModeEnded' }).catch(() => {});

  // Notify all tabs
  const tabs = await chrome.tabs.query({});
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, { action: 'focusModeStopped' }).catch(() => {});
  });
}

// Analyze content for distractions (placeholder for AI integration)
async function analyzeContent(url, title, content) {
  // Simple pattern matching for now
  // TODO: Integrate with AI API for intelligent detection
  
  const distractingKeywords = [
    'youtube', 'netflix', 'facebook', 'instagram', 'twitter', 'tiktok',
    'reddit', 'gaming', 'memes', 'entertainment', 'celebrity', 'sports news'
  ];

  const urlLower = url.toLowerCase();
  const titleLower = (title || '').toLowerCase();
  
  // Check if URL or title contains distracting keywords
  const isDistracting = distractingKeywords.some(keyword => 
    urlLower.includes(keyword) || titleLower.includes(keyword)
  );

  // Adjust based on sensitivity
  if (settings.sensitivity === 1) {
    // Low sensitivity - only block obvious distractions
    return isDistracting && focusMode.active;
  } else if (settings.sensitivity === 3) {
    // High sensitivity - more strict
    return isDistracting;
  } else {
    // Medium sensitivity (default)
    return isDistracting && (focusMode.active || Math.random() > 0.5);
  }
}

// Record a distraction
async function recordDistraction(tabId = null, url = null) {
  // Create unique key for this distraction instance
  const key = `${tabId}-${url}-${Date.now()}`;
  const sessionKey = `${tabId}-${url}`;
  
  // Check if we already counted this tab+url combo recently (within 5 seconds)
  if (countedDistractions.has(sessionKey)) {
    console.log('Distraction already counted for this tab/url');
    return;
  }
  
  // Mark as counted
  countedDistractions.add(sessionKey);
  
  // Clear the tracking after 5 seconds to allow re-counting if user navigates away and back
  setTimeout(() => {
    countedDistractions.delete(sessionKey);
  }, 5000);
  
  stats.todayDistractions++;
  await chrome.storage.local.set({ 
    todayDistractions: stats.todayDistractions 
  });

  // Store distraction in historical data
  const result = await chrome.storage.local.get(['distractions', 'stats']);
  const distractions = result.distractions || [];
  const globalStats = result.stats || { blockedCount: 0, totalDistractions: 0 };
  
  distractions.push({
    url: url,
    timestamp: Date.now(),
    blocked: focusMode.active
  });
  
  globalStats.totalDistractions++;
  if (focusMode.active) {
    globalStats.blockedCount++;
  }
  
  await chrome.storage.local.set({ 
    distractions: distractions,
    stats: globalStats
  });

  console.log('Distraction recorded:', stats.todayDistractions);

  // Notify popup to update stats
  chrome.runtime.sendMessage({ action: 'updateStats' }).catch(() => {});
}

// Update focus time
async function updateFocusTime(seconds) {
  stats.todayFocusTime += seconds;
  await chrome.storage.local.set({ 
    todayFocusTime: stats.todayFocusTime 
  });

  // Notify popup to update stats
  chrome.runtime.sendMessage({ action: 'updateStats' }).catch(() => {});
}

// Record a completed focus session
async function recordFocusSession(durationMinutes) {
  const result = await chrome.storage.local.get(['focusSessions', 'stats']);
  const sessions = result.focusSessions || [];
  const globalStats = result.stats || { currentStreak: 0, bestStreak: 0, totalFocusTime: 0 };
  
  sessions.push({
    duration: durationMinutes,
    timestamp: Date.now(),
    goal: 'Focus session'
  });
  
  // Update total focus time
  globalStats.totalFocusTime += durationMinutes;
  
  // Update streak
  await updateStreak(globalStats);
  
  await chrome.storage.local.set({ 
    focusSessions: sessions,
    stats: globalStats
  });
  
  console.log(`Focus session recorded: ${durationMinutes} minutes`);
}

// Update focus streak
async function updateStreak(globalStats) {
  const today = new Date().toDateString();
  const lastSessionDate = await chrome.storage.local.get('lastSessionDate');
  
  if (lastSessionDate.lastSessionDate === today) {
    // Already had a session today, streak continues
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  if (lastSessionDate.lastSessionDate === yesterdayStr) {
    // Continue streak
    globalStats.currentStreak++;
  } else if (!lastSessionDate.lastSessionDate) {
    // First session ever
    globalStats.currentStreak = 1;
  } else {
    // Streak broken, start over
    globalStats.currentStreak = 1;
  }
  
  // Update best streak
  if (globalStats.currentStreak > globalStats.bestStreak) {
    globalStats.bestStreak = globalStats.currentStreak;
  }
  
  await chrome.storage.local.set({ lastSessionDate: today });
}

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.sync.get({
    focusMode: false,
    focusDuration: 25,
    sensitivity: 2,
    apiKey: ''
  });

  settings = result;
  focusMode.active = result.focusMode;
  focusMode.duration = result.focusDuration;
}

// Load stats from storage
async function loadStats() {
  const result = await chrome.storage.local.get({
    todayFocusTime: 0,
    todayDistractions: 0,
    lastReset: new Date().toDateString(),
    focusModeActive: false,
    focusStartTime: null
  });

  stats = result;
  
  // Restore focus mode state if it was active
  if (result.focusModeActive && result.focusStartTime) {
    focusMode.active = true;
    focusMode.startTime = result.focusStartTime;
    
    // Recalculate remaining time
    const elapsed = Date.now() - result.focusStartTime;
    const remaining = (focusMode.duration * 60 * 1000) - elapsed;
    
    if (remaining > 0) {
      focusMode.timer = setTimeout(async () => {
        await endFocusMode();
      }, remaining);
      
      chrome.action.setBadgeText({ text: '🎯' });
      chrome.action.setBadgeBackgroundColor({ color: '#6200ea' });
    } else {
      // Timer already expired, end focus mode
      await endFocusMode();
    }
  }
}

// Check if we need to reset daily stats
async function checkDailyReset() {
  const today = new Date().toDateString();
  
  if (stats.lastReset !== today) {
    // Reset stats for new day
    stats.todayFocusTime = 0;
    stats.todayDistractions = 0;
    stats.lastReset = today;
    
    await chrome.storage.local.set({
      todayFocusTime: 0,
      todayDistractions: 0,
      lastReset: today,
      focusModeActive: false,
      focusStartTime: null
    });
    
    console.log('Daily stats reset');
  }
}

// Tab activation listener - check for distractions
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (!focusMode.active) return;

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const isDistraction = await analyzeContent(tab.url, tab.title, '');
    
    if (isDistraction) {
      // Record the distraction
      await recordDistraction(tab.id, tab.url);
      
      // Show warning to user
      chrome.tabs.sendMessage(tab.id, { 
        action: 'showDistractionWarning',
        url: tab.url 
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Error checking tab:', error);
  }
});

// Tab update listener
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && focusMode.active) {
    const isDistraction = await analyzeContent(tab.url, tab.title, '');
    
    if (isDistraction) {
      // Record the distraction
      await recordDistraction(tabId, tab.url);
      
      // Show warning to user
      chrome.tabs.sendMessage(tabId, { 
        action: 'showDistractionWarning',
        url: tab.url 
      }).catch(() => {});
    }
  }
});

// Context menu click handler
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'quickFocus') {
      await startFocusMode(25);
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/logo - 128 x 128.png',
        title: 'Quick Focus Mode Activated',
        message: '25-minute focus session started! 🎯'
      });
    }
  });
}

// Check daily reset every hour
setInterval(checkDailyReset, 60 * 60 * 1000);

console.log('Dopamine Down background service worker loaded');
