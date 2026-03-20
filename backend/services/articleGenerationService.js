const axios = require('axios');
const Article = require('../models/Article');
const ArtistBlocklist = require('../models/ArtistBlocklist');
const ArtistAllowlist = require('../models/ArtistAllowlist');
const { getWikipediaImage, searchImages } = require('./wikiImageService');

// RSS feed sources
const RSS_FEEDS = [
  { url: 'https://www.grammy.com/rss', name: 'Grammy.com' },
  { url: 'https://feeds.npr.org/1139/rss.xml', name: 'NPR Music' },
  { url: 'https://pitchfork.com/rss/news/feed.xml', name: 'Pitchfork' },
  { url: 'https://www.rollingstone.com/music/music-news/feed/', name: 'Rolling Stone' }
];

// Keywords that disqualify an article for grades 6-8
const BLOCKED_KEYWORDS = [
  'explicit', 'nsfw', 'drug', 'cocaine', 'heroin', 'meth', 'overdose',
  'marijuana', 'weed', 'opioid', 'fentanyl', 'arrested', 'assault',
  'murder', 'killed', 'shooting', 'stabbing', 'sexual', 'nude',
  'strip', 'drunk', 'dui', 'rehab', 'addiction', 'suicide',
  'domestic violence', 'abuse allegations', 'r-rated', 'x-rated'
];

/**
 * Parse RSS XML into article items (lightweight — no external XML parser needed)
 */
const parseRSSItems = (xml) => {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getTag = (tag) => {
      const tagMatch = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return (tagMatch?.[1] || tagMatch?.[2] || '').trim();
    };

    const title = getTag('title');
    const link = getTag('link');
    const pubDate = getTag('pubDate');
    const description = getTag('description').replace(/<[^>]*>/g, '').substring(0, 500);

    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }

  return items;
};

/**
 * Fetch and parse all RSS feeds
 */
const fetchRSSFeeds = async () => {
  const allItems = [];

  for (const feed of RSS_FEEDS) {
    try {
      const { data } = await axios.get(feed.url, {
        timeout: 10000,
        headers: { 'User-Agent': 'MMA-NewsFeed/1.0' }
      });
      const items = parseRSSItems(data);
      items.forEach(item => {
        allItems.push({ ...item, source_name: feed.name });
      });
      console.log(`📡 Fetched ${items.length} items from ${feed.name}`);
    } catch (error) {
      console.error(`❌ Failed to fetch ${feed.name}:`, error.message);
    }
  }

  return allItems;
};

/**
 * Filter articles for appropriateness and duplicates
 */
const filterArticles = async (items) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get blocklist
  const blocklist = await ArtistBlocklist.find({});
  const blockedNames = blocklist.map(a => a.artist_name.toLowerCase());

  // Check for existing URLs
  const existingUrls = new Set(
    (await Article.find({}, 'source_url').lean()).map(a => a.source_url)
  );

  return items.filter(item => {
    // Skip duplicates
    if (existingUrls.has(item.link)) return false;

    // Skip old articles
    const pubDate = new Date(item.pubDate);
    if (pubDate < sevenDaysAgo) return false;

    // Skip blocked keywords in title
    const titleLower = item.title.toLowerCase();
    if (BLOCKED_KEYWORDS.some(kw => titleLower.includes(kw))) return false;

    // Skip blocked artists
    if (blockedNames.some(name => titleLower.includes(name))) return false;

    return true;
  });
};

/**
 * Generate a grade-appropriate article using Claude API
 */
