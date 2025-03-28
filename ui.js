// UI Elements
export const elements = {
  status: document.getElementById('status').querySelector('p'),
  setupView: document.getElementById('setupView'),
  n8nConfigView: document.getElementById('n8nConfigView'),
  savedConfigView: document.getElementById('savedConfigView'),
  proceedToN8n: document.getElementById('proceedToN8n'),
  n8nConfigForm: document.getElementById('n8nConfigForm'),
  n8nUrl: document.getElementById('n8nUrl'),
  n8nPassword: document.getElementById('n8nPassword'),
  n8nApiKey: document.getElementById('n8nApiKey'),
  saveN8nConfig: document.getElementById('saveN8nConfig'),
  savedConfig: document.getElementById('savedConfig'),
  editConfig: document.getElementById('editConfig')
};

// View Management
export const showView = (viewName) => {
  // Hide all views
  elements.setupView.style.display = 'none';
  elements.n8nConfigView.style.display = 'none';
  elements.savedConfigView.style.display = 'none';

  // Show requested view
  switch (viewName) {
    case 'setup':
      elements.setupView.style.display = 'block';
      break;
    case 'n8nConfig':
      elements.n8nConfigView.style.display = 'block';
      break;
    case 'savedConfig':
      elements.savedConfigView.style.display = 'block';
      break;
  }
};

// Helper Functions
export const updateStatus = (message, isError = false) => {
  const statusElement = elements.status;
  statusElement.innerHTML = message.replace(/\n/g, '<br>');
  statusElement.parentElement.className = isError ? 'alert alert-danger mb-4' : 'alert alert-info mb-4';
  console.log('Status updated:', message);
};

export const displaySavedConfig = (config) => {
  if (!config) {
    elements.savedConfig.innerHTML = '<p class="text-muted">No configuration saved</p>';
    return;
  }

  const maskedPassword = config.password ? '••••••••' : 'Not set';
  const maskedApiKey = config.apiKey ? '••••••••' : 'Not set';

  elements.savedConfig.innerHTML = `
    <div class="saved-config-details">
      <div class="mb-3">
        <strong>n8n URL:</strong><br>
        <a href="${config.url}" target="_blank">${config.url}</a>
      </div>
      <div class="mb-3">
        <strong>Owner Password:</strong><br>
        ${maskedPassword}
      </div>
      <div class="mb-3">
        <strong>API Key:</strong><br>
        ${maskedApiKey}
      </div>
      <div class="text-muted">
        Last Updated: ${new Date(config.timestamp).toLocaleString()}
      </div>
    </div>
  `;
};

export const populateConfigForm = (config) => {
  if (!config) return;
  
  elements.n8nUrl.value = config.url || '';
  elements.n8nPassword.value = config.password || '';
  elements.n8nApiKey.value = config.apiKey || '';
};

export const getConfigFromForm = () => {
  return {
    url: elements.n8nUrl.value.trim(),
    password: elements.n8nPassword.value.trim(),
    apiKey: elements.n8nApiKey.value.trim()
  };
};

export const validateConfig = (config) => {
  if (!config.url) {
    throw new Error('n8n URL is required');
  }
  
  try {
    new URL(config.url);
  } catch (error) {
    throw new Error('Invalid n8n URL format');
  }
  
  return true;
};
