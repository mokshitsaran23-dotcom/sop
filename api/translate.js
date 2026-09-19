// Vercel Serverless Function: /api/translate
// High-performance translation proxy for Vercel deployment

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const sl = req.query?.sl || urlObj.searchParams.get('sl') || 'auto';
    const tl = req.query?.tl || urlObj.searchParams.get('tl') || 'en';
    const q = req.query?.q || urlObj.searchParams.get('q') || '';

    if (!q || !q.trim()) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }

    const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(q.trim())}`;
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!upstreamRes.ok) {
      res.status(upstreamRes.status).json({ error: 'Upstream translation error' });
      return;
    }

    const data = await upstreamRes.json();
    let translatedText = '';
    if (Array.isArray(data?.[0])) {
      translatedText = data[0].map(s => s?.[0]).filter(Boolean).join('');
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.status(200).json({ translation: translatedText, raw: data });
  } catch (err) {
    console.error('Translation Proxy error:', err);
    res.status(500).json({ error: 'Internal translation proxy error' });
  }
}
