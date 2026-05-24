@echo off
REM AI-Based Medical Waste Management System - Stop Script for Windows
REM This script stops all running services

echo 🛑 Stopping AI-Based Medical Waste Management System...
echo ==================================================

REM Stop Backend Server
echo 🛑 Stopping Backend Server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Backend Server*" 2>NUL
if %ERRORLEVEL% equ 0 (
    echo ✅ Backend Server stopped
) else (
    echo ℹ️  Backend Server was not running
)

REM Stop AI Service
echo 🛑 Stopping AI Service...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq AI Service*" 2>NUL
if %ERRORLEVEL% equ 0 (
    echo ✅ AI Service stopped
) else (
    echo ℹ️  AI Service was not running
)

REM Stop Frontend
echo 🛑 Stopping Frontend...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Frontend*" 2>NUL
if %ERRORLEVEL% equ 0 (
    echo ✅ Frontend stopped
) else (
    echo ℹ️  Frontend was not running
)

REM Additional cleanup - stop any remaining processes
echo.
echo 🧹 Cleaning up any remaining processes...

REM Stop any remaining Node.js processes on our ports
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000"') do (
    echo 🛑 Stopping process using port 5000...
    taskkill /F /PID %%a 2>NUL
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000"') do (
    echo 🛑 Stopping process using port 8000...
    taskkill /F /PID %%a 2>NUL
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173"') do (
    echo 🛑 Stopping process using port 5173...
    taskkill /F /PID %%a 2>NUL
)

REM Stop any remaining npm processes
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq npm*" 2>NUL

echo.
echo ✅ All services stopped successfully!
echo ==================================================

echo 🏥 AI-Based Medical Waste Management System stopped.
pause
