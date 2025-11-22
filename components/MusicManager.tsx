
import React, { useRef, useState, useEffect } from 'react';
import { 
  Upload, Music, Trash2, Play, FileVideo, Cloud, 
  CheckCircle2, Loader2, Edit3, X, Save, 
  LayoutDashboard, Image as ImageIcon, Film, Headphones,
  HardDrive, Plus, Settings, Link2, AlertTriangle, Server,
  Globe, Search
} from 'lucide-react';
import { Track } from '../types';
import { uploadToR2, getWorkerUrl, setWorkerUrl } from '../services/storageService';

interface MusicManagerProps {
  tracks: Track[];
  onAddTrack: (track: Track) => void;
  onRemoveTrack: (id: string) => void;
  onUpdateTrack: (id: string, updates: Partial<Track>) => void;
  onPlayTrack: (index: number) => void;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

type Section = 'dashboard' | 'video' | 'audio' | 'image';

const MusicManager: React.FC<MusicManagerProps> = ({ 
  tracks, 
  onAddTrack, 
  onRemoveTrack, 
  onUpdateTrack,
  onPlayTrack 
}) => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLinkImport, setShowLinkImport] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{title: string, artist: string, tags: string}>({ title: '', artist: '', tags: '' });
  
  // Link Import State
  const [importUrl, setImportUrl] = useState('');
  const [importType, setImportType] = useState<'netease' | 'qq' | 'generic'>('netease');

  // 配置状态
  const [configUrl, setConfigUrl] = useState(getWorkerUrl());

  // 检查配置是否就绪
  const isConfigured = !!getWorkerUrl();

  const handleSaveConfig = () => {
    if (!configUrl.startsWith('http')) {
        alert("错误：URL 必须以 http:// 或 https:// 开头");
        return;
    }
    setWorkerUrl(configUrl);
    setShowSettings(false);
    // 如果是因为点击上传触发的配置，保存后自动打开上传窗口
    if (!isConfigured) {
        setShowUpload(true);
    }
  };

  const openUploadModal = () => {
      if (!getWorkerUrl()) {
          setShowSettings(true);
      } else {
          setShowUpload(true);
      }
  };

  // --- 辅助函数 ---
  const formatSize = (bytes?: number) => {
    if (!bytes) return '--';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSectionColor = (section: Section) => {
    switch(section) {
      case 'video': return 'text-acid-green border-acid-green';
      case 'audio': return 'text-hot-pink border-hot-pink';
      case 'image': return 'text-electric-blue border-electric-blue';
      default: return 'text-white border-white';
    }
  };

  // --- 网易云/链接导入逻辑 ---
  const handleLinkImport = () => {
      if (!importUrl) return;

      let title = 'New Track';
      let artist = 'Unknown';
      let videoUrl = importUrl;
      let thumbnail = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500'; // Default Vinyl
      let sourceType: Track['sourceType'] = 'url';

      // 网易云解析逻辑
      if (importUrl.includes('163.com') || importType === 'netease') {
          // 尝试提取 ID
          const idMatch = importUrl.match(/id=(\d+)/);
          if (idMatch && idMatch[1]) {
              const id = idMatch[1];
              // 网易云官方音频外链 Hack (非 VIP 可用)
              videoUrl = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
              sourceType = 'netease';
              title = `Netease Track ${id}`;
              artist = 'Netease Cloud Music';
              // 使用网易云 Logo 风格图
              thumbnail = 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg';
          }
      } 
      else if (importType === 'qq') {
          sourceType = 'qq';
          title = 'QQ Music Track';
          artist = 'Tencent Music';
          // QQ 音乐需要用户提供直接 MP3/M4A 链接，因为没有简单的外链 ID 转换 API
          // 或者仅仅作为占位符记录
      }

      const newTrack: Track = {
          id: `link-${Date.now()}`,
          title,
          artist,
          videoUrl,
          thumbnail,
          duration: 'STREAM',
          tags: [sourceType?.toUpperCase() || 'WEB'],
          mediaType: 'audio', // 通常链接导入多为音频
          sourceType: sourceType,
          uploadStatus: 'done',
          createdAt: Date.now(),
          updatedAt: Date.now()
      };

      onAddTrack(newTrack);
      setShowLinkImport(false);
      setImportUrl('');
      // 自动进入编辑模式，因为名字通常需要修改
      setTimeout(() => {
         // 理想情况下这里应该自动滚动并开启编辑，简化起见暂略
         alert("已导入链接。请手动编辑标题和艺术家信息。");
      }, 500);
  };

  // --- 上传逻辑 ---
  const handleFiles = async (files: File[]) => {
    const workerConfig = getWorkerUrl();
    if (!workerConfig) {
        setShowUpload(false);
        setShowSettings(true);
        return;
    }

    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploads(prev => [...newUploads, ...prev]);

    for (const item of newUploads) {
      updateUploadStatus(item.id, 'uploading', 0);
      
      try {
        const result = await uploadToR2(item.file, (progress) => {
          updateUploadStatus(item.id, 'uploading', progress);
        });

        // 根据文件类型推断
        const mime = item.file.type;
        let mediaType: 'video' | 'audio' | 'image' = 'video';
        let defaultThumb = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44c?q=80&w=500'; // Video default

        if (mime.startsWith('audio/')) {
            mediaType = 'audio';
            defaultThumb = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500';
        } else if (mime.startsWith('image/')) {
            mediaType = 'image';
            defaultThumb = result.url; // 图片直接用自己做缩略图
        }
        
        const newTrack: Track = {
          id: `r2-${Date.now()}-${item.id}`,
          title: item.file.name.replace(/\.[^/.]+$/, ""), // 去掉后缀
          artist: 'R2 Cloud Upload', 
          videoUrl: result.url,
          thumbnail: defaultThumb,
          duration: mediaType === 'image' ? 'R2 RAW' : '00:00',
          tags: [mediaType.toUpperCase(), 'CLOUD'],
          mediaType: mediaType,
          sourceType: 'r2',
          uploadStatus: 'done',
          size: item.file.size,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        onAddTrack(newTrack);
        updateUploadStatus(item.id, 'done', 100);
        
      } catch (error: any) {
        console.error("Upload Failed", error);
        updateUploadStatus(item.id, 'error', 0, error.message);
      }
    }
  };

  const updateUploadStatus = (id: string, status: UploadItem['status'], progress: number, errorMsg?: string) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, status, progress, errorMsg } : u));
  };

  // --- 编辑逻辑 ---
  const startEdit = (track: Track) => {
    setEditingId(track.id);
    setEditForm({
      title: track.title,
      artist: track.artist,
      tags: track.tags.join(', ')
    });
  };

  const saveEdit = (id: string) => {
    onUpdateTrack(id, {
      title: editForm.title,
      artist: editForm.artist,
      tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      updatedAt: Date.now()
    });
    setEditingId(null);
  };

  // --- 筛选 ---
  const filteredTracks = tracks.filter(t => {
    if (activeSection === 'dashboard') return true;
    return t.mediaType === activeSection;
  });

  const NavButton = ({ id, icon: Icon, label, color }: any) => (
    <button 
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 border border-transparent group
        ${activeSection === id 
          ? `bg-white/10 text-white border-${color}/50 shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon size={18} className={`${activeSection === id ? `text-${color}` : 'group-hover:text-white'}`} />
      <span className={`tracking-wide text-sm ${activeSection === id ? 'font-bold' : ''}`}>{label}</span>
      {activeSection === id && <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-${color} animate-pulse`}></div>}
    </button>
  );

  return (
    <div className="h-full w-full flex bg-deep-space overflow-hidden font-sans relative">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Sidebar */}
      <div className="w-64 bg-black/80 border-r border-white/10 flex flex-col shrink-0 z-20 backdrop-blur-md">
        <div className="p-6 border-b border-white/10">
           <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
             <HardDrive className="text-holo-cyan" />
             系统核心 CORE
           </h2>
           <p className="text-[10px] font-mono text-gray-500 mt-1 flex items-center gap-1">
               <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-acid-green' : 'bg-red-500'}`}></div>
               {isConfigured ? 'R2 LINKED' : 'R2 DISCONNECTED'}
           </p>
        </div>

        <div className="p-4 flex-1">
           <div className="text-[10px] font-mono text-gray-600 uppercase mb-4 px-2">管理模块</div>
           <NavButton id="dashboard" icon={LayoutDashboard} label="控制台 Dashboard" color="white" />
           <NavButton id="video" icon={Film} label="视频影像 Video" color="acid-green" />
           <NavButton id="audio" icon={Headphones} label="音乐曲目 Audio" color="hot-pink" />
           <NavButton id="image" icon={ImageIcon} label="图集画廊 Images" color="electric-blue" />
           
           <div className="my-6 border-t border-white/10"></div>
           
           <button 
             onClick={openUploadModal}
             className="w-full bg-holo-cyan text-black font-bold font-display py-3 rounded hover:bg-white transition-colors flex items-center justify-center gap-2 mb-4 relative overflow-hidden group"
           >
             <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
             <Upload size={18} /> 上传资源
           </button>

            <button 
             onClick={() => setShowLinkImport(true)}
             className="w-full bg-white/5 border border-white/20 text-white font-bold font-display py-3 rounded hover:bg-white/10 transition-colors flex items-center justify-center gap-2 mb-4"
           >
             <Link2 size={18} /> 导入链接
           </button>
           
           <button 
             onClick={() => { setShowSettings(true); }}
             className="w-full border border-white/20 text-gray-400 font-bold font-mono text-xs py-2 rounded hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2"
           >
             <Settings size={14} /> 系统设置 CONFIG
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
         
         {/* Top Header */}
         <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-sm">
             <div className="flex items-center gap-2">
                 <span className="text-gray-500 font-mono text-sm">MANAGEMENT /</span>
                 <span className={`font-display font-bold text-lg ${getSectionColor(activeSection)}`}>
                    {activeSection === 'dashboard' && '全局概览'}
                    {activeSection === 'video' && '视频管理'}
                    {activeSection === 'audio' && '音频管理'}
                    {activeSection === 'image' && '图片管理'}
                 </span>
             </div>
             <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                   共 {filteredTracks.length} 项资源
                </div>
             </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* Link Import Modal */}
            {showLinkImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-ui-dark border border-white/20 p-8 rounded-xl w-full max-w-md relative shadow-2xl">
                        <button onClick={() => setShowLinkImport(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-2xl font-display font-black text-white mb-6 flex items-center gap-2">
                            <Globe className="text-hot-pink"/> 导入网络流
                        </h3>

                        <div className="flex gap-2 mb-6">
                            <button 
                                onClick={() => setImportType('netease')}
                                className={`flex-1 py-2 text-xs font-bold border rounded ${importType === 'netease' ? 'bg-red-600 text-white border-red-600' : 'border-white/20 text-gray-400'}`}
                            >
                                网易云音乐
                            </button>
                            <button 
                                onClick={() => setImportType('qq')}
                                className={`flex-1 py-2 text-xs font-bold border rounded ${importType === 'qq' ? 'bg-green-600 text-white border-green-600' : 'border-white/20 text-gray-400'}`}
                            >
                                QQ 音乐
                            </button>
                            <button 
                                onClick={() => setImportType('generic')}
                                className={`flex-1 py-2 text-xs font-bold border rounded ${importType === 'generic' ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}
                            >
                                通用链接
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-2">
                                    {importType === 'netease' && '网易云歌曲分享链接 / ID'}
                                    {importType === 'qq' && 'QQ 音乐音频直链 (MP3/M4A)'}
                                    {importType === 'generic' && '媒体文件 URL'}
                                </label>
                                <input 
                                    type="text" 
                                    value={importUrl}
                                    onChange={(e) => setImportUrl(e.target.value)}
                                    placeholder={importType === 'netease' ? '例如: https://music.163.com/#/song?id=123456' : 'https://...'}
                                    className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-hot-pink focus:outline-none font-mono text-sm"
                                />
                                {importType === 'netease' && (
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        提示: 系统将尝试提取 ID 并使用公共接口解析非 VIP 音频。
                                    </p>
                                )}
                                {importType === 'qq' && (
                                    <p className="text-[10px] text-yellow-500 mt-2">
                                        注意: QQ 音乐音频通常有版权保护，建议使用已获取的直链。
                                    </p>
                                )}
                            </div>
                            <button 
                                onClick={handleLinkImport}
                                className="w-full bg-white text-black font-bold py-3 rounded mt-2 hover:bg-gray-200 transition-colors"
                            >
                                确认添加
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal (Config R2) */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-ui-dark border border-acid-green p-8 rounded-xl w-full max-w-md relative shadow-[0_0_50px_rgba(204,255,0,0.1)]">
                        <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X/></button>
                        <h3 className="text-2xl font-display font-black text-white mb-2 flex items-center gap-2">
                            <Server className="text-acid-green"/> 系统连接配置
                        </h3>
                        <p className="text-gray-400 text-xs mb-6">请配置 Cloudflare Worker 以启用 R2 存储桶直传功能。</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-acid-green mb-1">CLOUDFLARE WORKER URL</label>
                                <input 
                                    type="text" 
                                    value={configUrl}
                                    onChange={(e) => setConfigUrl(e.target.value)}
                                    placeholder="https://your-worker.project.workers.dev"
                                    className="w-full bg-black border border-white/20 rounded p-3 text-white focus:border-acid-green focus:outline-none font-mono text-sm placeholder-gray-700"
                                />
                                <div className="text-[10px] text-gray-500 mt-2 flex gap-2 items-start">
                                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                    <span>Worker 必须部署 `cf-worker.js` 代码并绑定 R2 Bucket 变量。</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveConfig}
                                className="w-full bg-acid-green text-black font-bold py-3 rounded mt-4 hover:bg-white transition-colors flex justify-center items-center gap-2"
                            >
                                <Save size={16} /> 保存配置
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal (Real R2) */}
            {showUpload && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in zoom-in-95 duration-200">
                  <div className="bg-ui-dark border border-white/20 p-8 rounded-xl w-full max-w-3xl relative max-h-[80vh] flex flex-col shadow-2xl">
                     <button onClick={() => setShowUpload(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24}/></button>
                     
                     <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                        <Cloud className="text-holo-cyan" /> 上传资源至云端
                     </h3>

                     {/* Drag & Drop Area */}
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer text-center py-16 border-2 border-dashed border-white/10 rounded-xl hover:border-holo-cyan hover:bg-holo-cyan/5 transition-all group"
                     >
                        <div className="w-20 h-20 rounded-full bg-white/5 group-hover:bg-holo-cyan/20 flex items-center justify-center mx-auto mb-6 text-holo-cyan transition-colors">
                           <Upload size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">点击或拖拽文件至此处</h3>
                        <p className="text-gray-400 text-sm">支持 MP4, MP3, JPG, PNG 等格式 (直传 R2)</p>
                        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
                     </div>

                     {/* Upload Queue */}
                     {uploads.length > 0 && (
                        <div className="mt-8 flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-lg p-4 border border-white/5">
                           <h4 className="text-xs font-mono text-gray-500 uppercase mb-3 sticky top-0 bg-transparent">上传队列 ({uploads.length})</h4>
                           <div className="space-y-2">
                               {uploads.map(u => (
                                  <div key={u.id} className="bg-black rounded p-3 flex items-center gap-4 border border-white/10">
                                     {u.status === 'uploading' && <Loader2 size={20} className="animate-spin text-holo-cyan" />}
                                     {u.status === 'done' && <CheckCircle2 size={20} className="text-acid-green" />}
                                     {u.status === 'error' && <AlertTriangle size={20} className="text-red-500" />}
                                     
                                     <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-xs mb-1.5">
                                           <span className="text-white font-bold truncate max-w-[80%]">{u.file.name}</span>
                                           <span className={`font-mono ${u.status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                                               {u.status === 'error' ? '失败' : (u.status === 'done' ? '完成' : `${Math.round(u.progress)}%`)}
                                           </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                           <div 
                                              className={`h-full transition-all duration-300 ${u.status === 'error' ? 'bg-red-500' : (u.status === 'done' ? 'bg-acid-green' : 'bg-holo-cyan')}`} 
                                              style={{width: `${u.progress}%`}}
                                           ></div>
                                        </div>
                                        {u.errorMsg && <p className="text-[10px] text-red-500 mt-1 truncate">{u.errorMsg}</p>}
                                     </div>
                                  </div>
                               ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* Media Grid / List */}
            {activeSection === 'image' ? (
                // --- IMAGE GRID VIEW ---
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                   {filteredTracks.map(track => (
                      <div key={track.id} className="group relative bg-black border border-white/10 rounded-lg overflow-hidden hover:border-electric-blue transition-all">
                         <div className="aspect-square relative overflow-hidden">
                            <img src={track.thumbnail} className="w-full h-full object-cover" alt={track.title} />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                               <button onClick={() => startEdit(track)} className="p-2 bg-white text-black rounded-full hover:bg-electric-blue hover:text-white transition-colors" title="编辑"><Edit3 size={18} /></button>
                               <button onClick={() => onRemoveTrack(track.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" title="删除"><Trash2 size={18} /></button>
                            </div>
                         </div>
                         <div className="p-3">
                            {editingId === track.id ? (
                               <div className="space-y-2">
                                  <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-white/10 text-xs p-1 rounded text-white outline-none border border-electric-blue" />
                                  <button onClick={() => saveEdit(track.id)} className="w-full bg-acid-green text-black text-xs py-1 rounded font-bold">保存</button>
                               </div>
                            ) : (
                               <>
                                  <h4 className="font-bold text-white text-sm truncate" title={track.title}>{track.title}</h4>
                                  <p className="text-xs text-gray-500 truncate mt-1">{formatSize(track.size)}</p>
                               </>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
            ) : (
                // --- AUDIO / VIDEO LIST VIEW ---
                <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-white/5 text-xs font-mono text-gray-400 uppercase tracking-wider">
                         <tr>
                            <th className="p-4">媒体预览</th>
                            <th className="p-4">详情信息</th>
                            <th className="p-4">标签 Tags</th>
                            <th className="p-4">存储源</th>
                            <th className="p-4 text-right">操作</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                         {filteredTracks.map((track, idx) => (
                            <tr key={track.id} className="hover:bg-white/5 transition-colors group">
                               <td className="p-4 w-24">
                                  <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden relative group/thumb cursor-pointer border border-white/10" onClick={() => onPlayTrack(tracks.indexOf(track))}>
                                     <img src={track.thumbnail} className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100" alt="" />
                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 bg-black/30">
                                        <Play size={20} className="fill-white text-white" />
                                     </div>
                                  </div>
                               </td>
                               <td className="p-4">
                                  {editingId === track.id ? (
                                     <div className="space-y-2 max-w-xs">
                                        <input placeholder="标题" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full bg-black/50 border border-holo-cyan rounded px-2 py-1 text-white text-sm" />
                                        <input placeholder="艺术家" value={editForm.artist} onChange={e => setEditForm({...editForm, artist: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-gray-300 text-xs" />
                                     </div>
                                  ) : (
                                     <div>
                                        <div className="font-bold text-white text-base">{track.title}</div>
                                        <div className="text-holo-cyan text-xs font-mono mt-1">{track.artist}</div>
                                        <div className="text-gray-500 text-[10px] mt-1">{formatSize(track.size)} • {track.duration}</div>
                                     </div>
                                  )}
                               </td>
                               <td className="p-4">
                                  {editingId === track.id ? (
                                     <input placeholder="标签, 分隔" value={editForm.tags} onChange={e => setEditForm({...editForm, tags: e.target.value})} className="bg-black/50 border border-white/20 rounded px-2 py-1 text-white text-xs w-full" />
                                  ) : (
                                     <div className="flex flex-wrap gap-1 max-w-xs">
                                        {track.tags.map(t => (
                                           <span key={t} className={`px-1.5 py-0.5 rounded border text-[10px] uppercase ${getSectionColor(activeSection)} border-opacity-30 bg-opacity-10`}>{t}</span>
                                        ))}
                                     </div>
                                  )}
                               </td>
                               <td className="p-4">
                                  {track.sourceType === 'r2' && (
                                      <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20 flex items-center w-fit gap-1">
                                         <Cloud size={10} /> R2 存储
                                      </span>
                                  )}
                                  {track.sourceType === 'netease' && (
                                      <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-[10px] border border-red-500/20 flex items-center w-fit gap-1">
                                         <Globe size={10} /> 网易云
                                      </span>
                                  )}
                                  {track.sourceType === 'qq' && (
                                      <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] border border-green-500/20 flex items-center w-fit gap-1">
                                         <Globe size={10} /> QQ音乐
                                      </span>
                                  )}
                                  {(!track.sourceType || track.sourceType === 'local' || track.sourceType === 'url') && (
                                      <span className="px-2 py-1 rounded bg-gray-500/10 text-gray-400 text-[10px] border border-gray-500/20">
                                         本地/URL
                                      </span>
                                  )}
                               </td>
                               <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     {editingId === track.id ? (
                                        <>
                                           <button onClick={() => saveEdit(track.id)} className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30" title="保存"><Save size={16} /></button>
                                           <button onClick={() => setEditingId(null)} className="p-2 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30" title="取消"><X size={16} /></button>
                                        </>
                                     ) : (
                                        <>
                                           <button onClick={() => startEdit(track)} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded" title="编辑"><Edit3 size={16} /></button>
                                           <button onClick={() => onRemoveTrack(track.id)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded" title="删除"><Trash2 size={16} /></button>
                                        </>
                                     )}
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default MusicManager;