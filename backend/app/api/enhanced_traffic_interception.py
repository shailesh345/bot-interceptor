#!/usr/bin/env python3
"""
Enhanced Traffic Interception API
Provides endpoints for the complete flow: Add Domain -> Verify Domain -> Add Rule -> Run Interception -> Real-time Monitoring
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json
import time
from app.interceptor.traffic_orchestrator import get_traffic_orchestrator
from app.interceptor.ready_rules import get_ready_rules_system
from app.ml.enhanced_ai_engine import get_enhanced_ai_engine
from app.models import User, Domain, InterceptorRule, TrafficLog
from app import db

# Create blueprint
enhanced_traffic_interception_bp = Blueprint('enhanced_traffic_interception', __name__)

@enhanced_traffic_interception_bp.route('/api/enhanced/interception/flow/create', methods=['POST'])
@jwt_required()
def create_interception_flow():
    """Create a new interception flow for a domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        domain_id = data.get('domain_id')
        if not domain_id:
            return jsonify({'error': 'Domain ID is required'}), 400
        
        # Create interception flow
        orchestrator = get_traffic_orchestrator()
        result = orchestrator.create_interception_flow(domain_id, user.id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        current_app.logger.error(f"Create interception flow failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/interception/flow/<int:domain_id>/rules/add', methods=['POST'])
@jwt_required()
def add_rule_to_flow(domain_id):
    """Add a rule to an existing interception flow"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Add rule to flow
        orchestrator = get_traffic_orchestrator()
        result = orchestrator.add_rule_to_flow(domain_id, data)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        current_app.logger.error(f"Add rule to flow failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/interception/flow/<int:domain_id>/start', methods=['POST'])
@jwt_required()
def start_interception(domain_id):
    """Start traffic interception for a domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Start interception
        orchestrator = get_traffic_orchestrator()
        result = orchestrator.start_interception(domain_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        current_app.logger.error(f"Start interception failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/interception/flow/<int:domain_id>/stop', methods=['POST'])
@jwt_required()
def stop_interception(domain_id):
    """Stop traffic interception for a domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Stop interception
        orchestrator = get_traffic_orchestrator()
        result = orchestrator.stop_interception(domain_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        current_app.logger.error(f"Stop interception failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/interception/flow/<int:domain_id>/status', methods=['GET'])
@jwt_required()
def get_flow_status(domain_id):
    """Get current status of an interception flow"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get flow status
        orchestrator = get_traffic_orchestrator()
        result = orchestrator.get_flow_status(domain_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        current_app.logger.error(f"Get flow status failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/interception/flows', methods=['GET'])
@jwt_required()
def get_all_flows():
    """Get all interception flows for the current user"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all flows
        orchestrator = get_traffic_orchestrator()
        result = orchestrator.get_all_flows(user.id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        current_app.logger.error(f"Get all flows failed: {e}")
        return jsonify({'error': str(e)}), 500

# Ready-to-Use Rules Endpoints

@enhanced_traffic_interception_bp.route('/api/enhanced/rules/ready', methods=['GET'])
@jwt_required()
def get_ready_rules():
    """Get all ready-to-use rules"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get ready rules
        ready_rules_system = get_ready_rules_system()
        rules = ready_rules_system.get_all_rules()
        
        # Convert to serializable format
        serializable_rules = []
        for rule in rules:
            serializable_rules.append({
                'id': rule.id,
                'name': rule.name,
                'description': rule.description,
                'category': rule.category,
                'severity': rule.severity,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'tags': rule.tags,
                'use_count': rule.use_count,
                'success_rate': rule.success_rate,
                'created_at': rule.created_at.isoformat(),
                'updated_at': rule.updated_at.isoformat(),
                'is_verified': rule.is_verified,
                'documentation': rule.documentation,
                'examples': rule.examples
            })
        
        return jsonify({
            'success': True,
            'rules': serializable_rules,
            'total': len(serializable_rules)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get ready rules failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/rules/ready/categories', methods=['GET'])
@jwt_required()
def get_rule_categories():
    """Get all rule categories"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get categories
        ready_rules_system = get_ready_rules_system()
        categories = ready_rules_system.get_categories()
        
        return jsonify({
            'success': True,
            'categories': categories
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get rule categories failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/rules/ready/<rule_id>/apply', methods=['POST'])
@jwt_required()
def apply_ready_rule(rule_id):
    """Apply a ready-to-use rule to a domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        domain_id = data.get('domain_id')
        customizations = data.get('customizations', {})
        
        if not domain_id:
            return jsonify({'error': 'Domain ID is required'}), 400
        
        # Apply rule
        ready_rules_system = get_ready_rules_system()
        result = ready_rules_system.apply_rule_to_domain(rule_id, domain_id, customizations)
        
        if result['success']:
            # Add rule to flow
            orchestrator = get_traffic_orchestrator()
            rule_result = orchestrator.add_rule_to_flow(domain_id, result['rule_data'])
            
            if rule_result['success']:
                return jsonify({
                    'success': True,
                    'message': f'Rule {result["rule_data"]["name"]} applied successfully',
                    'rule_id': rule_result['rule_id']
                }), 200
            else:
                return jsonify({'error': rule_result['error']}), 400
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        current_app.logger.error(f"Apply ready rule failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/rules/ready/search', methods=['GET'])
@jwt_required()
def search_ready_rules():
    """Search ready-to-use rules"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get search parameters
        query = request.args.get('q', '')
        category = request.args.get('category')
        severity = request.args.get('severity')
        
        # Search rules
        ready_rules_system = get_ready_rules_system()
        rules = ready_rules_system.search_rules(query, category, severity)
        
        # Convert to serializable format
        serializable_rules = []
        for rule in rules:
            serializable_rules.append({
                'id': rule.id,
                'name': rule.name,
                'description': rule.description,
                'category': rule.category,
                'severity': rule.severity,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'tags': rule.tags,
                'use_count': rule.use_count,
                'success_rate': rule.success_rate,
                'created_at': rule.created_at.isoformat(),
                'updated_at': rule.updated_at.isoformat(),
                'is_verified': rule.is_verified,
                'documentation': rule.documentation,
                'examples': rule.examples
            })
        
        return jsonify({
            'success': True,
            'rules': serializable_rules,
            'total': len(serializable_rules),
            'query': query,
            'category': category,
            'severity': severity
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Search ready rules failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/rules/ready/popular', methods=['GET'])
@jwt_required()
def get_popular_rules():
    """Get most popular ready-to-use rules"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get limit parameter
        limit = request.args.get('limit', 10, type=int)
        
        # Get popular rules
        ready_rules_system = get_ready_rules_system()
        rules = ready_rules_system.get_popular_rules(limit)
        
        # Convert to serializable format
        serializable_rules = []
        for rule in rules:
            serializable_rules.append({
                'id': rule.id,
                'name': rule.name,
                'description': rule.description,
                'category': rule.category,
                'severity': rule.severity,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'tags': rule.tags,
                'use_count': rule.use_count,
                'success_rate': rule.success_rate,
                'created_at': rule.created_at.isoformat(),
                'updated_at': rule.updated_at.isoformat(),
                'is_verified': rule.is_verified,
                'documentation': rule.documentation,
                'examples': rule.examples
            })
        
        return jsonify({
            'success': True,
            'rules': serializable_rules,
            'total': len(serializable_rules)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get popular rules failed: {e}")
        return jsonify({'error': str(e)}), 500

# AI Engine Endpoints

@enhanced_traffic_interception_bp.route('/api/enhanced/ai/agents/status', methods=['GET'])
@jwt_required()
def get_ai_agents_status():
    """Get status of all AI agents"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has admin privileges
        if user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        # Get AI agents status
        ai_engine = get_enhanced_ai_engine()
        status = ai_engine.get_ai_agents_status()
        
        return jsonify({
            'success': True,
            'agents': status
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get AI agents status failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/ai/predict/bot', methods=['POST'])
@jwt_required()
def predict_bot():
    """Predict if traffic is from a bot using AI models"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        features = data.get('features')
        if not features:
            return jsonify({'error': 'Features are required'}), 400
        
        # Convert features to numpy array
        import numpy as np
        features_array = np.array(features)
        
        # Get prediction
        ai_engine = get_enhanced_ai_engine()
        prediction, confidence = ai_engine.predict_bot(features_array)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'confidence': confidence,
            'is_bot': bool(prediction)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Bot prediction failed: {e}")
        return jsonify({'error': str(e)}), 500

@enhanced_traffic_interception_bp.route('/api/enhanced/ai/statistics', methods=['GET'])
@jwt_required()
def get_ai_statistics():
    """Get AI engine statistics"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has admin privileges
        if user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        # Get AI statistics
        ai_engine = get_enhanced_ai_engine()
        ready_rules_system = get_ready_rules_system()
        
        ai_stats = {
            'agents_status': ai_engine.get_ai_agents_status(),
            'model_performance': ai_engine.get_model_performance(),
            'ready_rules_stats': ready_rules_system.get_rule_statistics()
        }
        
        return jsonify({
            'success': True,
            'statistics': ai_stats
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get AI statistics failed: {e}")
        return jsonify({'error': str(e)}), 500
