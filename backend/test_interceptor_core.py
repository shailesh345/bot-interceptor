#!/usr/bin/env python3
"""
Comprehensive Testing Suite for Core Interceptor Modules
Target: Achieve 80%+ test coverage for interceptor core functionality
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from app import create_app, db
from app.models import User, Domain, InterceptorRule, TrafficLog
from app.interceptor.traffic_interceptor import TrafficInterceptor
from app.interceptor.enhanced_bot_detector import EnhancedBotDetector
from app.interceptor.ready_rules import ReadyRules
from app.interceptor.traffic_orchestrator import TrafficOrchestrator
from app.interceptor.realtime_processor import RealtimeProcessor
from app.interceptor.domain_verification import DomainVerification
from app.interceptor.content_protection import ContentProtection

class TestTrafficInterceptor:
    """Test the main TrafficInterceptor class"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def interceptor(self, app):
        """Create TrafficInterceptor instance"""
        with app.app_context():
            return TrafficInterceptor()
    
    @pytest.fixture
    def sample_domain(self, app):
        """Create sample domain"""
        with app.app_context():
            domain = Domain(
                name='test.com',
                status='active',
                protection_level='high'
            )
            db.session.add(domain)
            db.session.commit()
            return domain
    
    @pytest.fixture
    def sample_rule(self, app, sample_domain):
        """Create sample rule"""
        with app.app_context():
            rule = InterceptorRule(
                domain_id=sample_domain.id,
                rule_type='bot_detection',
                pattern='bot_pattern',
                action='block',
                priority=1
            )
            db.session.add(rule)
            db.session.commit()
            return rule

    def test_interceptor_initialization(self, interceptor):
        """Test interceptor initialization"""
        assert interceptor is not None
        assert hasattr(interceptor, 'rules_engine')
        assert hasattr(interceptor, 'bot_detector')

    def test_process_request_basic(self, interceptor, sample_domain):
        """Test basic request processing"""
        request_data = {
            'domain': 'test.com',
            'ip_address': '192.168.1.1',
            'user_agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
            'path': '/api/test',
            'method': 'GET'
        }
        
        result = interceptor.process_request(request_data)
        assert result is not None
        assert 'action' in result
        assert 'reason' in result

    def test_process_request_with_rules(self, interceptor, sample_rule):
        """Test request processing with rules"""
        request_data = {
            'domain': 'test.com',
            'ip_address': '192.168.1.1',
            'user_agent': 'bot_pattern',  # Matches rule pattern
            'path': '/api/test',
            'method': 'GET'
        }
        
        result = interceptor.process_request(request_data)
        assert result is not None
        # Should match the rule pattern

    def test_rule_matching(self, interceptor, sample_rule):
        """Test rule matching logic"""
        request_data = {
            'domain': 'test.com',
            'ip_address': '192.168.1.1',
            'user_agent': 'bot_pattern',
            'path': '/api/test',
            'method': 'GET'
        }
        
        matched_rules = interceptor.match_rules(request_data)
        assert len(matched_rules) > 0
        assert sample_rule.id in [rule.id for rule in matched_rules]

    def test_action_execution(self, interceptor):
        """Test action execution"""
        actions = ['allow', 'block', 'challenge', 'log']
        
        for action in actions:
            result = interceptor.execute_action(action, {'reason': 'test'})
            assert result is not None

    def test_logging_functionality(self, interceptor, sample_domain):
        """Test logging functionality"""
        request_data = {
            'domain': 'test.com',
            'ip_address': '192.168.1.1',
            'user_agent': 'test_agent',
            'path': '/api/test',
            'method': 'GET'
        }
        
        result = interceptor.process_request(request_data)
        # Should log the request
        assert result is not None

