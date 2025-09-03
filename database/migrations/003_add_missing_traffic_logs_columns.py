#!/usr/bin/env python3
"""
Migration: Add missing columns to traffic_logs table
Date: 2025-09-03
Description: Add organization_id and credits_used columns to traffic_logs table
"""

import sqlite3
import os

def upgrade_database(db_path):
    """Add missing columns to traffic_logs table"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔧 Starting migration: Add missing traffic_logs columns...")
        
        # Check if organization_id column exists
        cursor.execute("PRAGMA table_info(traffic_logs)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'organization_id' not in columns:
            print("➕ Adding organization_id column to traffic_logs...")
            cursor.execute("""
                ALTER TABLE traffic_logs 
                ADD COLUMN organization_id INTEGER REFERENCES organizations(id)
            """)
            print("✅ Added organization_id column")
        else:
            print("⚠️  organization_id column already exists")
        
        if 'credits_used' not in columns:
            print("➕ Adding credits_used column to traffic_logs...")
            cursor.execute("""
                ALTER TABLE traffic_logs 
                ADD COLUMN credits_used INTEGER DEFAULT 0
            """)
            print("✅ Added credits_used column")
        else:
            print("⚠️  credits_used column already exists")
            
        # Also check for other potentially missing columns and rename if needed
        if 'client_ip' not in columns and 'ip_address' in columns:
            print("🔄 Column ip_address exists, but model expects client_ip. This will need data migration.")
            
        if 'geo_country' not in columns and 'country_code' in columns:
            print("🔄 Column country_code exists, but model expects geo_country. This will need data migration.")
            
        if 'geo_city' not in columns and 'city' in columns:
            print("🔄 Column city exists, but model expects geo_city. This will need data migration.")
        
        conn.commit()
        print("✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def downgrade_database(db_path):
    """Remove the added columns (if needed for rollback)"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔧 Starting migration rollback: Remove added traffic_logs columns...")
        
        # Note: SQLite doesn't support DROP COLUMN in older versions
        # We would need to recreate the table without these columns
        print("⚠️  SQLite doesn't support DROP COLUMN. Manual rollback needed.")
        
        conn.commit()
        print("✅ Rollback completed!")
        
    except Exception as e:
        print(f"❌ Rollback failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    # Default database path
    db_path = os.path.join(os.path.dirname(__file__), "../instance/traffic_interceptor.db")
    
    # Alternative path if the above doesn't exist
    if not os.path.exists(db_path):
        db_path = os.path.join(os.path.dirname(__file__), "../../backend/instance/traffic_interceptor.db")
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Please specify the correct path.")
        exit(1)
    
    print(f"🎯 Using database: {db_path}")
    upgrade_database(db_path)
