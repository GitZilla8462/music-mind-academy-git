// Leitmotif Spotter - Student View (syncs with teacher's class game)
// Students pick Mode (Major/Minor), Instrument Family, and Register (Low/Mid/High)
// No audio on student side — they listen to the teacher's screen

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Trophy, Volume2 } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { getPlayerColor, getPlayerEmoji, getStudentDisplayName, formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import { CHARACTER_TYPES, INSTRUMENT_FAMILIES, MODES, REGISTERS, SCORING, TOTAL_ROUNDS, formatInstrument } from './leitmotifSpotterConfig';

const LeitmotifSpotterStudentView = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/leitmotifSpotter`;
    if (sessionCode) return `sessions/${sessionCode}/leitmotifSpotter`;
    return null;
  }, [classId, sessionCode]);

  const studentsPath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/studentsJoined`;
    if (sessionCode) return `sessions/${sessionCode}/studentsJoined`;
    return null;
  }, [classId, sessionCode]);

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('🎵');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(TOTAL_ROUNDS);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [playStartTime, setPlayStartTime] = useState(null);

  // Student's picks (4 categories)
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedRegister, setSelectedRegister] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  // Results per round
  const [characterCorrect, setCharacterCorrect] = useState(null);
  const [modeCorrect, setModeCorrect] = useState(null);
  const [instrumentCorrect, setInstrumentCorrect] = useState(null);
  const [registerCorrect, setRegisterCorrect] = useState(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  // Refs to avoid stale closures
  const scoredRoundRef = useRef(-1);
  const scoreRef = useRef(0);
  const currentRoundRef = useRef(0);
  const selectedCharacterRef = useRef(null);
  const selectedModeRef = useRef(null);
  const selectedInstrumentRef = useRef(null);
  const selectedRegisterRef = useRef(null);
  const answerSubmittedRef = useRef(false);
  const playStartTimeRef = useRef(null);

  // Get player name on mount
  useEffect(() => {
    if (!userId) return;
    const assignPlayerName = async () => {
      const color = getPlayerColor(userId);
      const emoji = getPlayerEmoji(userId);
      const name = await getStudentDisplayName(userId, null, studentsPath);
      setPlayerName(name);
      setPlayerColor(color);
      setPlayerEmoji(emoji);
      if (studentsPath) {
        const db = getDatabase();
        update(ref(db, `${studentsPath}/${userId}`), {
          displayName: name,
          playerColor: color,
          playerEmoji: emoji
        });
      }
    };
    assignPlayerName();
  }, [userId, studentsPath]);

  // Keep refs in sync
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { selectedCharacterRef.current = selectedCharacter; }, [selectedCharacter]);
  useEffect(() => { selectedModeRef.current = selectedMode; }, [selectedMode]);
  useEffect(() => { selectedInstrumentRef.current = selectedInstrument; }, [selectedInstrument]);
  useEffect(() => { selectedRegisterRef.current = selectedRegister; }, [selectedRegister]);
  useEffect(() => { answerSubmittedRef.current = answerSubmitted; }, [answerSubmitted]);
  useEffect(() => { playStartTimeRef.current = playStartTime; }, [playStartTime]);

  // Listen for game state from teacher
  useEffect(() => {
    if (!gamePath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, gamePath), (snapshot) => {
      const data = snapshot.val();
      if (!data) { setGamePhase('waiting'); return; }

      setGamePhase(data.phase || 'waiting');
      setCurrentRound(data.currentRound || 0);
      setTotalRounds(data.totalRounds || TOTAL_ROUNDS);

      if (data.phase === 'playing' || data.phase === 'guessing') {
        // New game reset
        if (data.currentRound === 0 && scoredRoundRef.current === -1 && scoreRef.current > 0) {
          scoreRef.current = 0;
          setScore(0);
        }
        if (data.currentRound === 0 && currentRoundRef.current !== 0) {
          scoreRef.current = 0;
          setScore(0);
          scoredRoundRef.current = -1;
        }

        // New round — reset picks
        if (data.currentRound !== currentRoundRef.current) {
          selectedCharacterRef.current = null;
          selectedModeRef.current = null;
          selectedInstrumentRef.current = null;
          selectedRegisterRef.current = null;
          answerSubmittedRef.current = false;
          setSelectedCharacter(null);
          setSelectedMode(null);
          setSelectedInstrument(null);
          setSelectedRegister(null);
          setAnswerSubmitted(false);
          setCharacterCorrect(null);
          setModeCorrect(null);
          setInstrumentCorrect(null);
          setRegisterCorrect(null);
          setEarnedPoints(0);
          setCorrectAnswer(null);
        }

        if (data.isPlaying) {
          playStartTimeRef.current = data.playStartTime;
          setPlayStartTime(data.playStartTime);
          setGamePhase('guessing');
        }
      }

      // Restore score on finished
      if (data.phase === 'finished') {
        const effectiveUserId = userId || localStorage.getItem('current-session-userId');
        if (effectiveUserId && scoreRef.current === 0 && studentsPath) {
          get(ref(db, `${studentsPath}/${effectiveUserId}/leitmotifSpotterScore`))
            .then(snap => {
              const fbScore = snap.val() || 0;
              if (fbScore > 0) { scoreRef.current = fbScore; setScore(fbScore); }
            }).catch(() => {});
        }
      }

      // Handle reveal
      if (data.phase === 'revealed' && data.correctAnswer) {
        const correct = JSON.parse(data.correctAnswer);
        setCorrectAnswer(correct);

        const roundNum = data.currentRound || 0;
        if (answerSubmittedRef.current && scoredRoundRef.current !== roundNum) {
          scoredRoundRef.current = roundNum;

          const cOk = selectedCharacterRef.current === correct.character;
          const mOk = selectedModeRef.current === correct.mode;
          const iOk = selectedInstrumentRef.current === correct.instrument;
          const rOk = selectedRegisterRef.current === correct.register;

          setCharacterCorrect(cOk);
          setModeCorrect(mOk);
          setInstrumentCorrect(iOk);
          setRegisterCorrect(rOk);

          let points = 0;
          if (cOk) points += SCORING.perCategory;
          if (mOk) points += SCORING.perCategory;
          if (iOk) points += SCORING.perCategory;
          if (rOk) points += SCORING.perCategory;

          // Speed bonus if all 4 correct
          if (cOk && mOk && iOk && rOk) {
            const answerTime = Date.now() - (playStartTimeRef.current || Date.now());
            if (answerTime < SCORING.speedThreshold) {
              points += SCORING.speedBonus;
            }
          }

          setEarnedPoints(points);
          const newScore = scoreRef.current + points;
          scoreRef.current = newScore;
          setScore(newScore);

          const effectiveUserId = userId || localStorage.getItem('current-session-userId');
          if (studentsPath && effectiveUserId) {
            update(ref(db, `${studentsPath}/${effectiveUserId}`), {
              leitmotifSpotterScore: newScore
            });
          }
        }
      }
    });
    return () => unsubscribe();
  }, [gamePath, studentsPath, userId]);

  // Leaderboard
  useEffect(() => {
    if (!studentsPath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, studentsPath), (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.leitmotifSpotterScore || 0,
          playerColor: s.playerColor || '#3B82F6',
          playerEmoji: s.playerEmoji || '🎵'
        }));
      const sorted = [...list].sort((a, b) => b.score - a.score);
      setLeaderboard(sorted);
      const myIndex = sorted.findIndex(s => s.id === userId);
      if (myIndex !== -1) setMyRank(myIndex + 1);
    });
    return () => unsubscribe();
  }, [studentsPath, userId]);

  // Submit answer (all 3 picks at once)
  const submitAnswer = () => {
    if (answerSubmitted || gamePhase !== 'guessing') return;
    if (!selectedCharacter || !selectedMode || !selectedInstrument || !selectedRegister) return;

    answerSubmittedRef.current = true;
    setAnswerSubmitted(true);

    const answer = { character: selectedCharacter, mode: selectedMode, instrument: selectedInstrument, register: selectedRegister };

    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        leitmotifSpotterAnswer: JSON.stringify(answer),
        leitmotifSpotterAnswerTime: Date.now()
      });
    }
  };

  const allPicked = selectedCharacter && selectedMode && selectedInstrument && selectedRegister;

  // ============ FINISHED ============
  if (gamePhase === 'finished') {
    const myEntry = leaderboard.find(s => s.id === userId);
    const displayScore = score > 0 ? score : (myEntry?.score ?? score);
    const getRankEmoji = (rank) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 overflow-auto">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🏆</div>
          <div
            className="inline-flex flex-col items-center px-8 py-4 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: playerColor }}
          >
            <span className="text-4xl mb-1">{playerEmoji}</span>
            <span className="text-2xl font-bold text-white">{playerName}</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-3xl">{getRankEmoji(myRank)}</span>
              {myRank && myRank <= 3 && (
                <span className="text-xl font-bold text-white">
                  {myRank === 1 ? '1st Place!' : myRank === 2 ? '2nd Place!' : '3rd Place!'}
                </span>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Game Complete!</h1>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-4 mb-4 inline-block">
            <div className="text-4xl font-bold text-gray-900 mb-1">{displayScore}</div>
            <div className="text-lg text-gray-800">Your Score</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <h3 className="text-sm font-bold text-white/70 mb-2">Class Leaderboard</h3>
            <div className="space-y-1">
              {leaderboard.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-2 px-2 py-1 rounded ${
                    student.id === userId ? 'bg-purple-500/50 ring-2 ring-purple-300' : ''
                  }`}
                >
                  <span className="w-6 text-center font-bold text-sm text-white">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: student.playerColor }}
                  >{student.playerEmoji}</div>
                  <span className="flex-1 truncate text-sm text-white">{student.name}</span>
                  <span className="font-bold text-sm text-yellow-300">{student.score}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-purple-200 text-sm">Look at the main screen!</p>
        </div>
      </div>
    );
  }

  // ============ WAITING ============
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Mystery Motif</h1>
          <p className="text-xl text-purple-200 mb-8">Waiting for teacher to start...</p>
          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ============ PLAYING / GUESSING / REVEALED ============
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
            style={{ backgroundColor: playerColor }}
          >{playerEmoji}</div>
          <div>
            <div className="text-lg font-bold" style={{ color: playerColor }}>{playerName}</div>
            <div className="text-sm text-purple-200">Motif {currentRound + 1}/{totalRounds}</div>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl">
          <div className="text-2xl font-bold text-yellow-300">{score}</div>
          <div className="text-xs text-purple-200">points</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">

        {/* Playing - waiting for audio */}
        {gamePhase === 'playing' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-indigo-500 mx-auto">
              <Volume2 size={40} className="text-white" />
            </div>
            <p className="text-xl text-purple-200">Get ready to listen...</p>
            <p className="text-sm text-purple-300 mt-2">Watch the main screen</p>
          </div>
        )}

        {/* Guessing - not yet submitted */}
        {gamePhase === 'guessing' && !answerSubmitted && (
          <div className="w-full max-w-md">
            <p className="text-center text-purple-200 text-sm mb-4">Listen to the main screen, then pick:</p>

            {/* Character */}
            <div className="mb-3">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Character Type?</label>
              <div className="grid grid-cols-4 gap-2">
                {CHARACTER_TYPES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCharacter(c.id)}
                    className={`p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedCharacter === c.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedCharacter
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{c.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="mb-3">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Bright or Dark?</label>
              <div className="flex gap-2">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`flex-1 p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedMode === m.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedMode
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{m.label}</div>
                    <div className="text-xs opacity-70">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instrument */}
            <div className="mb-3">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Instrument Family?</label>
              <div className="grid grid-cols-4 gap-2">
                {INSTRUMENT_FAMILIES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedInstrument(f.id)}
                    className={`p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedInstrument === f.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedInstrument
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Register */}
            <div className="mb-4">
              <label className="text-xs font-bold text-purple-300 uppercase mb-1.5 block">Register?</label>
              <div className="flex gap-2">
                {REGISTERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegister(r.id)}
                    className={`flex-1 p-3 rounded-xl text-center transition-all duration-200 active:scale-95 font-bold ${
                      selectedRegister === r.id
                        ? 'bg-purple-500 text-white ring-2 ring-white scale-105'
                        : selectedRegister
                        ? 'bg-white/10 text-white/40 hover:text-white/70 hover:bg-white/15'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg">{r.label}</div>
                    <div className="text-xs opacity-70">{r.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lock In */}
            <button
              onClick={submitAnswer}
              disabled={!allPicked}
              className="w-full py-4 rounded-xl text-lg font-bold transition-all active:scale-95 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {allPicked ? '🔒 Lock In Answer' : 'Pick all 4 to submit'}
            </button>
          </div>
        )}

        {/* Answer submitted - waiting for reveal */}
        {gamePhase === 'guessing' && answerSubmitted && (
          <div className="text-center">
            <div className="bg-white/20 rounded-2xl p-6 inline-block">
              <Check size={48} className="mx-auto text-green-400 mb-3" />
              <p className="text-xl text-white font-bold mb-3">Answer Locked In!</p>
              <div className="flex flex-wrap gap-2 mb-3 justify-center">
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: CHARACTER_TYPES.find(c => c.id === selectedCharacter)?.color }}>
                  {CHARACTER_TYPES.find(c => c.id === selectedCharacter)?.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: MODES.find(m => m.id === selectedMode)?.color }}>
                  {MODES.find(m => m.id === selectedMode)?.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: INSTRUMENT_FAMILIES.find(f => f.id === selectedInstrument)?.color }}>
                  {INSTRUMENT_FAMILIES.find(f => f.id === selectedInstrument)?.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: REGISTERS.find(r => r.id === selectedRegister)?.color }}>
                  {REGISTERS.find(r => r.id === selectedRegister)?.label}
                </span>
              </div>
              <p className="text-sm text-purple-300">Waiting for teacher to reveal...</p>
            </div>
          </div>
        )}

        {/* Revealed */}
        {gamePhase === 'revealed' && correctAnswer && (
          <div className="text-center w-full max-w-md">
            {/* Score summary */}
            {answerSubmitted ? (
              <div className={`rounded-2xl p-5 mb-4 ${
                earnedPoints >= 40 ? 'bg-green-500/30' :
                earnedPoints >= 30 ? 'bg-yellow-500/30' :
                earnedPoints >= 10 ? 'bg-orange-500/30' :
                'bg-red-500/30'
              }`}>
                <p className="text-3xl font-bold mb-1" style={{ color:
                  earnedPoints >= 40 ? '#4ADE80' :
                  earnedPoints >= 30 ? '#FBBF24' :
                  earnedPoints >= 10 ? '#FB923C' :
                  '#F87171'
                }}>
                  {earnedPoints >= 40 ? 'Perfect!' :
                   earnedPoints >= 30 ? 'Great!' :
                   earnedPoints >= 10 ? 'Good try!' :
                   'Not quite!'}
                </p>
                <p className="text-xl text-white">+{earnedPoints} points{earnedPoints > 40 ? ' (speed bonus!)' : ''}</p>
              </div>
            ) : (
              <div className="bg-gray-500/30 rounded-2xl p-5 mb-4">
                <p className="text-2xl font-bold text-gray-300">No answer</p>
              </div>
            )}

            {/* Category results */}
            <div className="space-y-2 mb-4">
              {/* Character */}
              <div className={`flex items-center gap-3 p-3 rounded-xl ${characterCorrect ? 'bg-green-500/20' : characterCorrect === false ? 'bg-red-500/20' : 'bg-white/10'}`}>
                <span className="text-xl">{characterCorrect ? '✅' : characterCorrect === false ? '❌' : '➖'}</span>
                <div className="flex-1 text-left">
                  <div className="text-xs text-purple-300">Character</div>
                  <div className="text-white font-bold">{CHARACTER_TYPES.find(c => c.id === correctAnswer.character)?.label}</div>
                </div>
                {selectedCharacter && selectedCharacter !== correctAnswer.character && (
                  <span className="text-sm text-red-300">You: {CHARACTER_TYPES.find(c => c.id === selectedCharacter)?.label}</span>
                )}
              </div>

              {/* Mode */}
              <div className={`flex items-center gap-3 p-3 rounded-xl ${modeCorrect ? 'bg-green-500/20' : modeCorrect === false ? 'bg-red-500/20' : 'bg-white/10'}`}>
                <span className="text-xl">{modeCorrect ? '✅' : modeCorrect === false ? '❌' : '➖'}</span>
                <div className="flex-1 text-left">
                  <div className="text-xs text-purple-300">Mode</div>
                  <div className="text-white font-bold">{MODES.find(m => m.id === correctAnswer.mode)?.label}</div>
                </div>
                {selectedMode && selectedMode !== correctAnswer.mode && (
                  <span className="text-sm text-red-300">You: {MODES.find(m => m.id === selectedMode)?.label}</span>
                )}
              </div>

              {/* Instrument */}
              <div className={`flex items-center gap-3 p-3 rounded-xl ${instrumentCorrect ? 'bg-green-500/20' : instrumentCorrect === false ? 'bg-red-500/20' : 'bg-white/10'}`}>
                <span className="text-xl">{instrumentCorrect ? '✅' : instrumentCorrect === false ? '❌' : '➖'}</span>
                <div className="flex-1 text-left">
                  <div className="text-xs text-purple-300">Instrument Family</div>
                  <div className="text-white font-bold">{formatInstrument(correctAnswer.instrument, correctAnswer.instrumentDetail)}</div>
                </div>
                {selectedInstrument && selectedInstrument !== correctAnswer.instrument && (
                  <span className="text-sm text-red-300">You: {INSTRUMENT_FAMILIES.find(f => f.id === selectedInstrument)?.label}</span>
                )}
              </div>

              {/* Register */}
              <div className={`flex items-center gap-3 p-3 rounded-xl ${registerCorrect ? 'bg-green-500/20' : registerCorrect === false ? 'bg-red-500/20' : 'bg-white/10'}`}>
                <span className="text-xl">{registerCorrect ? '✅' : registerCorrect === false ? '❌' : '➖'}</span>
                <div className="flex-1 text-left">
                  <div className="text-xs text-purple-300">Register</div>
                  <div className="text-white font-bold">{REGISTERS.find(r => r.id === correctAnswer.register)?.label}</div>
                </div>
                {selectedRegister && selectedRegister !== correctAnswer.register && (
                  <span className="text-sm text-red-300">You: {REGISTERS.find(r => r.id === selectedRegister)?.label}</span>
                )}
              </div>
            </div>

            <p className="text-purple-200 text-sm">Waiting for next motif...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeitmotifSpotterStudentView;
