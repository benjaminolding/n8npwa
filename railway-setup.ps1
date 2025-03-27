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
