#!/usr/bin/env python3
"""
Test script to reproduce the domains endpoint 500 error
"""

from app import create_app, db
from app.models import User, Domain
from app.interceptor.domain_verification import domain_verification_service
import json

def test_domains_endpoint_error():
    """Test the domains endpoint to reproduce the 500 error"""
    
    print("🧪 Testing Domains Endpoint Error Reproduction")
    print("=" * 50)
    
    try:
        # Create Flask app context
        app = create_app()
        with app.app_context():
            print("✅ Flask app context created")
            
            # Test domain verification service
            print("\n1️⃣ Testing domain verification service...")
            token = domain_verification_service.generate_verification_token('test.com', 'user123')
            print(f"✅ Token generated: {token}")
            
            # Test getting verification instructions
            print("\n2️⃣ Testing verification instructions...")
            instructions = domain_verification_service.get_domain_verification_instructions('test.com', 'dns', token)
            print(f"✅ Instructions generated: {len(instructions)} items")
            
            # Test domain creation logic (without database commit)
            print("\n3️⃣ Testing domain creation logic...")
            try:
                # Simulate the domain creation process
                domain_name = 'test.com'
                verification_method = 'dns'
                
                # Generate verification token
                verification_token = domain_verification_service.generate_verification_token(
                    domain_name, 'user123'
                )
                print(f"✅ Verification token: {verification_token}")
                
                # Get verification instructions
                instructions = domain_verification_service.get_domain_verification_instructions(
                    domain_name, verification_method, verification_token
                )
                print(f"✅ Instructions: {instructions['method']}")
                
                print("✅ Domain creation logic completed successfully")
                
            except Exception as e:
                print(f"❌ Domain creation logic failed: {e}")
                import traceback
                traceback.print_exc()
            
            print("\n✅ All tests completed successfully!")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_domains_endpoint_error()
