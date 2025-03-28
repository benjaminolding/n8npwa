# Railway n8n Deployment Script
#
# IMPORTANT: This script must be run from within a PowerShell terminal
# To run this script:
# 1. Open PowerShell
# 2. Navigate to the script directory
# 3. Run: .\railway-setup.ps1
#
# DO NOT run this script by double-clicking or from other terminals (CMD, Git Bash, etc.)
# as this will prevent proper logging and execution.

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
$logFile = "railway-deploy-$timestamp.log"

# Create log function
function Write-Log {
    param($Message)
    $logMessage = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): $Message"
    Write-Host $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

# Function to install Railway CLI
function Install-Railway {
    # First try Scoop if available (preferred method for Windows)
    if (Get-Command "scoop" -ErrorAction SilentlyContinue) {
        Write-Log "Installing Railway CLI via Scoop..."
        scoop bucket add railway https://github.com/railwayapp/scoop-bucket.git
        scoop install railway
        return
    }
    
    # If Scoop not available, check for npm
    if (Get-Command "npm" -ErrorAction SilentlyContinue) {
        Write-Log "Installing Railway CLI via npm..."
        npm install -g @railway/cli
        return
    }
    
    # If neither is available
    Write-Log "Error: Neither Scoop nor npm is available. Please install Scoop (recommended) or Node.js/npm first."
    Write-Log "You can install Scoop by running this command in PowerShell:"
    Write-Log "iwr -useb get.scoop.sh | iex"
    exit 1
}

try {
    # Test if we can write to the log file
    Write-Log "Initializing deployment script..."
    Write-Log "Testing log file write access..."
    
    Write-Log "Checking Railway CLI installation..."
    
    # Check if Railway CLI is installed
    if (-not (Get-Command "railway" -ErrorAction SilentlyContinue)) {
        Write-Log "Railway CLI not found, attempting installation..."
        Install-Railway
        
        # Verify installation
        if (-not (Get-Command "railway" -ErrorAction SilentlyContinue)) {
            Write-Log "Error: Railway CLI installation failed"
            exit 1
        }
        Write-Log "Railway CLI installed successfully"
    } else {
        Write-Log "Railway CLI is already installed"
    }

    # Login to Railway
    Write-Log "Logging in to Railway..."
    railway login

    # Initialize new project
    Write-Log "Creating new Railway project..."
    railway init

    # Deploy n8n
    Write-Log "Deploying n8n..."
    railway up --service n8n --env production

    # Get deployment URL
    Write-Log "Getting deployment URL..."
    $domain = railway domain
    Write-Log "Deployment URL: $domain"

    Write-Log "Deployment completed successfully!"

} catch {
    $errorMessage = $_.Exception.Message
    Write-Log "Error occurred: $errorMessage"
    Write-Log "Stack trace: $($_.Exception.StackTrace)"
    exit 1
} finally {
    Write-Log "Script execution completed"
}
