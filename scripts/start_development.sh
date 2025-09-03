#!/bin/bash

# 🚀 Enhanced Development Startup Script
# Following Cursor Agent Memory Rules

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=9889
BACKEND_PORT=8960
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
VENV_DIR=".venv"

echo -e "${BLUE}🚀 Starting Boot Interceptor Development Environment${NC}"
echo -e "${BLUE}Following Cursor Agent Memory Rules${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local service_name=$2
    echo -e "${YELLOW}🔄 Killing $service_name on port $port...${NC}"
    
    # Try graceful shutdown first
    if lsof -ti:$port >/dev/null 2>&1; then
        lsof -ti:$port | xargs kill -TERM 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if lsof -ti:$port >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Force killing $service_name...${NC}"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        fi
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service_name to be ready on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready on port $port${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start on port $port${NC}"
    return 1
}

# Check and kill existing services
echo -e "${BLUE}🔍 Checking for existing services...${NC}"

if check_port $FRONTEND_PORT; then
    kill_port $FRONTEND_PORT "Frontend"
fi

if check_port $BACKEND_PORT; then
    kill_port $BACKEND_PORT "Backend"
fi

echo ""

# Activate virtual environment
echo -e "${BLUE}🐍 Activating Python virtual environment...${NC}"
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
    python3 -m venv $VENV_DIR
fi

source $VENV_DIR/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}"

# Install/update backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd $BACKEND_DIR
pip install -r requirements.txt
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Start backend first (following memory rules)
echo -e "${BLUE}🚀 Starting backend on port $BACKEND_PORT...${NC}"
echo -e "${BLUE}Following rule: Start backend first, then other services${NC}"

# Start backend in background
python run.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"

# Wait for backend to be ready
if wait_for_service $BACKEND_PORT "Backend"; then
    echo -e "${GREEN}✅ Backend is ready!${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Stopping...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Go back to root directory
cd ..

# Install/update frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd $FRONTEND_DIR
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Start frontend
echo -e "${BLUE}🚀 Starting frontend on port $FRONTEND_PORT...${NC}"
echo -e "${BLUE}Following rule: Frontend must run on 9889${NC}"

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"

# Wait for frontend to be ready
if wait_for_service $FRONTEND_PORT "Frontend"; then
    echo -e "${GREEN}✅ Frontend is ready!${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Stopping...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Go back to root directory
cd ..

echo ""
echo -e "${GREEN}🎉 Development environment started successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend: http://localhost:$FRONTEND_PORT${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:$BACKEND_PORT${NC}"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo -e "  • View logs: tail -f backend/backend.log"
echo -e "  • Stop services: pkill -f 'python run.py' && pkill -f 'npm run dev'"
echo -e "  • Kill ports: lsof -ti:$FRONTEND_PORT | xargs kill -9"
echo -e "  • Kill ports: lsof -ti:$BACKEND_PORT | xargs kill -9"
echo ""
echo -e "${BLUE}🔒 Following Cursor Agent Memory Rules:${NC}"
echo -e "  ✅ Backend started first"
echo -e "  ✅ Frontend on port 9889"
echo -e "  ✅ Backend on port 8960"
echo -e "  ✅ Port conflicts resolved"
echo ""

# Save PIDs for easy management
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo -e "${GREEN}📝 Process IDs saved to .backend.pid and .frontend.pid${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping development environment...${NC}"
    
    if [ -f .backend.pid ]; then
        BACKEND_PID=$(cat .backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm .backend.pid
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    if [ -f .frontend.pid ]; then
        FRONTEND_PID=$(cat .frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm .frontend.pid
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
    
    echo -e "${GREEN}🎉 Development environment stopped${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Keep script running
wait
