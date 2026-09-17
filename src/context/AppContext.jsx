import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_LANGUAGE, getLanguageByCode } from '../utils/languages';
import { INITIAL_CONTACTS } from '../utils/contacts';
import { soundEffects } from '../services/soundEffects';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Global user language (selected on landing page or in settings)
  const [userLanguage, setUserLanguage] = useState(() => {
    return localStorage.getItem('vocalease_lang') || DEFAULT_LANGUAGE.code;
  });

  // Accessibility: Text scale (1 = normal, 1.25 = large, 1.5 = extra large)
  const [textScale, setTextScale] = useState(() => {
    return localStorage.getItem('vocalease_text_scale') || 'normal';
  });

  // Accessibility: High Contrast theme ('standard', 'high-contrast-dark', 'high-contrast-yellow')
  const [contrastMode, setContrastMode] = useState(() => {
    return localStorage.getItem('vocalease_contrast_mode') || 'standard';
  });

  // Accessibility: Captions toggle (global preference)
  const [captionsEnabled, setCaptionsEnabled] = useState(() => {
    const saved = localStorage.getItem('vocalease_captions');
    return saved !== null ? saved === 'true' : true;
  });

  // Accessibility: Caption translation display mode ('both' or 'translated_only')
  const [translationDisplayMode, setTranslationDisplayMode] = useState(() => {
    return localStorage.getItem('vocalease_trans_display') || 'both';
  });

  // Sound effects toggle
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('vocalease_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Daily.co custom room URL (optional)
  const [dailyRoomUrl, setDailyRoomUrl] = useState(() => {
    return localStorage.getItem('vocalease_daily_url') || '';
  });

  // Contacts list
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);

  // Settings modal open/close
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Update text scale CSS variable on root
  useEffect(() => {
    let scaleVal = '1';
    if (textScale === 'large') scaleVal = '1.2';
    if (textScale === 'xlarge') scaleVal = '1.4';
    document.documentElement.style.setProperty('--text-scale', scaleVal);
    localStorage.setItem('vocalease_text_scale', textScale);
  }, [textScale]);

  // Update contrast theme classes on body
  useEffect(() => {
    document.body.classList.remove('theme-high-contrast-dark', 'theme-high-contrast-yellow');
    if (contrastMode === 'high-contrast-yellow') {
      document.body.classList.add('theme-high-contrast-yellow');
    } else if (contrastMode === 'high-contrast-dark') {
      document.body.classList.add('theme-high-contrast-dark');
    }
    localStorage.setItem('vocalease_contrast_mode', contrastMode);
  }, [contrastMode]);

  // Sync sound effects
  useEffect(() => {
    soundEffects.setEnabled(soundEnabled);
    localStorage.setItem('vocalease_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Save user language
  useEffect(() => {
    localStorage.setItem('vocalease_lang', userLanguage);
  }, [userLanguage]);

  // Save captions preference
  useEffect(() => {
    localStorage.setItem('vocalease_captions', String(captionsEnabled));
  }, [captionsEnabled]);

  // Save translation display mode
  useEffect(() => {
    localStorage.setItem('vocalease_trans_display', translationDisplayMode);
  }, [translationDisplayMode]);

  // Save Daily URL
  useEffect(() => {
    localStorage.setItem('vocalease_daily_url', dailyRoomUrl);
  }, [dailyRoomUrl]);

  const addContact = (newContact) => {
    setContacts(prev => [newContact, ...prev]);
  };

  const cycleTextScale = () => {
    if (textScale === 'normal') setTextScale('large');
    else if (textScale === 'large') setTextScale('xlarge');
    else setTextScale('normal');
  };

  const toggleHighContrast = () => {
    if (contrastMode === 'standard') setContrastMode('high-contrast-yellow');
    else if (contrastMode === 'high-contrast-yellow') setContrastMode('high-contrast-dark');
    else setContrastMode('standard');
  };

  const currentLangObj = getLanguageByCode(userLanguage);

  return (
    <AppContext.Provider
      value={{
        userLanguage,
        setUserLanguage,
        currentLangObj,
        textScale,
        setTextScale,
        cycleTextScale,
        contrastMode,
        setContrastMode,
        toggleHighContrast,
        captionsEnabled,
        setCaptionsEnabled,
        translationDisplayMode,
        setTranslationDisplayMode,
        soundEnabled,
        setSoundEnabled,
        dailyRoomUrl,
        setDailyRoomUrl,
        contacts,
        addContact,
        isSettingsOpen,
        setIsSettingsOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
