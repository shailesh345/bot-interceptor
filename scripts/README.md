# Scripts - Boot Interceptor Platform

## Scripts Overview
This folder contains automation scripts for development, testing, deployment, and maintenance tasks.

## Available Scripts

### 1. Development Scripts
- **File**: `start_development.sh`
- **Purpose**: Start development environment (backend + frontend)
- **Status**: Pending

- **File**: `kill_ports.sh`
- **Purpose**: Kill ports 9889 (frontend) and 8960 (backend)
- **Status**: Pending

- **File**: `check_ports.sh`
- **Purpose**: Check if required ports are free
- **Status**: Pending

### 2. Testing Scripts
- **File**: `run_all_tests.sh`
- **Purpose**: Run all test suites with coverage reporting
- **Status**: Pending

- **File**: `test_coverage.sh`
- **Purpose**: Generate and display test coverage reports
- **Status**: Pending

### 3. Database Scripts
- **File**: `run_migrations.sh`
- **Purpose**: Execute database migrations
- **Status**: Pending

- **File**: `seed_database.sh`
- **Purpose**: Seed database with test data
- **Status**: Pending

- **File**: `backup_database.sh`
- **Purpose**: Create database backups
- **Status**: Pending

### 4. Deployment Scripts
- **File**: `deploy_staging.sh`
- **Purpose**: Deploy to staging environment
- **Status**: Pending

- **File**: `deploy_production.sh`
- **Purpose**: Deploy to production environment
- **Status**: Pending

### 5. Maintenance Scripts
- **File**: `health_check.sh`
- **Purpose**: Check system health and status
- **Status**: Pending

- **File**: `cleanup_logs.sh`
- **Purpose**: Clean up old log files
- **Status**: Pending

## Script Usage

### Port Management
```bash
# Kill specific ports
./scripts/kill_ports.sh

# Check port availability
./scripts/check_ports.sh
```

### Development Workflow
```bash
# Start development environment
./scripts/start_development.sh

# Run all tests
./scripts/run_all_tests.sh
```

### Database Operations
```bash
# Run migrations
./scripts/run_migrations.sh

# Seed database
./scripts/seed_database.sh
```

## Script Requirements
- **Permissions**: All scripts should be executable (`chmod +x`)
- **Error Handling**: Scripts should handle errors gracefully
- **Logging**: All scripts should log their actions
- **Validation**: Scripts should validate prerequisites before execution
- **Documentation**: Each script should have clear usage instructions

## Notes
- Scripts should follow the port management rules (9889 for frontend, 8960 for backend)
- All scripts should be tested before deployment
- Scripts should be idempotent where possible
- Use environment variables for configuration
