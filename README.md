# Wormhole Timer 🎵🌈

A psychedelic party sound scheduler built with vanilla HTML, CSS, and JavaScript. Schedule sounds to play at specific times and watch your page transform with vibrant, animated themes!

## Features

- ⏰ **Multiple Timers**: Create and manage multiple sound timers
- 🎵 **Sound Effects**: Play .wav files when timers trigger
- 🌈 **16 Psychedelic Themes**: Including 14 vibrant themes, 1 Twilight Zone theme, and 1 pastel theme
- 🎮 **Real-time Monitoring**: Background monitoring of system time
- 🧪 **Test Mode**: Test sounds and themes before scheduling
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
├── styles.css          # All styles and 16 themes
├── app.js             # JavaScript functionality
├── sounds/            # Sound files folder
│   ├── README.md      # Instructions for adding sounds
│   ├── chime.wav      # Sound files (add your own)
│   ├── gong.wav
│   ├── pulse.wav
│   ├── alarm.wav
│   ├── bell.wav
│   └── whistle.wav
└── README.md          # This file
```

## How to Use

### Setting Up Timers

1. **Default Setup**: The app starts with 2 timers
2. **Add More**: Click "+ Add Timer" to create additional timers
3. **Configure Each Timer**:
   - **Start Time**: Set when the timer should trigger (HH:MM format)
   - **Sound**: Choose from available .wav files
   - **Theme**: Select which theme to apply when triggered
4. **Test**: Use the ▶︎ button to test sounds immediately

### Monitoring

- **Start Monitoring**: Click "Start Monitoring" to begin watching for timer triggers
- **Real-time**: The app checks every second for matching times
- **Auto-reset**: Timers reset after triggering to prevent multiple fires
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

## Technical Details

- **Pure Vanilla**: No frameworks, libraries, or dependencies
- **Web Audio API**: Uses modern audio APIs with HTML5 fallback
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

**Timers not triggering?**
- Make sure monitoring is started
- Check that start times are set correctly
- Verify system time matches your expectations

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to:
- Add new themes
- Improve the UI/UX
- Add new features
- Fix bugs
- Create better sound effects

---

**Enjoy your psychedelic party timer! 🎉🌈🎵**

