/**
 * Cloudflare Worker for YinYueTai MVT
 */

import { AwsClient } from 'aws4fetch';

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

    // --- API ROUTES ---

    // 1. Authorize Upload (Presigned URL for R2)
    if (path === '/api/authorize-upload' && request.method === 'POST') {
      try {
        const { filename, fileType } = await request.json();
        const key = `${Date.now()}-${filename}`;
        
        if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
            throw new Error("R2 Credentials not configured in Wrangler vars.");
        }

        const r2 = new AwsClient({
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
          service: 's3',
          region: 'auto',
        });

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
            publicUrl: `${env.R2_PUBLIC_DOMAIN}/${key}`,
            key: key
          }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 2. Get Tracks (KV)
    if (path === '/api/tracks' && request.method === 'GET') {
      if (!env.DB) return new Response('[]', { headers: corsHeaders });
      const data = await env.DB.get('tracks');
      return new Response(data || '[]', { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 3. Save Tracks (KV)
    if (path === '/api/tracks' && request.method === 'POST') {
      if (!env.DB) return new Response('KV Not Configured', { status: 503, headers: corsHeaders });
      const tracks = await request.json();
      await env.DB.put('tracks', JSON.stringify(tracks));
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // --- SPA FALLBACK ROUTING ---
    // If the request is not an API call, try to serve static assets.
    // If static asset is not found (e.g. user visits /music directly), serve index.html.
    
    try {
      // 1. Try to serve the asset directly (e.g. /assets/main.js)
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
      
      // 2. If 404 and it's a page navigation (not a file request), serve index.html
      if (!path.includes('.')) {
         const indexUrl = new URL('/index.html', request.url);
         return await env.ASSETS.fetch(new Request(indexUrl, request));
      }
      
      return assetResponse; // Return the original 404 for missing files
    } catch (e) {
      return new Response('Internal Error', { status: 500 });
    }
  },
};
