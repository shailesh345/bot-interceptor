#!/usr/bin/env python3
import urllib.request
import json

try:
    print("Testing backend connectivity...")
    
    # Test basic connectivity
    request = urllib.request.Request("http://127.0.0.1:5000/")
    with urllib.request.urlopen(request) as response:
        print(f"Server response: {response.getcode()}")
        print(f"Response: {response.read().decode()}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
