"""
Real-time Traffic Processing Pipeline
Processes traffic in real-time with streaming analytics and live monitoring
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
import redis
from collections import defaultdict, deque
import threading
import queue
from flask import current_app
from app.models import TrafficLog, Domain, Analytics
from app import db

@dataclass
class RealTimeMetrics:
    """Real-time traffic metrics"""
    total_requests: int
    bot_requests: int
    human_requests: int
    blocked_requests: int
    avg_response_time: float
    requests_per_second: float
    top_user_agents: List[Tuple[str, int]]
    top_ips: List[Tuple[str, int]]
    top_paths: List[Tuple[str, int]]
    error_rate: float
    timestamp: datetime

class RealTimeProcessor:
    """
    Real-time traffic processing pipeline
    Processes traffic data as it arrives for live analytics
    """
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.processing_queue = queue.Queue(maxsize=10000)
        self.metrics_cache = {}
        self.alert_thresholds = {}
        self.processing_thread = None
        self.is_running = False
        self._initialize_processor()
        self._load_alert_thresholds()
    
    def _initialize_processor(self):
        """Initialize the real-time processor"""
        try:
            # Start processing thread
            self.processing_thread = threading.Thread(target=self._process_queue, daemon=True)
            self.is_running = True
            self.processing_thread.start()
            
            current_app.logger.info("Real-time processor initialized")
            
        except Exception as e:
            current_app.logger.error(f"Failed to initialize real-time processor: {e}")
    
    def _load_alert_thresholds(self):
        """Load alert thresholds from configuration"""
        self.alert_thresholds = {
            'error_rate': 0.05,  # 5% error rate
            'response_time': 2.0,  # 2 seconds
            'bot_rate': 0.8,      # 80% bot traffic
            'request_rate': 1000,  # 1000 requests per minute
            'blocked_rate': 0.3    # 30% blocked requests
        }
    
    def add_traffic_data(self, traffic_data: Dict):
        """Add traffic data to the processing queue"""
        try:
            if not self.processing_queue.full():
                self.processing_queue.put(traffic_data, timeout=1)
            else:
                current_app.logger.warning("Processing queue is full, dropping traffic data")
                
        except Exception as e:
            current_app.logger.error(f"Failed to add traffic data to queue: {e}")
    
    def _process_queue(self):
        """Main processing loop for the queue"""
        while self.is_running:
            try:
                # Get traffic data from queue
                try:
                    traffic_data = self.processing_queue.get(timeout=1)
                except queue.Empty:
                    continue
                
                # Process the traffic data
                self._process_single_traffic(traffic_data)
                
                # Update real-time metrics
                self._update_real_time_metrics(traffic_data)
                
                # Check for alerts
                self._check_alerts(traffic_data)
                
                # Mark task as done
                self.processing_queue.task_done()
                
            except Exception as e:
                current_app.logger.error(f"Error in processing loop: {e}")
                time.sleep(0.1)
    
    def _process_single_traffic(self, traffic_data: Dict):
        """Process a single traffic data entry"""
        try:
            # Extract key information
            domain = traffic_data.get('domain', 'unknown')
            timestamp = traffic_data.get('timestamp', datetime.now())
            is_bot = traffic_data.get('is_bot', False)
            response_status = traffic_data.get('response_status', 200)
            processing_time = traffic_data.get('processing_time', 0.0)
            
            # Update domain-specific metrics
            self._update_domain_metrics(domain, traffic_data)
            
            # Update global metrics
            self._update_global_metrics(traffic_data)
            
            # Update time-series data
            self._update_time_series(domain, timestamp, traffic_data)
            
            # Update user agent statistics
            self._update_user_agent_stats(traffic_data)
            
            # Update IP statistics
            self._update_ip_stats(traffic_data)
            
            # Update path statistics
            self._update_path_stats(traffic_data)
            
        except Exception as e:
            current_app.logger.error(f"Failed to process traffic data: {e}")
    
    def _update_domain_metrics(self, domain: str, traffic_data: Dict):
        """Update metrics for a specific domain"""
        try:
            # Get current domain metrics
            domain_key = f"domain_metrics:{domain}"
            current_metrics = self.redis_client.hgetall(domain_key)
            
            # Parse current values
            total_requests = int(current_metrics.get(b'total_requests', 0))
            bot_requests = int(current_metrics.get(b'bot_requests', 0))
            blocked_requests = int(current_metrics.get(b'blocked_requests', 0))
            total_response_time = float(current_metrics.get(b'total_response_time', 0.0))
            
            # Update metrics
            total_requests += 1
            if traffic_data.get('is_bot', False):
                bot_requests += 1
            if traffic_data.get('action_taken') in ['block', 'challenge', 'rate_limit']:
                blocked_requests += 1
            total_response_time += traffic_data.get('processing_time', 0.0)
            
            # Calculate averages
            avg_response_time = total_response_time / total_requests if total_requests > 0 else 0.0
            bot_rate = bot_requests / total_requests if total_requests > 0 else 0.0
            blocked_rate = blocked_requests / total_requests if total_requests > 0 else 0.0
            
            # Update Redis
            self.redis_client.hmset(domain_key, {
                'total_requests': total_requests,
                'bot_requests': bot_requests,
                'blocked_requests': blocked_requests,
                'total_response_time': total_response_time,
                'avg_response_time': avg_response_time,
                'bot_rate': bot_rate,
                'blocked_rate': blocked_rate,
                'last_updated': datetime.now().isoformat()
            })
            
            # Set expiration (24 hours)
            self.redis_client.expire(domain_key, 86400)
            
        except Exception as e:
            current_app.logger.error(f"Failed to update domain metrics: {e}")
    
    def _update_global_metrics(self, traffic_data: Dict):
        """Update global traffic metrics"""
        try:
            global_key = "global_metrics"
            current_metrics = self.redis_client.hgetall(global_key)
            
            # Parse current values
            total_requests = int(current_metrics.get(b'total_requests', 0))
            total_response_time = float(current_metrics.get(b'total_response_time', 0.0))
            total_errors = int(current_metrics.get(b'total_errors', 0))
            
            # Update metrics
            total_requests += 1
            total_response_time += traffic_data.get('processing_time', 0.0)
            
            if traffic_data.get('response_status', 200) >= 400:
                total_errors += 1
            
            # Calculate averages
            avg_response_time = total_response_time / total_requests if total_requests > 0 else 0.0
            error_rate = total_errors / total_requests if total_requests > 0 else 0.0
            
            # Update Redis
            self.redis_client.hmset(global_key, {
                'total_requests': total_requests,
                'total_response_time': total_response_time,
                'total_errors': total_errors,
                'avg_response_time': avg_response_time,
                'error_rate': error_rate,
                'last_updated': datetime.now().isoformat()
            })
            
            # Set expiration (24 hours)
            self.redis_client.expire(global_key, 86400)
            
        except Exception as e:
            current_app.logger.error(f"Failed to update global metrics: {e}")
    
    def _update_time_series(self, domain: str, timestamp: datetime, traffic_data: Dict):
        """Update time-series data for analytics"""
        try:
            # Create time keys
            date_key = timestamp.strftime('%Y-%m-%d')
            hour_key = timestamp.strftime('%Y-%m-%d:%H')
            minute_key = timestamp.strftime('%Y-%m-%d:%H:%M')
            
            # Update daily metrics
            daily_key = f"daily_metrics:{domain}:{date_key}"
            self.redis_client.hincrby(daily_key, 'total_requests', 1)
            if traffic_data.get('is_bot', False):
                self.redis_client.hincrby(daily_key, 'bot_requests', 1)
            if traffic_data.get('action_taken') in ['block', 'challenge', 'rate_limit']:
                self.redis_client.hincrby(daily_key, 'blocked_requests', 1)
            
            # Update hourly metrics
            hourly_key = f"hourly_metrics:{domain}:{hour_key}"
            self.redis_client.hincrby(hourly_key, 'total_requests', 1)
            if traffic_data.get('is_bot', False):
                self.redis_client.hincrby(hourly_key, 'bot_requests', 1)
            
            # Update minute metrics (for real-time monitoring)
            minute_key = f"minute_metrics:{domain}:{minute_key}"
            self.redis_client.hincrby(minute_key, 'total_requests', 1)
            self.redis_client.hincrby(minute_key, 'total_response_time', 
                                    int(traffic_data.get('processing_time', 0.0) * 1000))
            
            # Set expiration times
            self.redis_client.expire(daily_key, 2592000)    # 30 days
            self.redis_client.expire(hourly_key, 86400)     # 24 hours
            self.redis_client.expire(minute_key, 3600)      # 1 hour
            
        except Exception as e:
            current_app.logger.error(f"Failed to update time series: {e}")
    
    def _update_user_agent_stats(self, traffic_data: Dict):
        """Update user agent statistics"""
        try:
            user_agent = traffic_data.get('user_agent', 'unknown')
            domain = traffic_data.get('domain', 'unknown')
            
            # Update global user agent stats
            global_ua_key = "user_agent_stats:global"
            self.redis_client.hincrby(global_ua_key, user_agent, 1)
            
            # Update domain-specific user agent stats
            domain_ua_key = f"user_agent_stats:{domain}"
            self.redis_client.hincrby(domain_ua_key, user_agent, 1)
            
            # Set expiration
            self.redis_client.expire(global_ua_key, 86400)
            self.redis_client.expire(domain_ua_key, 86400)
            
        except Exception as e:
            current_app.logger.error(f"Failed to update user agent stats: {e}")
    
    def _update_ip_stats(self, traffic_data: Dict):
        """Update IP address statistics"""
        try:
            client_ip = traffic_data.get('client_ip', 'unknown')
            domain = traffic_data.get('domain', 'unknown')
            
            # Update global IP stats
            global_ip_key = "ip_stats:global"
            self.redis_client.hincrby(global_ip_key, client_ip, 1)
            
            # Update domain-specific IP stats
            domain_ip_key = f"ip_stats:{domain}"
            self.redis_client.hincrby(domain_ip_key, client_ip, 1)
            
            # Set expiration
            self.redis_client.expire(global_ip_key, 86400)
            self.redis_client.expire(domain_ip_key, 86400)
            
        except Exception as e:
            current_app.logger.error(f"Failed to update IP stats: {e}")
    
    def _update_path_stats(self, traffic_data: Dict):
        """Update path/URL statistics"""
        try:
            path = traffic_data.get('path', 'unknown')
            domain = traffic_data.get('domain', 'unknown')
            
            # Update global path stats
            global_path_key = "path_stats:global"
            self.redis_client.hincrby(global_path_key, path, 1)
            
            # Update domain-specific path stats
            domain_path_key = f"path_stats:{domain}"
            self.redis_client.hincrby(domain_path_key, path, 1)
            
            # Set expiration
            self.redis_client.expire(global_path_key, 86400)
            self.redis_client.expire(domain_path_key, 86400)
            
        except Exception as e:
            current_app.logger.error(f"Failed to update path stats: {e}")
    
    def _update_real_time_metrics(self, traffic_data: Dict):
        """Update real-time metrics cache"""
        try:
            # Update in-memory metrics cache
            current_time = datetime.now()
            minute_key = current_time.strftime('%Y-%m-%d:%H:%M')
            
            if minute_key not in self.metrics_cache:
                self.metrics_cache[minute_key] = {
                    'total_requests': 0,
                    'bot_requests': 0,
                    'human_requests': 0,
                    'blocked_requests': 0,
                    'total_response_time': 0.0,
                    'response_times': deque(maxlen=1000)
                }
            
            metrics = self.metrics_cache[minute_key]
            metrics['total_requests'] += 1
            
            if traffic_data.get('is_bot', False):
                metrics['bot_requests'] += 1
            else:
                metrics['human_requests'] += 1
            
            if traffic_data.get('action_taken') in ['block', 'challenge', 'rate_limit']:
                metrics['blocked_requests'] += 1
            
            response_time = traffic_data.get('processing_time', 0.0)
            metrics['total_response_time'] += response_time
            metrics['response_times'].append(response_time)
            
            # Clean up old metrics (keep last 60 minutes)
            current_timestamp = current_time.timestamp()
            keys_to_remove = []
            
            for key in self.metrics_cache:
                try:
                    key_timestamp = datetime.strptime(key, '%Y-%m-%d:%H:%M').timestamp()
                    if current_timestamp - key_timestamp > 3600:  # 1 hour
                        keys_to_remove.append(key)
                except:
                    keys_to_remove.append(key)
            
            for key in keys_to_remove:
                del self.metrics_cache[key]
                
        except Exception as e:
            current_app.logger.error(f"Failed to update real-time metrics: {e}")
    
    def _check_alerts(self, traffic_data: Dict):
        """Check for alert conditions"""
        try:
            domain = traffic_data.get('domain', 'unknown')
            response_status = traffic_data.get('response_status', 200)
            processing_time = traffic_data.get('processing_time', 0.0)
            
            # Check error rate
            if response_status >= 400:
                self._check_error_rate_alert(domain)
            
            # Check response time
            if processing_time > self.alert_thresholds['response_time']:
                self._check_response_time_alert(domain, processing_time)
            
            # Check bot rate
            self._check_bot_rate_alert(domain)
            
            # Check request rate
            self._check_request_rate_alert(domain)
            
        except Exception as e:
            current_app.logger.error(f"Failed to check alerts: {e}")
    
    def _check_error_rate_alert(self, domain: str):
        """Check if error rate exceeds threshold"""
        try:
            domain_key = f"domain_metrics:{domain}"
            metrics = self.redis_client.hgetall(domain_key)
            
            if b'error_rate' in metrics:
                error_rate = float(metrics[b'error_rate'])
                if error_rate > self.alert_thresholds['error_rate']:
                    self._send_alert(domain, 'error_rate', error_rate)
                    
        except Exception as e:
            current_app.logger.error(f"Failed to check error rate alert: {e}")
    
    def _check_response_time_alert(self, domain: str, processing_time: float):
        """Check if response time exceeds threshold"""
        try:
            if processing_time > self.alert_thresholds['response_time']:
                self._send_alert(domain, 'response_time', processing_time)
                
        except Exception as e:
            current_app.logger.error(f"Failed to check response time alert: {e}")
    
    def _check_bot_rate_alert(self, domain: str):
        """Check if bot rate exceeds threshold"""
        try:
            domain_key = f"domain_metrics:{domain}"
            metrics = self.redis_client.hgetall(domain_key)
            
            if b'bot_rate' in metrics:
                bot_rate = float(metrics[b'bot_rate'])
                if bot_rate > self.alert_thresholds['bot_rate']:
                    self._send_alert(domain, 'bot_rate', bot_rate)
                    
        except Exception as e:
            current_app.logger.error(f"Failed to check bot rate alert: {e}")
    
    def _check_request_rate_alert(self, domain: str):
        """Check if request rate exceeds threshold"""
        try:
            # Check requests per minute
            current_time = datetime.now()
            minute_key = current_time.strftime('%Y-%m-%d:%H:%M')
            minute_key = f"minute_metrics:{domain}:{minute_key}"
            
            requests = self.redis_client.hget(minute_key, 'total_requests')
            if requests:
                requests_per_minute = int(requests)
                if requests_per_minute > self.alert_thresholds['request_rate']:
                    self._send_alert(domain, 'request_rate', requests_per_minute)
                    
        except Exception as e:
            current_app.logger.error(f"Failed to check request rate alert: {e}")
    
    def _send_alert(self, domain: str, alert_type: str, value: float):
        """Send an alert"""
        try:
            alert_data = {
                'domain': domain,
                'alert_type': alert_type,
                'value': value,
                'threshold': self.alert_thresholds.get(alert_type, 0),
                'timestamp': datetime.now().isoformat(),
                'severity': 'high' if value > self.alert_thresholds.get(alert_type, 0) * 2 else 'medium'
            }
            
            # Store alert in Redis
            alert_key = f"alerts:{domain}:{alert_type}:{int(time.time())}"
            self.redis_client.setex(alert_key, 86400, json.dumps(alert_data))
            
            # Add to alert queue
            alert_queue_key = "alert_queue"
            self.redis_client.lpush(alert_queue_key, json.dumps(alert_data))
            self.redis_client.expire(alert_queue_key, 86400)
            
            current_app.logger.warning(f"Alert: {alert_type} for domain {domain}: {value}")
            
        except Exception as e:
            current_app.logger.error(f"Failed to send alert: {e}")
    
    def get_real_time_metrics(self, domain: str = None) -> RealTimeMetrics:
        """Get current real-time metrics"""
        try:
            if domain:
                return self._get_domain_real_time_metrics(domain)
            else:
                return self._get_global_real_time_metrics()
                
        except Exception as e:
            current_app.logger.error(f"Failed to get real-time metrics: {e}")
            return self._create_empty_metrics()
    
    def _get_domain_real_time_metrics(self, domain: str) -> RealTimeMetrics:
        """Get real-time metrics for a specific domain"""
        try:
            # Get current minute metrics
            current_time = datetime.now()
            minute_key = current_time.strftime('%Y-%m-%d:%H:%M')
            minute_key = f"minute_metrics:{domain}:{minute_key}"
            
            metrics = self.redis_client.hgetall(minute_key)
            
            total_requests = int(metrics.get(b'total_requests', 0))
            total_response_time = int(metrics.get(b'total_response_time', 0))
            
            # Calculate requests per second (for current minute)
            requests_per_second = total_requests / 60.0 if total_requests > 0 else 0.0
            avg_response_time = total_response_time / 1000.0 / total_requests if total_requests > 0 else 0.0
            
            # Get top user agents, IPs, and paths
            top_user_agents = self._get_top_items(f"user_agent_stats:{domain}", 5)
            top_ips = self._get_top_items(f"ip_stats:{domain}", 5)
            top_paths = self._get_top_items(f"path_stats:{domain}", 5)
            
            return RealTimeMetrics(
                total_requests=total_requests,
                bot_requests=0,  # Would need to calculate from time series
                human_requests=0,  # Would need to calculate from time series
                blocked_requests=0,  # Would need to calculate from time series
                avg_response_time=avg_response_time,
                requests_per_second=requests_per_second,
                top_user_agents=top_user_agents,
                top_ips=top_ips,
                top_paths=top_paths,
                error_rate=0.0,  # Would need to calculate from time series
                timestamp=current_time
            )
            
        except Exception as e:
            current_app.logger.error(f"Failed to get domain real-time metrics: {e}")
            return self._create_empty_metrics()
    
    def _get_global_real_time_metrics(self) -> RealTimeMetrics:
        """Get global real-time metrics"""
        try:
            # Get current minute metrics from cache
            current_time = datetime.now()
            minute_key = current_time.strftime('%Y-%m-%d:%H:%M')
            
            if minute_key in self.metrics_cache:
                metrics = self.metrics_cache[minute_key]
                
                total_requests = metrics['total_requests']
                bot_requests = metrics['bot_requests']
                human_requests = metrics['human_requests']
                blocked_requests = metrics['blocked_requests']
                
                # Calculate averages
                if metrics['response_times']:
                    avg_response_time = sum(metrics['response_times']) / len(metrics['response_times'])
                else:
                    avg_response_time = 0.0
                
                requests_per_second = total_requests / 60.0 if total_requests > 0 else 0.0
                error_rate = 0.0  # Would need to calculate from time series
                
                # Get top items globally
                top_user_agents = self._get_top_items("user_agent_stats:global", 5)
                top_ips = self._get_top_items("ip_stats:global", 5)
                top_paths = self._get_top_items("path_stats:global", 5)
                
                return RealTimeMetrics(
                    total_requests=total_requests,
                    bot_requests=bot_requests,
                    human_requests=human_requests,
                    blocked_requests=blocked_requests,
                    avg_response_time=avg_response_time,
                    requests_per_second=requests_per_second,
                    top_user_agents=top_user_agents,
                    top_ips=top_ips,
                    top_paths=top_paths,
                    error_rate=error_rate,
                    timestamp=current_time
                )
            
            return self._create_empty_metrics()
            
        except Exception as e:
            current_app.logger.error(f"Failed to get global real-time metrics: {e}")
            return self._create_empty_metrics()
    
    def _get_top_items(self, key: str, limit: int) -> List[Tuple[str, int]]:
        """Get top items from a Redis hash"""
        try:
            items = self.redis_client.hgetall(key)
            if not items:
                return []
            
            # Convert to list of tuples and sort by count
            item_list = [(k.decode(), int(v)) for k, v in items.items()]
            item_list.sort(key=lambda x: x[1], reverse=True)
            
            return item_list[:limit]
            
        except Exception as e:
            current_app.logger.error(f"Failed to get top items: {e}")
            return []
    
    def _create_empty_metrics(self) -> RealTimeMetrics:
        """Create empty metrics object"""
        return RealTimeMetrics(
            total_requests=0,
            bot_requests=0,
            human_requests=0,
            blocked_requests=0,
            avg_response_time=0.0,
            requests_per_second=0.0,
            top_user_agents=[],
            top_ips=[],
            top_paths=[],
            error_rate=0.0,
            timestamp=datetime.now()
        )
    
    def stop_processor(self):
        """Stop the real-time processor"""
        try:
            self.is_running = False
            if self.processing_thread:
                self.processing_thread.join(timeout=5)
            
            current_app.logger.info("Real-time processor stopped")
            
        except Exception as e:
            current_app.logger.error(f"Failed to stop real-time processor: {e}")

# Global real-time processor instance
# Initialize lazily to avoid app context issues
realtime_processor = None

def get_realtime_processor():
    global realtime_processor
    if realtime_processor is None:
        realtime_processor = RealTimeProcessor()
    return realtime_processor
