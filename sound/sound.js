/**
 * TRS-80 Color Computer Sound System
 *
 * Emulates the CoCo's sound capabilities:
 * - SOUND command: frequency and duration
 * - PLAY command: music macro language
 *
 * The original CoCo used a 6-bit DAC for sound output.
 * This emulator uses the Web Audio API for modern browsers.
 */

class Sound {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isInitialized = false;
    this.tempo = 120; // Beats per minute
    this.octave = 4;
    this.noteLength = 4; // Quarter note
    this.musicStyle = 'N'; // Normal (vs Legato or Staccato)
    this.volume = 15; // 0-15

    // Note frequencies (A4 = 440Hz)
    this.noteFrequencies = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };

    // CoCo SOUND command uses values 1-255 for frequency
    // Frequency = 1/(2 * (period + 1) * 0.000244)
    // Simplified: maps roughly to 110Hz - 3520Hz
  }

  async init() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  // SOUND command: frequency (1-255), duration (1-255)
  async sound(frequency, duration) {
    if (!this.isInitialized) await this.init();
    if (!this.audioContext) return;

    // Convert CoCo frequency value to Hz
    // CoCo frequency: higher values = higher pitch
    // Approximate mapping: value 1 = ~110Hz, value 255 = ~3520Hz
    const hz = 110 * Math.pow(2, frequency / 36.4);

    // Duration: each unit is approximately 1/60th of a second
    const durationSeconds = duration / 60;

    await this.playTone(hz, durationSeconds);
  }

  // Play a single tone
  async playTone(frequency, duration, waveform = 'square') {
    if (!this.audioContext) return;

    return new Promise((resolve) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Volume envelope
      const vol = (this.volume / 15) * 0.3;
      gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);

      oscillator.onended = resolve;
    });
  }

  // PLAY command - music macro language
  async play(musicString) {
    if (!this.isInitialized) await this.init();
    if (!this.audioContext) return;

    if (typeof musicString !== 'string') return;

    let i = 0;
    const str = musicString.toUpperCase();

    while (i < str.length) {
      const char = str[i];
      i++;

      // Skip whitespace
      if (char === ' ') continue;

      // Read optional number
      const readNumber = () => {
        let numStr = '';
        while (i < str.length && /[0-9]/.test(str[i])) {
          numStr += str[i];
          i++;
        }
        return numStr ? parseInt(numStr) : null;
      };

      // Check for sharp or flat
      const checkAccidental = () => {
        if (i < str.length) {
          if (str[i] === '#' || str[i] === '+') {
            i++;
            return 1;
          } else if (str[i] === '-') {
            i++;
            return -1;
          }
        }
        return 0;
      };

      switch (char) {
        case 'A': case 'B': case 'C': case 'D':
        case 'E': case 'F': case 'G': {
          // Musical note
          const accidental = checkAccidental();
          let noteLength = readNumber() || this.noteLength;
          const dotted = str[i] === '.' ? (i++, true) : false;

          let noteName = char;
          if (accidental === 1) noteName += '#';

          // Get frequency
          let freq = this.noteFrequencies[noteName] || this.noteFrequencies[char];
          if (accidental === -1) freq *= Math.pow(2, -1/12);

          // Adjust for octave
          freq *= Math.pow(2, this.octave - 4);

          // Calculate duration
          let duration = (60 / this.tempo) * (4 / noteLength);
          if (dotted) duration *= 1.5;

          // Apply music style
          let playDuration = duration;
          if (this.musicStyle === 'S') playDuration *= 0.75; // Staccato
          else if (this.musicStyle === 'N') playDuration *= 0.875; // Normal

          await this.playTone(freq, playDuration);

          // Gap between notes (except legato)
          if (this.musicStyle !== 'L') {
            await this.delay((duration - playDuration) * 1000);
          }
          break;
        }

        case 'N': {
          // Play note by number (0-84)
          const noteNum = readNumber();
          if (noteNum !== null && noteNum >= 0 && noteNum <= 84) {
            if (noteNum === 0) {
              // Rest
              const duration = (60 / this.tempo) * (4 / this.noteLength);
              await this.delay(duration * 1000);
            } else {
              // Note number: 1 = C0, 13 = C1, etc.
              const freq = 32.7 * Math.pow(2, (noteNum - 1) / 12);
              const duration = (60 / this.tempo) * (4 / this.noteLength);
              await this.playTone(freq, duration);
            }
          }
          break;
        }

        case 'O': {
          // Set octave (1-6)
          const oct = readNumber();
          if (oct !== null && oct >= 1 && oct <= 6) {
            this.octave = oct;
          }
          break;
        }

        case '>': {
          // Increase octave
          if (this.octave < 6) this.octave++;
          break;
        }

        case '<': {
          // Decrease octave
          if (this.octave > 1) this.octave--;
          break;
        }

        case 'L': {
          // Set note length
          const len = readNumber();
          if (len !== null && len >= 1 && len <= 64) {
            this.noteLength = len;
          }
          break;
        }

        case 'T': {
          // Set tempo
          const tempo = readNumber();
          if (tempo !== null && tempo >= 32 && tempo <= 255) {
            this.tempo = tempo;
          }
          break;
        }

        case 'P': {
          // Pause/Rest
          const pauseLen = readNumber() || this.noteLength;
          const duration = (60 / this.tempo) * (4 / pauseLen);
          await this.delay(duration * 1000);
          break;
        }

        case 'V': {
          // Set volume (0-15)
          const vol = readNumber();
          if (vol !== null && vol >= 0 && vol <= 15) {
            this.volume = vol;
          }
          break;
        }

        case 'M': {
          // Music style
          if (i < str.length) {
            const style = str[i];
            i++;
            if (style === 'N' || style === 'L' || style === 'S') {
              this.musicStyle = style;
            } else if (style === 'F' || style === 'B') {
              // Foreground/Background (we always play in foreground)
            }
          }
          break;
        }

        case 'X': {
          // Execute subcommand string (not fully implemented)
          // Would need variable reference
          break;
        }
      }
    }
  }

  // Helper delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset sound state
  reset() {
    this.tempo = 120;
    this.octave = 4;
    this.noteLength = 4;
    this.musicStyle = 'N';
    this.volume = 15;
  }

  // Beep (simple sound effect)
  async beep() {
    await this.playTone(800, 0.1);
  }

  // Error beep
  async errorBeep() {
    await this.playTone(200, 0.3);
  }

  // Close audio context
  close() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
}

// Node.js compatible version (no-op for sound)
class SoundNode {
  constructor() {
    this.tempo = 120;
    this.octave = 4;
    this.noteLength = 4;
    this.musicStyle = 'N';
    this.volume = 15;
  }

  async init() {}
  async sound(frequency, duration) {
    // In Node.js, just delay for the duration
    await new Promise(resolve => setTimeout(resolve, duration * 16.67));
  }
  async play(musicString) {
    // Parse but don't play in Node.js
    console.log(`PLAY: ${musicString}`);
  }
  reset() {
    this.tempo = 120;
    this.octave = 4;
    this.noteLength = 4;
    this.musicStyle = 'N';
    this.volume = 15;
  }
  async beep() {}
  async errorBeep() {}
  close() {}
}

// Export appropriate class based on environment
const isNode = typeof window === 'undefined';
module.exports = { Sound: isNode ? SoundNode : Sound };
