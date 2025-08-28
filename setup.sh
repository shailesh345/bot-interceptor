#!/bin/bash

# Traffic Interceptor Development Setup Script

echo "🚀 Setting up Traffic Interceptor Development Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating environment file..."
    cp backend/.env.example backend/.env
    echo "✅ Environment file created. Please edit backend/.env with your configuration."
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Initialize database
echo "🗄️ Initializing database..."
docker-compose exec backend python run.py init-db

# Seed sample data
echo "🌱 Seeding sample data..."
docker-compose exec backend python run.py seed-data

echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:9889"
echo "   Backend API: http://localhost:8960"
echo "   Admin Dashboard: http://localhost:9889/admin"
echo ""
echo "📊 Services running:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Flask API: localhost:8960"
echo "   - React App: localhost:9889"
echo ""
echo "🔐 To create a super admin user, run:"
echo "   docker-compose exec backend python run.py create-super-admin"
echo ""
echo "🛠️ To view logs, run:"
echo "   docker-compose logs -f [service_name]"
echo ""
echo "🛑 To stop services, run:"
echo "   docker-compose down"
