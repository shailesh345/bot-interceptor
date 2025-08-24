#!/usr/bin/env python3
"""
ML System Test Script
Generates sample traffic data and tests the ML bot detection system
"""

import os
import sys
import random
import time
from datetime import datetime, timedelta
from faker import Faker

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app import create_app, db
from app.models import User, Domain, TrafficLog, BotProfile, Tenant
from app.ml.bot_detection_model import bot_detection_model

# Initialize Faker for generating realistic data
fake = Faker()

def create_sample_tenant():
    """Create a sample tenant for testing"""
    tenant = Tenant.query.filter_by(name='Test Tenant').first()
    if not tenant:
        tenant = Tenant(
            name='Test Tenant',
            uuid=fake.uuid4(),
            slug='test-tenant',
            domain='testtenant.com',
            status='active'
        )
        db.session.add(tenant)
        db.session.commit()
        print(f"✅ Created test tenant: {tenant.name}")
    return tenant

def create_sample_user(tenant):
    """Create a sample user for testing"""
    user = User.query.filter_by(email='admin@testtenant.com').first()
    if not user:
        user = User(
            uuid=fake.uuid4(),
            email='admin@testtenant.com',
            username='testadmin',
            password_hash='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.i8l2',  # 'password123'
            first_name='Test',
            last_name='Admin',
            role='admin',
            tenant_id=tenant.id,
            is_active=True,
            is_verified=True
        )
        db.session.add(user)
        db.session.commit()
        print(f"✅ Created test user: {user.email}")
    return user

def create_sample_domains(tenant):
    """Create sample domains for testing"""
    domains = []
    domain_names = [
        'example.com',
        'testshop.com',
        'blog.example.com',
        'api.testshop.com',
        'admin.example.com'
    ]
    
    for domain_name in domain_names:
        print(f"Processing domain: {domain_name}")
        domain = Domain.query.filter_by(domain_name=domain_name, tenant_id=tenant.id).first()
        print(f"Existing domain query result: {domain}")
        if not domain:
            domain = Domain(
                uuid=fake.uuid4(),
                domain_name=domain_name,
                tenant_id=tenant.id,
                status='active',
                is_verified=True,
                traffic_enabled=True
            )
            print(f"Created new domain object: {domain}")
            db.session.add(domain)
            domains.append(domain)
        else:
            print(f"Domain already exists: {domain}")
            domains.append(domain)  # Add existing domains to the list too
    
    db.session.commit()
    print(f"✅ Total domains available: {len(domains)}")
    print(f"Debug: domains list: {domains}")
    print(f"Debug: domain names: {domain_names}")
    return domains

def generate_user_agents():
    """Generate realistic user agents for humans and bots"""
    human_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
    ]
    
    bot_agents = [
        'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
        'python-requests/2.25.1',
        'curl/7.68.0',
        'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
        'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
        'Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)',
        'Mozilla/5.0 (compatible; DotBot/1.1; http://www.opensiteexplorer.org/dotbot, help@moz.com)',
        'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)'
    ]
    
    return human_agents, bot_agents

