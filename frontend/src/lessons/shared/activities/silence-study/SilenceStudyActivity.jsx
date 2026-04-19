// File: /src/lessons/shared/activities/silence-study/SilenceStudyActivity.jsx
// Silence Study - Students compare scenes with and without strategic silence
// Part of Film Music Lesson 3: WHEN Does Music Speak? (Spotting & Silence)

import React, { useState, useCallback } from 'react';
import { Play, Pause, ChevronRight, Trophy, Volume2, VolumeX, Check } from 'lucide-react';
import { saveStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

// Comparison rounds — each has two versions of a scene description
const COMPARISONS = [
  {
    id: 'chase',
    sceneName: 'The Chase',
    description: 'A character runs through dark hallways.',
    versionA: {
      label: 'Wall-to-Wall Music',
      description: 'Intense music plays the entire time — never stops.',
      icon: '🔊',
    },
    versionB: {
      label: 'Strategic Silence',
      description: 'Music plays during running, goes SILENT when character hides, then a sudden hit.',
      icon: '🔇',
    },
    question: 'Which version made the hiding moment more tense?',
    insight: 'When music stops suddenly, your brain notices. Silence creates anticipation — you start listening harder.',
  },
  {
    id: 'farewell',
    sceneName: 'The Farewell',
    description: 'Two characters say goodbye at a train station.',
    versionA: {
      label: 'Sad Music Throughout',
      description: 'Emotional strings play from start to finish.',
      icon: '🔊',
    },
    versionB: {
      label: 'Music Fades, Real Sounds',
      description: 'Music fades out. You hear the train, footsteps, then silence before the door closes.',
      icon: '🔇',
    },
    question: 'Which version felt more emotionally real?',
    insight: 'Sometimes removing music lets the audience feel the emotion themselves instead of being told what to feel.',
  },
  {
    id: 'reveal',
    sceneName: 'The Big Reveal',
    description: 'A character opens a door to discover something shocking.',
    versionA: {
      label: 'Building Music → Impact Hit',
      description: 'Music builds tension, then a big orchestral hit on the reveal.',
      icon: '🔊',
    },
    versionB: {
      label: 'Building Music → Dead Silence',
      description: 'Music builds tension, then ALL sound cuts to absolute silence on the reveal.',
      icon: '🔇',
    },
    question: 'Which reveal felt more shocking?',
    insight: 'A sudden cut to silence can be more powerful than the loudest hit. The absence of sound IS a sound choice.',
  },
];

const SilenceStudyActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [answers, setAnswers] = useState({}); // { roundId: 'A' | 'B' }
  const [showInsight, setShowInsight] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const comparison = COMPARISONS[currentRound];

  const handleSelect = (choice) => {
    setAnswers(prev => ({ ...prev, [comparison.id]: choice }));
    setShowInsight(true);
  };

  const handleNext = () => {
    setShowInsight(false);
    if (currentRound < COMPARISONS.length - 1) {
      setCurrentRound(prev => prev + 1);
    } else {
      setGameComplete(true);
      const studentId = getStudentId();
      saveStudentWork('fm-lesson3-silence-study', {
        title: 'Silence Study',
        emoji: '🔇',
        subtitle: `${Object.keys(answers).length} scenes analyzed`,
        category: 'Film Music',
        data: { answers }
      }, studentId);
    }
  };

  const handleFinish = () => {
    if (onComplete) onComplete();
  };

  // Completion screen
  if (gameComplete) {
    const silenceCount = Object.values(answers).filter(a => a === 'B').length;
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Silence Study Complete!</h2>
            <p className="text-gray-400 text-lg mb-6">
              You chose strategic silence in {silenceCount} out of {COMPARISONS.length} scenes.
            </p>

            <div className="bg-gray-800 rounded-xl p-5 mb-8 text-left">
              <h3 className="font-bold text-orange-400 mb-2">Key Takeaway</h3>
              <p className="text-gray-300">
                Silence is not the absence of music — it's a deliberate compositional choice.
                Film composers use silence to create tension, emotional space, and impact.
                When you score your film, think about where NOT to put music.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Silence Study</h1>
          <p className="text-sm text-gray-400">Compare: wall-to-wall music vs. strategic silence</p>
        </div>
        <div className="text-sm text-gray-400">
          {currentRound + 1} / {COMPARISONS.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${(currentRound / COMPARISONS.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Scene info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{comparison.sceneName}</h2>
            <p className="text-gray-400 text-lg">{comparison.description}</p>
          </div>

          {/* Two options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Version A */}
            <button
              onClick={() => handleSelect('A')}
              disabled={showInsight}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                answers[comparison.id] === 'A'
                  ? 'border-orange-500 bg-orange-900/20'
                  : showInsight
                    ? 'border-gray-700 bg-gray-800/50 opacity-60'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="text-3xl mb-2">{comparison.versionA.icon}</div>
              <div className="font-bold text-lg mb-1">Version A</div>
              <div className="text-sm font-medium text-orange-400 mb-2">{comparison.versionA.label}</div>
              <div className="text-sm text-gray-400">{comparison.versionA.description}</div>
            </button>

            {/* Version B */}
            <button
              onClick={() => handleSelect('B')}
              disabled={showInsight}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                answers[comparison.id] === 'B'
                  ? 'border-orange-500 bg-orange-900/20'
                  : showInsight
                    ? 'border-gray-700 bg-gray-800/50 opacity-60'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="text-3xl mb-2">{comparison.versionB.icon}</div>
              <div className="font-bold text-lg mb-1">Version B</div>
              <div className="text-sm font-medium text-orange-400 mb-2">{comparison.versionB.label}</div>
              <div className="text-sm text-gray-400">{comparison.versionB.description}</div>
            </button>
          </div>

          {/* Question */}
          <div className="text-center mb-4">
            <p className="text-gray-300 italic">{comparison.question}</p>
          </div>

          {/* Insight + Next */}
          {showInsight && (
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-4">
              <h3 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Composer's Insight
              </h3>
              <p className="text-gray-300">{comparison.insight}</p>
            </div>
          )}

          {showInsight && (
            <div className="text-center">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {currentRound < COMPARISONS.length - 1 ? (
                  <>
                    Next Scene
                    <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    See Results
                    <Trophy className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SilenceStudyActivity;
