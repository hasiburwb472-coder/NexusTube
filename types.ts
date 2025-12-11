
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelName: string;
  channelAvatar: string;
  views: string;
  uploadedAt: string; // ISO date or relative string
  duration: string;
  type: 'long' | 'short';
  likes: number;
}

export interface Post {
  id: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  likes: number;
  comments: number;
  imageUrl?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  description?: string;
  bannerUrl?: string;
  handle?: string;
  email?: string;
  phone?: string;
  isCreativeDirector?: boolean;
}

export interface Comment {
  id: string;
  targetId: string; // ID of the video or post
  targetType: 'video' | 'post';
  content: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  likes: number;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
  avatar: string;
  type?: 'video' | 'channel' | 'post';
  targetId?: string;
}

export interface Report {
  id: string;
  type: 'video' | 'user';
  targetId: string; // ID of video or name of user
  targetName: string; // Title of video or name of user
  reason: string;
  reportedBy: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

// Window augmentation for AI Studio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
