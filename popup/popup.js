// Popup functionality for Dopamine Down extension

// DOM Elements
const focusModeToggle = document.getElementById('focusModeToggle');
const focusModeSettings = document.getElementById('focusModeSettings');
const focusDuration = document.getElementById('focusDuration');
const sensitivity = document.getElementById('sensitivity');
const settingsBtn = document.getElementById('settingsBtn');
const statsBtn = document.getElementById('statsBtn');
const focusTimeDisplay = document.getElementById('focusTime');
const distractionsDisplay = document.getElementById('distractions');
const statusElement = document.getElementById('status');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await updateStats();
  setupEventListeners();
});

// Load saved settings from Chrome storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({
      focusMode: false,
      focusDuration: 25,
      sensitivity: 2
    });

    focusModeToggle.checked = result.focusMode;
    focusDuration.value = result.focusDuration;
    sensitivity.value = result.sensitivity;

    // Show/hide focus settings based on toggle state
    if (result.focusMode) {
      focusModeSettings.classList.remove('hidden');
      updateStatus('Focus mode active', 'active');
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showError('Failed to load settings');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Focus mode toggle
  focusModeToggle.addEventListener('change', async (e) => {
    const isEnabled = e.target.checked;
    
    if (isEnabled) {
      focusModeSettings.classList.remove('hidden');
      await enableFocusMode();
    } else {
      focusModeSettings.classList.add('hidden');
      await disableFocusMode();
    }

    await chrome.storage.sync.set({ focusMode: isEnabled });
  });

  // Focus duration change
  focusDuration.addEventListener('change', async (e) => {
    const duration = parseInt(e.target.value);
    await chrome.storage.sync.set({ focusDuration: duration });
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'updateFocusDuration',
      duration: duration
    });
  });

  // Sensitivity slider
  sensitivity.addEventListener('input', async (e) => {
    const level = parseInt(e.target.value);
    await chrome.storage.sync.set({ sensitivity: level });
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'updateSensitivity',
      level: level
    });
  });

  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Stats button
  statsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('stats/stats.html') });
  });
}

// Enable focus mode
async function enableFocusMode() {
  try {
    const duration = parseInt(focusDuration.value);
    
    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: 'startFocusMode',
      duration: duration
    });

    if (response.success) {
      updateStatus('Focus mode active', 'active');
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/logo - 128 x 128.png',
        title: 'Focus Mode Activated',
        message: `Focus mode enabled for ${duration} minutes. Stay focused! 🎯`
      });
    }
  } catch (error) {
    console.error('Error enabling focus mode:', error);
    showError('Failed to enable focus mode');
  }
}

// Disable focus mode
async function disableFocusMode() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'stopFocusMode'
    });

    if (response.success) {
      updateStatus('All systems operational', 'idle');
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/logo - 128 x 128.png',
        title: 'Focus Mode Deactivated',
        message: 'Great work! Take a break if you need one. 🎉'
      });
    }
  } catch (error) {
    console.error('Error disabling focus mode:', error);
    showError('Failed to disable focus mode');
  }
}

// Update statistics display
async function updateStats() {
  try {
    const stats = await chrome.storage.local.get({
      todayFocusTime: 0,
      todayDistractions: 0,
      focusModeActive: false,
      focusStartTime: null
    });

    let totalSeconds = stats.todayFocusTime;

    // If focus mode is currently active, add elapsed time
    if (stats.focusModeActive && stats.focusStartTime) {
      const elapsedMs = Date.now() - stats.focusStartTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      totalSeconds += elapsedSeconds;
    }

    // Format focus time (convert seconds to hours, minutes, and seconds)
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    focusTimeDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`;

    // Update distractions count
    distractionsDisplay.textContent = stats.todayDistractions;

  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Update status message
function updateStatus(message, type = 'idle') {
  const statusIcon = statusElement.querySelector('.status-icon');
  const statusText = statusElement.querySelector('.status-text');
  
  statusText.textContent = message;
  
  // Update icon and styling based on type
  switch(type) {
    case 'active':
      statusIcon.textContent = 'rocket_launch';
      statusElement.style.background = 'rgba(98, 0, 234, 0.1)';
      statusElement.style.borderLeftColor = 'var(--primary-color)';
      statusIcon.style.color = 'var(--primary-color)';
      break;
    case 'warning':
      statusIcon.textContent = 'warning';
      statusElement.style.background = 'rgba(255, 152, 0, 0.1)';
      statusElement.style.borderLeftColor = '#ff9800';
      statusIcon.style.color = '#ff9800';
      break;
    case 'error':
      statusIcon.textContent = 'error';
      statusElement.style.background = 'rgba(207, 102, 121, 0.1)';
      statusElement.style.borderLeftColor = 'var(--error-color)';
      statusIcon.style.color = 'var(--error-color)';
      break;
    default:
      statusIcon.textContent = 'check_circle';
      statusElement.style.background = 'rgba(3, 218, 198, 0.1)';
      statusElement.style.borderLeftColor = 'var(--accent-color)';
      statusIcon.style.color = 'var(--accent-color)';
  }
}

// Show error message
function showError(message) {
  updateStatus(message, 'error');
  setTimeout(() => {
    updateStatus('All systems operational', 'idle');
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStats') {
    updateStats();
  } else if (message.action === 'focusModeEnded') {
    focusModeToggle.checked = false;
    focusModeSettings.classList.add('hidden');
    updateStatus('Focus session completed! 🎉', 'idle');
    updateStats();
  } else if (message.action === 'distractionDetected') {
    updateStats();
  }
});

// Refresh stats every second when popup is open to show real-time focus time
setInterval(updateStats, 1000);
