
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Disc, Cast, Maximize2, Mic2, Zap } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number; // 0 to 100
  currentTrackTitle: string;
  currentTrackArtist: string;
  currentTrackUrl: string;
  currentTrackThumbnail: string;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  progress,
  currentTrackTitle,
  currentTrackArtist,
  currentTrackUrl,
  currentTrackThumbnail
}) => {
  const [castAvailable, setCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        setCastAvailable(true);
        try {
          window.cast.framework.CastContext.getInstance().setOptions({
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
        } catch (e) {
          console.error("Cast Init Error", e);
        }
      }
    };
  }, []);

  const handleCast = () => {
    if (!castAvailable) return;
    const castContext = window.cast.framework.CastContext.getInstance();
    const session = castContext.getCurrentSession();

    if (session) {
        castContext.requestSession(); 
    } else {
        castContext.requestSession().then(
            () => {
                loadMediaOnCast();
                setIsCasting(true);
            },
            (error: any) => console.error('Cast connection error', error)
        );
    }
  };

  const loadMediaOnCast = () => {
      const session = window.cast.framework.CastContext.getInstance().getCurrentSession();
      if (!session) return;

      const mediaInfo = new window.chrome.cast.media.MediaInfo(currentTrackUrl, 'video/mp4');
      const metadata = new window.chrome.cast.media.GenericMediaMetadata();
      metadata.title = currentTrackTitle;
      metadata.subtitle = currentTrackArtist;
      metadata.images = [new window.chrome.cast.Image(currentTrackThumbnail)];
      mediaInfo.metadata = metadata;

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      session.loadMedia(request).then(
        () => console.log('Cast media loaded successfully'),
        (errorCode: any) => console.error('Cast load media error', errorCode)
      );
  };

  useEffect(() => {
      if (isCasting && castAvailable) {
          const session = window.cast.framework.CastContext.getInstance().getCurrentSession();
          if (session) {
             loadMediaOnCast();
          } else {
              setIsCasting(false);
          }
      }
  }, [currentTrackUrl]);

  return (
    <div className="relative w-full bg-black border-t-2 border-white/10 z-50">
      
      {/* Progress Bar - Bold Acid Green */}
      <div className="absolute top-0 left-0 w-full h-2 bg-white/10 cursor-pointer group">
        <div 
            className="h-full bg-acid-green relative transition-all duration-100 ease-linear shadow-[0_0_10px_#ccff00]"
            style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 -top-1 h-4 w-1 bg-white scale-y-0 group-hover:scale-y-150 transition-transform duration-200"></div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto h-24 flex items-center justify-between px-8 gap-8">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4 min-w-0">
            <div className="w-14 h-14 border-2 border-white/20 relative group bg-gray-900">
                <img src={currentTrackThumbnail} alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                {isPlaying && (
                    <div className="absolute inset-0 flex items-end justify-center pb-1 gap-0.5 bg-black/30">
                        <div className="w-1 bg-acid-green h-3 animate-[bounce_0.5s_infinite]"></div>
                        <div className="w-1 bg-acid-green h-5 animate-[bounce_0.7s_infinite]"></div>
                        <div className="w-1 bg-acid-green h-2 animate-[bounce_0.6s_infinite]"></div>
                    </div>
                )}
            </div>
            <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                    <Zap size={12} className="text-acid-green fill-current" />
                    <h4 className="text-white font-display font-bold text-sm truncate uppercase tracking-wide">{currentTrackTitle}</h4>
                </div>
                <p className="text-gray-500 text-xs font-mono truncate uppercase mt-1">{currentTrackArtist}</p>
            </div>
        </div>

        {/* Transport Controls - Geometric & Bold */}
        <div className="flex items-center gap-8">
            <button onClick={onPrev} className="text-gray-500 hover:text-white transition-all hover:scale-110 active:text-acid-green">
                <SkipBack size={24} strokeWidth={2} />
            </button>

            <button 
                onClick={onPlayPause}
                className={`
                    w-14 h-14 flex items-center justify-center border-2 transition-all
                    ${isPlaying 
                        ? 'border-hot-pink bg-hot-pink text-white shadow-[0_0_20px_#ff0099]' 
                        : 'border-white text-white hover:bg-white hover:text-black'
                    }
                `}
            >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <button onClick={onNext} className="text-gray-500 hover:text-white transition-all hover:scale-110 active:text-acid-green">
                <SkipForward size={24} strokeWidth={2} />
            </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center gap-6 w-1/4 justify-end">
             <button 
                onClick={handleCast}
                className={`
                    p-2 transition-all
                    ${isCasting 
                        ? 'text-acid-green animate-pulse' 
                        : 'text-gray-500 hover:text-white'
                    }
                `}
                title="Broadcast Signal"
             >
                <Cast size={20} />
             </button>

             <div className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors group">
                <Volume2 size={20} />
                <div className="w-24 h-2 bg-white/10 relative overflow-hidden skew-x-[-20deg]">
                    <div className="h-full w-[70%] bg-gray-500 group-hover:bg-electric-blue transition-colors shadow-[0_0_10px_cyan]"></div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerControls;
