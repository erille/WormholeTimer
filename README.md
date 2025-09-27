# Wormhole Timer 🎵🌈🎬

A psychedelic party sound scheduler built with vanilla HTML, CSS, and JavaScript. Schedule sounds to play at specific times and watch your page transform with vibrant, animated themes and video overlays!

## Features

- ⏰ **Multiple Timers**: Create and manage multiple sound timers
- 🎵 **Sound Effects**: Play .wav files when timers trigger
- 🌈 **16 Psychedelic Themes**: Including 14 vibrant themes, 1 Twilight Zone theme, and 1 pastel theme
- 🎬 **Video Overlays**: Full-screen video overlays including Wormhole Travel video
- 🎮 **Real-time Monitoring**: Background monitoring of system time
- 🧪 **Test Mode**: Test sounds, themes, and overlays before scheduling
- 📱 **Responsive Design**: Works on desktop and mobile

## Quick Start

1. **Open the app**: Simply open `index.html` in any modern web browser
2. **Add sound files**: Place your .wav files in the `sounds/` folder (see sounds/README.md)
3. **Set timers**: Configure start times, sounds, and themes for each timer
4. **Start monitoring**: Click "Start Monitoring" to begin watching for timer triggers
5. **Enjoy the show**: When timers fire, sounds play and themes transform the page!

## File Structure

```
Timer Wormhole/
├── index.html          # Main HTML file
├── styles.css          # All styles, 16 themes, and overlay animations
├── app.js             # JavaScript functionality
├── sounds/            # Sound files folder
│   ├── README.md      # Instructions for adding sounds
│   ├── tardis.wav     # Sound files (add your own)
│   ├── portal.wav
│   ├── blip.wav
│   └── chime.wav
├── video/             # Video overlay files
│   └── wormholetravel.mp4  # Wormhole travel video overlay
└── README.md          # This file
```

## How to Use

### Setting Up Timers

1. **Default Setup**: The app starts with 2 timers
2. **Add More**: Click "+ Add Timer" to create additional timers
3. **Configure Each Timer**:
   - **Start Time**: Set when the timer should trigger (HH:MM:SS format)
   - **Sound**: Choose from available .wav files (default: Portal)
   - **Theme**: Select which theme to apply when triggered
   - **Overlay**: Choose visual overlay effect (default: Wormhole Travel)
4. **Test**: Use the ▶︎ button to test sounds, themes, and overlays immediately

### Monitoring

- **Start Monitoring**: Click "Start Monitoring" to begin watching for timer triggers
- **Real-time**: The app checks every second for matching times
- **Auto-reset**: Timers reset after triggering to prevent multiple fires
- **Overlay Duration**: All overlays display for 9 seconds
- **Stop**: Click "Stop Monitoring" to pause the system

### Themes

The app includes 16 unique themes:

**Psychedelic Themes (14):**
- Neon Cyber - Pulsating neon gradients
- Electric Storm - Dynamic storm effects
- Psychedelic Rainbow - Spinning rainbow colors
- Cosmic Purple - Radial cosmic effects
- Neon Matrix - Matrix-style green patterns
- Fire & Ice - Hot and cold color transitions
- Galaxy Spiral - Rotating galaxy effects
- Neon Jungle - Jungle-inspired neon colors
- Digital Dreams - Digital gradient animations
- Electric Blue - Electric blue transitions
- Neon Sunset - Sunset-inspired neon colors
- Cyber Punk - Dark cyberpunk aesthetics
- Rainbow Explosion - Explosive rainbow effects
- Neon Ocean - Ocean-inspired neon waves

**Special Themes (2):**
- Twilight Zone - Black & white swirling vortex
- Pastel Minimal - Soft, minimal pastel design

### Overlays

The app includes 4 visual overlay effects:

**Animated Overlays (3):**
- Colorful Swirl - Psychedelic 4D rotating swirl with vibrant colors
- Monochrome Swirl - Black & white 4D rotating swirl
- Nyan Cat - Animated Nyan Cat with rainbow trail

**Video Overlay (1):**
- Wormhole Travel - Full-screen video overlay with wormhole travel effect

## Adding Sounds

1. **Get .wav files**: Download or create .wav sound files
2. **Place in sounds/**: Put files in the `sounds/` folder
3. **Update manifest**: Edit the `SOUND_MANIFEST` array in `app.js`
4. **Add entry**: `{ id: 'your-sound', label: 'Your Sound', file: 'sounds/your-sound.wav' }`

## Adding Themes

1. **Create CSS**: Add your theme CSS class in `styles.css`
2. **Update manifest**: Edit the `THEME_MANIFEST` array in `app.js`
3. **Add entry**: `{ id: 'your-theme', label: 'Your Theme' }`
4. **CSS class**: Use format `body.theme-your-theme { /* your styles */ }`

## Adding Video Overlays

1. **Get video files**: Add .mp4 video files to the `video/` folder
2. **Update manifest**: Edit the `OVERLAY_MANIFEST` array in `app.js`
3. **Add entry**: `{ id: 'your-overlay', label: 'Your Overlay' }`
4. **Create HTML**: Add overlay div in `index.html` with video element
5. **Add CSS**: Style the video overlay in `styles.css`
6. **Update JavaScript**: Add overlay handling in `showTimerOverlay()` function

## Technical Details

- **Pure Vanilla**: No frameworks, libraries, or dependencies
- **Web Audio API**: Uses modern audio APIs with HTML5 fallback
- **HTML5 Video**: Full-screen video overlays with autoplay support
- **Responsive**: Mobile-friendly design with CSS Grid
- **Cross-browser**: Works in all modern browsers
- **Local Storage**: No server required - runs entirely in browser

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

## Troubleshooting

**Sounds not playing?**
- Check that .wav files exist in the sounds/ folder
- Verify file paths in the SOUND_MANIFEST
- Try the Test button to verify individual sounds

**Themes not applying?**
- Check browser console for CSS errors
- Verify theme IDs match between manifest and CSS classes
- Ensure CSS class names follow the format: `body.theme-{id}`

**Overlays not showing?**
- Check that video files exist in the video/ folder
- Verify overlay IDs match between manifest and HTML elements
- Ensure video elements have proper autoplay attributes
- Check browser autoplay policies (some browsers block autoplay)

**Timers not triggering?**
- Make sure monitoring is started
- Check that start times are set correctly
- Verify system time matches your expectations

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to:
- Add new themes and overlays
- Improve the UI/UX
- Add new features
- Fix bugs
- Create better sound effects and video overlays

---

**Enjoy your psychedelic party timer! 🎉🌈🎵🎬**