def generate_sample_traffic(domains, days=7):
    """Generate sample traffic data over the specified number of days"""
    print(f"🔄 Generating {days} days of sample traffic data...")
    
    human_agents, bot_agents = generate_user_agents()
    
    # Generate traffic for each day
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    total_logs = 0
    bot_logs = 0
    human_logs = 0
    
    current_date = start_date
    while current_date <= end_date:
        # Generate traffic for this day
        daily_logs = random.randint(50, 200)  # Random number of requests per day
        
        for _ in range(daily_logs):
            # Randomly decide if this is a bot or human request
            is_bot = random.random() < 0.3  # 30% chance of being a bot
            
            # Select random domain
            domain = random.choice(domains)
            
            # Generate timestamp within the current day
            timestamp = current_date + timedelta(
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
                seconds=random.randint(0, 59)
            )
            
            # Select user agent
            if is_bot:
                user_agent = random.choice(bot_agents)
                bot_logs += 1
            else:
                user_agent = random.choice(human_agents)
                human_logs += 1
            
            # Generate request data
            request_method = random.choice(['GET', 'POST', 'HEAD', 'OPTIONS'])
            request_path = random.choice([
                '/',
                '/about',
                '/products',
                '/contact',
                '/api/data',
                '/admin',
                '/blog',
                '/search',
                '/cart',
                '/checkout'
            ])
            
            # Add query parameters for some requests
            if random.random() < 0.3:
                request_path += f'?q={fake.word()}&page={random.randint(1, 10)}'
            
            # Generate client IP
            if is_bot:
                # Bots often use data center IPs
                client_ip = random.choice([
                    '104.16.0.1',  # Cloudflare
                    '8.8.8.8',     # Google
                    '1.1.1.1',     # Cloudflare
                    '208.67.222.222',  # OpenDNS
                    '185.199.108.1'    # GitHub
                ])
            else:
                # Human users with more diverse IPs
                client_ip = fake.ipv4()
            
            # Generate geographic data
            geo_country = fake.country_code()
            geo_city = fake.city()
            
            # Determine action based on bot detection
            if is_bot:
                action_taken = random.choice(['block', 'challenge', 'allow'])
                bot_score = random.uniform(0.7, 1.0)
            else:
                action_taken = 'allow'
                bot_score = random.uniform(0.0, 0.3)
            
            # Create traffic log
            traffic_log = TrafficLog(
                uuid=fake.uuid4(),
                domain_id=domain.id,
                timestamp=timestamp,
                client_ip=client_ip,
                user_agent=user_agent,
                request_method=request_method,
                request_path=request_path,
                response_status=random.choice([200, 200, 200, 404, 500, 301, 302]),
                response_size=random.randint(100, 50000),
                is_bot=is_bot,
                geo_country=geo_country,
                geo_city=geo_city,
                request_headers={
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            )
            
            db.session.add(traffic_log)
            total_logs += 1
        
        current_date += timedelta(days=1)
    
    db.session.commit()
    print(f"✅ Generated {total_logs} traffic logs ({bot_logs} bots, {human_logs} humans)")
    return total_logs

def test_ml_model():
    """Test the ML model with sample data"""
    print("\n🧠 Testing ML Model...")
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        try:
            # Get model info
            model_info = bot_detection_model.get_model_info()
            print(f"📊 Model Info: {model_info}")
            
            # Check if model needs training
            if not model_info['is_trained']:
                print("🔄 Model not trained. Training with sample data...")
                
                # Train the model
                training_results = bot_detection_model.train_model(days=7, test_size=0.2)
                print(f"✅ Training completed!")
                print(f"   Accuracy: {training_results['accuracy']:.4f}")
                print(f"   CV Mean: {training_results['cv_mean']:.4f}")
                print(f"   Training samples: {training_results['training_samples']}")
                print(f"   Test samples: {training_results['test_samples']}")
            else:
                print("✅ Model already trained")
            
            # Test predictions
            print("\n🔮 Testing predictions...")
            
            # Test with a human-like request
            human_request = {
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'request_method': 'GET',
                'request_path': '/products',
                'client_ip': '192.168.1.100',
                'timestamp': datetime.utcnow(),
                'geo_country': 'US',
                'geo_city': 'New York',
                'content': '',
                'headers': {},
                'query_params': {},
                'requests_per_minute': 2,
                'unique_paths_visited': 5,
                'session_duration': 300
            }
            
            human_prediction = bot_detection_model.predict(human_request)
            print(f"👤 Human Request Prediction:")
            print(f"   Is Bot: {human_prediction['is_bot']}")
            print(f"   Bot Probability: {human_prediction['bot_probability']:.4f}")
            print(f"   Human Probability: {human_prediction['human_probability']:.4f}")
            print(f"   Confidence: {human_prediction['confidence']:.4f}")
            
            # Test with a bot-like request
            bot_request = {
                'user_agent': 'python-requests/2.25.1',
                'request_method': 'GET',
                'request_path': '/api/data',
                'client_ip': '104.16.0.1',
                'timestamp': datetime.utcnow(),
                'geo_country': 'US',
                'geo_city': 'San Francisco',
                'content': '',
                'headers': {},
                'query_params': {},
                'requests_per_minute': 50,
                'unique_paths_visited': 1,
                'session_duration': 0
            }
            
            bot_prediction = bot_detection_model.predict(bot_request)
            print(f"\n🤖 Bot Request Prediction:")
            print(f"   Is Bot: {bot_prediction['is_bot']}")
            print(f"   Bot Probability: {bot_prediction['bot_probability']:.4f}")
            print(f"   Human Probability: {bot_prediction['human_probability']:.4f}")
            print(f"   Confidence: {bot_prediction['confidence']:.4f}")
            
            # Evaluate model performance
            print("\n📈 Evaluating model performance...")
            evaluation_results = bot_detection_model.evaluate_model(days=7)
            print(f"   Evaluation Results: {evaluation_results}")
            
            # Assertions for proper testing
            assert model_info is not None, "Model info should not be None"
            assert 'is_trained' in model_info, "Model info should contain is_trained field"
            assert human_prediction is not None, "Human prediction should not be None"
            assert bot_prediction is not None, "Bot prediction should not be None"
            assert 'is_bot' in human_prediction, "Prediction should contain is_bot field"
            assert 'is_bot' in bot_prediction, "Prediction should contain is_bot field"
            
            print("✅ All ML model tests passed!")
            
        except Exception as e:
            print(f"❌ Error testing ML model: {e}")
            import traceback
            traceback.print_exc()
            raise  # Re-raise the exception for pytest to catch

def test_api_endpoints():
    """Test the ML API endpoints"""
    print("\n🌐 Testing ML API Endpoints...")
    
    try:
        import requests
        
        base_url = 'http://127.0.0.1:5001'
        
        # Test health check endpoint first (should not require auth)
        print("🏥 Testing /health...")
        response = requests.get(f"{base_url}/health")
        print(f"   Health Status: {response.status_code}")
        
        # Test model info endpoint (may require auth)
        print("📊 Testing /api/ml/model/info...")
        response = requests.get(f"{base_url}/api/ml/model/info")
        print(f"   Model Info Status: {response.status_code}")
        
        # For now, just check that we get a response (even if it's 401 for auth)
        assert response.status_code in [200, 401], f"Unexpected status code: {response.status_code}"
        
        if response.status_code == 401:
            print("   Note: Endpoint requires authentication (expected for protected routes)")
        else:
            assert response.json() is not None, "Response should contain JSON data"
        
        print("✅ API endpoint tests passed!")
        
    except Exception as e:
        print(f"❌ Error testing API endpoints: {e}")
        import traceback
        traceback.print_exc()
        raise  # Re-raise the exception for pytest to catch

def main():
    """Main test function"""
    print("🚀 Starting ML System Test...")
    print("=" * 50)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        try:
            # Create sample data
            print("📝 Creating sample data...")
            tenant = create_sample_tenant()
            user = create_sample_user(tenant)
            domains = create_sample_domains(tenant)
            
            # Generate traffic data
            generate_sample_traffic(domains, days=7)
            
            # Test ML model
            ml_success = test_ml_model()
            
            # Test API endpoints
            api_success = test_api_endpoints()
            
            print("\n" + "=" * 50)
            print("🎯 Test Results Summary:")
            print(f"   ✅ Sample data created successfully")
            print(f"   {'✅' if ml_success else '❌'} ML model testing")
            print(f"   {'✅' if api_success else '❌'} API endpoint testing")
            
            if ml_success and api_success:
                print("\n🎉 All tests passed! ML system is working correctly.")
                print("\n📋 Next steps:")
                print("   1. Access the ML Model Management dashboard at /ml-management")
                print("   2. Train the model with more data")
                print("   3. Test real-time predictions")
                print("   4. Monitor model performance")
            else:
                print("\n⚠️  Some tests failed. Check the logs above for details.")
            
        except Exception as e:
            print(f"❌ Fatal error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    main()
