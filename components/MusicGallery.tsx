
import React, { useState } from 'react';
import { Track } from '../types';
import { Play, Activity, Disc, Film, Headphones } from 'lucide-react';

interface MusicGalleryProps {
  tracks: Track[];
  currentTrackId: string;
  isPlaying: boolean;
  onPlayTrack: (id: string) => void;
}

const MusicGallery: React.FC<MusicGalleryProps> = ({ 
  tracks, 
  currentTrackId, 
  isPlaying,
  onPlayTrack 
}) => {
  const [viewMode, setViewMode] = useState<'video' | 'audio'>('video');
  const [filter, setFilter] = useState('ALL');

  // Filter by Media Type first
  const mediaTracks = tracks.filter(t => t.mediaType === viewMode);
  
  // Get tags based on current media view
  const allTags = Array.from(new Set(mediaTracks.flatMap(t => t.tags))).slice(0, 6);

  // Filter by Tag
  const filteredTracks = filter === 'ALL' 
    ? mediaTracks 
    : mediaTracks.filter(t => t.tags.includes(filter));

  return (
    <div className="h-full w-full bg-deep-space flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-50 pointer-events-none"></div>
      
      {/* Top Tabs (Video vs Audio) */}
      <div className="flex items-center justify-center gap-8 pt-6 pb-2 relative z-20">
          <button 
            onClick={() => { setViewMode('video'); setFilter('ALL'); }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all duration-300 ${viewMode === 'video' ? 'border-acid-green text-white scale-110' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
          >
              <Film size={20} className={viewMode === 'video' ? 'text-acid-green' : ''} />
              <span className="font-display font-bold tracking-widest text-lg">视频影像 VIDEO</span>
          </button>

          <div className="h-6 w-px bg-gray-800"></div>

          <button 
            onClick={() => { setViewMode('audio'); setFilter('ALL'); }}
            className={`flex items-center gap-2 pb-2 border-b-2 transition-all duration-300 ${viewMode === 'audio' ? 'border-hot-pink text-white scale-110' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
          >
              <Headphones size={20} className={viewMode === 'audio' ? 'text-hot-pink' : ''} />
              <span className="font-display font-bold tracking-widest text-lg">纯享音乐 MUSIC</span>
          </button>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-4 relative z-10 bg-black/20 border-y border-white/5 backdrop-blur-sm justify-center">
         <span className="text-gray-500 font-mono font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
            <Activity size={12} /> 风格 TAGS
         </span>
         <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border transition-all hover:scale-105 ${filter === 'ALL' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-700'}`}
         >
            全部
         </button>
         {allTags.map(tag => (
             <button 
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border transition-all hover:scale-105 ${filter === tag ? (viewMode === 'video' ? 'bg-acid-green text-black border-acid-green' : 'bg-hot-pink text-white border-hot-pink') : 'bg-transparent text-gray-400 border-gray-700'}`}
            >
                {tag}
            </button>
         ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
         {filteredTracks.length === 0 && (
             <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                 <Disc size={48} className="mb-4 opacity-20" />
                 <p className="font-mono text-xs">暂无内容 / NO CONTENT</p>
             </div>
         )}

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredTracks.map((track, idx) => {
                const isCurrent = track.id === currentTrackId;
                return (
                    <div 
                        key={track.id} 
                        className={`group relative transition-all duration-300 cursor-pointer overflow-hidden
                            ${viewMode === 'audio' 
                                ? 'rounded-xl bg-white/5 border border-white/5 hover:border-hot-pink/50 hover:shadow-[0_0_20px_rgba(255,0,153,0.2)]' 
                                : 'bg-ui-dark border border-white/10 hover:border-acid-green/50'
                            }
                        `}
                        onClick={() => onPlayTrack(track.id)}
                    >
                        {/* Image Container */}
                        <div className={`overflow-hidden relative ${viewMode === 'audio' ? 'aspect-square m-4 rounded-lg shadow-lg' : 'aspect-video'}`}>
                             <img 
                                src={track.thumbnail} 
                                alt={track.title} 
                                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:contrast-125 ${isCurrent ? 'grayscale-0' : (viewMode === 'video' ? 'grayscale' : 'grayscale-0')}`} 
                             />
                             
                             {/* Overlay Gradient */}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                             
                             {/* Active Indicator */}
                             {isCurrent && (
                                 <div className={`absolute inset-0 flex items-center justify-center bg-black/40 ${viewMode === 'audio' ? 'rounded-lg border-2 border-hot-pink' : 'border-4 border-acid-green'}`}>
                                     <div className="flex gap-1">
                                         <div className={`w-1 h-4 animate-[bounce_0.5s_infinite] ${viewMode === 'audio' ? 'bg-hot-pink' : 'bg-acid-green'}`}></div>
                                         <div className={`w-1 h-6 animate-[bounce_0.7s_infinite] ${viewMode === 'audio' ? 'bg-hot-pink' : 'bg-acid-green'}`}></div>
                                         <div className={`w-1 h-3 animate-[bounce_0.6s_infinite] ${viewMode === 'audio' ? 'bg-hot-pink' : 'bg-acid-green'}`}></div>
                                     </div>
                                 </div>
                             )}

                             {/* Hover Play Button */}
                             <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${viewMode === 'audio' ? 'bg-black/40 backdrop-blur-sm' : 'bg-acid-green/20 mix-blend-hard-light'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${viewMode === 'audio' ? 'bg-hot-pink text-white' : 'bg-white text-black'}`}>
                                    <Play size={24} fill="currentColor" className="ml-1" />
                                </div>
                             </div>
                        </div>

                        {/* Info Section */}
                        <div className={`relative ${viewMode === 'audio' ? 'px-4 pb-4 text-center' : 'p-4 bg-black border-t border-white/10 group-hover:bg-white group-hover:text-black transition-colors'}`}>
                            {viewMode === 'video' && (
                                <div className="absolute -top-3 right-2 bg-acid-green text-black text-[10px] font-bold px-2 py-0.5 font-mono uppercase skew-x-[-10deg]">
                                    {track.duration}
                                </div>
                            )}
                            
                            <h3 className={`font-bold leading-tight mb-1 truncate ${viewMode === 'audio' ? 'text-base text-white font-sans' : 'font-display text-lg group-hover:text-black'}`}>
                                {track.title}
                            </h3>
                            <p className={`font-mono text-xs truncate ${viewMode === 'audio' ? 'text-hot-pink' : 'text-gray-500 group-hover:text-black/70'}`}>
                                {track.artist}
                            </p>
                            
                            {viewMode === 'video' && (
                                <div className="flex flex-wrap gap-1 mt-3 opacity-50 group-hover:opacity-100">
                                    {track.tags.slice(0, 2).map(t => (
                                        <span key={t} className="text-[9px] border border-current px-1 rounded-sm uppercase">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
         </div>
      </div>
    </div>
  );
};

export default MusicGallery;
