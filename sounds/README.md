# Sound Files for Wormhole Timer

This folder should contain the .wav sound files referenced in the app.

## Required Sound Files

Add the following .wav files to this folder:

- `chime.wav` - A pleasant chime sound
- `gong.wav` - A deep gong sound
- `pulse.wav` - A pulsing electronic sound
- `alarm.wav` - An alarm/alert sound
- `bell.wav` - A bell sound
- `whistle.wav` - A whistle sound

## Adding New Sounds

To add new sounds:

1. Add your .wav file to this folder
2. Update the `SOUND_MANIFEST` array in `app.js`
3. Add an entry like: `{ id: 'your-sound', label: 'Your Sound', file: 'sounds/your-sound.wav' }`

## Sound File Requirements

- Format: .wav files work best for cross-browser compatibility
- Duration: Keep sounds short (1-3 seconds) for better user experience
- Volume: Normalize volume levels for consistent playback
- Size: Keep files reasonably small for web delivery

## Free Sound Resources

You can find free .wav files at:
- Freesound.org
- Zapsplat.com
- Adobe Audition (free trial)
- Audacity (free audio editor)

## Testing Sounds

Use the ▶︎ Test button in the app to verify your sounds work correctly before setting up timers.