const generateArticle = async (headline, description, readingLevel = 'standard') => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  const gradeLevel = readingLevel === 'simplified' ? '6-7' : '7-8';
  const simplifyNote = readingLevel === 'simplified'
    ? ' Use simpler vocabulary and shorter sentences. Aim for a Flesch-Kincaid grade level of 6.'
    : '';

  const systemPrompt = `You are a music journalist writing for a middle school audience (grades ${gradeLevel}). Write an original 220-250 word news article based on the topic and headline provided.
Requirements:
- Reading level: Flesch-Kincaid grade ${gradeLevel}${simplifyNote}
- Define any music vocabulary terms inline using parentheses, e.g. 'the bridge (the contrasting section of a song)'
- Stick to facts — no speculation or unverified claims
- Do not reproduce content from the source article — write your own original article
- Do not mention any explicit content, drug use, or mature themes
- If the artist is primarily known for explicit content, focus only on their musical style, influences, and cultural impact
- End with one discussion question for classroom use
- Format: headline (bold), byline 'MMA News Desk', article body, discussion question labeled 'Talk About It:'
- Do not use markdown. Plain text only.`;

  const userPrompt = `Write a music news article for middle schoolers about this topic: ${headline}. Here is background context: ${description}`;

  try {
    const { data } = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      timeout: 30000
    });

    const text = data?.content?.[0]?.text || '';

    // Extract headline (first line, often bold)
    const lines = text.split('\n').filter(l => l.trim());
    const generatedHeadline = lines[0]?.replace(/^\*+|\*+$/g, '').trim() || headline;

    // Extract discussion question
    const talkMatch = text.match(/Talk About It:\s*(.*?)$/im);
    const discussionQuestion = talkMatch?.[1]?.trim() || '';

    // Body is everything between headline/byline and discussion question
    const body = text;

    return { generated_headline: generatedHeadline, body, discussion_question: discussionQuestion };
  } catch (error) {
    console.error('Claude API error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Extract topics, artists, and genres from headline and description
 */
const extractTopicsAndArtists = async (headline, description) => {
  const combined = `${headline} ${description}`.toLowerCase();
  const artists = [];
  const genres = [];

  // Check against allowlist
  const allowlist = await ArtistAllowlist.find({});
  for (const entry of allowlist) {
    if (combined.includes(entry.artist_name.toLowerCase())) {
      artists.push(entry.artist_name);
      if (entry.genres) genres.push(...entry.genres);
    }
  }

  // Genre keyword detection
  const genreMap = {
    'hip-hop': ['hip-hop', 'hip hop', 'rap', 'rapper'],
    'pop': ['pop'],
    'rock': ['rock', 'punk', 'metal', 'alternative'],
    'classical': ['classical', 'orchestra', 'symphony', 'opera'],
    'jazz': ['jazz'],
    'latin': ['latin', 'reggaeton', 'salsa', 'bachata'],
    'country': ['country', 'nashville'],
    'world': ['world music', 'afrobeat', 'k-pop', 'j-pop'],
    'industry': ['grammy', 'billboard', 'streaming', 'record label', 'tour', 'concert']
  };

  for (const [genre, keywords] of Object.entries(genreMap)) {
    if (keywords.some(kw => combined.includes(kw)) && !genres.includes(genre)) {
      genres.push(genre);
    }
  }

  // Simple topic extraction (capitalize notable words)
  const topics = [...new Set([...artists, ...genres])];

  return { topics, artists: [...new Set(artists)], genres: [...new Set(genres)] };
};

/**
 * Run the daily article generation pipeline
 */
const runDailyPipeline = async () => {
  console.log('🗞️ Starting daily article generation pipeline...');
  const results = { generated: 0, skipped: 0, errors: [], startedAt: new Date() };

  try {
    // 1. Fetch RSS feeds
    const allItems = await fetchRSSFeeds();
    console.log(`📰 Fetched ${allItems.length} total RSS items`);

    // 2. Filter
    const filtered = await filterArticles(allItems);
    console.log(`✅ ${filtered.length} articles passed filters (${allItems.length - filtered.length} skipped)`);
    results.skipped = allItems.length - filtered.length;

    // 3. Process (limit to 5 per run)
    const toProcess = filtered.slice(0, 5);

    for (const item of toProcess) {
      try {
        console.log(`📝 Generating article: "${item.title}"`);

        // Generate standard version
        const standard = await generateArticle(item.title, item.description, 'standard');
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 2000));

        // Generate simplified version
        const simplified = await generateArticle(item.title, item.description, 'simplified');
        await new Promise(r => setTimeout(r, 1000));

        // Fetch image
        const artistName = item.title.split(/[:\-–—]/).map(s => s.trim())[0];
        let image = await getWikipediaImage(artistName);
        if (!image) {
          const commons = await searchImages(artistName, 1);
          image = commons[0] || null;
        }

        // Extract metadata
        const { topics, artists, genres } = await extractTopicsAndArtists(item.title, item.description);

        // Save to MongoDB
        const article = new Article({
          source_url: item.link,
          source_name: item.source_name,
          original_headline: item.title,
          generated_headline: standard.generated_headline,
          body_standard: standard.body,
          body_simplified: simplified.body,
          discussion_question: standard.discussion_question,
          image_url: image?.url || null,
          image_attribution: image?.attribution || null,
          topics,
          artists,
          genres,
          published_at: new Date(item.pubDate),
          generated_at: new Date()
        });

        await article.save();
        results.generated++;
        console.log(`✅ Saved: "${standard.generated_headline}"`);
      } catch (error) {
        console.error(`❌ Failed to generate article for "${item.title}":`, error.message);
        results.errors.push({ title: item.title, error: error.message });
      }
    }

    // 4. Auto-feature the most recent approved article
    await Article.updateMany({ featured: true }, { featured: false });
    const newest = await Article.findOne({ approved: true }).sort({ generated_at: -1 });
    if (newest) {
      newest.featured = true;
      await newest.save();
      console.log(`⭐ Featured: "${newest.generated_headline}"`);
    }

    results.completedAt = new Date();
    console.log(`🗞️ Pipeline complete. Generated: ${results.generated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
    return results;
  } catch (error) {
    console.error('❌ Pipeline failed:', error);
    results.errors.push({ title: 'Pipeline error', error: error.message });
    results.completedAt = new Date();
    return results;
  }
};

module.exports = {
  fetchRSSFeeds,
  filterArticles,
  generateArticle,
  fetchWikimediaImage: getWikipediaImage,
  extractTopicsAndArtists,
  runDailyPipeline
};
