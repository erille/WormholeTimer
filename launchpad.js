// Wormhole Launchpad - Soundboard
// Manual trigger for overlays with sound and visual effects

// Sound manifest - Same as main timer
const SOUND_MANIFEST = [
    { id: 'tardis', label: 'Tardis', file: 'sounds/tardis.wav' },
    { id: 'portal', label: 'Portal', file: 'sounds/portal.wav' },
    { id: 'blip', label: 'Blip', file: 'sounds/blip.wav' }
];

// Second overlay manifest - Same as main timer
const SECOND_OVERLAY_MANIFEST = [
    { id: 'none', label: 'None' },
    { id: '123soleil', label: '123 Soleil', file: 'img/123soleil.png' },
    { id: 'A', label: 'A', file: 'img/A.png' },
    { id: 'slowmotion', label: 'Slow Motion', file: 'img/slowmotion.png' },
    { id: 'sport', label: 'Sport', file: 'img/sport.png' },
    { id: 'sing', label: 'Sing', file: 'img/sing.png' }
];

// Global state
let audioContext = null;
let webrtcConnection = null;
let isServerMode = false;

// Initialize the launchpad when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLaunchpad();
});

function initializeLaunchpad() {
    // Initialize Web Audio API
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported, falling back to HTML5 audio');
    }
    
    // Set up event listeners
    setupLaunchpadEventListeners();
    
    console.log('Wormhole Launchpad initialized. Ready to trigger overlays!');
}

function setupLaunchpadEventListeners() {
    // Launchpad button events
    const launchpadButtons = document.querySelectorAll('.launchpad-btn');
    launchpadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const overlayType = this.dataset.overlay;
            triggerLaunchpadOverlay(overlayType, this);
        });
    });
    
    // Control button events
    document.getElementById('back-to-timer').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('test-all-btn').addEventListener('click', function() {
        testAllOverlays();
    });
    
    // WebRTC connection events
    document.getElementById('start-server-btn').addEventListener('click', startServer);
    document.getElementById('stop-connection-btn').addEventListener('click', stopConnection);
}

function triggerLaunchpadOverlay(overlayType, buttonElement) {
    // Add active class for visual feedback
    buttonElement.classList.add('active');
    
    // Remove active class after animation
    setTimeout(() => {
        buttonElement.classList.remove('active');
    }, 600);
    
    // Play Portal sound
    playSound('portal');
    
    // Show wormhole video overlay (9 seconds)
    showTimerOverlay('wormhole');
    
    // Schedule second overlay to show after first overlay ends (9 seconds)
    setTimeout(() => {
        showSecondOverlay(overlayType);
    }, 9000); // Show second overlay after first overlay duration
    
    console.log(`Launchpad triggered: ${overlayType}`);
}

function testAllOverlays() {
    const buttons = document.querySelectorAll('.launchpad-btn');
    let delay = 0;
    
    buttons.forEach((button, index) => {
        setTimeout(() => {
            const overlayType = button.dataset.overlay;
            triggerLaunchpadOverlay(overlayType, button);
        }, delay);
        
        // Stagger the tests by 15 seconds each
        delay += 15000;
    });
}

function showTimerOverlay(overlayType = 'wormhole') {
    const overlayId = `timer-overlay-${overlayType}`;
    const overlay = document.getElementById(overlayId);
    if (!overlay) {
        console.error(`Timer overlay not found: ${overlayId}`);
        return;
    }
    
    // Show overlay
    overlay.style.display = 'flex';
    
    // Force reflow to ensure display change is applied
    overlay.offsetHeight;
    
    // Add show class for opacity transition
    overlay.classList.add('show');
    
    // Start video
    if (overlayType === 'wormhole') {
        const video = overlay.querySelector('.wormhole-video');
        if (video) {
            video.currentTime = 0; // Reset to beginning
            video.play().catch(e => {
                console.warn('Could not autoplay video:', e);
            });
        }
    }
    
    // Hide overlay after 9 seconds
    setTimeout(() => {
        hideTimerOverlay(overlayType);
    }, 9000);
}

function hideTimerOverlay(overlayType = 'wormhole') {
    const overlayId = `timer-overlay-${overlayType}`;
    const overlay = document.getElementById(overlayId);
    const video = overlay ? overlay.querySelector('.wormhole-video') : null;
    
    if (!overlay) return;
    
    // Remove show class for opacity transition
    overlay.classList.remove('show');
    
    // Stop video
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    
    // Hide overlay after transition
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300); // Match CSS transition duration
}

function showSecondOverlay(overlayType = 'none') {
    if (overlayType === 'none') return;
    
    const overlayId = `second-overlay-${overlayType}`;
    const overlay = document.getElementById(overlayId);
    if (!overlay) {
        console.error(`Second overlay not found: ${overlayId}`);
        return;
    }
    
    // Show overlay
    overlay.style.display = 'flex';
    
    // Force reflow to ensure display change is applied
    overlay.offsetHeight;
    
    // Add show class for opacity transition
    overlay.classList.add('show');
    
    // Hide overlay after 30 seconds
    setTimeout(() => {
        hideSecondOverlay(overlayType);
    }, 30000);
}

