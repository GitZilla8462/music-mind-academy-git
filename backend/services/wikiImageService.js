const axios = require('axios');
const ImageCache = require('../models/ImageCache');

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

// Wikipedia requires a User-Agent header
const HEADERS = {
  'User-Agent': 'MusicMindAcademy/1.0 (rob@musicmindacademy.com) Node.js'
};

/**
 * Get the main Wikipedia page image for a topic
 */
const getWikipediaImage = async (topic) => {
  try {
    const { data } = await axios.get(WIKI_API, {
      params: {
        action: 'query',
        titles: topic,
        prop: 'pageimages',
        format: 'json',
        pithumbsize: 800
      },
      headers: HEADERS,
      timeout: 8000
    });

    const pages = data?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0];
    if (!page?.thumbnail?.source) return null;

    // Skip non-image files
    const imgUrl = page.thumbnail.source;
    if (/\.(djvu|svg|pdf|ogg|ogv|webm)/i.test(imgUrl)) return null;

    return {
      url: imgUrl,
      thumbnail_url: imgUrl,
      title: page.title,
      attribution: `Image from Wikipedia: ${page.title}`,
      license: 'CC BY-SA'
    };
  } catch (error) {
    console.error(`Wiki image fetch failed for "${topic}":`, error.message);
    return null;
  }
};

/**
 * Search Wikimedia Commons for images
 */
const searchImages = async (query, limit = 12) => {
  // Check cache first
  try {
    const cached = await ImageCache.findOne({ query: query.toLowerCase() });
    if (cached) {
      console.log(`Image cache hit for "${query}"`);
      return cached.results;
    }
  } catch (e) { /* ignore cache errors */ }

  try {
    const { data: searchData } = await axios.get(COMMONS_API, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        srnamespace: 6,
        format: 'json',
        srlimit: limit
      },
      headers: HEADERS,
      timeout: 10000
    });

    const searchResults = searchData?.query?.search || [];
    if (searchResults.length === 0) return [];

    const results = [];
    for (const result of searchResults.slice(0, limit)) {
      try {
        const { data: infoData } = await axios.get(COMMONS_API, {
          params: {
            action: 'query',
            titles: result.title,
            prop: 'imageinfo',
            iiprop: 'url|extmetadata|mime',
            format: 'json'
          },
          headers: HEADERS,
          timeout: 5000
        });

        const pages = infoData?.query?.pages;
        if (!pages) continue;

        const page = Object.values(pages)[0];
        const imageInfo = page?.imageinfo?.[0];
        if (!imageInfo?.url) continue;

        const mime = imageInfo.mime || '';
        if (!mime.startsWith('image/')) continue;
        // Skip non-photo formats
        if (/\.(djvu|svg|pdf)/i.test(imageInfo.url)) continue;

        const meta = imageInfo.extmetadata || {};
        const artist = meta.Artist?.value?.replace(/<[^>]*>/g, '') || 'Unknown';
        const license = meta.LicenseShortName?.value || 'Unknown license';
        const description = meta.ImageDescription?.value?.replace(/<[^>]*>/g, '') || result.title;

        const thumbUrl = imageInfo.url.replace('/commons/', '/commons/thumb/') + '/400px-' + result.title.replace('File:', '');

        results.push({
          url: imageInfo.url,
          thumbnail_url: thumbUrl,
          title: description.substring(0, 100),
          attribution: `${artist}, ${license}`,
          license
        });
      } catch (e) {
        continue;
      }
    }

    // Cache results
    try {
      await ImageCache.findOneAndUpdate(
        { query: query.toLowerCase() },
        { query: query.toLowerCase(), results, cached_at: new Date() },
        { upsert: true }
      );
    } catch (e) { /* ignore cache write errors */ }

    return results;
  } catch (error) {
    console.error(`Commons search failed for "${query}":`, error.message);
    return [];
  }
};

module.exports = { getWikipediaImage, searchImages };
