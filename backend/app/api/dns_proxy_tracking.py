"""
DNS Proxy Traffic Tracking API
Special endpoint for DNS proxy traffic that bypasses domain verification
"""

from flask import Blueprint, jsonify, request, make_response
from datetime import datetime
from app.models import TrafficLog
from app import db, socketio
import logging
import uuid
import json

logger = logging.getLogger(__name__)

dns_proxy_bp = Blueprint('dns_proxy', __name__)

@dns_proxy_bp.route('/api/traffic/intercept-dns', methods=['POST', 'OPTIONS'])
def intercept_dns_traffic():
    """Special endpoint for DNS proxy traffic - bypasses domain verification"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        # Get traffic data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        logger.info(f"🌐 DNS Proxy traffic received: {data}")
        
        # Extract client IP
        client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ',' in client_ip:
            client_ip = client_ip.split(',')[0].strip()
        
        # Parse URL to get domain
        from urllib.parse import urlparse
        parsed_url = urlparse(data.get('url', ''))
        domain_name = parsed_url.netloc or 'localhost'
        
        # For DNS proxy traffic, we'll use a special domain ID (negative for proxy)
        # This way we can identify DNS proxy traffic vs regular tracking script traffic
        proxy_domain_id = -1  # Special ID for DNS proxy traffic
        
        # Create traffic log with DNS proxy specifics
        traffic_log = TrafficLog(
            uuid=str(uuid.uuid4()),
            domain_id=proxy_domain_id,  # Special ID for DNS proxy
            client_ip=client_ip,
            user_agent=data.get('user_agent', ''),
            request_method=data.get('method', 'GET'),
            request_path=parsed_url.path or '/',
            request_headers={
                'url': data.get('url', ''),
                'proxy_type': 'dns_proxy',
                'domain_name': domain_name
            },
            response_status=200,
            response_time=0.0,
            is_bot=False,  # DNS proxy traffic is generally not bot traffic
            timestamp=datetime.utcnow()
        )
        
        # Save to database
        db.session.add(traffic_log)
        db.session.commit()
        
        logger.info(f"✅ DNS Proxy traffic logged: {domain_name} - {parsed_url.path}")
        
        # Prepare data for real-time WebSocket streaming
        traffic_data = {
            'id': traffic_log.uuid,
            'timestamp': traffic_log.timestamp.isoformat(),
            'domain_name': domain_name,
            'client_ip': client_ip,
            'user_agent': data.get('user_agent', ''),
            'request_method': data.get('method', 'GET'),
            'request_path': parsed_url.path or '/',
            'url': data.get('url', ''),
            'is_bot': False,
            'proxy_type': 'dns_proxy',
            'response_status': 200
        }
        
        # Emit real-time update via WebSocket
        try:
            socketio.emit('traffic_update', {
                'domain_id': str(proxy_domain_id),
                'traffic': traffic_data
            }, namespace='/', room=None)
            
            logger.info(f"📡 WebSocket traffic update sent for DNS proxy: {domain_name}")
            
        except Exception as ws_error:
            logger.error(f"❌ WebSocket emit error: {ws_error}")
            # Don't fail the request if WebSocket fails
        
        return jsonify({
            'success': True,
            'message': 'DNS proxy traffic logged successfully',
            'traffic_id': traffic_log.uuid,
            'domain_name': domain_name,
            'timestamp': traffic_log.timestamp.isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ DNS Proxy traffic intercept error: {e}")
        db.session.rollback()
        return jsonify({
            'error': 'Failed to process DNS proxy traffic',
            'message': str(e)
        }), 500

@dns_proxy_bp.route('/api/traffic/dns-stats', methods=['GET'])
def get_dns_proxy_stats():
    """Get statistics for DNS proxy traffic"""
    try:
        # Get DNS proxy traffic logs (domain_id = -1)
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # Last 24 hours of DNS proxy traffic
        since = datetime.utcnow() - timedelta(hours=24)
        
        dns_traffic = db.session.query(TrafficLog).filter(
            TrafficLog.domain_id == -1,
            TrafficLog.timestamp >= since
        ).all()
        
        # Calculate stats
        total_requests = len(dns_traffic)
        unique_ips = len(set(log.client_ip for log in dns_traffic))
        
        # Group by domain name from headers
        domain_stats = {}
        for log in dns_traffic:
            headers = log.request_headers or {}
            domain_name = headers.get('domain_name', 'unknown')
            if domain_name not in domain_stats:
                domain_stats[domain_name] = 0
            domain_stats[domain_name] += 1
        
        # Recent traffic (last 10 requests)
        recent_traffic = []
        for log in sorted(dns_traffic, key=lambda x: x.timestamp, reverse=True)[:10]:
            headers = log.request_headers or {}
            recent_traffic.append({
                'timestamp': log.timestamp.isoformat(),
                'domain_name': headers.get('domain_name', 'unknown'),
                'client_ip': log.client_ip,
                'path': log.request_path,
                'method': log.request_method,
                'user_agent': log.user_agent
            })
        
        return jsonify({
            'success': True,
            'stats': {
                'total_requests_24h': total_requests,
                'unique_visitors_24h': unique_ips,
                'domain_breakdown': domain_stats,
                'recent_traffic': recent_traffic
            },
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ DNS proxy stats error: {e}")
        return jsonify({
            'error': 'Failed to get DNS proxy stats',
            'message': str(e)
        }), 500
