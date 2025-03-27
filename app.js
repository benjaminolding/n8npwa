function downloadScript() {
  const os = navigator.platform.toLowerCase();

  let scriptContent = '';
  let fileName = '';

  if (os.includes('win')) {
    // For Windows, use PowerShell script
    scriptContent = `
# Check if Railway CLI is installed
if (-not (Get-Command "railway" -ErrorAction SilentlyContinue)) {
    Write-Host "Railway CLI not found, installing..."
    Invoke-WebRequest -Uri "https://railway.app/cli" -OutFile "railway-cli-installer.sh"
    bash railway-cli-installer.sh
}

# Login to Railway
Write-Host "Logging in to Railway..."
railway login

# Initialize the project
Write-Host "Initializing Railway project..."
railway init

# Deploy the n8n server
Write-Host "Deploying n8n server..."
railway up --env production
`;
    fileName = 'railway-setup.ps1';
  } else {
    // For macOS/Linux, use Bash script
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
