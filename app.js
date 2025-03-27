// Check if we are connected to Railway (i.e., if the API key and n8n details are saved in IndexedDB)
let connected = false;

async function checkConnection() {
  const credentials = await getFromIndexedDB('railway-credentials');
  const n8nDetails = await getFromIndexedDB('n8n-details');
  
  if (credentials && n8nDetails) {
    connected = true;
    document.getElementById('status').innerHTML = 'Connected to Railway!';
    document.getElementById('deployButtonContainer').style.display = 'block'; // Show deploy button
    generateQRCode(credentials, n8nDetails); // Generate QR code to share credentials
  }
}

async function saveToIndexedDB(key, data) {
  const db = await openIndexedDB();
  const tx = db.transaction('store', 'readwrite');
  const store = tx.objectStore('store');
  store.put(data, key);
  await tx.complete;
}

async function getFromIndexedDB(key) {
  const db = await openIndexedDB();
  const tx = db.transaction('store', 'readonly');
  const store = tx.objectStore('store');
  const data = await store.get(key);
  await tx.complete;
  return data;
}

async function openIndexedDB() {
  const db = await idb.openDB('pwa-store', 1, {
    upgrade(db) {
      db.createObjectStore('store');
    }
  });
  return db;
}

function generateQRCode(credentials, n8nDetails) {
  const data = JSON.stringify({ credentials, n8nDetails });
  QRCode.toCanvas(document.getElementById('qrCodeCanvas'), data, (error) => {
    if (error) console.error(error);
  });
}

// Function to handle platform-specific script downloads
function downloadScript() {
  const os = navigator.platform.toLowerCase();

  let scriptContent = '';
  let fileName = '';

  if (os.includes('win')) {
    // Windows - download .bat script
    scriptContent = `
@echo off
REM Check if Railway CLI is installed
where railway > nul 2> nul
if %errorlevel% neq 0 (
    echo Railway CLI not found, installing...
    curl -sSL https://railway.app/cli | bash
)

REM Login to Railway
echo Logging in to Railway...
railway login

REM Initialize the project
echo Initializing Railway project...
railway init

REM Deploy n8n server
echo Deploying n8n server...
railway up --env production
`;
    fileName = 'railway-setup.bat';
  } else {
    // macOS/Linux - download .sh script
    scriptContent = `
#!/bin/bash
# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found, installing..."
    curl -sSL https://railway.app/cli | bash
fi

# Login to Railway
echo "Login to Railway..."
railway login

# Initialize the project
echo "Initializing Railway project..."
railway init

# Deploy the n8n server
echo "Deploying n8n server..."
railway up --env production
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
}

document.getElementById('connectRailway').addEventListener('click', () => {
  // Download the platform-specific Railway CLI setup script
  downloadScript();
  document.getElementById('status').innerHTML = 'Script downloaded. Run the script to set up Railway.';
});

document.getElementById('deployN8n').addEventListener('click', () => {
  alert('Deploying n8n Server...');
  // Implement logic to trigger deployment if the server is already set up.
});

// Check if connected to Railway on load
checkConnection();
