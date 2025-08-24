"""
Notifications API
Provides real-time notifications and alert management
"""

import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc, and_
from ..models import User, Domain, TrafficLog, Notification
from .. import db
from ..websocket import broadcast_notification

notifications = Blueprint('notifications', __name__)

@notifications.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user's notifications"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Get filter parameters
        status = request.args.get('status')  # read, unread, all
        notification_type = request.args.get('type')
        
        # Build query
        query = Notification.query.filter_by(user_id=user.id)
        
        # Apply filters
        if status == 'read':
            query = query.filter(Notification.is_read == True)
        elif status == 'unread':
            query = query.filter(Notification.is_read == False)
        
        if notification_type:
            query = query.filter(Notification.notification_type == notification_type)
        
        # Order by created_at descending
        query = query.order_by(Notification.created_at.desc())
        
        # Paginate
        notifications = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'success': True,
            'notifications': [notification.to_dict() for notification in notifications.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': notifications.total,
                'pages': notifications.pages,
                'has_next': notifications.has_next,
                'has_prev': notifications.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get notifications error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@notifications.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        notification = Notification.query.filter_by(
            id=notification_id, 
            user_id=user.id
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Mark notification read error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@notifications.route('/notifications/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all user's notifications as read"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Mark all unread notifications as read
        unread_notifications = Notification.query.filter_by(
            user_id=user.id,
            is_read=False
        ).all()
        
        for notification in unread_notifications:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Marked {len(unread_notifications)} notifications as read'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Mark all notifications read error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@notifications.route('/notifications/settings', methods=['GET'])
@jwt_required()
def get_notification_settings():
    """Get user's notification settings"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's notification preferences
        settings = {
            'email_notifications': getattr(user, 'email_notifications', True),
            'push_notifications': getattr(user, 'push_notifications', True),
            'sms_notifications': getattr(user, 'sms_notifications', False),
            'notification_types': {
                'security_alerts': getattr(user, 'security_alerts_enabled', True),
                'traffic_alerts': getattr(user, 'traffic_alerts_enabled', True),
                'performance_alerts': getattr(user, 'performance_alerts_enabled', True),
                'bot_detection': getattr(user, 'bot_detection_alerts', True),
                'system_updates': getattr(user, 'system_updates_enabled', False)
            }
        }
        
        return jsonify({
            'success': True,
            'settings': settings
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get notification settings error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@notifications.route('/notifications/settings', methods=['PUT'])
@jwt_required()
def update_notification_settings():
    """Update user's notification settings"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update notification preferences
        if 'email_notifications' in data:
            user.email_notifications = data['email_notifications']
        
        if 'push_notifications' in data:
            user.push_notifications = data['push_notifications']
        
        if 'sms_notifications' in data:
            user.sms_notifications = data['sms_notifications']
        
        # Update notification type preferences
        if 'notification_types' in data:
            types = data['notification_types']
            if 'security_alerts' in types:
                user.security_alerts_enabled = types['security_alerts']
            if 'traffic_alerts' in types:
                user.traffic_alerts_enabled = types['traffic_alerts']
            if 'performance_alerts' in types:
                user.performance_alerts_enabled = types['performance_alerts']
            if 'bot_detection' in types:
                user.bot_detection_alerts = types['bot_detection']
            if 'system_updates' in types:
                user.system_updates_enabled = types['system_updates']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notification settings updated'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Update notification settings error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@notifications.route('/notifications/stats', methods=['GET'])
@jwt_required()
def get_notification_stats():
    """Get notification statistics for the user"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time range (default: last 30 days)
        days = request.args.get('days', 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get notification statistics
        total_notifications = Notification.query.filter(
            Notification.user_id == user.id,
            Notification.created_at >= start_date
        ).count()
        
        unread_notifications = Notification.query.filter(
            Notification.user_id == user.id,
            Notification.is_read == False,
            Notification.created_at >= start_date
        ).count()
        
        # Get notifications by type
        notifications_by_type = db.session.query(
            Notification.notification_type,
            func.count(Notification.id).label('count')
        ).filter(
            Notification.user_id == user.id,
            Notification.created_at >= start_date
        ).group_by(Notification.notification_type).all()
        
        # Get daily notification count
        daily_notifications = db.session.query(
            func.cast(Notification.created_at, db.Date).label('date'),
            func.count(Notification.id).label('count')
        ).filter(
            Notification.user_id == user.id,
            Notification.created_at >= start_date
        ).group_by(func.cast(Notification.created_at, db.Date)).order_by('date').all()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_notifications': total_notifications,
                'unread_notifications': unread_notifications,
                'read_notifications': total_notifications - unread_notifications,
                'notifications_by_type': [
                    {'type': nt.notification_type, 'count': nt.count} 
                    for nt in notifications_by_type
                ],
                'daily_notifications': [
                    {'date': str(dn.date), 'count': dn.count} 
                    for dn in daily_notifications
                ]
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get notification stats error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def create_notification(user_id, notification_type, title, message, data=None, priority='normal'):
    """
    Create a new notification
    
    Args:
        user_id: ID of the user to notify
        notification_type: Type of notification (security, traffic, performance, etc.)
        title: Notification title
        message: Notification message
        data: Additional data for the notification
        priority: Priority level (low, normal, high, critical)
    """
    try:
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {},
            priority=priority,
            is_read=False,
            created_at=datetime.utcnow()
        )
        
        db.session.add(notification)
        db.session.commit()
        
        # Broadcast notification via WebSocket
        broadcast_notification(user_id, notification.to_dict())
        
        return notification
        
    except Exception as e:
        current_app.logger.error(f"Create notification error: {str(e)}")
        db.session.rollback()
        return None

def create_security_alert(user_id, alert_type, details):
    """Create a security alert notification"""
    title = f"Security Alert: {alert_type}"
    message = f"A security alert has been detected: {details}"
    
    return create_notification(
        user_id=user_id,
        notification_type='security',
        title=title,
        message=message,
        data={'alert_type': alert_type, 'details': details},
        priority='high'
    )

def create_traffic_alert(user_id, alert_type, details):
    """Create a traffic alert notification"""
    title = f"Traffic Alert: {alert_type}"
    message = f"Traffic anomaly detected: {details}"
    
    return create_notification(
        user_id=user_id,
        notification_type='traffic',
        title=title,
        message=message,
        data={'alert_type': alert_type, 'details': details},
        priority='normal'
    )

def create_bot_detection_alert(user_id, bot_type, ip_address, domain):
    """Create a bot detection alert notification"""
    title = f"Bot Detection Alert: {bot_type}"
    message = f"Bot activity detected from {ip_address} on {domain}"
    
    return create_notification(
        user_id=user_id,
        notification_type='bot_detection',
        title=title,
        message=message,
        data={
            'bot_type': bot_type,
            'ip_address': ip_address,
            'domain': domain
        },
        priority='high'
    )

def create_performance_alert(user_id, alert_type, details):
    """Create a performance alert notification"""
    title = f"Performance Alert: {alert_type}"
    message = f"Performance issue detected: {details}"
    
    return create_notification(
        user_id=user_id,
        notification_type='performance',
        title=title,
        message=message,
        data={'alert_type': alert_type, 'details': details},
        priority='normal'
    )
