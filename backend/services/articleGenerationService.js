const axios = require('axios');
const Article = require('../models/Article');
const ArtistBlocklist = require('../models/ArtistBlocklist');
const ArtistAllowlist = require('../models/ArtistAllowlist');
const { getWikipediaImage, searchImages } = require('./wikiImageService');
const { sendApprovalDigest } = require('./articleApprovalService');

// RSS feed sources — music news outlets
const RSS_FEEDS = [
  { url: 'https://www.npr.org/rss/rss.php?id=10001', name: 'NPR Music' },
  { url: 'https://www.rollingstone.com/music/music-news/feed/', name: 'Rolling Stone' },
  { url: 'https://www.billboard.com/feed/', name: 'Billboard' },
  { url: 'https://www.nme.com/news/music/feed', name: 'NME' },
  { url: 'https://www.stereogum.com/feed/', name: 'Stereogum' },
];

// Keywords that disqualify an article for grades 6-8
const BLOCKED_KEYWORDS = [
  // Substances
  'explicit', 'nsfw', 'drug', 'cocaine', 'heroin', 'meth', 'overdose',
  'marijuana', 'weed', 'opioid', 'fentanyl', 'drunk', 'dui', 'dwi',
  'rehab', 'addiction', 'intoxicated', 'substance',
  // Violence & crime
  'arrested', 'arrest', 'assault', 'murder', 'killed', 'shooting',
  'stabbing', 'sexual', 'nude', 'strip', 'lawsuit', 'charged',
  'indicted', 'convicted', 'prison', 'jail', 'manslaughter',
  // Adult content
  'domestic violence', 'abuse', 'allegations', 'r-rated', 'x-rated',
  'infidelity', 'affair', 'cheating', 'divorce', 'custody',
  // Mental health (too heavy for 6-8)
  'suicide', 'self-harm', 'eating disorder', 'overdosed',
  // Death
  'dies', 'died', 'death', 'dead', 'obituary', 'funeral', 'mourning',
  'passed away', 'rip',
  // Personal life (not relevant to music education)
  'pregnant', 'pregnancy', 'baby', 'expecting',
  // Controversy
  'scandal', 'controversy', 'feud', 'beef', 'diss', 'fired',
  'ousted', 'canceled', 'cancel culture', 'backlash',
  // Politics (keep it about music)
  'political', 'election', 'protest', 'boycott'
];

/**
 * Parse RSS XML into article items
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
        headers: { 'User-Agent': 'MusicMindAcademy/1.0 (rob@musicmindacademy.com)' }
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
 * Extract the full article text from a source URL.
 * Uses @extractus/article-extractor to pull the main content.
 * Falls back to RSS description if extraction fails.
 */
