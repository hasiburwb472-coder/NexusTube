
import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Video as VideoIcon, Bell, User as UserIcon, Mic, Settings, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Notification } from '../types';

interface NavbarProps {
  onMenuClick: () => void;
  onUploadClick: () => void;
  onProfileClick: () => void;
  onSearch: () => void;
  onLogoClick: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onUploadClick, onProfileClick, onSearch, onLogoClick, onNotificationClick }) => {
  const { user, searchQuery, setSearchQuery, notifications, markNotificationAsRead } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
      sounds: true,
      desktop: false,
      subscriptions: true,
      recommended: true
  });

  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
        // Reset settings view when closing
        setTimeout(() => setIsNotificationSettingsOpen(false), 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) return;

    // Type assertion for browser compatibility
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearchQuery(speechResult);
      // Automatically trigger search after a brief delay to allow state update
      setTimeout(() => onSearch(), 100);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error detected: ' + event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleNotificationItemClick = (n: Notification) => {
      if (!n.read) {
          markNotificationAsRead(n.id);
      }
      if (onNotificationClick) {
          onNotificationClick(n);
          setIsNotificationsOpen(false);
      }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsNotificationSettingsOpen(true);
  };

  const handleBackFromSettings = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsNotificationSettingsOpen(false);
  };

  const togglePreference = (key: keyof typeof notificationPreferences) => {
      setNotificationPreferences(prev => ({
          ...prev,
          [key]: !prev[key]
      }));
  };

  return (
    <div className="h-16 fixed top-0 left-0 right-0 bg-[#0f0f0f] flex items-center justify-between px-4 z-50 border-b border-[#272727]">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 hover:bg-[#272727] rounded-full transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
          {/* Custom Blue S Logo */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M26 6H14L6 14L18 14L26 6Z" fill="#38BDF8" />
                <path d="M6 26H18L26 18L14 18L6 26Z" fill="#2563EB" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tighter">Nexus Tube</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-2xl mx-4 items-center gap-4">
        <div className="flex flex-1 items-center">
          <div className="flex flex-1 items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2 focus-within:border-blue-500 ml-8">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Search"}
              className="bg-transparent border-none outline-none w-full text-white placeholder-gray-500"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-[#222] border border-l-0 border-[#303030] px-5 py-2 rounded-r-full hover:bg-[#303030] transition-colors"
          >
            <Search size={20} />
          </button>
        </div>
        <button 
            onClick={handleVoiceSearch}
            className={`p-2 rounded-full transition-all ${
                isListening 
                ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.7)]' 
                : 'bg-[#121212] hover:bg-[#272727]'
            }`}
            title="Search with voice"
        >
            <Mic size={20} className={isListening ? 'animate-bounce' : ''} />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={onUploadClick} className="p-2 hover:bg-[#272727] rounded-full transition-colors">
          <VideoIcon size={24} />
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
            <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="p-2 hover:bg-[#272727] rounded-full transition-colors relative"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-[#0f0f0f] flex items-center justify-center text-[9px] font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                    {!isNotificationSettingsOpen ? (
                        <>
                            <div className="p-3 border-b border-[#3f3f3f] flex justify-between items-center bg-[#1f1f1f]">
                                <h3 className="font-semibold">Notifications</h3>
                                <button 
                                    onClick={handleSettingsClick}
                                    className="p-1.5 hover:bg-[#3f3f3f] rounded-full text-gray-400 hover:text-white transition-colors"
                                    title="Notification Settings"
                                >
                                    <Settings size={18} />
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        className={`p-4 hover:bg-[#3f3f3f] cursor-pointer flex gap-4 transition-colors border-b border-[#3f3f3f]/30 last:border-0 ${!n.read ? 'bg-[#2a2a2a]' : ''}`}
                                        onClick={() => handleNotificationItemClick(n)}
                                    >
                                        <div className="flex-shrink-0 relative">
                                            <img src={n.avatar} className="w-10 h-10 rounded-full" />
                                            {!n.read && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#1f1f1f]"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm text-white line-clamp-2 leading-snug mb-1 ${!n.read ? 'font-semibold' : ''}`}>{n.text}</p>
                                            <p className="text-xs text-gray-400">{n.time}</p>
                                        </div>
                                        {!n.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-gray-500">
                                        No notifications
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-[#272727] animate-fade-in">
                            <div className="p-3 border-b border-[#3f3f3f] flex items-center gap-2 bg-[#1f1f1f]">
                                <button 
                                    onClick={handleBackFromSettings}
                                    className="p-1.5 hover:bg-[#3f3f3f] rounded-full"
                                >
                                    <ArrowLeft size={18} className="text-white" />
                                </button>
                                <h3 className="font-semibold">Settings</h3>
                            </div>
                            <div className="p-2">
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</div>
                                
                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-[#3f3f3f] rounded-lg cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); togglePreference('sounds'); }}
                                >
                                    <span className="text-sm">Sounds</span>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationPreferences.sounds ? 'bg-blue-600' : 'bg-[#3f3f3f] border border-gray-500'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${notificationPreferences.sounds ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </div>

                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-[#3f3f3f] rounded-lg cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); togglePreference('desktop'); }}
                                >
                                    <span className="text-sm">Desktop Notifications</span>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationPreferences.desktop ? 'bg-blue-600' : 'bg-[#3f3f3f] border border-gray-500'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${notificationPreferences.desktop ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </div>

                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mt-2">Types</div>

                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-[#3f3f3f] rounded-lg cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); togglePreference('subscriptions'); }}
                                >
                                    <span className="text-sm">Subscriptions</span>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationPreferences.subscriptions ? 'bg-blue-600' : 'bg-[#3f3f3f] border border-gray-500'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${notificationPreferences.subscriptions ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </div>

                                <div 
                                    className="flex items-center justify-between p-3 hover:bg-[#3f3f3f] rounded-lg cursor-pointer transition-colors"
                                    onClick={(e) => { e.stopPropagation(); togglePreference('recommended'); }}
                                >
                                    <span className="text-sm">Recommended Videos</span>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${notificationPreferences.recommended ? 'bg-blue-600' : 'bg-[#3f3f3f] border border-gray-500'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${notificationPreferences.recommended ? 'left-6' : 'left-1'}`}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        <button 
          onClick={onProfileClick}
          className="w-8 h-8 rounded-full overflow-hidden ml-2 cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-transparent hover:ring-white"
        >
            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
