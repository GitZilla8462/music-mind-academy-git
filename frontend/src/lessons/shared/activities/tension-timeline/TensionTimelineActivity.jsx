// File: /src/lessons/shared/activities/tension-timeline/TensionTimelineActivity.jsx
// Tension Timeline - Students graph tension level over a suspense scene
// Part of Film Music Lesson 4: HOW Does Tension Build? (Harmony & Tension)

import React, { useState, useRef, useCallback } from 'react';
import { Play, RotateCcw, Check, ChevronRight, Trophy } from 'lucide-react';
import { saveStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

// Scene beats with timestamps for tension graphing
const SCENE_BEATS = [
  { id: 0, time: '0:00', label: 'Opening', description: 'Quiet room. Character reads a letter.' },
  { id: 1, time: '0:10', label: 'First sign', description: 'A shadow moves past the window.' },
  { id: 2, time: '0:20', label: 'Investigation', description: 'Character slowly walks to the window.' },
  { id: 3, time: '0:30', label: 'False alarm', description: 'It was just the wind. Character relaxes.' },
  { id: 4, time: '0:40', label: 'Second sign', description: 'The lights flicker. A door creaks open.' },
  { id: 5, time: '0:50', label: 'Approach', description: 'Character grabs a flashlight, enters the dark hallway.' },
  { id: 6, time: '1:00', label: 'Discovery', description: 'Flashlight reveals someone standing at the end of the hall.' },
  { id: 7, time: '1:10', label: 'Climax', description: 'The figure turns around.' },
  { id: 8, time: '1:20', label: 'Resolution', description: 'It\'s a friend. Relief. They laugh.' },
  { id: 9, time: '1:30', label: 'Final twist', description: 'Camera pans to a second shadow behind them both.' },
];

const TENSION_LEVELS = [
  { value: 5, label: 'MAX', color: '#EF4444' },
  { value: 4, label: 'High', color: '#F59E0B' },
  { value: 3, label: 'Medium', color: '#F59E0B' },
  { value: 2, label: 'Low', color: '#10B981' },
  { value: 1, label: 'Calm', color: '#10B981' },
  { value: 0, label: 'None', color: '#6B7280' },
];

const TensionTimelineActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const [tensionValues, setTensionValues] = useState({}); // { beatId: level 0-5 }
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const beat = SCENE_BEATS[currentBeat];
  const allBeatsSet = Object.keys(tensionValues).length === SCENE_BEATS.length;

  const handleSetTension = (level) => {
    setTensionValues(prev => ({ ...prev, [beat.id]: level }));
  };

  const handleNext = () => {
    if (currentBeat < SCENE_BEATS.length - 1) {
      setCurrentBeat(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentBeat > 0) {
      setCurrentBeat(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsComplete(true);
    const studentId = getStudentId();
    saveStudentWork('fm-lesson4-tension-timeline', {
      title: 'Tension Timeline',
      emoji: '📈',
      subtitle: `${Object.keys(tensionValues).length} points mapped`,
      category: 'Film Music',
      data: { tensionValues, sceneBeats: SCENE_BEATS.map(b => b.label) }
    }, studentId);
  };

  const handleDone = () => {
    if (onComplete) onComplete();
  };

  const getTensionColor = (level) => {
    if (level >= 4) return '#EF4444';
    if (level >= 3) return '#F59E0B';
    if (level >= 1) return '#10B981';
    return '#6B7280';
  };

  // Completion screen with tension graph
  if (isComplete) {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-6">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Your Tension Timeline</h2>
              <p className="text-gray-400">This is your tension map for the scene</p>
            </div>

            {/* Visual graph */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="flex items-end gap-1 h-40">
                {SCENE_BEATS.map(b => {
                  const level = tensionValues[b.id] ?? 0;
                  const height = (level / 5) * 100;
                  return (
                    <div key={b.id} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(height, 4)}%`,
                          backgroundColor: getTensionColor(level),
                          opacity: 0.8
                        }}
                      />
                      <span className="text-[10px] text-gray-500 truncate w-full text-center">{b.time}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Opening</span>
                <span>Climax</span>
                <span>End</span>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 mb-6">
              <h3 className="font-bold text-orange-400 mb-2">Composer's Insight</h3>
              <p className="text-gray-300">
                Notice how tension rises and falls like a wave? Film composers use music to mirror this arc.
                When tension builds, they add layers, increase tempo, and use dissonance.
                When it releases, they simplify and resolve to consonant chords.
                Your score should follow your tension timeline!
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={handleDone}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentTension = tensionValues[beat.id];
  const hasSet = currentTension !== undefined;

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Tension Timeline</h1>
          <p className="text-sm text-gray-400">How tense is each moment? Map the tension arc.</p>
        </div>
        <div className="text-sm text-gray-400">
          {currentBeat + 1} / {SCENE_BEATS.length}
        </div>
      </div>

      {/* Mini timeline with dots */}
      <div className="bg-gray-850 border-b border-gray-700 px-6 py-2">
        <div className="flex gap-1">
          {SCENE_BEATS.map((b, i) => {
            const level = tensionValues[b.id];
            const isSet = level !== undefined;
            return (
              <button
                key={b.id}
                onClick={() => setCurrentBeat(i)}
                className={`flex-1 h-8 rounded flex items-center justify-center text-xs transition-all ${
                  i === currentBeat
                    ? 'ring-2 ring-orange-400'
                    : ''
                }`}
                style={{
                  backgroundColor: isSet ? getTensionColor(level) + '30' : '#1f2937',
                  color: isSet ? getTensionColor(level) : '#6b7280'
                }}
              >
                {isSet ? level : '?'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {/* Scene beat card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 text-center">
            <div className="text-sm text-orange-400 font-medium mb-1">{beat.time} — {beat.label}</div>
            <h2 className="text-xl font-bold mb-2">{beat.description}</h2>
          </div>

          {/* Tension level selector */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
            How tense is this moment?
          </h3>
          <div className="flex flex-col gap-2 mb-6">
            {TENSION_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => handleSetTension(level.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  currentTension === level.value
                    ? 'border-white bg-white/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: level.color + '30', color: level.color }}
                >
                  {level.value}
                </div>
                <span className="font-medium">{level.label}</span>
                {/* Visual bar */}
                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(level.value / 5) * 100}%`,
                      backgroundColor: level.color
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentBeat === 0}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            <div className="flex gap-2">
              {hasSet && currentBeat < SCENE_BEATS.length - 1 && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {allBeatsSet && (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                >
                  See My Timeline
                  <Trophy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TensionTimelineActivity;
