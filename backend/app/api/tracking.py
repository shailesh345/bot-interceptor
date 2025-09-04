"""
Tracking Script API Endpoints
Provides JavaScript tracking code for domain owners to integrate on their websites
"""

from flask import Blueprint, jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.models import Domain, User, TrafficLog
from app import db
import logging
import uuid

logger = logging.getLogger(__name__)

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/api/v1/domains/<int:domain_id>/tracking-script', methods=['GET'])
@jwt_required()
def get_tracking_script(domain_id):
    """Get JavaScript tracking script for a domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get domain and verify ownership
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        if not domain.is_verified:
            return jsonify({'error': 'Domain must be verified to get tracking script'}), 400
        
        # Generate tracking script
        tracking_script = f"""
<!-- Boot Interceptor Tracking Script for {domain.domain_name} -->
<script>
(function() {{
    // Boot Interceptor Configuration
    const BOOT_INTERCEPTOR_CONFIG = {{
        domain: '{domain.domain_name}',
        domainId: {domain.id},
        apiEndpoint: 'http://localhost:8960/api/traffic/intercept', // Change this to your public domain when deployed
        enabled: true
    }};
    
    // Traffic data collection
    function collectTrafficData() {{
        return {{
            method: 'GET',
            url: window.location.href,
            headers: {{
                'User-Agent': navigator.userAgent,
                'Referer': document.referrer || '',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': navigator.language || 'en-US',
                'Accept-Encoding': 'gzip, deflate'
            }},
            client_ip: '', // Will be filled by server
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            page_title: document.title,
            screen_resolution: screen.width + 'x' + screen.height,
            viewport_size: window.innerWidth + 'x' + window.innerHeight,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookies_enabled: navigator.cookieEnabled,
            java_enabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            plugins: Array.from(navigator.plugins).map(p => p.name).join(',')
        }};
    }}
    
    // Send traffic data to Boot Interceptor
    function sendTrafficData(data) {{
        if (!BOOT_INTERCEPTOR_CONFIG.enabled) return;
        
        // Use sendBeacon if available, fallback to fetch
        const payload = JSON.stringify(data);
        
        if (navigator.sendBeacon) {{
            navigator.sendBeacon(BOOT_INTERCEPTOR_CONFIG.apiEndpoint, payload);
        }} else {{
            fetch(BOOT_INTERCEPTOR_CONFIG.apiEndpoint, {{
                method: 'POST',
                headers: {{
                    'Content-Type': 'application/json',
                }},
                body: payload,
                keepalive: true
            }}).catch(err => {{
                console.warn('Boot Interceptor: Failed to send traffic data:', err);
            }});
        }}
    }}
    
    // Track page view
    function trackPageView() {{
        const trafficData = collectTrafficData();
        sendTrafficData(trafficData);
    }}
    
    // Track page unload
    function trackPageUnload() {{
        const trafficData = collectTrafficData();
        trafficData.event_type = 'page_unload';
        sendTrafficData(trafficData);
    }}
    
    // Initialize tracking
    function initTracking() {{
        // Track initial page load
        if (document.readyState === 'loading') {{
            document.addEventListener('DOMContentLoaded', trackPageView);
        }} else {{
            trackPageView();
        }}
        
        // Track page unload
        window.addEventListener('beforeunload', trackPageUnload);
        
        // Track hash changes (SPA navigation)
        window.addEventListener('hashchange', trackPageView);
        
        // Track history changes (SPA navigation)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function() {{
            originalPushState.apply(history, arguments);
            setTimeout(trackPageView, 0);
        }};
        
        history.replaceState = function() {{
            originalReplaceState.apply(history, arguments);
            setTimeout(trackPageView, 0);
        }};
        
        window.addEventListener('popstate', trackPageView);
    }}
    
    // Start tracking
    initTracking();
    
    // Expose global function for manual tracking
    window.bootInterceptor = {{
        track: trackPageView,
        config: BOOT_INTERCEPTOR_CONFIG
    }};
}})();
</script>
<!-- End Boot Interceptor Tracking Script -->"""
        
        return jsonify({
            'success': True,
            'domain_name': domain.domain_name,
            'domain_id': domain.id,
            'tracking_script': tracking_script,
            'instructions': {
                'html': 'Add this script to the <head> section of your website',
                'wordpress': 'Add this script to your theme\'s header.php file or use a plugin like "Insert Headers and Footers"',
                'shopify': 'Go to Online Store > Themes > Actions > Edit Code > theme.liquid and add before </head>',
                'squarespace': 'Go to Settings > Advanced > Code Injection and add to Header',
                'wix': 'Go to Settings > Tracking & Analytics > New Tool > Custom Code and add to Head'
            },
            'integration_url': f'/api/v1/domains/{domain_id}/verify-integration'
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating tracking script: {e}")
        return jsonify({'error': 'Failed to generate tracking script'}), 500

@tracking_bp.route('/api/v1/domains/<int:domain_id>/verify-integration', methods=['GET'])
@jwt_required()
def verify_integration(domain_id):
    """Verify that the tracking script is properly integrated on the domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get domain and verify ownership
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        # Check recent traffic logs to see if tracking is working
        from app.models import TrafficLog
        from datetime import datetime, timedelta
        
        recent_traffic = TrafficLog.query.filter(
            TrafficLog.domain_id == domain_id,
            TrafficLog.timestamp >= datetime.utcnow() - timedelta(minutes=30)
        ).count()
        
        integration_status = {
            'is_integrated': recent_traffic > 0,
            'recent_traffic_count': recent_traffic,
            'last_check': datetime.utcnow().isoformat(),
            'status': 'active' if recent_traffic > 0 else 'pending',
            'message': 'Tracking script is working correctly' if recent_traffic > 0 else 'No recent traffic detected. Please ensure the script is properly installed.'
        }
        
        return jsonify({
            'success': True,
            'domain_name': domain.domain_name,
            'integration_status': integration_status
        }), 200
        
    except Exception as e:
        logger.error(f"Error verifying integration: {e}")
        return jsonify({'error': 'Failed to verify integration'}), 500

