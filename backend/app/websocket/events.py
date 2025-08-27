"""
WebSocket event handlers for real-time communication
"""
from flask_socketio import emit, join_room, leave_room
from flask import request, current_app
from flask_jwt_extended import decode_token
import logging

logger = logging.getLogger(__name__)

# Global reference to traffic stream manager
traffic_stream_manager = None

def init_websocket_events(socketio, tsm):
    """Initialize WebSocket event handlers"""
    global traffic_stream_manager
    traffic_stream_manager = tsm
    
    @socketio.on('connect')
    def handle_connect():
        """Handle client connection"""
        try:
            client_id = request.sid
            current_app.logger.info(f"Client {client_id} attempting to connect")
            
            # Initialize client in traffic stream manager
            if traffic_stream_manager:
                traffic_stream_manager.handle_connect(client_id)
                emit('connected', {'status': 'connected', 'client_id': client_id})
            else:
                emit('error', {'message': 'Traffic stream manager not available'})
                
        except Exception as e:
            current_app.logger.error(f"Connection error: {e}")
            emit('error', {'message': 'Connection failed'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        try:
            client_id = request.sid
            current_app.logger.info(f"Client {client_id} disconnecting")
            
            if traffic_stream_manager:
                traffic_stream_manager.handle_disconnect(client_id)
                
        except Exception as e:
            current_app.logger.error(f"Disconnect error: {e}")
    
    @socketio.on('subscribe_domains')
    def handle_subscribe_domains(data):
        """Handle domain subscription request"""
        try:
            client_id = request.sid
            domain_ids = data.get('domain_ids', [])
            
            if not domain_ids:
                emit('error', {'message': 'No domain IDs provided'})
                return
            
            current_app.logger.info(f"Client {client_id} subscribing to domains: {domain_ids}")
            
            if traffic_stream_manager:
                traffic_stream_manager.subscribe_to_domains(client_id, domain_ids)
                emit('subscribed', {
                    'status': 'subscribed',
                    'domain_ids': domain_ids,
                    'message': f'Subscribed to {len(domain_ids)} domains'
                })
            else:
                emit('error', {'message': 'Traffic stream manager not available'})
                
        except Exception as e:
            current_app.logger.error(f"Subscribe error: {e}")
            emit('error', {'message': 'Subscription failed'})
    
    @socketio.on('unsubscribe_domains')
    def handle_unsubscribe_domains(data):
        """Handle domain unsubscription request"""
        try:
            client_id = request.sid
            domain_ids = data.get('domain_ids', [])
            
            if not domain_ids:
                emit('error', {'message': 'No domain IDs provided'})
                return
            
            current_app.logger.info(f"Client {client_id} unsubscribing from domains: {domain_ids}")
            
            if traffic_stream_manager:
                traffic_stream_manager.unsubscribe_from_domains(client_id, domain_ids)
                emit('unsubscribed', {
                    'status': 'unsubscribed',
                    'domain_ids': domain_ids,
                    'message': f'Unsubscribed from {len(domain_ids)} domains'
                })
            else:
                emit('error', {'message': 'Traffic stream manager not available'})
                
        except Exception as e:
            current_app.logger.error(f"Unsubscribe error: {e}")
            emit('error', {'message': 'Unsubscription failed'})
    
    @socketio.on('request_traffic_history')
    def handle_traffic_history_request(data):
        """Handle request for traffic history"""
        try:
            client_id = request.sid
            domain_id = data.get('domain_id')
            
            if not domain_id:
                emit('error', {'message': 'No domain ID provided'})
                return
            
            current_app.logger.info(f"Client {client_id} requesting traffic history for domain {domain_id}")
            
            if traffic_stream_manager:
                # Send traffic history
                traffic_stream_manager._send_traffic_history(client_id, domain_id)
                
                # Send current stats
                stats = traffic_stream_manager.get_domain_stats(domain_id)
                emit('domain_stats', {
                    'domain_id': domain_id,
                    'stats': stats
                })
            else:
                emit('error', {'message': 'Traffic stream manager not available'})
                
        except Exception as e:
            current_app.logger.error(f"Traffic history request error: {e}")
            emit('error', {'message': 'Failed to get traffic history'})
    
    @socketio.on('ping')
    def handle_ping():
        """Handle ping for connection testing"""
        emit('pong', {'timestamp': 'pong'})
    
    @socketio.on('error')
    def handle_error(data):
        """Handle client-side errors"""
        current_app.logger.warning(f"Client error: {data}")
        emit('error_received', {'status': 'error logged'})

def get_traffic_stream_manager():
    """Get the traffic stream manager instance"""
    return traffic_stream_manager
