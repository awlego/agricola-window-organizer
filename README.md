# Agricola Window Organizer
A Chrome extension designed to enhance your online Agricola board game experience by organizing browser windows. 

## Features
- **Window Organization**: Automatically arrange your Agricola game windows in a really unoptimal layout, but hey you can find them all.
- **Save & Restore**: Save your preferred window positions and restore them later
- **Keep-Alive Functionality**: Prevent Agricola game tabs from being suspended or timing out due to inactivity

## Installation
   
### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your browser toolbar

## Usage

### Basic Window Organization
1. Open your Agricola game tabs in separate windows
2. Click the extension icon in your toolbar to open the popup
3. Click "Auto-Organize Windows" to automatically arrange all Agricola windows

### Saving and Restoring Window Positions
1. Arrange your Agricola windows in your preferred layout
2. Click "Save Window Positions" in the extension popup
3. To restore these positions later, click "Restore Window Positions"

### Keep-Alive Functionality
1. Toggle the "Keep Agricola Tabs Active" switch in the extension popup
2. When enabled, the extension will periodically touch your Agricola tabs to prevent timeouts

## How It Works
The extension identifies browser windows containing tabs from play-agricola.com and provides tools to manage them. The keep-alive feature works by sending subtle 'focus' signals to Agricola tabs every 30 seconds.

## Permissions
This extension requires the following permissions:
- **tabs**: To identify and interact with Agricola game tabs
- **windows**: To organize and position browser windows
- **storage**: To save window positions and settings
- **alarms**: For background keep-alive functionality

## Support
If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/awlego/agricola-window-organizer/issues) on our GitHub repository.

## TODO:
publish to chrome web store
