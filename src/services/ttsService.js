import { getLanguageByCode } from '../utils/languages';

class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeakingNow = false;
    this.onStateChangeCallback = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  isSupported() {
    return Boolean(this.synth);
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices();
    return this.voices;
  }

  getVoices() {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  getVoicesForLanguage(langCode) {
    const lang = getLanguageByCode(langCode);
    const shortCode = lang.shortCode.toLowerCase();
    const fullCode = lang.code.toLowerCase();

    const allVoices = this.getVoices();
    return allVoices.filter(v => {
      const vLang = v.lang.toLowerCase();
      return vLang === fullCode || vLang.startsWith(shortCode) || vLang.replace('_', '-') === fullCode;
    });
  }

  findBestVoice(langCode, preferredVoiceURI = null) {
    const voices = this.getVoices();
    if (voices.length === 0) return null;

    if (preferredVoiceURI) {
      const match = voices.find(v => v.voiceURI === preferredVoiceURI);
      if (match) return match;
    }

    const langVoices = this.getVoicesForLanguage(langCode);
    if (langVoices.length > 0) {
      // Prioritize natural or default voices if marked
      const defaultVoice = langVoices.find(v => v.default) || langVoices[0];
      return defaultVoice;
    }

    // Fallback: return default voice or first available
    return voices.find(v => v.default) || voices[0];
  }

  speak(text, langCode = 'en-US', options = {}) {
    return new Promise((resolve) => {
      if (!this.synth || !text || !text.trim()) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;

      const voice = this.findBestVoice(langCode, options.voiceURI);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume !== undefined ? options.volume : 1.0;

      utterance.onstart = () => {
        this.isSpeakingNow = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeakingNow = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('TTS playback error:', e);
        this.isSpeakingNow = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (options.onError) options.onError(e);
        resolve();
      };

      try {
        this.synth.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
        this.isSpeakingNow = false;
        resolve();
      }
    });
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore cancel error
      }
    }
    this.isSpeakingNow = false;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  onStateChange(cb) {
    this.onStateChangeCallback = cb;
  }
}

export const ttsService = new TTSService();
