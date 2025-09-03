#!/bin/bash

# Check Ports Script - Boot Interceptor Platform
# This script checks if ports 9889 (Frontend) and 8960 (Backend) are free

set -e

echo "🔍 Checking port availability for Boot Interceptor Platform..."

# Function to check port status
check_port() {
    local port=$1
    local service_name=$2
    
    echo "🔍 Checking port $port ($service_name)..."
    
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "❌ Port $port is IN USE by:"
        lsof -ti:$port | while read pid; do
            ps -p $pid -o pid,ppid,command --no-headers
        done
        return 1
    else
        echo "✅ Port $port is FREE"
        return 0
    fi
}

# Initialize status variables
frontend_free=false
backend_free=false

# Check frontend port (9889)
echo "🎯 Checking Frontend Port (9889)..."
if check_port 9889 "Frontend"; then
    frontend_free=true
fi

echo ""

# Check backend port (8960)
echo "🎯 Checking Backend Port (8960)..."
if check_port 8960 "Backend"; then
    backend_free=true
fi

echo ""

# Summary
echo "📋 Port Status Summary:"
echo "   Frontend (9889): $(if $frontend_free; then echo "✅ FREE"; else echo "❌ IN USE"; fi)"
echo "   Backend (8960):  $(if $backend_free; then echo "✅ FREE"; else echo "❌ IN USE"; fi)"
echo ""

# Determine if ready to start
if $frontend_free && $backend_free; then
    echo "🎉 All ports are free! Ready to start development services."
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Start backend: cd backend && python run.py"
    echo "   2. Start frontend: cd frontend && npm run dev"
    exit 0
else
    echo "⚠️  Some ports are in use. Please free them before starting services."
    echo ""
    echo "🔧 To free ports, run: ./scripts/kill_ports.sh"
    exit 1
fi
