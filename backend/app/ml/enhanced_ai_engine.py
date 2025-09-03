#!/usr/bin/env python3
"""
Enhanced AI Engine for Bot Detection and Traffic Interception
Uses deep learning, autonomous ML, and AI agent capabilities
"""

import numpy as np
import pandas as pd
# PyTorch imports (optional - will use scikit-learn fallback if not available)
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    PYTORCH_AVAILABLE = True
except ImportError:
    PYTORCH_AVAILABLE = False
    print("PyTorch not available, using scikit-learn fallback")

from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
import joblib
import pickle
from typing import Dict, List, Any, Optional, Tuple, Union
import logging
from datetime import datetime, timedelta
import json
import os
import asyncio
from dataclasses import dataclass
import redis
from collections import defaultdict
import threading
import time

logger = logging.getLogger(__name__)

@dataclass
class AIAgent:
    """Represents an AI agent for autonomous decision making"""
    id: str
    name: str
    agent_type: str  # 'bot_detector', 'traffic_analyzer', 'threat_hunter', 'rule_optimizer'
    status: str  # 'active', 'learning', 'sleeping', 'error'
    capabilities: List[str]
    performance_metrics: Dict
    last_updated: datetime
    confidence_threshold: float
    learning_rate: float

class EnhancedAIEngine:
    """
    Enhanced AI Engine with deep learning and autonomous capabilities
    """
    
    def __init__(self, models_dir: str = 'models'):
        self.models_dir = models_dir
        self.pytorch_available = PYTORCH_AVAILABLE
        
        if self.pytorch_available:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = 'cpu'
            print("Using scikit-learn models instead of PyTorch")
        
        # Initialize components
        self.deep_learning_models = {}
        self.ensemble_models = {}
        self.ai_agents = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_importance = {}
        self.model_performance = {}
        self.auto_learning_enabled = True
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        
        # Ensure models directory exists
        os.makedirs(models_dir, exist_ok=True)
        
        # Initialize AI agents
        self._initialize_ai_agents()
        
        # Initialize models
        if self.pytorch_available:
            self._initialize_deep_learning_models()
        else:
            self._initialize_sklearn_models()
        
        # Start autonomous learning loop
        if self.auto_learning_enabled:
            self._start_autonomous_learning()
    
    def _initialize_ai_agents(self):
        """Initialize AI agents for different tasks"""
        
        # Bot Detection Agent
        self.ai_agents['bot_detector'] = AIAgent(
            id='bot_detector_001',
            name='BotHunter',
            agent_type='bot_detector',
            status='active',
            capabilities=['pattern_recognition', 'behavior_analysis', 'real_time_detection'],
            performance_metrics={
                'accuracy': 0.0,
                'precision': 0.0,
                'recall': 0.0,
                'f1_score': 0.0,
                'total_predictions': 0,
                'correct_predictions': 0
            },
            last_updated=datetime.utcnow(),
            confidence_threshold=0.85,
            learning_rate=0.001
        )
        
        # Traffic Analysis Agent
        self.ai_agents['traffic_analyzer'] = AIAgent(
            id='traffic_analyzer_001',
            name='TrafficInsight',
            agent_type='traffic_analyzer',
            status='active',
            capabilities=['anomaly_detection', 'trend_analysis', 'performance_optimization'],
            performance_metrics={
                'anomaly_detection_rate': 0.0,
                'false_positive_rate': 0.0,
                'response_time': 0.0,
                'total_analyses': 0
            },
            last_updated=datetime.utcnow(),
            confidence_threshold=0.80,
            learning_rate=0.0005
        )
    
    def _initialize_deep_learning_models(self):
        """Initialize deep learning models for different tasks"""
        
        # Bot Detection Neural Network
        self.deep_learning_models['bot_detection'] = BotDetectionNN(
            input_size=128,
            hidden_sizes=[256, 128, 64, 32],
            output_size=2,
            dropout_rate=0.3
        ).to(self.device)
        
        # Initialize optimizers
        self.optimizers = {}
        for name, model in self.deep_learning_models.items():
            self.optimizers[name] = optim.Adam(
                model.parameters(),
                lr=0.001,
                weight_decay=1e-5
            )
    
    def _initialize_sklearn_models(self):
        """Initialize scikit-learn models as fallback when PyTorch is not available"""
        
        # Bot Detection Models
        self.ensemble_models['bot_detection'] = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # Anomaly Detection Models
        self.ensemble_models['anomaly_detection'] = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        
        # Traffic Analysis Models
        self.ensemble_models['traffic_analysis'] = MLPClassifier(
            hidden_layer_sizes=(100, 50),
            max_iter=500,
            random_state=42
        )
        
        # Threat Detection Models
        self.ensemble_models['threat_detection'] = SVC(
            kernel='rbf',
            probability=True,
            random_state=42
        )
        
        logger.info("Initialized scikit-learn models successfully")
    
    def _start_autonomous_learning(self):
        """Start the autonomous learning loop in a separate thread"""
        def autonomous_learning_loop():
            while self.auto_learning_enabled:
                try:
                    # Autonomous model retraining
                    self._autonomous_model_retraining()
                    
                    # Agent performance optimization
                    self._optimize_agent_performance()
                    
                    # Sleep for 1 hour
                    time.sleep(3600)
                    
                except Exception as e:
                    logger.error(f"Autonomous learning error: {e}")
                    time.sleep(300)  # Sleep for 5 minutes on error
        
        thread = threading.Thread(target=autonomous_learning_loop, daemon=True)
        thread.start()
        logger.info("Autonomous learning loop started")
    
    def _autonomous_model_retraining(self):
        """Automatically retrain models based on performance metrics"""
        try:
            for model_name, model in self.deep_learning_models.items():
                # Check if retraining is needed
                if self._should_retrain_model(model_name):
                    logger.info(f"Auto-retraining model: {model_name}")
                    
                    # Get recent data for retraining
                    training_data = self._get_recent_training_data(model_name)
                    
                    if training_data is not None and len(training_data) > 1000:
                        # Retrain model
                        self._retrain_model(model_name, training_data)
                        
                        # Update performance metrics
                        self._update_model_performance(model_name)
                        
        except Exception as e:
            logger.error(f"Autonomous model retraining failed: {e}")
    
    def _should_retrain_model(self, model_name: str) -> bool:
        """Determine if a model should be retrained"""
        try:
            # Get current performance
            current_performance = self.model_performance.get(model_name, {})
            accuracy = current_performance.get('accuracy', 0.0)
            
            # Get historical performance
            historical_key = f"model_performance_history:{model_name}"
            historical_data = self.redis_client.get(historical_key)
            
            if historical_data:
                history = json.loads(historical_data)
                if len(history) >= 10:
                    # Check if performance is declining
                    recent_avg = np.mean([h['accuracy'] for h in history[-5:]])
                    if accuracy < recent_avg * 0.95:  # 5% decline
                        return True
            
            # Retrain if accuracy is below threshold
            if accuracy < 0.85:
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking retrain condition: {e}")
            return False
    
    def _get_recent_training_data(self, model_name: str) -> Optional[pd.DataFrame]:
        """Get recent data for model retraining"""
        try:
            # Get data from last 7 days
            cutoff_date = datetime.utcnow() - timedelta(days=7)
            
            # This would typically come from your database
            # For now, return None to indicate no data
            return None
            
        except Exception as e:
            logger.error(f"Error getting recent training data: {e}")
            return None
    
    def _retrain_model(self, model_name: str, training_data: pd.DataFrame):
        """Retrain a specific model"""
        try:
            model = self.deep_learning_models[model_name]
            optimizer = self.optimizers[model_name]
            
            # Prepare data
            X, y = self._prepare_training_data(model_name, training_data)
            
            # Convert to tensors
            X_tensor = torch.FloatTensor(X).to(self.device)
            y_tensor = torch.LongTensor(y).to(self.device)
            
            # Create data loader
            dataset = TensorDataset(X_tensor, y_tensor)
            dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
            
            # Training loop
            model.train()
            for epoch in range(10):
                total_loss = 0
                for batch_X, batch_y in dataloader:
                    optimizer.zero_grad()
                    
                    outputs = model(batch_X)
                    loss = nn.CrossEntropyLoss()(outputs, batch_y)
                    
                    loss.backward()
                    optimizer.step()
                    
                    total_loss += loss.item()
                
                if epoch % 2 == 0:
                    logger.info(f"Model {model_name} - Epoch {epoch}, Loss: {total_loss/len(dataloader):.4f}")
            
            # Save updated model
            self._save_model(model_name, model)
            
            logger.info(f"Model {model_name} retrained successfully")
            
        except Exception as e:
            logger.error(f"Model retraining failed for {model_name}: {e}")
    
    def _optimize_agent_performance(self):
        """Optimize AI agent performance based on metrics"""
        try:
            for agent_id, agent in self.ai_agents.items():
                # Analyze performance trends
                performance_trend = self._analyze_agent_performance_trend(agent_id)
                
                if performance_trend == 'declining':
                    # Adjust agent parameters
                    self._adjust_agent_parameters(agent_id)
                    
                    # Trigger learning mode
                    agent.status = 'learning'
                    agent.learning_rate *= 1.1  # Increase learning rate
                    
                elif performance_trend == 'improving':
                    # Optimize current parameters
                    agent.learning_rate *= 0.95  # Decrease learning rate
                
                # Update agent
                agent.last_updated = datetime.utcnow()
                self.ai_agents[agent_id] = agent
                
        except Exception as e:
            logger.error(f"Agent performance optimization failed: {e}")
    
    def _analyze_agent_performance_trend(self, agent_id: str) -> str:
        """Analyze agent performance trend"""
        try:
            # Get historical performance data
            historical_key = f"agent_performance_history:{agent_id}"
            historical_data = self.redis_client.get(historical_key)
            
            if historical_data and len(historical_data) >= 5:
                history = json.loads(historical_data)
                
                # Calculate trend
                recent_performance = [h['accuracy'] for h in history[-3:]]
                older_performance = [h['accuracy'] for h in history[-6:-3]]
                
                if len(recent_performance) >= 3 and len(older_performance) >= 3:
                    recent_avg = np.mean(recent_performance)
                    older_avg = np.mean(older_performance)
                    
                    if recent_avg > older_avg * 1.05:
                        return 'improving'
                    elif recent_avg < older_avg * 0.95:
                        return 'declining'
            
            return 'stable'
            
        except Exception as e:
            logger.error(f"Error analyzing agent performance trend: {e}")
            return 'stable'
    
    def _adjust_agent_parameters(self, agent_id: str):
        """Adjust agent parameters for better performance"""
        try:
            agent = self.ai_agents[agent_id]
            
            if agent.agent_type == 'bot_detector':
                # Adjust confidence threshold
                if agent.performance_metrics['precision'] < 0.8:
                    agent.confidence_threshold *= 1.1  # Increase threshold
                elif agent.performance_metrics['recall'] < 0.8:
                    agent.confidence_threshold *= 0.9  # Decrease threshold
                
                # Adjust learning rate
                if agent.performance_metrics['accuracy'] < 0.85:
                    agent.learning_rate *= 1.2  # Increase learning rate
            
            elif agent.agent_type == 'traffic_analyzer':
                # Adjust anomaly detection sensitivity
                if agent.performance_metrics['false_positive_rate'] > 0.2:
                    agent.confidence_threshold *= 1.1  # Increase threshold
                elif agent.performance_metrics['anomaly_detection_rate'] < 0.7:
                    agent.confidence_threshold *= 0.9  # Decrease threshold
            
            # Update agent
            self.ai_agents[agent_id] = agent
            
        except Exception as e:
            logger.error(f"Error adjusting agent parameters: {e}")
    
    def _optimize_rules(self):
        """Optimize interception rules based on AI analysis"""
        try:
            # Get rule performance data
            rule_performance = self._get_rule_performance_data()
            
            for rule_id, performance in rule_performance.items():
                if performance['false_positive_rate'] > 0.3:
                    # Rule is causing too many false positives
                    self._optimize_rule_conditions(rule_id, performance)
                
                elif performance['effectiveness'] < 0.6:
                    # Rule is not effective enough
                    self._enhance_rule_actions(rule_id, performance)
            
        except Exception as e:
            logger.error(f"Rule optimization failed: {e}")
    
    def _get_rule_performance_data(self) -> Dict:
        """Get performance data for all rules"""
        try:
            # This would typically come from your database
            # For now, return empty dict
            return {}
            
        except Exception as e:
            logger.error(f"Error getting rule performance data: {e}")
            return {}
    
    def _optimize_rule_conditions(self, rule_id: str, performance: Dict):
        """Optimize rule conditions to reduce false positives"""
        try:
            # Analyze patterns in false positives
            false_positive_patterns = self._analyze_false_positive_patterns(rule_id)
            
            if false_positive_patterns:
                # Suggest condition improvements
                suggested_conditions = self._suggest_condition_improvements(
                    rule_id, false_positive_patterns
                )
                
                # Log optimization suggestions
                logger.info(f"Rule {rule_id} optimization suggestions: {suggested_conditions}")
                
        except Exception as e:
            logger.error(f"Error optimizing rule conditions: {e}")
    
    def _analyze_false_positive_patterns(self, rule_id: str) -> List[Dict]:
        """Analyze patterns in false positive cases"""
        try:
            # This would analyze the actual false positive data
            # For now, return empty list
            return []
            
        except Exception as e:
            logger.error(f"Error analyzing false positive patterns: {e}")
            return []
    
    def _suggest_condition_improvements(self, rule_id: str, patterns: List[Dict]) -> List[Dict]:
        """Suggest improvements to rule conditions"""
        try:
            suggestions = []
            
            for pattern in patterns:
                if 'user_agent' in pattern:
                    suggestions.append({
                        'field': 'user_agent',
                        'action': 'add_exception',
                        'value': pattern['user_agent'],
                        'reason': 'Frequent false positive pattern'
                    })
                
                if 'ip_range' in pattern:
                    suggestions.append({
                        'field': 'ip_range',
                        'action': 'whitelist',
                        'value': pattern['ip_range'],
                        'reason': 'Legitimate traffic source'
                    })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error suggesting condition improvements: {e}")
            return []
    
    def _enhance_rule_actions(self, rule_id: str, performance: Dict):
        """Enhance rule actions for better effectiveness"""
        try:
            # Analyze current actions
            current_actions = self._get_rule_actions(rule_id)
            
            if current_actions:
                # Suggest action improvements
                suggested_actions = self._suggest_action_improvements(
                    rule_id, current_actions, performance
                )
                
                # Log enhancement suggestions
                logger.info(f"Rule {rule_id} action enhancements: {suggested_actions}")
                
        except Exception as e:
            logger.error(f"Error enhancing rule actions: {e}")
    
    def _get_rule_actions(self, rule_id: str) -> List[Dict]:
        """Get current actions for a rule"""
        try:
            # This would come from your database
            # For now, return empty list
            return []
            
        except Exception as e:
            logger.error(f"Error getting rule actions: {e}")
            return []
    
    def _suggest_action_improvements(self, rule_id: str, current_actions: List[Dict], performance: Dict) -> List[Dict]:
        """Suggest improvements to rule actions"""
        try:
            suggestions = []
            
            # If rule is not blocking enough, suggest stronger actions
            if performance.get('effectiveness', 0) < 0.6:
                suggestions.append({
                    'action': 'escalate',
                    'current_action': current_actions[0] if current_actions else 'unknown',
                    'suggested_action': 'block_request',
                    'reason': 'Low effectiveness, stronger action needed'
                })
            
            # If rule is causing too many false positives, suggest softer actions
            if performance.get('false_positive_rate', 0) > 0.3:
                suggestions.append({
                    'action': 'deescalate',
                    'current_action': current_actions[0] if current_actions else 'unknown',
                    'suggested_action': 'challenge',
                    'reason': 'High false positive rate, softer action recommended'
                })
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error suggesting action improvements: {e}")
            return []
    
    def predict_bot(self, features: np.ndarray) -> Tuple[bool, float]:
        """Predict if traffic is from a bot using AI models"""
        try:
            # Ensure features are 2D array
            if features.ndim == 1:
                features = features.reshape(1, -1)
            
            # Try PyTorch model first
            if self.pytorch_available and 'bot_detection' in self.deep_learning_models:
                try:
                    features_tensor = torch.FloatTensor(features).to(self.device)
                    model = self.deep_learning_models['bot_detection']
                    model.eval()
                    with torch.no_grad():
                        outputs = model(features_tensor)
                        probabilities = torch.softmax(outputs, dim=1)
                        prediction = torch.argmax(probabilities, dim=1).item()
                        confidence = probabilities[0][1].item()  # Bot probability
                        
                        # Update agent performance metrics
                        self._update_bot_detection_metrics(prediction, confidence)
                        
                        return bool(prediction), confidence
                except Exception as e:
                    logger.warning(f"PyTorch model failed, falling back to scikit-learn: {e}")
            
            # Fallback to scikit-learn models
            if 'bot_detection' in self.ensemble_models:
                model = self.ensemble_models['bot_detection']
                prediction = model.predict(features)[0]
                confidence = model.predict_proba(features)[0][1] if hasattr(model, 'predict_proba') else 0.8
                
                # Update agent performance metrics
                self._update_bot_detection_metrics(prediction, confidence)
                
                return bool(prediction), confidence
            
            # Default fallback
            logger.warning("No bot detection models available, using default prediction")
            return False, 0.5
            
        except Exception as e:
            logger.error(f"Bot prediction failed: {e}")
            return False, 0.0
    
    def _update_bot_detection_metrics(self, prediction: bool, confidence: float):
        """Update bot detection agent performance metrics"""
        try:
            agent = self.ai_agents['bot_detector']
            metrics = agent.performance_metrics
            
            metrics['total_predictions'] += 1
            
            # Update agent
            agent.performance_metrics = metrics
            self.ai_agents['bot_detector'] = agent
            
        except Exception as e:
            logger.error(f"Error updating bot detection metrics: {e}")
    
    def _prepare_training_data(self, model_name: str, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data for a specific model"""
        try:
            # This would implement specific data preparation for each model type
            # For now, return placeholder
            return np.array([]), np.array([])
            
        except Exception as e:
            logger.error(f"Error preparing training data: {e}")
            return np.array([]), np.array([])
    
    def _save_model(self, model_name: str, model):
        """Save a trained model"""
        try:
            if self.pytorch_available and hasattr(model, 'state_dict'):
                # PyTorch model
                model_path = os.path.join(self.models_dir, f"{model_name}.pth")
                torch.save(model.state_dict(), model_path)
                logger.info(f"PyTorch model {model_name} saved to {model_path}")
            else:
                # Scikit-learn model
                model_path = os.path.join(self.models_dir, f"{model_name}.pkl")
                joblib.dump(model, model_path)
                logger.info(f"Scikit-learn model {model_name} saved to {model_path}")
            
        except Exception as e:
            logger.error(f"Error saving model {model_name}: {e}")
    
    def get_ai_agents_status(self) -> Dict:
        """Get status of all AI agents"""
        try:
            status = {}
            for agent_id, agent in self.ai_agents.items():
                status[agent_id] = {
                    'name': agent.name,
                    'type': agent.agent_type,
                    'status': agent.status,
                    'capabilities': agent.capabilities,
                    'performance_metrics': agent.performance_metrics,
                    'last_updated': agent.last_updated.isoformat(),
                    'confidence_threshold': agent.confidence_threshold,
                    'learning_rate': agent.learning_rate
                }
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting AI agents status: {e}")
            return {}
    
    def get_model_performance(self) -> Dict:
        """Get performance metrics for all models"""
        try:
            return self.model_performance
            
        except Exception as e:
            logger.error(f"Error getting model performance: {e}")
            return {}

# Deep Learning Model Classes

if PYTORCH_AVAILABLE:
    class BotDetectionNN(nn.Module):
        """Neural network for bot detection"""
        
        def __init__(self, input_size: int, hidden_sizes: List[int], output_size: int, dropout_rate: float = 0.3):
            super(BotDetectionNN, self).__init__()
            
            layers = []
            prev_size = input_size
            
            for hidden_size in hidden_sizes:
                layers.extend([
                    nn.Linear(prev_size, hidden_size),
                    nn.ReLU(),
                    nn.Dropout(dropout_rate),
                    nn.BatchNorm1d(hidden_size)
                ])
                prev_size = hidden_size
            
            layers.append(nn.Linear(prev_size, output_size))
            
            self.network = nn.Sequential(*layers)
        
        def forward(self, x):
            return self.network(x)
else:
    # Placeholder class when PyTorch is not available
    class BotDetectionNN:
        """Placeholder for BotDetectionNN when PyTorch is not available"""
        
        def __init__(self, input_size: int, hidden_sizes: List[int], output_size: int, dropout_rate: float = 0.3):
            raise ImportError("PyTorch is required for BotDetectionNN")
        
        def to(self, device):
            return self

# Global instance (lazy initialization)
_enhanced_ai_engine = None

def get_enhanced_ai_engine():
    """Get global enhanced AI engine instance"""
    global _enhanced_ai_engine
    if _enhanced_ai_engine is None:
        _enhanced_ai_engine = EnhancedAIEngine()
    return _enhanced_ai_engine
