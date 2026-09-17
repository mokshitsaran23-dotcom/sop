// Zero-asset Web Audio API chime generator for accessibility cues
class SoundEffectsService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val) {
    this.enabled = val;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  // Chime when call is answered / connected
  playCallConnected() {
    this.init();
    setTimeout(() => this.playTone(523.25, 'sine', 0.12, 0.08), 0);   // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.08), 120); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.1), 240);  // G5
  }

  // Chime when call ends
  playCallEnded() {
    this.init();
    setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.08), 0);
    setTimeout(() => this.playTone(493.88, 'sine', 0.2, 0.08), 120);
  }

  // Gentle pop when typed TTS message is sent
  playMessageSent() {
    this.playTone(880, 'triangle', 0.08, 0.05);
  }

  // Soft ping when a new remote caption or reply arrives
  playCaptionReceived() {
    this.playTone(698.46, 'sine', 0.1, 0.04);
  }

  // Mic activated beep
  playMicOn() {
    this.playTone(740, 'sine', 0.09, 0.06);
  }

  // Mic deactivated beep
  playMicOff() {
    this.playTone(440, 'sine', 0.09, 0.06);
  }
}

export const soundEffects = new SoundEffectsService();
