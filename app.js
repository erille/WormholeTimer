// Wormhole Timer - Party Sound Scheduler
// A vanilla web app for scheduling sounds with psychedelic themes

// Sound manifest - Add/remove sounds by modifying this array
const SOUND_MANIFEST = [
    { id: 'tardis', label: 'Tardis', file: 'sounds/tardis.wav' },
    { id: 'portal', label: 'Portal', file: 'sounds/portal.wav' },
    { id: 'blip', label: 'Blip', file: 'sounds/blip.wav' }
];

// Theme manifest - Add/remove themes by modifying this array
const THEME_MANIFEST = [
    { id: 'default', label: 'Default' },
    { id: 'neon-cyber', label: 'Neon Cyber' },
    { id: 'electric-storm', label: 'Electric Storm' },
    { id: 'psychedelic-rainbow', label: 'Psychedelic Rainbow' },
    { id: 'cosmic-purple', label: 'Cosmic Purple' },
    { id: 'neon-matrix', label: 'Neon Matrix' },
    { id: 'fire-ice', label: 'Fire & Ice' },
    { id: 'galaxy-spiral', label: 'Galaxy Spiral' },
    { id: 'neon-jungle', label: 'Neon Jungle' },
    { id: 'digital-dreams', label: 'Digital Dreams' },
    { id: 'electric-blue', label: 'Electric Blue' },
    { id: 'neon-sunset', label: 'Neon Sunset' },
    { id: 'cyber-punk', label: 'Cyber Punk' },
    { id: 'rainbow-explosion', label: 'Rainbow Explosion' },
    { id: 'neon-ocean', label: 'Neon Ocean' },
    { id: 'twilight-zone', label: 'Twilight Zone' },
    { id: 'pastel-minimal', label: 'Pastel Minimal' }
];

// Overlay manifest - Add/remove overlays by modifying this array
const OVERLAY_MANIFEST = [
    { id: 'colorful', label: 'Colorful Swirl' },
    { id: 'monochrome', label: 'Monochrome Swirl' },
    { id: 'nyancat', label: 'Nyan Cat' },
    { id: 'wormhole', label: 'Wormhole Travel' }
];

// Second overlay manifest - Add/remove image overlays by modifying this array
const SECOND_OVERLAY_MANIFEST = [
    { id: 'none', label: 'None' },
    { id: '123soleil', label: '123 Soleil', file: 'img/123soleil.png' },
    { id: 'A', label: 'A', file: 'img/A.png' },
    { id: 'slowmotion', label: 'Slow Motion', file: 'img/slowmotion.png' },
    { id: 'sport', label: 'Sport', file: 'img/sport.png' },
    { id: 'sing', label: 'Sing', file: 'img/sing.png' },
    { id: 'equilivre', label: 'Equilivre', file: 'img/Equilivre.png' },
    { id: 'joker', label: 'Joker', file: 'img/Joker.png' },
    { id: 'kawibawibo', label: 'Kawi Bawi Bo', file: 'img/kawibawibo.png' },
    { id: 'miaou', label: 'Miaou', file: 'img/Miaou.png' },
    { id: 'mime', label: 'Mime', file: 'img/Mime.png' },
    { id: 'dance', label: 'Dance', file: 'img/Dance.png' },
    { id: 'mix', label: 'Mix', file: 'img/mix.png' }
];

// Global state
let timers = [];
let isMonitoring = false;
let monitoringInterval = null;
let audioContext = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize Web Audio API
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API not supported, falling back to HTML5 audio');
    }
    
    // Create initial timers
    createInitialTimers();
    
    // Set up event listeners
    setupEventListeners();
    
    // Log initialization
    logStatus('Wormhole Timer initialized. Ready to schedule your party sounds!');
}

function createInitialTimers() {
    // Create 2 default timers
    for (let i = 0; i < 2; i++) {
        addTimer();
    }
}

