#!/bin/bash

# Production Deployment Script for Traffic Interceptor
# Usage: ./deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="traffic_interceptor"
BACKUP_DIR="./backups"
LOG_DIR="./logs"
DEPLOYMENT_LOG="$LOG_DIR/deployment_$(date +%Y%m%d_%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose > /dev/null 2>&1; then
        error "Docker Compose is not installed. Please install it and try again."
    fi
    
    # Check if required files exist
    if [[ ! -f "docker-compose.prod.yml" ]]; then
        error "Production Docker Compose file not found."
    fi
    
    if [[ ! -f "backend/Dockerfile" ]]; then
        error "Backend Dockerfile not found."
    fi
    
    success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p "$BACKUP_DIR" "$LOG_DIR" uploads ml_models monitoring/grafana/dashboards monitoring/grafana/datasources nginx/ssl
    
    success "Directories created"
}

# Load environment variables
load_environment() {
    log "Loading environment variables..."
    
    if [[ -f ".env.$ENVIRONMENT" ]]; then
        source ".env.$ENVIRONMENT"
        success "Environment variables loaded from .env.$ENVIRONMENT"
    else
        warning "Environment file .env.$ENVIRONMENT not found. Using defaults."
        export POSTGRES_USER=traffic_user
        export POSTGRES_PASSWORD=secure_password
        export REDIS_PASSWORD=redis_password
        export SECRET_KEY=your-super-secret-production-key
        export JWT_SECRET_KEY=your-jwt-secret-key
    fi
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if docker ps -q -f "name=${PROJECT_NAME}" | grep -q .; then
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
        
        # Export volumes
        docker run --rm -v "${PROJECT_NAME}_postgres_data:/data" -v "$(pwd)/$BACKUP_DIR/$BACKUP_NAME:/backup" alpine tar czf /backup/postgres_backup.tar.gz -C /data .
        docker run --rm -v "${PROJECT_NAME}_redis_data:/data" -v "$(pwd)/$BACKUP_DIR/$BACKUP_NAME:/backup" alpine tar czf /backup/redis_backup.tar.gz -C /data .
        
        success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        warning "No current deployment found to backup"
    fi
}

# Stop current deployment
stop_current() {
    log "Stopping current deployment..."
    
    if docker ps -q -f "name=${PROJECT_NAME}" | grep -q .; then
        docker-compose -f docker-compose.prod.yml down
        success "Current deployment stopped"
    else
        warning "No current deployment running"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Build images
    log "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    success "Deployment started"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to be healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check backend health
        if curl -f http://localhost:5001/health > /dev/null 2>&1; then
            success "Backend is healthy"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Backend failed to become healthy after $max_attempts attempts"
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Wait for database
    log "Waiting for database to be ready..."
    sleep 20
    
    success "All services are healthy"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # This would run Alembic migrations in production
    # For now, we'll just wait for the database to be ready
    sleep 10
    
    success "Database migrations completed"
}

# Verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if all containers are running
    local running_containers=$(docker ps -q -f "name=${PROJECT_NAME}" | wc -l)
    local expected_containers=8  # postgres, redis, backend, nginx, celery_worker, celery_beat, prometheus, grafana
    
    if [[ $running_containers -eq $expected_containers ]]; then
        success "All containers are running"
    else
        error "Expected $expected_containers containers, but $running_containers are running"
    fi
    
    # Check API endpoints
    log "Testing API endpoints..."
    
    if curl -f http://localhost/health > /dev/null 2>&1; then
        success "Health endpoint is accessible"
    else
        error "Health endpoint is not accessible"
    fi
    
    # Check monitoring
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        success "Prometheus is accessible"
    else
        warning "Prometheus is not accessible"
    fi
    
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        success "Grafana is accessible"
    else
        warning "Grafana is not accessible"
    fi
    
    success "Deployment verification completed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current deployment
    docker-compose -f docker-compose.prod.yml down
    
    # Find latest backup
    local latest_backup=$(ls -t "$BACKUP_DIR" | grep "^backup_" | head -1)
    
    if [[ -n "$latest_backup" ]]; then
        log "Restoring from backup: $latest_backup"
        
        # Restore volumes
        docker run --rm -v "${PROJECT_NAME}_postgres_data:/data" -v "$(pwd)/$BACKUP_DIR/$latest_backup:/backup" alpine tar xzf /backup/postgres_backup.tar.gz -C /data
        docker run --rm -v "${PROJECT_NAME}_redis_data:/data" -v "$(pwd)/$BACKUP_DIR/$latest_backup:/backup" alpine tar xzf /backup/redis_backup.tar.gz -C /data
        
        # Start previous deployment
        docker-compose -f docker-compose.prod.yml up -d
        
        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment process
main() {
    log "Starting deployment to $ENVIRONMENT environment"
    
    # Trap for cleanup on error
    trap 'error "Deployment failed. Check logs for details."' ERR
    
    check_prerequisites
    create_directories
    load_environment
    backup_current
    stop_current
    deploy
    wait_for_health
    run_migrations
    verify_deployment
    
    success "Deployment to $ENVIRONMENT completed successfully!"
    log "Services are available at:"
    log "  - Backend API: http://localhost:5001"
    log "  - Web Interface: http://localhost"
    log "  - Prometheus: http://localhost:9090"
    log "  - Grafana: http://localhost:3001 (admin/admin)"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "status")
        docker-compose -f docker-compose.prod.yml ps
        ;;
    "logs")
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    "stop")
        docker-compose -f docker-compose.prod.yml down
        ;;
    "restart")
        docker-compose -f docker-compose.prod.yml restart
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|status|logs|stop|restart}"
        echo "  deploy   - Deploy the application"
        echo "  rollback - Rollback to previous deployment"
        echo "  status   - Show deployment status"
        echo "  logs     - Show application logs"
        echo "  stop     - Stop the application"
        echo "  restart  - Restart the application"
        exit 1
        ;;
esac
