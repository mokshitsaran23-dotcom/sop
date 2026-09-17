import React, { useRef, useEffect } from 'react';
import { useCall } from '../context/CallContext';
import { useApp } from '../context/AppContext';
import { 
  Mic, 
  Square, 
  PhoneOff, 
  Subtitles, 
  Languages, 
  Sparkles, 
  ArrowRightLeft, 
  Settings, 
  User, 
  CheckCircle2,
  Volume2
} from 'lucide-react';

export default function SpeechToTextCallScreen() {
  const { 
    activeContact, 
    callerLangObj, 
    calleeLangObj, 
    endCall, 
    
    // Independent Captions Toggles
    callerCaptionsEnabled, 
    setCallerCaptionsEnabled,
    calleeCaptionsEnabled, 
    setCalleeCaptionsEnabled,

    // Push-to-Toggle Talk Controls
    callerRecording,
    toggleCallerTalk,
    callerInterimSpeech,

    calleeRecording,
    toggleCalleeTalk,
    calleeInterimSpeech,

    // Destination Captions
    leftPanelCaption,    // Called person's speech routed to You
    rightPanelCaption,   // Your speech routed to Called person

    isTranslating,
  } = useCall();

  const { translationDisplayMode, setTranslationDisplayMode, setIsSettingsOpen } = useApp();
  const leftCaptionRef = useRef(null);
  const rightCaptionRef = useRef(null);

  const isBilingual = callerLangObj.shortCode !== calleeLangObj.shortCode;

  return (
    <div className="flex-1 flex flex-col h-full max-w-7xl mx-auto w-full p-4 sm:p-6 gap-4">
      
      {/* Top Call Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base sm:text-lg">
                Speech-to-Text Live Call
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold">
                Independent Mic & Captions
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Click "Talk" to record & speak • Click again to stop & send your caption to the listener's panel
            </p>
          </div>
        </div>

        {/* Translation Status Badge */}
        <div className="flex items-center gap-2">
          {isBilingual ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-200 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>{callerLangObj.flag} {callerLangObj.name}</span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>{calleeLangObj.flag} {calleeLangObj.name}</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
              Same Language ({callerLangObj.name})
            </div>
          )}

          {isTranslating && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
              Translating caption...
            </span>
          )}
        </div>
      </div>

      {/* Split-Screen Call Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-h-[440px]">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: YOU (CURRENT USER)                           */}
        {/* Has own Talk button + own Captions toggle               */}
        {/* Displays caption received from CALLED PERSON             */}
        {/* ======================================================== */}
        <div className="relative flex flex-col rounded-3xl bg-slate-900/90 border-2 border-slate-800 p-5 sm:p-6 shadow-xl">
          
          {/* Header Row: User Info & Independent Captions Toggle */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md ring-2 ring-white/10">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-white">
                  You (Caller)
                </h2>
                <span className="text-xs font-semibold text-sky-300 flex items-center gap-1">
                  <span>{callerLangObj.flag}</span>
                  <span>Speaks: {callerLangObj.name}</span>
                </span>
              </div>
            </div>

            {/* Independent Captions Toggle for Left Panel */}
            <button
              type="button"
              onClick={() => setCallerCaptionsEnabled(!callerCaptionsEnabled)}
              aria-label={callerCaptionsEnabled ? 'Turn your captions off' : 'Turn your captions on'}
              className={`touch-target-large px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                callerCaptionsEnabled
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 ring-2 ring-sky-500/20'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title="Toggle Captions on Your Panel"
            >
              <Subtitles className="w-4 h-4" />
              <span>Captions {callerCaptionsEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Visual Avatar / Recording Animation Box */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4 min-h-[160px] relative">
            {callerRecording ? (
              <div className="flex flex-col items-center gap-3 w-full text-center">
                {/* Visual sound waveform */}
                <div className="flex items-center gap-1.5 h-12" aria-label="Microphone recording speech">
                  <div className="w-2.5 rounded-full bg-rose-400 wave-bar-1" />
                  <div className="w-2.5 rounded-full bg-amber-400 wave-bar-2" />
                  <div className="w-2.5 rounded-full bg-rose-500 wave-bar-3" />
                  <div className="w-2.5 rounded-full bg-sky-400 wave-bar-4" />
                  <div className="w-2.5 rounded-full bg-rose-400 wave-bar-5" />
                </div>
                <div>
                  <p className="text-sm text-rose-400 font-black uppercase tracking-wider animate-pulse">
                    ● Recording Your Voice (Speaking Now)
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Stop & Send Caption" when done speaking
                  </p>
                </div>

                {/* Live interim transcript preview */}
                {callerInterimSpeech && (
                  <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-500/30 text-xs text-slate-200 italic max-w-sm">
                    "{callerInterimSpeech}"
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-sky-400">
                  <Mic className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-300">
                  Your mic is paused
                </p>
                <p className="text-xs text-slate-500">
                  Tap "Talk" below to speak. Click again to stop and send your caption to {activeContact?.name}.
                </p>
              </div>
            )}
          </div>

          {/* Dedicated "Talk" Push-to-Toggle Button for You */}
          <div className="mb-4">
            <button
              type="button"
              onClick={toggleCallerTalk}
              aria-label={callerRecording ? 'Stop speaking and send caption' : 'Start speaking'}
              className={`touch-target-large w-full py-3.5 px-5 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 ${
                callerRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/30 animate-pulse'
                  : 'bg-sky-500 hover:bg-sky-400 text-white ring-4 ring-sky-500/20'
              }`}
            >
              {callerRecording ? (
                <>
                  <Square className="w-5 h-5 fill-white" aria-hidden="true" />
                  <span>Stop & Send Caption ➔</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" aria-hidden="true" />
                  <span>Talk (Click to Speak)</span>
                </>
              )}
            </button>
          </div>

          {/* LISTENER'S CAPTION BOX ON YOUR SIDE */}
          {/* Displays what the CALLED PERSON said to You */}
          {callerCaptionsEnabled ? (
            <div 
              ref={leftCaptionRef}
              className="p-4 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 shadow-inner" 
              aria-live="polite"
            >
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Subtitles className="w-3.5 h-3.5" />
                  Caption for You (from {activeContact?.name || 'Called Person'})
                </span>
                {leftPanelCaption.time && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {leftPanelCaption.time}
                  </span>
                )}
              </div>

              {leftPanelCaption.text ? (
                <div className="space-y-1 mt-1">
                  {/* If user prefers translated only */}
                  {translationDisplayMode === 'translated_only' && leftPanelCaption.translation ? (
                    <p className="caption-text-scale font-black text-white leading-snug">
                      "{leftPanelCaption.translation}"
                    </p>
                  ) : (
                    <>
                      <p className="caption-text-scale font-extrabold text-white leading-snug">
                        "{leftPanelCaption.translation || leftPanelCaption.text}"
                      </p>
                      {isBilingual && leftPanelCaption.translation && (
                        <p className="text-xs text-emerald-300 font-medium italic border-t border-emerald-900/60 pt-1">
                          Original ({calleeLangObj.name}): "{leftPanelCaption.text}"
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic mt-1">
                  Waiting for {activeContact?.name} to speak... (Their caption will appear here)
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center text-xs text-slate-500">
              Captions turned OFF for your panel
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: CALLED PERSON (e.g. ALEX JOHNSON / SOFIA)  */}
        {/* Has own Talk button + own Captions toggle               */}
        {/* Displays caption received from YOU                       */}
        {/* ======================================================== */}
        <div className="relative flex flex-col rounded-3xl bg-slate-900/90 border-2 border-slate-800 p-5 sm:p-6 shadow-xl">
          
          {/* Header Row: Callee Info & Independent Captions Toggle */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeContact?.avatarColor || 'from-emerald-500 to-teal-600'} flex items-center justify-center text-white font-extrabold shadow-md ring-2 ring-white/10`}>
                {activeContact?.avatar || 'CP'}
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-white">
                  {activeContact?.name || 'Called Person'}
                </h2>
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <span>{calleeLangObj.flag}</span>
                  <span>Speaks: {calleeLangObj.name}</span>
                </span>
              </div>
            </div>

            {/* Independent Captions Toggle for Right Panel */}
            <button
              type="button"
              onClick={() => setCalleeCaptionsEnabled(!calleeCaptionsEnabled)}
              aria-label={calleeCaptionsEnabled ? `Turn ${activeContact?.name}'s captions off` : `Turn ${activeContact?.name}'s captions on`}
              className={`touch-target-large px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                calleeCaptionsEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-2 ring-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title={`Toggle Captions on ${activeContact?.name}'s Panel`}
            >
              <Subtitles className="w-4 h-4" />
              <span>Captions {calleeCaptionsEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Visual Avatar / Recording Animation Box */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4 min-h-[160px] relative">
            {calleeRecording ? (
              <div className="flex flex-col items-center gap-3 w-full text-center">
                {/* Visual sound waveform */}
                <div className="flex items-center gap-1.5 h-12" aria-label="Called person speaking">
                  <div className="w-2.5 rounded-full bg-emerald-400 wave-bar-1" />
                  <div className="w-2.5 rounded-full bg-teal-400 wave-bar-2" />
                  <div className="w-2.5 rounded-full bg-emerald-500 wave-bar-3" />
                  <div className="w-2.5 rounded-full bg-cyan-400 wave-bar-4" />
                  <div className="w-2.5 rounded-full bg-emerald-400 wave-bar-5" />
                </div>
                <div>
                  <p className="text-sm text-emerald-400 font-black uppercase tracking-wider animate-pulse">
                    ● {activeContact?.name} is Speaking Now
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Stop & Send Caption" when done speaking
                  </p>
                </div>

                {/* Live interim transcript preview */}
                {calleeInterimSpeech && (
                  <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs text-slate-200 italic max-w-sm">
                    "{calleeInterimSpeech}"
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <Mic className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-300">
                  {activeContact?.name}'s mic is paused
                </p>
                <p className="text-xs text-slate-500">
                  Tap "Talk" below to record {activeContact?.name}. Click again to stop and send caption to your panel.
                </p>
              </div>
            )}
          </div>

          {/* Dedicated "Talk" Push-to-Toggle Button for Called Person */}
          <div className="mb-4">
            <button
              type="button"
              onClick={toggleCalleeTalk}
              aria-label={calleeRecording ? `Stop ${activeContact?.name}'s speech and send caption` : `Record ${activeContact?.name}'s voice`}
              className={`touch-target-large w-full py-3.5 px-5 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 ${
                calleeRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/30 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/20'
              }`}
            >
              {calleeRecording ? (
                <>
                  <Square className="w-5 h-5 fill-white" aria-hidden="true" />
                  <span>Stop & Send Caption ➔</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" aria-hidden="true" />
                  <span>Talk (Record {activeContact?.name?.split(' ')[0] || 'Peer'})</span>
                </>
              )}
            </button>
          </div>

          {/* LISTENER'S CAPTION BOX ON CALLED PERSON'S SIDE */}
          {/* Displays what YOU said to the Called Person */}
          {calleeCaptionsEnabled ? (
            <div 
              ref={rightCaptionRef}
              className="p-4 rounded-2xl bg-slate-950 border-2 border-sky-500/40 shadow-inner" 
              aria-live="polite"
            >
              <div className="text-xs font-black uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Subtitles className="w-3.5 h-3.5" />
                  Caption for {activeContact?.name} (from You)
                </span>
                {rightPanelCaption.time && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {rightPanelCaption.time}
                  </span>
                )}
              </div>

              {rightPanelCaption.text ? (
                <div className="space-y-1 mt-1">
                  {/* If user prefers translated only */}
                  {translationDisplayMode === 'translated_only' && rightPanelCaption.translation ? (
                    <p className="caption-text-scale font-black text-white leading-snug">
                      "{rightPanelCaption.translation}"
                    </p>
                  ) : (
                    <>
                      <p className="caption-text-scale font-extrabold text-white leading-snug">
                        "{rightPanelCaption.translation || rightPanelCaption.text}"
                      </p>
                      {isBilingual && rightPanelCaption.translation && (
                        <p className="text-xs text-sky-300 font-medium italic border-t border-sky-900/60 pt-1">
                          Original ({callerLangObj.name}): "{rightPanelCaption.text}"
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic mt-1">
                  Waiting for You to speak... (Your caption will appear here for {activeContact?.name})
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center text-xs text-slate-500">
              Captions turned OFF for {activeContact?.name}'s panel
            </div>
          )}

        </div>

      </div>

      {/* Floating Bottom Control Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Flow: Push "Talk" to record ➔ Click again to send caption to listener
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Translation Format Toggle */}
          {isBilingual && (
            <button
              type="button"
              onClick={() => setTranslationDisplayMode(prev => prev === 'both' ? 'translated_only' : 'both')}
              className="touch-target-large px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
              title="Toggle between bilingual and translated-only view"
            >
              <Languages className="w-4 h-4 text-sky-400" />
              <span>Format: {translationDisplayMode === 'both' ? 'Both' : 'Translated Only'}</span>
            </button>
          )}

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="touch-target-large p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* End Call */}
          <button
            type="button"
            onClick={endCall}
            aria-label="End call and return to home"
            className="touch-target-large px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-rose-600/30 transition-all active:scale-95"
          >
            <PhoneOff className="w-4 h-4" aria-hidden="true" />
            <span>End Call</span>
          </button>
        </div>

      </div>

    </div>
  );
}
