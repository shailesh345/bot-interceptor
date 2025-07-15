# Billing API Endpoints
from flask import request, jsonify, current_app
from app.api import api
from app.models import Subscription, User, Tenant
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

def get_current_user():
    """Helper function to get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        return User.query.filter_by(uuid=user_id).first()
    except:
        return None

@api.route('/billing/plans', methods=['GET'])
@jwt_required()
def get_billing_plans():
    """Get available billing plans"""
    try:
        from app.interceptor.billing_service import billing_service
        plans = billing_service.get_available_plans()
        return jsonify({'plans': plans}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to get billing plans: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/subscription', methods=['GET'])
@jwt_required()
def get_current_subscription():
    """Get current subscription details"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        from app.interceptor.billing_service import billing_service
        
        subscription = billing_service.get_tenant_subscription(current_user.tenant_id)
        
        if not subscription:
            return jsonify({
                'subscription': None,
                'message': 'No active subscription'
            }), 200
        
        # Get usage limits
        limits_check = billing_service.check_usage_limits(current_user.tenant_id)
        
        return jsonify({
            'subscription': {
                'id': subscription.uuid,
                'plan_name': subscription.plan_name,
                'plan_type': subscription.plan_type,
                'status': subscription.status,
                'amount': float(subscription.amount),
                'currency': subscription.currency,
                'current_period_start': subscription.current_period_start.isoformat(),
                'current_period_end': subscription.current_period_end.isoformat(),
                'created_at': subscription.created_at.isoformat()
            },
            'usage': limits_check
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get subscription: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/subscription', methods=['POST'])
@jwt_required()
def create_subscription():
    """Create a new subscription"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        data = request.get_json()
        plan_id = data.get('plan_id')
        billing_cycle = data.get('billing_cycle', 'monthly')
        
        if not plan_id:
            return jsonify({'message': 'Plan ID is required'}), 400
        
        if billing_cycle not in ['monthly', 'annual']:
            return jsonify({'message': 'Invalid billing cycle'}), 400
        
        from app.interceptor.billing_service import billing_service
        
        # Check if subscription already exists
        existing_subscription = billing_service.get_tenant_subscription(current_user.tenant_id)
        if existing_subscription:
            return jsonify({'message': 'Subscription already exists'}), 400
        
        result = billing_service.create_subscription(
            current_user.tenant_id,
            plan_id,
            billing_cycle
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        current_app.logger.error(f"Failed to create subscription: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/subscription', methods=['PUT'])
@jwt_required()
def update_subscription():
    """Update existing subscription"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        data = request.get_json()
        new_plan_id = data.get('plan_id')
        
        if not new_plan_id:
            return jsonify({'message': 'Plan ID is required'}), 400
        
        from app.interceptor.billing_service import billing_service
        
        result = billing_service.update_subscription(
            current_user.tenant_id,
            new_plan_id
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        current_app.logger.error(f"Failed to update subscription: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/subscription', methods=['DELETE'])
@jwt_required()
def cancel_subscription():
    """Cancel subscription"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        from app.interceptor.billing_service import billing_service
        
        result = billing_service.cancel_subscription(current_user.tenant_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        current_app.logger.error(f"Failed to cancel subscription: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/usage', methods=['GET'])
@jwt_required()
def get_usage_metrics():
    """Get usage metrics for current billing period"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        from app.interceptor.billing_service import billing_service
        
        # Get current subscription
        subscription = billing_service.get_tenant_subscription(current_user.tenant_id)
        
        if not subscription:
            return jsonify({'message': 'No active subscription'}), 400
        
        # Get usage for current period
        usage = billing_service.calculate_usage_metrics(
            current_user.tenant_id,
            subscription.current_period_start,
            subscription.current_period_end
        )
        
        # Get limits check
        limits_check = billing_service.check_usage_limits(current_user.tenant_id)
        
        return jsonify({
            'period': {
                'start': subscription.current_period_start.isoformat(),
                'end': subscription.current_period_end.isoformat()
            },
            'usage': {
                'domains_count': usage.domains_count,
                'total_requests': usage.total_requests,
                'blocked_requests': usage.blocked_requests,
                'bot_requests': usage.bot_requests,
                'storage_used': usage.storage_used,
                'bandwidth_used': usage.bandwidth_used
            },
            'limits': limits_check
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get usage metrics: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/invoices', methods=['GET'])
@jwt_required()
def get_billing_history():
    """Get billing history and invoices"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        limit = request.args.get('limit', 10, type=int)
        
        from app.interceptor.billing_service import billing_service
        
        invoices = billing_service.get_billing_history(current_user.tenant_id, limit)
        
        return jsonify({
            'invoices': invoices,
            'total': len(invoices)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get billing history: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/usage-report', methods=['GET'])
@jwt_required()
def get_usage_report():
    """Generate usage report for specified period"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get date range from query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if not start_date_str or not end_date_str:
            # Default to current month
            now = datetime.now()
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        else:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        
        from app.interceptor.billing_service import billing_service
        
        report = billing_service.generate_usage_report(
            current_user.tenant_id,
            start_date,
            end_date
        )
        
        return jsonify(report), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to generate usage report: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    """Get saved payment methods"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # This would integrate with Stripe to get payment methods
        # For now, return placeholder data
        return jsonify({
            'payment_methods': [
                {
                    'id': 'pm_1234567890',
                    'type': 'card',
                    'card': {
                        'brand': 'visa',
                        'last4': '4242',
                        'exp_month': 12,
                        'exp_year': 2025
                    },
                    'is_default': True
                }
            ]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get payment methods: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/billing/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhooks"""
    try:
        payload = request.get_data(as_text=True)
        sig_header = request.headers.get('Stripe-Signature')
        
        # Verify webhook signature
        # endpoint_secret = current_app.config.get('STRIPE_WEBHOOK_SECRET')
        # event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        
        # For now, just log the event
        current_app.logger.info(f"Stripe webhook received: {payload}")
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Stripe webhook error: {e}")
        return jsonify({'error': 'Webhook error'}), 400
