
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Video, Eye, Activity, TrendingUp, Calendar, MonitorPlay, Search, ArrowUpRight, Flag, ShieldAlert, Check, Trash2, Ban, X, PlaySquare, LayoutDashboard, FileVideo, Settings, MessageSquare, Send, MessageCircle } from 'lucide-react';

interface CreativeDirectorDashboardProps {
    view: 'admin-dashboard' | 'admin-users' | 'admin-reports' | 'admin-content' | 'admin-settings' | 'admin-messages';
}

const CreativeDirectorDashboard: React.FC<CreativeDirectorDashboardProps> = ({ view: initialView }) => {
  const { availableUsers, videos, reports, dismissReport, deleteVideo, deleteUser, messages, sendMessage, user } = useApp();
  const [internalView, setInternalView] = useState(initialView);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingChannel, setInspectingChannel] = useState<string | null>(null);
  
  // Chat State
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setInternalView(initialView);
  }, [initialView]);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatUserId, messages]);

  // Helper to parse views string to number
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
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  const getJoinedDate = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const start = new Date(2018, 0, 1).getTime();
    const end = new Date(2023, 11, 31).getTime();
    const date = new Date(start + (Math.abs(hash) % (end - start)));
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getSubCount = (name: string) => {
      return Math.abs(name.length * 123456);
  };

  const channelStats = useMemo(() => {
      const channelMap = new Map<string, any>();

      availableUsers.forEach(u => {
          channelMap.set(u.name, {
              name: u.name,
              avatar: u.avatar,
              id: u.id,
              role: u.isCreativeDirector ? 'Director' : 'Creator',
              type: 'user',
              joined: getJoinedDate(u.name),
              rawSubs: getSubCount(u.name),
              email: u.email || 'N/A'
          });
      });

      const stats = new Map<string, { views: number, videos: number }>();

      videos.forEach(v => {
          const current = stats.get(v.channelName) || { views: 0, videos: 0 };
          current.views += parseViews(v.views);
          current.videos += 1;
          stats.set(v.channelName, current);

          if (!channelMap.has(v.channelName)) {
              channelMap.set(v.channelName, {
                  name: v.channelName,
                  avatar: v.channelAvatar,
                  id: `ch_${v.channelName.substring(0,3).toLowerCase()}_${Math.floor(Math.random()*1000)}`,
                  role: 'Content',
                  type: 'content',
                  joined: getJoinedDate(v.channelName),
                  rawSubs: getSubCount(v.channelName),
                  email: `${v.channelName.replace(/\s+/g, '').toLowerCase()}@nexus.com`
              });
          }
      });

      const result = Array.from(channelMap.values()).map(c => {
          const s = stats.get(c.name) || { views: 0, videos: 0 };
          return {
              ...c,
              totalViews: s.views,
              videoCount: s.videos,
              formattedSubs: formatNumber(c.rawSubs)
          };
      });

      return result.sort((a, b) => b.totalViews - a.totalViews);
  }, [availableUsers, videos]);

  const filteredChannels = channelStats.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVideos = videos.filter(v => 
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.channelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlatformViews = channelStats.reduce((acc, curr) => acc + curr.totalViews, 0);
  const totalPlatformVideos = videos.length;

  const channelVideos = inspectingChannel ? videos.filter(v => v.channelName === inspectingChannel) : [];

  const handleBanChannel = (channelName: string) => {
      if (confirm(`Are you sure you want to BAN ${channelName}? This will delete all their videos and posts.`)) {
          deleteUser(channelName);
          setInspectingChannel(null);
      }
  };

  const handleDeleteVideo = (videoId: string) => {
      if (confirm("Are you sure you want to delete this video?")) {
          deleteVideo(videoId);
      }
  };

  const handleTakeAction = (report: any) => {
      if (report.type === 'video') {
          if (confirm(`Delete reported video: "${report.targetName}"?`)) {
              deleteVideo(report.targetId);
              dismissReport(report.id);
          }
      } else if (report.type === 'user') {
          if (confirm(`Ban reported user: "${report.targetName}"? This will wipe all their content.`)) {
              deleteUser(report.targetName);
              dismissReport(report.id);
          }
      }
  };

  // --- CHAT LOGIC ---
  const chatUsers = useMemo(() => {
      const userIds = new Set<string>();
      messages.forEach(m => {
          if (m.senderId !== user.id) userIds.add(m.senderId);
          if (m.receiverId !== user.id) userIds.add(m.receiverId);
      });
      return Array.from(userIds).map(uid => availableUsers.find(u => u.id === uid)).filter(Boolean) as any[];
  }, [messages, availableUsers, user.id]);

  const activeMessages = messages.filter(m => 
      (m.senderId === user.id && m.receiverId === activeChatUserId) ||
      (m.senderId === activeChatUserId && m.receiverId === user.id)
  ).sort((a, b) => a.timestamp - b.timestamp);

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (chatInput.trim() && activeChatUserId) {
          sendMessage(activeChatUserId, chatInput.trim());
          setChatInput('');
      }
  };

  const startChatWithUser = (userId: string) => {
      setActiveChatUserId(userId);
      setInternalView('admin-messages');
  };

  const getPageTitle = () => {
      switch(internalView) {
          case 'admin-dashboard': return 'Platform Overview';
          case 'admin-users': return 'User Management';
          case 'admin-reports': return 'Safety Center';
          case 'admin-content': return 'Global Content';
          case 'admin-settings': return 'Platform Settings';
          case 'admin-messages': return 'Messages';
          default: return 'Dashboard';
      }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-fade-in pb-20 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-[#333] pb-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    {internalView === 'admin-dashboard' && <LayoutDashboard className="text-blue-500" />}
                    {internalView === 'admin-users' && <Users className="text-blue-500" />}
                    {internalView === 'admin-reports' && <ShieldAlert className="text-red-500" />}
                    {internalView === 'admin-content' && <FileVideo className="text-purple-500" />}
                    {internalView === 'admin-settings' && <Settings className="text-gray-400" />}
                    {internalView === 'admin-messages' && <MessageSquare className="text-green-500" />}
                    {getPageTitle()}
                </h1>
                <p className="text-gray-400 mt-2">Nexus Tube Administration Console</p>
            </div>
            <div className="flex items-center gap-3">
                 <div className="px-4 py-2 bg-[#272727] text-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#3f3f3f]">
                    System Online
                </div>
                {reports.length > 0 && (
                    <div className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-bold border border-red-500/20 flex items-center gap-2 animate-pulse">
                        <ShieldAlert size={16} />
                        {reports.length} Reports
                    </div>
                )}
            </div>
        </div>

        {internalView === 'admin-dashboard' && (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#151515] p-6 rounded-xl border border-[#333] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</div>
                        <h3 className="text-4xl font-bold text-white">{channelStats.length}</h3>
                        <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
                            <TrendingUp size={16} />
                            <span>+12.5% this week</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#151515] p-6 rounded-xl border border-[#333] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Content Items</div>
                        <h3 className="text-4xl font-bold text-white">{totalPlatformVideos}</h3>
                        <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
                            <TrendingUp size={16} />
                            <span>+5.2% this week</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#151515] p-6 rounded-xl border border-[#333] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Views</div>
                        <h3 className="text-4xl font-bold text-white">{formatNumber(totalPlatformViews)}</h3>
                        <div className="flex items-center gap-2 mt-4 text-green-400 text-sm">
                            <TrendingUp size={16} />
                            <span>+24% this week</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#151515] p-6 rounded-xl border border-[#333] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Actions</div>
                        <h3 className="text-4xl font-bold text-white">{reports.length}</h3>
                        <div className="flex items-center gap-2 mt-4 text-orange-400 text-sm">
                            <Activity size={16} />
                            <span>Needs attention</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Placeholder */}
                <div className="bg-[#151515] rounded-xl border border-[#333] p-6">
                    <h3 className="text-lg font-bold mb-4">System Health</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Server Load</span>
                            <span className="text-green-400 font-mono">12%</span>
                        </div>
                        <div className="w-full bg-[#333] h-2 rounded-full">
                            <div className="bg-green-500 h-2 rounded-full w-[12%]"></div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-gray-400">Database Storage</span>
                            <span className="text-blue-400 font-mono">45%</span>
                        </div>
                        <div className="w-full bg-[#333] h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full w-[45%]"></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-[#151515] rounded-xl border border-[#333] p-6 flex flex-col justify-center items-center text-center">
                    <ShieldAlert size={48} className="text-gray-600 mb-4" />
                    <h3 className="text-lg font-bold">Safety Center</h3>
                    <p className="text-gray-400 text-sm mt-2">Manage user reports and flagged content directly from the Reports tab.</p>
                </div>
            </div>
        </>
        )}

        {(internalView === 'admin-users' || internalView === 'admin-dashboard') && internalView !== 'admin-dashboard' && (
            <div className="bg-[#151515] rounded-xl border border-[#333] shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#333] flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                        <Users className="text-gray-400" />
                        <h2 className="text-lg font-bold">User Database</h2>
                        <span className="bg-[#333] text-gray-400 text-xs px-2 py-1 rounded-full">{filteredChannels.length}</span>
                    </div>
                    
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#111] text-gray-500 text-xs uppercase tracking-wider border-b border-[#333]">
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Registered</th>
                                <th className="px-6 py-4 font-semibold text-right">Subs</th>
                                <th className="px-6 py-4 font-semibold text-right">Videos</th>
                                <th className="px-6 py-4 font-semibold text-right">Views</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#333]/50">
                            {filteredChannels.map((channel, idx) => (
                                <tr key={idx} className="hover:bg-[#222] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={channel.avatar} alt={channel.name} className="w-10 h-10 rounded-full object-cover border border-[#333]" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                                    {channel.name}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{channel.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {channel.joined}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-300">
                                        {channel.formattedSubs}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${channel.videoCount > 0 ? 'bg-[#333] text-white' : 'bg-[#222] text-gray-500'}`}>
                                            {channel.videoCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-green-500">{formatNumber(channel.totalViews)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                            ACTIVE
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => startChatWithUser(channel.id)}
                                                className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded transition-colors"
                                                title="Message User"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setInspectingChannel(channel.name)}
                                                className="px-3 py-1.5 bg-[#252525] hover:bg-[#333] rounded text-xs font-bold text-white transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {internalView === 'admin-messages' && (
            <div className="bg-[#151515] rounded-xl border border-[#333] shadow-xl overflow-hidden flex h-[70vh]">
                {/* User List */}
                <div className="w-1/3 border-r border-[#333] flex flex-col bg-[#1a1a1a]">
                    <div className="p-4 border-b border-[#333]">
                        <h3 className="font-bold text-lg mb-4">Conversations</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search users..." 
                                className="w-full bg-[#111] border border-[#333] rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {chatUsers.map(u => (
                            <div 
                                key={u.id}
                                onClick={() => setActiveChatUserId(u.id)}
                                className={`p-4 border-b border-[#333]/50 cursor-pointer hover:bg-[#252525] flex items-center gap-3 transition-colors ${activeChatUserId === u.id ? 'bg-[#252525] border-l-4 border-l-blue-500' : ''}`}
                            >
                                <img src={u.avatar} className="w-10 h-10 rounded-full" alt={u.name} />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate text-white">{u.name}</h4>
                                    <p className="text-xs text-gray-500 truncate">@{u.handle}</p>
                                </div>
                            </div>
                        ))}
                        {chatUsers.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">No conversations started</div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col bg-[#151515]">
                    {activeChatUserId ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-[#333] bg-[#1a1a1a] flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <img src={availableUsers.find(u => u.id === activeChatUserId)?.avatar} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <h3 className="font-bold text-white">{availableUsers.find(u => u.id === activeChatUserId)?.name}</h3>
                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveChatUserId(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeMessages.map(msg => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#272727] text-gray-200 rounded-bl-none'}`}>
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-[#333] bg-[#1a1a1a] flex gap-2">
                                <input 
                                    type="text" 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type a message..." 
                                    className="flex-1 bg-[#111] border border-[#333] rounded-full px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                />
                                <button type="submit" disabled={!chatInput.trim()} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:opacity-50">
                                    <Send size={18} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <MessageSquare size={48} className="mb-4 opacity-50" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {internalView === 'admin-content' && (
             <div className="bg-[#151515] rounded-xl border border-[#333] shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#333] flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                        <FileVideo className="text-purple-500" />
                        <h2 className="text-lg font-bold">Global Content Monitor</h2>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search video title or channel..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                        />
                    </div>
                </div>
                <div className="p-0">
                    {filteredVideos.map((video) => (
                        <div key={video.id} className="flex gap-4 p-4 border-b border-[#333]/50 hover:bg-[#222] transition-colors items-center">
                            <div className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                                <img src={video.thumbnailUrl} className="w-full h-full object-cover" />
                                <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded text-white">{video.duration}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-white truncate">{video.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <span className="text-blue-400 font-medium">{video.channelName}</span>
                                    <span>•</span>
                                    <span>{video.views} views</span>
                                    <span>•</span>
                                    <span>{video.uploadedAt}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 font-mono">ID: {video.id}</div>
                            </div>
                            <button 
                                onClick={() => handleDeleteVideo(video.id)}
                                className="p-2 hover:bg-red-500/20 rounded text-red-500 transition-colors"
                                title="Delete Video"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {filteredVideos.length === 0 && (
                        <div className="p-12 text-center text-gray-500">No videos found.</div>
                    )}
                </div>
             </div>
        )}

        {internalView === 'admin-reports' && (
            <div className="bg-[#151515] rounded-xl border border-[#333] shadow-xl overflow-hidden">
                <div className="p-6 border-b border-[#333] bg-[#1a1a1a]">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Flag className="text-red-500" />
                        Reported Content Queue
                    </h2>
                </div>
                {reports.length > 0 ? (
                    <div className="divide-y divide-[#333]/50">
                        {reports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-[#222] transition-colors flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.type === 'video' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                            {report.type}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">{report.id}</span>
                                        <span className="text-xs text-gray-500">{report.timestamp}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        Subject: <span className="text-blue-400">{report.targetName}</span>
                                    </h3>
                                    <p className="text-gray-300 text-sm mb-3 bg-[#111] p-3 rounded border border-[#333]">
                                        <span className="font-bold text-red-400 block text-xs uppercase mb-1">Reason</span> 
                                        {report.reason}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Reported by: <span className="text-gray-300">{report.reportedBy}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    <button 
                                        onClick={() => handleTakeAction(report)}
                                        className="px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/20"
                                    >
                                        <Ban size={16} />
                                        {report.type === 'video' ? 'Delete Item' : 'Ban User'}
                                    </button>
                                    <button 
                                        onClick={() => dismissReport(report.id)}
                                        className="px-4 py-2 rounded-lg bg-[#333] text-gray-300 hover:bg-[#444] text-sm font-medium transition-colors"
                                    >
                                        Ignore Report
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center text-gray-500 flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <Check size={32} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">All Clear</h3>
                        <p>No active reports in the queue.</p>
                    </div>
                )}
            </div>
        )}

        {internalView === 'admin-settings' && (
            <div className="p-10 text-center text-gray-500 border border-[#333] rounded-xl bg-[#151515]">
                <Settings size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">System Settings</h3>
                <p>Configuration panel is restricted to super-admin access only.</p>
            </div>
        )}

        {/* Channel Management Modal */}
        {inspectingChannel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-[#1f1f1f] w-full max-w-4xl h-[80vh] rounded-2xl border border-[#3f3f3f] shadow-2xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[#3f3f3f] flex justify-between items-center bg-[#252525]">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Manage Channel: <span className="text-blue-400">{inspectingChannel}</span>
                        </h2>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleBanChannel(inspectingChannel)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg"
                            >
                                <Ban size={16} />
                                Ban Channel
                            </button>
                            <button 
                                onClick={() => setInspectingChannel(null)}
                                className="p-2 hover:bg-[#3f3f3f] rounded-full text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 bg-[#111]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {channelVideos.length > 0 ? channelVideos.map(video => (
                                <div key={video.id} className="flex gap-3 bg-[#1a1a1a] p-3 rounded-xl border border-[#333]">
                                    <div className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={video.thumbnailUrl} className="w-full h-full object-cover" />
                                        {video.type === 'short' && (
                                            <div className="absolute top-1 right-1 bg-red-600 rounded-sm p-0.5">
                                                <PlaySquare size={10} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-sm line-clamp-2 leading-tight mb-1 text-gray-200" title={video.title}>{video.title}</h4>
                                            <p className="text-xs text-gray-500">{video.views} views • {video.uploadedAt}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteVideo(video.id)}
                                            className="self-end text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 hover:bg-red-400/10 px-2 py-1 rounded transition-colors"
                                        >
                                            <Trash2 size={12} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-10 text-center text-gray-500">
                                    This channel has no videos.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CreativeDirectorDashboard;
