# Flask Application Factory
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config
import redis
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["10000 per day", "5000 per hour"]
)

# Initialize WebSocket
from .websocket import socketio

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
    # limiter.init_app(app)  # Temporarily disabled for testing
    
    # Configure CORS
    CORS(app, 
         origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'https://yourdomain.com'],
         supports_credentials=True,
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
         expose_headers=['Content-Range', 'X-Content-Range'])
    
    # Initialize Redis
    app.redis = redis.from_url(app.config['REDIS_URL'])
    app.redis_client = app.redis  # Alias for compatibility
    
    # Initialize WebSocket
    socketio.init_app(app, cors_allowed_origins="*")
    
    # Register blueprints
    from app.api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    from app.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    
    from app.admin import admin as admin_blueprint
    app.register_blueprint(admin_blueprint, url_prefix='/admin')
    
    from app.interceptor import interceptor as interceptor_blueprint
    app.register_blueprint(interceptor_blueprint, url_prefix='/interceptor')
    
    from app.billing import billing as billing_blueprint
    app.register_blueprint(billing_blueprint, url_prefix='/billing')
    
    # Register traffic interception blueprint
    from app.api.traffic_interception import traffic_interception_bp
    app.register_blueprint(traffic_interception_bp)
    
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
    
    return app
