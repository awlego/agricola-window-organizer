// background.js - Keep-alive functionality for Agricola tabs

// Initialize
let keepAliveInterval = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleKeepAlive') {
    if (request.enabled) {
      startKeepAlive();
    } else {
      stopKeepAlive();
    }
  }
});

// Check if keep-alive is enabled when extension loads
chrome.storage.local.get('keepAliveEnabled', function(data) {
  if (data.keepAliveEnabled) {
    startKeepAlive();
  }
});

// Start the keep-alive process
function startKeepAlive() {
  // Clear any existing interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // Create a new interval to ping Agricola tabs every 30 seconds
  keepAliveInterval = setInterval(refreshAgricolaTabs, 30000);
  console.log('Keep-alive started');
}

// Stop the keep-alive process
function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('Keep-alive stopped');
  }
}

// Function to refresh Agricola tabs
function refreshAgricolaTabs() {
  // Get all tabs that match play-agricola.com
  chrome.tabs.query({url: '*://play-agricola.com/*'}, function(tabs) {
    if (tabs.length === 0) {
      return; // No Agricola tabs found
    }
    
    console.log(`Found ${tabs.length} Agricola tabs to keep alive`);
    
    // For each tab, send a message to refresh content
    tabs.forEach(function(tab) {
      // Execute a gentle refresh script in the tab that won't disrupt game play
      chrome.tabs.executeScript(tab.id, {
        code: `
          // This will subtly engage with the page without disrupting the game
          // It tells Chrome that this tab is being used and should not be suspended
          window.dispatchEvent(new Event('focus'));
          
          // Update last activity timestamp
          window.lastActivity = Date.now();
        `
      }, function() {
        // Check for any errors
        if (chrome.runtime.lastError) {
          console.error('Error keeping tab alive:', chrome.runtime.lastError.message);
        }
      });
    });
  });
}