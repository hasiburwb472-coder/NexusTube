
import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Pause, Download, Check, BellRing, BellOff } from 'lucide-react';
import { Video } from '../types';
import ShareModal from './ShareModal';

interface ShortsPlayerProps {
    initialVideoId?: string | null;
    onChannelClick: (channelName: string) => void;
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ initialVideoId, onChannelClick }) => {
  const { videos, addToHistory } = useApp();
  const shorts = videos.filter(v => v.type === 'short');
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Initialize index based on passed ID if available
  const [currentIndex, setCurrentIndex] = useState(() => {
      if (initialVideoId) {
          const idx = shorts.findIndex(v => v.id === initialVideoId);
          return idx !== -1 ? idx : 0;
      }
      return 0;
  });

  // Scroll to the specific short on mount if needed
  useEffect(() => {
      if (initialVideoId && containerRef.current) {
          const idx = shorts.findIndex(v => v.id === initialVideoId);
          if (idx !== -1) {
             // Small timeout to ensure rendering
             setTimeout(() => {
                 containerRef.current?.scrollTo({
                     top: idx * containerRef.current.clientHeight,
                     behavior: 'auto' // Instant jump preferred for initial load
                 });
             }, 100);
          }
      }
  }, [initialVideoId, shorts]);

  // Simple scroll snap logic handling
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      if (index !== currentIndex && index >= 0 && index < shorts.length) {
        setCurrentIndex(index);
      }
    };

    const container = containerRef.current;
    if (container) {
        container.addEventListener('scroll', handleScroll);
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [currentIndex, shorts.length]);

  // Auto play/pause based on visibility and update history
  useEffect(() => {
    videoRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        if (idx === currentIndex) {
            ref.currentTime = 0;
            ref.play().catch(() => {});
            
            // Add to history when playing
            if (shorts[currentIndex]) {
                addToHistory(shorts[currentIndex]);
            }
        } else {
            ref.pause();
        }
    });
  }, [currentIndex, shorts, addToHistory]);

  if (shorts.length === 0) {
      return <div className="flex justify-center items-center h-full text-gray-500">No Shorts available. Upload some vertical videos!</div>;
  }

  return (
    <div
        ref={containerRef}
        className="h-[calc(100vh-64px)] w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide flex flex-col items-center"
    >
      {shorts.map((video, index) => (
        <ShortsCard
            key={video.id}
            video={video}
            isActive={index === currentIndex}
            setVideoRef={(el) => (videoRefs.current[index] = el)}
            onChannelClick={onChannelClick}
        />
      ))}
    </div>
  );
};

interface ShortsCardProps {
    video: Video;
    isActive: boolean;
    setVideoRef: (el: HTMLVideoElement | null) => void;
    onChannelClick: (name: string) => void;
}