const extractSourceArticle = async (url) => {
  try {
    // Dynamic import (article-extractor is ESM-only)
    const { extract } = await import('@extractus/article-extractor');
    const article = await extract(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (article && article.content) {
      // Strip HTML tags, keep plain text
      const plainText = article.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#\d+;/g, ' ')
        .replace(/&\w+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Truncate to ~2000 chars to keep Claude's context focused
      const truncated = plainText.substring(0, 2000);
      console.log(`📄 Extracted ${truncated.length} chars from ${url}`);
      return {
        text: truncated,
        title: article.title || '',
        author: article.author || '',
        published: article.published || ''
      };
    }
  } catch (error) {
    console.warn(`⚠️ Could not extract article from ${url}: ${error.message}`);
  }

  return null;
};

/**
 * Filter articles for appropriateness and duplicates
 */
const filterArticles = async (items) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const blocklist = await ArtistBlocklist.find({});
  const blockedNames = blocklist.map(a => a.artist_name.toLowerCase());

  const existingUrls = new Set(
    (await Article.find({}, 'source_url').lean()).map(a => a.source_url)
  );

  return items.filter(item => {
    if (existingUrls.has(item.link)) return false;

    const pubDate = new Date(item.pubDate);
    if (pubDate < sevenDaysAgo) return false;

    const titleLower = item.title.toLowerCase();
    if (BLOCKED_KEYWORDS.some(kw => titleLower.includes(kw))) return false;
    if (blockedNames.some(name => titleLower.includes(name))) return false;

    return true;
  });
};

/**
 * Also filter the extracted source text for blocked content
 */
const isSourceTextSafe = (text) => {
  if (!text) return true;
  const lower = text.toLowerCase();
  return !BLOCKED_KEYWORDS.some(kw => lower.includes(kw));
};

/**
 * Generate a grade-appropriate article using Claude API.
 * Now receives the FULL source article text so Claude writes from real facts.
 */
const generateArticle = async (headline, sourceText, readingLevel = 'standard') => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  const gradeLevel = readingLevel === 'simplified' ? '6-7' : '7-8';
  const simplifyNote = readingLevel === 'simplified'
    ? ' Use simpler vocabulary and shorter sentences. Aim for a Flesch-Kincaid grade level of 6.'
    : '';

  const systemPrompt = `You are a music journalist writing for a middle school audience (grades ${gradeLevel}). You will be given the full text of a real news article. Your job is to rewrite it as an original article for students.

Requirements:
- Reading level: Flesch-Kincaid grade ${gradeLevel}${simplifyNote}
- ONLY include facts that appear in the source material. Do NOT add, invent, or speculate about any details.
- Rewrite entirely in your own words — do not copy phrases or sentences from the source
- Length: 200-280 words
- Define any music vocabulary terms inline using parentheses, e.g. 'the bridge (the contrasting section of a song)'
- Skip any mentions of explicit content, drug use, violence, or mature themes — focus on the music
- If the source doesn't have enough appropriate content, write a shorter article with only what you can verify
- End with one thoughtful discussion question for classroom use labeled 'Talk About It:'

Format (plain text only, no markdown):
Line 1: Headline
Line 2: MMA News Desk
Line 3+: Article body
Last line: Talk About It: [question]`;

  const userPrompt = `Rewrite this music news article for middle school students.

SOURCE HEADLINE: ${headline}

SOURCE ARTICLE TEXT:
${sourceText}`;

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

    // Extract headline (first line)
    const lines = text.split('\n').filter(l => l.trim());
    const generatedHeadline = lines[0]?.replace(/^\*+|\*+$/g, '').trim() || headline;

    // Extract discussion question
    const talkMatch = text.match(/Talk About It:\s*(.*?)$/im);
    const discussionQuestion = talkMatch?.[1]?.trim() || '';

    // Clean up body
    let body = text;
    body = body.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
    const bodyLines = body.split('\n').filter(l => l.trim());
    const cleanLines = bodyLines.filter(l => {
      const trimmed = l.trim();
      if (trimmed === generatedHeadline) return false;
      if (/^MMA News Desk$/i.test(trimmed)) return false;
      if (/^Talk About It:/i.test(trimmed)) return false;
      return true;
    });
    body = cleanLines.join('\n\n').trim();

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

  const allowlist = await ArtistAllowlist.find({});
  for (const entry of allowlist) {
    if (combined.includes(entry.artist_name.toLowerCase())) {
      artists.push(entry.artist_name);
      if (entry.genres) genres.push(...entry.genres);
    }
  }

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

  const topics = [...new Set([...artists, ...genres])];
  return { topics, artists: [...new Set(artists)], genres: [...new Set(genres)] };
};

/**
 * Run the weekly article generation pipeline.
 * Generates up to 10 articles from real source content.
 */
