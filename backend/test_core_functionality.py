#!/usr/bin/env python3
"""
Core Functionality Test Suite for Boot Interceptor
Target: Test core models, database operations, and basic API functionality
"""

import pytest
import json
from datetime import datetime, timedelta
from app import create_app, db
from app.models import User, Domain, InterceptorRule, TrafficLog, Tenant

class TestCoreModels:
    """Test core model functionality"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture(scope="class")
    def client(self, app):
        """Create test client"""
        return app.test_client()
    
    @pytest.fixture(scope="class")
    def sample_tenant(self, app):
        """Create sample tenant"""
        with app.app_context():
            db.create_all()
            tenant = Tenant(
                name='Test Tenant',
                slug='test-tenant',
                status='active'
            )
            db.session.add(tenant)
            db.session.commit()
            return tenant
    
    @pytest.fixture(scope="class")
    def sample_user(self, app, sample_tenant):
        """Create sample user"""
        with app.app_context():
            user = User(
                username='testuser',
                email='test@example.com',
                password_hash='hashed_password',
                role='user',
                tenant_id=sample_tenant.id
            )
            db.session.add(user)
            db.session.commit()
            return user
    
    @pytest.fixture(scope="class")
    def sample_domain(self, app, sample_tenant):
        """Create sample domain"""
        with app.app_context():
            domain = Domain(
                domain_name='test.com',
                status='active',
                tenant_id=sample_tenant.id
            )
            db.session.add(domain)
            db.session.commit()
            return domain
    
    @pytest.fixture(scope="class")
    def sample_rule(self, app, sample_domain):
        """Create sample interceptor rule"""
        with app.app_context():
            rule = InterceptorRule(
                name='Test Rule',
                rule_type='block',
                pattern='test-pattern',
                action='block',
                domain_id=sample_domain.id,
                priority=1,
                status='active'
            )
            db.session.add(rule)
            db.session.commit()
            return rule
    
    @pytest.fixture(scope="class")
    def sample_traffic_log(self, app, sample_domain):
        """Create sample traffic log"""
        with app.app_context():
            log = TrafficLog(
                client_ip='192.168.1.1',
                user_agent='test_bot',
                request_method='GET',
                request_path='/api/test',
                response_status=200,
                domain_id=sample_domain.id,
                timestamp=datetime.utcnow()
            )
            db.session.add(log)
            db.session.commit()
            return log

    def test_tenant_creation(self, sample_tenant):
        """Test tenant creation and properties"""
        assert sample_tenant.id is not None
        assert sample_tenant.name == 'Test Tenant'
        assert sample_tenant.slug == 'test-tenant'
        assert sample_tenant.status == 'active'

    def test_user_creation(self, sample_user, sample_tenant):
        """Test user creation and properties"""
        assert sample_user.id is not None
        assert sample_user.username == 'testuser'
        assert sample_user.email == 'test@example.com'
        assert sample_user.role == 'user'
        assert sample_user.tenant_id == sample_tenant.id

    def test_domain_creation(self, sample_domain, sample_tenant):
        """Test domain creation and properties"""
        assert sample_domain.id is not None
        assert sample_domain.domain_name == 'test.com'
        assert sample_domain.status == 'active'
        assert sample_domain.tenant_id == sample_tenant.id

    def test_rule_creation(self, sample_rule, sample_domain):
        """Test interceptor rule creation and properties"""
        assert sample_rule.id is not None
        assert sample_rule.name == 'Test Rule'
        assert sample_rule.rule_type == 'block'
        assert sample_rule.pattern == 'test-pattern'
        assert sample_rule.action == 'block'
        assert sample_rule.domain_id == sample_domain.id
        assert sample_rule.priority == 1
        assert sample_rule.status == 'active'

    def test_traffic_log_creation(self, sample_traffic_log, sample_domain):
        """Test traffic log creation and properties"""
        assert sample_traffic_log.id is not None
        assert sample_traffic_log.client_ip == '192.168.1.1'
        assert sample_traffic_log.user_agent == 'test_bot'
        assert sample_traffic_log.request_method == 'GET'
        assert sample_traffic_log.request_path == '/api/test'
        assert sample_traffic_log.response_status == 200
        assert sample_traffic_log.domain_id == sample_domain.id

    def test_model_relationships(self, sample_tenant, sample_user, sample_domain, sample_rule, sample_traffic_log):
        """Test model relationships"""
        # Test tenant -> user relationship
        assert sample_user.tenant_id == sample_tenant.id
        
        # Test tenant -> domain relationship
        assert sample_domain.tenant_id == sample_tenant.id
        
        # Test domain -> rule relationship
        assert sample_rule.domain_id == sample_domain.id
        
        # Test domain -> traffic log relationship
        assert sample_traffic_log.domain_id == sample_domain.id

class TestDatabaseOperations:
    """Test database operations"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    def test_database_creation(self, app):
        """Test database creation"""
        with app.app_context():
            db.create_all()
            assert True  # If we get here, no errors occurred

    def test_database_cleanup(self, app):
        """Test database cleanup"""
        with app.app_context():
            db.drop_all()
            assert True  # If we get here, no errors occurred

    def test_transaction_rollback(self, app):
        """Test transaction rollback"""
        with app.app_context():
            db.create_all()
            
            # Create a tenant
            tenant = Tenant(name='Rollback Test', slug='rollback-test', status='active')
            db.session.add(tenant)
            db.session.commit()
            tenant_id = tenant.id
            
            # Verify it was created
            assert Tenant.query.get(tenant_id) is not None
            
            # Test rollback
            db.session.rollback()
            
            # Verify rollback worked
            assert Tenant.query.get(tenant_id) is None

class TestBasicAPIEndpoints:
    """Test basic API endpoints"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture(scope="class")
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

class TestModelValidation:
    """Test model validation"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app

    def test_user_validation(self, app):
        """Test user model validation"""
        with app.app_context():
            db.create_all()
            
            # Test valid user creation
            user = User(
                username='validuser',
                email='valid@example.com',
                password_hash='hashed_password',
                role='user'
            )
            db.session.add(user)
            db.session.commit()
            assert user.id is not None

    def test_domain_validation(self, app):
        """Test domain model validation"""
        with app.app_context():
            db.create_all()
            
            # Test valid domain creation
            domain = Domain(
                domain_name='valid-domain.com',
                status='active'
            )
            db.session.add(domain)
            db.session.commit()
            assert domain.id is not None

    def test_rule_validation(self, app):
        """Test rule model validation"""
        with app.app_context():
            db.create_all()
            
            # Test valid rule creation
            rule = InterceptorRule(
                name='Valid Rule',
                rule_type='block',
                pattern='valid-pattern',
                action='block',
                priority=1,
                status='active'
            )
            db.session.add(rule)
            db.session.commit()
            assert rule.id is not None

class TestErrorHandling:
    """Test error handling"""
    
    @pytest.fixture(scope="class")
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app
    
    @pytest.fixture(scope="class")
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

class TestConfiguration:
    """Test configuration"""
    
    def test_testing_config(self):
        """Test testing configuration"""
        app = create_app('testing')
        assert app.config['TESTING'] == True
        assert 'SQLALCHEMY_DATABASE_URI' in app.config
        assert 'SECRET_KEY' in app.config

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
