#!/usr/bin/env python3
"""
Simple test script to check if the backend can start
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing backend imports...")
    
    # Test basic imports
    from app import create_app, db
    print("✓ Basic imports successful")
    
    # Test app creation
    app = create_app('development')
    print("✓ App creation successful")
    
    # Test database connection
    with app.app_context():
        db.engine.execute('SELECT 1')
        print("✓ Database connection successful")
    
    print("\n🎉 Backend is ready to run!")
    print("You can now start the server with: python app.py")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install the required dependencies first:")
    print("pip install -r requirements_working.txt")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Please check the backend configuration")

if __name__ == '__main__':
    pass
