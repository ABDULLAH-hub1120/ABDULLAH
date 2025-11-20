import React, { useState } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { generateImage } from '../services/geminiService';
import { CREDIT_COST_PER_IMAGE } from '../config';
import { Button } from './ui/Button';
import { Sparkles, Download, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { currentUser, deductCredit, addToGallery, gallery, deleteFromGallery } = useGlobalState();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    if (!deductCredit(CREDIT_COST_PER_IMAGE)) {
      return; // deductCredit handles the toast error
    }

    setIsGenerating(true);

    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      
      addToGallery({
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: prompt,
        date: new Date().toISOString()
      });
      
      toast.success("Masterpiece created!");
    } catch (error) {
      toast.error("Generation failed. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-violet-500" />
          Create New Image
        </h2>
        
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enter your prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city made of crystal, golden hour lighting, cinematic 8k..."
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-end justify-end">
              <Button 
                type="submit" 
                isLoading={isGenerating}
                className="w-full md:w-auto h-12 text-lg px-8"
              >
                {isGenerating ? "Dreaming..." : `Generate (${CREDIT_COST_PER_IMAGE} Credit)`}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ImageIcon className="text-slate-400" />
          Your Session Gallery
        </h3>
        
        {gallery.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <div className="text-slate-500 mb-2">No images generated yet</div>
            <div className="text-sm text-slate-600">Your creations will appear here</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((img) => (
              <div key={img.id} className="group relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg transition-transform hover:-translate-y-1">
                <img src={img.url} alt={img.prompt} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <p className="text-white text-sm line-clamp-2 mb-4">{img.prompt}</p>
                  <div className="flex gap-2">
                    <a 
                      href={img.url} 
                      download={`abdullah-ai-${img.id}.jpg`}
                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={16} /> Save
                    </a>
                    <button 
                      onClick={() => deleteFromGallery(img.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
