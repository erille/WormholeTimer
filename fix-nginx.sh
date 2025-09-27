#!/bin/bash

# Script de correction pour nginx
# À exécuter après l'erreur de configuration nginx

set -e

echo "🔧 Correction de la configuration nginx..."

# Vérifier si on est root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Veuillez exécuter ce script en tant que root (sudo)"
    exit 1
fi

# Copier la configuration corrigée
echo "📝 Copie de la configuration nginx corrigée..."
cp nginx-wormhole.conf /etc/nginx/sites-available/wormhole

# Tester la configuration nginx
echo "🧪 Test de la configuration nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration nginx valide"
    
    # Recharger nginx
    echo "🔄 Rechargement de nginx..."
    systemctl reload nginx
    
    # Continuer l'installation du service
    echo "🚀 Finalisation de l'installation..."
    
    # Créer le service systemd
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

    # Définir les permissions
    chown -R www-data:www-data /var/www/html
    chmod +x /var/www/html/signaling-server.js

    # Recharger systemd et démarrer le service
    systemctl daemon-reload
    systemctl enable wormhole-signaling
    systemctl start wormhole-signaling

    # Vérifier le statut
    echo "📊 Statut du service:"
    systemctl status wormhole-signaling --no-pager

    echo ""
    echo "🎉 Installation terminée avec succès!"
    echo "======================================"
    echo ""
    echo "🌐 URLs:"
    echo "  - Timer principal: http://$(hostname -I | awk '{print $1}')/"
    echo "  - Launchpad: http://$(hostname -I | awk '{print $1}')/launchpad"
    echo "  - Remote Control: http://$(hostname -I | awk '{print $1}')/remote-control"
    echo "  - API Status: http://$(hostname -I | awk '{print $1}')/api/status"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "  - Statut: systemctl status wormhole-signaling"
    echo "  - Logs: journalctl -u wormhole-signaling -f"
    echo "  - Redémarrer: systemctl restart wormhole-signaling"
    
else
    echo "❌ Erreur dans la configuration nginx"
    echo "Vérifiez le fichier: /etc/nginx/sites-available/wormhole"
    exit 1
fi
