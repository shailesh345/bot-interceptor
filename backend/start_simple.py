#!/usr/bin/env python3
"""
Simple Backend Startup Script
Starts the backend with minimal configuration
"""

import os
import sys
import time

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def start_backend():
    """Start the backend server"""
    try:
        print("🚀 Starting Traffic Interceptor Backend...")
        print("📍 Port: 8960")
        print("🌐 Host: 0.0.0.0")
        print("🔧 Debug: True")
        print("=" * 50)
        
        # Import and create app
        from app import create_app, socketio
        
        app = create_app()
        
        print("✅ App created successfully")
        print("🚀 Starting server...")
        
        # Start the server
        socketio.run(app, host='0.0.0.0', port=8960, debug=True)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Try installing dependencies: pip install -r requirements_working.txt")
        return False
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    start_backend()
