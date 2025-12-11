
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, ThumbsUp, Share2, Sparkles, Check } from 'lucide-react';
import { polishStatus } from '../services/gemini';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';

interface CommunityFeedProps {
    onChannelClick: (channelName: string) => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ onChannelClick }) => {
  const { posts, addPost, user, toggleLike, isLiked, showToast, toggleSubscribe, isSubscribed } = useApp();
  const [newStatus, setNewStatus] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  
  // Track which subscription dropdown is open by channel name
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  
  // Share Modal State
  const [shareModalData, setShareModalData] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });

  const recommendedChannels = [
    { name: "MrBeast", avatar: "https://ui-avatars.com/api/?name=MrBeast&background=0D8ABC&color=fff", subs: "250M subscribers" },
    { name: "T-Series", avatar: "https://ui-avatars.com/api/?name=T-Series&background=ff0000&color=fff", subs: "260M subscribers" },
    { name: "MKBHD", avatar: "https://ui-avatars.com/api/?name=MKBHD&background=000&color=fff", subs: "18M subscribers" },
    { name: "Veritasium", avatar: "https://ui-avatars.com/api/?name=Veritasium&background=random", subs: "14M subscribers" },
    { name: "Dude Perfect", avatar: "https://ui-avatars.com/api/?name=Dude+Perfect&background=00ff00&color=000", subs: "60M subscribers" },
  ];

  const handlePost = () => {
    if (!newStatus.trim()) return;
    addPost({
      id: Date.now().toString(),
      content: newStatus,
      authorName: user.name,
      authorAvatar: user.avatar,
      timestamp: 'Just now',
      likes: 0,
      comments: 0
    });
    setNewStatus('');
  };

  const handlePolish = async () => {
    if(!newStatus.trim()) return;
    setIsPolishing(true);
    const polished = await polishStatus(newStatus);
    setNewStatus(polished);
    setIsPolishing(false);
  };

  const handleShareClick = (id: string, content: string) => {
      setShareModalData({
          isOpen: true,
          url: window.location.origin + "/post/" + id,
          title: content.slice(0, 30) + (content.length > 30 ? '...' : '')
      });
  };

  const toggleComments = (postId: string) => {
      if (expandedPostId === postId) {
          setExpandedPostId(null);
      } else {
          setExpandedPostId(postId);
      }
  };

  const handleSubscribeAction = (channelName: string, action: 'subscribe' | 'unsubscribe') => {
    const isSub = isSubscribed(channelName);
    if (action === 'subscribe' && !isSub) {
        toggleSubscribe(channelName);
    } else if (action === 'unsubscribe' && isSub) {
        toggleSubscribe(channelName);
    }
    setOpenSubMenu(null);
  };

  return (
    <div className="max-w-[1100px] mx-auto py-6 px-4 flex flex-col lg:flex-row gap-8">
      <ShareModal 
        isOpen={shareModalData.isOpen} 
        onClose={() => setShareModalData(prev => ({ ...prev, isOpen: false }))} 
        url={shareModalData.url} 
        title={shareModalData.title} 
      />

      {/* Feed Column */}
      <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
        {/* Create Post */}
        <div className="bg-[#272727] p-4 rounded-xl mb-6 shadow-lg border border-[#3f3f3f]">
          <div className="flex gap-4 mb-4">
            <div onClick={() => onChannelClick(user.name)} className="cursor-pointer">
                <img src={user.avatar} className="w-10 h-10 rounded-full" />
            </div>
            <div className="flex-1">
              <textarea
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-white resize-none outline-none border-b border-[#3f3f3f] focus:border-white transition-colors pb-2"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
              <button
                  onClick={handlePolish}
                  disabled={isPolishing || !newStatus}
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
              >
                  <Sparkles size={16} />
                  {isPolishing ? 'Polishing...' : 'Polish with AI'}
              </button>
              <div className="flex gap-2">
                  <button onClick={() => setNewStatus('')} className="px-4 py-2 text-sm font-medium hover:bg-[#3f3f3f] rounded-full">Cancel</button>
                  <button
                      onClick={handlePost}
                      disabled={!newStatus}
                      className="px-4 py-2 bg-blue-600 text-sm font-medium rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Post
                  </button>
              </div>
          </div>
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-4">
          {posts.map(post => {
              const hasLiked = isLiked(post.id);
              const isExpanded = expandedPostId === post.id;
              return (
                  <div key={post.id} className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-xl p-4">
                      <div className="flex gap-3 mb-3">
                      <div onClick={() => onChannelClick(post.authorName)} className="cursor-pointer">
                        <img src={post.authorAvatar} className="w-10 h-10 rounded-full" />
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                              <span 
                                className="font-semibold cursor-pointer hover:underline"
                                onClick={() => onChannelClick(post.authorName)}
                              >
                                {post.authorName}
                              </span>
                              <span className="text-xs text-gray-500">{post.timestamp}</span>
                          </div>
                      </div>
                      </div>
                      <p className="text-sm md:text-base leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                      {post.imageUrl && (
                          <img src={post.imageUrl} className="w-full rounded-lg mb-4" />
                      )}
                      <div className="flex items-center gap-6 text-gray-400 border-b border-[#2f2f2f] pb-3">
                      <button 
                          onClick={() => toggleLike(post.id, 'post')}
                          className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-blue-500' : 'hover:text-white'}`}
                      >
                          <ThumbsUp size={18} className={hasLiked ? 'fill-blue-500' : ''} />
                          <span className="text-sm">{post.likes}</span>
                      </button>
                      <button 
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-2 transition-colors ${isExpanded ? 'text-white' : 'hover:text-white'}`}
                      >
                          <MessageSquare size={18} />
                          <span className="text-sm">{post.comments}</span>
                      </button>
                      <button 
                          onClick={() => handleShareClick(post.id, post.content)}
                          className="p-1 hover:bg-[#3f3f3f] rounded-full transition-colors"
                      >
                          <Share2 size={18} />
                      </button>
                      </div>

                      {/* Comment Section Toggle */}
                      {isExpanded && (
                          <div className="animate-fade-in">
                              <CommentSection targetId={post.id} targetType="post" />
                          </div>
                      )}
                  </div>
              );
          })}
        </div>
      </div>

      {/* Sidebar Recommendation Column */}
      <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="bg-[#1f1f1f] border border-[#2f2f2f] rounded-xl p-4 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Recommended Channels</h3>
              <div className="flex flex-col gap-4">
                  {recommendedChannels.map((channel, idx) => {
                      const isSub = isSubscribed(channel.name);
                      const isMenuOpen = openSubMenu === channel.name;

                      return (
                          <div key={idx} className="flex items-center justify-between group cursor-pointer" onClick={() => onChannelClick(channel.name)}>
                              <div className="flex items-center gap-2">
                                  <img src={channel.avatar} alt={channel.name} className="w-10 h-10 rounded-full" />
                                  <div>
                                      <p className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{channel.name}</p>
                                      <p className="text-xs text-gray-500">{channel.subs}</p>
                                  </div>
                              </div>
                              <div className="relative">
                                  <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenSubMenu(isMenuOpen ? null : channel.name);
                                    }}
                                    className={`${isSub ? 'text-white bg-[#272727]' : 'text-blue-500 hover:bg-blue-500/10'} p-2 rounded-full transition-colors flex items-center justify-center`} 
                                    title={isSub ? "Unsubscribe" : "Subscribe"}
                                  >
                                      {/* Mini light indicator inside the circle button */}
                                      {isSub && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,1)] absolute top-2 right-2"></div>}
                                      {isSub ? <Check size={18} /> : <div className="w-4 h-4 border-2 border-current rounded-sm"></div>}
                                  </button>

                                  {isMenuOpen && (
                                     <div className="absolute right-0 top-full mt-2 w-32 bg-[#272727] border border-[#3f3f3f] rounded-xl shadow-xl z-20 overflow-hidden">
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); handleSubscribeAction(channel.name, 'subscribe'); }}
                                            className={`w-full text-left px-3 py-2 hover:bg-[#3f3f3f] flex items-center justify-between text-xs ${isSub ? 'opacity-50 cursor-default' : ''}`}
                                         >
                                             Subscribe
                                         </button>
                                         <button 
                                             onClick={(e) => { e.stopPropagation(); handleSubscribeAction(channel.name, 'unsubscribe'); }}
                                             className={`w-full text-left px-3 py-2 hover:bg-[#3f3f3f] flex items-center justify-between text-xs ${!isSub ? 'opacity-50 cursor-default' : ''}`}
                                         >
                                             Unsubscribe
                                         </button>
                                     </div>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
