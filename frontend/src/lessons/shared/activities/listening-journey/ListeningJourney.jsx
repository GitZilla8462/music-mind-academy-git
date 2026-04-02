// ListeningJourney — iMovie-style parallax builder
// Timeline starts EMPTY — user drags/clicks scenes to build, then resizes & decorates
// Stickers are time-pinned: only visible when the playhead is at their timestamp

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Save, RotateCcw, Sticker, Type, Moon, Sun, CloudRain, CloudSnow, Wind, CloudOff, Hammer, Presentation, Maximize, Minimize, Play, Pause, SkipBack, HelpCircle, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Users, Loader2 } from 'lucide-react';
import PlanningGuide from './PlanningGuide';
import EssayPanel from './EssayPanel';

import JourneyViewport from './JourneyViewport';
import JourneyTimeline from './JourneyTimeline';
import StickerOverlay from './StickerOverlay';
import DrawingOverlay from './DrawingOverlay';
import SectionPicker from './SectionPicker';
import TextOverlayEditor from './TextOverlayEditor';
import CharacterSelector from './CharacterSelector';
import useJourneyPlayback from './hooks/useJourneyPlayback';
import useParallaxScroll, { getScrollOffsetAtTime } from './hooks/useParallaxScroll';
import { MOVEMENT_TYPES } from './characterAnimations';
import { AUDIO_PATH, TOTAL_DURATION, CHARACTER_OPTIONS, SCENE_SKY_MAP, SECTION_COLORS } from './journeyDefaults';
import { SCENE_GROUND_MAP } from './config/groundTypes';
import { saveStudentWork, loadStudentWork, loadStudentWorkAsync, getClassAuthInfo, getStudentId, parseActivityId } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';
import { useStudentAuth } from '../../../../context/StudentAuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getOrCreateShareCode, loadJourneyByShareCode, savePeerPlayScore, loadPeerPlayScores } from '../../../../firebase/shareCodes';

let _nextSectionId = Date.now();

const DRAW_COLORS = ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];
const DRAW_SIZES = [4, 8, 16, 24, 32];
const MAX_STICKERS = 1500;

