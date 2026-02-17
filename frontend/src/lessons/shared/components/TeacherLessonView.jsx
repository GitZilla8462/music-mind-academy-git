// File: /src/lessons/shared/components/TeacherLessonView.jsx
// Combined Teacher Control Sidebar + Presentation View
// Professional design: White/slate sidebar, dark presentation area
// ✅ UPDATED: Added mini live preview box below view toggle

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Check,
  Circle,
  Clock,
  Users,
  Copy,
  Monitor,
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Minimize2,
  Maximize2,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Video,
  SkipForward,
  Star,
  X,
  MessageSquare
} from 'lucide-react';
import { saveSurveyResponse, saveMidPilotSurvey, saveFinalPilotSurvey } from '../../../firebase/analytics';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { useTimerSound } from '../hooks/useTimerSound';

// ============================================
// SLIDE WITH AUDIO COMPONENT
// Displays a slide image with optional audio playback
// ============================================
const SlideWithAudio = ({ slidePath, audioPath, currentStage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Cleanup audio on unmount or slide change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [currentStage]);

  const toggleAudio = () => {
    if (!audioPath) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioPath);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          console.error('Failed to load audio:', audioPath);
          setIsPlaying(false);
        };
      }
      audioRef.current.play().catch(err => {
        console.error('Audio play failed:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <img
        src={slidePath}
        alt={currentStage}
        className="max-w-full max-h-full w-auto h-auto object-contain"
        onError={(e) => {
          console.error('Failed to load slide:', slidePath);
          e.target.style.display = 'none';
        }}
      />
      {/* Audio play button - only show if audioPath is provided */}
      {audioPath && (
        <button
          onClick={toggleAudio}
          className={`absolute bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-xl text-white font-semibold text-xl transition-all transform hover:scale-105 ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={28} />
              Stop Audio
            </>
          ) : (
            <>
              <Play size={28} />
              Play Sample
            </>
          )}
        </button>
      )}
    </div>
  );
};

// ============================================
// INSTRUMENT FAMILY SLIDE COMPONENT
// Displays instrument family info with audio player
// ============================================
const InstrumentFamilySlide = ({ title, familyColor, instruments, sound, facts, audioPath, currentStage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Cleanup audio on unmount or slide change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [currentStage]);

  const toggleAudio = () => {
    if (!audioPath) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioPath);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          console.error('Failed to load audio:', audioPath);
          setIsPlaying(false);
        };
      }
      audioRef.current.play().catch(err => {
        console.error('Audio play failed:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12">
      {/* Title with color accent */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-white mb-2">{title}</h1>
        <div
          className="h-2 w-48 mx-auto rounded-full"
          style={{ backgroundColor: familyColor }}
        />
      </div>

      {/* Main content - two columns */}
      <div className="flex-1 flex gap-12">
        {/* Left column - Instruments and Sound */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Instruments list */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Instruments</h2>
            <div className="flex flex-wrap gap-4">
              {instruments.map((instrument, idx) => (
                <div
                  key={idx}
                  className="px-6 py-3 rounded-xl text-2xl font-semibold text-white"
                  style={{ backgroundColor: familyColor }}
                >
                  {instrument}
                </div>
              ))}
            </div>
          </div>

          {/* Sound description */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Sound</h2>
            <p className="text-2xl text-slate-300 leading-relaxed">{sound}</p>
          </div>

          {/* Audio player button */}
          {audioPath && (
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-3 px-8 py-5 rounded-xl text-white font-semibold text-2xl transition-all transform hover:scale-105 w-fit ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={32} />
                  Stop Sample
                </>
              ) : (
                <>
                  <Play size={32} />
                  Play Sample
                </>
              )}
            </button>
          )}
        </div>

        {/* Right column - Facts */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6">Did You Know?</h2>
          <ul className="space-y-6">
            {facts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span
                  className="text-3xl mt-1"
                  style={{ color: familyColor }}
                >
                  •
                </span>
                <span className="text-2xl text-slate-200 leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ============================================
// YOUTUBE CLIP COMPONENT
// Embeds a YouTube video with start/end times
// Uses YouTube IFrame API for precise control
// ============================================
const YouTubeClip = ({ videoId, startTime, endTime, title, subtitle, currentStage }) => {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const checkIntervalRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    // Load the API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [currentStage]);

  const initPlayer = () => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      playerVars: {
        start: startTime,
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0
      },
      events: {
        onReady: () => setIsReady(true),
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            // Start checking for end time
            checkIntervalRef.current = setInterval(() => {
              if (playerRef.current && playerRef.current.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                if (currentTime >= endTime) {
                  playerRef.current.pauseVideo();
                  playerRef.current.seekTo(startTime);
                  setIsPlaying(false);
                  clearInterval(checkIntervalRef.current);
                }
              }
            }, 100);
          } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current);
            }
          }
        }
      }
    });
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.seekTo(startTime);
      playerRef.current.playVideo();
    }
  };

  const handleReplay = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(startTime);
    playerRef.current.playVideo();
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-2xl text-slate-300">{subtitle}</p>}
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          <div ref={containerRef} className="absolute inset-0" />

          {/* Overlay controls */}
          {!isPlaying && isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button
                onClick={handlePlayPause}
                className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all transform hover:scale-110 shadow-xl"
              >
                <Play size={48} className="text-white ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-xl transition-all ${
            !isReady
              ? 'bg-slate-600 cursor-not-allowed'
              : isPlaying
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause size={28} />
              Pause
            </>
          ) : (
            <>
              <Play size={28} />
              Play Clip
            </>
          )}
        </button>
        <button
          onClick={handleReplay}
          disabled={!isReady}
          className={`flex items-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-xl transition-all ${
            !isReady
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <RotateCcw size={28} />
          Replay
        </button>
      </div>

      {/* Attribution */}
      <div className="text-center mt-4 text-slate-400 text-sm">
        Video by Katy Adelson (CC BY) • youtube.com/watch?v={videoId}
      </div>
    </div>
  );
};

// ============================================
// PRESENTATION CONTENT COMPONENT
// Renders the appropriate content based on stage
// ============================================
const PresentationContent = ({
  currentStage,
  currentStageData,
  sessionCode,
  classCode, // For class-based sessions
  sessionData,
  lessonConfig,
  lessonBasePath,
  viewMode, // 'teacher' or 'student'
  onVideoEnded, // callback when video finishes playing
  goToNextStage, // callback to advance to next stage
  presentationZoom = 1 // zoom factor for scaling slides
}) => {
  // Display code: prefer classCode (permanent) over sessionCode (temporary)
  const displayCode = classCode || sessionCode;
  const [LayerDetectiveLeaderboard, setLayerDetectiveLeaderboard] = useState(null);
  const [LayerDetectiveResults, setLayerDetectiveResults] = useState(null);
  const [LayerDetectiveClassDemo, setLayerDetectiveClassDemo] = useState(null);
  const [SectionalLoopBuilderLeaderboard, setSectionalLoopBuilderLeaderboard] = useState(null);
  const [SectionalLoopBuilderResults, setSectionalLoopBuilderResults] = useState(null);
  const [MoodMatchTeacherView, setMoodMatchTeacherView] = useState(null);
  const [VideoHookComparison, setVideoHookComparison] = useState(null);
  const [StringFamilyShowcase, setStringFamilyShowcase] = useState(null);
  const [BeatBuilderDemo, setBeatBuilderDemo] = useState(null);
  const [NameThatGameActivity, setNameThatGameActivity] = useState(null);
  const [MelodyBuilderTeacherDemo, setMelodyBuilderTeacherDemo] = useState(null);
  const [MelodyMysteryActivity, setMelodyMysteryActivity] = useState(null);
  const [GuessThatInstrumentTeacherView, setGuessThatInstrumentTeacherView] = useState(null);
  const [DynamicsDashClassGame, setDynamicsDashClassGame] = useState(null);
  const [DynamicsDashResults, setDynamicsDashResults] = useState(null);
  const [DynamicsShowcase, setDynamicsShowcase] = useState(null);
  const [WoodwindFamilyShowcase, setWoodwindFamilyShowcase] = useState(null);
  const [TempoShowcase, setTempoShowcase] = useState(null);
  const [TempoCharadesTeacherGame, setTempoCharadesTeacherGame] = useState(null);
  const [TempoCharadesResults, setTempoCharadesResults] = useState(null);
  const [SectionSpotterTeacherGame, setSectionSpotterTeacherGame] = useState(null);
  const [SectionSpotterResults, setSectionSpotterResults] = useState(null);
  const [BrassFamilyShowcase, setBrassFamilyShowcase] = useState(null);
  const [PercussionFamilyShowcase, setPercussionFamilyShowcase] = useState(null);
  const [NameThatElementTeacherGame, setNameThatElementTeacherGame] = useState(null);
  const [CapstonePieceSelectionTeacher, setCapstonePieceSelectionTeacher] = useState(null);
  const [RondoFormGameTeacher, setRondoFormGameTeacher] = useState(null);
  const [RondoFormGameResults, setRondoFormGameResults] = useState(null);
  const [FourCornersGame, setFourCornersGame] = useState(null);
  const [CapstonePlanning, setCapstonePlanning] = useState(null);
  const [ListeningJourney, setListeningJourney] = useState(null);

  // Persist animator directions dismissed state across re-renders
  const animatorDirDismissedRef = useRef(false);

  // Get join URL based on site (defined early for use in join-code screen)
  const isProduction = window.location.hostname !== 'localhost';
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  // Use current host for dev (handles any port), production domains for prod
  const joinUrl = !isProduction ? `${window.location.host}/join` : (isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join');

  // Load game components dynamically
  useEffect(() => {
    // Layer Detective components - NEW CLASS GAME VERSION
    import('../../shared/activities/layer-detective/LayerDetectiveClassGame')
      .then(module => setLayerDetectiveLeaderboard(() => module.default))
      .catch(() => console.log('Layer Detective class game not available'));

    import('../../shared/activities/layer-detective/LayerDetectiveResults')
      .then(module => setLayerDetectiveResults(() => module.default))
      .catch(() => console.log('Layer Detective results not available'));

    import('../../shared/activities/layer-detective/LayerDetectiveClassDemo')
      .then(module => setLayerDetectiveClassDemo(() => module.default))
      .catch(() => console.log('Layer Detective class demo not available'));

    // Sectional Loop Builder components
    import('../../shared/activities/sectional-loop-builder/SectionalLoopBuilderPresentationView')
      .then(module => setSectionalLoopBuilderLeaderboard(() => module.default))
      .catch(() => console.log('Sectional Loop Builder leaderboard not available'));

    import('../../shared/activities/sectional-loop-builder/SectionalLoopBuilderResults')
      .then(module => setSectionalLoopBuilderResults(() => module.default))
      .catch(() => console.log('Sectional Loop Builder results not available'));

    // Mood Match Teacher View
    import('../../shared/activities/mood-match-game/MoodMatchTeacherView')
      .then(module => setMoodMatchTeacherView(() => module.default))
      .catch(() => console.log('Mood Match Teacher View not available'));

    // Lesson 4: Video Hook Comparison (No Music vs With Music)
    import('../../film-music-project/lesson4/components/VideoHookComparison')
      .then(module => setVideoHookComparison(() => module.default))
      .catch(() => console.log('Video Hook Comparison not available'));

    // Listening Lab Lesson 1: String Family Showcase
    import('../../listening-lab/lesson1/components/StringFamilyShowcase')
      .then(module => setStringFamilyShowcase(() => module.default))
      .catch(() => console.log('String Family Showcase not available'));

    // Lesson 4: Beat Builder Demo (Building a Beat)
    import('../../film-music-project/lesson4/components/BeatBuilderDemo')
      .then(module => setBeatBuilderDemo(() => module.default))
      .catch(() => console.log('Beat Builder Demo not available'));

    // Lesson 5: Name That Game Activity
    import('../../shared/activities/name-that-game/NameThatGameActivity')
      .then(module => setNameThatGameActivity(() => module.default))
      .catch(() => console.log('Name That Game Activity not available'));

    // Lesson 5: Melody Builder Teacher Demo
    import('../../shared/activities/melody-maker/MelodyBuilderTeacherDemo')
      .then(module => setMelodyBuilderTeacherDemo(() => module.default))
      .catch(() => console.log('Melody Builder Teacher Demo not available'));

    // Lesson 5: Melody Mystery Activity
    import('../../shared/activities/melody-mystery/MelodyMysteryActivity')
      .then(module => setMelodyMysteryActivity(() => module.default))
      .catch(() => console.log('Melody Mystery Activity not available'));

    // Unit 2 Listening Lab: Guess That Instrument Teacher View
    import('../../shared/activities/guess-that-instrument/GuessThatInstrumentTeacherView')
      .then(module => setGuessThatInstrumentTeacherView(() => module.default))
      .catch(() => console.log('Guess That Instrument Teacher View not available'));

    // Unit 2 Listening Lab Lesson 1: Dynamics Dash Class Game
    import('../../shared/activities/dynamics-dash/DynamicsDashClassGame')
      .then(module => setDynamicsDashClassGame(() => module.default))
      .catch(() => console.log('Dynamics Dash Class Game not available'));

    // Unit 2 Listening Lab Lesson 1: Dynamics Dash Results
    import('../../shared/activities/dynamics-dash/DynamicsDashResults')
      .then(module => setDynamicsDashResults(() => module.default))
      .catch(() => console.log('Dynamics Dash Results not available'));

    // Unit 2 Listening Lab Lesson 1: Dynamics Showcase (interactive slide)
    import('../../shared/activities/dynamics-dash/DynamicsShowcase')
      .then(module => setDynamicsShowcase(() => module.default))
      .catch(() => console.log('Dynamics Showcase not available'));

    // Unit 2 Listening Lab Lesson 2: Woodwind Family Showcase
    import('../../listening-lab/lesson2/components/WoodwindFamilyShowcase')
      .then(module => setWoodwindFamilyShowcase(() => module.default))
      .catch(() => console.log('Woodwind Family Showcase not available'));

    // Unit 2 Listening Lab Lesson 2: Tempo Showcase (interactive slide)
    import('../../shared/activities/tempo-charades/TempoShowcase')
      .then(module => setTempoShowcase(() => module.default))
      .catch(() => console.log('Tempo Showcase not available'));

    // Unit 2 Listening Lab Lesson 2: Tempo Charades Teacher Game
    import('../../shared/activities/tempo-charades/TempoCharadesTeacherGame')
      .then(module => setTempoCharadesTeacherGame(() => module.default))
      .catch(() => console.log('Tempo Charades Teacher Game not available'));

    // Unit 2 Listening Lab Lesson 2: Tempo Charades Results
    import('../../shared/activities/tempo-charades/TempoCharadesResults')
      .then(module => setTempoCharadesResults(() => module.default))
      .catch(() => console.log('Tempo Charades Results not available'));

    // Unit 2 Listening Lab Lesson 4: Section Spotter Teacher Game
    import('../../shared/activities/section-spotter/SectionSpotterTeacherGame')
      .then(module => setSectionSpotterTeacherGame(() => module.default))
      .catch(() => console.log('Section Spotter Teacher Game not available'));

    // Unit 2 Listening Lab Lesson 4: Section Spotter Results
    import('../../shared/activities/section-spotter/SectionSpotterResults')
      .then(module => setSectionSpotterResults(() => module.default))
      .catch(() => console.log('Section Spotter Results not available'));

    // Unit 2 Listening Lab Lesson 3: Rondo Form Game
    import('../../shared/activities/rondo-form-game/RondoFormGameTeacher')
      .then(module => setRondoFormGameTeacher(() => module.default))
      .catch(() => console.log('Rondo Form Game Teacher not available'));

    // Unit 2 Listening Lab Lesson 3: Rondo Form Game Results
    import('../../shared/activities/rondo-form-game/RondoFormGameResults')
      .then(module => setRondoFormGameResults(() => module.default))
      .catch(() => console.log('Rondo Form Game Results not available'));

    // Unit 2 Listening Lab Lesson 3: Brass Family Showcase
    import('../../listening-lab/lesson3/components/BrassFamilyShowcase')
      .then(module => setBrassFamilyShowcase(() => module.default))
      .catch(() => console.log('Brass Family Showcase not available'));

    // Unit 2 Listening Lab Lesson 3: Percussion Family Showcase
    import('../../listening-lab/lesson3/components/PercussionFamilyShowcase')
      .then(module => setPercussionFamilyShowcase(() => module.default))
      .catch(() => console.log('Percussion Family Showcase not available'));

    // Unit 2 Listening Lab Lesson 4: Name That Element Teacher Game
    import('../../shared/activities/name-that-element/NameThatElementTeacherGame')
      .then(module => setNameThatElementTeacherGame(() => module.default))
      .catch(() => console.log('Name That Element Teacher Game not available'));

    // Unit 2 Listening Lab Lesson 3: Four Corners Game
    import('../../shared/activities/four-corners/FourCornersGame')
      .then(module => setFourCornersGame(() => module.default))
      .catch(() => console.log('Four Corners Game not available'));

    // Unit 2 Listening Lab Lesson 3: Capstone Planning (Journey Planner)
    import('../../shared/activities/capstone/CapstonePlanning')
      .then(module => setCapstonePlanning(() => module.default))
      .catch(() => console.log('Capstone Planning not available'));

    // Unit 2 Listening Lab: Listening Journey Animator
    import('../../shared/activities/listening-journey/ListeningJourney')
      .then(module => setListeningJourney(() => module.default))
      .catch(() => console.log('Listening Journey not available'));

    // Unit 2 Listening Lab Lesson 4: Capstone Piece Selection Teacher View
    import('../../shared/activities/capstone/CapstonePieceSelectionTeacher')
      .then(module => setCapstonePieceSelectionTeacher(() => module.default))
      .catch(() => console.log('Capstone Piece Selection Teacher not available'));
  }, []);

  // Join Code Screen
  if (currentStage === 'locked' || currentStage === 'join-code') {
    const studentCount = sessionData?.studentsJoined 
      ? Object.keys(sessionData.studentsJoined).length 
      : 0;

    const isClassSession = !!classCode;

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8">
        {isClassSession ? (
          /* Class session: show visual mockup of what students will see */
          <>
            <div className="text-center mb-8">
              <div className="text-slate-400 text-xl mb-2">Go to</div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {joinUrl}
              </h1>
            </div>

            {/* Visual mockup of the Student Login card */}
            <div className="flex items-center gap-8 mb-8">
              {/* Step 1: Click Sign In */}
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg" style={{ minWidth: '280px' }}>
                <div className="text-sm font-semibold text-slate-500 mb-1">Student Login</div>
                <div className="text-xs text-slate-400 mb-5">Sign in to see your work and grades</div>
                <div className="bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg text-lg">
                  Sign In
                </div>
              </div>

              {/* Arrow */}
              <div className="text-slate-500 text-4xl font-bold">→</div>

              {/* Step 2: Click Join Class */}
              <div className="bg-emerald-600 rounded-2xl p-8 text-center shadow-lg" style={{ minWidth: '280px' }}>
                <div className="text-emerald-100 text-sm mb-3">Then click</div>
                <div className="bg-white text-emerald-700 font-bold py-3 px-8 rounded-lg text-xl flex items-center justify-center gap-2">
                  ▶ Join Class
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Quick session: show visual mockup with code */
          <>
            {/* Label */}
            <div className="mb-6">
              <span className="bg-emerald-600 text-white text-lg font-semibold px-5 py-2 rounded-full">
                Quick Session — No Accounts Needed
              </span>
            </div>

            <div className="text-center mb-8">
              <div className="text-slate-400 text-xl mb-2">Go to</div>
              <h1 className="text-5xl md:text-6xl font-bold text-white">
                {joinUrl}
              </h1>
            </div>

            {/* Visual mockup of the Start Lesson card */}
            <div className="bg-white rounded-2xl p-8 mb-8 text-center shadow-lg" style={{ minWidth: '340px' }}>
              <div className="text-sm font-semibold text-slate-500 mb-1">Start Lesson</div>
              <div className="text-xs text-slate-400 mb-4">Your teacher will show the code on screen</div>
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg py-4 px-6 mb-4">
                <div className="text-6xl md:text-7xl font-bold font-mono tracking-widest text-blue-600">
                  {displayCode}
                </div>
              </div>
              <div className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-lg">
                Join
              </div>
            </div>
          </>
        )}

        {/* Student Count */}
        <div className="flex items-center gap-3 text-2xl text-slate-300">
          <Users size={28} />
          <span>
            {studentCount === 0
              ? 'Waiting for students...'
              : `${studentCount} student${studentCount !== 1 ? 's' : ''} joined`
            }
          </span>
        </div>
      </div>
    );
  }

  // Session Ended Screen
  if (currentStage === 'ended') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8">
        <div className="text-8xl mb-6">
          <Check size={100} className="text-emerald-500" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Session Ended</h1>
        <p className="text-xl text-slate-400">
          Thank you for participating!
        </p>
      </div>
    );
  }

  // Use presentationView from lesson config
  if (currentStageData?.presentationView) {
    const { type, slidePath, videoPath, title, audioPath, pieceConfig } = currentStageData.presentationView;

    // Layer Detective Leaderboard
    if (type === 'layer-detective-leaderboard' && LayerDetectiveLeaderboard) {
      return (
        <div className="absolute inset-0">
          <LayerDetectiveLeaderboard sessionData={sessionData} onComplete={goToNextStage} />
        </div>
      );
    }

    // Layer Detective Results
    if (type === 'layer-detective-results' && LayerDetectiveResults) {
      return (
        <div className="absolute inset-0">
          <LayerDetectiveResults sessionData={sessionData} />
        </div>
      );
    }

    // Layer Detective Class Demo
    if (type === 'layer-detective-class-demo' && LayerDetectiveClassDemo) {
      return (
        <div className="absolute inset-0">
          <React.Suspense fallback={
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
              <div className="text-white text-2xl">Loading class demo...</div>
            </div>
          }>
            <LayerDetectiveClassDemo sessionData={sessionData} />
          </React.Suspense>
        </div>
      );
    }

    // Sectional Loop Builder Leaderboard
    if (type === 'sectional-loop-builder-leaderboard' && SectionalLoopBuilderLeaderboard) {
      return (
        <div className="absolute inset-0">
          <SectionalLoopBuilderLeaderboard sessionData={sessionData} onAdvanceLesson={goToNextStage} />
        </div>
      );
    }

    // Sectional Loop Builder Results
    if (type === 'sectional-loop-builder-results' && SectionalLoopBuilderResults) {
      return (
        <div className="absolute inset-0">
          <SectionalLoopBuilderResults sessionData={sessionData} />
        </div>
      );
    }

    // Mood Match Teacher View
    if (type === 'mood-match-teacher') {
      if (!MoodMatchTeacherView) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-white text-2xl">Loading Mood Match Game...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <MoodMatchTeacherView onAdvanceLesson={goToNextStage} />
        </div>
      );
    }

    // Unit 2 Listening Lab: Guess That Instrument Teacher View
    if (type === 'guess-instrument-teacher') {
      if (!GuessThatInstrumentTeacherView) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
            <div className="text-white text-2xl">Loading Guess That Instrument...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <GuessThatInstrumentTeacherView
            sessionCode={sessionCode}
            sessionData={sessionData}
            onAdvanceLesson={goToNextStage}
          />
        </div>
      );
    }

    // String Family Showcase (Listening Lab Lesson 1) - Meet the String Instruments
    if (type === 'string-family-showcase') {
      if (!StringFamilyShowcase) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-white text-2xl">Loading String Family Showcase...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <StringFamilyShowcase onAdvance={goToNextStage} />
        </div>
      );
    }

    // Dynamics Showcase (Listening Lab Lesson 1) - Interactive dynamic markings slide
    if (type === 'dynamics-showcase') {
      if (!DynamicsShowcase) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
            <div className="text-white text-2xl">Loading Dynamics Showcase...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <DynamicsShowcase sessionData={sessionData} />
        </div>
      );
    }

    // Crescendo & Decrescendo slide - simple symbols with definitions and audio examples
    if (type === 'crescendo-decrescendo') {
      const CrescendoDecrescendoSlide = () => {
        const [playingClip, setPlayingClip] = React.useState(null);
        const audioRef = React.useRef(null);
        const timerRef = React.useRef(null);

        const AUDIO_PATH = '/lessons/film-music-project/lesson2/mp3/Classicals.de-Vivaldi-The-Four-Seasons-01-John-Harrison-with-the-Wichita-State-University-Chamber-Players-Spring-Mvt-1-Allegro.mp3';

        const playClip = (clipType, startTime, endTime) => {
          // Stop any current playback
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }

          const audio = new Audio(AUDIO_PATH);
          audioRef.current = audio;
          audio.currentTime = startTime;
          audio.volume = 0.7;

          audio.play().catch(err => console.error('Audio error:', err));
          setPlayingClip(clipType);

          const duration = (endTime - startTime) * 1000;
          timerRef.current = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
            }
            setPlayingClip(null);
          }, duration);
        };

        React.useEffect(() => {
          return () => {
            if (audioRef.current) audioRef.current.pause();
            if (timerRef.current) clearTimeout(timerRef.current);
          };
        }, []);

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-8">
            <h1 className="text-6xl lg:text-8xl font-bold text-white mb-8 lg:mb-12">Gradual Dynamic Changes</h1>

            <div className="flex gap-16 lg:gap-32">
              {/* Crescendo */}
              <div className="flex flex-col items-center">
                <div className="text-4xl lg:text-5xl font-bold text-purple-300 mb-5">Crescendo</div>
                {/* Wedge symbol opening right - two lines only */}
                <div className="w-56 lg:w-80 h-20 lg:h-24 mb-5 flex items-center">
                  <svg viewBox="0 0 200 60" className="w-full h-full">
                    <polyline points="0,30 200,5" fill="none" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
                    <polyline points="0,30 200,55" fill="none" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-2xl lg:text-3xl text-white mb-5">Gradually getting <span className="text-green-400 font-bold">LOUDER</span></div>
                <button
                  onClick={() => playClip('crescendo', 131, 137)}
                  className={`px-8 py-4 rounded-xl text-xl lg:text-2xl font-bold flex items-center gap-3 transition-all ${
                    playingClip === 'crescendo'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {playingClip === 'crescendo' ? '🔊 Playing...' : '▶ Hear Example'}
                </button>
              </div>

              {/* Decrescendo */}
              <div className="flex flex-col items-center">
                <div className="text-4xl lg:text-5xl font-bold text-purple-300 mb-5">Decrescendo</div>
                {/* Wedge symbol opening left - two lines only */}
                <div className="w-56 lg:w-80 h-20 lg:h-24 mb-5 flex items-center">
                  <svg viewBox="0 0 200 60" className="w-full h-full">
                    <polyline points="0,5 200,30" fill="none" stroke="#F87171" strokeWidth="4" strokeLinecap="round" />
                    <polyline points="0,55 200,30" fill="none" stroke="#F87171" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-2xl lg:text-3xl text-white mb-5">Gradually getting <span className="text-red-400 font-bold">SOFTER</span></div>
                <button
                  onClick={() => playClip('decrescendo', 64, 69)}
                  className={`px-8 py-4 rounded-xl text-xl lg:text-2xl font-bold flex items-center gap-3 transition-all ${
                    playingClip === 'decrescendo'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {playingClip === 'decrescendo' ? '🔊 Playing...' : '▶ Hear Example'}
                </button>
              </div>
            </div>
          </div>
        );
      };

      return <CrescendoDecrescendoSlide />;
    }

    // Dynamics Dash Class Game (Listening Lab Lesson 1) - Teacher controls game
    if (type === 'dynamics-dash-class-game') {
      if (!DynamicsDashClassGame) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <div className="text-white text-2xl">Loading Dynamics Dash...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <DynamicsDashClassGame sessionData={sessionData} onComplete={goToNextStage} />
        </div>
      );
    }

    // Dynamics Dash Results (Listening Lab Lesson 1) - Show leaderboard
    if (type === 'dynamics-dash-results') {
      if (!DynamicsDashResults) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <div className="text-white text-2xl">Loading Results...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <DynamicsDashResults sessionData={sessionData} />
        </div>
      );
    }

    // Woodwind Family Showcase (Listening Lab Lesson 2) - Meet the Woodwind Instruments
    if (type === 'woodwind-showcase') {
      if (!WoodwindFamilyShowcase) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900">
            <div className="text-white text-2xl">Loading Woodwind Family Showcase...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <WoodwindFamilyShowcase onAdvance={goToNextStage} />
        </div>
      );
    }

    // Tempo Showcase (Listening Lab Lesson 2) - Interactive tempo markings slide
    if (type === 'tempo-showcase') {
      if (!TempoShowcase) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
            <div className="text-white text-2xl">Loading Tempo Showcase...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <TempoShowcase sessionData={sessionData} />
        </div>
      );
    }

    // Tempo Changes slide (Listening Lab Lesson 2) - Accelerando & Ritardando
    if (type === 'tempo-changes') {
      const TempoChangesSlide = () => {
        const [activeDemo, setActiveDemo] = React.useState(null); // 'accel' | 'rit' | null
        const animationRef = React.useRef(null);
        const audioRef = React.useRef(null);
        const audioTimerRef = React.useRef(null);

        const CLIPS = {
          rit: { start: 55, end: 65 },    // 0:55–1:05 — ritardando into slow C section
          accel: { start: 140, end: 153 }, // 2:20–2:33 — accelerando racing to the finish
        };

        React.useEffect(() => {
          return () => {
            if (animationRef.current) clearTimeout(animationRef.current);
            if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
          };
        }, []);

        const stopDemo = () => {
          setActiveDemo(null);
          if (animationRef.current) clearTimeout(animationRef.current);
          if (audioTimerRef.current) clearTimeout(audioTimerRef.current);
          if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        };

        const startDemo = (type) => {
          if (activeDemo === type) {
            stopDemo();
            return;
          }
          stopDemo();
          setActiveDemo(type);

          // Play Brahms clip
          const clip = CLIPS[type];
          const audio = new Audio('/audio/classical/brahms-hungarian-dance-5.mp3');
          audioRef.current = audio;
          audio.currentTime = clip.start;
          audio.volume = 0.7;
          audio.play().catch(err => console.error('Audio error:', err));

          const duration = (clip.end - clip.start) * 1000;
          audioTimerRef.current = setTimeout(() => {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
          }, duration);

          // Auto-stop animation after clip
          animationRef.current = setTimeout(() => setActiveDemo(null), duration);
        };

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-8">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 lg:mb-12">Tempo Changes</h1>

            <div className="flex gap-12 lg:gap-24">
              {/* Accelerando */}
              <div className="flex flex-col items-center">
                <div className="text-3xl lg:text-4xl font-bold text-green-300 mb-4">Accelerando</div>
                <div className="text-6xl mb-4">🚀</div>
                {/* Speed dots - getting closer together */}
                <div className="w-64 h-12 mb-4 flex items-center justify-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className={`rounded-full bg-green-400 transition-all duration-300 ${
                        activeDemo === 'accel' ? 'animate-bounce' : ''
                      }`}
                      style={{
                        width: '12px',
                        height: '12px',
                        marginRight: `${Math.max(2, 16 - i * 2)}px`,
                        animationDelay: activeDemo === 'accel' ? `${i * 80}ms` : '0ms'
                      }}
                    />
                  ))}
                </div>
                <div className="text-xl lg:text-2xl text-white mb-4">Gradually getting <span className="text-green-400 font-bold">FASTER</span></div>
                <div className="text-lg text-white/60 mb-4 italic">"accel."</div>
                <button
                  onClick={() => startDemo('accel')}
                  className={`px-6 py-3 rounded-xl text-lg font-bold flex items-center gap-2 transition-all ${
                    activeDemo === 'accel'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {activeDemo === 'accel' ? '⏹ Stop' : '▶ Hear Example'}
                </button>
              </div>

              {/* Ritardando */}
              <div className="flex flex-col items-center">
                <div className="text-3xl lg:text-4xl font-bold text-red-300 mb-4">Ritardando</div>
                <div className="text-6xl mb-4">🛑</div>
                {/* Speed dots - getting farther apart */}
                <div className="w-64 h-12 mb-4 flex items-center justify-center gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className={`rounded-full bg-red-400 transition-all duration-300 ${
                        activeDemo === 'rit' ? 'animate-bounce' : ''
                      }`}
                      style={{
                        width: '12px',
                        height: '12px',
                        marginRight: `${Math.max(2, 2 + i * 2)}px`,
                        animationDelay: activeDemo === 'rit' ? `${i * 120}ms` : '0ms'
                      }}
                    />
                  ))}
                </div>
                <div className="text-xl lg:text-2xl text-white mb-4">Gradually getting <span className="text-red-400 font-bold">SLOWER</span></div>
                <div className="text-lg text-white/60 mb-4 italic">"rit."</div>
                <button
                  onClick={() => startDemo('rit')}
                  className={`px-6 py-3 rounded-xl text-lg font-bold flex items-center gap-2 transition-all ${
                    activeDemo === 'rit'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {activeDemo === 'rit' ? '⏹ Stop' : '▶ Hear Example'}
                </button>
              </div>
            </div>
          </div>
        );
      };

      return <TempoChangesSlide />;
    }

    // Tempo Charades Teacher Game (Listening Lab Lesson 2) - Teacher controls game
    if (type === 'tempo-charades-teacher-game') {
      if (!TempoCharadesTeacherGame) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <div className="text-white text-2xl">Loading Tempo Charades...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <TempoCharadesTeacherGame sessionData={sessionData} onComplete={goToNextStage} />
        </div>
      );
    }

    // Tempo Charades Results (Listening Lab Lesson 2) - Show leaderboard
    if (type === 'tempo-charades-results') {
      if (!TempoCharadesResults) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
            <div className="text-white text-2xl">Loading Results...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <TempoCharadesResults sessionData={sessionData} />
        </div>
      );
    }

    // Section Spotter Teacher Game (Listening Lab Lessons 3 & 4) - Teacher controls game
    if (type === 'section-spotter-teacher-game') {
      if (!SectionSpotterTeacherGame) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900">
            <div className="text-white text-2xl">Loading Section Spotter...</div>
          </div>
        );
      }

      const ssPieceId = currentStageData?.presentationView?.pieceId || 'fur-elise';

      return (
        <div className="absolute inset-0">
          <SectionSpotterTeacherGame sessionData={sessionData} onComplete={goToNextStage} pieceId={ssPieceId} />
        </div>
      );
    }

    // Section Spotter Results (Listening Lab Lesson 4) - Show leaderboard
    if (type === 'section-spotter-results') {
      if (!SectionSpotterResults) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900">
            <div className="text-white text-2xl">Loading Results...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <SectionSpotterResults sessionData={sessionData} />
        </div>
      );
    }

    // Rondo Form Game Teacher (Listening Lab Lesson 3) - Guided listening + 3-round game
    if (type === 'rondo-form-game-teacher') {
      if (!RondoFormGameTeacher) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
            <div className="text-white text-2xl">Loading Rondo Form Game...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <RondoFormGameTeacher sessionData={sessionData} onComplete={goToNextStage} />
        </div>
      );
    }

    // Rondo Form Game Results (Listening Lab Lesson 3) - Show leaderboard
    if (type === 'rondo-form-game-results') {
      if (!RondoFormGameResults) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
            <div className="text-white text-2xl">Loading Results...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <RondoFormGameResults sessionData={sessionData} />
        </div>
      );
    }

    // Brass Family Showcase (Listening Lab Lesson 3) - Auto-sequence through brass instruments
    if (type === 'brass-showcase') {
      if (!BrassFamilyShowcase) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
            <div className="text-white text-2xl">Loading Brass Showcase...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <BrassFamilyShowcase onAdvance={goToNextStage} />
        </div>
      );
    }

    // Percussion Family Showcase (Listening Lab Lesson 3) - Auto-sequence through percussion instruments
    if (type === 'percussion-showcase') {
      if (!PercussionFamilyShowcase) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900">
            <div className="text-white text-2xl">Loading Percussion Showcase...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <PercussionFamilyShowcase onAdvance={goToNextStage} />
        </div>
      );
    }

    // Journey Planner Directions (Listening Lab Lesson 3) - 60/40 split: activity left, directions right
    // Steps 0-2: text directions, Steps 3-5: section-by-section playback with teacher play buttons
    // Right panel uses Epic Wildlife green/teal color scheme, one direction at a time
    if (type === 'journey-planner-directions') {
      const MOUNTAIN_KING_SECTIONS = [
        { label: 'A', name: 'Sneaky Start', startTime: 0, endTime: 59, color: '#3B82F6', desc: 'Pizzicato strings + bassoons, pp, andante' },
        { label: 'B', name: 'Building Energy', startTime: 59, endTime: 101, color: '#EF4444', desc: 'Brass enters, tempo increases, mf' },
        { label: 'A\'', name: 'Explosive Return', startTime: 101, endTime: 150, color: '#3B82F6', desc: 'Full orchestra, ff, presto' },
      ];
      const AUDIO_PATH = '/audio/classical/grieg-mountain-king.mp3';

      const PlannerDirectionsSplit = () => {
        const [dirStep, setDirStep] = useState(0);
        const [isPlaying, setIsPlaying] = useState(false);
        const audioRef = useRef(null);
        const clipTimerRef = useRef(null);

        // Cleanup audio on unmount
        useEffect(() => {
          return () => {
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
            if (clipTimerRef.current) clearTimeout(clipTimerRef.current);
          };
        }, []);

        const stopAudio = useCallback(() => {
          if (audioRef.current) { audioRef.current.pause(); }
          if (clipTimerRef.current) { clearTimeout(clipTimerRef.current); clipTimerRef.current = null; }
          setIsPlaying(false);
        }, []);

        // Stop audio when changing steps
        useEffect(() => { stopAudio(); }, [dirStep, stopAudio]);

        const playSection = useCallback((section) => {
          stopAudio();
          if (!audioRef.current) {
            audioRef.current = new Audio(AUDIO_PATH);
            audioRef.current.preload = 'auto';
          }
          audioRef.current.currentTime = section.startTime;
          audioRef.current.volume = 0.5;
          audioRef.current.play().catch(err => console.error('Audio play error:', err));
          setIsPlaying(true);
          const duration = (section.endTime - section.startTime) * 1000;
          clipTimerRef.current = setTimeout(() => {
            if (audioRef.current) audioRef.current.pause();
            setIsPlaying(false);
          }, duration);
        }, [stopAudio]);

        const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

        // Which section index is active (steps 3,4,5 → sections 0,1,2)
        const activeSectionIdx = dirStep >= 3 ? dirStep - 3 : -1;
        const isPlaybackPhase = dirStep >= 3;
        const totalSteps = 6;

        // Direction content for steps 0-2
        const textDirections = [
          {
            title: 'Your Job',
            content: (
              <div className="space-y-4">
                <div className="text-center mb-2"><div className="text-5xl mb-2">🗺️</div></div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">•</span><span>You just identified the <span className="font-bold text-gray-900">ABA form</span> of Mountain King</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">•</span><span>Now <span className="font-bold text-gray-900">PLAN</span> your Listening Journey by describing each section</span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">•</span><span>Listen to each section and fill in: <span className="font-bold text-amber-600">DYNAMICS</span>, <span className="font-bold text-emerald-600">TEMPO</span>, and <span className="font-bold text-purple-600">INSTRUMENTS</span></span></li>
                    <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">•</span><span>This plan will guide you when you build your Listening Journey!</span></li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: 'For Each Section, Describe:',
            content: (
              <div className="space-y-4">
                <div className="text-center mb-2"><div className="text-5xl mb-2">🎧</div></div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2"><span className="text-amber-500 text-xl mt-0.5">♪</span><span><span className="font-bold text-amber-600">DYNAMICS</span> — How loud or soft? (pp, p, mf, f, ff)</span></li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 text-xl mt-0.5">♪</span><span><span className="font-bold text-emerald-600">TEMPO</span> — How fast? (andante, moderato, presto)</span></li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 text-xl mt-0.5">♪</span><span><span className="font-bold text-purple-600">INSTRUMENTS</span> — Which families and instruments do you hear?</span></li>
                  </ul>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-200 text-center">
                  <p className="text-teal-700 font-bold">You can select multiple things you hear!</p>
                </div>
              </div>
            ),
          },
          {
            title: 'Now Let\'s Listen!',
            content: (
              <div className="space-y-4">
                <div className="text-center mb-2"><div className="text-5xl mb-2">🎵</div></div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-lg font-bold text-gray-800 text-center">
                    We will listen to each section one at a time
                  </p>
                  <p className="text-gray-600 text-center mt-2">
                    Pay attention to the dynamics, tempo, and instruments you hear
                  </p>
                </div>
              </div>
            ),
          },
        ];

        const headerTitle = isPlaybackPhase
          ? `Section ${MOUNTAIN_KING_SECTIONS[activeSectionIdx].label}`
          : textDirections[dirStep].title;

        return (
          <div className="absolute inset-0 flex bg-white">
            {/* Left 40% — Teacher directions (Epic Wildlife green/teal scheme) */}
            <div className="w-[40%] h-full bg-white border-r-2 border-green-200 flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-5 py-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={22} />
                  <h2 className="font-bold text-xl">{headerTitle}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === dirStep ? 'bg-white scale-125' : i < dirStep ? 'bg-white/50' : 'bg-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {!isPlaybackPhase ? (
                  textDirections[dirStep].content
                ) : (
                  /* Section playback controls */
                  (() => {
                    const sec = MOUNTAIN_KING_SECTIONS[activeSectionIdx];
                    return (
                      <div className="space-y-4">
                        <div className="text-center mb-2">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-3"
                            style={{ backgroundColor: sec.color }}
                          >
                            {sec.label}
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg">{sec.name}</h3>
                          <p className="text-gray-500">{formatTime(sec.startTime)}–{formatTime(sec.endTime)}</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-gray-700 text-center mb-4">
                            Press play to listen to <span className="font-bold">Section {sec.label}</span> with your class
                          </p>
                          <button
                            onClick={() => isPlaying ? stopAudio() : playSection(sec)}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                              isPlaying
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {isPlaying ? (
                              <><Pause size={24} /> Stop</>
                            ) : (
                              <><Play size={24} /> Play Section {sec.label}</>
                            )}
                          </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-600 text-center">
                            Students are watching the main screen. Ask them to listen for the <span className="font-bold">dynamics</span>, <span className="font-bold">tempo</span>, and <span className="font-bold">instruments</span> in this section.
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Navigation */}
              <div className="border-t border-green-100 px-5 py-3 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setDirStep(Math.max(0, dirStep - 1))}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                    dirStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft size={18} /> Back
                </button>
                {dirStep < totalSteps - 1 ? (
                  <button
                    onClick={() => setDirStep(dirStep + 1)}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center gap-1"
                  >
                    {dirStep === 2 ? 'Start Listening' : 'Next'} <ChevronRight size={18} />
                  </button>
                ) : (
                  <div className="text-sm text-green-600 font-semibold flex items-center gap-1">
                    <Check size={18} /> All sections complete
                  </div>
                )}
              </div>
            </div>

            {/* Right 60% — CapstonePlanning always visible, with section highlight during playback */}
            <div className="w-[60%] h-full relative bg-gray-100 overflow-hidden">
              {CapstonePlanning ? (
                <CapstonePlanning
                  onComplete={() => {}}
                  isSessionMode={false}
                  highlightSection={isPlaybackPhase ? MOUNTAIN_KING_SECTIONS[activeSectionIdx].label : null}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <p className="text-gray-400">Loading planner...</p>
                </div>
              )}
            </div>
          </div>
        );
      };

      return (
        <div className="absolute inset-0">
          <PlannerDirectionsSplit />
        </div>
      );
    }

    // Journey Animator Directions (Listening Lab Lesson 3) - Live animator + floating draggable overlay
    if (type === 'journey-animator-directions') {
      return (
        <div className="absolute inset-0">
          <AnimatorDirectionsOverlay
            ListeningJourneyComponent={ListeningJourney}
            pieceConfig={pieceConfig}
            dismissedRef={animatorDirDismissedRef}
          />
        </div>
      );
    }

    // Form Answer Key (Listening Lab Lesson 3) - Mountain King ABA answer key
    if (type === 'form-answer-key') {
      const FormAnswerKeySlide = () => {
        const mountainKingSections = [
          { label: 'A', color: '#3B82F6', name: 'Sneaky Start', instruments: 'Pizzicato Strings + Bassoons', dynamics: 'Pianissimo' },
          { label: 'B', color: '#EF4444', name: 'Building Energy', instruments: 'Brass + Winds', dynamics: 'Mezzo-forte' },
          { label: 'A\'', color: '#3B82F6', name: 'Explosive Return', instruments: 'Full Orchestra', dynamics: 'Fortissimo' },
        ];

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <h2 className="text-5xl font-black text-white mb-2">Answer Key</h2>
            <p className="text-2xl text-gray-400 mb-6">In the Hall of the Mountain King — Grieg</p>

            {/* Form pattern */}
            <div className="flex gap-4 mb-6">
              {mountainKingSections.map((s, idx) => (
                <div
                  key={idx}
                  className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl font-black text-white shadow-lg"
                  style={{ backgroundColor: s.color }}
                >
                  {s.label}
                </div>
              ))}
            </div>

            <p className="text-3xl font-bold text-amber-300 mb-6">TERNARY — ABA</p>

            {/* Section details */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl w-full">
              {mountainKingSections.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-5 text-center text-white"
                  style={{ backgroundColor: `${s.color}30`, borderColor: s.color, borderWidth: '2px' }}
                >
                  <div className="text-3xl font-black mb-2" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-lg font-bold mb-1">{s.name}</div>
                  <div className="text-sm text-white/70">{s.instruments}</div>
                  <div className="text-sm text-white/50">{s.dynamics}</div>
                </div>
              ))}
            </div>
          </div>
        );
      };

      return <FormAnswerKeySlide />;
    }

    // Form Listening Map Directions (Listening Lab Lesson 3) - shown on teacher screen while students work
    if (type === 'form-listening-map-directions') {
      const FormListeningMapDirectionsSlide = () => (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-8">
          <h2 className="text-5xl font-black text-white mb-3">Form Listening Map</h2>
          <p className="text-2xl text-blue-300 mb-8">Grieg: In the Hall of the Mountain King</p>

          <div className="grid grid-cols-2 gap-6 max-w-3xl w-full mb-8">
            <div className="bg-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Color Code</h3>
              <div className="space-y-3">
                {[
                  { label: 'A — Sneaky Theme', color: '#3B82F6', emoji: '🔵' },
                  { label: 'B — Building Energy', color: '#EF4444', emoji: '🔴' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-lg font-bold text-white">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">What to Mark</h3>
              <div className="space-y-3 text-lg text-white/90">
                <p>🔤 Label each section (A, B)</p>
                <p>🎺 Mark instruments you hear</p>
                <p>📢 Note the dynamics (loud/soft)</p>
                <p>💾 Save when you're done!</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/20 rounded-2xl px-6 py-4">
            <p className="text-xl text-amber-300 font-bold">Students are working on their Chromebooks!</p>
          </div>
        </div>
      );

      return <FormListeningMapDirectionsSlide />;
    }

    // Ternary Showcase (Listening Lab Lesson 3) - Interactive ABA form visualization
    if (type === 'ternary-showcase') {
      const TernaryShowcaseSlide = () => {
        const sections = currentStageData?.presentationView?.sections || [
          { label: 'A', color: '#3B82F6', name: 'Statement', desc: 'Main theme' },
          { label: 'B', color: '#EF4444', name: 'Contrast', desc: 'Something different' },
          { label: 'A\'', color: '#3B82F6', name: 'Return', desc: 'Theme comes back' },
        ];
        const pieceTitle = currentStageData?.presentationView?.pieceTitle;

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <h2 className="text-5xl font-black text-white mb-2">Meet Ternary Form</h2>
            <p className="text-2xl text-gray-400 mb-2">Statement — Contrast — Return</p>
            {pieceTitle && <p className="text-xl text-amber-400 mb-6">{pieceTitle}</p>}
            {!pieceTitle && <div className="mb-6" />}

            <div className="flex gap-6 mb-8">
              {sections.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-28 h-28 rounded-2xl flex items-center justify-center font-black text-white mb-2 shadow-lg text-5xl"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.label}
                  </div>
                  <div className="text-white font-bold text-lg">{s.name}</div>
                  <div className="text-gray-400 text-sm max-w-28 text-center">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 rounded-2xl p-6 max-w-2xl">
              <p className="text-xl text-white mb-2"><span className="font-bold">Ternary</span> = Three parts: A (statement), B (contrast), A (return)</p>
              <p className="text-lg text-gray-300">The <span className="font-bold text-blue-400">A section</span> comes back after the contrasting B section.</p>
              <p className="text-lg text-gray-300 mt-2">In Mountain King, A starts <span className="font-bold text-blue-400">sneaky and quiet</span>, but when it returns as A', it's <span className="font-bold text-red-400">explosive and loud!</span></p>
            </div>
          </div>
        );
      };

      return <TernaryShowcaseSlide />;
    }

    // Rondo Showcase (Listening Lab Lesson 4 - for Fur Elise) - kept for capstone use
    if (type === 'rondo-showcase') {
      const RondoShowcaseSlide = () => {
        const sections = currentStageData?.presentationView?.sections || [
          { label: 'A', color: '#3B82F6', name: 'Main Theme', desc: 'Gentle, famous melody' },
          { label: 'B', color: '#EF4444', name: 'Contrast', desc: 'Bright, hopeful' },
          { label: 'A', color: '#3B82F6', name: 'Return', desc: 'Melody comes back' },
          { label: 'C', color: '#10B981', name: 'New Material', desc: 'Dramatic, stormy' },
          { label: 'A', color: '#3B82F6', name: 'Final Return', desc: 'Home again' },
        ];
        const rondoPieceTitle = currentStageData?.presentationView?.pieceTitle;
        const hasMany = sections.length > 5;
        const blockSize = hasMany ? 'w-20 h-20 text-4xl' : 'w-24 h-24 text-5xl';

        const episodes = [...new Set(sections.filter(s => s.label !== 'A').map(s => s.label))];

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <h2 className="text-5xl font-black text-white mb-2">Meet the Rondo</h2>
            <p className="text-2xl text-gray-400 mb-2">A keeps coming back!</p>
            {rondoPieceTitle && <p className="text-xl text-amber-400 mb-6">{rondoPieceTitle}</p>}
            {!rondoPieceTitle && <div className="mb-6" />}

            <div className="flex gap-3 mb-8">
              {sections.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`${blockSize} rounded-2xl flex items-center justify-center font-black text-white mb-2 shadow-lg`}
                    style={{ backgroundColor: s.color }}
                  >
                    {s.label}
                  </div>
                  <div className="text-white font-bold text-sm">{s.name}</div>
                  <div className="text-gray-400 text-xs max-w-20 text-center">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/10 rounded-2xl p-6 max-w-2xl">
              <p className="text-xl text-white mb-2"><span className="font-bold">Rondo</span> = A section keeps RETURNING between contrasting sections</p>
              <p className="text-lg text-gray-300">Think of A as the <span className="font-bold text-blue-400">chorus</span> of a song — it comes back again and again!</p>
              <p className="text-lg text-gray-300 mt-2">{episodes.join(', ')} {episodes.length === 1 ? 'is' : 'are'} like <span className="font-bold text-red-400">{episodes.length === 1 ? 'a verse' : 'verses'}</span> — different each time.</p>
            </div>
          </div>
        );
      };

      return <RondoShowcaseSlide />;
    }

    // Name That Element Teacher Game (Listening Lab Lesson 4 - Review)
    if (type === 'name-that-element-teacher-game') {
      if (!NameThatElementTeacherGame) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
            <div className="text-white text-2xl">Loading Name That Element...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <NameThatElementTeacherGame sessionData={sessionData} onComplete={goToNextStage} />
        </div>
      );
    }

    // Four Corners Game (Listening Lab Lesson 3 - Bonus)
    if (type === 'four-corners-game') {
      if (!FourCornersGame) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
            <div className="text-white text-2xl">Loading Four Corners...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <FourCornersGame sessionData={sessionData} onComplete={goToNextStage} />
        </div>
      );
    }

    // Journey Demo (Listening Lab Lesson 4 - Capstone Introduction)
    if (type === 'journey-demo') {
      const JourneyDemoSlide = () => (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
          <div className="text-8xl mb-6">🎬</div>
          <h1 className="text-6xl font-black text-white mb-4">Listening Journey Demo</h1>
          <p className="text-2xl text-white/70 mb-8">Watch what the finished project looks like!</p>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-3xl text-center">
            <p className="text-xl text-white/90 mb-4">
              A character walks through different worlds that change with the music:
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <div className="px-6 py-3 bg-red-500/30 rounded-xl text-white font-bold">
                <span className="text-2xl block">📢</span>
                Dynamics = Brightness
              </div>
              <div className="px-6 py-3 bg-purple-500/30 rounded-xl text-white font-bold">
                <span className="text-2xl block">⏱️</span>
                Tempo = Speed
              </div>
              <div className="px-6 py-3 bg-blue-500/30 rounded-xl text-white font-bold">
                <span className="text-2xl block">🔤</span>
                Form = Scenes
              </div>
            </div>
            <p className="text-lg text-white/60">
              Teacher: Show your pre-made example now, or describe the tool
            </p>
          </div>
        </div>
      );
      return <JourneyDemoSlide />;
    }

    // Piece Selection Teacher View (Listening Lab Lesson 4)
    if (type === 'piece-selection-teacher') {
      if (!CapstonePieceSelectionTeacher) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-red-900">
            <div className="text-white text-2xl">Loading Piece Selection...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <CapstonePieceSelectionTeacher sessionData={sessionData} />
        </div>
      );
    }

    // Gallery Circle Teacher View (Listening Lab Lesson 5)
    if (type === 'gallery-circle-teacher') {
      const GalleryCircleTeacherSlide = () => (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
          <div className="text-8xl mb-6">🎪</div>
          <h1 className="text-7xl font-black text-white mb-4">Gallery Circle</h1>
          <p className="text-3xl text-white/70 mb-8">Time to share your Listening Journeys!</p>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-3xl">
            <div className="space-y-4 text-xl text-white/90">
              <p className="flex items-center gap-3">
                <span className="text-3xl">🎬</span>
                Project student journeys on the big screen
              </p>
              <p className="flex items-center gap-3">
                <span className="text-3xl">🎵</span>
                Listen to the music while watching the visuals
              </p>
              <p className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                After each: "What musical element did you notice?"
              </p>
              <p className="flex items-center gap-3">
                <span className="text-3xl">👏</span>
                Celebrate creative choices!
              </p>
            </div>
          </div>
        </div>
      );
      return <GalleryCircleTeacherSlide />;
    }

    // Active Listening Audio Player (Listening Lab Lesson 2) - Hungarian Dance No. 5
    if (type === 'active-listening-play') {
      const ActiveListeningSlide = () => {
        const [isPlaying, setIsPlaying] = React.useState(false);
        const audioRef = React.useRef(null);

        const { audioPath, title: pieceTitle, composer } = currentStageData.presentationView;

        React.useEffect(() => {
          return () => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = '';
            }
          };
        }, []);

        const togglePlay = () => {
          if (isPlaying) {
            if (audioRef.current) audioRef.current.pause();
            setIsPlaying(false);
          } else {
            if (!audioRef.current) {
              audioRef.current = new Audio(audioPath);
              audioRef.current.onended = () => setIsPlaying(false);
              audioRef.current.onerror = () => setIsPlaying(false);
            }
            audioRef.current.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
          }
        };

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-900 via-orange-900 to-slate-900 p-8">
            <div className="text-8xl mb-6">🎵</div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-4">{pieceTitle}</h1>
            <p className="text-3xl text-amber-200 mb-2">{composer}</p>
            <p className="text-xl text-white/60 mb-10">Show the tempo with your hands: fast = fast tempo, slow = slow tempo</p>
            <button
              onClick={togglePlay}
              className={`px-12 py-6 rounded-2xl text-3xl font-bold text-white flex items-center gap-4 transition-all hover:scale-105 ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
            >
              {isPlaying ? (
                <><Pause size={36} /> Pause</>
              ) : (
                <><Play size={36} /> Play</>
              )}
            </button>
            {isPlaying && (
              <div className="mt-8 flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 bg-amber-400 rounded-full animate-bounce"
                    style={{
                      height: `${20 + Math.random() * 30}px`,
                      animationDelay: `${i * 150}ms`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      };

      return <ActiveListeningSlide />;
    }

    // Tempo Listening Map Directions (Listening Lab Lesson 2) - directions on main board
    if (type === 'tempo-listening-map-directions') {
      return (
        <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
          {/* Student Activity Banner */}
          <div className="w-full flex items-center justify-center py-3 bg-teal-600 flex-shrink-0">
            <span className="text-white font-bold text-2xl lg:text-3xl tracking-wide">
              STUDENT ACTIVITY TIME
            </span>
          </div>

          {/* Title Section */}
          <div className="text-center pt-4 lg:pt-6 flex-shrink-0">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-2">
              Tempo Listening Map
            </h1>
            <div className="text-2xl lg:text-3xl text-teal-200">
              Hungarian Dance No. 5 by Johannes Brahms
            </div>
          </div>

          {/* Directions Below */}
          <div className="flex-1 flex items-start justify-center p-4 lg:p-6 pt-6 lg:pt-8">
            <div className="flex gap-6 lg:gap-10 max-w-6xl w-full">
              {/* Your Task */}
              <div className="flex-1 bg-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                <h2 className="text-3xl lg:text-4xl font-bold text-teal-300 mb-5">Your Task</h2>
                <ol className="space-y-4 text-2xl lg:text-3xl text-white">
                  <li className="flex gap-4">
                    <span className="text-teal-400 font-bold">1.</span>
                    <span>Press <strong className="text-teal-300">PLAY</strong> and listen</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-teal-400 font-bold">2.</span>
                    <span>Mark <strong className="text-teal-300">tempo changes</strong> with colors</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-teal-400 font-bold">3.</span>
                    <span>Draw <strong className="text-teal-300">accel./rit.</strong> arrows</span>
                  </li>
                </ol>
              </div>

              {/* Color Guide */}
              <div className="flex-1 bg-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                <h2 className="text-3xl lg:text-4xl font-bold text-amber-300 mb-5">Color Guide</h2>
                <ul className="space-y-4 text-2xl lg:text-3xl text-white/90">
                  <li className="flex gap-4 items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0"></span>
                    <span><strong>Blue</strong> = Slow (Largo, Adagio)</span>
                  </li>
                  <li className="flex gap-4 items-center">
                    <span className="w-8 h-8 rounded-full bg-yellow-400 flex-shrink-0"></span>
                    <span><strong>Yellow</strong> = Medium (Andante)</span>
                  </li>
                  <li className="flex gap-4 items-center">
                    <span className="w-8 h-8 rounded-full bg-red-500 flex-shrink-0"></span>
                    <span><strong>Red</strong> = Fast (Allegro, Presto)</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-green-500/20 border border-green-400/40 rounded-xl">
                  <p className="text-xl text-green-300 font-bold">Bonus: Circle moments where you hear the clarinet!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Video Hook Comparison (Lesson 4) - No Music vs With Music
    if (type === 'video-comparison') {
      if (!VideoHookComparison) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-white text-2xl">Loading Video Comparison...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <VideoHookComparison onAdvance={goToNextStage} />
        </div>
      );
    }

    // Beat Builder Demo (Lesson 4) - Teacher demonstrates building a beat
    if (type === 'beat-maker-demo') {
      if (!BeatBuilderDemo) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="text-white text-2xl">Loading Beat Builder Demo...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <BeatBuilderDemo onAdvance={goToNextStage} />
        </div>
      );
    }

    // Name That Game (Lesson 5) - Teacher plays game theme songs for class to guess
    if (type === 'name-that-game') {
      if (!NameThatGameActivity) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900">
            <div className="text-white text-2xl">Loading Name That Game...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <NameThatGameActivity onComplete={goToNextStage} />
        </div>
      );
    }

    // Melody Builder Demo (Lesson 5) - Teacher demonstrates building a melody
    if (type === 'melody-builder-demo') {
      if (!MelodyBuilderTeacherDemo) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="text-white text-2xl">Loading Melody Builder Demo...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <MelodyBuilderTeacherDemo onComplete={goToNextStage} />
        </div>
      );
    }

    // Activity type - renders the actual activity in teacher view
    if (type === 'activity') {
      const { activityType } = currentStageData.presentationView;

      // Melody Mystery Activity
      if (activityType === 'melody-mystery') {
        if (!MelodyMysteryActivity) {
          return (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
              <div className="text-white text-2xl">Loading Melody Mystery...</div>
            </div>
          );
        }

        return (
          <div className="absolute inset-0">
            <MelodyMysteryActivity onComplete={goToNextStage} />
          </div>
        );
      }
    }

    // Summary Slide - shows title with bullet points or sections
    // Responsive: works on 1366x768 (Chromebook) and 1920x1080 (projector)
    if (type === 'summary') {
      const { title, subtitle, bullets, sections } = currentStageData.presentationView;

      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-6 lg:p-10">
          {/* Title */}
          <h1 className="text-6xl lg:text-8xl font-bold text-white mb-3 lg:mb-5 text-center">
            {title}
          </h1>

          {/* Subtitle (if provided) */}
          {subtitle && (
            <p className="text-3xl lg:text-5xl text-purple-300 mb-6 lg:mb-10 text-center">
              {subtitle}
            </p>
          )}

          {/* Spacer if no subtitle */}
          {!subtitle && <div className="mb-4 lg:mb-8" />}

          {/* Simple bullets (if provided) */}
          {bullets && bullets.length > 0 && (
            <div className="max-w-6xl w-full px-4">
              <ul className="space-y-4 lg:space-y-6">
                {bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3 lg:gap-4">
                    <span className="text-purple-400 text-4xl lg:text-5xl mt-0.5">•</span>
                    <span className="text-3xl lg:text-4xl text-slate-200 leading-snug lg:leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections with headings (if provided) */}
          {sections && sections.length > 0 && (
            <div className="max-w-6xl w-full px-4">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-5 lg:mb-8">
                  {section.heading && (
                    <h2 className="text-4xl lg:text-6xl font-bold text-purple-400 mb-3 lg:mb-6">
                      {section.heading}
                    </h2>
                  )}
                  <ul className="space-y-3 lg:space-y-5 pl-2 lg:pl-4">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-2 lg:gap-4">
                        <span className="text-purple-400 text-3xl lg:text-4xl mt-0.5">•</span>
                        <span className="text-2xl lg:text-4xl text-slate-200 leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Instrument Family Slide - shows instrument family info with audio player
    if (type === 'instrument-family') {
      const { title, familyColor, instruments, sound, facts, audioPath } = currentStageData.presentationView;

      return (
        <InstrumentFamilySlide
          title={title}
          familyColor={familyColor}
          instruments={instruments}
          sound={sound}
          facts={facts}
          audioPath={audioPath}
          currentStage={currentStage}
        />
      );
    }

    // YouTube Clip - embeds a YouTube video with start/end times
    if (type === 'youtube-clip') {
      const { videoId, startTime, endTime, title, subtitle } = currentStageData.presentationView;

      return (
        <YouTubeClip
          videoId={videoId}
          startTime={startTime}
          endTime={endTime}
          title={title}
          subtitle={subtitle}
          currentStage={currentStage}
        />
      );
    }

    // Activity Banner - shows a banner during student activities
    if (type === 'activity-banner') {
      const { title, subtitle } = currentStageData.presentationView;

      return (
        <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
          {/* Student Activity Banner */}
          <div className="w-full flex items-center justify-center py-6 bg-teal-600">
            <span className="text-white font-bold text-4xl lg:text-5xl tracking-wide">
              STUDENT ACTIVITY TIME
            </span>
          </div>
          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <h1 className="text-7xl lg:text-8xl font-bold text-white mb-6 text-center">
              {title}
            </h1>
            {subtitle && (
              <p className="text-3xl lg:text-4xl text-teal-200 text-center">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Dynamics Listening Map Directions - shows directions on the main board
    if (type === 'dynamics-listening-map-directions') {
      return (
        <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
          {/* Student Activity Banner */}
          <div className="w-full flex items-center justify-center py-4 bg-teal-600 flex-shrink-0">
            <span className="text-white font-bold text-3xl lg:text-4xl tracking-wide">
              STUDENT ACTIVITY TIME
            </span>
          </div>

          {/* Title Section */}
          <div className="text-center pt-5 lg:pt-8 flex-shrink-0">
            <h1 className="text-6xl lg:text-8xl font-bold text-white mb-2">
              Dynamics Listening Map
            </h1>
            <div className="text-3xl lg:text-4xl text-teal-200">
              Spring by Antonio Vivaldi • 12 minutes
            </div>
          </div>

          {/* Directions Below */}
          <div className="flex-1 flex items-start justify-center p-4 lg:p-6 pt-6 lg:pt-8">
            <div className="flex gap-6 lg:gap-10 max-w-7xl w-full">
              {/* Your Task */}
              <div className="flex-1 bg-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                <h2 className="text-4xl lg:text-5xl font-bold text-teal-300 mb-5">Your Task</h2>
                <ol className="space-y-5 text-3xl lg:text-4xl text-white">
                  <li className="flex gap-4">
                    <span className="text-teal-400 font-bold">1.</span>
                    <span>Press <strong className="text-teal-300">PLAY</strong> and listen</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-teal-400 font-bold">2.</span>
                    <span>Mark at least <strong className="text-teal-300">5 dynamics</strong></span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-teal-400 font-bold">3.</span>
                    <span>Draw <strong className="text-teal-300">crescendo/decrescendo</strong> arrows</span>
                  </li>
                </ol>
              </div>

              {/* Finished Early */}
              <div className="flex-1 bg-white/10 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
                <h2 className="text-4xl lg:text-5xl font-bold text-green-400 mb-5">Finished Early?</h2>
                <ul className="space-y-5 text-3xl lg:text-4xl text-white/90">
                  <li className="flex gap-4">
                    <span className="text-green-400">•</span>
                    <span>Circle string instruments</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-green-400">•</span>
                    <span>Add tempo (fast/slow)</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-green-400">•</span>
                    <span>Draw melody direction</span>
                  </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-2xl lg:text-3xl text-teal-300">
                    📺 Click <strong>Present</strong> in the top bar to show your map full screen!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Image Slide - shows image with text overlay for DAW intro slides
    if (type === 'image-slide') {
      const { imagePath } = currentStageData.presentationView;

      // Get content based on stage ID
      const slideContent = {
        'what-is-daw': {
          title: 'What is a DAW?',
          subtitle: 'Digital Audio Workstation',
          points: [
            'DAW = Digital Audio Workstation — software that lets you record, edit, and create music on a computer.',
            'Before DAWs, musicians needed million-dollar recording studios with giant mixing boards, tape machines, and rooms full of equipment.',
            'In the 1990s, software like Pro Tools made it possible to do all of that on a regular computer.'
          ]
        },
        'daws-today': {
          title: 'DAWs Today',
          points: [
            'Apps like GarageBand, FL Studio, Ableton, and Logic Pro are used by professional artists to make hit songs.',
            "Billie Eilish's brother Finneas produced her Grammy-winning album in his bedroom using Logic Pro.",
            'Next we will watch a 2 minute video that introduces the DAW we will use today.'
          ]
        }
      };

      const content = slideContent[currentStage] || { title: currentStage, points: [] };

      // Apply zoom to scale 1920x1080 design to fit container
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div
            style={{
              width: 1920,
              height: 1080,
              zoom: presentationZoom,
            }}
            className="flex flex-col"
          >
            {/* Title - spans full width at top */}
            <div className="text-center pt-8 pb-4">
              <h1 className="text-6xl font-bold text-white mb-2">{content.title}</h1>
              {content.subtitle && (
                <h2 className="text-3xl text-purple-400">{content.subtitle}</h2>
              )}
            </div>

            {/* Content area - image and bullets side by side */}
            <div className="flex-1 flex">
              {/* Left side - Image */}
              <div className="w-1/2 flex items-center justify-center p-6">
                <img
                  src={imagePath}
                  alt={content.title}
                  className="object-contain rounded-lg shadow-2xl"
                  style={{ maxWidth: '85%', maxHeight: '85%' }}
                  onError={(e) => {
                    console.error('Failed to load image:', imagePath);
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Right side - Bullet points */}
              <div className="w-1/2 flex flex-col justify-center p-6 pr-12">
                <ul className="space-y-8">
                  {content.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="text-purple-500 text-5xl mt-1">•</span>
                      <span className="text-4xl text-slate-200 leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Tempo Answer Key - shows answer key image with explanatory text
    if (type === 'tempo-answer-key') {
      return (
        <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
          {/* Header text */}
          <div className="flex-shrink-0 text-center pt-6 pb-3 px-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">Answer Key</h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              This piece is mostly <span className="text-red-400 font-semibold">Allegro</span> and <span className="text-blue-400 font-semibold">Adagio</span> with
              some <span className="text-green-400 font-semibold">Andante</span>, <span className="text-gray-200 font-semibold">accel.</span>,
              and <span className="text-orange-400 font-semibold">Presto</span> at the end.
              Tempo is subjective — there are many correct ways to label this piece!
            </p>
          </div>
          {/* Answer key image */}
          <div className="flex-1 flex items-center justify-center px-8 pb-6">
            <img
              src="/lessons/listening-lab/lesson2/slides/tempo-answer-key.png"
              alt="Tempo Listening Map Answer Key"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-gray-700"
            />
          </div>
        </div>
      );
    }

    // Slide (with optional audio)
    if (type === 'slide' && slidePath) {
      return (
        <SlideWithAudio
          slidePath={slidePath}
          audioPath={audioPath}
          currentStage={currentStage}
        />
      );
    }

    // Activity Slide - shows slide WITH "Student Activity Time" banner on top
    if (type === 'activity-slide' && slidePath) {
      return (
        <div className="absolute inset-0 flex flex-col bg-black">
          {/* Student Activity Time Banner */}
          <div
            className="w-full flex items-center justify-center flex-shrink-0"
            style={{
              height: '64px',
              backgroundColor: '#0d9488'
            }}
          >
            <span className="text-white font-bold" style={{ fontSize: '28px' }}>
              STUDENT ACTIVITY TIME
            </span>
          </div>
          {/* Slide content */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={slidePath}
              alt={currentStage}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onError={(e) => {
                console.error('Failed to load slide:', slidePath);
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      );
    }

    // Video
    if (type === 'video' && videoPath) {
      return (
        <div className="absolute inset-0 bg-black">
          <video
            key={currentStage}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-contain"
            onEnded={onVideoEnded}
          >
            <source src={videoPath} type="video/mp4" />
          </video>
        </div>
      );
    }
  }

  // Fallback for unknown stages
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-600">
      <Monitor size={64} className="mb-4 text-slate-400" />
      <div className="text-xl font-medium">Stage: {currentStage}</div>
      <div className="text-sm text-slate-400 mt-2">
        {currentStageData?.label || 'Loading...'}
      </div>
    </div>
  );
};

// ============================================
// MINI PREVIEW COMPONENT
// Shows scaled-down live preview of opposite view
// ============================================
const MiniPreview = ({ viewMode, sessionCode, classCode, currentStage, currentStageData, sessionData, config, onSwitch }) => {
  const getStudentUrl = () => {
    // Use current origin to handle any port in dev
    // passive=true disables navigation prevention hooks to avoid IPC flooding
    return `${window.location.origin}/join?code=${classCode || sessionCode}&preview=true&passive=true`;
  };

  return (
    <div>
      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
        {viewMode === 'teacher' ? (
          <>
            <Smartphone size={12} />
            <span>Student screen:</span>
          </>
        ) : (
          <>
            <Monitor size={12} />
            <span>Teacher screen:</span>
          </>
        )}
      </div>
      <div
        className="relative rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900 cursor-pointer hover:border-blue-400 transition-colors"
        style={{ height: '80px' }}
        onClick={onSwitch}
        title={`Click to switch to ${viewMode === 'teacher' ? 'Student' : 'Teacher'} View`}
      >
        {viewMode === 'teacher' ? (
          // Show mini student view via iframe
          <iframe
            src={getStudentUrl()}
            className="w-full h-full border-none pointer-events-none"
            style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: '666%', height: '666%' }}
            title="Student View Preview"
            allow="autoplay"
          />
        ) : (
          // Show mini teacher view (presentation content)
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div style={{ transform: 'scale(0.1)', transformOrigin: 'top left', width: '1000%', height: '1000%' }}>
              <PresentationContent
                currentStage={currentStage}
                currentStageData={currentStageData}
                sessionCode={sessionCode}
                classCode={classCode}
                sessionData={sessionData}
                lessonConfig={config}
                lessonBasePath={config?.lessonPath}
                viewMode="teacher"
                goToNextStage={() => {}}
              />
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
          <span className="text-white text-xs font-medium">Click to switch</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// POST-SESSION SURVEY MODAL
// Only shown when 5+ students joined (real classroom use)
// Quick rating + any issues - takes 10 seconds
// ============================================
const PostSessionSurvey = ({
  onSubmit,
  onSkip,
  studentCount,
  lessonId,
  sessionCode
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveSurveyResponse({
        sessionCode,
        lessonId,
        studentCount,
        usedWithStudents: true, // We know it's classroom use (5+ students)
        rating,
        feedback: feedback.trim(),
        submittedAt: Date.now()
      });
    } catch (err) {
      console.error('Failed to save survey:', err);
    }
    setSubmitting(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} />
            How did it go?
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Quick feedback (10 seconds)
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <p className="font-medium text-gray-800 mb-3 text-center">
              Rate this lesson
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-500 mt-2 h-5">
              {rating === 1 && 'Needs work'}
              {rating === 2 && 'It was okay'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Great!'}
              {rating === 5 && 'Amazing!'}
            </div>
          </div>

          {/* Quick Feedback */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Any issues or suggestions? <span className="text-gray-400 font-normal">(optional)</span>
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What worked? What didn't? Any bugs?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              rating === 0 || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {submitting ? 'Saving...' : 'Submit & End'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MID-PILOT SURVEY (After Lesson 3)
// ============================================
const MidPilotSurvey = ({
  onSubmit,
  onSkip,
  studentCount,
  sessionCode
}) => {
  const [favoriteFeature, setFavoriteFeature] = useState('');
  const [favoriteOther, setFavoriteOther] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [skippedParts, setSkippedParts] = useState('');
  const [studentQuotes, setStudentQuotes] = useState('');
  const [onTrack, setOnTrack] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const featureOptions = [
    { id: 'daw', label: 'The DAW (composition tool)' },
    { id: 'layer-detective', label: 'Layer Detective game' },
    { id: 'video-scoring', label: 'Video scoring activities' },
    { id: 'loop-library', label: 'Loop library' },
    { id: 'other', label: 'Other' }
  ];

  const trackOptions = [
    { id: 'yes', label: 'Yes' },
    { id: 'probably', label: 'Probably' },
    { id: 'not-sure', label: 'Not sure' },
    { id: 'no', label: 'No' }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveMidPilotSurvey({
        sessionCode,
        studentCount,
        favoriteFeature: favoriteFeature === 'other' ? `Other: ${favoriteOther}` : favoriteFeature,
        improvementSuggestion: improvementSuggestion.trim(),
        skippedParts: skippedParts.trim(),
        studentQuotes: studentQuotes.trim(),
        onTrack,
        submittedAt: Date.now()
      });
    } catch (err) {
      console.error('Failed to save mid-pilot survey:', err);
    }
    setSubmitting(false);
    onSubmit();
  };

  const canSubmit = favoriteFeature && improvementSuggestion.trim() && onTrack;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} />
            Mid-Pilot Check-In
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            You're halfway through! Help us make this better.
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Q1: Favorite Feature */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Which feature do students enjoy most? <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {featureOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFavoriteFeature(option.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                    favoriteFeature === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              {favoriteFeature === 'other' && (
                <input
                  type="text"
                  value={favoriteOther}
                  onChange={(e) => setFavoriteOther(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mt-2"
                />
              )}
            </div>
          </div>

          {/* Q2: Improvement (required) */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              What's ONE thing that would make this significantly better? <span className="text-red-500">*</span>
            </p>
            <textarea
              value={improvementSuggestion}
              onChange={(e) => setImprovementSuggestion(e.target.value)}
              placeholder="Your most important suggestion..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-20"
            />
          </div>

          {/* Q3: Skipped Parts (optional) */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Have you had to skip or modify any parts? If so, why?
            </p>
            <textarea
              value={skippedParts}
              onChange={(e) => setSkippedParts(e.target.value)}
              placeholder="Optional - helps us understand pacing issues"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
          </div>

          {/* Q4: Student Quotes (optional) */}
          <div>
            <p className="font-medium text-gray-800 mb-1">
              Any student quotes or reactions worth sharing?
            </p>
            <p className="text-sm text-gray-500 mb-2">These help us understand what's working!</p>
            <textarea
              value={studentQuotes}
              onChange={(e) => setStudentQuotes(e.target.value)}
              placeholder="e.g., 'This is actually fun!' or 'Can we do this again?'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
          </div>

          {/* Q5: On Track */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Are you on track to finish all 5 lessons by end of January? <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {trackOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setOnTrack(option.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    onTrack === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              !canSubmit || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {submitting ? 'Saving...' : 'Submit & End'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FINAL PMF SURVEY (After Lesson 5)
// ============================================
const FinalPilotSurvey = ({
  onSubmit,
  onSkip,
  studentCount,
  sessionCode
}) => {
  const [disappointment, setDisappointment] = useState('');
  const [targetTeacher, setTargetTeacher] = useState('');
  const [primaryBenefit, setPrimaryBenefit] = useState('');
  const [previousTool, setPreviousTool] = useState('');
  const [previousOther, setPreviousOther] = useState('');
  const [comparison, setComparison] = useState('');
  const [wouldBuy, setWouldBuy] = useState('');
  const [npsScore, setNpsScore] = useState(0);
  const [testimonialConsent, setTestimonialConsent] = useState('');
  const [finalFeedback, setFinalFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const disappointmentOptions = [
    { id: 'very', label: 'Very disappointed', color: 'green' },
    { id: 'somewhat', label: 'Somewhat disappointed', color: 'yellow' },
    { id: 'not', label: 'Not disappointed', color: 'red' }
  ];

  const previousToolOptions = [
    { id: 'nothing', label: 'Nothing' },
    { id: 'chrome-music-lab', label: 'Chrome Music Lab' },
    { id: 'bandlab', label: 'BandLab' },
    { id: 'soundtrap', label: 'Soundtrap' },
    { id: 'garageband', label: 'GarageBand' },
    { id: 'noteflight', label: 'Noteflight' },
    { id: 'other', label: 'Other' }
  ];

  const comparisonOptions = [
    { id: 'much-worse', label: 'Much worse' },
    { id: 'somewhat-worse', label: 'Somewhat worse' },
    { id: 'same', label: 'About the same' },
    { id: 'somewhat-better', label: 'Somewhat better' },
    { id: 'much-better', label: 'Much better' }
  ];

  const buyOptions = [
    { id: 'definitely-yes', label: 'Definitely yes' },
    { id: 'probably-yes', label: 'Probably yes' },
    { id: 'not-sure', label: 'Not sure' },
    { id: 'probably-not', label: 'Probably not' },
    { id: 'definitely-not', label: 'Definitely not' }
  ];

  const testimonialOptions = [
    { id: 'yes-named', label: 'Yes, with my name and school' },
    { id: 'yes-anonymous', label: 'Yes, but keep it anonymous' },
    { id: 'no', label: 'No' }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveFinalPilotSurvey({
        sessionCode,
        studentCount,
        disappointment,
        targetTeacher: targetTeacher.trim(),
        primaryBenefit: primaryBenefit.trim(),
        previousTool: previousTool === 'other' ? `Other: ${previousOther}` : previousTool,
        comparison,
        wouldBuy,
        npsScore,
        testimonialConsent,
        finalFeedback: finalFeedback.trim(),
        submittedAt: Date.now()
      });
    } catch (err) {
      console.error('Failed to save final pilot survey:', err);
    }
    setSubmitting(false);
    onSubmit();
  };

  const canSubmitPage1 = disappointment && targetTeacher.trim() && primaryBenefit.trim();
  const canSubmitPage2 = previousTool && comparison && wouldBuy && npsScore > 0 && testimonialConsent;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star size={24} />
            Final Feedback Survey
          </h2>
          <p className="text-amber-100 text-sm mt-1">
            You completed the pilot! Your feedback shapes our future.
          </p>
          <div className="flex gap-1 mt-2">
            <div className={`h-1 flex-1 rounded ${page >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1 flex-1 rounded ${page >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {page === 1 && (
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Q1: PMF Question (Most Important!) */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-3">
                How would you feel if you could no longer use Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {disappointmentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setDisappointment(option.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      disappointment === option.id
                        ? option.id === 'very'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : option.id === 'somewhat'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Target Teacher */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                What type of teacher would benefit MOST from Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <textarea
                value={targetTeacher}
                onChange={(e) => setTargetTeacher(e.target.value)}
                placeholder="e.g., Middle school general music teachers with limited tech experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
              />
            </div>

            {/* Q3: Primary Benefit */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                What is the PRIMARY benefit you got from Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <textarea
                value={primaryBenefit}
                onChange={(e) => setPrimaryBenefit(e.target.value)}
                placeholder="e.g., Students can create music without instrument skills..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
              />
            </div>
          </div>
        )}

        {page === 2 && (
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Q4: Previous Tool */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Before this pilot, what were you using for digital composition? <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {previousToolOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPreviousTool(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      previousTool === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {previousTool === 'other' && (
                <input
                  type="text"
                  value={previousOther}
                  onChange={(e) => setPreviousOther(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 mt-2"
                />
              )}
            </div>

            {/* Q5: Comparison */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Compared to what you used before, Music Mind Academy is: <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {comparisonOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setComparison(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      comparison === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q6: Would Buy */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                If Music Mind Academy cost $49/year, would you buy it? <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {buyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setWouldBuy(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      wouldBuy === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q7: NPS */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Would you recommend Music Mind Academy to a colleague? <span className="text-red-500">*</span>
              </p>
              <div className="flex justify-between gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNpsScore(num)}
                    className={`w-9 h-9 rounded-lg border-2 text-sm font-medium transition-all ${
                      npsScore === num
                        ? num <= 6
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : num <= 8
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            {/* Q8: Testimonial */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Can we use your feedback as a testimonial? <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {testimonialOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTestimonialConsent(option.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm transition-all ${
                      testimonialConsent === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q9: Final Feedback */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                Any final feedback or suggestions?
              </p>
              <textarea
                value={finalFeedback}
                onChange={(e) => setFinalFeedback(e.target.value)}
                placeholder="Optional - anything else you'd like to share"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-16"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {page === 1 ? (
            <>
              <button
                onClick={onSkip}
                className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setPage(2)}
                disabled={!canSubmitPage1}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                  !canSubmitPage1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPage(1)}
                className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmitPage2 || submitting}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                  !canSubmitPage2 || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {submitting ? 'Saving...' : 'Submit & End'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ANIMATOR DIRECTIONS OVERLAY (stable component to prevent remounting)
// ============================================
const AnimatorDirectionsOverlay = React.memo(({ ListeningJourneyComponent, pieceConfig, dismissedRef }) => {
  const [showOverlay, setShowOverlay] = useState(!dismissedRef.current);
  const [dirStep, setDirStep] = useState(0);

  // Dragging state - null means centered (not yet dragged)
  const [pos, setPos] = useState(null);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    isDragging.current = true;
    const rect = dragRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (pos === null) {
      setPos({ x: rect.left, y: rect.top });
    }
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      setPos({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const directions = [
    {
      title: 'Your Job',
      icon: '\uD83D\uDDFA\uFE0F',
      items: [
        <>Focus on placing as many <span className="font-bold text-amber-600">dynamic markings</span> on the screen as you can</>,
        <>Click on each <span className="font-bold text-gray-900">section (A, B, A&apos;)</span> and drag dynamics stickers to show how loud or soft the music is</>,
        <>If you have time, add <span className="font-bold text-emerald-700">tempos</span>, <span className="font-bold text-pink-600">emojis</span>, or <span className="font-bold text-purple-700">instruments</span> too!</>,
      ],
    },
    {
      title: 'How to Use the Listening Journey',
      icon: '\uD83C\uDFA8',
      items: [
        <>Click on a <span className="font-bold text-gray-900">section (A, B, A&apos;)</span> in the timeline to edit it</>,
        <>Drag <span className="font-bold text-amber-600">dynamic markings</span> from the sticker panel onto the scene</>,
        <>Press <span className="font-bold text-gray-900">Play</span> to hear the music and see your stickers appear</>,
      ],
    },
    {
      title: 'Tips',
      icon: '\uD83D\uDCA1',
      items: [
        <>Think about how the dynamics <span className="font-bold text-gray-900">change between sections</span> — A is quiet, B gets louder, A&apos; is very loud!</>,
        <>You can go back and change things any time</>,
        <>Make each section look different — show how the music changes!</>,
      ],
    },
  ];

  const dir = directions[dirStep];
  const c = { outer: 'bg-white border-gray-200', header: 'border-gray-200', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-800', itemText: 'text-gray-900', nav: 'border-gray-200', navBack: 'text-gray-600 hover:bg-gray-100', navNext: 'bg-gray-800 hover:bg-gray-900 text-white' };

  return (
    <div className="absolute inset-0">
      {/* Live ListeningJourney behind everything */}
      <div className="absolute inset-0">
        {ListeningJourneyComponent ? (
          <ListeningJourneyComponent
            onComplete={() => {}}
            viewMode={false}
            isSessionMode={false}
            pieceConfig={pieceConfig || null}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <p className="text-gray-400 text-xl">Loading Listening Journey...</p>
          </div>
        )}
      </div>

      {/* Floating draggable overlay - centered in presentation area until dragged */}
      {showOverlay && (
        <div
          ref={dragRef}
          onMouseDown={handleMouseDown}
          className={`z-50 w-[420px] ${c.outer} backdrop-blur-md rounded-2xl border shadow-2xl cursor-move select-none ${pos === null ? 'absolute top-4 left-4' : 'fixed'}`}
          style={pos !== null ? { left: pos.x, top: pos.y } : undefined}
        >
          {/* Drag handle / header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${c.header}`}>
            <div className="flex items-center gap-2">
              <div className="text-2xl">{dir.icon}</div>
              <h3 className="text-lg font-bold text-gray-900">{dir.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Step dots */}
              <div className="flex gap-1.5 mr-2">
                {directions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === dirStep ? 'bg-gray-800 scale-125' : i < dirStep ? 'bg-gray-400' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => { dismissedRef.current = true; setShowOverlay(false); }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-500 flex items-center justify-center transition-colors group"
              >
                <X size={14} className="text-gray-500 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Direction content */}
          <div className={`mx-3 my-3 ${c.bg} ${c.border} border rounded-xl p-4`}>
            <ul className="space-y-2.5">
              {dir.items.map((item, i) => (
                <li key={i} className={`text-sm ${c.itemText || 'text-slate-200'} leading-relaxed flex items-start gap-2`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className={`flex items-center justify-between px-4 py-3 border-t ${c.nav}`}>
            <button
              onClick={() => setDirStep(Math.max(0, dirStep - 1))}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
                dirStep === 0 ? 'opacity-0 pointer-events-none' : c.navBack
              }`}
            >
              <ChevronLeft size={14} /> Back
            </button>
            {dirStep < directions.length - 1 ? (
              <button
                onClick={() => setDirStep(dirStep + 1)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => { dismissedRef.current = true; setShowOverlay(false); }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1"
              >
                <Check size={14} /> Got it!
              </button>
            )}
          </div>
        </div>
      )}

      {/* Re-open overlay button (when dismissed) */}
      {!showOverlay && (
        <button
          onClick={() => { dismissedRef.current = false; setShowOverlay(true); }}
          className="absolute z-50 top-2 left-2 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 px-1 py-0.5 rounded-sm shadow-lg border border-gray-200 transition-colors flex items-center gap-0.5 text-[9px] font-medium"
        >
          <HelpCircle size={9} /> Directions
        </button>
      )}
    </div>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================
const TeacherLessonView = ({
  config,
  sessionCode,
  classCode, // For class-based sessions, show permanent class code instead of session code
  lessonStages,
  getCurrentStage,
  setCurrentStage,
  getStudents,
  getProgressStats,
  endSession,
  activityTimers,
  formatTime,
  adjustPresetTime,
  startActivityTimer,
  pauseActivityTimer,
  resumeActivityTimer,
  resetActivityTimer
}) => {
  // Display code: prefer classCode (permanent) over sessionCode (temporary)
  const displayCode = classCode || sessionCode;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [viewMode, setViewMode] = useState('teacher'); // 'teacher' or 'student'
  const [copied, setCopied] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [timerVisible, setTimerVisible] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingStageId, setPendingStageId] = useState(null); // Track stage to navigate to after save
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [classroomTimer, setClassroomTimer] = useState({
    presetMinutes: 5,
    timeRemaining: 5 * 60, // in seconds
    isRunning: false,
    isPaused: false
  });

  // Timer sound hook (plays chime when timer ends)
  const { isMuted, toggleMute, playTimerEndSound } = useTimerSound();

  // Resizable panel state
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // Presentation scaling - design at 1920x1080, scale to fit any screen
  const presentationRef = useRef(null);
  const [presentationZoom, setPresentationZoom] = useState(1);
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080;

  useEffect(() => {
    const container = presentationRef.current;
    if (!container) return;

    const calculateZoom = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Scale to fit design size in container, cap at 1 (no upscaling)
      const zoom = Math.min(
        containerWidth / DESIGN_WIDTH,
        containerHeight / DESIGN_HEIGHT,
        1
      );

      setPresentationZoom(zoom);
    };

    calculateZoom();

    const resizeObserver = new ResizeObserver(calculateZoom);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Handle sidebar horizontal resize
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const newWidth = Math.max(200, Math.min(360, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar]);

  // Handle bottom panel vertical resize
  useEffect(() => {
    if (!isResizingBottom) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      // Calculate delta from start position (dragging UP = positive delta = smaller bottom panel)
      const deltaY = e.clientY - resizeStartY.current;
      const newHeight = resizeStartHeight.current - deltaY;
      setBottomPanelHeight(Math.max(150, Math.min(500, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizingBottom(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingBottom]);

  const startBottomResize = (e) => {
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = bottomPanelHeight;
    setIsResizingBottom(true);
  };

  // Survey state - shown when 5+ students (real classroom use)
  // surveyType: 'quick' | 'midPilot' | 'finalPilot' | null
  const [surveyType, setSurveyType] = useState(null);
  const MIN_STUDENTS_FOR_SURVEY = 5;

  const currentStage = getCurrentStage();
  const students = getStudents();
  const studentCount = students?.length || 0;

  // Determine which lesson this is from config
  const getLessonNumber = () => {
    const lessonId = config.lessonId || '';
    if (lessonId.includes('lesson1') || lessonId.includes('lesson-1')) return 1;
    if (lessonId.includes('lesson2') || lessonId.includes('lesson-2')) return 2;
    if (lessonId.includes('lesson3') || lessonId.includes('lesson-3')) return 3;
    if (lessonId.includes('lesson4') || lessonId.includes('lesson-4')) return 4;
    if (lessonId.includes('lesson5') || lessonId.includes('lesson-5')) return 5;
    // Also check the route/path
    const path = window.location.pathname;
    if (path.includes('lesson1')) return 1;
    if (path.includes('lesson2')) return 2;
    if (path.includes('lesson3')) return 3;
    if (path.includes('lesson4')) return 4;
    if (path.includes('lesson5')) return 5;
    return 0;
  };

  // Handle end session with appropriate survey based on lesson
  const handleEndSession = () => {
    if (studentCount >= MIN_STUDENTS_FOR_SURVEY) {
      const lessonNum = getLessonNumber();

      if (lessonNum === 3) {
        // Mid-pilot survey after Lesson 3
        setSurveyType('midPilot');
      } else if (lessonNum === 5) {
        // Final PMF survey after Lesson 5
        setSurveyType('finalPilot');
      } else {
        // Quick survey for other lessons
        setSurveyType('quick');
      }
    } else {
      // Skip survey for testing (< 5 students)
      endSession();
    }
  };

  const handleSurveyComplete = () => {
    setSurveyType(null);
    endSession();
  };

  const handleSurveySkip = () => {
    setSurveyType(null);
    endSession();
  };

  // Check if we're on join-code (not started yet)
  const isOnJoinCode = currentStage === 'locked' || currentStage === 'join-code' || !currentStage;
  
  // Filter to content stages only (exclude join-code, locked)
  const contentStages = useMemo(() => {
    return lessonStages?.filter(s => s.id !== 'join-code' && s.id !== 'locked') || [];
  }, [lessonStages]);
  
  // Get current index within CONTENT stages (not full array)
  const currentContentIndex = contentStages.findIndex(s => s.id === currentStage);
  const isFirstStage = currentContentIndex <= 0;
  const isLastStage = currentContentIndex >= contentStages.length - 1;

  // Get current stage data
  const currentStageData = useMemo(() => {
    return lessonStages?.find(stage => stage.id === currentStage);
  }, [currentStage, lessonStages]);

  // Subscribe to session data for presentation content
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      // Use queueMicrotask to prevent setState during render
      queueMicrotask(() => {
        setSessionData(snapshot.val());
      });
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Auto-expand active section
  useEffect(() => {
    if (!config.lessonSections) return;
    const activeSection = config.lessonSections.find(section =>
      section.stages.some(stage => stage.id === currentStage)
    );
    if (activeSection) {
      setExpandedSections(new Set([activeSection.id]));
    }
  }, [currentStage, config.lessonSections]);

  // Auto-configure timer for timed activities
  // Timer stays visible by default; auto-expands and sets duration for timed stages
  useEffect(() => {
    if (!currentStageData) return;

    // Check if this is an activity with a timer configured
    const isTimedActivity =
      currentStageData.type === 'activity' &&
      currentStageData.hasTimer;

    if (isTimedActivity && currentStageData.duration) {
      // Show timer and set it to the activity's duration
      setTimerVisible(true);
      setClassroomTimer(prev => ({
        ...prev,
        presetMinutes: currentStageData.duration,
        timeRemaining: currentStageData.duration * 60,
        isRunning: false,
        isPaused: false
      }));
    }
    // Don't auto-hide — let the user control minimizing
  }, [currentStageData]);

  // Keyboard navigation - uses goToNextStage to trigger save modal for composition activities
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lessonStages || lessonStages.length === 0) return;
      // Don't navigate if save modal is showing
      if (showSaveModal) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextStage(); // Uses goToNextStage to trigger save modal if needed
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevStage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, lessonStages, showSaveModal]);

  // Copy join code (uses displayCode which prefers classCode over sessionCode)
  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle section
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Get stage status
  const getStageStatus = (stageId) => {
    const currIdx = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const stageIdx = lessonStages?.findIndex(s => s.id === stageId) ?? -1;
    if (stageId === currentStage) return 'active';
    if (stageIdx < currIdx) return 'completed';
    return 'upcoming';
  };

  // Get section status
  const getSectionStatus = (section) => {
    const stageIds = section.stages.map(s => s.id);
    const currIdx = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const sectionStageIndices = stageIds.map(id => lessonStages?.findIndex(s => s.id === id) ?? -1);
    if (sectionStageIndices.includes(currIdx)) return 'active';
    if (sectionStageIndices.every(i => i < currIdx)) return 'completed';
    return 'upcoming';
  };

  // Classroom Timer Functions
  const formatClassroomTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustClassroomTime = (delta) => {
    setClassroomTimer(prev => {
      const newMinutes = Math.max(1, Math.min(60, prev.presetMinutes + delta));
      return {
        ...prev,
        presetMinutes: newMinutes,
        timeRemaining: newMinutes * 60
      };
    });
  };

  const startClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      timeRemaining: prev.isPaused ? prev.timeRemaining : prev.presetMinutes * 60
    }));
  };

  const pauseClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true
    }));
  };

  const resetClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: prev.presetMinutes * 60
    }));
  };

  // Timer countdown effect
  useEffect(() => {
    if (!classroomTimer.isRunning) return;

    const interval = setInterval(() => {
      setClassroomTimer(prev => {
        if (prev.timeRemaining <= 1) {
          // Play timer end sound
          playTimerEndSound();
          return {
            ...prev,
            isRunning: false,
            isPaused: false,
            timeRemaining: 0
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [classroomTimer.isRunning, playTimerEndSound]);

  // Check if current stage is a saveable activity (composition or listening map)
  const isSaveableActivity = currentStageData?.type === 'activity' &&
    (currentStageData?.id?.includes('composition') || currentStageData?.id?.includes('listening-map'));

  // Send save command to all students via Firebase
  const sendSaveCommand = async () => {
    if (!sessionCode) return;

    try {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      await update(sessionRef, {
        saveCommand: Date.now()
      });
      console.log('💾 Save command sent to all students');
    } catch (error) {
      console.error('Error sending save command:', error);
    }
  };

  // Navigate to next stage (within content stages only)
  const goToNextStage = () => {
    // If leaving a saveable activity, show save modal instead
    if (isSaveableActivity) {
      const nextStageId = currentContentIndex < contentStages.length - 1
        ? contentStages[currentContentIndex + 1].id
        : null;
      if (nextStageId) {
        setPendingStageId(nextStageId);
        setShowSaveModal(true);
      }
      return;
    }

    if (currentContentIndex < contentStages.length - 1) {
      setCurrentStage(contentStages[currentContentIndex + 1].id);
    }
  };

  // Handle clicking on a stage in the sidebar
  const handleStageClick = (stageId) => {
    // If leaving a saveable activity, show save modal first
    if (isSaveableActivity && stageId !== currentStage) {
      setPendingStageId(stageId);
      setShowSaveModal(true);
      return;
    }
    setCurrentStage(stageId);
  };

  // Confirm leaving saveable activity - save all and advance
  const confirmLeaveComposition = async () => {
    setIsSavingAll(true);
    await sendSaveCommand();

    // Wait for save command to propagate to all students (2 seconds)
    // This gives time for Firebase to sync and students to save
    setTimeout(() => {
      setIsSavingAll(false);
      setShowSaveModal(false);
      if (pendingStageId) {
        setCurrentStage(pendingStageId);
        setPendingStageId(null);
      }
    }, 2000);
  };

  // Navigate to previous stage (within content stages only)
  const goToPrevStage = () => {
    if (currentContentIndex > 0) {
      setCurrentStage(contentStages[currentContentIndex - 1].id);
    }
  };

  // Start the lesson - navigate to first content stage
  const handleStartLesson = () => {
    if (contentStages.length > 0) {
      const firstStageId = contentStages[0].id;
      console.log('🎬 Starting lesson, navigating to first content stage:', firstStageId);
      setCurrentStage(firstStageId);
      
      if (config.lessonSections && config.lessonSections.length > 0) {
        setExpandedSections(new Set([config.lessonSections[0].id]));
      }
    } else {
      console.error('❌ Cannot start lesson - no content stages available');
    }
  };

  const getJoinUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
    // Use current host for dev (handles any port)
    if (!isProduction) return `${window.location.host}/join`;
    return isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join';
  };

  return (
    <>
      <style>{`
        @media (max-width: 1400px) {
          .teacher-lesson-wrapper {
            height: 100vh;
            overflow: hidden;
          }
          .teacher-lesson-container {
            transform: scale(0.67);
            transform-origin: top left;
            width: 149.25%;
            height: 149.25%;
          }
        }
      `}</style>
      <div className="teacher-lesson-wrapper">
        <div className="teacher-lesson-container h-screen flex bg-slate-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          id="teacher-sidebar"
          className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full overflow-hidden ${
            sidebarCollapsed ? 'w-14' : ''
          } ${!isResizingSidebar && !isResizingBottom ? 'transition-all duration-300' : ''}`}
          style={sidebarCollapsed ? {} : { width: `${sidebarWidth}px` }}
        >
          {/* Join Info - Top of Sidebar */}
          <div className={`border-b border-slate-200 flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                  title="Expand sidebar"
                >
                  <PanelLeft size={18} />
                </button>
                {!classCode && (
                  <div className="text-xs font-bold text-blue-600 writing-mode-vertical">
                    {sessionCode}
                  </div>
                )}
                <div className="flex items-center justify-center text-slate-500">
                  <Users size={14} />
                  <span className="text-xs ml-1">{studentCount}</span>
                </div>
              </div>
            ) : classCode ? (
              /* Class session sidebar — directions + student count */
              <>
                <div className="text-xs text-slate-500 mb-2 space-y-1">
                  <div><span className="font-semibold text-slate-700">1.</span> Go to <span className="font-semibold text-blue-600">{getJoinUrl()}</span></div>
                  <div><span className="font-semibold text-slate-700">2.</span> Click <span className="font-semibold text-purple-600">Sign In</span></div>
                  <div><span className="font-semibold text-slate-700">3.</span> Click <span className="font-semibold text-emerald-600">Join Class</span></div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm pt-2 border-t border-slate-100">
                  <Users size={16} />
                  <span>{studentCount} student{studentCount !== 1 ? 's' : ''} joined</span>
                </div>
              </>
            ) : (
              /* Quick session sidebar — show code */
              <>
                <div className="text-slate-500 text-sm mb-1">{getJoinUrl()}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl font-bold font-mono tracking-wider text-blue-600">
                    {displayCode}
                  </span>
                  <button
                    onClick={copyJoinCode}
                    className={`p-1.5 rounded-lg transition-colors ${
                      copied
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'hover:bg-slate-100 text-slate-400'
                    }`}
                    title={copied ? 'Copied!' : 'Copy code'}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Users size={16} />
                  <span>{studentCount} student{studentCount !== 1 ? 's' : ''} joined</span>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons - AT TOP */}
          {!sidebarCollapsed && (
            <div className="p-3 border-b border-slate-200 flex-shrink-0">
              {isOnJoinCode ? (
                <div>
                  <button
                    onClick={handleStartLesson}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Play size={18} />
                    Start Lesson
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPrevStage}
                      disabled={isFirstStage}
                      className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                        isFirstStage
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Previous stage"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                    
                    <button
                      onClick={goToNextStage}
                      disabled={isLastStage}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                        isLastStage
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-400 text-center">
                    or use ← → arrow keys
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsed Navigation */}
          {sidebarCollapsed && (
            <div className="p-2 border-b border-slate-200 flex flex-col gap-1">
              {/* View mode icons */}
              <button
                onClick={() => setViewMode('teacher')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'teacher' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Teacher View"
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setViewMode('student')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'student' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Student View"
              >
                <Smartphone size={18} />
              </button>
              
              {/* Divider */}
              <div className="border-t border-slate-200 my-1"></div>
              
              {/* Navigation */}
              {isOnJoinCode ? (
                <button
                  onClick={handleStartLesson}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  title="Start Lesson"
                >
                  <Play size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={goToPrevStage}
                    disabled={isFirstStage}
                    className={`p-2 rounded-lg transition-colors ${
                      isFirstStage
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'hover:bg-slate-100 text-slate-500'
                    }`}
                    title="Back"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={goToNextStage}
                    disabled={isLastStage}
                    className={`p-2 rounded-lg transition-colors ${
                      isLastStage
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {sidebarCollapsed ? (
              // Collapsed: Show section numbers only
              <div className="p-2 space-y-1">
                {config.lessonSections?.map((section, idx) => {
                  const status = getSectionStatus(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setSidebarCollapsed(false);
                        setExpandedSections(new Set([section.id]));
                      }}
                      className={`w-full p-2 rounded-lg text-center font-bold transition-colors ${
                        status === 'active'
                          ? 'bg-blue-100 text-blue-600'
                          : status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'hover:bg-slate-100 text-slate-400'
                      }`}
                      title={section.title}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Expanded: Full navigation
              <div className="p-2">
                {config.lessonSections?.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const status = getSectionStatus(section);

                  return (
                    <div key={section.id} className="mb-1">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          status === 'active'
                            ? 'bg-blue-50 text-blue-700'
                            : status === 'completed'
                            ? 'text-emerald-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <span className="font-semibold text-sm flex-1">
                          {section.title}
                        </span>
                        {status === 'completed' && (
                          <Check size={14} className="text-emerald-500" />
                        )}
                      </button>

                      {/* Section Stages */}
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-0.5 overflow-x-auto">
                          {section.stages.map((stage) => {
                            const stageStatus = getStageStatus(stage.id);
                            const isActive = stage.id === currentStage;

                            return (
                              <div
                                key={stage.id}
                                onClick={() => handleStageClick(stage.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors min-w-max ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-700'
                                    : stageStatus === 'completed'
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {/* Status indicator */}
                                <div className="flex-shrink-0">
                                  {stageStatus === 'completed' ? (
                                    <Check size={14} className="text-emerald-500" />
                                  ) : isActive ? (
                                    <Circle size={14} className="fill-blue-500 text-blue-500" />
                                  ) : (
                                    <Circle size={14} className="text-slate-300" />
                                  )}
                                </div>

                                {/* Stage label */}
                                <span className="flex-1 text-xs truncate" title={stage.label}>
                                  {stage.label}
                                </span>

                                {/* Duration indicator */}
                                {stage.duration && (
                                  <span className="text-xs text-slate-400">
                                    {stage.duration}m
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vertical Resize Divider */}
          {!sidebarCollapsed && (
            <div
              className="h-1 bg-slate-200 hover:bg-blue-400 cursor-row-resize transition-colors flex-shrink-0"
              onMouseDown={startBottomResize}
            />
          )}

          {/* View Mode Toggle + Mini Preview - AT BOTTOM */}
          {!sidebarCollapsed && (
            <div
              className="border-t border-slate-200 p-3 overflow-y-auto flex-shrink-0"
              style={{ height: `${bottomPanelHeight}px` }}
            >
              {/* Timer */}
              {timerVisible ? (
                <div className={`rounded-xl p-3 mb-3 transition-colors ${
                  classroomTimer.timeRemaining === 0 && !classroomTimer.isRunning
                    ? 'bg-red-100 border border-red-300 animate-pulse'
                    : classroomTimer.isRunning
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-slate-100 border border-slate-200'
                }`}>
                  <div className={`text-2xl font-bold font-mono text-center mb-2 ${
                    classroomTimer.timeRemaining === 0 && !classroomTimer.isRunning
                      ? 'text-red-600'
                      : classroomTimer.isRunning
                        ? classroomTimer.timeRemaining <= 60
                          ? 'text-red-500'
                          : 'text-blue-600'
                        : 'text-slate-700'
                  }`}>
                    {classroomTimer.timeRemaining === 0 ? "TIME'S UP!" : formatClassroomTime(classroomTimer.timeRemaining)}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => adjustClassroomTime(-1)}
                      disabled={classroomTimer.presetMinutes <= 1 || classroomTimer.isRunning}
                      className={`p-1.5 rounded-lg transition-colors ${
                        classroomTimer.presetMinutes <= 1 || classroomTimer.isRunning
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                      }`}
                      title="-1 min"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      onClick={classroomTimer.isRunning ? pauseClassroomTimer : startClassroomTimer}
                      className={`p-2 rounded-lg transition-colors ${
                        classroomTimer.isRunning
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      title={classroomTimer.isRunning ? 'Pause' : 'Start'}
                    >
                      {classroomTimer.isRunning ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                      onClick={() => adjustClassroomTime(1)}
                      disabled={classroomTimer.presetMinutes >= 60 || classroomTimer.isRunning}
                      className={`p-1.5 rounded-lg transition-colors ${
                        classroomTimer.presetMinutes >= 60 || classroomTimer.isRunning
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                      }`}
                      title="+1 min"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={resetClassroomTimer}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Reset"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      title={isMuted ? 'Unmute timer sound' : 'Mute timer sound'}
                    >
                      {isMuted ? '🔇' : '🔔'}
                    </button>
                    <button
                      onClick={() => setTimerVisible(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Minimize timer"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setTimerVisible(true)}
                  className="w-full flex items-center justify-center gap-2 py-1.5 mb-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors text-sm font-medium"
                >
                  <Clock size={14} />
                  <span>Timer</span>
                  <ChevronDown size={14} />
                </button>
              )}

              {/* Teacher/Student View Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 mb-3">
                <button
                  onClick={() => setViewMode('teacher')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'teacher'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Monitor size={16} />
                  <span>Teacher</span>
                </button>
                <button
                  onClick={() => setViewMode('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'student'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Smartphone size={16} />
                  <span>Student</span>
                </button>
              </div>

              {/* Mini Live Preview of Opposite View - TALLER */}
              <MiniPreview
                viewMode={viewMode}
                sessionCode={sessionCode}
                classCode={classCode}
                currentStage={currentStage}
                currentStageData={currentStageData}
                sessionData={sessionData}
                config={config}
                onSwitch={() => setViewMode(viewMode === 'teacher' ? 'student' : 'teacher')}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className={`border-t border-slate-200 flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
            {sidebarCollapsed ? (
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleEndSession}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  title="End Session"
                >
                  <LogOut size={18} />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Expand sidebar"
                >
                  <PanelLeft size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleEndSession}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  End Session
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <PanelLeftClose size={16} />
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Resize Divider */}
        {!sidebarCollapsed && (
          <div
            className="w-1 bg-slate-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
            onMouseDown={() => setIsResizingSidebar(true)}
          />
        )}

        {/* Presentation Area - scales to fit any screen size */}
        <div
          ref={presentationRef}
          className="flex-1 relative bg-slate-900 overflow-hidden"
        >
          {/* Teacher content - always mounted to preserve state (like mood game progress) */}
          {/* Hidden when in student view mode */}
          <div className={viewMode === 'student' ? 'hidden' : ''}>
            <PresentationContent
              currentStage={currentStage}
              currentStageData={currentStageData}
              sessionCode={sessionCode}
              classCode={classCode}
              sessionData={sessionData}
              lessonConfig={config}
              lessonBasePath={config.lessonPath}
              viewMode="teacher"
              onVideoEnded={goToNextStage}
              goToNextStage={goToNextStage}
              presentationZoom={presentationZoom}
            />
          </div>

          {/* Student view iframe - shown when in student view mode */}
          {viewMode === 'student' && (
            <div className="absolute inset-0 bg-gray-100">
              <div className="absolute top-0 left-0 right-0 h-10 bg-emerald-600 flex items-center justify-center z-10">
                <span className="text-white text-sm font-semibold flex items-center gap-2">
                  <Smartphone size={16} />
                  STUDENT VIEW PREVIEW
                </span>
              </div>
              <iframe
                src={`${window.location.origin}/join?code=${classCode || sessionCode}&preview=true&passive=true`}
                className="absolute top-10 left-0 w-full h-[calc(100%-40px)] border-none"
                title="Student View Preview"
                allow="autoplay"
              />
            </div>
          )}

          {/* Timer removed from here — now in sidebar above teacher/student toggle */}
        </div>
      </div>

      {/* Save Confirmation Modal - shown when leaving composition activity */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {isSavingAll ? 'Saving All Work...' : 'Moving to Reflection'}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSavingAll ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-gray-700 text-lg">Saving student work...</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-lg mb-2">
                    All student compositions will be saved automatically.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Students will see their work on the Join page.
                  </p>
                </>
              )}
            </div>

            {/* Buttons */}
            {!isSavingAll && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setPendingStageId(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveComposition}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  Save All & Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-Session Survey Modals */}
      {surveyType === 'quick' && (
        <PostSessionSurvey
          onSubmit={handleSurveyComplete}
          onSkip={handleSurveySkip}
          studentCount={studentCount}
          lessonId={config.lessonId || 'unknown'}
          sessionCode={sessionCode}
        />
      )}

      {surveyType === 'midPilot' && (
        <MidPilotSurvey
          onSubmit={handleSurveyComplete}
          onSkip={handleSurveySkip}
          studentCount={studentCount}
          sessionCode={sessionCode}
        />
      )}

      {surveyType === 'finalPilot' && (
        <FinalPilotSurvey
          onSubmit={handleSurveyComplete}
          onSkip={handleSurveySkip}
          studentCount={studentCount}
          sessionCode={sessionCode}
        />
      )}
      </div>
    </div>
    </>
  );
};

export default TeacherLessonView;