
import React from 'react';
import { Home, ThumbsUp, Activity, Download, Sparkles, LogOut, LayoutDashboard, ShieldAlert, Users, FileVideo, Settings, MessageSquare, Headphones } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  onChannelClick: (channelName: string) => void;
}

// Custom SVG for Shorts Logo
const ShortsIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.77 10.32L16.57 9.82L18 9.06C19.78 8.12 20.46 5.89 19.53 4.11C18.59 2.33 16.36 1.65 14.58 2.59L5.34 7.45C3.56 8.39 2.88 10.62 3.82 12.4C4.24 13.2 4.93 13.78 5.76 14.07L6.96 14.57L5.53 15.33C3.75 16.27 3.07 18.5 4.01 20.28C4.95 22.06 7.18 22.74 8.96 21.8L18.2 16.94C19.98 16 20.66 13.77 19.72 11.99C19.3 11.19 18.61 10.61 17.77 10.32ZM10 14.65V9.35L14.5 12L10 14.65Z" />
  </svg>
);

// Custom SVG for Community Logo
const CommunityIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L12 5" />
    <path d="M12 19L12 22" />
    <path d="M5 5L7 7" />
    <path d="M17 17L19 19" />
    <path d="M2 12L5 12" />
    <path d="M19 12L22 12" />
    <path d="M5 19L7 17" />
    <path d="M17 7L19 5" />
    <path d="M16 11l-2.6-2.6a1.9 1.9 0 0 0-2.8 0l-.8.8" />
    <path d="M12.6 14.4L16 11c1-1 2.2-1 3.2 0a2.2 2.2 0 0 1 0 3.2l-3.2 3.2" />
    <path d="M10.4 9.6L7 13c-1 1-2.2 1-3.2 0a2.2 2.2 0 0 1 0-3.2l3.2-3.2" />
    <path d="M8 11l2.6 2.6a1.9 1.9 0 0 0 2.8 0l.8-.8" />
  </svg>
);

// Custom SVG for Subscriptions Logo
const SubscriptionsIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20 6H4V4H20V6ZM18 10H6V8H18V10ZM2 14V20H22V14H2ZM10 15.5L15 17L10 18.5V15.5Z" />
  </svg>
);

// Custom SVG for Watch History
const HistoryIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
     <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" />
  </svg>
);

