import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Set, Optional
from flask_socketio import emit, join_room, leave_room
import threading
import time

# Try to import Redis, fallback to in-memory if not available
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

logger = logging.getLogger(__name__)

class TrafficStreamManager:
    def __init__(self, socketio):
        self.socketio = socketio
        self.clients: Dict[str, Set[str]] = {}  # client_id -> set of domain_ids
        self.domain_subscribers: Dict[str, Set[str]] = {}  # domain_id -> set of client_ids
        self.traffic_buffer: Dict[str, List[dict]] = {}  # domain_id -> list of traffic data
        self.stats_cache: Dict[str, dict] = {}  # domain_id -> stats
        self.buffer_size = 1000  # Keep last 1000 traffic records per domain
        
        # Initialize Redis connection if available
        self.redis_client = None
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
                # Test connection
                self.redis_client.ping()
                logger.info("Redis connection established successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed, falling back to in-memory storage: {e}")
                self.redis_client = None
        
        # Start background task for processing pending traffic
        self.running = True
        self.processing_thread = threading.Thread(target=self._process_pending_traffic, daemon=True)
        self.processing_thread.start()
    
    def handle_connect(self, client_id: str):
        """Handle new client connection"""
        self.clients[client_id] = set()
        logger.info(f"Client {client_id} connected")
    
    def handle_disconnect(self, client_id: str):
        """Handle client disconnection"""
        # Remove client from all domain subscriptions
        if client_id in self.clients:
            subscribed_domains = self.clients[client_id].copy()
            for domain_id in subscribed_domains:
                self._unsubscribe_from_domain(client_id, domain_id)
            del self.clients[client_id]
        logger.info(f"Client {client_id} disconnected")
    
    def subscribe_to_domains(self, client_id: str, domain_ids: List[str]):
        """Subscribe client to traffic updates for specific domains"""
        if client_id not in self.clients:
            self.clients[client_id] = set()
        
        for domain_id in domain_ids:
            # Convert domain_id to string for consistency
            domain_id_str = str(domain_id)
            
            if domain_id_str not in self.domain_subscribers:
                self.domain_subscribers[domain_id_str] = set()
            
            self.domain_subscribers[domain_id_str].add(client_id)
            self.clients[client_id].add(domain_id_str)
            
            # Join the client to the domain room
            from flask import request
            join_room(f"domain_{domain_id_str}", sid=client_id)
            
            # Send recent traffic history
            self._send_traffic_history(client_id, domain_id_str)
        
        logger.info(f"Client {client_id} subscribed to domains: {domain_ids}")
        logger.info(f"Domain subscribers after subscription: {self.domain_subscribers}")
    
    def unsubscribe_from_domains(self, client_id: str, domain_ids: List[str]):
        """Unsubscribe client from traffic updates for specific domains"""
        for domain_id in domain_ids:
            self._unsubscribe_from_domain(client_id, domain_id)
        
        logger.info(f"Client {client_id} unsubscribed from domains: {domain_ids}")
    
    def _unsubscribe_from_domain(self, client_id: str, domain_id: str):
        """Helper method to unsubscribe from a single domain"""
        if domain_id in self.domain_subscribers and client_id in self.domain_subscribers[domain_id]:
            self.domain_subscribers[domain_id].remove(client_id)
            if not self.domain_subscribers[domain_id]:
                del self.domain_subscribers[domain_id]
        
        if client_id in self.clients and domain_id in self.clients[client_id]:
            self.clients[client_id].remove(domain_id)
        
        leave_room(f"domain_{domain_id}", sid=client_id)
    
    def add_traffic_data(self, domain_id: str, traffic_data: dict):
        """Add new traffic data and broadcast to subscribers"""
        # Ensure domain_id is string for consistency
        domain_id_str = str(domain_id)
        logger.info(f"Adding traffic data for domain {domain_id_str} (original: {domain_id}, type: {type(domain_id)})")
        logger.info(f"Current domain subscribers: {list(self.domain_subscribers.keys())}")
        
        # Store in memory buffer
        if domain_id_str not in self.traffic_buffer:
            self.traffic_buffer[domain_id_str] = []
        
        self.traffic_buffer[domain_id_str].append(traffic_data)
        
        # Keep only the last buffer_size records
        if len(self.traffic_buffer[domain_id_str]) > self.buffer_size:
            self.traffic_buffer[domain_id_str] = self.traffic_buffer[domain_id_str][-self.buffer_size:]
        
        # Store in Redis if available
        if self.redis_client:
            try:
                key = f"traffic:{domain_id_str}:{int(time.time())}"
                self.redis_client.setex(key, 3600, json.dumps(traffic_data))  # Expire in 1 hour
                
                # Update stats in Redis
                stats_key = f"stats:{domain_id_str}"
                current_stats = self._get_current_stats(domain_id_str)
                self.redis_client.setex(stats_key, 300, json.dumps(current_stats))  # Expire in 5 minutes
            except Exception as e:
                logger.error(f"Failed to store traffic data in Redis: {e}")
        
        # Broadcast to subscribers
        self._broadcast_traffic(domain_id_str, traffic_data)
        
        # Update stats cache
        self._update_stats(domain_id_str, traffic_data)
    
    def _broadcast_traffic(self, domain_id: str, traffic_data: dict):
        """Broadcast traffic data to all subscribers of a domain"""
        if domain_id in self.domain_subscribers:
            room = f"domain_{domain_id}"
            subscribers = self.domain_subscribers[domain_id]
            logger.info(f"Broadcasting traffic for domain {domain_id} to room {room} with {len(subscribers)} subscribers: {list(subscribers)}")
            
            self.socketio.emit('traffic_update', {
                'domain_id': domain_id,
                'traffic': traffic_data
            }, room=room)
        else:
            logger.warning(f"No subscribers found for domain {domain_id}")
            logger.info(f"Available domains with subscribers: {list(self.domain_subscribers.keys())}")
    
    def _send_traffic_history(self, client_id: str, domain_id: str):
        """Send recent traffic history to a client"""
        if domain_id in self.traffic_buffer:
            # Send last 50 records
            recent_traffic = self.traffic_buffer[domain_id][-50:]
            self.socketio.emit('traffic_history', {
                'domain_id': domain_id,
                'traffic': recent_traffic
            }, room=client_id)
    
    def _update_stats(self, domain_id: str, traffic_data: dict):
        """Update statistics for a domain"""
        if domain_id not in self.stats_cache:
            self.stats_cache[domain_id] = {
                'total_requests': 0,
                'unique_ips': set(),
                'bot_requests': 0,
                'error_requests': 0,
                'last_updated': datetime.utcnow()
            }
        
        stats = self.stats_cache[domain_id]
        stats['total_requests'] += 1
        stats['unique_ips'].add(traffic_data.get('ip', 'unknown'))
        
        if traffic_data.get('is_bot', False):
            stats['bot_requests'] += 1
        
        if traffic_data.get('status_code', 200) >= 400:
            stats['error_requests'] += 1
        
        stats['last_updated'] = datetime.utcnow()
    
    def _get_current_stats(self, domain_id: str) -> dict:
        """Get current statistics for a domain"""
        if domain_id not in self.stats_cache:
            return {
                'total_requests': 0,
                'unique_ips': 0,
                'bot_requests': 0,
                'error_requests': 0,
                'last_updated': None
            }
        
        stats = self.stats_cache[domain_id].copy()
        # Convert set to count for JSON serialization
        stats['unique_ips'] = len(stats['unique_ips'])
        stats['last_updated'] = stats['last_updated'].isoformat() if stats['last_updated'] else None
        
        return stats
    
    def get_domain_stats(self, domain_id: str) -> dict:
        """Get statistics for a specific domain"""
        # Try Redis first
        if self.redis_client:
            try:
                stats_key = f"stats:{domain_id}"
                cached_stats = self.redis_client.get(stats_key)
                if cached_stats:
                    return json.loads(cached_stats)
            except Exception as e:
                logger.error(f"Failed to get stats from Redis: {e}")
        
        # Fallback to memory cache
        return self._get_current_stats(domain_id)
    
    def _process_pending_traffic(self):
        """Background task to process any pending traffic data"""
        while self.running:
            try:
                # This could be extended to process queued traffic data
                # For now, just sleep to keep the thread alive
                time.sleep(1)
            except Exception as e:
                logger.error(f"Error in traffic processing thread: {e}")
    
    def stop(self):
        """Stop the traffic stream manager"""
        self.running = False
        if self.processing_thread.is_alive():
            self.processing_thread.join(timeout=1)
        
        # Close Redis connection if available
        if self.redis_client:
            try:
                self.redis_client.close()
            except Exception as e:
                logger.error(f"Error closing Redis connection: {e}")
