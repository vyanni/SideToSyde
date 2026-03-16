/**
 * POPUP.JS - This runs in the popup window only
 * 
 * Communication Flow:
 * 1. User clicks button in popup (popup.js)
 * 2. popup.js sends message to content_script.js or background.js
 * 3. Content script receives message, modifies the page, sends response back
 * 4. popup.js receives response and updates UI
 */

document.addEventListener('DOMContentLoaded', async () => {
    const modifyPageBtn = document.getElementById('modifyPageBtn');
    const getPageDataBtn = document.getElementById('getPageDataBtn');
    const toggleExtensionBtn = document.getElementById('toggleExtensionBtn');
    const enableToggle = document.getElementById('enableToggle');
    const statusDiv = document.getElementById('status');
    const outputDiv = document.getElementById('output');

    // Load saved settings
    const settings = await chrome.storage.sync.get('extensionEnabled');
    enableToggle.checked = settings.extensionEnabled !== false;

    /**
     * Button 1: Modify the current page
     * Sends command to content_script.js running on current tab
     */
    modifyPageBtn.addEventListener('click', async () => {
        try {
            // Get the current active tab
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            // Send message to content script on this tab
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'modifyPage',
                data: {
                    bgColor: '#FFF8DC',
                    textInfo: 'Modified by extension!'
                }
            });

            showStatus('Page modified successfully!', 'success');
            console.log('Response from content script:', response);
        } catch (error) {
            showStatus('Error: ' + error.message, 'error');
            console.error(error);
        }
    });

    /**
     * Button 2: Get data from current page
     * Extracts and displays information about the page
     */
    getPageDataBtn.addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
            
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'getPageData'
            });

            showStatus('Data retrieved!', 'success');
            displayOutput(JSON.stringify(response, null, 2));
        } catch (error) {
            showStatus('Error: ' + error.message, 'error');
        }
    });

    /**
     * Button 3: Toggle extension on/off
     * Sends message to background service worker
     */
    toggleExtensionBtn.addEventListener('click', async () => {
        const newState = !enableToggle.checked;
        enableToggle.checked = newState;
        
        // Store in sync storage (works across all devices where user is logged in)
        await chrome.storage.sync.set({
            extensionEnabled: newState
        });

        // Send message to background service worker
        await chrome.runtime.sendMessage({
            action: 'toggleExtension',
            enabled: newState
        });

        showStatus(`Extension ${newState ? 'enabled' : 'disabled'}`, 'info');
    });

    // Save extension enabled setting when checkbox changes
    enableToggle.addEventListener('change', async () => {
        await chrome.storage.sync.set({
            extensionEnabled: enableToggle.checked
        });
    });
});

/**
 * Helper function to display status messages
 */
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    
    // Auto-clear after 5 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
    }, 5000);
}

/**
 * Helper function to display output
 */
function displayOutput(content) {
    const outputDiv = document.getElementById('output');
    outputDiv.textContent = content;
    outputDiv.classList.add('active');
}