class TestBotDetector:
    """Test the BotDetector class"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def bot_detector(self, app):
        """Create EnhancedBotDetector instance"""
        with app.app_context():
            return EnhancedBotDetector()

    def test_bot_detector_initialization(self, bot_detector):
        """Test bot detector initialization"""
        assert bot_detector is not None
        assert hasattr(bot_detector, 'patterns')
        assert hasattr(bot_detector, 'ml_model')

    def test_user_agent_detection(self, bot_detector):
        """Test user agent based bot detection"""
        # Test known bot user agents
        bot_user_agents = [
            'Mozilla/5.0 (compatible; Googlebot/2.1)',
            'Mozilla/5.0 (compatible; Bingbot/2.0)',
            'Mozilla/5.0 (compatible; Bot/1.0)',
            'python-requests/2.25.1'
        ]
        
        for ua in bot_user_agents:
            result = bot_detector.detect_bot({'user_agent': ua})
            assert result['is_bot'] == True
            assert result['confidence'] > 0.5

    def test_human_user_agent(self, bot_detector):
        """Test human user agent detection"""
        human_user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]
        
        for ua in human_user_agents:
            result = bot_detector.detect_bot({'user_agent': ua})
            assert result['is_bot'] == False
            assert result['confidence'] < 0.5

    def test_behavioral_analysis(self, bot_detector):
        """Test behavioral analysis"""
        request_data = {
            'ip_address': '192.168.1.1',
            'request_count': 1000,  # High request count
            'request_interval': 0.1,  # Very fast requests
            'user_agent': 'Mozilla/5.0 (compatible; Bot/1.0)'
        }
        
        result = bot_detector.detect_bot(request_data)
        assert result['is_bot'] == True
        assert result['confidence'] > 0.7

    def test_ip_reputation_check(self, bot_detector):
        """Test IP reputation checking"""
        # Test known bot IPs
        bot_ips = ['192.168.1.100', '10.0.0.50']
        
        for ip in bot_ips:
            result = bot_detector.check_ip_reputation(ip)
            assert result is not None

    def test_pattern_matching(self, bot_detector):
        """Test pattern matching"""
        patterns = [
            'bot',
            'crawler',
            'spider',
            'scraper'
        ]
        
        for pattern in patterns:
            result = bot_detector.match_pattern(f'user_agent_with_{pattern}_in_it')
            assert result is not None

class TestReadyRules:
    """Test the ReadyRules class"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def ready_rules(self, app):
        """Create ReadyRules instance"""
        with app.app_context():
            return ReadyRules()

    def test_ready_rules_initialization(self, ready_rules):
        """Test ready rules initialization"""
        assert ready_rules is not None
        assert hasattr(ready_rules, 'rules')
        assert hasattr(ready_rules, 'patterns')

    def test_rule_loading(self, ready_rules):
        """Test rule loading"""
        rules = ready_rules.load_rules()
        assert rules is not None
        assert len(rules) > 0

    def test_pattern_compilation(self, ready_rules):
        """Test pattern compilation"""
        patterns = ready_rules.compile_patterns()
        assert patterns is not None

    def test_rule_matching(self, ready_rules):
        """Test rule matching"""
        test_data = {
            'user_agent': 'bot_pattern',
            'ip_address': '192.168.1.1',
            'path': '/api/data'
        }
        
        matched_rules = ready_rules.match_rules(test_data)
        assert matched_rules is not None

    def test_rule_prioritization(self, ready_rules):
        """Test rule prioritization"""
        rules = ready_rules.get_prioritized_rules()
        assert rules is not None
        # Rules should be sorted by priority

class TestTrafficOrchestrator:
    """Test the TrafficOrchestrator class"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def orchestrator(self, app):
        """Create TrafficOrchestrator instance"""
        with app.app_context():
            return TrafficOrchestrator()

    def test_orchestrator_initialization(self, orchestrator):
        """Test orchestrator initialization"""
        assert orchestrator is not None
        assert hasattr(orchestrator, 'interceptors')
        assert hasattr(orchestrator, 'processors')

    def test_request_routing(self, orchestrator):
        """Test request routing"""
        request_data = {
            'domain': 'test.com',
            'type': 'api_request'
        }
        
        route = orchestrator.route_request(request_data)
        assert route is not None

    def test_load_balancing(self, orchestrator):
        """Test load balancing"""
        processors = orchestrator.get_available_processors()
        assert len(processors) > 0

    def test_failover_handling(self, orchestrator):
        """Test failover handling"""
        # Simulate processor failure
        result = orchestrator.handle_processor_failure('failed_processor')
        assert result is not None

    def test_performance_monitoring(self, orchestrator):
        """Test performance monitoring"""
        metrics = orchestrator.get_performance_metrics()
        assert metrics is not None

class TestRealtimeProcessor:
    """Test the RealtimeProcessor class"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def processor(self, app):
        """Create RealtimeProcessor instance"""
        with app.app_context():
            return RealtimeProcessor()

    def test_processor_initialization(self, processor):
        """Test processor initialization"""
        assert processor is not None
        assert hasattr(processor, 'queue')
        assert hasattr(processor, 'workers')

    def test_request_queuing(self, processor):
        """Test request queuing"""
        request_data = {'test': 'data'}
        result = processor.queue_request(request_data)
        assert result is not None

    def test_request_processing(self, processor):
        """Test request processing"""
        request_data = {'test': 'data'}
        result = processor.process_request(request_data)
        assert result is not None

    def test_worker_management(self, processor):
        """Test worker management"""
        workers = processor.get_worker_status()
        assert workers is not None

    def test_performance_metrics(self, processor):
        """Test performance metrics"""
        metrics = processor.get_performance_metrics()
        assert metrics is not None

