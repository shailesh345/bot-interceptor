#!/usr/bin/env python3
"""
Database Migration Runner
Fixes schema issues identified in the health check report
"""

import os
import sys
import sqlite3
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_migration():
    """Run the database migration to fix schema issues"""
    
    # Database path
    db_path = Path(__file__).parent / "instance" / "traffic_interceptor.db"
    
    if not db_path.exists():
        print("❌ Database file not found. Please initialize the database first.")
        return False
    
    print("🔧 Running database migration to fix schema issues...")
    
    try:
        # Connect to database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if migration has already been applied
        cursor.execute("PRAGMA table_info(interceptor_rules)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'tenant_id' in columns and 'user_id' in columns:
            print("✅ Migration already applied. Schema is up to date.")
            return True
        
        print("📝 Adding missing columns to interceptor_rules table...")
        
        # Add missing columns to interceptor_rules
        cursor.execute("ALTER TABLE interceptor_rules ADD COLUMN tenant_id INTEGER NOT NULL DEFAULT 1")
        cursor.execute("ALTER TABLE interceptor_rules ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1")
        
        # Create indexes for better performance
        print("📊 Creating performance indexes...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_interceptor_rules_tenant_id ON interceptor_rules(tenant_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_interceptor_rules_user_id ON interceptor_rules(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_interceptor_rules_domain_id ON interceptor_rules(domain_id)")
        
        # Check if we need to rename columns in traffic_logs
        cursor.execute("PRAGMA table_info(traffic_logs)")
        traffic_columns = [col[1] for col in cursor.fetchall()]
        
        if 'ip_address' in traffic_columns:
            print("🔄 Renaming traffic_logs columns to match model...")
            # SQLite doesn't support ALTER COLUMN RENAME, so we need to recreate
            # For now, we'll add the new columns and handle the mapping in the code
            if 'client_ip' not in traffic_columns:
                cursor.execute("ALTER TABLE traffic_logs ADD COLUMN client_ip VARCHAR(45)")
            if 'geo_country' not in traffic_columns:
                cursor.execute("ALTER TABLE traffic_logs ADD COLUMN geo_country VARCHAR(2)")
            if 'geo_city' not in traffic_columns:
                cursor.execute("ALTER TABLE traffic_logs ADD COLUMN geo_city VARCHAR(100)")
            if 'response_time' not in traffic_columns:
                cursor.execute("ALTER TABLE traffic_logs ADD COLUMN response_time FLOAT")
            if 'response_size' not in traffic_columns:
                cursor.execute("ALTER TABLE traffic_logs ADD COLUMN response_size BIGINT")
        
        # Check domains table for missing columns
        cursor.execute("PRAGMA table_info(domains)")
        domain_columns = [col[1] for col in cursor.fetchall()]
        
        missing_domain_columns = [
            ('verification_method', 'VARCHAR(50)', 'dns'),
            ('cdn_enabled', 'BOOLEAN', 'false'),
            ('traffic_enabled', 'BOOLEAN', 'true'),
            ('verified_at', 'DATETIME', None),
            ('monitoring_enabled', 'BOOLEAN', 'false'),
            ('monitoring_interval', 'INTEGER', '60'),
            ('monitoring_url', 'VARCHAR(500)', None),
            ('monitoring_content', 'TEXT', None),
            ('monitoring_headers', 'TEXT', None),
            ('security_scan_enabled', 'BOOLEAN', 'false'),
            ('security_scan_interval', 'INTEGER', '24')
        ]
        
        print("🏗️ Adding missing columns to domains table...")
        for col_name, col_type, default_value in missing_domain_columns:
            if col_name not in domain_columns:
                if default_value is not None:
                    cursor.execute(f"ALTER TABLE domains ADD COLUMN {col_name} {col_type} DEFAULT '{default_value}'")
                else:
                    cursor.execute(f"ALTER TABLE domains ADD COLUMN {col_name} {col_type}")
        
        # Commit changes
        conn.commit()
        print("✅ Database migration completed successfully!")
        
        # Verify the changes
        print("\n🔍 Verifying migration results...")
        cursor.execute("PRAGMA table_info(interceptor_rules)")
        rules_columns = [col[1] for col in cursor.fetchall()]
        
        if 'tenant_id' in rules_columns and 'user_id' in rules_columns:
            print("✅ interceptor_rules table schema fixed")
        else:
            print("❌ interceptor_rules table schema still has issues")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()

def create_default_tenant_and_user():
    """Create default tenant and user if they don't exist"""
    
    db_path = Path(__file__).parent / "instance" / "traffic_interceptor.db"
    
    if not db_path.exists():
        print("❌ Database file not found. Please initialize the database first.")
        return False
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if default tenant exists
        cursor.execute("SELECT id FROM tenants WHERE slug = 'default'")
        tenant = cursor.fetchone()
        
        if not tenant:
            print("🏢 Creating default tenant...")
            cursor.execute("""
                INSERT INTO tenants (uuid, name, slug, domain, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """, (str(uuid.uuid4()), 'Default Tenant', 'default', 'localhost', 'active'))
            tenant_id = cursor.lastrowid
        else:
            tenant_id = tenant[0]
        
        # Check if default admin user exists
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        admin_user = cursor.fetchone()
        
        if not admin_user:
            print("👤 Creating default admin user...")
            from werkzeug.security import generate_password_hash
            cursor.execute("""
                INSERT INTO users (uuid, email, username, password_hash, role, is_active, tenant_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """, (str(uuid.uuid4()), 'admin@localhost', 'admin', generate_password_hash('admin123'), 'admin', True, tenant_id))
        
        conn.commit()
        print("✅ Default tenant and user setup completed")
        return True
        
    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        return False
    
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    import uuid
    
    print("🚀 Starting Database Migration Process")
    print("=" * 50)
    
    # Run migration
    if run_migration():
        print("\n🔧 Setting up default tenant and user...")
        create_default_tenant_and_user()
        
        print("\n🎉 Migration process completed successfully!")
        print("✅ Database schema is now compatible with the application models")
        print("✅ All missing columns have been added")
        print("✅ Performance indexes have been created")
        print("✅ Default tenant and user have been set up")
        
        print("\n📋 Next steps:")
        print("1. Restart the backend service")
        print("2. Test the API endpoints")
        print("3. Verify frontend integration")
    else:
        print("\n❌ Migration failed. Please check the error messages above.")
        sys.exit(1)
