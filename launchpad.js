// Wormhole Launchpad - Soundboard
// Manual trigger for overlays with sound and visual effects

// Sound manifest - Same as main timer
const SOUND_MANIFEST = [
    { id: 'tardis', label: 'Tardis', file: 'sounds/tardis.wav' },
    { id: 'portal', label: 'Portal', file: 'sounds/portal.wav' },
    { id: 'blip', label: 'Blip', file: 'sounds/blip.wav' },
    { id: 'alarm', label: 'Alarm', file: 'sounds/alarm.wav' }
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
let activeTimers = {
    '5min': null,
    '30s': null
};
let gameTimer = null; // 30 minutes timer for game overlays
let gameTimerStartTime = null;

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

function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all section buttons
    const sectionButtons = document.querySelectorAll('.section-btn');
    sectionButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked button
    const activeButton = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    console.log(`Switched to ${sectionName} section`);
}

function setupLaunchpadEventListeners() {
    // Section toggle events
    const sectionButtons = document.querySelectorAll('.section-btn');
    sectionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Launchpad button events
    const launchpadButtons = document.querySelectorAll('.launchpad-btn');
    launchpadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const overlayType = this.dataset.overlay;
            const timerType = this.dataset.timer;
            
            if (overlayType) {
                triggerLaunchpadOverlay(overlayType, this);
            } else if (timerType) {
                triggerTimerOverlay(timerType, this);
            }
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
    document.getElementById('server-toggle').addEventListener('click', toggleServer);
}

function triggerLaunchpadOverlay(overlayType, buttonElement) {
    // Add active class for visual feedback
    buttonElement.classList.add('active');
    
    // Remove active class after animation
    setTimeout(() => {
        buttonElement.classList.remove('active');
    }, 600);
    
    // Check if it's a video overlay (sojugroup, sojusolo, or redlight)
    if (overlayType === 'sojugroup' || overlayType === 'sojusolo' || overlayType === 'redlight') {
        // Close all overlays except wormhole for video overlays
        closeAllOverlaysExceptWormhole();
        // Show video overlay directly (no sound for soju videos, sound for redlight)
        showVideoOverlay(overlayType);
    } else if (overlayType === 'quiz-questions') {
        // Close all overlays for quiz
        closeAllOverlays();
        // Show Quiz Questions overlay directly (no sound)
        showQuizQuestionsOverlay();
    } else if (overlayType === 'quiz-reponses') {
        // Close all overlays for quiz
        closeAllOverlays();
        // Show Quiz Réponses overlay directly (no sound)
        showQuizReponsesOverlay();
    } else {
        // Close all overlays except wormhole for game overlays
        closeAllOverlaysExceptWormhole();
        
        // Play Portal sound for regular overlays
        playSound('portal');
        
        // Show wormhole video overlay (9 seconds)
        showTimerOverlay('wormhole');
        
        // Schedule second overlay to show after first overlay ends (9 seconds)
        setTimeout(() => {
            showSecondOverlay(overlayType);
        }, 9000); // Show second overlay after first overlay duration
        
        // Start 30-minute game timer for game overlays
        startGameTimer(overlayType);
    }
    
    console.log(`Launchpad triggered: ${overlayType}`);
}

function showVideoOverlay(videoType) {
    const overlayId = `overlay-${videoType}`;
    const overlay = document.getElementById(overlayId);
    const video = document.getElementById(`${videoType}-video`);
    
    if (!overlay || !video) {
        console.error(`Video overlay not found: ${overlayId}`);
        return;
    }
    
    // Show overlay
    overlay.style.display = 'flex';
    overlay.classList.add('show');
    
    // Reset and play video
    video.currentTime = 0;
    
    // Enable sound for redlight video, keep muted for others
    if (videoType === 'redlight') {
        video.muted = false;
        video.volume = 0.7; // Set volume to 70%
    } else {
        video.muted = true;
    }
    
    video.play().catch(e => {
        console.error(`Error playing ${videoType} video:`, e);
    });
    
    // Hide overlay when video ends (no time limit)
    video.addEventListener('ended', () => {
        hideVideoOverlay(videoType);
    }, { once: true });
}