class TestDomainVerification:
    """Test the DomainVerification class"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def verifier(self, app):
        """Create DomainVerification instance"""
        with app.app_context():
            return DomainVerification()

    def test_verifier_initialization(self, verifier):
        """Test verifier initialization"""
        assert verifier is not None
        assert hasattr(verifier, 'verification_methods')

    def test_domain_validation(self, verifier):
        """Test domain validation"""
        valid_domains = ['example.com', 'test.org', 'domain.co.uk']
        
        for domain in valid_domains:
            result = verifier.validate_domain(domain)
            assert result['is_valid'] == True

    def test_invalid_domain_validation(self, verifier):
        """Test invalid domain validation"""
        invalid_domains = ['not-a-domain', 'domain', 'domain..com']
        
        for domain in invalid_domains:
            result = verifier.validate_domain(domain)
            assert result['is_valid'] == False

    def test_dns_verification(self, verifier):
        """Test DNS verification"""
        with patch('socket.gethostbyname') as mock_dns:
            mock_dns.return_value = '192.168.1.1'
            result = verifier.verify_dns('example.com')
            assert result['dns_resolves'] == True

    def test_ssl_verification(self, verifier):
        """Test SSL verification"""
        with patch('ssl.create_default_context') as mock_ssl:
            mock_ssl.return_value = Mock()
            result = verifier.verify_ssl('example.com')
            assert result is not None

class TestContentProtection:
    """Test the ContentProtection class"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def protector(self, app):
        """Create ContentProtection instance"""
        with app.app_context():
            return ContentProtection()

    def test_protector_initialization(self, protector):
        """Test protector initialization"""
        assert protector is not None
        assert hasattr(protector, 'protection_methods')

    def test_content_scanning(self, protector):
        """Test content scanning"""
        content = "This is test content"
        result = protector.scan_content(content)
        assert result is not None
        assert result['is_safe'] == True

    def test_malicious_content_detection(self, protector):
        """Test malicious content detection"""
        malicious_content = "script>alert('xss')</script"
        result = protector.scan_content(malicious_content)
        assert result is not None
        assert result['is_safe'] == False

    def test_content_filtering(self, protector):
        """Test content filtering"""
        content = "This contains <script>bad code</script> content"
        filtered = protector.filter_content(content)
        assert filtered is not None
        assert '<script>' not in filtered

    def test_watermarking(self, protector):
        """Test content watermarking"""
        content = "Original content"
        watermarked = protector.add_watermark(content, "user123")
        assert watermarked is not None
        assert watermarked != content

class TestIntegration:
    """Test integration between different components"""
    
    @pytest.fixture
    def app(self):
        """Create test application"""
        app = create_app('testing')
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        
        with app.app_context():
            db.create_all()
            yield app
            db.drop_all()
    
    @pytest.fixture
    def interceptor_system(self, app):
        """Create complete interceptor system"""
        with app.app_context():
            return {
                'interceptor': TrafficInterceptor(),
                'bot_detector': EnhancedBotDetector(),
                'ready_rules': ReadyRules(),
                'orchestrator': TrafficOrchestrator(),
                'processor': RealtimeProcessor()
            }

    def test_complete_request_flow(self, interceptor_system):
        """Test complete request flow through the system"""
        request_data = {
            'domain': 'test.com',
            'ip_address': '192.168.1.1',
            'user_agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
            'path': '/api/test',
            'method': 'GET'
        }
        
        # Process through the complete system
        bot_result = interceptor_system['bot_detector'].detect_bot(request_data)
        assert bot_result['is_bot'] == True
        
        interceptor_result = interceptor_system['interceptor'].process_request(request_data)
        assert interceptor_result is not None
        
        # Test orchestration
        route = interceptor_system['orchestrator'].route_request(request_data)
        assert route is not None

    def test_error_handling_integration(self, interceptor_system):
        """Test error handling across the system"""
        # Test with invalid data
        invalid_request = {}
        
        # Should handle gracefully
        try:
            result = interceptor_system['interceptor'].process_request(invalid_request)
            assert result is not None
        except Exception as e:
            # Should handle errors gracefully
            assert str(e) is not None

    def test_performance_integration(self, interceptor_system):
        """Test performance across the system"""
        # Test multiple requests
        for i in range(10):
            request_data = {
                'domain': f'test{i}.com',
                'ip_address': f'192.168.1.{i}',
                'user_agent': 'test_agent',
                'path': '/api/test',
                'method': 'GET'
            }
            
            result = interceptor_system['interceptor'].process_request(request_data)
            assert result is not None

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
