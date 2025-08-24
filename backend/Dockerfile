# Multi-stage production Dockerfile for Traffic Interceptor
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /var/log/traffic_interceptor \
    /var/uploads/traffic_interceptor \
    /var/ml_models/traffic_interceptor \
    /var/backups/traffic_interceptor \
    /tmp/prometheus_multiproc

# Set ownership
RUN chown -R appuser:appuser /app /var/log/traffic_interceptor \
    /var/uploads/traffic_interceptor \
    /var/ml_models/traffic_interceptor \
    /var/backups/traffic_interceptor \
    /tmp/prometheus_multiproc

# Switch to app user
USER appuser

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/health || exit 1

# Run the application
CMD ["python", "app.py"]