function hideVideoOverlay(videoType) {
    const overlayId = `overlay-${videoType}`;
    const overlay = document.getElementById(overlayId);
    const video = document.getElementById(`${videoType}-video`);
    
    if (!overlay) return;
    
    // Remove show class for opacity transition
    overlay.classList.remove('show');
    
    // Pause video
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    
    // Hide overlay after transition
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// Quiz Images Overlay Functions
let currentQuizQuestionsPage = 1;
let totalQuizQuestionsPages = 27; // We have 27 JPG files for questions
let currentQuizReponsesPage = 1;
let totalQuizReponsesPages = 27; // We have 27 JPG files for answers

function showQuizQuestionsOverlay() {
    const overlay = document.getElementById('quiz-questions-overlay');
    const quizImage = document.getElementById('quiz-questions-image');
    
    if (!overlay || !quizImage) {
        console.error('Quiz Questions overlay elements not found');
        return;
    }
    
    // Reset to first page
    currentQuizQuestionsPage = 1;
    
    // Show overlay
    overlay.style.display = 'flex';
    overlay.classList.add('show');
    
    // Load first quiz image
    loadQuizQuestionsImage(1);
    
    // Set up quiz controls
    setupQuizQuestionsControls();
    
    console.log('Quiz Questions overlay shown');
}

function showQuizReponsesOverlay() {
    const overlay = document.getElementById('quiz-reponses-overlay');
    const quizImage = document.getElementById('quiz-reponses-image');
    
    if (!overlay || !quizImage) {
        console.error('Quiz Réponses overlay elements not found');
        return;
    }
    
    // Reset to first page
    currentQuizReponsesPage = 1;
    
    // Show overlay
    overlay.style.display = 'flex';
    overlay.classList.add('show');
    
    // Load first quiz image
    loadQuizReponsesImage(1);
    
    // Set up quiz controls
    setupQuizReponsesControls();
    
    console.log('Quiz Réponses overlay shown');
}

function hideQuizQuestionsOverlay() {
    const overlay = document.getElementById('quiz-questions-overlay');
    
    if (!overlay) return;
    
    // Remove show class for opacity transition
    overlay.classList.remove('show');
    
    // Hide overlay after transition
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
    
    console.log('Quiz Questions overlay hidden');
}

function hideQuizReponsesOverlay() {
    const overlay = document.getElementById('quiz-reponses-overlay');
    
    if (!overlay) return;
    
    // Remove show class for opacity transition
    overlay.classList.remove('show');
    
    // Hide overlay after transition
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
    
    console.log('Quiz Réponses overlay hidden');
}

function setupQuizQuestionsControls() {
    const pageInfo = document.getElementById('quiz-questions-page-info');
    
    if (!pageInfo) return;
    
    // Update page info
    updateQuizQuestionsPageInfo();
}

function setupQuizReponsesControls() {
    const pageInfo = document.getElementById('quiz-reponses-page-info');
    
    if (!pageInfo) return;
    
    // Update page info
    updateQuizReponsesPageInfo();
}

function loadQuizQuestionsImage(pageNumber) {
    const quizImage = document.getElementById('quiz-questions-image');
    if (!quizImage) return;
    
    // Format page number with leading zeros (e.g., 0001, 0002, etc.)
    const formattedPageNumber = pageNumber.toString().padStart(4, '0');
    const imageUrl = `files/quizz_questions/Superquizz_questions_pdf_page-${formattedPageNumber}.jpg`;
    
    // Add loading effect
    quizImage.style.opacity = '0.5';
    
    // Load the image
    quizImage.src = imageUrl;
    
    // Restore opacity when image loads
    quizImage.onload = () => {
        quizImage.style.opacity = '1';
        console.log(`Loaded quiz questions image: ${imageUrl}`);
    };
    
    // Handle image load errors
    quizImage.onerror = () => {
        console.error(`Failed to load quiz questions image: ${imageUrl}`);
        quizImage.style.opacity = '1';
    };
}

function loadQuizReponsesImage(pageNumber) {
    const quizImage = document.getElementById('quiz-reponses-image');
    if (!quizImage) return;
    
    // Format page number with leading zeros (e.g., 0001, 0002, etc.)
    const formattedPageNumber = pageNumber.toString().padStart(4, '0');
    const imageUrl = `files/quizz_reponses/Superquizz_reponses_pdf_2_pages-to-jpg-${formattedPageNumber}.jpg`;
    
    // Add loading effect
    quizImage.style.opacity = '0.5';
    
    // Load the image
    quizImage.src = imageUrl;
    
    // Restore opacity when image loads
    quizImage.onload = () => {
        quizImage.style.opacity = '1';
        console.log(`Loaded quiz réponses image: ${imageUrl}`);
    };
    
    // Handle image load errors
    quizImage.onerror = () => {
        console.error(`Failed to load quiz réponses image: ${imageUrl}`);
        quizImage.style.opacity = '1';
    };
}

function updateQuizQuestionsPageInfo() {
    const pageInfo = document.getElementById('quiz-questions-page-info');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentQuizQuestionsPage} / ${totalQuizQuestionsPages}`;
    }
}

function updateQuizReponsesPageInfo() {
    const pageInfo = document.getElementById('quiz-reponses-page-info');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentQuizReponsesPage} / ${totalQuizReponsesPages}`;
    }
}

