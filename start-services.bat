@echo off
REM AI-Based Medical Waste Management System - Startup Script for Windows
REM This script starts all services (Backend, AI Service, and Frontend)

echo 🏥 Starting AI-Based Medical Waste Management System...
echo ==================================================

REM Function to check if MongoDB is running
echo 🔍 Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% neq 0 (
    echo ❌ MongoDB is not running. Please start MongoDB first:
    echo    mongod
    pause
    exit /b 1
) else (
    echo ✅ MongoDB is running
)

REM Start Backend Server
echo 🚀 Starting Backend Server...
cd server

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
)

REM Start backend in background
start "Backend Server" cmd /c "npm run dev"
echo 📡 Backend Server started

cd ..

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start AI Service
echo 🤖 Starting AI Service...
cd ai-service

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 🐍 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if needed
if not exist ".deps_installed" (
    echo 📦 Installing AI service dependencies...
    pip install -r requirements.txt
    echo. > .deps_installed
)

REM Create necessary directories
if not exist "logs" mkdir logs
if not exist "models" mkdir models

REM Start AI service in background
start "AI Service" cmd /c "python main.py"
echo 🤖 AI Service started

cd ..

REM Wait for AI service to start
timeout /t 5 /nobreak >nul

REM Start Frontend
echo 🎨 Starting Frontend...
cd client

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

REM Start frontend in background
start "Frontend" cmd /c "npm run dev"
echo 🎨 Frontend started

cd ..

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 All services started successfully!
echo ==================================================
echo 📱 Frontend:     http://localhost:5173
echo 🔧 Backend API:  http://localhost:5000/api
echo 🤖 AI Service:   http://localhost:8000
echo 📊 Health Check: http://localhost:5000/api/health
echo.
echo 🏥 AI-Based Medical Waste Management System is ready!
echo ==================================================
echo.
echo 💡 Close this window to keep services running
echo    or press Ctrl+C to stop all services
echo.

REM Keep the script running
pause
