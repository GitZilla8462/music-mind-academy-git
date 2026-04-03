// Download curated images from Pexels for the Press Kit image picker.
// Run: PEXELS_API_KEY=your-key node scripts/download-curated-images.js
// Output: public/images/press-kit/{category}/{id}.jpg + manifest.json

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.PEXELS_API_KEY;
if (!API_KEY) {
  console.error('Set PEXELS_API_KEY env variable');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'press-kit');

const CATEGORIES = {
  'concerts': {
    label: 'Concerts & Live Music',
    emoji: '🎤',
    queries: ['concert crowd', 'live music performance', 'music festival stage', 'rock concert'],
    perQuery: 6,
  },
  'instruments': {
    label: 'Instruments',
    emoji: '🎸',
    queries: ['guitar close up', 'piano keys', 'drums music', 'microphone studio', 'headphones music'],
    perQuery: 4,
  },
  'studios': {
    label: 'Studios & Recording',
    emoji: '🎛️',
    queries: ['recording studio', 'mixing console', 'sound equipment', 'music production'],
    perQuery: 5,
  },
  'artists': {
    label: 'Artists & Performers',
    emoji: '🎵',
    queries: ['singer performing', 'DJ turntable', 'band playing', 'musician portrait', 'rapper microphone'],
    perQuery: 4,
  },
  'city': {
    label: 'City & Street',
    emoji: '🌃',
    queries: ['city skyline night', 'neon lights street', 'urban graffiti art', 'city buildings'],
    perQuery: 5,
  },
  'abstract': {
    label: 'Abstract & Backgrounds',
    emoji: '🎨',
    queries: ['abstract colorful', 'gradient background', 'neon smoke', 'texture dark', 'light trails'],
    perQuery: 4,
  },
  'nature': {
    label: 'Nature & Mood',
    emoji: '🌅',
    queries: ['sunset clouds', 'ocean waves', 'mountain landscape', 'forest fog', 'rain window'],
    perQuery: 4,
  },
};

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: API_KEY } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        https.get(res.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function main() {
  const manifest = {};
  const seenIds = new Set();
  let totalDownloaded = 0;

  for (const [catId, cat] of Object.entries(CATEGORIES)) {
    console.log(`\n📁 ${cat.label}`);
    const catDir = path.join(OUTPUT_DIR, catId);
    fs.mkdirSync(catDir, { recursive: true });

    manifest[catId] = {
      label: cat.label,
      emoji: cat.emoji,
      images: [],
    };

    for (const query of cat.queries) {
      console.log(`  🔍 "${query}" (${cat.perQuery} photos)`);
      try {
        const data = await fetchJSON(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${cat.perQuery}&orientation=landscape&size=medium`
        );

        for (const photo of (data.photos || [])) {
          if (seenIds.has(photo.id)) continue;
          seenIds.add(photo.id);

          const filename = `${photo.id}.jpg`;
          const filepath = path.join(catDir, filename);

          // Download medium size (350px wide — good for thumbnails)
          // and large size (940px wide — good for slides)
          const thumbFile = `${photo.id}-thumb.jpg`;
          const thumbPath = path.join(catDir, thumbFile);

          await downloadFile(photo.src.large, filepath);
          await downloadFile(photo.src.medium, thumbPath);

          manifest[catId].images.push({
            id: photo.id,
            file: filename,
            thumb: thumbFile,
            alt: photo.alt || '',
            photographer: photo.photographer,
            w: photo.width,
            h: photo.height,
          });

          totalDownloaded++;
          process.stdout.write(`    ✅ ${photo.id} (${photo.photographer})\n`);
        }

        // Rate limit: Pexels allows 200/hour, wait 500ms between queries
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        console.error(`    ❌ Error: ${err.message}`);
      }
    }

    console.log(`  → ${manifest[catId].images.length} photos`);
  }

  // Write manifest
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Done! ${totalDownloaded} photos downloaded to ${OUTPUT_DIR}`);
  console.log(`📋 Manifest written to ${manifestPath}`);
  console.log('\nNext steps:');
  console.log('1. Upload public/images/press-kit/ to R2 at images/press-kit/');
  console.log('2. Update ImagePickerModal to use the manifest');
}

main().catch(console.error);
