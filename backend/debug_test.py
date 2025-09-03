#!/usr/bin/env python3
"""
Debug test to identify Flask app startup issues
"""
import sys
import traceback

def test_minimal_flask():
    """Test if basic Flask works"""
    try:
        from flask import Flask
        print("✓ Flask import successful")
        
        app = Flask('test')
        print("✓ Flask app creation successful")
        
        @app.route('/test')
        def test():
            return 'OK'
        
        print("✓ Route definition successful")
        print("✓ Minimal Flask app ready")
        return True
        
    except Exception as e:
        print(f"❌ Flask test failed: {e}")
        traceback.print_exc()
        return False

def test_app_import():
    """Test if our app can be imported"""
    try:
        from app import create_app
        print("✓ App import successful")
        return True
    except Exception as e:
        print(f"❌ App import failed: {e}")
        traceback.print_exc()
        return False

def test_app_creation():
    """Test if our app can be created"""
    try:
        from app import create_app
        app = create_app()
        print("✓ App creation successful")
        print(f"✓ App config: {app.config.get('ENV', 'Not set')}")
        print(f"✓ Debug mode: {app.config.get('DEBUG', 'Not set')}")
        return True
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        traceback.print_exc()
        return False

def test_server_startup():
    """Test if server can start"""
    try:
        from app import create_app
        app = create_app()
        print("✓ App created for server test")
        
        # Test if we can access the app context
        with app.app_context():
            print("✓ App context works")
            print(f"✓ Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI', 'Not set')}")
        
        print("✓ Server startup test passed")
        return True
        
    except Exception as e:
        print(f"❌ Server startup test failed: {e}")
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🔍 Starting debug tests...")
    print("=" * 50)
    
    # Test 1: Basic Flask
    print("\n1. Testing basic Flask...")
    flask_ok = test_minimal_flask()
    
    # Test 2: App import
    print("\n2. Testing app import...")
    import_ok = test_app_import()
    
    # Test 3: App creation
    print("\n3. Testing app creation...")
    creation_ok = test_app_creation()
    
    # Test 4: Server startup
    print("\n4. Testing server startup...")
    startup_ok = test_server_startup()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Flask Basic: {'✅' if flask_ok else '❌'}")
    print(f"   App Import:  {'✅' if import_ok else '❌'}")
    print(f"   App Creation: {'✅' if creation_ok else '❌'}")
    print(f"   Server Startup: {'✅' if startup_ok else '❌'}")
    
    if all([flask_ok, import_ok, creation_ok, startup_ok]):
        print("\n🎉 All tests passed! App should work.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
