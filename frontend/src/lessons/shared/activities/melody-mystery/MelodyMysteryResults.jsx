// File: /lessons/shared/activities/melody-mystery/MelodyMysteryResults.jsx
// Results screen for Mystery Melody
// Shows the ending, score, and options to play again or create new

import React from 'react';
import { Trophy, RotateCcw, Plus, Save, Check, Music, MapPin, Star } from 'lucide-react';
import { getConcept, getEnding, getConceptAssets } from './melodyMysteryConcepts';

const VOCABULARY_ITEMS = [
  { term: 'Melody', color: '#8B5CF6' },
  { term: 'Contour', color: '#3B82F6' },
  { term: 'Phrase', color: '#10B981' }
];

const MelodyMysteryResults = ({
  results,
  conceptId = 'vanishing-composer',
  ending,
  onPlayAgain,
  onCreateNew,
  onSave,
  isSaved
}) => {
  const concept = getConcept(conceptId);
  const endingData = getEnding(conceptId, ending);
  const assets = getConceptAssets(conceptId);
  const { solvedLocations, locationScores, totalScore, totalStars, maxStars, finalAnswer } = results || {};

  // Detect Chromebook for performance optimizations
  const isChromebook = typeof navigator !== 'undefined' && navigator.userAgent.includes('CrOS');

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 27, 75, 0.85), rgba(30, 27, 75, 0.9)), url(${assets.bgResults})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Trophy */}
      <div className="text-center mb-8">
        <div className="relative">
          <Trophy className="w-24 h-24 mx-auto mb-4" style={{ color: concept.colors.accent }} />
          <div className={`absolute -top-2 -right-2 text-4xl ${!isChromebook ? 'animate-bounce' : ''}`}>
            {endingData?.icon}
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: concept.colors.accent }}>
          Mystery Solved!
        </h1>
        <p className="text-gray-400 text-lg">
          You found the {finalAnswer || 'answer'}!
        </p>
      </div>

      {/* Stars Display */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: maxStars || 18 }, (_, i) => (
          <Star
            key={i}
            className={`w-6 h-6 ${
              i < (totalStars || 0)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Ending Card */}
      <div className="bg-slate-800/90 rounded-2xl p-8 max-w-lg w-full mb-6 border border-white/10">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{endingData?.icon}</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {endingData?.name}
          </h2>
          <p className="text-gray-300">
            {endingData?.resolution}
          </p>
        </div>

        {/* Trail */}
        <div className="bg-slate-700/80 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-sm mb-2">You followed the trail:</p>
          <div className="flex flex-wrap items-center gap-2">
            {endingData?.locations?.map((loc, i) => (
              <React.Fragment key={loc.id}>
                <span className="flex items-center gap-1 text-white font-medium">
                  <MapPin className="w-3 h-3" style={{ color: concept.colors.accent }} />
                  {loc.name}
                </span>
                {i < endingData.locations.length - 1 && (
                  <span className="text-gray-500">→</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-gray-500">→</span>
            <span className="font-bold" style={{ color: concept.colors.accent }}>
              {finalAnswer}
            </span>
          </div>
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-700/80 rounded-lg p-3">
            <p className="text-3xl font-bold" style={{ color: concept.colors.accent }}>{totalScore || 0}</p>
            <p className="text-gray-400 text-sm">Total Score</p>
          </div>
          <div className="bg-slate-700/80 rounded-lg p-3">
            <p className="text-3xl font-bold text-green-400">{solvedLocations?.length || 0}</p>
            <p className="text-gray-400 text-sm">Locations</p>
          </div>
          <div className="bg-slate-700/80 rounded-lg p-3">
            <p className="text-3xl font-bold text-yellow-400">
              {locationScores?.filter(s => s.score?.stars === 3).length || 0}
            </p>
            <p className="text-gray-400 text-sm">Perfect</p>
          </div>
        </div>
      </div>

      {/* Vocabulary Used */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="text-gray-400 text-sm">Vocabulary used:</span>
        {VOCABULARY_ITEMS.map(v => (
          <span
            key={v.term}
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: v.color }}
          >
            {v.term}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${!isChromebook ? 'transition-all' : ''} ${
            isSaved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-5 h-5" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save
            </>
          )}
        </button>

        <button
          onClick={onPlayAgain}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white ${!isChromebook ? 'transition-all' : ''}`}
          style={{ backgroundColor: concept.colors.primary }}
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>

        <button
          onClick={onCreateNew}
          className={`flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-white ${!isChromebook ? 'transition-all' : ''}`}
        >
          <Plus className="w-5 h-5" />
          Create New
        </button>
      </div>

      {/* Switch Roles hint */}
      <p className="text-gray-500 text-sm mt-6">
        Now switch roles! Have your partner create a mystery for you.
      </p>
    </div>
  );
};

export default MelodyMysteryResults;
