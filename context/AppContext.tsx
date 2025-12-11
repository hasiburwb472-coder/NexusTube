
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Video, Post, User, Comment, Notification, Report, Message } from '../types';

interface AppContextType {
  user: User;
  updateUser: (updates: Partial<User>) => void;
  availableUsers: User[];
  switchUser: (userId: string) => void;
  addUser: (name: string, email?: string) => void;
  deleteUser: (userName: string) => void;
  videos: Video[];
  posts: Post[];
  addVideo: (video: Video) => void;
  deleteVideo: (id: string) => void;
  addPost: (post: Post) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  toggleLike: (id: string, type: 'video' | 'post' | 'comment') => void;
  isLiked: (id: string) => boolean;
  likedVideos: Video[];
  showToast: (message: string) => void;
  subscribedChannels: Set<string>;
  toggleSubscribe: (channelName: string) => void;
  isSubscribed: (channelName: string) => boolean;
  channelNotifications: Set<string>;
  toggleChannelNotification: (channelName: string) => void;
  getChannelNotificationState: (channelName: string) => boolean;
  comments: Comment[];
  addComment: (targetId: string, targetType: 'video' | 'post', content: string) => void;
  getComments: (targetId: string) => Comment[];
  watchHistory: Video[];
  addToHistory: (video: Video) => void;
  downloadedVideos: Video[];
  downloadVideo: (video: Video) => void;
  pinnedVideos: Video[];
  togglePin: (video: Video) => void;
  isPinned: (id: string) => boolean;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  isAuthenticated: boolean;
  signup: (name: string, username: string, phone: string) => void;
  login: (userId: string) => void;
  logout: () => void;
  loginAsDirector: () => void;
  reports: Report[];
  addReport: (type: 'video' | 'user', targetId: string, targetName: string, reason: string) => void;
  dismissReport: (id: string) => void;
  messages: Message[];
  sendMessage: (receiverId: string, content: string) => void;
  getConversation: (otherUserId: string) => Message[];
  ADMIN_ID: string;
}

const MOCK_USER: User = {
  id: 'u1',
  name: "Creative User",
  handle: "creative_user",
  email: "creative@gmail.com",
  phone: "1234567890",
  avatar: "https://picsum.photos/id/64/100/100",
  description: "This is your personal channel. Upload videos, share posts, and manage your content here. Join the community and start creating!",
  bannerUrl: "https://picsum.photos/seed/banner1/1200/300",
  isCreativeDirector: false 
};

const SECOND_USER: User = {
    id: 'u2',
    name: "Vlog Star",
    handle: "vlog_star_official",
    email: "vlogstar@gmail.com",
    phone: "0987654321",
    avatar: "https://picsum.photos/id/129/100/100",
    description: "Daily vlogs and lifestyle content. Subscribe for more!",
    bannerUrl: "https://picsum.photos/seed/banner2/1200/300",
    isCreativeDirector: false
};

const ADMIN_USER: User = {
    id: 'admin_001',
    name: "Nexus Admin",
    handle: "creative_director",
    avatar: "https://ui-avatars.com/api/?name=Nexus+Admin&background=000&color=fff",
    description: "Platform Administrator",
    isCreativeDirector: true
};

