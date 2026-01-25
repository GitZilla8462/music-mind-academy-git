// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderActivity.jsx
// Epic Wildlife - Student View
// ✅ UPDATED: Removed power-ups for simpler game flow
//
// Features:
// - Tap to answer (no lock-in button)
// - Animated score breakdown
// - Streak tracking, speed bonus
// - Safari bonus for finding classmates
// - Demo mode for standalone teacher preview

import React, { useState, useEffect, useRef } from 'react';
import { Flame, Clock, Play, RotateCcw, Globe } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { generatePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';
import TransitionOverlay from '../../components/TransitionOverlay';

// ============ ACTIVITY BANNER ============
const ActivityBanner = () => (
  <div className="bg-gradient-to-r from-green-800 to-teal-800 px-4 py-2 flex items-center justify-center gap-2 border-b border-green-600/50">
    <Globe size={18} className="text-green-300" />
    <span className="text-green-100 font-semibold text-sm">Epic Wildlife</span>
    <span className="text-green-300/70 text-xs">• Section Safari</span>
  </div>
);

// ============ SCORING ============
const SCORING = {
  correct: 15,
  wrong: 0,
  speed: 10,
  streak: 5,
  maxStreak: 20
};

// Safari animals
const SAFARI_ANIMALS = [
  { id: 'lion', emoji: '🦁', name: 'LION' },
  { id: 'elephant', emoji: '🐘', name: 'ELEPHANT' },
  { id: 'giraffe', emoji: '🦒', name: 'GIRAFFE' },
  { id: 'zebra', emoji: '🦓', name: 'ZEBRA' },
  { id: 'leopard', emoji: '🐆', name: 'LEOPARD' },
  { id: 'rhino', emoji: '🦏', name: 'RHINO' },
  { id: 'crocodile', emoji: '🐊', name: 'CROC' },
  { id: 'flamingo', emoji: '🦩', name: 'FLAMINGO' },
  { id: 'parrot', emoji: '🦜', name: 'PARROT' },
  { id: 'turtle', emoji: '🐢', name: 'TURTLE' },
  { id: 'dolphin', emoji: '🐬', name: 'DOLPHIN' },
  { id: 'shark', emoji: '🦈', name: 'SHARK' },
  { id: 'monkey', emoji: '🐵', name: 'MONKEY' },
  { id: 'hippo', emoji: '🦛', name: 'HIPPO' },
  { id: 'kangaroo', emoji: '🦘', name: 'KANGAROO' },
  { id: 'penguin', emoji: '🐧', name: 'PENGUIN' },
  { id: 'owl', emoji: '🦉', name: 'OWL' },
  { id: 'fox', emoji: '🦊', name: 'FOX' },
  { id: 'bear', emoji: '🐻', name: 'BEAR' },
  { id: 'wolf', emoji: '🐺', name: 'WOLF' },
  { id: 'tiger', emoji: '🐅', name: 'TIGER' },
  { id: 'panda', emoji: '🐼', name: 'PANDA' },
  { id: 'koala', emoji: '🐨', name: 'KOALA' },
  { id: 'rabbit', emoji: '🐰', name: 'RABBIT' },
  { id: 'snake', emoji: '🐍', name: 'SNAKE' },
  { id: 'eagle', emoji: '🦅', name: 'EAGLE' },
  { id: 'octopus', emoji: '🐙', name: 'OCTOPUS' },
  { id: 'bat', emoji: '🦇', name: 'BAT' },
];

const SECTION_INFO = {
  intro: { label: 'INTRO', layers: 2, color: '#8B5CF6', emoji: '🎬' },
  a: { label: 'A', layers: 3, color: '#3B82F6', emoji: '🎵' },
  aPrime: { label: "A'", layers: 4, color: '#F59E0B', emoji: '🎶' },
  outro: { label: 'OUTRO', layers: 1, color: '#10B981', emoji: '🏁' }
};

const SONG_STRUCTURE = [
  { section: 'intro', label: 'INTRO' },
  { section: 'a', label: 'A' },
  { section: 'aPrime', label: "A'" },
  { section: 'a', label: 'A' },
  { section: 'outro', label: 'OUTRO' }
];

// Demo clips with correct answers
const DEMO_CLIPS = [
  { id: 1, correctAnswer: 'intro', audioHint: '2 layers - thin texture' },
  { id: 2, correctAnswer: 'a', audioHint: '3 layers - medium texture' },
  { id: 3, correctAnswer: 'aPrime', audioHint: '4 layers - thick texture' },
  { id: 4, correctAnswer: 'outro', audioHint: '1 layer - very thin' },
];

// Animated number component
const AnimatedNumber = ({ value, duration = 600 }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    if (duration === 0) { setDisplay(value); return; }
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 1);
      setDisplay(Math.round(start + diff * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{display}</span>;
};

// Score breakdown item
const ScoreItem = ({ value, label, emoji, positive = true, delay = 0 }) => (
  <div 
    className={`${positive ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-lg px-3 py-2 text-center`}
    style={{ animation: `slideUp 0.3s ease-out ${delay}ms both` }}
  >
    <div className={`text-xl font-black ${positive ? 'text-green-400' : 'text-red-400'}`}>
      {emoji && <span className="mr-1">{emoji}</span>}
      {value > 0 ? '+' : ''}{value}
    </div>
    <div className={`text-xs ${positive ? 'text-green-200' : 'text-red-200'}`}>{label}</div>
  </div>
);

// ============ DEMO MODE COMPONENT ============
const DemoModeGame = () => {
  const [demoPhase, setDemoPhase] = useState('intro'); // intro, playing, guessing, revealed, complete
  const [currentClip, setCurrentClip] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [clipResult, setClipResult] = useState(null);
  const timerRef = useRef(null);

  const styles = `
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pop {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;

  const startDemo = () => {
    setDemoPhase('playing');
    setCurrentClip(0);
    setScore(0);
    setStreak(0);
    setTimeout(() => {
      setDemoPhase('guessing');
      startTimer();
    }, 2000);
  };

  const startTimer = () => {
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 100);
    }, 100);
  };

  const selectAnswer = (section) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(section);
    
    const clip = DEMO_CLIPS[currentClip];
    const isCorrect = section === clip.correctAnswer;
    const speedBonus = elapsedTime < 3000 ? SCORING.speed : 0;
    const newStreak = isCorrect ? streak + 1 : 0;
    const streakBonus = newStreak >= 2 ? Math.min(newStreak * SCORING.streak, SCORING.maxStreak) : 0;
    const correctPts = isCorrect ? SCORING.correct : 0;
    const wrongPts = !isCorrect ? SCORING.wrong : 0;
    const total = Math.max(0, correctPts - wrongPts + speedBonus + streakBonus);

    setClipResult({
      isCorrect,
      myAnswer: section,
      correctPts,
      wrongPts,
      speedBonus,
      streakBonus,
      total,
      newStreak
    });
    
    setScore(prev => prev + total);
    setStreak(newStreak);
    setDemoPhase('revealed');
  };

  const nextClip = () => {
    if (currentClip >= DEMO_CLIPS.length - 1) {
      setDemoPhase('complete');
    } else {
      setCurrentClip(prev => prev + 1);
      setSelectedAnswer(null);
      setClipResult(null);
      setDemoPhase('playing');
      setTimeout(() => {
        setDemoPhase('guessing');
        startTimer();
      }, 2000);
    }
  };

  const resetDemo = () => {
    setDemoPhase('intro');
    setCurrentClip(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setClipResult(null);
  };

  const formatTime = (ms) => `${Math.floor(ms/1000)}.${Math.floor((ms%1000)/100)}s`;

  // Demo Intro
  if (demoPhase === 'intro') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
        <div className="text-6xl mb-4">🎮</div>
        <h1 className="text-3xl font-bold mb-2">Section Safari</h1>
        <p className="text-lg text-white/70 mb-2">Teacher Demo Mode</p>
        
        <div className="bg-white/10 rounded-xl p-4 mb-6 max-w-md">
          <p className="text-white/80 mb-3 text-center">
            In the real game, students hear audio clips and identify which section they belong to based on the number of layers.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(SECTION_INFO).map(([key, info]) => (
              <div key={key} className="px-3 py-2 rounded-lg text-center text-sm"
                style={{ backgroundColor: `${info.color}30` }}>
                <span className="mr-1">{info.emoji}</span>
                <span className="font-bold" style={{ color: info.color }}>{info.label}</span>
                <span className="text-white/60 ml-1">= {info.layers} layers</span>
              </div>
            ))}
          </div>
          <p className="text-white/60 text-sm text-center">
            This demo simulates the student experience. In class, audio plays from the main screen.
          </p>
        </div>
        
        <button
          onClick={startDemo}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-xl font-bold hover:scale-105 transition-transform"
        >
          <Play size={24} />
          Try Demo
        </button>
      </div>
    );
  }

  // Playing (simulated listening)
  if (demoPhase === 'playing') {
    const clip = DEMO_CLIPS[currentClip];
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
        <div className="text-6xl mb-4 animate-pulse">🎧</div>
        <h1 className="text-3xl font-bold mb-2">Listening to Clip {currentClip + 1}...</h1>
        <p className="text-lg text-white/70 mb-4">Demo hint: {clip.audioHint}</p>
        <div className="bg-white/10 rounded-xl px-6 py-3">
          <p className="text-white/60">Get ready to identify the section!</p>
        </div>
      </div>
    );
  }

  // Guessing
  if (demoPhase === 'guessing') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col p-4 text-white">
        <style>{styles}</style>
        
        {/* Header */}
        <div className="bg-white/10 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/30">
                👁️
              </div>
              <div className="text-sm">
                <div className="font-bold text-purple-300">Demo Mode</div>
                <div className="text-white/60 text-xs">Clip {currentClip + 1} of {DEMO_CLIPS.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {streak >= 2 && (
                <div className="flex items-center gap-1 bg-orange-500/30 px-2 py-1 rounded-full text-sm">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-orange-400 font-bold">{streak}</span>
                </div>
              )}
              <div className="bg-white/10 px-3 py-1 rounded-lg">
                <span className="text-xl font-bold text-yellow-400">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="text-center mb-3">
          <div className="text-sm text-white/60 mb-1">Demo hint: {DEMO_CLIPS[currentClip].audioHint}</div>
          <div className="text-2xl font-bold">🎧 Tap your answer!</div>
        </div>

        {/* Timer */}
        <div className="text-center mb-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            elapsedTime < 3000 ? 'bg-green-500/30 text-green-300' : 'bg-white/20'
          }`}>
            <Clock size={18} />
            <span className="font-mono text-xl font-bold">{formatTime(elapsedTime)}</span>
            {elapsedTime < 3000 && <span className="text-sm">⚡ Speed Bonus!</span>}
          </div>
        </div>

        {/* Answers */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(SECTION_INFO).map(([key, info]) => (
              <button
                key={key}
                onClick={() => selectAnswer(key)}
                className="py-6 rounded-xl font-bold transition-all active:scale-95 hover:scale-102"
                style={{ 
                  backgroundColor: `${info.color}40`,
                  color: info.color
                }}
              >
                <div className="text-4xl mb-1">{info.emoji}</div>
                <div className="text-2xl font-black">{info.label}</div>
                <div className="text-sm opacity-80">{info.layers} layers</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Revealed
  if (demoPhase === 'revealed' && clipResult) {
    const correctSection = SECTION_INFO[DEMO_CLIPS[currentClip].correctAnswer];
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col p-4 text-white">
        <style>{styles}</style>
        
        {/* Header */}
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>Clip {currentClip + 1} of {DEMO_CLIPS.length}</div>
            <div className="flex items-center gap-2">
              {clipResult.newStreak >= 2 && (
                <div className="flex items-center gap-1 bg-orange-500/30 px-2 py-1 rounded-full">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-orange-400 font-bold">{clipResult.newStreak}</span>
                </div>
              )}
              <div className="bg-white/10 px-3 py-1 rounded-lg">
                <span className="text-xl font-bold text-yellow-400">
                  <AnimatedNumber value={score} duration={800} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Result icon */}
          <div 
            className="text-7xl mb-4"
            style={{ animation: clipResult.isCorrect ? 'pop 0.3s ease-out' : 'shake 0.4s ease-out' }}
          >
            {clipResult.isCorrect ? '✅' : '❌'}
          </div>
          
          <div className={`text-3xl font-black mb-2 ${clipResult.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {clipResult.isCorrect ? 'CORRECT!' : 'WRONG'}
          </div>
          
          {!clipResult.isCorrect && (
            <div className="text-white/70 mb-2">
              The answer was: <span style={{ color: correctSection.color }}>{correctSection.emoji} {correctSection.label}</span>
            </div>
          )}
          
          {/* Score breakdown */}
          <div className="bg-black/30 rounded-xl p-4 w-full max-w-sm mb-4">
            <h3 className="text-sm font-bold text-white/70 mb-3 text-center">Score Breakdown</h3>
            
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {clipResult.correctPts > 0 && (
                <ScoreItem value={clipResult.correctPts} label="Correct" emoji="✓" delay={0} />
              )}
              {clipResult.wrongPts > 0 && (
                <ScoreItem value={-clipResult.wrongPts} label="Wrong" positive={false} delay={100} />
              )}
              {clipResult.speedBonus > 0 && (
                <ScoreItem value={clipResult.speedBonus} label="Speed" emoji="⚡" delay={200} />
              )}
              {clipResult.streakBonus > 0 && (
                <ScoreItem value={clipResult.streakBonus} label="Streak" emoji="🔥" delay={300} />
              )}
            </div>
            
            <div className="text-center border-t border-white/20 pt-3">
              <span className="text-white/60">This clip: </span>
              <span className={`text-3xl font-black ${clipResult.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {clipResult.total >= 0 ? '+' : ''}<AnimatedNumber value={clipResult.total} duration={600} />
              </span>
            </div>
          </div>
          
          <button
            onClick={nextClip}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
          >
            {currentClip >= DEMO_CLIPS.length - 1 ? 'See Results' : 'Next Clip →'}
          </button>
        </div>
      </div>
    );
  }

  // Complete
  if (demoPhase === 'complete') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Demo Complete!</h1>
        
        <div className="bg-white/10 rounded-2xl p-6 text-center mb-6">
          <div className="text-lg text-white/70 mb-2">Final Score</div>
          <div className="text-5xl font-black text-yellow-400">{score}</div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 mb-6 max-w-md text-center">
          <p className="text-white/70 text-sm">
            In the real game, students compete on a live leaderboard and can go on Safari hunts to find classmates for bonus points!
          </p>
        </div>
        
        <button
          onClick={resetDemo}
          className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-colors"
        >
          <RotateCcw size={20} />
          Try Again
        </button>
      </div>
    );
  }

  return null;
};

// ============ MAIN COMPONENT ============
const SectionalLoopBuilderActivity = ({ onComplete, viewMode = false, isSessionMode = false }) => {
  const { sessionCode, userId } = useSession();
  
  // Demo mode: no session, let teacher play standalone
  const isDemoMode = !sessionCode && !isSessionMode;
  
  // Player
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#10B981');
  const [playerEmoji, setPlayerEmoji] = useState('🎵');
  
  // Game state from Firebase
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [totalRounds, setTotalRounds] = useState(1);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [totalClipsPlayed, setTotalClipsPlayed] = useState(0);
  
  // My answer - simplified, no lock-in needed
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerTime, setAnswerTime] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  // Store answer in ref for reveal phase
  const answeredRef = useRef({ answer: null, time: null });

  // Track Safari status for this clip (in case Firebase clears it before reveal)
  const wasSafariThisClipRef = useRef(false);

  // Results for current clip
  const [clipResult, setClipResult] = useState(null);
  
  // Overall
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const scoreRef = useRef(0); // Track score synchronously to avoid stale closure issues
  const streakRef = useRef(0); // Track streak synchronously to avoid stale closure issues
  const [rank, setRank] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  
  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const initRef = useRef(false);
  const lastStateRef = useRef('');

  // Safari state
  const [myAnimal, setMyAnimal] = useState(null); // { emoji, name, code }
  const [onSafari, setOnSafari] = useState(false);
  const [safariTarget, setSafariTarget] = useState(null); // { emoji, name }
  const [safariCodeInput, setSafariCodeInput] = useState('');
  const [safariComplete, setSafariComplete] = useState(false);
  const [safariBonus, setSafariBonus] = useState(0);
  const [safariWrongCode, setSafariWrongCode] = useState(false); // Track wrong code attempts
  const [allSafariAssignments, setAllSafariAssignments] = useState({}); // Store all assignments for code lookup
  const safariBonusRef = useRef(0); // Track bonus synchronously for score calculation

  // Tutorial mode - active for round 1 only
  const tutorialMode = currentRound === 1;

  // Transition overlay state (when teacher saves/advances)
  const [showTransition, setShowTransition] = useState(false);
  const lastSaveCommandRef = useRef(null);

  // Listen for teacher's "Save & Continue" command
  useEffect(() => {
    if (!sessionCode || isDemoMode) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${sessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();

      // Skip if no command
      if (!saveCommand) return;

      // On first load, just store the value without triggering
      if (lastSaveCommandRef.current === null) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      // Only trigger if this is a new command (timestamp changed)
      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('🟢 Teacher clicked Save & Continue - showing overlay');

        // Show transition overlay for 7 seconds
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
        }, 7000);
      }
    });

    return () => unsubscribe();
  }, [sessionCode, isDemoMode]);

  // CSS keyframes
  const styles = `
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pop {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.4s ease-out; }
  `;

  // ============ DEMO MODE ============
  if (isDemoMode) {
    return <DemoModeGame />;
  }

  // Init player
  useEffect(() => {
    if (!userId || initRef.current) return;
    initRef.current = true;
    
    const name = generatePlayerName(userId);
    const color = getPlayerColor(userId);
    const emoji = getPlayerEmoji(userId);
    
    setPlayerName(name);
    setPlayerColor(color);
    setPlayerEmoji(emoji);
    
    if (sessionCode && !viewMode) {
      const db = getDatabase();
      // Don't reset score/streak on rejoin - only update display info
      // Score is managed by calculateScore(), streak by reveal updates
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        playerName: name,
        displayName: name,
        playerColor: color,
        playerEmoji: emoji,
        currentAnswer: null,
        lockedIn: false,
        lastActivity: Date.now()
      }).catch(console.error);
    }
  }, [userId, sessionCode, viewMode]);

  // Listen to game state (from activityData where teacher writes)
  useEffect(() => {
    if (!sessionCode) return;
    
    const db = getDatabase();
    const gameRef = ref(db, `sessions/${sessionCode}/activityData`);
    
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Student received activityData:', data?.gamePhase, data?.activity);
      if (!data || data.activity !== 'sectional-loop-builder') return;

      // Update Safari animal assignment for this student
      if (data.safariAssignments) {
        console.log('🦁 Safari assignments received:', Object.keys(data.safariAssignments).length, 'students');
        setAllSafariAssignments(data.safariAssignments); // Store all for code lookup
        if (userId && data.safariAssignments[userId]) {
          const myAssignment = data.safariAssignments[userId];
          console.log('🦁 My animal:', myAssignment.emoji, myAssignment.name, myAssignment.code);
          setMyAnimal({ emoji: myAssignment.emoji, name: myAssignment.name, code: myAssignment.code });
        }
      }
      
      // Check if this student is on Safari
      if (data.safariHunters && data.safariHunters.length > 0) {
        console.log('🦁 Safari hunters:', data.safariHunters.map(h => h.name).join(', '));
        if (userId) {
          const myHunt = data.safariHunters.find(h => h.studentId === userId);
          // Only activate Safari if we have a valid target with emoji and name
          if (myHunt && myHunt.targetEmoji && myHunt.targetName) {
            console.log('🦁 I AM ON SAFARI! Looking for:', myHunt.targetEmoji, myHunt.targetName);
            setOnSafari(true);
            setSafariTarget({ emoji: myHunt.targetEmoji, name: myHunt.targetName });
            wasSafariThisClipRef.current = true; // Track that we were on Safari this clip
          } else {
            setOnSafari(false);
            setSafariTarget(null);
          }
        }
      } else {
        setOnSafari(false);
        setSafariTarget(null);
      }
      
      const newPhase = data.gamePhase || 'waiting';
      const newRound = data.currentRound || 0;
      const newClip = data.currentClipIndex || 0;
      const stateKey = `${newPhase}-${newRound}-${newClip}`;
      
      if (stateKey === lastStateRef.current) return;
      
      const prevStateKey = lastStateRef.current;
      lastStateRef.current = stateKey;
      
      console.log('🎮 Game update:', newPhase, `R${newRound} C${newClip}`, `(prev: ${prevStateKey})`);
      
      // New guessing phase - reset for new clip
      if (newPhase === 'guessing') {
        const prevParts = prevStateKey.split('-');
        const prevPhase = prevParts[0] || '';
        const prevClipIdx = prevParts[2] || '';
        
        // Reset if: coming from powerPick, or different clip index, or from listening/revealed/roundSummary
        const isNewClip = prevPhase === 'powerPick' ||
                          prevClipIdx !== String(newClip) || 
                          prevStateKey.includes('listening') || 
                          prevStateKey.includes('revealed') ||
                          prevStateKey.includes('roundSummary') ||
                          prevStateKey === ''; // First load
        
        console.log('🔄 Guessing phase - isNewClip:', isNewClip, { prevPhase, prevClipIdx, newClip });
        
        if (isNewClip) {
          console.log('🧹 Clearing answer state for new clip');
          setSelectedAnswer(null);
          setAnswerTime(null);
          setHasAnswered(false);
          setClipResult(null);
          setElapsedTime(0);
          answeredRef.current = { answer: null, time: null };
          // Reset Safari state
          setSafariCodeInput('');
          setSafariComplete(false);
          setSafariBonus(0);
          setSafariWrongCode(false);
          safariBonusRef.current = 0;
          wasSafariThisClipRef.current = false; // Reset Safari tracking for new clip
        }
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 100);
        }, 100);
      }
      
      // Revealed - calculate score
      if (newPhase === 'revealed' && data.correctAnswer) {
        if (timerRef.current) clearInterval(timerRef.current);
        calculateScore(data.correctAnswer);
      }
      
      setGamePhase(newPhase);
      setCurrentRound(newRound);
      setCurrentClipIndex(newClip);
      if (data.totalRounds) setTotalRounds(data.totalRounds);
      if (data.correctAnswer) setCorrectAnswer(data.correctAnswer);
      if (data.totalClipsPlayed) setTotalClipsPlayed(data.totalClipsPlayed);
    });
    
    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionCode]);

  // Listen to leaderboard
  useEffect(() => {
    if (!sessionCode || !userId) return;

    const db = getDatabase();
    const unsubscribe = onValue(ref(db, `sessions/${sessionCode}/studentsJoined`), (snap) => {
      const students = snap.val();
      if (!students) return;

      const sorted = Object.entries(students)
        .map(([id, data]) => ({ id, score: data.score || 0 }))
        .sort((a, b) => b.score - a.score);

      setTotalStudents(sorted.length);
      setRank(sorted.findIndex(s => s.id === userId) + 1);

      if (students[userId]) {
        const currentScore = students[userId].score || 0;
        const currentStreak = students[userId].streak || 0;
        setScore(currentScore);
        scoreRef.current = currentScore; // Keep ref in sync for calculateScore
        setStreak(currentStreak);
        streakRef.current = currentStreak; // Keep ref in sync for calculateScore
      }
    });

    return () => unsubscribe();
  }, [sessionCode, userId]);

  // Ensure clipResult is calculated if we're in revealed phase but don't have it
  useEffect(() => {
    if (gamePhase === 'revealed' && !clipResult && correctAnswer) {
      console.log('🔄 Calculating score for revealed phase (late calculation)');
      calculateScore(correctAnswer);
    }
  }, [gamePhase, clipResult, correctAnswer]);

  // Select answer - immediate, no lock-in needed
  const selectAnswer = (section) => {
    if (hasAnswered || gamePhase !== 'guessing') return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const time = elapsedTime;
    setSelectedAnswer(section);
    setAnswerTime(time);
    setHasAnswered(true);
    
    // Store in ref for reveal
    answeredRef.current = {
      answer: section,
      time: time
    };
    
    console.log('✅ Answered:', section, `(${time}ms)`);
    
    if (sessionCode && userId && !viewMode) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        currentAnswer: section,
        answerTime: time,
        lockedIn: true,
        lastActivity: Date.now()
      }).catch(console.error);
    }
  };

  // Submit Safari code
  const submitSafariCode = () => {
    console.log('🦁 Safari submit:', { safariTarget, safariComplete, safariCodeInput, allSafariAssignments });

    if (!safariTarget || safariComplete) return;
    if (safariCodeInput.length !== 4) return;

    // Find the student who has the target animal using stored state
    const targetStudent = Object.entries(allSafariAssignments).find(
      ([id, assignment]) => assignment.name === safariTarget.name
    );

    console.log('🦁 Target found:', targetStudent);

    if (targetStudent && safariCodeInput === targetStudent[1].code) {
      // Correct code!
      console.log('🦁 Correct code! +50 bonus');
      setSafariComplete(true);
      setSafariBonus(50);
      setSafariWrongCode(false);
      safariBonusRef.current = 50; // Set ref for synchronous access in calculateScore

      // Update Firebase
      if (sessionCode && userId) {
        const db = getDatabase();
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
          safariComplete: true,
          safariBonus: 50,
          lastActivity: Date.now()
        }).catch(console.error);
      }
    } else {
      // Wrong code - show feedback and clear input
      console.log('🦁 Wrong code! No bonus.');
      setSafariWrongCode(true);
      setSafariCodeInput(''); // Clear input so they can try again

      // Reset wrong code indicator after animation
      setTimeout(() => {
        setSafariWrongCode(false);
      }, 1500);
    }
  };

  // Calculate score
  const calculateScore = (correct) => {
    const myAnswer = answeredRef.current.answer || selectedAnswer;
    const myTime = answeredRef.current.time ?? answerTime;
    const wasAnswered = myAnswer !== null;

    // Safari students automatically get correct (they were on Safari, not answering)
    // Use ref to track if we were on Safari this clip (in case Firebase cleared it before reveal)
    const wasSafari = wasSafariThisClipRef.current || onSafari;
    const isCorrect = wasSafari ? true : (myAnswer === correct);

    console.log('📊 Score calc:', { myAnswer, correct, isCorrect, wasAnswered, wasSafari, wasSafariRef: wasSafariThisClipRef.current, safariBonus: safariBonusRef.current });

    // No answer and not on Safari = no points
    if (!wasAnswered && !wasSafari) {
      setClipResult({
        isCorrect: false,
        myAnswer: null,
        correctPts: 0,
        wrongPts: 0,
        speedBonus: 0,
        streakBonus: 0,
        safariPts: 0,
        total: 0,
        newStreak: 0,
        noAnswer: true
      });
      return;
    }

    let correctPts = isCorrect ? SCORING.correct : 0;
    let wrongPts = (!isCorrect && !wasSafari) ? SCORING.wrong : 0;

    // Safari students don't get speed bonus (they weren't answering)
    const speedBonus = (!wasSafari && isCorrect && myTime !== null && myTime < 3000) ? SCORING.speed : 0;

    // Use streakRef to get the latest streak (avoids stale closure issues)
    const newStreak = isCorrect ? streakRef.current + 1 : 0;
    const streakBonus = newStreak >= 2 ? Math.min(newStreak * SCORING.streak, SCORING.maxStreak) : 0;

    // Include Safari bonus if they completed it (use ref for synchronous access)
    const safariPts = safariBonusRef.current || 0;

    let total = Math.max(0, correctPts - wrongPts + speedBonus + streakBonus + safariPts);

    setClipResult({
      isCorrect,
      myAnswer: wasSafari ? 'SAFARI' : myAnswer,
      correctPts,
      wrongPts,
      speedBonus,
      streakBonus,
      safariPts,
      total,
      newStreak,
      wasSafari
    });
    
    // Use scoreRef to get the latest score (avoids stale closure issues)
    const currentScore = scoreRef.current;
    const newScore = currentScore + total;

    // Update refs immediately for next calculation
    scoreRef.current = newScore;
    streakRef.current = newStreak;

    if (sessionCode && userId && !viewMode) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        score: newScore,
        streak: newStreak,
        lastClipScore: total,
        currentAnswer: null,
        lockedIn: false,
        powerUp: null,
        lastActivity: Date.now()
      }).catch(console.error);
    }
  };

  const formatTime = (ms) => `${Math.floor(ms/1000)}.${Math.floor((ms%1000)/100)}s`;

  // ========== RENDERS ==========

  // Waiting
  if (gamePhase === 'waiting') {
    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
          <style>{styles}</style>
          <ActivityBanner />
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4 animate-bounce">🌍</div>
            <h1 className="text-3xl font-bold mb-2">Epic Wildlife</h1>
            <p className="text-lg text-white/70 mb-6">Waiting for teacher...</p>

            <div className="bg-white/10 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${playerColor}30` }}>
                  {playerEmoji}
                </div>
                <div>
                  <div className="text-sm text-white/60">Playing as</div>
                  <div className="text-xl font-bold" style={{ color: playerColor }}>{playerName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // Listen Intro screens - students just watch the main screen
  if (gamePhase === 'listenIntro1' || gamePhase === 'listenIntro2' || gamePhase === 'listenIntro3') {
    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
          <style>{styles}</style>
          <ActivityBanner />
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4">👀</div>
            <h1 className="text-3xl font-bold mb-2">Watch the Board!</h1>
            <p className="text-lg text-white/70 mb-4">Directions are on the main screen</p>
            <p className="text-white/60 animate-pulse">🎬 Get ready to listen...</p>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // Listening
  if (gamePhase === 'listening') {
    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
          <style>{styles}</style>
          <ActivityBanner />
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4 animate-pulse">🎧</div>
            <h1 className="text-3xl font-bold mb-2">Listening...</h1>
            <p className="text-lg text-white/70 mb-4">Watch the main screen!</p>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2">
                {SONG_STRUCTURE.map((item, idx) => {
                  const info = SECTION_INFO[item.section];
                  return (
                    <React.Fragment key={idx}>
                      <div className="px-3 py-2 rounded-lg text-center"
                        style={{ backgroundColor: `${info.color}40` }}>
                        <div className="text-lg">{info.emoji}</div>
                        <div className="font-bold text-sm">{item.label}</div>
                        <div className="text-xs text-white/70">{info.layers}</div>
                      </div>
                      {idx < 4 && <span className="text-white/50">→</span>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <p className="text-white/60 mt-4 animate-pulse">🔊 Playing on main screen...</p>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // Pre-Quiz - Get Ready
  if (gamePhase === 'preQuiz') {
    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
          <style>{styles}</style>
          <ActivityBanner />
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-7xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold mb-2">Get Ready!</h1>
            <p className="text-xl text-yellow-300 font-bold mb-4">Question 1 coming up...</p>

            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <p className="text-white/70 mb-3 text-center">Listen and tap your answer!</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(SECTION_INFO).map(([key, info]) => (
                  <div key={key} className="px-4 py-3 rounded-lg text-center"
                    style={{ backgroundColor: `${info.color}30` }}>
                    <div className="text-2xl">{info.emoji}</div>
                    <div className="font-bold" style={{ color: info.color }}>{info.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-white/60 animate-pulse">Waiting for teacher to start...</p>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // Guessing
  if (gamePhase === 'guessing') {
    // If on Safari, show Safari screen instead
    // Only show Safari if we have a valid target (with emoji and name)
    if (onSafari && safariTarget && safariTarget.emoji && safariTarget.name) {
      return (
        <>
          <div className="h-screen flex flex-col bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 text-white relative">
            <style>{styles}</style>
            <ActivityBanner />

            <div className="flex-1 flex flex-col p-4">
              {/* Safari Header */}
              <div className="bg-white/10 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${playerColor}30` }}>
                      {playerEmoji}
                    </div>
                    <span className="font-bold" style={{ color: playerColor }}>{playerName}</span>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-lg">
                    <span className="text-xl font-bold text-yellow-400">{score}</span>
                  </div>
                </div>
              </div>

              {/* Safari Content */}
              <div className="flex-1 flex flex-col items-center justify-center">
                {!safariComplete ? (
                  <>
                    <h1 className="text-3xl font-black mb-1 text-yellow-300">SAFARI EXPLORER</h1>
                    <p className="text-lg mb-4 text-white/80">Walk around and find the Wildlife!</p>

                    {/* Large Animal Display */}
                    <div className="bg-white/20 rounded-3xl p-8 mb-6 text-center border-4 border-yellow-400">
                      <div className="text-[120px] leading-none">{safariTarget.emoji}</div>
                    </div>

                    {/* Code Entry */}
                    <p className="text-lg text-white/70 mb-2">Enter their code:</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={safariCodeInput}
                      onChange={(e) => setSafariCodeInput(e.target.value.replace(/\D/g, ''))}
                      className={`w-56 text-center text-5xl font-mono font-black bg-white/20 rounded-xl px-4 py-4 placeholder-white/30 transition-all mb-3 ${
                        safariWrongCode
                          ? 'border-4 border-red-500 text-red-400 animate-shake'
                          : 'border-4 border-yellow-400 text-yellow-300'
                      }`}
                      placeholder="____"
                    />
                    {safariWrongCode && (
                      <div className="text-red-400 font-bold text-lg animate-pulse mb-2">
                        ❌ Wrong code! Try again
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🦁 Submit button clicked!');
                        submitSafariCode();
                      }}
                      disabled={safariCodeInput.length !== 4}
                      className={`px-10 py-4 rounded-xl text-2xl font-bold transition-all active:scale-95 ${
                        safariCodeInput.length === 4
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg'
                          : 'bg-white/20 text-white/50'
                      }`}
                    >
                      ✓ Submit Code
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-8xl mb-4">🎉</div>
                    <h1 className="text-4xl font-black text-green-400 mb-2">FOUND IT!</h1>
                    <div className="text-6xl font-black text-yellow-300">+{safariBonus}</div>
                    <p className="text-xl text-white/70 mt-2">Bonus points!</p>
                    <p className="text-white/50 mt-4">Return to your seat and wait for the reveal...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white relative">
          <style>{styles}</style>
          <ActivityBanner />

          {/* Animal Badge - Top Right Corner - HUGE for Safari hunters to find */}
          {myAnimal && (
            <div className="absolute top-12 right-2 bg-black/70 rounded-2xl p-5 text-center z-10 border-4 border-yellow-400">
              <div className="text-6xl mb-2">{myAnimal.emoji}</div>
              <div className="text-7xl font-mono font-black text-yellow-300 tracking-wider">{myAnimal.code}</div>
            </div>
          )}

          <div className="flex-1 flex flex-col p-4">
            {/* Header */}
            <div className="bg-white/10 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${playerColor}30` }}>
                    {playerEmoji}
                  </div>
                  <div className="text-sm">
                    <div className="font-bold" style={{ color: playerColor }}>{playerName}</div>
                    <div className="text-white/60 text-xs">#{rank} of {totalStudents}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {streak >= 2 && (
                    <div className="flex items-center gap-1 bg-orange-500/30 px-2 py-1 rounded-full text-sm">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-orange-400 font-bold">{streak}</span>
                    </div>
                  )}
                  <div className="bg-white/10 px-3 py-1 rounded-lg">
                    <span className="text-xl font-bold text-yellow-400">{score}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role indicator + Question info */}
            <div className="text-center mb-3">
              {myAnimal && (
                <div className="inline-block bg-blue-500/30 border border-blue-400/50 rounded-full px-4 py-1 mb-2">
                  <span className="text-blue-300 font-bold text-sm">THE WILDLIFE</span>
                  <span className="text-white/60 text-sm"> • Stay seated and answer</span>
                </div>
              )}
              <div className="text-sm text-white/60">Question {totalClipsPlayed} of 10</div>
              <div className="text-2xl font-bold">🎧 Tap your answer!</div>
            </div>

            {/* Tutorial hint - only show in round 1 */}
            {tutorialMode && !hasAnswered && (
              <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-3 mb-3 text-center">
                <div className="text-yellow-300 font-bold text-sm mb-1">💡 Listen & Count!</div>
                <div className="text-white/80 text-xs">
                  Count the different instruments: <span className="text-purple-300">2 layers = INTRO</span> • <span className="text-blue-300">3 layers = A</span> • <span className="text-yellow-300">4 layers = A'</span> • <span className="text-green-300">1 layer = OUTRO</span>
                </div>
              </div>
            )}

            {/* Speed bonus indicator - only show if not answered and in bonus window */}
            {!hasAnswered && elapsedTime < 3000 && (
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/30 text-green-300 animate-pulse">
                  <span className="text-lg font-bold">⚡ Speed Bonus!</span>
                </div>
              </div>
            )}

            {/* Answers */}
            <div className="flex-1 flex flex-col justify-center">
              {!hasAnswered ? (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(SECTION_INFO).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => selectAnswer(key)}
                      className="py-6 rounded-xl font-bold transition-all active:scale-95"
                      style={{
                        backgroundColor: `${info.color}40`,
                        color: info.color
                      }}
                    >
                      <div className="text-4xl mb-1">{info.emoji}</div>
                      <div className="text-2xl font-black">{info.label}</div>
                      <div className="text-sm opacity-80">{info.layers} layers</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-3">✅</div>
                  <div className="text-2xl font-bold text-green-400 mb-2">Answered!</div>
                  <div className="text-4xl font-black mb-1"
                    style={{ color: SECTION_INFO[selectedAnswer]?.color }}>
                    {SECTION_INFO[selectedAnswer]?.emoji} {SECTION_INFO[selectedAnswer]?.label}
                  </div>
                  {answerTime < 3000 && (
                    <div className="text-yellow-400 mt-2">⚡ Speed Bonus!</div>
                  )}
                  <div className="text-white/60 mt-4">Waiting for reveal...</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // Revealed - Show result + animated score breakdown (NOT "the answer was")
  // Also show if phase is revealed but clipResult is still being calculated
  if (gamePhase === 'revealed') {
    // If clipResult hasn't been calculated yet, show waiting state
    if (!clipResult) {
      return (
        <>
          <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
            <style>{styles}</style>
            <ActivityBanner />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
              <h1 className="text-3xl font-bold mb-2">Calculating Result...</h1>
              <p className="text-white/60">Wait for the reveal!</p>
            </div>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // Normal revealed state with clipResult
    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
          <style>{styles}</style>
          <ActivityBanner />

          <div className="flex-1 flex flex-col p-4">
            {/* Header */}
            <div className="bg-white/10 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${playerColor}30` }}>
                    {playerEmoji}
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: playerColor }}>{playerName}</div>
                    <div className="text-xs text-white/60">Question {totalClipsPlayed} of 10</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {clipResult.newStreak >= 2 && (
                    <div className="flex items-center gap-1 bg-orange-500/30 px-2 py-1 rounded-full">
                      <Flame size={14} className="text-orange-400" />
                      <span className="text-orange-400 font-bold">{clipResult.newStreak}</span>
                    </div>
                  )}
                  <div className="bg-white/10 px-3 py-1 rounded-lg">
                    <span className="text-xl font-bold text-yellow-400">
                      <AnimatedNumber value={score} duration={800} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          {/* No answer case */}
          {clipResult.noAnswer ? (
            <>
              <div className="text-7xl mb-4">😴</div>
              <div className="text-3xl font-black mb-2 text-white/60">No Answer</div>
              <div className="text-white/50">You didn't lock in!</div>
            </>
          ) : clipResult.wasSafari ? (
            <>
              {/* Safari result */}
              <div
                className="text-7xl mb-4"
                style={{ animation: 'pop 0.3s ease-out' }}
              >
                {clipResult.safariPts > 0 ? '🎯' : '🦁'}
              </div>

              <div className={`text-3xl font-black mb-2 ${clipResult.safariPts > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {clipResult.safariPts > 0 ? 'ANIMAL FOUND!' : 'SAFARI HUNTER'}
              </div>

              {clipResult.safariPts > 0 ? (
                <div className="text-green-300 mb-4 text-center">
                  <div className="text-lg">You found the animal! <span className="font-bold">+50 bonus!</span></div>
                </div>
              ) : (
                <div className="text-white/70 mb-4 text-center">
                  <div className="text-lg mb-1">Auto-correct for Safari duty</div>
                  <div className="text-yellow-400/80 text-sm">Finding the animal would have been <span className="font-bold">+50 pts</span></div>
                </div>
              )}

              {/* Score breakdown */}
              <div className="bg-black/30 rounded-xl p-4 w-full max-w-sm mb-4">
                <h3 className="text-sm font-bold text-white/70 mb-3 text-center">Score Breakdown</h3>

                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {clipResult.correctPts > 0 && (
                    <ScoreItem value={clipResult.correctPts} label="Auto ✓" emoji="🦁" delay={0} />
                  )}
                  {clipResult.safariPts > 0 ? (
                    <ScoreItem value={clipResult.safariPts} label="Found!" emoji="🎯" delay={200} />
                  ) : (
                    <div
                      className="bg-gray-500/20 rounded-lg px-3 py-2 text-center"
                      style={{ animation: 'slideUp 0.3s ease-out 200ms both' }}
                    >
                      <div className="text-xl font-black text-gray-400">+0</div>
                      <div className="text-xs text-gray-300">Missed 🎯</div>
                    </div>
                  )}
                  {clipResult.streakBonus > 0 && (
                    <ScoreItem value={clipResult.streakBonus} label="Streak" emoji="🔥" delay={300} />
                  )}
                </div>

                {/* Show what they could have earned */}
                {clipResult.safariPts === 0 && (
                  <div className="text-center text-xs text-white/50 mb-2 border-t border-white/10 pt-2">
                    Could have earned: <span className="text-yellow-400">{clipResult.correctPts + 50} pts</span>
                  </div>
                )}

                <div className="text-center border-t border-white/20 pt-3">
                  <span className="text-white/60">This clip: </span>
                  <span className={`text-3xl font-black ${clipResult.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {clipResult.total >= 0 ? '+' : ''}<AnimatedNumber value={clipResult.total} duration={600} />
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Result icon */}
              <div 
                className="text-7xl mb-4"
                style={{ animation: clipResult.isCorrect ? 'pop 0.3s ease-out' : 'shake 0.4s ease-out' }}
              >
                {clipResult.isCorrect ? '✅' : '❌'}
              </div>
              
              <div className={`text-3xl font-black mb-2 ${clipResult.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {clipResult.isCorrect ? 'CORRECT!' : 'WRONG'}
              </div>
              
              {!clipResult.isCorrect && clipResult.myAnswer && (
                <div className="text-white/60 mb-4">
                  You guessed: {SECTION_INFO[clipResult.myAnswer]?.label}
                </div>
              )}
              
              {/* Score breakdown */}
              <div className="bg-black/30 rounded-xl p-4 w-full max-w-sm mb-4">
                <h3 className="text-sm font-bold text-white/70 mb-3 text-center">Score Breakdown</h3>
                
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {clipResult.correctPts > 0 && (
                    <ScoreItem value={clipResult.correctPts} label="Correct" emoji="✓" delay={0} />
                  )}
                  {clipResult.wrongPts > 0 && (
                    <ScoreItem value={-clipResult.wrongPts} label="Wrong" positive={false} delay={100} />
                  )}
                  {clipResult.speedBonus > 0 && (
                    <ScoreItem value={clipResult.speedBonus} label="Speed" emoji="⚡" delay={200} />
                  )}
                  {clipResult.streakBonus > 0 && (
                    <ScoreItem value={clipResult.streakBonus} label="Streak" emoji="🔥" delay={300} />
                  )}
                  {clipResult.safariPts > 0 && (
                    <ScoreItem value={clipResult.safariPts} label="Safari" emoji="🦁" delay={400} />
                  )}
                </div>
                
                <div className="text-center border-t border-white/20 pt-3">
                  <span className="text-white/60">This clip: </span>
                  <span className={`text-3xl font-black ${clipResult.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {clipResult.total >= 0 ? '+' : ''}<AnimatedNumber value={clipResult.total} duration={600} />
                  </span>
                </div>
              </div>
            </>
          )}
          
            <div className="text-white/60 text-sm">
              {totalClipsPlayed < 10 ? 'Next question coming...' : 'Final results coming...'}
            </div>
          </div>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // Halfway checkpoint (after question 5)
  if (gamePhase === 'roundSummary') {
    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
          <style>{styles}</style>
          <ActivityBanner />
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-3xl font-bold mb-2">Halfway There!</h1>

            <div className="bg-white/10 rounded-2xl p-6 text-center mb-4">
              <div className="text-lg text-white/70 mb-2">Your Score</div>
              <div className="text-5xl font-black text-yellow-400">
                <AnimatedNumber value={score} duration={1000} />
              </div>
              <div className="text-white/60 mt-2">Rank: #{rank} of {totalStudents}</div>
              {streak >= 2 && (
                <div className="flex justify-center mt-2">
                  <div className="flex items-center gap-1 bg-orange-500/30 px-3 py-1 rounded-full">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-orange-400 font-bold">{streak} streak!</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-white/60">
              5 more questions to go...
            </div>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // Finished - Enhanced view with prominent rank display
  if (gamePhase === 'finished') {
    const getRankEmoji = (r) => {
      if (r === 1) return '🥇';
      if (r === 2) return '🥈';
      if (r === 3) return '🥉';
      return '🎖️';
    };

    const getRankText = (r) => {
      if (r === 1) return '1st Place!';
      if (r === 2) return '2nd Place!';
      if (r === 3) return '3rd Place!';
      if (r) return `${r}${r === 11 || r === 12 || r === 13 ? 'th' : r % 10 === 1 ? 'st' : r % 10 === 2 ? 'nd' : r % 10 === 3 ? 'rd' : 'th'} Place`;
      return '';
    };

    return (
      <>
        <div className="h-screen flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white">
          <style>{styles}</style>
          <ActivityBanner />
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {/* Big rank display */}
            <div className="text-8xl mb-2">{getRankEmoji(rank)}</div>

            {/* Rank text */}
            {rank && (
              <div className="text-4xl font-black text-yellow-300 mb-4">
                {getRankText(rank)}
              </div>
            )}

            {/* Player identity card */}
            <div
              className="inline-flex flex-col items-center px-10 py-5 rounded-2xl mb-4 shadow-lg border-4 border-white/30"
              style={{ backgroundColor: playerColor || '#3B82F6' }}
            >
              <span className="text-5xl mb-2">{playerEmoji || '🎵'}</span>
              <span className="text-3xl font-black text-white">{playerName || 'Player'}</span>
            </div>

            {/* Score */}
            <div className="bg-black/30 rounded-2xl px-8 py-4 mb-4 text-center">
              <div className="text-lg text-white/70 mb-1">Final Score</div>
              <div className="text-5xl font-black text-yellow-400">{score}</div>
              {totalStudents > 1 && (
                <div className="text-sm text-white/50 mt-1">out of {totalStudents} players</div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-green-400">🎉 Game Complete!</h1>
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  return null;
};

export default SectionalLoopBuilderActivity;