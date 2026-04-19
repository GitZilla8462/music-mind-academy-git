// File: /src/lessons/shared/activities/spotting-session/SpottingSessionActivity.jsx
// Spotting Session - Students mark IN/OUT points on a scene timeline
// Part of Film Music Lesson 3: WHEN Does Music Speak? (Spotting & Silence)

import React, { useState, useCallback } from 'react';
import { Play, Pause, MapPin, Check, ChevronRight, Trophy, Clock } from 'lucide-react';
import { saveStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

// Scene moments with descriptions for spotting decisions
const SCENE_MOMENTS = [
  {
    id: 'opening',
    time: '0:00 - 0:15',
    description: 'Character walks alone through an empty city at dawn.',
    visual: 'Wide shot, slow movement, empty streets',
  },
  {
    id: 'discovery',
    time: '0:15 - 0:30',
    description: 'Character notices something strange in the distance.',
    visual: 'Close-up of face, then point-of-view shot',
  },
  {
    id: 'approach',
    time: '0:30 - 0:45',
    description: 'Character cautiously approaches the mysterious object.',
    visual: 'Tracking shot, footsteps on pavement',
  },
  {
    id: 'reveal',
    time: '0:45 - 1:00',
    description: 'The object is revealed — it\'s something unexpected.',
    visual: 'Quick zoom, reaction shot',
  },
  {
    id: 'reaction',
    time: '1:00 - 1:15',
    description: 'Character processes what they\'ve found.',
    visual: 'Slow push in on face, then wide shot',
  },
  {
    id: 'decision',
    time: '1:15 - 1:30',
    description: 'Character makes a decision and walks away with purpose.',
    visual: 'Character turns, walks toward camera, scene ends',
  },
];

const SPOT_OPTIONS = [
  { id: 'music-in', label: 'Music IN', icon: '🎵', color: '#10B981', description: 'Start music here' },
  { id: 'music-out', label: 'Music OUT', icon: '🔇', color: '#EF4444', description: 'Stop music here' },
  { id: 'sfx', label: 'Add SFX', icon: '💥', color: '#F59E0B', description: 'Sound effect here' },
  { id: 'silence', label: 'Silence', icon: '⬛', color: '#6B7280', description: 'Intentional silence' },
];

const SpottingSessionActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const [decisions, setDecisions] = useState({}); // { momentId: spotOptionId }
  const [reasons, setReasons] = useState({}); // { momentId: reason text }
  const [currentMoment, setCurrentMoment] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const moment = SCENE_MOMENTS[currentMoment];

  const handleSelectOption = (optionId) => {
    setDecisions(prev => ({ ...prev, [moment.id]: optionId }));
  };

  const handleReasonChange = (text) => {
    setReasons(prev => ({ ...prev, [moment.id]: text }));
  };

  const handleNext = () => {
    if (currentMoment < SCENE_MOMENTS.length - 1) {
      setCurrentMoment(prev => prev + 1);
    } else {
      setIsComplete(true);
      const studentId = getStudentId();
      saveStudentWork('fm-lesson3-spotting-session', {
        title: 'Spotting Session',
        emoji: '🎬',
        subtitle: `${Object.keys(decisions).length} cue points set`,
        category: 'Film Music',
        data: { decisions, reasons }
      }, studentId);
    }
  };

  const handlePrev = () => {
    if (currentMoment > 0) {
      setCurrentMoment(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (onComplete) onComplete();
  };

  // Completion screen
  if (isComplete) {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-6">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Spotting Session Complete!</h2>
              <p className="text-gray-400 text-lg">Here's your spotting map:</p>
            </div>

            {/* Timeline visualization */}
            <div className="space-y-2 mb-8">
              {SCENE_MOMENTS.map(m => {
                const decision = decisions[m.id];
                const option = SPOT_OPTIONS.find(o => o.id === decision);
                const reason = reasons[m.id];
                return (
                  <div key={m.id} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 w-20 flex-shrink-0">{m.time}</div>
                    {option ? (
                      <div
                        className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                        style={{ backgroundColor: option.color + '30', color: option.color }}
                      >
                        {option.icon} {option.label}
                      </div>
                    ) : (
                      <div className="px-2 py-1 rounded text-xs text-gray-500">No decision</div>
                    )}
                    <div className="text-sm text-gray-400 truncate flex-1">{m.description}</div>
                    {reason && (
                      <div className="text-xs text-gray-500 italic max-w-32 truncate">"{reason}"</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={handleFinish}
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

  const hasDecision = !!decisions[moment.id];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Spotting Session</h1>
          <p className="text-sm text-gray-400">Decide: where does the music go?</p>
        </div>
        <div className="text-sm text-gray-400">
          {currentMoment + 1} / {SCENE_MOMENTS.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${(currentMoment / SCENE_MOMENTS.length) * 100}%` }}
        />
      </div>

      {/* Timeline mini-map */}
      <div className="bg-gray-850 border-b border-gray-700 px-6 py-2">
        <div className="flex gap-1">
          {SCENE_MOMENTS.map((m, i) => {
            const decision = decisions[m.id];
            const option = SPOT_OPTIONS.find(o => o.id === decision);
            return (
              <button
                key={m.id}
                onClick={() => setCurrentMoment(i)}
                className={`flex-1 h-8 rounded flex items-center justify-center text-xs transition-all ${
                  i === currentMoment
                    ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                    : decision
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-800 text-gray-500'
                }`}
                style={option ? { backgroundColor: option.color + '20' } : {}}
              >
                {option ? option.icon : m.time.split(' - ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full">
          {/* Scene moment card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400 font-medium">{moment.time}</span>
            </div>
            <h2 className="text-xl font-bold mb-2">{moment.description}</h2>
            <p className="text-sm text-gray-400 italic">{moment.visual}</p>
          </div>

          {/* Spotting options */}
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            What should happen here?
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {SPOT_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  decisions[moment.id] === option.id
                    ? 'border-white bg-white/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className="font-medium" style={{ color: option.color }}>{option.label}</div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </button>
            ))}
          </div>

          {/* Why? */}
          {hasDecision && (
            <div className="mb-6">
              <label className="text-sm text-gray-400 block mb-1">Why? (optional)</label>
              <input
                type="text"
                value={reasons[moment.id] || ''}
                onChange={(e) => handleReasonChange(e.target.value)}
                placeholder="e.g. 'The silence makes the footsteps louder'"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentMoment === 0}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            {hasDecision && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {currentMoment < SCENE_MOMENTS.length - 1 ? (
                  <>
                    Next Moment
                    <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    See My Spotting Map
                    <Trophy className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpottingSessionActivity;
