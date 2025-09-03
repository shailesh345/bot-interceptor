"""
Credit Purchase System API
Handles credit purchases for AI companies to access crawling capabilities
"""

from flask import Blueprint, jsonify, request, redirect, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from datetime import datetime, timedelta
import stripe
import uuid
import json
from sqlalchemy import desc

from ..models import (
    User, db
)
from ..models_enhanced import (
    Organization, CreditPackage, CreditPurchase, CreditBalance, CompanyOutreach, PaymentHistory
)
from ..interceptor.llm_bot_detector import llm_bot_detector
from ..utils.email_service import EmailService
# from ..utils.rate_limiter import rate_limit  # TODO: Implement rate_limit decorator

bp = Blueprint('credit_purchase', __name__, url_prefix='/api/credits')

# Initialize services
email_service = EmailService()

# Credit packages configuration
CREDIT_PACKAGES = {
    'starter': {
        'name': 'Starter Package',
        'credits': 10000,
        'price': 99.00,
        'currency': 'usd',
        'description': 'Perfect for small AI projects',
        'features': [
            '10,000 page crawls',
            'Basic rate limiting',
            'Standard support',
            '30-day validity'
        ]
    },
    'professional': {
        'name': 'Professional Package',
        'credits': 50000,
        'price': 399.00,
        'currency': 'usd',
        'description': 'For growing AI companies',
        'features': [
            '50,000 page crawls',
            'Priority rate limiting',
            'Priority support',
            '60-day validity',
            'API access'
        ]
    },
    'enterprise': {
        'name': 'Enterprise Package',
        'credits': 200000,
        'price': 1499.00,
        'currency': 'usd',
        'description': 'For large-scale AI training',
        'features': [
            '200,000 page crawls',
            'Unlimited rate',
            'Dedicated support',
            '90-day validity',
            'API access',
            'Custom integration'
        ]
    },
    'custom': {
        'name': 'Custom Package',
        'credits': 0,  # To be negotiated
        'price': 0.00,  # To be negotiated
        'currency': 'usd',
        'description': 'Tailored for your needs',
        'features': [
            'Custom credit amount',
            'Negotiated pricing',
            'White-glove support',
            'Custom validity period',
            'Full API access',
            'Dedicated account manager'
        ]
    }
}


