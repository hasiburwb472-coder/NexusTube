
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Video } from '../types';
import { useApp } from '../context/AppContext';
import { Film, BellRing, BellOff } from 'lucide-react';

interface VideoGridProps {
  onVideoClick: (video: Video) => void;
  onChannelClick?: (channelName: string) => void;
  videos?: Video[];
  hideCategories?: boolean;
  emptyMessage?: string;
}

const VideoCard: React.FC<{ video: Video; onClick: (v: Video) => void; onChannelClick?: (name: string) => void }> = ({ video, onClick, onChannelClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const timeoutRef = useRef<any>(null);

    const handleMouseEnter = () => {
        setIsHovered(true);
        // Delay playback slightly to match YouTube's "hover to play" feel and avoid rapid flickering
        timeoutRef.current = setTimeout(() => {
            setIsPlaying(true);
        }, 500); 
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsPlaying(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleChannelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onChannelClick) {
            onChannelClick(video.channelName);
        }
    };

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div 
            className="cursor-pointer group" 
            onClick={() => onClick(video)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
             <div className={`relative rounded-xl overflow-hidden mb-3 ${video.type === 'short' ? 'aspect-[9/16] w-2/3 mx-auto bg-black' : 'aspect-video w-full'}`}>
              {isPlaying ? (
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
              ) : (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
              )}
              
              {!isPlaying && (
                  <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs rounded text-white font-medium">
                    {video.duration}
                  </span>
              )}
              {video.type === 'short' && (
                  <span className="absolute top-2 right-2 bg-red-600 px-2 py-0.5 text-xs rounded-sm text-white font-bold flex items-center gap-1">
                      <Film size={12} />
                      Shorts
                  </span>
              )}
            </div>
            <div className="flex gap-3">
              <div onClick={handleChannelClick} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                <img src={video.channelAvatar} className="w-9 h-9 rounded-full mt-1" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base line-clamp-2 leading-tight mb-1">
                  {video.title}
                </h3>
                <p 
                    onClick={handleChannelClick}
                    className="text-gray-400 text-sm hover:text-white transition-colors inline-block"
                >
                  {video.channelName}
                </p>
                <p className="text-gray-400 text-sm">
                  {video.views} views • {video.uploadedAt}
                </p>
              </div>
            </div>
        </div>
    );
};

const VideoGrid: React.FC<VideoGridProps> = ({ onVideoClick, onChannelClick, videos: customVideos, hideCategories, emptyMessage }) => {
  const { videos: contextVideos, searchQuery, activeCategory, setActiveCategory, user, isSubscribed, toggleSubscribe, toggleChannelNotification, getChannelNotificationState } = useApp();

  const categories = ['All', 'Gaming', 'Music', 'Tech', 'Vlogs', 'AI', 'Nature', 'MrBeast', 'Your Videos'];

  // Use customVideos if provided, otherwise default to context videos
  const sourceVideos = customVideos || contextVideos;

  const filteredVideos = sourceVideos.filter(v => {
      const query = searchQuery.toLowerCase();
      // Match title or channel name
      const matchesSearch = v.title.toLowerCase().includes(query) || v.channelName.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      // If viewing custom list (like history), skip category filtering unless search is active?
      // Actually, if customVideos are passed, we likely just want to show them all (filtered by search if typed).
      if (customVideos) {
          return true;
      }

      // Standard feed logic
      if (searchQuery) {
          // If searching, show all types (long and short) that match
          return true;
      }

      // Filter logic
      let matchesCat = false;
      if (activeCategory === 'All') {
          matchesCat = true;
      } else if (activeCategory === 'Your Videos') {
          matchesCat = v.channelName === user.name;
      } else {
          matchesCat = v.title.includes(activeCategory) || 
                       v.description.includes(activeCategory) || 
                       v.channelName.includes(activeCategory) || 
                       (activeCategory === 'Vlogs' && v.type === 'short');
      }

      // If viewing "Your Videos", allow shorts to appear in the grid so users can see all their uploads
      if (activeCategory === 'Your Videos') {
          return matchesCat;
      }

      return matchesCat && v.type === 'long';
  });

  // Derive matched channels if searching
  const matchedChannels = useMemo(() => {
    if (!searchQuery || customVideos) return []; // Don't show channel results if showing specific video list (like history)
    const query = searchQuery.toLowerCase();
    const channelMap = new Map<string, { name: string, avatar: string }>();

    contextVideos.forEach(v => {
        if (!channelMap.has(v.channelName)) {
            channelMap.set(v.channelName, { name: v.channelName, avatar: v.channelAvatar });
        }
    });

    return Array.from(channelMap.values()).filter(c => c.name.toLowerCase().includes(query));
  }, [searchQuery, contextVideos, customVideos]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 pb-20">
      {!hideCategories && !searchQuery && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Channel Results */}
      {searchQuery && matchedChannels.length > 0 && (
        <div className="flex flex-col gap-4 mb-8 max-w-4xl mx-auto w-full">
            {matchedChannels.map(channel => {
                const subscribed = isSubscribed(channel.name);
                const notificationsOn = getChannelNotificationState(channel.name);
                return (
                    <div 
                        key={channel.name} 
                        className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer hover:bg-[#1f1f1f] p-6 rounded-xl transition-colors border-b border-[#2f2f2f] sm:border-none"
                        onClick={() => onChannelClick && onChannelClick(channel.name)}
                    >
                        <img src={channel.avatar} alt={channel.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg flex-shrink-0" />
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold mb-1">{channel.name}</h3>
                            <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                                <span>@{channel.name.replace(/\s+/g, '').toLowerCase()}</span>
                                <span>•</span>
                                <span>{contextVideos.filter(v => v.channelName === channel.name).length} videos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSubscribe(channel.name);
                                    }}
                                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                                        subscribed 
                                        ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]' 
                                        : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                                >
                                    {subscribed ? 'Subscribed' : 'Subscribe'}
                                </button>
                                {subscribed && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleChannelNotification(channel.name);
                                        }}
                                        className={`p-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full transition-colors ${notificationsOn ? 'text-white' : 'text-gray-400'} border border-[#3f3f3f]`}
                                    >
                                        {notificationsOn ? <BellRing size={20} className="fill-current" /> : <BellOff size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onClick={onVideoClick} 
            onChannelClick={onChannelClick}
          />
        ))}
        {filteredVideos.length === 0 && matchedChannels.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
                {searchQuery ? `No results found for "${searchQuery}"` : 
                 emptyMessage ? emptyMessage : 
                 activeCategory === 'Your Videos' ? "You haven't uploaded any videos yet." :
                 "No videos found."}
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoGrid;
