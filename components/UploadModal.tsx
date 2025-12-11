
import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, Video, Smartphone, MessageSquare, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateDescription, polishStatus } from '../services/gemini';

interface UploadModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

type UploadType = 'select' | 'long' | 'short' | 'post';

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
  const { addVideo, addPost, user, setActiveCategory } = useApp();
  const [uploadType, setUploadType] = useState<UploadType>('select');

  // Video/Short State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Post State
  const [postContent, setPostContent] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Auto set title from filename
      setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleGenerateDesc = async () => {
    if (!title) return;
    setIsGenerating(true);
    const desc = await generateDescription(title);
    setDescription(desc);
    setIsGenerating(false);
  };

  const handlePolishPost = async () => {
    if (!postContent.trim()) return;
    setIsPolishing(true);
    const polished = await polishStatus(postContent);
    setPostContent(polished);
    setIsPolishing(false);
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    // Create a fake URL for the file
    const videoUrl = URL.createObjectURL(file);
    // Use a placeholder thumb since we can't easily extract from file in browser without heavy libs
    const isShort = uploadType === 'short';
    const thumbnailUrl = isShort ? 'https://picsum.photos/300/500' : 'https://picsum.photos/600/400';

    addVideo({
      id: Date.now().toString(),
      title,
      description: description || 'No description provided.',
      videoUrl,
      thumbnailUrl,
      channelName: user.name,
      channelAvatar: user.avatar,
      views: '0',
      uploadedAt: 'Just now',
      duration: '0:00', // Mock duration
      type: isShort ? 'short' : 'long',
      likes: 0
    });
    
    setActiveCategory('Your Videos');
    handleSuccess();
  };

  const handlePostSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!postContent.trim()) return;

      addPost({
          id: Date.now().toString(),
          content: postContent,
          authorName: user.name,
          authorAvatar: user.avatar,
          timestamp: 'Just now',
          likes: 0,
          comments: 0
      });

      handleSuccess();
  };

  const handleSuccess = () => {
      if (onSuccess) {
          onSuccess();
      } else {
          onClose();
      }
  };

  const resetForm = () => {
      setUploadType('select');
      setFile(null);
      setTitle('');
      setDescription('');
      setPostContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1f1f1f] w-full max-w-lg rounded-2xl p-6 border border-[#3f3f3f] shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
              {uploadType !== 'select' && (
                  <button onClick={resetForm} className="p-1 hover:bg-[#3f3f3f] rounded-full mr-1">
                      <ArrowLeft size={20} />
                  </button>
              )}
              <h2 className="text-xl font-bold">
                  {uploadType === 'select' && 'Create'}
                  {uploadType === 'long' && 'Upload Video'}
                  {uploadType === 'short' && 'Upload Short'}
                  {uploadType === 'post' && 'Create Post'}
              </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#3f3f3f] rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Selection View */}
        {uploadType === 'select' && (
            <div className="flex flex-col gap-3">
                <button 
                    onClick={() => setUploadType('long')}
                    className="flex items-center gap-4 p-4 bg-[#121212] border border-[#303030] rounded-xl hover:bg-[#272727] hover:border-blue-500 transition-all group text-left"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Video size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Upload Video</h3>
                        <p className="text-sm text-gray-400">Share your long-form videos</p>
                    </div>
                </button>

                <button 
                    onClick={() => setUploadType('short')}
                    className="flex items-center gap-4 p-4 bg-[#121212] border border-[#303030] rounded-xl hover:bg-[#272727] hover:border-red-500 transition-all group text-left"
                >
                    <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Upload Short</h3>
                        <p className="text-sm text-gray-400">Share 60s vertical videos</p>
                    </div>
                </button>

                <button 
                    onClick={() => setUploadType('post')}
                    className="flex items-center gap-4 p-4 bg-[#121212] border border-[#303030] rounded-xl hover:bg-[#272727] hover:border-green-500 transition-all group text-left"
                >
                    <div className="w-12 h-12 rounded-full bg-green-600/20 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Create Post</h3>
                        <p className="text-sm text-gray-400">Share updates, polls, and pictures</p>
                    </div>
                </button>
            </div>
        )}

        {/* Video/Short Form */}
        {(uploadType === 'long' || uploadType === 'short') && (
            <form onSubmit={handleVideoSubmit} className="flex flex-col gap-4 animate-fade-in">
                <div className="border-2 border-dashed border-[#3f3f3f] rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud size={48} className="mb-2" />
                    <span className="text-sm font-medium">{file ? file.name : 'Select video file to upload'}</span>
                </div>

                <div className="flex gap-4">
                    <label className="flex-1">
                        <span className="text-sm font-medium text-gray-300 block mb-1">Title</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#121212] border border-[#3f3f3f] rounded-lg p-2 text-white focus:border-blue-500 outline-none"
                            placeholder="Video title"
                            required
                        />
                    </label>
                </div>

                <label>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-300">Description</span>
                        <button
                            type="button"
                            onClick={handleGenerateDesc}
                            disabled={isGenerating || !title}
                            className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50"
                        >
                            <Sparkles size={12} />
                            {isGenerating ? 'Generating...' : 'Auto-generate'}
                        </button>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#121212] border border-[#3f3f3f] rounded-lg p-2 text-white focus:border-blue-500 outline-none h-24 resize-none"
                        placeholder="Tell viewers about your video"
                    />
                </label>

                <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-full font-medium hover:bg-[#3f3f3f]">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!file || !title}
                        className="px-6 py-2 bg-blue-600 rounded-full font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Upload
                    </button>
                </div>
            </form>
        )}

        {/* Post Form */}
        {uploadType === 'post' && (
             <form onSubmit={handlePostSubmit} className="flex flex-col gap-4 animate-fade-in">
                 <div className="flex items-start gap-3">
                     <img src={user.avatar} className="w-10 h-10 rounded-full" alt="User" />
                     <div className="flex-1">
                         <p className="font-semibold text-sm mb-1">{user.name}</p>
                         <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full bg-[#121212] border border-[#3f3f3f] rounded-lg p-3 text-white focus:border-blue-500 outline-none h-32 resize-none"
                            autoFocus
                         />
                     </div>
                 </div>

                 <div className="flex justify-between items-center">
                      <button
                            type="button"
                            onClick={handlePolishPost}
                            disabled={isPolishing || !postContent.trim()}
                            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                        >
                            <Sparkles size={16} />
                            {isPolishing ? 'Polishing...' : 'Polish with AI'}
                        </button>
                     
                     <div className="flex gap-2 text-gray-400">
                         <button type="button" className="p-2 hover:bg-[#272727] rounded-full transition-colors">
                             <ImageIcon size={20} />
                         </button>
                     </div>
                 </div>

                 <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#3f3f3f]">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-full font-medium hover:bg-[#3f3f3f]">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!postContent.trim()}
                        className="px-6 py-2 bg-blue-600 rounded-full font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Post
                    </button>
                </div>
             </form>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
