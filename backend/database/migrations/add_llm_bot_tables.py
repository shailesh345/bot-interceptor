"""
Database migration to add LLM bot detection and credit system tables
Run this migration to add the enhanced tables for AI bot monetization
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'add_llm_bot_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add tables for LLM bot detection and credit system"""
    
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('uuid', sa.String(36), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('is_ai_company', sa.Boolean(), default=False),
        sa.Column('company_type', sa.String(50), nullable=True),
        sa.Column('api_key', sa.String(255), nullable=True),
        sa.Column('status', sa.String(20), default='active'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid'),
        sa.UniqueConstraint('name')
    )
    op.create_index('idx_organizations_name', 'organizations', ['name'])
    op.create_index('idx_organizations_email', 'organizations', ['email'])
    
    # Create credit_packages table
    op.create_table(
        'credit_packages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('package_id', sa.String(50), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('credits', sa.Integer(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(3), default='usd'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('features', sa.JSON(), nullable=True),
        sa.Column('validity_days', sa.Integer(), default=30),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('package_id')
    )
    
    # Create credit_purchases table
    op.create_table(
        'credit_purchases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('package_id', sa.String(50), nullable=False),
        sa.Column('package_name', sa.String(100), nullable=True),
        sa.Column('credits', sa.Integer(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(3), default='usd'),
        sa.Column('stripe_payment_id', sa.String(255), nullable=True),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('purchased_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_credit_purchases_org', 'credit_purchases', ['organization_id'])
    op.create_index('idx_credit_purchases_status', 'credit_purchases', ['status'])
    
    # Create credit_balances table
    op.create_table(
        'credit_balances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=False),
        sa.Column('total_credits', sa.Integer(), default=0),
        sa.Column('used_credits', sa.Integer(), default=0),
        sa.Column('remaining_credits', sa.Integer(), default=0),
        sa.Column('last_used_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id')
    )
    
    # Create llm_bot_detections table
    op.create_table(
        'llm_bot_detections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('request_path', sa.String(500), nullable=True),
        sa.Column('request_method', sa.String(10), nullable=True),
        sa.Column('is_llm_bot', sa.Boolean(), default=False),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('bot_company', sa.String(100), nullable=True),
        sa.Column('bot_type', sa.String(50), nullable=True),
        sa.Column('detection_methods', sa.JSON(), nullable=True),
        sa.Column('evidence', sa.JSON(), nullable=True),
        sa.Column('action_taken', sa.String(50), nullable=True),
        sa.Column('credits_charged', sa.Integer(), default=0),
        sa.Column('domain_id', sa.Integer(), nullable=True),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['domain_id'], ['domains.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_llm_detections_timestamp', 'llm_bot_detections', ['timestamp'])
    op.create_index('idx_llm_detections_company', 'llm_bot_detections', ['bot_company'])
    op.create_index('idx_llm_detections_domain', 'llm_bot_detections', ['domain_id'])
    
    # Create company_outreach table
    op.create_table(
        'company_outreach',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.Column('company_name', sa.String(255), nullable=False),
        sa.Column('contact_email', sa.String(255), nullable=True),
        sa.Column('bot_type', sa.String(100), nullable=True),
        sa.Column('detection_count', sa.Integer(), default=0),
        sa.Column('first_detected', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('last_detected', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('initial_outreach_sent', sa.DateTime(), nullable=True),
        sa.Column('follow_up_sent', sa.DateTime(), nullable=True),
        sa.Column('response_received', sa.DateTime(), nullable=True),
        sa.Column('response_type', sa.String(50), nullable=True),
        sa.Column('message_type', sa.String(50), nullable=True),
        sa.Column('message_content', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column('sent_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_company_outreach_name', 'company_outreach', ['company_name'])
    op.create_index('idx_company_outreach_status', 'company_outreach', ['status'])
    
    # Create payment_history table
    op.create_table(
        'payment_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.Column('tenant_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(3), default='usd'),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('stripe_payment_id', sa.String(255), nullable=True),
        sa.Column('stripe_invoice_id', sa.String(255), nullable=True),
        sa.Column('payment_method', sa.String(50), nullable=True),
        sa.Column('status', sa.String(20), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_payment_history_org', 'payment_history', ['organization_id'])
    op.create_index('idx_payment_history_status', 'payment_history', ['status'])
    
    # Create captcha_challenges table
    op.create_table(
        'captcha_challenges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('challenge_id', sa.String(100), nullable=False),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('challenge_type', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('attempted_at', sa.DateTime(), nullable=True),
        sa.Column('solved_at', sa.DateTime(), nullable=True),
        sa.Column('is_solved', sa.Boolean(), default=False),
        sa.Column('attempts', sa.Integer(), default=0),
        sa.Column('score', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('challenge_id')
    )
    op.create_index('idx_captcha_challenges_ip', 'captcha_challenges', ['ip_address'])
    
    # Add credits_used column to traffic_logs if not exists
    op.add_column('traffic_logs', sa.Column('credits_used', sa.Integer(), default=0))
    op.add_column('traffic_logs', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_traffic_logs_organization',
        'traffic_logs', 'organizations',
        ['organization_id'], ['id']
    )
    
    # Insert default credit packages
    op.execute("""
        INSERT INTO credit_packages (package_id, name, credits, price, currency, description, features, validity_days, is_active)
        VALUES 
        ('starter', 'Starter Package', 10000, 99.00, 'usd', 'Perfect for small AI projects', 
         '["10,000 page crawls", "Basic rate limiting", "Standard support", "30-day validity"]'::json, 30, true),
        ('professional', 'Professional Package', 50000, 399.00, 'usd', 'For growing AI companies',
         '["50,000 page crawls", "Priority rate limiting", "Priority support", "60-day validity", "API access"]'::json, 60, true),
        ('enterprise', 'Enterprise Package', 200000, 1499.00, 'usd', 'For large-scale AI training',
         '["200,000 page crawls", "Unlimited rate", "Dedicated support", "90-day validity", "API access", "Custom integration"]'::json, 90, true),
        ('custom', 'Custom Package', 0, 0.00, 'usd', 'Tailored for your needs',
         '["Custom credit amount", "Negotiated pricing", "White-glove support", "Custom validity period", "Full API access", "Dedicated account manager"]'::json, 0, true)
    """)


def downgrade():
    """Remove LLM bot detection and credit system tables"""
    
    # Remove foreign key and column from traffic_logs
    op.drop_constraint('fk_traffic_logs_organization', 'traffic_logs', type_='foreignkey')
    op.drop_column('traffic_logs', 'organization_id')
    op.drop_column('traffic_logs', 'credits_used')
    
    # Drop indexes
    op.drop_index('idx_captcha_challenges_ip', 'captcha_challenges')
    op.drop_index('idx_payment_history_status', 'payment_history')
    op.drop_index('idx_payment_history_org', 'payment_history')
    op.drop_index('idx_company_outreach_status', 'company_outreach')
    op.drop_index('idx_company_outreach_name', 'company_outreach')
    op.drop_index('idx_llm_detections_domain', 'llm_bot_detections')
    op.drop_index('idx_llm_detections_company', 'llm_bot_detections')
    op.drop_index('idx_llm_detections_timestamp', 'llm_bot_detections')
    op.drop_index('idx_credit_purchases_status', 'credit_purchases')
    op.drop_index('idx_credit_purchases_org', 'credit_purchases')
    op.drop_index('idx_organizations_email', 'organizations')
    op.drop_index('idx_organizations_name', 'organizations')
    
    # Drop tables
    op.drop_table('captcha_challenges')
    op.drop_table('payment_history')
    op.drop_table('company_outreach')
    op.drop_table('llm_bot_detections')
    op.drop_table('credit_balances')
    op.drop_table('credit_purchases')
    op.drop_table('credit_packages')
    op.drop_table('organizations')
