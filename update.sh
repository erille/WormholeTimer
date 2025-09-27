#!/bin/bash

# Script de mise à jour automatique pour Wormhole Timer
# À exécuter après un git pull sur le serveur Linux

set -e

echo "🔄 Mise à jour du Wormhole Timer..."

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : package.json non trouvé. Êtes-vous dans /var/www/html ?"
    exit 1
fi

# Sauvegarder la configuration (optionnel)
echo "💾 Sauvegarde de la configuration..."
sudo cp -r . ../backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Installer les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
sudo npm install

# Redémarrer le service
echo "🔄 Redémarrage du service..."
sudo systemctl restart wormhole-signaling

# Vérifier le statut
echo "📊 Vérification du statut..."
sleep 2
sudo systemctl status wormhole-signaling --no-pager

# Vérifier l'API
echo "🌐 Test de l'API..."
if curl -s http://localhost:3000/api/status > /dev/null; then
    echo "✅ API accessible"
else
    echo "⚠️  API non accessible - vérifiez les logs"
fi

echo "✅ Mise à jour terminée !"
echo "🌐 URLs disponibles :"
echo "  - Timer: http://192.168.1.153/"
echo "  - Launchpad: http://192.168.1.153/launchpad"
echo "  - Remote Control: http://192.168.1.153/remote-control"
echo ""
echo "🔧 Commandes utiles :"
echo "  - Logs: sudo journalctl -u wormhole-signaling -f"
echo "  - Statut: sudo systemctl status wormhole-signaling"
echo "  - Redémarrer: sudo systemctl restart wormhole-signaling"
