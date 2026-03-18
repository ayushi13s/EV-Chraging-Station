@echo off
REM EV Charging System - Windows Setup Script
REM This script installs dependencies and starts the server

echo.
echo ========================================
echo  EV Charging Slot Booking System
echo  Complete Backend Edition
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js detected: 
node --version
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo ✓ npm detected: 
npm --version
echo.

REM Check if node_modules exist
if not exist node_modules (
    echo [1/3] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed successfully
    echo.
) else (
    echo ✓ Dependencies already installed
    echo.
)

echo [2/3] Checking environment configuration...
if not exist .env (
    echo Creating .env file...
    (
        echo PORT=3000
        echo JWT_SECRET=ev_charging_jwt_secret_key_2024_change_this_in_production
        echo NODE_ENV=development
    ) > .env
    echo ✓ .env file created
) else (
    echo ✓ .env file exists
)
echo.

echo [3/3] Starting server...
echo.
echo ========================================
echo  Server is starting...
echo ========================================
echo.
echo Server running on: http://localhost:3000
echo.
echo User Interface: http://localhost:3000/index.html
echo Admin Panel:    http://localhost:3000/admin.html
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm start

pause
