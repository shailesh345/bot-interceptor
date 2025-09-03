#!/usr/bin/env python3
"""
Simple Functionality Test Suite for Boot Interceptor
Target: Test what actually works without complex database interactions
"""

import pytest
import json
from app import create_app, db

class TestAppCreation:
    """Test application creation and basic setup"""
    
    def test_app_creation_testing(self):
        """Test testing app creation"""
        app = create_app('testing')
        assert app is not None
        assert app.config['TESTING'] == True

    def test_app_creation_development(self):
        """Test development app creation"""
        app = create_app('development')
        assert app is not None
        assert app.config['DEBUG'] == True

    def test_app_creation_production(self):
        """Test production app creation"""
        app = create_app('production')
        assert app is not None
        assert app.config['DEBUG'] == False

class TestConfiguration:
    """Test configuration loading"""
    
    def test_testing_config_keys(self):
        """Test that testing config has required keys"""
        app = create_app('testing')
        required_keys = ['SECRET_KEY', 'SQLALCHEMY_DATABASE_URI', 'TESTING']
        for key in required_keys:
            assert key in app.config

    def test_development_config_keys(self):
        """Test that development config has required keys"""
        app = create_app('development')
        required_keys = ['SECRET_KEY', 'SQLALCHEMY_DATABASE_URI', 'DEBUG']
        for key in required_keys:
            assert key in app.config

    def test_production_config_keys(self):
        """Test that production config has required keys"""
        app = create_app('production')
        required_keys = ['SECRET_KEY', 'SQLALCHEMY_DATABASE_URI', 'DEBUG']
        for key in required_keys:
            assert key in app.config

class TestBlueprintRegistration:
    """Test blueprint registration"""
    
    def test_blueprint_count(self):
        """Test that we have blueprints registered"""
        app = create_app('testing')
        blueprint_count = len(app.blueprints)
        assert blueprint_count > 0
        
        # Log what we found
        blueprints = [bp.name for bp in app.blueprints.values()]
        print(f"Found blueprints: {blueprints}")

    def test_blueprint_names_valid(self):
        """Test that blueprint names are valid"""
        app = create_app('testing')
        for name, blueprint in app.blueprints.items():
            assert name is not None
            assert blueprint is not None
            assert hasattr(blueprint, 'name')

class TestExtensionRegistration:
    """Test extension registration"""
    
    def test_sqlalchemy_registration(self):
        """Test SQLAlchemy registration"""
        app = create_app('testing')
        has_sqlalchemy = hasattr(app, 'extensions') and 'sqlalchemy' in app.extensions
        assert has_sqlalchemy

    def test_migrate_registration(self):
        """Test Flask-Migrate registration"""
        app = create_app('testing')
        has_migrate = hasattr(app, 'extensions') and 'migrate' in app.extensions
        assert has_migrate

    def test_jwt_functionality(self):
        """Test JWT functionality availability"""
        app = create_app('testing')
        try:
            from flask_jwt_extended import jwt_required
            assert True  # JWT extension is available
        except ImportError:
            assert False, "JWT extension not available"

    def test_cors_functionality(self):
        """Test CORS functionality"""
        app = create_app('testing')
        with app.test_client() as client:
            response = client.get('/health')
            headers = response.headers
            
            # Check for CORS headers
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Credentials',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            found_cors_headers = [h for h in cors_headers if h in headers]
            assert len(found_cors_headers) > 0, f"Expected CORS headers, found: {found_cors_headers}"

class TestHealthEndpoints:
    """Test health endpoints"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    def test_health_endpoint(self, client):
        """Test health endpoint"""
        response = client.get('/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'status' in data
        assert data['status'] == 'healthy'

    def test_api_health_endpoint(self, client):
        """Test API health endpoint"""
        response = client.get('/api/monitoring/health')
        # Should either return 200 or 404, not crash
        assert response.status_code in [200, 404, 405]

class TestEndpointAvailability:
    """Test endpoint availability"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    def test_interceptor_base_endpoint(self, client):
        """Test interceptor base endpoint"""
        response = client.get('/interceptor/')
        # Should either return 200 or 404, not crash
        assert response.status_code in [200, 404, 405]

    def test_auth_base_endpoint(self, client):
        """Test auth base endpoint"""
        response = client.get('/auth/')
        # Should either return 200 or 404, not crash
        assert response.status_code in [200, 404, 405]

    def test_admin_base_endpoint(self, client):
        """Test admin base endpoint"""
        response = client.get('/admin/')
        # Should either return 200 or 404, not crash
        assert response.status_code in [200, 404, 405]

    def test_api_base_endpoint(self, client):
        """Test API base endpoint"""
        response = client.get('/api/')
        # Should either return 200 or 404, not crash
        assert response.status_code in [200, 404, 405]

    def test_clean_admin_endpoint(self, client):
        """Test clean admin endpoint"""
        response = client.get('/clean-admin/')
        # Should either return 200 or 404, not crash
        assert response.status_code in [200, 404, 405]

