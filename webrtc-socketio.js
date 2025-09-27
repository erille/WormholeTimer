// WebRTC Data Channels with Socket.IO Signaling
// Reliable P2P communication using Socket.IO for signaling

class WebRTCSocketIOConnection {
    constructor(signalingServerUrl = 'http://localhost:3000') {
        this.pc = null;
        this.dataChannel = null;
        this.isInitiator = false;
        this.roomId = 'wormhole-room';
        this.signalingServerUrl = signalingServerUrl;
        this.socket = null;
        this.onMessage = null;
        this.onConnectionStateChange = null;
        this.onDataChannelOpen = null;
        this.onSocketConnected = null;
        this.onSocketDisconnected = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // Initialize WebRTC connection
    async initialize(isInitiator = false) {
        this.isInitiator = isInitiator;
        
        // Create RTCPeerConnection with STUN servers
        this.pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        // Handle ICE candidates
        this.pc.onicecandidate = (event) => {
            if (event.candidate && this.socket && this.socket.connected) {
                this.socket.emit('webrtc-signal', {
                    signal: event.candidate,
                    type: 'ice-candidate'
                });
            }
        };

        // Handle connection state changes
        this.pc.onconnectionstatechange = () => {
            console.log('WebRTC connection state:', this.pc.connectionState);
            if (this.onConnectionStateChange) {
                this.onConnectionStateChange(this.pc.connectionState);
            }
        };

        if (isInitiator) {
            // Create data channel for initiator
            this.dataChannel = this.pc.createDataChannel('control', {
                ordered: true
            });
            this.setupDataChannel();
        } else {
            // Listen for data channel from remote peer
            this.pc.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannel();
            };
        }
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            this.connected = true;
            if (this.onDataChannelOpen) {
                this.onDataChannelOpen();
            }
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);
                if (this.onMessage) {
                    this.onMessage(message);
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            this.connected = false;
        };
    }

    // Connect to signaling server
    async connectToSignalingServer() {
        return new Promise((resolve, reject) => {
            try {
                // Load Socket.IO client library if not already loaded
                if (typeof io === 'undefined') {
                    const script = document.createElement('script');
                    script.src = `${this.signalingServerUrl}/socket.io/socket.io.js`;
                    script.onload = () => {
                        this.initializeSocket(resolve, reject);
                    };
                    script.onerror = () => {
                        reject(new Error('Failed to load Socket.IO client library'));
                    };
                    document.head.appendChild(script);
                } else {
                    this.initializeSocket(resolve, reject);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    initializeSocket(resolve, reject) {
        this.socket = io(this.signalingServerUrl, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to signaling server');
            this.reconnectAttempts = 0;
            if (this.onSocketConnected) {
                this.onSocketConnected();
            }
            resolve();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from signaling server:', reason);
            this.connected = false;
            if (this.onSocketDisconnected) {
                this.onSocketDisconnected(reason);
            }
            
            // Attempt to reconnect
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                setTimeout(() => {
                    this.socket.connect();
                }, this.reconnectDelay * this.reconnectAttempts);
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            reject(error);
        });

        // Handle room state
        this.socket.on('room-state', (data) => {
            console.log('Room state:', data);
        });

        // Handle peer events
        this.socket.on('peer-joined', (data) => {
            console.log('Peer joined:', data);
        });

        this.socket.on('peer-left', (data) => {
            console.log('Peer left:', data);
        });

        // Handle WebRTC signaling
        this.socket.on('webrtc-signal', async (data) => {
            try {
                await this.handleSignalingMessage(data);
            } catch (error) {
                console.error('Error handling signaling message:', error);
            }
        });

        // Handle remote commands (for initiator)
        this.socket.on('remote-command', (data) => {
            console.log('Received remote command:', data);
            if (this.onMessage) {
                this.onMessage({
                    type: 'remote-command',
                    command: data.command,
                    overlay: data.overlay,
                    from: data.from,
                    timestamp: data.timestamp
                });
            }
        });

        // Handle pong responses
        this.socket.on('pong', (data) => {
            console.log('Received pong:', data);
        });
    }

    async handleSignalingMessage(data) {
        try {
            switch (data.type) {
                case 'offer':
                    if (!this.isInitiator) {
                        await this.pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                        const answer = await this.pc.createAnswer();
                        await this.pc.setLocalDescription(answer);
                        this.socket.emit('webrtc-signal', {
                            signal: answer,
                            type: 'answer'
                        });
                    } else {
                        // Server receives offer from client, create answer
                        await this.pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                        const answer = await this.pc.createAnswer();
                        await this.pc.setLocalDescription(answer);
                        this.socket.emit('webrtc-signal', {
                            signal: answer,
                            type: 'answer'
                        });
                    }
                    break;

                case 'answer':
                    if (this.isInitiator) {
                        await this.pc.setRemoteDescription(new RTCSessionDescription(data.signal));
                    }
                    break;

                case 'ice-candidate':
                    await this.pc.addIceCandidate(new RTCIceCandidate(data.signal));
                    break;
            }
        } catch (error) {
            console.error('Error handling signaling message:', error);
        }
    }

    // Start connection process
    async startConnection() {
        try {
            // Connect to signaling server first
            await this.connectToSignalingServer();
            
            // Join room
            this.socket.emit('join-room', {
                roomId: this.roomId,
                isInitiator: this.isInitiator
            });

            if (this.isInitiator) {
                // Server waits for client to connect before creating offer
                console.log('Server ready, waiting for client to connect...');
                // Don't create offer immediately, wait for client
            } else {
                // Client creates offer when connecting
                console.log('Client connecting, creating offer...');
                const offer = await this.pc.createOffer();
                await this.pc.setLocalDescription(offer);
                this.socket.emit('webrtc-signal', {
                    signal: offer,
                    type: 'offer'
                });
            }
        } catch (error) {
            console.error('Error starting connection:', error);
            throw error;
        }
    }

    // Send message through data channel
    sendMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    // Send remote command (for responder)
    sendRemoteCommand(command, overlay) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('remote-command', {
                command: command,
                overlay: overlay
            });
            return true;
        }
        return false;
    }

    // Send ping to server
    ping() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('ping');
        }
    }

    // Check if signaling server is available
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.signalingServerUrl}/api/status`);
            if (response.ok) {
                const data = await response.json();
                return data.status === 'running';
            }
        } catch (error) {
            console.error('Error checking server status:', error);
        }
        return false;
    }

    // Close connection
    close() {
        this.connected = false;
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.pc) {
            this.pc.close();
        }
    }

    // Get connection status
    getStatus() {
        return {
            socketConnected: this.socket ? this.socket.connected : false,
            webrtcConnected: this.connected,
            dataChannelReady: this.dataChannel ? this.dataChannel.readyState : 'closed',
            pcState: this.pc ? this.pc.connectionState : 'closed'
        };
    }
}

// Export for use in other files
window.WebRTCSocketIOConnection = WebRTCSocketIOConnection;
