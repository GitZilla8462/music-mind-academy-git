// Sign or Pass Configuration
// Small-group music ranking game for Unit 3 Lesson 2
// 3 mystery artists play 15s each, students rank 1–3 by "most signable"
// Score points for matching rankings with groupmates

import { getArtistById } from '../artist-discovery/artistDatabase';

// All available artist IDs grouped by genre for diverse selection
const ARTIST_POOLS = {
  'Hip-Hop': ['holiznacc0', 'kellee-maize'],
  'Jazz': ['ketsa'],
  'Electronic': ['broke-for-free', 'soft-and-furious', 'rolemusic', 'nihilore'],
  'Folk / Country': ['josh-woodward', 'jason-shaw', 'david-mumford', 'austin-moffa'],
  'Soundtrack': ['komiku', 'kevin-macleod'],
  'Blues': ['cullah', 'pierce-murphy'],
  'Indie / Alternative': ['jahzzar', 'fog-lake'],
  'Pop': ['pamela-yuen'],
};

const ALL_GENRES = Object.keys(ARTIST_POOLS);

// Parse '3:30' → 210 seconds
const parseDuration = (dur) => {
  if (!dur) return 180;
  const parts = dur.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
};

export const TOTAL_ROUNDS = 5;
export const PREVIEW_DURATION = 15; // seconds per track (from middle of song)
export const AUTO_ADVANCE_DELAY = 5000; // ms after reveal before next round
export const TRANSITION_DELAY = 2000;
export const RANKING_TIME = 45000; // 45s to rank after listening

// Shuffle helper
export const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Pick 1 artist, play 3 of their tracks — "which demo would you send to the label?"
// Each round is a different artist. Forces students to listen to differences within one sound.
export const pickRoundArtists = (usedArtistIds = []) => {
  // Find artists with at least 3 tracks
  const allArtistIds = Object.values(ARTIST_POOLS).flat();
  const eligible = shuffleArray(allArtistIds).filter(artistId => {
    if (usedArtistIds.includes(artistId)) return false;
    const artist = getArtistById(artistId);
    return artist && artist.tracks && artist.tracks.length >= 3;
  });

  // Pick one artist
  const artistId = eligible[0];
  if (!artistId) {
    // Fallback: allow re-using artists if we've exhausted the pool
    const fallback = shuffleArray(allArtistIds).find(id => {
      const a = getArtistById(id);
      return a && a.tracks && a.tracks.length >= 3;
    });
    if (!fallback) return [];
    const artist = getArtistById(fallback);
    return buildTracksForArtist(artist);
  }

  const artist = getArtistById(artistId);
  return buildTracksForArtist(artist);
};

function buildTracksForArtist(artist) {
  const tracks = shuffleArray(artist.tracks).slice(0, 3);
  return tracks.map(track => {
    const totalSecs = parseDuration(track.duration);
    const clipStart = Math.max(0, Math.floor(totalSecs / 2) - 7);
    return {
      id: `${artist.id}-${track.title.replace(/\s+/g, '-').toLowerCase()}`,
      artistId: artist.id,
      name: artist.name,
      genre: artist.genre,
      subgenre: artist.subgenre,
      imageUrl: artist.imageUrl,
      trackTitle: track.title,
      audioUrl: track.audioUrl,
      clipStart,
    };
  });
}

// Calculate scores for a round
// For each ranking position (1, 2, 3): +1 point per other player who gave the same artist the same rank
export const calculateRoundScores = (rankings, memberIds) => {
  const scores = {};
  memberIds.forEach(id => { scores[id] = 0; });

  memberIds.forEach(playerId => {
    const myRanking = rankings[playerId];
    if (!myRanking) return;

    memberIds.forEach(otherId => {
      if (otherId === playerId) return;
      const theirRanking = rankings[otherId];
      if (!theirRanking) return;

      // +1 for each matching rank position
      if (myRanking.rank1 === theirRanking.rank1) scores[playerId]++;
      if (myRanking.rank2 === theirRanking.rank2) scores[playerId]++;
      if (myRanking.rank3 === theirRanking.rank3) scores[playerId]++;
    });
  });

  return scores;
};
