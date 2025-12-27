// File: /lessons/shared/activities/melody-mystery/MelodyMysteryResults.jsx
// Results screen for Mystery Melody
// Shows the ending, score, and options to play again or create new

import React from 'react';
import { Trophy, RotateCcw, Plus, Save, Check, MapPin } from 'lucide-react';
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
  const { solvedLocations, locationScores, totalScore, finalAnswer } = results || {};

  // Calculate average percentage from location scores
  const averagePercentage = locationScores?.length > 0
    ? Math.round(locationScores.reduce((sum, s) => sum + (s.score?.percentage || 0), 0) / locationScores.length)
    : 0;

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
      {/* Main Content - wider horizontal layout */}
      <div className="w-full max-w-4xl">
        {/* Header with Trophy */}
        <div className="text-center mb-6">
          <Trophy className="w-20 h-20 mx-auto mb-3" style={{ color: concept.colors.accent }} />
          <h1 className="text-4xl font-bold mb-1" style={{ color: concept.colors.accent }}>
            Mystery Solved!
          </h1>
          <p className="text-gray-400 text-lg">
            You found the {finalAnswer || 'answer'}!
          </p>
        </div>

        {/* Horizontal layout for ending and scores */}
        <div className="flex gap-6 mb-6">
          {/* Ending Card - left side */}
          <div className="flex-1 bg-slate-800/90 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">
              {endingData?.name}
            </h2>
            <p className="text-gray-300 mb-4">
              {endingData?.resolution}
            </p>

            {/* Trail */}
            <div className="bg-slate-700/80 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-2">You followed the trail:</p>
              <div className="flex flex-wrap items-center gap-2">
                {endingData?.locations?.map((loc, i) => (
                  <React.Fragment key={loc.id}>
                    <span className="flex items-center gap-1 text-white text-sm font-medium">
                      <MapPin className="w-3 h-3" style={{ color: concept.colors.accent }} />
                      {loc.name}
                    </span>
                    {i < endingData.locations.length - 1 && (
                      <span className="text-gray-500">→</span>
                    )}
                  </React.Fragment>
                ))}
                <span className="text-gray-500">→</span>
                <span className="font-bold text-sm" style={{ color: concept.colors.accent }}>
                  {finalAnswer}
                </span>
              </div>
            </div>
          </div>

          {/* Score Card - right side */}
          <div className="w-64 bg-slate-800/90 rounded-2xl p-6 border border-white/10">
            <h3 className="text-gray-400 text-sm mb-4 text-center">Your Score</h3>
            <div className="space-y-3">
              {/* Big percentage display */}
              <div className="bg-slate-700/80 rounded-lg p-4 text-center">
                <p className={`text-4xl font-bold ${
                  averagePercentage >= 80 ? 'text-green-400' :
                  averagePercentage >= 60 ? 'text-yellow-400' : 'text-orange-400'
                }`}>
                  {averagePercentage}%
                </p>
                <p className="text-gray-400 text-xs mt-1">Average Accuracy</p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-700/80 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold text-green-400">{solvedLocations?.length || 0}</p>
                  <p className="text-gray-400 text-[10px]">Locations</p>
                </div>
                <div className="flex-1 bg-slate-700/80 rounded-lg p-2 text-center">
                  <p className="text-xl font-bold" style={{ color: concept.colors.accent }}>
                    {totalScore || 0}
                  </p>
                  <p className="text-gray-400 text-[10px]">Points</p>
                </div>
              </div>
            </div>
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
