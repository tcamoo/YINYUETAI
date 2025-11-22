
import React, { useRef, useEffect, useState } from 'react';
import { Track } from '../types';

interface VideoStageProps {
  videoUrl: string;
  isPlaying: boolean;
  volume: number;
  onEnded: () => void;
  onTimeUpdate: (progress: number) => void;
  trackInfo?: Track;
}

const VideoStage: React.FC<VideoStageProps> = ({ 
  videoUrl, 
  isPlaying, 
  volume, 
  onEnded,
  onTimeUpdate,
  trackInfo
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Simulate random "Signal Quality" for aesthetics
  const [signal, setSignal] = useState(99);
  useEffect(() => {
      const i = setInterval(() => setSignal(Math.floor(90 + Math.random() * 10)), 2000);
      return () => clearInterval(i);
  }, []);

  useEffect(() => {
    setError(null); // Reset error on url change
  }, [videoUrl]);

  useEffect(() => {
    if (!videoRef.current) return;
    const playVideo = async () => {
        try {
            if (isPlaying) await videoRef.current?.play();
            else videoRef.current?.pause();
        } catch (err: any) {
            if (err.name === 'NotAllowedError') setError("AUTOPLAY_BLOCKED");
        }
    };
    playVideo();
  }, [isPlaying, videoUrl]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onTimeUpdate(progress || 0);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group select-none">
      
      {/* Main Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover opacity-90"
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        onError={() => setError("SIGNAL_LOST")}
        playsInline
        crossOrigin="anonymous"
      />

      {/* Error State */}
      {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 p-4 text-center">
              <h3 className="text-red-600 font-display font-black text-6xl tracking-tighter animate-pulse">ERROR</h3>
              <p className="text-white font-mono text-sm mt-4 border border-white p-2">{error} :: CHECK_CONNECTION</p>
          </div>
      )}

      {/* --- MVT HUD OVERLAYS --- */}
      
      {/* Top Left: Live Status */}
      <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur px-4 py-2 border border-white/20">
              <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="font-display font-bold text-white tracking-widest text-sm">
                  {isPlaying ? 'ON AIR' : 'STANDBY'}
              </span>
          </div>
          <div className="font-mono text-[10px] text-acid-green mt-1 tracking-widest">
              SIGNAL: {signal}% STABLE
          </div>
      </div>

      {/* Center Big Typography (Title) */}
      {trackInfo && (
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 z-10 pointer-events-none mix-blend-difference">
             <h1 className="font-display font-black text-[8vw] leading-[0.8] text-transparent text-stroke-black uppercase opacity-20 truncate">
                 {trackInfo.title}
             </h1>
          </div>
      )}
      
      {/* Bottom Left: Info */}
      {trackInfo && (
        <div className="absolute bottom-8 left-8 z-20 max-w-xl">
             <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-none tracking-tight drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                <span className="bg-acid-green text-black px-2 mr-2 italic">NOW</span>
                {trackInfo.title}
             </h2>
             <p className="font-mono text-hot-pink text-xl mt-2 font-bold uppercase bg-black/80 inline-block px-2">
                 {trackInfo.artist}
             </p>
        </div>
      )}

      {/* Right Side: Decorative Elements */}
      <div className="absolute top-0 right-8 h-full flex flex-col justify-between py-8 items-end pointer-events-none z-10">
           <div className="text-right">
               <div className="text-5xl font-display font-black text-white/10">01</div>
               <div className="text-5xl font-display font-black text-white/10">02</div>
               <div className="text-5xl font-display font-black text-white/10">03</div>
           </div>
           <div className="w-1 h-32 bg-gradient-to-b from-transparent via-electric-blue to-transparent"></div>
      </div>

      {/* Pause Overlay */}
      {!isPlaying && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-[2px]">
           <div className="border-4 border-white p-8 animate-pulse">
              <div className="font-display font-black text-4xl text-white tracking-[0.5em] pl-4">
                 PAUSED
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoStage;