#!/usr/bin/env python3
"""
Server test to identify why Flask server isn't starting
"""
import threading
import time
import requests
from app import create_app

def start_server():
    """Start the Flask server in a separate thread"""
    try:
        app = create_app()
        print("✓ App created successfully")
        print("✓ Starting server on http://127.0.0.1:8960")
        
        # Start server in development mode
        app.run(host='127.0.0.1', port=8960, debug=False, use_reloader=False)
        
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        import traceback
        traceback.print_exc()

def test_server():
    """Test if server is responding"""
    try:
        response = requests.get('http://127.0.0.1:8960/health', timeout=5)
        if response.status_code == 200:
            print("✓ Server is responding!")
            print(f"✓ Response: {response.text}")
            return True
        else:
            print(f"⚠️  Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not responding - connection refused")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == '__main__':
    print("🚀 Starting server test...")
    
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    print("⏳ Waiting for server to start...")
    time.sleep(10)  # Wait 10 seconds for server to start
    
    # Test server
    print("🔍 Testing server...")
    success = test_server()
    
    if success:
        print("🎉 Server is working!")
    else:
        print("⚠️  Server test failed")
    
    print("🛑 Test complete")
