// File: /lessons/listening-lab/lesson3/Lesson3.jsx
// Brass, Percussion & Form
// Uses TeacherLessonView for combined sidebar + presentation

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Gamepad2, Trophy, Clock, Info } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Config
import { lesson3Config, lessonStages, getActivityForStage, MOUNTAIN_KING_JOURNEY_CONFIG } from './lesson3Config';
import DirectionsModal, { DirectionsReopenButton } from '../../shared/components/DirectionsModal';
import useDirectionsModal from '../../shared/hooks/useDirectionsModal';

// L3: Only cloud environments + bird characters, no drawing tools
import { CHARACTER_OPTIONS } from '../../shared/activities/listening-journey/journeyDefaults';
const CLOUD_ENVIRONMENTS = ['clouds-day', 'clouds-lavender', 'clouds-sunset', 'clouds-night'];
const BIRD_CHARACTERS = ['yellow-bird', 'crow', 'pigeon'];
const DEFAULT_BIRD = CHARACTER_OPTIONS.find(c => c.id === 'yellow-bird');
const JOURNEY_L3_PROPS = { pieceConfig: MOUNTAIN_KING_JOURNEY_CONFIG, allowedEnvironments: CLOUD_ENVIRONMENTS, allowedCharacters: BIRD_CHARACTERS, hideDrawingTools: true, gameMode: true, hideDecoys: true, defaultCharacter: DEFAULT_BIRD, defaultScene: 'clouds-day' };
const JOURNEY_L3_PLAY_PROPS = { ...JOURNEY_L3_PROPS, gameMode: true, hideDecoys: true };

// Hooks
import { useLesson } from '../../shared/hooks/useLesson';
import { useSessionMode } from '../../shared/hooks/useSessionMode';
import { useActivityTimers } from '../../shared/hooks/useActivityTimers';

// Components
import LessonStartScreen from '../../shared/components/LessonStartScreen';
import TeacherLessonView from '../../shared/components/TeacherLessonView';
import ActivityRenderer from '../../shared/components/ActivityRenderer';
import StudentWaitingScreen from '../../../components/StudentWaitingScreen';
import TransitionOverlay from '../../shared/components/TransitionOverlay';
import ExitSessionButton from '../../../components/ExitSessionButton';

// Pair and Share overlay — shown on student screen during pair-and-share stage
const PairAndShareOverlay = () => {
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {!dismissed && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Pair and Share</h3>
            </div>
            <div className="p-6">
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">1</span>
                  <span>Find a partner.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">2</span>
                  <span>Have one student play first while the other watches.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">3</span>
                  <span>Press <strong>"Play Game"</strong> on the top bar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">4</span>
                  <span>Give feedback to the game maker — do the stickers and markings match the music?</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">5</span>
                  <span>Make corrections to the markings if needed and switch games!</span>
                </li>
              </ol>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setDismissed(true)}
                className="w-full px-4 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reopen button removed — students use the white Directions button on the top bar */}
    </>
  );
};

const LESSON_PROGRESS_KEY = 'listening-lab-lesson3-progress';
const LESSON_TIMER_KEY = 'listening-lab-lesson3-timer';

