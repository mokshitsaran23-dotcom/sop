import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useCall } from '../context/CallContext';
import { getLanguageByCode } from '../utils/languages';
import { 
  X, 
  Search, 
  PhoneCall, 
  Sparkles, 
  Globe, 
  Users, 
  Link as LinkIcon,
  Mic,
  Keyboard
} from 'lucide-react';

export default function ContactModal({ isOpen, onClose, selectedMode }) {
  const { contacts } = useApp();
  const { initiateCall } = useCall();
  const [searchTerm, setSearchTerm] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLanguageByCode(c.language).name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectContact = (contact) => {
    initiateCall(selectedMode, contact);
    onClose();
  };

  const handleCustomRoomCall = (e) => {
    e.preventDefault();
    const room = customRoomName.trim() || 'friends-room';
    const dynamicContact = {
      id: room,
      name: `Room: ${room}`,
      role: 'Direct Peer Connection',
      language: 'en-US',
      avatar: 'DP',
      avatarColor: 'from-sky-500 to-blue-600',
      status: 'online',
      simulationResponses: [
        'Hello! I joined the room. How can I help you?',
        'The call is connected and audio is working smoothly.',
        'It is wonderful communicating with you!',
      ]
    };
    initiateCall(selectedMode, dynamicContact);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedMode === 'stt' 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {selectedMode === 'stt' ? (
                  <>
                    <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                    Speech to Text Mode
                  </>
                ) : (
                  <>
                    <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
                    Text to Speech Mode
                  </>
                )}
              </span>
            </div>
            <h2 id="contact-modal-title" className="text-2xl font-extrabold text-white">
              Select Who to Call
            </h2>
            <p className="text-sm text-slate-400">
              Choose a contact or enter a shared room code to connect via WebRTC
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact selector"
            className="touch-target-large p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search contacts by name, role, or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-base"
              aria-label="Search contacts"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Available Contacts ({filteredContacts.length})</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Multilingual Demo Ready
            </span>
          </div>

          {filteredContacts.map((contact) => {
            const lang = getLanguageByCode(contact.language);
            return (
              <div
                key={contact.id}
                className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${contact.avatarColor} flex items-center justify-center font-extrabold text-white text-lg shadow-md ring-2 ring-white/10 shrink-0`}>
                    {contact.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white group-hover:text-sky-300 transition-colors">
                        {contact.name}
                      </h3>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Online" />
                    </div>
                    <p className="text-sm text-slate-300 font-medium">
                      {contact.role}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-700/80 text-xs font-semibold text-sky-200 border border-slate-600">
                        <span className="text-sm">{lang.flag}</span>
                        Speaks: {lang.name}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectContact(contact)}
                  aria-label={`Call ${contact.name}`}
                  className="touch-target-large px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />
                  <span>Call Now</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Custom Room Section */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90">
          <form onSubmit={handleCustomRoomCall} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Or enter a custom Room Code to talk to a friend..."
                value={customRoomName}
                onChange={(e) => setCustomRoomName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              className="touch-target-large px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:border-sky-400 transition-colors"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Join Room</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
