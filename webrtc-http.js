// WebRTC Data Channels with HTTP Signaling Server
// Enables P2P communication between devices using HTTP signaling

class WebRTCHTTPConnection {
    constructor(signalingServerUrl = 'http://localhost:8080') {
        this.pc = null;
        this.dataChannel = null;
        this.isInitiator = false;
        this.roomId = 'wormhole-room';
        this.signalingServerUrl = signalingServerUrl;
        this.onMessage = null;
        this.onConnectionStateChange = null;
        this.onDataChannelOpen = null;
        this.pollingInterval = null;
        this.lastPollTime = 0;
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

    // Send signaling message via HTTP
    async sendSignalingMessage(message) {
        try {
            const response = await fetch(`${this.signalingServerUrl}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room: this.roomId,
                    message: {
                        ...message,
                        timestamp: Date.now(),
                        sender: this.isInitiator ? 'initiator' : 'responder'
                    }
                })
            });
            
            if (!response.ok) {
                console.error('Failed to send signaling message:', response.status);
            }
        } catch (error) {
            console.error('Error sending signaling message:', error);
        }
    }

    // Start polling for signaling messages
    startPolling() {
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(
                    `${this.signalingServerUrl}/poll?room=${this.roomId}&since=${this.lastPollTime}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    this.lastPollTime = data.timestamp;
                    
                    for (const msgData of data.messages) {
                        const message = msgData.message;
                        // Only process messages from the other peer
                        if (message.sender !== (this.isInitiator ? 'initiator' : 'responder')) {
                            await this.handleSignalingMessage(message);
                        }
                    }
                }
            } catch (error) {
                console.error('Error polling for messages:', error);
            }
        }, 1000); // Poll every second
    }

    // Stop polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    async handleSignalingMessage(message) {
        try {
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
        } catch (error) {
            console.error('Error handling signaling message:', error);
        }
    }

    // Start connection process
    async startConnection() {
        this.startPolling();

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
        this.stopPolling();
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.pc) {
            this.pc.close();
        }
    }

    // Check if signaling server is available
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.signalingServerUrl}/status`);
            if (response.ok) {
                const data = await response.json();
                return data.status === 'running';
            }
        } catch (error) {
            console.error('Error checking server status:', error);
        }
        return false;
    }
}

// Export for use in other files
window.WebRTCHTTPConnection = WebRTCHTTPConnection;
