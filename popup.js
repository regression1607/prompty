document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveKey');
  const statusDiv = document.getElementById('status');

  // Add hover effects
  saveButton.addEventListener('mouseover', () => {
    saveButton.style.opacity = '1';
    saveButton.style.background = '#0066CC';
  });
  
  saveButton.addEventListener('mouseout', () => {
    saveButton.style.opacity = '0.9';
    saveButton.style.background = '#007AFF';
  });

  // Add input focus effect
  apiKeyInput.addEventListener('focus', () => {
    apiKeyInput.style.border = '1px solid rgba(0, 122, 255, 0.5)';
    apiKeyInput.style.background = 'rgba(255, 255, 255, 0.08)';
  });

  apiKeyInput.addEventListener('blur', () => {
    apiKeyInput.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    apiKeyInput.style.background = 'rgba(255, 255, 255, 0.05)';
  });

  // Load saved API key
  chrome.storage.sync.get(['geminiApiKey'], function(result) {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  // Save API key
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    chrome.storage.sync.set({ geminiApiKey: apiKey }, function() {
      showStatus('API key saved successfully!', 'success');
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    if (type === 'error') {
      statusDiv.style.background = 'rgba(255, 59, 48, 0.1)';
      statusDiv.style.color = '#ff3b30';
      statusDiv.style.border = '1px solid rgba(255, 59, 48, 0.2)';
    } else {
      statusDiv.style.background = 'rgba(52, 199, 89, 0.1)';
      statusDiv.style.color = '#34c759';
      statusDiv.style.border = '1px solid rgba(52, 199, 89, 0.2)';
    }

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}); 