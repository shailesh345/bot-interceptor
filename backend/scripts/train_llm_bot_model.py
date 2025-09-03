"""
Train and integrate super intelligence ML models for LLM bot detection
This script trains multiple models and creates an ensemble for superior detection accuracy
"""

import os
import sys
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    VotingClassifier,
    AdaBoostClassifier
)
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models_enhanced import LLMBotDetection
from app.interceptor.llm_bot_detector import llm_bot_detector


class SuperIntelligenceTrainer:
    """Train ensemble models for super intelligence bot detection"""
    
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        self.ensemble_model = None
        
    def generate_synthetic_data(self, n_samples=10000):
        """Generate synthetic training data for LLM bot detection"""
        print("Generating synthetic training data...")
        
        data = []
        
        # Known LLM bot patterns
        llm_patterns = {
            'openai': {
                'user_agents': ['GPTBot', 'ChatGPT-User', 'OpenAI'],
                'timing': {'mean': 1.0, 'std': 0.2},
                'behavior': {'systematic': 0.9, 'javascript': 0.1}
            },
            'google': {
                'user_agents': ['Google-Extended', 'Googlebot'],
                'timing': {'mean': 0.5, 'std': 0.3},
                'behavior': {'systematic': 0.8, 'javascript': 0.3}
            },
            'perplexity': {
                'user_agents': ['PerplexityBot', 'Perplexity-Bot'],
                'timing': {'mean': 2.0, 'std': 0.5},
                'behavior': {'systematic': 0.85, 'javascript': 0.05}
            },
            'anthropic': {
                'user_agents': ['Claude-Web', 'AnthropicBot'],
                'timing': {'mean': 1.5, 'std': 0.4},
                'behavior': {'systematic': 0.87, 'javascript': 0.02}
            }
        }
        
        # Generate bot samples (70% of data)
        bot_samples = int(n_samples * 0.7)
        for i in range(bot_samples):
            bot_type = np.random.choice(list(llm_patterns.keys()))
            pattern = llm_patterns[bot_type]
            
            # Generate features
            ua = np.random.choice(pattern['user_agents'])
            features = self._extract_features({
                'user_agent': ua,
                'request_timing': np.random.normal(pattern['timing']['mean'], pattern['timing']['std']),
                'systematic_crawling': np.random.random() < pattern['behavior']['systematic'],
                'javascript_execution': np.random.random() < pattern['behavior']['javascript'],
                'request_path': np.random.choice(['/article/', '/page/', '/post/', '/content/']),
                'accepts_cookies': False,
                'has_referrer': np.random.random() < 0.1,
                'datacenter_ip': True,
                'request_count': np.random.randint(50, 500),
                'unique_paths': np.random.randint(20, 200)
            })
            
            data.append({
                'features': features,
                'is_bot': 1,
                'bot_type': bot_type
            })
        
        # Generate human samples (30% of data)
        human_samples = n_samples - bot_samples
        for i in range(human_samples):
            features = self._extract_features({
                'user_agent': np.random.choice([
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36',
                    'Mozilla/5.0 (X11; Linux x86_64) Firefox/89.0'
                ]),
                'request_timing': np.random.exponential(5.0),
                'systematic_crawling': False,
                'javascript_execution': True,
                'request_path': np.random.choice(['/', '/about', '/contact', '/products']),
                'accepts_cookies': True,
                'has_referrer': np.random.random() < 0.8,
                'datacenter_ip': np.random.random() < 0.1,
                'request_count': np.random.randint(1, 50),
                'unique_paths': np.random.randint(1, 20)
            })
            
            data.append({
                'features': features,
                'is_bot': 0,
                'bot_type': 'human'
            })
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        X = np.array(df['features'].tolist())
        y = df['is_bot'].values
        
        print(f"Generated {len(data)} samples: {bot_samples} bots, {human_samples} humans")
        
        return X, y, df
    
    def _extract_features(self, data):
        """Extract features from request data"""
        features = []
        
        # User agent features
        ua = data.get('user_agent', '').lower()
        features.extend([
            len(ua),
            ua.count('bot'),
            ua.count('crawl'),
            ua.count('spider'),
            ua.count('gpt'),
            ua.count('ai'),
            ua.count('google'),
            ua.count('openai'),
            ua.count('anthropic'),
            ua.count('perplexity'),
            int('mozilla' in ua),
            int('chrome' in ua),
            int('safari' in ua),
            int('firefox' in ua)
        ])
        
        # Behavioral features
        features.extend([
            data.get('request_timing', 0),
            int(data.get('systematic_crawling', False)),
            int(data.get('javascript_execution', False)),
            int(data.get('accepts_cookies', False)),
            int(data.get('has_referrer', False)),
            int(data.get('datacenter_ip', False))
        ])
        
        # Request pattern features
        path = data.get('request_path', '')
        features.extend([
            len(path),
            path.count('/'),
            int('.html' in path or '.htm' in path),
            int('.json' in path or '.xml' in path),
            int('/api/' in path),
            data.get('request_count', 0),
            data.get('unique_paths', 0)
        ])
        
        return np.array(features, dtype=np.float32)
    
    def train_models(self, X_train, y_train, X_test, y_test):
        """Train multiple models for ensemble"""
        print("\nTraining individual models...")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Model 1: Random Forest
        print("Training Random Forest...")
        rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        rf_model.fit(X_train_scaled, y_train)
        self.models['random_forest'] = rf_model
        
        # Model 2: Gradient Boosting
        print("Training Gradient Boosting...")
        gb_model = GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=7,
            random_state=42
        )
        gb_model.fit(X_train_scaled, y_train)
        self.models['gradient_boosting'] = gb_model
        
        # Model 3: XGBoost
        print("Training XGBoost...")
        xgb_model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=10,
            learning_rate=0.1,
            objective='binary:logistic',
            random_state=42,
            use_label_encoder=False
        )
        xgb_model.fit(X_train_scaled, y_train)
        self.models['xgboost'] = xgb_model
        
        # Model 4: Neural Network
        print("Training Neural Network...")
        nn_model = MLPClassifier(
            hidden_layer_sizes=(100, 50, 25),
            activation='relu',
            solver='adam',
            alpha=0.001,
            max_iter=500,
            random_state=42
        )
        nn_model.fit(X_train_scaled, y_train)
        self.models['neural_network'] = nn_model
        
        # Model 5: AdaBoost
        print("Training AdaBoost...")
        ada_model = AdaBoostClassifier(
            n_estimators=100,
            learning_rate=1.0,
            random_state=42
        )
        ada_model.fit(X_train_scaled, y_train)
        self.models['adaboost'] = ada_model
        
        # Evaluate individual models
        print("\nIndividual Model Performance:")
        for name, model in self.models.items():
            y_pred = model.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred)
            recall = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            
            print(f"\n{name}:")
            print(f"  Accuracy:  {accuracy:.4f}")
            print(f"  Precision: {precision:.4f}")
            print(f"  Recall:    {recall:.4f}")
            print(f"  F1-Score:  {f1:.4f}")
    
    def create_ensemble(self, X_train, y_train, X_test, y_test):
        """Create ensemble model for super intelligence"""
        print("\nCreating Super Intelligence Ensemble...")
        
        X_train_scaled = self.scaler.transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Create voting classifier
        estimators = [
            ('rf', self.models['random_forest']),
            ('gb', self.models['gradient_boosting']),
            ('xgb', self.models['xgboost']),
            ('nn', self.models['neural_network']),
            ('ada', self.models['adaboost'])
        ]
        
        # Soft voting for probability-based decisions
        self.ensemble_model = VotingClassifier(
            estimators=estimators,
            voting='soft',
            weights=[0.25, 0.25, 0.2, 0.15, 0.15]  # Weight based on individual performance
        )
        
        # Train ensemble
        self.ensemble_model.fit(X_train_scaled, y_train)
        
        # Evaluate ensemble
        y_pred = self.ensemble_model.predict(X_test_scaled)
        y_pred_proba = self.ensemble_model.predict_proba(X_test_scaled)
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        print("\nSuper Intelligence Ensemble Performance:")
        print(f"  Accuracy:  {accuracy:.4f}")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall:    {recall:.4f}")
        print(f"  F1-Score:  {f1:.4f}")
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        print("\nConfusion Matrix:")
        print(f"  True Negatives:  {cm[0][0]}")
        print(f"  False Positives: {cm[0][1]}")
        print(f"  False Negatives: {cm[1][0]}")
        print(f"  True Positives:  {cm[1][1]}")
        
        # Classification report
        print("\nDetailed Classification Report:")
        print(classification_report(y_test, y_pred, target_names=['Human', 'LLM Bot']))
        
        return self.ensemble_model
    
    def save_models(self):
        """Save trained models to disk"""
        print("\nSaving models...")
        
        model_dir = 'app/interceptor/models'
        os.makedirs(model_dir, exist_ok=True)
        
        # Save scaler
        joblib.dump(self.scaler, os.path.join(model_dir, 'llm_bot_scaler.pkl'))
        
        # Save individual models
        for name, model in self.models.items():
            joblib.dump(model, os.path.join(model_dir, f'llm_bot_{name}.pkl'))
        
        # Save ensemble
        joblib.dump(self.ensemble_model, os.path.join(model_dir, 'llm_bot_ensemble.pkl'))
        
        # Save metadata
        metadata = {
            'trained_at': datetime.utcnow().isoformat(),
            'models': list(self.models.keys()),
            'feature_count': len(self.feature_names) if self.feature_names else 27,
            'ensemble_weights': [0.25, 0.25, 0.2, 0.15, 0.15]
        }
        
        with open(os.path.join(model_dir, 'llm_bot_model_metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Models saved to {model_dir}")
    
    def load_real_data(self):
        """Load real detection data from database"""
        print("Loading real detection data from database...")
        
        app = create_app()
        with app.app_context():
            # Get recent detections
            detections = LLMBotDetection.query.filter(
                LLMBotDetection.confidence > 0.5
            ).order_by(LLMBotDetection.timestamp.desc()).limit(1000).all()
            
            if detections:
                print(f"Found {len(detections)} real detections for training")
                # Convert to training data format
                # In production, implement proper feature extraction from real data
            else:
                print("No real detection data found, using synthetic data only")
        
        return None


def main():
    """Main training script"""
    print("=" * 60)
    print("Super Intelligence LLM Bot Detection Model Training")
    print("=" * 60)
    
    trainer = SuperIntelligenceTrainer()
    
    # Generate synthetic data (in production, combine with real data)
    X, y, df = trainer.generate_synthetic_data(n_samples=20000)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")
    print(f"Bot ratio in training: {y_train.mean():.2%}")
    
    # Train individual models
    trainer.train_models(X_train, y_train, X_test, y_test)
    
    # Create ensemble
    trainer.create_ensemble(X_train, y_train, X_test, y_test)
    
    # Save models
    trainer.save_models()
    
    print("\n" + "=" * 60)
    print("Training completed successfully!")
    print("Models are ready for integration into the LLM bot detector")
    print("=" * 60)


if __name__ == "__main__":
    main()