const MOCK_VIDEOS: Video[] = [
  // --- GAMING ---
  {
    id: 'v1',
    title: 'Elden Ring: Shadow of the Erdtree - Ultimate Gaming Walkthrough',
    description: 'Join me as I explore the Land of Shadow in this first part of my Elden Ring Gaming walkthrough. We encounter new bosses, weapons, and lore!',
    thumbnailUrl: 'https://picsum.photos/seed/eldenring/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    channelName: 'Pro Gaming Souls',
    channelAvatar: 'https://ui-avatars.com/api/?name=Pro+Gamer&background=000&color=fff',
    views: '1.2M',
    uploadedAt: '1 day ago',
    duration: '45:20',
    type: 'long',
    likes: 25000
  },
  {
    id: 'v2',
    title: 'Minecraft 1.21 Update - Top 10 Gaming Secrets',
    description: 'The Tricky Trials update is here! We cover the Crafter, Trial Chambers, and all the new copper blocks in this comprehensive Gaming guide.',
    thumbnailUrl: 'https://picsum.photos/seed/minecraft/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    channelName: 'Block Gaming',
    channelAvatar: 'https://ui-avatars.com/api/?name=Block+Builder&background=00ff00&color=000',
    views: '850K',
    uploadedAt: '2 days ago',
    duration: '12:45',
    type: 'long',
    likes: 15000
  },
  {
    id: 'v3',
    title: 'Valorant Champions 2024 - Best Gaming Highlights',
    description: 'The most intense moments from the Grand Finals! Insane clutches and aces. Pure competitive Gaming at its finest.',
    thumbnailUrl: 'https://picsum.photos/seed/valorant/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    channelName: 'FPS Gaming Pro',
    channelAvatar: 'https://ui-avatars.com/api/?name=FPS+Pro&background=ff0000&color=fff',
    views: '2.5M',
    uploadedAt: '5 hours ago',
    duration: '22:10',
    type: 'long',
    likes: 95000
  },
  {
    id: 'v4',
    title: 'GTA 6 - Map Leak Analysis & Gaming News',
    description: 'Analyzing the latest map leaks for Grand Theft Auto VI. Is Vice City really returning? Reacting to the biggest Gaming news of the decade.',
    thumbnailUrl: 'https://picsum.photos/seed/gta6/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    channelName: 'Gaming News Hub',
    channelAvatar: 'https://ui-avatars.com/api/?name=Gaming+News&background=0000ff&color=fff',
    views: '500K',
    uploadedAt: '3 days ago',
    duration: '15:30',
    type: 'long',
    likes: 12000
  },
  {
    id: 'v5',
    title: 'Speedrunning Super Mario 64 - Gaming World Record',
    description: 'Can we beat the world record today? Live attempt at the 16 star category. This is peak performance Gaming.',
    thumbnailUrl: 'https://picsum.photos/seed/mario/640/360',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    channelName: 'SpeedRunner Gaming',
    channelAvatar: 'https://ui-avatars.com/api/?name=Speed+Runner&background=ffff00&color=000',
    views: '120K',
    uploadedAt: '12 hours ago',
    duration: '1:15:00',
    type: 'long',
    likes: 8000
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    content: "Just hit 100k subscribers! Thank you all so much for the support. New special video coming soon! 🎉",
    authorName: "Creative User",
    authorAvatar: "https://picsum.photos/id/64/100/100",
    timestamp: "2 hours ago",
    likes: 1500,
    comments: 245,
    imageUrl: "https://picsum.photos/seed/post1/600/400"
  },
  {
    id: 'p2',
    content: "What kind of content do you want to see next? Vote below!",
    authorName: "Vlog Star",
    authorAvatar: "https://picsum.photos/id/129/100/100",
    timestamp: "5 hours ago",
    likes: 850,
    comments: 120
  }
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1',
    targetId: 'v1',
    targetType: 'video',
    content: "This video changed my life! Amazing content.",
    authorName: "Alex Tech",
    authorAvatar: "https://ui-avatars.com/api/?name=Alex&background=random",
    timestamp: "1 hour ago",
    likes: 45
  },
  {
    id: 'c2',
    targetId: 'v1',
    targetType: 'video',
    content: "Can you do a tutorial on this?",
    authorName: "Sarah Vlogs",
    authorAvatar: "https://ui-avatars.com/api/?name=Sarah&background=pink",
    timestamp: "30 mins ago",
    likes: 12
  }
];

// Initial mock messages
const MOCK_MESSAGES: Message[] = [
    { id: 'm1', senderId: 'u1', receiverId: 'admin_001', content: 'Hi, I need help with my channel verification.', timestamp: Date.now() - 10000000, read: true },
    { id: 'm2', senderId: 'admin_001', receiverId: 'u1', content: 'Hello! I can certainly help with that. Please provide your documents.', timestamp: Date.now() - 9000000, read: true },
    { id: 'm3', senderId: 'u2', receiverId: 'admin_001', content: 'My video was flagged incorrectly.', timestamp: Date.now() - 500000, read: false }
];

