#!/bin/bash
# Railway n8n Deployment Script
set -e

# Set up logging
timestamp=$(date +%Y-%m-%d-%H-%M-%S)
logFile="railway-deploy-$timestamp.log"
exec 1> >(tee "$logFile") 2>&1

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
