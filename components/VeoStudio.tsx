import React, { useState, useEffect } from 'react';
import { Sparkles, Film, Loader2, Key, Settings, Monitor, Smartphone } from 'lucide-react';
import { generateVeoVideo } from '../services/gemini';
import { useApp } from '../context/AppContext';

const VeoStudio: React.FC = () => {
  const { addVideo, user } = useApp();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Configuration state
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const has = await window.aistudio.hasSelectedApiKey();
      setHasKey(has);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      checkKey();
    } else {
        alert("AI Studio environment not detected.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !hasKey) return;
    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    try {
      const url = await generateVeoVideo(prompt, { resolution, aspectRatio });
      if (url) {
        setGeneratedVideoUrl(url);
      } else {
          alert("Failed to generate video.");
      }
    } catch (e) {
      alert("Error generating video. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
      if (!generatedVideoUrl) return;
      addVideo({
          id: Date.now().toString(),
          title: prompt.slice(0, 30) + " (AI Generated)",
          description: `Generated with Creative. Prompt: ${prompt}`,
          thumbnailUrl: 'https://picsum.photos/seed/veo/600/400',
          videoUrl: generatedVideoUrl,
          channelName: user.name,
          channelAvatar: user.avatar,
          views: '0',
          uploadedAt: 'Just now',
          duration: '0:05',
          type: aspectRatio === '9:16' ? 'short' : 'long',
          likes: 0
      });
      alert("Saved to your library!");
      setPrompt("");
      setGeneratedVideoUrl(null);
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center p-6">
        <div className="bg-[#1f1f1f] p-8 rounded-2xl border border-[#3f3f3f] max-w-md">
           <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key size={32} />
           </div>
           <h2 className="text-2xl font-bold mb-2">Unlock Creative Studio</h2>
           <p className="text-gray-400 mb-6">
             To generate videos with Creative AI, you need to select a paid API key from a valid Google Cloud Project.
           </p>
           <button
             onClick={handleSelectKey}
             className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold hover:opacity-90 transition-opacity"
           >
             Select API Key
           </button>
           <div className="mt-4 text-xs text-gray-500">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-white">
               Learn more about billing
             </a>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <Sparkles className="text-purple-400" />
                Chat with Creative
            </h1>
            <p className="text-gray-400">Describe your imagination, and watch it come to life.</p>
        </div>

        <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#3f3f3f] mb-8">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A neon hologram of a cat driving at top speed..."
                className="w-full bg-[#121212] border border-[#303030] rounded-xl p-4 text-white focus:border-purple-500 outline-none h-32 resize-none mb-4 text-lg"
            />
            
            {/* Configuration Controls */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[#121212] rounded-xl border border-[#303030]">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 w-full">
                    <Settings size={16} />
                    <span>Configuration</span>
                </div>
                
                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aspect Ratio</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setAspectRatio('16:9')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm transition-all ${
                                aspectRatio === '16:9' 
                                ? 'bg-purple-600/20 border-purple-500 text-purple-200' 
                                : 'bg-[#1f1f1f] border-[#3f3f3f] text-gray-400 hover:border-gray-500'
                            }`}
                        >
                            <Monitor size={16} />
                            16:9
                        </button>
                        <button 
                            onClick={() => setAspectRatio('9:16')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm transition-all ${
                                aspectRatio === '9:16' 
                                ? 'bg-purple-600/20 border-purple-500 text-purple-200' 
                                : 'bg-[#1f1f1f] border-[#3f3f3f] text-gray-400 hover:border-gray-500'
                            }`}
                        >
                            <Smartphone size={16} />
                            9:16
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resolution</label>
                    <div className="flex gap-2 h-full">
                         <button 
                            onClick={() => setResolution('720p')}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                resolution === '720p' 
                                ? 'bg-blue-600/20 border-blue-500 text-blue-200' 
                                : 'bg-[#1f1f1f] border-[#3f3f3f] text-gray-400 hover:border-gray-500'
                            }`}
                        >
                            720p
                        </button>
                        <button 
                            onClick={() => setResolution('1080p')}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                resolution === '1080p' 
                                ? 'bg-blue-600/20 border-blue-500 text-blue-200' 
                                : 'bg-[#1f1f1f] border-[#3f3f3f] text-gray-400 hover:border-gray-500'
                            }`}
                        >
                            1080p
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Model: veo-3.1-fast-generate-preview</span>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Film size={18} />}
                    {isGenerating ? 'Dreaming...' : 'Generate Video'}
                </button>
            </div>
        </div>

        {generatedVideoUrl && (
            <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#3f3f3f] animate-fade-in">
                <h3 className="text-lg font-semibold mb-4">Result</h3>
                {/* Dynamically adjust aspect ratio container based on selection */}
                <div className={`mx-auto bg-black rounded-lg overflow-hidden mb-4 relative group ${aspectRatio === '16:9' ? 'aspect-video w-full' : 'aspect-[9/16] h-[600px]'}`}>
                    <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                </div>
                <div className="flex justify-end gap-3">
                     <button onClick={() => setGeneratedVideoUrl(null)} className="px-4 py-2 hover:bg-[#3f3f3f] rounded-full text-sm font-medium">Discard</button>
                     <button onClick={handleSaveToLibrary} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-full text-sm font-bold">Save to Library</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default VeoStudio;