@bp.route('/packages', methods=['GET'])
def get_credit_packages():
    """Get available credit packages"""
    try:
        # Check if request is from intercepted bot
        is_bot_request = request.args.get('bot_redirect') == 'true'
        bot_company = request.args.get('company')
        
        packages_list = []
        for package_id, package_info in CREDIT_PACKAGES.items():
            package_data = {
                'id': package_id,
                **package_info
            }
            
            # Add special pricing for known AI companies
            if is_bot_request and bot_company:
                if bot_company in ['OpenAI/ChatGPT', 'Google AI/Bard']:
                    # Premium pricing for high-value bots
                    package_data['price'] = package_data['price'] * 1.5
                    package_data['premium'] = True
                elif bot_company in ['Perplexity AI', 'Claude/Anthropic']:
                    # Standard pricing with bonus
                    package_data['bonus_credits'] = int(package_data['credits'] * 0.1)
            
            packages_list.append(package_data)
        
        return jsonify({
            'packages': packages_list,
            'is_bot_request': is_bot_request,
            'bot_company': bot_company,
            'message': 'Your bot has been detected. Purchase credits to continue crawling.'
            if is_bot_request else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/purchase', methods=['POST'])
    # @rate_limit(limit=10, window=60)  # 10 purchases per minute - TODO: Implement rate_limit decorator
def purchase_credits():
    """Purchase credits for bot crawling access"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['package_id', 'company_name', 'email', 'payment_method_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        package_id = data['package_id']
        company_name = data['company_name']
        email = data['email']
        payment_method_id = data['payment_method_id']
        
        # Validate package
        if package_id not in CREDIT_PACKAGES:
            return jsonify({'error': 'Invalid package ID'}), 400
        
        package = CREDIT_PACKAGES[package_id]
        
        # Handle custom package
        if package_id == 'custom':
            # Create custom package request
            custom_request = {
                'company_name': company_name,
                'email': email,
                'requested_credits': data.get('requested_credits', 0),
                'message': data.get('message', ''),
                'timestamp': datetime.utcnow()
            }
            
            # Send notification to sales team
            email_service.send_custom_package_request(custom_request)
            
            return jsonify({
                'success': True,
                'message': 'Custom package request received. Our team will contact you within 24 hours.',
                'request_id': str(uuid.uuid4())
            }), 200
        
        # Create or get organization
        org = Organization.query.filter_by(name=company_name).first()
        if not org:
            org = Organization(
                name=company_name,
                email=email,
                is_ai_company=True,
                created_at=datetime.utcnow()
            )
            db.session.add(org)
            db.session.flush()
        
        # Process payment with Stripe
        try:
            # Create Stripe payment intent
            stripe_response = stripe.PaymentIntent.create(
                amount=int(package['price'] * 100),  # Convert to cents
                currency=package['currency'],
                payment_method=payment_method_id,
                confirmation_method='manual',
                confirm=True,
                metadata={
                    'package_id': package_id,
                    'company_name': company_name,
                    'email': email
                }
            )
            
            if stripe_response.status != 'succeeded':
                return jsonify({
                    'error': 'Payment failed',
                    'details': stripe_response.status
                }), 400
            
            # Create credit purchase record
            purchase = CreditPurchase(
                organization_id=org.id,
                package_id=package_id,
                package_name=package['name'],
                credits=package['credits'],
                price=package['price'],
                currency=package['currency'],
                stripe_payment_id=stripe_response.id,
                status='completed',
                purchased_at=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(days=30)  # Default 30 days
            )
            db.session.add(purchase)
            
            # Update credit balance
            balance = CreditBalance.query.filter_by(organization_id=org.id).first()
            if not balance:
                balance = CreditBalance(
                    organization_id=org.id,
                    total_credits=0,
                    used_credits=0,
                    remaining_credits=0
                )
                db.session.add(balance)
            
            balance.total_credits += package['credits']
            balance.remaining_credits += package['credits']
            
            # Add payment history
            payment = PaymentHistory(
                organization_id=org.id,
                amount=package['price'],
                currency=package['currency'],
                description=f"Credit purchase: {package['name']}",
                stripe_payment_id=stripe_response.id,
                status='succeeded',
                created_at=datetime.utcnow()
            )
            db.session.add(payment)
            
            # Generate access token for API usage
            access_token = create_access_token(
                identity=str(org.id),
                additional_claims={
                    'type': 'api_access',
                    'company': company_name,
                    'credits': package['credits']
                },
                expires_delta=timedelta(days=30)
            )
            
            # Send confirmation email
            email_service.send_credit_purchase_confirmation({
                'email': email,
                'company_name': company_name,
                'package_name': package['name'],
                'credits': package['credits'],
                'price': package['price'],
                'access_token': access_token,
                'api_docs_url': 'https://api.yourplatform.com/docs'
            })
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Credits purchased successfully',
                'purchase_id': purchase.id,
                'credits': package['credits'],
                'access_token': access_token,
                'api_endpoint': 'https://api.yourplatform.com/v1',
                'expires_at': purchase.expires_at.isoformat()
            }), 200
            
        except stripe.error.StripeError as e:
            db.session.rollback()
            return jsonify({
                'error': 'Payment processing failed',
                'details': str(e)
            }), 400
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/balance/<organization_id>', methods=['GET'])
@jwt_required()
def get_credit_balance(organization_id):
    """Get credit balance for an organization"""
    try:
        # Verify access
        current_user_id = get_jwt_identity()
        
        # Get organization
        org = Organization.query.get(organization_id)
        if not org:
            return jsonify({'error': 'Organization not found'}), 404
        
        # Get credit balance
        balance = CreditBalance.query.filter_by(organization_id=org.id).first()
        if not balance:
            balance = CreditBalance(
                organization_id=org.id,
                total_credits=0,
                used_credits=0,
                remaining_credits=0
            )
        
        # Get recent purchases
        recent_purchases = CreditPurchase.query.filter_by(
            organization_id=org.id
        ).order_by(desc(CreditPurchase.purchased_at)).limit(5).all()
        
        return jsonify({
            'organization': {
                'id': org.id,
                'name': org.name,
                'email': org.email
            },
            'balance': {
                'total_credits': balance.total_credits,
                'used_credits': balance.used_credits,
                'remaining_credits': balance.remaining_credits,
                'last_updated': balance.updated_at.isoformat() if balance.updated_at else None
            },
            'recent_purchases': [{
                'id': p.id,
                'package_name': p.package_name,
                'credits': p.credits,
                'price': p.price,
                'purchased_at': p.purchased_at.isoformat(),
                'expires_at': p.expires_at.isoformat(),
                'status': p.status
            } for p in recent_purchases]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/usage/<organization_id>', methods=['GET'])
@jwt_required()
def get_credit_usage(organization_id):
    """Get detailed credit usage for an organization"""
    try:
        # Get date range from query params
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = db.session.query(TrafficLog).filter(
            TrafficLog.organization_id == organization_id,
            TrafficLog.credits_used > 0
        )
        
        if start_date:
            query = query.filter(TrafficLog.timestamp >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(TrafficLog.timestamp <= datetime.fromisoformat(end_date))
        
        # Get usage records
        usage_records = query.order_by(desc(TrafficLog.timestamp)).limit(100).all()
        
        # Calculate statistics
        total_used = sum(record.credits_used for record in usage_records)
        daily_usage = {}
        
        for record in usage_records:
            date_key = record.timestamp.date().isoformat()
            if date_key not in daily_usage:
                daily_usage[date_key] = 0
            daily_usage[date_key] += record.credits_used
        
        return jsonify({
            'total_used': total_used,
            'daily_usage': daily_usage,
            'recent_usage': [{
                'timestamp': r.timestamp.isoformat(),
                'path': r.request_path,
                'credits_used': r.credits_used,
                'user_agent': r.user_agent
            } for r in usage_records[:20]]  # Last 20 records
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/company-outreach', methods=['POST'])
def automated_company_outreach():
    """Send automated outreach to detected AI companies"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['company_name', 'detection_evidence', 'bot_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        company_name = data['company_name']
        detection_evidence = data['detection_evidence']
        bot_type = data['bot_type']
        
        # Get company contact info
        contact_info = llm_bot_detector._get_company_contact(company_name)
        
        if not contact_info.get('email'):
            return jsonify({'error': 'No contact email available for this company'}), 400
        
        # Check if we've already reached out recently
        recent_outreach = CompanyOutreach.query.filter(
            CompanyOutreach.company_name == company_name,
            CompanyOutreach.created_at >= datetime.utcnow() - timedelta(days=7)
        ).first()
        
        if recent_outreach:
            return jsonify({
                'success': False,
                'message': 'Already contacted this company recently',
                'last_contact': recent_outreach.created_at.isoformat()
            }), 200
        
        # Create outreach record
        outreach = CompanyOutreach(
            company_name=company_name,
            contact_email=contact_info['email'],
            bot_type=bot_type,
            detection_count=data.get('detection_count', 1),
            message_type='initial_contact',
            status='pending',
            created_at=datetime.utcnow()
        )
        db.session.add(outreach)
        db.session.flush()
        
        # Send outreach email
        email_data = {
            'company_name': company_name,
            'contact_email': contact_info['email'],
            'bot_type': bot_type,
            'detection_evidence': detection_evidence,
            'platform_name': 'YourPlatform',
            'credit_purchase_url': f'https://yourplatform.com/purchase-credits?company={company_name}',
            'documentation_url': 'https://yourplatform.com/docs/ai-access',
            'contact_url': 'https://yourplatform.com/contact'
        }
        
        email_sent = email_service.send_ai_company_outreach(email_data)
        
        if email_sent:
            outreach.status = 'sent'
            outreach.sent_at = datetime.utcnow()
        else:
            outreach.status = 'failed'
        
        db.session.commit()
        
        return jsonify({
            'success': email_sent,
            'outreach_id': outreach.id,
            'company_name': company_name,
            'contact_email': contact_info['email'],
            'message': 'Outreach email sent successfully' if email_sent else 'Failed to send email'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/verify-access', methods=['POST'])
def verify_crawl_access():
    """Verify if a bot has valid credits to crawl"""
    try:
        data = request.get_json()
        
        # Get bot detection info
        ip_address = data.get('ip_address', request.remote_addr)
        user_agent = data.get('user_agent', request.headers.get('User-Agent', ''))
        
        # Detect if it's an LLM bot
        request_data = {
            'client_ip': ip_address,
            'user_agent': user_agent,
            'request_path': data.get('path', '/'),
            'headers': dict(request.headers),
            'request_method': 'GET'
        }
        
        detection_result = llm_bot_detector.detect_llm_bot(request_data)
        
        if not detection_result['is_llm_bot']:
            return jsonify({
                'has_access': True,
                'is_llm_bot': False,
                'message': 'Not detected as LLM bot, access granted'
            }), 200
        
        # Check if company has valid credits
        company_name = detection_result.get('bot_company')
        org = Organization.query.filter_by(name=company_name).first()
        
        if not org:
            return jsonify({
                'has_access': False,
                'is_llm_bot': True,
                'bot_company': company_name,
                'redirect_url': f'/purchase-credits?company={company_name}&bot_redirect=true',
                'message': 'No credits found. Please purchase credits to continue.'
            }), 403
        
        # Check credit balance
        balance = CreditBalance.query.filter_by(organization_id=org.id).first()
        
        if not balance or balance.remaining_credits <= 0:
            return jsonify({
                'has_access': False,
                'is_llm_bot': True,
                'bot_company': company_name,
                'remaining_credits': 0,
                'redirect_url': f'/purchase-credits?company={company_name}&bot_redirect=true',
                'message': 'Insufficient credits. Please purchase more credits.'
            }), 403
        
        # Check if credits are expired
        active_purchase = CreditPurchase.query.filter(
            CreditPurchase.organization_id == org.id,
            CreditPurchase.expires_at > datetime.utcnow(),
            CreditPurchase.status == 'completed'
        ).first()
        
        if not active_purchase:
            return jsonify({
                'has_access': False,
                'is_llm_bot': True,
                'bot_company': company_name,
                'redirect_url': f'/purchase-credits?company={company_name}&bot_redirect=true',
                'message': 'Credits expired. Please purchase new credits.'
            }), 403
        
        # Access granted - deduct credit
        balance.used_credits += 1
        balance.remaining_credits -= 1
        
        # Log usage
        usage_log = TrafficLog(
            organization_id=org.id,
            timestamp=datetime.utcnow(),
            ip_address=ip_address,
            user_agent=user_agent,
            request_path=data.get('path', '/'),
            credits_used=1,
            bot_type=detection_result.get('bot_type'),
            detection_confidence=detection_result.get('confidence')
        )
        db.session.add(usage_log)
        db.session.commit()
        
        return jsonify({
            'has_access': True,
            'is_llm_bot': True,
            'bot_company': company_name,
            'remaining_credits': balance.remaining_credits,
            'message': 'Access granted. Credit deducted.'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Initialize Stripe
import os
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_your_stripe_key')
