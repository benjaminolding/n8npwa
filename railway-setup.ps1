# Railway n8n Deployment Script
$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
$logFile = "railway-deploy-$timestamp.log"

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
    Write-Host "Deployment URL:"
    railway domain

    Write-Host "Deployment completed successfully!"

} catch {
    Write-Host "Error: $_"
    exit 1
} finally {
    Stop-Transcript
}
