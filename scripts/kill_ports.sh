#!/bin/bash

# Kill Ports Script - Boot Interceptor Platform
# This script kills ports 9889 (Frontend) and 8960 (Backend) as per development rules

set -e

echo "🚀 Starting port cleanup process..."

# Function to kill a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    echo "🔍 Checking port $port ($service_name)..."
    
    # Check if port is in use
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "⚠️  Port $port is in use. Killing processes..."
        
        # Kill processes using the port
        lsof -ti:$port | xargs kill -9
        
        # Wait a moment for processes to terminate
        sleep 2
        
        # Verify port is free
        if lsof -ti:$port > /dev/null 2>&1; then
            echo "❌ Failed to kill processes on port $port"
            return 1
        else
            echo "✅ Successfully freed port $port"
        fi
    else
        echo "✅ Port $port is already free"
    fi
}

# Kill frontend port (9889)
echo "🎯 Killing frontend port 9889..."
kill_port 9889 "Frontend"

# Kill backend port (8960)
echo "🎯 Killing backend port 8960..."
kill_port 8960 "Backend"

echo "🎉 Port cleanup completed successfully!"
echo ""
echo "📋 Port Status:"
echo "   Frontend (9889): $(lsof -ti:9889 > /dev/null 2>&1 && echo "❌ In Use" || echo "✅ Free")"
echo "   Backend (8960):  $(lsof -ti:8960 > /dev/null 2>&1 && echo "❌ In Use" || echo "✅ Free")"
echo ""
echo "🚀 Ready to start development services!"
