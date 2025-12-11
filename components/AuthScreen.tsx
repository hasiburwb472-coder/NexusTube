
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Phone, AtSign, ArrowRight, Check, AlertCircle, LogIn, Sparkles, Video, Globe, Eye, EyeOff, X } from 'lucide-react';

const AuthScreen = () => {
    const { signup, login, availableUsers, videos, loginAsDirector, showToast } = useApp();
    
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Admin Modal State
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');

    // Validation States
    const [nameStatus, setNameStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [handleStatus, setHandleStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [phoneStatus, setPhoneStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Debounce validation
    useEffect(() => {
        const timer = setTimeout(() => validateName(name), 500);
        return () => clearTimeout(timer);
    }, [name]);

    useEffect(() => {
        const timer = setTimeout(() => validateHandle(handle), 500);
        return () => clearTimeout(timer);
    }, [handle]);

    useEffect(() => {
        const timer = setTimeout(() => validatePhone(phone), 500);
        return () => clearTimeout(timer);
    }, [phone]);

    const validateName = (val: string) => {
        if (!val) { setNameStatus('idle'); return; }
        // Check if name exists in registered users or as a channel name in videos
        const isTakenUser = availableUsers.some(u => u.name.toLowerCase() === val.toLowerCase());
        const isTakenChannel = videos.some(v => v.channelName.toLowerCase() === val.toLowerCase());
        
        if (isTakenUser || isTakenChannel) {
            setNameStatus('invalid');
            setErrorMsg(`The channel name "${val}" is already taken.`);
        } else {
            setNameStatus('valid');
            setErrorMsg('');
        }
    };

    const validateHandle = (val: string) => {
        if (!val) { setHandleStatus('idle'); return; }
        const cleanHandle = val.replace('@', '');
        const isTaken = availableUsers.some(u => (u.handle || '').toLowerCase() === cleanHandle.toLowerCase());
        
        if (isTaken) {
            setHandleStatus('invalid');
            setErrorMsg(`The handle @${cleanHandle} is already taken.`);
        } else {
            setHandleStatus('valid');
            setErrorMsg('');
        }
    };

    const validatePhone = (val: string) => {
        if (!val) { setPhoneStatus('idle'); return; }
        const isTaken = availableUsers.some(u => u.phone === val);
        
        if (isTaken) {
            setPhoneStatus('invalid');
            setErrorMsg('This phone number is already linked to a channel.');
        } else {
            setPhoneStatus('valid');
            setErrorMsg('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nameStatus === 'valid' && handleStatus === 'valid' && phoneStatus === 'valid' && password.length > 0) {
            signup(name, handle.replace('@', ''), phone);
        }
    };

    const handleAdminLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPasswordInput === 'nexus') {
            loginAsDirector();
            showToast("Welcome, Creative Director");
            setIsLoginModalOpen(false);
        } else {
            setLoginError("Incorrect password");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-4 relative overflow-hidden gap-6">
             {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
             </div>

             <div className="w-full max-w-md bg-[#1f1f1f] border border-[#3f3f3f] rounded-2xl p-8 shadow-2xl animate-fade-in relative z-10">
                <div className="text-center mb-8">
                     <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20 group hover:scale-110 transition-transform duration-300 cursor-pointer">
                        <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M26 6H14L6 14L18 14L26 6Z" fill="currentColor" fillOpacity="0.8" />
                            <path d="M6 26H18L26 18L14 18L6 26Z" fill="currentColor" />
                        </svg>
                     </div>
                     <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">Welcome Nexus Tube</h1>
                     <p className="text-gray-400 mb-6">Claim your creative space</p>

                     {/* Unique Features Badge Row */}
                     <div className="flex justify-center gap-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] rounded-lg border border-[#333] hover:border-blue-500/50 transition-colors cursor-default group">
                            <Sparkles size={12} className="text-blue-400 group-hover:animate-spin" />
                            <span>AI Studio</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] rounded-lg border border-[#333] hover:border-purple-500/50 transition-colors cursor-default group">
                            <Video size={12} className="text-purple-400 group-hover:animate-pulse" />
                            <span>4K Veo</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] rounded-lg border border-[#333] hover:border-green-500/50 transition-colors cursor-default group">
                            <Globe size={12} className="text-green-400" />
                            <span>Global</span>
                        </div>
                     </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Error Message */}
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2 animate-fade-in">
                            <AlertCircle size={16} className="flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    {/* Step 1: Name */}
                    <div className="relative group">
                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${nameStatus === 'valid' ? 'text-green-500' : 'text-gray-400'}`} size={20} />
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Channel Name" 
                            className={`w-full bg-[#121212] border rounded-xl py-3.5 pl-10 pr-10 text-white placeholder-gray-500 outline-none transition-all ${
                                nameStatus === 'valid' ? 'border-green-500/50 focus:border-green-500' : 
                                nameStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : 
                                'border-[#3f3f3f] focus:border-blue-500'
                            }`}
                        />
                        {nameStatus === 'valid' && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-0.5 animate-bounce">
                                <Check size={14} className="text-black" />
                            </div>
                        )}
                    </div>

                    {/* Step 2: Handle - Revealed when Name is valid */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${nameStatus === 'valid' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="relative">
                            <AtSign className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${handleStatus === 'valid' ? 'text-green-500' : 'text-gray-400'}`} size={20} />
                            <input 
                                type="text" 
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                placeholder="Handle (e.g. @creative_director)" 
                                className={`w-full bg-[#121212] border rounded-xl py-3.5 pl-10 pr-10 text-white placeholder-gray-500 outline-none transition-all ${
                                    handleStatus === 'valid' ? 'border-green-500/50 focus:border-green-500' : 
                                    handleStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : 
                                    'border-[#3f3f3f] focus:border-blue-500'
                                }`}
                            />
                             {handleStatus === 'valid' && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-0.5 animate-bounce">
                                    <Check size={14} className="text-black" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 3: Password & Phone - Revealed when Handle is valid */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${handleStatus === 'valid' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password" 
                                    className="w-full bg-[#121212] border border-[#3f3f3f] rounded-xl py-3.5 pl-10 pr-12 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className="relative">
                                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${phoneStatus === 'valid' ? 'text-green-500' : 'text-gray-400'}`} size={20} />
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => {
                                        // Only allow digits
                                        const val = e.target.value.replace(/\D/g, '');
                                        setPhone(val);
                                    }}
                                    placeholder="Phone Number" 
                                    className={`w-full bg-[#121212] border rounded-xl py-3.5 pl-10 pr-10 text-white placeholder-gray-500 outline-none transition-all ${
                                        phoneStatus === 'valid' ? 'border-green-500/50 focus:border-green-500' : 
                                        phoneStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : 
                                        'border-[#3f3f3f] focus:border-blue-500'
                                    }`}
                                />
                                {phoneStatus === 'valid' && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-0.5 animate-bounce">
                                        <Check size={14} className="text-black" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`transition-all duration-500 ease-in-out ${phoneStatus === 'valid' && password ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 pointer-events-none'}`}>
                        <button 
                            type="submit" 
                            disabled={phoneStatus !== 'valid' || !password}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20"
                        >
                            Enter Channel
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </form>
             </div>

             {/* Existing Profiles Section */}
             {availableUsers.length > 0 && (
                 <div className="w-full max-w-md animate-fade-in relative z-10">
                     <div className="flex items-center gap-4 mb-4">
                         <div className="h-px bg-[#3f3f3f] flex-1"></div>
                         <span className="text-gray-500 text-sm">Or continue as</span>
                         <div className="h-px bg-[#3f3f3f] flex-1"></div>
                     </div>
                     
                     <div className="flex flex-col gap-3">
                         {availableUsers.filter(u => !u.isCreativeDirector).map((u) => (
                             <button
                                 key={u.id}
                                 onClick={() => login(u.id)}
                                 className="flex items-center gap-4 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#3f3f3f] p-3 rounded-xl transition-all group w-full text-left"
                             >
                                 <div className="w-12 h-12 rounded-full overflow-hidden border border-[#3f3f3f] group-hover:border-blue-500 transition-colors">
                                     <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{u.name}</h3>
                                     <p className="text-xs text-gray-500">@{u.handle || u.name.replace(/\s+/g, '').toLowerCase()}</p>
                                 </div>
                                 <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                     <LogIn size={16} />
                                 </div>
                             </button>
                         ))}
                     </div>
                 </div>
             )}

             {/* Admin Login Button */}
             <div className="relative z-10 mt-8">
                 <button 
                    onClick={() => {
                        setIsLoginModalOpen(true);
                        setAdminPasswordInput('');
                        setLoginError('');
                    }}
                    className="text-xs text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2"
                 >
                     <Lock size={12} />
                     Creative Director Access
                 </button>
             </div>

            {/* Admin Login Modal */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#1f1f1f] w-full max-w-sm rounded-2xl p-6 border border-[#3f3f3f] shadow-2xl relative">
                        <button 
                            onClick={() => setIsLoginModalOpen(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-[#3f3f3f] rounded-full text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                                <Lock size={24} className="text-purple-500" />
                            </div>
                            <h2 className="text-xl font-bold">Admin Access</h2>
                            <p className="text-gray-400 text-sm text-center mt-1">
                                Enter password to access Creative Director Dashboard
                            </p>
                        </div>

                        <form onSubmit={handleAdminLoginSubmit} className="flex flex-col gap-4">
                            <input 
                                type="password" 
                                value={adminPasswordInput}
                                onChange={(e) => setAdminPasswordInput(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-[#121212] border border-[#303030] rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                autoFocus
                            />
                            
                            {loginError && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">
                                    <AlertCircle size={14} />
                                    {loginError}
                                </div>
                            )}

                            <button 
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                            >
                                Unlock Dashboard
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthScreen;
