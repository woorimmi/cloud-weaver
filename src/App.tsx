/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Info, Sparkles, Wind, Sun, CloudRain, Zap, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type CloudType = {
  id: string;
  name: string;
  latin: string;
  description: string;
  altitude: string;
  weather: string;
  prompt: string;
};

const CLOUD_TYPES: CloudType[] = [
  {
    id: 'cirrus',
    name: 'Cirrus',
    latin: 'Cirrus',
    description: 'Delicate, wispy strands of ice crystals that look like locks of hair or "mare\'s tails". They often indicate a change in weather.',
    altitude: 'High (Above 20,000 ft)',
    weather: 'Fair, but can signal an approaching warm front.',
    prompt: 'A high-altitude cirrus cloud, delicate wispy white strands against a deep blue sky, ethereal and feather-like, cinematic lighting, 8k resolution.'
  },
  {
    id: 'cumulus',
    name: 'Cumulus',
    latin: 'Cumulus',
    description: 'Fluffy, white cotton-ball clouds with flat bases. They are the classic "fair weather" clouds we see on sunny days.',
    altitude: 'Low (Below 6,500 ft)',
    weather: 'Fair weather, but can grow into storm clouds.',
    prompt: 'Majestic fluffy white cumulus clouds with flat bases, scattered across a bright sunny blue sky, soft shadows, volumetric lighting, photorealistic.'
  },
  {
    id: 'stratus',
    name: 'Stratus',
    latin: 'Stratus',
    description: 'Uniform, grayish clouds that often cover the entire sky like a blanket. They resemble fog that doesn\'t reach the ground.',
    altitude: 'Low (Below 6,500 ft)',
    weather: 'Dull, overcast days, sometimes with light mist or drizzle.',
    prompt: 'A vast, uniform layer of gray stratus clouds covering the sky, moody atmosphere, soft diffused light, cinematic fog, realistic texture.'
  },
  {
    id: 'cumulonimbus',
    name: 'Cumulonimbus',
    latin: 'Cumulonimbus',
    description: 'The "King of Clouds". Towering vertical clouds with an anvil-shaped top, associated with thunderstorms and heavy rain.',
    altitude: 'Vertical (From low to high)',
    weather: 'Thunderstorms, heavy rain, lightning, and sometimes hail.',
    prompt: 'A massive towering cumulonimbus storm cloud with a distinct anvil top, dark base, dramatic lightning flashes inside, sunset lighting on the edges, epic scale, hyper-realistic.'
  },
  {
    id: 'altocumulus',
    name: 'Altocumulus',
    latin: 'Altocumulus',
    description: 'Mid-level clouds that appear as gray or white sheets with round masses or rolls. They look like small waves on a lake.',
    altitude: 'Middle (6,500 - 20,000 ft)',
    weather: 'Can indicate thunderstorms later in the day if they appear on warm, sticky mornings.',
    prompt: 'Mid-level altocumulus clouds, white and gray patches arranged in a wavy pattern, "mackerel sky", golden hour lighting, high detail.'
  },
  {
    id: 'lenticular',
    name: 'Lenticular',
    latin: 'Altocumulus lenticularis',
    description: 'Lens-shaped clouds that form over mountains. They are often mistaken for UFOs because of their smooth, saucer-like appearance.',
    altitude: 'Middle to High',
    weather: 'Strong winds aloft, often stationary despite high winds.',
    prompt: 'Smooth, saucer-shaped lenticular clouds hovering over a snow-capped mountain peak, sunset colors, ethereal glow, cinematic landscape photography.'
  }
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const currentCloud = CLOUD_TYPES[currentIndex];

  const generateCloudImage = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    generateCloudImage(currentCloud.prompt);
  }, [currentIndex, generateCloudImage]);

  const nextCloud = () => {
    setCurrentIndex((prev) => (prev + 1) % CLOUD_TYPES.length);
  };

  const prevCloud = () => {
    setCurrentIndex((prev) => (prev - 1 + CLOUD_TYPES.length) % CLOUD_TYPES.length);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0502]" />
        <div 
          className="absolute inset-0 opacity-40 blur-[100px]"
          style={{
            background: `radial-gradient(circle at 50% 30%, #3a1510 0%, transparent 60%),
                         radial-gradient(circle at 10% 80%, #ff4e00 0%, transparent 50%),
                         radial-gradient(circle at 90% 10%, #4e00ff 0%, transparent 40%)`
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Info & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={currentCloud.id}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-orange-500/80 font-mono text-sm tracking-widest uppercase">
              <Cloud className="w-4 h-4" />
              <span>Atmospheric Atlas</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif italic font-light tracking-tighter leading-none">
              {currentCloud.name}
            </h1>
            
            <p className="text-xl text-white/60 font-serif italic">
              {currentCloud.latin}
            </p>

            <div className="h-px w-24 bg-white/20 my-6" />

            <p className="text-lg leading-relaxed text-white/80 max-w-md">
              {currentCloud.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Altitude</span>
                <p className="text-sm font-medium">{currentCloud.altitude}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Weather</span>
                <p className="text-sm font-medium">{currentCloud.weather}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4 pt-8">
            <button 
              onClick={prevCloud}
              className="p-4 rounded-full glass hover:bg-white/10 transition-all group"
              aria-label="Previous cloud"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={nextCloud}
              className="p-4 rounded-full glass hover:bg-white/10 transition-all group"
              aria-label="Next cloud"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => generateCloudImage(currentCloud.prompt)}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-full glass hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              <span className="font-medium tracking-wide">Regenerate Vision</span>
            </button>
          </div>
        </div>

        {/* Right Column: Visual Display */}
        <div className="lg:col-span-7 relative aspect-video lg:aspect-square group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCloud.id + (generatedImage || 'loading')}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/5"
            >
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/5 backdrop-blur-md">
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
                    <Cloud className="absolute inset-0 m-auto w-6 h-6 text-white/40 animate-pulse" />
                  </div>
                  <p className="text-sm font-mono tracking-widest text-white/40 uppercase animate-pulse">
                    Weaving the atmosphere...
                  </p>
                </div>
              ) : generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt={currentCloud.name}
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                  <p className="text-white/20 italic">Awaiting the sky...</p>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Image Label */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-mono">AI Generated Vision</p>
                  <p className="text-lg font-serif italic">{currentCloud.name} Formation</p>
                </div>
                <div className="flex gap-2">
                  <div className="p-2 rounded-lg glass">
                    <Sun className="w-4 h-4 text-orange-300" />
                  </div>
                  <div className="p-2 rounded-lg glass">
                    <Wind className="w-4 h-4 text-blue-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="relative z-10 mt-12 w-full max-w-6xl flex justify-between items-center border-t border-white/10 pt-6">
        <div className="flex gap-8">
          {CLOUD_TYPES.slice(0, 3).map((cloud, idx) => (
            <button
              key={cloud.id}
              onClick={() => setCurrentIndex(idx)}
              className={`text-[10px] uppercase tracking-widest transition-colors ${currentIndex === idx ? 'text-orange-400' : 'text-white/40 hover:text-white/60'}`}
            >
              0{idx + 1} {cloud.name}
            </button>
          ))}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-white/20 font-mono">
          © 2026 Atmospheric Research Division
        </div>
      </footer>
    </div>
  );
}
