// Image search proxy — calls Pexels API server-side so students never hit pexels.com directly.
// Schools only need musicmindacademy.com whitelisted. All Pexels photos are free for commercial use.
// Includes server-side blocklist for school safety — blocked terms never reach Pexels.

const express = require('express');
const router = express.Router();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Words/phrases that should never be searched in a school context.
// Checked against the full query as individual tokens (case-insensitive).
const BLOCKED_TERMS = new Set([
  // Explicit / sexual
  'sex', 'sexy', 'sexual', 'porn', 'pornography', 'nude', 'naked', 'nudity',
  'boob', 'boobs', 'breast', 'breasts', 'tit', 'tits', 'ass', 'butt',
  'penis', 'dick', 'cock', 'vagina', 'pussy', 'dildo', 'vibrator',
  'cum', 'cumshot', 'orgasm', 'masturbat', 'blowjob', 'handjob',
  'hentai', 'xxx', 'nsfw', 'erotic', 'erotica', 'fetish', 'bdsm',
  'stripper', 'hooker', 'prostitut', 'onlyfans', 'thong', 'lingerie',
  'milf', 'gilf', 'cougar', 'pawg', 'thicc', 'bikini', 'topless',
  'cleavage', 'upskirt', 'panties', 'underwear', 'bra',
  'hot girl', 'hot guy', 'hot women', 'hot men',
  'only fans', 'rule 34', 'r34',
  // Violence / gore
  'gore', 'gory', 'murder', 'suicide', 'self-harm', 'selfharm',
  'decapitat', 'dismember', 'torture', 'mutilat',
  // Drugs / substances
  'cocaine', 'heroin', 'meth', 'crack', 'weed', 'marijuana', 'cannabis',
  'ecstasy', 'molly', 'lsd', 'shrooms', 'overdose',
  // Hate / extremism
  'nazi', 'kkk', 'swastika', 'white power', 'supremac',
  // Profanity
  'fuck', 'shit', 'bitch', 'whore', 'slut', 'nigger', 'nigga',
  'faggot', 'retard', 'cunt',
  // Other inappropriate for middle school
  'thirst trap', 'suggestive', 'provocative', 'seductive', 'bondage',
  'cigarette', 'smoking', 'vape', 'vaping', 'alcohol', 'beer', 'vodka',
  'twerk', 'lap dance',
]);

// Check if query contains any blocked term (supports partial matches like "masturbating")
function isBlocked(query) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);
  for (const term of BLOCKED_TERMS) {
    // Check each word and also check if any word starts with the term (catches "masturbating", "prostitution", etc.)
    if (words.some(w => w === term || w.startsWith(term))) return true;
    // Check multi-word terms against full query
    if (term.includes(' ') && lower.includes(term)) return true;
  }
  return false;
}

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

  // Block inappropriate searches before they reach Pexels
  if (isBlocked(query)) {
    return res.json({ photos: [], totalResults: 0, page: 1, blocked: true });
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
