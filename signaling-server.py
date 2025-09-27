#!/usr/bin/env python3
"""
Simple HTTP Signaling Server for WebRTC
Handles signaling messages between launchpad and remote control
"""

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import uuid

class SignalingData:
    def __init__(self):
        self.messages = {}
        self.lock = threading.Lock()
    
    def store_message(self, room_id, message):
        with self.lock:
            if room_id not in self.messages:
                self.messages[room_id] = []
            self.messages[room_id].append({
                'message': message,
                'timestamp': time.time()
            })
            # Keep only last 10 messages per room
            if len(self.messages[room_id]) > 10:
                self.messages[room_id] = self.messages[room_id][-10:]
    
    def get_messages(self, room_id, since_timestamp=0):
        with self.lock:
            if room_id not in self.messages:
                return []
            return [msg for msg in self.messages[room_id] if msg['timestamp'] > since_timestamp]
    
    def clear_room(self, room_id):
        with self.lock:
            if room_id in self.messages:
                del self.messages[room_id]

# Global signaling data storage
signaling_data = SignalingData()

class SignalingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests for polling messages"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query = parse_qs(parsed_path.query)
        
        if path == '/poll':
            room_id = query.get('room', ['default'])[0]
            since = float(query.get('since', [0])[0])
            
            messages = signaling_data.get_messages(room_id, since)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                'messages': messages,
                'timestamp': time.time()
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif path == '/status':
            # Return server status
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'running',
                'timestamp': time.time(),
                'rooms': len(signaling_data.messages)
            }
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        """Handle POST requests for sending messages"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/send':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                room_id = data.get('room', 'default')
                message = data.get('message', {})
                
                signaling_data.store_message(room_id, message)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                
                response = {'status': 'success', 'timestamp': time.time()}
                self.wfile.write(json.dumps(response).encode())
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'error': 'Invalid JSON'}
                self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

def run_server(port=8080):
    """Run the signaling server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, SignalingHandler)
    print(f"Signaling server running on port {port}")
    print(f"Access at: http://localhost:{port}/status")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down signaling server...")
        httpd.shutdown()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run_server(port)
