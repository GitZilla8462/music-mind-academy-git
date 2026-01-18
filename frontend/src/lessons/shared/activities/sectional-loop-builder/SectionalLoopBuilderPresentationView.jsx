// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderPresentationView.jsx
// Epic Wildlife - Teacher Presentation View
// 
// PHASES:
// 1. Setup - Choose rounds, random mood selected
// 2. Listening - Play full song, highlight sections
// 3. Quiz Loop (5 clips per round): guessing → revealed → powerPick
// 4. roundSummary → finished

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Users, Trophy, Eye, Settings, Shuffle } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';

import {
  LOOPS_BY_MOOD, MOOD_INFO, SECTION_INFO, SONG_STRUCTURE, SECTION_DURATION,
  generateSongStructure, shuffleArray, getRandomMood, SECTION_LOOP_NAMES
} from './SectionalLoopBuilderAudio';

import { sfx, animationStyles } from './SectionalLoopBuilderSFX';

// Student Activity Time Banner (matches Lesson 1/2 composition slides)
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

// Generate a random 4-digit code
const generateCode = () => String(Math.floor(1000 + Math.random() * 9000));

// Extract instrument name from file path (e.g., "/path/Heroic Bass 1.mp3" → "Bass")
const getInstrumentFromPath = (filePath) => {
  const fileName = filePath.split('/').pop().replace(/\.(mp3|wav)$/, '');
  // Remove mood prefix and number suffix, extract instrument
  const instruments = ['Bass', 'Brass', 'Drums', 'Strings', 'Synth', 'Vocals', 'Piano', 'Guitar', 'Bells', 'Clarinet', 'Percussion', 'Keys', 'SynthLead'];
  for (const inst of instruments) {
    if (fileName.includes(inst)) return inst === 'SynthLead' ? 'Synth Lead' : inst;
  }
  return 'Loop';
};

// Instrument emoji helper
const getInstrumentEmoji = (instrument) => {
  const emojiMap = {
    'Drums': '🥁',
    'Bass': '🎸',
    'Brass': '🎺',
    'Strings': '🎻',
    'Piano': '🎹',
    'Synth': '🎛️',
    'Synth Lead': '🎛️',
    'Guitar': '🎸',
    'Vocals': '🎤',
    'Bells': '🔔',
    'Clarinet': '🎵',
    'Percussion': '🥁',
    'Keys': '🎹'
  };
  return emojiMap[instrument] || '🎵';
};

// Instrument color helper
const getInstrumentColor = (instrument) => {
  const colorMap = {
    'Drums': '#EF4444',
    'Bass': '#6366F1',
    'Brass': '#F59E0B',
    'Strings': '#10B981',
    'Piano': '#3B82F6',
    'Synth': '#A855F7',
    'Synth Lead': '#EC4899',
    'Guitar': '#F97316',
    'Vocals': '#14B8A6',
    'Bells': '#FBBF24',
    'Clarinet': '#8B5CF6',
    'Percussion': '#DC2626',
    'Keys': '#0EA5E9'
  };
  return colorMap[instrument] || '#6B7280';
};