function addTimer() {
    const timerId = Date.now() + Math.random();
    const timer = {
        id: timerId,
        startTime: '00:00:00', // Default time instead of empty
        sound: 'portal', // Default to Portal sound
        theme: THEME_MANIFEST[1].id, // Start with first psychedelic theme
        overlay: 'wormhole', // Start with Wormhole Travel overlay
        secondOverlay: 'none' // Default to no second overlay
    };
    
    timers.push(timer);
    renderTimers();
    logStatus(`Timer ${timers.length} added`);
}

function removeTimer(timerId) {
    const index = timers.findIndex(t => t.id === timerId);
    if (index !== -1) {
        timers.splice(index, 1);
        renderTimers();
        logStatus(`Timer ${index + 1} removed`);
    }
}

function renderTimers() {
    const container = document.getElementById('timers-container');
    container.innerHTML = '';
    
    timers.forEach((timer, index) => {
        const timerRow = createTimerRow(timer, index);
        container.appendChild(timerRow);
    });
}

function createTimerRow(timer, index) {
    const row = document.createElement('div');
    row.className = 'timer-row';
    
    // Format the time for display
    const displayTime = timer.startTime || '00:00:00';
    
    row.innerHTML = `
        <div>
            <label>Timer ${index + 1}</label>
            <div class="time-display" data-timer-id="${timer.id}">
                <span class="time-text">${displayTime}</span>
                <button class="edit-time-btn" data-timer-id="${timer.id}" title="Edit Time">✏️</button>
            </div>
        </div>
        <div>
            <label>Sound</label>
            <select data-timer-id="${timer.id}" data-type="sound">
                ${SOUND_MANIFEST.map(sound => 
                    `<option value="${sound.id}" ${sound.id === timer.sound ? 'selected' : ''}>${sound.label}</option>`
                ).join('')}
            </select>
        </div>
        <div>
            <label>Theme</label>
            <select data-timer-id="${timer.id}" data-type="theme">
                ${THEME_MANIFEST.map(theme => 
                    `<option value="${theme.id}" ${theme.id === timer.theme ? 'selected' : ''}>${theme.label}</option>`
                ).join('')}
            </select>
        </div>
        <div>
            <label>Overlay</label>
            <select data-timer-id="${timer.id}" data-type="overlay">
                ${OVERLAY_MANIFEST.map(overlay => 
                    `<option value="${overlay.id}" ${overlay.id === timer.overlay ? 'selected' : ''}>${overlay.label}</option>`
                ).join('')}
            </select>
        </div>
        <div>
            <label>2nd Overlay</label>
            <select data-timer-id="${timer.id}" data-type="secondOverlay">
                ${SECOND_OVERLAY_MANIFEST.map(overlay => 
                    `<option value="${overlay.id}" ${overlay.id === timer.secondOverlay ? 'selected' : ''}>${overlay.label}</option>`
                ).join('')}
            </select>
        </div>
        <div>
            <label>Actions</label>
            <div class="timer-actions">
                <button class="test-btn" data-timer-id="${timer.id}" title="Test Sound"></button>
                ${timers.length > 1 ? `<button class="remove-btn" data-timer-id="${timer.id}" title="Remove Timer"></button>` : ''}
            </div>
        </div>
    `;
    
    return row;
}

function setupEventListeners() {
    // Add timer button
    document.getElementById('add-timer-btn').addEventListener('click', addTimer);
    
    // Start/Stop monitoring buttons
    document.getElementById('start-btn').addEventListener('click', startMonitoring);
    document.getElementById('stop-btn').addEventListener('click', stopMonitoring);
    
    // Toggle status panel
    document.getElementById('toggle-status-btn').addEventListener('click', toggleStatusPanel);
    
    // Test overlay button
    document.getElementById('test-overlay-btn').addEventListener('click', showTimerOverlay);
    
    // Test timer button
    document.getElementById('test-timer-btn').addEventListener('click', testTimerTrigger);
    
    // Test monitoring button
    document.getElementById('test-monitoring-btn').addEventListener('click', testMonitoring);
    
    // Launchpad button
    document.getElementById('launchpad-btn').addEventListener('click', function() {
        window.location.href = 'launchpad.html';
    });
    
    // Timer row event delegation
    document.getElementById('timers-container').addEventListener('change', function(e) {
        const timerId = parseFloat(e.target.dataset.timerId);
        const type = e.target.dataset.type;
        
        if (type === 'sound' || type === 'theme' || type === 'overlay' || type === 'secondOverlay') {
            updateTimer(timerId, type, e.target.value);
        }
    });
    
    // Test button, remove button, and edit time button event delegation
    document.getElementById('timers-container').addEventListener('click', function(e) {
        const timerId = parseFloat(e.target.dataset.timerId);
        
        if (e.target.classList.contains('test-btn')) {
            testSound(timerId);
        } else if (e.target.classList.contains('remove-btn')) {
            removeTimer(timerId);
        } else if (e.target.classList.contains('edit-time-btn') || e.target.classList.contains('time-display')) {
            openTimePicker(timerId);
        }
    });
    
    // Time picker modal events
    setupTimePickerEvents();
}

