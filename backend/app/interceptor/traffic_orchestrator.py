#!/usr/bin/env python3
"""
Traffic Interception Orchestrator
Manages the complete flow: Add Domain -> Verify Domain -> Add Rule -> Run Interception -> Real-time Monitoring
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
from flask import current_app
from app.models import Domain, InterceptorRule, TrafficLog, BotProfile, Analytics
from app import db
from app.interceptor.traffic_interceptor import TrafficInterceptor
from app.interceptor.ml_bot_classifier import get_ml_bot_classifier
from app.interceptor.realtime_processor import get_realtime_processor
from app.ml.advanced_ml_engine import AdvancedMLEngine
import redis
import logging

logger = logging.getLogger(__name__)

@dataclass
class InterceptionFlow:
    """Represents a complete interception flow for a domain"""
    domain_id: int
    domain_name: str
    status: str  # 'setup', 'active', 'monitoring', 'completed'
    rules: List[Dict]
    interception_config: Dict
    monitoring_config: Dict
    created_at: datetime
    updated_at: datetime
    performance_metrics: Dict

class TrafficOrchestrator:
    """
    Orchestrates the complete traffic interception flow
    """
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        # Lazy initialization to avoid Flask context issues during import
        self._interceptor = None
        self._ml_classifier = None
        self._realtime_processor = None
        self._ml_engine = None
        self.active_flows = {}
        self.flow_history = {}
    
    @property
    def interceptor(self):
        if self._interceptor is None:
            from app.interceptor.traffic_interceptor import TrafficInterceptor
            self._interceptor = TrafficInterceptor()
        return self._interceptor
    
    @property
    def ml_classifier(self):
        if self._ml_classifier is None:
            from app.interceptor.ml_bot_classifier import get_ml_bot_classifier
            self._ml_classifier = get_ml_bot_classifier()
        return self._ml_classifier
    
    @property
    def realtime_processor(self):
        if self._realtime_processor is None:
            from app.interceptor.realtime_processor import get_realtime_processor
            self._realtime_processor = get_realtime_processor()
        return self._realtime_processor
    
    @property
    def ml_engine(self):
        if self._ml_engine is None:
            from app.ml.enhanced_ai_engine import get_enhanced_ai_engine
            self._ml_engine = get_enhanced_ai_engine()
        return self._ml_engine
        
    def create_interception_flow(self, domain_id: int, user_id: int) -> Dict:
        """Create a new interception flow for a domain"""
        try:
            domain = Domain.query.get(domain_id)
            if not domain:
                raise ValueError(f"Domain {domain_id} not found")
            
            if domain.status != 'verified':
                raise ValueError(f"Domain {domain.domain_name} must be verified before interception")
            
            # Create flow configuration
            flow = InterceptionFlow(
                domain_id=domain_id,
                domain_name=domain.domain_name,
                status='setup',
                rules=[],
                interception_config={
                    'enabled': True,
                    'mode': 'proxy',  # proxy, reverse_proxy, api_gateway
                    'ssl_enabled': domain.ssl_enabled,
                    'cdn_enabled': domain.cdn_enabled,
                    'rate_limiting': True,
                    'bot_detection': True,
                    'content_protection': True,
                    'geo_blocking': False,
                    'ddos_protection': True
                },
                monitoring_config={
                    'enabled': True,
                    'interval': 60,  # seconds
                    'metrics': ['requests', 'response_time', 'bot_detection', 'blocked_requests'],
                    'alerts': True,
                    'dashboard': True
                },
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                performance_metrics={}
            )
            
            # Store flow in Redis for persistence
            flow_key = f"interception_flow:{domain_id}"
            self.redis_client.setex(
                flow_key,
                86400,  # 24 hours TTL
                json.dumps({
                    'domain_id': flow.domain_id,
                    'domain_name': flow.domain_name,
                    'status': flow.status,
                    'rules': flow.rules,
                    'interception_config': flow.interception_config,
                    'monitoring_config': flow.monitoring_config,
                    'created_at': flow.created_at.isoformat(),
                    'updated_at': flow.updated_at.isoformat(),
                    'performance_metrics': flow.performance_metrics
                })
            )
            
            # Add to active flows
            self.active_flows[domain_id] = flow
            
            logger.info(f"Created interception flow for domain {domain.domain_name}")
            
            return {
                'success': True,
                'flow_id': domain_id,
                'status': flow.status,
                'message': f'Interception flow created for {domain.domain_name}'
            }
            
        except Exception as e:
            logger.error(f"Failed to create interception flow: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def add_rule_to_flow(self, domain_id: int, rule_data: Dict) -> Dict:
        """Add a rule to an existing interception flow"""
        try:
            flow = self.active_flows.get(domain_id)
            if not flow:
                # Try to load from Redis
                flow_data = self._load_flow_from_redis(domain_id)
                if not flow_data:
                    raise ValueError(f"Interception flow for domain {domain_id} not found")
                flow = flow_data
            
            # Validate rule data
            if not self._validate_rule_data(rule_data):
                raise ValueError("Invalid rule data")
            
            # Create rule in database
            rule = InterceptorRule(
                domain_id=domain_id,
                name=rule_data['name'],
                description=rule_data.get('description', ''),
                rule_type=rule_data['rule_type'],
                conditions=rule_data['conditions'],
                actions=rule_data['actions'],
                priority=rule_data.get('priority', 100),
                is_active=rule_data.get('is_active', True),
                created_by=rule_data.get('user_id'),
                created_at=datetime.utcnow()
            )
            
            db.session.add(rule)
            db.session.commit()
            
            # Add to flow rules
            flow.rules.append({
                'id': rule.id,
                'name': rule.name,
                'type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'is_active': rule.is_active
            })
            
            # Update flow in Redis
            self._update_flow_in_redis(domain_id, flow)
            
            logger.info(f"Added rule {rule.name} to flow for domain {flow.domain_name}")
            
            return {
                'success': True,
                'rule_id': rule.id,
                'message': f'Rule {rule.name} added successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to add rule to flow: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def start_interception(self, domain_id: int) -> Dict:
        """Start traffic interception for a domain"""
        try:
            flow = self.active_flows.get(domain_id)
            if not flow:
                flow = self._load_flow_from_redis(domain_id)
                if not flow:
                    raise ValueError(f"Interception flow for domain {domain_id} not found")
            
            if flow.status != 'setup':
                raise ValueError(f"Flow status must be 'setup' to start interception, current: {flow.status}")
            
            # Validate flow has rules
            if not flow.rules:
                raise ValueError("Cannot start interception without rules")
            
            # Initialize traffic interceptor
            self.interceptor.initialize_domain(domain_id, flow.interception_config)
            
            # Start real-time monitoring
            self.realtime_processor.start_domain_monitoring(
                domain_id,
                flow.monitoring_config
            )
            
            # Update flow status
            flow.status = 'active'
            flow.updated_at = datetime.utcnow()
            
            # Update in Redis
            self._update_flow_in_redis(domain_id, flow)
            
            # Update active flows
            self.active_flows[domain_id] = flow
            
            logger.info(f"Started traffic interception for domain {flow.domain_name}")
            
            return {
                'success': True,
                'status': flow.status,
                'message': f'Traffic interception started for {flow.domain_name}'
            }
            
        except Exception as e:
            logger.error(f"Failed to start interception: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def stop_interception(self, domain_id: int) -> Dict:
        """Stop traffic interception for a domain"""
        try:
            flow = self.active_flows.get(domain_id)
            if not flow:
                flow = self._load_flow_from_redis(domain_id)
                if not flow:
                    raise ValueError(f"Interception flow for domain {domain_id} not found")
            
            if flow.status != 'active':
                raise ValueError(f"Flow is not active, current status: {flow.status}")
            
            # Stop traffic interceptor
            self.interceptor.stop_domain(domain_id)
            
            # Stop real-time monitoring
            self.realtime_processor.stop_domain_monitoring(domain_id)
            
            # Update flow status
            flow.status = 'monitoring'
            flow.updated_at = datetime.utcnow()
            
            # Update in Redis
            self._update_flow_in_redis(domain_id, flow)
            
            # Update active flows
            self.active_flows[domain_id] = flow
            
            logger.info(f"Stopped traffic interception for domain {flow.domain_name}")
            
            return {
                'success': True,
                'status': flow.status,
                'message': f'Traffic interception stopped for {flow.domain_name}'
            }
            
        except Exception as e:
            logger.error(f"Failed to stop interception: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_flow_status(self, domain_id: int) -> Dict:
        """Get current status of an interception flow"""
        try:
            flow = self.active_flows.get(domain_id)
            if not flow:
                flow = self._load_flow_from_redis(domain_id)
                if not flow:
                    return {
                        'success': False,
                        'error': f"Interception flow for domain {domain_id} not found"
                    }
            
            # Get real-time metrics
            metrics = self.realtime_processor.get_domain_metrics(domain_id)
            
            return {
                'success': True,
                'flow': {
                    'domain_id': flow.domain_id,
                    'domain_name': flow.domain_name,
                    'status': flow.status,
                    'rules_count': len(flow.rules),
                    'interception_config': flow.interception_config,
                    'monitoring_config': flow.monitoring_config,
                    'created_at': flow.created_at.isoformat(),
                    'updated_at': flow.updated_at.isoformat(),
                    'performance_metrics': flow.performance_metrics
                },
                'real_time_metrics': metrics
            }
            
        except Exception as e:
            logger.error(f"Failed to get flow status: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_all_flows(self, user_id: int) -> Dict:
        """Get all interception flows for a user"""
        try:
            # Get user's domains
            user_domains = Domain.query.filter_by(owner_id=user_id).all()
            domain_ids = [d.id for d in user_domains]
            
            flows = []
            for domain_id in domain_ids:
                flow_data = self._load_flow_from_redis(domain_id)
                if flow_data:
                    flows.append(flow_data)
            
            return {
                'success': True,
                'flows': flows,
                'total': len(flows)
            }
            
        except Exception as e:
            logger.error(f"Failed to get all flows: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _validate_rule_data(self, rule_data: Dict) -> bool:
        """Validate rule data structure"""
        required_fields = ['name', 'rule_type', 'conditions', 'actions']
        
        for field in required_fields:
            if field not in rule_data:
                return False
        
        if not isinstance(rule_data['conditions'], list):
            return False
        
        if not isinstance(rule_data['actions'], list):
            return False
        
        return True
    
    def _load_flow_from_redis(self, domain_id: int) -> Optional[InterceptionFlow]:
        """Load flow data from Redis"""
        try:
            flow_key = f"interception_flow:{domain_id}"
            flow_data = self.redis_client.get(flow_key)
            
            if not flow_data:
                return None
            
            data = json.loads(flow_data)
            
            return InterceptionFlow(
                domain_id=data['domain_id'],
                domain_name=data['domain_name'],
                status=data['status'],
                rules=data['rules'],
                interception_config=data['interception_config'],
                monitoring_config=data['monitoring_config'],
                created_at=datetime.fromisoformat(data['created_at']),
                updated_at=datetime.fromisoformat(data['updated_at']),
                performance_metrics=data['performance_metrics']
            )
            
        except Exception as e:
            logger.error(f"Failed to load flow from Redis: {e}")
            return None
    
    def _update_flow_in_redis(self, domain_id: int, flow: InterceptionFlow):
        """Update flow data in Redis"""
        try:
            flow_key = f"interception_flow:{domain_id}"
            flow_data = {
                'domain_id': flow.domain_id,
                'domain_name': flow.domain_name,
                'status': flow.status,
                'rules': flow.rules,
                'interception_config': flow.interception_config,
                'monitoring_config': flow.monitoring_config,
                'created_at': flow.created_at.isoformat(),
                'updated_at': flow.updated_at.isoformat(),
                'performance_metrics': flow.performance_metrics
            }
            
            self.redis_client.setex(
                flow_key,
                86400,  # 24 hours TTL
                json.dumps(flow_data)
            )
            
        except Exception as e:
            logger.error(f"Failed to update flow in Redis: {e}")

# Global instance (lazy initialization)
_traffic_orchestrator = None

def get_traffic_orchestrator():
    """Get global traffic orchestrator instance"""
    global _traffic_orchestrator
    if _traffic_orchestrator is None:
        _traffic_orchestrator = TrafficOrchestrator()
    return _traffic_orchestrator
