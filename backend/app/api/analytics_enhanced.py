"""
Enhanced Analytics API Endpoints
Provides advanced analytics and insights for traffic monitoring
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import TrafficLog, Domain, User
from app import db
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
import logging

logger = logging.getLogger(__name__)

analytics_enhanced_bp = Blueprint('analytics_enhanced', __name__)

@analytics_enhanced_bp.route('/api/v1/analytics/traffic/summary', methods=['GET'])
@jwt_required()
def get_traffic_summary():
    """Get comprehensive traffic analytics summary"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        domain_id = request.args.get('domain_id', type=int)
        hours = request.args.get('hours', default=24, type=int)
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # Base query
        query = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_time
        )
        
        if domain_id:
            query = query.filter(TrafficLog.domain_id == domain_id)
        
        # Get all traffic logs
        traffic_logs = query.all()
        
        # Calculate metrics
        total_requests = len(traffic_logs)
        unique_ips = len(set(log.client_ip for log in traffic_logs))
        bot_requests = len([log for log in traffic_logs if log.is_bot])
        human_requests = total_requests - bot_requests
        
        # Status code analysis
        success_requests = len([log for log in traffic_logs if log.response_status and log.response_status < 400])
        error_requests = total_requests - success_requests
        error_rate = (error_requests / total_requests * 100) if total_requests > 0 else 0
        
        # Response time analysis
        response_times = [log.response_time for log in traffic_logs if log.response_time]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        min_response_time = min(response_times) if response_times else 0
        max_response_time = max(response_times) if response_times else 0
        
        # Geographic analysis
        countries = {}
        cities = {}
        for log in traffic_logs:
            if log.geo_country:
                countries[log.geo_country] = countries.get(log.geo_country, 0) + 1
            if log.geo_city:
                cities[log.geo_city] = cities.get(log.geo_city, 0) + 1
        
        # Top countries and cities
        top_countries = sorted(countries.items(), key=lambda x: x[1], reverse=True)[:10]
        top_cities = sorted(cities.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Method analysis
        methods = {}
        for log in traffic_logs:
            if log.request_method:
                methods[log.request_method] = methods.get(log.request_method, 0) + 1
        
        # Path analysis
        paths = {}
        for log in traffic_logs:
            if log.request_path:
                paths[log.request_path] = paths.get(log.request_path, 0) + 1
        
        top_paths = sorted(paths.items(), key=lambda x: x[1], reverse=True)[:20]
        
        # Hourly breakdown
        hourly_stats = {}
        for log in traffic_logs:
            hour = log.timestamp.replace(minute=0, second=0, microsecond=0)
            hour_key = hour.isoformat()
            if hour_key not in hourly_stats:
                hourly_stats[hour_key] = {
                    'total': 0,
                    'bots': 0,
                    'humans': 0,
                    'errors': 0,
                    'unique_ips': set()
                }
            
            hourly_stats[hour_key]['total'] += 1
            if log.is_bot:
                hourly_stats[hour_key]['bots'] += 1
            else:
                hourly_stats[hour_key]['humans'] += 1
            
            if log.response_status and log.response_status >= 400:
                hourly_stats[hour_key]['errors'] += 1
            
            hourly_stats[hour_key]['unique_ips'].add(log.client_ip)
        
        # Convert sets to counts for JSON serialization
        for hour_data in hourly_stats.values():
            hour_data['unique_ips'] = len(hour_data['unique_ips'])
        
        # Bot type analysis
        bot_types = {}
        for log in traffic_logs:
            if log.is_bot and log.bot_type:
                bot_types[log.bot_type] = bot_types.get(log.bot_type, 0) + 1
        
        # User agent analysis
        user_agents = {}
        for log in traffic_logs:
            if log.user_agent:
                # Extract browser/device info (simplified)
                ua = log.user_agent.lower()
                if 'chrome' in ua:
                    browser = 'Chrome'
                elif 'firefox' in ua:
                    browser = 'Firefox'
                elif 'safari' in ua and 'chrome' not in ua:
                    browser = 'Safari'
                elif 'edge' in ua:
                    browser = 'Edge'
                else:
                    browser = 'Other'
                
                user_agents[browser] = user_agents.get(browser, 0) + 1
        
        summary = {
            'overview': {
                'total_requests': total_requests,
                'unique_visitors': unique_ips,
                'bot_requests': bot_requests,
                'human_requests': human_requests,
                'bot_percentage': (bot_requests / total_requests * 100) if total_requests > 0 else 0,
                'success_requests': success_requests,
                'error_requests': error_requests,
                'error_rate': round(error_rate, 2),
                'time_range': {
                    'start': start_time.isoformat(),
                    'end': end_time.isoformat(),
                    'hours': hours
                }
            },
            'performance': {
                'avg_response_time': round(avg_response_time, 3) if avg_response_time else 0,
                'min_response_time': round(min_response_time, 3) if min_response_time else 0,
                'max_response_time': round(max_response_time, 3) if max_response_time else 0,
                'total_response_times': len(response_times)
            },
            'geographic': {
                'top_countries': [{'country': country, 'requests': count} for country, count in top_countries],
                'top_cities': [{'city': city, 'requests': count} for city, count in top_cities],
                'total_countries': len(countries),
                'total_cities': len(cities)
            },
            'methods': [{'method': method, 'requests': count} for method, count in sorted(methods.items(), key=lambda x: x[1], reverse=True)],
            'top_paths': [{'path': path, 'requests': count} for path, count in top_paths],
            'hourly_breakdown': [
                {
                    'hour': hour,
                    'total': data['total'],
                    'bots': data['bots'],
                    'humans': data['humans'],
                    'errors': data['errors'],
                    'unique_ips': data['unique_ips']
                }
                for hour, data in sorted(hourly_stats.items())
            ],
            'bot_analysis': {
                'bot_types': [{'type': bot_type, 'requests': count} for bot_type, count in sorted(bot_types.items(), key=lambda x: x[1], reverse=True)],
                'total_bot_types': len(bot_types)
            },
            'user_agents': [{'browser': browser, 'requests': count} for browser, count in sorted(user_agents.items(), key=lambda x: x[1], reverse=True)]
        }
        
        return jsonify({
            'success': True,
            'analytics': summary
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting traffic summary: {e}")
        return jsonify({'error': 'Failed to get traffic summary'}), 500

@analytics_enhanced_bp.route('/api/v1/analytics/traffic/realtime', methods=['GET'])
@jwt_required()
def get_realtime_metrics():
    """Get real-time traffic metrics for the last few minutes"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        domain_id = request.args.get('domain_id', type=int)
        minutes = request.args.get('minutes', default=5, type=int)
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=minutes)
        
        # Base query
        query = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_time
        )
        
        if domain_id:
            query = query.filter(TrafficLog.domain_id == domain_id)
        
        # Get recent traffic
        recent_traffic = query.order_by(TrafficLog.timestamp.desc()).all()
        
        # Calculate real-time metrics
        total_requests = len(recent_traffic)
        requests_per_minute = total_requests / minutes if minutes > 0 else 0
        
        # Get last minute activity
        last_minute = end_time - timedelta(minutes=1)
        last_minute_requests = len([log for log in recent_traffic if log.timestamp >= last_minute])
        
        # Status breakdown
        status_2xx = len([log for log in recent_traffic if log.response_status and 200 <= log.response_status < 300])
        status_3xx = len([log for log in recent_traffic if log.response_status and 300 <= log.response_status < 400])
        status_4xx = len([log for log in recent_traffic if log.response_status and 400 <= log.response_status < 500])
        status_5xx = len([log for log in recent_traffic if log.response_status and log.response_status >= 500])
        
        # Bot vs Human
        bot_requests = len([log for log in recent_traffic if log.is_bot])
        human_requests = total_requests - bot_requests
        
        # Unique IPs
        unique_ips = len(set(log.client_ip for log in recent_traffic))
        
        # Average response time
        response_times = [log.response_time for log in recent_traffic if log.response_time]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        metrics = {
            'timestamp': end_time.isoformat(),
            'time_range_minutes': minutes,
            'total_requests': total_requests,
            'requests_per_minute': round(requests_per_minute, 2),
            'last_minute_requests': last_minute_requests,
            'unique_visitors': unique_ips,
            'avg_response_time': round(avg_response_time, 3) if avg_response_time else 0,
            'status_breakdown': {
                '2xx': status_2xx,
                '3xx': status_3xx,
                '4xx': status_4xx,
                '5xx': status_5xx
            },
            'traffic_type': {
                'human': human_requests,
                'bot': bot_requests,
                'bot_percentage': (bot_requests / total_requests * 100) if total_requests > 0 else 0
            },
            'health_score': calculate_health_score(status_4xx + status_5xx, total_requests, avg_response_time)
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting real-time metrics: {e}")
        return jsonify({'error': 'Failed to get real-time metrics'}), 500

def calculate_health_score(error_count, total_requests, avg_response_time):
    """Calculate a health score based on error rate and response time"""
    if total_requests == 0:
        return 100
    
    error_rate = (error_count / total_requests) * 100
    
    # Base score starts at 100
    score = 100
    
    # Deduct points for error rate
    score -= error_rate * 2  # 2 points per 1% error rate
    
    # Deduct points for slow response times
    if avg_response_time > 1.0:  # > 1 second
        score -= (avg_response_time - 1.0) * 10  # 10 points per second over 1s
    elif avg_response_time > 0.5:  # > 500ms
        score -= (avg_response_time - 0.5) * 5   # 5 points per 100ms over 500ms
    
    # Ensure score is between 0 and 100
    return max(0, min(100, round(score, 1)))

@analytics_enhanced_bp.route('/api/v1/analytics/domains/<int:domain_id>/insights', methods=['GET'])
@jwt_required()
def get_domain_insights(domain_id):
    """Get detailed insights for a specific domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify domain ownership
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        # Get time range
        days = request.args.get('days', default=7, type=int)
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        # Get traffic logs for this domain
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.domain_id == domain_id,
            TrafficLog.timestamp >= start_time
        ).all()
        
        # Generate insights
        insights = {
            'domain': {
                'id': domain.id,
                'name': domain.domain_name,
                'is_verified': domain.is_verified,
                'traffic_enabled': domain.traffic_enabled
            },
            'summary': {
                'total_requests': len(traffic_logs),
                'date_range': {
                    'start': start_time.isoformat(),
                    'end': end_time.isoformat(),
                    'days': days
                }
            },
            'trends': analyze_traffic_trends(traffic_logs, days),
            'security': analyze_security_patterns(traffic_logs),
            'performance': analyze_performance_patterns(traffic_logs),
            'recommendations': generate_recommendations(traffic_logs, domain)
        }
        
        return jsonify({
            'success': True,
            'insights': insights
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting domain insights: {e}")
        return jsonify({'error': 'Failed to get domain insights'}), 500

def analyze_traffic_trends(traffic_logs, days):
    """Analyze traffic trends over time"""
    if not traffic_logs:
        return {'trend': 'no_data', 'daily_average': 0, 'peak_hour': None}
    
    # Daily breakdown
    daily_counts = {}
    hourly_counts = {}
    
    for log in traffic_logs:
        day = log.timestamp.date()
        hour = log.timestamp.hour
        
        daily_counts[day] = daily_counts.get(day, 0) + 1
        hourly_counts[hour] = hourly_counts.get(hour, 0) + 1
    
    # Calculate trend
    if len(daily_counts) >= 2:
        daily_values = list(daily_counts.values())
        recent_avg = sum(daily_values[-3:]) / min(3, len(daily_values))  # Last 3 days
        older_avg = sum(daily_values[:-3]) / max(1, len(daily_values) - 3) if len(daily_values) > 3 else recent_avg
        
        if recent_avg > older_avg * 1.1:
            trend = 'increasing'
        elif recent_avg < older_avg * 0.9:
            trend = 'decreasing'
        else:
            trend = 'stable'
    else:
        trend = 'insufficient_data'
    
    # Find peak hour
    peak_hour = max(hourly_counts.items(), key=lambda x: x[1])[0] if hourly_counts else None
    
    return {
        'trend': trend,
        'daily_average': len(traffic_logs) / days,
        'peak_hour': peak_hour,
        'daily_breakdown': [{'date': str(date), 'requests': count} for date, count in sorted(daily_counts.items())]
    }

def analyze_security_patterns(traffic_logs):
    """Analyze security-related patterns"""
    if not traffic_logs:
        return {'threat_level': 'low', 'suspicious_ips': [], 'bot_percentage': 0}
    
    # Count requests per IP
    ip_counts = {}
    bot_count = 0
    error_4xx_count = 0
    
    for log in traffic_logs:
        ip_counts[log.client_ip] = ip_counts.get(log.client_ip, 0) + 1
        if log.is_bot:
            bot_count += 1
        if log.response_status and 400 <= log.response_status < 500:
            error_4xx_count += 1
    
    # Find suspicious IPs (high request count)
    total_requests = len(traffic_logs)
    avg_requests_per_ip = total_requests / len(ip_counts) if ip_counts else 0
    suspicious_threshold = max(50, avg_requests_per_ip * 5)  # 5x average or minimum 50
    
    suspicious_ips = [
        {'ip': ip, 'requests': count, 'percentage': (count / total_requests * 100)}
        for ip, count in ip_counts.items()
        if count > suspicious_threshold
    ]
    
    # Calculate threat level
    bot_percentage = (bot_count / total_requests * 100) if total_requests > 0 else 0
    error_rate = (error_4xx_count / total_requests * 100) if total_requests > 0 else 0
    
    if len(suspicious_ips) > 5 or bot_percentage > 50 or error_rate > 20:
        threat_level = 'high'
    elif len(suspicious_ips) > 2 or bot_percentage > 25 or error_rate > 10:
        threat_level = 'medium'
    else:
        threat_level = 'low'
    
    return {
        'threat_level': threat_level,
        'suspicious_ips': suspicious_ips[:10],  # Top 10
        'bot_percentage': round(bot_percentage, 2),
        'error_4xx_rate': round(error_rate, 2),
        'unique_ips': len(ip_counts)
    }

def analyze_performance_patterns(traffic_logs):
    """Analyze performance patterns"""
    if not traffic_logs:
        return {'status': 'no_data'}
    
    response_times = [log.response_time for log in traffic_logs if log.response_time]
    
    if not response_times:
        return {'status': 'no_response_time_data'}
    
    # Calculate percentiles
    response_times.sort()
    n = len(response_times)
    
    p50 = response_times[int(n * 0.5)] if n > 0 else 0
    p90 = response_times[int(n * 0.9)] if n > 0 else 0
    p95 = response_times[int(n * 0.95)] if n > 0 else 0
    p99 = response_times[int(n * 0.99)] if n > 0 else 0
    
    avg_response_time = sum(response_times) / len(response_times)
    
    # Performance rating
    if p95 < 0.2:  # 95th percentile under 200ms
        performance_rating = 'excellent'
    elif p95 < 0.5:  # under 500ms
        performance_rating = 'good'
    elif p95 < 1.0:  # under 1s
        performance_rating = 'fair'
    else:
        performance_rating = 'poor'
    
    return {
        'status': 'analyzed',
        'performance_rating': performance_rating,
        'avg_response_time': round(avg_response_time, 3),
        'percentiles': {
            'p50': round(p50, 3),
            'p90': round(p90, 3),
            'p95': round(p95, 3),
            'p99': round(p99, 3)
        },
        'total_samples': len(response_times)
    }

def generate_recommendations(traffic_logs, domain):
    """Generate actionable recommendations"""
    recommendations = []
    
    if not traffic_logs:
        recommendations.append({
            'type': 'setup',
            'priority': 'high',
            'title': 'Install Tracking Script',
            'description': 'No traffic data detected. Install the tracking script on your website to start monitoring.',
            'action': 'Get tracking script from the integration page'
        })
        return recommendations
    
    # Analyze patterns and generate recommendations
    total_requests = len(traffic_logs)
    bot_count = len([log for log in traffic_logs if log.is_bot])
    error_count = len([log for log in traffic_logs if log.response_status and log.response_status >= 400])
    
    # Bot traffic recommendation
    if bot_count / total_requests > 0.3:  # > 30% bots
        recommendations.append({
            'type': 'security',
            'priority': 'medium',
            'title': 'High Bot Traffic Detected',
            'description': f'{bot_count / total_requests * 100:.1f}% of your traffic is from bots. Consider implementing bot filtering rules.',
            'action': 'Configure bot detection rules in the Rules section'
        })
    
    # Error rate recommendation
    if error_count / total_requests > 0.1:  # > 10% errors
        recommendations.append({
            'type': 'performance',
            'priority': 'high',
            'title': 'High Error Rate',
            'description': f'{error_count / total_requests * 100:.1f}% of requests are returning errors. Check your website for issues.',
            'action': 'Review error logs and fix broken pages'
        })
    
    # Performance recommendation
    response_times = [log.response_time for log in traffic_logs if log.response_time]
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        if avg_response_time > 1.0:  # > 1 second
            recommendations.append({
                'type': 'performance',
                'priority': 'medium',
                'title': 'Slow Response Times',
                'description': f'Average response time is {avg_response_time:.2f}s. Consider optimizing your website performance.',
                'action': 'Optimize images, enable caching, or upgrade hosting'
            })
    
    # Traffic volume recommendation
    if total_requests < 100:  # Low traffic
        recommendations.append({
            'type': 'growth',
            'priority': 'low',
            'title': 'Low Traffic Volume',
            'description': 'Your website has relatively low traffic. Consider SEO optimization or marketing campaigns.',
            'action': 'Implement SEO best practices and content marketing'
        })
    
    return recommendations
