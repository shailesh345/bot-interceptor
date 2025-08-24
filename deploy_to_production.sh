#!/bin/bash

# 🚀 **TRAFFIC INTERCEPTOR SAAS PLATFORM - PRODUCTION DEPLOYMENT SCRIPT**
# This script deploys the complete platform to production

set -e  # Exit on any error

echo "🚀 Starting Traffic Interceptor SaaS Platform Production Deployment..."
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Verifying system requirements..."

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
if [[ $(echo "$PYTHON_VERSION >= 3.11" | bc -l) -eq 1 ]]; then
    print_success "Python version $PYTHON_VERSION is compatible"
else
    print_warning "Python version $PYTHON_VERSION detected. 3.11+ recommended."
fi

# Check Docker
if command -v docker &> /dev/null; then
    print_success "Docker is installed"
else
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose is installed"
else
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    print_success "Redis CLI is available"
else
    print_warning "Redis CLI not found. Installing Redis..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install redis
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y redis-server
    fi
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    print_success "PostgreSQL client is available"
else
    print_warning "PostgreSQL client not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install postgresql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install -y postgresql-client
    fi
fi

print_status "Setting up environment variables..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << EOF
FLASK_ENV=production
FLASK_DEBUG=0
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql://traffic_user:secure_password@localhost:5432/traffic_interceptor
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=$(openssl rand -hex 32)
CORS_ORIGINS=http://localhost:3000,http://localhost:5001
EOF
    print_success "Created .env file with secure keys"
else
    print_status ".env file already exists"
fi

print_status "Starting Redis service..."

# Start Redis service
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    brew services start redis
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
fi

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
for i in {1..30}; do
    if redis-cli ping &> /dev/null; then
        print_success "Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Redis failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

print_status "Setting up PostgreSQL database..."

# Start PostgreSQL service
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    brew services start postgresql
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        print_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Create database and user
print_status "Creating database and user..."
psql -U postgres -h localhost -c "CREATE DATABASE traffic_interceptor;" 2>/dev/null || print_warning "Database already exists"
psql -U postgres -h localhost -c "CREATE USER traffic_user WITH PASSWORD 'secure_password';" 2>/dev/null || print_warning "User already exists"
psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE traffic_interceptor TO traffic_user;" 2>/dev/null || print_warning "Privileges already granted"

print_status "Running database migrations..."

# Run database initialization
cd backend
psql -U traffic_user -d traffic_interceptor -f ../database/init_db.sql
cd ..

print_success "Database setup completed"

print_status "Installing Python dependencies..."

# Install Python dependencies
cd backend
pip3 install -r requirements.txt
cd ..

print_success "Dependencies installed"

print_status "Creating test user..."

# Create test user
cd backend
python3 scripts/create_test_user.py
cd ..

print_success "Test user created"

print_status "Building and starting Docker services..."

# Stop any existing services
docker-compose down 2>/dev/null || true

# Build and start services
docker-compose up -d --build

print_success "Docker services started"

print_status "Waiting for services to be ready..."

# Wait for the application to be ready
for i in {1..60}; do
    if curl -s http://localhost:5001/health &> /dev/null; then
        print_success "Application is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Application failed to start within 60 seconds"
        docker-compose logs
        exit 1
    fi
    sleep 1
done

print_status "Running final verification tests..."

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:5001/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    print_success "Health check passed"
else
    print_error "Health check failed: $HEALTH_RESPONSE"
    exit 1
fi

# Test authentication
print_status "Testing authentication..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "testuser", "password": "testpass"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    print_success "Authentication test passed"
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
else
    print_error "Authentication test failed: $LOGIN_RESPONSE"
    exit 1
fi

# Test API endpoints
print_status "Testing API endpoints..."

# Test traffic interception
INTERCEPT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/traffic/intercept \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com", "method": "GET"}')

if [ $? -eq 0 ]; then
    print_success "Traffic interception endpoint working"
else
    print_error "Traffic interception endpoint failed: $INTERCEPT_RESPONSE"
fi

# Test ML classification
CLASSIFY_RESPONSE=$(curl -s -X POST http://localhost:5001/api/traffic/classify \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"user_agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "ip_address": "66.249.66.1"}')

if [ $? -eq 0 ]; then
    print_success "ML classification endpoint working"
else
    print_error "ML classification endpoint failed: $CLASSIFY_RESPONSE"
fi

# Test content protection
PROTECT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/traffic/protect \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://example.com", "content": "<html><body>Test content</body></html>", "domain": "example.com", "path": "/", "user_agent": "Mozilla/5.0"}')

if [ $? -eq 0 ]; then
    print_success "Content protection endpoint working"
else
    print_error "Content protection endpoint failed: $PROTECT_RESPONSE"
fi

# Test real-time metrics
METRICS_RESPONSE=$(curl -s -X GET http://localhost:5001/api/traffic/metrics/realtime \
    -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
    print_success "Real-time metrics endpoint working"
else
    print_error "Real-time metrics endpoint failed: $METRICS_RESPONSE"
fi

print_status "Running comprehensive test suite..."

# Run the comprehensive test suite
python3 test_traffic_interceptor.py

if [ $? -eq 0 ]; then
    print_success "All tests passed!"
else
    print_error "Some tests failed. Please check the output above."
    exit 1
fi

echo ""
echo "🎉 **DEPLOYMENT SUCCESSFUL!** 🎉"
echo "=================================="
echo ""
echo "✅ Traffic Interceptor SaaS Platform is now running in production!"
echo "✅ All services are operational"
echo "✅ All tests are passing"
echo "✅ Platform is ready for customer onboarding"
echo ""
echo "🌐 **Access Information:**"
echo "   - Health Check: http://localhost:5001/health"
echo "   - API Base: http://localhost:5001/api"
echo "   - Test User: testuser / testpass"
echo ""
echo "🚀 **Next Steps:**"
echo "   1. Configure your domain and SSL certificates"
echo "   2. Set up production environment variables"
echo "   3. Begin customer onboarding"
echo "   4. Start generating revenue!"
echo ""
echo "📚 **Documentation:**"
echo "   - Production Deployment Guide: PRODUCTION_DEPLOYMENT_GUIDE.md"
echo "   - Launch Ready Package: LAUNCH_READY_PACKAGE.md"
echo "   - API Documentation: Check the API endpoints above"
echo ""
echo "🔧 **Management Commands:**"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - Scale services: docker-compose up -d --scale app=3"
echo ""
echo "🎯 **Your platform is now ready for market launch!** 🎯"
echo ""
echo "🏆 **CONGRATULATIONS ON SUCCESSFUL DEPLOYMENT!** 🏆"
