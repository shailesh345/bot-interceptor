"""
Dashboard API Endpoints
Provides main dashboard data and overview metrics
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json
from sqlalchemy import func, desc
from ..models import User, Domain, TrafficLog, InterceptorRule, BotProfile
from .. import db

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    """Get main dashboard overview with key metrics"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time range (default: last 7 days)
        days = request.args.get('days', 7, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        # Initialize default values
        overview_data = {
            'total_domains': len(domains),
            'active_domains': len([d for d in domains if d.status == 'active']),
            'total_requests': 0,
            'bot_requests': 0,
            'blocked_requests': 0,
            'human_requests': 0,
            'active_rules': 0,
            'avg_response_time': 0,
            'top_domains': [],
            'recent_activity': [],
            'threat_summary': {
                'high_risk_ips': 0,
                'bot_types': [],
                'blocked_countries': []
            },
            'performance_summary': {
                'uptime': '99.9%',
                'avg_load_time': 0,
                'error_rate': 0
            }
        }
        
        if not domain_ids:
            return jsonify({'dashboard': overview_data}), 200
        
        # Get traffic logs for the period
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date,
            TrafficLog.timestamp <= end_date
        ).all()
        
        # Calculate basic metrics
        total_requests = len(traffic_logs)
        bot_requests = len([log for log in traffic_logs if log.is_bot])
        blocked_requests = len([log for log in traffic_logs if log.action_taken == 'block'])
        human_requests = total_requests - bot_requests
        
        # Active rules
        active_rules = InterceptorRule.query.filter(
            InterceptorRule.domain_id.in_(domain_ids),
            InterceptorRule.is_active == True
        ).count()
        
        # Average response time
        response_times = [log.response_time for log in traffic_logs if log.response_time]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Top domains by traffic
        domain_traffic = {}
        for log in traffic_logs:
            domain = next((d for d in domains if d.id == log.domain_id), None)
            if domain:
                domain_name = domain.domain_name
                if domain_name not in domain_traffic:
                    domain_traffic[domain_name] = {'requests': 0, 'bots': 0, 'blocked': 0}
                domain_traffic[domain_name]['requests'] += 1
                if log.is_bot:
                    domain_traffic[domain_name]['bots'] += 1
                if log.action_taken == 'block':
                    domain_traffic[domain_name]['blocked'] += 1
        
        top_domains = sorted(domain_traffic.items(), key=lambda x: x[1]['requests'], reverse=True)[:10]
        top_domains_formatted = [
            {
                'domain': domain,
                'requests': stats['requests'],
                'bots': stats['bots'],
                'blocked': stats['blocked'],
                'bot_rate': round((stats['bots'] / stats['requests']) * 100, 1) if stats['requests'] > 0 else 0
            }
            for domain, stats in top_domains
        ]
        
        # Recent activity (last 20 requests)
        recent_logs = sorted(traffic_logs, key=lambda x: x.timestamp, reverse=True)[:20]
        recent_activity = []
        for log in recent_logs:
            domain = next((d for d in domains if d.id == log.domain_id), None)
            recent_activity.append({
                'id': log.uuid,
                'timestamp': log.timestamp.isoformat() if log.timestamp else None,
                'domain': domain.domain_name if domain else 'Unknown',
                'ip': log.client_ip,
                'user_agent': log.user_agent[:100] + '...' if log.user_agent and len(log.user_agent) > 100 else log.user_agent,
                'method': log.request_method,
                'path': log.request_path,
                'status': log.response_status,
                'is_bot': log.is_bot,
                'bot_type': log.bot_type,
                'action': log.action_taken,
                'country': log.geo_country,
                'response_time': log.response_time
            })
        
        # Threat analysis
        high_risk_ips = set()
        bot_types = {}
        blocked_countries = {}
        
        for log in traffic_logs:
            if log.action_taken == 'block':
                high_risk_ips.add(log.client_ip)
                
                if log.geo_country:
                    blocked_countries[log.geo_country] = blocked_countries.get(log.geo_country, 0) + 1
            
            if log.bot_type:
                bot_types[log.bot_type] = bot_types.get(log.bot_type, 0) + 1
        
        # Performance metrics
        error_requests = len([log for log in traffic_logs if log.response_status >= 400])
        error_rate = (error_requests / total_requests) * 100 if total_requests > 0 else 0
        
        # Update overview data
        overview_data.update({
            'total_requests': total_requests,
            'bot_requests': bot_requests,
            'blocked_requests': blocked_requests,
            'human_requests': human_requests,
            'active_rules': active_rules,
            'avg_response_time': round(avg_response_time, 3),
            'top_domains': top_domains_formatted,
            'recent_activity': recent_activity,
            'threat_summary': {
                'high_risk_ips': len(high_risk_ips),
                'bot_types': [{'type': bot_type, 'count': count} for bot_type, count in sorted(bot_types.items(), key=lambda x: x[1], reverse=True)[:10]],
                'blocked_countries': [{'country': country, 'count': count} for country, count in sorted(blocked_countries.items(), key=lambda x: x[1], reverse=True)[:10]]
            },
            'performance_summary': {
                'uptime': '99.9%',  # This would be calculated from actual uptime data
                'avg_load_time': round(avg_response_time, 3),
                'error_rate': round(error_rate, 2)
            }
        })
        
        return jsonify({
            'dashboard': overview_data,
            'time_range': f"Last {days} days",
            'last_updated': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Dashboard overview error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@dashboard.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get quick dashboard statistics"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        # Today's stats
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        stats = {
            'total_domains': len(domains),
            'verified_domains': len([d for d in domains if d.is_verified]),
            'active_rules': 0,
            'today_requests': 0,
            'today_blocks': 0,
            'today_bots': 0
        }
        
        if domain_ids:
            # Active rules
            stats['active_rules'] = InterceptorRule.query.filter(
                InterceptorRule.domain_id.in_(domain_ids),
                InterceptorRule.is_active == True
            ).count()
            
            # Today's traffic
            today_logs = TrafficLog.query.filter(
                TrafficLog.domain_id.in_(domain_ids),
                TrafficLog.timestamp >= today_start,
                TrafficLog.timestamp < today_end
            ).all()
            
            stats['today_requests'] = len(today_logs)
            stats['today_blocks'] = len([log for log in today_logs if log.action_taken == 'block'])
            stats['today_bots'] = len([log for log in today_logs if log.is_bot])
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        current_app.logger.error(f"Dashboard stats error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@dashboard.route('/charts', methods=['GET'])
@jwt_required()
def get_dashboard_charts():
    """Get dashboard chart data"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time range
        days = request.args.get('days', 7, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        chart_data = {
            'traffic_trend': [],
            'bot_vs_human': {'bots': 0, 'humans': 0},
            'top_countries': [],
            'response_time_trend': [],
            'threat_levels': {'low': 0, 'medium': 0, 'high': 0}
        }
        
        if not domain_ids:
            return jsonify({'charts': chart_data}), 200
        
        # Get traffic data
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date,
            TrafficLog.timestamp <= end_date
        ).all()
        
        # Traffic trend (daily)
        daily_traffic = {}
        daily_response_times = {}
        
        for log in traffic_logs:
            day = log.timestamp.date().isoformat()
            
            if day not in daily_traffic:
                daily_traffic[day] = {'total': 0, 'bots': 0, 'blocked': 0}
                daily_response_times[day] = []
            
            daily_traffic[day]['total'] += 1
            if log.is_bot:
                daily_traffic[day]['bots'] += 1
            if log.action_taken == 'block':
                daily_traffic[day]['blocked'] += 1
            
            if log.response_time:
                daily_response_times[day].append(log.response_time)
        
        # Format traffic trend
        for day in sorted(daily_traffic.keys()):
            stats = daily_traffic[day]
            avg_response_time = sum(daily_response_times[day]) / len(daily_response_times[day]) if daily_response_times[day] else 0
            
            chart_data['traffic_trend'].append({
                'date': day,
                'total_requests': stats['total'],
                'bot_requests': stats['bots'],
                'blocked_requests': stats['blocked'],
                'human_requests': stats['total'] - stats['bots']
            })
            
            chart_data['response_time_trend'].append({
                'date': day,
                'avg_response_time': round(avg_response_time, 3)
            })
        
        # Bot vs Human
        total_bots = len([log for log in traffic_logs if log.is_bot])
        total_humans = len(traffic_logs) - total_bots
        chart_data['bot_vs_human'] = {'bots': total_bots, 'humans': total_humans}
        
        # Top countries
        countries = {}
        for log in traffic_logs:
            if log.geo_country:
                countries[log.geo_country] = countries.get(log.geo_country, 0) + 1
        
        chart_data['top_countries'] = [
            {'country': country, 'requests': count}
            for country, count in sorted(countries.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        # Threat levels (simplified classification)
        blocked_requests = len([log for log in traffic_logs if log.action_taken == 'block'])
        bot_requests = len([log for log in traffic_logs if log.is_bot])
        
        chart_data['threat_levels'] = {
            'high': blocked_requests,
            'medium': bot_requests - blocked_requests,
            'low': len(traffic_logs) - bot_requests
        }
        
        return jsonify({'charts': chart_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Dashboard charts error: {str(e)}")
        return jsonify({'error': str(e)}), 500

