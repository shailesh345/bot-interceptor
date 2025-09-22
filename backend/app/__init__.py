# Flask Application Factory
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO
from config import config
import redis
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')

# Advanced rate limiter with Redis backend
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["50000 per day", "10000 per hour", "2000 per minute"],  # Increased for DNS proxy
    storage_uri="memory://",  # Will be updated to use Redis in production
    strategy="fixed-window"
)

# Import middleware
from .middleware.error_handler import error_handler
from .middleware.api_monitor import api_monitor

# Import API documentation (optional)
try:
    from .api_docs import api_doc
    API_DOCS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: API documentation not available: {e}")
    API_DOCS_AVAILABLE = False

def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'default')
    
    app = Flask(__name__, static_folder='../static', static_url_path='/static')
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)
    
    # Configure JWT
    app.config['JWT_SECRET_KEY'] = app.config.get('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
    
    # Configure JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'message': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'message': 'Invalid token'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'message': 'Authorization token is required'}, 401
    
    # Initialize middleware
    # Temporarily disable error handler to test JWT
    # error_handler.init_app(app)
    api_monitor.init_app(app)
    
    # Configure CORS
    CORS(app, 
         origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:9889', 'http://127.0.0.1:9889', 'https://yourdomain.com'],
         supports_credentials=True,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         expose_headers=['Content-Range', 'X-Content-Range'])
    
    # Initialize Redis
    app.redis = redis.from_url(app.config['REDIS_URL'])
    app.redis_client = app.redis  # Alias for compatibility
    
    # Initialize WebSocket
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Import and register WebSocket events
    from app.websocket.events import init_websocket_events
    from app.websocket.traffic_stream import TrafficStreamManager
    
    # Initialize traffic stream manager
    traffic_stream_manager = TrafficStreamManager(socketio)
    
    # Make traffic stream manager accessible from app context
    app.traffic_stream_manager = traffic_stream_manager
    
    # Initialize WebSocket events with traffic stream manager
    init_websocket_events(socketio, traffic_stream_manager)
    
    # Register blueprints
    from app.api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    from app.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    
    from app.admin import admin as admin_blueprint
    app.register_blueprint(admin_blueprint, url_prefix='/admin')
    
    # Register Analytics blueprint directly (not under /api)
    from app.api.analytics import analytics
    app.register_blueprint(analytics, url_prefix='/analytics')
    
    # Register Monitoring blueprint
    from app.api.monitoring import monitoring
    app.register_blueprint(monitoring, url_prefix='/monitoring')
    
    # Register Dashboard blueprint
    from app.api.dashboard import dashboard
    app.register_blueprint(dashboard, url_prefix='/dashboard')
    
    # Register Tracking blueprint
    from app.api.tracking import tracking_bp
    app.register_blueprint(tracking_bp)
    
    # Register enhanced analytics blueprint
    from app.api.analytics_enhanced import analytics_enhanced_bp
    app.register_blueprint(analytics_enhanced_bp)
    
    # Clean admin routes
    from app.admin.clean_routes import clean_admin
    app.register_blueprint(clean_admin, url_prefix='/clean-admin')
    
    from app.interceptor import interceptor as interceptor_blueprint
    app.register_blueprint(interceptor_blueprint, url_prefix='/interceptor')
    
# Billing routes are already registered via api blueprint in routes.py
    
    # Register traffic interception blueprint
    from app.api.traffic_interception import traffic_interception_bp
    app.register_blueprint(traffic_interception_bp)
    
    # Register Phase 2 endpoints (domains, rules, traffic)
    from app.api.phase2_endpoints import domains_bp, rules_bp, traffic_bp
    app.register_blueprint(domains_bp, url_prefix='/api/v1')
    app.register_blueprint(rules_bp, url_prefix='/api/v1')
    app.register_blueprint(traffic_bp, url_prefix='/api/v1')
    
    # Register Credit Purchase blueprint for LLM bot monetization
    from app.api.credit_purchase import bp as credit_purchase_bp
    app.register_blueprint(credit_purchase_bp)
    
    # Register Company Management blueprint
    from app.api.companies import bp as companies_bp
    app.register_blueprint(companies_bp)
    
    # Register CAPTCHA blueprint
    from app.api.captcha import bp as captcha_bp
    app.register_blueprint(captcha_bp)
    
    # Register API documentation
    if API_DOCS_AVAILABLE:
        api_doc.init_app(app)
    
    # JWT token handlers
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        # Temporarily disable Redis token revocation check
        # TODO: Enable Redis for production
        return False
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'message': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'message': 'Invalid token'}, 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'message': 'Authorization token is required'}, 401
    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'traffic-interceptor-api'}
    
    # Redirect /v1/rules to /api/v1/rules for frontend compatibility
    @app.route('/v1/rules', methods=['GET', 'POST', 'PUT', 'DELETE'])
    def redirect_rules():
        from flask import redirect, request
        return redirect(f"/api/v1/rules{request.query_string.decode() and '?' + request.query_string.decode() or ''}", code=302)
    
    # Advanced monitoring endpoints
    @app.route('/api/monitoring/health')
    def api_health():
        """Get comprehensive API health status"""
        return api_monitor.get_health_status()
    
    @app.route('/api/monitoring/metrics')
    def api_metrics():
        """Get detailed API metrics"""
        return api_monitor.get_metrics_summary()
    
    @app.route('/api/monitoring/performance')
    def api_performance():
        """Get performance metrics"""
        return {
            'performance': api_monitor.get_performance_metrics(),
            'top_endpoints': api_monitor.get_top_endpoints(),
            'hourly_stats': api_monitor.get_hourly_stats()
        }
    
    # API Testing Interface
    @app.route('/test-api')
    def api_test_interface():
        try:
            return app.send_static_file('api_test.html')
        except Exception as e:
            return f"Error loading test interface: {str(e)}", 500
    
    # Alternative static file serving
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        return app.send_static_file(filename)
    
    # Placeholder image endpoint
    @app.route('/api/placeholder/<int:width>/<int:height>')
    def placeholder_image(width, height):
        """Generate placeholder image"""
        try:
            # Return a simple SVG placeholder
            svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ccc" stroke-width="1"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy=".3em">
        {width}x{height}
    </text>
</svg>'''
            return svg_content, 200, {'Content-Type': 'image/svg+xml'}
        except Exception as e:
            return f"Error generating placeholder: {str(e)}", 500
    
    return app
