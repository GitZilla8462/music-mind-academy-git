// Auto-populate logic for the Press Kit Designer.
// Reads from artist selection, Listening Guide, Sound Statement, and Research Board
// to pre-fill slide fields on first open.

import { getArtistById } from '../artist-discovery/artistDatabase';
import { getResearchBoard } from '../research-board/researchBoardStorage';

/**
 * Load the student's selected artist ID from the artist-discovery localStorage.
 */
function getSelectedArtistId() {
  try {
    const raw = localStorage.getItem('mma-artist-discovery');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.selected || null;
  } catch {
    return null;
  }
}

/**
 * Load the Sound Statement data for an artist.
 * Returns { genre1, genre2, keySound, mood, unique, statement? } or null.
 */
function loadSoundStatement(artistId) {
  try {
    const raw = localStorage.getItem(`mma-sound-statement-${artistId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Load the Listening Guide data for an artist.
 */
function loadListeningGuide(artistId) {
  try {
    const raw = localStorage.getItem(`mma-listening-guide-${artistId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Build a Sound Statement string from the structured fields if no free-text statement exists.
 */
function buildSoundStatementFromFields(ss, artist) {
  if (ss?.statement) return ss.statement;
  // Try to construct from fields
  if (ss?.genre1 && ss?.keySound && ss?.mood) {
    const name = artist?.name || 'This artist';
    return `${name} blends ${ss.genre1}${ss.genre2 ? ` with ${ss.genre2}` : ''}, featuring ${ss.keySound} and creating ${ss.mood.startsWith('a') ? 'an' : 'a'} ${ss.mood} atmosphere${ss.unique ? ` that ${ss.unique}` : ''}.`;
  }
  return '';
}

/**
 * Generate auto-populated fields for all 5 slides.
 * Only fills fields that the student hasn't manually edited (checked via customOverrides).
 *
 * @param {string} artistId
 * @param {Array} existingSlides - current slide data (to check customOverrides)
 * @returns {Array} - array of 5 field objects
 */
function autoPopulateFields(artistId, existingSlides = []) {
  const artist = getArtistById(artistId);
  if (!artist) return Array(5).fill({});

  const ss = loadSoundStatement(artistId);
  const lg = loadListeningGuide(artistId);
  const rb = getResearchBoard();

  const auto = [
    // Slide 1: Meet the Artist
    {
      artistName: artist.name,
      genre: artist.subgenre ? `${artist.genre} / ${artist.subgenre}` : artist.genre,
      location: artist.location,
      hookLine: artist.whyInteresting ? artist.whyInteresting.split('.')[0] + '.' : '',
    },
    // Slide 2: Their Sound
    {
      soundStatement: buildSoundStatementFromFields(ss, artist),
      influences: (artist.influences || []).join(', '),
      moodTags: (lg?.moods || artist.moods || []).slice(0, 4),
      ifYouLike: artist.similarArtists?.[0]
        ? `If you like ${getArtistById(artist.similarArtists[0])?.name || '...'}, you'll love ${artist.name}`
        : '',
    },
    // Slide 3: Why This Artist
    {
      reason1: artist.funFacts?.[0] || '',
      reason2: artist.funFacts?.[1] || '',
      reason3: artist.funFacts?.[2] || '',
    },
    // Slide 4: Listen
    {
      trackTitle: artist.tracks?.[0]?.title || '',
      albumTitle: artist.albumTitle || '',
      whatToListenFor: '',
    },
    // Slide 5: Sign Them
    {
      closingPitch: '',
      callToAction: '',
      memorableFact: artist.funFacts?.[artist.funFacts.length - 1] || '',
    },
  ];

  // Merge: only fill fields that aren't in customOverrides
  return auto.map((fields, i) => {
    const existing = existingSlides[i];
    if (!existing) return fields;
    const merged = { ...fields };
    Object.keys(merged).forEach(key => {
      if (existing.customOverrides?.[key]) {
        merged[key] = existing.fields?.[key] ?? merged[key];
      }
    });
    return merged;
  });
}

export { getSelectedArtistId, autoPopulateFields, loadSoundStatement, loadListeningGuide };
