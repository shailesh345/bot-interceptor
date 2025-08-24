#!/usr/bin/env python3
"""
Database initialization script
Creates all tables based on the current models
"""

from app import create_app, db
from app.models import Tenant, User, Domain, Subscription, InterceptorRule, TrafficLog, BotProfile, Analytics, ApiKey, Notification

def init_database():
    """Initialize the database with all tables"""
    app = create_app()
    
    with app.app_context():
        print("🗄️  Initializing database...")
        
        # Drop all tables first to ensure clean schema
        print("🗑️  Dropping existing tables...")
        db.drop_all()
        
        # Create all tables with current schema
        print("🏗️  Creating tables with current schema...")
        db.create_all()
        
        print("✅ Database tables created successfully!")
        
        # Verify tables were created
        print("📋 Database initialized successfully!")
        
        # Check TrafficLog table structure
        print("\n🔍 TrafficLog table structure:")
        with db.engine.connect() as conn:
            result = conn.execute(db.text("PRAGMA table_info(traffic_logs)"))
            columns = result.fetchall()
            for col in columns:
                print(f"  {col[1]} ({col[2]})")

if __name__ == '__main__':
    init_database()