const runDailyPipeline = async () => {
  console.log('🗞️  Starting weekly article generation pipeline...');
  const results = { generated: 0, skipped: 0, errors: [], startedAt: new Date() };

  try {
    // 1. Fetch RSS feeds
    const allItems = await fetchRSSFeeds();
    console.log(`📰 Fetched ${allItems.length} total RSS items`);

    // 2. Filter for appropriateness
    const filtered = await filterArticles(allItems);
    console.log(`✅ ${filtered.length} articles passed filters (${allItems.length - filtered.length} skipped)`);
    results.skipped = allItems.length - filtered.length;

    // 3. Deduplicate — max 1 article per artist/topic per run for variety
    const seenSubjects = {};
    const deduped = filtered.filter(item => {
      const subject = item.title.split(/[:\-–—,]/)[0].trim().toLowerCase().slice(0, 30);
      seenSubjects[subject] = (seenSubjects[subject] || 0) + 1;
      return seenSubjects[subject] <= 1;
    });

    // 4. Process candidates until we have 10 articles (or run out)
    const toProcess = deduped.slice(0, 25);
    console.log(`📋 Processing ${toProcess.length} articles for this week`);
    let usedImageUrls = new Set();

    const TARGET_COUNT = 10;

    for (const item of toProcess) {
      if (results.generated >= TARGET_COUNT) {
        console.log(`\n🎯 Reached ${TARGET_COUNT} articles, stopping.`);
        break;
      }

      try {
        console.log(`\n📝 Processing (${results.generated + 1}/${TARGET_COUNT}): "${item.title}"`);

        // Step A: Extract the FULL source article text
        console.log(`   📄 Fetching source article from ${item.source_name}...`);
        const sourceData = await extractSourceArticle(item.link);
        const sourceText = sourceData?.text || item.description || '';

        if (!sourceText || sourceText.length < 50) {
          console.log(`   ⚠️  Source text too short (${sourceText.length} chars), skipping`);
          results.skipped++;
          continue;
        }

        // Step B: Check source text for blocked content
        if (!isSourceTextSafe(sourceText)) {
          console.log(`   🚫 Source text contains blocked content, skipping`);
          results.skipped++;
          continue;
        }

        // Step C: Generate STANDARD version from real source text
        console.log(`   ✍️  Writing standard version from ${sourceText.length} chars of source...`);
        const standard = await generateArticle(item.title, sourceText, 'standard');
        await new Promise(r => setTimeout(r, 2000));

        // Step D: Generate SIMPLIFIED version from same source text
        console.log(`   ✍️  Writing simplified version...`);
        const simplified = await generateArticle(item.title, sourceText, 'simplified');
        await new Promise(r => setTimeout(r, 1000));

        // Step E: Fetch image
        const headlineParts = standard.generated_headline.split(/['':,\-–—]/);
        let artistName = headlineParts[0].trim();
        if (artistName.split(' ').length > 4) {
          artistName = artistName.split(' ').slice(0, 3).join(' ');
        }

        let image = null;
        const commonsResults = await searchImages(artistName + ' musician', 6);
        for (const candidate of commonsResults) {
          if (!usedImageUrls.has(candidate.url)) {
            image = candidate;
            usedImageUrls.add(candidate.url);
            break;
          }
        }
        if (!image) {
          const wikiImg = await getWikipediaImage(artistName);
          if (wikiImg && !usedImageUrls.has(wikiImg.url)) {
            image = wikiImg;
            usedImageUrls.add(wikiImg.url);
          }
        }
        if (!image) {
          const wikiImg2 = await getWikipediaImage(artistName + ' (band)');
          if (wikiImg2 && !usedImageUrls.has(wikiImg2.url)) {
            image = wikiImg2;
            usedImageUrls.add(wikiImg2.url);
          }
        }

        // Step F: Extract metadata
        const { topics, artists, genres } = await extractTopicsAndArtists(item.title, sourceText);

        // Step G: Save to MongoDB (pending approval)
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
          generated_at: new Date(),
          approved: false
        });

        await article.save();
        results.generated++;
        console.log(`   ✅ Saved: "${standard.generated_headline}" (${sourceText.length} chars of source used)`);
      } catch (error) {
        console.error(`   ❌ Failed: "${item.title}": ${error.message}`);
        results.errors.push({ title: item.title, error: error.message });
      }
    }

    // 5. Send approval digest email
    if (results.generated > 0) {
      const pendingArticles = await Article.find({ approved: false })
        .sort({ generated_at: -1 })
        .limit(results.generated);
      await sendApprovalDigest(pendingArticles);
    }

    // 6. Auto-feature the most recent approved article
    await Article.updateMany({ featured: true }, { featured: false });
    const newest = await Article.findOne({ approved: true }).sort({ generated_at: -1 });
    if (newest) {
      newest.featured = true;
      await newest.save();
      console.log(`⭐ Featured: "${newest.generated_headline}"`);
    }

    results.completedAt = new Date();
    console.log(`\n🗞️  Pipeline complete. Generated: ${results.generated}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
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
  extractSourceArticle,
  fetchWikimediaImage: getWikipediaImage,
  extractTopicsAndArtists,
  runDailyPipeline
};