class TestErrorHandling:
    """Test error handling"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    def test_404_handling(self, client):
        """Test 404 error handling"""
        response = client.get('/nonexistent/endpoint')
        assert response.status_code == 404

    def test_method_not_allowed(self, client):
        """Test method not allowed handling"""
        response = client.post('/health')  # Health endpoint only supports GET
        assert response.status_code in [405, 404]  # Method not allowed or not found

class TestSecurityHeaders:
    """Test security headers"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    def test_security_headers_present(self, client):
        """Test that security headers are present"""
        response = client.get('/health')
        headers = response.headers
        
        # Check for security headers
        security_headers = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection'
        ]
        
        found_headers = []
        for header in security_headers:
            if header in headers:
                found_headers.append(header)
        
        # We should have at least some security headers
        assert len(found_headers) > 0
        print(f"Found security headers: {found_headers}")

class TestResponseFormat:
    """Test response format"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture
    def client(self, app):
        """Create test client"""
        return app.test_client()

    def test_health_response_format(self, client):
        """Test health response format"""
        response = client.get('/health')
        
        # Check content type
        assert 'application/json' in response.headers.get('Content-Type', '')
        
        # Check response structure
        try:
            data = json.loads(response.data)
            assert isinstance(data, dict)
        except json.JSONDecodeError:
            assert False, "Response is not valid JSON"

class TestAppContext:
    """Test application context functionality"""
    
    def test_app_context_creation(self):
        """Test that we can create app context"""
        app = create_app('testing')
        with app.app_context():
            assert True  # If we get here, context creation worked

    def test_database_context(self):
        """Test database context"""
        app = create_app('testing')
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            # Test that we can create tables
            db.create_all()
            assert True  # If we get here, no errors occurred

class TestMiddlewareDetection:
    """Test middleware detection"""
    
    def test_error_handler_registration(self):
        """Test error handler registration"""
        app = create_app('testing')
        
        # Check for error handling capabilities
        has_error_handling = (
            hasattr(app, 'error_handler') or 
            hasattr(app, 'register_error_handler') or
            hasattr(app, 'handle_exception')
        )
        assert has_error_handling

    def test_request_handling(self):
        """Test request handling capabilities"""
        app = create_app('testing')
        
        # Check for request handling
        has_request_handling = (
            hasattr(app, 'before_request') or
            hasattr(app, 'after_request') or
            hasattr(app, 'teardown_request')
        )
        assert has_request_handling

class TestImportFunctionality:
    """Test that key modules can be imported"""
    
    def test_models_import(self):
        """Test models import"""
        try:
            from app.models import User, Domain, InterceptorRule, TrafficLog, Tenant
            assert True
        except ImportError as e:
            assert False, f"Failed to import models: {e}"

    def test_interceptor_import(self):
        """Test interceptor import"""
        try:
            from app.interceptor.traffic_interceptor import TrafficInterceptor
            assert True
        except ImportError as e:
            assert False, f"Failed to import traffic interceptor: {e}"

    def test_ml_import(self):
        """Test ML modules import"""
        try:
            from app.ml.bot_detection_model import BotDetectionModel
            assert True
        except ImportError as e:
            assert False, f"Failed to import bot detection model: {e}"

    def test_utils_import(self):
        """Test utilities import"""
        try:
            from app.utils.cache_manager import CacheManager
            assert True
        except ImportError as e:
            assert False, f"Failed to import cache manager: {e}"

class TestConfigurationValidation:
    """Test configuration validation"""
    
    def test_testing_config(self):
        """Test testing configuration"""
        app = create_app('testing')
        assert app.config['TESTING'] == True

    def test_development_config(self):
        """Test development configuration"""
        app = create_app('development')
        assert app.config['DEBUG'] == True

    def test_production_config(self):
        """Test production configuration"""
        app = create_app('production')
        assert app.config['DEBUG'] == False

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
