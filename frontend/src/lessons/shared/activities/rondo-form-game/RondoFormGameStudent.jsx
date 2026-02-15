// File: RondoFormGameStudent.jsx
// Rondo Form Game - Student View
//
// Round 1: Drag A,A,A,A,B,C,D tiles into 7 slots → submit → scored by accuracy + speed
// Round 2: Teacher plays sections, student taps A/B/C/D (like Section Spotter)
// Round 3: 7 mystery boxes with audio clips — tap to listen, arrange in order → submit

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Trophy, Volume2, GripVertical } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue, get } from 'firebase/database';
import { generateUniquePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import {
  PIECE, CORRECT_FORM, SECTION_OPTIONS, GUIDED_SECTIONS, SECTIONS_DATA,
  SCORING, calculateRound1SpeedBonus, calculateRound2SpeedBonus, calculateRound3SpeedBonus,
  shuffleArray
} from './rondoFormGameConfig';

const RondoFormGameStudent = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  // Player info
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#3B82F6');
  const [playerEmoji, setPlayerEmoji] = useState('🎵');
  const [score, setScore] = useState(0);

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [roundPhase, setRoundPhase] = useState('waiting');
  const [roundStartTime, setRoundStartTime] = useState(null);

  // Round 2 teacher-paced state
  const [r2CurrentQuestion, setR2CurrentQuestion] = useState(0);
  const [r2TotalQuestions, setR2TotalQuestions] = useState(7);
  const [r2CorrectAnswer, setR2CorrectAnswer] = useState(null);
  const [r2PlayStartTime, setR2PlayStartTime] = useState(null);
  const [r2SelectedAnswer, setR2SelectedAnswer] = useState(null);
  const [r2AnswerSubmitted, setR2AnswerSubmitted] = useState(false);
  const [r2WasCorrect, setR2WasCorrect] = useState(null);
  const [r2EarnedPoints, setR2EarnedPoints] = useState(0);

  // Round 1 state
  const [r1Tiles, setR1Tiles] = useState([]); // available tiles to drag
  const [r1Slots, setR1Slots] = useState([null, null, null, null, null, null, null]);
  const [r1Submitted, setR1Submitted] = useState(false);
  const [r1Results, setR1Results] = useState(null); // { correct: [bool], score: num }

  // Round 3 state
  const [r3Boxes, setR3Boxes] = useState([]); // shuffled sections with audio
  const [r3Slots, setR3Slots] = useState([null, null, null, null, null, null, null]);
  const [r3Submitted, setR3Submitted] = useState(false);
  const [r3Results, setR3Results] = useState(null);
  const [r3PlayingBox, setR3PlayingBox] = useState(null);

  // Audio for round 3
  const audioRef = useRef(null);
  const clipEndTimer = useRef(null);

  // Drag state
  const [dragSource, setDragSource] = useState(null); // { type: 'tile'|'slot', index }

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  // Refs
  const scoreRef = useRef(0);
  const r2ScoredQuestion = useRef(-1);
  const r2SelectedRef = useRef(null);
  const r2PlayStartRef = useRef(null);

  // Generate player name
  useEffect(() => {
    if (!userId) return;
    const assignPlayerName = async () => {
      const db = getDatabase();
      const color = getPlayerColor(userId);
      const emoji = getPlayerEmoji(userId);
      let name;
      if (sessionCode) {
        try {
          const snap = await get(ref(db, `sessions/${sessionCode}/studentsJoined`));
          const data = snap.val() || {};
          const existing = Object.entries(data)
            .filter(([id]) => id !== userId)
            .map(([, d]) => d.playerName)
            .filter(Boolean);
          name = generateUniquePlayerName(userId, existing);
        } catch { name = generateUniquePlayerName(userId, []); }
      } else {
        name = generateUniquePlayerName(userId, []);
      }
      setPlayerName(name);
      setPlayerColor(color);
      setPlayerEmoji(emoji);
      if (sessionCode) {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          playerName: name, playerColor: color, playerEmoji: emoji
        });
      }
    };
    assignPlayerName();
  }, [userId, sessionCode]);

  // Keep refs synced
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { r2SelectedRef.current = r2SelectedAnswer; }, [r2SelectedAnswer]);
  useEffect(() => { r2PlayStartRef.current = r2PlayStartTime; }, [r2PlayStartTime]);

  // Stop round 3 audio
  const stopR3Audio = useCallback(() => {
    if (clipEndTimer.current) { clearTimeout(clipEndTimer.current); clipEndTimer.current = null; }
    if (audioRef.current) audioRef.current.pause();
    setR3PlayingBox(null);
  }, []);

  useEffect(() => () => stopR3Audio(), [stopR3Audio]);

  // Play a round 3 box
  const playR3Box = useCallback((boxIndex) => {
    const box = r3Boxes[boxIndex];
    if (!box || !audioRef.current) return;
    stopR3Audio();

    audioRef.current.src = PIECE.audioPath;
    audioRef.current.currentTime = box.startTime;
    audioRef.current.play().catch(() => {});
    setR3PlayingBox(boxIndex);

    const dur = (box.endTime - box.startTime) * 1000;
    clipEndTimer.current = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      setR3PlayingBox(null);
    }, dur);
  }, [r3Boxes, stopR3Audio]);

  // Initialize round 1 tiles
  const initRound1 = useCallback(() => {
    setR1Tiles(shuffleArray(['A', 'A', 'A', 'A', 'B', 'C', 'D']));
    setR1Slots([null, null, null, null, null, null, null]);
    setR1Submitted(false);
    setR1Results(null);
  }, []);

  // Initialize round 3 boxes
  const initRound3 = useCallback(() => {
    const boxes = GUIDED_SECTIONS.map((s, idx) => ({
      id: idx,
      section: s.section,
      startTime: s.startTime,
      endTime: s.endTime,
      color: s.color,
      label: s.label
    }));
    setR3Boxes(shuffleArray(boxes));
    setR3Slots([null, null, null, null, null, null, null]);
    setR3Submitted(false);
    setR3Results(null);
  }, []);

  // Listen for game state
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const gameRef = ref(db, `sessions/${sessionCode}/rondoFormGame`);

    const unsubscribe = onValue(gameRef, (snap) => {
      const data = snap.val();
      if (!data) { setGamePhase('waiting'); return; }

      const prevPhase = gamePhase;
      setGamePhase(data.phase || 'waiting');
      setRoundPhase(data.roundPhase || 'waiting');

      if (data.roundStartTime) setRoundStartTime(data.roundStartTime);

      // Round 1 init
      if (data.phase === 'round1' && prevPhase !== 'round1') {
        initRound1();
      }

      // Round 2
      if (data.phase === 'round2') {
        if (data.r2CurrentQuestion !== undefined) {
          const prevQ = r2CurrentQuestion;
          setR2CurrentQuestion(data.r2CurrentQuestion);
          setR2TotalQuestions(data.r2TotalQuestions || 7);

          if (data.r2CurrentQuestion !== prevQ || (data.roundPhase === 'guessing' && roundPhase !== 'guessing')) {
            r2SelectedRef.current = null;
            setR2SelectedAnswer(null);
            setR2AnswerSubmitted(false);
            setR2WasCorrect(null);
            setR2EarnedPoints(0);
            setR2CorrectAnswer(null);
          }
        }
        if (data.roundPhase === 'guessing' && data.r2PlayStartTime) {
          r2PlayStartRef.current = data.r2PlayStartTime;
          setR2PlayStartTime(data.r2PlayStartTime);
        }
        if (data.roundPhase === 'revealed' && data.r2CorrectAnswer) {
          setR2CorrectAnswer(data.r2CorrectAnswer);
          const qNum = data.r2CurrentQuestion || 0;
          if (r2SelectedRef.current && r2ScoredQuestion.current !== qNum) {
            r2ScoredQuestion.current = qNum;
            const isCorrect = r2SelectedRef.current === data.r2CorrectAnswer;
            setR2WasCorrect(isCorrect);
            let points = 0;
            if (isCorrect) {
              points = SCORING.round2Correct;
              const answerTime = Date.now() - (r2PlayStartRef.current || Date.now());
              points += calculateRound2SpeedBonus(answerTime);
            }
            setR2EarnedPoints(points);
            const newScore = scoreRef.current + points;
            scoreRef.current = newScore;
            setScore(newScore);
            if (sessionCode && userId) {
              update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
                rondoGameScore: newScore
              });
            }
          }
        }
      }

      // Round 3 init
      if (data.phase === 'round3' && prevPhase !== 'round3') {
        initRound3();
      }

      // Restore score on finished
      if (data.phase === 'finished' && scoreRef.current === 0) {
        const uid = userId || localStorage.getItem('current-session-userId');
        if (uid) {
          get(ref(db, `sessions/${sessionCode}/studentsJoined/${uid}/rondoGameScore`))
            .then(s => { if (s.val() > 0) { scoreRef.current = s.val(); setScore(s.val()); } })
            .catch(() => {});
        }
      }

      // Round 1 reveal
      if (data.phase === 'round1' && data.roundPhase === 'revealed' && r1Submitted) {
        // Results already calculated locally
      }

      // Round 3 reveal
      if (data.phase === 'round3' && data.roundPhase === 'revealed' && r3Submitted) {
        // Results already calculated locally
      }
    });

    return () => unsubscribe();
  }, [sessionCode, userId, gamePhase, roundPhase, r2CurrentQuestion, initRound1, initRound3]);

  // Leaderboard
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);
    const unsubscribe = onValue(studentsRef, (snap) => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || 'Student',
        score: s.rondoGameScore || 0,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵'
      }));
      const sorted = [...list].sort((a, b) => b.score - a.score);
      setLeaderboard(sorted);
      const myIdx = sorted.findIndex(s => s.id === userId);
      if (myIdx !== -1) setMyRank(myIdx + 1);
    });
    return () => unsubscribe();
  }, [sessionCode, userId]);

  // ========================================
  // ROUND 1: Drag-and-drop + tap fallback
  // ========================================

  // HTML5 Drag — from available tile
  const onR1TileDragStart = (e, tileIndex) => {
    if (r1Submitted) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'tile', index: tileIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setDragSource({ type: 'tile', index: tileIndex });
  };

  // HTML5 Drag — from a filled slot
  const onR1SlotDragStart = (e, slotIndex) => {
    if (r1Submitted || r1Slots[slotIndex] === null) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'slot', index: slotIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setDragSource({ type: 'slot', index: slotIndex });
  };

  const onR1SlotDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onR1SlotDrop = (e, slotIndex) => {
    e.preventDefault();
    if (r1Submitted) return;
    let data;
    try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }

    if (data.source === 'tile') {
      const tile = r1Tiles[data.index];
      const newSlots = [...r1Slots];
      if (newSlots[slotIndex] !== null) {
        setR1Tiles(prev => [...prev.filter((_, i) => i !== data.index), newSlots[slotIndex]]);
      } else {
        setR1Tiles(prev => prev.filter((_, i) => i !== data.index));
      }
      newSlots[slotIndex] = tile;
      setR1Slots(newSlots);
    } else if (data.source === 'slot') {
      const newSlots = [...r1Slots];
      [newSlots[data.index], newSlots[slotIndex]] = [newSlots[slotIndex], newSlots[data.index]];
      setR1Slots(newSlots);
    }
    setDragSource(null);
  };

  // Drop tile back to tray (remove from slot)
  const onR1TrayDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onR1TrayDrop = (e) => {
    e.preventDefault();
    if (r1Submitted) return;
    let data;
    try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
    if (data.source === 'slot') {
      const tile = r1Slots[data.index];
      if (tile !== null) {
        const newSlots = [...r1Slots];
        newSlots[data.index] = null;
        setR1Slots(newSlots);
        setR1Tiles(prev => [...prev, tile]);
      }
    }
    setDragSource(null);
  };

  const onR1DragEnd = () => setDragSource(null);

  // Tap fallback (same as before)
  const handleTileTap = (tileIndex) => {
    if (r1Submitted) return;
    if (dragSource && dragSource.type === 'tile' && dragSource.index === tileIndex) {
      setDragSource(null);
      return;
    }
    if (dragSource && dragSource.type === 'slot') setDragSource(null);
    setDragSource({ type: 'tile', index: tileIndex });
  };

  const handleSlotTap = (slotIndex) => {
    if (r1Submitted) return;
    if (dragSource && dragSource.type === 'tile') {
      const tile = r1Tiles[dragSource.index];
      const newSlots = [...r1Slots];
      if (newSlots[slotIndex] !== null) {
        setR1Tiles(prev => [...prev, newSlots[slotIndex]]);
      }
      newSlots[slotIndex] = tile;
      setR1Slots(newSlots);
      setR1Tiles(prev => prev.filter((_, i) => i !== dragSource.index));
      setDragSource(null);
      return;
    }
    if (dragSource && dragSource.type === 'slot') {
      if (dragSource.index === slotIndex) { setDragSource(null); return; }
      const newSlots = [...r1Slots];
      [newSlots[dragSource.index], newSlots[slotIndex]] = [newSlots[slotIndex], newSlots[dragSource.index]];
      setR1Slots(newSlots);
      setDragSource(null);
      return;
    }
    if (r1Slots[slotIndex] !== null) {
      setDragSource({ type: 'slot', index: slotIndex });
    }
  };

  const removeFromSlot = (slotIndex) => {
    if (r1Submitted) return;
    const tile = r1Slots[slotIndex];
    if (tile === null) return;
    const newSlots = [...r1Slots];
    newSlots[slotIndex] = null;
    setR1Slots(newSlots);
    setR1Tiles(prev => [...prev, tile]);
    setDragSource(null);
  };

  const submitRound1 = () => {
    if (r1Slots.includes(null)) return;
    const correct = r1Slots.map((tile, idx) => tile === CORRECT_FORM[idx]);
    const correctCount = correct.filter(Boolean).length;
    const positionScore = correctCount * SCORING.round1PerPosition;
    const timeBonus = calculateRound1SpeedBonus(Date.now() - (roundStartTime || Date.now()));
    const totalR1 = positionScore + (correctCount === 7 ? timeBonus : 0);

    setR1Results({ correct, score: totalR1 });
    setR1Submitted(true);

    const newScore = scoreRef.current + totalR1;
    scoreRef.current = newScore;
    setScore(newScore);

    if (sessionCode && userId) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        rondoR1Answer: r1Slots,
        rondoR1Submitted: true,
        rondoR1Score: totalR1,
        rondoGameScore: newScore
      });
    }
  };

  // ========================================
  // ROUND 2: Answer submission
  // ========================================
  const submitR2Answer = (label) => {
    if (r2AnswerSubmitted || roundPhase !== 'guessing') return;
    r2SelectedRef.current = label;
    setR2SelectedAnswer(label);
    setR2AnswerSubmitted(true);

    if (sessionCode && userId) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        rondoR2Answer: label,
        rondoR2AnswerTime: Date.now()
      });
    }
  };

  // ========================================
  // ROUND 3: Drag-and-drop + tap fallback
  // ========================================
  const [r3DragSource, setR3DragSource] = useState(null);

  // HTML5 Drag — from mystery box tray
  const onR3BoxDragStart = (e, boxIndex) => {
    if (r3Submitted) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'box', index: boxIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setR3DragSource({ type: 'box', index: boxIndex });
  };

  // HTML5 Drag — from a filled slot
  const onR3SlotDragStart = (e, slotIndex) => {
    if (r3Submitted || r3Slots[slotIndex] === null) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'slot', index: slotIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setR3DragSource({ type: 'slot', index: slotIndex });
  };

  const onR3SlotDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onR3SlotDrop = (e, slotIndex) => {
    e.preventDefault();
    if (r3Submitted) return;
    let data;
    try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }

    if (data.source === 'box') {
      const box = r3Boxes[data.index];
      const newSlots = [...r3Slots];
      if (newSlots[slotIndex] !== null) {
        setR3Boxes(prev => [...prev.filter((_, i) => i !== data.index), newSlots[slotIndex]]);
      } else {
        setR3Boxes(prev => prev.filter((_, i) => i !== data.index));
      }
      newSlots[slotIndex] = box;
      setR3Slots(newSlots);
    } else if (data.source === 'slot') {
      const newSlots = [...r3Slots];
      [newSlots[data.index], newSlots[slotIndex]] = [newSlots[slotIndex], newSlots[data.index]];
      setR3Slots(newSlots);
    }
    setR3DragSource(null);
  };

  // Drop box back to tray
  const onR3TrayDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onR3TrayDrop = (e) => {
    e.preventDefault();
    if (r3Submitted) return;
    let data;
    try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
    if (data.source === 'slot') {
      const box = r3Slots[data.index];
      if (box) {
        const newSlots = [...r3Slots];
        newSlots[data.index] = null;
        setR3Slots(newSlots);
        setR3Boxes(prev => [...prev, box]);
      }
    }
    setR3DragSource(null);
  };

  const onR3DragEnd = () => setR3DragSource(null);

  // Tap fallback
  const handleR3BoxTap = (boxIndex) => {
    if (r3Submitted) return;
    if (r3DragSource && r3DragSource.type === 'box' && r3DragSource.index === boxIndex) {
      setR3DragSource(null);
      return;
    }
    setR3DragSource({ type: 'box', index: boxIndex });
  };

  const handleR3SlotTap = (slotIndex) => {
    if (r3Submitted) return;
    if (r3DragSource && r3DragSource.type === 'box') {
      const box = r3Boxes[r3DragSource.index];
      const newSlots = [...r3Slots];
      if (newSlots[slotIndex] !== null) {
        setR3Boxes(prev => [...prev, newSlots[slotIndex]]);
      }
      newSlots[slotIndex] = box;
      setR3Slots(newSlots);
      setR3Boxes(prev => prev.filter((_, i) => i !== r3DragSource.index));
      setR3DragSource(null);
      return;
    }
    if (r3DragSource && r3DragSource.type === 'slot') {
      if (r3DragSource.index === slotIndex) { setR3DragSource(null); return; }
      const newSlots = [...r3Slots];
      [newSlots[r3DragSource.index], newSlots[slotIndex]] = [newSlots[slotIndex], newSlots[r3DragSource.index]];
      setR3Slots(newSlots);
      setR3DragSource(null);
      return;
    }
    if (r3Slots[slotIndex] !== null) {
      setR3DragSource({ type: 'slot', index: slotIndex });
    }
  };

  const removeR3FromSlot = (slotIndex) => {
    if (r3Submitted) return;
    const box = r3Slots[slotIndex];
    if (!box) return;
    const newSlots = [...r3Slots];
    newSlots[slotIndex] = null;
    setR3Slots(newSlots);
    setR3Boxes(prev => [...prev, box]);
    setR3DragSource(null);
  };

  const submitRound3 = () => {
    if (r3Slots.includes(null)) return;
    stopR3Audio();
    const correct = r3Slots.map((box, idx) => box.section === CORRECT_FORM[idx]);
    const correctCount = correct.filter(Boolean).length;
    const positionScore = correctCount * SCORING.round3PerPosition;
    const timeBonus = calculateRound3SpeedBonus(Date.now() - (roundStartTime || Date.now()));
    const totalR3 = positionScore + (correctCount === 7 ? timeBonus : 0);

    setR3Results({ correct, score: totalR3 });
    setR3Submitted(true);

    const newScore = scoreRef.current + totalR3;
    scoreRef.current = newScore;
    setScore(newScore);

    if (sessionCode && userId) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        rondoR3Answer: r3Slots.map(b => b.section),
        rondoR3Submitted: true,
        rondoR3Score: totalR3,
        rondoGameScore: newScore
      });
    }
  };

  // Helper: section color
  const getSectionColor = (letter) => SECTION_OPTIONS.find(s => s.label === letter)?.color || '#6B7280';

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // ========================================
  // RENDER: FINISHED
  // ========================================
  if (gamePhase === 'finished') {
    const myEntry = leaderboard.find(s => s.id === userId);
    const displayScore = score > 0 ? score : (myEntry?.score ?? score);

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 overflow-auto">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🏆</div>
          <div className="inline-flex flex-col items-center px-8 py-4 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: playerColor }}>
            <span className="text-4xl mb-1">{playerEmoji}</span>
            <span className="text-2xl font-bold text-white">{playerName}</span>
            {myRank && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-3xl">{getRankEmoji(myRank)}</span>
                {myRank <= 3 && <span className="text-xl font-bold text-white">{myRank === 1 ? '1st Place!' : myRank === 2 ? '2nd Place!' : '3rd Place!'}</span>}
              </div>
            )}
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
                <div key={student.id} className={`flex items-center gap-2 px-2 py-1 rounded ${student.id === userId ? 'bg-purple-500/50 ring-2 ring-purple-300' : ''}`}>
                  <span className="w-6 text-center font-bold text-sm text-white">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</span>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: student.playerColor }}>{student.playerEmoji}</div>
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

  // ========================================
  // RENDER: WAITING / GUIDED LISTENING
  // ========================================
  if (gamePhase === 'waiting' || gamePhase === 'setup' || gamePhase === 'guided-listening') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🎵 Rondo Form Game</h1>
          <p className="text-xl text-purple-200 mb-8">
            {gamePhase === 'guided-listening' ? 'Watch the main screen...' : 'Waiting for teacher to start...'}
          </p>
          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER: ROUND 1 - Arrange the Form
  // ========================================
  if (gamePhase === 'round1') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col p-3 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: playerColor }}>{playerEmoji}</div>
            <div className="text-sm font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-xl">
            <span className="text-lg font-bold text-yellow-300">{score}</span>
            <span className="text-xs text-purple-200 ml-1">pts</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-1">Round 1: Arrange the Form</h2>
        <p className="text-sm text-purple-200 text-center mb-3">Put the sections in the correct rondo order — as fast as you can!</p>

        {/* 7 Slots — drop targets */}
        <div className="flex gap-1.5 justify-center mb-3 flex-shrink-0">
          {r1Slots.map((tile, idx) => {
            const isSelected = dragSource?.type === 'slot' && dragSource.index === idx;
            const isCorrect = r1Results?.correct[idx];
            const isRevealed = roundPhase === 'revealed';
            return (
              <div
                key={idx}
                draggable={!r1Submitted && tile !== null}
                onDragStart={(e) => onR1SlotDragStart(e, idx)}
                onDragOver={onR1SlotDragOver}
                onDrop={(e) => onR1SlotDrop(e, idx)}
                onDragEnd={onR1DragEnd}
                onClick={() => tile ? (isSelected ? removeFromSlot(idx) : handleSlotTap(idx)) : handleSlotTap(idx)}
                className={`w-11 h-14 rounded-lg flex flex-col items-center justify-center font-black text-white cursor-pointer transition-all border-2 ${
                  isSelected ? 'border-white scale-110' :
                  isRevealed && isCorrect ? 'border-green-400' :
                  isRevealed && !isCorrect && tile ? 'border-red-400' :
                  'border-white/20'
                }`}
                style={{
                  backgroundColor: tile ? getSectionColor(tile) : 'rgba(255,255,255,0.05)',
                  minWidth: '44px'
                }}
              >
                {tile ? (
                  <span className="text-xl">{tile}</span>
                ) : (
                  <span className="text-lg text-white/20">{idx + 1}</span>
                )}
                {isRevealed && (
                  <span className="text-xs">{isCorrect ? '✓' : tile ? '✗' : ''}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Available tiles — draggable + drop zone to return tiles */}
        {!r1Submitted && (
          <div
            className="flex gap-2 justify-center mb-3 flex-wrap min-h-[56px] rounded-xl p-2"
            onDragOver={onR1TrayDragOver}
            onDrop={onR1TrayDrop}
          >
            {r1Tiles.map((tile, idx) => {
              const isSelected = dragSource?.type === 'tile' && dragSource.index === idx;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => onR1TileDragStart(e, idx)}
                  onDragEnd={onR1DragEnd}
                  onClick={() => handleTileTap(idx)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white transition-all cursor-grab active:cursor-grabbing select-none ${
                    isSelected ? 'ring-3 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: getSectionColor(tile) }}
                >
                  {tile}
                </div>
              );
            })}
            {r1Tiles.length === 0 && (
              <div className="text-purple-400 text-sm py-2">Drag tiles here to remove from slots</div>
            )}
          </div>
        )}

        {/* Submit button */}
        {!r1Submitted && !r1Slots.includes(null) && (
          <button
            onClick={submitRound1}
            className="mx-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-xl font-bold text-white hover:scale-105 transition-all"
          >
            Submit!
          </button>
        )}

        {/* Results — show comparison */}
        {r1Submitted && r1Results && (
          <div className="text-center mt-2">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-lg font-bold text-white mb-2">
                {r1Results.correct.filter(Boolean).length} / 7 correct
              </p>

              {/* Your answer vs correct */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-purple-300 w-12 text-right">Yours:</span>
                  {r1Slots.map((tile, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-black text-white border ${
                        r1Results.correct[idx] ? 'border-green-400' : 'border-red-400'
                      }`}
                      style={{ backgroundColor: tile ? getSectionColor(tile) : '#374151' }}
                    >
                      {tile || '?'}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-purple-300 w-12 text-right">Answer:</span>
                  {CORRECT_FORM.map((letter, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded flex items-center justify-center text-sm font-black text-white"
                      style={{ backgroundColor: getSectionColor(letter) }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-2xl font-black text-yellow-300">+{r1Results.score} points</p>
            </div>
            <p className="text-sm text-purple-200 mt-2">
              {roundPhase === 'revealed' ? 'Waiting for Round 2...' : 'Waiting for teacher to reveal...'}
            </p>
          </div>
        )}

        {!r1Submitted && r1Slots.includes(null) && (
          <p className="text-center text-purple-300 text-sm mt-2">Place all 7 tiles to submit</p>
        )}
      </div>
    );
  }

  // ========================================
  // RENDER: ROUND 2 - Name That Section
  // ========================================
  if (gamePhase === 'round2') {
    const correctSection = r2CorrectAnswer ? SECTION_OPTIONS.find(s => s.label === r2CorrectAnswer) : null;

    if (roundPhase === 'round-complete') {
      return (
        <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">Round 2 Complete!</h2>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-3 inline-block mb-4">
              <div className="text-3xl font-bold text-gray-900">{score}</div>
              <div className="text-sm text-gray-800">Total Score</div>
            </div>
            <p className="text-purple-200">Waiting for Round 3...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: playerColor }}>{playerEmoji}</div>
            <div>
              <div className="text-sm font-bold" style={{ color: playerColor }}>{playerName}</div>
              <div className="text-xs text-purple-200">Section {r2CurrentQuestion + 1}/{r2TotalQuestions}</div>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-xl">
            <span className="text-lg font-bold text-yellow-300">{score}</span>
            <span className="text-xs text-purple-200 ml-1">pts</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-white mb-3 text-center">Which section is this?</h2>

          {/* Guessing */}
          {roundPhase === 'guessing' && !r2AnswerSubmitted && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-indigo-500">
                <span className="text-3xl">🎵</span>
              </div>
              <p className="text-purple-200 text-sm mb-3">Tap your answer:</p>
              <div className="grid grid-cols-4 gap-3 w-full max-w-lg">
                {SECTION_OPTIONS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => submitR2Answer(s.label)}
                    className="py-5 px-3 rounded-2xl text-center transition-all hover:scale-105 active:scale-95 text-white"
                    style={{ backgroundColor: s.color, minHeight: '100px' }}
                  >
                    <div className="text-4xl font-black mb-1">{s.label}</div>
                    <div className="text-xs font-bold opacity-90">{s.description}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Submitted */}
          {roundPhase === 'guessing' && r2AnswerSubmitted && (
            <div className="text-center">
              <div className="bg-white/20 rounded-2xl p-6 inline-block">
                <Check size={40} className="mx-auto text-green-400 mb-3" />
                <p className="text-lg text-white font-bold mb-2">Answer Submitted!</p>
                <div className="inline-block px-6 py-2 rounded-full text-white font-bold text-2xl" style={{ backgroundColor: getSectionColor(r2SelectedAnswer) }}>
                  Section {r2SelectedAnswer}
                </div>
                <p className="text-sm text-purple-300 mt-3">Waiting for teacher to reveal...</p>
              </div>
            </div>
          )}

          {/* Revealed */}
          {roundPhase === 'revealed' && correctSection && (
            <div className="text-center w-full max-w-md">
              {r2WasCorrect ? (
                <div className="bg-green-500/30 rounded-2xl p-4 mb-3">
                  <p className="text-2xl font-bold text-green-400 mb-1">Correct!</p>
                  <p className="text-lg text-white">+{r2EarnedPoints} points</p>
                </div>
              ) : r2WasCorrect === false ? (
                <div className="bg-red-500/30 rounded-2xl p-4 mb-3">
                  <p className="text-2xl font-bold text-red-400">Not quite!</p>
                </div>
              ) : (
                <div className="bg-gray-500/30 rounded-2xl p-4 mb-3">
                  <p className="text-xl font-bold text-gray-300">No answer</p>
                </div>
              )}
              <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: correctSection.color }}>
                <div className="text-5xl font-black mb-1">{correctSection.label}</div>
                <div className="text-xl font-bold">{correctSection.description}</div>
              </div>
              <p className="text-purple-200 mt-3 text-sm">Waiting for next section...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER: ROUND 3 - Full Puzzle
  // ========================================
  if (gamePhase === 'round3') {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex flex-col p-3 overflow-auto">
        <audio ref={audioRef} preload="auto" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: playerColor }}>{playerEmoji}</div>
            <div className="text-sm font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-xl">
            <span className="text-lg font-bold text-yellow-300">{score}</span>
            <span className="text-xs text-purple-200 ml-1">pts</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white text-center mb-1">Round 3: Full Puzzle</h2>
        <p className="text-xs text-purple-200 text-center mb-2">Listen to each box, then drag them into the correct order!</p>

        {/* 7 Slots — drop targets */}
        <div className="flex gap-1.5 justify-center mb-2 flex-shrink-0">
          {r3Slots.map((box, idx) => {
            const isSelected = r3DragSource?.type === 'slot' && r3DragSource.index === idx;
            const isCorrect = r3Results?.correct[idx];
            const isRevealed = roundPhase === 'revealed';
            return (
              <div
                key={idx}
                draggable={!r3Submitted && box !== null}
                onDragStart={(e) => onR3SlotDragStart(e, idx)}
                onDragOver={onR3SlotDragOver}
                onDrop={(e) => onR3SlotDrop(e, idx)}
                onDragEnd={onR3DragEnd}
                onClick={() => box ? (isSelected ? removeR3FromSlot(idx) : handleR3SlotTap(idx)) : handleR3SlotTap(idx)}
                className={`w-11 h-14 rounded-lg flex flex-col items-center justify-center font-black text-white cursor-pointer transition-all border-2 ${
                  isSelected ? 'border-white scale-110' :
                  isRevealed && isCorrect ? 'border-green-400' :
                  isRevealed && !isCorrect && box ? 'border-red-400' :
                  'border-white/20'
                }`}
                style={{
                  backgroundColor: box ? (box.color + 'CC') : 'rgba(255,255,255,0.05)',
                  minWidth: '44px'
                }}
              >
                {box ? (
                  <span className="text-lg">📦</span>
                ) : (
                  <span className="text-lg text-white/20">{idx + 1}</span>
                )}
                {isRevealed && box && (
                  <span className="text-xs">{isCorrect ? '✓' : '✗'}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mystery boxes — draggable + drop zone to return */}
        {!r3Submitted && (
          <div
            className="flex flex-wrap gap-2 justify-center mb-3 min-h-[70px] rounded-xl p-2"
            onDragOver={onR3TrayDragOver}
            onDrop={onR3TrayDrop}
          >
            {r3Boxes.map((box, idx) => {
              const isSelected = r3DragSource?.type === 'box' && r3DragSource.index === idx;
              const isPlayingThis = r3PlayingBox === idx;
              return (
                <div key={box.id} className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); playR3Box(idx); }}
                    className={`w-12 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                      isPlayingThis ? 'bg-purple-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <Volume2 size={14} />
                  </button>
                  <div
                    draggable
                    onDragStart={(e) => onR3BoxDragStart(e, idx)}
                    onDragEnd={onR3DragEnd}
                    onClick={() => handleR3BoxTap(idx)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border-2 cursor-grab active:cursor-grabbing select-none ${
                      isSelected ? 'border-white scale-110 bg-purple-600' : 'border-white/20 bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    📦
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit */}
        {!r3Submitted && !r3Slots.includes(null) && (
          <button
            onClick={submitRound3}
            className="mx-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-xl font-bold text-white hover:scale-105 transition-all"
          >
            Submit!
          </button>
        )}

        {/* Results */}
        {r3Submitted && r3Results && (
          <div className="text-center mt-2">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-lg font-bold text-white mb-2">
                {r3Results.correct.filter(Boolean).length} / 7 correct
              </p>

              {/* Your answer vs correct */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-purple-300 w-12 text-right">Yours:</span>
                  {r3Slots.map((box, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-black text-white border ${
                        r3Results.correct[idx] ? 'border-green-400' : 'border-red-400'
                      }`}
                      style={{ backgroundColor: box ? getSectionColor(box.section) : '#374151' }}
                    >
                      {box ? box.section : '?'}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs text-purple-300 w-12 text-right">Answer:</span>
                  {CORRECT_FORM.map((letter, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded flex items-center justify-center text-sm font-black text-white"
                      style={{ backgroundColor: getSectionColor(letter) }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-2xl font-black text-yellow-300">+{r3Results.score} points</p>
            </div>
            <p className="text-sm text-purple-200 mt-2">
              {roundPhase === 'revealed' ? 'Game complete!' : 'Waiting for teacher to reveal...'}
            </p>
          </div>
        )}

        {!r3Submitted && r3Slots.includes(null) && (
          <p className="text-center text-purple-300 text-xs mt-1">Place all 7 boxes to submit</p>
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading...</p>
    </div>
  );
};

export default RondoFormGameStudent;
