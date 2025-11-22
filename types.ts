
export interface Track {
  id: string;
  title: string;
  artist: string;
  videoUrl: string; // URL to the file (mp4, mp3, or image)
  thumbnail: string;
  duration: string; // Display format "3:45" or dimensions for images
  tags: string[];
  mediaType: 'video' | 'audio' | 'image'; // Added 'image'
  sourceType?: 'local' | 'r2' | 'url' | 'netease' | 'qq'; 
  uploadStatus?: 'uploading' | 'done' | 'error'; 
  size?: number; 
  createdAt?: number; 
  updatedAt?: number; 
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  currentTrackId: string | null;
  volume: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum VisualizerMode {
  WAVEFORM = 'WAVEFORM',
  BARS = 'BARS',
  ORB = 'ORB'
}

// Minimal type definitions for Google Cast API to avoid TS errors
declare global {
  interface Window {
    __onGCastApiAvailable: (isAvailable: boolean) => void;
    cast: any;
    chrome: any;
  }
  
  // Augment NodeJS ProcessEnv to include API_KEY
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }
}