// Custom SVG for Pinned Videos
const PinnedIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 9V4l1 0c0.55 0 1 -0.45 1 -1s-0.45 -1 -1 -1L7 2c-0.55 0 -1 0.45 -1 1s0.45 1 1 1l1 0v5c0 1.66 -1.34 3 -3 3v2h5.97v7l1 1l1 -1v-7H19v-2c-1.66 0 -3 -1.34 -3 -3z" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onChannelClick }) => {
  const { subscribedChannels, videos, logout, user } = useApp();

  // --- ADMIN SIDEBAR ---
  if (user.isCreativeDirector) {
      const adminItems = [
          { id: 'admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'admin-messages', icon: MessageSquare, label: 'Messages' },
          { id: 'admin-content', icon: FileVideo, label: 'Content Monitor' },
          { id: 'admin-users', icon: Users, label: 'User Base' },
          { id: 'admin-reports', icon: ShieldAlert, label: 'Safety & Reports' },
          { id: 'admin-settings', icon: Settings, label: 'Platform Settings' },
      ];

      return (
        <div className="hidden md:flex flex-col w-64 h-[calc(100vh-64px)] fixed left-0 top-16 bg-[#0a0a0a] text-white p-2 overflow-y-auto z-40 border-r border-[#222]">
            <div className="px-4 py-4 mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Administration</span>
            </div>
            <div className="flex flex-col gap-2">
                {adminItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onChangeView(item.id)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                            currentView === item.id 
                            ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' 
                            : 'hover:bg-[#1f1f1f] text-gray-400 hover:text-white'
                        }`}
                    >
                        <item.icon size={20} className={currentView === item.id ? 'text-blue-500' : ''} />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="mt-auto border-t border-[#222] pt-4">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Secure Logout</span>
                </button>
            </div>
        </div>
      );
  }

  // --- STANDARD USER SIDEBAR ---
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'shorts', icon: ShortsIcon, label: 'Shorts' },
    { id: 'veo', icon: Sparkles, label: 'Chat with Creative' },
    { id: 'community', icon: CommunityIcon, label: 'Community' },
    { id: 'subscriptions', icon: SubscriptionsIcon, label: 'Subscriptions' },
  ];

  const libraryItems = [
    { id: 'history', icon: HistoryIcon, label: 'Watch history' },
    { id: 'liked', icon: ThumbsUp, label: 'Liked Videos' },
    { id: 'pinned', icon: PinnedIcon, label: 'Pinned Videos' },
    { id: 'activity', icon: Activity, label: 'Your activity' },
    { id: 'downloads', icon: Download, label: 'Download Videos' },
  ];

  const subscriptionList = Array.from(subscribedChannels).map(name => {
      const video = videos.find(v => v.channelName === name);
      return {
          name,
          avatar: video?.channelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name as string)}&background=random`
      };
  });

  return (
    <>
    <div className="hidden md:flex flex-col w-64 h-[calc(100vh-64px)] fixed left-0 top-16 bg-[#0f0f0f] text-white p-2 overflow-y-auto z-40">
      <div className="flex flex-col gap-2 mb-4">
        {menuItems.map((item) => {
          const isShorts = item.id === 'shorts';
          const isCommunity = item.id === 'community';
          const isHome = item.id === 'home';
          const isSubscriptions = item.id === 'subscriptions';
          const isVeo = item.id === 'veo';
          
          const isBlue = isShorts || isCommunity || isSubscriptions || isHome;
          const isRed = isVeo;

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id ? 'bg-[#272727]' : 'hover:bg-[#272727]'
              }`}
            >
              <item.icon 
                size={22} 
                className={
                    isShorts ? 'text-blue-500 fill-blue-500' : 
                    isBlue ? 'text-blue-500' : 
                    isRed ? 'text-red-500' : ''
                } 
              />
              <span className={
                  isBlue ? 'text-blue-500' : 
                  isRed ? 'text-red-500' : ''
              }>{item.label}</span>
            </button>
          );
        })}
        {/* User Chat Link */}
        <button
            onClick={() => onChangeView('chat')}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'chat' ? 'bg-[#272727] text-purple-400' : 'hover:bg-[#272727]'
            }`}
        >
            <Headphones size={22} className={currentView === 'chat' ? 'text-purple-400' : ''} />
            Chat with Director
        </button>
      </div>

      <div className="border-t border-[#3f3f3f] my-2 pt-2">
         <h3 className="px-4 py-2 text-md font-semibold mb-1">Library</h3>
         <div className="flex flex-col gap-2">
          {libraryItems.map((item) => {
            const isBlue = item.id === 'history' || item.id === 'liked' || item.id === 'pinned' || item.id === 'activity' || item.id === 'downloads';
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium hover:bg-[#272727] transition-colors ${isBlue ? 'text-blue-500' : ''}`}
              >
                <item.icon size={22} className={isBlue ? 'text-blue-500' : ''} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

       <div className="border-t border-[#3f3f3f] my-2 pt-2">
         <h3 className="px-4 py-2 text-md font-semibold mb-1">Subscriptions</h3>
         <div className="flex flex-col gap-2">
             {subscriptionList.map(sub => (
                 <div 
                    key={sub.name as string} 
                    onClick={() => onChannelClick(sub.name as string)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[#272727] rounded-lg cursor-pointer"
                 >
                     <img src={sub.avatar} className="w-6 h-6 rounded-full object-cover" />
                     <span className="text-sm truncate">{sub.name as string}</span>
                 </div>
             ))}
             {subscriptionList.length === 0 && (
                 <p className="px-4 text-xs text-gray-500 py-2">No subscriptions yet.</p>
             )}
         </div>
      </div>

      {/* Logout Button */}
      <div className="border-t border-[#3f3f3f] my-2 pt-2 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-[#272727] text-gray-400 hover:text-white"
          >
              <LogOut size={22} />
              <span>Log Out</span>
          </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
