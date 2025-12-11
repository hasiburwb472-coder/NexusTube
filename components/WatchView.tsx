
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '../types';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, UserCheck, UserPlus, ListPlus, Flag, FileText, Pin, Check, X, BellRing, Bell, BellOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';

interface WatchViewProps {
  video: Video;
  onClose: () => void;
  onChannelClick: (channelName: string) => void;
}

const WatchView: React.FC<WatchViewProps> = ({ video, onClose, onChannelClick }) => {
  const { videos, toggleLike, isLiked, showToast, toggleSubscribe, isSubscribed, downloadVideo, togglePin, isPinned, toggleChannelNotification, getChannelNotificationState, addReport } = useApp();
  // Filter out current video for recommendations
  const recommendations = videos.filter(v => v.id !== video.id && v.type === 'long');
  const hasLiked = isLiked(video.id);
  const subscribed = isSubscribed(video.channelName);
  const notificationsOn = getChannelNotificationState(video.channelName);
  const isVideoPinned = isPinned(video.id);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubscribeMenuOpen, setIsSubscribeMenuOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string | null>(null);

  const subscribeMenuRef = useRef<HTMLDivElement>(null);

  const reportReasons = [
      "Sexual content",
      "Violent or repulsive content",
      "Hateful or abusive content",
      "Harassment or bullying",
      "Harmful or dangerous acts",
      "Misinformation",
      "Spam or misleading",
      "Child abuse",
      "Promotes terrorism"
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subscribeMenuRef.current && !subscribeMenuRef.current.contains(event.target as Node)) {
        setIsSubscribeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLikes = (num: number) => {
      return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  const handleShareClick = () => {
      setIsShareModalOpen(true);
  };

  const handleMenuAction = (action: string) => {
    showToast(action);
    setIsMenuOpen(false);
  };

  const handleReportClick = () => {
      setIsMenuOpen(false);
      setIsReportModalOpen(true);
      setSelectedReportReason(null);
  };

  const handleReportSubmit = () => {
      if (selectedReportReason) {
          addReport('video', video.id, video.title, selectedReportReason);
          setIsReportModalOpen(false);
          setSelectedReportReason(null);
      }
  };

  const handleSubscribeAction = (action: 'subscribe' | 'unsubscribe') => {
      if (action === 'subscribe' && !subscribed) {
          toggleSubscribe(video.channelName);
      } else if (action === 'unsubscribe' && subscribed) {
          toggleSubscribe(video.channelName);
      }
      setIsSubscribeMenuOpen(false);
  };

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(video.videoUrl);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen relative">
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={window.location.origin + "/watch/" + video.id}
        title={video.title}
      />

      {/* Main Content */}
      <div className="flex-1">
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-4">
          {youtubeId ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} 
              title={video.title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <video
                key={video.id} 
                src={video.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
            />
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-bold mb-3">{video.title}</h1>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#272727]">
          <div className="flex items-center gap-3">
             <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onChannelClick(video.channelName)}
             >
                <img src={video.channelAvatar} className="w-10 h-10 rounded-full" />
             </div>
             <div>
               <h3 
                  className="font-semibold text-base cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => onChannelClick(video.channelName)}
               >
                 {video.channelName}
               </h3>
               <span className="text-xs text-gray-400">102K subscribers</span>
             </div>
             
             {/* Subscribe Button Group */}
             <div className="flex items-center gap-2 ml-4">
                 <div className="relative" ref={subscribeMenuRef}>
                     <button 
                        onClick={() => setIsSubscribeMenuOpen(!isSubscribeMenuOpen)}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                            subscribed 
                            ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]' 
                            : 'bg-white text-black hover:bg-gray-200'
                        }`}
                     >
                       {/* The Check Sign Indicator */}
                       {subscribed && <Check size={16} className="text-white" />}
                       
                       {subscribed ? 'Subscribed' : 'Subscribe'}
                     </button>

                     {isSubscribeMenuOpen && (
                         <div className="absolute top-full left-0 mt-2 w-40 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 overflow-hidden">
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
                 
                 {/* Bell Icon */}
                 {subscribed && (
                     <button 
                        onClick={() => toggleChannelNotification(video.channelName)}
                        className={`p-2.5 bg-[#272727] hover:bg-[#3f3f3f] rounded-full transition-colors ${notificationsOn ? 'text-white' : 'text-gray-400'}`} 
                        title={notificationsOn ? "Notifications On" : "Notifications Off"}
                    >
                         {notificationsOn ? <BellRing size={20} className="fill-current" /> : <BellOff size={20} />}
                     </button>
                 )}
             </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-[#272727] rounded-full">
              <button 
                onClick={() => toggleLike(video.id, 'video')}
                className={`flex items-center gap-2 px-4 py-2 rounded-l-full border-r border-[#3f3f3f] transition-colors ${hasLiked ? 'bg-blue-600 hover:bg-blue-500' : 'hover:bg-[#3f3f3f]'}`}
              >
                <ThumbsUp size={18} className={hasLiked ? 'fill-white' : ''} />
                <span className="text-sm font-medium">{formatLikes(video.likes)}</span>
              </button>
              <button className="px-4 py-2 hover:bg-[#3f3f3f] rounded-r-full transition-colors">
                 <ThumbsDown size={18} />
              </button>
            </div>

            <button 
                onClick={handleShareClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition-colors"
            >
              <Share2 size={18} />
              <span className="text-sm font-medium">Share</span>
            </button>

            <button 
              onClick={() => downloadVideo(video)}
              className="flex items-center gap-2 px-4 py-2 bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition-colors"
            >
              <Download size={18} />
              <span className="text-sm font-medium">Download</span>
            </button>

            <button 
              onClick={() => togglePin(video)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isVideoPinned ? 'bg-[#272727] text-white border border-white' : 'bg-[#272727] hover:bg-[#3f3f3f] text-white'}`}
            >
              <Pin size={18} className={isVideoPinned ? 'fill-white' : ''} />
              <span className="text-sm font-medium">{isVideoPinned ? 'Pinned' : 'Pin'}</span>
            </button>

            <div className="relative">
                 <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition-colors"
                 >
                  <MoreHorizontal size={18} />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 py-2">
                        <button 
                            onClick={() => handleMenuAction('Saved to Watch Later')}
                            className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors text-sm"
                        >
                            <ListPlus size={18} />
                            Save to playlist
                        </button>
                         <button 
                            onClick={() => handleMenuAction('Transcript opened')}
                            className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors text-sm"
                        >
                            <FileText size={18} />
                            Show transcript
                        </button>
                         <button 
                             onClick={handleReportClick}
                             className="w-full text-left px-4 py-3 hover:bg-[#3f3f3f] flex items-center gap-3 transition-colors text-sm"
                        >
                            <Flag size={18} />
                            Report
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div 
          className="mt-4 bg-[#272727] p-4 rounded-xl cursor-pointer hover:bg-[#3f3f3f] transition-colors group"
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
        >
          <div className="flex gap-2 text-sm font-bold mb-2">
             <span>{video.views} views</span>
             <span>•</span>
             <span>{video.uploadedAt}</span>
          </div>
          <div className={isDescriptionExpanded ? "" : "line-clamp-2"}>
            <p className="text-sm text-white whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
          <button className="text-sm font-bold mt-2 text-gray-300 hover:text-white transition-colors">
            {isDescriptionExpanded ? "Show less" : "...more"}
          </button>
        </div>

        <CommentSection targetId={video.id} targetType="video" />
      </div>

      <div className="lg:w-[350px] xl:w-[400px] flex flex-col gap-3">
        {recommendations.map(rec => (
          <div key={rec.id} className="flex gap-2 group cursor-pointer">
            <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
               <img src={rec.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
               <span className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs rounded text-white">{rec.duration}</span>
            </div>
            <div>
               <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">{rec.title}</h4>
               <p className="text-xs text-gray-400">{rec.channelName}</p>
               <p className="text-xs text-gray-400">{rec.views} • {rec.uploadedAt}</p>
            </div>
          </div>
        ))}
        {recommendations.length === 0 && (
            <p className="text-gray-500 text-sm">No other videos to recommend.</p>
        )}
      </div>

      {isReportModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-[#1f1f1f] w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-[#3f3f3f]">
                  <div className="p-4 border-b border-[#3f3f3f] flex justify-between items-center">
                      <h3 className="font-bold text-lg">Report video</h3>
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
    </div>
  );
};

export default WatchView;
