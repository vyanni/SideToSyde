// Replace "side" with "syde" on entire page
function sydeify() {
    document.sel
}

// /**
//  * CONTENT_SCRIPT.JS - This runs DIRECTLY ON every web page
//  * 
//  * Key Facts:
//  * - Has DIRECT access to the DOM of the web page
//  * - Can read/modify HTML, CSS, JavaScript
//  * - Shares the same DOM as the page (can access page's variables/functions)
//  * - BUT: Isolated JavaScript context (security sandbox)
//  * - Receives messages from popup.js and background.js
//  * - Can send messages back to them
//  * 
//  * This is where you ACTUALLY manipulate the page content!
//  */

// // console.log('Content script loaded on:', window.location.href);

// /**
//  * LISTEN FOR MESSAGES from popup.js or background.js
//  */
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log('Content script received message:', message);

//     if (message.action === 'modifyPage') {
//         // DIRECTLY access and modify page DOM
//         modifyPageContent(message.data);
//         sendResponse({success: true, message: 'Page modified'});
//     } 
//     else if (message.action === 'getPageData') {
//         const pageData = extractPageData();
//         sendResponse(pageData);
//     }
//     else if (message.action === 'highlightElements') {
//         highlightElements(message.selector);
//         sendResponse({success: true});
//     }

//     return true; // Keep channel open for async response
// });

// /**
//  * FUNCTION 1: Modify page content
//  * Shows how to directly manipulate the DOM
//  */
// function modifyPageContent(options) {
//     // Change background color of entire page
//     document.body.style.backgroundColor = options.bgColor;

//     // Add an info banner at the top
//     const banner = document.createElement('div');
//     banner.id = 'extension-banner';
//     banner.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         right: 0;
//         background: linear-gradient(90deg, #667eea, #764ba2);
//         color: white;
//         padding: 15px 20px;
//         text-align: center;
//         font-weight: bold;
//         z-index: 999999;
//         box-shadow: 0 2px 10px rgba(0,0,0,0.2);
//     `;
//     banner.textContent = options.textInfo;
//     document.body.insertBefore(banner, document.body.firstChild);

//     // Adjust page margin so content doesn't hide behind banner
//     document.body.style.marginTop = '50px';

//     console.log('Page modified:', options);
// }

// /**
//  * FUNCTION 2: Extract page data
//  * Shows how to read from the DOM
//  */
// function extractPageData() {
//     return {
//         title: document.title,
//         url: window.location.href,
//         headings: Array.from(document.querySelectorAll('h1, h2, h3'))
//             .slice(0, 5)
//             .map(h => h.textContent.trim()),
//         allLinks: Array.from(document.querySelectorAll('a'))
//             .slice(0, 10)
//             .map(a => ({text: a.textContent, href: a.href})),
//         images: Array.from(document.querySelectorAll('img'))
//             .slice(0, 5)
//             .map(img => ({src: img.src, alt: img.alt})),
//         wordCount: document.body.innerText.split(/\s+/).length,
//         timestamp: new Date().toISOString()
//     };
// }

// /**
//  * FUNCTION 3: Highlight elements matching selector
//  * Shows CSS manipulation
//  */
// // function highlightElements(selector) {
// //     try {
// //         const elements = document.querySelectorAll(selector);
// //         elements.forEach(el => {
// //             el.style.outline = '3px solid red';
// //             el.style.backgroundColor = 'yellow';
// //         });
// //         console.log(`Highlighted ${elements.length} elements matching: ${selector}`);
// //     } catch (error) {
// //         console.error('Invalid selector:', error);
// //     }
// // }

// /**
//  * AUTO-RUN FUNCTION: Do something on every page automatically
//  * This runs without needing a message from popup
//  */
// function initializeExtension() {
//     // Get extension enabled setting
//     chrome.storage.sync.get('extensionEnabled', (result) => {
//         if (result.extensionEnabled === false) {
//             console.log('Extension disabled, skipping initialization');
//             return;
//         }

//         // Example: Add a helpful tooltip to images
//         document.querySelectorAll('img').forEach(img => {
//             img.addEventListener('mouseover', function() {
//                 if (!this.hasAttribute('data-ext-tooltip')) {
//                     const tooltip = document.createElement('div');
//                     tooltip.style.cssText = `
//                         position: absolute;
//                         background: #333;
//                         color: white;
//                         padding: 8px;
//                         border-radius: 4px;
//                         font-size: 12px;
//                         z-index: 999999;
//                     `;
//                     tooltip.textContent = `Size: ${this.width}x${this.height}px`;
//                     this.parentElement.style.position = 'relative';
//                     this.parentElement.appendChild(tooltip);
//                     this.setAttribute('data-ext-tooltip', 'true');
//                 }
//             });
//         });

//         console.log('Extension initialized');
//     });
// }

// // Run initialization when page loads
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initializeExtension);
// } else {
//     initializeExtension();
// }

// /**
//  * IMPORTANT SECURITY NOTES:
//  * 
//  * 1. Content scripts cannot:
//  *    - Access the site's JavaScript variables directly (isolated context)
//  *    - Make cross-origin requests (unless granted in manifest)
//  *    - Use certain dangerous APIs
//  * 
//  * 2. But they CAN:
//  *    - Access and modify the DOM
//  *    - Listen to DOM events
//  *    - Inject new scripts via <script> tags (for accessing page JS)
//  *    - Communicate with background script and popup
//  * 
//  * 3. To access page's JavaScript:
//  *    Create a new <script> tag and inject your code
//  *    (See "Advanced" section below)
//  */

// /**
//  * ADVANCED: Injecting script to access page's JavaScript
//  * Sometimes you need to run code in the page's context, not the extension context
//  */
// // 

// // Example of using injected script:
// // injectScript(`
// //     console.log('This runs in page context');
// //     console.log('Can access window.myPageVariable:', window.myPageVariable);
// // `);
