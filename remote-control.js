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
                const timerType = this.dataset.timer;
                const pdfAction = this.dataset.pdfAction;
                
                if (overlayType) {
                    sendRemoteCommand(overlayType, this);
                } else if (timerType) {
                    sendTimerCommand(timerType, this);
                } else if (pdfAction) {
                    sendPDFCommand(pdfAction, this);
                }
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
    document.getElementById('connection-toggle').addEventListener('click', toggleConnection);
}

function toggleConnection() {
    if (isConnected) {
        disconnectFromLaunchpad();
    } else {
        connectToLaunchpad();
    }
}

async function connectToLaunchpad() {
    try {
        updateConnectionStatus('connecting', 'Connecting to launchpad...');
        
        // Use fixed signaling server URL
        const signalingServerUrl = 'http://192.168.1.153:3000';
        
        webrtcConnection = new WebRTCSocketIOConnection(signalingServerUrl);
        
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
                updateToggleButton('connected');
            } else if (state === 'disconnected') {
                updateConnectionStatus('disconnected', 'Disconnected from launchpad');
                isConnected = false;
                updateButtonStates();
                updateToggleButton('disconnected');
            }
        };
        
        // Set up socket connection handler
        webrtcConnection.onSocketConnected = () => {
            updateConnectionStatus('connecting', 'Socket connected, establishing WebRTC...');
        };
        
        webrtcConnection.onSocketDisconnected = (reason) => {
            updateConnectionStatus('disconnected', `Socket disconnected: ${reason}`);
            isConnected = false;
            updateButtonStates();
            updateToggleButton('disconnected');
        };
        
        // Set up data channel handler
        webrtcConnection.onDataChannelOpen = () => {
            updateConnectionStatus('connected', 'Connected to launchpad');
            isConnected = true;
            updateButtonStates();
            updateToggleButton('connected');
        };
        
        await webrtcConnection.initialize(false); // false = not initiator (client)
        await webrtcConnection.startConnection();
        
        // Update UI
        updateToggleButton('connecting');
        
    } catch (error) {
        console.error('Error connecting to launchpad:', error);
        updateConnectionStatus('disconnected', `Error: ${error.message}`);
        isConnected = false;
        updateButtonStates();
        updateToggleButton('disconnected');
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
    updateToggleButton('disconnected');
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
    
    // Send command to launchpad via Socket.IO
    const success = webrtcConnection.sendRemoteCommand('trigger-overlay', overlayType);
    
    if (success) {
        console.log(`Sent command to trigger overlay: ${overlayType}`);
    } else {
        console.error('Failed to send command');
        alert('Failed to send command to launchpad!');
    }
}

function sendTimerCommand(timerType, buttonElement) {
    if (!webrtcConnection || !isConnected) {
        alert('Not connected to launchpad!');
        return;
    }
    
    // Add visual feedback
    buttonElement.classList.add('active');
    setTimeout(() => {
        buttonElement.classList.remove('active');
    }, 600);
    
    // Send timer command to launchpad via Socket.IO
    const success = webrtcConnection.sendRemoteCommand('trigger-timer', timerType);
    
    if (success) {
        console.log(`Sent command to trigger timer: ${timerType}`);
    } else {
        console.error('Failed to send timer command');
        alert('Failed to send timer command to launchpad!');
    }
}

function sendPDFCommand(pdfAction, buttonElement) {
    if (!webrtcConnection || !isConnected) {
        alert('Not connected to launchpad!');
        return;
    }
    
    // Add visual feedback
    buttonElement.classList.add('active');
    setTimeout(() => {
        buttonElement.classList.remove('active');
    }, 600);
    
    // Send PDF command to launchpad via Socket.IO
    const success = webrtcConnection.sendRemoteCommand('pdf-action', pdfAction);
    
    if (success) {
        console.log(`Sent PDF command: ${pdfAction}`);
    } else {
        console.error('Failed to send PDF command');
        alert('Failed to send PDF command to launchpad!');
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

function updateToggleButton(status) {
    const toggleBtn = document.getElementById('connection-toggle');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    const toggleIndicator = toggleBtn.querySelector('.toggle-indicator');
    
    toggleBtn.className = 'connection-toggle-btn';
    
    switch (status) {
        case 'connected':
            toggleBtn.classList.add('connected');
            toggleText.textContent = 'Disconnect';
            toggleIndicator.textContent = '●';
            break;
        case 'connecting':
            toggleBtn.classList.add('connecting');
            toggleText.textContent = 'Connecting...';
            toggleIndicator.textContent = '●';
            break;
        case 'disconnected':
        default:
            toggleText.textContent = 'Connect';
            toggleIndicator.textContent = '●';
            break;
    }
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
