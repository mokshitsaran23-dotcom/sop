import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from './AppContext';
import { getLanguageByCode } from '../utils/languages';
import { sttService } from '../services/sttService';
import { ttsService } from '../services/ttsService';
import { translationService } from '../services/translationService';
import { webrtcService } from '../services/webrtcService';
import { soundEffects } from '../services/soundEffects';

const CallContext = createContext(null);

export function CallProvider({ children }) {
  const { userLanguage, captionsEnabled, translationDisplayMode, dailyRoomUrl } = useApp();

  // Call status: 'idle' | 'pre_call_confirm' | 'connecting' | 'connected' | 'ended'
  const [callStatus, setCallStatus] = useState('idle');

  // Call mode: 'stt' (Speech-to-Text) or 'tts' (Text-to-Speech)
  const [callMode, setCallMode] = useState(null);

  // Selected contact
  const [activeContact, setActiveContact] = useState(null);

  // Confirmed call languages
  const [callerLanguage, setCallerLanguage] = useState(userLanguage);
  const [calleeLanguage, setCalleeLanguage] = useState('es-ES');

  // INDEPENDENT Captions visibility for each panel
  // Left Panel (You): receives called person's captions
  const [callerCaptionsEnabled, setCallerCaptionsEnabled] = useState(true);
  // Right Panel (Called Person): receives your captions
  const [calleeCaptionsEnabled, setCalleeCaptionsEnabled] = useState(true);

  // PUSH-TO-TOGGLE Recording States for each side
  const [callerRecording, setCallerRecording] = useState(false);
  const [calleeRecording, setCalleeRecording] = useState(false);
  const [callerInterimSpeech, setCallerInterimSpeech] = useState('');
  const [calleeInterimSpeech, setCalleeInterimSpeech] = useState('');

  // Audio meters
  const [callerSoundLevel, setCallerSoundLevel] = useState(0);
  const [calleeSoundLevel, setCalleeSoundLevel] = useState(0);

  // DESTINATION CAPTIONS:
  // leftPanelCaption: displays what the Called Person spoke (shown on Left panel for You to read)
  const [leftPanelCaption, setLeftPanelCaption] = useState({ text: '', translation: '', isFinal: true });
  // rightPanelCaption: displays what You spoke (shown on Right panel for Called Person to read)
  const [rightPanelCaption, setRightPanelCaption] = useState({ text: '', translation: '', isFinal: true });

  // History logs
  const [leftPanelHistory, setLeftPanelHistory] = useState([]);
  const [rightPanelHistory, setRightPanelHistory] = useState([]);

  // TTS messages history (for TTS mode)
  const [ttsMessages, setTtsMessages] = useState([]);

  // Status flags
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [calleeSimulationIdx, setCalleeSimulationIdx] = useState(0);

  // Temporary buffer ref for recording session
  const activeTranscriptRef = useRef('');

  // Initialize caption toggles from global preference on load
  useEffect(() => {
    setCallerCaptionsEnabled(captionsEnabled);
    setCalleeCaptionsEnabled(captionsEnabled);
  }, [captionsEnabled]);

  // Keep caller language in sync when global user language changes while idle
  useEffect(() => {
    if (callStatus === 'idle') {
      setCallerLanguage(userLanguage);
    }
  }, [userLanguage, callStatus]);

  // Listen for TTS speech state
  useEffect(() => {
    ttsService.onStateChange((speaking) => {
      setIsSpeakingTTS(speaking);
    });
  }, []);

  // Step 1: Initiate call flow
  const initiateCall = (mode, contact) => {
    setCallMode(mode);
    setActiveContact(contact);
    setCallerLanguage(userLanguage);
    setCalleeLanguage(contact?.language || 'es-ES');
    setCallStatus('pre_call_confirm');
  };

  const cancelPreCall = () => {
    setCallStatus('idle');
    setActiveContact(null);
    setCallMode(null);
  };

  // Step 2: Start call
  const startCall = async () => {
    setCallStatus('connecting');
    setLeftPanelCaption({ text: '', translation: '', isFinal: true });
    setRightPanelCaption({ text: '', translation: '', isFinal: true });
    setLeftPanelHistory([]);
    setRightPanelHistory([]);
    setTtsMessages([]);
    setCallerRecording(false);
    setCalleeRecording(false);
    setCallerInterimSpeech('');
    setCalleeInterimSpeech('');
    setCalleeSimulationIdx(0);

    const roomId = activeContact?.id ? `room_${activeContact.id}` : 'room_general';

    // Initialize WebRTC peer channel
    webrtcService.initPeerChannel(roomId, async (remoteData) => {
      if (remoteData.type === 'caller_speech_final') {
        // Remote peer (if other tab was caller)
        setRightPanelCaption(remoteData.payload);
      } else if (remoteData.type === 'callee_speech_final') {
        // Remote peer (if other tab was callee)
        setLeftPanelCaption(remoteData.payload);
      } else if (remoteData.type === 'tts_message') {
        soundEffects.playMessageSent();
        setTtsMessages(prev => [...prev, remoteData.payload]);
      }
    });

    if (dailyRoomUrl) {
      await webrtcService.createDailyCallObject(dailyRoomUrl);
    }

    setTimeout(() => {
      setCallStatus('connected');
      soundEffects.playCallConnected();
    }, 600);
  };

  // ==========================================
  // LEFT PANEL (YOU) TALK BUTTON (PUSH-TO-TOGGLE)
  // First click: start recording
  // Second click: stop recording -> caption routes to RIGHT PANEL (Called Person)
  // ==========================================
  const toggleCallerTalk = async () => {
    if (!callerRecording) {
      // START RECORDING
      if (calleeRecording) {
        await toggleCalleeTalk(); // Stop other side if active
      }

      setCallerRecording(true);
      setCallerInterimSpeech('');
      activeTranscriptRef.current = '';
      soundEffects.playMicOn();

      sttService.setLanguage(callerLanguage);
      sttService.start(
        ({ final, interim, activeText }) => {
          const currentText = activeText || final || interim || '';
          activeTranscriptRef.current = currentText;
          setCallerInterimSpeech(currentText);
        },
        (err) => console.warn('Caller STT Error:', err),
        (listening) => {
          if (!listening && callerRecording) {
            // stopped
          }
        }
      );

      sttService.startMicLevelMeter((level) => {
        setCallerSoundLevel(level);
      });

    } else {
      // STOP RECORDING -> Send finalized caption to RIGHT PANEL (Called Person's side)
      soundEffects.playMicOff();
      setCallerRecording(false);
      setCallerSoundLevel(0);
      const spokenRaw = sttService.stop() || activeTranscriptRef.current;
      setCallerInterimSpeech('');

      // Fallback text if user clicked without microphone audio input
      const spokenText = spokenRaw.trim() || 'Hello, I can hear you loud and clear!';

      setIsTranslating(true);
      let translatedText = spokenText;
      if (callerLanguage !== calleeLanguage) {
        translatedText = await translationService.translateText(
          spokenText,
          callerLanguage,
          calleeLanguage
        );
      }
      setIsTranslating(false);

      const captionPayload = {
        id: Date.now() + Math.random(),
        speaker: 'You',
        text: spokenText,
        translation: translatedText,
        srcLang: callerLanguage,
        destLang: calleeLanguage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Display caption in Alex Johnson's / Called Person's listener box (Right Panel)
      setRightPanelCaption(captionPayload);
      setRightPanelHistory(prev => [...prev.slice(-30), captionPayload]);
      soundEffects.playCaptionReceived();

      // Broadcast to peer
      webrtcService.sendPeerData('caller_speech_final', captionPayload);
    }
  };

  // ==========================================
  // RIGHT PANEL (CALLED PERSON) TALK BUTTON (PUSH-TO-TOGGLE)
  // First click: start recording
  // Second click: stop recording -> caption routes to LEFT PANEL (You)
  // ==========================================
  const toggleCalleeTalk = async () => {
    if (!calleeRecording) {
      // START RECORDING FOR CALLEE
      if (callerRecording) {
        await toggleCallerTalk(); // Stop other side if active
      }

      setCalleeRecording(true);
      setCalleeInterimSpeech('');
      activeTranscriptRef.current = '';
      soundEffects.playMicOn();

      // If contact has simulated responses, select next response as preview or live mic
      let defaultSim = '';
      if (activeContact?.simulationResponses?.length > 0) {
        defaultSim = activeContact.simulationResponses[calleeSimulationIdx % activeContact.simulationResponses.length];
      } else {
        defaultSim = 'I am doing great, thank you for checking in!';
      }

      sttService.setLanguage(calleeLanguage);
      sttService.start(
        ({ final, interim, activeText }) => {
          const currentText = activeText || final || interim || '';
          activeTranscriptRef.current = currentText;
          setCalleeInterimSpeech(currentText);
        },
        (err) => console.warn('Callee STT Error:', err),
        () => {}
      );

      // Set fallback simulation in case mic is not spoken into
      activeTranscriptRef.current = defaultSim;
      setCalleeInterimSpeech(defaultSim);

      sttService.startMicLevelMeter((level) => {
        setCalleeSoundLevel(level);
      });

    } else {
      // STOP RECORDING -> Send finalized caption to LEFT PANEL (Your side)
      soundEffects.playMicOff();
      setCalleeRecording(false);
      setCalleeSoundLevel(0);
      const spokenRaw = sttService.stop() || activeTranscriptRef.current;
      setCalleeInterimSpeech('');

      let defaultSim = 'Yes, everything is working smoothly!';
      if (activeContact?.simulationResponses?.length > 0) {
        defaultSim = activeContact.simulationResponses[calleeSimulationIdx % activeContact.simulationResponses.length];
      }
      setCalleeSimulationIdx(prev => prev + 1);

      const spokenText = spokenRaw.trim() || defaultSim;

      setIsTranslating(true);
      let translatedText = spokenText;
      if (calleeLanguage !== callerLanguage) {
        translatedText = await translationService.translateText(
          spokenText,
          calleeLanguage,
          callerLanguage
        );
      }
      setIsTranslating(false);

      const captionPayload = {
        id: Date.now() + Math.random(),
        speaker: activeContact?.name || 'Contact',
        text: spokenText,
        translation: translatedText,
        srcLang: calleeLanguage,
        destLang: callerLanguage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Display caption in Your listener box (Left Panel)
      setLeftPanelCaption(captionPayload);
      setLeftPanelHistory(prev => [...prev.slice(-30), captionPayload]);
      soundEffects.playCaptionReceived();

      // Broadcast to peer
      webrtcService.sendPeerData('callee_speech_final', captionPayload);

      // In TTS mode, also speak reply aloud
      if (callMode === 'tts') {
        ttsService.speak(translatedText, callerLanguage);
      }
    }
  };

  // In TTS Mode: send typed message -> routes to Right Panel (Called Person)
  const sendTTSMessage = async (typedText) => {
    if (!typedText || !typedText.trim()) return;

    soundEffects.playMessageSent();
    setIsTranslating(true);

    let translatedForCallee = typedText;
    if (callerLanguage !== calleeLanguage) {
      translatedForCallee = await translationService.translateText(
        typedText,
        callerLanguage,
        calleeLanguage
      );
    }
    setIsTranslating(false);

    const messageObj = {
      id: Date.now(),
      sender: 'user',
      originalText: typedText,
      translatedText: translatedForCallee,
      spokenLang: calleeLanguage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTtsMessages(prev => [...prev, messageObj]);

    // Destination: display in Right Panel caption box as what You spoke
    const captionPayload = {
      id: Date.now(),
      speaker: 'You',
      text: typedText,
      translation: translatedForCallee,
      srcLang: callerLanguage,
      destLang: calleeLanguage,
      time: messageObj.time,
    };
    setRightPanelCaption(captionPayload);
    setRightPanelHistory(prev => [...prev.slice(-30), captionPayload]);

    // Speak aloud in callee's language
    await ttsService.speak(translatedForCallee, calleeLanguage);

    // Broadcast message to remote peer
    webrtcService.sendPeerData('tts_message', messageObj);
  };

  // End Call
  const endCall = async () => {
    soundEffects.playCallEnded();
    sttService.stop();
    ttsService.stop();
    await webrtcService.leaveCall();
    setCallerRecording(false);
    setCalleeRecording(false);
    setCallerSoundLevel(0);
    setCalleeSoundLevel(0);
    setCallStatus('idle');
    setActiveContact(null);
  };

  return (
    <CallContext.Provider
      value={{
        callStatus,
        callMode,
        activeContact,
        callerLanguage,
        setCallerLanguage,
        calleeLanguage,
        setCalleeLanguage,
        callerLangObj: getLanguageByCode(callerLanguage),
        calleeLangObj: getLanguageByCode(calleeLanguage),
        initiateCall,
        cancelPreCall,
        startCall,
        endCall,
        
        // Independent Captions Toggles
        callerCaptionsEnabled,
        setCallerCaptionsEnabled,
        calleeCaptionsEnabled,
        setCalleeCaptionsEnabled,

        // Push-to-Toggle Talk Controls & Status
        callerRecording,
        toggleCallerTalk,
        callerInterimSpeech,
        callerSoundLevel,

        calleeRecording,
        toggleCalleeTalk,
        calleeInterimSpeech,
        calleeSoundLevel,

        // Destination Captions & Histories
        leftPanelCaption,    // displayed on Left side (You read called person's speech)
        rightPanelCaption,   // displayed on Right side (Called person reads your speech)
        leftPanelHistory,
        rightPanelHistory,

        // TTS mode data
        ttsMessages,
        sendTTSMessage,
        isSpeakingTTS,
        isTranslating,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
}
