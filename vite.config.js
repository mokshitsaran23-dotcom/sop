import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function ttsProxyPlugin() {
  return {
    name: 'tts-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const tl = urlObj.searchParams.get('tl') || 'en';
          const q = urlObj.searchParams.get('q') || '';
          if (!q || !q.trim()) {
            res.statusCode = 400;
            res.end('Missing text');
            return;
          }

          const shortLang = (tl || 'en').split('-')[0].toLowerCase();
          const cleanText = q.trim();

          const fetchTTSChunk = async (chunk) => {
            const primaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(shortLang)}&q=${encodeURIComponent(chunk)}`;
            try {
              const response = await fetch(primaryUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': '*/*'
                }
              });
              if (response.ok) {
                const ab = await response.arrayBuffer();
                if (ab.byteLength > 0) return Buffer.from(ab);
              }
            } catch (err) {
              console.warn('tw-ob fetch error:', err);
            }

            const fallbackUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(shortLang)}&q=${encodeURIComponent(chunk)}`;
            try {
              const response = await fetch(fallbackUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': '*/*'
                }
              });
              if (response.ok) {
                const ab = await response.arrayBuffer();
                if (ab.byteLength > 0) return Buffer.from(ab);
              }
            } catch (err) {
              console.warn('gtx fetch error:', err);
            }

            return null;
          };

          const splitTextIntoChunks = (text, maxLen = 130) => {
            if (text.length <= maxLen) return [text];
            const sentences = text.match(/[^.!?\n,;]+[.!?\n,;]?/g) || [text];
            const chunks = [];
            let current = '';
            for (const s of sentences) {
              if ((current + s).length <= maxLen) {
                current += s;
              } else {
                if (current) chunks.push(current.trim());
                if (s.length > maxLen) {
                  const words = s.split(' ');
                  let wChunk = '';
                  for (const w of words) {
                    if ((wChunk + ' ' + w).length <= maxLen) {
                      wChunk += (wChunk ? ' ' : '') + w;
                    } else {
                      if (wChunk) chunks.push(wChunk.trim());
                      wChunk = w;
                    }
                  }
                  if (wChunk) chunks.push(wChunk.trim());
                  current = '';
                } else {
                  current = s;
                }
              }
            }
            if (current) chunks.push(current.trim());
            return chunks.filter(Boolean);
          };

          const chunks = splitTextIntoChunks(cleanText, 130);
          const audioBuffers = [];

          for (const chunk of chunks) {
            const buf = await fetchTTSChunk(chunk);
            if (buf && buf.length > 0) {
              audioBuffers.push(buf);
            }
          }

          if (audioBuffers.length === 0) {
            res.statusCode = 502;
            res.end('Upstream TTS error');
            return;
          }

          const finalBuffer = Buffer.concat(audioBuffers);

          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', finalBuffer.length);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(finalBuffer);
        } catch (err) {
          console.error('TTS Proxy error:', err);
          res.statusCode = 500;
          res.end('Internal TTS error');
        }
      });
    }
  };
}

function translateProxyPlugin() {
  return {
    name: 'translate-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/translate', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const sl = urlObj.searchParams.get('sl') || 'auto';
          const tl = urlObj.searchParams.get('tl') || 'en';
          const q = urlObj.searchParams.get('q') || '';
          if (!q) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing text' }));
            return;
          }

          const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(q)}`;
          const upstreamRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          if (!upstreamRes.ok) {
            res.statusCode = upstreamRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Upstream translation error' }));
            return;
          }

          const data = await upstreamRes.json();
          let translatedText = '';
          if (Array.isArray(data?.[0])) {
            translatedText = data[0].map(s => s?.[0]).filter(Boolean).join('');
          }

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ translation: translatedText, raw: data }));
        } catch (err) {
          console.error('Translation Proxy error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal translation proxy error' }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ttsProxyPlugin(), translateProxyPlugin()],
})