function updateTimer(timerId, property, value) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
        timer[property] = value;
        logStatus(`Timer ${timers.indexOf(timer) + 1} updated: ${property} = ${value}`);
        
        // Debug log for overlay changes
        if (property === 'overlay') {
            console.log(`Overlay updated for timer ${timers.indexOf(timer) + 1}:`, value);
            console.log('Current timer state:', timer);
        }
    }
}

// Global variable to track current timer being edited
let currentEditingTimerId = null;

function toggleStatusPanel() {
    const statusPanel = document.getElementById('status-panel');
    const toggleBtn = document.getElementById('toggle-status-btn');
    
    if (statusPanel.style.display === 'none' || statusPanel.style.display === '') {
        // Show panel with smooth transition
        statusPanel.style.display = 'block';
        statusPanel.style.maxHeight = '0px';
        statusPanel.style.opacity = '0';
        
        // Force reflow
        statusPanel.offsetHeight;
        
        // Animate to full height
        statusPanel.style.maxHeight = '500px';
        statusPanel.style.opacity = '1';
        
        toggleBtn.textContent = 'Hide Status & Log';
    } else {
        // Hide panel with smooth transition
        statusPanel.style.maxHeight = '0px';
        statusPanel.style.opacity = '0';
        
        // Hide after transition
        setTimeout(() => {
            statusPanel.style.display = 'none';
        }, 300);
        
        toggleBtn.textContent = 'Status & Log';
    }
}

function openTimePicker(timerId) {
    currentEditingTimerId = timerId;
    const timer = timers.find(t => t.id === timerId);
    
    // Parse existing time or set defaults
    const timeParts = timer.startTime ? timer.startTime.split(':') : ['00', '00', '00'];
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;
    const seconds = parseInt(timeParts[2]) || 0;
    
    // Initialize wheels
    initializeWheels();
    
    // Set current values
    setWheelValue('hours-wheel', hours);
    setWheelValue('minutes-wheel', minutes);
    setWheelValue('seconds-wheel', seconds);
    
    // Show modal
    document.getElementById('time-picker-modal').style.display = 'block';
}

function setupTimePickerEvents() {
    const modal = document.getElementById('time-picker-modal');
    const closeBtn = document.getElementById('close-time-picker');
    const cancelBtn = document.getElementById('cancel-time-btn');
    const setBtn = document.getElementById('set-time-btn');
    
    // Close modal events
    closeBtn.addEventListener('click', closeTimePicker);
    cancelBtn.addEventListener('click', closeTimePicker);
    setBtn.addEventListener('click', setTimeFromPicker);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTimePicker();
        }
    });
}

function initializeWheels() {
    // Generate minutes wheel (0-59)
    const minutesWheel = document.getElementById('minutes-wheel');
    minutesWheel.innerHTML = '';
    for (let i = 0; i < 60; i++) {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.dataset.value = i;
        item.textContent = i.toString().padStart(2, '0');
        minutesWheel.appendChild(item);
    }
    
    // Generate seconds wheel (0-59)
    const secondsWheel = document.getElementById('seconds-wheel');
    secondsWheel.innerHTML = '';
    for (let i = 0; i < 60; i++) {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.dataset.value = i;
        item.textContent = i.toString().padStart(2, '0');
        secondsWheel.appendChild(item);
    }
    
    // Add wheel event listeners
    setupWheelEvents();
}

