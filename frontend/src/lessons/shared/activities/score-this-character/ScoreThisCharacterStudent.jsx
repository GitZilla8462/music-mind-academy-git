// ScoreThisCharacterStudent.jsx
// Score This Character — Student View
// Whole-class game: create characters, compose motifs to match a featured character, vote on best match.
// Follows GenreMatchStudentView.jsx Firebase pattern.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Check, Trophy, Award, Medal, Music, Circle, Square, Play, Pencil, Eraser, Trash2, RotateCcw } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { getPlayerColor, getPlayerEmoji, getStudentDisplayName, formatFirstNameLastInitial } from '../layer-detective/nameGenerator';
import * as Tone from 'tone';
import VirtualInstrumentOverlay from '../../../film-music/shared/virtual-instrument/VirtualInstrumentOverlay';
import { INSTRUMENTS } from '../../../film-music/shared/virtual-instrument/instrumentConfig';
import getStroke from 'perfect-freehand';
import DirectionsModal from '../../components/DirectionsModal';

// ============================================================
// CHARACTER TYPES (same as SceneComposer SpottingGuide)
// ============================================================
const CHARACTER_TYPES = [
  { id: 'hero', label: 'Hero', emoji: '🦸', color: '#3B82F6' },
  { id: 'villain', label: 'Villain', emoji: '🦹', color: '#EF4444' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', color: '#EC4899' },
  { id: 'sneaky', label: 'Sneaky', emoji: '🕵️', color: '#F59E0B' },
  { id: 'other', label: 'Other', emoji: '✏️', color: '#8B5CF6' },
];

const ALL_VOTE_OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const VOTE_COLORS = { A: '#3B82F6', B: '#8B5CF6', C: '#F59E0B', D: '#10B981', E: '#EF4444' };

// ============================================================
// MINI DRAWING CANVAS (simplified from SceneComposer)
// ============================================================
const DRAW_COLORS = [
  '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
];

const CANVAS_BG = '#1F2937';

const renderFreehandStroke = (ctx, points, color, size) => {
  const stroke = getStroke(points, { size: size * 2, thinning: 0.5, smoothing: 0.5, streamline: 0.5 });
  if (stroke.length < 2) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(stroke[0][0], stroke[0][1]);
  for (let i = 1; i < stroke.length; i++) {
    const [x, y] = stroke[i];
    const [px, py] = stroke[i - 1];
    ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
  }
  ctx.closePath();
  ctx.fill();
};

const MiniCanvas = ({ onDrawingChange, width = 280, height = 180 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(4);
  const [drawColor, setDrawColor] = useState('#FFFFFF');
  const strokePointsRef = useRef([]);
  const undoStackRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [];
  }, []);

  const pushUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(data);
    if (undoStackRef.current.length > 15) undoStackRef.current.shift();
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const emitDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas && onDrawingChange) onDrawingChange(canvas.toDataURL('image/png', 0.6));
  };

  const startDraw = (e) => {
    e.preventDefault();
    pushUndo();
    setIsDrawing(true);
    strokePointsRef.current = [[getPos(e).x, getPos(e).y, 0.5]];
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pos = getPos(e);
    if (tool === 'eraser') {
      const last = strokePointsRef.current[strokePointsRef.current.length - 1];
      ctx.beginPath();
      ctx.moveTo(last[0], last[1]);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = CANVAS_BG;
      ctx.lineWidth = brushSize * 4;
      ctx.lineCap = 'round';
      ctx.stroke();
      strokePointsRef.current.push([pos.x, pos.y, 0.5]);
    } else {
      strokePointsRef.current.push([pos.x, pos.y, 0.5]);
      if (undoStackRef.current.length > 0) {
        ctx.putImageData(undoStackRef.current[undoStackRef.current.length - 1], 0, 0);
      }
      renderFreehandStroke(ctx, strokePointsRef.current, drawColor, brushSize);
    }
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (tool === 'pen' && strokePointsRef.current.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (undoStackRef.current.length > 0) {
        ctx.putImageData(undoStackRef.current[undoStackRef.current.length - 1], 0, 0);
      }
      renderFreehandStroke(ctx, strokePointsRef.current, drawColor, brushSize);
    }
    strokePointsRef.current = [];
    emitDrawing();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length === 0) return;
    canvas.getContext('2d', { willReadFrequently: true }).putImageData(undoStackRef.current.pop(), 0, 0);
    emitDrawing();
  };

  const clearCanvas = () => {
    pushUndo();
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    emitDrawing();
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Tools */}
      <div className="flex items-center gap-1">
        <button onClick={() => setTool('pen')}
          className={`p-1 rounded ${tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
          <Pencil size={12} />
        </button>
        <button onClick={() => setTool('eraser')}
          className={`p-1 rounded ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
          <Eraser size={12} />
        </button>
        <button onClick={undo} className="p-1 rounded bg-gray-700 text-gray-400 hover:text-white">
          <RotateCcw size={12} />
        </button>
        <button onClick={clearCanvas} className="p-1 rounded bg-gray-700 text-gray-400 hover:text-white">
          <Trash2 size={12} />
        </button>
        <div className="w-px h-4 bg-gray-700 mx-0.5" />
        {DRAW_COLORS.map(c => (
          <button key={c} onClick={() => { setDrawColor(c); if (tool === 'eraser') setTool('pen'); }}
            className={`w-3.5 h-3.5 rounded-full border ${drawColor === c && tool !== 'eraser' ? 'border-white scale-110' : 'border-gray-600'}`}
            style={{ backgroundColor: c }} />
        ))}
      </div>
      {/* Canvas */}
      <canvas ref={canvasRef} width={width} height={height}
        className="rounded-lg w-full"
        style={{ touchAction: 'none', cursor: tool === 'eraser' ? 'cell' : 'crosshair', maxHeight: height }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
    </div>
  );
};

