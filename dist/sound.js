// Simple sound system using Web Audio API
// Generates procedural sound effects for better gameplay feedback

export class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.init();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // Create a simple beep sound
  createBeep(frequency = 440, duration = 0.1, volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Player movement sound
  playMoveSound() {
    this.createBeep(660, 0.1, 0.2);
  }

  // Game over sound
  playGameOverSound() {
    // Descending tone sequence
    this.createBeep(440, 0.2, 0.3);
    setTimeout(() => this.createBeep(330, 0.2, 0.3), 200);
    setTimeout(() => this.createBeep(220, 0.4, 0.3), 400);
  }

  // Score increase sound
  playScoreSound() {
    this.createBeep(880, 0.15, 0.2);
  }

  // Pause sound
  playPauseSound() {
    this.createBeep(520, 0.1, 0.2);
  }
}

// Create a global sound system instance
export const soundSystem = new SoundSystem();