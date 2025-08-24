#!/usr/bin/env python3
"""
Advanced ML Engine
Multi-model ensemble learning, AI-powered features, and advanced bot detection
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import pickle
from typing import Dict, List, Any, Optional, Tuple
import logging
from datetime import datetime, timedelta
import json
import os

logger = logging.getLogger(__name__)

class AdvancedMLEngine:
    """Advanced ML Engine with ensemble learning and AI features"""
    
    def __init__(self, models_dir: str = 'models'):
        self.models_dir = models_dir
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.ensemble_model = None
        self.feature_importance = {}
        self.model_performance = {}
        self.is_trained = False
        
        # Ensure models directory exists
        os.makedirs(models_dir, exist_ok=True)
        
        # Initialize models
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize all ML models"""
        # Base models
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.models['gradient_boosting'] = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        self.models['neural_network'] = MLPClassifier(
            hidden_layer_sizes=(100, 50, 25),
            max_iter=500,
            random_state=42,
            early_stopping=True
        )
        
        self.models['svm'] = SVC(
            kernel='rbf',
            probability=True,
            random_state=42
        )
        
        # Ensemble model
        self.ensemble_model = VotingClassifier(
            estimators=[
                ('rf', self.models['random_forest']),
                ('gb', self.models['gradient_boosting']),
                ('nn', self.models['neural_network']),
                ('svm', self.models['svm'])
            ],
            voting='soft'
        )
        
        # Initialize scalers and encoders
        for model_name in self.models.keys():
            self.scalers[model_name] = StandardScaler()
            self.encoders[model_name] = LabelEncoder()
    
    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for ML models"""
        features = data.copy()
        
        # Handle missing values
        features = features.fillna(0)
        
        # Convert categorical variables
        categorical_columns = features.select_dtypes(include=['object']).columns
        
        for col in categorical_columns:
            if col in ['user_agent', 'request_headers']:
                # Extract features from complex fields
                features[f'{col}_length'] = features[col].str.len()
                features[f'{col}_unique_chars'] = features[col].apply(lambda x: len(set(str(x))))
                features[f'{col}_special_chars'] = features[col].str.count(r'[^a-zA-Z0-9\s]')
            else:
                # Simple encoding for other categorical variables
                features[col] = pd.Categorical(features[col]).codes
        
        # Add engineered features
        features = self._add_engineered_features(features)
        
        return features
    
    def _add_engineered_features(self, features: pd.DataFrame) -> pd.DataFrame:
        """Add engineered features for better ML performance"""
        # Time-based features
        if 'timestamp' in features.columns:
            features['hour'] = pd.to_datetime(features['timestamp']).dt.hour
            features['day_of_week'] = pd.to_datetime(features['timestamp']).dt.dayofweek
            features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        
        # Request pattern features
        if 'request_method' in features.columns:
            features['request_method_encoded'] = pd.Categorical(features['request_method']).codes
        
        # Geographic features
        if 'geo_country' in features.columns:
            features['geo_country_encoded'] = pd.Categorical(features['geo_country']).codes
        
        # Behavioral features
        if 'client_ip' in features.columns:
            # IP-based features
            features['ip_requests_count'] = features.groupby('client_ip')['client_ip'].transform('count')
            features['ip_unique_user_agents'] = features.groupby('client_ip')['user_agent'].transform('nunique')
        
        # User agent analysis
        if 'user_agent' in features.columns:
            features['ua_browser_type'] = features['user_agent'].str.contains('bot|crawler|spider', case=False).astype(int)
            features['ua_mobile'] = features['user_agent'].str.contains('mobile|android|iphone', case=False).astype(int)
        
        return features
    
    def train_models(self, training_data: pd.DataFrame, target_column: str = 'is_bot'):
        """Train all ML models"""
        try:
            logger.info("Starting model training...")
            
            # Prepare features
            X = self.prepare_features(training_data.drop(columns=[target_column]))
            y = training_data[target_column]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Train individual models
            for model_name, model in self.models.items():
                logger.info(f"Training {model_name}...")
                
                # Scale features
                X_train_scaled = self.scalers[model_name].fit_transform(X_train)
                X_test_scaled = self.scalers[model_name].transform(X_test)
                
                # Train model
                model.fit(X_train_scaled, y_train)
                
                # Evaluate model
                y_pred = model.predict(X_test_scaled)
                y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
                
                # Store performance metrics
                self.model_performance[model_name] = {
                    'accuracy': (y_pred == y_test).mean(),
                    'roc_auc': roc_auc_score(y_test, y_pred_proba),
                    'classification_report': classification_report(y_test, y_pred, output_dict=True)
                }
                
                # Store feature importance
                if hasattr(model, 'feature_importances_'):
                    self.feature_importance[model_name] = dict(zip(X.columns, model.feature_importances_))
                
                logger.info(f"{model_name} training completed")
            
            # Train ensemble model
            logger.info("Training ensemble model...")
            X_train_scaled = self.scalers['random_forest'].transform(X_train)
            X_test_scaled = self.scalers['random_forest'].transform(X_test)
            
            self.ensemble_model.fit(X_train_scaled, y_train)
            
            # Evaluate ensemble
            y_pred_ensemble = self.ensemble_model.predict(X_test_scaled)
            y_pred_proba_ensemble = self.ensemble_model.predict_proba(X_test_scaled)[:, 1]
            
            self.model_performance['ensemble'] = {
                'accuracy': (y_pred_ensemble == y_test).mean(),
                'roc_auc': roc_auc_score(y_test, y_pred_proba_ensemble),
                'classification_report': classification_report(y_test, y_pred_ensemble, output_dict=True)
            }
            
            self.is_trained = True
            logger.info("All models trained successfully")
            
            # Save models
            self.save_models()
            
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            raise
    
    def predict(self, data: pd.DataFrame, use_ensemble: bool = True) -> Dict[str, Any]:
        """Make predictions using trained models"""
        if not self.is_trained:
            raise ValueError("Models must be trained before making predictions")
        
        try:
            # Prepare features
            X = self.prepare_features(data)
            
            predictions = {}
            
            if use_ensemble and self.ensemble_model:
                # Use ensemble model
                X_scaled = self.scalers['random_forest'].transform(X)
                predictions['ensemble'] = {
                    'predictions': self.ensemble_model.predict(X_scaled).tolist(),
                    'probabilities': self.ensemble_model.predict_proba(X_scaled)[:, 1].tolist()
                }
            else:
                # Use individual models
                for model_name, model in self.models.items():
                    X_scaled = self.scalers[model_name].transform(X)
                    predictions[model_name] = {
                        'predictions': model.predict(X_scaled).tolist(),
                        'probabilities': model.predict_proba(X_scaled)[:, 1].tolist()
                    }
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error making predictions: {str(e)}")
            raise
    
    def get_model_performance(self) -> Dict[str, Any]:
        """Get performance metrics for all models"""
        return self.model_performance
    
    def get_feature_importance(self, model_name: str = 'random_forest') -> Dict[str, float]:
        """Get feature importance for a specific model"""
        if model_name not in self.feature_importance:
            raise ValueError(f"Model {model_name} not found")
        
        # Sort by importance
        sorted_features = sorted(
            self.feature_importance[model_name].items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return dict(sorted_features)
    
    def optimize_hyperparameters(self, training_data: pd.DataFrame, target_column: str = 'is_bot'):
        """Optimize hyperparameters using GridSearchCV"""
        try:
            logger.info("Starting hyperparameter optimization...")
            
            # Prepare features
            X = self.prepare_features(training_data.drop(columns=[target_column]))
            y = training_data[target_column]
            
            # Define parameter grids
            param_grids = {
                'random_forest': {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [5, 10, 15, None],
                    'min_samples_split': [2, 5, 10]
                },
                'gradient_boosting': {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [3, 6, 9],
                    'learning_rate': [0.01, 0.1, 0.2]
                },
                'neural_network': {
                    'hidden_layer_sizes': [(50, 25), (100, 50), (100, 50, 25)],
                    'alpha': [0.0001, 0.001, 0.01]
                }
            }
            
            # Optimize each model
            for model_name, model in self.models.items():
                if model_name in param_grids:
                    logger.info(f"Optimizing {model_name}...")
                    
                    # Scale features
                    X_scaled = self.scalers[model_name].fit_transform(X)
                    
                    # Grid search
                    grid_search = GridSearchCV(
                        model, param_grids[model_name], cv=5, scoring='roc_auc', n_jobs=-1
                    )
                    grid_search.fit(X_scaled, y)
                    
                    # Update model with best parameters
                    self.models[model_name] = grid_search.best_estimator_
                    
                    logger.info(f"{model_name} optimization completed. Best score: {grid_search.best_score_:.4f}")
            
            # Retrain ensemble with optimized models
            self.ensemble_model = VotingClassifier(
                estimators=[
                    ('rf', self.models['random_forest']),
                    ('gb', self.models['gradient_boosting']),
                    ('nn', self.models['neural_network']),
                    ('svm', self.models['svm'])
                ],
                voting='soft'
            )
            
            logger.info("Hyperparameter optimization completed")
            
        except Exception as e:
            logger.error(f"Error optimizing hyperparameters: {str(e)}")
            raise
    
    def save_models(self):
        """Save all trained models"""
        try:
            for model_name, model in self.models.items():
                model_path = os.path.join(self.models_dir, f'{model_name}_model.pkl')
                joblib.dump(model, model_path)
                
                # Save scaler
                scaler_path = os.path.join(self.models_dir, f'{model_name}_scaler.pkl')
                joblib.dump(self.scalers[model_name], scaler_path)
            
            # Save ensemble model
            ensemble_path = os.path.join(self.models_dir, 'ensemble_model.pkl')
            joblib.dump(self.ensemble_model, ensemble_path)
            
            # Save metadata
            metadata = {
                'feature_importance': self.feature_importance,
                'model_performance': self.model_performance,
                'trained_at': datetime.utcnow().isoformat(),
                'is_trained': self.is_trained
            }
            
            metadata_path = os.path.join(self.models_dir, 'model_metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            logger.info("Models saved successfully")
            
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")
            raise
    
    def load_models(self):
        """Load previously trained models"""
        try:
            # Suppress scikit-learn version warnings during loading
            import warnings
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore", category=UserWarning)
                warnings.filterwarnings("ignore", category=FutureWarning)
                
                for model_name in self.models.keys():
                    model_path = os.path.join(self.models_dir, f'{model_name}_model.pkl')
                    scaler_path = os.path.join(self.models_dir, f'{model_name}_scaler.pkl')
                    
                    if os.path.exists(model_path) and os.path.exists(scaler_path):
                        try:
                            self.models[model_name] = joblib.load(model_path)
                            self.scalers[model_name] = joblib.load(scaler_path)
                            logger.info(f"Loaded {model_name} model")
                        except Exception as e:
                            logger.warning(f"Error loading {model_name} model (version conflict): {e}")
                            logger.info(f"Will retrain {model_name} model...")
                            # Remove the failed model so it can be retrained
                            self.models[model_name] = None
                            self.scalers[model_name] = None
                
                # Load ensemble model
                ensemble_path = os.path.join(self.models_dir, 'ensemble_model.pkl')
                if os.path.exists(ensemble_path):
                    try:
                        self.ensemble_model = joblib.load(ensemble_path)
                        logger.info("Loaded ensemble model")
                    except Exception as e:
                        logger.warning(f"Error loading ensemble model (version conflict): {e}")
                        logger.info("Will retrain ensemble model...")
                        self.ensemble_model = None
                
                # Load metadata
                metadata_path = os.path.join(self.models_dir, 'model_metadata.json')
                if os.path.exists(metadata_path):
                    try:
                        with open(metadata_path, 'r') as f:
                            metadata = json.load(f)
                        
                        self.feature_importance = metadata.get('feature_importance', {})
                        self.model_performance = metadata.get('model_performance', {})
                        self.is_trained = metadata.get('is_trained', False)
                        
                        logger.info("Loaded model metadata")
                    except Exception as e:
                        logger.warning(f"Error loading model metadata: {e}")
                        # Reset metadata if loading fails
                        self.feature_importance = {}
                        self.model_performance = {}
                        self.is_trained = False
                
                # Check if any models were successfully loaded
                loaded_models = [name for name, model in self.models.items() if model is not None]
                if loaded_models:
                    logger.info(f"Successfully loaded models: {loaded_models}")
                else:
                    logger.info("No models were loaded successfully, will need retraining")
                    self.is_trained = False
                
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            # Reset all models if loading fails completely
            for model_name in self.models.keys():
                self.models[model_name] = None
                self.scalers[model_name] = None
            self.ensemble_model = None
            self.is_trained = False
            raise
    
    def get_model_summary(self) -> Dict[str, Any]:
        """Get comprehensive model summary"""
        if not self.is_trained:
            return {'status': 'Models not trained'}
        
        summary = {
            'status': 'Models trained and ready',
            'models_available': list(self.models.keys()),
            'ensemble_available': self.ensemble_model is not None,
            'training_date': datetime.utcnow().isoformat(),
            'performance_summary': {},
            'feature_importance_summary': {}
        }
        
        # Performance summary
        for model_name, performance in self.model_performance.items():
            summary['performance_summary'][model_name] = {
                'accuracy': f"{performance['accuracy']:.4f}",
                'roc_auc': f"{performance['roc_auc']:.4f}"
            }
        
        # Feature importance summary
        for model_name, importance in self.feature_importance.items():
            if importance:
                top_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]
                summary['feature_importance_summary'][model_name] = {
                    'top_features': [feature for feature, _ in top_features],
                    'top_importance_scores': [score for _, score in top_features]
                }
        
        return summary

# Global instance
advanced_ml_engine = AdvancedMLEngine()
