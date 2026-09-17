import React from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';
import { 
  Mic, 
  Keyboard, 
  Languages, 
  Sparkles, 
  ShieldCheck, 
  Wifi, 
  Volume2, 
  Accessibility, 
  ArrowRight,
  Headphones,
  MessageSquare
} from 'lucide-react';

export default function LandingPage({ onSelectMode }) {
  const { userLanguage, setUserLanguage, currentLangObj } = useApp();

  return (
    <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-extrabold text-xs sm:text-sm tracking-wide uppercase mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>Universal Accessible Voice Calling</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Talk your way, <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
            without barriers.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          Connect with anyone anywhere. Read live spoken captions or type messages that speak aloud in real-time — with instant multi-language translation.
        </p>

        {/* Upfront Language Selector */}
        <div className="mt-8 inline-flex items-center gap-3 p-2 bg-slate-900/90 border border-slate-700 rounded-2xl shadow-xl max-w-md w-full justify-center">
          <div className="flex items-center gap-2 pl-3 text-slate-400 font-bold text-sm">
            <Languages className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <label htmlFor="landing-lang-select" className="text-slate-300 font-semibold text-sm">
              Your Primary Language:
            </label>
          </div>
          <div className="relative">
            <select
              id="landing-lang-select"
              value={userLanguage}
              onChange={(e) => setUserLanguage(e.target.value)}
              className="py-2.5 pl-3 pr-8 bg-slate-800 border border-slate-600 focus:border-sky-400 rounded-xl text-white font-bold text-sm cursor-pointer focus:outline-none transition-colors"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Two Primary Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto w-full mb-14">
        
        {/* Mode 1: Speech-to-Text */}
        <button
          type="button"
          onClick={() => onSelectMode('stt')}
          aria-label="Start Speech to Text Mode: Live Captions for Voice Calls"
          className="group relative flex flex-col p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-2 border-slate-700 hover:border-sky-400 text-left transition-all duration-300 shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1.5 focus-visible:ring-4 focus-visible:ring-sky-400"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-lg">
              <Headphones className="w-8 h-8" aria-hidden="true" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30">
              For Hard of Hearing
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 group-hover:text-sky-300 transition-colors">
            Speech to Text
          </h2>

          <p className="text-slate-300 text-base leading-relaxed mb-8 flex-1">
            Enjoy voice calls with <strong className="text-white">real-time dual captions</strong> for both speakers. Never miss a word, and read live translations if you speak different languages.
          </p>

          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Live split-screen captioning</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Toggle captions on or off at any moment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Real-time translation for foreign languages</span>
            </div>
          </div>

          <div className="touch-target-large w-full py-4 px-6 rounded-2xl bg-sky-500 group-hover:bg-sky-400 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-sky-500/25 transition-all">
            <span>Open Speech to Text</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </button>

        {/* Mode 2: Text-to-Speech */}
        <button
          type="button"
          onClick={() => onSelectMode('tts')}
          aria-label="Start Text to Speech Mode: Type to Talk"
          className="group relative flex flex-col p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-2 border-slate-700 hover:border-emerald-400 text-left transition-all duration-300 shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 focus-visible:ring-4 focus-visible:ring-emerald-400"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
              <MessageSquare className="w-8 h-8" aria-hidden="true" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              For Non-Speaking Users
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 group-hover:text-emerald-300 transition-colors">
            Text to Speech
          </h2>

          <p className="text-slate-300 text-base leading-relaxed mb-8 flex-1">
            Type your side of the call and have it <strong className="text-white">spoken aloud clearly</strong> to the person you called. Their spoken replies are captured and transcribed back to you.
          </p>

          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>High-quality natural voice synthesis</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Quick AAC phrases for rapid conversation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Automatic translation into recipient's language</span>
            </div>
          </div>

          <div className="touch-target-large w-full py-4 px-6 rounded-2xl bg-emerald-500 group-hover:bg-emerald-400 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 transition-all">
            <span>Open Text to Speech</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </button>

      </div>

      {/* Trust & Accessible Features Footnote */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto w-full pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-800 text-sky-400 border border-slate-700">
            <Wifi className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">WebRTC In-App Calling</div>
            <div className="text-xs text-slate-400">No phone numbers or telephony billing</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
            <Languages className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">10+ Global Languages</div>
            <div className="text-xs text-slate-400">Real-time bilingual translation</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
            <Accessibility className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">WCAG AAA Accessible</div>
            <div className="text-xs text-slate-400">High contrast & text scaling ready</div>
          </div>
        </div>
      </div>

    </main>
  );
}
