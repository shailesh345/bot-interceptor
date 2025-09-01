"""Fix interceptor_rules table schema

Revision ID: 002
Revises: 001
Create Date: 2025-01-26 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Add missing columns to interceptor_rules table
    op.add_column('interceptor_rules', sa.Column('tenant_id', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('interceptor_rules', sa.Column('user_id', sa.Integer(), nullable=False, server_default='1'))
    
    # Add foreign key constraints
    op.create_foreign_key('fk_interceptor_rules_tenant_id', 'interceptor_rules', 'tenants', ['tenant_id'], ['id'])
    op.create_foreign_key('fk_interceptor_rules_user_id', 'interceptor_rules', 'users', ['user_id'], ['id'])
    
    # Add indexes for better performance
    op.create_index('idx_interceptor_rules_tenant_id', 'interceptor_rules', ['tenant_id'])
    op.create_index('idx_interceptor_rules_user_id', 'interceptor_rules', ['user_id'])
    op.create_index('idx_interceptor_rules_domain_id', 'interceptor_rules', ['domain_id'])
    
    # Update traffic_logs table to match model (rename columns)
    op.alter_column('traffic_logs', 'ip_address', new_column_name='client_ip')
    op.alter_column('traffic_logs', 'country_code', new_column_name='geo_country')
    op.alter_column('traffic_logs', 'city', new_column_name='geo_city')
    
    # Add missing columns to traffic_logs
    op.add_column('traffic_logs', sa.Column('response_time', sa.Float(), nullable=True))
    op.add_column('traffic_logs', sa.Column('response_size', sa.BigInteger(), nullable=True))
    
    # Add missing columns to domains table
    op.add_column('domains', sa.Column('verification_method', sa.String(length=50), nullable=True, server_default='dns'))
    op.add_column('domains', sa.Column('cdn_enabled', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('domains', sa.Column('traffic_enabled', sa.Boolean(), nullable=True, server_default='true'))
    op.add_column('domains', sa.Column('verified_at', sa.DateTime(), nullable=True))
    op.add_column('domains', sa.Column('monitoring_enabled', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('domains', sa.Column('monitoring_interval', sa.Integer(), nullable=True, server_default='60'))
    op.add_column('domains', sa.Column('monitoring_url', sa.String(length=500), nullable=True))
    op.add_column('domains', sa.Column('monitoring_content', sa.Text(), nullable=True))
    op.add_column('domains', sa.Column('monitoring_headers', sa.Text(), nullable=True))
    op.add_column('domains', sa.Column('security_scan_enabled', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('domains', sa.Column('security_scan_interval', sa.Integer(), nullable=True, server_default='24'))

def downgrade():
    # Remove foreign key constraints
    op.drop_constraint('fk_interceptor_rules_tenant_id', 'interceptor_rules', type_='foreignkey')
    op.drop_constraint('fk_interceptor_rules_user_id', 'interceptor_rules', type_='foreignkey')
    
    # Remove indexes
    op.drop_index('idx_interceptor_rules_tenant_id', table_name='interceptor_rules')
    op.drop_index('idx_interceptor_rules_user_id', table_name='interceptor_rules')
    op.drop_index('idx_interceptor_rules_domain_id', table_name='interceptor_rules')
    
    # Remove columns from interceptor_rules
    op.drop_column('interceptor_rules', 'tenant_id')
    op.drop_column('interceptor_rules', 'user_id')
    
    # Revert traffic_logs column names
    op.alter_column('traffic_logs', 'client_ip', new_column_name='ip_address')
    op.alter_column('traffic_logs', 'geo_country', new_column_name='country_code')
    op.alter_column('traffic_logs', 'geo_city', new_column_name='city')
    
    # Remove columns from traffic_logs
    op.drop_column('traffic_logs', 'response_time')
    op.drop_column('traffic_logs', 'response_size')
    
    # Remove columns from domains
    op.drop_column('domains', 'verification_method')
    op.drop_column('domains', 'cdn_enabled')
    op.drop_column('domains', 'traffic_enabled')
    op.drop_column('domains', 'verified_at')
    op.drop_column('domains', 'monitoring_enabled')
    op.drop_column('domains', 'monitoring_interval')
    op.drop_column('domains', 'monitoring_url')
    op.drop_column('domains', 'monitoring_content')
    op.drop_column('domains', 'monitoring_headers')
    op.drop_column('domains', 'security_scan_enabled')
    op.drop_column('domains', 'security_scan_interval')
