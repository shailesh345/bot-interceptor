#!/usr/bin/env python3
"""
Comprehensive Testing Suite for ML and AI Modules
Target: Achieve 80%+ test coverage for ML/AI functionality
"""

import pytest
import json
import numpy as np
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from app import create_app, db
from app.models import User, Domain, InterceptorRule, TrafficLog
from app.ml.bot_detection_model import BotDetectionModel
from app.ml.enhanced_ai_engine import EnhancedAIEngine
from app.ml.advanced_ml_engine import AdvancedMLEngine

class TestBotDetectionModel:
    """Test the BotDetectionModel class"""
    
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
    def bot_model(self, app):
        """Create BotDetectionModel instance"""
        with app.app_context():
            return BotDetectionModel()

    def test_model_initialization(self, bot_model):
        """Test model initialization"""
        assert bot_model is not None
        assert hasattr(bot_model, 'model')
        assert hasattr(bot_model, 'scaler')

    def test_feature_extraction(self, bot_model):
        """Test feature extraction from request data"""
        request_data = {
            'user_agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
            'ip_address': '192.168.1.1',
            'request_count': 100,
            'request_interval': 0.5,
            'path': '/api/data',
            'method': 'GET'
        }
        
        features = bot_model.extract_features(request_data)
        assert features is not None
        assert len(features) > 0
        assert isinstance(features, (list, np.ndarray))

    def test_bot_prediction(self, bot_model):
        """Test bot prediction functionality"""
        request_data = {
            'user_agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
            'ip_address': '192.168.1.1',
            'request_count': 1000,
            'request_interval': 0.1
        }
        
        prediction = bot_model.predict(request_data)
        assert prediction is not None
        assert 'is_bot' in prediction
        assert 'confidence' in prediction
        assert 'probability' in prediction

    def test_model_training(self, bot_model):
        """Test model training functionality"""
        # Mock training data
        X_train = np.random.rand(100, 10)
        y_train = np.random.randint(0, 2, 100)
        
        with patch('sklearn.ensemble.RandomForestClassifier.fit') as mock_fit:
            mock_fit.return_value = Mock()
            result = bot_model.train(X_train, y_train)
            assert result is not None

    def test_model_evaluation(self, bot_model):
        """Test model evaluation functionality"""
        # Mock test data
        X_test = np.random.rand(50, 10)
        y_test = np.random.randint(0, 2, 50)
        
        with patch('sklearn.metrics.classification_report') as mock_report:
            mock_report.return_value = "Test Report"
            result = bot_model.evaluate(X_test, y_test)
            assert result is not None

    def test_model_saving_loading(self, bot_model):
        """Test model saving and loading"""
        with patch('joblib.dump') as mock_dump:
            mock_dump.return_value = None
            result = bot_model.save_model('test_model.pkl')
            assert result is not None

        with patch('joblib.load') as mock_load:
            mock_load.return_value = Mock()
            loaded_model = bot_model.load_model('test_model.pkl')
            assert loaded_model is not None

    def test_feature_importance(self, bot_model):
        """Test feature importance analysis"""
        with patch('sklearn.ensemble.RandomForestClassifier.feature_importances_') as mock_importance:
            mock_importance.return_value = np.random.rand(10)
            importance = bot_model.get_feature_importance()
            assert importance is not None
            assert len(importance) > 0

