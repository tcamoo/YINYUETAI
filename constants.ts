
import { Track } from './types';

const BASE_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample';
const IMG_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/images';

export const MOCK_TRACKS: Track[] = [
  // --- IMAGES ---
  {
    id: 'img-1',
    title: 'CYBERPUNK STREETS',
    artist: 'Midjourney',
    videoUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=500&auto=format&fit=crop',
    duration: '1920x1080',
    tags: ['Neon', 'Japan', 'Night'],
    mediaType: 'image'
  },
  {
    id: 'img-2',
    title: 'DIGITAL GLITCH',
    artist: 'System',
    videoUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop',
    duration: '4K',
    tags: ['Abstract', 'Code'],
    mediaType: 'image'
  },
  {
    id: 'img-3',
    title: 'RETRO WAVE',
    artist: 'Synth',
    videoUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=500&auto=format&fit=crop',
    duration: '1080p',
    tags: ['80s', 'Pink', 'Vibe'],
    mediaType: 'image'
  },

  // --- AUDIO TRACKS ---
  {
    id: 'audio-1',
    title: 'MIDNIGHT CITY',
    artist: 'M83',
    videoUrl: `${BASE_URL}/ForBiggerJoyrides.mp4`,
    thumbnail: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
    duration: '04:03',
    tags: ['Synthwave', 'Electronic', 'Hit'],
    mediaType: 'audio'
  },
  {
    id: 'audio-2',
    title: 'INSTANT CRUSH',
    artist: 'Daft Punk',
    videoUrl: `${BASE_URL}/ForBiggerBlazes.mp4`,
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
    duration: '05:37',
    tags: ['French House', 'Vibe'],
    mediaType: 'audio'
  },
  {
    id: 'audio-3',
    title: 'STARBOY',
    artist: 'The Weeknd',
    videoUrl: `${BASE_URL}/ForBiggerEscapes.mp4`,
    thumbnail: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000&auto=format&fit=crop',
    duration: '03:50',
    tags: ['Pop', 'R&B'],
    mediaType: 'audio'
  },

  // --- VIDEO TRACKS ---
  {
    id: 'tears-of-steel',
    title: 'TEARS OF STEEL',
    artist: 'Blender Foundation',
    videoUrl: `${BASE_URL}/TearsOfSteel.mp4`,
    thumbnail: `${IMG_URL}/TearsOfSteel.jpg`,
    duration: '12:14',
    tags: ['Sci-Fi', 'Cyberpunk', 'VFX'],
    mediaType: 'video'
  },
  {
    id: 'sintel',
    title: 'SINTEL',
    artist: 'Blender Foundation',
    videoUrl: `${BASE_URL}/Sintel.mp4`,
    thumbnail: `${IMG_URL}/Sintel.jpg`,
    duration: '14:48',
    tags: ['Fantasy', 'Epic', 'Dragon'],
    mediaType: 'video'
  },
  {
    id: 'big-buck-bunny',
    title: 'BIG BUCK BUNNY',
    artist: 'Blender Foundation',
    videoUrl: `${BASE_URL}/BigBuckBunny.mp4`,
    thumbnail: `${IMG_URL}/BigBuckBunny.jpg`,
    duration: '09:56',
    tags: ['Animation', 'Classic', 'Comedy'],
    mediaType: 'video'
  },
  {
    id: 'bullrun',
    title: 'GUMBALL 3000: BULLRUN',
    artist: 'Gumball 3000',
    videoUrl: `${BASE_URL}/WeAreGoingOnBullrun.mp4`,
    thumbnail: `${IMG_URL}/WeAreGoingOnBullrun.jpg`,
    duration: '00:47',
    tags: ['Cars', 'Speed', 'Docu'],
    mediaType: 'video'
  },
  {
    id: 'joyrides',
    title: 'NEON JOYRIDES',
    artist: 'Google Pixel',
    videoUrl: `${BASE_URL}/ForBiggerJoyrides.mp4`,
    thumbnail: `${IMG_URL}/ForBiggerJoyrides.jpg`,
    duration: '00:15',
    tags: ['Urban', 'Fast', 'POV'],
    mediaType: 'video'
  },
  {
    id: 'blazes',
    title: 'SOLAR FLARE',
    artist: 'Visualizer',
    videoUrl: `${BASE_URL}/ForBiggerBlazes.mp4`,
    thumbnail: `${IMG_URL}/ForBiggerBlazes.jpg`,
    duration: '00:15',
    tags: ['Warm', 'Cinematic', 'Slow'],
    mediaType: 'video'
  },
  {
    id: 'station-id-1',
    title: '/// SIGNAL TEST 01',
    artist: 'YinYueTai Broadcast',
    videoUrl: `${BASE_URL}/ForBiggerMeltdowns.mp4`,
    thumbnail: `${IMG_URL}/ForBiggerMeltdowns.jpg`,
    duration: 'LOOP',
    tags: ['Intermission', 'Glitch'],
    mediaType: 'video'
  },
];

export const INITIAL_VOLUME = 0.7;