const ShortsCard: React.FC<ShortsCardProps> = ({ video, isActive, setVideoRef, onChannelClick }) => {
    const { toggleLike, isLiked, showToast, toggleSubscribe, isSubscribed, downloadVideo, toggleChannelNotification, getChannelNotificationState } = useApp();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSubscribeMenuOpen, setIsSubscribeMenuOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const hasLiked = isLiked(video.id);
    const subscribed = isSubscribed(video.channelName);
    const notificationsOn = getChannelNotificationState(video.channelName);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsSubscribeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePlay = () => {
        // Handled by parent effect mostly, but allow click to toggle
        const videoEl = document.getElementById(`video-${video.id}`) as HTMLVideoElement;
        if (videoEl) {
            if (videoEl.paused) {
                videoEl.play();
                setIsPlaying(true);
            } else {
                videoEl.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleShareClick = () => {
        setIsShareModalOpen(true);
    };

    const formatLikes = (num: number) => {
        return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const handleSubscribeAction = (action: 'subscribe' | 'unsubscribe') => {
        if (action === 'subscribe' && !subscribed) {
            toggleSubscribe(video.channelName);
        } else if (action === 'unsubscribe' && subscribed) {
            toggleSubscribe(video.channelName);
        }
        setIsSubscribeMenuOpen(false);
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full max-w-[450px] snap-start shrink-0 relative flex items-center justify-center p-4">
            <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={window.location.origin + "/shorts/" + video.id}
                title={video.title}
            />

             <div className="relative w-full h-full max-h-[850px] rounded-xl overflow-hidden bg-[#1f1f1f]">
                 <video
                    id={`video-${video.id}`}
                    ref={setVideoRef}
                    src={video.videoUrl}
                    className="w-full h-full object-cover cursor-pointer"
                    loop
                    playsInline
                    onClick={togglePlay}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                 />

                 {/* Play Overlay */}
                 {!isPlaying && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <Play size={64} fill="white" className="text-white opacity-50" />
                     </div>
                 )}

                 {/* Content Overlay */}
                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pt-20">
                    <div className="flex items-end justify-between">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div 
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => onChannelClick(video.channelName)}
                                >
                                    <img src={video.channelAvatar} className="w-8 h-8 rounded-full border border-white" />
                                </div>
                                <span 
                                    className="font-semibold text-white cursor-pointer hover:underline"
                                    onClick={() => onChannelClick(video.channelName)}
                                >
                                    @{video.channelName.replace(/\s/g, '')}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                    <div className="relative" ref={menuRef}>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsSubscribeMenuOpen(!isSubscribeMenuOpen);
                                            }}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-full ml-2 transition-colors flex items-center gap-2 ${
                                                subscribed ? 'bg-[#272727] text-white border border-gray-500' : 'bg-white text-black'
                                            }`}
                                        >
                                            {subscribed && <Check size={12} className="text-white" />}
                                            {subscribed ? 'Subscribed' : 'Subscribe'}
                                        </button>

                                        {isSubscribeMenuOpen && (
                                            <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 overflow-hidden">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleSubscribeAction('subscribe'); }}
                                                    className={`w-full text-left px-3 py-2 hover:bg-[#3f3f3f] flex items-center justify-between text-xs text-white ${subscribed ? 'opacity-50 cursor-default' : ''}`}
                                                >
                                                    Subscribe
                                                    {subscribed && <Check size={12} className="text-green-500" />}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleSubscribeAction('unsubscribe'); }}
                                                    className={`w-full text-left px-3 py-2 hover:bg-[#3f3f3f] flex items-center justify-between text-xs text-white ${!subscribed ? 'opacity-50 cursor-default' : ''}`}
                                                >
                                                    Unsubscribe
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {subscribed && (
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleChannelNotification(video.channelName);
                                            }}
                                            className={`p-1.5 bg-[#272727]/80 hover:bg-[#3f3f3f] rounded-full ${notificationsOn ? 'text-white' : 'text-gray-400'} border border-gray-500 flex items-center justify-center`}
                                        >
                                             {notificationsOn ? <BellRing size={16} className="fill-current" /> : <BellOff size={16} />}
                                         </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-white text-sm line-clamp-2 mb-2">{video.title}</p>
                            <p className="text-white/80 text-xs">♫ Original Sound - {video.channelName}</p>
                        </div>

                        {/* Actions Sidebar */}
                        <div className="flex flex-col items-center gap-6 pb-2">
                            <button 
                                onClick={() => toggleLike(video.id, 'video')}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div className={`p-3 rounded-full transition ${hasLiked ? 'bg-white/20' : 'bg-gray-800/50 group-hover:bg-gray-700/50'}`}>
                                    <Heart size={28} fill={hasLiked ? "red" : "white"} className={hasLiked ? "text-red-600" : "text-white"} />
                                </div>
                                <span className="text-xs font-medium">{formatLikes(video.likes)}</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 group">
                                <div className="p-3 bg-gray-800/50 rounded-full group-hover:bg-gray-700/50 transition">
                                    <MessageCircle size={28} fill="white" className="text-white" />
                                </div>
                                <span className="text-xs font-medium">1.2K</span>
                            </button>
                            <button onClick={handleShareClick} className="flex flex-col items-center gap-1 group">
                                <div className="p-3 bg-gray-800/50 rounded-full group-hover:bg-gray-700/50 transition">
                                    <Share2 size={28} fill="white" className="text-white" />
                                </div>
                                <span className="text-xs font-medium">Share</span>
                            </button>
                            <button onClick={() => downloadVideo(video)} className="flex flex-col items-center gap-1 group">
                                <div className="p-3 bg-gray-800/50 rounded-full group-hover:bg-gray-700/50 transition">
                                    <Download size={28} fill="white" className="text-white" />
                                </div>
                                <span className="text-xs font-medium">Save</span>
                            </button>
                            <button className="p-3 bg-gray-800/50 rounded-full">
                                <MoreVertical size={24} className="text-white" />
                            </button>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
    );
};

export default ShortsPlayer;
