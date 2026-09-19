import { getLanguageByCode } from '../utils/languages';

class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeakingNow = false;
    this.onStateChangeCallback = null;
    this.currentAudioElement = null;
    this.currentBlobUrl = null;

    if (this.synth) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.addEventListener) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            this.loadVoices();
          });
        }
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  isSupported() {
    return Boolean(this.synth);
  }

  loadVoices() {
    if (!this.synth) return [];
    const v = this.synth.getVoices();
    if (v && v.length > 0) {
      this.voices = v;
    }
    return this.voices;
  }

  getVoices() {
    if ((!this.voices || this.voices.length === 0) && this.synth) {
      this.loadVoices();
    }
    return this.voices || [];
  }

  getVoicesForLanguage(langCode) {
    const lang = getLanguageByCode(langCode);
    const shortCode = (lang?.shortCode || langCode?.split('-')[0] || 'en').toLowerCase();
    const fullCode = (lang?.code || langCode || 'en-US').toLowerCase();

    const allVoices = this.getVoices();
    return allVoices.filter(v => {
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');
      const vName = (v.name || '').toLowerCase();

      // 1. Direct language code matches
      if (vLang === fullCode || vLang.startsWith(shortCode + '-') || vLang === shortCode) {
        return true;
      }

      // 2. Language-specific name / script identifiers
      if (shortCode === 'ta' && (vName.includes('tamil') || vName.includes('தமிழ்') || vName.includes('ta-in') || vName.includes('ta_in'))) {
        return true;
      }
      if (shortCode === 'ar' && (vName.includes('arabic') || vName.includes('العربية') || vName.includes('maged') || vName.includes('tarik') || vName.includes('laila') || vName.includes('salma') || vName.includes('ar-sa') || vName.includes('ar-xa'))) {
        return true;
      }

      return false;
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

    // Non-English languages (Tamil, Arabic, etc.) without an installed system voice must return null
    // so we can seamlessly route to the natural audio stream instead of an English voice failing silently.
    return null;
  }

  getStreamUrlForText(text, langCode = 'en-US') {
    const lang = getLanguageByCode(langCode);
    const shortLang = (lang?.shortCode || langCode?.split('-')[0] || 'en').toLowerCase();
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
      // route directly to natural audio stream
      if (!voice) {
        const streamUrl = this.getStreamUrlForText(text, langCode);
        this.playAudioElement(streamUrl, options, text, langCode).then(resolve);
        return;
      }

      if (!this.synth) {
        const streamUrl = this.getStreamUrlForText(text, langCode);
        this.playAudioElement(streamUrl, options, text, langCode).then(resolve);
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
        await this.playAudioElement(streamUrl, options, text, langCode);
        resolve();
      };

      try {
        this.synth.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis exception, streaming audio instead:', err);
        this.isSpeakingNow = false;
        const streamUrl = this.getStreamUrlForText(text, langCode);
        this.playAudioElement(streamUrl, options, text, langCode).then(resolve);
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
    const shortLang = (lang?.shortCode || langCode?.split('-')[0] || 'en').toLowerCase();
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
      ? (audioPayload.url || this.getStreamUrlForText(text, lang))
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
          await this.playAudioElement(targetUrl, options, text, lang);
        },
      });
    }

    // No native voice installed for this language (e.g. Tamil on Windows)
    // Play fluent, authentic audio stream via our serverless / proxy stream!
    return this.playAudioElement(targetUrl, options, text, lang);
  }

  playAudioElement(srcUrl, options = {}, fallbackText = '', langCode = 'en-US') {
    return new Promise(async (resolve) => {
      // 1. Stop any previous playback
      this.stop();

      if (!srcUrl && !fallbackText) {
        resolve();
        return;
      }

      // Helper to attempt browser SpeechSynthesis fallback if stream fails
      const trySpeechSynthesisFallback = () => {
        if (fallbackText && this.synth && typeof window !== 'undefined') {
          try {
            const utterance = new SpeechSynthesisUtterance(fallbackText);
            const langObj = getLanguageByCode(langCode);
            utterance.lang = langObj?.code || langCode;
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
            };
            utterance.onerror = (e) => {
              console.warn('SpeechSynthesis fallback error:', e);
              this.isSpeakingNow = false;
              if (this.onStateChangeCallback) this.onStateChangeCallback(false);
              if (options.onError) options.onError(e);
            };

            this.synth.speak(utterance);
            return true;
          } catch (e) {
            console.warn('SpeechSynthesis fallback exception:', e);
          }
        }
        return false;
      };

      try {
        // Step 1: Pre-fetch stream with fetch() to ensure 200 OK and get Blob
        let audioBlobUrl = null;
        if (srcUrl) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(srcUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok && (res.headers.get('content-type')?.includes('audio') || res.status === 200)) {
              const blob = await res.blob();
              if (blob.size > 0) {
                audioBlobUrl = URL.createObjectURL(blob);
                this.currentBlobUrl = audioBlobUrl;
              }
            } else {
              console.warn(`TTS fetch responded with status ${res.status}`);
            }
          } catch (fetchErr) {
            console.warn('TTS fetch failed or timed out:', fetchErr);
          }
        }

        const playableSrc = audioBlobUrl || srcUrl;

        // Step 2: If we have a playable source URL
        if (playableSrc) {
          const audio = new Audio();
          this.currentAudioElement = audio;

          audio.onplay = () => {
            this.isSpeakingNow = true;
            if (this.onStateChangeCallback) this.onStateChangeCallback(true);
            if (options.onStart) options.onStart();
          };

          audio.onended = () => {
            this.cleanupAudio();
            if (this.onStateChangeCallback) this.onStateChangeCallback(false);
            if (options.onEnd) options.onEnd();
            resolve();
          };

          audio.onerror = (e) => {
            console.warn('Audio element error:', e);
            this.cleanupAudio();
            if (!trySpeechSynthesisFallback()) {
              if (this.onStateChangeCallback) this.onStateChangeCallback(false);
              if (options.onError) options.onError(e);
            }
            resolve();
          };

          audio.src = playableSrc;
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('Audio play() promise rejected:', err);
              this.cleanupAudio();
              if (!trySpeechSynthesisFallback()) {
                if (this.onStateChangeCallback) this.onStateChangeCallback(false);
                if (options.onError) options.onError(err);
              }
              resolve();
            });
          }
          return;
        }

        // If no playable source, try speech synthesis fallback directly
        if (!trySpeechSynthesisFallback()) {
          this.isSpeakingNow = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
          if (options.onError) options.onError(new Error('Audio playback failed'));
        }
        resolve();
      } catch (err) {
        console.warn('playAudioElement unexpected exception:', err);
        this.cleanupAudio();
        if (!trySpeechSynthesisFallback()) {
          if (this.onStateChangeCallback) this.onStateChangeCallback(false);
          if (options.onError) options.onError(err);
        }
        resolve();
      }
    });
  }

  cleanupAudio() {
    this.isSpeakingNow = false;
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore pause error
      }
      this.currentAudioElement = null;
    }
    if (this.currentBlobUrl) {
      try {
        URL.revokeObjectURL(this.currentBlobUrl);
      } catch {
        // ignore revoke error
      }
      this.currentBlobUrl = null;
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore cancel error
      }
    }
    this.cleanupAudio();
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  onStateChange(cb) {
    this.onStateChangeCallback = cb;
  }
}

export const ttsService = new TTSService();
