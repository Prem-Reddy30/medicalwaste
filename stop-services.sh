#!/bin/bash

# AI-Based Medical Waste Management System - Stop Script
# This script stops all running services

echo "🛑 Stopping AI-Based Medical Waste Management System..."
echo "=================================================="

# Function to stop service by PID file
stop_service() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "🛑 Stopping $service_name (PID: $pid)..."
            kill $pid
            
            # Wait for graceful shutdown
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                echo "⚡ Force killing $service_name..."
                kill -9 $pid
            fi
            
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name process not found (PID: $pid)"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️  $service_name PID file not found"
    fi
}

# Function to stop service by port
stop_by_port() {
    local port=$1
    local service_name=$2
    
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🛑 Stopping $service_name running on port $port (PID: $pid)..."
        kill $pid
        
        # Wait for graceful shutdown
        local count=0
        while lsof -ti:$port >/dev/null 2>&1 && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # Force kill if still running
        if lsof -ti:$port >/dev/null 2>&1; then
            echo "⚡ Force killing $service_name..."
            kill -9 $(lsof -ti:$port)
        fi
        
        echo "✅ $service_name on port $port stopped"
    else
        echo "ℹ️  No $service_name found running on port $port"
    fi
}

# Stop services using PID files
stop_service ".backend.pid" "Backend Server"
stop_service ".ai_service.pid" "AI Service"
stop_service ".frontend.pid" "Frontend"

# Additional cleanup - stop any remaining processes on the ports
echo ""
echo "🧹 Cleaning up any remaining processes..."
stop_by_port 5000 "Backend Server"
stop_by_port 8000 "AI Service"
stop_by_port 5173 "Frontend"

# Clean up any remaining node processes that might be related
echo ""
echo "🧹 Checking for remaining Node.js processes..."
pkill -f "npm run dev" 2>/dev/null && echo "🛑 Stopped remaining npm dev processes"
pkill -f "vite" 2>/dev/null && echo "🛑 Stopped remaining Vite processes"
pkill -f "nodemon" 2>/dev/null && echo "🛑 Stopped remaining Nodemon processes"

# Clean up any remaining Python processes
pkill -f "python main.py" 2>/dev/null && echo "🛑 Stopped remaining Python main.py processes"

echo ""
echo "✅ All services stopped successfully!"
echo "=================================================="

# Show final status
echo "📊 Final Port Status:"
for port in 5000 8000 5173; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   Port $port: ⚠️  Still in use by PID $(lsof -ti:$port)"
    else
        echo "   Port $port: ✅ Available"
    fi
done

echo ""
echo "🏥 AI-Based Medical Waste Management System stopped."
