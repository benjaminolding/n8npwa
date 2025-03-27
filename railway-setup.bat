@echo off
setlocal EnableDelayedExpansion

:: Set up logging
set timestamp=%date:~10,4%-%date:~4,2%-%date:~7,2%-%time:~0,2%-%time:~3,2%-%time:~6,2%
set timestamp=!timestamp: =0!
set logFile=railway-deploy-%timestamp%.log

:: Start logging
echo Railway n8n Deployment Script > %logFile%
echo Timestamp: %date% %time% >> %logFile%

:: Check if Railway CLI is installed
echo Checking Railway CLI installation... >> %logFile%
where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo Railway CLI not found, installing... >> %logFile%
    curl -fsSL https://raw.githubusercontent.com/railwayapp/cli/master/install.sh -o railway-install.sh
    bash railway-install.sh
    if %errorlevel% neq 0 (
        echo Error: Failed to install Railway CLI >> %logFile%
        exit /b 1
    )
)

:: Login to Railway
echo Logging in to Railway... >> %logFile%
railway login
if %errorlevel% neq 0 (
    echo Error: Failed to login to Railway >> %logFile%
    exit /b 1
)

:: Initialize new project
echo Creating new Railway project... >> %logFile%
railway init
if %errorlevel% neq 0 (
    echo Error: Failed to initialize Railway project >> %logFile%
    exit /b 1
)

:: Deploy n8n
echo Deploying n8n... >> %logFile%
railway up --service n8n --env production
if %errorlevel% neq 0 (
    echo Error: Failed to deploy n8n >> %logFile%
    exit /b 1
)

:: Get deployment URL
echo Deployment URL: >> %logFile%
railway domain >> %logFile%

echo Deployment completed successfully! >> %logFile%

endlocal
