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

// Student Activity Time Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{
      height: '64px',
      backgroundColor: '#0d9488',
      flexShrink: 0
    }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const MoodMatchTeacherView = () => {
  const { sessionCode } = useSession();

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
    audioRef.current.loop = true;
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
    if (!sessionCode) return;

    try {
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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

          {/* Restart Button */}
          <div className="text-center">
            <button
              onClick={handleRestartGame}
              className="flex items-center gap-3 mx-auto px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold rounded-xl transition-all"
            >
              <RotateCcw className="w-6 h-6" />
              PLAY AGAIN
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
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <ActivityBanner />
        <div className="flex-1 flex flex-col p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">LOOP {currentLoopIndex + 1} RESULTS</h1>
          <p className="text-xl text-gray-400">{voteCount} votes</p>
        </div>

        {/* Bar Chart */}
        <div className="flex-1 max-w-3xl mx-auto w-full">
          {MOOD_CATEGORIES.map((mood) => {
            const count = voteTally[mood.id] || 0;
            const percentage = voteCount > 0 ? (count / maxVotes) * 100 : 0;

            return (
              <div key={mood.id} className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xl font-bold text-white w-32">{mood.name.toUpperCase()}</span>
                  <div className="flex-1 h-12 bg-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 flex items-center justify-end pr-4"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: mood.color,
                        minWidth: count > 0 ? '40px' : '0'
                      }}
                    >
                      {count > 0 && (
                        <span className="text-white font-bold text-lg">{count}</span>
                      )}
                    </div>
                  </div>
                  {count === 0 && (
                    <span className="text-gray-500 font-bold text-lg w-8">0</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Discussion Prompt */}
        <div className="bg-black/40 rounded-xl p-6 max-w-3xl mx-auto w-full mb-8">
          <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Discussion</p>
          <p className="text-2xl text-white">{discussionPrompt}</p>
        </div>

        {/* Next Button */}
        <div className="text-center">
          <button
            onClick={handleNextLoop}
            className="flex items-center gap-3 mx-auto px-10 py-5 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-xl transition-all"
          >
            {currentLoopIndex < GAME_LOOPS.length - 1 ? (
              <>
                NEXT LOOP
                <ChevronRight className="w-6 h-6" />
              </>
            ) : (
              <>
                VIEW SUMMARY
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
        </div>
      </div>
    );
  }

  // SCREEN: Playing Loop / Collecting Votes
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <ActivityBanner />
      <div className="flex-1 flex flex-col p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2">LOOP {currentLoopIndex + 1} OF {GAME_LOOPS.length}</h1>
        <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Play Button */}
        <button
          onClick={isPlaying ? stopLoop : playLoop}
          className={`w-48 h-48 rounded-full flex items-center justify-center transition-all transform hover:scale-105 mb-8 ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-24 h-24 text-white" />
          ) : (
            <Play className="w-24 h-24 text-white ml-4" />
          )}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-3 text-green-400 text-2xl mb-8">
            <Volume2 className="w-8 h-8 animate-pulse" />
            <span>Playing loop for class...</span>
          </div>
        )}

        {/* Instructions */}
        <p className="text-2xl text-gray-300 mb-8">Students: Listen and vote on your Chromebook</p>

        {/* Vote Count */}
        <div className="flex items-center gap-3 text-3xl text-white mb-8">
          <Users className="w-8 h-8 text-purple-400" />
          <span>
            <span className="font-bold text-purple-400">{voteCount}</span>
            <span className="text-gray-400"> / {totalStudents}</span>
            <span className="text-gray-500 ml-2">voted</span>
          </span>
        </div>
      </div>

      {/* Show Results Button */}
      <div className="text-center">
        <button
          onClick={handleShowResults}
          className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold rounded-xl transition-all"
        >
          SHOW RESULTS
        </button>
      </div>
      </div>
    </div>
  );
};

export default MoodMatchTeacherView;
