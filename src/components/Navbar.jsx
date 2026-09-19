import React from 'react';
import { useApp } from '../context/AppContext';
import { useCall } from '../context/CallContext';
import { 
  Volume2, 
  VolumeX, 
  SunMoon, 
  Type, 
  Settings, 
  PhoneCall, 
  Languages 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

export default function Navbar() {
  const { 
    userLanguage, 
    setUserLanguage, 
    currentLangObj, 
    textScale, 
    cycleTextScale, 
    contrastMode, 
    toggleHighContrast, 
    soundEnabled, 
    setSoundEnabled,
    setIsSettingsOpen 
  } = useApp();

  const { callStatus } = useCall();
  const isCalling = callStatus === 'connected' || callStatus === 'connecting';

  return (
    <header 
      className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md transition-colors"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo & Tagline */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 ring-2 ring-white/10 shrink-0">
            <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
              Vocal<span className="text-sky-400">Ease</span>
              <span className="hidden md:inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
                Accessible Calling
              </span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium hidden lg:block">
              Talk your way • Live STT Captions & TTS Speech
            </p>
          </div>
        </div>

        {/* Global Accessibility & Controls Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5" role="toolbar" aria-label="Accessibility quick controls">
          
          {/* Global Language Selector (when not actively inside a call) */}
          {!isCalling && (
            <div className="relative flex items-center">
              <label htmlFor="global-lang-select" className="sr-only">Choose default language</label>
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 hover:border-sky-500 transition-colors">
                <span className="text-base sm:text-lg shrink-0" aria-hidden="true">{currentLangObj.flag}</span>
                <select
                  id="global-lang-select"
                  value={userLanguage}
                  onChange={(e) => setUserLanguage(e.target.value)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 text-xs sm:text-sm max-w-[80px] sm:max-w-none truncate"
                  aria-label="Application language"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Text Size Cycler */}
          <button
            type="button"
            onClick={cycleTextScale}
            aria-label={`Change text size. Currently ${textScale}`}
            className="touch-target-large px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-400 text-slate-200 transition-all flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm shadow-sm"
            title="Increase text scale"
          >
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" aria-hidden="true" />
            <span className="hidden md:inline">Text</span>
            <span className="px-1 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] sm:text-xs uppercase font-extrabold">
              {textScale === 'normal' ? '1x' : textScale === 'large' ? '1.2x' : '1.4x'}
            </span>
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-label={`Toggle high contrast mode. Currently ${contrastMode}`}
            className={`touch-target-large p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm shadow-sm ${
              contrastMode !== 'standard' 
                ? 'bg-amber-400 text-black border-amber-300 ring-2 ring-amber-400' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-sky-400 text-slate-200'
            }`}
            title="High contrast theme"
          >
            <SunMoon className={`w-4 h-4 ${contrastMode !== 'standard' ? 'text-black' : 'text-amber-400'}`} aria-hidden="true" />
            <span className="hidden md:inline">Contrast</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Mute audio feedback' : 'Unmute audio feedback'}
            className="touch-target-large p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-400 text-slate-200 transition-colors"
            title={soundEnabled ? 'Audio chimes ON' : 'Audio chimes OFF'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" aria-hidden="true" />
            )}
          </button>

          {/* Settings Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Open settings"
            className="touch-target-large p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-400 text-slate-200 transition-colors"
            title="Open application settings"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 hover:text-sky-400 transition-colors" aria-hidden="true" />
          </button>

        </div>
      </div>
    </header>
  );
}
