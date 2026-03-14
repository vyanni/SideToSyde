/**
 * BACKGROUND.JS (SERVICE WORKER) - Runs in the background, always available
 * 
 * Key Facts:
 * - Runs independently of any tab being open
 * - No access to DOM (not running on a page)
 * - Can't directly modify web pages (that's content_script's job)
 * - Handles global events, timers, network requests
 * - Receives messages from content scripts and popup
 * - Can communicate with servers/APIs
 * - Wakes up when needed, then goes to sleep (efficient)
 * 
 * What to use it for:
 * - Handling extension buttons/icons clicked
 * - Background timers or periodic tasks
 * - API calls to your server
 * - Storing global state
 * - Intercepting network requests
 * - Notifications
 */

console.log('✅ Service worker loaded');

/**
 * LISTEN FOR MESSAGES from content_script.js or popup.js
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message, 'from tab:', sender.tab?.id);

    if (message.action === 'toggleExtension') {
        handleToggleExtension(message.enabled, sender.tab?.id);
        sendResponse({success: true});
    }
    else if (message.action === 'logPageVisit') {
        logPageVisit(sender.tab);
        sendResponse({success: true});
    }

    return true; // Keep listener alive for async operations
});

/**
 * LISTEN FOR EXTENSION ICON CLICK
 * User clicks the extension icon in the browser toolbar
 */
chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked on tab:', tab.id);
    
    // Send message to content script on that tab
    chrome.tabs.sendMessage(tab.id, {
        action: 'togglePageHighlight'
    }).catch(err => console.log('Could not contact content script:', err));
});

/**
 * LISTEN FOR TAB UPDATES
 * Fires when a tab finishes loading
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        console.log('Page finished loading:', tab.url);
        
        // Optional: Do something when page loads
        // chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' });
    }
});

/**
 * LISTEN FOR NEW TAB CREATED
 */
chrome.tabs.onCreated.addListener((tab) => {
    console.log('New tab created:', tab.id);
});

/**
 * LISTEN FOR TAB CLOSED
 */
chrome.tabs.onRemoved.addListener((tabId) => {
    console.log('Tab closed:', tabId);
});

/**
 * FUNCTION: Handle extension toggle
 */
function handleToggleExtension(enabled, tabId) {
    console.log(`Extension ${enabled ? 'enabled' : 'disabled'}`);
    
    // Save to storage
    chrome.storage.sync.set({
        extensionEnabled: enabled,
        lastToggled: new Date().toISOString()
    });

    // Optional: Notify all tabs
    if (tabId) {
        chrome.tabs.sendMessage(tabId, {
            action: 'extensionToggled',
            enabled: enabled
        }).catch(() => {});
    }
}

/**
 * FUNCTION: Log page visit (example of API call)
 */
async function logPageVisit(tab) {
    const visitData = {
        url: tab.url,
        title: tab.title,
        timestamp: new Date().toISOString(),
        faviconUrl: tab.favIconUrl
    };

    console.log('Visited:', visitData);

    // Store visit history
    const history = await chrome.storage.local.get('visitHistory');
    const visits = history.visitHistory || [];
    visits.push(visitData);
    
    // Keep only last 100 visits
    if (visits.length > 100) {
        visits.shift();
    }

    await chrome.storage.local.set({
        visitHistory: visits
    });

    // Example: Send to your server
    // await fetch('https://your-server.com/log-visit', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(visitData)
    // });
}

/**
 * FUNCTION: Create notification
 */
async function showNotification(title, message) {
    await chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon-128.png',
        title: title,
        message: message
    });
}

/**
 * PERIODIC TASK: Run something every 60 seconds
 * Note: Service workers sleep when idle, so use chrome.alarms instead
 */
chrome.alarms.create('myPeriodicTask', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'myPeriodicTask') {
        console.log('Periodic task running...');
        // Do something every minute
    }
});

/**
 * CHROME API: Request interceptor example
 * Uncomment permissions in manifest.json first:
 * "permissions": ["webRequest", "webRequestBlocking"]
 */

// function interceptRequests() {
//     chrome.webRequest.onHeadersReceived.addListener(
//         (details) => {
//             console.log('Network request:', details.url);
//             return { responseHeaders: details.responseHeaders };
//         },
//         { urls: ['<all_urls>'] },
//         ['responseHeaders']
//     );
// }

/**
 * CHROME API: Context Menu
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'extension-context-menu',
        title: 'Analyze with Extension',
        contexts: ['page', 'link', 'image']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'extension-context-menu') {
        console.log('Context menu clicked');
        
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, {
            action: 'analyzeSelection',
            selectedText: info.selectionText
        }).catch(() => {});
    }
});

/**
 * API COMMUNICATION EXAMPLE
 * Send data to your backend server
 */
async function sendDataToServer(data) {
    try {
        const response = await fetch('https://api.example.com/extension-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Server response:', result);
        return result;
    } catch (error) {
        console.error('Failed to send data:', error);
    }
}

console.log('Background service worker initialized');
