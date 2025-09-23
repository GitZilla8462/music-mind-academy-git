import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

// UI Components
import ExerciseHeader from './UI/ExerciseHeader';
import ResultsCard from './UI/ResultsCard';

// Music Staff Component
import CanvasMusicStaff from './CanvasMusicStaff';

// Hooks
import useExerciseState from './Hooks/useExerciseState';

const SolfegeIDTemplate = ({ config = {}, onClose }) => {
  const [synth, setSynth] = useState(null);
  const [solfegeAudio, setSolfegeAudio] = useState(null);
  const [pattern, setPattern] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const BPM = config.bpm || 120;

  // Use the extracted exercise state hook
  const {
    currentIndex,
    setCurrentIndex,
    score,
    showResult,
    selectedAnswer,
    exerciseComplete,
    completedNotes,
    incorrectNotes,
    isProcessing,
    handleAnswerSelect,
    resetExercise
  } = useExerciseState(pattern);

  // Audio initialization
  useEffect(() => {
    if (isInitialized) return;

    const initSynth = async () => {
      try {
        await Tone.start();
        const newSynth = new Tone.Synth({
          oscillator: {
            type: 'triangle',
            harmonicity: 2
          },
          envelope: {
            attack: 0.02,
            decay: 0.3,
            sustain: 0.2,
            release: 2
          },
          filter: {
            type: 'lowpass',
            frequency: 2000,
            rolloff: -12
          }
        }).toDestination();

        const reverb = new Tone.Reverb({
          decay: 1.5,
          wet: 0.3
        }).toDestination();
        newSynth.connect(reverb);
        setSynth(newSynth);
      } catch (error) {
        console.error('Synth initialization failed:', error);
      }
    };

    const initVocalAudio = async () => {
      try {
        const audio = {};
        const audioFiles = config?.audioFiles || {};
        for (const [syllable, audioPath] of Object.entries(audioFiles)) {
          audio[syllable] = new Audio(audioPath);
          audio[syllable].preload = 'auto';
          audio[syllable].volume = 0.8;
        }
        setSolfegeAudio(audio);
      } catch (error) {
        console.warn('Vocal audio initialization failed:', error);
      }
    };

    const initPattern = () => {
      if (config?.generatePattern) {
        const newPattern = config.generatePattern();
        setPattern(newPattern);
        console.log(
          '🎵 Pattern:',
          newPattern.map((note) => note.syllable || 'rest').join('-')
        );

        // Skip any initial rests
        let firstNoteIndex = 0;
        while (
          firstNoteIndex < newPattern.length &&
          newPattern[firstNoteIndex].type === 'rest'
        ) {
          firstNoteIndex++;
        }
        setCurrentIndex(firstNoteIndex);
      }
    };

    // Initialize everything
    initSynth();
    initVocalAudio();
    initPattern();
    
    setIsInitialized(true);

    return () => {
      setSynth((currentSynth) => {
        if (currentSynth) {
          currentSynth.dispose();
        }
        return null;
      });
    };
  }, []);

  const playCurrentNote = useCallback(() => {
    if (synth && pattern.length > 0 && currentIndex < pattern.length) {
      setIsPlaying(true);
      const currentNote = pattern[currentIndex];
      const duration =
        currentNote.duration === 'h'
          ? '2n'
          : currentNote.duration === 'e'
          ? '8n'
          : '4n';
      synth.triggerAttackRelease(currentNote.pitch, duration);

      const quarterNoteDuration = (60 / BPM) * 1000;
      const timeout =
        currentNote.duration === 'h'
          ? quarterNoteDuration * 2
          : currentNote.duration === 'e'
          ? quarterNoteDuration * 0.5
          : quarterNoteDuration;

      setTimeout(() => setIsPlaying(false), timeout);
    }
  }, [synth, pattern, currentIndex, BPM]);

  const handleTryAgain = () => {
    if (config.generatePattern) {
      const currentPatternIndex = pattern._patternIndex || -1;
      const newPattern = config.generatePattern(currentPatternIndex);
      setPattern(newPattern);
      console.log(
        '🎵 Pattern:',
        newPattern.map((note) => note.syllable || 'rest').join('-')
      );
      let firstNoteIndex = 0;
      while (
        firstNoteIndex < newPattern.length &&
        newPattern[firstNoteIndex].type === 'rest'
      ) {
        firstNoteIndex++;
      }
      setCurrentIndex(firstNoteIndex);
    }
    resetExercise();
  };

  const onAnswerSelect = (selectedSyllable) => {
    handleAnswerSelect(selectedSyllable, synth, solfegeAudio);
  };

  const currentNote = pattern[currentIndex];

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <ExerciseHeader
          config={config}
          onClose={onClose}
          onTryAgain={handleTryAgain}
          exerciseComplete={exerciseComplete}
          pattern={pattern}
          currentIndex={currentIndex}
        />

        <ResultsCard
          exerciseComplete={exerciseComplete}
          score={score}
          pattern={pattern}
          onTryAgain={handleTryAgain}
          onClose={onClose}
        />

        {/* Music Staff */}
        {pattern.length > 0 && (
          <CanvasMusicStaff
            pattern={pattern}
            currentNoteIndex={exerciseComplete ? -1 : currentIndex}
            isPlaying={isPlaying}
            completedNotes={completedNotes}
            incorrectNotes={incorrectNotes}
            bpm={BPM}
            exerciseComplete={exerciseComplete}
            syllables={config.syllables || ['Do', 'Re', 'Mi', 'Fa', 'Sol']}
            onSelect={onAnswerSelect}
            disabled={showResult || exerciseComplete || isProcessing}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentNote?.syllable}
            showResult={showResult}
            config={config}
          />
        )}
      </div>
    </div>
  );
};

export default SolfegeIDTemplate;