@tracking_bp.route('/api/traffic/intercept', methods=['POST', 'OPTIONS'])
def intercept_traffic():
    """Public endpoint to receive traffic data from tracking script"""
    
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
        
        # Extract client IP
        client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ',' in client_ip:
            client_ip = client_ip.split(',')[0].strip()
        
        # Parse URL to get domain
        from urllib.parse import urlparse
        parsed_url = urlparse(data.get('url', ''))
        domain_name = parsed_url.netloc
        
        if not domain_name:
            return jsonify({'error': 'Invalid URL'}), 400
        
        # Find domain in database
        domain = Domain.query.filter_by(domain_name=domain_name).first()
        
        # Special handling for DNS proxy traffic (localhost, 127.0.0.1, etc.)
        dns_proxy_domains = ['localhost', '127.0.0.1', 'test-shaileshdwivedi.in', 'shaileshdwivedi.in']
        is_dns_proxy_traffic = any(dns_domain in domain_name for dns_domain in dns_proxy_domains)
        
        if not domain and not is_dns_proxy_traffic:
            return jsonify({'error': 'Domain not registered'}), 404
        
                        # For DNS proxy traffic, find or use the first verified domain
                if is_dns_proxy_traffic and not domain:
                    # Find any verified domain to associate DNS proxy traffic with
                    verified_domain = Domain.query.filter_by(is_verified=True).first()
                    if verified_domain:
                        domain_id = verified_domain.id
                        domain = verified_domain  # Use the verified domain for consistency
                        logger.info(f"🎯 Using verified domain ID {domain_id} ({domain.domain_name}) for DNS proxy traffic")
                    else:
                        domain_id = -1  # Fallback if no verified domains exist
                        logger.warning("⚠️ No verified domains found, using fallback domain_id = -1")
        elif domain:
            if not domain.is_verified or not domain.traffic_enabled:
                return jsonify({'error': 'Traffic monitoring not enabled for this domain'}), 403
            domain_id = domain.id
        else:
            domain_id = -1
        
        # Create traffic log with correct field names
        traffic_log = TrafficLog(
            uuid=str(uuid.uuid4()),
            domain_id=domain_id,
            client_ip=client_ip,
            user_agent=data.get('user_agent', ''),
            request_method=data.get('method', 'GET'),
            request_path=parsed_url.path or '/',
            request_headers={
                'url': data.get('url', ''),
                'domain_name': domain_name,
                'is_dns_proxy': is_dns_proxy_traffic
            },  # Store URL and domain info in headers
            response_status=200,  # Assume success for page views
            response_time=0.0,
            is_bot=False,  # Will be determined by bot detection
            timestamp=datetime.utcnow(),
            geo_country='',  # Correct field name
            geo_city='',     # Correct field name
            bot_type=None,
            rule_matched=None,
            action_taken='allow',
            processing_time=0.0
        )
        
        try:
            db.session.add(traffic_log)
            db.session.commit()
            
            # Send to WebSocket for real-time monitoring
            from flask import current_app
            if hasattr(current_app, 'traffic_stream_manager'):
                traffic_data = {
                    'id': traffic_log.uuid,
                    'timestamp': traffic_log.timestamp.isoformat(),
                    'ip': client_ip,
                    'user_agent': data.get('user_agent', ''),
                    'method': data.get('method', 'GET'),
                    'path': parsed_url.path or '/',
                    'status_code': 200,
                    'response_time': 0,
                    'is_bot': False,
                    'country': '',
                    'city': '',
                    'domain_id': domain_id,
                    'domain_name': domain.domain_name if domain else domain_name,
                    'page_title': data.get('page_title', ''),
                    'event_type': data.get('event_type', 'page_view')
                }
            
                current_app.traffic_stream_manager.add_traffic_data(str(domain_id), traffic_data)
                print(f"✅ Real traffic data sent through WebSocket for domain {domain.domain_name if domain else domain_name}")
            
            # Return success response
            response = make_response(jsonify({
                'success': True,
                'message': 'Traffic data recorded successfully',
                'traffic_id': traffic_log.uuid,
                'domain': domain.domain_name if domain else domain_name,
                'timestamp': traffic_log.timestamp.isoformat()
            }))
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 200
            
        except Exception as db_error:
            db.session.rollback()
            print(f"❌ Database error: {db_error}")
            response = make_response(jsonify({'error': f'Failed to record traffic data: {str(db_error)}'}))
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 500
        
    except Exception as e:
        logger.error(f"Error intercepting traffic: {e}")
        response = make_response(jsonify({'error': 'Failed to record traffic data'}))
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500
