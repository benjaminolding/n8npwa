// UI Elements
const elements = {
  status: document.getElementById('status').querySelector('p'),
  setupView: document.getElementById('setupView'),
  n8nConfigView: document.getElementById('n8nConfigView'),
  savedConfigView: document.getElementById('savedConfigView'),
  proceedToN8n: document.getElementById('proceedToN8n'),
  n8nConfigForm: document.getElementById('n8nConfigForm'),
  n8nUrl: document.getElementById('n8nUrl'),
  n8nPort: document.getElementById('n8nPort'),
  n8nPassword: document.getElementById('n8nPassword'),
  n8nApiKey: document.getElementById('n8nApiKey'),
  saveN8nConfig: document.getElementById('saveN8nConfig'),
  savedConfig: document.getElementById('savedConfig'),
  editConfig: document.getElementById('editConfig'),
  testConnection: document.getElementById('testConnection')
};

// View Management
function showView(viewName) {
  elements.setupView.style.display = 'none';
  elements.n8nConfigView.style.display = 'none';
  elements.savedConfigView.style.display = 'none';

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
}

function updateStatus(message, isError = false) {
  const statusElement = elements.status;
  statusElement.innerHTML = message.replace(/\n/g, '<br>');
  statusElement.parentElement.className = isError ? 'alert alert-danger mb-4' : 'alert alert-info mb-4';
}

function displaySavedConfig(config) {
  if (!config) {
    elements.savedConfig.innerHTML = '<p class="text-muted">No configuration saved</p>';
    return;
  }

  const maskedPassword = config.password ? '••••••••' : 'Not set';
  const maskedApiKey = config.apiKey ? '••••••••' : 'Not set';
  const displayUrl = config.port ? `${config.url}:${config.port}` : config.url;

  elements.savedConfig.innerHTML = `
    <div class="saved-config-details">
      <div class="mb-3">
        <strong>n8n URL:</strong><br>
        <a href="${displayUrl}" target="_blank">${displayUrl}</a>
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
}

function getConfigFromForm() {
  const port = elements.n8nPort.value.trim();
  return {
    url: elements.n8nUrl.value.trim(),
    port: port ? parseInt(port) : null,
    password: elements.n8nPassword.value.trim(),
    apiKey: elements.n8nApiKey.value.trim()
  };
}

// Function to construct the full URL with port if needed
function getFullUrl(config) {
  let baseUrl = config.url;
  
  // Remove trailing slashes
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  if (config.port) {
    const url = new URL(baseUrl);
    url.port = config.port.toString();
    return url.toString();
  }
  return baseUrl;
}

// Function to test n8n connection
async function testN8nConnection(config) {
  try {
    const fullUrl = getFullUrl(config);
    const testUrl = `${fullUrl}/api/v1/workflows`;

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-N8N-API-KEY': config.apiKey
      }
    });

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Function to update button state during testing
function updateTestButton(loading = false) {
  const button = elements.testConnection;
  if (loading) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Testing...';
  } else {
    button.disabled = false;
    button.innerHTML = 'Test Connection';
  }
}

// Function to update save button state
function updateSaveButton(loading = false) {
  const button = elements.saveN8nConfig;
  if (loading) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Testing connection...';
  } else {
    button.disabled = false;
    button.innerHTML = 'Save Configuration';
  }
}

// Event Listeners
elements.proceedToN8n.addEventListener('click', () => {
  showView('n8nConfig');
  updateStatus('Enter your n8n configuration details.');
});

elements.testConnection.addEventListener('click', async () => {
  const config = JSON.parse(localStorage.getItem('n8nConfig') || 'null');
  if (!config || !config.url || !config.apiKey) {
    updateStatus('Configuration not found. Please edit your configuration.', true);
    return;
  }

  updateTestButton(true);
  updateStatus('Testing connection to n8n...');

  const connectionSuccess = await testN8nConnection(config);
  updateTestButton(false);

  if (connectionSuccess) {
    updateStatus('✅ Connection successful! Your n8n instance is working properly.');
  } else {
    updateStatus('❌ Connection failed. Please check your n8n instance or edit your API key.', true);
  }
});

elements.n8nConfigForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const config = getConfigFromForm();
  
  if (!config.url) {
    updateStatus('n8n URL is required', true);
    return;
  }

  try {
    new URL(config.url);
  } catch (error) {
    updateStatus('Invalid n8n URL format', true);
    return;
  }

  if (!config.apiKey) {
    updateStatus('API Key is required', true);
    return;
  }

  // Update UI to show testing state
  updateSaveButton(true);
  updateStatus('Testing connection to n8n...');

  // Test the connection
  const connectionSuccess = await testN8nConnection(config);

  // Reset button state
  updateSaveButton(false);

  if (!connectionSuccess) {
    updateStatus('Failed to connect to n8n. Please verify your URL and API Key.', true);
    return;
  }

  // Save configuration if connection test passed
  config.timestamp = Date.now();
  localStorage.setItem('n8nConfig', JSON.stringify(config));
  
  showView('savedConfig');
  displaySavedConfig(config);
  updateStatus('✅ Connection successful! Configuration saved.');
});

elements.editConfig.addEventListener('click', () => {
  const config = JSON.parse(localStorage.getItem('n8nConfig') || 'null');
  showView('n8nConfig');
  if (config) {
    elements.n8nUrl.value = config.url || '';
    elements.n8nPort.value = config.port || '';
    elements.n8nPassword.value = config.password || '';
    elements.n8nApiKey.value = config.apiKey || '';
  }
  updateStatus('Edit your n8n configuration.');
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const config = JSON.parse(localStorage.getItem('n8nConfig') || 'null');
  if (config) {
    showView('savedConfig');
    displaySavedConfig(config);
    updateStatus(`Managing n8n deployment at ${getFullUrl(config)}`);
  } else {
    showView('setup');
    updateStatus('Follow the instructions to deploy your n8n server on Railway.');
  }
});
