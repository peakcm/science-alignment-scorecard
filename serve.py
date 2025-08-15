#!/usr/bin/env python3
"""
Simple HTTP server for testing the Science Alignment Scorecard locally.
This resolves CORS issues when loading JSON files.

Usage:
    python serve.py
    
Then open: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

if __name__ == "__main__":
    # Change to the directory containing this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print(f"🚀 Science Alignment Scorecard server running at:")
        print(f"   http://localhost:{PORT}")
        print(f"   http://localhost:{PORT}/index.html")
        print(f"\n💡 This server resolves CORS issues for loading JSON data files.")
        print(f"📱 Press Ctrl+C to stop the server")
        
        # Try to open the browser automatically
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print(f"🌐 Opened in your default browser")
        except:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n👋 Server stopped")