function setupWheelEvents() {
    const wheels = ['hours-wheel', 'minutes-wheel', 'seconds-wheel'];
    
    wheels.forEach(wheelId => {
        const wheel = document.getElementById(wheelId);
        
        // Mouse wheel events
        wheel.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1 : -1;
            scrollWheel(wheelId, delta);
        });
        
        // Click events on wheel items
        wheel.addEventListener('click', function(e) {
            if (e.target.classList.contains('wheel-item')) {
                const value = parseInt(e.target.dataset.value);
                setWheelValue(wheelId, value);
            }
        });
        
        // Touch events for mobile
        let startY = 0;
        wheel.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        });
        
        wheel.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const currentY = e.touches[0].clientY;
            const delta = startY - currentY;
            if (Math.abs(delta) > 10) {
                const direction = delta > 0 ? 1 : -1;
                scrollWheel(wheelId, direction);
                startY = currentY;
            }
        });
    });
}

function scrollWheel(wheelId, direction) {
    const wheel = document.getElementById(wheelId);
    const items = wheel.querySelectorAll('.wheel-item');
    const currentActive = wheel.querySelector('.wheel-item.active');
    
    if (!currentActive) return;
    
    const currentIndex = Array.from(items).indexOf(currentActive);
    let newIndex = currentIndex + direction;
    
    // Handle wrapping
    if (wheelId === 'hours-wheel') {
        if (newIndex < 0) newIndex = 23;
        if (newIndex > 23) newIndex = 0;
    } else {
        if (newIndex < 0) newIndex = 59;
        if (newIndex > 59) newIndex = 0;
    }
    
    // Update active item
    currentActive.classList.remove('active');
    items[newIndex].classList.add('active');
    
    // Scroll to center the active item
    scrollToActiveItem(wheel);
}

function setWheelValue(wheelId, value) {
    const wheel = document.getElementById(wheelId);
    const items = wheel.querySelectorAll('.wheel-item');
    
    // Remove active class from all items
    items.forEach(item => item.classList.remove('active'));
    
    // Find and activate the correct item
    const targetItem = wheel.querySelector(`[data-value="${value}"]`);
    if (targetItem) {
        targetItem.classList.add('active');
        scrollToActiveItem(wheel);
    }
}

function scrollToActiveItem(wheel) {
    const activeItem = wheel.querySelector('.wheel-item.active');
    if (activeItem) {
        const wheelRect = wheel.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const scrollTop = activeItem.offsetTop - (wheelRect.height / 2) + (itemRect.height / 2);
        
        wheel.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }
}

function getWheelValue(wheelId) {
    const wheel = document.getElementById(wheelId);
    const activeItem = wheel.querySelector('.wheel-item.active');
    return activeItem ? parseInt(activeItem.dataset.value) : 0;
}

function closeTimePicker() {
    document.getElementById('time-picker-modal').style.display = 'none';
    currentEditingTimerId = null;
}

function showTimerOverlay(overlayType = 'colorful') {
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
    
    // Start animations based on overlay type
    if (overlayType === 'nyancat') {
        // For Nyan Cat, restart the animation
        const nyancat = overlay.querySelector('.nyancat');
        if (nyancat) {
            nyancat.style.animation = 'none';
            nyancat.offsetHeight; // Force reflow
            nyancat.style.animation = 'nyancatRun 8s linear infinite';
        }
    } else if (overlayType === 'wormhole') {
        // For wormhole video, start the video
        const video = overlay.querySelector('.wormhole-video');
        if (video) {
            video.currentTime = 0; // Reset to beginning
            video.play().catch(e => {
                console.warn('Could not autoplay video:', e);
                logStatus('⚠️ Could not autoplay wormhole video', 'error');
            });
        }
    } else {
        // For swirl overlays, start the 4D swirl animation
        const swirl = overlay.querySelector('.swirl-4d');
        if (swirl) {
            swirl.style.animation = 'swirl4D 2s ease-in-out infinite';
        }
    }
    
    // Hide overlay after sound duration or 9 seconds default
    setTimeout(() => {
        hideTimerOverlay(overlayType);
    }, 9000); // 9 seconds default
}

