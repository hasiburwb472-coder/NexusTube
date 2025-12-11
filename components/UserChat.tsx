
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, User as UserIcon, ShieldCheck } from 'lucide-react';

const UserChat: React.FC = () => {
  const { user, messages, sendMessage, ADMIN_ID } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = messages.filter(m => 
      (m.senderId === user.id && m.receiverId === ADMIN_ID) ||
      (m.senderId === ADMIN_ID && m.receiverId === user.id)
  ).sort((a, b) => a.timestamp - b.timestamp);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(ADMIN_ID, inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1f1f1f] rounded-2xl shadow-2xl border border-[#3f3f3f] flex flex-col h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#3f3f3f] bg-[#252525] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
                <h2 className="font-bold text-white">Creative Director</h2>
                <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Online
                </p>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]">
            {conversation.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                    <p>Start a conversation with the Creative Director.</p>
                    <p className="text-xs mt-2">Expect a reply within 24 hours.</p>
                </div>
            )}
            
            {conversation.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                            isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-[#272727] text-gray-200 rounded-bl-none'
                        }`}>
                            <p>{msg.content}</p>
                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#3f3f3f] bg-[#252525] flex gap-2">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#121212] border border-[#3f3f3f] rounded-full px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
            />
            <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send size={18} />
            </button>
        </form>
      </div>
    </div>
  );
};

export default UserChat;
