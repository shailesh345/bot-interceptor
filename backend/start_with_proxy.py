#!/usr/bin/env python3
"""
Flask app with integrated Proxy Interceptor
Starts both Flask API server and Proxy Interceptor service
"""

import asyncio
import threading
import time
import sys
import os
import redis

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, socketio
from app.interceptor.proxy_interceptor import ProxyInterceptor

# Create Flask app
app = create_app()

def start_proxy_interceptor():
    """Start proxy interceptor in separate thread"""
    async def proxy_main():
        try:
            # Initialize Redis connection
            redis_client = redis.Redis(host='localhost', port=6379, db=0)
            redis_client.ping()  # Test connection
            print("✅ Proxy: Redis connection established")
            
            # Create and start proxy interceptor
            proxy = ProxyInterceptor(redis_client)
            print("🔄 Proxy: Starting on port 8080...")
            
            await proxy.start(host='0.0.0.0', port=8080)
            
            # Keep running
            while True:
                await asyncio.sleep(60)
                
        except Exception as e:
            print(f"❌ Proxy Error: {e}")
            import traceback
            traceback.print_exc()
    
    # Create new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        loop.run_until_complete(proxy_main())
    except KeyboardInterrupt:
        print("🛑 Proxy service stopped")
    finally:
        loop.close()

def check_services():
    """Check if required services are running"""
    print("🔍 Checking required services...")
    
    # Check Redis
    try:
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis: Running")
    except Exception as e:
        print("❌ Redis: Not running - please start Redis server")
        print("💡 Start Redis: redis-server")
        return False
    
    return True

if __name__ == '__main__':
    print("🎯 Boot Interceptor - Full Stack Startup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_services():
        print("❌ Prerequisites not met, cannot start")
        sys.exit(1)
    
    # Start proxy interceptor in background thread
    print("🚀 Starting Proxy Interceptor (Background)...")
    proxy_thread = threading.Thread(target=start_proxy_interceptor, daemon=True)
    proxy_thread.start()
    
    # Wait a moment for proxy to start
    time.sleep(2)
    
    print("🚀 Starting Flask API Server...")
    print("📍 Flask Port: 8960")
    print("📍 Proxy Port: 8080")
    print("🌐 Host: 0.0.0.0")
    print("=" * 50)
    
    try:
        # Start Flask app
        socketio.run(app, host='0.0.0.0', port=8960, debug=True)
    except KeyboardInterrupt:
        print("🛑 Services stopped by user")
    except Exception as e:
        print(f"❌ Flask Error: {e}")
        import traceback
        traceback.print_exc()