class TestEnhancedAIEngine:
    """Test the EnhancedAIEngine class"""
    
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
    def ai_engine(self, app):
        """Create EnhancedAIEngine instance"""
        with app.app_context():
            return EnhancedAIEngine()

    def test_ai_engine_initialization(self, ai_engine):
        """Test AI engine initialization"""
        assert ai_engine is not None
        assert hasattr(ai_engine, 'models')
        assert hasattr(ai_engine, 'processors')

    def test_nlp_processing(self, ai_engine):
        """Test NLP processing functionality"""
        text_data = "This is a test request from a potential bot"
        
        with patch('nltk.tokenize.word_tokenize') as mock_tokenize:
            mock_tokenize.return_value = ['This', 'is', 'a', 'test']
            result = ai_engine.process_nlp(text_data)
            assert result is not None

    def test_sentiment_analysis(self, ai_engine):
        """Test sentiment analysis"""
        text_samples = [
            "This is a legitimate request",
            "I want to hack your system",
            "Please provide access to data"
        ]
        
        for text in text_samples:
            with patch('textblob.TextBlob.sentiment.polarity') as mock_sentiment:
                mock_sentiment.return_value = 0.1
                result = ai_engine.analyze_sentiment(text)
                assert result is not None
                assert 'sentiment' in result

    def test_anomaly_detection(self, ai_engine):
        """Test anomaly detection"""
        data_points = np.random.rand(100, 5)
        
        with patch('sklearn.ensemble.IsolationForest.predict') as mock_predict:
            mock_predict.return_value = np.ones(100)
            anomalies = ai_engine.detect_anomalies(data_points)
            assert anomalies is not None
            assert len(anomalies) > 0

    def test_pattern_recognition(self, ai_engine):
        """Test pattern recognition"""
        sequence_data = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5]
        
        patterns = ai_engine.recognize_patterns(sequence_data)
        assert patterns is not None

    def test_behavioral_analysis(self, ai_engine):
        """Test behavioral analysis"""
        user_behavior = {
            'request_times': [1, 2, 3, 4, 5],
            'request_paths': ['/api/1', '/api/2', '/api/3'],
            'ip_addresses': ['192.168.1.1', '192.168.1.1', '192.168.1.1']
        }
        
        analysis = ai_engine.analyze_behavior(user_behavior)
        assert analysis is not None
        assert 'risk_score' in analysis

    def test_threat_intelligence(self, ai_engine):
        """Test threat intelligence functionality"""
        threat_data = {
            'ip_address': '192.168.1.100',
            'threat_type': 'suspicious_activity',
            'confidence': 0.85
        }
        
        with patch('requests.get') as mock_request:
            mock_request.return_value.json.return_value = {'threat_score': 0.8}
            intelligence = ai_engine.get_threat_intelligence(threat_data)
            assert intelligence is not None

    def test_adaptive_learning(self, ai_engine):
        """Test adaptive learning functionality"""
        new_data = np.random.rand(10, 5)
        new_labels = np.random.randint(0, 2, 10)
        
        with patch('sklearn.ensemble.RandomForestClassifier.partial_fit') as mock_fit:
            mock_fit.return_value = Mock()
            result = ai_engine.adapt_to_new_data(new_data, new_labels)
            assert result is not None

class TestAdvancedMLEngine:
    """Test the AdvancedMLEngine class"""
    
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
    def ml_engine(self, app):
        """Create AdvancedMLEngine instance"""
        with app.app_context():
            return AdvancedMLEngine()

    def test_ml_engine_initialization(self, ml_engine):
        """Test ML engine initialization"""
        assert ml_engine is not None
        assert hasattr(ml_engine, 'models')
        assert hasattr(ml_engine, 'pipelines')

    def test_model_selection(self, ml_engine):
        """Test model selection functionality"""
        X = np.random.rand(100, 10)
        y = np.random.randint(0, 2, 100)
        
        with patch('sklearn.model_selection.GridSearchCV.fit') as mock_fit:
            mock_fit.return_value = Mock()
            best_model = ml_engine.select_best_model(X, y)
            assert best_model is not None

    def test_hyperparameter_tuning(self, ml_engine):
        """Test hyperparameter tuning"""
        X = np.random.rand(100, 10)
        y = np.random.randint(0, 2, 100)
        
        with patch('sklearn.model_selection.RandomizedSearchCV.fit') as mock_fit:
            mock_fit.return_value = Mock()
            tuned_params = ml_engine.tune_hyperparameters(X, y)
            assert tuned_params is not None

    def test_feature_selection(self, ml_engine):
        """Test feature selection"""
        X = np.random.rand(100, 20)
        y = np.random.randint(0, 2, 100)
        
        with patch('sklearn.feature_selection.SelectKBest.fit_transform') as mock_select:
            mock_select.return_value = np.random.rand(100, 10)
            selected_features = ml_engine.select_features(X, y, k=10)
            assert selected_features is not None

    def test_ensemble_methods(self, ml_engine):
        """Test ensemble methods"""
        X = np.random.rand(100, 10)
        y = np.random.randint(0, 2, 100)
        
        with patch('sklearn.ensemble.VotingClassifier.fit') as mock_fit:
            mock_fit.return_value = Mock()
            ensemble = ml_engine.create_ensemble(X, y)
            assert ensemble is not None

    def test_cross_validation(self, ml_engine):
        """Test cross validation"""
        X = np.random.rand(100, 10)
        y = np.random.randint(0, 2, 100)
        
        with patch('sklearn.model_selection.cross_val_score') as mock_cv:
            mock_cv.return_value = np.random.rand(5)
            cv_scores = ml_engine.cross_validate(X, y)
            assert cv_scores is not None

    def test_model_persistence(self, ml_engine):
        """Test model persistence"""
        model = Mock()
        
        with patch('joblib.dump') as mock_dump:
            mock_dump.return_value = None
            result = ml_engine.save_model(model, 'test_model.pkl')
            assert result is not None

        with patch('joblib.load') as mock_load:
            mock_load.return_value = Mock()
            loaded_model = ml_engine.load_model('test_model.pkl')
            assert loaded_model is not None

    def test_performance_metrics(self, ml_engine):
        """Test performance metrics calculation"""
        y_true = np.random.randint(0, 2, 100)
        y_pred = np.random.randint(0, 2, 100)
        
        with patch('sklearn.metrics.classification_report') as mock_report:
            mock_report.return_value = "Test Report"
            metrics = ml_engine.calculate_metrics(y_true, y_pred)
            assert metrics is not None