const ListeningJourney = ({ onComplete, viewMode = false, isSessionMode = false, pieceConfig = null, allowedEnvironments = null, allowedCharacters = null, hideDrawingTools = false, gameMode = false, hideDecoys = false, defaultScene = null, defaultCharacter: defaultCharacterProp = null, skipSavedData = false, onDirectionsClick = null, savedDataOverride = null }) => {
  // In-memory auth fallback for managed Chromebooks where localStorage is broken
  const { pinSession } = useStudentAuth();

  // If pieceConfig is provided, use it instead of defaults
  const audioPath = pieceConfig?.audioPath || AUDIO_PATH;
  const audioVolume = pieceConfig?.volume || 1.0;
  const totalDuration = pieceConfig?.totalDuration || TOTAL_DURATION;
  const storageKey = pieceConfig?.storageKey || 'listening-journey';
  const presetMode = pieceConfig?.presetMode || false;
  const hideScenes = pieceConfig?.hideScenes || false;
  const hideMovement = pieceConfig?.hideMovement || false;
  const defaultTab = pieceConfig?.defaultTab || null;
  // ── State ──────────────────────────────────────────────────────────
  // Load saved data ONCE (localStorage first, Firebase fallback in useEffect below)
  // savedDataOverride lets PeerPlay inject another student's journey data
  const [savedSnapshot] = useState(() => savedDataOverride ? { data: savedDataOverride } : skipSavedData ? null : loadStudentWork(storageKey));
  const savedData = savedSnapshot?.data;
  const hasLocalData = useRef(!!savedData?.sections?.length);

  const [sections, setSections] = useState(() => {
    if (savedData?.sections?.length > 0) {
      const defaultSections = pieceConfig?.defaultSections || [];
      return savedData.sections.map((s, i) => {
        // If scene isn't in the allowed list, replace with default
        const fallbackSection = defaultSections[i] || {};
        const sceneAllowed = !allowedEnvironments || !s.scene || allowedEnvironments.includes(s.scene);
        const fallback = defaultScene || (allowedEnvironments ? allowedEnvironments[0] : null);
        const scene = sceneAllowed ? (s.scene || fallbackSection.scene || (presetMode ? null : 'forest')) : fallback;
        return {
          ...s,
          sky: sceneAllowed ? (s.sky || fallbackSection.sky || 'clear-day') : (SCENE_SKY_MAP[scene] || 'clear-day'),
          scene,
          ground: sceneAllowed ? (s.ground ?? fallbackSection.ground ?? 'grass') : (SCENE_GROUND_MAP[scene] || 'grass'),
        };
      });
    }
    if (pieceConfig?.defaultSections?.length > 0) {
      // Pre-populate with piece sections (form times given, students customize visuals)
      const fallbackScene = defaultScene || (presetMode ? null : 'forest');
      return pieceConfig.defaultSections.map(s => ({
        ...s,
        sky: s.sky || (fallbackScene ? (SCENE_SKY_MAP[fallbackScene] || 'clear-day') : null),
        scene: s.scene || fallbackScene,
        ground: s.ground || (fallbackScene ? (SCENE_GROUND_MAP[fallbackScene] || 'grass') : null),
      }));
    }
    return []; // Start empty — user builds by adding scenes
  });

  const [items, setItems] = useState(() => {
    if (!savedData?.items?.length) return [];
    // Recalculate placedAtOffset for every item using the current sections
    // so stickers stay anchored even if section tempos changed after placement
    const loadedSections = sections; // sections state is already initialized above
    return savedData.items.map(item => {
      if (item.timestamp != null && loadedSections.length > 0) {
        return { ...item, placedAtOffset: getScrollOffsetAtTime(item.timestamp, loadedSections) };
      }
      return item;
    });
  });

  const defaultCharacter = defaultCharacterProp || pieceConfig?.defaultCharacter || null;
  const [character, setCharacter] = useState(() => {
    const saved = savedData?.character;
    // If saved character isn't in the allowed list, use default instead
    if (saved && allowedCharacters && !allowedCharacters.includes(saved.id)) {
      return defaultCharacter;
    }
    return saved || defaultCharacter;
  });

  const [editMode, setEditMode] = useState(defaultTab ? 'sticker' : 'select'); // 'select' | 'sticker' | 'text'
  const [saveStatus, setSaveStatus] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [marquee, setMarquee] = useState(null);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textEditorPosition, setTextEditorPosition] = useState(null);
  const [leftPanelTab, setLeftPanelTab] = useState(defaultTab || gameMode ? 'stickers' : 'movement'); // 'stickers' | 'movement' | 'text'
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Firebase sync — for authenticated students, always check Firebase (source of truth)
  // This ensures data saved by teacher's "Save All" is loaded even if localStorage has stale data
  useEffect(() => {
    if (skipSavedData || savedDataOverride) return;
    const authInfo = getClassAuthInfo(pinSession);
    if (!authInfo?.uid) return;

    (async () => {
      console.log('🔍 Checking Firebase for listening journey data...');
      const fbWork = await loadStudentWorkAsync(storageKey, authInfo);
      const fbData = fbWork?.data;
      if (fbData?.sections?.length > 0) {
        // Compare timestamps — only replace if Firebase is newer than what we loaded from localStorage
        const fbTimestamp = fbWork?.updatedAt || 0;
        const localTimestamp = savedSnapshot?.lastSaved ? new Date(savedSnapshot.lastSaved).getTime() : 0;

        if (!hasLocalData.current || fbTimestamp > localTimestamp) {
          console.log('☁️ Using Firebase data for listening journey:', fbData.sections.length, 'sections',
            hasLocalData.current ? '(newer than localStorage)' : '(no local data)');
          const defaultSections = pieceConfig?.defaultSections || [];
          setSections(fbData.sections.map((s, i) => {
            const fallbackSection = defaultSections[i] || {};
            return {
              ...s,
              sky: s.sky || fallbackSection.sky || 'clear-day',
              scene: s.scene || fallbackSection.scene || (presetMode ? null : 'forest'),
              ground: s.ground ?? fallbackSection.ground ?? 'grass',
            };
          }));
          if (fbData.items) {
            const fbSections = fbData.sections;
            setItems(fbData.items.map(item => {
              if (item.timestamp != null && fbSections.length > 0) {
                return { ...item, placedAtOffset: getScrollOffsetAtTime(item.timestamp, fbSections) };
              }
              return item;
            }));
            userInteractedRef.current = true;
          }
          if (fbData.character) setCharacter(fbData.character);
          if (fbData.guideData) setGuideData(fbData.guideData);
          if (fbData.essayData) setEssayData(fbData.essayData);
        } else {
          console.log('📂 localStorage data is current, skipping Firebase override');
        }
      } else if (!hasLocalData.current) {
        console.log('ℹ️ No listening journey data in Firebase or localStorage');
      }
    })();
  }, [storageKey, viewMode, presetMode]);

  // ── Share code generation (for peer play) ──────────────────────────
  useEffect(() => {
    if (viewMode || savedDataOverride) return;
    const authInfo = getClassAuthInfo(pinSession);
    const studentUid = authInfo?.uid || getStudentId(pinSession);
    const displayName = authInfo?.displayName || 'Student';

    const parsed = parseActivityId(storageKey);
    const workKey = `${parsed.lessonId}-${parsed.activityId}`;
    getOrCreateShareCode(studentUid, workKey, displayName)
      .then(code => setShareCode(code))
      .catch(() => {});

    // Also load peer play scores (who played my game)
    loadPeerPlayScores(studentUid, workKey)
      .then(scores => setPeerPlayScores(scores))
      .catch(() => {});
  }, [storageKey, viewMode, savedDataOverride, pieceConfig?.lessonId, pinSession]);

  // Drawing tool state
  const [drawingTool, setDrawingTool] = useState(null); // null | 'brush' | 'pencil' | 'eraser'
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(8);
  const drawingCanvasRef = React.useRef(null);
  const [initialDrawingData] = useState(() => savedData?.drawingData || null);

  // App mode: build (editor), present (animation + essay), fullscreen (animation only)
  // When playing someone else's journey (savedDataOverride), start in fullscreen game mode
  const [appMode, setAppMode] = useState(savedDataOverride && gameMode ? 'fullscreen' : 'build'); // 'build' | 'present' | 'fullscreen'

  // Planning guide checklist state (per-section items)
  const [guideData, setGuideData] = useState(() => savedData?.guideData || {});

  // Essay writing state
  const [essayData, setEssayData] = useState(() => savedData?.essayData || {});

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ── Intro modal (first time opening Listening Journey) ──────────
  const showIntro = pieceConfig?.showIntro || false;
  const introKey = `listening-journey-intro-seen-${storageKey}`;
  const [showIntroModal, setShowIntroModal] = useState(() => {
    if (!showIntro || viewMode || onDirectionsClick) return false;
    return !localStorage.getItem(introKey);
  });
  const dismissIntro = useCallback(() => {
    setShowIntroModal(false);
    localStorage.setItem(introKey, '1');
  }, [introKey]);

  // ── Game mode state ──────────────────────────────────────────────
  const [birdY, setBirdY] = useState(0.35);
  const [birdX, setBirdX] = useState(0.12);
  const [gameScore, setGameScore] = useState(0);
  const [decoyMode, setDecoyMode] = useState(false); // when ON, placed stickers auto-marked as decoy
  const [collectedIds, setCollectedIds] = useState(new Set());
  const [birdHurt, setBirdHurt] = useState(false);
  const hurtTimerRef = useRef(null);
  // Game phase: 'idle' (build mode), 'ready' (start screen), 'playing', 'paused', 'finished'
  const [gamePhase, setGamePhase] = useState(savedDataOverride && gameMode ? 'ready' : 'idle');
  const prevIsPlayingRef = useRef(false);
  // High scores & player name for game mode
  const [playerName, setPlayerName] = useState('');
  const highScoresKey = `mma-highscores-${storageKey}`;
  const [highScores, setHighScores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(highScoresKey)) || [];
    } catch { return []; }
  });

  // ── Peer Play state ────────────────────────────────────────────────
  const [shareCode, setShareCode] = useState(null);
  const [showPeerPlayModal, setShowPeerPlayModal] = useState(false);
  const [peerCodeInput, setPeerCodeInput] = useState('');
  const [peerPlayError, setPeerPlayError] = useState('');
  const [peerPlayLoading, setPeerPlayLoading] = useState(false);
  const [peerPlayData, setPeerPlayData] = useState(null); // { data, displayName, studentUid, workKey }
  const [peerPlayScores, setPeerPlayScores] = useState([]); // scores from people who played my game
  const [showPeerScores, setShowPeerScores] = useState(false);

  // Teacher save command listener
  const { sessionCode, classId } = useSession();
  const classCode = new URLSearchParams(window.location.search).get('classCode');
  const effectiveSessionCode = sessionCode || classCode;
  const lastSaveCommandRef = useRef(null);
  const componentMountTimeRef = useRef(Date.now());
  const [teacherSaveToast, setTeacherSaveToast] = useState(false);

  // Scrubbing state (for sprite animation during timeline drag)
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Section picker state
  const [pickerState, setPickerState] = useState(null); // { sectionIndex, track, rect }

  // ── Playback ───────────────────────────────────────────────────────
  const {
    isPlaying, currentTime, isLoaded,
    currentSectionIndex, currentSection, scrollSpeed,
    play, pause, seekTo, rewind, togglePlay
  } = useJourneyPlayback(audioPath, totalDuration, sections, audioVolume);

  const { midgroundOffset, foregroundOffset, rawMidgroundOffset } = useParallaxScroll(currentTime, sections);

  // Reset game state when rewinding
  const gameRewind = useCallback(() => {
    rewind();
    if (gameMode) {
      setBirdY(0.35);
      setBirdX(0.12);
      setGameScore(0);
      collectedIdsRef.current = new Set();
      setCollectedIds(new Set());
      setBirdHurt(false);
      if (hurtTimerRef.current) clearTimeout(hurtTimerRef.current);
    }
  }, [rewind, gameMode]);

  // Detect game over: isPlaying went from true → false while in 'playing' phase and audio reset to 0
  useEffect(() => {
    if (gameMode && gamePhase === 'playing' && prevIsPlayingRef.current && !isPlaying && currentTime === 0) {
      setGamePhase('finished');
      // Save high score
      const name = playerName.trim() || 'Anonymous';
      const newEntry = { name, score: gameScore, date: new Date().toISOString() };
      setHighScores(prev => {
        const updated = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 5);
        localStorage.setItem(highScoresKey, JSON.stringify(updated));
        return updated;
      });
      // For peer play: save score to creator's record and return to own journey
      if (peerPlayData) {
        const authInfo = getClassAuthInfo(pinSession);
        const playerUid = authInfo?.uid || getStudentId(pinSession);
        const playerDisplayName = authInfo?.displayName || name;
        savePeerPlayScore(peerPlayData.studentUid, peerPlayData.workKey, playerUid, playerDisplayName, gameScore)
          .catch(err => console.error('Failed to save peer play score:', err));
        // Return to own journey after showing score
        setTimeout(() => {
          setPeerPlayData(null);
          setGamePhase('idle');
          setAppMode('build');
        }, 3000);
      } else if (savedDataOverride && onComplete) {
        setTimeout(() => onComplete(), 3000);
      }
    }
    prevIsPlayingRef.current = isPlaying;
  }, [isPlaying, currentTime, gameMode, gamePhase, gameScore, playerName, highScoresKey, savedDataOverride, onComplete, peerPlayData, pinSession]);

  // When switching to present/fullscreen in game mode, show start screen
  const setAppModeWithGame = useCallback((mode) => {
    if (gameMode && (mode === 'present' || mode === 'fullscreen') && gamePhase === 'idle') {
      setGamePhase('ready');
      // Reset game state for fresh start
      rewind();
      setBirdY(0.35);
      setBirdX(0.12);
      setGameScore(0);
      setCollectedIds(new Set());
      setBirdHurt(false);
      if (hurtTimerRef.current) clearTimeout(hurtTimerRef.current);
    }
    if (mode === 'build') {
      setGamePhase('idle');
    }
    setAppMode(mode);
  }, [gameMode, gamePhase, rewind]);

  const startGame = useCallback(() => {
    rewind();
    setBirdY(0.35);
    setBirdX(0.12);
    setGameScore(0);
    collectedIdsRef.current = new Set();
    setCollectedIds(new Set());
    setBirdHurt(false);
    if (hurtTimerRef.current) clearTimeout(hurtTimerRef.current);
    setGamePhase('playing');
    // Small delay so rewind settles before play
    setTimeout(() => togglePlay(), 100);
  }, [rewind, togglePlay]);

  // Load a friend's journey by share code
  const handleLoadPeerJourney = useCallback(async () => {
    if (!peerCodeInput.trim()) return;
    setPeerPlayError('');
    setPeerPlayLoading(true);
    try {
      // Don't let them play their own game
      if (peerCodeInput.trim() === shareCode) {
        setPeerPlayError("That's your own game!");
        setPeerPlayLoading(false);
        return;
      }
      const lookupClassId = classId || new URLSearchParams(window.location.search).get('classId');
      const parsed = parseActivityId(storageKey);
      const wk = `${parsed.lessonId}-${parsed.activityId}`;
      const result = await loadJourneyByShareCode(peerCodeInput.trim(), lookupClassId, wk);
      if (!result) {
        setPeerPlayError('No game found for that code');
        setPeerPlayLoading(false);
        return;
      }
      // Load peer's journey data into game mode
      setPeerPlayData(result);
      setShowPeerPlayModal(false);
      setPeerCodeInput('');
      // Set up sections & items from peer data
      const peerSections = result.data.sections || [];
      const defaultSections = pieceConfig?.defaultSections || [];
      setSections(peerSections.map((s, i) => {
        const fallbackSection = defaultSections[i] || {};
        return {
          ...s,
          sky: s.sky || fallbackSection.sky || 'clear-day',
          scene: s.scene || fallbackSection.scene || 'forest',
          ground: s.ground ?? fallbackSection.ground ?? 'grass',
        };
      }));
      if (result.data.items) {
        setItems(result.data.items.map(item => ({
          ...item,
          _collected: false,
          placedAtOffset: item.timestamp != null && peerSections.length > 0
            ? getScrollOffsetAtTime(item.timestamp, peerSections) : item.placedAtOffset
        })));
      }
      if (result.data.character) setCharacter(result.data.character);
      // Switch to game mode
      setAppMode('fullscreen');
      setGamePhase('ready');
      rewind();
      setBirdY(0.35);
      setBirdX(0.12);
      setGameScore(0);
      collectedIdsRef.current = new Set();
      setCollectedIds(new Set());
      setBirdHurt(false);
      setPlayerName('');
    } catch (err) {
      console.error('Failed to load peer journey:', err);
      setPeerPlayError('Something went wrong. Try again.');
    } finally {
      setPeerPlayLoading(false);
    }
  }, [peerCodeInput, shareCode, pieceConfig, rewind]);

  // Return to own journey after peer play
  const handleExitPeerPlay = useCallback(() => {
    setPeerPlayData(null);
    setGamePhase('idle');
    setAppMode('build');
    // Reload own data — trigger a re-mount by reloading from storage
    window.location.reload();
  }, []);

  // Pause / Resume / Restart for game mode
  const pauseGame = useCallback(() => {
    if (gamePhase !== 'playing') return;
    pause();
    setGamePhase('paused');
  }, [gamePhase, pause]);

  const resumeGame = useCallback(() => {
    if (gamePhase !== 'paused') return;
    setGamePhase('playing');
    play();
  }, [gamePhase, play]);

  const restartGame = useCallback(() => {
    rewind();
    setBirdY(0.35);
    setBirdX(0.12);
    setGameScore(0);
    collectedIdsRef.current = new Set();
    setCollectedIds(new Set());
    setBirdHurt(false);
    if (hurtTimerRef.current) clearTimeout(hurtTimerRef.current);
    setGamePhase('playing');
    setTimeout(() => play(), 100);
  }, [rewind, play]);

  const quitGame = useCallback(() => {
    pause();
    setGamePhase('idle');
    setAppMode('build');
  }, [pause]);

  // Escape key to pause/resume during gameplay
  useEffect(() => {
    if (!gameMode) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (gamePhase === 'playing') pauseGame();
        else if (gamePhase === 'paused') resumeGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameMode, gamePhase, pauseGame, resumeGame]);

  // Active section — always derived from playhead position
  const activeSectionIndex = useMemo(() => {
    if (sections.length === 0) return 0;
    const idx = sections.findIndex(s => s && currentTime >= s.startTime && currentTime < s.endTime);
    return idx !== -1 ? idx : 0;
  }, [sections, currentTime]);

  const activeSection = sections[activeSectionIndex] || sections[0] || null;

  // ── Scene management (iMovie-style) ────────────────────────────────

  const handleAddScene = useCallback((sceneId) => {
    setSections(prev => {
      const newIndex = prev.length;
      const DEFAULT_CLIP_DURATION = 15;

      // Where does the new clip start? Right after the last clip (or at 0)
      const startTime = prev.length > 0 ? prev[prev.length - 1].endTime : 0;

      // No room left
      if (startTime >= totalDuration) return prev;

      // Cap at remaining time
      const endTime = Math.min(startTime + DEFAULT_CLIP_DURATION, totalDuration);

      return [...prev, {
        id: _nextSectionId++,
        label: String.fromCharCode(65 + (newIndex % 26)),
        sectionLabel: '',
        startTime,
        endTime,
        color: SECTION_COLORS[newIndex % SECTION_COLORS.length],
        sky: SCENE_SKY_MAP[sceneId] || 'clear-day',
        scene: sceneId,
        ground: SCENE_GROUND_MAP[sceneId] || 'grass',
        tempo: 'andante',
        dynamics: 'mf',
        articulation: 'legato'
      }];
    });
  }, []);

  const handleRemoveSection = useCallback((index) => {
    setSections(prev => {
      if (prev.length <= 1) return []; // Removing last section → empty

      const removed = prev[index];
      const updated = prev.filter((_, i) => i !== index);

      // Merge removed section's time into an adjacent section
      if (index === 0) {
        // Removed first → next section starts at 0
        updated[0] = { ...updated[0], startTime: 0 };
      } else if (index === prev.length - 1) {
        // Removed last → previous extends to end
        updated[updated.length - 1] = { ...updated[updated.length - 1], endTime: totalDuration };
      } else {
        // Removed middle → previous section absorbs the time
        updated[index - 1] = { ...updated[index - 1], endTime: removed.endTime };
      }

      // Re-label A, B, C...
      return updated.map((s, i) => ({
        ...s,
        label: String.fromCharCode(65 + (i % 26)),
        color: SECTION_COLORS[i % SECTION_COLORS.length]
      }));
    });
  }, []);

  // ── Section property editing ───────────────────────────────────────

  const handleUpdateSection = useCallback((index, field, value) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== index) return s;
      const updated = { ...s, [field]: value };
      // Auto-pair ground when scene changes
      if (field === 'scene' && SCENE_GROUND_MAP[value]) {
        updated.ground = SCENE_GROUND_MAP[value];
      }
      return updated;
    }));
  }, []);

  // Extend/trim last clip — drag its right edge into empty space (or back)
  const handleExtendLastEdge = useCallback((newEndTime) => {
    setSections(prev => {
      if (prev.length === 0) return prev;
      const updated = prev.map(s => ({ ...s }));
      const last = updated[updated.length - 1];
      const minEnd = last.startTime + 5;
      last.endTime = Math.round(Math.max(minEnd, Math.min(totalDuration, newEndTime)));
      return updated;
    });
  }, []);

  // Boundary resize — drag edge between sections to adjust duration
  const handleResizeBoundary = useCallback((boundaryIndex, newTime) => {
    setSections(prev => {
      const updated = prev.map(s => ({ ...s }));
      const left = updated[boundaryIndex];
      const right = updated[boundaryIndex + 1];
      if (!left || !right) return prev;

      // Clamp so each section stays at least 5 seconds
      const minTime = left.startTime + 5;
      const maxTime = right.endTime - 5;
      const clamped = Math.round(Math.max(minTime, Math.min(maxTime, newTime)));

      left.endTime = clamped;
      right.startTime = clamped;
      return updated;
    });
  }, []);

  // ── Save / Reset ───────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const authInfo = getClassAuthInfo(pinSession);
    // Strip ephemeral _placedWallTime so loaded stickers get entry animation on replay
    const cleanItems = items.map(({ _placedWallTime, ...rest }) => rest);
    const drawingData = drawingCanvasRef.current?.getDataURL() || null;
    saveStudentWork(storageKey, {
      title: 'Listening Journey',
      emoji: '\uD83C\uDFAD',
      viewRoute: pieceConfig?.viewRoute || '/lessons/listening-lab/lesson4?view=saved',
      subtitle: `${sections.length} sections`,
      category: 'Listening Lab',
      lessonId: pieceConfig?.lessonId || null,
      data: { sections, character, items: cleanItems, guideData, essayData, drawingData, audioPath, audioVolume, pieceTitle: pieceConfig?.title || null }
    }, null, authInfo);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  }, [sections, character, items, guideData, essayData, audioPath, audioVolume, storageKey, pieceConfig, pinSession]);

  // Track if teacher save already fired — prevents unmount save from overwriting
  const teacherSaveTriggeredRef = useRef(false);
  // Track if user actually interacted (placed/moved stickers) — prevents unmount save from overwriting real work with defaults
  const userInteractedRef = useRef(!!savedData?.items?.length);

  // Refs for unmount save (captures latest state without re-creating effect)
  const unmountSectionsRef = useRef(sections);
  unmountSectionsRef.current = sections;
  const unmountCharacterRef = useRef(character);
  unmountCharacterRef.current = character;
  const unmountItemsRef = useRef(items);
  unmountItemsRef.current = items;
  const unmountGuideRef = useRef(guideData);
  unmountGuideRef.current = guideData;
  const unmountEssayRef = useRef(essayData);
  unmountEssayRef.current = essayData;

  // Auto-save on unmount (when teacher advances to next stage)
  useEffect(() => {
    return () => {
      if (!isSessionMode || viewMode || savedDataOverride) return;
      if (teacherSaveTriggeredRef.current) {
        console.log('💾 Skipping unmount save — teacher save already stored good data');
        return;
      }
      if (unmountSectionsRef.current.length === 0) return;
      // Don't overwrite real work with empty defaults — only save if student has stickers or had local data
      if (unmountItemsRef.current.length === 0 && !userInteractedRef.current) {
        console.log('💾 Skipping unmount save — no stickers placed and no prior local data (would overwrite Firebase work)');
        return;
      }

      console.log('💾 Auto-saving listening journey on unmount...');
      try {
        const authInfo = getClassAuthInfo(pinSession);
        const cleanItems = unmountItemsRef.current.map(({ _placedWallTime, ...rest }) => rest);
        const drawingData = drawingCanvasRef.current?.getDataURL() || null;
        saveStudentWork(storageKey, {
          title: 'Listening Journey',
          emoji: '🎭',
          viewRoute: pieceConfig?.viewRoute || '/lessons/listening-lab/lesson4?view=saved',
          subtitle: `${unmountSectionsRef.current.length} sections`,
          category: 'Listening Lab',
          lessonId: pieceConfig?.lessonId || null,
          data: {
            sections: unmountSectionsRef.current,
            character: unmountCharacterRef.current,
            items: cleanItems,
            guideData: unmountGuideRef.current,
            essayData: unmountEssayRef.current,
            drawingData,
            audioPath,
            audioVolume,
            pieceTitle: pieceConfig?.title || null
          }
        }, null, authInfo);
        console.log('✅ Listening journey saved on unmount');
      } catch (error) {
        console.error('❌ Failed to save listening journey on unmount:', error);
      }
    };
  }, [isSessionMode, viewMode, storageKey, audioPath, audioVolume, pieceConfig]);

  // Listen for teacher's "Save All & Continue" command from Firebase
  useEffect(() => {
    if (!effectiveSessionCode || !isSessionMode || viewMode || savedDataOverride) return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveSessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();
      if (!saveCommand) return;

      // Only process save commands issued AFTER this component mounted
      if (saveCommand <= componentMountTimeRef.current) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('💾 Teacher save command received for listening journey!');

        if (sections.length > 0) {
          handleSave();
          teacherSaveTriggeredRef.current = true;
          setTeacherSaveToast(true);
          setTimeout(() => setTeacherSaveToast(false), 3000);
        }
      }
    });

    return () => unsubscribe();
  }, [effectiveSessionCode, isSessionMode, viewMode, sections, handleSave]);

  // ── Game mode: collision detection ────────────────────────────────
  const collectedIdsRef = useRef(new Set());
  const birdYRef = useRef(birdY);
  birdYRef.current = birdY;
  const birdXRef = useRef(birdX);
  birdXRef.current = birdX;
  const rawMidgroundOffsetRef = useRef(rawMidgroundOffset);
  rawMidgroundOffsetRef.current = rawMidgroundOffset;
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!gameMode || !isPlaying || !character?.flying) return;

    // Squared radius avoids sqrt per sticker per frame
    const HIT_RADIUS_SQ = 0.12 * 0.12;
    let frameCount = 0;

    const checkCollisions = () => {
      // Throttle: check every 2nd frame (30fps is plenty for collision)
      frameCount++;
      if (frameCount % 2 !== 0) return;

      const collected = collectedIdsRef.current;
      const scrollOffset = rawMidgroundOffsetRef.current;
      const birdCenterX = birdXRef.current + 0.025;
      const birdCenterY = birdYRef.current + 0.04;

      const allItems = itemsRef.current;
      for (let i = 0, len = allItems.length; i < len; i++) {
        const item = allItems[i];
        if (item.type !== 'sticker') continue;
        if (collected.has(item.id)) continue;

        // Viewport culling — skip stickers far off-screen
        const drift = item.placedAtOffset != null
          ? -(scrollOffset - item.placedAtOffset)
          : 0;
        const stickerX = item.position.x + drift;
        if (stickerX < -0.2 || stickerX > 1.2) continue;

        const stickerY = item.position.y;
        const dx = birdCenterX - stickerX;
        const dy = birdCenterY - stickerY;
        // Squared distance avoids expensive sqrt
        const distSq = dx * dx + dy * dy;

        if (distSq < HIT_RADIUS_SQ) {
          const next = new Set(collectedIdsRef.current);
          next.add(item.id);
          collectedIdsRef.current = next;
          setCollectedIds(next);
          if (item.isDecoy) {
            setGameScore(prev => prev - 5);
            setBirdHurt(true);
            if (hurtTimerRef.current) clearTimeout(hurtTimerRef.current);
            hurtTimerRef.current = setTimeout(() => setBirdHurt(false), 600);
          } else {
            setGameScore(prev => prev + 10);
          }
        }
      }
    };

    let rafId;
    const loop = () => {
      checkCollisions();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameMode, isPlaying, character?.flying]);

  const handleReset = useCallback(() => {
    if (presetMode && pieceConfig?.defaultSections) {
      // In preset mode, restore to default sections with fallback scene/sky/ground
      const fallbackScene = defaultScene || null;
      setSections(pieceConfig.defaultSections.map(s => ({
        ...s,
        sky: s.sky || (fallbackScene ? (SCENE_SKY_MAP[fallbackScene] || 'clear-day') : null),
        scene: s.scene || fallbackScene,
        ground: s.ground || (fallbackScene ? (SCENE_GROUND_MAP[fallbackScene] || 'grass') : null),
      })));
    } else {
      setSections([]);
    }
    setCharacter(defaultCharacter);
    setItems([]);
    setEditMode('select');
    setDrawingTool(null);
    drawingCanvasRef.current?.clear();
  }, [presetMode, pieceConfig, defaultScene, defaultCharacter]);

  // ── Sticker / text placement ───────────────────────────────────────

  const selectItem = useCallback((id) => {
    setSelectedItemIds(prev => {
      // If clicking an item that's already part of a multi-selection, keep the group
      if (id != null && prev.size > 1 && prev.has(id)) return prev;
      return new Set(id != null ? [id] : []);
    });
    // In decoy mode, clicking a placed sticker toggles its decoy status
    if (id != null && decoyMode && gameMode) {
      setItems(prev => {
        const item = prev.find(i => i.id === id);
        if (!item || item.type !== 'sticker') return prev;
        return prev.map(i => i.id === id ? { ...i, isDecoy: !i.isDecoy } : i);
      });
    }
  }, [decoyMode, gameMode]);
  const clearSelection = useCallback(() => setSelectedItemIds(new Set()), []);

  const handleViewportClick = useCallback((pos) => {
    // Deselect any selected stickers
    if (selectedItemIds.size > 0) clearSelection();

    // Only allow placement in build mode
    if (appMode !== 'build') return;

    if (editMode === 'sticker' && selectedSticker) {
      if (items.length >= MAX_STICKERS) return; // cap stickers
      // Sticker visible from now until end of piece (scrolls off screen naturally)
      const startTime = currentTime;
      const duration = totalDuration - currentTime;

      const markDecoy = gameMode && decoyMode;
      userInteractedRef.current = true;
      setItems(prev => [...prev, {
        type: 'sticker',
        icon: selectedSticker.symbol || selectedSticker.id,
        render: selectedSticker.render || 'emoji',
        name: selectedSticker.name,
        color: selectedSticker.color || '#000000',
        timestamp: startTime,
        position: { x: pos.x, y: pos.y },
        placedAtOffset: rawMidgroundOffset,
        entryOffsetX: 1.0 - pos.x,
        _placedWallTime: performance.now(),
        duration,
        scale: 2,
        id: _nextSectionId++,
        ...(markDecoy ? { isDecoy: true } : {}),
      }]);
    } else if (editMode === 'text') {
      setTextEditorPosition(pos);
      setShowTextEditor(true);
    }
  }, [appMode, editMode, selectedSticker, selectedItemIds, clearSelection, currentTime, rawMidgroundOffset, sections, totalDuration, gameMode, decoyMode, items]);

  // ── Drag-from-panel sticker placement ───────────────────────────────
  const [dragGhost, setDragGhost] = useState(null); // { sticker, x, y }

  const handleStickerDragStart = useCallback((sticker, e) => {
    if (appMode !== 'build') return;
    setEditMode('sticker');
    setSelectedSticker(sticker);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragGhost({ sticker, x: clientX, y: clientY });

    const handleMove = (moveE) => {
      const mx = moveE.touches ? moveE.touches[0].clientX : moveE.clientX;
      const my = moveE.touches ? moveE.touches[0].clientY : moveE.clientY;
      setDragGhost(prev => prev ? { ...prev, x: mx, y: my } : null);
    };

    const handleEnd = (endE) => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);

      const ex = endE.changedTouches ? endE.changedTouches[0].clientX : endE.clientX;
      const ey = endE.changedTouches ? endE.changedTouches[0].clientY : endE.clientY;

      // Find the viewport element and check if drop landed on it
      const vpEl = document.querySelector('[data-viewport]');
      if (vpEl) {
        const rect = vpEl.getBoundingClientRect();
        if (ex >= rect.left && ex <= rect.right && ey >= rect.top && ey <= rect.bottom) {
          const posX = (ex - rect.left) / rect.width;
          const posY = (ey - rect.top) / rect.height;
          // Place the sticker (same logic as handleViewportClick)
          userInteractedRef.current = true;
          const startTime = currentTimeRef.current;
          const duration = totalDurationRef.current - startTime;
          setItems(prev => {
            if (prev.length >= MAX_STICKERS) return prev;
            return [...prev, {
              type: 'sticker',
              icon: sticker.symbol || sticker.id,
              render: sticker.render || 'emoji',
              name: sticker.name,
              color: sticker.color || '#000000',
              timestamp: startTime,
              position: { x: posX, y: posY },
              placedAtOffset: rawMidgroundOffsetRef.current,
              entryOffsetX: 1.0 - posX,
              _placedWallTime: performance.now(),
              duration,
              scale: 2,
              id: _nextSectionId++,
            }];
          });
        }
      }
      setDragGhost(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
  }, [appMode, currentTime, totalDuration, rawMidgroundOffset]);

  // ── Marquee drag-to-select ──────────────────────────────────────────
  const handleMarqueeEnd = useCallback((rect) => {
    const minX = Math.min(rect.startX, rect.endX);
    const maxX = Math.max(rect.startX, rect.endX);
    const minY = Math.min(rect.startY, rect.endY);
    const maxY = Math.max(rect.startY, rect.endY);
    const hits = items.filter(item => {
      const px = item.position.x;
      const py = item.position.y;
      return px >= minX && px <= maxX && py >= minY && py <= maxY;
    });
    if (hits.length > 0) {
      setSelectedItemIds(new Set(hits.map(h => h.id)));
    }
  }, [items]);

  const handleAddTextItem = useCallback((textData) => {
    setItems(prev => [...prev, {
      type: 'text',
      ...textData,
      timestamp: currentTime,
      position: textEditorPosition,
      id: Date.now(),
    }]);
    setShowTextEditor(false);
    setTextEditorPosition(null);
  }, [currentTime, textEditorPosition]);

  const handleRemoveItem = useCallback((itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const handleUpdateItem = useCallback((itemId, updates) => {
    setItems(prev => prev.map(i => {
      if (i.id !== itemId) return i;
      const updated = { ...i, ...updates };
      // When timestamp changes (drag/left-resize), recalculate placedAtOffset
      // so the sticker enters from the right edge at the new time
      if ('timestamp' in updates && updates.timestamp !== i.timestamp) {
        updated.placedAtOffset = getScrollOffsetAtTime(updates.timestamp, sections);
      }
      return updated;
    }));
  }, [sections]);

  // Batch update multiple items at once (used for group drag)
  const handleUpdateItems = useCallback((itemUpdates) => {
    setItems(prev => {
      const updateMap = new Map(itemUpdates.map(u => [u.id, u.updates]));
      return prev.map(i => {
        const updates = updateMap.get(i.id);
        if (!updates) return i;
        const updated = { ...i, ...updates };
        if ('timestamp' in updates && updates.timestamp !== i.timestamp) {
          updated.placedAtOffset = getScrollOffsetAtTime(updates.timestamp, sections);
        }
        return updated;
      });
    });
  }, [sections]);

  const handleAddItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  // ── Clipboard for copy/paste ──────────────────────────────────────
  const clipboardRef = React.useRef(null);
  const pasteCountRef = React.useRef(0);

  // Refs for rapidly-changing values so keyboard handler stays stable
  const togglePlayRef = useRef(togglePlay);
  togglePlayRef.current = togglePlay;
  const selectedItemIdsRef = useRef(selectedItemIds);
  selectedItemIdsRef.current = selectedItemIds;
  const clearSelectionRef = useRef(clearSelection);
  clearSelectionRef.current = clearSelection;
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  const totalDurationRef = useRef(totalDuration);
  totalDurationRef.current = totalDuration;

  // ── Keyboard shortcuts (spacebar, delete, copy/paste) ─────────────
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayRef.current();
      }
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedItemIdsRef.current.size > 0) {
        e.preventDefault();
        setItems(prev => prev.filter(i => !selectedItemIdsRef.current.has(i.id)));
        clearSelectionRef.current();
      }
      // Ctrl+C / Cmd+C — copy all selected stickers
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && selectedItemIdsRef.current.size > 0) {
        e.preventDefault();
        const selectedItems = itemsRef.current.filter(i => selectedItemIdsRef.current.has(i.id));
        if (selectedItems.length > 0) {
          clipboardRef.current = selectedItems;
          pasteCountRef.current = 0;
        }
      }
      // Ctrl+V / Cmd+V — paste all copied stickers, offset to the right
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && clipboardRef.current) {
        e.preventDefault();
        if (itemsRef.current.length >= MAX_STICKERS) return; // cap stickers
        pasteCountRef.current++;
        const sources = Array.isArray(clipboardRef.current) ? clipboardRef.current : [clipboardRef.current];
        const offset = 0.05 * pasteCountRef.current;
        const newIds = new Set();
        const newItems = sources.map(src => {
          const id = _nextSectionId++;
          newIds.add(id);
          return {
            ...src,
            id,
            position: { x: Math.min(src.position.x + offset, 0.95), y: src.position.y },
            timestamp: currentTimeRef.current,
            duration: totalDurationRef.current - currentTimeRef.current,
            placedAtOffset: rawMidgroundOffsetRef.current,
            _placedWallTime: performance.now(),
          };
        });
        setItems(prev => [...prev, ...newItems]);
        setSelectedItemIds(newIds);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // stable — uses refs for all changing values

  // ── Section picker ─────────────────────────────────────────────────

  const handleOpenPicker = useCallback((sectionIndex, track, rect) => {
    setPickerState({ sectionIndex, track, rect });
  }, []);

  const handlePickerSelect = useCallback((value, propertyOverride) => {
    if (!pickerState) return;
    const { sectionIndex, track } = pickerState;
    const effectiveTrack = propertyOverride || track;
    handleUpdateSection(sectionIndex, effectiveTrack, value);
    // Keep picker open in 'all' mode so user can change multiple properties
    if (track !== 'all') {
      setPickerState(null);
    }
  }, [pickerState, handleUpdateSection]);

  // ── Edit mode switching ────────────────────────────────────────────

  const handleSetEditMode = useCallback((mode) => {
    setEditMode(mode);
    if (mode !== 'sticker') {
      setSelectedSticker(null);
    }
  }, []);

  const handleSwitchLeftTab = useCallback((tab) => {
    setLeftPanelTab(tab);
    setDrawingTool(null);
    clearSelection();
    if (tab === 'stickers') {
      setEditMode('sticker');
    } else if (tab === 'text') {
      setEditMode('text');
    } else {
      setEditMode('select');
      setSelectedSticker(null);
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────────
  const isBuild = appMode === 'build';
  const isPresent = appMode === 'present';
  const isFullscreen = appMode === 'fullscreen';
  const isGamePlaying = gameMode && (isPresent || isFullscreen);

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Game code pill — always visible top-left during gameplay */}
      {shareCode && !viewMode && !savedDataOverride && (isGamePlaying || peerPlayData) && (
        <div className="absolute top-2 left-2 z-[250] bg-black/70 backdrop-blur-sm rounded-2xl px-4 py-2 border border-amber-400/30 flex items-center gap-2 shadow-lg">
          <span className="text-xs sm:text-sm text-white/80 font-bold">
            {(getClassAuthInfo(pinSession)?.displayName || 'My')}&#39;s Game Code:
          </span>
          <span className="text-lg sm:text-xl font-black text-amber-400 tracking-wider">{shareCode}</span>
        </div>
      )}

      {/* Peer play: show whose game you're playing (below game code) */}
      {peerPlayData && (isGamePlaying) && (
        <div className="absolute top-14 left-2 z-[250] bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-purple-400/30 flex items-center gap-2">
          <span className="text-[11px] sm:text-xs text-purple-300 font-medium">
            Playing {peerPlayData.displayName}&#39;s Journey
          </span>
          <button
            onClick={handleExitPeerPlay}
            className="text-[10px] text-white/50 hover:text-white underline ml-1"
          >
            Exit
          </button>
        </div>
      )}

      {/* Header — hidden in fullscreen and game mode */}
      {!isFullscreen && !isGamePlaying && (
        <div className="flex items-center justify-between px-2 sm:px-4 py-1 sm:py-1.5 bg-black/30 border-b border-white/10 flex-shrink-0 flex-nowrap overflow-hidden">
          {/* Left: Title + Color tools + Sprites */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <div className="flex flex-col mr-1 min-w-0">
              <h1 className="text-xs sm:text-sm font-bold whitespace-nowrap leading-tight">Listening Journey Game Creator</h1>
              <span className="text-[9px] sm:text-[10px] text-white/50 truncate leading-tight">{pieceConfig?.title || 'Hungarian Dance No. 5 - Brahms'}</span>
            </div>

            <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />

            {/* Color/drawing tools (hidden in game mode and when hideDrawingTools is set) */}
            {isBuild && !gameMode && !hideDrawingTools && (
              <>
                {[
                  { id: 'brush', icon: '\uD83D\uDD8C\uFE0F' },
                  { id: 'pencil', icon: '\u270F\uFE0F' },
                  { id: 'eraser', icon: '\u2B1C' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setDrawingTool(drawingTool === t.id ? null : t.id); clearSelection(); }}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center text-xs transition-all ${
                      drawingTool === t.id
                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/60'
                    }`}
                    title={t.id}
                  >
                    {t.icon}
                  </button>
                ))}

                {DRAW_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-transform hover:scale-110 flex-shrink-0"
                    style={{
                      backgroundColor: c,
                      border: brushColor === c ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                ))}

                <button
                  onClick={() => drawingCanvasRef.current?.undo()}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/60 text-xs transition-all"
                  title="Undo drawing"
                >
                  {'\u21A9'}
                </button>

                <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />
              </>
            )}

            {/* Character selector (sprites) */}
            <CharacterSelector selectedId={character?.id} onSelect={setCharacter} allowedCharacters={allowedCharacters} />

            {/* Game mode: decoy mode toggle */}
            {gameMode && isBuild && !hideDecoys && (() => {
              const decoyCount = items.filter(i => i.isDecoy).length;
              return (
                <>
                  <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />
                  <button
                    onClick={() => setDecoyMode(d => !d)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-colors shadow-lg whitespace-nowrap ${
                      decoyMode
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30'
                        : 'bg-red-500/20 text-red-300 hover:bg-red-500/40 shadow-red-500/10'
                    }`}
                  >
                    {decoyMode ? `Placing Decoys (${decoyCount})` : `Place Decoy${decoyCount > 0 ? ` (${decoyCount})` : ''}`}
                  </button>
                </>
              );
            })()}
          </div>

          {/* Right: Directions + Build/Present + Reset + Save */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Directions button */}
            <button
              onClick={() => { onDirectionsClick ? onDirectionsClick() : setShowIntroModal(true); }}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              title="Directions"
            >
              <HelpCircle size={14} /> <span className="hidden sm:inline">Directions</span>
            </button>
            <div className="w-px h-5 bg-white/20" />
            {/* Mode switcher */}
            {gameMode ? (
              <button
                onClick={() => setAppModeWithGame('present')}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-black rounded-xl shadow-lg transition-colors bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Play size={14} fill="white" /> Play Game
              </button>
            ) : (
              <div className="flex bg-white/5 rounded-lg p-0.5">
                <button
                  onClick={() => setAppModeWithGame('build')}
                  className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-colors ${
                    isBuild ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Hammer size={12} /> <span className="hidden sm:inline">Build</span>
                </button>
                <button
                  onClick={() => setAppModeWithGame('present')}
                  className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-colors ${
                    isPresent ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Presentation size={12} /> <span className="hidden sm:inline">Present</span>
                </button>
                <button
                  onClick={() => setAppModeWithGame('fullscreen')}
                  className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold transition-colors ${
                    isFullscreen ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <Maximize size={12} />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowScoreboard(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-sm font-bold bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 transition-colors"
              title="High Scores"
            >
              <Trophy size={14} /> <span className="hidden sm:inline">Scores</span>
            </button>
            {peerPlayScores.length > 0 && !savedDataOverride && (
              <button
                onClick={() => setShowPeerScores(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-sm font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 transition-colors"
                title="Who played my game"
              >
                <Users size={14} /> <span className="hidden sm:inline">{peerPlayScores.length} Played</span><span className="sm:hidden">{peerPlayScores.length}</span>
              </button>
            )}

            <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />

            {/* Reset with confirmation */}
            {showResetConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-[11px] text-red-400 font-semibold whitespace-nowrap">Sure?</span>
                <button
                  onClick={() => { handleReset(); setShowResetConfirm(false); }}
                  className="px-1.5 sm:px-2 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-[10px] sm:text-[11px] font-bold transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-1.5 sm:px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/70 text-[10px] sm:text-[11px] font-bold transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-[10px] sm:text-[11px] font-semibold transition-colors"
                title="Reset all work"
              >
                <RotateCcw size={12} /> <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={sections.length === 0}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-500 text-white'
                  : sections.length === 0
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Save size={14} />
              {saveStatus === 'saved' ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Floating controls for presentation & fullscreen */}
      {(isFullscreen || isPresent) && !gameMode && (
        <div className="absolute bottom-3 right-3 z-50 flex items-center gap-2">
          <button
            onClick={gameRewind}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/60 hover:text-white transition-colors"
            title="Rewind"
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={togglePlay}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/60 hover:text-white transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {isFullscreen && (
            <button
              onClick={() => setAppModeWithGame('build')}
              className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white/60 hover:text-white transition-colors"
              title="Exit fullscreen"
            >
              <Minimize size={16} />
            </button>
          )}
        </div>
      )}

      {/* Game mode: pause overlay */}
      {gameMode && (isPresent || isFullscreen) && gamePhase === 'paused' && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900/90 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 text-center">
              <Pause size={40} className="text-white/50 mx-auto mb-2" />
              <h2 className="text-3xl font-black text-white mb-1">Paused</h2>
              <p className="text-sm text-white/40 mb-6">Score: <span className={`font-bold ${gameScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{gameScore}</span> pts</p>

              <div className="space-y-2">
                <button
                  onClick={resumeGame}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-black rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={20} fill="white" /> Resume
                </button>
                <button
                  onClick={restartGame}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <SkipBack size={18} /> Restart
                </button>
                <button
                  onClick={() => setShowScoreboard(true)}
                  className="w-full py-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy size={18} /> High Scores
                </button>
                <button
                  onClick={quitGame}
                  className="w-full py-3 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Hammer size={18} /> Quit to Build
                </button>
              </div>

              <p className="text-xs text-white/30 mt-4">Press Esc to resume</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Start overlay */}
      {gameMode && (isPresent || isFullscreen) && gamePhase === 'ready' && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900/90 rounded-3xl border border-white/10 shadow-2xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-center">
              <div className="text-4xl mb-1">🎮</div>
              <h2 className="text-3xl font-black text-white">{peerPlayData ? `${peerPlayData.displayName}'s Journey` : 'Play This Journey!'}</h2>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* My Code — prominent section */}
              {shareCode && !peerPlayData && !savedDataOverride && (
                <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-xl p-4 text-center">
                  <p className="text-sm font-black text-amber-300 uppercase tracking-wider mb-2">My Code</p>
                  <p className="text-5xl font-black text-amber-400 tracking-[0.3em]">{shareCode}</p>
                  <p className="text-xs text-white/40 mt-2">Show this to your partner so they can play your game</p>
                </div>
              )}

              {/* Name entry */}
              <div>
                <label className="text-sm font-bold text-white/70 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Type your name..."
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-lg font-bold placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && playerName.trim()) startGame(); }}
                />
              </div>

              {/* Controls */}
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Controls</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-1">
                      <kbd className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80"><ArrowUp size={14} /></kbd>
                    </div>
                    <div className="flex gap-1">
                      <kbd className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80"><ArrowLeft size={14} /></kbd>
                      <kbd className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80"><ArrowDown size={14} /></kbd>
                      <kbd className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80"><ArrowRight size={14} /></kbd>
                    </div>
                  </div>
                  <div className="text-sm text-white/70">
                    <p className="font-bold text-white">Fly your bird!</p>
                    <p>Collect stickers for <span className="text-emerald-400 font-bold">+10 pts</span></p>
                    <p>Dodge decoys for <span className="text-red-400 font-bold">-5 pts</span></p>
                  </div>
                </div>
              </div>

              {/* High Scores */}
              {highScores.length > 0 && (
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-yellow-400" />
                    <p className="text-xs font-bold text-white/50 uppercase tracking-wider">High Scores</p>
                  </div>
                  <div className="space-y-1">
                    {highScores.map((entry, i) => (
                      <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded-lg ${i === 0 ? 'bg-yellow-500/10' : ''}`}>
                        <span className="w-5 text-center font-bold text-sm text-white/50">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                        <span className="flex-1 text-sm font-bold text-white truncate">{entry.name}</span>
                        <span className={`text-sm font-black tabular-nums ${entry.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start button */}
              <button
                onClick={startGame}
                disabled={!playerName.trim()}
                className={`w-full py-4 rounded-xl text-2xl font-black transition-all flex items-center justify-center gap-3 ${
                  playerName.trim()
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.02]'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                <Play size={24} fill="white" /> START
              </button>

              {/* Play a Friend's Journey — only when not already in peer play */}
              {!peerPlayData && !savedDataOverride && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs font-bold text-purple-300/70 uppercase tracking-wider mb-2 text-center">Play a Friend's Journey</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={peerCodeInput}
                      onChange={(e) => { setPeerCodeInput(e.target.value.replace(/\D/g, '').slice(0, 5)); setPeerPlayError(''); }}
                      placeholder="Enter 5-digit code"
                      maxLength={5}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-purple-400/30 text-white text-lg font-black text-center tracking-[0.2em] placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      onKeyDown={(e) => { if (e.key === 'Enter' && peerCodeInput.length === 5) handleLoadPeerJourney(); }}
                    />
                    <button
                      onClick={handleLoadPeerJourney}
                      disabled={peerCodeInput.length !== 5 || peerPlayLoading}
                      className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {peerPlayLoading ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
                      Go
                    </button>
                  </div>
                  {peerPlayError && (
                    <p className="text-red-400 text-sm text-center font-medium mt-2">{peerPlayError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {gameMode && (isPresent || isFullscreen) && gamePhase === 'finished' && (() => {
        const isNewHighScore = highScores.length > 0 && highScores[0].score === gameScore && highScores[0].name === (playerName.trim() || 'Anonymous');
        return (
          <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900/90 rounded-3xl border border-white/10 shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className={`px-6 py-4 text-center ${isNewHighScore ? 'bg-gradient-to-r from-yellow-600 to-amber-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}>
                <div className="text-4xl mb-1">{isNewHighScore ? '🏆' : gameScore >= 0 ? '🎮' : '😅'}</div>
                <h2 className="text-3xl font-black text-white">
                  {isNewHighScore ? 'New High Score!' : 'Game Over!'}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Score */}
                <div className="text-center">
                  <div className="text-sm font-bold text-white/50 uppercase tracking-wider mb-1">{playerName.trim() || 'Anonymous'}</div>
                  <div className={`text-6xl font-black tabular-nums ${gameScore >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gameScore}
                  </div>
                  <div className="text-sm text-white/40">points</div>
                </div>

                {/* Leaderboard */}
                {highScores.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={14} className="text-yellow-400" />
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Leaderboard</p>
                    </div>
                    <div className="space-y-1">
                      {highScores.map((entry, i) => {
                        const isCurrentRun = entry.score === gameScore && entry.name === (playerName.trim() || 'Anonymous') && i === highScores.findIndex(e => e.score === gameScore && e.name === (playerName.trim() || 'Anonymous'));
                        return (
                          <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isCurrentRun ? 'bg-emerald-500/20 ring-1 ring-emerald-400/50' : i === 0 ? 'bg-yellow-500/10' : ''}`}>
                            <span className="w-5 text-center font-bold text-sm text-white/50">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                            <span className="flex-1 text-sm font-bold text-white truncate">{entry.name}</span>
                            <span className={`text-sm font-black tabular-nums ${entry.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{entry.score}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                {savedDataOverride ? (
                  <div className="text-center text-white/60 py-3">
                    <span className="animate-pulse">Returning to partner pool...</span>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setGamePhase('ready'); gameRewind(); }}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-black rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Play size={18} fill="white" /> Play Again
                    </button>
                    <button
                      onClick={() => setAppModeWithGame('build')}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Hammer size={18} /> Back to Build
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Scoreboard overlay */}
      {showScoreboard && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowScoreboard(false)}>
          <div className="bg-gray-900/90 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-6 py-4 text-center">
              <Trophy size={32} className="text-white mx-auto mb-1" />
              <h2 className="text-2xl font-black text-white">High Scores</h2>
            </div>
            <div className="px-6 py-5">
              {highScores.length > 0 ? (
                <div className="space-y-1.5">
                  {highScores.map((entry, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${i === 0 ? 'bg-yellow-500/15' : 'bg-white/5'}`}>
                      <span className="w-6 text-center font-bold text-white/50">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                      <span className="flex-1 font-bold text-white truncate">{entry.name}</span>
                      <span className={`font-black tabular-nums ${entry.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{entry.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-white/40 py-4">No scores yet — play a game!</p>
              )}
              <button
                onClick={() => setShowScoreboard(false)}
                className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Peer Scores overlay — who played my game */}
      {showPeerScores && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPeerScores(false)}>
          <div className="bg-gray-900/90 rounded-3xl border border-white/10 shadow-2xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-center">
              <Users size={32} className="text-white mx-auto mb-1" />
              <h2 className="text-2xl font-black text-white">Who Played My Game</h2>
            </div>
            <div className="px-6 py-5">
              {peerPlayScores.length > 0 ? (
                <div className="space-y-1.5">
                  {peerPlayScores.map((entry, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${i === 0 ? 'bg-purple-500/15' : 'bg-white/5'}`}>
                      <span className="w-6 text-center font-bold text-white/50">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                      <span className="flex-1 font-bold text-white truncate">{entry.playerName}</span>
                      <span className={`font-black tabular-nums ${entry.score >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{entry.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-white/40 py-4">No one has played your game yet — share your code!</p>
              )}
              <button
                onClick={() => setShowPeerScores(false)}
                className="w-full mt-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel — only in build mode */}
        {isBuild && (
          <div className="w-[240px] flex-shrink-0 bg-black/20 border-r border-white/10 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-white/10 flex-shrink-0">
              {[
                { id: 'stickers', icon: <Sticker size={13} />, label: 'Stickers' },
                /* Movement tab removed — bird always flies at medium pace */
                /* Text tab commented out for now */
                // ...(!gameMode ? [{ id: 'text', icon: <Type size={13} />, label: 'Text' }] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleSwitchLeftTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold transition-colors ${
                    leftPanelTab === tab.id
                      ? 'bg-white/10 text-white border-b-2 border-blue-400'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {leftPanelTab === 'stickers' && (
                <StickerPanelWrapper
                  selectedSticker={selectedSticker}
                  onStickerSelect={(s) => { setSelectedSticker(s); setEditMode('sticker'); }}
                  onDragStart={handleStickerDragStart}
                  defaultTab={defaultTab}
                />
              )}

              {leftPanelTab === 'movement' && (
                <div className="p-2 flex flex-col gap-3">
                  {/* Movement */}
                  <div>
                    <div className="text-[9px] text-white/40 uppercase font-bold mb-1.5 text-center">Movement</div>
                    <div className="flex flex-col gap-1">
                      {MOVEMENT_TYPES.map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleUpdateSection(activeSectionIndex, 'movement', m.id)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs ${
                            (activeSection?.movement || 'walk') === m.id
                              ? 'bg-emerald-500 text-white ring-1 ring-emerald-300'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-sm">{m.icon}</span>
                          <span className="font-bold">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weather & Lighting — hidden for cloud-only environments */}
                  {!allowedEnvironments && (
                    <>
                      <div>
                        <div className="text-[9px] text-white/40 uppercase font-bold mb-1.5 text-center">Weather</div>
                        <div className="flex flex-col gap-1">
                          {[
                            { id: 'none', icon: <CloudOff size={14} />, label: 'Clear' },
                            { id: 'rain', icon: <CloudRain size={14} />, label: 'Rain' },
                            { id: 'snow', icon: <CloudSnow size={14} />, label: 'Snow' },
                          ].map(w => (
                            <button
                              key={w.id}
                              onClick={() => handleUpdateSection(activeSectionIndex, 'weather', w.id)}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs ${
                                (activeSection?.weather || 'none') === w.id
                                  ? 'bg-cyan-500 text-white ring-1 ring-cyan-300'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {w.icon}
                              <span className="font-bold">{w.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-white/40 uppercase font-bold mb-1.5 text-center">Lighting</div>
                        <div className="flex flex-col gap-1">
                          {[
                            { id: false, icon: <Sun size={14} />, label: 'Day' },
                            { id: true, icon: <Moon size={14} />, label: 'Night' },
                          ].map(l => (
                            <button
                              key={String(l.id)}
                              onClick={() => handleUpdateSection(activeSectionIndex, 'nightMode', l.id)}
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-xs ${
                                (activeSection?.nightMode || false) === l.id
                                  ? 'bg-indigo-500 text-white ring-1 ring-indigo-300'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {l.icon}
                              <span className="font-bold">{l.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {leftPanelTab === 'text' && (
                <div className="p-3 flex flex-col gap-3">
                  <div className="text-center text-white/60 text-xs leading-relaxed mt-2">
                    Click anywhere on the scene to add a text label.
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-[11px] text-white/40 leading-relaxed">
                    <div className="font-bold text-white/60 mb-1">Tips:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Add section labels (A, B, Coda)</li>
                      <li>Describe what you hear</li>
                      <li>Label instruments or dynamics</li>
                      <li>Click a text item to edit or delete</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Viewport (center) */}
        <div className={`flex-1 ${isFullscreen || isGamePlaying ? 'p-0' : 'p-1.5 sm:p-2 lg:p-3'} min-w-0 flex flex-col`}>
          <div className="flex-1 min-h-0">
            <JourneyViewport
              section={activeSection}
              character={character}
              isPlaying={isPlaying || isScrubbing}
              midgroundOffset={midgroundOffset}
              foregroundOffset={foregroundOffset}
              items={items}
              currentTime={currentTime}
              onViewportClick={drawingTool ? undefined : handleViewportClick}
              editMode={isBuild && !drawingTool ? editMode : 'select'}
              isBuildMode={isBuild}
              marquee={marquee}
              onMarqueeChange={setMarquee}
              onMarqueeEnd={handleMarqueeEnd}
              gameMode={gameMode}
              birdY={birdY}
              birdX={birdX}
              onBirdYChange={setBirdY}
              onBirdXChange={setBirdX}
              score={gameScore}
              collectedIds={collectedIds}
              isHurt={birdHurt}
              onPause={pauseGame}
            >
              <DrawingOverlay
                ref={drawingCanvasRef}
                isActive={isBuild && !!drawingTool}
                tool={drawingTool || 'brush'}
                color={brushColor}
                brushSize={brushSize}
                initialData={initialDrawingData}
              />
              <StickerOverlay
                items={items}
                currentTime={currentTime}
                isPlaying={isPlaying}
                editMode={isBuild && !drawingTool ? editMode : 'select'}
                onRemoveItem={handleRemoveItem}
                onUpdateItem={handleUpdateItem}
                onUpdateItems={handleUpdateItems}
                onAddItem={handleAddItem}
                onSwitchToSelect={() => setEditMode('select')}
                rawScrollOffset={rawMidgroundOffset}
                selectedItemIds={selectedItemIds}
                onSelectItem={selectItem}
                isBuildMode={isBuild && !drawingTool}
                gameMode={gameMode}
                collectedIds={collectedIds}
              />
            </JourneyViewport>
          </div>
        </div>

        {/* Right panel — Planning Guide (build) or Essay (present) */}
        {isBuild && (
          <PlanningGuide
            sections={sections}
            activeSectionIndex={activeSectionIndex}
            guide={guideData}
            onGuideChange={setGuideData}
          />
        )}
        {isPresent && !isGamePlaying && (
          <EssayPanel
            sections={sections}
            guideData={guideData}
            pieceTitle={pieceConfig?.title}
            character={character}
            items={items}
          />
        )}
      </div>

      {/* Timeline + transport (bottom) — hidden in fullscreen and game mode */}
      {!isFullscreen && !isGamePlaying && <div className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-3 bg-black/30 border-t border-white/10">
        <JourneyTimeline
          sections={sections}
          items={items}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onSeek={seekTo}
          onRewind={gameRewind}
          onOpenPicker={handleOpenPicker}
          onAddScene={handleAddScene}
          onRemoveSection={hideScenes ? null : handleRemoveSection}
          onResizeBoundary={handleResizeBoundary}
          onExtendLastEdge={handleExtendLastEdge}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          presetMode={presetMode}
          hideScenes={hideScenes}
          onAssignScene={(sectionIndex, sceneId) => {
            setSections(prev => {
              const updated = [...prev];
              const sky = SCENE_SKY_MAP[sceneId] || 'clear-day';
              const ground = SCENE_GROUND_MAP[sceneId] || 'grass';
              updated[sectionIndex] = { ...updated[sectionIndex], scene: sceneId, sky, ground };
              return updated;
            });
          }}
          onScrubChange={setIsScrubbing}
          allowedEnvironments={allowedEnvironments}
          onClearScene={hideScenes ? null : (sectionIndex) => {
            setSections(prev => {
              const updated = [...prev];
              updated[sectionIndex] = { ...updated[sectionIndex], scene: null, sky: null, ground: null };
              return updated;
            });
          }}
        />
      </div>}

      {/* Section picker popover */}
      {pickerState && (
        <SectionPicker
          track={pickerState.track}
          currentValue={sections[pickerState.sectionIndex]?.[pickerState.track]}
          sectionData={sections[pickerState.sectionIndex]}
          rect={pickerState.rect}
          onSelect={handlePickerSelect}
          onClose={() => setPickerState(null)}
          allowedEnvironments={allowedEnvironments}
        />
      )}

      {/* Text overlay editor modal */}
      {showTextEditor && (
        <TextOverlayEditor
          onAdd={handleAddTextItem}
          onClose={() => { setShowTextEditor(false); setTextEditorPosition(null); }}
        />
      )}

      {/* Teacher save modal */}
      {teacherSaveToast && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden text-center">
            <div className="bg-green-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Saving Your Work</h3>
            </div>
            <div className="p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg font-semibold">Your work is being saved!</p>
              <p className="text-gray-500 text-sm mt-2">You can view it anytime from your dashboard.</p>
            </div>
          </div>
        </div>
      )}

      {/* Drag ghost — follows cursor when dragging sticker from panel */}
      {dragGhost && (
        <div
          className="fixed pointer-events-none z-[300]"
          style={{
            left: dragGhost.x - 24,
            top: dragGhost.y - 24,
            opacity: 0.85,
            transform: 'scale(1.2)',
          }}
        >
          <DragGhostContent sticker={dragGhost.sticker} />
        </div>
      )}

      {/* Intro + Directions modal — shown first time students open Listening Journey */}
      {showIntroModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl max-w-xl w-full shadow-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <h2 className="text-2xl font-black text-white">Welcome to the Listening Journey!</h2>
              <p className="text-white/80 text-sm mt-1">Build a visual world that matches the music</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* What is it */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🎵</span>
                  <p className="text-white/90 text-sm">As the music plays, your <span className="font-bold text-purple-300">character walks through scenes you create</span>. Place stickers that match what you hear — dynamics, tempo, instruments, and more!</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">🎮</span>
                  <p className="text-white/90 text-sm">This becomes a <span className="font-bold text-emerald-300">game your classmates will play!</span> A bird flies through your world collecting stickers for points.{!hideDecoys && ' Later you\'ll add decoy traps — fake stickers that cost points.'}</p>
                </div>
              </div>

              {/* How to use it */}
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-bold text-sm mb-2">How to Build</h3>
                <div className="space-y-2 text-white/80 text-sm">
                  <p><span className="font-bold text-white">1.</span> Click a <span className="text-blue-300 font-semibold">section (A, B, A')</span> in the timeline at the bottom</p>
                  <p><span className="font-bold text-white">2.</span> Drag <span className="text-amber-300 font-semibold">stickers</span> from the left panel onto the scene</p>
                  <p><span className="font-bold text-white">3.</span> Press <span className="text-emerald-300 font-semibold">Play</span> to hear the music and watch your journey</p>
                  <p><span className="font-bold text-white">4.</span> Add dynamics, tempo, and instrument stickers to each section</p>
                </div>
              </div>

              {/* Goal */}
              <div className="flex items-start gap-3 bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
                <span className="text-xl flex-shrink-0">🎯</span>
                <p className="text-white/90 text-sm"><span className="font-bold text-white">Your goal:</span> Make each section look and feel different — show how the music changes from quiet to loud, slow to fast!</p>
              </div>
            </div>
            <div className="px-6 pb-4">
              <button
                onClick={dismissIntro}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl transition-colors"
              >
                Let's Build!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Drag Ghost Content ───────────────────────────────────────────
// Renders the correct visual for a sticker being dragged from the panel
const DragGhostContent = ({ sticker }) => {
  if (sticker.render === 'svg') {
    const [IconComp, setIconComp] = React.useState(null);
    React.useEffect(() => {
      import('../texture-drawings/config/InstrumentIcons').then(mod => {
        setIconComp(() => mod.INSTRUMENT_ICONS[sticker.id]);
      });
    }, [sticker.id]);
    if (IconComp) return <IconComp size={64} />;
    return null;
  }
  return <span style={{ fontSize: '48px' }}>{sticker.symbol || sticker.id}</span>;
};

// ── Sticker Panel Wrapper ──────────────────────────────────────────
// Lazy wrapper to avoid importing the large StickerPanel unless needed
const StickerPanelWrapper = ({ selectedSticker, onStickerSelect, onDragStart, defaultTab = null }) => {
  const [StickerPanel, setStickerPanel] = useState(null);
  const [stickerSize, setStickerSize] = useState(56);

  // Lazy load StickerPanel
  React.useEffect(() => {
    import('../texture-drawings/components/Toolbar/StickerPanel').then(mod => {
      setStickerPanel(() => mod.default);
    });
  }, []);

  if (!StickerPanel) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-white/40 text-sm">Loading stickers...</span>
      </div>
    );
  }

  return (
    <StickerPanel
      selectedSticker={selectedSticker}
      onStickerSelect={onStickerSelect}
      onDragStart={onDragStart}
      stickerSize={stickerSize}
      onSizeChange={setStickerSize}
      isOpen={true}
      availableTabs={['instruments', 'dynamics', 'tempo', 'form', 'emojis']}
      defaultTab={defaultTab}
    />
  );
};

export default ListeningJourney;
