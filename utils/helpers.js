// Utility functions for Dopamine Down extension

/**
 * Format time in minutes to readable string
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string (e.g., "2h 30m")
 */
export function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Get domain from URL
 * @param {string} url - Full URL
 * @returns {string} Domain name
 */
export function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Check if URL matches distraction patterns
 * @param {string} url - URL to check
 * @param {string[]} patterns - Array of patterns to match
 * @returns {boolean} True if URL matches any pattern
 */
export function matchesPattern(url, patterns) {
  const urlLower = url.toLowerCase();
  return patterns.some(pattern => urlLower.includes(pattern.toLowerCase()));
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Get current date string (YYYY-MM-DD)
 * @returns {string} Date string
 */
export function getDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid
 */
export function validateApiKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.length > 20;
}

/**
 * Get time of day greeting
 * @returns {string} Greeting message
 */
export function getGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate streak days
 * @param {string[]} dates - Array of date strings
 * @returns {number} Current streak length
 */
export function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  
  const sortedDates = dates.sort().reverse();
  const today = getDateString();
  
  if (sortedDates[0] !== today) return 0;
  
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const dayDiff = (prevDate - currDate) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Safe storage get with defaults
 * @param {Object} chrome - Chrome API object
 * @param {string} area - Storage area ('sync' or 'local')
 * @param {Object} defaults - Default values
 * @returns {Promise<Object>} Storage values
 */
export async function safeStorageGet(chrome, area, defaults) {
  try {
    const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local;
    return await storage.get(defaults);
  } catch (error) {
    console.error('Storage get error:', error);
    return defaults;
  }
}

/**
 * Safe storage set
 * @param {Object} chrome - Chrome API object
 * @param {string} area - Storage area ('sync' or 'local')
 * @param {Object} data - Data to store
 * @returns {Promise<boolean>} Success status
 */
export async function safeStorageSet(chrome, area, data) {
  try {
    const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local;
    await storage.set(data);
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

/**
 * Check if current time is within work hours
 * @param {number} startHour - Start hour (0-23)
 * @param {number} endHour - End hour (0-23)
 * @returns {boolean} True if within work hours
 */
export function isWorkHours(startHour = 9, endHour = 17) {
  const hour = new Date().getHours();
  return hour >= startHour && hour < endHour;
}

/**
 * Get motivational message
 * @returns {string} Random motivational message
 */
export function getMotivationalMessage() {
  const messages = [
    'You\'re doing great! Keep up the focus! 💪',
    'Every moment of focus counts! 🎯',
    'Deep work leads to deep results! 🚀',
    'Stay strong, your future self will thank you! 🌟',
    'Focus is your superpower! ⚡',
    'One focused hour is worth ten distracted ones! ⏰',
    'You\'re building a better version of yourself! 🎨',
    'Greatness requires focus! 🏆'
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}
