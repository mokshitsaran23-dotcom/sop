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

  hasVoiceForLanguage(langCode) {
    const langVoices = this.getVoicesForLanguage(langCode);
    return langVoices.length > 0;
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
      const defaultVoice = langVoices.find(v => v.default) || langVoices[0];
      return defaultVoice;
    }

    // Only fall back to system default voice if the language is English
    const lang = getLanguageByCode(langCode);
    if (lang?.shortCode === 'en') {
      return voices.find(v => v.default) || voices[0];
    }

    // Non-English languages (Tamil, Hindi, etc.) without an installed system voice must return null
    // so we can seamlessly route to the natural audio stream instead of an English voice failing silently.
    return null;
  }

  getStreamUrlForText(text, langCode = 'en-US') {
    const lang = getLanguageByCode(langCode);
    const shortLang = lang?.shortCode || 'en';
    return `/api/tts?tl=${encodeURIComponent(shortLang)}&q=${encodeURIComponent(text.trim())}`;
  }

  speak(text, langCode = 'en-US', options = {}) {
    return new Promise((resolve) => {
      if (!text || !text.trim()) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.stop();

      const voice = this.findBestVoice(langCode, options.voiceURI);

      // If no suitable native voice exists for this language (e.g. Tamil on Windows),
      // do NOT assign an English voice that goes mute! Route directly to natural audio stream!
      if (!voice) {
        const streamUrl = this.getStreamUrlForText(text, langCode);
        this.playAudioElement(streamUrl, options).then(resolve);
        return;
      }

      if (!this.synth) {
        const streamUrl = this.getStreamUrlForText(text, langCode);
        this.playAudioElement(streamUrl, options).then(resolve);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice.lang || langCode;
      utterance.voice = voice;
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

      utterance.onerror = async (e) => {
        console.warn('SpeechSynthesis error, falling back to audio stream:', e);
        this.isSpeakingNow = false;
        const streamUrl = this.getStreamUrlForText(text, langCode);
        await this.playAudioElement(streamUrl, options);
        resolve();
      };

      try {
        this.synth.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis exception, streaming audio instead:', err);
        this.isSpeakingNow = false;
        const streamUrl = this.getStreamUrlForText(text, langCode);
        this.playAudioElement(streamUrl, options).then(resolve);
      }
    });
  }

  // Generate a standalone playable audio payload for low-latency delivery
  async generateAudioPayload(text, langCode = 'en-US', options = {}) {
    if (!text || !text.trim()) {
      return {
        url: '',
        streamUrl: '',
        dataUri: '',
        text: '',
        lang: langCode,
        timestamp: Date.now(),
        duration: 0,
      };
    }

    const trimmed = text.trim();
    const lang = getLanguageByCode(langCode);
    const shortLang = lang?.shortCode || 'en';
    const bestVoice = this.findBestVoice(langCode, options.voiceURI);

    // Fast streaming TTS audio URL via local proxy and Google TTS fallback
    const proxyUrl = `/api/tts?tl=${encodeURIComponent(shortLang)}&q=${encodeURIComponent(trimmed)}`;
    const directGoogleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(shortLang)}&q=${encodeURIComponent(trimmed)}`;

    // Estimate duration based on word count (~150 words per min)
    const wordCount = trimmed.split(/\s+/).length;
    const estimatedDuration = Math.max(1.2, Math.round((wordCount / 2.5) * 10) / 10);

    // Local offline carrier WAV data URI fallback
    const offlineDataUri = this.createLocalWavDataUri(estimatedDuration);

    const payload = {
      url: proxyUrl,
      streamUrl: directGoogleUrl,
      dataUri: offlineDataUri,
      text: trimmed,
      lang: langCode,
      hasNativeVoice: Boolean(bestVoice),
      voiceURI: bestVoice?.voiceURI || '',
      voiceName: bestVoice?.name || '',
      rate: options.rate || 1.0,
      pitch: options.pitch || 1.0,
      duration: estimatedDuration,
      timestamp: Date.now(),
    };

    return payload;
  }

  // Create an offline PCM WAV audio data URI carrier
  createLocalWavDataUri(duration = 1.0, freq = 480) {
    try {
      const sampleRate = 8000;
      const numSamples = Math.floor(sampleRate * Math.min(duration, 3.0));
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      const writeString = (offset, str) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + numSamples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, numSamples * 2, true);

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const env = Math.sin((Math.PI * i) / numSamples);
        const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.15;
        view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }

      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return 'data:audio/wav;base64,' + btoa(binary);
    } catch {
      return '';
    }
  }

  // Play audio payload with streaming low-latency priority
  async playAudioPayload(audioPayload, options = {}) {
    if (!audioPayload) return;

    const text = typeof audioPayload === 'object' ? audioPayload.text : String(audioPayload);
    const lang = typeof audioPayload === 'object' ? (audioPayload.lang || 'en-US') : (options.lang || 'en-US');
    const voiceURI = typeof audioPayload === 'object' ? audioPayload.voiceURI : options.voiceURI;
    const targetUrl = typeof audioPayload === 'object' 
      ? (audioPayload.url || audioPayload.streamUrl || this.getStreamUrlForText(text, lang))
      : this.getStreamUrlForText(text, lang);

    if (!text || !text.trim()) return;

    // Check if the browser actually has a native voice installed for this language
    const hasNativeVoice = this.hasVoiceForLanguage(lang);

    if (hasNativeVoice && this.isSupported()) {
      return this.speak(text, lang, {
        voiceURI: voiceURI || options.voiceURI,
        rate: options.rate || (typeof audioPayload === 'object' ? audioPayload.rate : 1.0),
        pitch: options.pitch || (typeof audioPayload === 'object' ? audioPayload.pitch : 1.0),
        onStart: options.onStart,
        onEnd: options.onEnd,
        onError: async (err) => {
          console.warn('SpeechSynthesis error, falling back to audio stream:', err);
          await this.playAudioElement(targetUrl, options);
        },
      });
    }

    // No native voice installed for this language (e.g. Tamil on Windows)
    // Play fluent, authentic audio stream via our proxy / Google TTS stream!
    return this.playAudioElement(targetUrl, options);
  }

  playAudioElement(srcUrl, options = {}) {
    return new Promise((resolve) => {
      if (!srcUrl) {
        resolve();
        return;
      }

      // Stop any existing audio
      this.stop();

      try {
        const audio = new Audio();
        this.currentAudioElement = audio;

        audio.onplay = () => {
          this.isSpeakingNow = true;
          if (this.onStateChangeCallback) this.onStateChangeCallback(true);
          if (options.onStart) options.onStart();
        };

        audio.onended = () => {
          this.isSpeakingNow = false;
          this.currentAudioElement = null;
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
          if (options.onEnd) options.onEnd();
          resolve();
        };

        audio.onerror = (e) => {
          console.warn('Audio stream playback error:', e);
          this.isSpeakingNow = false;
          this.currentAudioElement = null;
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
          if (options.onError) options.onError(e);
          resolve();
        };

        audio.src = srcUrl;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio playback error on audio element:', err);
            this.isSpeakingNow = false;
            this.currentAudioElement = null;
            if (this.onStateChangeCallback) this.onStateChangeCallback(false);
            if (options.onError) options.onError(err);
            resolve();
          });
        }
      } catch (err) {
        console.warn('HTML Audio instantiation error:', err);
        this.isSpeakingNow = false;
        this.currentAudioElement = null;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
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
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }
    this.isSpeakingNow = false;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  onStateChange(cb) {
    this.onStateChangeCallback = cb;
  }
}

export const ttsService = new TTSService();
