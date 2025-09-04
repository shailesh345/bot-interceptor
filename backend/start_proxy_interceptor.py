#!/usr/bin/env python3
"""
Proxy Interceptor Service Startup
Starts the DNS/Proxy traffic interception service
"""

import asyncio
import logging
import sys
import os
import redis

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import after path setup
from app.interceptor.proxy_interceptor import ProxyInterceptor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    """Start the proxy interceptor service"""
    try:
        print("🔄 Boot Interceptor - Proxy Service Starting...")
        print("📍 Port: 8080")
        print("🌐 Host: 0.0.0.0")
        print("=" * 50)
        
        # Initialize Redis connection
        try:
            redis_client = redis.Redis(host='localhost', port=6379, db=0)
            redis_client.ping()  # Test connection
            logger.info("✅ Redis connection established")
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            print("💡 Make sure Redis is running: redis-server")
            return
        
        # Create and start proxy interceptor
        proxy = ProxyInterceptor(redis_client)
        
        logger.info("🚀 Starting Boot Interceptor Proxy Service...")
        await proxy.start(host='0.0.0.0', port=8080)
        
        logger.info("✅ Proxy service started successfully!")
        print("🎯 DNS/Proxy traffic interception is now ACTIVE")
        print("📝 Configure your domains to point to this server")
        print("🔗 Example: example.com A record → YOUR_SERVER_IP")
        
        # Keep running
        while True:
            await asyncio.sleep(60)  # Health check every minute
            
    except KeyboardInterrupt:
        logger.info("🛑 Proxy service stopped by user")
    except Exception as e:
        logger.error(f"❌ Error starting proxy service: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == '__main__':
    asyncio.run(main())
