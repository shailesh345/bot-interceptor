"""
ML Model Management API
Provides endpoints for training, evaluating, and managing the bot detection ML model
"""

from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc, and_
from ..models import User, Domain, TrafficLog, BotProfile
from .. import db
from ..ml.bot_detection_model import bot_detection_model
from ..websocket import broadcast_alert

ml_management = Blueprint('ml_management', __name__)

@ml_management.route('/model/info', methods=['GET'])
@jwt_required()
def get_model_info():
    """Get information about the current ML model"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has admin privileges
        if user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        model_info = bot_detection_model.get_model_info()
        
        return jsonify({
            'success': True,
            'model_info': model_info
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get model info error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_management.route('/model/train', methods=['POST'])
@jwt_required()
def train_model():
    """Train the bot detection model"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has admin privileges
        if user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        data = request.get_json() or {}
        days = data.get('days', 30)
        test_size = data.get('test_size', 0.2)
        
        # Train the model
        training_results = bot_detection_model.train_model(days=days, test_size=test_size)
        
        # Broadcast training completion alert
        broadcast_alert({
            'type': 'model_training_completed',
            'severity': 'info',
            'message': f'Bot detection model training completed with {training_results["accuracy"]:.2%} accuracy',
            'timestamp': datetime.utcnow().isoformat(),
            'data': training_results
        })
        
        return jsonify({
            'success': True,
            'message': 'Model training completed successfully',
            'results': training_results
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Train model error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_management.route('/model/evaluate', methods=['POST'])
@jwt_required()
def evaluate_model():
    """Evaluate the bot detection model on recent data"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has admin privileges
        if user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        data = request.get_json() or {}
        days = data.get('days', 7)
        
        # Evaluate the model
        evaluation_results = bot_detection_model.evaluate_model(days=days)
        
        return jsonify({
            'success': True,
            'message': 'Model evaluation completed',
            'results': evaluation_results
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Evaluate model error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_management.route('/model/predict', methods=['POST'])
@jwt_required()
def predict_bot():
    """Predict if a request is from a bot using the ML model"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        # Add timestamp if not provided
        if 'timestamp' not in data:
            data['timestamp'] = datetime.utcnow()
        
        # Make prediction
        prediction = bot_detection_model.predict(data)
        
        return jsonify({
            'success': True,
            'prediction': prediction
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Predict bot error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_management.route('/model/retrain', methods=['POST'])
@jwt_required()
def retrain_model():
    """Retrain the model with new data"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has admin privileges
        if user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        data = request.get_json() or {}
        days = data.get('days', 30)
        
        # Retrain the model
        retraining_results = bot_detection_model.retrain_model(days=days)
        
        # Broadcast retraining completion alert
        broadcast_alert({
            'type': 'model_retraining_completed',
            'severity': 'info',
            'message': f'Bot detection model retraining completed with {retraining_results["accuracy"]:.2%} accuracy',
            'timestamp': datetime.utcnow().isoformat(),
            'data': retraining_results
        })
        
        return jsonify({
            'success': True,
            'message': 'Model retraining completed successfully',
            'results': retraining_results
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Retrain model error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_management.route('/model/performance', methods=['GET'])
@jwt_required()
def get_model_performance():
    """Get model performance metrics over time"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time range
        days = request.args.get('days', 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get traffic logs with predictions
        traffic_logs = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date
        ).order_by(TrafficLog.timestamp.desc()).all()
        
        # Calculate daily performance metrics
        daily_metrics = {}
        
        for log in traffic_logs:
            date_key = log.timestamp.date().isoformat()
            
            if date_key not in daily_metrics:
                daily_metrics[date_key] = {
                    'total_requests': 0,
                    'bot_requests': 0,
                    'human_requests': 0,
                    'blocked_requests': 0,
                    'accuracy': 0.0
                }
            
            daily_metrics[date_key]['total_requests'] += 1
            
            if log.is_bot:
                daily_metrics[date_key]['bot_requests'] += 1
            else:
                daily_metrics[date_key]['human_requests'] += 1
            
            if log.action_taken == 'block':
                daily_metrics[date_key]['blocked_requests'] += 1
        
        # Convert to list format
        performance_data = [
            {
                'date': date,
                'metrics': metrics
            }
            for date, metrics in daily_metrics.items()
        ]
        
        # Sort by date
        performance_data.sort(key=lambda x: x['date'])
        
        return jsonify({
            'success': True,
            'performance_data': performance_data,
            'total_days': len(performance_data)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get model performance error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_management.route('/model/features', methods=['GET'])
@jwt_required()
def get_feature_importance():
    """Get feature importance from the trained model"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        model_info = bot_detection_model.get_model_info()
        
        if not model_info['is_trained']:
            return jsonify({'error': 'Model is not trained'}), 400
        
        feature_importance = model_info['metadata'].get('feature_importance', {})
        
        # Sort features by importance
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return jsonify({
            'success': True,
            'feature_importance': dict(sorted_features[:20]),  # Top 20 features
            'total_features': len(feature_importance)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get feature importance error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_management.route('/model/status', methods=['GET'])
@jwt_required()
def get_model_status():
    """Get comprehensive model status and health"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        model_info = bot_detection_model.get_model_info()
        
        # Get recent traffic statistics
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        recent_stats = db.session.query(
            func.count(TrafficLog.id).label('total_requests'),
            func.sum(db.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bot_requests'),
            func.sum(db.case([(TrafficLog.action_taken == 'block', 1)], else_=0)).label('blocked_requests')
        ).join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date
        ).first()
        
        status = {
            'model': {
                'is_trained': model_info['is_trained'],
                'last_training': model_info['metadata'].get('training_date'),
                'accuracy': model_info['metadata'].get('test_accuracy', 0),
                'training_samples': model_info['metadata'].get('training_samples', 0)
            },
            'recent_activity': {
                'total_requests': recent_stats.total_requests or 0,
                'bot_requests': recent_stats.bot_requests or 0,
                'blocked_requests': recent_stats.blocked_requests or 0,
                'bot_detection_rate': (recent_stats.bot_requests / recent_stats.total_requests * 100) if recent_stats.total_requests else 0
            },
            'system': {
                'model_path': model_info['model_path'],
                'model_type': model_info['model_type'],
                'last_updated': datetime.utcnow().isoformat()
            }
        }
        
        return jsonify({
            'success': True,
            'status': status
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get model status error: {str(e)}")
        return jsonify({'error': str(e)}), 500
