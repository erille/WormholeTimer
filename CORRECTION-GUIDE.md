# 🔧 Guide de correction - Erreur nginx

## ❌ Problème identifié

L'installation s'est arrêtée à cause d'une erreur dans la configuration nginx :
```
invalid value "must-revalidate" in /etc/nginx/sites-enabled/wormhole:52
```

## ✅ Solution

### Option 1 : Script de correction automatique

```bash
# Rendre le script exécutable
sudo chmod +x fix-nginx.sh

# Exécuter la correction
sudo ./fix-nginx.sh
```

### Option 2 : Correction manuelle

1. **Corriger le fichier nginx :**
```bash
sudo nano /etc/nginx/sites-available/wormhole
```

2. **Trouver la ligne 52 et remplacer :**
```nginx
# AVANT (incorrect)
gzip_proxied expired no-cache no-store private must-revalidate auth;

# APRÈS (correct)
gzip_proxied expired no-cache no-store private auth;
```

3. **Tester la configuration :**
```bash
sudo nginx -t
```

4. **Si OK, recharger nginx :**
```bash
sudo systemctl reload nginx
```

5. **Finaliser l'installation du service :**
```bash
# Créer le service systemd
sudo tee /etc/systemd/system/wormhole-signaling.service > /dev/null << 'EOF'
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
sudo chown -R www-data:www-data /var/www/html
sudo chmod +x /var/www/html/signaling-server.js

# Démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable wormhole-signaling
sudo systemctl start wormhole-signaling
```

6. **Vérifier le statut :**
```bash
sudo systemctl status wormhole-signaling
```

## 🎯 Vérification finale

Une fois corrigé, vous devriez voir :

```bash
# Test nginx
$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

# Statut du service
$ sudo systemctl status wormhole-signaling
● wormhole-signaling.service - Wormhole Timer Signaling Server
     Loaded: loaded (/etc/systemd/system/wormhole-signaling.service; enabled; vendor preset: enabled)
     Active: active (running) since [timestamp]
```

## 🌐 URLs finales

- **Timer principal** : `http://votre-serveur/`
- **Launchpad** : `http://votre-serveur/launchpad`
- **Remote Control** : `http://votre-serveur/remote-control`
- **API Status** : `http://votre-serveur/api/status`

## 🔍 Dépannage

Si vous avez encore des problèmes :

```bash
# Vérifier les logs nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier les logs du service
sudo journalctl -u wormhole-signaling -f

# Vérifier que le port 3000 est ouvert
sudo netstat -tlnp | grep :3000
```
