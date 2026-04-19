// File: /src/lessons/shared/activities/instrument-emotion-lab/InstrumentEmotionLabActivity.jsx
// Instrument Emotion Lab - Students hear a melody played through different instruments
// and rate the emotional quality of each one
// Part of Film Music Lesson 2: WHAT Do They Feel? (Orchestration & Bass)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Check, ChevronRight, Trophy, Volume2, RotateCcw } from 'lucide-react';
import * as Tone from 'tone';
import { saveStudentWork, loadStudentWork, getStudentId } from '../../../../utils/studentWorkStorage';

// The melody to play through each instrument (a simple 8-note phrase)
const DEMO_MELODY = [
  { note: 'C4', duration: '4n' },
  { note: 'E4', duration: '4n' },
  { note: 'G4', duration: '4n' },
  { note: 'A4', duration: '4n' },
  { note: 'G4', duration: '4n' },
  { note: 'E4', duration: '4n' },
  { note: 'F4', duration: '4n' },
  { note: 'C4', duration: '2n' },
];

const INSTRUMENTS = [
  {
    id: 'piano',
    name: 'Piano',
    icon: '🎹',
    config: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.8 } }
  },
  {
    id: 'strings',
    name: 'Strings',
    icon: '🎻',
    config: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.3, decay: 0.5, sustain: 0.8, release: 1.0 } }
  },
  {
    id: 'brass',
    name: 'Brass',
    icon: '🎺',
    config: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.4 } }
  },
  {
    id: 'woodwind',
    name: 'Woodwind',
    icon: '🪈',
    config: { oscillator: { type: 'sine' }, envelope: { attack: 0.15, decay: 0.4, sustain: 0.5, release: 0.6 } }
  },
  {
    id: 'celesta',
    name: 'Celesta',
    icon: '✨',
    config: { oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 1.5 } }
  },
  {
    id: 'synth',
    name: 'Dark Synth',
    icon: '🎛️',
    config: { oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.6 } }
  },
];

const EMOTIONS = [
  { id: 'heroic', label: 'Heroic', color: '#EF4444' },
  { id: 'sad', label: 'Sad', color: '#3B82F6' },
  { id: 'mysterious', label: 'Mysterious', color: '#8B5CF6' },
  { id: 'peaceful', label: 'Peaceful', color: '#10B981' },
  { id: 'scary', label: 'Scary', color: '#6B7280' },
  { id: 'playful', label: 'Playful', color: '#F59E0B' },
];

