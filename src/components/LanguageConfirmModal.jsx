import React from 'react';
import { useCall } from '../context/CallContext';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../utils/languages';
import { 
  Languages, 
  ArrowRightLeft, 
  PhoneCall, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Mic, 
  Keyboard 
} from 'lucide-react';

export default function LanguageConfirmModal() {
  const { 
    callStatus, 
    callMode, 
    activeContact, 
    callerLanguage, 
    setCallerLanguage, 
    calleeLanguage, 
    setCalleeLanguage,
    cancelPreCall, 
    startCall 
  } = useCall();

  if (callStatus !== 'pre_call_confirm') return null;

  const callerLangObj = getLanguageByCode(callerLanguage);
  const calleeLangObj = getLanguageByCode(calleeLanguage);
  const isBilingual = callerLangObj.shortCode !== calleeLangObj.shortCode;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-confirm-title"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-sky-500/50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[94vh] p-4 sm:p-8 my-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Languages className="w-3.5 h-3.5" aria-hidden="true" />
              Pre-Call Language
            </div>
            <h2 id="lang-confirm-title" className="text-xl sm:text-3xl font-black text-white">
              Confirm Call Languages
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Verify the languages used before connecting with <strong className="text-white">{activeContact?.name}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={cancelPreCall}
            aria-label="Cancel call"
            className="touch-target-large p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Dual Language Box */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mb-4 sm:mb-6 space-y-3.5 sm:space-y-5">
          
          {/* Caller Language (Your Language) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label htmlFor="caller-lang-select" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                {callMode === 'stt' ? (
                  <>
                    <Mic className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Your Spoken Language</span>
                  </>
                ) : (
                  <>
                    <Keyboard className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Your Typed Language</span>
                  </>
                )}
              </label>
              <span className="text-[10px] sm:text-xs text-slate-400 shrink-0">Your profile</span>
            </div>

            <div className="relative">
              <select
                id="caller-lang-select"
                value={callerLanguage}
                onChange={(e) => setCallerLanguage(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-slate-900 border-2 border-slate-600 focus:border-sky-400 rounded-xl text-white font-bold text-sm sm:text-base cursor-pointer focus:outline-none transition-colors"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Translation Bridge Visual Indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 py-0.5">
            <div className="h-px flex-1 bg-slate-700" />
            <div className="px-2.5 sm:px-3 py-1 rounded-full bg-slate-700/60 border border-slate-600 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-extrabold text-slate-300">
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
              <span>{isBilingual ? 'Live Translation Active' : 'Same Language Mode'}</span>
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {/* Callee Language (Contact's Language) */}
          <div>
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <label htmlFor="callee-lang-select" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{activeContact?.name}'s Language</span>
              </label>
              <span className="text-[10px] sm:text-xs text-slate-400 shrink-0">Response lang</span>
            </div>

            <div className="relative">
              <select
                id="callee-lang-select"
                value={calleeLanguage}
                onChange={(e) => setCalleeLanguage(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-slate-900 border-2 border-slate-600 focus:border-emerald-400 rounded-xl text-white font-bold text-sm sm:text-base cursor-pointer focus:outline-none transition-colors"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Translation Banner */}
        {isBilingual ? (
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm text-sky-200">
              <strong className="text-white block font-bold mb-0.5">Automated Two-Way Translation Ready:</strong>
              {callMode === 'stt' ? (
                <>Your {callerLangObj.name} speech will be translated to {calleeLangObj.name}, and their replies will be translated back to {callerLangObj.name} in real-time captions.</>
              ) : (
                <>Your typed text will be spoken out loud in {calleeLangObj.name} to {activeContact?.name}, and their voice replies will be translated back to {callerLangObj.name}.</>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            <p className="text-xs sm:text-sm text-emerald-200">
              Both parties are using <strong>{callerLangObj.name}</strong>. Real-time captions will render directly without extra translation delay.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch gap-3 pt-2">
          <button
            type="button"
            onClick={cancelPreCall}
            className="touch-target-large w-full sm:w-36 shrink-0 py-3.5 sm:py-4 px-5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base transition-colors flex items-center justify-center text-center shadow-md"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={startCall}
            className="touch-target-large w-full sm:flex-1 py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 sm:gap-3 shadow-xl shadow-sky-500/30 transition-all active:scale-95 text-center"
          >
            <PhoneCall className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Connect Call Now</span>
          </button>
        </div>

      </div>
    </div>
  );
}
