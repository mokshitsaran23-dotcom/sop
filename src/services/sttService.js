// Real-time Speech-to-Text service wrapping Web Speech API with fallback simulation
class STTService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'en-US';
    this.currentSessionTranscript = '';
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStatusChangeCallback = null;
    this.audioContext = null;
    this.analyser = null;
    this.microphoneStream = null;
    this.soundLevelCallback = null;
    this.animFrameId = null;

    this.initRecognition();
  }

  isSupported() {
    return typeof window !== 'undefined' && 
      (window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined);
  }

  initRecognition() {
    if (!this.isSupported()) return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (finalTranscript) {
        this.currentSessionTranscript = (this.currentSessionTranscript + ' ' + finalTranscript).trim();
      }

      const activeText = (this.currentSessionTranscript + ' ' + interimTranscript).trim();

      if (this.onTranscriptCallback) {
        this.onTranscriptCallback({
          final: this.currentSessionTranscript,
          interim: interimTranscript.trim(),
          activeText: activeText,
          isFinal: finalTranscript.length > 0,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('STT Error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch {
          this.isListening = false;
          if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
        }
      } else {
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
      }
    };
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode;
    if (this.recognition) {
      const wasListening = this.isListening;
      if (wasListening) this.stop();
      this.recognition.lang = langCode;
      if (wasListening) this.start();
    }
  }

  start(onTranscript, onError, onStatusChange) {
    this.currentSessionTranscript = '';
    if (onTranscript) this.onTranscriptCallback = onTranscript;
    if (onError) this.onErrorCallback = onError;
    if (onStatusChange) this.onStatusChangeCallback = onStatusChange;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (this.recognition) {
      try {
        this.recognition.lang = this.currentLanguage;
        this.recognition.start();
        this.isListening = true;
        if (this.onStatusChangeCallback) this.onStatusChangeCallback(true);
        this.startMicLevelMeter();
      } catch (e) {
        console.warn('Could not start STT:', e);
      }
    } else {
      this.isListening = true;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback(true);
    }
  }

  stop() {
    this.isListening = false;
    const finalResult = this.currentSessionTranscript.trim();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping STT:', e);
      }
    }
    this.stopMicLevelMeter();
    if (this.onStatusChangeCallback) this.onStatusChangeCallback(false);
    return finalResult;
  }

  getCurrentSessionTranscript() {
    return this.currentSessionTranscript.trim();
  }

  // Audio level meter to power visual waveform
  async startMicLevelMeter(onLevel) {
    if (onLevel) this.soundLevelCallback = onLevel;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.microphoneStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const checkLevel = () => {
          if (!this.isListening) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          if (this.soundLevelCallback) {
            this.soundLevelCallback(normalized);
          }
          this.animFrameId = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      }
    } catch {
      // Mic meter fallback
    }
  }

  stopMicLevelMeter() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(t => t.stop());
      this.microphoneStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.soundLevelCallback) this.soundLevelCallback(0);
  }

  // Simulation method for automated tests or browsers without Web Speech
  simulateSpeech(text, isFinal = true) {
    if (isFinal) {
      this.currentSessionTranscript = text;
    }
    if (this.onTranscriptCallback) {
      this.onTranscriptCallback({
        final: isFinal ? text : '',
        interim: isFinal ? '' : text,
        activeText: text,
        isFinal,
      });
    }
  }
}

export const sttService = new STTService();
