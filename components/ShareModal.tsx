
import React from 'react';
import { X, Link, Mail, MessageCircle, Send, Facebook } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const { showToast } = useApp();
  
  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Link,
      color: 'bg-[#3f3f3f]',
      action: () => {
        navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard");
        onClose();
      }
    },
    {
      name: 'Gmail',
      icon: Mail,
      color: 'bg-red-600',
      href: `mailto:?subject=${encodedTitle}&body=Check this out: ${encodedUrl}`
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-400',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
        name: 'Facebook',
        icon: Facebook,
        color: 'bg-blue-700',
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#1f1f1f] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-[#3f3f3f]" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[#3f3f3f] flex justify-between items-center">
            <h3 className="font-bold text-lg">Share</h3>
            <button onClick={onClose} className="p-1 hover:bg-[#3f3f3f] rounded-full">
                <X size={20} />
            </button>
        </div>
        <div className="p-4 grid grid-cols-4 gap-4">
            {shareOptions.map((option) => (
                <button 
                    key={option.name}
                    onClick={() => {
                        if (option.action) option.action();
                        if (option.href) {
                            window.open(option.href, '_blank');
                            onClose();
                        }
                    }}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <option.icon size={24} />
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-white text-center">{option.name}</span>
                </button>
            ))}
        </div>
        <div className="p-4 bg-[#121212] border-t border-[#3f3f3f]">
            <div className="flex items-center bg-[#1f1f1f] border border-[#3f3f3f] rounded-lg px-3 py-2">
                <p className="text-xs text-gray-400 truncate flex-1">{url}</p>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(url);
                        showToast("Link copied");
                        onClose();
                    }}
                    className="text-blue-500 text-xs font-bold ml-2 hover:underline"
                >
                    Copy
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
