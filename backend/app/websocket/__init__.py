"""
WebSocket module for real-time communication
Provides real-time updates for traffic monitoring, analytics, and alerts
"""

from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import json
from datetime import datetime

socketio = SocketIO(cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to Traffic Interceptor WebSocket'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")

@socketio.on('join_room')
def handle_join_room(data):
    """Join a specific room for targeted updates"""
    room = data.get('room')
    if room:
        join_room(room)
        emit('room_joined', {'room': room, 'message': f'Joined room: {room}'})

@socketio.on('leave_room')
def handle_leave_room(data):
    """Leave a specific room"""
    room = data.get('room')
    if room:
        leave_room(room)
        emit('room_left', {'room': room, 'message': f'Left room: {room}'})

@socketio.on('subscribe_traffic')
def handle_subscribe_traffic(data):
    """Subscribe to traffic updates for a specific domain"""
    domain = data.get('domain', 'all')
    room = f'traffic_{domain}'
    join_room(room)
    emit('subscribed', {'type': 'traffic', 'domain': domain})

@socketio.on('subscribe_alerts')
def handle_subscribe_alerts(data):
    """Subscribe to system alerts"""
    join_room('alerts')
    emit('subscribed', {'type': 'alerts'})

@socketio.on('subscribe_analytics')
def handle_subscribe_analytics(data):
    """Subscribe to analytics updates"""
    join_room('analytics')
    emit('subscribed', {'type': 'analytics'})

@socketio.on('subscribe_notifications')
def handle_subscribe_notifications(data):
    """Subscribe to user notifications"""
    user_id = data.get('user_id')
    if user_id:
        room = f'notifications_{user_id}'
        join_room(room)
        emit('subscribed', {'type': 'notifications', 'user_id': user_id})

def broadcast_traffic_update(domain, data):
    """Broadcast traffic update to all subscribers"""
    room = f'traffic_{domain}'
    socketio.emit('traffic_update', data, room=room)
    
    # Also broadcast to general traffic room
    socketio.emit('traffic_update', data, room='traffic_all')

def broadcast_alert(alert_data):
    """Broadcast alert to all subscribers"""
    socketio.emit('new_alert', alert_data, room='alerts')

def broadcast_analytics_update(analytics_data):
    """Broadcast analytics update to all subscribers"""
    socketio.emit('analytics_update', analytics_data, room='analytics')

def broadcast_system_status(status_data):
    """Broadcast system status update"""
    socketio.emit('system_status', status_data, room='system')

def broadcast_bot_detection(bot_data):
    """Broadcast bot detection event"""
    socketio.emit('bot_detected', bot_data, room='bot_alerts')

def broadcast_notification(user_id, notification_data):
    """Broadcast notification to specific user"""
    room = f'notifications_{user_id}'
    socketio.emit('new_notification', notification_data, room=room)
