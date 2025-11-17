// Settings page functionality for Dopamine Down extension

// Default settings
const DEFAULT_SETTINGS = {
  // Focus Mode
  focusMode: false,
  focusDuration: 25,
  autoStartFocus: false,
  breakReminders: true,
  breakDuration: 5,
  
  // Detection
  sensitivity: 2,
  enableDetection: true,
  detectionDelay: 15,
  
  // Sites
  blockedSites: ['facebook.com', 'twitter.com', 'instagram.com', 'reddit.com', 'tiktok.com'],
  allowedSites: ['docs.google.com', 'github.com', 'stackoverflow.com'],
  
  // Notifications
  enableNotifications: true,
  notificationSound: false,
  motivationalMessages: true,
  
  // Data & Privacy
  collectStats: true
};

// DOM Elements
const elements = {
  // Focus Mode
  defaultFocusDuration: document.getElementById('defaultFocusDuration'),
  autoStartFocus: document.getElementById('autoStartFocus'),
  breakReminders: document.getElementById('breakReminders'),
  breakDuration: document.getElementById('breakDuration'),
  
  // Detection
  sensitivityLevel: document.getElementById('sensitivityLevel'),
  enableDetection: document.getElementById('enableDetection'),
  detectionDelay: document.getElementById('detectionDelay'),
  
  // Sites
  newBlockedSite: document.getElementById('newBlockedSite'),
  addBlockedSite: document.getElementById('addBlockedSite'),
  blockedSitesList: document.getElementById('blockedSitesList'),
  newAllowedSite: document.getElementById('newAllowedSite'),
  addAllowedSite: document.getElementById('addAllowedSite'),
  allowedSitesList: document.getElementById('allowedSitesList'),
  
  // Notifications
  enableNotifications: document.getElementById('enableNotifications'),
  notificationSound: document.getElementById('notificationSound'),
  motivationalMessages: document.getElementById('motivationalMessages'),
  
  // Data & Privacy
  collectStats: document.getElementById('collectStats'),
  resetDataBtn: document.getElementById('resetDataBtn'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  
  // Actions
  resetSettingsBtn: document.getElementById('resetSettingsBtn'),
  saveStatus: document.getElementById('saveStatus')
};

// Initialize settings page
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Load all settings from storage
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    // Focus Mode settings
    elements.defaultFocusDuration.value = settings.focusDuration;
    elements.autoStartFocus.checked = settings.autoStartFocus;
    elements.breakReminders.checked = settings.breakReminders;
    elements.breakDuration.value = settings.breakDuration;
    
    // Detection settings
    elements.sensitivityLevel.value = settings.sensitivity;
    elements.enableDetection.checked = settings.enableDetection;
    elements.detectionDelay.value = settings.detectionDelay;
    
    // Notification settings
    elements.enableNotifications.checked = settings.enableNotifications;
    elements.notificationSound.checked = settings.notificationSound;
    elements.motivationalMessages.checked = settings.motivationalMessages;
    
    // Data settings
    elements.collectStats.checked = settings.collectStats;
    
    // Load site lists
    renderSiteList(settings.blockedSites, elements.blockedSitesList, 'blocked');
    renderSiteList(settings.allowedSites, elements.allowedSitesList, 'allowed');
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Failed to load settings', 'error');
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Focus Mode settings
  elements.defaultFocusDuration.addEventListener('change', (e) => {
    saveSettings({ focusDuration: parseInt(e.target.value) });
  });
  
  elements.autoStartFocus.addEventListener('change', (e) => {
    saveSettings({ autoStartFocus: e.target.checked });
  });
  
  elements.breakReminders.addEventListener('change', (e) => {
    saveSettings({ breakReminders: e.target.checked });
  });
  
  elements.breakDuration.addEventListener('change', (e) => {
    saveSettings({ breakDuration: parseInt(e.target.value) });
  });
  
  // Detection settings
  elements.sensitivityLevel.addEventListener('change', (e) => {
    saveSettings({ sensitivity: parseInt(e.target.value) });
  });
  
  elements.enableDetection.addEventListener('change', (e) => {
    saveSettings({ enableDetection: e.target.checked });
  });
  
  elements.detectionDelay.addEventListener('change', (e) => {
    saveSettings({ detectionDelay: parseInt(e.target.value) });
  });
  
  // Notification settings
  elements.enableNotifications.addEventListener('change', (e) => {
    saveSettings({ enableNotifications: e.target.checked });
  });
  
  elements.notificationSound.addEventListener('change', (e) => {
    saveSettings({ notificationSound: e.target.checked });
  });
  
  elements.motivationalMessages.addEventListener('change', (e) => {
    saveSettings({ motivationalMessages: e.target.checked });
  });
  
  // Data settings
  elements.collectStats.addEventListener('change', (e) => {
    saveSettings({ collectStats: e.target.checked });
  });
  
  // Site management
  elements.addBlockedSite.addEventListener('click', () => {
    addSite('blocked');
  });
  
  elements.newBlockedSite.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite('blocked');
    }
  });
  
  elements.addAllowedSite.addEventListener('click', () => {
    addSite('allowed');
  });
  
  elements.newAllowedSite.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSite('allowed');
    }
  });
  
  // Action buttons
  elements.resetSettingsBtn.addEventListener('click', resetSettings);
  elements.resetDataBtn.addEventListener('click', resetData);
  elements.exportDataBtn.addEventListener('click', exportData);
}

