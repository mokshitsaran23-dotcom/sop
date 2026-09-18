import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';
import { ttsService } from '../services/ttsService';
import {
  X,
  Settings,
  Type,
  SunMoon,
  Subtitles,
  Languages,
  Volume2,
  Play,
  Check,
  Sliders,
  Radio
} from 'lucide-react';

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    userLanguage,
    setUserLanguage,
    textScale,
    setTextScale,
    contrastMode,
    setContrastMode,
    captionsEnabled,
    setCaptionsEnabled,
    translationDisplayMode,
    setTranslationDisplayMode,
    voiceWithCaptions,
    setVoiceWithCaptions,
    soundEnabled,
    setSoundEnabled,
    dailyRoomUrl,
    setDailyRoomUrl
  } = useApp();

  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    const voices = ttsService.getVoices();
    setAvailableVoices(voices);
  }, [isSettingsOpen, userLanguage]);

  if (!isSettingsOpen) return null;

  const currentLangObj = getLanguageByCode(userLanguage);
  const languageVoices = ttsService.getVoicesForLanguage(userLanguage);

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    const testText = currentLangObj.phrases.hello + ' ' + currentLangObj.phrases.how_are_you;
    await ttsService.speak(testText, userLanguage, {
      voiceURI: selectedVoiceURI,
      rate: speechRate,
      pitch: speechPitch
    });
    setIsTestingVoice(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Settings className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="settings-title" className="text-2xl font-black text-white">
                Application Settings
              </h2>
              <p className="text-xs text-slate-400">
                Customize accessibility, voice synthesis, captions, and calling
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            aria-label="Close settings"
            className="touch-target-large p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section 1: Visual Accessibility */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4" />
              Visual Accessibility & Sizing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Text Sizing */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <label className="block text-sm font-bold text-white mb-2">
                  Text Scale Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', label: '100% (Normal)' },
                    { id: 'large', label: '125% (Large)' },
                    { id: 'xlarge', label: '150% (Extra)' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTextScale(opt.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${textScale === opt.id
                          ? 'bg-sky-500 text-white border-sky-400 ring-2 ring-sky-400/20'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* High Contrast Theme */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <label className="block text-sm font-bold text-white mb-2">
                  Contrast Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'high-contrast-yellow', label: 'Yellow/Black' },
                    { id: 'high-contrast-dark', label: 'Onyx Dark' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setContrastMode(opt.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${contrastMode === opt.id
                          ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400/30'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Captions & Translation Display */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Subtitles className="w-4 h-4" />
              Live Captions & Translation Display
            </h3>

            <div className="space-y-3">
              {/* Captions Default On/Off */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <div>
                  <div className="font-bold text-white text-sm">
                    Show Live Captions on Calls
                  </div>
                  <div className="text-xs text-slate-400">
                    Display real-time subtitles under both speakers
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCaptionsEnabled(!captionsEnabled)}
                  aria-label="Toggle captions default setting"
                  className={`touch-target-large relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${captionsEnabled ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${captionsEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              {/* Translation Display Format */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <label className="block text-sm font-bold text-white mb-2">
                  Translation Format in Captions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTranslationDisplayMode('both')}
                    className={`p-3 rounded-xl text-left border transition-all ${translationDisplayMode === 'both'
                        ? 'bg-sky-950/60 border-sky-400 text-white ring-2 ring-sky-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>Side-by-Side (Both)</span>
                      {translationDisplayMode === 'both' && <Check className="w-4 h-4 text-sky-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Shows original foreign speech + translated caption together
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTranslationDisplayMode('translated_only')}
                    className={`p-3 rounded-xl text-left border transition-all ${translationDisplayMode === 'translated_only'
                        ? 'bg-sky-950/60 border-sky-400 text-white ring-2 ring-sky-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>Translated Only</span>
                      {translationDisplayMode === 'translated_only' && <Check className="w-4 h-4 text-sky-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Replaces foreign text and shows only your preferred language
                    </p>
                  </button>
                </div>
              </div>

              {/* Voice Audio when Captions are ON */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
                <label className="block text-sm font-bold text-white mb-1">
                  Voice Audio when Captions are ON
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Choose how voice behaves when captions are visible. Note: when captions are turned OFF, voice audio always auto-plays automatically.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVoiceWithCaptions('muted')}
                    className={`p-3 rounded-xl text-left border transition-all ${voiceWithCaptions === 'muted'
                        ? 'bg-emerald-950/60 border-emerald-400 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>Muted (Click to Play)</span>
                      {voiceWithCaptions === 'muted' && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Read captions silently; tap "Play Voice" button on any message to hear it aloud.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoiceWithCaptions('auto_play')}
                    className={`p-3 rounded-xl text-left border transition-all ${voiceWithCaptions === 'auto_play'
                        ? 'bg-emerald-950/60 border-emerald-400 text-white ring-2 ring-emerald-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                      }`}
                  >
                    <div className="font-bold text-sm flex items-center justify-between">
                      <span>Auto-Play Voice Always</span>
                      {voiceWithCaptions === 'auto_play' && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Always speak messages aloud as synthesized voice simultaneously with captions.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Text-to-Speech Voice & Audio */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Speech Synthesis (TTS) Voice
            </h3>

            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-4">
              <div>
                <label htmlFor="voice-select" className="block text-sm font-bold text-white mb-1.5">
                  Voice for {currentLangObj.name} ({languageVoices.length} available)
                </label>
                <select
                  id="voice-select"
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  <option value="">Default System Natural Voice</option>
                  {languageVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sliders for Rate & Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Speech Rate (Speed)</span>
                    <span>{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>Speech Pitch</span>
                    <span>{speechPitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>

              {/* Test Voice Button */}
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="touch-target-large px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-sm flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>{isTestingVoice ? 'Speaking Sample...' : 'Test Sample Voice'}</span>
              </button>
            </div>
          </div>

          {/* Section 4: WebRTC & Daily.co Configuration */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Daily.co WebRTC Calling Configuration
            </h3>

            <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700">
              <label htmlFor="daily-url" className="block text-sm font-bold text-white mb-1">
                Custom Daily.co Room URL (Optional)
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Paste any Daily.co room URL (e.g., https://your-domain.daily.co/room-name). If left blank, instant WebRTC peer data synchronization and simulator mode are used automatically.
              </p>
              <input
                id="daily-url"
                type="url"
                value={dailyRoomUrl}
                onChange={(e) => setDailyRoomUrl(e.target.value)}
                placeholder="https://your-domain.daily.co/room-name"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(false)}
            className="touch-target-large px-8 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-base transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
