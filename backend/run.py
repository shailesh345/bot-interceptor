#!/usr/bin/env python
"""
Flask application runner for Traffic Interceptor SaaS
"""
import os
from flask.cli import FlaskGroup
from app import create_app, db
from app.models import User, Tenant, Domain, Subscription, InterceptorRule, TrafficLog, BotProfile, Analytics, ApiKey

app = create_app(os.getenv('FLASK_CONFIG', 'default'))
cli = FlaskGroup(app)

@cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()
    print("Database initialized successfully!")

@cli.command()
def create_super_admin():
    """Create a super admin user."""
    email = input("Enter super admin email: ")
    username = input("Enter super admin username: ")
    password = input("Enter super admin password: ")
    first_name = input("Enter first name: ")
    last_name = input("Enter last name: ")
    
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        print("User with this email already exists!")
        return
    
    if User.query.filter_by(username=username).first():
        print("User with this username already exists!")
        return
    
    # Create super admin user (no tenant)
    user = User(
        email=email,
        username=username,
        first_name=first_name,
        last_name=last_name,
        role='super_admin',
        is_verified=True
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    print(f"Super admin user '{username}' created successfully!")

@cli.command()
def seed_data():
    """Seed the database with sample data."""
    # Create sample bot profiles
    bot_profiles = [
        {
            'name': 'GoogleBot',
            'bot_type': 'search_engine',
            'user_agent_patterns': ['Googlebot', 'Google'],
            'is_verified': True,
            'is_allowed': True
        },
        {
            'name': 'OpenAI GPT',
            'bot_type': 'ai_trainer',
            'user_agent_patterns': ['GPTBot', 'OpenAI'],
            'is_verified': True,
            'is_allowed': False
        },
        {
            'name': 'Generic Scraper',
            'bot_type': 'scraper',
            'user_agent_patterns': ['python-requests', 'curl', 'wget'],
            'is_verified': False,
            'is_allowed': False
        }
    ]
    
    for profile_data in bot_profiles:
        existing_profile = BotProfile.query.filter_by(name=profile_data['name']).first()
        if not existing_profile:
            profile = BotProfile(**profile_data)
            db.session.add(profile)
    
    db.session.commit()
    print("Sample data seeded successfully!")

if __name__ == '__main__':
    cli()
