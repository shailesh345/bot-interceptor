# Billing Integration System
import stripe
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from flask import current_app
from app.models import User, Tenant, Subscription, Domain, TrafficLog
from app import db
from decimal import Decimal

@dataclass
class BillingPlan:
    name: str
    stripe_price_id: str
    monthly_price: Decimal
    annual_price: Decimal
    features: Dict[str, Any]
    limits: Dict[str, int]

@dataclass
class UsageMetrics:
    tenant_id: int
    period_start: datetime
    period_end: datetime
    domains_count: int
    total_requests: int
    blocked_requests: int
    bot_requests: int
    storage_used: int
    bandwidth_used: int

class BillingService:
    """
    Service for managing billing, subscriptions, and usage tracking
    """
    
    def __init__(self):
        # Initialize Stripe
        stripe.api_key = current_app.config.get('STRIPE_SECRET_KEY')
        
        # Define billing plans
        self.plans = {
            'starter': BillingPlan(
                name='Starter',
                stripe_price_id='price_starter_monthly',
                monthly_price=Decimal('29.00'),
                annual_price=Decimal('290.00'),
                features={
                    'domains': 5,
                    'rules': 20,
                    'analytics_retention': 30,
                    'support': 'email',
                    'api_access': True,
                    'custom_rules': False,
                    'white_label': False
                },
                limits={
                    'domains': 5,
                    'monthly_requests': 100000,
                    'storage_mb': 1000,
                    'bandwidth_gb': 10
                }
            ),
            'professional': BillingPlan(
                name='Professional',
                stripe_price_id='price_professional_monthly',
                monthly_price=Decimal('99.00'),
                annual_price=Decimal('990.00'),
                features={
                    'domains': 25,
                    'rules': 100,
                    'analytics_retention': 90,
                    'support': 'priority',
                    'api_access': True,
                    'custom_rules': True,
                    'white_label': False
                },
                limits={
                    'domains': 25,
                    'monthly_requests': 1000000,
                    'storage_mb': 10000,
                    'bandwidth_gb': 100
                }
            ),
            'enterprise': BillingPlan(
                name='Enterprise',
                stripe_price_id='price_enterprise_monthly',
                monthly_price=Decimal('299.00'),
                annual_price=Decimal('2990.00'),
                features={
                    'domains': 100,
                    'rules': 500,
                    'analytics_retention': 365,
                    'support': 'dedicated',
                    'api_access': True,
                    'custom_rules': True,
                    'white_label': True
                },
                limits={
                    'domains': 100,
                    'monthly_requests': 10000000,
                    'storage_mb': 100000,
                    'bandwidth_gb': 1000
                }
            )
        }
    
    def get_available_plans(self) -> List[Dict[str, Any]]:
        """Get all available billing plans"""
        return [{
            'id': plan_id,
            'name': plan.name,
            'monthly_price': float(plan.monthly_price),
            'annual_price': float(plan.annual_price),
            'features': plan.features,
            'limits': plan.limits
        } for plan_id, plan in self.plans.items()]
    
    def get_tenant_subscription(self, tenant_id: int) -> Optional[Subscription]:
        """Get current subscription for tenant"""
        return Subscription.query.filter_by(
            tenant_id=tenant_id,
            status='active'
        ).first()
    
    def calculate_usage_metrics(self, tenant_id: int, period_start: datetime, period_end: datetime) -> UsageMetrics:
        """Calculate usage metrics for a tenant in a given period"""
        try:
            # Get tenant domains
            domains = Domain.query.filter_by(tenant_id=tenant_id).all()
            domain_ids = [domain.id for domain in domains]
            
            # Calculate traffic metrics
            traffic_stats = db.session.query(
                db.func.count(TrafficLog.id).label('total_requests'),
                db.func.sum(db.case([(TrafficLog.action_taken == 'block', 1)], else_=0)).label('blocked_requests'),
                db.func.sum(db.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bot_requests'),
                db.func.sum(TrafficLog.response_size).label('bandwidth_used')
            ).filter(
                TrafficLog.domain_id.in_(domain_ids) if domain_ids else False,
                TrafficLog.timestamp >= period_start,
                TrafficLog.timestamp < period_end
            ).first()
            
            return UsageMetrics(
                tenant_id=tenant_id,
                period_start=period_start,
                period_end=period_end,
                domains_count=len(domains),
                total_requests=traffic_stats.total_requests or 0,
                blocked_requests=traffic_stats.blocked_requests or 0,
                bot_requests=traffic_stats.bot_requests or 0,
                storage_used=0,  # Placeholder - would calculate actual storage
                bandwidth_used=traffic_stats.bandwidth_used or 0
            )
            
        except Exception as e:
            current_app.logger.error(f"Failed to calculate usage metrics: {e}")
            return UsageMetrics(
                tenant_id=tenant_id,
                period_start=period_start,
                period_end=period_end,
                domains_count=0,
                total_requests=0,
                blocked_requests=0,
                bot_requests=0,
                storage_used=0,
                bandwidth_used=0
            )
    
    def check_usage_limits(self, tenant_id: int) -> Dict[str, Any]:
        """Check if tenant is within usage limits"""
        subscription = self.get_tenant_subscription(tenant_id)
        
        if not subscription:
            return {
                'within_limits': False,
                'message': 'No active subscription found'
            }
        
        plan = self.plans.get(subscription.plan_name.lower())
        if not plan:
            return {
                'within_limits': False,
                'message': 'Unknown subscription plan'
            }
        
        # Calculate current period usage
        current_period_start = subscription.current_period_start
        current_period_end = subscription.current_period_end
        
        usage = self.calculate_usage_metrics(tenant_id, current_period_start, current_period_end)
        
        # Check limits
        limits_status = {
            'domains': {
                'used': usage.domains_count,
                'limit': plan.limits['domains'],
                'percentage': (usage.domains_count / plan.limits['domains']) * 100
            },
            'monthly_requests': {
                'used': usage.total_requests,
                'limit': plan.limits['monthly_requests'],
                'percentage': (usage.total_requests / plan.limits['monthly_requests']) * 100
            },
            'storage': {
                'used': usage.storage_used,
                'limit': plan.limits['storage_mb'],
                'percentage': (usage.storage_used / plan.limits['storage_mb']) * 100
            },
            'bandwidth': {
                'used': usage.bandwidth_used,
                'limit': plan.limits['bandwidth_gb'] * 1024 * 1024 * 1024,  # Convert to bytes
                'percentage': (usage.bandwidth_used / (plan.limits['bandwidth_gb'] * 1024 * 1024 * 1024)) * 100
            }
        }
        
        # Check if any limit is exceeded
        within_limits = all(status['percentage'] <= 100 for status in limits_status.values())
        
        return {
            'within_limits': within_limits,
            'plan': plan.name,
            'limits_status': limits_status,
            'usage': {
                'domains_count': usage.domains_count,
                'total_requests': usage.total_requests,
                'blocked_requests': usage.blocked_requests,
                'bot_requests': usage.bot_requests,
                'storage_used': usage.storage_used,
                'bandwidth_used': usage.bandwidth_used
            }
        }
    
    def create_stripe_customer(self, user: User) -> Optional[str]:
        """Create a Stripe customer for the user"""
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=f"{user.first_name} {user.last_name}",
                metadata={
                    'user_id': user.uuid,
                    'tenant_id': user.tenant_id
                }
            )
            return customer.id
        except Exception as e:
            current_app.logger.error(f"Failed to create Stripe customer: {e}")
            return None
    
    def create_subscription(self, tenant_id: int, plan_id: str, billing_cycle: str = 'monthly') -> Dict[str, Any]:
        """Create a new subscription"""
        try:
            tenant = Tenant.query.get(tenant_id)
            if not tenant:
                return {
                    'success': False,
                    'message': 'Tenant not found'
                }
            
            plan = self.plans.get(plan_id.lower())
            if not plan:
                return {
                    'success': False,
                    'message': 'Invalid plan'
                }
            
            # Get or create Stripe customer
            user = User.query.filter_by(tenant_id=tenant_id).first()
            if not user:
                return {
                    'success': False,
                    'message': 'User not found'
                }
            
            customer_id = self.create_stripe_customer(user)
            if not customer_id:
                return {
                    'success': False,
                    'message': 'Failed to create customer'
                }
            
            # Create Stripe subscription
            price_id = plan.stripe_price_id
            if billing_cycle == 'annual':
                price_id = price_id.replace('monthly', 'annual')
            
            stripe_subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{'price': price_id}],
                metadata={
                    'tenant_id': tenant_id,
                    'plan_id': plan_id
                }
            )
            
            # Create local subscription record
            subscription = Subscription(
                tenant_id=tenant_id,
                stripe_subscription_id=stripe_subscription.id,
                plan_name=plan.name,
                plan_type=billing_cycle,
                status='active',
                current_period_start=datetime.fromtimestamp(stripe_subscription.current_period_start),
                current_period_end=datetime.fromtimestamp(stripe_subscription.current_period_end),
                amount=plan.monthly_price if billing_cycle == 'monthly' else plan.annual_price,
                currency='USD'
            )
            
            db.session.add(subscription)
            db.session.commit()
            
            return {
                'success': True,
                'subscription': {
                    'id': subscription.uuid,
                    'plan': plan.name,
                    'status': subscription.status,
                    'current_period_start': subscription.current_period_start.isoformat(),
                    'current_period_end': subscription.current_period_end.isoformat(),
                    'amount': float(subscription.amount)
                }
            }
            
        except Exception as e:
            current_app.logger.error(f"Failed to create subscription: {e}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Failed to create subscription'
            }
    
    def update_subscription(self, tenant_id: int, new_plan_id: str) -> Dict[str, Any]:
        """Update existing subscription"""
        try:
            current_subscription = self.get_tenant_subscription(tenant_id)
            if not current_subscription:
                return {
                    'success': False,
                    'message': 'No active subscription found'
                }
            
            new_plan = self.plans.get(new_plan_id.lower())
            if not new_plan:
                return {
                    'success': False,
                    'message': 'Invalid plan'
                }
            
            # Update Stripe subscription
            stripe_subscription = stripe.Subscription.retrieve(current_subscription.stripe_subscription_id)
            stripe.Subscription.modify(
                current_subscription.stripe_subscription_id,
                items=[{
                    'id': stripe_subscription['items']['data'][0]['id'],
                    'price': new_plan.stripe_price_id,
                }],
                proration_behavior='create_prorations'
            )
            
            # Update local subscription
            current_subscription.plan_name = new_plan.name
            current_subscription.amount = new_plan.monthly_price
            current_subscription.updated_at = datetime.now()
            
            db.session.commit()
            
            return {
                'success': True,
                'subscription': {
                    'id': current_subscription.uuid,
                    'plan': current_subscription.plan_name,
                    'status': current_subscription.status,
                    'amount': float(current_subscription.amount)
                }
            }
            
        except Exception as e:
            current_app.logger.error(f"Failed to update subscription: {e}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Failed to update subscription'
            }
    
    def cancel_subscription(self, tenant_id: int) -> Dict[str, Any]:
        """Cancel subscription"""
        try:
            subscription = self.get_tenant_subscription(tenant_id)
            if not subscription:
                return {
                    'success': False,
                    'message': 'No active subscription found'
                }
            
            # Cancel Stripe subscription
            stripe.Subscription.delete(subscription.stripe_subscription_id)
            
            # Update local subscription
            subscription.status = 'cancelled'
            subscription.updated_at = datetime.now()
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Subscription cancelled successfully'
            }
            
        except Exception as e:
            current_app.logger.error(f"Failed to cancel subscription: {e}")
            db.session.rollback()
            return {
                'success': False,
                'message': 'Failed to cancel subscription'
            }
    
    def get_billing_history(self, tenant_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """Get billing history for tenant"""
        try:
            subscription = self.get_tenant_subscription(tenant_id)
            if not subscription:
                return []
            
            # Get invoices from Stripe
            invoices = stripe.Invoice.list(
                customer=subscription.stripe_subscription_id,
                limit=limit
            )
            
            return [{
                'id': invoice.id,
                'amount': invoice.amount_paid / 100,  # Convert from cents
                'currency': invoice.currency,
                'status': invoice.status,
                'period_start': datetime.fromtimestamp(invoice.period_start).isoformat(),
                'period_end': datetime.fromtimestamp(invoice.period_end).isoformat(),
                'invoice_date': datetime.fromtimestamp(invoice.created).isoformat(),
                'invoice_url': invoice.hosted_invoice_url
            } for invoice in invoices.data]
            
        except Exception as e:
            current_app.logger.error(f"Failed to get billing history: {e}")
            return []
    
    def generate_usage_report(self, tenant_id: int, period_start: datetime, period_end: datetime) -> Dict[str, Any]:
        """Generate detailed usage report"""
        try:
            usage = self.calculate_usage_metrics(tenant_id, period_start, period_end)
            subscription = self.get_tenant_subscription(tenant_id)
            
            # Get daily breakdown
            daily_stats = []
            current_date = period_start.date()
            end_date = period_end.date()
            
            while current_date <= end_date:
                day_start = datetime.combine(current_date, datetime.min.time())
                day_end = day_start + timedelta(days=1)
                
                day_usage = self.calculate_usage_metrics(tenant_id, day_start, day_end)
                
                daily_stats.append({
                    'date': current_date.isoformat(),
                    'total_requests': day_usage.total_requests,
                    'blocked_requests': day_usage.blocked_requests,
                    'bot_requests': day_usage.bot_requests,
                    'bandwidth_used': day_usage.bandwidth_used
                })
                
                current_date += timedelta(days=1)
            
            return {
                'period': {
                    'start': period_start.isoformat(),
                    'end': period_end.isoformat()
                },
                'subscription': {
                    'plan': subscription.plan_name if subscription else 'None',
                    'status': subscription.status if subscription else 'None'
                },
                'summary': {
                    'domains_count': usage.domains_count,
                    'total_requests': usage.total_requests,
                    'blocked_requests': usage.blocked_requests,
                    'bot_requests': usage.bot_requests,
                    'storage_used': usage.storage_used,
                    'bandwidth_used': usage.bandwidth_used
                },
                'daily_breakdown': daily_stats
            }
            
        except Exception as e:
            current_app.logger.error(f"Failed to generate usage report: {e}")
            return {
                'error': 'Failed to generate usage report'
            }

# Global billing service instance
billing_service = BillingService()
