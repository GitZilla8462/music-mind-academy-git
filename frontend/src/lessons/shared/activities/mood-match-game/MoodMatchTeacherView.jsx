// File: /src/lessons/shared/activities/mood-match-game/MoodMatchTeacherView.jsx
// Mood Match Game - Teacher View (Projector/Presentation)
// Teacher controls loop playback, reveals results, leads discussion

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, ChevronRight, RotateCcw, Users } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import {
  subscribeToMoodMatchState,
  subscribeToLoopVotes,
  subscribeToSession,
  setMoodMatchCurrentLoop,
  toggleMoodMatchResults,
  clearMoodMatchVotes,
  getLoopVoteTally
} from '../../../../firebase/config';
import { MOOD_CATEGORIES, GAME_LOOPS, generateDiscussionPrompt, generateSummaryInsight } from './moodMatchConfig';

// Class Activity Time Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{
      height: '64px',
      backgroundColor: '#2563eb',
      flexShrink: 0
    }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      CLASS ACTIVITY
    </span>
  </div>
);

const MoodMatchTeacherView = ({ sessionCode: propSessionCode, onAdvanceLesson }) => {
  const { sessionCode: contextSessionCode } = useSession();
  const sessionCode = propSessionCode || contextSessionCode;
  console.log('🎮 MoodMatchTeacherView mounted, sessionCode:', sessionCode, 'prop:', propSessionCode, 'context:', contextSessionCode);

  // Game state
  const [currentLoopIndex, setCurrentLoopIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [votes, setVotes] = useState({});
  const [totalStudents, setTotalStudents] = useState(0);
  const [allLoopResults, setAllLoopResults] = useState({}); // Store results for summary
  const audioRef = useRef(null);

  const currentLoop = currentLoopIndex >= 0 ? GAME_LOOPS[currentLoopIndex] : null;
  const isGameComplete = currentLoopIndex >= GAME_LOOPS.length;

  // Subscribe to session to get student count
  useEffect(() => {
    if (!sessionCode) return;

    const unsubscribe = subscribeToSession(sessionCode, (data) => {
      if (data?.studentsJoined) {
        setTotalStudents(Object.keys(data.studentsJoined).length);
      }
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Subscribe to votes for current loop
  useEffect(() => {
    if (!sessionCode || !currentLoop) return;

    const unsubscribe = subscribeToLoopVotes(sessionCode, currentLoop.id, (loopVotes) => {
      setVotes(loopVotes);
    });

    return () => unsubscribe();
  }, [sessionCode, currentLoop?.id]);

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
    audioRef.current.loop = false;
    audioRef.current.onended = () => setIsPlaying(false);
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

  const startGame = async () => {
    console.log('🎮 startGame clicked! sessionCode:', sessionCode);
    if (!sessionCode) {
      console.error('🎮 No sessionCode! Cannot start game.');
      return;
    }

    try {
      console.log('🎮 Clearing votes...');
      await clearMoodMatchVotes(sessionCode);
      setCurrentLoopIndex(0);
      setShowResults(false);
      setAllLoopResults({});
      await setMoodMatchCurrentLoop(sessionCode, 0, false);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleShowResults = async () => {
    if (!sessionCode) return;

    try {
      // Store results for summary
      const tally = getLoopVoteTally(votes);
      setAllLoopResults(prev => ({
        ...prev,
        [currentLoop.id]: { tally, totalVotes: Object.keys(votes).length }
      }));

      setShowResults(true);
      await toggleMoodMatchResults(sessionCode, true);
      stopLoop();
    } catch (error) {
      console.error('Error showing results:', error);
    }
  };

  const handleNextLoop = async () => {
    if (!sessionCode) return;

    try {
      const nextIndex = currentLoopIndex + 1;
      setCurrentLoopIndex(nextIndex);
      setShowResults(false);
      setVotes({});

      if (nextIndex < GAME_LOOPS.length) {
        await setMoodMatchCurrentLoop(sessionCode, nextIndex, false);
      } else {
        // Game complete
        await setMoodMatchCurrentLoop(sessionCode, nextIndex, false);
      }
    } catch (error) {
      console.error('Error advancing to next loop:', error);
    }
  };

  const handleRestartGame = async () => {
    await startGame();
  };

  const voteCount = Object.keys(votes).length;
  const voteTally = getLoopVoteTally(votes);

  // SCREEN: Waiting to start
  if (currentLoopIndex < 0) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <ActivityBanner />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold text-white mb-4">MOOD MATCH GAME</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto mb-8"></div>
          <p className="text-2xl text-gray-300 mb-8">
            Students will listen to loops and vote on what mood they think each one creates.
          </p>

          <div className="flex items-center justify-center gap-3 mb-8 text-xl text-gray-400">
            <Users className="w-6 h-6" />
            <span>{totalStudents} students connected</span>
          </div>

          <button
            onClick={startGame}
            className="px-12 py-6 bg-purple-600 hover:bg-purple-500 text-white text-2xl font-bold rounded-xl transition-all transform hover:scale-105"
          >
            START GAME
          </button>
        </div>
        </div>
      </div>
    );
  }

  // SCREEN: Final Summary
  if (isGameComplete) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <ActivityBanner />
        <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-5xl font-bold text-white mb-2 text-center">CLASS MOOD SORT COMPLETE</h1>
          <div className="w-24 h-1 bg-green-500 mx-auto mb-8"></div>

          {/* Results Summary */}
          <div className="bg-black/30 rounded-xl p-6 mb-8">
            {GAME_LOOPS.map((loop, index) => {
              const result = allLoopResults[loop.id];
              if (!result) return null;

              const sortedMoods = Object.entries(result.tally)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2);

              return (
                <div key={loop.id} className="flex items-center gap-4 py-3 border-b border-gray-700 last:border-0">
                  <span className="text-gray-400 w-20">Loop {index + 1}:</span>
                  <div className="flex items-center gap-2">
                    {sortedMoods.map(([moodId, count], i) => {
                      const mood = MOOD_CATEGORIES.find(m => m.id === moodId);
                      return (
                        <span key={moodId} className="flex items-center gap-1">
                          <span
                            className="px-3 py-1 rounded text-white font-bold"
                            style={{ backgroundColor: mood?.color }}
                          >
                            {mood?.name}
                          </span>
                          <span className="text-gray-400">({count})</span>
                          {i === 0 && sortedMoods.length > 1 && (
                            <span className="text-gray-500 mx-2">&gt;</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Insight */}
          <div className="bg-purple-900/50 rounded-xl p-6 mb-8 text-center">
            <p className="text-xl text-purple-200">{generateSummaryInsight()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleRestartGame}
              className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold rounded-xl transition-all"
            >
              <RotateCcw className="w-6 h-6" />
              PLAY AGAIN
            </button>
            <button
              onClick={() => onAdvanceLesson?.()}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-xl transition-all"
            >
              ADVANCE LESSON
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  // SCREEN: Results
  if (showResults) {
    const discussionPrompt = generateDiscussionPrompt(voteTally, voteCount);
    const maxVotes = Math.max(...Object.values(voteTally), 1);

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <ActivityBanner />
        <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-3 shrink-0">
          <h1 className="text-3xl font-bold text-white mb-1">LOOP {currentLoopIndex + 1} RESULTS</h1>
          <p className="text-lg text-gray-400">{voteCount} votes</p>
        </div>

        {/* Bar Chart */}
        <div className="max-w-3xl mx-auto w-full shrink-0">
          {MOOD_CATEGORIES.map((mood) => {
            const count = voteTally[mood.id] || 0;
            const percentage = voteCount > 0 ? (count / maxVotes) * 100 : 0;

            return (
              <div key={mood.id} className="mb-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-bold text-white w-28">{mood.name.toUpperCase()}</span>
                  <div className="flex-1 h-10 bg-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: mood.color,
                        minWidth: count > 0 ? '40px' : '0'
                      }}
                    >
                      {count > 0 && (
                        <span className="text-white font-bold">{count}</span>
                      )}
                    </div>
                  </div>
                  {count === 0 && (
                    <span className="text-gray-500 font-bold w-8">0</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button - right below results */}
        <div className="text-center shrink-0 py-3">
          <button
            onClick={handleNextLoop}
            className="flex items-center gap-3 mx-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-lg font-bold rounded-xl transition-all"
          >
            {currentLoopIndex < GAME_LOOPS.length - 1 ? (
              <>
                NEXT LOOP
                <ChevronRight className="w-5 h-5" />
              </>
            ) : (
              <>
                VIEW SUMMARY
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Discussion Prompt - below next button */}
        <div className="bg-black/40 rounded-xl p-4 max-w-3xl mx-auto w-full flex-1 min-h-0 overflow-y-auto">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Discussion</p>
          <p className="text-xl text-white">{discussionPrompt}</p>
        </div>
        </div>
      </div>
    );
  }

  // SCREEN: Playing Loop / Collecting Votes
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ActivityBanner />
      <div className="flex-1 flex flex-col p-4 min-h-0">
        {/* Header */}
        <div className="text-center mb-2 shrink-0">
          <h1 className="text-3xl font-bold text-white mb-1">LOOP {currentLoopIndex + 1} OF {GAME_LOOPS.length}</h1>
          <div className="w-20 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {/* Main Content - compact layout */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Play Button */}
          <button
            onClick={isPlaying ? stopLoop : playLoop}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 mb-3 shrink-0 ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white ml-1" />
            )}
          </button>

          {isPlaying && (
            <div className="flex items-center gap-2 text-green-400 text-lg mb-3">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span>Playing loop for class...</span>
            </div>
          )}

          {/* Vote Count */}
          <div className="flex items-center gap-2 text-xl text-white mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <span>
              <span className="font-bold text-purple-400">{voteCount}</span>
              <span className="text-gray-400"> / {totalStudents}</span>
              <span className="text-gray-500 ml-2">voted</span>
            </span>
          </div>

          {/* Instructions */}
          <p className="text-lg text-gray-300 mb-3">Students: Listen and vote on your Chromebook</p>

          {/* Show Results Button - moved into main content */}
          <button
            onClick={handleShowResults}
            className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold rounded-xl transition-all shadow-lg"
          >
            SHOW RESULTS
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodMatchTeacherView;
