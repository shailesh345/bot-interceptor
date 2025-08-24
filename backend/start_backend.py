#!/usr/bin/env python3
"""
Backend startup script for Traffic Interceptor SaaS
"""
import os
import sys
import subprocess
import time

def install_dependencies():
    """Install backend dependencies"""
    print("📦 Installing backend dependencies...")
    
    try:
        # Try to install from working requirements first
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements_working.txt'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully")
            return True
        else:
            print("⚠️  Some dependencies failed to install, trying minimal requirements...")
            
            # Try minimal requirements
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install', 'Flask', 'Flask-SQLAlchemy', 'Flask-CORS'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Basic dependencies installed")
                return True
            else:
                print("❌ Failed to install dependencies")
                return False
                
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def test_backend():
    """Test if backend can start"""
    print("🧪 Testing backend...")
    
    try:
        result = subprocess.run([
            sys.executable, 'test_backend.py'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Backend test passed")
            return True
        else:
            print(f"❌ Backend test failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    
    try:
        # Start the Flask app
        subprocess.run([
            sys.executable, 'app.py'
        ])
        
    except KeyboardInterrupt:
        print("\n🛑 Backend stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

def main():
    """Main startup function"""
    print("🎯 Traffic Interceptor Backend Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("❌ Please run this script from the backend directory")
        return
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Cannot proceed without dependencies")
        return
    
    # Test backend
    if not test_backend():
        print("❌ Backend test failed, cannot start")
        return
    
    # Start backend
    start_backend()

if __name__ == '__main__':
    main()
