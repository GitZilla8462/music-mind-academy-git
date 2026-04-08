// File: GenreMatchTeacherGame.jsx
// Genre Match - Teacher Presentation View (Class Game)
// Teacher plays a CC artist clip, students identify the genre
// 8 rounds — one artist per genre, all 10 genre options shown
//
// PHASES: setup → playing → revealed → (repeat) → finished

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Play, Pause, Users, Trophy, Eye, ChevronRight, CheckCircle, XCircle, Volume2, Music } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { useSession } from '../../../../context/SessionContext';
import { formatFirstNameLastInitial } from '../layer-detective/nameGenerator';

// ============================================================
// GAME ROUNDS — one artist per genre, curated for clear genre identity
// ============================================================
const ROUNDS = [
  {
    artistName: 'HoliznaCC0',
    trackTitle: 'Foggy Headed',
    audioUrl: 'https://media.musicmindacademy.com/artists/holiznacc0/foggy-headed.mp3',
    genre: 'Hip-Hop',
    explanation: 'Lo-fi hip-hop beats with chill sampling and drum machines'
  },
  {
    artistName: 'Broke For Free',
    trackTitle: 'Nothing Like Captain Crunch',
    audioUrl: 'https://media.musicmindacademy.com/artists/broke-for-free/nothing-like-captain-crunch.mp3',
    genre: 'Electronic',
    explanation: 'Synth-driven electropop with layered production and no traditional instruments'
  },
  {
    artistName: 'Jason Shaw',
    trackTitle: 'Acoustic Blues',
    audioUrl: 'https://media.musicmindacademy.com/artists/jason-shaw/acoustic-blues.mp3',
    genre: 'Country',
    explanation: 'Acoustic guitar, country-blues fingerpicking, warm rustic feel'
  },
  {
    artistName: 'Ketsa',
    trackTitle: 'Trench Work',
    audioUrl: 'https://media.musicmindacademy.com/artists/ketsa/trench-work.mp3',
    genre: 'Jazz',
    explanation: 'Jazz harmony, soul grooves, and trip-hop production'
  },
  {
    artistName: 'Fog Lake',
    trackTitle: 'spectrogram',
    audioUrl: 'https://media.musicmindacademy.com/artists/fog-lake/spectrogram.mp3',
    genre: 'Rock',
    explanation: 'Guitar-driven lo-fi indie rock with shoegaze textures'
  },
  {
    artistName: 'Komiku',
    trackTitle: 'Tale on the Late',
    audioUrl: 'https://media.musicmindacademy.com/artists/komiku/tale-on-the-late.mp3',
    genre: 'Soundtrack',
    explanation: 'Adventure video game soundtrack with chiptune and punk energy'
  },
  {
    artistName: 'Kellee Maize',
    trackTitle: 'In Tune (Remix 2)',
    audioUrl: 'https://media.musicmindacademy.com/artists/kellee-maize/in-tune-remix-2.mp3',
    genre: 'Hip-Hop',
    explanation: 'Conscious hip-hop with positive lyrics and produced beats'
  },
  {
    artistName: 'Soft and Furious',
    trackTitle: 'Horizon Ending',
    audioUrl: 'https://media.musicmindacademy.com/artists/soft-and-furious/horizon-ending.mp3',
    genre: 'Pop',
    explanation: 'Synth pop with catchy hooks, polished production, and dance energy'
  }
];

// All genre options shown to students
const ALL_GENRES = [
  'Pop', 'Hip-Hop', 'Rock', 'Country', 'Jazz', 'Soundtrack', 'Electronic'
];

const GENRE_COLORS = {
  'Pop': '#ec4899',
  'Hip-Hop': '#8b5cf6',
  'Rock': '#ef4444',
  'Country': '#f97316',
  'Jazz': '#3b82f6',
  'Soundtrack': '#14b8a6',
  'Electronic': '#06b6d4',
};

const SCORING = {
  CORRECT: 1
};

// Student Activity Banner
const ActivityBanner = () => (
  <div
    className="w-full flex items-center justify-center"
    style={{ height: '64px', backgroundColor: '#0891b2', flexShrink: 0 }}
  >
    <span className="text-white font-bold" style={{ fontSize: '28px' }}>
      STUDENT ACTIVITY
    </span>
  </div>
);

