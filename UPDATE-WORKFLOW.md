# 🔄 Workflow de mise à jour - Serveur Linux

## 📋 Votre workflow actuel

1. **Développement local** : `D:\DEV\Timer Wormhole`
2. **Synchronisation** : Push vers GitHub
3. **Serveur Linux** : Pull depuis GitHub vers `/var/www/html`

## 🚀 Processus de mise à jour

### 1. Mise à jour du code sur le serveur

```bash
# Se connecter au serveur
ssh user@192.168.1.153

# Aller dans le répertoire
cd /var/www/html

# Sauvegarder la configuration actuelle (optionnel)
sudo cp -r . ../backup-$(date +%Y%m%d-%H%M%S)

# Récupérer les dernières modifications
git pull origin main

# Vérifier les nouveaux fichiers
ls -la
```

### 2. Gestion des dépendances Node.js

```bash
# Si package.json a été modifié, réinstaller les dépendances
sudo npm install

# Vérifier les nouvelles dépendances
npm list
```

### 3. Redémarrage des services

```bash
# Redémarrer le service de signalisation
sudo systemctl restart wormhole-signaling

# Vérifier le statut
sudo systemctl status wormhole-signaling

# Recharger nginx (si configuration modifiée)
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Vérification

```bash
# Vérifier que le service fonctionne
curl http://localhost:3000/api/status

# Vérifier les logs
sudo journalctl -u wormhole-signaling -f --lines=20
```

## 🔧 Script automatisé

Créons un script pour automatiser ce processus :

```bash
# Créer le script de mise à jour
sudo nano /var/www/html/update.sh
```

Contenu du script :

```bash
#!/bin/bash

# Script de mise à jour automatique
# À exécuter après un git pull

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
curl -s http://localhost:3000/api/status | jq . || echo "API non accessible"

echo "✅ Mise à jour terminée !"
echo "🌐 URLs disponibles :"
echo "  - Timer: http://192.168.1.153/"
echo "  - Launchpad: http://192.168.1.153/launchpad"
echo "  - Remote Control: http://192.168.1.153/remote-control"
```

Rendre le script exécutable :

```bash
sudo chmod +x /var/www/html/update.sh
```

## 🎯 Utilisation du script

```bash
# Après un git pull
cd /var/www/html
git pull origin main
./update.sh
```

## 🔍 Vérifications post-mise à jour

### Vérifier que tout fonctionne :

```bash
# 1. Service actif
sudo systemctl is-active wormhole-signaling

# 2. Port ouvert
sudo netstat -tlnp | grep :3000

# 3. API accessible
curl http://localhost:3000/api/status

# 4. Pages web accessibles
curl -I http://192.168.1.153/launchpad
curl -I http://192.168.1.153/remote-control
```

### Vérifier les logs :

```bash
# Logs du service
sudo journalctl -u wormhole-signaling -f

# Logs nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🚨 Dépannage

### Si le service ne démarre pas :

```bash
# Vérifier les logs d'erreur
sudo journalctl -u wormhole-signaling -n 50

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod +x /var/www/html/signaling-server.js

# Redémarrer
sudo systemctl restart wormhole-signaling
```

### Si nginx a des problèmes :

```bash
# Tester la configuration
sudo nginx -t

# Recharger si OK
sudo systemctl reload nginx
```

## 📝 Workflow complet

```bash
# 1. Sur votre PC Windows
cd "D:\DEV\Timer Wormhole"
git add .
git commit -m "Update: description des changements"
git push origin main

# 2. Sur le serveur Linux
ssh user@192.168.1.153
cd /var/www/html
git pull origin main
./update.sh

# 3. Vérification
curl http://192.168.1.153/api/status
```

## 🔄 Automatisation (optionnel)

Pour automatiser complètement, vous pouvez créer un webhook GitHub ou utiliser un cron job :

```bash
# Cron job pour vérifier les mises à jour toutes les heures
sudo crontab -e

# Ajouter cette ligne :
0 * * * * cd /var/www/html && git pull origin main && ./update.sh
```

## 📊 Monitoring

```bash
# Vérifier l'état général
sudo systemctl status wormhole-signaling nginx

# Voir les connexions actives
sudo netstat -tlnp | grep :3000

# Vérifier l'espace disque
df -h /var/www/html
```
