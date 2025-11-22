/**
 * Cloudflare Worker for YinYueTai MVT
 * 
 * 部署说明 (Deployment Instructions):
 * 1. 在 Cloudflare Dashboard 创建一个 Worker。
 * 2. 绑定 R2 Bucket: 变量名设为 "BUCKET"。
 * 3. (可选) 绑定 KV Namespace: 变量名设为 "DB" (用于保存媒体库列表)。
 * 4. 将此代码粘贴到 Worker 中并部署。
 * 5. 将部署后的 Worker URL 填入前端的设置中。
 */

import { AwsClient } from 'aws4fetch';

// 定义 CORS 头，允许前端跨域访问
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 1. 获取上传凭证 (Presigned URL for R2)
    // POST /api/authorize-upload
    if (path === '/api/authorize-upload' && request.method === 'POST') {
      try {
        const { filename, fileType } = await request.json();
        const key = `${Date.now()}-${filename}`;
        
        // 初始化 AWS Client (R2 兼容 S3 API)
        const r2 = new AwsClient({
          accessKeyId: env.R2_ACCESS_KEY_ID,     // 在 Worker 环境变量中设置
          secretAccessKey: env.R2_SECRET_ACCESS_KEY, // 在 Worker 环境变量中设置
          service: 's3',
          region: 'auto',
        });

        // 生成预签名 URL (有效期 1 小时)
        // 注意: aws4fetch 生成 presigned url 需要手动构建 Request 并签名
        const signedUrl = await r2.sign(
          new Request(`https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': fileType },
          }),
          { aws: { signQuery: true } }
        );

        return new Response(
          JSON.stringify({
            uploadUrl: signedUrl.url,
            publicUrl: `${env.R2_PUBLIC_DOMAIN}/${key}`, // 你的 R2 公开访问域名
            key: key
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 2. 获取媒体库数据 (Get Tracks)
    // GET /api/tracks
    if (path === '/api/tracks' && request.method === 'GET') {
      if (!env.DB) return new Response('[]', { headers: corsHeaders }); // 如果没绑定 KV
      const data = await env.DB.get('tracks');
      return new Response(data || '[]', { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. 保存媒体库数据 (Save Tracks)
    // POST /api/tracks
    if (path === '/api/tracks' && request.method === 'POST') {
      if (!env.DB) return new Response('KV Not Configured', { status: 503, headers: corsHeaders });
      const tracks = await request.json();
      await env.DB.put('tracks', JSON.stringify(tracks));
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};