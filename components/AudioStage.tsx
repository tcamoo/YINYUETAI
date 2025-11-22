
import React, { useRef, useEffect, useState } from 'react';
import Visualizer from './Visualizer';
import { VisualizerMode, Track } from '../types';
import { Disc, Music, Mic2, ListMusic, Share2, Heart, Sparkles } from 'lucide-react';

interface AudioStageProps {
  audioUrl: string;
  isPlaying: boolean;
  volume: number;
  onEnded: () => void;
  onTimeUpdate: (progress: number) => void;
  trackInfo?: Track;
}

const AudioStage: React.FC<AudioStageProps> = ({ 
  audioUrl, 
  isPlaying, 
  volume, 
  onEnded,
  onTimeUpdate,
  trackInfo
}) => {
  const audioRef = useRef<HTMLVideoElement>(null);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>(VisualizerMode.BARS);

  useEffect(() => {
    if (!audioRef.current) return;
    const playAudio = async () => {
        try {
            if (isPlaying) await audioRef.current?.play();
            else audioRef.current?.pause();
        } catch (err) {
            console.error("Audio playback error", err);
        }
    };
    playAudio();
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      onTimeUpdate(progress || 0);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-ui-dark flex flex-col md:flex-row perspective-[1000px]">
      <video
        ref={audioRef}
        src={audioUrl}
        className="hidden"
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        crossOrigin="anonymous"
        playsInline
      />

      {/* --- Dynamic Background --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">
          {/* Ambient Glow */}
          {trackInfo && (
            <>
                <img 
                    src={trackInfo.thumbnail} 
                    className={`w-full h-full object-cover blur-[100px] opacity-30 scale-150 transition-all duration-[10s] ${isPlaying ? 'scale-125 animate-pulse-slow' : 'scale-100'}`} 
                    alt="bg" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black"></div>
            </>
          )}
          {/* Grid Floor */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-[linear-gradient(transparent_0%,rgba(255,0,153,0.1)_100%)] opacity-50"></div>
      </div>

      {/* Floating Notes Animation */}
      {isPlaying && (
         <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className="absolute text-hot-pink opacity-0 animate-float-note"
                    style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: '80%',
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${4 + Math.random() * 4}s`
                    }}
                >
                    <Music size={20 + Math.random() * 20} />
                </div>
            ))}
         </div>
      )}

      {/* --- Left: Vinyl Section --- */}
      <div className="relative z-10 w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-8 md:p-16">
         {/* Turntable Base (Subtle) */}
         <div className="absolute w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -z-10"></div>

         {/* Vinyl Container */}
         <div className="relative aspect-square w-full max-w-[450px] group">
            
            {/* Tone Arm */}
            <div className={`absolute -top-10 right-10 w-32 h-64 z-30 origin-top-right transition-transform duration-1000 ease-in-out pointer-events-none ${isPlaying ? 'rotate-0' : '-rotate-[25deg]'}`}>
                <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-0 right-0 border-2 border-white shadow-xl"></div>
                <div className="w-1 h-48 bg-gray-500 absolute top-2 right-1.5 origin-top rotate-12"></div>
                <div className="w-8 h-12 bg-gray-800 absolute bottom-10 right-8 rounded rotate-12 border border-gray-600"></div>
            </div>

            {/* The Record */}
            <div className={`w-full h-full rounded-full bg-black border-[8px] border-gray-900 relative shadow-[0_30px_60px_rgba(0,0,0,0.8)] ${isPlaying ? 'animate-spin-slow' : ''}`}>
                {/* Grooves */}
                <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(#181818_0,#181818_2px,#282828_3px)]"></div>
                {/* Dynamic Shine */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-40 pointer-events-none"></div>
                
                {/* Album Art */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42%] h-[42%] rounded-full overflow-hidden border-4 border-black shadow-2xl">
                    {trackInfo ? (
                        <img src={trackInfo.thumbnail} className="w-full h-full object-cover" alt="cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <Music size={40} className="text-gray-600" />
                        </div>
                    )}
                </div>
                
                {/* Center Hole */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full z-20 border border-gray-400"></div>
            </div>
         </div>
      </div>

      {/* --- Right: Info & Visualizer --- */}
      <div className="relative z-10 w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center p-8 md:pr-16 space-y-8">
          
          <div className="space-y-3 animate-in slide-in-from-right-8 fade-in duration-700">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-hot-pink animate-pulse"></div>
                  <span className="text-hot-pink font-mono text-xs tracking-[0.3em] uppercase">Now Playing</span>
               </div>
               
               <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[0.9] tracking-tighter drop-shadow-2xl text-stroke-black">
                   {trackInfo?.title || 'NO SIGNAL'}
               </h1>
               <h2 className="text-2xl md:text-3xl font-mono text-gray-400 uppercase tracking-widest border-b border-white/10 pb-4 inline-block">
                   {trackInfo?.artist || 'WAITING...'}
               </h2>
               
               <div className="flex gap-2 pt-2">
                  {trackInfo?.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-xs font-bold uppercase text-gray-300 hover:border-hot-pink hover:text-hot-pink transition-colors cursor-default">
                        #{tag}
                      </span>
                  ))}
               </div>
          </div>

          {/* Visualizer Module */}
          <div 
            className="w-full h-48 bg-black/40 rounded-2xl border border-white/10 backdrop-blur-xl p-1 relative overflow-hidden group cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-hot-pink/50 transition-all"
            onClick={() => setVisualizerMode(m => m === VisualizerMode.BARS ? VisualizerMode.WAVEFORM : VisualizerMode.BARS)}
          >
               {/* Scanner Line */}
               <div className="absolute top-0 left-0 w-full h-[2px] bg-hot-pink/50 shadow-[0_0_10px_#ff0099] animate-[scan_3s_linear_infinite] z-20"></div>
               
               <div className="absolute top-3 right-3 flex gap-2 items-center z-20 bg-black/60 px-2 py-1 rounded border border-white/10">
                   <Sparkles size={12} className="text-hot-pink" />
                   <span className="text-[10px] font-mono text-white">VIS_MOD: {visualizerMode}</span>
               </div>
               
               <div className="w-full h-full rounded-xl overflow-hidden bg-black/50">
                   <Visualizer isPlaying={isPlaying} mode={visualizerMode} color={visualizerMode === VisualizerMode.BARS ? '#ff0099' : '#00ffff'} />
               </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
              <button className="flex-1 py-4 bg-white/5 hover:bg-hot-pink hover:text-black border border-white/10 rounded-lg backdrop-blur-md transition-all flex flex-col items-center gap-1 group">
                  <Heart size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold tracking-widest">LIKE</span>
              </button>
              <button className="flex-1 py-4 bg-white/5 hover:bg-acid-green hover:text-black border border-white/10 rounded-lg backdrop-blur-md transition-all flex flex-col items-center gap-1 group">
                  <ListMusic size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold tracking-widest">LIST</span>
              </button>
              <button className="flex-1 py-4 bg-white/5 hover:bg-electric-blue hover:text-black border border-white/10 rounded-lg backdrop-blur-md transition-all flex flex-col items-center gap-1 group">
                  <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold tracking-widest">SHARE</span>
              </button>
          </div>
      </div>
      
      <style>{`
        @keyframes float-note {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            20% { opacity: 0.8; }
            100% { transform: translateY(-200px) rotate(45deg); opacity: 0; }
        }
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AudioStage;
