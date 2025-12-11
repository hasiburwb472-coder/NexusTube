
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import ShortsPlayer from './components/ShortsPlayer';
import WatchView from './components/WatchView';
import CommunityFeed from './components/CommunityFeed';
import UploadModal from './components/UploadModal';
import VeoStudio from './components/VeoStudio';
import ProfilePage from './components/ProfilePage';
import AuthScreen from './components/AuthScreen';
import CreativeDirectorDashboard from './components/CreativeDirectorDashboard';
import UserChat from './components/UserChat';
import { AppProvider, useApp } from './context/AppContext';
import { Video, Notification } from './types';

const MainContent: React.FC = () => {
  const { addToHistory, watchHistory, likedVideos, downloadedVideos, videos, subscribedChannels, pinnedVideos, isAuthenticated, user } = useApp();
  
  // View State
  const [currentView, setCurrentView] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Redirect to Admin Dashboard on login if Director
  useEffect(() => {
      if (user.isCreativeDirector) {
          if (currentView === 'home' || currentView === 'chat') {
             setCurrentView('admin-dashboard');
          }
      } else if (currentView.startsWith('admin-')) {
          // If a regular user somehow ends up on an admin view, kick them out
          setCurrentView('home');
      }
  }, [user.isCreativeDirector, user.id, currentView]); // trigger on user login change

  if (!isAuthenticated) {
      return <AuthScreen />;
  }

  const handleVideoClick = (video: Video) => {
    addToHistory(video);
    if (video.type === 'short') {
        setSelectedShortId(video.id);
        setCurrentView('shorts');
    } else {
        setSelectedVideo(video);
        setCurrentView('watch');
    }
  };

  const handleChannelClick = (channelName: string) => {
      setSelectedChannel(channelName);
      setCurrentView('profile');
      setSelectedVideo(null);
      setSelectedShortId(null);
      window.scrollTo(0, 0);
  };

  const handleNav = (view: string) => {
      setCurrentView(view);
      setSelectedVideo(null);
      if (view !== 'shorts') {
          setSelectedShortId(null);
      }
      if (view === 'profile') {
          setSelectedChannel(null); // Null implies current user "My Profile"
      }
  };

  const handleUploadSuccess = () => {
      setIsUploadModalOpen(false);
      if (!user.isCreativeDirector) {
          setCurrentView('home');
      }
  };

  const handleSearchTrigger = () => {
      // If we are in a view that supports list filtering, stay there.
      const searchableViews = ['home', 'profile', 'history', 'liked', 'downloads', 'subscriptions', 'pinned', 'admin-content', 'admin-users'];
      if (!searchableViews.includes(currentView)) {
          handleNav(user.isCreativeDirector ? 'admin-dashboard' : 'home');
      }
  };

  const handleNotificationClick = (notification: Notification) => {
      if (notification.type === 'video' && notification.targetId) {
          const video = videos.find(v => v.id === notification.targetId);
          if (video) handleVideoClick(video);
      } else if (notification.type === 'channel' && notification.targetId) {
          handleChannelClick(notification.targetId);
      } else if (notification.type === 'post') {
          handleNav('community');
      }
  };

  const handleLogoClick = () => {
      if (user.isCreativeDirector) {
          handleNav('admin-dashboard');
      } else {
          handleNav('home');
      }
  };

  // Padding adjustment
  const getPaddingClass = () => {
      if (currentView === 'shorts' || currentView === 'watch') return 'pl-0 md:pl-0'; 
      return isSidebarOpen ? 'md:pl-64' : '';
  };

  const subscriptionVideos = videos.filter(v => subscribedChannels.has(v.channelName));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onUploadClick={() => setIsUploadModalOpen(true)}
        onProfileClick={() => handleNav('profile')}
        onSearch={handleSearchTrigger}
        onLogoClick={handleLogoClick}
        onNotificationClick={handleNotificationClick}
      />
      
      {isSidebarOpen && currentView !== 'watch' && currentView !== 'shorts' && (
        <Sidebar 
            currentView={currentView} 
            onChangeView={handleNav} 
            onChannelClick={handleChannelClick}
        />
      )}

      <main className={`pt-16 transition-all duration-300 ${getPaddingClass()}`}>
        {/* --- ADMIN VIEWS --- */}
        {currentView.startsWith('admin-') && (
            <CreativeDirectorDashboard 
                view={currentView as 'admin-dashboard' | 'admin-users' | 'admin-reports' | 'admin-content' | 'admin-settings' | 'admin-messages'} 
            />
        )}

        {/* --- USER VIEWS --- */}
        {!currentView.startsWith('admin-') && (
            <>
                {currentView === 'home' && (
                    <VideoGrid onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} />
                )}
                {currentView === 'shorts' && (
                    <ShortsPlayer initialVideoId={selectedShortId} onChannelClick={handleChannelClick} />
                )}
                {currentView === 'watch' && selectedVideo && (
                    <WatchView video={selectedVideo} onClose={() => handleNav('home')} onChannelClick={handleChannelClick} />
                )}
                {currentView === 'community' && <CommunityFeed onChannelClick={handleChannelClick} />}
                {currentView === 'veo' && <VeoStudio />}
                {currentView === 'profile' && (
                    <ProfilePage channelName={selectedChannel} onVideoClick={handleVideoClick} />
                )}
                {currentView === 'chat' && (
                    <UserChat />
                )}
                {currentView === 'history' && (
                    <div className="p-4 md:p-6">
                        <h2 className="text-2xl font-bold mb-4">Watch History</h2>
                        <VideoGrid onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} videos={watchHistory} hideCategories={true} emptyMessage="History empty." />
                    </div>
                )}
                {currentView === 'liked' && (
                    <div className="p-4 md:p-6">
                        <h2 className="text-2xl font-bold mb-4">Liked Videos</h2>
                        <VideoGrid onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} videos={likedVideos} hideCategories={true} emptyMessage="No likes yet." />
                    </div>
                )}
                {currentView === 'downloads' && (
                    <div className="p-4 md:p-6">
                        <h2 className="text-2xl font-bold mb-4">Downloads</h2>
                        <VideoGrid onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} videos={downloadedVideos} hideCategories={true} emptyMessage="No downloads." />
                    </div>
                )}
                {currentView === 'subscriptions' && (
                    <div className="p-4 md:p-6">
                        <h2 className="text-2xl font-bold mb-4">Subscriptions</h2>
                        <VideoGrid onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} videos={subscriptionVideos} hideCategories={true} emptyMessage="No subs content." />
                    </div>
                )}
                {currentView === 'pinned' && (
                    <div className="p-4 md:p-6">
                        <h2 className="text-2xl font-bold mb-4">Pinned</h2>
                        <VideoGrid onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} videos={pinnedVideos} hideCategories={true} emptyMessage="No pins." />
                    </div>
                )}
                {currentView === 'activity' && (
                    <div className="p-10 text-center text-gray-500">
                        <h2 className="text-2xl font-bold mb-2">Activity</h2>
                        <p>Under construction.</p>
                    </div>
                )}
            </>
        )}
      </main>

      {isUploadModalOpen && (
        <UploadModal 
            onClose={() => setIsUploadModalOpen(false)} 
            onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
