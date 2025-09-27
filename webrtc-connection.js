// WebRTC Data Channels for remote control
// Enables P2P communication between devices on the same network

class WebRTCConnection {
    constructor() {
        this.pc = null;
        this.dataChannel = null;
        this.isInitiator = false;
        this.connectionId = null;
        this.onMessage = null;
        this.onConnectionStateChange = null;
        this.onDataChannelOpen = null;
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
            if (event.candidate) {
                this.sendSignalingMessage({
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };

        // Handle connection state changes
        this.pc.onconnectionstatechange = () => {
            console.log('Connection state:', this.pc.connectionState);
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
        };
    }

    // Send signaling message (in real implementation, this would go through a signaling server)
    // For simplicity, we'll use localStorage as a signaling mechanism
    sendSignalingMessage(message) {
        const signalingData = {
            ...message,
            timestamp: Date.now(),
            connectionId: this.connectionId
        };
        
        localStorage.setItem('webrtc-signaling', JSON.stringify(signalingData));
        
        // Trigger storage event for other tabs/windows
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'webrtc-signaling',
            newValue: JSON.stringify(signalingData)
        }));
    }

    // Listen for signaling messages
    startSignaling() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'webrtc-signaling') {
                try {
                    const message = JSON.parse(event.newValue);
                    if (message.connectionId !== this.connectionId) {
                        this.handleSignalingMessage(message);
                    }
                } catch (e) {
                    console.error('Error parsing signaling message:', e);
                }
            }
        });
    }

    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'offer':
                if (!this.isInitiator) {
                    await this.pc.setRemoteDescription(new RTCSessionDescription(message.offer));
                    const answer = await this.pc.createAnswer();
                    await this.pc.setLocalDescription(answer);
                    this.sendSignalingMessage({
                        type: 'answer',
                        answer: answer
                    });
                }
                break;

            case 'answer':
                if (this.isInitiator) {
                    await this.pc.setRemoteDescription(new RTCSessionDescription(message.answer));
                }
                break;

            case 'ice-candidate':
                await this.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
                break;
        }
    }

    // Start connection process
    async startConnection() {
        this.connectionId = 'connection-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        this.startSignaling();

        if (this.isInitiator) {
            // Create offer
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            this.sendSignalingMessage({
                type: 'offer',
                offer: offer
            });
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

    // Close connection
    close() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.pc) {
            this.pc.close();
        }
    }
}

// Export for use in other files
window.WebRTCConnection = WebRTCConnection;
