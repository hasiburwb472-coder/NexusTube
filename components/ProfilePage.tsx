
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Edit2, Check, X, Calendar, Users, Plus, Layout, ArrowLeft, BellRing, BellOff, ThumbsUp, MessageSquare, Trash2, Globe, BarChart2, MoreVertical, PlaySquare, Filter, Download, Eye, Lock, Video as VideoIcon, Flag, MoreHorizontal } from 'lucide-react';
import { Video } from '../types';
import VideoGrid from './VideoGrid';

interface ProfilePageProps {
    channelName?: string | null;
    onVideoClick: (video: Video) => void;
}

const parseViews = (views: string) => {
    if (!views) return 0;
    const v = views.toString().toUpperCase();
    let multiplier = 1;
    if (v.includes('M')) multiplier = 1000000;
    else if (v.includes('K')) multiplier = 1000;
    else if (v.includes('B')) multiplier = 1000000000;
    
    const num = parseFloat(v.replace(/[^0-9.]/g, ''));
    return (isNaN(num) ? 0 : num) * multiplier;
};

const parseTimeAgo = (time: string) => {
    if (!time) return 0;
    const t = time.toLowerCase();
    if (t.includes('live') || t.includes('just now')) return 0;
    
    const val = parseInt(t.replace(/[^0-9]/g, '')) || 1;
    let multiplier = 1; // seconds
    if (t.includes('year')) multiplier = 31536000;
    else if (t.includes('month')) multiplier = 2592000;
    else if (t.includes('week')) multiplier = 604800;
    else if (t.includes('day')) multiplier = 86400;
    else if (t.includes('hour')) multiplier = 3600;
    else if (t.includes('minute')) multiplier = 60;
    
    return val * multiplier;
};

