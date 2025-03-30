const statusElement = document.getElementById('status');

// Function to find all Agricola windows
function findAgricolaWindows(callback) {
  chrome.windows.getAll({populate: true}, function(windows) {
    // Track which windows are Agricola-related
    const agricolaWindows = [];
    
    // Find all windows with Agricola tabs
    for (let window of windows) {
      for (let tab of window.tabs) {
        if (tab.url.includes('play-agricola.com')) {
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

// Save window positions
document.getElementById('saveBtn').addEventListener('click', function() {
  findAgricolaWindows(function(agricolaWindows) {
    if (agricolaWindows.length === 0) {
      showStatus('No Agricola windows found to save.');
      return;
    }
    
    // Create an array of window positions and sizes
    const savedWindows = agricolaWindows.map(window => {
      return {
        id: window.id,
        left: window.left,
        top: window.top,
        width: window.width,
        height: window.height,
        state: window.state
      };
    });
    
    // Save to local storage
    chrome.storage.local.set({'agricolaWindowPositions': savedWindows}, function() {
      showStatus(`Saved positions for ${savedWindows.length} windows!`);
    });
  });
});

// Restore window positions
document.getElementById('restoreBtn').addEventListener('click', function() {
  // Get saved positions from storage
  chrome.storage.local.get('agricolaWindowPositions', function(data) {
    if (!data.agricolaWindowPositions || data.agricolaWindowPositions.length === 0) {
      showStatus('No saved positions found.');
      return;
    }
    
    // Find current Agricola windows
    findAgricolaWindows(function(currentWindows) {
      if (currentWindows.length === 0) {
        showStatus('No Agricola windows currently open.');
        return;
      }
      
      // Restore positions
      // We'll match by index since window IDs might have changed
      const savedPositions = data.agricolaWindowPositions;
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
      
      showStatus(`Restored positions for ${count} windows!`);
    });
  });
});

// Auto-organize windows (original functionality)
document.getElementById('organizeBtn').addEventListener('click', function() {
  findAgricolaWindows(function(agricolaWindows) {
    // If we found any Agricola windows, organize them
    if (agricolaWindows.length > 0) {
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
      
      showStatus(`Auto-organized ${agricolaWindows.length} windows!`);
    } else {
      showStatus('No Agricola windows found to organize.');
    }
  });
});
