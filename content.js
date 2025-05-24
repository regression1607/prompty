// Add these variables at the top of the file
let lastSelectedText = '';
let lastSelectionTime = 0;
const DEBOUNCE_TIME = 10000; // 10 seconds in milliseconds

// Function to show improved text popup
async function showImprovedTextPopup(selectedText) {
  console.log('Selected text:', selectedText);

  // Check if selected text has more than 3 words
  const wordCount = selectedText.trim().split(/\s+/).length;
  if (wordCount <= 3) {
    console.log('Text too short, needs more than 3 words');
    return;
  }

  // Check if this is a duplicate selection within the debounce time
  const currentTime = Date.now();
  if (selectedText === lastSelectedText && (currentTime - lastSelectionTime) < DEBOUNCE_TIME) {
    console.log('Duplicate selection within debounce time, skipping API call');
    return;
  }

  // Update last selection info
  lastSelectedText = selectedText;
  lastSelectionTime = currentTime;

  // Get API key from storage with error handling
  let apiKey;
  try {
    const result = await new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get(['geminiApiKey'], (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(new Error('Extension context invalidated'));
      }
    });

    console.log('Checking API key...');
    if (!result.geminiApiKey) {
      console.log('No API key found in storage');
      alert('Please set your Gemini API key in the extension popup first!');
      return;
    }
    apiKey = result.geminiApiKey;
  } catch (error) {
    console.error('Storage error:', error);
    if (error.message === 'Extension context invalidated') {
      alert('Extension was reloaded. Please refresh the page and try again.');
    } else {
      alert('Error accessing storage. Please make sure the extension is properly installed.');
    }
    return;
  }

  try {
    console.log('Calling Gemini API...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Please improve the following text while maintaining its meaning. Fix any spelling errors and make it more professional: "${selectedText}"`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to improve text: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    const improvedText = data.candidates[0].content.parts[0].text;
    console.log('Improved text:', improvedText);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2147483646;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(overlay);
    // Trigger overlay animation
    setTimeout(() => overlay.style.opacity = '1', 10);

    // Create popup
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: rgba(28, 28, 30, 0.95);
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 2147483647;
      min-width: 240px;
      max-width: 400px;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    `;

    // Add content
    popup.innerHTML = `
      <h3 style="margin: 0 0 12px 0; color: #ffffff; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px; font-size: 1em; font-weight: 500;">Improved Text</h3>
      <div style="margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.9em; line-height: 1.4;">
        ${improvedText}
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 8px;">
        <button id="replaceBtn" style="padding: 6px 12px; background: #007AFF; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; font-size: 0.85em; opacity: 0.9;">Replace</button>
        <button id="cancelBtn" style="padding: 6px 12px; background: rgba(255, 255, 255, 0.1); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; font-size: 0.85em; opacity: 0.9;">Cancel</button>
      </div>
    `;

    document.body.appendChild(popup);
    // Trigger popup animation
    setTimeout(() => {
      popup.style.opacity = '1';
      popup.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    // Function to close popup with animation
    const closePopup = () => {
      popup.style.opacity = '0';
      popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
      overlay.style.opacity = '0';
      
      setTimeout(() => {
        if (document.body.contains(popup)) {
          document.body.removeChild(popup);
        }
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 300);
    };

    // Wait for the popup to be added to DOM before accessing buttons
    setTimeout(() => {
      const replaceBtn = document.getElementById('replaceBtn');
      const cancelBtn = document.getElementById('cancelBtn');

      if (replaceBtn && cancelBtn) {
        // Add hover effects to buttons
        replaceBtn.onmouseover = () => {
          replaceBtn.style.opacity = '1';
          replaceBtn.style.background = '#0066CC';
        };
        replaceBtn.onmouseout = () => {
          replaceBtn.style.opacity = '0.9';
          replaceBtn.style.background = '#007AFF';
        };
        cancelBtn.onmouseover = () => {
          cancelBtn.style.opacity = '1';
          cancelBtn.style.background = 'rgba(255, 255, 255, 0.15)';
        };
        cancelBtn.onmouseout = () => {
          cancelBtn.style.opacity = '0.9';
          cancelBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        };

        // Add click handlers
        replaceBtn.onclick = () => {
          try {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(improvedText));
              selection.removeAllRanges();
            }
          } catch (error) {
            console.error('Error replacing text:', error);
          }
          closePopup();
        };

        cancelBtn.onclick = () => {
          try {
            window.getSelection().removeAllRanges();
          } catch (error) {
            console.error('Error clearing selection:', error);
          }
          closePopup();
        };
      }
    }, 50);

  } catch (error) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

// Function to handle text selection with delay
let selectionTimeout;
let currentSelectedText = '';

function handleTextSelection(selectedText) {
  currentSelectedText = selectedText;
}

// Listen for text selection
document.addEventListener('mouseup', function(e) {
  const selectedText = window.getSelection().toString().trim();
  handleTextSelection(selectedText);
});

// Listen for keyboard shortcut
document.addEventListener('keydown', function(e) {
  // Check for Ctrl+M (Windows) or Cmd+M (Mac)
  if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
    e.preventDefault(); // Prevent default browser behavior
    
    if (currentSelectedText) {
      const wordCount = currentSelectedText.trim().split(/\s+/).length;
      if (wordCount > 3) {
        showImprovedTextPopup(currentSelectedText);
      }
    }
  }
});