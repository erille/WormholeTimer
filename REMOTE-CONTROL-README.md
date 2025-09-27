# Wormhole Remote Control - Guide d'utilisation

## 🎹 Contrôle à distance avec serveur de signalisation HTTP

Ce système permet de contrôler le Wormhole Launchpad depuis votre téléphone via un serveur de signalisation HTTP simple.

## 🚀 Installation et démarrage

### 1. Démarrer le serveur de signalisation

Sur votre serveur Linux (ou ordinateur local) :

```bash
# Rendre le script exécutable
chmod +x signaling-server.py

# Démarrer le serveur (port 8080 par défaut)
python3 signaling-server.py 8080
```

Le serveur sera accessible à : `http://votre-serveur:8080`

### 2. Démarrer le serveur web

Dans un autre terminal :

```bash
# Démarrer le serveur web (port 8000)
python3 -m http.server 8000
```

## 📱 Utilisation

### Sur l'ordinateur (Launchpad) :

1. **Ouvrez** `http://votre-serveur:8000/launchpad.html`
2. **Configurez l'URL** du serveur de signalisation :
   - Par défaut : `http://localhost:8080`
   - Pour serveur distant : `http://votre-serveur:8080`
3. **Cliquez sur "Start Server"**
4. **Attendez** que le statut passe à "Connected"
5. **Partagez l'URL** ou le QR code avec votre téléphone

### Sur le téléphone (Remote Control) :

1. **Ouvrez** `http://votre-serveur:8000/remote-control.html`
2. **Configurez l'URL** du serveur de signalisation :
   - Même URL que sur l'ordinateur
3. **Cliquez sur "Connect to Launchpad"**
4. **Attendez** que le statut passe à "Connected"
5. **Utilisez les boutons** pour contrôler les overlays

## 🔧 Configuration nginx

Si vous utilisez nginx, ajoutez cette configuration :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        root /path/to/timer-wormhole;
        index index.html;
    }
    
    # Proxy pour le serveur de signalisation
    location /signaling/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Puis utilisez l'URL : `http://votre-domaine.com/signaling/`

## 🌐 URLs importantes

- **Launchpad** : `http://votre-serveur:8000/launchpad.html`
- **Remote Control** : `http://votre-serveur:8000/remote-control.html`
- **Signaling Server** : `http://votre-serveur:8080/status`

## 🎬 Fonctionnement

1. **Clic sur bouton téléphone** → Commande envoyée via HTTP
2. **Serveur de signalisation** → Relais la commande
3. **Ordinateur reçoit** → Déclenche l'overlay
4. **Son Portal** → Lecture immédiate
5. **0-9s** → Vidéo Wormhole Travel
6. **9-39s** → Image sélectionnée

## ⚠️ Dépannage

### Le serveur de signalisation ne répond pas :
- Vérifiez que le port 8080 est ouvert
- Vérifiez l'URL dans les deux interfaces
- Redémarrez le serveur de signalisation

### La connexion WebRTC échoue :
- Vérifiez que les deux appareils sont sur le même réseau
- Vérifiez que le serveur de signalisation fonctionne
- Vérifiez les logs du navigateur (F12)

### Les overlays ne se déclenchent pas :
- Vérifiez que la connexion est établie (statut vert)
- Vérifiez que les fichiers vidéo/images existent
- Vérifiez les logs du navigateur

## 🔒 Sécurité

- Le serveur de signalisation est simple et non sécurisé
- Utilisez uniquement sur des réseaux de confiance
- Pour la production, ajoutez une authentification

## 📝 Logs

Le serveur de signalisation affiche les connexions et messages dans la console.

Pour plus de logs, modifiez la fonction `log_message` dans `signaling-server.py`.
