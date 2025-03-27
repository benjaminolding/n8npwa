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

# Deploy the n8n server (if not already deployed)
echo "Deploying n8n server..."
railway up --env production