function hideTimerOverlay(overlayType = 'colorful') {
    const overlayId = `timer-overlay-${overlayType}`;
    const overlay = document.getElementById(overlayId);
    const swirl = overlay ? overlay.querySelector('.swirl-4d') : null;
    const nyancat = overlay ? overlay.querySelector('.nyancat') : null;
    const video = overlay ? overlay.querySelector('.wormhole-video') : null;
    
    if (!overlay) return;
    
    // Remove show class for opacity transition
    overlay.classList.remove('show');
    
    // Stop animations and video
    if (swirl) {
        swirl.style.animation = 'none';
    }
    if (nyancat) {
        nyancat.style.animation = 'none';
    }
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

function testTimerTrigger() {
    // Test with the first timer if it exists
    if (timers.length > 0) {
        const timer = timers[0];
        console.log('Testing timer trigger with:', timer);
        triggerTimer(timer, 0);
        logStatus('🧪 Manual timer test triggered', 'test');
    } else {
        logStatus('⚠️ No timers available for testing', 'error');
    }
}

function testMonitoring() {
    if (timers.length === 0) {
        logStatus('⚠️ No timers available for testing', 'error');
        return;
    }
    
    // Set first timer to current time + 5 seconds
    const now = new Date();
    now.setSeconds(now.getSeconds() + 5);
    const testTime = formatTime(now);
    
    timers[0].startTime = testTime;
    renderTimers();
    
    logStatus(`🧪 Timer 1 set to trigger in 5 seconds: ${testTime}`, 'test');
    
    // Start monitoring if not already started
    if (!isMonitoring) {
        startMonitoring();
    }
}

function setTimeFromPicker() {
    if (!currentEditingTimerId) return;
    
    const hours = getWheelValue('hours-wheel').toString().padStart(2, '0');
    const minutes = getWheelValue('minutes-wheel').toString().padStart(2, '0');
    const seconds = getWheelValue('seconds-wheel').toString().padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Update timer
    const timer = timers.find(t => t.id === currentEditingTimerId);
    if (timer) {
        timer.startTime = timeString;
        const timerIndex = timers.indexOf(timer) + 1;
        logStatus(`Timer ${timerIndex} time set to: ${timeString}`);
        
        // Update display
        renderTimers();
    }
    
    closeTimePicker();
}

function testSound(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (timer) {
        // Play sound
        playSound(timer.sound);
        
        // Apply theme for testing
        applyTheme(timer.theme);
        
        // Show first overlay for testing with selected type
        const overlayType = timer.overlay || 'colorful';
        showTimerOverlay(overlayType);
        
        // Schedule second overlay to show after first overlay ends (9 seconds)
        const secondOverlayType = timer.secondOverlay || 'none';
        if (secondOverlayType !== 'none') {
            setTimeout(() => {
                showSecondOverlay(secondOverlayType);
            }, 9000); // Show second overlay after first overlay duration
        }
        
        const soundLabel = SOUND_MANIFEST.find(s => s.id === timer.sound)?.label || timer.sound;
        const themeLabel = THEME_MANIFEST.find(t => t.id === timer.theme)?.label || timer.theme;
        const overlayLabel = OVERLAY_MANIFEST.find(o => o.id === overlayType)?.label || overlayType;
        const secondOverlayLabel = SECOND_OVERLAY_MANIFEST.find(o => o.id === secondOverlayType)?.label || secondOverlayType;
        
        logStatus(`🧪 Testing: Sound: ${soundLabel}, Theme: ${themeLabel}, Overlay: ${overlayLabel}, 2nd Overlay: ${secondOverlayLabel}`, 'test');
    }
}

function startMonitoring() {
    if (isMonitoring) return;
    
    isMonitoring = true;
    document.getElementById('start-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
    
    // Check every second for timer matches
    monitoringInterval = setInterval(checkTimers, 1000);
    
    logStatus('Started monitoring timers...');
    console.log('Monitoring started. Current timers:', timers);
    
    // Add visual indicator
    document.body.classList.add('monitoring-active');
}

function stopMonitoring() {
    if (!isMonitoring) return;
    
    isMonitoring = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
    
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = null;
    }
    
    logStatus('Stopped monitoring timers');
    
    // Remove visual indicator
    document.body.classList.remove('monitoring-active');
}

function checkTimers() {
    const now = new Date();
    const currentTime = formatTime(now);
    
    // Debug: Log current time every 5 seconds
    if (now.getSeconds() % 5 === 0) {
        console.log('Current time:', currentTime);
        console.log('Timers:', timers.map(t => ({ id: t.id, startTime: t.startTime, match: t.startTime === currentTime })));
    }
    
    timers.forEach((timer, index) => {
        if (timer.startTime && timer.startTime === currentTime) {
            console.log('Timer triggered!', timer);
            triggerTimer(timer, index);
        }
    });
}

function triggerTimer(timer, index) {
    // Play sound
    playSound(timer.sound);
    
    // Apply theme
    applyTheme(timer.theme);
    
    // Show first overlay with selected type
    const overlayType = timer.overlay || 'colorful';
    console.log(`Triggering timer ${index + 1} with overlay:`, overlayType, 'Timer state:', timer);
    showTimerOverlay(overlayType);
    
    // Schedule second overlay to show after first overlay ends (9 seconds)
    const secondOverlayType = timer.secondOverlay || 'none';
    if (secondOverlayType !== 'none') {
        setTimeout(() => {
            showSecondOverlay(secondOverlayType);
        }, 9000); // Show second overlay after first overlay duration
    }
    
    // Log the event
    const soundLabel = SOUND_MANIFEST.find(s => s.id === timer.sound)?.label || timer.sound;
    const themeLabel = THEME_MANIFEST.find(t => t.id === timer.theme)?.label || timer.theme;
    const overlayLabel = OVERLAY_MANIFEST.find(o => o.id === overlayType)?.label || overlayType;
    const secondOverlayLabel = SECOND_OVERLAY_MANIFEST.find(o => o.id === secondOverlayType)?.label || secondOverlayType;
    
    logStatus(`🎵 Timer ${index + 1} TRIGGERED! Sound: ${soundLabel}, Theme: ${themeLabel}, Overlay: ${overlayLabel}, 2nd Overlay: ${secondOverlayLabel}`, 'trigger');
    
    // Reset timer to prevent multiple triggers
    timer.startTime = '';
    renderTimers();
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
        logStatus(`⚠️ Could not play sound: ${filePath}`, 'error');
    });
}

