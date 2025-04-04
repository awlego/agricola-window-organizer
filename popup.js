const statusElement = document.getElementById('status');

// Function to find all Agricola windows
function findAgricolaWindows(callback) {
  chrome.windows.getAll({populate: true}, function(windows) {
    // Track which windows are Agricola-related
    const agricolaWindows = [];
    
    // Find all windows with Agricola tabs
    for (let window of windows) {
      for (let tab of window.tabs) {
        // Check for both domain variations
        if (tab.url.includes('play-agricola.com') || tab.url.includes('playagricola.com')) {
          // This window has an Agricola tab
          agricolaWindows.push(window);
          break; // Only need to check one tab per window
        }
      }
    }
    
    callback(agricolaWindows);
  });
}

// Function to show status message
function showStatus(message) {
  statusElement.textContent = message;
  setTimeout(() => {
    statusElement.textContent = '';
  }, 3000);
}

// Alias for showStatus to maintain compatibility with both function names
function updateStatus(message) {
  showStatus(message);
}

// Function to determine player count from window count
function getPlayerCount(windowCount) {
  // According to the formula: windowCount = 3 + playerCount
  const playerCount = windowCount - 3;
  return playerCount > 0 ? playerCount : 0; // Ensure we don't return negative values
}

// Function to update button labels based on detected player count
function updateButtonLabels(playerCount) {
  if (playerCount > 0 && playerCount <= 5) {
    document.getElementById('saveBtn').textContent = `Save ${playerCount}P Window Positions`;
    document.getElementById('restoreBtn').textContent = `Restore ${playerCount}P Window Positions`;
    document.getElementById('organizeBtn').textContent = `Auto-Organize ${playerCount}P Windows`;
  } else {
    // Default labels if player count is invalid
    document.getElementById('saveBtn').textContent = 'Save Window Positions';
    document.getElementById('restoreBtn').textContent = 'Restore Window Positions';
    document.getElementById('organizeBtn').textContent = 'Auto-Organize Windows';
  }
}

// Function to check current Agricola windows and update UI
function updateUI() {
  findAgricolaWindows(function(agricolaWindows) {
    const playerCount = getPlayerCount(agricolaWindows.length);
    updateButtonLabels(playerCount);
  });
}

// Run updateUI when popup opens
document.addEventListener('DOMContentLoaded', updateUI);

// Get buttons
const saveButton = document.getElementById('saveBtn');
const restoreButton = document.getElementById('restoreBtn');
const confirmSaveButton = document.getElementById('confirmSave');
const cancelSaveButton = document.getElementById('cancelSave');
const saveConfirmation = document.getElementById('saveConfirmation');

// Save button click handler - now shows confirmation dialog
saveButton.addEventListener('click', function() {
  saveConfirmation.style.display = 'block';
  saveButton.style.display = 'none';
});

// Confirm save button click handler
confirmSaveButton.addEventListener('click', function() {
  // Find current Agricola windows
  findAgricolaWindows(function(agricolaWindows) {
    if (agricolaWindows.length === 0) {
      showStatus('No Agricola windows found to save.');
      saveConfirmation.style.display = 'none';
      saveButton.style.display = 'block';
      return;
    }
    
    // Get the player count based on window count
    const playerCount = getPlayerCount(agricolaWindows.length);
    const storageKey = `agricolaWindowPositions_${playerCount}P`;
    
    // Save the positions of all agricola windows
    const positions = agricolaWindows.map(window => ({
      left: window.left,
      top: window.top,
      width: window.width,
      height: window.height,
      state: window.state
    }));
    
    // Store in chrome.storage
    const saveData = {};
    saveData[storageKey] = positions;
    
    chrome.storage.local.set(saveData, function() {
      showStatus(`Saved positions for ${playerCount}P (${positions.length} windows)!`);
    });
  });
  
  // Hide confirmation and show save button again
  saveConfirmation.style.display = 'none';
  saveButton.style.display = 'block';
});

// Cancel save button click handler
cancelSaveButton.addEventListener('click', function() {
  saveConfirmation.style.display = 'none';
  saveButton.style.display = 'block';
});

// Restore window positions
restoreButton.addEventListener('click', function() {
  // First find current windows to determine player count
  findAgricolaWindows(function(currentWindows) {
    if (currentWindows.length === 0) {
      showStatus('No Agricola windows currently open.');
      return;
    }
    
    const playerCount = getPlayerCount(currentWindows.length);
    const storageKey = `agricolaWindowPositions_${playerCount}P`;
    
    // Get saved positions from storage for this player count
    chrome.storage.local.get(storageKey, function(data) {
      if (!data[storageKey] || data[storageKey].length === 0) {
        showStatus(`No saved positions found for ${playerCount}P.`);
        return;
      }
      
      // Restore positions
      const savedPositions = data[storageKey];
      const count = Math.min(currentWindows.length, savedPositions.length);
      
      for (let i = 0; i < count; i++) {
        const position = savedPositions[i];
        chrome.windows.update(currentWindows[i].id, {
          left: position.left,
          top: position.top,
          width: position.width,
          height: position.height,
          state: position.state === 'maximized' ? 'maximized' : 'normal'
        });
      }
      
      showStatus(`Restored positions for ${playerCount}P (${count} windows)!`);
    });
  });
});

// Auto-organize windows (original functionality)
document.getElementById('organizeBtn').addEventListener('click', function() {
  findAgricolaWindows(function(agricolaWindows) {
    // If we found any Agricola windows, organize them
    if (agricolaWindows.length > 0) {
      const playerCount = getPlayerCount(agricolaWindows.length);
      
      // Calculate screen dimensions for arranging windows
      const screenWidth = screen.width;
      const screenHeight = screen.height;
      
      // Organize in a grid or row depending on number of windows
      // For simplicity, we'll arrange them in a row
      const windowWidth = Math.floor(screenWidth / agricolaWindows.length);
      
      agricolaWindows.forEach((window, index) => {
        chrome.windows.update(window.id, {
          left: index * windowWidth,
          top: 0,
          width: windowWidth,
          height: screenHeight,
          state: 'normal' // Ensure it's not minimized or maximized
        });
      });
      
      showStatus(`Auto-organized ${playerCount}P (${agricolaWindows.length} windows)!`);
    } else {
      showStatus('No Agricola windows found to organize.');
    }
  });
});

// Keep-alive toggle functionality
document.getElementById('keepAliveToggle').addEventListener('change', function(e) {
  const isEnabled = e.target.checked;
  
  // Save the setting
  chrome.storage.local.set({'keepAliveEnabled': isEnabled}, function() {
    // Send message to background script
    chrome.runtime.sendMessage({
      action: 'toggleKeepAlive',
      enabled: isEnabled
    });
    
    showStatus(`Keep-alive ${isEnabled ? 'enabled' : 'disabled'}`);
  });
});

// Initialize toggle state from storage
chrome.storage.local.get('keepAliveEnabled', function(data) {
  document.getElementById('keepAliveToggle').checked = !!data.keepAliveEnabled;
});
