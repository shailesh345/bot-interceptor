"""
Company Management API
Handles AI company profiles, relationships, and analytics
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import desc, func
import json

from ..models import User, db
from ..models_enhanced import (
    Organization, CreditBalance, CreditPurchase, 
    CompanyOutreach, LLMBotDetection, PaymentHistory
)

bp = Blueprint('companies', __name__, url_prefix='/api/companies')


@bp.route('', methods=['GET'])
@jwt_required()
def get_companies():
    """Get list of AI companies with filters"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status')
        company_type = request.args.get('company_type')
        
        # Build query
        query = Organization.query
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Organization.name.ilike(f'%{search}%'),
                    Organization.email.ilike(f'%{search}%')
                )
            )
        
        if status and status != 'all':
            query = query.filter(Organization.status == status)
        
        if company_type:
            query = query.filter(Organization.company_type == company_type)
        
        # Join with credit balance
        query = query.outerjoin(CreditBalance)
        
        # Get paginated results
        companies = query.order_by(desc(Organization.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Format results
        results = []
        for company in companies.items:
            # Get credit balance
            balance = CreditBalance.query.filter_by(
                organization_id=company.id
            ).first()
            
            # Get total revenue
            total_revenue = db.session.query(
                func.sum(CreditPurchase.price)
            ).filter(
                CreditPurchase.organization_id == company.id,
                CreditPurchase.status == 'completed'
            ).scalar() or 0
            
            # Get last activity
            last_detection = LLMBotDetection.query.filter_by(
                organization_id=company.id
            ).order_by(desc(LLMBotDetection.timestamp)).first()
            
            # Get detection count
            detection_count = LLMBotDetection.query.filter_by(
                organization_id=company.id
            ).count()
            
            results.append({
                'id': company.id,
                'uuid': company.uuid,
                'name': company.name,
                'email': company.email,
                'website': company.website,
                'is_ai_company': company.is_ai_company,
                'company_type': company.company_type,
                'status': company.status,
                'created_at': company.created_at.isoformat(),
                'credit_balance': {
                    'total_credits': balance.total_credits if balance else 0,
                    'used_credits': balance.used_credits if balance else 0,
                    'remaining_credits': balance.remaining_credits if balance else 0,
                    'last_used_at': balance.last_used_at.isoformat() if balance and balance.last_used_at else None
                },
                'total_revenue': float(total_revenue),
                'detection_count': detection_count,
                'last_activity': last_detection.timestamp.isoformat() if last_detection else None
            })
        
        return jsonify({
            'companies': results,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': companies.total,
                'pages': companies.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_company_stats():
    """Get company statistics"""
    try:
        # Total companies
        total = Organization.query.filter_by(is_ai_company=True).count()
        
        # Active companies (with credits)
        active = db.session.query(Organization).join(CreditBalance).filter(
            CreditBalance.remaining_credits > 0
        ).count()
        
        # Total revenue
        revenue = db.session.query(
            func.sum(CreditPurchase.price)
        ).filter(
            CreditPurchase.status == 'completed'
        ).scalar() or 0
        
        # Conversion rate
        detected_companies = db.session.query(
            func.count(func.distinct(LLMBotDetection.bot_company))
        ).scalar() or 0
        
        converted_companies = Organization.query.filter_by(is_ai_company=True).count()
        
        conversion_rate = (converted_companies / detected_companies * 100) if detected_companies > 0 else 0
        
        return jsonify({
            'total': total,
            'active': active,
            'revenue': float(revenue),
            'conversion_rate': round(conversion_rate, 1)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:company_id>', methods=['GET'])
@jwt_required()
def get_company_details(company_id):
    """Get detailed company information"""
    try:
        company = Organization.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        # Get credit balance
        balance = CreditBalance.query.filter_by(organization_id=company.id).first()
        
        # Get purchase history
        purchases = CreditPurchase.query.filter_by(
            organization_id=company.id
        ).order_by(desc(CreditPurchase.purchased_at)).limit(10).all()
        
        # Get outreach history
        outreach = CompanyOutreach.query.filter_by(
            organization_id=company.id
        ).order_by(desc(CompanyOutreach.created_at)).limit(10).all()
        
        # Get detection stats
        detection_stats = db.session.query(
            func.count(LLMBotDetection.id).label('total'),
            func.avg(LLMBotDetection.confidence).label('avg_confidence')
        ).filter(
            LLMBotDetection.organization_id == company.id
        ).first()
        
        return jsonify({
            'company': {
                'id': company.id,
                'uuid': company.uuid,
                'name': company.name,
                'email': company.email,
                'website': company.website,
                'is_ai_company': company.is_ai_company,
                'company_type': company.company_type,
                'api_key': company.api_key[:10] + '...' if company.api_key else None,
                'status': company.status,
                'created_at': company.created_at.isoformat(),
                'updated_at': company.updated_at.isoformat()
            },
            'credit_balance': {
                'total_credits': balance.total_credits if balance else 0,
                'used_credits': balance.used_credits if balance else 0,
                'remaining_credits': balance.remaining_credits if balance else 0,
                'last_used_at': balance.last_used_at.isoformat() if balance and balance.last_used_at else None,
                'updated_at': balance.updated_at.isoformat() if balance else None
            },
            'purchase_history': [{
                'id': p.id,
                'package_id': p.package_id,
                'package_name': p.package_name,
                'credits': p.credits,
                'price': p.price,
                'currency': p.currency,
                'status': p.status,
                'purchased_at': p.purchased_at.isoformat(),
                'expires_at': p.expires_at.isoformat() if p.expires_at else None
            } for p in purchases],
            'outreach_history': [{
                'id': o.id,
                'message_type': o.message_type,
                'status': o.status,
                'sent_at': o.sent_at.isoformat() if o.sent_at else None,
                'response_received': o.response_received.isoformat() if o.response_received else None,
                'response_type': o.response_type
            } for o in outreach],
            'detection_stats': {
                'total_detections': detection_stats.total if detection_stats else 0,
                'avg_confidence': float(detection_stats.avg_confidence or 0) if detection_stats else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:company_id>', methods=['PUT'])
@jwt_required()
def update_company(company_id):
    """Update company information"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        company = Organization.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'status' in data:
            company.status = data['status']
        if 'company_type' in data:
            company.company_type = data['company_type']
        if 'website' in data:
            company.website = data['website']
        
        company.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Company updated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:company_id>/suspend', methods=['POST'])
@jwt_required()
def suspend_company(company_id):
    """Suspend company access"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        company = Organization.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        data = request.get_json()
        reason = data.get('reason', 'Administrative action')
        
        # Update status
        company.status = 'suspended'
        company.updated_at = datetime.utcnow()
        
        # Log the action
        # In production, add audit log
        
        db.session.commit()
        
        # Send notification email
        # email_service.send_suspension_notice(company, reason)
        
        return jsonify({
            'success': True,
            'message': f'Company {company.name} suspended successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:company_id>/credits/add', methods=['POST'])
@jwt_required()
def add_credits(company_id):
    """Manually add credits to a company"""
    try:
        # Verify admin access
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        company = Organization.query.get(company_id)
        if not company:
            return jsonify({'error': 'Company not found'}), 404
        
        data = request.get_json()
        credits = data.get('credits', 0)
        reason = data.get('reason', 'Manual adjustment')
        
        if credits <= 0:
            return jsonify({'error': 'Credits must be positive'}), 400
        
        # Get or create balance
        balance = CreditBalance.query.filter_by(organization_id=company.id).first()
        if not balance:
            balance = CreditBalance(
                organization_id=company.id,
                total_credits=0,
                used_credits=0,
                remaining_credits=0
            )
            db.session.add(balance)
        
        # Add credits
        balance.total_credits += credits
        balance.remaining_credits += credits
        balance.updated_at = datetime.utcnow()
        
        # Create manual purchase record
        purchase = CreditPurchase(
            organization_id=company.id,
            package_id='manual',
            package_name='Manual Credit Addition',
            credits=credits,
            price=0.00,
            currency='usd',
            status='completed',
            purchased_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=90)
        )
        db.session.add(purchase)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Added {credits} credits to {company.name}',
            'new_balance': balance.remaining_credits
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/types', methods=['GET'])
def get_company_types():
    """Get list of company types"""
    try:
        # Get unique company types
        types = db.session.query(
            Organization.company_type,
            func.count(Organization.id).label('count')
        ).filter(
            Organization.company_type.isnot(None)
        ).group_by(Organization.company_type).all()
        
        # Add predefined types
        predefined = [
            {'type': 'openai', 'label': 'OpenAI/ChatGPT', 'count': 0},
            {'type': 'google', 'label': 'Google AI/Bard', 'count': 0},
            {'type': 'perplexity', 'label': 'Perplexity AI', 'count': 0},
            {'type': 'anthropic', 'label': 'Claude/Anthropic', 'count': 0},
            {'type': 'other', 'label': 'Other AI Company', 'count': 0}
        ]
        
        # Merge counts
        type_counts = {t.company_type: t.count for t in types}
        
        for ptype in predefined:
            ptype['count'] = type_counts.get(ptype['type'], 0)
        
        return jsonify({
            'types': predefined
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