// ============================================================
// COUNTDOWN TIMER
// ============================================================
const CountdownTimer = ({ phaseStartTime, durationSec }) => {
  const [remaining, setRemaining] = useState(durationSec);

  useEffect(() => {
    if (!phaseStartTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - phaseStartTime) / 1000;
      setRemaining(Math.max(0, Math.ceil(durationSec - elapsed)));
    }, 200);
    return () => clearInterval(interval);
  }, [phaseStartTime, durationSec]);

  const isLow = remaining <= 10;
  return (
    <div className={`text-center text-3xl font-black tabular-nums ${isLow ? 'text-red-400 animate-pulse' : 'text-white'}`}>
      {remaining}s
    </div>
  );
};

// ============================================================
// MAIN STUDENT COMPONENT
// ============================================================
const ScoreThisCharacterStudent = ({ onComplete, isSessionMode = true }) => {
  const { sessionCode, classId, userId: contextUserId } = useSession();
  const userId = contextUserId || localStorage.getItem('current-session-userId');

  const gamePath = useMemo(() => {
    if (classId) return `classes/${classId}/currentSession/scoreThisCharacter`;
    if (sessionCode) return `sessions/${sessionCode}/scoreThisCharacter`;
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

  // Game state (synced from teacher)
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [featuredCharacter, setFeaturedCharacter] = useState(null);
  const [phaseStartTime, setPhaseStartTime] = useState(null);

  // Student state
  const [characterSubmitted, setCharacterSubmitted] = useState(false);
  const [motifSubmitted, setMotifSubmitted] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  // Score
  const [myScore, setMyScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [wasInMajority, setWasInMajority] = useState(null);
  const [motifWon, setMotifWon] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Character form state
  const [charName, setCharName] = useState('');
  const [charType, setCharType] = useState('hero');
  const [charDescription, setCharDescription] = useState('');
  const [drawingDataUrl, setDrawingDataUrl] = useState('');

  // Candidates (from Firebase, to know vote options)
  const [voteOptions, setVoteOptions] = useState(['A', 'B', 'C', 'D', 'E']);

  // Motif recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [recordedInstrument, setRecordedInstrument] = useState('piano');

  // Refs
  const currentRoundRef = useRef(0);
  const myScoreRef = useRef(0);
  const selectedVoteRef = useRef(null);

  // Directions modal
  const [showDirections, setShowDirections] = useState(true);

  // Playback
  const playbackSynthRef = useRef(null);
  const playbackTimeoutsRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);

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
          displayName: name, playerColor: color, playerEmoji: emoji
        });
      }
    };
    assignPlayerName();
  }, [userId, studentsPath]);

  // Keep refs in sync
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { myScoreRef.current = myScore; }, [myScore]);
  useEffect(() => { selectedVoteRef.current = selectedVote; }, [selectedVote]);

  // Listen for game state
  useEffect(() => {
    if (!gamePath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, gamePath), (snapshot) => {
      const data = snapshot.val();
      if (!data) { setGamePhase('waiting'); return; }

      const prevPhase = gamePhase;
      setGamePhase(data.phase || 'waiting');
      setTotalRounds(data.totalRounds || 3);
      setPhaseStartTime(data.phaseStartTime || null);

      if (data.featuredCharacter) setFeaturedCharacter(data.featuredCharacter);

      // Read candidates to know vote options
      if (data.candidates && Array.isArray(data.candidates)) {
        setVoteOptions(data.candidates.map(c => c.label));
      }

      // New round — reset student state
      if (data.phase === 'submit' && data.currentRound !== currentRoundRef.current) {
        setCharacterSubmitted(false);
        setMotifSubmitted(false);
        setSelectedVote(null);
        setVoteSubmitted(false);
        setWasInMajority(null);
        setMotifWon(null);
        setPointsEarned(0);
        setRecordedNotes([]);
        setCharName('');
        setCharType('hero');
        setCharDescription('');
        setDrawingDataUrl('');
      }

      // Composing phase — reset motif state
      if (data.phase === 'composing') {
        setMotifSubmitted(false);
        setRecordedNotes([]);
      }

      // Voting phase — reset vote
      if (data.phase === 'voting') {
        setSelectedVote(null);
        selectedVoteRef.current = null;
        setVoteSubmitted(false);
      }

      // Revealed — check majority
      if (data.phase === 'revealed' && data.majorityLabel) {
        const voted = selectedVoteRef.current;
        setWasInMajority(voted === data.majorityLabel);
        setMotifWon(data.winnerStudentId === userId);
      }

      setCurrentRound(data.currentRound || 0);
    });
    return () => unsubscribe();
  }, [gamePath, userId]);

  // Listen for own score updates
  useEffect(() => {
    if (!studentsPath || !userId) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, `${studentsPath}/${userId}`), (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const newScore = data.stcScore || 0;
      if (newScore > myScoreRef.current) {
        setPointsEarned(newScore - myScoreRef.current);
      }
      setMyScore(newScore);
    });
    return () => unsubscribe();
  }, [studentsPath, userId]);

  // Build leaderboard on finish
  useEffect(() => {
    if (gamePhase !== 'finished' || !studentsPath) return;
    const db = getDatabase();
    const unsubscribe = onValue(ref(db, studentsPath), (snapshot) => {
      const data = snapshot.val() || {};
      const board = Object.entries(data)
        .filter(([, s]) => s.displayName || s.playerName || s.name)
        .map(([id, s]) => ({
          id,
          name: formatFirstNameLastInitial(s.displayName || s.playerName || s.name),
          score: s.stcScore || 0,
          isMe: id === userId,
        }))
        .sort((a, b) => b.score - a.score);
      setLeaderboard(board);
    });
    return () => unsubscribe();
  }, [gamePhase, studentsPath, userId]);

  // Cleanup playback on unmount
  useEffect(() => {
    return () => {
      playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
      if (playbackSynthRef.current) { try { playbackSynthRef.current.dispose(); } catch(e) {} }
    };
  }, []);

  // ── Submit character ──
  const submitCharacter = () => {
    if (!charName.trim() || characterSubmitted) return;
    const data = { name: charName.trim(), type: charType, description: charDescription.trim(), drawingDataUrl };
    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        stcCharacter: JSON.stringify(data),
      });
    }
    setCharacterSubmitted(true);
  };

  // ── Recording callbacks ──
  const handleRecordStart = useCallback(async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    setRecordingStartTime(Tone.now());
    setRecordedNotes([]);
    setIsRecording(true);
  }, []);

  const handleRecordStop = useCallback(() => {
    setIsRecording(false);
    setRecordingStartTime(null);
  }, []);

  const handleRecordingComplete = useCallback((notes, instrument) => {
    setRecordedNotes(notes);
    setRecordedInstrument(instrument);
  }, []);

  // ── Submit motif ──
  const submitMotif = () => {
    if (recordedNotes.length === 0 || motifSubmitted) return;
    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        stcMotif: JSON.stringify({ notes: recordedNotes, instrument: recordedInstrument }),
      });
    }
    setMotifSubmitted(true);
  };

  // ── Playback motif ──
  const playMotif = useCallback(async () => {
    if (recordedNotes.length === 0 || isPlaying) return;
    if (Tone.context.state !== 'running') await Tone.start();
    setIsPlaying(true);
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
    playbackTimeoutsRef.current = [];
    if (playbackSynthRef.current) { try { playbackSynthRef.current.dispose(); } catch(e) {} }

    const instConfig = INSTRUMENTS[recordedInstrument] || INSTRUMENTS.piano;
    const synth = new Tone.PolySynth(Tone.Synth, instConfig.config).toDestination();
    playbackSynthRef.current = synth;

    const filtered = recordedNotes.filter(n => !n.note?.startsWith('drum-'));
    filtered.forEach(nd => {
      const t = setTimeout(() => {
        try { synth.triggerAttackRelease(nd.note, nd.duration); } catch(e) {}
      }, nd.timestamp * 1000);
      playbackTimeoutsRef.current.push(t);
    });

    const maxEnd = filtered.reduce((max, n) => Math.max(max, (n.timestamp + n.duration) * 1000), 0);
    const endTimeout = setTimeout(() => { setIsPlaying(false); }, maxEnd + 200);
    playbackTimeoutsRef.current.push(endTimeout);
  }, [recordedNotes, recordedInstrument, isPlaying]);

  const stopPlayback = useCallback(() => {
    playbackTimeoutsRef.current.forEach(t => clearTimeout(t));
    playbackTimeoutsRef.current = [];
    if (playbackSynthRef.current) { try { playbackSynthRef.current.releaseAll(); } catch(e) {} }
    setIsPlaying(false);
  }, []);

  // ── Submit vote ──
  const submitVote = (label) => {
    if (voteSubmitted || gamePhase !== 'voting') return;
    selectedVoteRef.current = label;
    setSelectedVote(label);
    setVoteSubmitted(true);
    if (studentsPath && userId) {
      const db = getDatabase();
      update(ref(db, `${studentsPath}/${userId}`), {
        stcVote: label,
        stcVoteTime: Date.now(),
      });
    }
  };

  // ════════════════════════════════════════
  // RENDER PHASES
  // ════════════════════════════════════════

  // ── FINISHED ──
  if (gamePhase === 'finished') {
    const myRank = leaderboard.findIndex(e => e.isMe) + 1;
    return (
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="text-center mb-4">
          <div className="text-7xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold text-white mb-1">Game Complete!</h1>
          <p className="text-lg text-white/70">
            Your Score: <span className="font-black text-2xl text-yellow-400">{myScore}</span>
          </p>
          {myRank > 0 && (
            <p className="text-sm text-white/50">Rank: #{myRank} of {leaderboard.length}</p>
          )}
        </div>
        <div className="w-full max-w-sm">
          {leaderboard.slice(0, 5).map((entry, idx) => {
            const rankIcon = idx === 0 ? <Trophy size={18} className="text-yellow-400" /> :
                             idx === 1 ? <Award size={18} className="text-gray-300" /> :
                             idx === 2 ? <Medal size={18} className="text-amber-600" /> : null;
            return (
              <div key={entry.id}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl mb-1 ${entry.isMe ? 'bg-yellow-500/20 ring-2 ring-yellow-400' : 'bg-white/5'}`}>
                <div className="w-6 text-center">
                  {rankIcon || <span className="text-sm font-bold text-white/50">{idx + 1}</span>}
                </div>
                <div className="flex-1 text-sm font-bold text-white truncate">{entry.name} {entry.isMe ? '(you)' : ''}</div>
                <div className="text-lg font-black text-yellow-400">{entry.score}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── WAITING / SETUP ──
  if (gamePhase === 'waiting' || gamePhase === 'setup') {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-3xl font-bold text-white mb-2">Score This Character</h1>
          <p className="text-lg text-gray-400 mb-6">Get Ready!</p>
          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <span className="text-4xl mb-2 block">{playerEmoji}</span>
            <div className="text-2xl font-bold" style={{ color: playerColor }}>{playerName}</div>
          </div>
        </div>
        <DirectionsModal
          title="Score This Character"
          isOpen={showDirections}
          pages={[
            {
              title: 'How It Works',
              items: [
                'Everyone creates a character — draw it, name it, describe it in 3 words',
                'Teacher picks one character to feature on the board',
                'Everyone composes a short motif that matches that character',
                'Teacher picks motifs to share — the class listens to each one',
                'Vote for the motif that fits the character best!'
              ]
            },
            {
              title: 'Scoring',
              items: [
                'Vote with the majority → +1 point',
                'Your motif wins the vote → +2 bonus points',
                'Multiple rounds — everyone gets a chance to be featured!'
              ]
            }
          ]}
          onClose={() => setShowDirections(false)}
        />
      </div>
    );
  }

  // ── SUBMIT (character creation) ──
  if (gamePhase === 'submit') {
    if (characterSubmitted) {
      return (
        <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <Check size={48} className="mx-auto text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Character Submitted!</h2>
            <p className="text-gray-400">Waiting for teacher to pick a character...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-gray-900 flex flex-col p-3 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Create Your Character</h2>
          {phaseStartTime && <CountdownTimer phaseStartTime={phaseStartTime} durationSec={60} />}
        </div>

        <div className="flex-1 flex gap-3 min-h-0 overflow-auto">
          {/* Left: Drawing */}
          <div className="flex-shrink-0" style={{ width: 280 }}>
            <MiniCanvas onDrawingChange={setDrawingDataUrl} width={280} height={180} />
          </div>

          {/* Right: Form */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div>
              <label className="text-gray-400 text-[10px] font-bold uppercase">Character Name</label>
              <input type="text" value={charName} onChange={e => setCharName(e.target.value)}
                placeholder="Name your character..." maxLength={25}
                className="w-full mt-0.5 px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-orange-500 focus:outline-none" />
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-bold uppercase">Type</label>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                {CHARACTER_TYPES.map(t => (
                  <button key={t.id} onClick={() => setCharType(t.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      charType === t.id ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-bold uppercase">Describe (3 words)</label>
              <input type="text" value={charDescription} onChange={e => setCharDescription(e.target.value)}
                placeholder="e.g. brave, fast, strong" maxLength={50}
                className="w-full mt-0.5 px-2 py-1.5 bg-gray-800 text-white text-sm rounded border border-gray-600 focus:border-orange-500 focus:outline-none" />
            </div>

            <button onClick={submitCharacter} disabled={!charName.trim()}
              className={`mt-auto px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                charName.trim() ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}>
              Submit Character
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PICKING ──
  if (gamePhase === 'picking') {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">👀</div>
          <h1 className="text-2xl font-bold text-white mb-2">Watch the Projector</h1>
          <p className="text-gray-400">Teacher is picking a character...</p>
        </div>
      </div>
    );
  }

  // ── COMPOSING ──
  if (gamePhase === 'composing') {
    if (motifSubmitted) {
      return (
        <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <Check size={48} className="mx-auto text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Motif Submitted!</h2>
            <p className="text-gray-400">Waiting for listening round...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
        {/* Featured character + timer */}
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
          {featuredCharacter?.drawingDataUrl && (
            <img src={featuredCharacter.drawingDataUrl} alt="" className="w-12 h-8 rounded object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm truncate">
              {featuredCharacter?.name || 'Character'}
              <span className="ml-1.5 text-gray-400 font-normal text-xs">
                {CHARACTER_TYPES.find(t => t.id === featuredCharacter?.type)?.emoji || ''}
              </span>
            </div>
            {featuredCharacter?.description && (
              <div className="text-gray-400 text-[10px] truncate">{featuredCharacter.description}</div>
            )}
          </div>
          {phaseStartTime && <CountdownTimer phaseStartTime={phaseStartTime} durationSec={90} />}
          <div className="bg-white/10 px-2 py-1 rounded-lg">
            <span className="text-xs text-white/70">Score: </span>
            <span className="text-sm font-black text-yellow-400">{myScore}</span>
          </div>
        </div>

        {/* Virtual instrument */}
        <div className="flex-1 min-h-0">
          <VirtualInstrumentOverlay
            embedded={true}
            showRecord={false}
            keyboardOnly={true}
            defaultScale={featuredCharacter?.type === 'villain' || featuredCharacter?.type === 'sneaky' ? 'minor' : 'major'}
            isRecording={isRecording}
            recordingStartTime={recordingStartTime}
            onRecordStart={handleRecordStart}
            onRecordStop={handleRecordStop}
            onRecordingComplete={handleRecordingComplete}
            onClose={() => {}}
          />
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 bg-gray-800 border-t border-gray-700">
          <button onClick={isRecording ? handleRecordStop : handleRecordStart}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-red-500 hover:bg-red-600 text-white'
            }`}>
            {isRecording ? <><Square size={14} fill="currentColor" /> Stop</> : <><Circle size={14} fill="currentColor" /> Record</>}
          </button>

          <button onClick={isPlaying ? stopPlayback : playMotif}
            disabled={recordedNotes.length === 0 || isRecording}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              recordedNotes.length === 0 || isRecording
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : isPlaying ? 'bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}>
            {isPlaying ? <><Square size={14} fill="currentColor" /> Stop</> : <><Play size={14} fill="currentColor" /> Play</>}
          </button>

          <button onClick={() => { stopPlayback(); setRecordedNotes([]); }}
            disabled={recordedNotes.length === 0 || isRecording}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
              recordedNotes.length === 0 || isRecording
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-red-600 text-gray-300 hover:text-white'
            }`}>
            <Trash2 size={14} /> Clear
          </button>

          <span className="text-xs text-gray-500 ml-1">
            {recordedNotes.length > 0 ? `${recordedNotes.filter(n => !n.note?.startsWith('drum-')).length} notes` : 'Record a motif'}
          </span>

          <button onClick={submitMotif}
            disabled={recordedNotes.length === 0}
            className={`ml-auto flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
              recordedNotes.length > 0
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}>
            <Check size={14} /> Submit
          </button>
        </div>
      </div>
    );
  }

  // ── LISTENING ──
  if (gamePhase === 'listening') {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎧</div>
          <h1 className="text-2xl font-bold text-white mb-2">Listen to the Projector</h1>
          <p className="text-gray-400">4 motifs are playing — which one fits best?</p>
        </div>
      </div>
    );
  }

  // ── VOTING ──
  if (gamePhase === 'voting') {
    if (voteSubmitted && selectedVote) {
      return (
        <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <Check size={48} className="mx-auto text-green-400 mb-4" />
            <p className="text-xl text-white font-bold mb-3">Vote Locked!</p>
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-3xl"
              style={{ backgroundColor: VOTE_COLORS[selectedVote] }}>
              Motif {selectedVote}
            </div>
            <p className="text-sm text-gray-400 mt-4">Waiting for reveal...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-2">Which motif fits best?</h2>
        {featuredCharacter && (
          <p className="text-gray-400 mb-6">
            For: <span className="text-white font-semibold">{featuredCharacter.name}</span>
            {' '}({CHARACTER_TYPES.find(t => t.id === featuredCharacter.type)?.emoji || ''})
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {voteOptions.map(label => (
            <button key={label} onClick={() => submitVote(label)}
              className="py-8 rounded-2xl text-center transition-all hover:scale-[1.03] active:scale-95 text-white font-black text-3xl shadow-lg"
              style={{ backgroundColor: VOTE_COLORS[label] }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── REVEALED ──
  if (gamePhase === 'revealed') {
    return (
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center w-full max-w-md">
          {wasInMajority ? (
            <div className="bg-green-500/30 rounded-2xl p-6 mb-4">
              <p className="text-3xl font-bold text-green-400 mb-1">You voted with the majority!</p>
              <p className="text-xl font-bold text-yellow-400">+1 point</p>
            </div>
          ) : wasInMajority === false ? (
            <div className="bg-red-500/30 rounded-2xl p-6 mb-4">
              <p className="text-2xl font-bold text-red-400">Not the majority this time</p>
            </div>
          ) : (
            <div className="bg-gray-500/30 rounded-2xl p-6 mb-4">
              <p className="text-2xl font-bold text-gray-300">No vote submitted</p>
            </div>
          )}

          {motifWon && (
            <div className="bg-yellow-500/30 rounded-2xl p-6 mb-4">
              <p className="text-3xl font-bold text-yellow-400 mb-1">🏆 Your motif won!</p>
              <p className="text-xl font-bold text-yellow-400">+2 bonus points</p>
            </div>
          )}

          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/70 text-sm">Your Score</p>
            <p className="text-4xl font-black text-yellow-400">{myScore}</p>
          </div>

          <p className="text-gray-400 mt-4 text-sm">Waiting for next round...</p>
        </div>
      </div>
    );
  }

  // ── FALLBACK ──
  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default ScoreThisCharacterStudent;
