// Image search proxy — calls Pexels API server-side so students never hit pexels.com directly.
// Schools only need musicmindacademy.com whitelisted. All Pexels photos are free for commercial use.

const express = require('express');
const router = express.Router();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// GET /api/images/search?q=guitar&page=1
router.get('/search', async (req, res) => {
  if (!PEXELS_API_KEY) {
    return res.status(503).json({ error: 'Image search not configured' });
  }

  const query = req.query.q || '';
  const page = parseInt(req.query.page) || 1;
  const perPage = 30;

  if (!query.trim()) {
    return res.json({ photos: [], totalResults: 0, page: 1 });
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&size=medium`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );

    if (!response.ok) {
      console.error(`Pexels API error: ${response.status}`);
      return res.status(502).json({ error: 'Image search unavailable' });
    }

    const data = await response.json();

    // Return simplified photo objects — only what the frontend needs
    const photos = (data.photos || []).map(p => ({
      id: p.id,
      url: p.src.large,        // 940px wide — good for slides
      thumbnail: p.src.medium,  // 350px wide — good for grid
      alt: p.alt || '',
      photographer: p.photographer,
      width: p.width,
      height: p.height,
    }));

    res.json({
      photos,
      totalResults: data.total_results || 0,
      page: data.page || 1,
    });
  } catch (err) {
    console.error('Pexels proxy error:', err.message);
    res.status(500).json({ error: 'Image search failed' });
  }
});

module.exports = router;
