// Configuration file for Dopamine Down extension

export const CONFIG = {
  // Extension metadata
  VERSION: '1.0.0',
  NAME: 'Dopamine Down',
  
  // Default settings
  DEFAULTS: {
    focusMode: false,
    focusDuration: 25,
    sensitivity: 2,
    theme: 'light',
    soundEnabled: true,
    notificationsEnabled: true
  },
  
  // Focus mode durations (in minutes)
  FOCUS_DURATIONS: [
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '25 minutes (Pomodoro)', value: 25 },
    { label: '45 minutes', value: 45 },
    { label: '60 minutes', value: 60 },
    { label: '90 minutes', value: 90 },
    { label: '120 minutes', value: 120 }
  ],
  
  // Sensitivity levels
  SENSITIVITY_LEVELS: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3
  },
  
  // Common distracting websites patterns
  DISTRACTION_PATTERNS: {
    SOCIAL_MEDIA: [
      'facebook.com',
      'instagram.com',
      'twitter.com',
      'x.com',
      'tiktok.com',
      'snapchat.com',
      'linkedin.com/feed',
      'pinterest.com',
      'reddit.com',
      'tumblr.com'
    ],
    VIDEO: [
      'youtube.com',
      'netflix.com',
      'hulu.com',
      'disneyplus.com',
      'twitch.tv',
      'vimeo.com'
    ],
    ENTERTAINMENT: [
      'buzzfeed.com',
      '9gag.com',
      'imgur.com',
      'giphy.com',
      'memes',
      'funny'
    ],
    NEWS: [
      'cnn.com',
      'bbc.com/news',
      'foxnews.com',
      'theguardian.com',
      'nytimes.com',
      'washingtonpost.com'
    ],
    SHOPPING: [
      'amazon.com/gp',
      'ebay.com',
      'aliexpress.com',
      'etsy.com',
      'walmart.com'
    ],
    GAMES: [
      'steam',
      'game',
      'play',
      'miniclip',
      'addictinggames'
    ]
  },
  
  // Productive website patterns (whitelist)
  PRODUCTIVE_PATTERNS: [
    'github.com',
    'stackoverflow.com',
    'developer.mozilla.org',
    'docs.',
    'api.',
    'documentation',
    'learn',
    'course',
    'tutorial',
    'education',
    'study',
    'research'
  ],
  
  // AI configuration (placeholder for future AI integration)
  AI: {
    PROVIDER: 'openai', // 'openai' or 'gemini'
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7,
    SYSTEM_PROMPT: 'You are a helpful AI assistant that helps people stay focused and productive. Analyze the content and determine if it\'s distracting.'
  },
  
  // Stats configuration
  STATS: {
    RESET_HOUR: 0, // Hour to reset daily stats (0 = midnight)
    RETENTION_DAYS: 30, // How many days of history to keep
    GOAL_FOCUS_MINUTES: 240 // Daily goal: 4 hours
  },
  
  // UI Configuration
  UI: {
    POPUP_WIDTH: 400,
    POPUP_MIN_HEIGHT: 500,
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    COLORS: {
      primary: '#6200ea',
      primaryDark: '#4a00b8',
      primaryLight: '#7c4dff',
      accent: '#03dac6',
      error: '#cf6679',
      success: '#4caf50',
      warning: '#ff9800',
      info: '#2196f3'
    }
  },
  
  // Notification messages
  MESSAGES: {
    FOCUS_START: 'Focus mode activated! Stay strong! 🎯',
    FOCUS_END: 'Great work! Focus session completed! 🎉',
    FOCUS_BREAK: 'Time for a break! You\'ve earned it! ☕',
    DISTRACTION_WARNING: 'Hey! Looks like you\'re getting distracted... 🤔',
    DISTRACTION_BLOCKED: 'This site is blocked during focus mode! 🚫',
    GOAL_REACHED: 'Amazing! You\'ve reached your daily goal! 🏆',
    STREAK_MILESTONE: 'Congratulations on your {days}-day streak! 🔥'
  },
  
  // Storage keys
  STORAGE_KEYS: {
    SETTINGS: 'settings',
    STATS: 'stats',
    HISTORY: 'history',
    WHITELIST: 'whitelist',
    BLACKLIST: 'blacklist',
    FOCUS_SESSIONS: 'focusSessions',
    API_KEY: 'apiKey'
  },
  
  // Feature flags
  FEATURES: {
    AI_DETECTION: false, // Enable when AI integration is ready
    ADVANCED_STATS: true,
    SOCIAL_SHARING: false,
    TEAM_MODE: false,
    CUSTOM_THEMES: false
  },
  
  // Links
  LINKS: {
    WEBSITE: 'https://github.com/yourusername/dopamine-down',
    SUPPORT: 'https://github.com/yourusername/dopamine-down/issues',
    PRIVACY: 'https://github.com/yourusername/dopamine-down/blob/main/PRIVACY.md',
    CHANGELOG: 'https://github.com/yourusername/dopamine-down/blob/main/CHANGELOG.md'
  }
};

// Export individual sections for convenience
export const DEFAULTS = CONFIG.DEFAULTS;
export const DISTRACTION_PATTERNS = CONFIG.DISTRACTION_PATTERNS;
export const PRODUCTIVE_PATTERNS = CONFIG.PRODUCTIVE_PATTERNS;
export const MESSAGES = CONFIG.MESSAGES;
export const STORAGE_KEYS = CONFIG.STORAGE_KEYS;
export const FEATURES = CONFIG.FEATURES;

export default CONFIG;
