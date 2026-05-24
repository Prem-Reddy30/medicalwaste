#!/bin/bash

# AI-Based Medical Waste Management System - Startup Script
# This script starts all services (Backend, AI Service, and Frontend)

echo "🏥 Starting AI-Based Medical Waste Management System..."
echo "=================================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use"
        return 1
    fi
    return 0
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start within expected time"
    return 1
}

# Check if MongoDB is running
echo "🔍 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first:"
    echo "   sudo systemctl start mongod"
    echo "   or: mongod"
    exit 1
else
    echo "✅ MongoDB is running"
fi

# Check ports
echo "🔍 Checking available ports..."
check_port 5000 || exit 1
check_port 8000 || exit 1
check_port 5173 || exit 1

# Start Backend Server
echo "🚀 Starting Backend Server..."
cd server
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found in server directory, using defaults"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
npm run dev &
BACKEND_PID=$!
echo "📡 Backend started with PID: $BACKEND_PID"

# Wait for backend to be ready
cd ..
wait_for_service "http://localhost:5000/api/health" "Backend Server"

# Start AI Service
echo "🤖 Starting AI Service..."
cd ai-service

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if requirements.txt changed
if [ ! -f ".deps_installed" ] || [ "requirements.txt" -nt ".deps_installed" ]; then
    echo "📦 Installing AI service dependencies..."
    pip install -r requirements.txt
    touch .deps_installed
fi

# Create necessary directories
mkdir -p logs models

# Start AI service in background
python main.py &
AI_SERVICE_PID=$!
echo "🤖 AI Service started with PID: $AI_SERVICE_PID"

# Wait for AI service to be ready
cd ..
wait_for_service "http://localhost:8000/health" "AI Service"

# Start Frontend
echo "🎨 Starting Frontend..."
cd client

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
echo "🎨 Frontend started with PID: $FRONTEND_PID"

# Wait a moment for frontend to start
sleep 5

cd ..

# Save PIDs to file for cleanup
echo $BACKEND_PID > .backend.pid
echo $AI_SERVICE_PID > .ai_service.pid
echo $FRONTEND_PID > .frontend.pid

echo ""
echo "🎉 All services started successfully!"
echo "=================================================="
echo "📱 Frontend:     http://localhost:5173"
echo "🔧 Backend API:  http://localhost:5000/api"
echo "🤖 AI Service:   http://localhost:8000"
echo "📊 Health Check: http://localhost:5000/api/health"
echo ""
echo "📝 Service PIDs saved to .*.pid files"
echo "🛑 To stop all services: ./stop-services.sh"
echo ""
echo "🏥 AI-Based Medical Waste Management System is ready!"
echo "=================================================="

# Show service status
echo "📊 Service Status:"
echo "   Backend: $(curl -s http://localhost:5000/api/health | grep -o '"status":"[^"]*"' || echo 'Unknown')"
echo "   AI Service: $(curl -s http://localhost:8000/health | grep -o '"status":"[^"]*"' || echo 'Unknown')"
echo "   Frontend: Running on port 5173"
