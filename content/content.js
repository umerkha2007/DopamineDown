// Content script for Dopamine Down extension
// Runs on all web pages to detect and warn about distractions

let focusModeActive = false;
let warningOverlay = null;

// Initialize content script
(function() {
  console.log('Dopamine Down content script loaded');
  checkCurrentPage();
})();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'focusModeStarted':
      focusModeActive = true;
      checkCurrentPage();
      break;

    case 'focusModeStopped':
      focusModeActive = false;
      removeWarning();
      break;

    case 'showDistractionWarning':
      showDistractionWarning(message.url);
      break;
  }
  
  sendResponse({ received: true });
});

// Check if current page is a distraction
async function checkCurrentPage() {
  if (!focusModeActive) return;

  const pageData = {
    url: window.location.href,
    title: document.title,
    content: extractPageContent()
  };

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'checkDistraction',
      ...pageData
    });

    if (response.isDistraction) {
      showDistractionWarning(pageData.url);
      // Report distraction with URL to prevent double-counting
      await chrome.runtime.sendMessage({ 
        action: 'reportDistraction',
        url: pageData.url
      });
    }
  } catch (error) {
    console.error('Error checking page:', error);
  }
}

// Extract relevant page content for analysis
function extractPageContent() {
  const textContent = document.body ? document.body.innerText : '';
  return textContent.substring(0, 500); // First 500 chars
}

// Show distraction warning overlay
function showDistractionWarning(url) {
  // Remove existing warning if present
  removeWarning();

  // Create overlay
  warningOverlay = document.createElement('div');
  warningOverlay.id = 'dopamine-down-warning';
  warningOverlay.innerHTML = `
    <div class="dd-overlay">
      <div class="dd-warning-card">
        <div class="dd-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#6200ea"/>
            <path d="M12 17c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zM12 9c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1z" fill="#6200ea"/>
          </svg>
        </div>
        <h2 class="dd-title">Hey, hold on! 🤔</h2>
        <p class="dd-message">Looks like you might be drifting into distraction territory. Remember your focus goals?</p>
        <div class="dd-url">${getDomain(url)}</div>
        <div class="dd-actions">
          <button class="dd-btn dd-btn-primary" id="dd-stay-focused">
            Stay Focused
          </button>
          <button class="dd-btn dd-btn-secondary" id="dd-continue">
            I Know What I'm Doing
          </button>
        </div>
        <button class="dd-close" id="dd-close-warning">×</button>
      </div>
    </div>
  `;

  document.body.appendChild(warningOverlay);

  // Add event listeners
  document.getElementById('dd-stay-focused').addEventListener('click', handleStayFocused);
  document.getElementById('dd-continue').addEventListener('click', handleContinue);
  document.getElementById('dd-close-warning').addEventListener('click', handleContinue);

  // Add shake animation
  setTimeout(() => {
    const card = warningOverlay.querySelector('.dd-warning-card');
    card.style.animation = 'ddShake 0.5s ease-in-out';
  }, 100);
}

// Remove warning overlay
function removeWarning() {
  if (warningOverlay) {
    warningOverlay.remove();
    warningOverlay = null;
  }
}

// Handle "Stay Focused" button
function handleStayFocused() {
  removeWarning();
  
  // Navigate back or to a productive page
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'about:blank';
  }
  
  // Show success notification
  showToast('Great choice! Keep that focus strong! 💪', 'success');
}

// Handle "Continue" button
function handleContinue() {
  removeWarning();
  showToast('Remember to stay mindful of your time 🕐', 'info');
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `dd-toast dd-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('dd-toast-show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('dd-toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Get domain from URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Monitor page changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    checkCurrentPage();
  }
}).observe(document, { subtree: true, childList: true });
