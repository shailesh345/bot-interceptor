"""
Clean Admin routes for Traffic Interceptor SaaS
"""
from flask import Blueprint, request, jsonify, current_app
from app.models import User, Tenant, Domain, Subscription, InterceptorRule, TrafficLog, BotProfile, Analytics
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json

clean_admin = Blueprint('clean_admin', __name__)

def get_current_user():
    """Helper function to get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        return User.query.filter_by(uuid=user_id).first()
    except:
        return None

@clean_admin.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search')
        role = request.args.get('role')
        status = request.args.get('status')
        
        query = User.query
        
        if search:
            query = query.filter(
                (User.username.ilike(f'%{search}%')) |
                (User.email.ilike(f'%{search}%')) |
                (User.first_name.ilike(f'%{search}%')) |
                (User.last_name.ilike(f'%{search}%'))
            )
        
        if role:
            query = query.filter(User.role == role)
        
        if status:
            query = query.filter(User.is_active == (status == 'active'))
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        user_list = []
        for user in users.items:
            user_data = {
                'id': user.uuid,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'is_verified': user.is_verified,
                'created_at': user.created_at.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'tenant_id': user.tenant_id
            }
            user_list.append(user_data)
        
        return jsonify({
            'users': user_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users.total,
                'pages': users.pages
            }
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching users', 'error': str(e)}), 500

@clean_admin.route('/system-stats', methods=['GET'])
@jwt_required()
def get_system_stats():
    """Get system statistics (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        import os
        from sqlalchemy import text
        
        # Get database file size
        db_path = current_app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')
        if db_path and os.path.exists(db_path):
            size_bytes = os.path.getsize(db_path)
            size_mb = round(size_bytes / (1024 * 1024), 2)
        else:
            size_mb = 0
        
        # Get table information
        tables = []
        table_names = ['users', 'domains', 'interceptor_rules', 'traffic_logs', 'bot_profiles', 'tenants', 'subscriptions']
        
        for table_name in table_names:
            try:
                # Get record count
                result = db.session.execute(text(f'SELECT COUNT(*) as count FROM {table_name}'))
                record_count = result.fetchone().count
                
                # Get column count
                result = db.session.execute(text(f'PRAGMA table_info({table_name})'))
                columns = result.fetchall()
                column_count = len(columns)
                
                tables.append({
                    'name': table_name,
                    'recordCount': record_count,
                    'columns': column_count
                })
            except Exception as e:
                # Table might not exist, skip it
                continue
        
        # Calculate total records
        total_records = sum(table['recordCount'] for table in tables)
        
        database_info = {
            'type': 'SQLite',
            'size': f'{size_mb} MB',
            'totalRecords': total_records,
            'tables': tables
        }
        
        return jsonify({
            'success': True,
            'database': database_info,
            'tables': tables
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching system stats', 'error': str(e)}), 500

@clean_admin.route('/database/info', methods=['GET'])
@jwt_required()
def get_database_info():
    """Get database information (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        import os
        from sqlalchemy import text
        
        # Get database file size
        db_path = current_app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')
        if db_path and os.path.exists(db_path):
            size_bytes = os.path.getsize(db_path)
            size_mb = round(size_bytes / (1024 * 1024), 2)
        else:
            size_mb = 0
        
        # Get table information
        tables = []
        table_names = ['users', 'domains', 'interceptor_rules', 'traffic_logs', 'bot_profiles', 'tenants', 'subscriptions']
        
        for table_name in table_names:
            try:
                # Get record count
                result = db.session.execute(text(f'SELECT COUNT(*) as count FROM {table_name}'))
                record_count = result.fetchone().count
                
                # Get column count
                result = db.session.execute(text(f'PRAGMA table_info({table_name})'))
                columns = result.fetchall()
                column_count = len(columns)
                
                tables.append({
                    'name': table_name,
                    'recordCount': record_count,
                    'columns': column_count
                })
            except Exception as e:
                # Table might not exist, skip it
                continue
        
        # Calculate total records
        total_records = sum(table['recordCount'] for table in tables)
        
        database_info = {
            'type': 'SQLite',
            'size': f'{size_mb} MB',
            'totalRecords': total_records,
            'tables': tables
        }
        
        return jsonify({
            'success': True,
            'database': database_info
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching database info', 'error': str(e)}), 500

@clean_admin.route('/database/tables/<table_name>', methods=['GET'])
@jwt_required()
def get_table_data(table_name):
    """Get table data and schema (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        from sqlalchemy import text
        
        # Get table schema
        result = db.session.execute(text(f'PRAGMA table_info({table_name})'))
        schema = []
        for row in result.fetchall():
            schema.append({
                'name': row.name,
                'type': row.type,
                'nullable': not row.notnull,
                'default': row.dflt_value
            })
        
        # Get table data (limit to 100 records)
        result = db.session.execute(text(f'SELECT * FROM {table_name} LIMIT 100'))
        records = []
        for row in result.fetchall():
            record = {}
            for i, column in enumerate(schema):
                record[column['name']] = row[i]
            records.append(record)
        
        return jsonify({
            'success': True,
            'schema': schema,
            'records': records
        })
        
    except Exception as e:
        return jsonify({'message': f'Error fetching table {table_name}', 'error': str(e)}), 500

@clean_admin.route('/database/tables/<table_name>/export', methods=['GET'])
@jwt_required()
def export_table_data(table_name):
    """Export table data (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        from sqlalchemy import text
        
        # Get all table data
        result = db.session.execute(text(f'SELECT * FROM {table_name}'))
        records = []
        for row in result.fetchall():
            records.append(dict(row._mapping))
        
        return jsonify({
            'success': True,
            'table': table_name,
            'data': records
        })
        
    except Exception as e:
        return jsonify({'message': f'Error exporting table {table_name}', 'error': str(e)}), 500

@clean_admin.route('/database/backup', methods=['POST'])
@jwt_required()
def backup_database():
    """Create database backup (admin only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != 'super_admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    try:
        import shutil
        import os
        from datetime import datetime
        
        # Get database path
        db_path = current_app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')
        if not db_path or not os.path.exists(db_path):
            return jsonify({'message': 'Database file not found'}), 404
        
        # Create backup directory
        backup_dir = 'backups'
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        # Create backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'traffic_interceptor_backup_{timestamp}.db'
        backup_path = os.path.join(backup_dir, backup_filename)
        
        # Copy database file
        shutil.copy2(db_path, backup_path)
        
        return jsonify({
            'success': True,
            'message': 'Database backup created successfully',
            'backup_path': backup_path
        })
        
    except Exception as e:
        return jsonify({'message': 'Error creating database backup', 'error': str(e)}), 500
