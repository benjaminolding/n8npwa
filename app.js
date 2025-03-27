// IndexedDB setup
const DB_NAME = 'RailwayN8nDB';
const DB_VERSION = 1;
const STORE_NAME = 'credentials';

let db;

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// UI Elements
const statusElement = document.getElementById('status').querySelector('p');
const downloadScriptButton = document.getElementById('downloadScript');
const logFileInput = document.getElementById('logFile');
const processLogButton = document.getElementById('processLog');
const workflowUpload = document.getElementById('workflowUpload');
const workflowFile = document.getElementById('workflowFile');
const uploadWorkflowButton = document.getElementById('uploadWorkflow');
const qrContainer = document.getElementById('qrCodeContainer');
const qrCanvas = document.getElementById('qrCodeCanvas');

// Helper Functions
const updateStatus = (message, isError = false) => {
  statusElement.textContent = message;
  statusElement.style.color = isError ? 'var(--error-color)' : 'var(--success-color)';
};

const saveCredentials = async (credentials) => {
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  await store.put({ id: 'railway', ...credentials });
};

const getCredentials = async () => {
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  return store.get('railway');
};

const generateQRCode = async (data) => {
  try {
    await QRCode.toCanvas(qrCanvas, JSON.stringify(data));
    qrContainer.style.display = 'block';
  } catch (error) {
    console.error('Error generating QR code:', error);
    updateStatus('Failed to generate QR code', true);
  }
};

// Generate and download deployment script
const generateScript = () => {
  const os = navigator.platform.toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFileName = `railway-deploy-${timestamp}.log`;

  let scriptContent = '';
  let fileName = '';

  if (os.includes('win')) {
    // Windows PowerShell script
    scriptContent = `
# Railway n8n Deployment Script
$ErrorActionPreference = "Stop"
$logFile = "${logFileName}"

# Start logging
Start-Transcript -Path $logFile -Append

try {
    Write-Host "Checking Railway CLI installation..."
    
    # Check if Railway CLI is installed
    if (-not (Get-Command "railway" -ErrorAction SilentlyContinue)) {
        Write-Host "Railway CLI not found, installing..."
        Invoke-WebRequest -Uri "https://raw.githubusercontent.com/railwayapp/cli/master/install.ps1" -OutFile "railway-install.ps1"
        .\railway-install.ps1
        Remove-Item "railway-install.ps1"
    }

    # Login to Railway
    Write-Host "Logging in to Railway..."
    railway login

    # Initialize new project
    Write-Host "Creating new Railway project..."
    railway init

    # Deploy n8n
    Write-Host "Deploying n8n..."
    railway up --service n8n --env production

    # Get deployment URL
    $deployUrl = railway domain
    Write-Host "Deployment URL: $deployUrl"
    
    Write-Host "Deployment completed successfully!"

} catch {
    Write-Host "Error: $_"
    exit 1
} finally {
    Stop-Transcript
}
`;
    fileName = 'railway-setup.ps1';
  } else {
    // Unix bash script
    scriptContent = `
#!/bin/bash
# Railway n8n Deployment Script
set -e

# Set up logging
exec 1> >(tee "${logFileName}") 2>&1

echo "Checking Railway CLI installation..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found, installing..."
    curl -fsSL https://raw.githubusercontent.com/railwayapp/cli/master/install.sh | sh
fi

# Login to Railway
echo "Logging in to Railway..."
railway login

# Initialize new project
echo "Creating new Railway project..."
railway init

# Deploy n8n
echo "Deploying n8n..."
railway up --service n8n --env production

# Get deployment URL
echo "Deployment URL:"
railway domain

echo "Deployment completed successfully!"
`;
    fileName = 'railway-setup.sh';
  }

  const blob = new Blob([scriptContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);

  updateStatus('Script downloaded. Run it and upload the generated log file.');
};

// Process deployment log file
const processLogFile = async () => {
  const file = logFileInput.files[0];
  if (!file) {
    updateStatus('Please select a log file', true);
    return;
  }

  try {
    const content = await file.text();
    
    // Extract deployment URL
    const urlMatch = content.match(/Deployment URL:?\s*(https?:\/\/[^\s]+)/i);
    if (!urlMatch) {
      throw new Error('Deployment URL not found in log file');
    }

    const deploymentUrl = urlMatch[1];
    
    // Extract Railway project info
    const projectMatch = content.match(/Project:\s*([^\s]+)/i);
    const projectId = projectMatch ? projectMatch[1] : null;

    const credentials = {
      deploymentUrl,
      projectId,
      timestamp: new Date().toISOString()
    };

    await saveCredentials(credentials);
    await generateQRCode(credentials);
    
    workflowUpload.style.display = 'block';
    updateStatus('Deployment credentials saved successfully!');
    
  } catch (error) {
    console.error('Error processing log file:', error);
    updateStatus('Failed to process log file: ' + error.message, true);
  }
};

// Upload workflow
const uploadWorkflow = async () => {
  const file = workflowFile.files[0];
  if (!file) {
    updateStatus('Please select a workflow file', true);
    return;
  }

  try {
    const credentials = await getCredentials();
    if (!credentials) {
      throw new Error('No deployment credentials found');
    }

    const workflow = await file.text();
    const workflowData = JSON.parse(workflow);

    // Construct the n8n API endpoint
    const apiUrl = `${credentials.deploymentUrl}/api/workflows`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      throw new Error(`Failed to upload workflow: ${response.statusText}`);
    }

    updateStatus('Workflow uploaded successfully!');
    
  } catch (error) {
    console.error('Error uploading workflow:', error);
    updateStatus('Failed to upload workflow: ' + error.message, true);
  }
};

// Initialize app
const initApp = async () => {
  try {
    await initDB();
    
    // Event listeners
    downloadScriptButton.addEventListener('click', generateScript);
    processLogButton.addEventListener('click', processLogFile);
    uploadWorkflowButton.addEventListener('click', uploadWorkflow);

    // Check for existing credentials
    const credentials = await getCredentials();
    if (credentials) {
      workflowUpload.style.display = 'block';
      await generateQRCode(credentials);
      updateStatus('Ready to manage n8n deployment');
    }
  } catch (error) {
    console.error('Initialization error:', error);
    updateStatus('Failed to initialize application', true);
  }
};

// Start the app
initApp();