const GenreMatchTeacherGame = ({ sessionData, onComplete }) => {
  const { sessionCode: contextSessionCode, classId } = useSession();
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = contextSessionCode || sessionData?.sessionCode || urlParams.get('session') || urlParams.get('classCode');

  // Firebase paths
  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/genreMatch`;
    if (sessionCode) return `sessions/${sessionCode}/genreMatch`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentRound, setCurrentRound] = useState(0);

  // Audio
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);

  // Reveal state
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});

  // Answer counts per genre
  const [answerCounts, setAnswerCounts] = useState({});

  const currentQuestion = ROUNDS[currentRound] || null;
  const totalRounds = ROUNDS.length;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.onplay = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play/pause audio
  const playAudio = useCallback(() => {
    if (!currentQuestion) return;

    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(currentQuestion.audioUrl);
    audio.volume = 0.8;
    audioRef.current = audio;

    audio.onplay = () => setIsAudioPlaying(true);
    audio.onended = () => setIsAudioPlaying(false);
    audio.onerror = (e) => {
      console.error('Audio failed to load:', currentQuestion.audioUrl, e);
      setIsAudioPlaying(false);
    };

    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      setIsAudioPlaying(false);
    });
  }, [currentQuestion]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  }, []);

  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!gamePath) return;
    const db = getDatabase();
    update(ref(db, gamePath), data);
  }, [gamePath]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    const studentsRef = ref(db, studentsPath);

    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.genreMatchScore || 0,
          answer: s.genreMatchAnswer,
          answerTime: s.genreMatchAnswerTime,
          playerColor: s.playerColor || '#3B82F6',
          playerEmoji: s.playerEmoji || '\uD83C\uDFB5'
        }));

      setStudents(list);
      setLockedCount(list.filter(s => s.answer).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));

      // Count answers per genre
      const counts = {};
      list.forEach(s => {
        if (s.answer) {
          counts[s.answer] = (counts[s.answer] || 0) + 1;
        }
      });
      setAnswerCounts(counts);
    });

    return () => unsubscribe();
  }, [studentsPath]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentRound(0);
    setGamePhase('playing');
    setScoreChanges({});
    setCorrectCount(0);

    // Reset student answers and scores
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          genreMatchAnswer: null,
          genreMatchAnswerTime: null,
          genreMatchScore: 0
        }).catch(err => console.error(`Failed to reset student ${s.id}:`, err));
      });
    }

    updateGame({
      phase: 'playing',
      currentRound: 0,
      totalRounds,
      options: ALL_GENRES,
      correctAnswer: null,
      artistName: null
    });
  }, [studentsPath, students, updateGame, totalRounds]);

  // Reveal answer
  const reveal = useCallback(() => {
    if (!currentQuestion) return;

    // Stop audio
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
      setIsAudioPlaying(false);
    }

    const changes = {};
    let correct = 0;

    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        if (s.answer) {
          const isCorrect = s.answer === currentQuestion.genre;
          if (isCorrect) {
            correct++;
            const newScore = (s.score || 0) + SCORING.CORRECT;
            changes[s.id] = { isCorrect: true, points: SCORING.CORRECT };
            update(ref(db, `${studentsPath}/${s.id}`), {
              genreMatchScore: newScore
            }).catch(err => console.error(`Failed to update score for ${s.id}:`, err));
          } else {
            changes[s.id] = { isCorrect: false, points: 0 };
          }
        } else {
          changes[s.id] = { isCorrect: false, noAnswer: true, points: 0 };
        }
      });
    }

    setScoreChanges(changes);
    setCorrectCount(correct);
    setGamePhase('revealed');

    updateGame({
      phase: 'revealed',
      correctAnswer: currentQuestion.genre,
      artistName: currentQuestion.artistName
    });
  }, [currentQuestion, students, studentsPath, updateGame]);

  // Next round
  const nextRound = useCallback(() => {
    if (studentsPath) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `${studentsPath}/${s.id}`), {
          genreMatchAnswer: null,
          genreMatchAnswerTime: null
        }).catch(err => console.error(`Failed to clear answer for ${s.id}:`, err));
      });
    }

    const nextIdx = currentRound + 1;

    if (nextIdx >= totalRounds) {
      setGamePhase('finished');
      updateGame({ phase: 'finished', correctAnswer: null, artistName: null });
    } else {
      setCurrentRound(nextIdx);
      setGamePhase('playing');
      setScoreChanges({});
      setCorrectCount(0);

      updateGame({
        phase: 'playing',
        currentRound: nextIdx,
        correctAnswer: null,
        artistName: null
      });
    }
  }, [studentsPath, students, currentRound, totalRounds, updateGame]);

  const correctColor = currentQuestion ? GENRE_COLORS[currentQuestion.genre] || '#6b7280' : '#6b7280';

  return (
    <div className="min-h-screen h-full flex flex-col bg-[#0f1419] text-white overflow-hidden">
      <ActivityBanner />

      <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Music size={40} className="text-cyan-400" />
            <h1 className="text-4xl font-bold">Genre Match</h1>
            {gamePhase !== 'setup' && gamePhase !== 'finished' && (
              <span className="bg-white/10 px-4 py-2 rounded-full text-xl">
                Round {currentRound + 1} / {totalRounds}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-2xl">
            <Users size={28} />
            <span>{students.length}</span>
          </div>
        </div>

        {/* Round progress bar */}
        {gamePhase !== 'setup' && gamePhase !== 'finished' && (
          <div className="flex gap-1 mb-3 flex-shrink-0">
            {ROUNDS.map((round, idx) => {
              const isComplete = idx < currentRound || (idx === currentRound && gamePhase === 'revealed');
              const isCurrent = idx === currentRound && gamePhase === 'playing';
              const color = isComplete ? GENRE_COLORS[round.genre] || '#6b7280' : 'rgba(255,255,255,0.1)';

              return (
                <div
                  key={idx}
                  className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent ? 'ring-2 ring-white scale-105' : ''
                  }`}
                  style={{ backgroundColor: color, opacity: isComplete ? 1 : isCurrent ? 0.7 : 0.3 }}
                >
                  {isComplete ? '✓' : idx + 1}
                </div>
              );
            })}
          </div>
        )}

        {/* Main content grid */}
        <div className={`grid ${gamePhase !== 'setup' ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
          {/* Main area */}
          <div className={`${gamePhase !== 'setup' ? 'col-span-2' : ''} bg-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-0`}>

            {/* ==================== SETUP ==================== */}
            {gamePhase === 'setup' && (
              <div className="text-center">
                <Music size={72} className="mx-auto text-cyan-400 mb-4" />
                <h2 className="text-4xl font-bold mb-2">Genre Match</h2>
                <p className="text-xl text-white/70 mb-4">Hear a clip — what genre is it?</p>

                <div className="flex flex-wrap gap-3 justify-center mb-6 max-w-3xl">
                  {ALL_GENRES.map(genre => (
                    <div
                      key={genre}
                      className="px-5 py-2 rounded-full text-white font-bold text-lg"
                      style={{ backgroundColor: GENRE_COLORS[genre] || '#6b7280' }}
                    >
                      {genre}
                    </div>
                  ))}
                </div>

                <p className="text-lg text-white/50 mb-5">{totalRounds} rounds &middot; 1 point per correct answer</p>

                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Play size={32} /> Start Game
                </button>
              </div>
            )}

            {/* ==================== PLAYING ==================== */}
            {gamePhase === 'playing' && currentQuestion && (
              <div className="flex flex-col h-full w-full">
                <div className="text-center mb-3 flex-shrink-0">
                  <p className="text-3xl font-bold text-cyan-300">What genre is this?</p>
                </div>

                {/* Genre cards — main visual focus */}
                <div className="grid grid-cols-5 gap-3 flex-1 min-h-0 w-full">
                  {ALL_GENRES.map(genre => {
                    const count = answerCounts[genre] || 0;
                    const color = GENRE_COLORS[genre] || '#6b7280';
                    return (
                      <div
                        key={genre}
                        className="rounded-2xl flex flex-col items-center justify-center text-center transition-all"
                        style={{
                          backgroundColor: `${color}25`,
                          borderColor: color,
                          borderWidth: '2px'
                        }}
                      >
                        <div className="text-lg font-black text-white mb-1">{genre}</div>
                        <div className="bg-black/30 rounded-xl px-3 py-1">
                          <span className="text-2xl font-bold" style={{ color }}>{count}</span>
                          <span className="text-xs text-white/60 ml-1">votes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom control bar */}
                <div className="flex items-center justify-between mt-3 flex-shrink-0">
                  <button
                    onClick={isAudioPlaying ? pauseAudio : playAudio}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xl font-bold transition-all hover:scale-105 ${
                      isAudioPlaying
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse shadow-lg shadow-orange-500/30'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/30'
                    }`}
                  >
                    {isAudioPlaying ? (
                      <><Pause size={24} /> Playing...</>
                    ) : (
                      <><Volume2 size={24} /> Play Clip</>
                    )}
                  </button>

                  <div className="bg-white/10 rounded-2xl px-5 py-2">
                    <span className="text-3xl font-black text-green-400">{lockedCount}</span>
                    <span className="text-lg text-white/70"> / {students.length} answered</span>
                  </div>

                  <button
                    onClick={reveal}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                  >
                    <Eye size={24} /> Reveal Answer
                  </button>
                </div>
              </div>
            )}

            {/* ==================== REVEALED ==================== */}
            {gamePhase === 'revealed' && currentQuestion && (
              <div className="text-center">
                <div className="text-3xl text-white/80 mb-4">The answer is...</div>

                <div
                  className="rounded-3xl p-8 mb-4 max-w-lg mx-auto"
                  style={{ backgroundColor: correctColor }}
                >
                  <div className="text-3xl font-black text-white mb-2">{currentQuestion.genre}</div>
                  <div className="text-2xl font-bold text-white/90 mb-1">{currentQuestion.artistName} — "{currentQuestion.trackTitle}"</div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <CheckCircle size={20} className="text-white/80" />
                    <div className="text-lg text-white/80">{currentQuestion.explanation}</div>
                  </div>
                </div>

                {/* Vote breakdown — top 5 genres with votes */}
                <div className="flex gap-3 justify-center mb-4 flex-wrap">
                  {ALL_GENRES
                    .filter(g => (answerCounts[g] || 0) > 0 || g === currentQuestion.genre)
                    .map(genre => {
                      const count = answerCounts[genre] || 0;
                      const isCorrect = genre === currentQuestion.genre;
                      return (
                        <div
                          key={genre}
                          className={`rounded-xl px-4 py-2 text-center ${
                            isCorrect ? 'ring-4 ring-green-400' : 'opacity-50'
                          }`}
                          style={{ backgroundColor: `${GENRE_COLORS[genre]}40` }}
                        >
                          {isCorrect && (
                            <CheckCircle size={18} className="text-green-400 inline mr-1" />
                          )}
                          <span className="font-bold">{genre}</span>
                          <span className="text-xl font-black ml-2">{count}</span>
                        </div>
                      );
                    })}
                </div>

                <div className="text-xl text-white/70 mb-6">
                  {correctCount} of {students.length} got it correct!
                  {correctCount > 0 && students.length > 0 && (
                    <span className="ml-2 text-green-400">
                      ({Math.round((correctCount / students.length) * 100)}%)
                    </span>
                  )}
                </div>

                <button
                  onClick={nextRound}
                  className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 mx-auto"
                >
                  {currentRound >= totalRounds - 1 ? (
                    <><Trophy size={28} /> See Final Results</>
                  ) : (
                    <>Next Round <ChevronRight size={28} /></>
                  )}
                </button>
              </div>
            )}

            {/* ==================== FINISHED ==================== */}
            {gamePhase === 'finished' && (
              <div className="text-center">
                <div className="text-5xl mb-3">{'\uD83C\uDFC6'}</div>
                <h2 className="text-3xl font-black mb-3">Game Complete!</h2>
                <p className="text-lg text-white/70 mb-4">Great job everyone!</p>

                {leaderboard.length > 0 && (
                  <div className="max-w-lg mx-auto mb-8">
                    {leaderboard.slice(0, 5).map((student, idx) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl mb-2 ${
                          idx === 0 ? 'bg-yellow-500/30 ring-2 ring-yellow-400' :
                          idx === 1 ? 'bg-gray-300/20' :
                          idx === 2 ? 'bg-amber-700/20' :
                          'bg-white/5'
                        }`}
                      >
                        <span className="w-12 text-center font-bold text-3xl">
                          {idx === 0 ? '\uD83E\uDD47' : idx === 1 ? '\uD83E\uDD48' : idx === 2 ? '\uD83E\uDD49' : `#${idx + 1}`}
                        </span>
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                          style={{ backgroundColor: student.playerColor }}
                        >
                          {student.playerEmoji || student.name.charAt(0)}
                        </div>
                        <span className="flex-1 text-2xl font-medium text-left truncate">{student.name}</span>
                        <span className="text-3xl font-black">{student.score}/{totalRounds}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => onComplete?.()}
                  className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                >
                  <Trophy size={28} /> Continue
                </button>
              </div>
            )}
          </div>

          {/* ==================== LEADERBOARD SIDEBAR ==================== */}
          {gamePhase !== 'setup' && (
            <div className="bg-white/5 rounded-2xl p-4 flex flex-col min-h-0">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="text-yellow-400" size={32} />
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {leaderboard.map((student, idx) => {
                  const change = scoreChanges[student.id];
                  const isRevealing = gamePhase === 'revealed';
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'
                      } ${isRevealing && change?.isCorrect ? 'ring-2 ring-green-400' : ''}`}
                    >
                      <span className="w-8 text-center font-bold text-xl">
                        {idx === 0 ? '\uD83E\uDD47' : idx === 1 ? '\uD83E\uDD48' : idx === 2 ? '\uD83E\uDD49' : `#${idx + 1}`}
                      </span>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ backgroundColor: student.playerColor }}
                      >
                        {student.playerEmoji || student.name.charAt(0)}
                      </div>
                      <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                      {gamePhase === 'playing' && student.answer && (
                        <span className="text-green-400 text-sm">✓</span>
                      )}
                      <span className="font-bold text-xl">{student.score}</span>
                      {isRevealing && change?.isCorrect && (
                        <span className="text-sm font-bold text-green-400">+1</span>
                      )}
                      {isRevealing && change && !change.isCorrect && !change.noAnswer && (
                        <XCircle size={18} className="text-red-400/60" />
                      )}
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="text-center text-white/50 py-6 text-lg">Waiting for students...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenreMatchTeacherGame;
