
import React, { useState, useEffect } from 'react';
import { MOCK_TRACKS } from './constants';
import { Track, VisualizerMode } from './types';
import PlayerControls from './components/PlayerControls';
import VideoStage from './components/VideoStage';
import AudioStage from './components/AudioStage';
import MusicManager from './components/MusicManager';
import MusicGallery from './components/MusicGallery';
import ImageGallery from './components/ImageGallery';
import { HashRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, AudioLines, Zap, Disc, Radio, Film, Image as ImageIcon } from 'lucide-react';
import { loadTracksFromCloud, saveTracksToCloud } from './services/storageService';

const MainApp = () => {
  const [tracks, setTracks] = useState<Track[]>(MOCK_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const currentTrack = tracks[currentTrackIndex];
  const navigate = useNavigate();
  const location = useLocation();

  // --- DATA PERSISTENCE ---
  // Load from cloud on mount
  useEffect(() => {
    const initData = async () => {
        const cloudTracks = await loadTracksFromCloud();
        if (cloudTracks && cloudTracks.length > 0) {
            // Merge with mock or replace? Let's replace for "Real App" feel, 
            // but keep mock if cloud is empty to show UI.
            console.log("Loaded tracks from Cloudflare KV");
            setTracks(cloudTracks);
        }
    };
    initData();
  }, []);

  // Save to cloud whenever tracks change
  useEffect(() => {
      // Debounce slightly to avoid too many requests
      const timeout = setTimeout(() => {
          if (tracks !== MOCK_TRACKS) {
              saveTracksToCloud(tracks);
          }
      }, 2000);
      return () => clearTimeout(timeout);
  }, [tracks]);

  // Filter out images for the main player sequence
  const playableTracks = tracks.filter(t => t.mediaType !== 'image');
  
  const handleNext = () => {
    let nextIndex = (currentTrackIndex + 1) % tracks.length;
    // Skip images in playback queue
    while (tracks[nextIndex].mediaType === 'image' && nextIndex !== currentTrackIndex) {
        nextIndex = (nextIndex + 1) % tracks.length;
    }
    setCurrentTrackIndex(nextIndex);
  };

  const handlePrev = () => {
    let prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    while (tracks[prevIndex].mediaType === 'image' && prevIndex !== currentTrackIndex) {
        prevIndex = (prevIndex - 1 + tracks.length) % tracks.length;
    }
    setCurrentTrackIndex(prevIndex);
  };

  const handleTrackSelect = (trackId: string) => {
    const index = tracks.findIndex(t => t.id === trackId);
    if (index !== -1) {
        const track = tracks[index];
        if (track.mediaType === 'image') return; 
        setCurrentTrackIndex(index);
        setIsPlaying(true);
        if (track.mediaType === 'audio') {
            navigate('/listen');
        } else {
            navigate('/');
        }
    }
  };

  const handleAddTrack = (newTrack: Track) => {
    setTracks(prev => [newTrack, ...prev]);
  };

  const handleRemoveTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    if (tracks[currentTrackIndex]?.id === id) {
        setCurrentTrackIndex(0);
        setIsPlaying(false);
    }
  };

  const handleUpdateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handlePlayByIndex = (index: number) => {
      const track = tracks[index];
      if (track.mediaType === 'image') return; 

      setCurrentTrackIndex(index);
      setIsPlaying(true);
      if (track.mediaType === 'audio') {
          navigate('/listen');
      } else {
          navigate('/');
      }
  };

  const activePlayableTrack = currentTrack.mediaType === 'image' 
     ? playableTracks[0] 
     : currentTrack;

  return (
    <div className="h-screen w-screen bg-deep-space text-white overflow-hidden flex flex-col font-sans bg-noise">
        
        {/* Top Bar - Brutalist MVT Style */}
        <header className="h-20 border-b-2 border-white/10 flex items-center justify-between px-0 z-50 shrink-0 bg-black/80 backdrop-blur-md">
            
            {/* Logo Section */}
            <div className="flex items-center h-full px-6 border-r-2 border-white/10 bg-acid-green text-black group cursor-pointer hover:bg-white transition-colors" onClick={() => navigate('/')}>
                <div className="flex flex-col leading-none">
                    <span className="font-display font-black text-2xl tracking-tighter">YINYUETAI</span>
                    <span className="font-mono text-[10px] tracking-widest font-bold flex items-center gap-2">
                        <Zap size={10} fill="black" /> VISUAL DECK
                    </span>
                </div>
            </div>
            
            {/* Navigation - Big Tabs */}
            <nav className="hidden md:flex items-center h-full flex-1 pl-8 gap-8">
                <NavLink 
                    to="/" 
                    className={({ isActive }) => `
                        h-full flex items-center gap-2 px-2 border-b-4 transition-all font-display font-bold tracking-wider text-sm uppercase
                        ${isActive ? 'border-acid-green text-acid-green' : 'border-transparent text-gray-500 hover:text-white'}
                    `}
                >
                    <Film size={16} /> 视频频道
                </NavLink>
                <NavLink 
                    to="/listen" 
                    className={({ isActive }) => `
                        h-full flex items-center gap-2 px-2 border-b-4 transition-all font-display font-bold tracking-wider text-sm uppercase
                        ${isActive ? 'border-hot-pink text-hot-pink' : 'border-transparent text-gray-500 hover:text-white'}
                    `}
                >
                    <Radio size={16} /> 音乐听堂
                </NavLink>
                <NavLink 
                    to="/music" 
                    className={({ isActive }) => `
                        h-full flex items-center gap-2 px-2 border-b-4 transition-all font-display font-bold tracking-wider text-sm uppercase
                        ${isActive ? 'border-electric-blue text-electric-blue' : 'border-transparent text-gray-500 hover:text-white'}
                    `}
                >
                    <Disc size={16} /> 媒体库
                </NavLink>
                <NavLink 
                    to="/images" 
                    className={({ isActive }) => `
                        h-full flex items-center gap-2 px-2 border-b-4 transition-all font-display font-bold tracking-wider text-sm uppercase
                        ${isActive ? 'border-vivid-yellow text-vivid-yellow' : 'border-transparent text-gray-500 hover:text-white'}
                    `}
                >
                    <ImageIcon size={16} /> 图集画廊
                </NavLink>
                <NavLink 
                    to="/lab" 
                    className={({ isActive }) => `
                        h-full flex items-center gap-2 px-2 border-b-4 transition-all font-display font-bold tracking-wider text-sm uppercase
                        ${isActive ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-white'}
                    `}
                >
                    <AudioLines size={16} /> 后台管理
                </NavLink>
            </nav>

            {/* Right Status Area */}
            <div className="flex items-center gap-4 px-6 h-full border-l-2 border-white/10">
                 <div className="relative hidden lg:block group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-acid-green to-hot-pink rounded opacity-20 group-hover:opacity-100 blur transition duration-500"></div>
                    <div className="relative flex items-center bg-black border border-white/20 rounded px-3 py-1.5">
                        <Search size={14} className="text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder="SEARCH_DB..." 
                            className="bg-transparent text-xs font-mono w-40 focus:outline-none text-acid-green placeholder-gray-600 uppercase" 
                        />
                    </div>
                 </div>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
            <Routes>
                {/* Visual Deck Route (Video Player) */}
                <Route path="/" element={
                    <div className="w-full h-full relative bg-black">
                        <VideoStage 
                            videoUrl={activePlayableTrack.videoUrl}
                            isPlaying={isPlaying && activePlayableTrack.mediaType === 'video'}
                            volume={1}
                            onEnded={handleNext}
                            onTimeUpdate={setProgress}
                            trackInfo={activePlayableTrack}
                        />
                    </div>
                } />

                {/* Audio Player Route (Refined) */}
                <Route path="/listen" element={
                    <AudioStage 
                        audioUrl={activePlayableTrack.videoUrl} 
                        isPlaying={isPlaying && activePlayableTrack.mediaType === 'audio'}
                        volume={1}
                        onEnded={handleNext}
                        onTimeUpdate={setProgress}
                        trackInfo={activePlayableTrack}
                    />
                } />

                {/* Music Gallery Route */}
                <Route path="/music" element={
                    <MusicGallery 
                        tracks={tracks} 
                        currentTrackId={activePlayableTrack.id}
                        isPlaying={isPlaying}
                        onPlayTrack={handleTrackSelect}
                    />
                } />

                {/* Image Gallery Route */}
                <Route path="/images" element={
                    <ImageGallery 
                        tracks={tracks} 
                    />
                } />

                {/* Admin/Lab Route */}
                <Route path="/lab" element={
                    <MusicManager 
                        tracks={tracks} 
                        onAddTrack={handleAddTrack} 
                        onRemoveTrack={handleRemoveTrack}
                        onUpdateTrack={handleUpdateTrack}
                        onPlayTrack={handlePlayByIndex}
                    />
                } />
            </Routes>
        </main>

        {/* Bottom Control Deck - Always Visible */}
        <footer className="shrink-0 z-50 relative border-t-2 border-white/10 bg-black">
            <PlayerControls 
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onNext={handleNext}
                onPrev={handlePrev}
                progress={progress}
                currentTrackTitle={activePlayableTrack?.title || 'No Media'}
                currentTrackArtist={activePlayableTrack?.artist || 'Unknown'}
                currentTrackUrl={activePlayableTrack?.videoUrl || ''}
                currentTrackThumbnail={activePlayableTrack?.thumbnail || ''}
            />
        </footer>

    </div>
  );
};

const App = () => {
    return (
        <HashRouter>
            <MainApp />
        </HashRouter>
    )
}

export default App;