const InstrumentEmotionLabActivity = ({ onComplete, isSessionMode = false, viewMode = false }) => {
  const [currentInstrumentIndex, setCurrentInstrumentIndex] = useState(0);
  const [ratings, setRatings] = useState({}); // { instrumentId: emotionId }
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [hasListened, setHasListened] = useState({});

  const synthRef = useRef(null);
  const sequenceRef = useRef(null);

  const currentInstrument = INSTRUMENTS[currentInstrumentIndex];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
      }
      if (synthRef.current) {
        synthRef.current.dispose();
      }
      Tone.Transport.stop();
    };
  }, []);

  const playMelody = useCallback(async () => {
    if (isPlaying) {
      // Stop
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
      Tone.Transport.stop();
      setIsPlaying(false);
      return;
    }

    await Tone.start();

    // Create synth for current instrument
    if (synthRef.current) synthRef.current.dispose();
    synthRef.current = new Tone.PolySynth(Tone.Synth, currentInstrument.config).toDestination();
    synthRef.current.volume.value = -6;

    Tone.Transport.bpm.value = 90;

    let noteIndex = 0;
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
    }

    sequenceRef.current = new Tone.Sequence(
      (time) => {
        if (noteIndex < DEMO_MELODY.length) {
          const { note, duration } = DEMO_MELODY[noteIndex];
          synthRef.current.triggerAttackRelease(note, duration, time);
          noteIndex++;
        } else {
          sequenceRef.current.stop();
          Tone.Transport.stop();
          setIsPlaying(false);
        }
      },
      DEMO_MELODY.map((_, i) => i),
      '4n'
    );

    sequenceRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
    setHasListened(prev => ({ ...prev, [currentInstrument.id]: true }));
  }, [isPlaying, currentInstrument]);

  const handleSelectEmotion = (emotionId) => {
    if (!hasListened[currentInstrument.id]) return;
    setRatings(prev => ({ ...prev, [currentInstrument.id]: emotionId }));
  };

  const handleNext = () => {
    // Stop any playing audio
    if (isPlaying) {
      if (sequenceRef.current) {
        sequenceRef.current.stop();
        sequenceRef.current.dispose();
        sequenceRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
      Tone.Transport.stop();
      setIsPlaying(false);
    }

    if (currentInstrumentIndex < INSTRUMENTS.length - 1) {
      setCurrentInstrumentIndex(prev => prev + 1);
    } else {
      // All done
      setGameComplete(true);
      const studentId = getStudentId();
      saveStudentWork('fm-lesson2-emotion-lab', {
        title: 'Instrument Emotion Lab',
        emoji: '🎭',
        subtitle: `${Object.keys(ratings).length} instruments rated`,
        category: 'Film Music',
        data: { ratings }
      }, studentId);
    }
  };

  const handleFinish = () => {
    if (onComplete) onComplete();
  };

  // Completion screen
  if (gameComplete) {
    return (
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Emotion Lab Complete!</h2>
            <p className="text-gray-400 text-lg mb-8">
              You rated how {Object.keys(ratings).length} instruments made the melody feel.
            </p>

            {/* Results grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {INSTRUMENTS.map(inst => {
                const emotionId = ratings[inst.id];
                const emotion = EMOTIONS.find(e => e.id === emotionId);
                return (
                  <div key={inst.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="text-2xl mb-1">{inst.icon}</div>
                    <div className="text-sm font-medium">{inst.name}</div>
                    {emotion ? (
                      <div
                        className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                        style={{ backgroundColor: emotion.color + '30', color: emotion.color }}
                      >
                        {emotion.label}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mt-1">Not rated</div>
                    )}
                  </div>
                );
              })}
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

  const hasRated = !!ratings[currentInstrument.id];
  const listened = !!hasListened[currentInstrument.id];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Instrument Emotion Lab</h1>
          <p className="text-sm text-gray-400">Same melody, different instrument — how does it feel?</p>
        </div>
        <div className="text-sm text-gray-400">
          {currentInstrumentIndex + 1} / {INSTRUMENTS.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${((currentInstrumentIndex) / INSTRUMENTS.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Instrument display + play button */}
        <div className="text-center">
          <div className="text-6xl mb-3">{currentInstrument.icon}</div>
          <h2 className="text-2xl font-bold mb-1">{currentInstrument.name}</h2>
          <p className="text-gray-400 mb-4">Listen to the melody, then pick the emotion it creates</p>

          <button
            onClick={playMelody}
            className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-semibold text-lg transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {listened ? 'Play Again' : 'Listen'}
              </>
            )}
          </button>
        </div>

        {/* Emotion selection grid */}
        <div className="w-full max-w-xl">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
            {listened ? 'How does this instrument make the melody feel?' : 'Listen first, then choose an emotion'}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {EMOTIONS.map(emotion => {
              const isSelected = ratings[currentInstrument.id] === emotion.id;
              return (
                <button
                  key={emotion.id}
                  onClick={() => handleSelectEmotion(emotion.id)}
                  disabled={!listened}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    isSelected
                      ? 'border-white bg-white/10 scale-105'
                      : listened
                        ? 'border-gray-700 hover:border-gray-500 bg-gray-800'
                        : 'border-gray-800 bg-gray-800/50 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div
                    className="text-lg font-semibold"
                    style={{ color: isSelected ? emotion.color : listened ? '#d1d5db' : '#6b7280' }}
                  >
                    {emotion.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next button */}
        {hasRated && (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {currentInstrumentIndex < INSTRUMENTS.length - 1 ? (
              <>
                Next Instrument
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                See Results
                <Trophy className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InstrumentEmotionLabActivity;
