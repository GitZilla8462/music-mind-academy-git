#!/usr/bin/env node
/**
 * Generate loops.json manifest from public/projects/film-music-score/loops
 *
 * This script scans the loops directory and creates a JSON manifest file
 * that the frontend can use directly, eliminating the need for a backend API.
 *
 * Run manually: node scripts/generateLoopManifest.js
 * Runs automatically: during `npm run build`
 */

const fs = require('fs');
const path = require('path');

const LOOPS_DIR = path.join(__dirname, '../public/projects/film-music-score/loops');
const OUTPUT_FILE = path.join(__dirname, '../public/projects/film-music-score/loops.json');
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

function detectMood(name) {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('scary') || nameLower.includes('horror') || nameLower.includes('frightening') || nameLower.includes('creepy')) {
    return 'Scary';
  } else if (nameLower.includes('mysterious') || nameLower.includes('mystery') || nameLower.includes('suspense') || nameLower.includes('enigma')) {
    return 'Mysterious';
  } else if (nameLower.includes('heroic') || nameLower.includes('hero') || nameLower.includes('triumphant') || nameLower.includes('victory') || nameLower.includes('epic') || nameLower.includes('brave')) {
    return 'Heroic';
  } else if (nameLower.includes('hype') || nameLower.includes('hyped') || nameLower.includes('pumped')) {
    return 'Hype';
  } else if (nameLower.includes('upbeat') || nameLower.includes('happy') || nameLower.includes('energetic') || nameLower.includes('cheerful') || nameLower.includes('bright') || nameLower.includes('positive')) {
    return 'Upbeat';
  } else if (nameLower.includes('sad') || nameLower.includes('melancholy') || nameLower.includes('somber')) {
    return 'Sad';
  } else if (nameLower.includes('chill') || nameLower.includes('calm') || nameLower.includes('peaceful') || nameLower.includes('relaxed')) {
    return 'Chill';
  } else if (nameLower.includes('dark') || nameLower.includes('ominous') || nameLower.includes('tense')) {
    return 'Dark';
  } else if (nameLower.includes('dramatic') || nameLower.includes('intense')) {
    return 'Dramatic';
  } else if (nameLower.includes('romantic') || nameLower.includes('tender')) {
    return 'Romantic';
  }
  return 'Neutral';
}

function detectInstrument(name) {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('guitar') || nameLower.includes('gtr')) {
    return 'Guitar';
  } else if (nameLower.includes('bass')) {
    return 'Bass';
  } else if (nameLower.includes('key') || nameLower.includes('piano')) {
    return 'Keys';
  } else if (nameLower.includes('synth')) {
    return 'Synth';
  } else if (nameLower.includes('drum') || nameLower.includes('beat') || nameLower.includes('percussion')) {
    return 'Drums';
  } else if (nameLower.includes('string') || nameLower.includes('violin') || nameLower.includes('cello')) {
    return 'Strings';
  } else if (nameLower.includes('brass') || nameLower.includes('trumpet') || nameLower.includes('horn')) {
    return 'Brass';
  } else if (nameLower.includes('wood') || nameLower.includes('flute') || nameLower.includes('clarinet') || nameLower.includes('oboe') || nameLower.includes('bells')) {
    return 'Woodwinds';
  } else if (nameLower.includes('vocal') || nameLower.includes('voice') || nameLower.includes('choir') || nameLower.includes('song')) {
    return 'Vocals';
  }
  return 'Other';
}

function createLoopObject(filename) {
  const extension = path.extname(filename).toLowerCase().substring(1);
  const nameWithoutExt = path.basename(filename, path.extname(filename)).trim();

  const mood = detectMood(nameWithoutExt);
  const instrument = detectInstrument(nameWithoutExt);

  return {
    id: nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
    name: nameWithoutExt,
    file: `/projects/film-music-score/loops/${filename}`,
    extension: extension,
    mood: mood,
    instrument: instrument
  };
}

function generateManifest() {
  console.log('🎵 Generating loop manifest...');
  console.log(`   Source: ${LOOPS_DIR}`);
  console.log(`   Output: ${OUTPUT_FILE}`);

  // Check if loops directory exists
  if (!fs.existsSync(LOOPS_DIR)) {
    console.error(`❌ Loops directory not found: ${LOOPS_DIR}`);
    process.exit(1);
  }

  // Read all files
  const files = fs.readdirSync(LOOPS_DIR);

  // Filter to audio files only
  const audioFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return AUDIO_EXTENSIONS.includes(ext);
  });

  console.log(`   Found ${audioFiles.length} audio files`);

  // Create loop objects
  const loops = audioFiles.map(createLoopObject);

  // Sort by name for consistent ordering
  loops.sort((a, b) => a.name.localeCompare(b.name));

  // Count by mood for summary
  const moodCounts = {};
  loops.forEach(loop => {
    moodCounts[loop.mood] = (moodCounts[loop.mood] || 0) + 1;
  });

  // Write manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    count: loops.length,
    loops: loops
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

  console.log('✅ Loop manifest generated successfully!');
  console.log('   Mood breakdown:');
  Object.entries(moodCounts).sort().forEach(([mood, count]) => {
    console.log(`     - ${mood}: ${count}`);
  });
}

// Run if called directly
if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest };
