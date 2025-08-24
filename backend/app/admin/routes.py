"""
Admin routes for Traffic Interceptor SaaS
"""
from flask import Blueprint, request, jsonify
from app.models import User, Tenant, Domain, Subscription, InterceptorRule, TrafficLog, BotProfile, Analytics
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json

admin = Blueprint('admin', __name__)

def get_current_user():
    """Helper function to get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        return User.query.filter_by(uuid=user_id).first()
    except:
        return None

@admin.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search')
        role = request.args.get('role')
        status = request.args.get('status')
        
        query = User.query
        
        if search:
            query = query.filter(
                (User.username.ilike(f'%{search}%')) |
                (User.email.ilike(f'%{search}%')) |
                (User.first_name.ilike(f'%{search}%')) |
                (User.last_name.ilike(f'%{search}%'))
            )
        
        if role:
            query = query.filter(User.role == role)
        
        if status:
            query = query.filter(User.is_active == (status == 'active'))
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        user_list = []
        for user in users.items:
            user_data = {
                'id': user.uuid,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'is_verified': user.is_verified,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'tenant_id': user.tenant_id
            }
            user_list.append(user_data)
        
        return jsonify({
            'users': user_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages
            }
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching users', 'error': str(e)}), 500

@admin.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        user = User.query.filter_by(uuid=user_id).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_verified' in data:
            user.is_verified = data['is_verified']
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        
        db.session.commit()
        
        return jsonify({'message': 'User updated successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Error updating user', 'error': str(e)}), 500

@admin.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete user (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        user = User.query.filter_by(uuid=user_id).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if user.role == 'super_admin':
            return jsonify({'message': 'Cannot delete super admin'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        return jsonify({'message': 'Error deleting user', 'error': str(e)}), 500

@admin.route('/system/health', methods=['GET'])
@jwt_required()
def get_system_health():
    """Get system health status (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        # Get basic system stats
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        total_domains = Domain.query.count()
        active_domains = Domain.query.filter_by(status='active').count()
        
        # Get recent traffic
        recent_traffic = TrafficLog.query.filter(
            TrafficLog.created_at >= datetime.utcnow() - timedelta(hours=1)
        ).count()
        
        # Get recent bot detections
        recent_bots = BotProfile.query.filter(
            BotProfile.created_at >= datetime.utcnow() - timedelta(hours=1)
        ).count()
        
        system_health = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'metrics': {
                'total_users': total_users,
                'active_users': active_users,
                'total_domains': total_domains,
                'active_domains': active_domains,
                'recent_traffic': recent_traffic,
                'recent_bot_detections': recent_bots
            },
            'services': {
                'database': 'healthy',
                'redis': 'healthy',
                'websocket': 'healthy'
            }
        }
        
        return jsonify(system_health)
        
    except Exception as e:
        return jsonify({'message': 'Error fetching system health', 'error': str(e)}), 500

@admin.route('/system/stats', methods=['GET'])
@jwt_required()
def get_system_stats():
    """Get system statistics (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        # Get daily stats for last 30 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        daily_stats = []
        current_date = start_date
        
        while current_date <= end_date:
            next_date = current_date + timedelta(days=1)
            
            daily_traffic = TrafficLog.query.filter(
                TrafficLog.created_at >= current_date,
                TrafficLog.created_at < next_date
            ).count()
            
            daily_bots = BotProfile.query.filter(
                BotProfile.created_at >= current_date,
                BotProfile.created_at < next_date
            ).count()
            
            daily_stats.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'traffic': daily_traffic,
                'bots': daily_bots
            })
            
            current_date = next_date
        
        return jsonify({
            'daily_stats': daily_stats,
            'period': '30_days'
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching system stats', 'error': str(e)}), 500

@admin.route('/tenants', methods=['GET'])
@jwt_required()
def get_tenants():
    """Get all tenants (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        tenants = Tenant.query.all()
        tenant_list = []
        
        for tenant in tenants:
            user_count = User.query.filter_by(tenant_id=tenant.id).count()
            domain_count = Domain.query.filter_by(tenant_id=tenant.id).count()
            
            tenant_data = {
                'id': tenant.id,
                'name': tenant.name,
                'slug': tenant.slug,
                'domain': tenant.domain,
                'status': tenant.status,
                'created_at': tenant.created_at.isoformat(),
                'user_count': user_count,
                'domain_count': domain_count
            }
            tenant_list.append(tenant_data)
        
        return jsonify({'tenants': tenant_list})
        
    except Exception as e:
        return jsonify({'message': 'Error fetching tenants', 'error': str(e)}), 500