// Handle Quiz Questions actions from remote control
function handleQuizQuestionsAction(action) {
    console.log(`handleQuizQuestionsAction called with action: ${action}`);
    
    const overlay = document.getElementById('quiz-questions-overlay');
    if (!overlay || overlay.style.display === 'none' || !overlay.classList.contains('show')) {
        console.log('Quiz Questions overlay not visible, ignoring action');
        return;
    }
    
    console.log(`Quiz Questions overlay is visible, processing action: ${action}`);
    console.log(`Current page: ${currentQuizQuestionsPage}, Total pages: ${totalQuizQuestionsPages}`);
    
    if (action === 'prev') {
        if (currentQuizQuestionsPage > 1) {
            currentQuizQuestionsPage--;
            loadQuizQuestionsImage(currentQuizQuestionsPage);
            updateQuizQuestionsPageInfo();
            console.log(`Moved to previous page: ${currentQuizQuestionsPage}`);
        } else {
            console.log('Already on first page, cannot go previous');
        }
    } else if (action === 'next') {
        if (currentQuizQuestionsPage < totalQuizQuestionsPages) {
            currentQuizQuestionsPage++;
            loadQuizQuestionsImage(currentQuizQuestionsPage);
            updateQuizQuestionsPageInfo();
            console.log(`Moved to next page: ${currentQuizQuestionsPage}`);
        } else {
            // Close overlay after last page
            console.log('On last page, closing overlay');
            hideQuizQuestionsOverlay();
        }
    } else {
        console.log(`Unknown quiz questions action: ${action}`);
    }
    
    console.log(`Quiz Questions action completed: ${action}, current page: ${currentQuizQuestionsPage}`);
}

// Handle Quiz Réponses actions from remote control
function handleQuizReponsesAction(action) {
    console.log(`handleQuizReponsesAction called with action: ${action}`);
    
    const overlay = document.getElementById('quiz-reponses-overlay');
    if (!overlay || overlay.style.display === 'none' || !overlay.classList.contains('show')) {
        console.log('Quiz Réponses overlay not visible, ignoring action');
        return;
    }
    
    console.log(`Quiz Réponses overlay is visible, processing action: ${action}`);
    console.log(`Current page: ${currentQuizReponsesPage}, Total pages: ${totalQuizReponsesPages}`);
    
    if (action === 'prev') {
        if (currentQuizReponsesPage > 1) {
            currentQuizReponsesPage--;
            loadQuizReponsesImage(currentQuizReponsesPage);
            updateQuizReponsesPageInfo();
            console.log(`Moved to previous page: ${currentQuizReponsesPage}`);
        } else {
            console.log('Already on first page, cannot go previous');
        }
    } else if (action === 'next') {
        if (currentQuizReponsesPage < totalQuizReponsesPages) {
            currentQuizReponsesPage++;
            loadQuizReponsesImage(currentQuizReponsesPage);
            updateQuizReponsesPageInfo();
            console.log(`Moved to next page: ${currentQuizReponsesPage}`);
        } else {
            // Close overlay after last page
            console.log('On last page, closing overlay');
            hideQuizReponsesOverlay();
        }
    } else {
        console.log(`Unknown quiz réponses action: ${action}`);
    }
    
    console.log(`Quiz Réponses action completed: ${action}, current page: ${currentQuizReponsesPage}`);
}