// Save settings to storage
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set(settings);
    
    // Notify background script of changes
    chrome.runtime.sendMessage({
      action: 'settingsUpdated',
      settings: settings
    });
    
    showStatus('Settings saved', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Failed to save settings', 'error');
  }
}

// Render site list
function renderSiteList(sites, container, type) {
  container.innerHTML = '';
  
  if (sites.length === 0) {
    container.innerHTML = '<div class="empty-list">No sites added yet</div>';
    return;
  }
  
  sites.forEach(site => {
    const siteItem = document.createElement('div');
    siteItem.className = 'site-item';
    siteItem.innerHTML = `
      <span>${site}</span>
      <button class="remove-site" data-site="${site}" data-type="${type}">
        <span class="material-icons">delete</span>
      </button>
    `;
    
    siteItem.querySelector('.remove-site').addEventListener('click', (e) => {
      removeSite(site, type);
    });
    
    container.appendChild(siteItem);
  });
}

// Add site to list
async function addSite(type) {
  const input = type === 'blocked' ? elements.newBlockedSite : elements.newAllowedSite;
  const site = input.value.trim().toLowerCase();
  
  if (!site) {
    return;
  }
  
  // Basic URL validation
  const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/;
  if (!urlPattern.test(site)) {
    showStatus('Please enter a valid domain (e.g., example.com)', 'error');
    return;
  }
  
  try {
    const storageKey = type === 'blocked' ? 'blockedSites' : 'allowedSites';
    const result = await chrome.storage.sync.get(storageKey);
    const sites = result[storageKey] || [];
    
    if (sites.includes(site)) {
      showStatus('Site already in list', 'error');
      return;
    }
    
    sites.push(site);
    await saveSettings({ [storageKey]: sites });
    
    const container = type === 'blocked' ? elements.blockedSitesList : elements.allowedSitesList;
    renderSiteList(sites, container, type);
    
    input.value = '';
    showStatus('Site added successfully', 'success');
  } catch (error) {
    console.error('Error adding site:', error);
    showStatus('Failed to add site', 'error');
  }
}

// Remove site from list
async function removeSite(site, type) {
  if (!confirm(`Remove ${site} from ${type} list?`)) {
    return;
  }
  
  try {
    const storageKey = type === 'blocked' ? 'blockedSites' : 'allowedSites';
    const result = await chrome.storage.sync.get(storageKey);
    const sites = result[storageKey] || [];
    
    const updatedSites = sites.filter(s => s !== site);
    await saveSettings({ [storageKey]: updatedSites });
    
    const container = type === 'blocked' ? elements.blockedSitesList : elements.allowedSitesList;
    renderSiteList(updatedSites, container, type);
    
    showStatus('Site removed successfully', 'success');
  } catch (error) {
    console.error('Error removing site:', error);
    showStatus('Failed to remove site', 'error');
  }
}

// Reset all settings to defaults
async function resetSettings() {
  if (!confirm('Reset all settings to default values? This cannot be undone.')) {
    return;
  }
  
  try {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
    await loadSettings();
    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('Error resetting settings:', error);
    showStatus('Failed to reset settings', 'error');
  }
}

// Reset all data
async function resetData() {
  if (!confirm('Delete all statistics and data? This cannot be undone.')) {
    return;
  }
  
  try {
    await chrome.storage.local.clear();
    
    // Notify background script
    chrome.runtime.sendMessage({ action: 'dataReset' });
    
    showStatus('All data has been cleared', 'success');
  } catch (error) {
    console.error('Error resetting data:', error);
    showStatus('Failed to reset data', 'error');
  }
}

// Export data
async function exportData() {
  try {
    const syncData = await chrome.storage.sync.get(null);
    const localData = await chrome.storage.local.get(null);
    
    const exportData = {
      settings: syncData,
      statistics: localData,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dopamine-down-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Data exported successfully', 'success');
  } catch (error) {
    console.error('Error exporting data:', error);
    showStatus('Failed to export data', 'error');
  }
}

// Show status message
function showStatus(message, type = 'success') {
  const icon = elements.saveStatus.querySelector('.material-icons');
  const text = elements.saveStatus.querySelector('span:last-child');
  
  text.textContent = message;
  elements.saveStatus.className = 'save-status';
  
  switch(type) {
    case 'success':
      icon.textContent = 'check_circle';
      elements.saveStatus.classList.add('success');
      break;
    case 'error':
      icon.textContent = 'error';
      elements.saveStatus.classList.add('error');
      break;
    case 'saving':
      icon.textContent = 'sync';
      elements.saveStatus.classList.add('saving');
      break;
  }
  
  if (type !== 'saving') {
    setTimeout(() => {
      text.textContent = 'Settings saved automatically';
      icon.textContent = 'check_circle';
      elements.saveStatus.className = 'save-status';
    }, 3000);
  }
}
