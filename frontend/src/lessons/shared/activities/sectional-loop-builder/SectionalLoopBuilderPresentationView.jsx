// File: /src/lessons/shared/activities/sectional-loop-builder/SectionalLoopBuilderPresentationView.jsx
// Epic Wildlife - Teacher Presentation View
// 
// PHASES:
// 1. Setup - Choose rounds, random mood selected
// 2. Listening - Play full song, highlight sections
// 3. Quiz Loop (4 clips per round): guessing → revealed → powerPick
// 4. roundSummary → finished

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Users, Trophy, Eye, Settings, Shuffle } from 'lucide-react';
import { getDatabase, ref, update, onValue } from 'firebase/database';

import {
  LOOPS_BY_MOOD, MOOD_INFO, SECTION_INFO, SONG_STRUCTURE, SECTION_DURATION,
  generateSongStructure, shuffleArray, getRandomMood
} from './SectionalLoopBuilderAudio';

import { sfx, animationStyles } from './SectionalLoopBuilderSFX';

const SectionalLoopBuilderPresentationView = ({ sessionData }) => {
  const sessionCode = sessionData?.sessionCode || new URLSearchParams(window.location.search).get('session');
  
  // Setup
  const [totalRounds, setTotalRounds] = useState(null);
  const [currentMood, setCurrentMood] = useState(null);
  const [sectionAudio, setSectionAudio] = useState(null);
  const [quizOrder, setQuizOrder] = useState(['intro', 'a', 'aPrime', 'outro']);
  
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
        playerEmoji: s.playerEmoji || '🎵'
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
      const audio = new Audio(file);
      audio.volume = 0.7;
      return audio;
    });
    audioRefs.current = audios;
    
    setTimeout(() => {
      audios.forEach(a => a.play().catch(console.error));
      setIsPlaying(true);
    }, 50);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      audioRefs.current.forEach(a => { a.pause(); a.currentTime = 0; });
      setIsPlaying(false);
      if (onEnd) onEnd();
    }, SECTION_DURATION);
  }, [sectionAudio]);

  const playFullSong = useCallback(() => {
    if (!sectionAudio) return;
    
    stopAudio();
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
        setGamePhase('preQuiz');
        updateGame({ gamePhase: 'preQuiz' });
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
  }, [stopAudio, updateGame, sectionAudio, currentMood]);

  // ============ GAME FLOW ============
  const startRound = useCallback((roundNum) => {
    stopAudio();
    setCurrentRound(roundNum);
    setCurrentClipIndex(0);
    
    const section = quizOrder[0];
    setCurrentSection(section);
    setGamePhase('guessing');
    
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          currentAnswer: null, lockedIn: false, lastClipScore: 0
        });
      });
    }
    
    const newTotalClips = (roundNum - 1) * 4 + 1;
    setTotalClipsPlayed(newTotalClips);
    
    updateGame({
      gamePhase: 'guessing', currentRound: roundNum, currentClipIndex: 0,
      totalRounds, quizOrder, correctAnswer: section, totalClipsPlayed: newTotalClips
    });
    
    playSectionAudio(section);
  }, [stopAudio, sessionCode, students, totalRounds, quizOrder, playSectionAudio, updateGame]);

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
      
      updateGame({ gamePhase: 'powerPick', currentClipIndex: nextIndex, totalClipsPlayed: newTotalClips });
    } else {
      startClipGuessing(nextIndex, newTotalClips);
    }
  }, [currentClipIndex, totalClipsPlayed, sessionCode, students, updateGame, quizOrder]);

  const startClipGuessing = useCallback((clipIndex, clipNum) => {
    const section = quizOrder[clipIndex];
    setCurrentClipIndex(clipIndex);
    setCurrentSection(section);
    setTotalClipsPlayed(clipNum);
    setGamePhase('guessing');
    
    if (sessionCode) {
      const db = getDatabase();
      students.forEach(s => {
        update(ref(db, `sessions/${sessionCode}/studentsJoined/${s.id}`), {
          currentAnswer: null, lockedIn: false, lastClipScore: 0
        });
      });
    }
    
    updateGame({
      gamePhase: 'guessing', currentClipIndex: clipIndex, correctAnswer: section, totalClipsPlayed: clipNum
    });
    
    playSectionAudio(section);
  }, [sessionCode, students, quizOrder, playSectionAudio, updateGame]);

  const startNextClipAfterPowerPick = useCallback(() => {
    startClipGuessing(currentClipIndex, totalClipsPlayed);
  }, [currentClipIndex, totalClipsPlayed, startClipGuessing]);

  // ============ REVEAL SEQUENCE ============
  const reveal = useCallback(() => {
    stopAudio();
    
    const prevRanks = {};
    leaderboard.forEach((s, idx) => { prevRanks[s.id] = idx + 1; });
    setPreviousRanks(prevRanks);
    
    const changes = {};
    let correct = 0;
    let highestStreak = { name: null, streak: 0 };
    
    students.forEach(s => {
      const isCorrect = s.currentAnswer === currentSection;
      const wasLocked = s.lockedIn;
      
      if (wasLocked) {
        if (isCorrect) {
          correct++;
          const speedBonus = (s.answerTime && s.answerTime < 3000) ? 10 : 0;
          const newStreak = (s.streak || 0) + 1;
          const streakBonus = newStreak >= 2 ? Math.min(newStreak * 5, 20) : 0;
          let delta = 15 + speedBonus + streakBonus;
          
          if (s.powerUp === 'bonus') delta += 15;
          if (s.powerUp === 'double') delta *= 2;
          
          changes[s.id] = { delta, isCorrect: true };
          
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
    
    setRevealStep(1);
    sfx.drumroll();
    
    setTimeout(() => {
      setRevealStep(2);
      sfx.reveal();
      updateGame({ gamePhase: 'revealed', correctAnswer: currentSection });
    }, 800);
    
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
          popDelay += 100;
        }
      });
    }, 1500);
    
    setTimeout(() => {
      setRevealStep(4);
      if (highestStreak.streak >= 3) {
        setStreakCallout(highestStreak);
        sfx.streak();
      }
    }, 2500);
    
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
    }, 3500);
  }, [stopAudio, leaderboard, students, currentSection, sessionCode, updateGame]);

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
    setQuizOrder(shuffleArray(['intro', 'a', 'aPrime', 'outro']));
    setTotalRounds(n);
  };

  const handleRerollMood = () => {
    const mood = getRandomMood();
    setCurrentMood(mood);
    setSectionAudio(generateSongStructure(mood));
    setQuizOrder(shuffleArray(['intro', 'a', 'aPrime', 'outro']));
  };

  const showLeaderboard = ['guessing', 'revealed', 'powerPick', 'roundSummary', 'finished'].includes(gamePhase);

  // ============ RENDER ============
  return (
    <div className="h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌍</span>
          <h1 className="text-2xl font-bold">Epic Wildlife</h1>
          {currentMood && (
            <span className="bg-white/10 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {MOOD_INFO[currentMood]?.emoji} {currentMood}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Users size={20} /><span>{students.length}</span></div>
          {totalRounds && <span className="text-white/60">Round {currentRound}/{totalRounds}</span>}
        </div>
      </div>

      {/* Song structure bar */}
      {gamePhase !== 'setup' && (
        <div className="flex gap-2 mb-3">
          {SONG_STRUCTURE.map((pos, idx) => {
            const info = SECTION_INFO[pos.section];
            const isActive = currentPlayPosition === idx;
            return (
              <div key={idx} className={`flex-1 py-2 rounded-lg text-center font-bold transition-all ${isActive ? 'ring-2 ring-white scale-105' : ''}`}
                style={{ backgroundColor: isActive ? info.color : `${info.color}40`, opacity: isActive ? 1 : 0.7 }}>
                <span className="text-lg mr-1">{info.emoji}</span><span>{pos.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Main content */}
      <div className={`grid ${showLeaderboard ? 'grid-cols-3' : 'grid-cols-1'} gap-3`} style={{ height: 'calc(100vh - 140px)' }}>
        <div className={`${showLeaderboard ? 'col-span-2' : ''} bg-black/20 rounded-2xl p-6 flex items-center justify-center`}>
          
          {/* Setup - choose rounds */}
          {gamePhase === 'setup' && !totalRounds && (
            <div className="text-center">
              <Settings size={64} className="mx-auto mb-4 text-white/50" />
              <h2 className="text-3xl font-bold mb-2">How many rounds?</h2>
              <p className="text-white/70 mb-6">Each round: 4 sections (randomized)</p>
              <div className="flex gap-4 justify-center">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => handleSelectRounds(n)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-2xl text-xl font-bold hover:scale-105 transition-all">
                    {n} Round{n > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pre-listening */}
          {gamePhase === 'setup' && totalRounds && currentMood && (
            <div className="text-center">
              <div className="text-7xl mb-3">🎧</div>
              <h2 className="text-4xl font-black mb-2">Listen to the Full Song</h2>
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 mb-4">
                <span className="text-2xl">{MOOD_INFO[currentMood]?.emoji}</span>
                <span className="text-xl font-bold" style={{ color: MOOD_INFO[currentMood]?.color }}>{currentMood}</span>
                <button onClick={handleRerollMood} className="ml-2 text-white/50 hover:text-white"><Shuffle size={18} /></button>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 max-w-lg mx-auto mb-5">
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(SECTION_INFO).map(([key, info]) => (
                    <div key={key} className="p-2 rounded-xl text-center" style={{ backgroundColor: `${info.color}30` }}>
                      <div className="text-2xl">{info.emoji}</div>
                      <div className="font-bold text-sm" style={{ color: info.color }}>{info.label}</div>
                      <div className="text-white/60 text-xs">{sectionAudio?.[key]?.length || 0} layers</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button onClick={playFullSong} className="px-7 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                  <Play size={28} /> Start Listening
                </button>
                <button onClick={() => { setGamePhase('preQuiz'); updateGame({ gamePhase: 'preQuiz' }); }}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm opacity-50 hover:opacity-100">🔧 Skip</button>
              </div>
            </div>
          )}

          {/* Listening */}
          {gamePhase === 'listening' && (
            <div className="text-center">
              <div className="text-7xl mb-3 animate-pulse">🎧</div>
              <h2 className="text-3xl font-black mb-2">Listening...</h2>
              {currentMood && (
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 mb-3">
                  <span className="text-xl">{MOOD_INFO[currentMood]?.emoji}</span>
                  <span className="font-bold" style={{ color: MOOD_INFO[currentMood]?.color }}>{currentMood}</span>
                </div>
              )}
              {currentPlayPosition >= 0 && (
                <div className="text-2xl font-bold text-green-400 animate-pulse mt-3">🔊 {SONG_STRUCTURE[currentPlayPosition]?.label}</div>
              )}
              <button onClick={() => { stopAudio(); setGamePhase('preQuiz'); updateGame({ gamePhase: 'preQuiz' }); }}
                className="mt-5 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm opacity-50 hover:opacity-100">🔧 Skip</button>
            </div>
          )}

          {/* Pre-Quiz */}
          {gamePhase === 'preQuiz' && (
            <div className="text-center">
              <div className="text-7xl mb-3">🎯</div>
              <h2 className="text-3xl font-black mb-2">Get Ready!</h2>
              <p className="text-xl text-white/70 mb-5">Question 1 of 4 • What section is this?</p>
              <button onClick={() => startRound(1)} className="px-7 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-xl font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-all">
                <Play size={28} /> Play Clip 1
              </button>
            </div>
          )}

          {/* Guessing */}
          {gamePhase === 'guessing' && (
            <div className="text-center">
              <div className="bg-white/10 rounded-xl px-4 py-2 inline-block mb-3">Round {currentRound} • Clip {currentClipIndex + 1}/4</div>
              <div className="text-4xl font-black mb-2">🎧 LISTEN!</div>
              <div className="text-xl text-yellow-300 mb-3">What section is this?</div>
              {isPlaying && <div className="text-lg text-green-400 animate-pulse mb-3">🔊 Playing...</div>}
              <div className="bg-white/10 rounded-2xl px-5 py-2 inline-block mb-4">
                <span className="text-3xl font-black text-green-400">{lockedCount}</span>
                <span className="text-lg text-white/70"> / {students.length} answered</span>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={replaySection} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">🔄 Replay</button>
                <button onClick={reveal} className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-bold">
                  <Eye className="inline mr-2" size={18} /> Reveal
                </button>
              </div>
            </div>
          )}

          {/* Revealed */}
          {gamePhase === 'revealed' && (
            <div className="text-center">
              <div className="bg-white/10 rounded-xl px-4 py-2 inline-block mb-3">Round {currentRound} • Clip {currentClipIndex + 1}/4</div>
              {revealStep >= 1 && revealStep < 2 && <div className="text-5xl anim-drumroll">🥁</div>}
              {revealStep >= 2 && (
                <div className="anim-pop">
                  <div className="text-xl text-white/70 mb-2">The answer is...</div>
                  <div className="inline-block p-5 rounded-2xl mb-3" style={{ backgroundColor: SECTION_INFO[currentSection]?.color }}>
                    <div className="text-5xl mb-1">{SECTION_INFO[currentSection]?.emoji}</div>
                    <div className="text-3xl font-black">{SECTION_INFO[currentSection]?.label}</div>
                  </div>
                  <div className="text-xl"><span className="text-green-400">{correctCount}</span><span className="text-white/60"> / {students.length} correct</span></div>
                </div>
              )}
              {streakCallout && revealStep >= 4 && <div className="mt-3 text-lg text-orange-400 anim-pop">🔥 {streakCallout.name}: {streakCallout.streak} streak!</div>}
              {newLeader && revealStep >= 5 && <div className="mt-2 text-lg text-yellow-400 anim-pop">👑 New leader: {newLeader}!</div>}
              {revealStep >= 5 && (
                <button onClick={nextClip} className="mt-5 px-7 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-lg font-bold hover:scale-105 transition-all">
                  {currentClipIndex >= 3 ? 'Round Complete →' : `Play Clip ${currentClipIndex + 2} →`}
                </button>
              )}
            </div>
          )}

          {/* Power Pick */}
          {gamePhase === 'powerPick' && (
            <div className="text-center">
              <div className="text-5xl mb-3">✨</div>
              <h2 className="text-2xl font-black mb-2">Power-Up Time!</h2>
              <div className="bg-white/10 rounded-2xl px-5 py-2 inline-block mb-4">
                <span className="text-3xl font-black text-green-400">{students.filter(s => s.powerUp).length}</span>
                <span className="text-lg text-white/70"> / {students.length} ready</span>
              </div>
              <div>
                <button onClick={startNextClipAfterPowerPick} className="px-7 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl text-lg font-bold hover:scale-105 transition-all">
                  Play Clip {currentClipIndex + 1} →
                </button>
              </div>
            </div>
          )}

          {/* Round Summary / Finished */}
          {(gamePhase === 'roundSummary' || gamePhase === 'finished') && (
            <div className="text-center">
              {currentRound >= totalRounds ? (
                <>
                  <div className="text-7xl mb-3">🏆</div>
                  <h2 className="text-3xl font-black mb-2">Game Complete!</h2>
                  <p className="text-lg text-white/70">Great job! Advance to see results →</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-3">🎉</div>
                  <h2 className="text-3xl font-black mb-4">Round {currentRound} Complete!</h2>
                  <button onClick={nextRoundOrFinish} className="px-7 py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-lg font-bold hover:scale-105 transition-all">
                    Start Round {currentRound + 1} →
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="bg-black/20 rounded-2xl p-3 flex flex-col">
            <style>{animationStyles}</style>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-yellow-400" size={22} />
              <h2 className="text-lg font-bold">Leaderboard</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {leaderboard.map((student, idx) => {
                const change = scoreChanges[student.id];
                const isRevealing = gamePhase === 'revealed' && revealStep >= 3;
                return (
                  <div key={student.id} className={`flex items-center gap-2 p-2 rounded-lg ${idx === 0 ? 'bg-yellow-500/20' : 'bg-white/5'} ${isRevealing && change?.isCorrect ? 'anim-glow' : ''}`}>
                    <span className="w-5 text-center font-bold text-sm">{idx + 1}</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${student.playerColor}30` }}>{student.playerEmoji}</div>
                    <span className="flex-1 truncate text-sm">{student.name}</span>
                    {student.streak >= 2 && <span className="text-orange-400 text-xs">🔥{student.streak}</span>}
                    <span className="font-bold text-sm">{student.score + (isRevealing ? (change?.delta || 0) : 0)}</span>
                    {isRevealing && change && change.delta !== 0 && (
                      <span className={`text-xs font-bold ${change.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change.delta > 0 ? '+' : ''}{change.delta}
                      </span>
                    )}
                  </div>
                );
              })}
              {students.length === 0 && <div className="text-center text-white/50 py-4 text-sm">Waiting for students...</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionalLoopBuilderPresentationView;