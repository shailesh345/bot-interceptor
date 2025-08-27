"""
Advanced Error Handling Middleware
Provides comprehensive error handling, logging, and recovery mechanisms
"""

from flask import jsonify, request, current_app
from datetime import datetime
import traceback
import logging
import json
from functools import wraps

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Custom API Exception class"""
    
    def __init__(self, message, status_code=500, payload=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload

class ErrorHandler:
    """Advanced error handling system"""
    
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize error handlers with Flask app"""
        
        # Register error handlers
        app.errorhandler(400)(self.handle_bad_request)
        app.errorhandler(401)(self.handle_unauthorized)
        app.errorhandler(403)(self.handle_forbidden)
        app.errorhandler(404)(self.handle_not_found)
        app.errorhandler(405)(self.handle_method_not_allowed)
        app.errorhandler(429)(self.handle_rate_limit)
        app.errorhandler(500)(self.handle_internal_error)
        app.errorhandler(503)(self.handle_service_unavailable)
        app.errorhandler(APIError)(self.handle_api_error)
        
        # Register request/response handlers
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        
        # Register exception handler
        app.teardown_appcontext(self.handle_exception)
    
    def before_request(self):
        """Execute before each request"""
        # Log request details
        request_data = {
            'method': request.method,
            'url': request.url,
            'ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent'),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Add to request context for later use
        request.start_time = datetime.utcnow()
        request.request_id = self.generate_request_id()
        
        logger.info(f"Request {request.request_id}: {json.dumps(request_data)}")
    
    def after_request(self, response):
        """Execute after each request"""
        if hasattr(request, 'start_time'):
            duration = (datetime.utcnow() - request.start_time).total_seconds()
            
            response_data = {
                'request_id': getattr(request, 'request_id', 'unknown'),
                'status_code': response.status_code,
                'duration_ms': round(duration * 1000, 2),
                'content_length': response.content_length
            }
            
            logger.info(f"Response {request.request_id}: {json.dumps(response_data)}")
        
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response
    
    def handle_exception(self, exception):
        """Handle uncaught exceptions"""
        if exception:
            logger.error(f"Uncaught exception: {str(exception)}")
            logger.error(traceback.format_exc())
    
    def handle_bad_request(self, error):
        """Handle 400 Bad Request errors"""
        return self.create_error_response(
            message="Bad request. Please check your input.",
            status_code=400,
            error_type="BAD_REQUEST",
            details=str(error)
        )
    
    def handle_unauthorized(self, error):
        """Handle 401 Unauthorized errors"""
        return self.create_error_response(
            message="Authentication required. Please provide valid credentials.",
            status_code=401,
            error_type="UNAUTHORIZED",
            details="Token missing or invalid"
        )
    
    def handle_forbidden(self, error):
        """Handle 403 Forbidden errors"""
        return self.create_error_response(
            message="Access forbidden. Insufficient permissions.",
            status_code=403,
            error_type="FORBIDDEN",
            details=str(error)
        )
    
    def handle_not_found(self, error):
        """Handle 404 Not Found errors"""
        return self.create_error_response(
            message="The requested resource was not found.",
            status_code=404,
            error_type="NOT_FOUND",
            details=f"Path: {request.path}"
        )
    
    def handle_method_not_allowed(self, error):
        """Handle 405 Method Not Allowed errors"""
        return self.create_error_response(
            message="HTTP method not allowed for this endpoint.",
            status_code=405,
            error_type="METHOD_NOT_ALLOWED",
            details=f"Method: {request.method}, Path: {request.path}"
        )
    
    def handle_rate_limit(self, error):
        """Handle 429 Rate Limit errors"""
        return self.create_error_response(
            message="Rate limit exceeded. Please try again later.",
            status_code=429,
            error_type="RATE_LIMIT_EXCEEDED",
            details="Too many requests in a short period"
        )
    
    def handle_internal_error(self, error):
        """Handle 500 Internal Server errors"""
        logger.error(f"Internal server error: {str(error)}")
        logger.error(traceback.format_exc())
        
        return self.create_error_response(
            message="An internal server error occurred. Please try again later.",
            status_code=500,
            error_type="INTERNAL_SERVER_ERROR",
            details="The error has been logged and will be investigated"
        )
    
    def handle_service_unavailable(self, error):
        """Handle 503 Service Unavailable errors"""
        return self.create_error_response(
            message="Service temporarily unavailable. Please try again later.",
            status_code=503,
            error_type="SERVICE_UNAVAILABLE",
            details=str(error)
        )
    
    def handle_api_error(self, error):
        """Handle custom API errors"""
        return self.create_error_response(
            message=error.message,
            status_code=error.status_code,
            error_type="API_ERROR",
            details=error.payload
        )
    
    def create_error_response(self, message, status_code, error_type, details=None):
        """Create standardized error response"""
        error_response = {
            'success': False,
            'error': {
                'type': error_type,
                'message': message,
                'status_code': status_code,
                'timestamp': datetime.utcnow().isoformat(),
                'request_id': getattr(request, 'request_id', 'unknown')
            }
        }
        
        if details:
            error_response['error']['details'] = details
        
        if current_app.debug:
            error_response['error']['path'] = request.path
            error_response['error']['method'] = request.method
        
        return jsonify(error_response), status_code
    
    def generate_request_id(self):
        """Generate unique request ID"""
        import uuid
        return str(uuid.uuid4())[:8]

def api_error_handler(f):
    """Decorator for handling API endpoint errors"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except APIError:
            raise  # Re-raise API errors to be handled by error handler
        except Exception as e:
            logger.error(f"Unexpected error in {f.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            raise APIError(
                message="An unexpected error occurred",
                status_code=500,
                payload={'function': f.__name__, 'error': str(e)}
            )
    
    return decorated_function

def validate_json(required_fields=None):
    """Decorator for JSON validation"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                raise APIError("Content-Type must be application/json", 400)
            
            data = request.get_json()
            if not data:
                raise APIError("Request body must contain valid JSON", 400)
            
            if required_fields:
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    raise APIError(
                        f"Missing required fields: {', '.join(missing_fields)}",
                        400,
                        {'missing_fields': missing_fields}
                    )
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

# Initialize error handler instance
error_handler = ErrorHandler()