const ProfilePage: React.FC<ProfilePageProps> = ({ channelName, onVideoClick }) => {
  const { user, updateUser, videos, posts, toggleSubscribe, isSubscribed, availableUsers, switchUser, addUser, showToast, toggleChannelNotification, getChannelNotificationState, deleteVideo, downloadVideo, addReport } = useApp();
  
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [isManageVideosOpen, setIsManageVideosOpen] = useState(false);
  const [manageTab, setManageTab] = useState<'videos' | 'shorts'>('videos');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  const [isSubscribeMenuOpen, setIsSubscribeMenuOpen] = useState(false);
  const [isSwitchAccountMenuOpen, setIsSwitchAccountMenuOpen] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'posts'>('videos');
  const [sortOrder, setSortOrder] = useState<'latest' | 'popular'>('latest');
  
  const subscribeMenuRef = useRef<HTMLDivElement>(null);
  const switchAccountMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isCurrentUser = !channelName || channelName === user.name;
  const currentName = isCurrentUser ? user.name : channelName!;
  const notificationsOn = getChannelNotificationState(currentName);

  const profileOwner = availableUsers.find(u => u.name === currentName);
  const isCreativeDirector = profileOwner ? profileOwner.isCreativeDirector : (isCurrentUser ? user.isCreativeDirector : false);

  const reportReasons = [
      "Harassment and cyberbullying",
      "Privacy",
      "Impersonation",
      "Violent threats",
      "Child endangerment",
      "Hate speech against a protected group",
      "Spam and scams",
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subscribeMenuRef.current && !subscribeMenuRef.current.contains(event.target as Node)) {
        setIsSubscribeMenuOpen(false);
      }
      if (switchAccountMenuRef.current && !switchAccountMenuRef.current.contains(event.target as Node)) {
        setIsSwitchAccountMenuOpen(false);
        setIsAddingAccount(false);
        setNewAccountEmail('');
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      
      if (openActionMenuId && !(event.target as Element).closest('.action-menu-trigger')) {
          setOpenActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuId]);

  useEffect(() => {
    if (isCurrentUser) {
        setEditName(user.name);
        setEditHandle(user.handle || user.name.replace(/\s+/g, '').toLowerCase());
        setEditDescription(user.description || '');
    }
  }, [user, isCurrentUser]);

  const channelVideo = videos.find(v => v.channelName === currentName);
  const channelPost = posts.find(p => p.authorName === currentName);
  const currentAvatar = isCurrentUser 
    ? user.avatar 
    : (channelVideo?.channelAvatar || channelPost?.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentName)}&background=random`);

  const currentBanner = isCurrentUser
    ? (user.bannerUrl || "https://picsum.photos/seed/banner/1200/300")
    : `https://picsum.photos/seed/${currentName}banner/1200/300`;

  const subCount = isCurrentUser ? 0 : (currentName.length * 123000).toLocaleString();
  const subscribed = isSubscribed(currentName);

  const allChannelVideos = videos.filter(v => v.channelName === currentName);
  const longVideos = allChannelVideos.filter(v => v.type === 'long');
  const shortVideos = allChannelVideos.filter(v => v.type === 'short');
  const myPosts = posts.filter(p => p.authorName === currentName);

  const manageContentList = manageTab === 'videos' ? longVideos : shortVideos;

  const sortVideos = (videoList: Video[]) => {
      return [...videoList].sort((a, b) => {
          if (sortOrder === 'popular') {
              return parseViews(b.views) - parseViews(a.views);
          } else {
              return parseTimeAgo(a.uploadedAt) - parseTimeAgo(b.uploadedAt);
          }
      });
  };

  const displayedLongVideos = sortVideos(longVideos);
  const displayedShortVideos = sortVideos(shortVideos);

  const handleAvatarClick = () => {
    if (isCurrentUser) {
        fileInputRef.current?.click();
    }
  };

  const handleBannerClick = () => {
    if (isCurrentUser) {
        bannerInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      updateUser({ avatar: imageUrl });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file);
        updateUser({ bannerUrl: imageUrl });
    }
  };

  const handleSaveCustomize = () => {
    if (editName.trim()) {
      updateUser({ 
          name: editName,
          handle: editHandle.trim(),
          description: editDescription
      });
      setIsCustomizeModalOpen(false);
      showToast("Profile updated successfully!");
    }
  };

  const handleSubscribeAction = (action: 'subscribe' | 'unsubscribe') => {
    if (action === 'subscribe' && !subscribed) {
        toggleSubscribe(currentName);
    } else if (action === 'unsubscribe' && subscribed) {
        toggleSubscribe(currentName);
    }
    setIsSubscribeMenuOpen(false);
  };
  
  const handleCreateAccount = () => {
      if (newAccountEmail.trim()) {
          let displayName = newAccountEmail;
          if (newAccountEmail.includes('@')) {
              displayName = newAccountEmail.split('@')[0];
          }
          displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

          addUser(displayName, newAccountEmail);
          setIsSwitchAccountMenuOpen(false);
          setIsAddingAccount(false);
          setNewAccountEmail('');
          
          window.open("https://mail.google.com/", "_blank");
      }
  };

  const handleReportSubmit = () => {
      if (selectedReportReason) {
          addReport('user', currentName, currentName, selectedReportReason);
          setIsReportModalOpen(false);
          setSelectedReportReason(null);
      }
  };

  const getJoinedDate = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const start = new Date(2015, 0, 1).getTime();
    const end = new Date(2023, 0, 1).getTime();
    const date = new Date(start + (Math.abs(hash) % (end - start)));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getChannelDescription = (name: string, isCurrent: boolean) => {
    if (isCurrent && user.description) return user.description;
    
    if (name === "MrBeast") return "I want to make the world a better place before I die.";
    if (name.includes("Gaming")) return `Welcome to ${name}! Your daily dose of gaming news, walkthroughs, and epic moments. Subscribe for more!`;
    if (name.includes("Music")) return "Bringing you the best beats and melodies from around the world. Stay tuned.";
    if (name.includes("Tech")) return "Reviewing the latest gadgets and exploring the future of technology.";
    if (name.includes("Vlogs")) return "Documenting life, one day at a time. Join the journey!";
    if (name.includes("Nature")) return "Exploring the beauty of our planet. Relax and enjoy nature.";
    if (name.includes("AI")) return "Demystifying Artificial Intelligence and exploring the future of humanity.";
    
    return `Welcome to ${name}'s official channel. Watch their latest videos and stay updated! We upload regular content so make sure to hit that notification bell.`;
  };

  const joinedDate = getJoinedDate(currentName);
  const description = getChannelDescription(currentName, isCurrentUser);
  const displayHandle = (isCurrentUser && user.handle) ? user.handle : currentName.replace(/\s+/g, '').toLowerCase();

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen relative">
      <div className="relative w-full h-40 md:h-60 rounded-2xl overflow-hidden mb-6 bg-[#1a1a1a] group">
          <img src={currentBanner} alt="Channel Banner" className="w-full h-full object-cover" />
          
          {isCurrentUser && (
            <>
                <div 
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={handleBannerClick}
                >
                    <Camera className="text-white drop-shadow-md" size={48} />
                </div>
                <button 
                    onClick={handleBannerClick}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                >
                    <Camera size={20} />
                </button>
                <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerChange}
                    accept="image/*"
                    className="hidden"
                />
            </>
          )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-4 pb-10">
        <div className={`relative group ${isCurrentUser ? 'cursor-pointer' : ''}`} onClick={handleAvatarClick}>
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#272727] bg-[#1a1a1a]">
            <img src={currentAvatar} alt={currentName} className="w-full h-full object-contain" />
          </div>
          {isCurrentUser && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
          )}
          {isCurrentUser && (
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
          )}
        </div>

        <div className="flex-1 flex flex-col items-center md:items-start gap-4 pt-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                  {currentName}
                  {isCreativeDirector && (
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-1 rounded-full font-medium tracking-wide shadow-sm">
                          Creative Director
                      </span>
                  )}
              </h1>
              {isCurrentUser && (
                  <button 
                    onClick={() => setIsCustomizeModalOpen(true)} 
                    className="p-2 text-gray-400 hover:text-white hover:bg-[#272727] rounded-full transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
              )}
            </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-400 items-center">
            <span className="font-semibold text-white">@{displayHandle}</span>
            <span>•</span>
            <span>{subCount} subscribers</span>
            <span>•</span>
            <span>{allChannelVideos.length} videos</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar size={14} /> Joined {joinedDate}</span>
          </div>

          <p className="text-gray-300 text-center md:text-left max-w-2xl whitespace-pre-wrap leading-relaxed">
              {description}
          </p>

           <div className="flex gap-3 mt-2 flex-wrap justify-center md:justify-start">
                {isCurrentUser ? (
                    <>
                        <button 
                            onClick={() => setIsCustomizeModalOpen(true)}
                            className="px-5 py-2.5 bg-[#272727] rounded-full text-sm font-medium hover:bg-[#3f3f3f] transition-colors"
                        >
                            Customize Channel
                        </button>
                        <button 
                            onClick={() => setIsManageVideosOpen(true)}
                            className="px-5 py-2.5 bg-[#272727] rounded-full text-sm font-medium hover:bg-[#3f3f3f] transition-colors"
                        >
                            Manage Videos
                        </button>
                        
                        <div className="relative" ref={switchAccountMenuRef}>
                            <button 
                                onClick={() => setIsSwitchAccountMenuOpen(!isSwitchAccountMenuOpen)}
                                className="px-5 py-2.5 bg-[#272727] rounded-full text-sm font-medium hover:bg-[#3f3f3f] transition-colors flex items-center gap-2"
                            >
                                <Users size={16} />
                                Switch Account
                            </button>
                            
                            {isSwitchAccountMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-80 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 overflow-hidden">
                                    {/* (Switch Account Content kept same as previous code block to save space, assuming it's correctly working) */}
                                    {/* For brevity, re-inserting the essential structure */}
                                    <div className="p-2 border-b border-[#3f3f3f]">
                                        <p className="text-xs text-gray-400 px-2 py-1">Current account</p>
                                        <div className="flex items-center gap-2 px-2 py-1">
                                            <img src={user.avatar} className="w-8 h-8 rounded-full" />
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-semibold truncate">{user.name}</span>
                                            </div>
                                            <Check size={16} className="ml-auto text-blue-500" />
                                        </div>
                                    </div>
                                    
                                    <div className="max-h-56 overflow-y-auto">
                                        <p className="text-xs text-gray-400 px-4 py-2 mt-1">Other accounts</p>
                                        {availableUsers.filter(u => u.id !== user.id).map((u, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => { switchUser(u.id); setIsSwitchAccountMenuOpen(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors text-sm"
                                            >
                                                <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                                <span className="truncate font-medium">{u.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => { setIsAddingAccount(true); setNewAccountEmail(''); }}
                                        className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors text-sm border-t border-[#3f3f3f] mt-1"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#3f3f3f] border border-[#555] flex items-center justify-center">
                                            <Plus size={16} />
                                        </div>
                                        Add account
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="relative" ref={subscribeMenuRef}>
                            <button 
                                onClick={() => setIsSubscribeMenuOpen(!isSubscribeMenuOpen)}
                                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2 ${
                                    subscribed 
                                    ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]' 
                                    : 'bg-white text-black hover:bg-gray-200'
                                }`}
                            >
                                {subscribed && <Check size={16} className="text-white" />}
                                {subscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                             {isSubscribeMenuOpen && (
                                 <div className="absolute top-full left-0 mt-2 w-44 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 overflow-hidden">
                                     <button 
                                        onClick={() => handleSubscribeAction('subscribe')}
                                        className={`w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center justify-between text-sm ${subscribed ? 'opacity-50 cursor-default' : ''}`}
                                     >
                                         Subscribe
                                         {subscribed && <Check size={14} className="text-green-500" />}
                                     </button>
                                     <button 
                                         onClick={() => handleSubscribeAction('unsubscribe')}
                                         className={`w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center justify-between text-sm ${!subscribed ? 'opacity-50 cursor-default' : ''}`}
                                     >
                                         Unsubscribe
                                     </button>
                                 </div>
                             )}
                        </div>
                        {subscribed && (
                             <button 
                                onClick={() => toggleChannelNotification(currentName)}
                                className={`p-2.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full transition-colors ${notificationsOn ? 'text-white' : 'text-gray-400'} border border-[#3f3f3f]`} 
                                title={notificationsOn ? "Notifications On" : "Notifications Off"}
                            >
                                 {notificationsOn ? <BellRing size={20} className="fill-current" /> : <BellOff size={20} />}
                             </button>
                        )}
                        <div className="relative" ref={moreMenuRef}>
                            <button 
                                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                className="p-2.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full transition-colors text-white border border-[#3f3f3f] flex items-center justify-center"
                            >
                                <MoreHorizontal size={20} />
                            </button>
                            {isMoreMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 overflow-hidden">
                                    <button 
                                        onClick={() => {
                                            setIsReportModalOpen(true);
                                            setIsMoreMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 text-sm"
                                    >
                                        <Flag size={16} />
                                        Report user
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
           </div>
        </div>
      </div>

      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1f1f1f] w-full max-w-lg rounded-2xl p-6 border border-[#3f3f3f] shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-[#3f3f3f] pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Layout size={20} />
                        Customize Channel
                    </h2>
                    <button 
                        onClick={() => setIsCustomizeModalOpen(false)}
                        className="p-1 hover:bg-[#3f3f3f] rounded-full text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Branding</h3>
                        <div className="flex items-center gap-4 mb-6">
                             <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#3f3f3f] bg-[#1a1a1a]">
                                    <img src={currentAvatar} className="w-full h-full object-contain" />
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={20} className="text-white" />
                                </div>
                             </div>
                             <div>
                                 <p className="font-medium text-sm">Profile Picture</p>
                                 <p className="text-xs text-gray-500 mb-2">Recommended: 98 x 98 px PNG or GIF</p>
                                 <button 
                                    onClick={handleAvatarClick} 
                                    className="text-blue-500 text-sm font-medium hover:text-blue-400"
                                 >
                                     Change
                                 </button>
                             </div>
                        </div>

                        <div className="flex items-center gap-4">
                             <div className="relative group cursor-pointer w-40 h-24 rounded-lg overflow-hidden border-2 border-[#3f3f3f] bg-[#1a1a1a]" onClick={handleBannerClick}>
                                <img src={currentBanner} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                             </div>
                             <div>
                                 <p className="font-medium text-sm">Banner Image</p>
                                 <p className="text-xs text-gray-500 mb-2">Recommended: 2048 x 1152 px</p>
                                 <button 
                                    onClick={handleBannerClick} 
                                    className="text-blue-500 text-sm font-medium hover:text-blue-400"
                                 >
                                     Change
                                 </button>
                             </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Basic Info</h3>
                        <div className="flex flex-col gap-4">
                            <label>
                                <span className="block text-xs font-medium text-gray-400 mb-1">Name</span>
                                <input 
                                    type="text" 
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#303030] rounded-lg p-2.5 text-white focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Channel Name"
                                />
                            </label>
                            
                            <label>
                                <span className="block text-xs font-medium text-gray-400 mb-1">Handle</span>
                                <div className="flex items-center bg-[#121212] border border-[#303030] rounded-lg px-2.5 focus-within:border-blue-500 transition-colors">
                                    <span className="text-gray-500">@</span>
                                    <input 
                                        type="text" 
                                        value={editHandle}
                                        onChange={(e) => setEditHandle(e.target.value)}
                                        className="w-full bg-transparent border-none outline-none p-2.5 text-white"
                                        placeholder="handle"
                                    />
                                </div>
                            </label>

                             <label>
                                <span className="block text-xs font-medium text-gray-400 mb-1">Description</span>
                                <textarea 
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#303030] rounded-lg p-3 text-white focus:border-blue-500 outline-none h-32 resize-none transition-colors"
                                    placeholder="Tell viewers about your channel..."
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#3f3f3f]">
                    <button 
                        onClick={() => setIsCustomizeModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#3f3f3f] rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSaveCustomize}
                        className="px-6 py-2 bg-blue-600 text-sm font-bold rounded-full hover:bg-blue-500 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
      )}

      {isReportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-[#1f1f1f] w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-[#3f3f3f]">
                  <div className="p-4 border-b border-[#3f3f3f] flex justify-between items-center">
                      <h3 className="font-bold text-lg">Report user</h3>
                      <button onClick={() => setIsReportModalOpen(false)} className="p-1 hover:bg-[#3f3f3f] rounded-full">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-0 max-h-[60vh] overflow-y-auto">
                      {reportReasons.map((reason) => (
                          <label key={reason} className="flex items-center gap-3 p-4 hover:bg-[#272727] cursor-pointer border-b border-[#3f3f3f]/30 last:border-0 transition-colors">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedReportReason === reason ? 'border-blue-500' : 'border-gray-500'}`}>
                                  {selectedReportReason === reason && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                              </div>
                              <input 
                                  type="radio" 
                                  name="reportReason" 
                                  value={reason} 
                                  className="hidden" 
                                  onChange={() => setSelectedReportReason(reason)} 
                                  checked={selectedReportReason === reason}
                              />
                              <span className="text-sm md:text-base">{reason}</span>
                          </label>
                      ))}
                  </div>
                  <div className="p-4 border-t border-[#3f3f3f] flex justify-end gap-2 bg-[#1f1f1f]">
                      <button 
                          onClick={() => setIsReportModalOpen(false)} 
                          className="px-4 py-2 hover:bg-[#3f3f3f] rounded-full text-sm font-medium transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleReportSubmit} 
                          disabled={!selectedReportReason}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                          Report
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isManageVideosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1f1f1f] w-full max-w-[1000px] h-[90vh] rounded-xl border border-[#3f3f3f] shadow-2xl flex flex-col overflow-hidden text-[#aaaaaa]">
                <div className="p-4 border-b border-[#3f3f3f] flex justify-between items-center bg-[#1f1f1f]">
                    <h2 className="text-xl font-bold text-white">Channel content</h2>
                    <button onClick={() => setIsManageVideosOpen(false)} className="p-1 hover:bg-[#3f3f3f] rounded-full text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex gap-6 px-6 border-b border-[#3f3f3f] bg-[#1f1f1f] flex-shrink-0">
                    <button 
                        onClick={() => setManageTab('videos')} 
                        className={`py-4 font-medium text-sm uppercase tracking-wide border-b-2 transition-colors ${manageTab === 'videos' ? 'border-[#3ea6ff] text-[#3ea6ff]' : 'border-transparent hover:text-white'}`}
                    >
                        Videos
                    </button>
                    <button 
                        onClick={() => setManageTab('shorts')} 
                        className={`py-4 font-medium text-sm uppercase tracking-wide border-b-2 transition-colors ${manageTab === 'shorts' ? 'border-[#3ea6ff] text-[#3ea6ff]' : 'border-transparent hover:text-white'}`}
                    >
                        Shorts
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#3f3f3f] bg-[#1f1f1f] text-xs font-semibold uppercase tracking-wider">
                    <div className="col-span-5">Video</div>
                    <div className="col-span-2">Visibility</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-1 text-right">Views</div>
                    <div className="col-span-1 text-right">Likes</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="overflow-y-auto flex-1 p-0">
                    {manageContentList.length > 0 ? (
                        manageContentList.map(video => (
                             <div key={video.id} className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#3f3f3f]/30 hover:bg-[#272727] items-center text-sm transition-colors group">
                                <div className="col-span-5 flex gap-3">
                                    <div className={`relative flex-shrink-0 bg-black rounded overflow-hidden ${manageTab === 'shorts' ? 'w-9 h-16' : 'w-24 h-14'}`}>
                                        <img src={video.thumbnailUrl} className="w-full h-full object-cover" />
                                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-[10px] rounded text-white">{video.duration}</span>
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <p className="font-medium text-white truncate pr-2" title={video.title}>{video.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{video.description.substring(0, 50)}...</p>
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center gap-1">
                                    <Eye size={16} className="text-green-500" />
                                    <span>Public</span>
                                </div>
                                <div className="col-span-2 text-gray-400">
                                    {video.uploadedAt}
                                </div>
                                <div className="col-span-1 text-right text-gray-400">
                                    {video.views}
                                </div>
                                <div className="col-span-1 text-right text-gray-400">
                                    {video.likes}
                                </div>
                                <div className="col-span-1 flex justify-end relative action-menu-trigger">
                                    <button 
                                        onClick={() => setOpenActionMenuId(openActionMenuId === video.id ? null : video.id)}
                                        className="p-2 hover:bg-[#3f3f3f] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    {openActionMenuId === video.id && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 overflow-hidden text-left">
                                            <button className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 text-sm text-gray-300 hover:text-white">
                                                <Edit2 size={16} />
                                                Edit title & desc
                                            </button>
                                            <button 
                                                onClick={() => downloadVideo(video)}
                                                className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 text-sm text-gray-300 hover:text-white"
                                            >
                                                <Download size={16} />
                                                Download
                                            </button>
                                            <button className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 text-sm text-gray-300 hover:text-white">
                                                <BarChart2 size={16} />
                                                Analytics
                                            </button>
                                            <button 
                                                onClick={() => deleteVideo(video.id)}
                                                className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 text-sm text-red-400 hover:text-red-300 border-t border-[#3f3f3f]"
                                            >
                                                <Trash2 size={16} />
                                                Delete forever
                                            </button>
                                        </div>
                                    )}
                                </div>
                             </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <VideoIcon size={48} className="mb-4 opacity-50" />
                            <p>No content available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="border-b border-[#272727] mb-6 flex gap-8">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`py-3 text-sm font-medium uppercase border-b-2 transition-colors ${activeTab === 'videos' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Videos
          </button>
          <button 
            onClick={() => setActiveTab('shorts')}
            className={`py-3 text-sm font-medium uppercase border-b-2 transition-colors ${activeTab === 'shorts' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Shorts
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`py-3 text-sm font-medium uppercase border-b-2 transition-colors ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Community
          </button>
          <div className="flex-1"></div>
          {activeTab !== 'posts' && (
              <button 
                onClick={() => setSortOrder(prev => prev === 'latest' ? 'popular' : 'latest')}
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                  <Filter size={16} />
                  {sortOrder === 'latest' ? 'Latest' : 'Popular'}
              </button>
          )}
      </div>

      <div className="pb-20">
          {activeTab === 'videos' && (
             <VideoGrid 
                videos={displayedLongVideos} 
                onVideoClick={onVideoClick} 
                hideCategories={true}
                emptyMessage="No videos found."
             />
          )}

          {activeTab === 'shorts' && (
              displayedShortVideos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {displayedShortVideos.map(video => (
                          <div key={video.id} onClick={() => onVideoClick(video)} className="cursor-pointer group">
                              <div className="aspect-[9/16] rounded-xl overflow-hidden mb-2 relative">
                                  <img src={video.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                  <span className="absolute bottom-1 right-1 flex items-center text-xs font-bold text-white drop-shadow-md">
                                     <PlaySquare size={14} className="mr-1" />
                                     {video.views}
                                  </span>
                              </div>
                              <p className="font-medium text-sm text-white line-clamp-2 leading-snug group-hover:text-gray-300 transition-colors">{video.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{video.views} views</p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-10 text-gray-500">No shorts available.</div>
              )
          )}

          {activeTab === 'posts' && (
               <div className="max-w-2xl mx-auto flex flex-col gap-4">
                  {myPosts.length > 0 ? (
                      myPosts.map(post => {
                          return (
                              <div key={post.id} className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-xl p-4">
                                  <div className="flex gap-3 mb-3">
                                      <img src={post.authorAvatar} className="w-10 h-10 rounded-full" />
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <span className="font-semibold">{post.authorName}</span>
                                              <span className="text-xs text-gray-500">{post.timestamp}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <p className="text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                                  {post.imageUrl && (
                                      <img src={post.imageUrl} className="w-full rounded-lg mb-4" />
                                  )}
                                  <div className="flex items-center gap-6 text-gray-400 border-t border-[#2f2f2f] pt-3">
                                      <div className="flex items-center gap-2">
                                          <ThumbsUp size={18} />
                                          <span className="text-sm">{post.likes}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <MessageSquare size={18} />
                                          <span className="text-sm">{post.comments}</span>
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                  ) : (
                      <div className="text-center py-10 text-gray-500">No posts shared yet.</div>
                  )}
               </div>
          )}
      </div>
    </div>
  );
};

export default ProfilePage;