interface UserData {
  likedIds: Set<string>;
  subscribedChannels: Set<string>;
  watchHistory: Video[];
  downloadedVideos: Video[];
  pinnedVideos: Video[];
  notifications: Notification[];
  channelNotifications: Set<string>; 
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [availableUsers, setAvailableUsers] = useState<User[]>([MOCK_USER, SECOND_USER]);
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS); 
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [reports, setReports] = useState<Report[]>([]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Store user-specific data keyed by User ID
  const [userData, setUserData] = useState<Record<string, UserData>>({
    [MOCK_USER.id]: {
        likedIds: new Set(),
        subscribedChannels: new Set(['Urban Explorer']),
        watchHistory: [],
        downloadedVideos: [],
        pinnedVideos: [],
        channelNotifications: new Set(['Urban Explorer']),
        notifications: []
    },
    [SECOND_USER.id]: {
        likedIds: new Set(),
        subscribedChannels: new Set(),
        watchHistory: [],
        downloadedVideos: [],
        pinnedVideos: [],
        channelNotifications: new Set(),
        notifications: []
    }
  });

  const currentUserData = userData[user.id] || {
      likedIds: new Set(),
      subscribedChannels: new Set(),
      watchHistory: [],
      downloadedVideos: [],
      pinnedVideos: [],
      notifications: [],
      channelNotifications: new Set()
  };

  const signup = (name: string, username: string, phone: string) => {
    const newUser: User = {
        id: 'u_' + Date.now(),
        name: name,
        handle: username,
        phone: phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`,
        email: "",
        description: `Welcome to ${name}'s official channel!`,
        isCreativeDirector: false 
    };

    setUserData(prev => ({
        ...prev,
        [newUser.id]: {
              likedIds: new Set(),
              subscribedChannels: new Set(),
              watchHistory: [],
              downloadedVideos: [],
              pinnedVideos: [],
              notifications: [],
              channelNotifications: new Set()
        }
    }));
    
    setAvailableUsers(prev => [newUser, ...prev]);
    setUser(newUser);
    setIsAuthenticated(true);
    showToast(`Welcome, ${name}!`);
  };

  const login = (userId: string) => {
      const found = availableUsers.find(u => u.id === userId);
      if (found) {
          setUser(found);
          setIsAuthenticated(true);
          showToast(`Welcome back, ${found.name}`);
      }
  };

  const loginAsDirector = () => {
      setUser(ADMIN_USER);
      setIsAuthenticated(true);
  };

  const logout = () => {
      setIsAuthenticated(false);
      setUser(MOCK_USER); // Reset to default mock for background
      showToast("Logged out successfully");
  };

  const addVideo = (video: Video) => {
    setVideos((prev) => [video, ...prev]);
  };
  
  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    showToast("Video deleted permanently");
  };

  const addPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
        const updated = { ...prev, ...updates };
        setAvailableUsers(users => users.map(u => u.id === prev.id ? { ...u, ...updates } : u));
        return updated;
    });
  };

  const switchUser = (userId: string) => {
      const found = availableUsers.find(u => u.id === userId);
      if (found) {
          setUser(found);
          showToast(`Switched to ${found.name}`);
      }
  };

  const addUser = (name: string, email?: string) => {
      const newUser: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          description: `Welcome to ${name}'s official channel!`,
          isCreativeDirector: false
      };
      
      setUserData(prev => ({
          ...prev,
          [newUser.id]: {
              likedIds: new Set(),
              subscribedChannels: new Set(),
              watchHistory: [],
              downloadedVideos: [],
              pinnedVideos: [],
              notifications: [],
              channelNotifications: new Set()
          }
      }));

      setAvailableUsers(prev => [...prev, newUser]);
      setUser(newUser);
      showToast(`Created profile: ${name}`);
  };

  const deleteUser = (userName: string) => {
      // 1. Remove User from available users
      setAvailableUsers(prev => prev.filter(u => u.name !== userName));
      
      // 2. Remove all videos by this user
      setVideos(prev => prev.filter(v => v.channelName !== userName));
      
      // 3. Remove all posts by this user
      setPosts(prev => prev.filter(p => p.authorName !== userName));
      
      // 4. Remove all comments by this user
      setComments(prev => prev.filter(c => c.authorName !== userName));
      
      // 5. Cleanup Reports related to this user
      setReports(prev => prev.filter(r => r.targetName !== userName && r.reportedBy !== userName));

      // 6. Force logout if the current user is deleted (edge case for self-deletion)
      if (user.name === userName) {
          logout();
      }
      
      showToast(`Channel "${userName}" banned and content wiped.`);
  };

  const isLiked = (id: string) => currentUserData.likedIds.has(id);

  const toggleLike = (id: string, type: 'video' | 'post' | 'comment') => {
    setUserData(prev => {
        const uData = prev[user.id] || { ...currentUserData };
        const nextLikedIds = new Set(uData.likedIds);
        const alreadyLiked = nextLikedIds.has(id);
        
        if (alreadyLiked) {
            nextLikedIds.delete(id);
        } else {
            nextLikedIds.add(id);
        }
        
        const modifier = alreadyLiked ? -1 : 1;
        if (type === 'video') {
            setVideos(vids => vids.map(v => v.id === id ? { ...v, likes: Math.max(0, v.likes + modifier) } : v));
        } else if (type === 'post') {
            setPosts(ps => ps.map(p => p.id === id ? { ...p, likes: Math.max(0, p.likes + modifier) } : p));
        } else if (type === 'comment') {
            setComments(cs => cs.map(c => c.id === id ? { ...c, likes: Math.max(0, c.likes + modifier) } : c));
        }

        return {
            ...prev,
            [user.id]: {
                ...uData,
                likedIds: nextLikedIds
            }
        };
    });
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const isSubscribed = (channelName: string) => currentUserData.subscribedChannels.has(channelName);

  const toggleSubscribe = (channelName: string) => {
      setUserData(prev => {
          const uData = prev[user.id] || { ...currentUserData };
          const nextSubs = new Set(uData.subscribedChannels);
          const nextNotifs = new Set(uData.channelNotifications);
          
          if (nextSubs.has(channelName)) {
              nextSubs.delete(channelName);
              nextNotifs.delete(channelName); 
              showToast(`Unsubscribed from ${channelName}`);
          } else {
              nextSubs.add(channelName);
              nextNotifs.add(channelName); 
              showToast(`Subscribed to ${channelName}`);
          }

          return {
              ...prev,
              [user.id]: {
                  ...uData,
                  subscribedChannels: nextSubs,
                  channelNotifications: nextNotifs
              }
          };
      });
  };

  const getChannelNotificationState = (channelName: string) => currentUserData.channelNotifications.has(channelName);

  const toggleChannelNotification = (channelName: string) => {
      setUserData(prev => {
          const uData = prev[user.id] || { ...currentUserData };
          const nextNotifs = new Set(uData.channelNotifications);
          const isOn = nextNotifs.has(channelName);
          
          if (isOn) {
              nextNotifs.delete(channelName);
              showToast("Notifications turned off for " + channelName);
          } else {
              nextNotifs.add(channelName);
              showToast("Notifications turned on for " + channelName);
          }
          
          return {
              ...prev,
              [user.id]: {
                  ...uData,
                  channelNotifications: nextNotifs
              }
          };
      });
  };

  const addComment = (targetId: string, targetType: 'video' | 'post', content: string) => {
      const newComment: Comment = {
          id: Date.now().toString(),
          targetId,
          targetType,
          content,
          authorName: user.name,
          authorAvatar: user.avatar,
          timestamp: 'Just now',
          likes: 0
      };
      setComments(prev => [newComment, ...prev]);
      
      if (targetType === 'post') {
          setPosts(prev => prev.map(p => 
            p.id === targetId ? { ...p, comments: p.comments + 1 } : p
          ));
      }
  };

  const getComments = (targetId: string) => {
      return comments.filter(c => c.targetId === targetId);
  };

  const addToHistory = (video: Video) => {
    setUserData(prev => {
        const uData = prev[user.id] || { ...currentUserData };
        
        let newHistory = uData.watchHistory || [];
        if (newHistory.length > 0 && newHistory[0].id === video.id) {
            return prev; 
        }
        
        const filtered = newHistory.filter(v => v.id !== video.id);
        newHistory = [video, ...filtered];

        return {
            ...prev,
            [user.id]: {
                ...uData,
                watchHistory: newHistory
            }
        };
    });
  };
  
  const downloadVideo = (video: Video) => {
      setUserData(prev => {
          const uData = prev[user.id] || { ...currentUserData };
          let newDownloads = uData.downloadedVideos || [];
          if (!newDownloads.some(v => v.id === video.id)) {
              newDownloads = [video, ...newDownloads];
          }

          return {
              ...prev,
              [user.id]: {
                  ...uData,
                  downloadedVideos: newDownloads
              }
          };
      });
      
      const link = document.createElement('a');
      link.href = video.videoUrl;
      link.target = '_blank';
      link.download = video.title || 'video';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast(`Downloading: ${video.title}`);
  };

  const togglePin = (video: Video) => {
    setUserData(prev => {
        const uData = prev[user.id] || { ...currentUserData };
        let newPinned = uData.pinnedVideos || [];
        const exists = newPinned.some(v => v.id === video.id);
        
        if (exists) {
            showToast("Removed from Pinned Videos");
            newPinned = newPinned.filter(v => v.id !== video.id);
        } else {
            showToast("Added to Pinned Videos");
            newPinned = [video, ...newPinned];
        }

        return {
            ...prev,
            [user.id]: {
                ...uData,
                pinnedVideos: newPinned
            }
        };
    });
  };

  const isPinned = (id: string) => currentUserData.pinnedVideos?.some((v) => v.id === id) || false;
  const likedVideos = videos.filter(v => currentUserData.likedIds.has(v.id));

  const markNotificationAsRead = (id: string) => {
      setUserData(prev => {
          const uData = prev[user.id] || { ...currentUserData };
          const newNotifications = uData.notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
          );
          return {
              ...prev,
              [user.id]: {
                  ...uData,
                  notifications: newNotifications
              }
          };
      });
  };

  const addReport = (type: 'video' | 'user', targetId: string, targetName: string, reason: string) => {
      const newReport: Report = {
          id: 'rep_' + Date.now(),
          type,
          targetId,
          targetName,
          reason,
          reportedBy: user.name,
          timestamp: new Date().toLocaleString()
      };
      setReports(prev => [newReport, ...prev]);
      showToast("Report submitted successfully");
  };

  const dismissReport = (id: string) => {
      setReports(prev => prev.filter(r => r.id !== id));
      showToast("Report dismissed");
  };

  const sendMessage = (receiverId: string, content: string) => {
      const newMessage: Message = {
          id: 'msg_' + Date.now(),
          senderId: user.id,
          receiverId: receiverId,
          content,
          timestamp: Date.now(),
          read: false
      };
      setMessages(prev => [...prev, newMessage]);
  };

  const getConversation = (otherUserId: string) => {
      return messages.filter(m => 
          (m.senderId === user.id && m.receiverId === otherUserId) ||
          (m.senderId === otherUserId && m.receiverId === user.id)
      ).sort((a, b) => a.timestamp - b.timestamp);
  };

  return (
    <AppContext.Provider value={{
      user,
      updateUser,
      availableUsers,
      switchUser,
      addUser,
      deleteUser,
      videos,
      posts,
      addVideo,
      deleteVideo,
      addPost,
      searchQuery,
      setSearchQuery,
      activeCategory,
      setActiveCategory,
      toggleLike,
      isLiked,
      likedVideos,
      showToast,
      subscribedChannels: currentUserData.subscribedChannels,
      toggleSubscribe,
      isSubscribed,
      comments,
      addComment,
      getComments,
      watchHistory: currentUserData.watchHistory,
      addToHistory,
      downloadedVideos: currentUserData.downloadedVideos,
      downloadVideo,
      pinnedVideos: currentUserData.pinnedVideos,
      togglePin,
      isPinned,
      notifications: currentUserData.notifications,
      markNotificationAsRead,
      channelNotifications: currentUserData.channelNotifications,
      toggleChannelNotification,
      getChannelNotificationState,
      isAuthenticated,
      signup,
      login,
      logout,
      loginAsDirector,
      reports,
      addReport,
      dismissReport,
      messages,
      sendMessage,
      getConversation,
      ADMIN_ID: ADMIN_USER.id
    }}>
      {children}
      <div 
        className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#1a1a1a]/95 backdrop-blur-md border border-pink-500/30 text-white pl-4 pr-6 py-3 rounded-xl shadow-2xl transition-all duration-500 z-[100] flex items-center gap-3 overflow-hidden ${
            toast.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <div className="relative w-10 h-10 flex items-center justify-center">
            <span className="text-2xl animate-[spin_3s_linear_infinite]">🌸</span>
            <div className={`absolute inset-0 flex items-center justify-center ${toast.show ? 'animate-ping opacity-50' : ''}`}>
               <span className="text-xl">🌺</span>
            </div>
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Success</span>
            <span className="text-sm font-medium">{toast.message}</span>
        </div>
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