// Handle PDF actions from remote control - determine which quiz to control
function handlePDFAction(action) {
    console.log(`handlePDFAction called with action: ${action}`);
    
    // Check which quiz overlay is currently visible
    const questionsOverlay = document.getElementById('quiz-questions-overlay');
    const reponsesOverlay = document.getElementById('quiz-reponses-overlay');
    
    const questionsVisible = questionsOverlay && questionsOverlay.style.display !== 'none' && questionsOverlay.classList.contains('show');
    const reponsesVisible = reponsesOverlay && reponsesOverlay.style.display !== 'none' && reponsesOverlay.classList.contains('show');
    
    if (questionsVisible) {
        console.log('Quiz Questions overlay is visible, routing to handleQuizQuestionsAction');
        handleQuizQuestionsAction(action);
    } else if (reponsesVisible) {
        console.log('Quiz Réponses overlay is visible, routing to handleQuizReponsesAction');
        handleQuizReponsesAction(action);
    } else {
        console.log('No quiz overlay is visible, ignoring action');
    }
}

function triggerTimerOverlay(timerType, buttonElement) {
    // Add active class for visual feedback
    buttonElement.classList.add('active');
    
    // Remove active class after animation
    setTimeout(() => {
        buttonElement.classList.remove('active');
    }, 600);
    
    // Start the timer overlay (no sound for timers)
    startTimerOverlay(timerType);
    
    console.log(`Timer triggered: ${timerType}`);
}

function startTimerOverlay(timerType) {
    // Stop any existing timer of the same type
    if (activeTimers[timerType]) {
        clearInterval(activeTimers[timerType]);
        activeTimers[timerType] = null;
    }
    
    // Get timer configuration
    const timerConfig = getTimerConfig(timerType);
    let timeLeft = timerConfig.duration;
    
    // Show the timer overlay
    const overlay = document.getElementById(`timer-overlay-${timerType}`);
    const display = document.getElementById(`timer-${timerType}-display`);
    const progress = document.getElementById(`progress-${timerType}`);
    
    overlay.classList.add('show');
    
    // Update display and progress
    updateTimerDisplay(display, timeLeft);
    updateTimerProgress(progress, timeLeft, timerConfig.duration);
    
    // Start countdown
    activeTimers[timerType] = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(display, timeLeft);
        updateTimerProgress(progress, timeLeft, timerConfig.duration);
        
        if (timeLeft <= 0) {
            // Timer finished
            clearInterval(activeTimers[timerType]);
            activeTimers[timerType] = null;
            
            // Hide overlay after a short delay
            setTimeout(() => {
                overlay.classList.remove('show');
            }, 1000);
        }
    }, 1000);
}

function getTimerConfig(timerType) {
    const configs = {
        '5min': { duration: 300, label: '5 MINUTES' }, // 5 minutes = 300 seconds
        '30s': { duration: 30, label: '30 SECONDS' }   // 30 seconds
    };
    return configs[timerType];
}

function updateTimerDisplay(displayElement, timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    displayElement.textContent = formattedTime;
}

