// Vercel Serverless Function: /api/tts
// Proxies text-to-speech audio streams for languages like Tamil and Arabic without browser native voices

export default async function handler(req, res) {
  // CORS Preflight & Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const tl = req.query?.tl || urlObj.searchParams.get('tl') || 'en';
    const q = req.query?.q || urlObj.searchParams.get('q') || '';

    if (!q || !q.trim()) {
      res.status(400).send('Missing text');
      return;
    }

    const shortLang = (tl || 'en').split('-')[0].toLowerCase();
    const cleanText = q.trim();

    // Helper to fetch individual audio chunk
    const fetchTTSChunk = async (chunk) => {
      // 1. Primary: Google TTS (client=tw-ob)
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
          if (ab.byteLength > 0) {
            return Buffer.from(ab);
          }
        }
      } catch (err) {
        console.warn('tw-ob fetch error:', err);
      }

      // 2. Secondary Fallback: Google GTX TTS
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
          if (ab.byteLength > 0) {
            return Buffer.from(ab);
          }
        }
      } catch (err) {
        console.warn('gtx fetch error:', err);
      }

      return null;
    };

    // Split text into chunks <= 130 characters to avoid Google query length limits
    const chunks = splitTextIntoChunks(cleanText, 130);
    const audioBuffers = [];

    for (const chunk of chunks) {
      const buf = await fetchTTSChunk(chunk);
      if (buf && buf.length > 0) {
        audioBuffers.push(buf);
      }
    }

    if (audioBuffers.length === 0) {
      res.status(502).send('Failed to fetch TTS audio');
      return;
    }

    const finalBuffer = Buffer.concat(audioBuffers);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', finalBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).send(finalBuffer);
  } catch (err) {
    console.error('API TTS Handler error:', err);
    res.status(500).send('Internal server error');
  }
}

function splitTextIntoChunks(text, maxLen = 130) {
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
}