const SectionalLoopBuilderPresentationView = ({ sessionData, onAdvanceLesson }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');
  
  // Setup
  const [totalRounds, setTotalRounds] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [sectionAudio, setSectionAudio] = useState(null);
  const [quizOrder, setQuizOrder] = useState(['intro', 'a', 'aPrime', 'a', 'outro']);
  
  // Game state
  const [gamePhase, setGamePhase] = useState('setup');
  const [currentRound, setCurrentRound] = useState(0);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(null);
  const [totalClipsPlayed, setTotalClipsPlayed] = useState(0);
  
  // Playback
  const [currentPlayPosition, setCurrentPlayPosition] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio refs
  const audioRefs = useRef([]);
  const timeoutRef = useRef(null);
  
  // Students
  const [students, setStudents] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Reveal animation state
  const [revealStep, setRevealStep] = useState(0);
  const [scoreChanges, setScoreChanges] = useState({});
  const [previousRanks, setPreviousRanks] = useState({});
  const [streakCallout, setStreakCallout] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [newLeader, setNewLeader] = useState(null);
  
  // Power-up countdown
  const [powerPickCountdown, setPowerPickCountdown] = useState(5);
  const countdownRef = useRef(null);
  const countdownStartedRef = useRef(false);

  // Refs for values used in countdown callback (to avoid stale closures)
  const currentClipIndexRef = useRef(currentClipIndex);
  const totalClipsPlayedRef = useRef(totalClipsPlayed);
  const quizOrderRef = useRef(quizOrder);
  const studentsRef = useRef(students);
  const playSectionAudioRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { currentClipIndexRef.current = currentClipIndex; }, [currentClipIndex]);
  useEffect(() => { totalClipsPlayedRef.current = totalClipsPlayed; }, [totalClipsPlayed]);
  useEffect(() => { quizOrderRef.current = quizOrder; }, [quizOrder]);
  useEffect(() => { studentsRef.current = students; }, [students]);
  // Note: playSectionAudioRef is updated after the function is defined below

  // Safari state
  const [safariAssignments, setSafariAssignments] = useState({}); // { studentId: { emoji, name, code } }
  const [safariHunters, setSafariHunters] = useState([]); // [{ studentId, name, targetEmoji, targetName }]
  const [studentsWhoWentOnSafari, setStudentsWhoWentOnSafari] = useState(new Set());
  const [safariTimer, setSafariTimer] = useState(45);
  const safariTimerRef = useRef(null);
  const safariTimerStartedRef = useRef(false);


  // Firebase: Update game state
  const updateGame = useCallback((data) => {
    if (!sessionCode) return;
    const db = getDatabase();
    update(ref(db, `sessions/${sessionCode}`), {
      activityData: { ...data, activity: 'sectional-loop-builder' }
    });
  }, [sessionCode]);

  // Firebase: Subscribe to students
  useEffect(() => {
    if (!sessionCode) return;
    const db = getDatabase();
    const studentsRef = ref(db, `sessions/${sessionCode}/studentsJoined`);
    
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.entries(data).map(([id, s]) => ({
        id,
        name: s.playerName || s.displayName || s.name || 'Student',
        score: s.score || 0,
        streak: s.streak || 0,
        currentAnswer: s.currentAnswer,
        lockedIn: s.lockedIn || false,
        answerTime: s.answerTime,
        powerUp: s.powerUp,
        lastClipScore: s.lastClipScore || 0,
        playerColor: s.playerColor || '#3B82F6',
        playerEmoji: s.playerEmoji || '🎵',
        safariComplete: s.safariComplete || false,
        safariBonus: s.safariBonus || 0
      }));
      
      setStudents(list);
      setLockedCount(list.filter(s => s.lockedIn).length);
      setLeaderboard([...list].sort((a, b) => b.score - a.score));
    });
    
    return () => unsubscribe();
  }, [sessionCode]);

  // ============ AUDIO PLAYBACK ============
  const stopAudio = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    audioRefs.current.forEach(a => { a.pause(); a.currentTime = 0; });
    audioRefs.current = [];
    setIsPlaying(false);
    setCurrentPlayPosition(-1);
  }, []);

  const playSectionAudio = useCallback((section, onEnd = null) => {
    if (!sectionAudio?.[section]) return;

    audioRefs.current.forEach(a => { a.pause(); a.currentTime = 0; });

    const audios = sectionAudio[section].map(file => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = file;
      audio.volume = 0.7;
      return audio;
    });
    audioRefs.current = audios;

    // Preload all audio, then play simultaneously for sync
    Promise.all(audios.map(a => new Promise((resolve) => {
      if (a.readyState >= 3) return resolve(); // Already loaded
      a.addEventListener('canplaythrough', resolve, { once: true });
      a.load();
    }))).then(() => {
      // All audio loaded - play all at the exact same moment
      audios.forEach(a => a.play().catch(console.error));
      setIsPlaying(true);
    }).catch(console.error);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      audioRefs.current.forEach(a => { a.pause(); a.currentTime = 0; });
      setIsPlaying(false);
      if (onEnd) onEnd();
    }, SECTION_DURATION);
  }, [sectionAudio]);

  // Keep playSectionAudio ref in sync (for use in countdown effect without causing re-runs)
  useEffect(() => { playSectionAudioRef.current = playSectionAudio; }, [playSectionAudio]);

  // Start the actual listening phase with audio
  const startListeningAudio = useCallback(() => {
    if (!sectionAudio) return;
    
    setGamePhase('listening');
    updateGame({ gamePhase: 'listening', mood: currentMood });
    
    sfx.tick();
    setTimeout(() => sfx.reveal(), 300);
    
    const songAudios = SONG_STRUCTURE.map(pos => ({
      section: pos.section,
      audios: sectionAudio[pos.section].map(file => {
        const audio = new Audio(file);
        audio.volume = 0;
        return audio;
      })
    }));
    
    let positionIndex = 0;
    const FADE_DURATION = 150;
    const OVERLAP = 100;
    
    const fadeIn = (audios) => {
      audios.forEach(a => { a.currentTime = 0; a.volume = 0; a.play().catch(() => {}); });
      let step = 0;
      const interval = setInterval(() => {
        step++;
        audios.forEach(a => { a.volume = 0.7 * (step / 10); });
        if (step >= 10) clearInterval(interval);
      }, FADE_DURATION / 10);
    };
    
    const fadeOut = (audios) => {
      let step = 0;
      const startVol = audios[0]?.volume || 0.7;
      const interval = setInterval(() => {
        step++;
        audios.forEach(a => { a.volume = Math.max(0, startVol * (1 - step / 10)); });
        if (step >= 10) { clearInterval(interval); audios.forEach(a => a.pause()); }
      }, FADE_DURATION / 10);
    };
    
    const playNext = () => {
      if (positionIndex >= SONG_STRUCTURE.length) {
        if (audioRefs.current.length > 0) fadeOut(audioRefs.current);
        setCurrentPlayPosition(-1);
        setIsPlaying(false);
        setGamePhase('listenIntro3');
        updateGame({ gamePhase: 'listenIntro3' });
        return;
      }
      
      setCurrentPlayPosition(positionIndex);
      setIsPlaying(true);
      
      if (positionIndex > 0 && audioRefs.current.length > 0) fadeOut(audioRefs.current);
      
      fadeIn(songAudios[positionIndex].audios);
      audioRefs.current = songAudios[positionIndex].audios;
      positionIndex++;
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(playNext, SECTION_DURATION - OVERLAP);
    };
    
    setTimeout(playNext, 100);
  }, [updateGame, sectionAudio, currentMood]);

  // ============ GAME FLOW ============
  const startRound = useCallback((roundNum) => {
    stopAudio();
    setCurrentRound(roundNum);
    setCurrentClipIndex(0);

    const section = quizOrder[0];
    setCurrentSection(section);
    setGamePhase('guessing');

    const newTotalClips = (roundNum - 1) * 5 + 1;
    setTotalClipsPlayed(newTotalClips);

    // Set up Safari for this clip (same logic as startClipGuessing)
    const shuffledAnimals = [...SAFARI_ANIMALS].sort(() => Math.random() - 0.5);
    const newAssignments = {};
    students.forEach((s, idx) => {
      const animal = shuffledAnimals[idx % shuffledAnimals.length];
      newAssignments[s.id] = {
        emoji: animal.emoji,
        name: animal.name,
        code: generateCode()
      };
    });
    setSafariAssignments(newAssignments);

    // Safari requires at least 3 students
    let hunters = [];
    console.log('🦁 startRound - students.length:', students.length);
    if (students.length >= 3) {
      const eligibleStudents = students.filter(s => !studentsWhoWentOnSafari.has(s.id));
      let finalEligible = eligibleStudents.length >= 2 ? eligibleStudents : students;

      if (eligibleStudents.length < 2) {
        setStudentsWhoWentOnSafari(new Set());
      }

      const shuffledEligible = [...finalEligible].sort(() => Math.random() - 0.5);
      hunters = shuffledEligible.slice(0, 2).map(s => {
        const validTargets = students.filter(other => other.id !== s.id && newAssignments[other.id]);
        if (validTargets.length === 0) return null;
        const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
        const targetAssignment = newAssignments[randomTarget.id];
        console.log('🦁 Safari hunter:', s.name, '→ looking for:', targetAssignment.emoji, targetAssignment.name);
        return {
          studentId: s.id,
          name: s.name,
          targetEmoji: targetAssignment.emoji,
          targetName: targetAssignment.name
        };
      }).filter(h => h !== null);

      setStudentsWhoWentOnSafari(prev => {
        const newSet = new Set(prev);
        hunters.forEach(h => newSet.add(h.studentId));
        return newSet;
      });
    }
    setSafariHunters(hunters);
    setSafariTimer(45);
    safariTimerStartedRef.current = false;

    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          currentAnswer: null, lockedIn: false, lastClipScore: 0, safariComplete: false, safariBonus: 0
        });
      });
    }

    updateGame({
      gamePhase: 'guessing', currentRound: roundNum, currentClipIndex: 0,
      totalRounds, quizOrder, correctAnswer: section, totalClipsPlayed: newTotalClips,
      safariAssignments: newAssignments,
      safariHunters: hunters,
      safariTimer: hunters.length > 0 ? 45 : 0
    });

    playSectionAudio(section);
  }, [stopAudio, sessionCode, students, totalRounds, quizOrder, playSectionAudio, updateGame, studentsWhoWentOnSafari]);

  // Start power-up countdown - called directly, not via useEffect
  // This avoids React effect lifecycle issues that were causing the timer to stop early
  // When countdown reaches 0, it just stops - teacher must click to advance
  const startPowerPickCountdown = useCallback(() => {
    // Clear any existing countdown
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }

    const currentSessionCode = sessionCode;
    const db = getDatabase();

    // Start at 5
    let count = 5;
    setPowerPickCountdown(5);

    update(ref(db, `sessions/${currentSessionCode}`), {
      activityData: {
        activity: 'sectional-loop-builder',
        gamePhase: 'powerPick',
        currentClipIndex: currentClipIndexRef.current,
        totalClipsPlayed: totalClipsPlayedRef.current,
        powerPickCountdown: 5
      }
    });

    // Use setTimeout chain instead of setInterval for more reliable timing
    const tick = () => {
      count -= 1;
      setPowerPickCountdown(count);

      // Update Firebase with countdown
      update(ref(db, `sessions/${currentSessionCode}`), {
        activityData: {
          activity: 'sectional-loop-builder',
          gamePhase: 'powerPick',
          currentClipIndex: currentClipIndexRef.current,
          totalClipsPlayed: totalClipsPlayedRef.current,
          powerPickCountdown: count
        }
      });

      if (count <= 0) {
        // Countdown done - just stop and wait for teacher to click Play Clip button
        countdownRef.current = null;
      } else {
        // Schedule next tick
        countdownRef.current = setTimeout(tick, 1000);
      }
    };

    // Start first tick after 1 second
    countdownRef.current = setTimeout(tick, 1000);
  }, [sessionCode]);

  const nextClip = useCallback(() => {
    setRevealStep(0);
    setScoreChanges({});
    setPreviousRanks({});
    setStreakCallout(null);
    setNewLeader(null);
    setCorrectCount(0);

    const nextIndex = currentClipIndex + 1;

    if (nextIndex >= quizOrder.length) {
      setGamePhase('roundSummary');
      updateGame({ gamePhase: 'roundSummary' });
      return;
    }

    const newTotalClips = totalClipsPlayed + 1;
    if (newTotalClips > 1) {
      setCurrentClipIndex(nextIndex);
      setCurrentSection(quizOrder[nextIndex]);
      setTotalClipsPlayed(newTotalClips);
      setGamePhase('powerPick');

      if (sessionCode) {
        const db = getDatabase();
        students.forEach(s => {
          update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
            currentAnswer: null, lockedIn: false, lastClipScore: 0, powerUp: null
          });
        });
      }

      // Start countdown directly - don't rely on useEffect
      startPowerPickCountdown();
    } else {
      startClipGuessing(nextIndex, newTotalClips);
    }
  }, [currentClipIndex, totalClipsPlayed, sessionCode, students, updateGame, quizOrder, startPowerPickCountdown]);

  const startClipGuessing = useCallback((clipIndex, clipNum) => {
    const section = quizOrder[clipIndex];
    setCurrentClipIndex(clipIndex);
    setCurrentSection(section);
    setTotalClipsPlayed(clipNum);
    setGamePhase('guessing');
    
    // Assign animals and codes to students (shuffle each clip)
    const shuffledAnimals = [...SAFARI_ANIMALS].sort(() => Math.random() - 0.5);
    const newAssignments = {};
    students.forEach((s, idx) => {
      const animal = shuffledAnimals[idx % shuffledAnimals.length];
      newAssignments[s.id] = {
        emoji: animal.emoji,
        name: animal.name,
        code: generateCode()
      };
    });
    setSafariAssignments(newAssignments);

    // Safari requires at least 3 students (2 hunters + 1 target minimum)
    let hunters = [];
    console.log('🦁 startClipGuessing - students.length:', students.length);
    if (students.length >= 3) {
      // Pick 2 students who haven't gone on Safari yet
      const eligibleStudents = students.filter(s => !studentsWhoWentOnSafari.has(s.id));
      
      // If everyone has gone, reset the list
      let finalEligible = eligibleStudents;
      if (eligibleStudents.length < 2) {
        setStudentsWhoWentOnSafari(new Set());
        finalEligible = students;
      }
      
      // Pick 2 random students
      const shuffledEligible = [...finalEligible].sort(() => Math.random() - 0.5);
      hunters = shuffledEligible.slice(0, 2).map(s => {
        // Find a target animal (not their own) - only pick from students with valid assignments
        const validTargets = students.filter(other =>
          other.id !== s.id && newAssignments[other.id]
        );

        if (validTargets.length === 0) {
          console.error('❌ No valid Safari targets found!');
          return null;
        }

        const randomTarget = validTargets[Math.floor(Math.random() * validTargets.length)];
        const targetAssignment = newAssignments[randomTarget.id];

        console.log('🦁 Safari hunter:', s.name, '→ looking for:', targetAssignment.emoji, targetAssignment.name);

        return {
          studentId: s.id,
          name: s.name,
          targetEmoji: targetAssignment.emoji,
          targetName: targetAssignment.name
        };
      }).filter(h => h !== null);
      
      setStudentsWhoWentOnSafari(prev => {
        const newSet = new Set(prev);
        hunters.forEach(h => newSet.add(h.studentId));
        return newSet;
      });
    }
    
    setSafariHunters(hunters);
    
    // Reset Safari timer
    setSafariTimer(45);
    safariTimerStartedRef.current = false;
    
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          currentAnswer: null, lockedIn: false, lastClipScore: 0, safariComplete: false, safariBonus: 0
        });
      });
    }
    
    updateGame({
      gamePhase: 'guessing', 
      currentClipIndex: clipIndex, 
      correctAnswer: section, 
      totalClipsPlayed: clipNum,
      safariAssignments: newAssignments,
      safariHunters: hunters,
      safariTimer: hunters.length > 0 ? 45 : 0
    });
    
    playSectionAudio(section);
  }, [sessionCode, students, quizOrder, playSectionAudio, updateGame, studentsWhoWentOnSafari]);

  const startNextClipAfterPowerPick = useCallback(() => {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setPowerPickCountdown(0);
    startClipGuessing(currentClipIndex, totalClipsPlayed);
  }, [currentClipIndex, totalClipsPlayed, startClipGuessing]);

  // Safari timer effect (45 second countdown during guessing)
  // OPTIMIZED: Send start timestamp once, students calculate locally
  useEffect(() => {
    if (gamePhase !== 'guessing') {
      if (safariTimerRef.current) {
        clearInterval(safariTimerRef.current);
        safariTimerRef.current = null;
      }
      safariTimerStartedRef.current = false;
      return;
    }

    if (safariTimerStartedRef.current) return;
    safariTimerStartedRef.current = true;

    setSafariTimer(45);

    // Send start timestamp ONCE to Firebase - students calculate remaining time locally
    if (sessionCode && safariHunters.length > 0) {
      const db = getDatabase();
      update(ref(db, `sessions/${sessionCode}`), {
        'activityData/safariTimerStart': Date.now()
      });
    }

    // Local countdown for teacher display only (no Firebase updates)
    let count = 45;
    safariTimerRef.current = setInterval(() => {
      count -= 1;
      setSafariTimer(count);

      if (count <= 0) {
        clearInterval(safariTimerRef.current);
        safariTimerRef.current = null;
      }
    }, 1000);

    return () => {
      if (safariTimerRef.current) {
        clearInterval(safariTimerRef.current);
        safariTimerRef.current = null;
      }
    };
  }, [gamePhase, currentClipIndex, sessionCode, safariHunters]);

  // ============ REVEAL SEQUENCE ============
  const reveal = useCallback(() => {
    console.log('🎯 REVEAL CALLED - timestamp:', Date.now());
    console.log('🎯 Current gamePhase:', gamePhase, 'currentSection:', currentSection);

    stopAudio();

    const prevRanks = {};
    leaderboard.forEach((s, idx) => { prevRanks[s.id] = idx + 1; });
    setPreviousRanks(prevRanks);

    const changes = {};
    let correct = 0;
    let highestStreak = { name: null, streak: 0 };

    // Check which students are on Safari
    const safariStudentIds = new Set(safariHunters.map(h => h.studentId));

    students.forEach(s => {
      const isOnSafari = safariStudentIds.has(s.id);
      const isCorrect = isOnSafari ? true : (s.currentAnswer === currentSection); // Safari students auto-correct
      const wasLocked = isOnSafari ? true : s.lockedIn; // Safari students count as locked

      if (wasLocked) {
        if (isCorrect) {
          correct++;
          const speedBonus = (!isOnSafari && s.answerTime && s.answerTime < 3000) ? 10 : 0;
          const newStreak = (s.streak || 0) + 1;
          const streakBonus = newStreak >= 2 ? Math.min(newStreak * 5, 20) : 0;
          let delta = 15 + speedBonus + streakBonus;

          // Add Safari bonus if they completed it
          if (isOnSafari && s.safariComplete) {
            delta += (s.safariBonus || 50);
          }

          if (s.powerUp === 'bonus') delta += 15;
          if (s.powerUp === 'double') delta *= 2;

          changes[s.id] = { delta, isCorrect: true, safari: isOnSafari, safariComplete: s.safariComplete };

          if (newStreak > highestStreak.streak) {
            highestStreak = { name: s.name, streak: newStreak };
          }
        } else {
          let delta = s.powerUp === 'shield' ? 0 : -5;
          changes[s.id] = { delta, isCorrect: false };
        }
      } else {
        changes[s.id] = { delta: 0, isCorrect: false, noAnswer: true };
      }
    });

    setScoreChanges(changes);
    setCorrectCount(correct);

    console.log('🎯 About to update Firebase with revealed phase - timestamp:', Date.now());
    // Send to students IMMEDIATELY so they see their result right away
    updateGame({ gamePhase: 'revealed', correctAnswer: currentSection });

    // Set LOCAL gamePhase IMMEDIATELY so teacher UI updates right away
    // (Firebase update propagates to students, but teacher sees it instantly)
    console.log('🎯 Setting LOCAL gamePhase to revealed - timestamp:', Date.now());
    setGamePhase('revealed');

    console.log('🎯 Setting revealStep to 2 IMMEDIATELY - timestamp:', Date.now());
    // Reveal sequence - show answer IMMEDIATELY, but delay button so students have time to see results
    setRevealStep(2); // Skip drumroll, show answer immediately
    console.log('🎯 revealStep set to 2, gamePhase set to revealed - timestamp:', Date.now());
    sfx.reveal();

    // Play the audio so students can hear the correct answer (like Layer Detective)
    setTimeout(() => {
      playSectionAudio(currentSection);
    }, 300);

    // Update scores (500ms)
    setTimeout(() => {
      setRevealStep(3);

      if (sessionCode) {
        const db = getDatabase();
        students.forEach(s => {
          const change = changes[s.id];
          if (change) {
            const isCorrect = change.isCorrect;
            const newStreak = isCorrect ? (s.streak || 0) + 1 : 0;
            update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
              score: (s.score || 0) + change.delta,
              streak: newStreak,
              lastClipScore: change.delta
            });
          }
        });
      }

      let popDelay = 0;
      students.forEach(s => {
        if (changes[s.id]?.delta > 0) {
          setTimeout(() => sfx.scorePop(), popDelay);
          popDelay += 50;
        }
      });
    }, 500);

    // Streak callouts (1s)
    setTimeout(() => {
      setRevealStep(4);
      if (highestStreak.streak >= 3) {
        setStreakCallout(highestStreak);
        sfx.streak();
      }
    }, 1000);

    // Button appears after 4 seconds - gives students time to see their result
    setTimeout(() => {
      const newLeaderboard = [...students]
        .map(s => ({ ...s, score: (s.score || 0) + (changes[s.id]?.delta || 0) }))
        .sort((a, b) => b.score - a.score);

      if (newLeaderboard[0] && prevRanks[newLeaderboard[0].id] !== 1) {
        setNewLeader(newLeaderboard[0].name);
        sfx.newLeader();
      }

      setRevealStep(5);
      setGamePhase('revealed');
    }, 4000);
  }, [stopAudio, leaderboard, students, currentSection, sessionCode, updateGame, playSectionAudio, safariHunters]);

  const nextRoundOrFinish = useCallback(() => {
    if (currentRound >= totalRounds) {
      sfx.fanfare();
      setGamePhase('finished');
      updateGame({ gamePhase: 'finished' });
    } else {
      sfx.roundEnd();
      startRound(currentRound + 1);
    }
  }, [currentRound, totalRounds, startRound, updateGame]);

  const replaySection = useCallback(() => {
    if (currentSection) playSectionAudio(currentSection);
  }, [currentSection, playSectionAudio]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  // ============ SETUP HANDLERS ============
  const handleSelectRounds = (n) => {
    const mood = getRandomMood();
    setCurrentMood(mood);
    setSectionAudio(generateSongStructure(mood));
    setQuizOrder(shuffleArray(['intro', 'a', 'aPrime', 'a', 'outro']));
    setTotalRounds(n);
  };

  const handleRerollMood = () => {
    const mood = getRandomMood();
    setCurrentMood(mood);
    setSectionAudio(generateSongStructure(mood));
    setQuizOrder(shuffleArray(['intro', 'a', 'aPrime', 'a', 'outro']));
  };

  const showLeaderboard = ['guessing', 'revealed', 'powerPick', 'roundSummary', 'finished'].includes(gamePhase);
  const hideHeaderPhases = ['listenIntro3', 'listening'];
  const hideHeader = hideHeaderPhases.includes(gamePhase);

  // ============ RENDER ============
  return (
    <div
      className="absolute inset-0 flex flex-col bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white overflow-hidden"
    >
      {/* Student Activity Banner */}
      <ActivityBanner />

      {/* Main content area */}
      <div className="flex-1 p-4 overflow-auto flex flex-col">
        {/* Header - hidden during listening phases */}
        {!hideHeader && (
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🌍</span>
              <h1 className="text-4xl font-bold">Epic Wildlife</h1>
              {currentMood && (
                <span className="bg-white/10 px-4 py-2 rounded-full text-xl flex items-center gap-2">
                  {MOOD_INFO[currentMood]?.emoji} {currentMood}
                </span>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-2xl"><Users size={28} /><span>{students.length}</span></div>
            </div>
          </div>
        )}

      {/* Main content */}
      <div className={`grid ${showLeaderboard ? 'grid-cols-3' : 'grid-cols-1'} gap-3 flex-1 min-h-0`}>
        <div className={`${showLeaderboard ? 'col-span-2' : ''} ${hideHeader ? '' : 'bg-black/20'} rounded-2xl p-6 flex items-center justify-center min-h-0`}>
          
          {/* Setup - auto-select 10 questions (2 rounds x 5 clips) */}
          {gamePhase === 'setup' && !totalRounds && (
            <div className="text-center">
              <Settings size={100} className="mx-auto mb-6 text-white/50" />
              <h2 className="text-5xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-2xl text-white/70 mb-8">10 questions • Listen and identify the section!</p>
              <div className="flex gap-6 justify-center">
                <button onClick={() => handleSelectRounds(2)}
                  className="px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-2xl text-3xl font-bold hover:scale-105 transition-all">
                  Start Game
                </button>
              </div>
            </div>
          )}

          {/* Pre-listening */}
          {gamePhase === 'setup' && totalRounds && currentMood && (
            <div className="text-center">
              <h2 className="text-6xl font-black mb-8">Listen to the Full Song</h2>
              <div className="bg-white/10 rounded-2xl p-8 max-w-5xl mx-auto mb-8">
                <div className="grid grid-cols-5 gap-6">
                  {[
                    { key: 'intro', label: 'INTRO' },
                    { key: 'a', label: 'A' },
                    { key: 'aPrime', label: "A'" },
                    { key: 'a', label: 'A' },
                    { key: 'outro', label: 'OUTRO' }
                  ].map((section, idx) => {
                    const info = SECTION_INFO[section.key];
                    return (
                      <div key={idx} className="p-6 rounded-2xl text-center" style={{ backgroundColor: `${info.color}30` }}>
                        <div className="font-black text-4xl mb-2" style={{ color: info.color }}>{section.label}</div>
                        <div className="text-white/70 text-2xl">{sectionAudio?.[section.key]?.length || 0} layers</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button onClick={startListeningAudio} className="px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-3xl font-bold flex items-center gap-3 hover:scale-105 transition-all">
                  <Play size={40} /> Start Listening
                </button>
                <button onClick={() => { setGamePhase('preQuiz'); updateGame({ gamePhase: 'preQuiz' }); }}
                  className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg opacity-50 hover:opacity-100">Skip</button>
              </div>
            </div>
          )}

          {/* Safari Directions */}
          {gamePhase === 'listenIntro3' && (
            <div className="text-center flex flex-col items-center justify-center">
              <h1 className="text-5xl font-black mb-6 text-amber-300">Safari Bonus Round!</h1>

              <div className="bg-white/10 rounded-2xl p-6 max-w-4xl mb-6">
                {/* Step 1 */}
                <p className="text-2xl font-bold text-white mb-4">1. Each round, 2 students will have a screen that looks like this:</p>

                {/* Mockup of Safari Hunter Screen */}
                <div className="bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900 rounded-2xl p-6 mb-6 max-w-md mx-auto border-4 border-yellow-400">
                  <div className="text-2xl font-black text-yellow-300 mb-3">SAFARI TIME!</div>
                  <p className="text-white/80 mb-2">Find the student with this animal:</p>
                  <div className="bg-white/20 rounded-2xl p-4 mb-4 border-4 border-yellow-400">
                    <div className="text-8xl">🦁</div>
                  </div>
                  <p className="text-white/70 mb-2">Enter their code:</p>
                  <div className="bg-white/20 rounded-xl px-4 py-3 border-4 border-yellow-400">
                    <span className="text-4xl font-mono font-black text-yellow-300/50">_ _ _ _</span>
                  </div>
                </div>

                {/* Step 2 */}
                <p className="text-2xl font-bold text-white mb-3">2. Go on a safari around the room and look at other students' Chromebooks.</p>
                <p className="text-xl text-white/80 mb-4">They will have an animal and a code. If someone has YOUR animal, copy the code from their device and type it into your device before the time runs out!</p>

                <p className="text-lg text-green-400 font-bold">+50 bonus points for finding your animal! Safari students also get the question correct automatically! 🎉</p>
              </div>

              <button
                onClick={() => { setGamePhase('preQuiz'); updateGame({ gamePhase: 'preQuiz' }); }}
                className="px-12 py-5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-3xl font-bold hover:scale-105 transition-all"
              >
                Next →
              </button>
            </div>
          )}

          {/* Listening - 5 cards: INTRO, A, A', A, OUTRO */}
          {gamePhase === 'listening' && (
            <div className="text-center w-full">
              {/* Directions at top - clean, white, big */}
              <h1 className="text-5xl font-bold text-white mb-8">
                Listen to each section!
              </h1>

              {/* Section Cards - 5 cards: INTRO, A, A', A, OUTRO with actual loop names */}
              <div className="flex justify-center gap-3 max-w-6xl mx-auto mb-6">
                {(() => {
                  // Use actual loop names from SECTION_LOOP_NAMES
                  const sectionLoops = [
                    { section: 'intro', loops: SECTION_LOOP_NAMES.intro },
                    { section: 'a', loops: SECTION_LOOP_NAMES.a },
                    { section: 'aPrime', loops: SECTION_LOOP_NAMES.aPrime },
                    { section: 'a', loops: SECTION_LOOP_NAMES.a },
                    { section: 'outro', loops: SECTION_LOOP_NAMES.outro }
                  ];

                  return sectionLoops.map((item, idx) => {
                    const info = SECTION_INFO[item.section];
                    const isPlaying = currentPlayPosition === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl text-center transition-all duration-300 flex-1 min-w-0 ${
                          isPlaying ? 'ring-4 ring-white scale-105 shadow-lg' : ''
                        }`}
                        style={{
                          backgroundColor: isPlaying ? `${info.color}60` : `${info.color}25`,
                          borderColor: info.color,
                          borderWidth: '3px'
                        }}
                      >
                        <div className="text-2xl font-black mb-3" style={{ color: info.color }}>{info.label}</div>

                        {/* Loop names listed vertically */}
                        <div className="space-y-1">
                          {item.loops.map((loopName, loopIdx) => (
                            <div
                              key={loopIdx}
                              className="text-sm font-medium text-white/90 bg-black/20 rounded px-2 py-1"
                            >
                              {loopName}
                            </div>
                          ))}
                        </div>

                        {isPlaying && (
                          <div className="mt-3 text-sm font-bold text-white bg-white/20 rounded-full px-3 py-1">
                            NOW PLAYING
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              <button onClick={() => { stopAudio(); setGamePhase('listenIntro3'); updateGame({ gamePhase: 'listenIntro3' }); }}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg opacity-50 hover:opacity-100">Skip</button>
            </div>
          )}

          {/* Pre-Quiz */}
          {gamePhase === 'preQuiz' && (
            <div className="text-center">
              <div className="text-9xl mb-6">🎯</div>
              <h1 className="text-6xl font-black mb-4">Get Ready!</h1>
              <p className="text-3xl text-white/70 mb-8">10 questions • What section is this?</p>
              <button onClick={() => startRound(1)} className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-3xl font-bold flex items-center gap-3 mx-auto hover:scale-105 transition-all">
                <Play size={40} /> Question 1
              </button>
            </div>
          )}

          {/* Guessing */}
          {gamePhase === 'guessing' && (
            <div className="text-center relative w-full self-start">
              {/* Question Indicator - top right */}
              <div className="absolute top-0 right-0 text-xl font-bold text-white/60 z-10 bg-black/30 px-3 py-1 rounded-lg">Question {totalClipsPlayed} of 10</div>

              {/* Main question */}
              <div className="text-5xl font-black text-white mb-4">What section is this?</div>

              {/* Safari Timer - big countdown */}
              {safariHunters.length > 0 && (
                <div className="mb-4">
                  <div className={`inline-block px-6 py-3 rounded-2xl ${safariTimer <= 5 ? 'bg-red-500/30' : 'bg-amber-500/30'}`}>
                    <span className={`text-6xl font-black ${safariTimer <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-300'}`}>
                      ⏱️ {safariTimer}s
                    </span>
                  </div>
                </div>
              )}

              {/* Safari Hunters Display */}
              {safariHunters.length > 0 && (
                <div className="flex justify-center gap-4 mb-4">
                  {safariHunters.map((hunter, idx) => (
                    <div key={idx} className="bg-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="text-2xl">{hunter.targetEmoji}</span>
                      <span className="text-xl font-bold text-amber-300">{hunter.name}</span>
                      <span className="text-white/70">is on safari...</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Section Options - visible to students and teacher */}
              <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto mb-4">
                {Object.entries(SECTION_INFO).map(([key, info]) => (
                  <div
                    key={key}
                    className="p-4 rounded-2xl text-center transition-all"
                    style={{ backgroundColor: `${info.color}30`, borderColor: info.color, borderWidth: '3px' }}
                  >
                    <div className="text-2xl font-black" style={{ color: info.color }}>{info.label}</div>
                    <div className="text-white/70 text-lg">{info.layers} {info.layers === 1 ? 'layer' : 'layers'}</div>
                  </div>
                ))}
              </div>
              
              {isPlaying && <div className="text-xl text-green-400 animate-pulse mb-3">🔊 Playing...</div>}
              <div className="bg-white/10 rounded-2xl px-6 py-3 inline-block mb-4">
                <span className="text-4xl font-black text-green-400">{lockedCount}</span>
                <span className="text-xl text-white/70"> / {students.length - safariHunters.length} answered</span>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={replaySection} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xl font-bold">🔄 Replay</button>
                <button onClick={reveal} className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-xl font-bold">
                  <Eye className="inline mr-2" size={24} /> Reveal
                </button>
              </div>
            </div>
          )}

          {/* Revealed */}
          {gamePhase === 'revealed' && (
            <div className="text-center relative w-full">
              {/* Question Indicator - top right */}
              <div className="absolute top-0 right-0 text-xl font-bold text-white/60 z-10 bg-black/30 px-3 py-1 rounded-lg">Question {totalClipsPlayed} of 10</div>

              {revealStep >= 1 && revealStep < 2 && <div className="text-7xl anim-drumroll">🥁</div>}
              {revealStep >= 2 && (
                <div className="anim-pop">
                  <div className="text-2xl text-white/70 mb-2">The answer is...</div>

                  {/* Section Badge */}
                  <div className="inline-block px-6 py-3 rounded-2xl mb-4" style={{ backgroundColor: SECTION_INFO[currentSection]?.color }}>
                    <span className="text-4xl font-black">{SECTION_INFO[currentSection]?.label}</span>
                  </div>

                  {/* Stacked Tracks Visual - Like Layer Detective */}
                  {sectionAudio?.[currentSection] && (
                    <div className="bg-black/30 rounded-2xl p-4 mb-4 max-w-2xl mx-auto">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-xl">🎧</span>
                        <p className="text-lg text-white font-semibold">
                          {sectionAudio[currentSection].length} {sectionAudio[currentSection].length === 1 ? 'Layer' : 'Layers'} Playing Together
                        </p>
                        {isPlaying && <span className="text-green-400 animate-pulse">🔊</span>}
                      </div>

                      {/* Stacked timeline tracks */}
                      <div className="space-y-2">
                        {sectionAudio[currentSection].map((filePath, i) => {
                          const instrument = getInstrumentFromPath(filePath);
                          const color = getInstrumentColor(instrument);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-black/40 rounded-xl overflow-hidden"
                            >
                              {/* Instrument icon */}
                              <div
                                className="w-14 h-12 flex items-center justify-center text-2xl shrink-0"
                                style={{ backgroundColor: color }}
                              >
                                {getInstrumentEmoji(instrument)}
                              </div>

                              {/* Track bar */}
                              <div className="flex-1 py-2 pr-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-bold text-lg">{instrument}</span>
                                </div>
                                {/* Loop visualization bar */}
                                <div
                                  className="h-3 rounded-full relative overflow-hidden"
                                  style={{ backgroundColor: `${color}40` }}
                                >
                                  <div
                                    className={`absolute inset-0 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                                    style={{ backgroundColor: color, opacity: isPlaying ? 0.9 : 0.7 }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="text-2xl"><span className="text-green-400 font-bold">{correctCount}</span><span className="text-white/60"> / {students.length} correct</span></div>
                </div>
              )}
              {streakCallout && revealStep >= 4 && <div className="mt-3 text-xl text-orange-400 anim-pop">🔥 {streakCallout.name}: {streakCallout.streak} streak!</div>}
              {newLeader && revealStep >= 5 && <div className="mt-2 text-xl text-yellow-400 anim-pop">👑 New leader: {newLeader}!</div>}
              {revealStep >= 2 && (
                <button onClick={nextClip} className="mt-4 px-10 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all">
                  {totalClipsPlayed >= 10 ? 'See Final Results →' : totalClipsPlayed === 5 ? 'Halfway Point →' : `Question ${totalClipsPlayed + 1} →`}
                </button>
              )}
            </div>
          )}

          {/* Power Pick */}
          {gamePhase === 'powerPick' && (
            <div className="text-center relative w-full">
              {/* Question Indicator - top right */}
              <div className="absolute top-0 right-0 text-xl font-bold text-white/60 z-10 bg-black/30 px-3 py-1 rounded-lg">Question {totalClipsPlayed} of 10</div>

              <div className="text-7xl mb-4">✨</div>
              <h2 className="text-4xl font-black mb-4">Power-Up Time!</h2>
              
              {/* Countdown Timer */}
              <div className="mb-6">
                <div className={`text-8xl font-black ${powerPickCountdown <= 2 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                  {powerPickCountdown}
                </div>
                <div className="text-white/60 text-xl">seconds to choose</div>
              </div>
              
              <div className="bg-white/10 rounded-2xl px-8 py-4 inline-block mb-6">
                <span className="text-5xl font-black text-green-400">{students.filter(s => s.powerUp).length}</span>
                <span className="text-2xl text-white/70"> / {students.length} ready</span>
              </div>
              <div>
                <button onClick={startNextClipAfterPowerPick} className="px-10 py-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all">
                  ▶️ Question {totalClipsPlayed}
                </button>
              </div>
            </div>
          )}

          {/* Halfway / Finished */}
          {(gamePhase === 'roundSummary' || gamePhase === 'finished') && (
            <div className="text-center">
              {totalClipsPlayed >= 10 ? (
                <>
                  <div className="text-9xl mb-6">🏆</div>
                  <h2 className="text-5xl font-black mb-4">Game Complete!</h2>
                  <p className="text-2xl text-white/70 mb-8">Great job everyone! 10 questions done!</p>
                  <button
                    onClick={() => onAdvanceLesson?.()}
                    className="px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                  >
                    <Trophy size={28} />
                    Advance to See Results
                  </button>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-6">🎉</div>
                  <h2 className="text-5xl font-black mb-6">Halfway There!</h2>
                  <p className="text-2xl text-white/70 mb-4">5 questions down, 5 to go!</p>
                  <button onClick={nextRoundOrFinish} className="px-10 py-5 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-2xl font-bold hover:scale-105 transition-all">
                    Continue to Question 6 →
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="bg-black/20 rounded-2xl p-4 flex flex-col min-h-0">
            <style>{animationStyles}</style>
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-yellow-400" size={32} />
              <h2 className="text-2xl font-bold">Leaderboard</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {leaderboard.map((student, idx) => {
                const change = scoreChanges[student.id];
                const isRevealing = gamePhase === 'revealed' && revealStep >= 3;
                return (
                  <div key={student.id} className={`flex items-center gap-3 p-3 rounded-xl ${idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'} ${isRevealing && change?.isCorrect ? 'anim-glow' : ''}`}>
                    <span className="w-8 text-center font-bold text-xl">{idx + 1}</span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: `${student.playerColor}30` }}>{student.playerEmoji}</div>
                    <span className="flex-1 truncate text-lg font-medium">{student.name}</span>
                    {student.streak >= 2 && <span className="text-orange-400 text-lg">🔥{student.streak}</span>}
                    <span className="font-bold text-xl">{student.score + (isRevealing ? (change?.delta || 0) : 0)}</span>
                    {isRevealing && change && change.delta !== 0 && (
                      <span className={`text-lg font-bold ${change.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change.delta > 0 ? '+' : ''}{change.delta}
                      </span>
                    )}
                  </div>
                );
              })}
              {students.length === 0 && <div className="text-center text-white/50 py-6 text-lg">Waiting for students...</div>}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default SectionalLoopBuilderPresentationView;