function updateTimerProgress(progressElement, timeLeft, totalTime) {
    const progress = (totalTime - timeLeft) / totalTime;
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (progress * circumference);
    progressElement.style.strokeDashoffset = offset;
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
function toggleServer() {
    if (isServerMode) {
        stopConnection();
    } else {
        startServer();
    }
}

async function startServer() {
    try {
        isServerMode = true;
        updateConnectionStatus('connecting', 'Connecting to signaling server...');
        
        // Use fixed signaling server URL
        const signalingServerUrl = 'http://192.168.1.153:3000';
        
        webrtcConnection = new WebRTCSocketIOConnection(signalingServerUrl);
        
        // Check if signaling server is available
        console.log('Checking signaling server status...');
        const serverAvailable = await webrtcConnection.checkServerStatus();
        if (!serverAvailable) {
            console.error('Signaling server not available at http://192.168.1.153:3000');
            throw new Error('Signaling server not available. Please run: node signaling-server.js');
        }
        console.log('Signaling server is available, proceeding with connection...');
        
        // Set up message handler
        webrtcConnection.onMessage = (message) => {
            console.log('Received remote command:', message);
            if (message.type === 'remote-command' && message.command === 'trigger-overlay') {
                const button = document.querySelector(`[data-overlay="${message.overlay}"]`);
                if (button) {
                    triggerLaunchpadOverlay(message.overlay, button);
                }
            } else if (message.type === 'remote-command' && message.command === 'trigger-timer') {
                const button = document.querySelector(`[data-timer="${message.overlay}"]`);
                if (button) {
                    triggerTimerOverlay(message.overlay, button);
                }
            } else if (message.type === 'remote-command' && message.command === 'pdf-action') {
                console.log('Received PDF action command:', message);
                handlePDFAction(message.action);
            } else if (message.type === 'get-game-timer-status') {
                // Send current game timer status to remote control
                const timerStatus = getGameTimerStatus();
                webrtcConnection.sendMessage({
                    type: 'game-timer-status',
                    timerData: timerStatus,
                    timestamp: Date.now()
                });
            } else if (message.type === 'remote-command' && message.command === 'play-sound') {
                console.log('Received sound command:', message.soundId);
                playSound(message.soundId);
            }
        };
        
        // Set up connection state handler
        webrtcConnection.onConnectionStateChange = (state) => {
            if (state === 'connected') {
                updateConnectionStatus('connected', 'Connected to remote device');
                showConnectionInfo();
                updateServerToggleButton('connected');
            } else if (state === 'disconnected') {
                updateConnectionStatus('disconnected', 'Disconnected');
                hideConnectionInfo();
                updateServerToggleButton('disconnected');
            }
        };
        
        // Set up socket connection handler
        webrtcConnection.onSocketConnected = () => {
            updateConnectionStatus('connecting', 'Socket connected, establishing WebRTC...');
        };
        
        webrtcConnection.onSocketDisconnected = (reason) => {
            updateConnectionStatus('disconnected', `Socket disconnected: ${reason}`);
            hideConnectionInfo();
            updateServerToggleButton('disconnected');
        };
        
        // Set up data channel handler
        webrtcConnection.onDataChannelOpen = () => {
            updateConnectionStatus('connected', 'Remote control ready');
            showConnectionInfo();
            updateServerToggleButton('connected');
        };
        
        await webrtcConnection.initialize(true); // true = initiator (server)
        await webrtcConnection.startConnection();
        
        // Update UI
        updateServerToggleButton('connecting');
        
    } catch (error) {
        console.error('Error starting server:', error);
        updateConnectionStatus('disconnected', `Error: ${error.message}`);
        isServerMode = false;
        updateServerToggleButton('disconnected');
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
    updateServerToggleButton('disconnected');
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

function updateServerToggleButton(status) {
    const toggleBtn = document.getElementById('server-toggle');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    const toggleIndicator = toggleBtn.querySelector('.toggle-indicator');
    
    toggleBtn.className = 'connection-toggle-btn';
    
    switch (status) {
        case 'connected':
            toggleBtn.classList.add('connected');
            toggleText.textContent = 'Stop Server';
            toggleIndicator.textContent = '●';
            break;
        case 'connecting':
            toggleBtn.classList.add('connecting');
            toggleText.textContent = 'Starting...';
            toggleIndicator.textContent = '●';
            break;
        case 'disconnected':
        default:
            toggleText.textContent = 'Start Server';
            toggleIndicator.textContent = '●';
            break;
    }
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

// Overlay Management Functions
function closeAllOverlays() {
    console.log('Closing all active overlays...');
    
    // Close all video overlays
    const videoOverlays = ['sojugroup', 'sojusolo', 'redlight'];
    videoOverlays.forEach(videoType => {
        hideVideoOverlay(videoType);
    });
    
    // Close all second overlays (game overlays)
    const secondOverlays = ['123soleil', 'A', 'slowmotion', 'sport', 'sing', 'equilivre', 'joker', 'kawibawibo', 'miaou', 'mime', 'dance', 'mix'];
    secondOverlays.forEach(overlayType => {
        hideSecondOverlay(overlayType);
    });
    
    // Close all timer overlays
    const timerOverlays = ['wormhole', '5min', '30s'];
    timerOverlays.forEach(timerType => {
        hideTimerOverlay(timerType);
    });
    
    // Close quiz overlays
    hideQuizQuestionsOverlay();
    hideQuizReponsesOverlay();
    
    // Stop any active timers
    Object.keys(activeTimers).forEach(timerType => {
        if (activeTimers[timerType]) {
            clearInterval(activeTimers[timerType]);
            activeTimers[timerType] = null;
        }
    });
    
    console.log('All overlays closed');
}

function closeAllOverlaysExceptWormhole() {
    console.log('Closing all active overlays except wormhole...');
    
    // Close all video overlays
    const videoOverlays = ['sojugroup', 'sojusolo', 'redlight'];
    videoOverlays.forEach(videoType => {
        hideVideoOverlay(videoType);
    });
    
    // Close all second overlays (game overlays)
    const secondOverlays = ['123soleil', 'A', 'slowmotion', 'sport', 'sing', 'equilivre', 'joker', 'kawibawibo', 'miaou', 'mime', 'dance', 'mix'];
    secondOverlays.forEach(overlayType => {
        hideSecondOverlay(overlayType);
    });
    
    // Close timer overlays except wormhole
    const timerOverlays = ['5min', '30s'];
    timerOverlays.forEach(timerType => {
        hideTimerOverlay(timerType);
    });
    
    // Close quiz overlays
    hideQuizQuestionsOverlay();
    hideQuizReponsesOverlay();
    
    // Stop any active timers except game timer
    Object.keys(activeTimers).forEach(timerType => {
        if (activeTimers[timerType]) {
            clearInterval(activeTimers[timerType]);
            activeTimers[timerType] = null;
        }
    });
    
    console.log('All overlays closed except wormhole');
}

// Game Timer Functions (30 minutes)
function startGameTimer(overlayType) {
    // Clear any existing game timer
    if (gameTimer) {
        clearTimeout(gameTimer);
    }
    
    // Set start time
    gameTimerStartTime = Date.now();
    
    // Start 1-minute timer (1 * 60 * 1000 milliseconds) - for testing
    gameTimer = setTimeout(() => {
        console.log(`Game timer finished for overlay: ${overlayType}`);
        playSound('alarm');
        
        // Reset timer state
        gameTimer = null;
        gameTimerStartTime = null;
        
        // Notify remote control that timer finished
        if (webrtcConnection && webrtcConnection.sendMessage) {
            webrtcConnection.sendMessage({
                type: 'game-timer-finished',
                overlay: overlayType,
                timestamp: Date.now()
            });
        }
    }, 1 * 60 * 1000); // 1 minute for testing
    
    console.log(`Game timer started for overlay: ${overlayType}`);
    
    // Notify remote control that timer started
    if (webrtcConnection && webrtcConnection.sendMessage) {
        webrtcConnection.sendMessage({
            type: 'game-timer-started',
            overlay: overlayType,
            startTime: gameTimerStartTime,
            duration: 1 * 60 * 1000, // 1 minute in milliseconds for testing
            timestamp: Date.now()
        });
    }
}

function getGameTimerStatus() {
    if (!gameTimer || !gameTimerStartTime) {
        return {
            active: false,
            timeLeft: 0,
            totalTime: 0
        };
    }
    
    const elapsed = Date.now() - gameTimerStartTime;
    const totalTime = 1 * 60 * 1000; // 1 minute for testing
    const timeLeft = Math.max(0, totalTime - elapsed);
    
    return {
        active: true,
        timeLeft: timeLeft,
        totalTime: totalTime,
        elapsed: elapsed
    };
}

function stopGameTimer() {
    if (gameTimer) {
        clearTimeout(gameTimer);
        gameTimer = null;
        gameTimerStartTime = null;
        console.log('Game timer stopped');
        
        // Notify remote control that timer was stopped
        if (webrtcConnection && webrtcConnection.sendMessage) {
            webrtcConnection.sendMessage({
                type: 'game-timer-stopped',
                timestamp: Date.now()
            });
        }
    }
}

// Export functions for potential external use
window.WormholeLaunchpad = {
    triggerLaunchpadOverlay,
    playSound,
    showTimerOverlay,
    showSecondOverlay,
    startServer,
    stopConnection,
    startGameTimer,
    getGameTimerStatus,
    stopGameTimer,
    closeAllOverlays,
    closeAllOverlaysExceptWormhole
};

