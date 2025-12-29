// File: /src/lessons/shared/activities/mood-match-game/MoodMatchGameActivity.jsx
// Mood Match Game - Class voting activity (Student View)
// Students vote on moods, teacher controls pace and reveals results

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, Check } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import {
  subscribeToMoodMatchState,
  subscribeToLoopVotes,
  recordMoodMatchVote
} from '../../../../firebase/config';
import { MOOD_CATEGORIES, GAME_LOOPS } from './moodMatchConfig';

const MoodMatchGameActivity = ({ onComplete, isSessionMode = false, demoMode = false }) => {
  const { sessionCode, userId } = useSession();

  // Check if we're in demo mode (no session)
  const isDemo = demoMode || !sessionCode;

  // Game state from Firebase (or local for demo)
  const [moodMatchState, setMoodMatchState] = useState({
    currentLoopIndex: isDemo ? 0 : -1, // Start immediately in demo mode
    showResults: false
  });

  // Local state
  const [myVotes, setMyVotes] = useState({}); // { loopId: moodId }
  const [currentLoopVotes, setCurrentLoopVotes] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVotedThisRound, setHasVotedThisRound] = useState(false);
  const [demoResults, setDemoResults] = useState({}); // For demo mode results display
  const audioRef = useRef(null);

  const currentLoopIndex = moodMatchState.currentLoopIndex;
  const currentLoop = currentLoopIndex >= 0 ? GAME_LOOPS[currentLoopIndex] : null;
  const showResults = moodMatchState.showResults;
  const isGameComplete = currentLoopIndex >= GAME_LOOPS.length;

  // Subscribe to mood match state from Firebase (skip in demo mode)
  useEffect(() => {
    if (isDemo || !sessionCode) return;

    const unsubscribe = subscribeToMoodMatchState(sessionCode, (state) => {
      setMoodMatchState(state);

      // Reset voting state when loop changes
      if (state.currentLoopIndex !== moodMatchState.currentLoopIndex) {
        setHasVotedThisRound(false);
      }
    });

    return () => unsubscribe();
  }, [sessionCode, isDemo]);

  // Subscribe to votes for current loop (skip in demo mode)
  useEffect(() => {
    if (isDemo || !sessionCode || !currentLoop) return;

    const unsubscribe = subscribeToLoopVotes(sessionCode, currentLoop.id, (votes) => {
      setCurrentLoopVotes(votes);

      // Check if I've already voted
      if (votes[userId]) {
        setMyVotes(prev => ({ ...prev, [currentLoop.id]: votes[userId].moodId }));
        setHasVotedThisRound(true);
      }
    });

    return () => unsubscribe();
  }, [sessionCode, currentLoop?.id, userId, isDemo]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when loop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentLoopIndex]);

  const playLoop = useCallback(() => {
    if (!currentLoop) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(currentLoop.file);
    audioRef.current.loop = false; // Play only once
    audioRef.current.onended = () => setIsPlaying(false); // Stop when done
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(err => console.error('Error playing audio:', err));
  }, [currentLoop]);

  const stopLoop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleVote = async (moodId) => {
    if (!currentLoop || hasVotedThisRound) return;

    // Demo mode - just record locally
    if (isDemo) {
      setMyVotes(prev => ({ ...prev, [currentLoop.id]: moodId }));
      setHasVotedThisRound(true);
      stopLoop();

      // Show mock results after a brief delay
      setTimeout(() => {
        setMoodMatchState(prev => ({ ...prev, showResults: true }));
      }, 500);
      return;
    }

    // Session mode - record to Firebase
    if (!sessionCode) return;

    try {
      await recordMoodMatchVote(sessionCode, currentLoop.id, userId, moodId);
      setMyVotes(prev => ({ ...prev, [currentLoop.id]: moodId }));
      setHasVotedThisRound(true);
      stopLoop();
    } catch (error) {
      console.error('Error recording vote:', error);
    }
  };

  // Demo mode: advance to next loop
  const handleNextLoop = () => {
    if (!isDemo) return;

    const nextIndex = currentLoopIndex + 1;
    setMoodMatchState({
      currentLoopIndex: nextIndex,
      showResults: false
    });
    setHasVotedThisRound(false);
  };

  // SCREEN 1: Waiting for teacher to start
  if (currentLoopIndex < 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-4xl font-bold text-white mb-4">MOOD MATCH GAME</h1>
          <div className="w-16 h-1 bg-purple-500 mx-auto mb-8"></div>
          <p className="text-2xl text-gray-300">Waiting for teacher to play the loop...</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN: Game Complete
  if (isGameComplete) {
    // Play the last loop again if needed
    const playLastLoop = () => {
      const lastLoop = GAME_LOOPS[GAME_LOOPS.length - 1];
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(lastLoop.file);
      audioRef.current.loop = false;
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Error playing audio:', err));
    };

    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center max-w-lg">
            <h1 className="text-4xl font-bold text-white mb-4">GAME COMPLETE</h1>
            <div className="w-16 h-1 bg-green-500 mx-auto mb-8"></div>
            <p className="text-2xl text-gray-300 mb-4">
              You voted on {Object.keys(myVotes).length} of {GAME_LOOPS.length} loops.
            </p>
            <p className="text-lg text-gray-400">
              Watch the screen for class discussion.
            </p>
          </div>
        </div>

        {/* Bottom bar with Play and Advance buttons */}
        <div className="flex justify-end gap-4 pb-4">
          <button
            onClick={isPlaying ? stopLoop : playLastLoop}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-bold transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6" />
                STOP
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                PLAY
              </>
            )}
          </button>
          <button
            onClick={() => onComplete?.()}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-lg font-bold rounded-lg transition-all"
          >
            Advance Lesson →
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 3: Already voted, waiting for results
  if (hasVotedThisRound && !showResults) {
    const votedMood = MOOD_CATEGORIES.find(m => m.id === myVotes[currentLoop?.id]);

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="text-center max-w-lg">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Check className="w-10 h-10 text-green-500" />
            <span className="text-3xl font-bold text-white">YOU VOTED:</span>
            <span
              className="text-3xl font-bold px-4 py-1 rounded"
              style={{ backgroundColor: votedMood?.color, color: 'white' }}
            >
              {votedMood?.name?.toUpperCase()}
            </span>
          </div>
          <div className="w-16 h-1 bg-gray-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-400">Waiting for class results...</p>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 3b: Already voted, results showing
  if (hasVotedThisRound && showResults) {
    const votedMood = MOOD_CATEGORIES.find(m => m.id === myVotes[currentLoop?.id]);
    const isLastLoop = currentLoopIndex >= GAME_LOOPS.length - 1;

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <div className="text-center max-w-lg">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Check className="w-10 h-10 text-green-500" />
            <span className="text-3xl font-bold text-white">YOU VOTED:</span>
            <span
              className="text-3xl font-bold px-4 py-1 rounded"
              style={{ backgroundColor: votedMood?.color, color: 'white' }}
            >
              {votedMood?.name?.toUpperCase()}
            </span>
          </div>
          <div className="w-16 h-1 bg-gray-600 mx-auto mb-8"></div>

          {isDemo ? (
            <>
              <p className="text-xl text-green-400 mb-6">
                Loop {currentLoopIndex + 1} of {GAME_LOOPS.length} complete!
              </p>
              {!isLastLoop ? (
                <button
                  onClick={handleNextLoop}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold rounded-lg transition-colors"
                >
                  Next Loop →
                </button>
              ) : (
                <button
                  onClick={() => onComplete?.()}
                  className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-lg transition-colors"
                >
                  Finish Game
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-xl text-green-400">Results are on the screen!</p>
              <p className="text-lg text-gray-400 mt-2">Watch for class discussion.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 2: Voting screen
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-black/30 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            LOOP {currentLoopIndex + 1} OF {GAME_LOOPS.length}
          </div>
          <button
            onClick={isPlaying ? stopLoop : playLoop}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-lg font-bold transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-6 h-6" />
                STOP
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                PLAY
              </>
            )}
          </button>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-2 mt-2 text-green-400">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span>Playing...</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold text-white mb-8">Which mood fits this loop?</h2>

        {/* Mood Buttons - 5 categories fit nicely in a row on larger screens */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl w-full">
          {MOOD_CATEGORIES.map((mood) => (
            <button
              key={mood.id}
              onClick={() => handleVote(mood.id)}
              className="p-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: mood.color }}
            >
              <div className="text-2xl font-bold text-white mb-1">{mood.name.toUpperCase()}</div>
              <div className="text-sm text-white/80">{mood.description}</div>
            </button>
          ))}
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2 mt-8">
          {GAME_LOOPS.map((loop, index) => {
            const hasVoted = myVotes[loop.id];
            return (
              <div
                key={loop.id}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentLoopIndex
                    ? 'bg-white scale-125'
                    : hasVoted
                      ? 'bg-green-500'
                      : 'bg-white/30'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodMatchGameActivity;
