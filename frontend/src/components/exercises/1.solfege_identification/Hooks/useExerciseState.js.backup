import { useState, useCallback } from 'react';

const useExerciseState = (pattern) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [completedNotes, setCompletedNotes] = useState(new Array(25).fill(false));
  const [incorrectNotes, setIncorrectNotes] = useState(new Array(25).fill(false));
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnswerSelect = useCallback(async (selectedSyllable, synth, solfegeAudio) => {
    if (
      showResult ||
      exerciseComplete ||
      !pattern.length ||
      currentIndex >= pattern.length
    )
      return;
    
    const currentNote = pattern[currentIndex];
    if (!currentNote || currentNote.type === 'rest') return;

    const isCorrect = selectedSyllable === currentNote.syllable;
    
    // Play audio feedback
    if (solfegeAudio && solfegeAudio[selectedSyllable]) {
      try {
        solfegeAudio[selectedSyllable].currentTime = 0;
        await solfegeAudio[selectedSyllable].play();
      } catch (e) {
        synth?.triggerAttackRelease(currentNote.pitch, '4n');
      }
    } else {
      synth?.triggerAttackRelease(currentNote.pitch, '4n');
    }

    setSelectedAnswer(selectedSyllable);
    setShowResult(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCompletedNotes((prev) => {
        const arr = [...prev];
        arr[currentIndex] = true;
        return arr;
      });
    } else {
      setIncorrectNotes((prev) => {
        const arr = [...prev];
        arr[currentIndex] = true;
        return arr;
      });
    }

    const nextQuestionDelay = isCorrect ? 0 : 1500;
    const buttonDisableDelay = isCorrect ? 200 : 1500;

    setTimeout(() => {
      let nextIndex = currentIndex + 1;
      while (
        nextIndex < pattern.length &&
        pattern[nextIndex].type === 'rest'
      ) {
        nextIndex++;
      }
      if (nextIndex >= pattern.length) {
        setExerciseComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setShowResult(false);
        setSelectedAnswer(null);
      }
    }, nextQuestionDelay);

    if (isCorrect) {
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
      }, buttonDisableDelay);
    }
  }, [showResult, exerciseComplete, pattern, currentIndex]);

  const resetExercise = useCallback(() => {
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setExerciseComplete(false);
    setIsProcessing(false);
    setCompletedNotes(new Array(25).fill(false));
    setIncorrectNotes(new Array(25).fill(false));
    // Don't reset currentIndex here - that's handled in the main component
  }, []);

  return {
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
  };
};

export default useExerciseState;