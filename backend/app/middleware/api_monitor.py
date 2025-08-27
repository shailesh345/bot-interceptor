"""
Advanced API Monitoring and Performance Tracking
Provides real-time monitoring, metrics collection, and performance analysis
"""

from flask import request, g, current_app
from datetime import datetime, timedelta
import time
import json
import threading
from collections import defaultdict, deque
import logging

# Optional psutil import for system metrics
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    psutil = None

logger = logging.getLogger(__name__)

class APIMonitor:
    """Advanced API monitoring system"""
    
    def __init__(self, app=None):
        self.app = app
        self.metrics = {
            'requests': defaultdict(int),
            'response_times': defaultdict(list),
            'error_rates': defaultdict(int),
            'status_codes': defaultdict(int),
            'endpoints': defaultdict(lambda: defaultdict(int)),
            'hourly_stats': defaultdict(lambda: defaultdict(int))
        }
        
        # Ring buffer for recent requests (last 1000)
        self.recent_requests = deque(maxlen=1000)
        
        # Performance thresholds
        self.slow_request_threshold = 1.0  # seconds
        self.error_rate_threshold = 0.05   # 5%
        
        # Thread lock for metrics
        self.metrics_lock = threading.Lock()
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize monitoring with Flask app"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        
        # Start background monitoring thread
        self.start_background_monitoring()
    
    def before_request(self):
        """Record request start time"""
        g.start_time = time.time()
        g.request_start = datetime.utcnow()
    
    def after_request(self, response):
        """Record request metrics"""
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            
            # Record metrics
            self.record_request_metrics(
                method=request.method,
                endpoint=request.endpoint or request.path,
                status_code=response.status_code,
                duration=duration,
                timestamp=g.request_start
            )
        
        return response
    
    def record_request_metrics(self, method, endpoint, status_code, duration, timestamp):
        """Record comprehensive request metrics"""
        with self.metrics_lock:
            # Basic counters
            self.metrics['requests'][endpoint] += 1
            self.metrics['status_codes'][status_code] += 1
            
            # Response times
            self.metrics['response_times'][endpoint].append(duration)
            
            # Keep only recent response times (last 100 per endpoint)
            if len(self.metrics['response_times'][endpoint]) > 100:
                self.metrics['response_times'][endpoint] = \
                    self.metrics['response_times'][endpoint][-100:]
            
            # Error tracking
            if status_code >= 400:
                self.metrics['error_rates'][endpoint] += 1
            
            # Endpoint method tracking
            self.metrics['endpoints'][endpoint][method] += 1
            
            # Hourly stats
            hour_key = timestamp.strftime('%Y-%m-%d %H:00:00')
            self.metrics['hourly_stats'][hour_key]['requests'] += 1
            self.metrics['hourly_stats'][hour_key]['total_duration'] += duration
            
            if status_code >= 400:
                self.metrics['hourly_stats'][hour_key]['errors'] += 1
            
            # Recent requests buffer
            self.recent_requests.append({
                'timestamp': timestamp.isoformat(),
                'method': method,
                'endpoint': endpoint,
                'status_code': status_code,
                'duration': duration,
                'ip': request.remote_addr if request else None
            })
    
    def get_metrics_summary(self):
        """Get comprehensive metrics summary"""
        with self.metrics_lock:
            summary = {
                'total_requests': sum(self.metrics['requests'].values()),
                'endpoints': dict(self.metrics['requests']),
                'status_codes': dict(self.metrics['status_codes']),
                'performance': self.get_performance_metrics(),
                'errors': self.get_error_metrics(),
                'system': self.get_system_metrics(),
                'recent_activity': list(self.recent_requests)[-10:],  # Last 10 requests
                'generated_at': datetime.utcnow().isoformat()
            }
            
            return summary
    
    def get_performance_metrics(self):
        """Get performance-related metrics"""
        performance = {}
        
        for endpoint, times in self.metrics['response_times'].items():
            if times:
                times_sorted = sorted(times)
                count = len(times)
                
                performance[endpoint] = {
                    'avg_response_time': sum(times) / count,
                    'min_response_time': min(times),
                    'max_response_time': max(times),
                    'median_response_time': times_sorted[count // 2],
                    'p95_response_time': times_sorted[int(count * 0.95)] if count > 0 else 0,
                    'slow_requests': len([t for t in times if t > self.slow_request_threshold]),
                    'request_count': self.metrics['requests'][endpoint]
                }
        
        return performance
    
    def get_error_metrics(self):
        """Get error-related metrics"""
        errors = {}
        
        for endpoint in self.metrics['requests']:
            total_requests = self.metrics['requests'][endpoint]
            error_count = self.metrics['error_rates'][endpoint]
            
            errors[endpoint] = {
                'error_count': error_count,
                'total_requests': total_requests,
                'error_rate': (error_count / total_requests) if total_requests > 0 else 0,
                'is_high_error_rate': (error_count / total_requests) > self.error_rate_threshold if total_requests > 0 else False
            }
        
        return errors
    
    def get_system_metrics(self):
        """Get system performance metrics"""
        if not PSUTIL_AVAILABLE:
            return {
                'error': 'System metrics unavailable - psutil not installed',
                'timestamp': datetime.utcnow().isoformat()
            }
        
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_usage': cpu_percent,
                'memory_usage': memory.percent,
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'disk_usage': disk.percent,
                'disk_free_gb': round(disk.free / (1024**3), 2),
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting system metrics: {str(e)}")
            return {'error': 'Unable to retrieve system metrics'}
    
    def get_hourly_stats(self, hours=24):
        """Get hourly statistics for the last N hours"""
        now = datetime.utcnow()
        stats = []
        
        for i in range(hours):
            hour = now - timedelta(hours=i)
            hour_key = hour.strftime('%Y-%m-%d %H:00:00')
            
            hour_data = self.metrics['hourly_stats'].get(hour_key, {})
            
            stats.append({
                'hour': hour_key,
                'requests': hour_data.get('requests', 0),
                'errors': hour_data.get('errors', 0),
                'avg_response_time': (
                    hour_data.get('total_duration', 0) / hour_data.get('requests', 1)
                ) if hour_data.get('requests', 0) > 0 else 0
            })
        
        return sorted(stats, key=lambda x: x['hour'])
    
    def get_health_status(self):
        """Get overall API health status"""
        metrics = self.get_metrics_summary()
        system = metrics['system']
        
        health_issues = []
        
        # Check system resources
        if isinstance(system, dict) and 'cpu_usage' in system and 'error' not in system:
            if system['cpu_usage'] > 80:
                health_issues.append("High CPU usage")
            
            if system['memory_usage'] > 80:
                health_issues.append("High memory usage")
            
            if system['disk_usage'] > 90:
                health_issues.append("Low disk space")
        
        # Check error rates
        for endpoint, error_data in metrics['errors'].items():
            if error_data['is_high_error_rate']:
                health_issues.append(f"High error rate for {endpoint}")
        
        # Check slow endpoints
        for endpoint, perf_data in metrics['performance'].items():
            if perf_data['avg_response_time'] > self.slow_request_threshold:
                health_issues.append(f"Slow response time for {endpoint}")
        
        status = "healthy" if not health_issues else "warning" if len(health_issues) < 3 else "critical"
        
        return {
            'status': status,
            'issues': health_issues,
            'total_requests': metrics['total_requests'],
            'uptime': self.get_uptime(),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def get_uptime(self):
        """Get application uptime (mock implementation)"""
        # In a real implementation, this would track actual uptime
        return "24h 30m 15s"
    
    def get_top_endpoints(self, limit=10):
        """Get top endpoints by request count"""
        sorted_endpoints = sorted(
            self.metrics['requests'].items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [
            {
                'endpoint': endpoint,
                'requests': count,
                'avg_response_time': (
                    sum(self.metrics['response_times'][endpoint]) / 
                    len(self.metrics['response_times'][endpoint])
                ) if self.metrics['response_times'][endpoint] else 0
            }
            for endpoint, count in sorted_endpoints[:limit]
        ]
    
    def reset_metrics(self):
        """Reset all metrics (useful for testing)"""
        with self.metrics_lock:
            self.metrics = {
                'requests': defaultdict(int),
                'response_times': defaultdict(list),
                'error_rates': defaultdict(int),
                'status_codes': defaultdict(int),
                'endpoints': defaultdict(lambda: defaultdict(int)),
                'hourly_stats': defaultdict(lambda: defaultdict(int))
            }
            self.recent_requests.clear()
    
    def start_background_monitoring(self):
        """Start background monitoring thread"""
        def background_monitor():
            while True:
                try:
                    # Clean up old metrics every hour
                    self.cleanup_old_metrics()
                    time.sleep(3600)  # Sleep for 1 hour
                except Exception as e:
                    logger.error(f"Background monitoring error: {str(e)}")
                    time.sleep(60)  # Sleep for 1 minute on error
        
        thread = threading.Thread(target=background_monitor, daemon=True)
        thread.start()
    
    def cleanup_old_metrics(self):
        """Clean up metrics older than 24 hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        cutoff_key = cutoff_time.strftime('%Y-%m-%d %H:00:00')
        
        with self.metrics_lock:
            # Remove old hourly stats
            old_keys = [k for k in self.metrics['hourly_stats'].keys() if k < cutoff_key]
            for key in old_keys:
                del self.metrics['hourly_stats'][key]

# Initialize monitor instance
api_monitor = APIMonitor()
