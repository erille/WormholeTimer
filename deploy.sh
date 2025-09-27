#!/bin/bash

# Wormhole Timer - Deployment Script for Linux Server
# This script sets up the Node.js signaling server and nginx configuration

set -e

echo "🚀 Wormhole Timer - Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing Node.js..."
    
    # Install Node.js (Ubuntu/Debian)
    if command -v apt &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        apt-get install -y nodejs
    # Install Node.js (CentOS/RHEL)
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        yum install -y nodejs
    else
        print_error "Unsupported package manager. Please install Node.js manually."
        exit 1
    fi
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Create systemd service for the signaling server
print_status "Creating systemd service..."
cat > /etc/systemd/system/wormhole-signaling.service << EOF
[Unit]
Description=Wormhole Timer Signaling Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html
ExecStart=/usr/bin/node signaling-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

# Set proper permissions
print_status "Setting permissions..."
chown -R www-data:www-data /var/www/html
chmod +x /var/www/html/signaling-server.js

# Configure nginx
print_status "Configuring nginx..."

# Backup existing default configuration
if [ -f /etc/nginx/sites-enabled/default ]; then
    mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup
fi

# Copy nginx configuration
cp nginx-wormhole.conf /etc/nginx/sites-available/wormhole
ln -sf /etc/nginx/sites-available/wormhole /etc/nginx/sites-enabled/

# Test nginx configuration
print_status "Testing nginx configuration..."
nginx -t

# Reload nginx
print_status "Reloading nginx..."
systemctl reload nginx

# Enable and start the signaling server
print_status "Starting signaling server..."
systemctl daemon-reload
systemctl enable wormhole-signaling
systemctl start wormhole-signaling

# Check service status
print_status "Checking service status..."
systemctl status wormhole-signaling --no-pager

# Show final information
echo ""
echo "🎉 Deployment completed successfully!"
echo "======================================"
echo ""
echo "📊 Service Status:"
echo "  - Signaling Server: systemctl status wormhole-signaling"
echo "  - Nginx: systemctl status nginx"
echo ""
echo "🌐 URLs:"
echo "  - Main Timer: http://$(hostname -I | awk '{print $1}')/"
echo "  - Launchpad: http://$(hostname -I | awk '{print $1}')/launchpad"
echo "  - Remote Control: http://$(hostname -I | awk '{print $1}')/remote-control"
echo "  - API Status: http://$(hostname -I | awk '{print $1}')/api/status"
echo ""
echo "🔧 Management Commands:"
echo "  - Start server: systemctl start wormhole-signaling"
echo "  - Stop server: systemctl stop wormhole-signaling"
echo "  - Restart server: systemctl restart wormhole-signaling"
echo "  - View logs: journalctl -u wormhole-signaling -f"
echo ""
echo "📝 Configuration Files:"
echo "  - Nginx: /etc/nginx/sites-available/wormhole"
echo "  - Service: /etc/systemd/system/wormhole-signaling.service"
echo ""

print_status "Deployment completed! The Wormhole Timer is now running."
