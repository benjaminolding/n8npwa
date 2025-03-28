#!/bin/bash
#
# Railway n8n Deployment Script
#
# IMPORTANT: This script must be run from within a bash terminal
# To run this script:
# 1. Open Terminal
# 2. Navigate to the script directory
# 3. Make the script executable: chmod +x railway-setup.sh
# 4. Run: ./railway-setup.sh
#
# DO NOT run this script by double-clicking or from other environments
# as this will prevent proper logging and execution.

set -e

# Set up logging with timestamp function
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# Set up logging
log_timestamp=$(date +%Y-%m-%d-%H-%M-%S)
logFile="railway-deploy-$log_timestamp.log"

# Create log function
log() {
    local message="$(timestamp): $1"
    echo "$message" | tee -a "$logFile"
}

# Ensure the log file is created
touch "$logFile"
log "Initializing deployment script..."
log "Testing log file write access..."

log "Checking Railway CLI installation..."

# Function to install Railway CLI
install_railway() {
    # First try Homebrew if available (preferred method for macOS)
    if command -v brew &> /dev/null; then
        log "Installing Railway CLI via Homebrew..."
        brew install railway
        return
    fi
    
    # If Homebrew not available, check for npm
    if command -v npm &> /dev/null; then
        log "Installing Railway CLI via npm..."
        npm install -g @railway/cli
        return
    fi
    
    # If neither is available
    log "Error: Neither Homebrew nor npm is available. Please install Homebrew (recommended) or Node.js/npm first."
    log "You can install Homebrew by visiting: https://brew.sh"
    exit 1
}

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    log "Railway CLI not found, attempting installation..."
    install_railway
    
    # Verify installation
    if ! command -v railway &> /dev/null; then
        log "Error: Railway CLI installation failed"
        exit 1
    fi
    log "Railway CLI installed successfully"
else
    log "Railway CLI is already installed"
fi

# Login to Railway
log "Logging in to Railway..."
railway login

# Initialize new project
log "Creating new Railway project..."
railway init

# Deploy n8n
log "Deploying n8n..."
railway up --service n8n --env production

# Get deployment URL
log "Getting deployment URL..."
domain=$(railway domain)
log "Deployment URL: $domain"

log "Deployment completed successfully!"