function applyTheme(themeId) {
    // Remove all existing theme classes
    const body = document.body;
    THEME_MANIFEST.forEach(theme => {
        body.classList.remove(`theme-${theme.id}`);
    });
    
    // Apply new theme (if not default)
    if (themeId !== 'default') {
        body.classList.add(`theme-${themeId}`);
    }
    
    logStatus(`Theme applied: ${THEME_MANIFEST.find(t => t.id === themeId)?.label || themeId}`, 'theme');
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function logStatus(message, type = 'info') {
    const log = document.getElementById('status-log');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('p');
    logEntry.className = `log-${type}`;
    logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    
    // Add to top of log
    log.insertBefore(logEntry, log.firstChild);
    
    // Keep only last 20 entries
    while (log.children.length > 20) {
        log.removeChild(log.lastChild);
    }
    
    // Auto-scroll to top
    log.scrollTop = 0;
}

// Utility function to add new sounds (for future expansion)
function addSound(id, label, file) {
    SOUND_MANIFEST.push({ id, label, file });
    renderTimers(); // Refresh dropdowns
    logStatus(`New sound added: ${label}`);
}

// Utility function to add new themes (for future expansion)
function addTheme(id, label) {
    THEME_MANIFEST.push({ id, label });
    renderTimers(); // Refresh dropdowns
    logStatus(`New theme added: ${label}`);
}

// Export functions for potential external use
window.WormholeTimer = {
    addSound,
    addTheme,
    startMonitoring,
    stopMonitoring,
    triggerTimer,
    playSound,
    applyTheme
};