const Lesson3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    sessionCode,
    currentStage,
    setCurrentStage,
    getStudents,
    getProgressStats,
    endSession,
    markActivityComplete,
    userRole: sessionRole,
    getCurrentStage
  } = useSession();

  // Session mode detection and permissions
  const sessionMode = useSessionMode();

  // Get effective role
  const effectiveRole = sessionRole || sessionMode.urlRole;

  // Memoize lessonConfig
  const lessonConfig = useMemo(() => ({
    ...lesson3Config,
    progressKey: LESSON_PROGRESS_KEY,
    timerKey: LESSON_TIMER_KEY
  }), []);

  const lesson = useLesson(lessonConfig);

  // Activity timers - ONLY for teachers
  const isTeacher = effectiveRole === 'teacher';
  const timers = useActivityTimers(sessionCode, currentStage, lessonStages, isTeacher);

  // Check for view modes from URL params
  const searchParams = new URLSearchParams(location.search);
  const viewPlanMode = searchParams.get('view') === 'plan' || (searchParams.get('view') === 'saved' && searchParams.get('activity') === 'capstone-planning');
  const viewSavedMode = searchParams.get('view') === 'saved' && !viewPlanMode;
  const viewReflectionMode = searchParams.get('view') === 'reflection';
  const isPreviewMode = searchParams.get('preview') === 'true';
  const isMuted = searchParams.get('muted') === 'true';

  // Preview mode: use local stage state (SessionContext rejects setCurrentStage without a session)
  const [previewStage, setPreviewStage] = useState(null);

  // Memoize currentStageData
  const currentStageData = useMemo(() => {
    return lessonStages.find(stage => stage.id === currentStage);
  }, [currentStage]);

  // Student directions modal
  const activityDirections = useDirectionsModal(currentStage);

  // Trigger directions on first entry to stages that have them
  useEffect(() => {
    if (currentStageData?.studentDirections) activityDirections.triggerIfUnseen();
  }, [currentStage]);

  // Mute audio in preview mode
  React.useEffect(() => {
    if (isPreviewMode || isMuted) {
      const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
      if (OriginalAudioContext) {
        window.AudioContext = function() {
          const ctx = new OriginalAudioContext();
          ctx.suspend();
          return ctx;
        };
        window.webkitAudioContext = window.AudioContext;
      }

      const muteEverything = () => {
        document.querySelectorAll('audio, video').forEach(el => {
          if (el.dataset.gameAudio === 'true') return;
          el.muted = true;
          el.volume = 0;
        });
      };

      muteEverything();
      const interval = setInterval(muteEverything, 100);

      return () => clearInterval(interval);
    }
  }, [isPreviewMode, isMuted]);

  // Handle session activity completion
  const handleSessionActivityComplete = useCallback((activityId) => {
    if (sessionRole === 'student') {
      markActivityComplete(activityId, 'completed');
      console.log('Student marked activity complete:', activityId);
    }
  }, [sessionRole, markActivityComplete]);

  // Transition overlay state for students
  const [showTransition, setShowTransition] = React.useState(false);
  const lastSaveCommandRef = React.useRef(null);

  // Listen for teacher's "Save & Continue" command from Firebase
  // Use classCode for class-based sessions where sessionCode is null
  const effectiveSessionCode = sessionCode || sessionMode.urlClassCode;
  React.useEffect(() => {
    if (!effectiveSessionCode || !sessionMode.isSessionMode || effectiveRole !== 'student') return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${effectiveSessionCode}/saveCommand`);

    const unsubscribe = onValue(saveCommandRef, (snapshot) => {
      const saveCommand = snapshot.val();

      if (!saveCommand) return;

      if (lastSaveCommandRef.current === null) {
        lastSaveCommandRef.current = saveCommand;
        return;
      }

      if (saveCommand !== lastSaveCommandRef.current) {
        lastSaveCommandRef.current = saveCommand;
        console.log('🟢 Teacher clicked Save & Continue - showing overlay');

        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
        }, 7000);
      }
    });

    return () => unsubscribe();
  }, [effectiveSessionCode, sessionMode.isSessionMode, effectiveRole]);

  // Show loading while session is initializing
  if (sessionMode.isSessionMode && !effectiveRole) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing session...</p>
          <p className="text-gray-400 text-sm mt-2">Session Code: {sessionCode || sessionMode.urlSessionCode}</p>
        </div>
      </div>
    );
  }

  // ========================================
  // SESSION MODE: STUDENT VIEW
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'student') {
    // Student waiting for teacher to start
    if (!currentStage || currentStage === 'join-code') {
      return <StudentWaitingScreen />;
    }

    // Session has ended — centralized SessionEndedModal handles redirect
    if (currentStage === 'ended') {
      return null;
    }

    // SUMMARY SLIDES: Students see "Watch the Main Screen" message
    // Four Corners is a physical classroom game — students don't use Chromebooks
    if (currentStageData?.type === 'summary' || currentStageData?.type === 'discussion' || currentStage === 'four-corners-game') {
      console.log('📺 Showing Watch the Main Screen for stage:', currentStage);
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
            <ExitSessionButton />
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // VIDEO/DEMO SLIDES: Students watch with teacher
    if (currentStageData?.type === 'video' || currentStageData?.type === 'demo') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
            <ExitSessionButton />
            <Video className="w-32 h-32 mb-8 text-purple-400" />
            <h1 className="text-5xl font-bold mb-4">Watch the Video</h1>
            <p className="text-2xl text-gray-400">Look at the main screen</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // ACTIVITY STAGES: Students do the activity
    if (currentStageData?.type === 'activity') {
      const activityType = getActivityForStage(currentStage);

      // Show directions on first entry if stage has studentDirections
      // Directions triggered via useEffect, not during render

      return (
        <>
          <ActivityRenderer
            activity={{ type: activityType, id: currentStage, ...(activityType === 'listening-journey' ? (currentStage === 'pair-and-share' ? JOURNEY_L3_PLAY_PROPS : JOURNEY_L3_PROPS) : {}) }}
            onComplete={handleSessionActivityComplete}
            sessionCode={sessionCode}
            viewMode={false}
            isSessionMode={true}
            lessonConfig={lessonConfig}
            currentStage={currentStage}
          />
          {/* Student directions modal — skip for listening-journey (has its own built-in directions) */}
          {currentStageData.studentDirections && activityType !== 'listening-journey' && (
            <DirectionsModal
              title={currentStageData.label || 'Directions'}
              isOpen={activityDirections.isOpen}
              onClose={activityDirections.close}
              steps={currentStageData.studentDirections}
              bonusText={currentStageData.studentDirectionsBonusText}
            />
          )}
          {/* Pair and Share modal overlay on student screen */}
          {currentStage === 'pair-and-share' && (
            <PairAndShareOverlay />
          )}
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // Fallback - watch main screen
    return (
      <>
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
          <ExitSessionButton />
          <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // ========================================
  // PREVIEW MODE: Teacher clicks "Just Preview" — same view, no live session
  // ========================================

  if (isPreviewMode && isTeacher) {
    return (
      <TeacherLessonView
          config={{ ...lesson3Config, getActivityForStage }}
          lessonStages={lessonStages}
          getCurrentStage={() => previewStage}
          setCurrentStage={setPreviewStage}
          getStudents={() => []}
          getProgressStats={() => ({ total: 0, completed: 0 })}
          endSession={() => navigate(-1)}
          activityTimers={timers.activityTimers}
          formatTime={timers.formatTime}
          adjustPresetTime={timers.adjustPresetTime}
          startActivityTimer={timers.startActivityTimer}
          pauseActivityTimer={timers.pauseActivityTimer}
          resumeActivityTimer={timers.resumeActivityTimer}
          resetActivityTimer={timers.resetActivityTimer}
          isPreviewMode={true}
        />
    );
  }

  // ========================================
  // SESSION MODE: TEACHER VIEW
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'teacher') {
    return (
      <TeacherLessonView
        config={lesson3Config}
        sessionCode={sessionCode}
        classCode={sessionMode.urlClassCode}
        lessonStages={lessonStages}
        getCurrentStage={getCurrentStage}
        setCurrentStage={setCurrentStage}
        getStudents={getStudents}
        getProgressStats={getProgressStats}
        endSession={endSession}
        activityTimers={timers.activityTimers}
        formatTime={timers.formatTime}
        adjustPresetTime={timers.adjustPresetTime}
        startActivityTimer={timers.startActivityTimer}
        pauseActivityTimer={timers.pauseActivityTimer}
        resumeActivityTimer={timers.resumeActivityTimer}
        resetActivityTimer={timers.resetActivityTimer}
      />
    );
  }

  // ========================================
  // NORMAL MODE (NO SESSION)
  // ========================================

  // View saved capstone plan
  if (viewPlanMode) {
    return (
      <ActivityRenderer
        activity={{ type: 'capstone-planning', id: 'planning-intro' }}
        onComplete={() => navigate(-1)}
        viewMode={true}
        isSessionMode={false}
        lessonConfig={lessonConfig}
      />
    );
  }

  // View saved work mode
  if (viewSavedMode || viewReflectionMode) {
    return (
      <ActivityRenderer
        activity={{ type: viewReflectionMode ? 'listening-lab-lesson3-reflection' : 'listening-journey', id: 'saved-view', ...JOURNEY_L3_PROPS }}
        onComplete={() => navigate(-1)}
        viewMode={true}
        isSessionMode={false}
        lessonConfig={lessonConfig}
      />
    );
  }

  // Normal mode - start screen or activity
  if (!lesson.started) {
    return (
      <LessonStartScreen
        config={lessonConfig}
        savedProgress={lesson.savedProgress}
        onStartLesson={lesson.handleStart}
        onResumeLesson={lesson.handleStart}
        onStartOver={() => {
          localStorage.removeItem(LESSON_PROGRESS_KEY);
          lesson.handleStart();
        }}
      />
    );
  }

  // Show current activity
  const currentActivity = lessonConfig.activities[lesson.currentActivityIndex];
  if (!currentActivity) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Trophy className="w-24 h-24 mb-6 text-yellow-400" />
        <h1 className="text-4xl font-bold mb-4">Lesson Complete!</h1>
        <p className="text-xl text-gray-400 mb-8">Great job learning about brass, percussion, and form!</p>
        <button
          onClick={() => navigate('/listening-lab')}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-xl font-semibold transition-colors"
        >
          Back to Listening Lab
        </button>
      </div>
    );
  }

  return (
    <ActivityRenderer
      activity={{ type: currentActivity.type, id: currentActivity.id, ...(currentActivity.type === 'listening-journey' ? (currentActivity.id === 'pair-and-share' ? JOURNEY_L3_PLAY_PROPS : JOURNEY_L3_PROPS) : {}) }}
      onComplete={lesson.handleActivityComplete}
      viewMode={false}
      isSessionMode={false}
      lessonConfig={lessonConfig}
      currentStage={currentActivity.type}
    />
  );
};

export default Lesson3;
