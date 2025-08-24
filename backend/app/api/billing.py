#!/usr/bin/env python3
"""
Billing & Monetization API
Handles subscription management, usage tracking, and payment processing
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Tenant, Subscription, BillingPlan, UsageRecord, Invoice
from datetime import datetime, timedelta
import json
import stripe
import os

billing = Blueprint('billing', __name__)

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_...')

@billing.route('/plans', methods=['GET'])
@jwt_required()
def get_billing_plans():
    """Get available billing plans"""
    try:
        plans = BillingPlan.query.filter_by(is_active=True).order_by(BillingPlan.price).all()
        
        return jsonify({
            'plans': [plan.to_dict() for plan in plans],
            'total': len(plans)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@billing.route('/plans', methods=['POST'])
@jwt_required()
def create_billing_plan():
    """Create a new billing plan (admin only)"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or user.role not in ['admin', 'super_admin']:
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'description', 'price', 'billing_cycle', 'features']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        plan = BillingPlan(
            name=data['name'],
            description=data['description'],
            price=data['price'],
            billing_cycle=data['billing_cycle'],
            features=data['features'],
            is_active=data.get('is_active', True),
            created_by=current_user_id
        )
        
        db.session.add(plan)
        db.session.commit()
        
        return jsonify({
            'message': 'Billing plan created successfully',
            'plan': plan.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@billing.route('/subscription', methods=['GET'])
@jwt_required()
def get_current_subscription():
    """Get current user's subscription"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get tenant's subscription
    tenant = Tenant.query.get(user.tenant_id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404
    
    subscription = Subscription.query.filter_by(tenant_id=tenant.id).first()
    
    if not subscription:
        return jsonify({
            'has_subscription': False,
            'subscription': None,
            'plan': None
        }), 200
    
    plan = BillingPlan.query.get(subscription.plan_id)
    
    return jsonify({
        'has_subscription': True,
        'subscription': subscription.to_dict(),
        'plan': plan.to_dict() if plan else None
    }), 200

@billing.route('/subscription', methods=['POST'])
@jwt_required()
def create_subscription():
    """Create a new subscription"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'plan_id' not in data:
        return jsonify({'error': 'Plan ID is required'}), 400
    
    try:
        # Get plan
        plan = BillingPlan.query.get(data['plan_id'])
        if not plan:
            return jsonify({'error': 'Billing plan not found'}), 404
        
        # Get tenant
        tenant = Tenant.query.get(user.tenant_id)
        if not tenant:
            return jsonify({'error': 'Tenant not found'}), 404
        
        # Check if subscription already exists
        existing_subscription = Subscription.query.filter_by(tenant_id=tenant.id).first()
        if existing_subscription:
            return jsonify({'error': 'Subscription already exists'}), 400
        
        # Create Stripe customer if not exists
        if not tenant.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=tenant.name,
                metadata={'tenant_id': tenant.id}
            )
            tenant.stripe_customer_id = customer.id
            db.session.commit()
        
        # Create Stripe subscription
        stripe_subscription = stripe.Subscription.create(
            customer=tenant.stripe_customer_id,
            items=[{'price': plan.stripe_price_id}],
            payment_behavior='default_incomplete',
            payment_settings={'save_default_payment_method': 'on_subscription'},
            expand=['latest_invoice.payment_intent'],
        )
        
        # Create local subscription record
        subscription = Subscription(
            tenant_id=tenant.id,
            plan_id=plan.id,
            stripe_subscription_id=stripe_subscription.id,
            status=stripe_subscription.status,
            current_period_start=datetime.fromtimestamp(stripe_subscription.current_period_start),
            current_period_end=datetime.fromtimestamp(stripe_subscription.current_period_end),
            created_by=current_user_id
        )
        
        db.session.add(subscription)
        db.session.commit()
        
        return jsonify({
            'message': 'Subscription created successfully',
            'subscription': subscription.to_dict(),
            'client_secret': stripe_subscription.latest_invoice.payment_intent.client_secret
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@billing.route('/subscription/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """Cancel current subscription"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        tenant = Tenant.query.get(user.tenant_id)
        subscription = Subscription.query.filter_by(tenant_id=tenant.id).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
        
        # Cancel Stripe subscription
        stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        subscription.status = 'canceled'
        subscription.canceled_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Subscription canceled successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@billing.route('/usage', methods=['GET'])
@jwt_required()
def get_usage():
    """Get current usage for the tenant"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        tenant = Tenant.query.get(user.tenant_id)
        subscription = Subscription.query.filter_by(tenant_id=tenant.id).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription'}), 404
        
        plan = BillingPlan.query.get(subscription.plan_id)
        
        # Get current period usage
        period_start = subscription.current_period_start
        period_end = subscription.current_period_end
        
        usage_records = UsageRecord.query.filter(
            UsageRecord.tenant_id == tenant.id,
            UsageRecord.recorded_at >= period_start,
            UsageRecord.recorded_at <= period_end
        ).all()
        
        # Calculate usage by metric
        usage_summary = {}
        for record in usage_records:
            metric = record.metric_name
            if metric not in usage_summary:
                usage_summary[metric] = 0
            usage_summary[metric] += record.usage_value
        
        return jsonify({
            'period': {
                'start': period_start.isoformat(),
                'end': period_end.isoformat()
            },
            'plan_limits': plan.features.get('limits', {}),
            'current_usage': usage_summary,
            'subscription': subscription.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@billing.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    """Get invoices for the tenant"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        tenant = Tenant.query.get(user.tenant_id)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        invoices = Invoice.query.filter_by(tenant_id=tenant.id)\
            .order_by(Invoice.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'invoices': [invoice.to_dict() for invoice in invoices.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': invoices.total,
                'pages': invoices.pages,
                'has_next': invoices.has_next,
                'has_prev': invoices.has_prev
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@billing.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhooks"""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET', 'whsec_...')
        )
    except ValueError as e:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'invoice.payment_succeeded':
        handle_payment_succeeded(event['data']['object'])
    elif event['type'] == 'invoice.payment_failed':
        handle_payment_failed(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event['data']['object'])
    
    return jsonify({'status': 'success'}), 200

def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    try:
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=invoice.subscription
        ).first()
        
        if subscription:
            subscription.status = 'active'
            subscription.last_payment_date = datetime.utcnow()
            db.session.commit()
            
            # Create invoice record
            invoice_record = Invoice(
                tenant_id=subscription.tenant_id,
                stripe_invoice_id=invoice.id,
                amount=invoice.amount_paid / 100,  # Convert from cents
                currency=invoice.currency,
                status='paid',
                paid_at=datetime.utcnow()
            )
            db.session.add(invoice_record)
            db.session.commit()
    except Exception as e:
        print(f"Error handling payment succeeded: {e}")

def handle_payment_failed(invoice):
    """Handle failed payment"""
    try:
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=invoice.subscription
        ).first()
        
        if subscription:
            subscription.status = 'past_due'
            db.session.commit()
    except Exception as e:
        print(f"Error handling payment failed: {e}")

def handle_subscription_updated(subscription_data):
    """Handle subscription updates"""
    try:
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=subscription_data.id
        ).first()
        
        if subscription:
            subscription.status = subscription_data.status
            subscription.current_period_start = datetime.fromtimestamp(subscription_data.current_period_start)
            subscription.current_period_end = datetime.fromtimestamp(subscription_data.current_period_end)
            db.session.commit()
    except Exception as e:
        print(f"Error handling subscription update: {e}")

def handle_subscription_deleted(subscription_data):
    """Handle subscription deletion"""
    try:
        subscription = Subscription.query.filter_by(
            stripe_subscription_id=subscription_data.id
        ).first()
        
        if subscription:
            subscription.status = 'canceled'
            subscription.canceled_at = datetime.utcnow()
            db.session.commit()
    except Exception as e:
        print(f"Error handling subscription deletion: {e}")