function hideSecondOverlay(overlayType = 'none') {
    if (overlayType === 'none') return;
    
    const overlayId = `second-overlay-${overlayType}`;
    const overlay = document.getElementById(overlayId);
    
    if (!overlay) return;
    
    // Remove show class for opacity transition
    overlay.classList.remove('show');
    
    // Hide overlay after transition
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300); // Match CSS transition duration
}

function playSound(soundId) {
    const sound = SOUND_MANIFEST.find(s => s.id === soundId);
    if (!sound) {
        console.warn(`Sound not found: ${soundId}`);
        return;
    }
    
    try {
        if (audioContext) {
            // Use Web Audio API for better control
            const audio = new Audio(sound.file);
            audio.volume = 0.7;
            audio.play().catch(e => {
                console.warn('Web Audio failed, trying HTML5 audio:', e);
                playSoundFallback(sound.file);
            });
        } else {
            playSoundFallback(sound.file);
        }
    } catch (e) {
        console.error('Error playing sound:', e);
        playSoundFallback(sound.file);
    }
}

function playSoundFallback(filePath) {
    // Fallback to HTML5 audio
    const audio = new Audio(filePath);
    audio.volume = 0.7;
    audio.play().catch(e => {
        console.error('Failed to play sound:', e);
    });
}

// WebRTC Connection Functions
async function startServer() {
    try {
        isServerMode = true;
        updateConnectionStatus('connecting', 'Connecting to signaling server...');
        
        // Get signaling server URL from input
        const signalingServerUrl = document.getElementById('signaling-server-url').value;
        
        webrtcConnection = new WebRTCHTTPConnection(signalingServerUrl);
        
        // Check if signaling server is available
        const serverAvailable = await webrtcConnection.checkServerStatus();
        if (!serverAvailable) {
            throw new Error('Signaling server not available. Please start the signaling server first.');
        }
        
        // Set up message handler
        webrtcConnection.onMessage = (message) => {
            console.log('Received remote command:', message);
            if (message.type === 'trigger-overlay') {
                const button = document.querySelector(`[data-overlay="${message.overlay}"]`);
                if (button) {
                    triggerLaunchpadOverlay(message.overlay, button);
                }
            }
        };
        
        // Set up connection state handler
        webrtcConnection.onConnectionStateChange = (state) => {
            if (state === 'connected') {
                updateConnectionStatus('connected', 'Connected to remote device');
                showConnectionInfo();
            } else if (state === 'disconnected') {
                updateConnectionStatus('disconnected', 'Disconnected');
                hideConnectionInfo();
            }
        };
        
        // Set up data channel handler
        webrtcConnection.onDataChannelOpen = () => {
            updateConnectionStatus('connected', 'Remote control ready');
            showConnectionInfo();
        };
        
        await webrtcConnection.initialize(true); // true = initiator (server)
        await webrtcConnection.startConnection();
        
        // Update UI
        document.getElementById('start-server-btn').disabled = true;
        document.getElementById('stop-connection-btn').disabled = false;
        
    } catch (error) {
        console.error('Error starting server:', error);
        updateConnectionStatus('disconnected', `Error: ${error.message}`);
        isServerMode = false;
        document.getElementById('start-server-btn').disabled = false;
        document.getElementById('stop-connection-btn').disabled = true;
    }
}

function stopConnection() {
    if (webrtcConnection) {
        webrtcConnection.close();
        webrtcConnection = null;
    }
    
    isServerMode = false;
    updateConnectionStatus('disconnected', 'Disconnected');
    hideConnectionInfo();
    
    // Update UI
    document.getElementById('start-server-btn').disabled = false;
    document.getElementById('stop-connection-btn').disabled = true;
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

function showConnectionInfo() {
    const connectionInfo = document.getElementById('connection-info');
    const remoteUrl = document.getElementById('remote-url');
    
    // Get current URL and replace with remote control URL
    const currentUrl = window.location.href;
    const remoteControlUrl = currentUrl.replace('launchpad.html', 'remote-control.html');
    
    remoteUrl.textContent = remoteControlUrl;
    connectionInfo.style.display = 'block';
    
    // Generate QR code (simple text-based for now)
    generateQRCode(remoteControlUrl);
}

function hideConnectionInfo() {
    const connectionInfo = document.getElementById('connection-info');
    connectionInfo.style.display = 'none';
}

function generateQRCode(url) {
    const qrContainer = document.getElementById('qr-code');
    // Simple QR code generation using a library or API
    // For now, we'll create a simple visual representation
    qrContainer.innerHTML = `
        <div style="background: white; padding: 20px; border: 2px solid #333;">
            <div style="font-family: monospace; font-size: 12px; line-height: 1;">
                <div>████ ████ ████ ████</div>
                <div>█  █ █  █ █  █ █  █</div>
                <div>████ ████ ████ ████</div>
                <div>█  █ █  █ █  █ █  █</div>
                <div>████ ████ ████ ████</div>
            </div>
            <p style="margin: 10px 0 0 0; font-size: 10px; color: #666;">QR Code for: ${url}</p>
        </div>
    `;
}

// Export functions for potential external use
window.WormholeLaunchpad = {
    triggerLaunchpadOverlay,
    playSound,
    showTimerOverlay,
    showSecondOverlay,
    startServer,
    stopConnection
};
