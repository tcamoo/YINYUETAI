
import React, { useState } from 'react';
import { Track } from '../types';
import { Image as ImageIcon, X, Download, Maximize2, Scan } from 'lucide-react';

interface ImageGalleryProps {
  tracks: Track[];
  onDelete?: (id: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ tracks }) => {
  const imageTracks = tracks.filter(t => t.mediaType === 'image');
  const [selectedImage, setSelectedImage] = useState<Track | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <div className="h-full w-full bg-deep-space flex flex-col relative overflow-hidden">
      {/* Background Noise/Texture */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-electric-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="px-8 py-6 border-b border-white/10 flex justify-between items-end relative z-10 bg-black/50 backdrop-blur-sm">
        <div>
          <h1 className="text-4xl font-display font-black text-white tracking-tighter flex items-center gap-3">
            <ImageIcon size={32} className="text-electric-blue" />
            视觉档案 VISUAL_ARCHIVE
          </h1>
          <p className="text-gray-500 font-mono text-xs mt-1 tracking-widest">
            资源总数: <span className="text-white">{imageTracks.length}</span> // 静态影像库
          </p>
        </div>
        <div className="hidden md:block">
          <div className="flex gap-2">
            {['赛博朋克', '霓虹', '故障艺术', '胶片感'].map(tag => (
               <span key={tag} className="px-2 py-0.5 border border-white/20 text-[10px] font-mono text-gray-400 hover:text-electric-blue hover:border-electric-blue cursor-pointer transition-colors">
                 #{tag}
               </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {imageTracks.map((track) => (
            <div 
              key={track.id}
              className="group relative aspect-[4/5] bg-black border border-white/10 hover:border-electric-blue transition-all duration-300 overflow-hidden cursor-pointer"
              onMouseEnter={() => setHoverId(track.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => setSelectedImage(track)}
            >
              <img 
                src={track.videoUrl} 
                alt={track.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                 <h3 className="font-display font-bold text-white text-lg leading-none mb-1 uppercase truncate">{track.title}</h3>
                 <p className="font-mono text-xs text-electric-blue mb-3 truncate">{track.artist}</p>
                 
                 <div className="flex items-center justify-between">
                     <div className="flex gap-1">
                        {track.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 border border-white/10">{t}</span>
                        ))}
                     </div>
                     <Scan size={16} className="text-white/50" />
                 </div>
              </div>

              {/* Corner Decoration */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-electric-blue opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
            </div>
          ))}
          
          {/* Empty State */}
          {imageTracks.length === 0 && (
             <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                <ImageIcon size={48} className="text-gray-700 mb-4" />
                <p className="text-gray-500 font-mono text-sm">暂无视觉数据 / NO VISUAL DATA</p>
             </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal (Full Screen View) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          
          {/* Close Button */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 z-50 p-2 bg-black/50 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>

          <div className="w-full h-full flex flex-col md:flex-row">
             
             {/* Image Area - Click to close or specific interaction */}
             <div className="flex-1 relative flex items-center justify-center bg-grid-white/[0.02] p-4 md:p-12 overflow-hidden">
                <img 
                  src={selectedImage.videoUrl} 
                  alt={selectedImage.title} 
                  className="max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,255,255,0.1)] animate-in zoom-in-95 duration-300 select-none"
                />
             </div>

             {/* Sidebar Info */}
             <div className="w-full md:w-80 shrink-0 bg-[#0a0a0a] border-l border-white/10 p-8 flex flex-col gap-6 overflow-y-auto relative z-40 shadow-2xl">
                <div>
                   <div className="flex items-center gap-2 mb-4 text-electric-blue font-mono text-[10px] tracking-widest uppercase">
                      <span className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></span>
                      资源详情 / DETAILS
                   </div>
                   <h2 className="text-3xl font-display font-black text-white uppercase leading-none mb-2 break-words">{selectedImage.title}</h2>
                   <p className="text-gray-400 font-sans text-sm border-b border-white/10 pb-4">由 {selectedImage.artist} 创建</p>
                </div>

                <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/5">
                   <div className="flex justify-between text-xs font-mono text-gray-500">
                      <span>分辨率</span>
                      <span className="text-white">{selectedImage.duration}</span>
                   </div>
                   <div className="flex justify-between text-xs font-mono text-gray-500">
                      <span>文件大小</span>
                      <span className="text-white">{(selectedImage.size ? (selectedImage.size / 1024 / 1024).toFixed(2) : '0.00')} MB</span>
                   </div>
                   <div className="flex justify-between text-xs font-mono text-gray-500">
                      <span>存储类型</span>
                      <span className="text-acid-green">R2_OBJECT</span>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2">
                   {selectedImage.tags.map(t => (
                      <span key={t} className="px-2 py-1 border border-white/20 text-gray-300 text-[10px] font-bold uppercase hover:border-electric-blue hover:text-electric-blue transition-colors cursor-default">
                         #{t}
                      </span>
                   ))}
                </div>
                
                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <a 
                    href={selectedImage.videoUrl} 
                    download 
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-white text-black font-bold font-display hover:bg-electric-blue transition-colors flex items-center justify-center gap-2 rounded-sm"
                  >
                     <Download size={16} /> 下载原图
                  </a>
                  <a 
                    href={selectedImage.videoUrl}
                    target="_blank"
                    rel="noreferrer" 
                    className="w-full py-3 border border-white/20 text-white font-bold font-display hover:bg-white/10 transition-colors flex items-center justify-center gap-2 rounded-sm"
                  >
                     <Maximize2 size={16} /> 在新窗口打开
                  </a>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