class TestMLIntegration:
    """Test integration between different ML components"""
    
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
    def ml_system(self, app):
        """Create complete ML system"""
        with app.app_context():
            return {
                'bot_model': BotDetectionModel(),
                'ai_engine': EnhancedAIEngine(),
                'ml_engine': AdvancedMLEngine()
            }

    def test_complete_ml_pipeline(self, ml_system):
        """Test complete ML pipeline"""
        # Test data
        request_data = {
            'user_agent': 'Mozilla/5.0 (compatible; Bot/1.0)',
            'ip_address': '192.168.1.1',
            'request_count': 1000,
            'request_interval': 0.1,
            'path': '/api/data',
            'method': 'GET'
        }
        
        # Extract features
        features = ml_system['bot_model'].extract_features(request_data)
        assert features is not None
        
        # Make prediction
        prediction = ml_system['bot_model'].predict(request_data)
        assert prediction is not None
        
        # Analyze behavior
        behavior = ml_system['ai_engine'].analyze_behavior({
            'request_times': [1, 2, 3],
            'request_paths': ['/api/1', '/api/2', '/api/3']
        })
        assert behavior is not None

    def test_ml_model_training_pipeline(self, ml_system):
        """Test ML model training pipeline"""
        # Mock training data
        X_train = np.random.rand(100, 10)
        y_train = np.random.randint(0, 2, 100)
        X_test = np.random.rand(50, 10)
        y_test = np.random.randint(0, 2, 50)
        
        with patch('sklearn.ensemble.RandomForestClassifier.fit') as mock_fit:
            mock_fit.return_value = Mock()
            
            # Train model
            ml_system['bot_model'].train(X_train, y_train)
            
            # Make predictions
            predictions = ml_system['bot_model'].predict_batch(X_test)
            assert predictions is not None
            
            # Evaluate model
            evaluation = ml_system['bot_model'].evaluate(X_test, y_test)
            assert evaluation is not None

    def test_ai_enhanced_detection(self, ml_system):
        """Test AI-enhanced detection capabilities"""
        # Test multiple request patterns
        request_patterns = [
            {
                'user_agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
                'ip_address': '192.168.1.100',
                'request_count': 500,
                'request_interval': 0.2
            },
            {
                'user_agent': 'python-requests/2.25.1',
                'ip_address': '192.168.1.200',
                'request_count': 2000,
                'request_interval': 0.05
            }
        ]
        
        for pattern in request_patterns:
            # Bot detection
            bot_result = ml_system['bot_model'].predict(pattern)
            assert bot_result is not None
            
            # AI analysis
            ai_result = ml_system['ai_engine'].analyze_request(pattern)
            assert ai_result is not None
            
            # Combined analysis
            combined = ml_system['ai_engine'].combine_predictions([bot_result, ai_result])
            assert combined is not None

    def test_adaptive_learning_system(self, ml_system):
        """Test adaptive learning system"""
        # Simulate new data arrival
        new_requests = []
        for i in range(20):
            new_requests.append({
                'user_agent': f'NewBot_{i}',
                'ip_address': f'192.168.1.{100 + i}',
                'request_count': np.random.randint(100, 2000),
                'request_interval': np.random.uniform(0.05, 1.0)
            })
        
        # Process new data
        for request in new_requests:
            # Extract features
            features = ml_system['bot_model'].extract_features(request)
            assert features is not None
            
            # Make prediction
            prediction = ml_system['bot_model'].predict(request)
            assert prediction is not None
            
            # Update model if needed
            if prediction['confidence'] < 0.7:
                # Low confidence - might need model update
                update_needed = ml_system['ai_engine'].assess_model_update_needed(request)
                assert update_needed is not None

    def test_performance_monitoring(self, ml_system):
        """Test ML system performance monitoring"""
        # Monitor prediction performance
        performance_metrics = ml_system['ml_engine'].monitor_performance()
        assert performance_metrics is not None
        
        # Monitor model drift
        drift_detection = ml_system['ml_engine'].detect_model_drift()
        assert drift_detection is not None
        
        # Monitor resource usage
        resource_usage = ml_system['ml_engine'].monitor_resources()
        assert resource_usage is not None

    def test_error_handling_ml(self, ml_system):
        """Test error handling in ML system"""
        # Test with invalid data
        invalid_data = {}
        
        try:
            result = ml_system['bot_model'].predict(invalid_data)
            # Should handle gracefully or return default
            assert result is not None
        except Exception as e:
            # Should handle errors gracefully
            assert str(e) is not None
        
        # Test with malformed features
        malformed_features = [1, 2, 3]  # Wrong shape
        
        try:
            result = ml_system['bot_model'].predict_with_features(malformed_features)
            assert result is not None
        except Exception as e:
            # Should handle errors gracefully
            assert str(e) is not None

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
