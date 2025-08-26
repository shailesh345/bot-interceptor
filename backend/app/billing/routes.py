# Billing Routes
from flask import request, jsonify
from app.billing import billing
from app.models import BillingPlan, Subscription, UsageRecord, Invoice
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import stripe

@billing.route('/plans', methods=['GET'])
@jwt_required()
def get_billing_plans():
    """Get available billing plans"""
    try:
        plans = BillingPlan.query.filter_by(is_active=True).all()
        return jsonify([{
            'id': plan.uuid,
            'name': plan.name,
            'description': plan.description,
            'price': float(plan.price),
            'billing_cycle': plan.billing_cycle,
            'features': plan.features,
            'is_active': plan.is_active
        } for plan in plans]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching billing plans', 'error': str(e)}), 500

@billing.route('/subscriptions', methods=['GET'])
@jwt_required()
def get_subscriptions():
    """Get user's subscriptions"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        subscriptions = Subscription.query.filter_by(tenant_id=current_user.tenant_id).all()
        return jsonify([{
            'id': sub.uuid,
            'status': sub.status,
            'current_period_start': sub.current_period_start.isoformat() if sub.current_period_start else None,
            'current_period_end': sub.current_period_end.isoformat() if sub.current_period_end else None,
            'plan_id': sub.plan_id
        } for sub in subscriptions]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching subscriptions', 'error': str(e)}), 500

@billing.route('/usage', methods=['GET'])
@jwt_required()
def get_usage():
    """Get usage records"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get date range
        days = request.args.get('days', 30, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        usage_records = UsageRecord.query.filter(
            UsageRecord.tenant_id == current_user.tenant_id,
            UsageRecord.recorded_at >= start_date,
            UsageRecord.recorded_at <= end_date
        ).all()
        
        return jsonify([{
            'id': record.uuid,
            'metric_name': record.metric_name,
            'usage_value': record.usage_value,
            'recorded_at': record.recorded_at.isoformat() if record.recorded_at else None
        } for record in usage_records]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching usage records', 'error': str(e)}), 500

@billing.route('/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    """Get invoices"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        invoices = Invoice.query.filter_by(tenant_id=current_user.tenant_id).all()
        return jsonify([{
            'id': invoice.uuid,
            'amount': float(invoice.amount),
            'currency': invoice.currency,
            'status': invoice.status,
            'paid_at': invoice.paid_at.isoformat() if invoice.paid_at else None
        } for invoice in invoices]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching invoices', 'error': str(e)}), 500
