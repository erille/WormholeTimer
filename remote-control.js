// Remote Control - Client side for mobile/phone control
// Connects to the launchpad server via WebRTC

// Global state
let webrtcConnection = null;
let isConnected = false;

// Initialize the remote control when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeRemoteControl();
});

function initializeRemoteControl() {
    // Set up event listeners
    setupRemoteControlEventListeners();
    
    console.log('Remote Control initialized. Ready to connect to launchpad!');
}

function setupRemoteControlEventListeners() {
    // Remote button events
    const remoteButtons = document.querySelectorAll('.remote-btn');
    remoteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isConnected) {
                const overlayType = this.dataset.overlay;
                sendRemoteCommand(overlayType, this);
            } else {
                alert('Please connect to the launchpad first!');
            }
        });
    });
    
    // Control button events
    document.getElementById('back-to-launchpad').addEventListener('click', function() {
        window.location.href = 'launchpad.html';
    });
    
    document.getElementById('test-all-remote-btn').addEventListener('click', function() {
        if (isConnected) {
            testAllRemoteOverlays();
        } else {
            alert('Please connect to the launchpad first!');
        }
    });
    
    // WebRTC connection events
    document.getElementById('connect-btn').addEventListener('click', connectToLaunchpad);
    document.getElementById('disconnect-btn').addEventListener('click', disconnectFromLaunchpad);
}

async function connectToLaunchpad() {
    try {
        updateConnectionStatus('connecting', 'Connecting to launchpad...');
        
        // Get signaling server URL from input
        const signalingServerUrl = document.getElementById('signaling-server-url').value;
        
        webrtcConnection = new WebRTCHTTPConnection(signalingServerUrl);
        
        // Check if signaling server is available
        const serverAvailable = await webrtcConnection.checkServerStatus();
        if (!serverAvailable) {
            throw new Error('Signaling server not available. Please check the URL and ensure the server is running.');
        }
        
        // Set up connection state handler
        webrtcConnection.onConnectionStateChange = (state) => {
            if (state === 'connected') {
                updateConnectionStatus('connected', 'Connected to launchpad');
                isConnected = true;
                updateButtonStates();
            } else if (state === 'disconnected') {
                updateConnectionStatus('disconnected', 'Disconnected from launchpad');
                isConnected = false;
                updateButtonStates();
            }
        };
        
        // Set up data channel handler
        webrtcConnection.onDataChannelOpen = () => {
            updateConnectionStatus('connected', 'Connected to launchpad');
            isConnected = true;
            updateButtonStates();
        };
        
        await webrtcConnection.initialize(false); // false = not initiator (client)
        await webrtcConnection.startConnection();
        
        // Update UI
        document.getElementById('connect-btn').disabled = true;
        document.getElementById('disconnect-btn').disabled = false;
        
    } catch (error) {
        console.error('Error connecting to launchpad:', error);
        updateConnectionStatus('disconnected', `Error: ${error.message}`);
        isConnected = false;
        updateButtonStates();
        document.getElementById('connect-btn').disabled = false;
        document.getElementById('disconnect-btn').disabled = true;
    }
}

function disconnectFromLaunchpad() {
    if (webrtcConnection) {
        webrtcConnection.close();
        webrtcConnection = null;
    }
    
    isConnected = false;
    updateConnectionStatus('disconnected', 'Disconnected from launchpad');
    updateButtonStates();
    
    // Update UI
    document.getElementById('connect-btn').disabled = false;
    document.getElementById('disconnect-btn').disabled = true;
}

function sendRemoteCommand(overlayType, buttonElement) {
    if (!webrtcConnection || !isConnected) {
        alert('Not connected to launchpad!');
        return;
    }
    
    // Add visual feedback
    buttonElement.classList.add('active');
    setTimeout(() => {
        buttonElement.classList.remove('active');
    }, 600);
    
    // Send command to launchpad
    const success = webrtcConnection.sendMessage({
        type: 'trigger-overlay',
        overlay: overlayType,
        timestamp: Date.now()
    });
    
    if (success) {
        console.log(`Sent command to trigger overlay: ${overlayType}`);
    } else {
        console.error('Failed to send command');
        alert('Failed to send command to launchpad!');
    }
}

function testAllRemoteOverlays() {
    const buttons = document.querySelectorAll('.remote-btn');
    let delay = 0;
    
    buttons.forEach((button, index) => {
        setTimeout(() => {
            const overlayType = button.dataset.overlay;
            sendRemoteCommand(overlayType, button);
        }, delay);
        
        // Stagger the tests by 3 seconds each
        delay += 3000;
    });
}

function updateConnectionStatus(status, text) {
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    indicator.className = 'status-indicator';
    if (status === 'connected') {
        indicator.classList.add('connected');
    } else if (status === 'connecting') {
        indicator.classList.add('connecting');
    }
    
    statusText.textContent = text;
}

function updateButtonStates() {
    const remoteButtons = document.querySelectorAll('.remote-btn');
    remoteButtons.forEach(button => {
        button.disabled = !isConnected;
    });
}

// Export functions for potential external use
window.RemoteControl = {
    connectToLaunchpad,
    disconnectFromLaunchpad,
    sendRemoteCommand,
    testAllRemoteOverlays
};
