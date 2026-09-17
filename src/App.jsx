import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { CallProvider, useCall } from './context/CallContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ContactModal from './components/ContactModal';
import LanguageConfirmModal from './components/LanguageConfirmModal';
import SpeechToTextCallScreen from './components/SpeechToTextCallScreen';
import TextToSpeechCallScreen from './components/TextToSpeechCallScreen';
import SettingsModal from './components/SettingsModal';
import './App.css';

function MainContent() {
  const { callStatus, callMode } = useCall();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('stt');

  const handleOpenMode = (mode) => {
    setSelectedMode(mode);
    setIsContactModalOpen(true);
  };

  const isInsideCall = callStatus === 'connected' || callStatus === 'connecting';

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-slate-100 font-sans transition-colors duration-200">
      {/* Top Accessible Navbar */}
      <Navbar />

      {/* Screen Routing */}
      {isInsideCall ? (
        callMode === 'stt' ? (
          <SpeechToTextCallScreen />
        ) : (
          <TextToSpeechCallScreen />
        )
      ) : (
        <LandingPage onSelectMode={handleOpenMode} />
      )}

      {/* Accessible Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        selectedMode={selectedMode}
      />

      <LanguageConfirmModal />
      <SettingsModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CallProvider>
        <MainContent />
      </CallProvider>
    </AppProvider>
  );
}
