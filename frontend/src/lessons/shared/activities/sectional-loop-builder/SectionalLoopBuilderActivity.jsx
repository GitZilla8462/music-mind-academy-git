// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderActivity.jsx
// Epic Wildlife - Student View
// 
// Features:
// - Tap to answer (no lock-in button)
// - Power-up selection (after first clip)
// - Animated score breakdown
// - Streak tracking, speed bonus, perfect bonus

import React, { useState, useEffect, useRef } from 'react';
import { Flame, Clock } from 'lucide-react';
import { useSession } from '../../../../context/SessionContext';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { generatePlayerName, getPlayerColor, getPlayerEmoji } from '../layer-detective/nameGenerator';

// ============ SCORING ============
const SCORING = {
  correct: 15,
  wrong: 5,
  speed: 10,
  streak: 5,
  maxStreak: 20
};

// Power-ups
const POWER_UPS = {
  double: { id: 'double', name: '2X', emoji: '✨', desc: 'Double points!', color: 'from-yellow-400 to-amber-500' },
  shield: { id: 'shield', name: 'SHIELD', emoji: '🛡️', desc: 'No penalties!', color: 'from-blue-400 to-cyan-500' },
  bonus: { id: 'bonus', name: '+15', emoji: '🎁', desc: 'Free points!', color: 'from-green-400 to-emerald-500' },
  speed: { id: 'speed', name: 'SPEED+', emoji: '⚡', desc: '5 sec bonus!', color: 'from-purple-400 to-pink-500' }
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
      const eased = 1 - Math.pow(1 - progress, 2);
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

const SectionalLoopBuilderActivity = ({ onComplete, viewMode = false }) => {
  const { sessionCode, userId } = useSession();
  
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
  const answeredRef = useRef({ answer: null, time: null, powerUp: null });
  
  // Power-up
  const [selectedPowerUp, setSelectedPowerUp] = useState(null);
  const [powerUpChoices, setPowerUpChoices] = useState([]);
  const [powerPickCountdown, setPowerPickCountdown] = useState(5);
  
  // Results for current clip
  const [clipResult, setClipResult] = useState(null);
  
  // Overall
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
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
  const [allSafariAssignments, setAllSafariAssignments] = useState({}); // Store all assignments for code lookup

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
  `;

  // Generate 3 random power-ups
  const generatePowerUpChoices = () => {
    const all = Object.values(POWER_UPS);
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

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
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        playerName: name,
        displayName: name,
        playerColor: color,
        playerEmoji: emoji,
        score: 0,
        streak: 0,
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
      
      // Always update countdown regardless of state change
      if (data.powerPickCountdown !== undefined) {
        setPowerPickCountdown(data.powerPickCountdown);
      }
      
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
          setSelectedPowerUp(null);
          setElapsedTime(0);
          answeredRef.current = { answer: null, time: null, powerUp: null };
          // Reset Safari state
          setSafariCodeInput('');
          setSafariComplete(false);
          setSafariBonus(0);
        }
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 100);
        }, 100);
      }
      
      // Power pick phase
      if (newPhase === 'powerPick') {
        setPowerUpChoices(generatePowerUpChoices());
        setSelectedPowerUp(null);
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
        setScore(students[userId].score || 0);
        setStreak(students[userId].streak || 0);
      }
    });
    
    return () => unsubscribe();
  }, [sessionCode, userId]);

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
      time: time,
      powerUp: selectedPowerUp
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

  // Select power-up
  const selectPowerUp = (pu) => {
    setSelectedPowerUp(pu);
    
    if (sessionCode && userId && !viewMode) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}/studentsJoined/${userId}`), {
        powerUp: pu.id,
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
      console.log('🦁 Wrong code, try again');
      // Could add shake animation or feedback here
    }
  };

  // Calculate score
  const calculateScore = (correct) => {
    const myAnswer = answeredRef.current.answer || selectedAnswer;
    const myTime = answeredRef.current.time ?? answerTime;
    const myPowerUp = answeredRef.current.powerUp || selectedPowerUp;
    const wasAnswered = myAnswer !== null;
    
    // Safari students automatically get correct (they were on Safari, not answering)
    const wasSafari = onSafari;
    const isCorrect = wasSafari ? true : (myAnswer === correct);
    
    console.log('📊 Score calc:', { myAnswer, correct, isCorrect, wasAnswered, wasSafari, safariBonus });
    
    // No answer and not on Safari = no points
    if (!wasAnswered && !wasSafari) {
      setClipResult({
        isCorrect: false,
        myAnswer: null,
        correctPts: 0,
        wrongPts: 0,
        speedBonus: 0,
        streakBonus: 0,
        bonusPts: 0,
        safariPts: 0,
        doubled: false,
        total: 0,
        newStreak: 0,
        noAnswer: true
      });
      return;
    }
    
    let correctPts = isCorrect ? SCORING.correct : 0;
    let wrongPts = (!isCorrect && !wasSafari) ? SCORING.wrong : 0;
    
    if (myPowerUp?.id === 'shield') wrongPts = 0;
    
    const speedThreshold = myPowerUp?.id === 'speed' ? 5000 : 3000;
    // Safari students don't get speed bonus (they weren't answering)
    const speedBonus = (!wasSafari && isCorrect && myTime !== null && myTime < speedThreshold) ? SCORING.speed : 0;
    
    const newStreak = isCorrect ? streak + 1 : 0;
    const streakBonus = newStreak >= 2 ? Math.min(newStreak * SCORING.streak, SCORING.maxStreak) : 0;
    
    const bonusPts = myPowerUp?.id === 'bonus' ? 15 : 0;
    
    // Include Safari bonus if they completed it
    const safariPts = safariBonus || 0;
    
    let total = Math.max(0, correctPts - wrongPts + speedBonus + streakBonus + bonusPts + safariPts);
    
    if (myPowerUp?.id === 'double') total *= 2;
    
    setClipResult({
      isCorrect,
      myAnswer: wasSafari ? 'SAFARI' : myAnswer,
      correctPts,
      wrongPts,
      speedBonus,
      streakBonus,
      bonusPts,
      safariPts,
      doubled: myPowerUp?.id === 'double',
      total,
      newStreak,
      wasSafari
    });
    
    const newScore = score + total;
    
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
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
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
    );
  }

  // Listen Intro screens - students just watch the main screen
  if (gamePhase === 'listenIntro1' || gamePhase === 'listenIntro2' || gamePhase === 'listenIntro3') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
        <div className="text-6xl mb-4">👀</div>
        <h1 className="text-3xl font-bold mb-2">Watch the Board!</h1>
        <p className="text-lg text-white/70 mb-4">Directions are on the main screen</p>
        <p className="text-white/60 animate-pulse">🎬 Get ready to listen...</p>
      </div>
    );
  }

  // Listening
  if (gamePhase === 'listening') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
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
    );
  }

  // Pre-Quiz - Get Ready
  if (gamePhase === 'preQuiz') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
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
    );
  }

  // Power Pick
  if (gamePhase === 'powerPick') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col p-4 text-white">
        <style>{styles}</style>
        
        {/* Header */}
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

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl mb-2">✨</div>
          <h2 className="text-2xl font-bold mb-2">Choose Your Power-Up!</h2>
          
          {/* Countdown Timer */}
          <div className="mb-4">
            <div className={`text-5xl font-black ${powerPickCountdown <= 2 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {powerPickCountdown}
            </div>
            <div className="text-white/60 text-xs">seconds</div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-4">
            {powerUpChoices.map((pu) => (
              <button
                key={pu.id}
                onClick={() => selectPowerUp(pu)}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedPowerUp?.id === pu.id
                    ? `bg-gradient-to-br ${pu.color} ring-4 ring-white scale-105`
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <div className="text-4xl mb-2">{pu.emoji}</div>
                <div className="font-bold">{pu.name}</div>
                <div className="text-xs text-white/70">{pu.desc}</div>
              </button>
            ))}
          </div>
          
          {selectedPowerUp && (
            <div className="text-green-400 font-bold text-lg">
              ✓ {selectedPowerUp.name} selected!
            </div>
          )}
          
          {!selectedPowerUp && (
            <p className="text-white/50 text-sm mt-2">Tap a power-up before time runs out!</p>
          )}
        </div>
      </div>
    );
  }

  // Guessing
  if (gamePhase === 'guessing') {
    // If on Safari, show Safari screen instead
    // Only show Safari if we have a valid target (with emoji and name)
    if (onSafari && safariTarget && safariTarget.emoji && safariTarget.name) {
      return (
        <div className="h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 flex flex-col p-4 text-white relative">
          <style>{styles}</style>
          
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
                <div className="text-6xl mb-4">🦁</div>
                <h1 className="text-4xl font-black mb-2 text-yellow-300">SAFARI TIME!</h1>
                <p className="text-xl mb-6 text-white/80">Leave your Chromebook and find the...</p>
                
                <div className="bg-white/20 rounded-2xl p-6 mb-6 text-center">
                  <div className="text-9xl">{safariTarget.emoji}</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-white/70 mb-3 text-center">Look for this on a classmate's screen:</p>
                  <div className="bg-black/50 rounded-xl p-4 flex items-center justify-center gap-4 border-2 border-yellow-400/50">
                    <span className="text-5xl">{safariTarget.emoji}</span>
                    <span className="text-5xl font-mono font-black text-yellow-300">1234</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <p className="text-lg text-white/70">Enter their code:</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={safariCodeInput}
                    onChange={(e) => setSafariCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="w-56 text-center text-5xl font-mono font-black bg-white/20 border-4 border-yellow-400 rounded-xl px-4 py-4 text-yellow-300 placeholder-white/30"
                    placeholder="____"
                  />
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
                </div>
                
                <p className="text-white/50 text-sm mt-4">⏱️ Check the board for time remaining!</p>
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
      );
    }
    
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col p-4 text-white relative">
        <style>{styles}</style>
        
        {/* Animal Badge - Top Right Corner - BIG for Safari hunters to find */}
        {myAnimal && (
          <div className="absolute top-4 right-4 bg-black/60 rounded-2xl p-4 text-center z-10 border-2 border-yellow-400/50">
            <div className="text-5xl mb-1">{myAnimal.emoji}</div>
            <div className="text-5xl font-mono font-black text-yellow-300">{myAnimal.code}</div>
          </div>
        )}
        
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
              {selectedPowerUp && (
                <div className={`px-2 py-1 rounded-full text-sm bg-gradient-to-r ${selectedPowerUp.color}`}>
                  {selectedPowerUp.emoji}
                </div>
              )}
              <div className="bg-white/10 px-3 py-1 rounded-lg">
                <span className="text-xl font-bold text-yellow-400">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Round/Clip info */}
        <div className="text-center mb-3">
          <div className="text-sm text-white/60">Round {currentRound} • Clip {currentClipIndex + 1}/4</div>
          <div className="text-2xl font-bold">🎧 Tap your answer!</div>
        </div>

        {/* Timer - only show if not answered */}
        {!hasAnswered && (
          <div className="text-center mb-3">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              elapsedTime < (selectedPowerUp?.id === 'speed' ? 5000 : 3000) ? 'bg-green-500/30 text-green-300' : 'bg-white/20'
            }`}>
              <Clock size={18} />
              <span className="font-mono text-xl font-bold">{formatTime(elapsedTime)}</span>
              {elapsedTime < (selectedPowerUp?.id === 'speed' ? 5000 : 3000) && <span className="text-sm">⚡ Speed Bonus!</span>}
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
              {answerTime < (selectedPowerUp?.id === 'speed' ? 5000 : 3000) && (
                <div className="text-yellow-400 mt-2">⚡ Speed Bonus!</div>
              )}
              <div className="text-white/60 mt-4">Waiting for reveal...</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Revealed - Show result + animated score breakdown (NOT "the answer was")
  if (gamePhase === 'revealed' && clipResult) {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col p-4 text-white">
        <style>{styles}</style>
        
        {/* Header */}
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>Round {currentRound} • Clip {currentClipIndex + 1}/4</div>
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
                🦁
              </div>
              
              <div className="text-3xl font-black mb-2 text-yellow-400">
                SAFARI SUCCESS!
              </div>
              
              {clipResult.safariPts > 0 ? (
                <div className="text-white/70 mb-4">You found the animal! +{clipResult.safariPts} bonus</div>
              ) : (
                <div className="text-white/70 mb-4">Auto-correct for Safari duty!</div>
              )}
              
              {/* Score breakdown */}
              <div className="bg-black/30 rounded-xl p-4 w-full max-w-sm mb-4">
                <h3 className="text-sm font-bold text-white/70 mb-3 text-center">Score Breakdown</h3>
                
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {clipResult.correctPts > 0 && (
                    <ScoreItem value={clipResult.correctPts} label="Auto ✓" emoji="🦁" delay={0} />
                  )}
                  {clipResult.safariPts > 0 && (
                    <ScoreItem value={clipResult.safariPts} label="Safari" emoji="🎯" delay={200} />
                  )}
                  {clipResult.streakBonus > 0 && (
                    <ScoreItem value={clipResult.streakBonus} label="Streak" emoji="🔥" delay={300} />
                  )}
                  {clipResult.doubled && (
                    <div 
                      className="bg-yellow-500/20 rounded-lg px-3 py-2 text-center"
                      style={{ animation: 'slideUp 0.3s ease-out 400ms both' }}
                    >
                      <div className="text-xl font-black text-yellow-400">×2</div>
                      <div className="text-xs text-yellow-200">Double!</div>
                    </div>
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
                  {clipResult.bonusPts > 0 && (
                    <ScoreItem value={clipResult.bonusPts} label="Bonus" emoji="🎁" delay={400} />
                  )}
                  {clipResult.safariPts > 0 && (
                    <ScoreItem value={clipResult.safariPts} label="Safari" emoji="🦁" delay={450} />
                  )}
                  {clipResult.doubled && (
                    <div 
                      className="bg-yellow-500/20 rounded-lg px-3 py-2 text-center"
                      style={{ animation: 'slideUp 0.3s ease-out 500ms both' }}
                    >
                      <div className="text-xl font-black text-yellow-400">×2</div>
                      <div className="text-xs text-yellow-200">Double!</div>
                    </div>
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
            {currentClipIndex < 3 ? 'Next clip coming...' : 'Round summary coming...'}
          </div>
        </div>
      </div>
    );
  }

  // Round Summary
  if (gamePhase === 'roundSummary') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-3xl font-bold mb-2">Round {currentRound} Complete!</h1>
        
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
          {currentRound < totalRounds ? 'Next round starting soon...' : 'Final results coming...'}
        </div>
      </div>
    );
  }

  // Finished
  if (gamePhase === 'finished') {
    return (
      <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex flex-col items-center justify-center p-6 text-white">
        <style>{styles}</style>
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-2">Game Complete!</h1>
        
        <div className="bg-white/10 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-2"
            style={{ backgroundColor: `${playerColor}30` }}>
            {playerEmoji}
          </div>
          <div className="text-lg" style={{ color: playerColor }}>{playerName}</div>
          <div className="text-4xl font-black text-yellow-400 mt-2">{score} pts</div>
          <div className="text-white/60">Final Rank: #{rank} of {totalStudents}</div>
        </div>
      </div>
    );
  }

  return null;
};

export default SectionalLoopBuilderActivity;