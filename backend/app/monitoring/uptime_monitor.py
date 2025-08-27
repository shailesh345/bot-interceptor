"""
Uptime Monitoring System
Monitors website availability, response times, and performance metrics
"""

import asyncio
import aiohttp
import time
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple
import redis
from sqlalchemy import and_, func
from ..models import Domain, UptimeCheck, UptimeAlert
from .. import db
from .traffic_stream import get_traffic_stream_manager

logger = logging.getLogger(__name__)

class UptimeMonitor:
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.session: Optional[aiohttp.ClientSession] = None
        self.monitoring_tasks: Dict[int, asyncio.Task] = {}
        self.alert_thresholds = {
            'response_time': 2000,  # 2 seconds
            'error_rate': 0.05,     # 5%
            'downtime_threshold': 3  # 3 consecutive failures
        }
        
    async def start(self):
        """Start the uptime monitoring system"""
        try:
            # Create aiohttp session
            timeout = aiohttp.ClientTimeout(total=30)
            connector = aiohttp.TCPConnector(limit=100, limit_per_host=10)
            self.session = aiohttp.ClientSession(
                timeout=timeout,
                connector=connector
            )
            
            # Start monitoring all verified domains
            await self._start_monitoring_all_domains()
            
            # Start background tasks
            asyncio.create_task(self._cleanup_old_data())
            asyncio.create_task(self._generate_reports())
            
            logger.info("Uptime monitoring system started")
            
        except Exception as e:
            logger.error(f"Failed to start uptime monitoring: {e}")
            raise
    
    async def _start_monitoring_all_domains(self):
        """Start monitoring all verified domains"""
        try:
            domains = Domain.query.filter_by(status='verified').all()
            
            for domain in domains:
                await self.start_monitoring_domain(domain.id)
                
        except Exception as e:
            logger.error(f"Error starting monitoring for all domains: {e}")
    
    async def start_monitoring_domain(self, domain_id: int):
        """Start monitoring a specific domain"""
        try:
            # Stop existing monitoring if any
            if domain_id in self.monitoring_tasks:
                self.monitoring_tasks[domain_id].cancel()
            
            # Get domain configuration
            domain = Domain.query.get(domain_id)
            if not domain:
                logger.error(f"Domain {domain_id} not found")
                return
            
            # Create monitoring task
            task = asyncio.create_task(self._monitor_domain(domain))
            self.monitoring_tasks[domain_id] = task
            
            logger.info(f"Started monitoring domain: {domain.domain_name}")
            
        except Exception as e:
            logger.error(f"Error starting monitoring for domain {domain_id}: {e}")
    
    async def stop_monitoring_domain(self, domain_id: int):
        """Stop monitoring a specific domain"""
        try:
            if domain_id in self.monitoring_tasks:
                self.monitoring_tasks[domain_id].cancel()
                del self.monitoring_tasks[domain_id]
                logger.info(f"Stopped monitoring domain: {domain_id}")
                
        except Exception as e:
            logger.error(f"Error stopping monitoring for domain {domain_id}: {e}")
    
    async def _monitor_domain(self, domain: Domain):
        """Monitor a single domain"""
        try:
            while True:
                start_time = time.time()
                
                try:
                    # Perform health check
                    result = await self._perform_health_check(domain)
                    
                    # Record the check
                    await self._record_uptime_check(domain, result)
                    
                    # Check for alerts
                    await self._check_alerts(domain, result)
                    
                    # Send to traffic stream
                    await self._send_to_traffic_stream(domain, result)
                    
                except Exception as e:
                    logger.error(f"Error monitoring domain {domain.domain_name}: {e}")
                    
                    # Record failed check
                    failed_result = {
                        'status': 'error',
                        'response_time': 0,
                        'status_code': 0,
                        'error': str(e),
                        'timestamp': datetime.now(timezone.utc)
                    }
                    await self._record_uptime_check(domain, failed_result)
                
                # Wait for next check interval
                interval = domain.monitoring_interval or 60  # Default: 1 minute
                await asyncio.sleep(interval)
                
        except asyncio.CancelledError:
            logger.info(f"Monitoring cancelled for domain: {domain.domain_name}")
        except Exception as e:
            logger.error(f"Unexpected error in monitoring domain {domain.domain_name}: {e}")
    
    async def _perform_health_check(self, domain: Domain) -> Dict:
        """Perform a health check on a domain"""
        try:
            # Prepare check URL
            check_url = domain.monitoring_url or f"http://{domain.domain_name}"
            
            # Add custom headers if configured
            headers = {}
            if domain.monitoring_headers:
                try:
                    headers = json.loads(domain.monitoring_headers)
                except:
                    pass
            
            # Perform HTTP request
            start_time = time.time()
            
            async with self.session.get(
                check_url,
                headers=headers,
                allow_redirects=True,
                ssl=False  # Allow self-signed certificates
            ) as response:
                
                response_time = (time.time() - start_time) * 1000  # Convert to ms
                
                # Read response body
                body = await response.text()
                
                # Check response content if configured
                content_check_passed = True
                if domain.monitoring_content:
                    content_check_passed = domain.monitoring_content in body
                
                return {
                    'status': 'success' if response.status < 400 and content_check_passed else 'failure',
                    'response_time': response_time,
                    'status_code': response.status,
                    'content_length': len(body),
                    'content_check_passed': content_check_passed,
                    'timestamp': datetime.now(timezone.utc),
                    'url': check_url
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'response_time': 0,
                'status_code': 0,
                'error': str(e),
                'timestamp': datetime.now(timezone.utc),
                'url': check_url if 'check_url' in locals() else 'unknown'
            }
    
    async def _record_uptime_check(self, domain: Domain, result: Dict):
        """Record uptime check result in database"""
        try:
            # Create uptime check record
            check = UptimeCheck(
                domain_id=domain.id,
                status=result['status'],
                response_time=result.get('response_time', 0),
                status_code=result.get('status_code', 0),
                error_message=result.get('error'),
                content_check_passed=result.get('content_check_passed', True),
                checked_at=result['timestamp']
            )
            
            db.session.add(check)
            db.session.commit()
            
            # Update domain uptime statistics
            await self._update_domain_stats(domain.id)
            
        except Exception as e:
            logger.error(f"Error recording uptime check: {e}")
            db.session.rollback()
    
    async def _update_domain_stats(self, domain_id: int):
        """Update domain uptime statistics"""
        try:
            # Calculate uptime percentage for last 24 hours
            yesterday = datetime.now(timezone.utc) - timedelta(days=1)
            
            total_checks = UptimeCheck.query.filter(
                and_(
                    UptimeCheck.domain_id == domain_id,
                    UptimeCheck.checked_at >= yesterday
                )
            ).count()
            
            successful_checks = UptimeCheck.query.filter(
                and_(
                    UptimeCheck.domain_id == domain_id,
                    UptimeCheck.checked_at >= yesterday,
                    UptimeCheck.status == 'success'
                )
            ).count()
            
            uptime_percentage = (successful_checks / total_checks * 100) if total_checks > 0 else 0
            
            # Calculate average response time
            avg_response_time = db.session.query(
                func.avg(UptimeCheck.response_time)
            ).filter(
                and_(
                    UptimeCheck.domain_id == domain_id,
                    UptimeCheck.checked_at >= yesterday,
                    UptimeCheck.status == 'success'
                )
            ).scalar() or 0
            
            # Store in Redis for quick access
            stats_key = f"uptime:stats:{domain_id}"
            stats_data = {
                'uptime_percentage': round(uptime_percentage, 2),
                'avg_response_time': round(avg_response_time, 2),
                'total_checks': total_checks,
                'successful_checks': successful_checks,
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
            
            self.redis_client.hset(stats_key, mapping=stats_data)
            self.redis_client.expire(stats_key, 3600)  # Expire in 1 hour
            
        except Exception as e:
            logger.error(f"Error updating domain stats: {e}")
    
    async def _check_alerts(self, domain: Domain, result: Dict):
        """Check if alerts should be triggered"""
        try:
            # Check response time threshold
            if result.get('response_time', 0) > self.alert_thresholds['response_time']:
                await self._create_alert(
                    domain.id,
                    'high_response_time',
                    f"Response time {result['response_time']:.0f}ms exceeds threshold",
                    result
                )
            
            # Check for consecutive failures
            recent_failures = UptimeCheck.query.filter(
                and_(
                    UptimeCheck.domain_id == domain.id,
                    UptimeCheck.status.in_(['failure', 'error']),
                    UptimeCheck.checked_at >= datetime.now(timezone.utc) - timedelta(minutes=10)
                )
            ).count()
            
            if recent_failures >= self.alert_thresholds['downtime_threshold']:
                await self._create_alert(
                    domain.id,
                    'downtime_detected',
                    f"Domain appears to be down - {recent_failures} consecutive failures",
                    result
                )
            
            # Check error rate
            if result['status'] == 'failure' or result['status'] == 'error':
                # Calculate error rate for last hour
                hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
                total_hourly = UptimeCheck.query.filter(
                    and_(
                        UptimeCheck.domain_id == domain.id,
                        UptimeCheck.checked_at >= hour_ago
                    )
                ).count()
                
                error_hourly = UptimeCheck.query.filter(
                    and_(
                        UptimeCheck.domain_id == domain.id,
                        UptimeCheck.checked_at >= hour_ago,
                        UptimeCheck.status.in_(['failure', 'error'])
                    )
                ).count()
                
                if total_hourly > 0:
                    error_rate = error_hourly / total_hourly
                    if error_rate > self.alert_thresholds['error_rate']:
                        await self._create_alert(
                            domain.id,
                            'high_error_rate',
                            f"Error rate {error_rate:.1%} exceeds threshold",
                            result
                        )
            
        except Exception as e:
            logger.error(f"Error checking alerts: {e}")
    
    async def _create_alert(self, domain_id: int, alert_type: str, message: str, result: Dict):
        """Create an uptime alert"""
        try:
            # Check if similar alert already exists (avoid spam)
            existing_alert = UptimeAlert.query.filter(
                and_(
                    UptimeAlert.domain_id == domain_id,
                    UptimeAlert.alert_type == alert_type,
                    UptimeAlert.created_at >= datetime.now(timezone.utc) - timedelta(minutes=30)
                )
            ).first()
            
            if existing_alert:
                return  # Don't create duplicate alerts
            
            # Create new alert
            alert = UptimeAlert(
                domain_id=domain_id,
                alert_type=alert_type,
                message=message,
                details=json.dumps(result),
                severity='high' if alert_type == 'downtime_detected' else 'medium'
            )
            
            db.session.add(alert)
            db.session.commit()
            
            logger.warning(f"Uptime alert created: {message}")
            
            # TODO: Send notifications (email, Slack, etc.)
            
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            db.session.rollback()
    
    async def _send_to_traffic_stream(self, domain: Domain, result: Dict):
        """Send uptime check result to traffic stream"""
        try:
            stream_manager = get_traffic_stream_manager()
            if stream_manager:
                # Prepare data for stream
                stream_data = {
                    'type': 'uptime_check',
                    'domain': domain.domain_name,
                    'status': result['status'],
                    'response_time': result.get('response_time', 0),
                    'status_code': result.get('status_code', 0),
                    'timestamp': result['timestamp'].isoformat(),
                    'url': result.get('url', '')
                }
                
                stream_manager.add_traffic_data(domain.domain_name, stream_data)
                
        except Exception as e:
            logger.error(f"Error sending to traffic stream: {e}")
    
    async def _cleanup_old_data(self):
        """Clean up old uptime check data"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                # Delete checks older than 30 days
                cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
                deleted = UptimeCheck.query.filter(
                    UptimeCheck.checked_at < cutoff_date
                ).delete()
                
                if deleted > 0:
                    logger.info(f"Cleaned up {deleted} old uptime checks")
                
                # Delete resolved alerts older than 7 days
                alert_cutoff = datetime.now(timezone.utc) - timedelta(days=7)
                deleted_alerts = UptimeAlert.query.filter(
                    and_(
                        UptimeAlert.created_at < alert_cutoff,
                        UptimeAlert.resolved_at.isnot(None)
                    )
                ).delete()
                
                if deleted_alerts > 0:
                    logger.info(f"Cleaned up {deleted_alerts} old alerts")
                
                db.session.commit()
                
            except Exception as e:
                logger.error(f"Error in cleanup: {e}")
                db.session.rollback()
    
    async def _generate_reports(self):
        """Generate periodic uptime reports"""
        while True:
            try:
                await asyncio.sleep(86400)  # Run daily
                
                # Generate daily uptime report
                await self._generate_daily_report()
                
            except Exception as e:
                logger.error(f"Error generating reports: {e}")
    
    async def _generate_daily_report(self):
        """Generate daily uptime report"""
        try:
            yesterday = datetime.now(timezone.utc) - timedelta(days=1)
            start_date = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = start_date + timedelta(days=1)
            
            domains = Domain.query.filter_by(status='verified').all()
            
            for domain in domains:
                # Get daily statistics
                daily_stats = db.session.query(
                    func.count(UptimeCheck.id).label('total_checks'),
                    func.count(UptimeCheck.id).filter(UptimeCheck.status == 'success').label('successful_checks'),
                    func.avg(UptimeCheck.response_time).label('avg_response_time'),
                    func.min(UptimeCheck.response_time).label('min_response_time'),
                    func.max(UptimeCheck.response_time).label('max_response_time')
                ).filter(
                    and_(
                        UptimeCheck.domain_id == domain.id,
                        UptimeCheck.checked_at >= start_date,
                        UptimeCheck.checked_at < end_date
                    )
                ).first()
                
                if daily_stats.total_checks > 0:
                    uptime_percentage = (daily_stats.successful_checks / daily_stats.total_checks) * 100
                    
                    # Store daily report in Redis
                    report_key = f"uptime:report:{domain.id}:{start_date.strftime('%Y-%m-%d')}"
                    report_data = {
                        'date': start_date.strftime('%Y-%m-%d'),
                        'total_checks': daily_stats.total_checks,
                        'successful_checks': daily_stats.successful_checks,
                        'uptime_percentage': round(uptime_percentage, 2),
                        'avg_response_time': round(daily_stats.avg_response_time or 0, 2),
                        'min_response_time': daily_stats.min_response_time or 0,
                        'max_response_time': daily_stats.max_response_time or 0
                    }
                    
                    self.redis_client.hset(report_key, mapping=report_data)
                    self.redis_client.expire(report_key, 2592000)  # Expire in 30 days
                    
                    logger.info(f"Generated daily report for {domain.domain_name}: {uptime_percentage:.2f}% uptime")
            
        except Exception as e:
            logger.error(f"Error generating daily report: {e}")
    
    async def stop(self):
        """Stop the uptime monitoring system"""
        try:
            # Cancel all monitoring tasks
            for task in self.monitoring_tasks.values():
                task.cancel()
            
            # Wait for tasks to complete
            if self.monitoring_tasks:
                await asyncio.gather(*self.monitoring_tasks.values(), return_exceptions=True)
            
            # Close session
            if self.session:
                await self.session.close()
            
            logger.info("Uptime monitoring system stopped")
            
        except Exception as e:
            logger.error(f"Error stopping uptime monitoring: {e}")

# Global instance
uptime_monitor = None

def init_uptime_monitor(redis_client: redis.Redis):
    """Initialize uptime monitor"""
    global uptime_monitor
    uptime_monitor = UptimeMonitor(redis_client)
    return uptime_monitor

def get_uptime_monitor():
    """Get uptime monitor instance"""
    return uptime_monitor
