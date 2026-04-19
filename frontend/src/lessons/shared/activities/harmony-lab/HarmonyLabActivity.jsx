// File: /src/lessons/shared/activities/harmony-lab/HarmonyLabActivity.jsx
// Harmony Lab - Students try different chord/pad options underneath a melody
// Part of Film Music Lesson 4: HOW Does Tension Build? (Harmony & Tension)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Check, ChevronRight, Trophy, Volume2 } from 'lucide-react';
import * as Tone from 'tone';
import { saveStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

// Chord options students can try
const CHORDS = [
  {
    id: 'c-major',
    name: 'C Major',
    notes: ['C3', 'E3', 'G3'],
    quality: 'major',
    emotion: 'Bright, happy, resolved',
    color: '#10B981',
  },
  {
    id: 'a-minor',
    name: 'A Minor',
    notes: ['A2', 'C3', 'E3'],
    quality: 'minor',
    emotion: 'Sad, melancholy, reflective',
    color: '#3B82F6',
  },
  {
    id: 'f-major',
    name: 'F Major',
    notes: ['F2', 'A2', 'C3'],
    quality: 'major',
    emotion: 'Warm, gentle, comforting',
    color: '#F59E0B',
  },
  {
    id: 'e-minor',
    name: 'E Minor',
    notes: ['E2', 'G2', 'B2'],
    quality: 'minor',
    emotion: 'Dark, mysterious, tense',
    color: '#8B5CF6',
  },
  {
    id: 'g-major',
    name: 'G Major',
    notes: ['G2', 'B2', 'D3'],
    quality: 'major',
    emotion: 'Bold, open, heroic',
    color: '#EF4444',
  },
  {
    id: 'd-minor',
    name: 'D Minor',
    notes: ['D2', 'F2', 'A2'],
    quality: 'minor',
    emotion: 'Ominous, serious, dramatic',
    color: '#6B7280',
  },
];

// Simple melody to play over the chords
const MELODY_NOTES = [
  { note: 'E4', duration: '4n' },
  { note: 'G4', duration: '4n' },
  { note: 'A4', duration: '2n' },
  { note: 'G4', duration: '4n' },
  { note: 'E4', duration: '2n.' },
];

const HarmonyLabActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [ratings, setRatings] = useState({}); // { chordId: 'fits' | 'doesnt-fit' }
  const [favoriteChord, setFavoriteChord] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const padSynthRef = useRef(null);
  const melodySynthRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (padSynthRef.current) padSynthRef.current.dispose();
      if (melodySynthRef.current) melodySynthRef.current.dispose();
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  const playChordWithMelody = useCallback(async (chord) => {
    if (isPlaying) return;
    await Tone.start();

    // Dispose old synths
    if (padSynthRef.current) padSynthRef.current.dispose();
    if (melodySynthRef.current) melodySynthRef.current.dispose();

    // Pad synth - sustained chord
    padSynthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.5, decay: 0.8, sustain: 0.9, release: 1.5 }
    }).toDestination();
    padSynthRef.current.volume.value = -12;

    // Melody synth
    melodySynthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 }
    }).toDestination();
    melodySynthRef.current.volume.value = -6;

    setIsPlaying(true);
    setHasListened(prev => ({ ...prev, [chord.id]: true }));

    const now = Tone.now();

    // Play sustained chord
    padSynthRef.current.triggerAttackRelease(chord.notes, '2m', now);

    // Play melody on top
    let time = now + 0.2;
    MELODY_NOTES.forEach(({ note, duration }) => {
      melodySynthRef.current.triggerAttackRelease(note, duration, time);
      // Convert duration to seconds roughly
      const durationMap = { '4n': 0.5, '2n': 1.0, '2n.': 1.5 };
      time += durationMap[duration] || 0.5;
    });

    // Stop after ~4 seconds
    setTimeout(() => {
      setIsPlaying(false);
    }, 4500);
  }, [isPlaying]);

  const currentChord = CHORDS[currentChordIndex];

  const handleRate = (rating) => {
    setRatings(prev => ({ ...prev, [currentChord.id]: rating }));
  };

  const handleNext = () => {
    if (currentChordIndex < CHORDS.length - 1) {
      setCurrentChordIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentChordIndex > 0) {
      setCurrentChordIndex(prev => prev - 1);
    }
  };

  const allRated = Object.keys(ratings).length === CHORDS.length;

  const handlePickFavorite = () => {
    setIsComplete(true);
    const studentId = getStudentId();
    saveStudentWork('fm-lesson4-harmony-lab', {
      title: 'Harmony Lab',
      emoji: '🎹',
      subtitle: favoriteChord ? `Favorite: ${CHORDS.find(c => c.id === favoriteChord)?.name}` : `${Object.keys(ratings).length} chords rated`,
      category: 'Film Music',
      data: { ratings, favoriteChord }
    }, studentId);
  };

  const handleDone = () => {
    if (onComplete) onComplete();
  };

  // Pick favorite screen
  if (allRated && !isComplete && !favoriteChord) {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xl w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Pick Your Favorite</h2>
            <p className="text-gray-400 mb-6">Which chord fits your character's story best?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {CHORDS.map(chord => (
                <button
                  key={chord.id}
                  onClick={() => setFavoriteChord(chord.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    favoriteChord === chord.id
                      ? 'border-white bg-white/10 scale-105'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="font-bold" style={{ color: chord.color }}>{chord.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{chord.quality}</div>
                </button>
              ))}
            </div>
            {favoriteChord && (
              <button
                onClick={handlePickFavorite}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Confirm Choice
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Complete screen
  if (isComplete) {
    const fav = CHORDS.find(c => c.id === favoriteChord);
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Harmony Lab Complete!</h2>
            {fav && (
              <p className="text-lg mb-6">
                Your pick: <span className="font-bold" style={{ color: fav.color }}>{fav.name}</span> — {fav.emotion}
              </p>
            )}

            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6 text-left">
              <h3 className="font-bold text-orange-400 mb-2">Composer's Insight</h3>
              <p className="text-gray-300">
                Major chords feel resolved and bright. Minor chords feel uneasy and dark.
                Film composers switch between them to control tension and release.
                When you add harmony to your score, your chord choice tells the audience
                whether things are OK — or about to go wrong.
              </p>
            </div>

            <button
              onClick={handleDone}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  const listened = !!hasListened[currentChord.id];
  const rated = !!ratings[currentChord.id];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Harmony Lab</h1>
          <p className="text-sm text-gray-400">Same melody, different chords — how does the feeling change?</p>
        </div>
        <div className="text-sm text-gray-400">
          {currentChordIndex + 1} / {CHORDS.length}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${(currentChordIndex / CHORDS.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Chord display */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3" style={{ backgroundColor: currentChord.color + '20' }}>
            <span className="text-sm font-medium" style={{ color: currentChord.color }}>
              {currentChord.quality === 'major' ? 'Major' : 'Minor'} Chord
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: currentChord.color }}>{currentChord.name}</h2>
          <p className="text-gray-400">{currentChord.emotion}</p>
          <p className="text-sm text-gray-500 mt-1">Notes: {currentChord.notes.join(' + ')}</p>
        </div>

        {/* Play button */}
        <button
          onClick={() => playChordWithMelody(currentChord)}
          disabled={isPlaying}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
            isPlaying
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-5 h-5 animate-pulse" />
              Listening...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {listened ? 'Play Again' : 'Listen to Melody + Chord'}
            </>
          )}
        </button>

        {/* Rating */}
        {listened && (
          <div className="w-full max-w-sm">
            <h3 className="text-sm text-gray-400 text-center mb-3">Does this chord fit a character's story?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleRate('fits')}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                  ratings[currentChord.id] === 'fits'
                    ? 'border-green-500 bg-green-900/20 text-green-400'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <span className="text-lg">👍</span>
                <div className="text-sm font-medium mt-1">Yes, it fits!</div>
              </button>
              <button
                onClick={() => handleRate('doesnt-fit')}
                className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                  ratings[currentChord.id] === 'doesnt-fit'
                    ? 'border-red-500 bg-red-900/20 text-red-400'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <span className="text-lg">👎</span>
                <div className="text-sm font-medium mt-1">Doesn't fit</div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {rated && (
          <div className="flex gap-3">
            {currentChordIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            )}
            {currentChordIndex < CHORDS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                Next Chord
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {}}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                // allRated triggers the favorite picker automatically via render logic
              >
                Pick Your Favorite
                <Trophy className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HarmonyLabActivity;
