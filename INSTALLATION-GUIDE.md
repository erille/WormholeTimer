# 🚀 Guide d'installation - Wormhole Timer avec Node.js

## 📋 Prérequis

- Serveur Linux (Ubuntu/Debian/CentOS)
- Accès root ou sudo
- Node.js 18+ (sera installé automatiquement)
- Nginx (sera configuré automatiquement)
- IP fixe : 192.168.1.153 (configurée par défaut)

## 🔧 Installation automatique

### 1. Télécharger les fichiers sur votre serveur

```bash
# Copiez tous les fichiers dans /var/www/html
sudo cp -r * /var/www/html/
cd /var/www/html
```

### 2. Exécuter le script de déploiement

```bash
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

Le script va :
- ✅ Installer Node.js si nécessaire
- ✅ Installer les dépendances npm
- ✅ Créer un service systemd
- ✅ Configurer nginx
- ✅ Démarrer le serveur de signalisation

## 🔧 Installation manuelle

### 1. Installer Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 2. Installer les dépendances

```bash
cd /var/www/html
sudo npm install
```

### 3. Créer le service systemd

```bash
sudo nano /etc/systemd/system/wormhole-signaling.service
```

Contenu du fichier :
```ini
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
```

### 4. Configurer nginx

```bash
# Copier la configuration
sudo cp nginx-wormhole.conf /etc/nginx/sites-available/wormhole

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/wormhole /etc/nginx/sites-enabled/

# Désactiver la configuration par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

### 5. Démarrer le service

```bash
# Recharger systemd
sudo systemctl daemon-reload

# Activer le service
sudo systemctl enable wormhole-signaling

# Démarrer le service
sudo systemctl start wormhole-signaling

# Vérifier le statut
sudo systemctl status wormhole-signaling
```

## 🌐 Configuration des URLs

### Sur l'ordinateur (Launchpad) :
1. Ouvrez `http://192.168.1.153/launchpad`
2. Cliquez "Start Server" (URL du serveur configurée automatiquement)

### Sur le téléphone (Remote Control) :
1. Ouvrez `http://192.168.1.153/remote-control`
2. Cliquez "Connect to Launchpad" (URL du serveur configurée automatiquement)

## 🔧 Gestion du service

```bash
# Démarrer
sudo systemctl start wormhole-signaling

# Arrêter
sudo systemctl stop wormhole-signaling

# Redémarrer
sudo systemctl restart wormhole-signaling

# Voir les logs
sudo journalctl -u wormhole-signaling -f

# Voir le statut
sudo systemctl status wormhole-signaling
```

## 🔍 Dépannage

### Le service ne démarre pas :
```bash
# Vérifier les logs
sudo journalctl -u wormhole-signaling -n 50

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod +x /var/www/html/signaling-server.js
```

### Nginx ne fonctionne pas :
```bash
# Tester la configuration
sudo nginx -t

# Vérifier les logs
sudo tail -f /var/log/nginx/error.log
```

### WebSocket ne fonctionne pas :
- Vérifiez que le port 3000 est ouvert
- Vérifiez la configuration nginx pour `/socket.io/`
- Vérifiez les logs du navigateur (F12)

### Connexion WebRTC échoue :
- Vérifiez que les deux appareils sont sur le même réseau
- Vérifiez que le serveur de signalisation fonctionne
- Vérifiez les logs du navigateur

## 📊 Monitoring

### Vérifier le statut de l'API :
```bash
curl http://localhost:3000/api/status
```

### Voir les salles actives :
```bash
curl http://localhost:3000/api/rooms
```

### Logs en temps réel :
```bash
sudo journalctl -u wormhole-signaling -f
```

## 🔒 Sécurité

- Le serveur écoute sur toutes les interfaces (0.0.0.0)
- Utilisez un firewall pour limiter l'accès
- Pour la production, configurez HTTPS
- Changez les ports par défaut si nécessaire

## 📝 Fichiers importants

- **Serveur** : `/var/www/html/signaling-server.js`
- **Configuration nginx** : `/etc/nginx/sites-available/wormhole`
- **Service systemd** : `/etc/systemd/system/wormhole-signaling.service`
- **Logs** : `journalctl -u wormhole-signaling`

## 🎯 URLs finales

- **Timer principal** : `http://192.168.1.153/`
- **Launchpad** : `http://192.168.1.153/launchpad`
- **Contrôle distant** : `http://192.168.1.153/remote-control`
- **API Status** : `http://192.168.1.153/api/status`
