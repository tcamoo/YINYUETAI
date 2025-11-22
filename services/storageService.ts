
import { Track } from '../types';

// 配置键名
const CONFIG_KEY_WORKER = 'yinyuetai_worker_url';

export const getWorkerUrl = () => localStorage.getItem(CONFIG_KEY_WORKER) || '';
export const setWorkerUrl = (url: string) => localStorage.setItem(CONFIG_KEY_WORKER, url);

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * 核心上传逻辑：
 * 1. 请求 Worker 获取 R2 预签名 URL
 * 2. 直接 PUT 文件到 R2
 */
export const uploadToR2 = async (
  file: File, 
  onProgress: (progress: number) => void
): Promise<UploadResult> => {
  
  const workerUrl = getWorkerUrl();
  if (!workerUrl) {
    throw new Error("未配置 Cloudflare Worker URL，请在'系统设置'中配置。");
  }

  // 去除末尾斜杠
  const cleanUrl = workerUrl.replace(/\/$/, '');

  try {
    // 1. 获取上传凭证
    const authResponse = await fetch(`${cleanUrl}/api/authorize-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        filename: file.name, 
        fileType: file.type,
        size: file.size
      }),
    });

    if (!authResponse.ok) {
      const err = await authResponse.text();
      throw new Error(`鉴权失败: ${authResponse.status} ${err}`);
    }

    const { uploadUrl, publicUrl, key } = await authResponse.json();

    if (!uploadUrl) {
        throw new Error("Worker 返回了无效的上传地址，请检查 Worker 配置 (BUCKET / R2_ACCESS_KEY_ID)。");
    }

    // 2. 执行 PUT 上传 (直传 R2)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: publicUrl, key });
        } else {
          reject(new Error(`R2 上传失败 (Status ${xhr.status})。请检查 CORS 设置。`));
        }
      };

      xhr.onerror = () => reject(new Error('网络连接错误 (CORS 或 Network)。请检查 Worker 允许的 Origins。'));
      xhr.send(file);
    });

  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    throw new Error(`上传错误: ${error.message}`);
  }
};

/**
 * 数据持久化：保存整个 Track 列表到 Cloudflare KV
 */
export const saveTracksToCloud = async (tracks: Track[]) => {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) return; // 未配置则跳过
  
  const cleanUrl = workerUrl.replace(/\/$/, '');

  try {
    await fetch(`${cleanUrl}/api/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tracks)
    });
  } catch (e) {
    console.error("Failed to save tracks to cloud", e);
  }
};

/**
 * 数据加载：从 Cloudflare KV 加载列表
 */
export const loadTracksFromCloud = async (): Promise<Track[] | null> => {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) return null;

  const cleanUrl = workerUrl.replace(/\/$/, '');

  try {
    const res = await fetch(`${cleanUrl}/api/tracks`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("Failed to load tracks from cloud", e);
  }
  return null;
};
