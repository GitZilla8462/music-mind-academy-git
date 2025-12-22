// File: /lessons/film-music-project/lesson1/Lesson1.jsx
// Score the Adventure - Mood & Expression
// Uses TeacherLessonView for combined sidebar + presentation

import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Gamepad2, Trophy, Clock } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Config
import { lesson1Config, lessonStages, getActivityForStage } from './lesson1Config';

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

const LESSON_PROGRESS_KEY = 'lesson1-progress';
const LESSON_TIMER_KEY = 'lesson1-timer';

const Lesson1 = () => {
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
    ...lesson1Config,
    progressKey: LESSON_PROGRESS_KEY,
    timerKey: LESSON_TIMER_KEY
  }), []);

  const lesson = useLesson(lessonConfig);

  // Activity timers
  const timers = useActivityTimers(sessionCode, currentStage, lessonStages);

  // Check for view modes from URL params
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewReflectionMode = searchParams.get('view') === 'reflection';
  const isPreviewMode = searchParams.get('preview') === 'true';
  const isMuted = searchParams.get('muted') === 'true';

  // Memoize currentStageData
  const currentStageData = useMemo(() => {
    const data = lessonStages.find(stage => stage.id === currentStage);
    console.log('📍 currentStageData:', { currentStage, type: data?.type, data });
    return data;
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
          el.muted = true;
          el.volume = 0;
          el.pause();
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

  // Transition overlay state for students (triggered by teacher's Save & Continue)
  const [showTransition, setShowTransition] = React.useState(false);
  const lastSaveCommandRef = React.useRef(null);

  // Listen for teacher's "Save & Continue" command from Firebase
  React.useEffect(() => {
    if (!sessionCode || !sessionMode.isSessionMode || effectiveRole !== 'student') return;

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
  }, [sessionCode, sessionMode.isSessionMode, effectiveRole]);

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

    // Session has ended
    if (currentStage === 'ended') {
      console.log('📚 Session ended, redirecting to join page');
      setTimeout(() => {
        window.location.href = '/join';
      }, 1000);

      return (
        <div className="h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-white text-3xl font-bold mb-4">Session Has Ended</h1>
            <p className="text-gray-400 text-lg">Redirecting to join page...</p>
          </div>
        </div>
      );
    }

    // SUMMARY SLIDES: Students see "Watch the Main Screen" message
    if (currentStageData?.type === 'summary') {
      console.log('📺 Showing Watch the Main Screen for stage:', currentStage);
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
        </div>
      );
    }

    // DEMO STAGES: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'demo') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-8">
          <Gamepad2 className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">Follow along with the demo</p>
          <p className="text-xl text-gray-400 mt-4">Notice how the music changes the mood!</p>
        </div>
      );
    }

    // VIDEO STAGES: Students see static slide
    if (currentStageData?.type === 'video') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <Video className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">The video is playing on the projection screen</p>
        </div>
      );
    }

    // DISCUSSION/CONCLUSION STAGES
    if (currentStageData?.type === 'discussion' || currentStage === 'conclusion') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">Your teacher is leading a class discussion</p>
        </div>
      );
    }

    // Student viewing active activity
    const displayStage = currentStage === 'reflection' ? 'adventure-composition' : currentStage;
    const activityType = getActivityForStage(displayStage);

    const activity = lesson1Config.activities.find(a => a.type === activityType);

    console.log('🎮 Rendering activity for stage:', { currentStage, displayStage, activityType, activityFound: !!activity });

    if (!activity) {
      return <StudentWaitingScreen />;
    }

    return (
      <>
        <div className="h-screen flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ActivityRenderer
              activity={activity}
              onComplete={() => handleSessionActivityComplete(currentStage)}
              navToolsEnabled={false}
              canAccessNavTools={false}
              lessonStartTime={lesson.lessonStartTime}
              viewMode={false}
              isSessionMode={true}
              muted={isPreviewMode || isMuted}
            />
          </div>
        </div>
        <TransitionOverlay isVisible={showTransition} />
      </>
    );
  }

  // ========================================
  // SESSION MODE: TEACHER VIEW
  // Uses TeacherLessonView for combined sidebar + presentation
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'teacher') {
    console.log('👨‍🏫 Rendering TEACHER lesson view');

    return (
      <TeacherLessonView
        config={lesson1Config}
        sessionCode={sessionCode}
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
  // NORMAL MODE: LESSON START SCREEN
  // ========================================
  if (!lesson.lessonStarted && !viewSavedMode && !viewReflectionMode) {
    return (
      <LessonStartScreen
        config={lesson1Config}
        savedProgress={lesson.savedProgress}
        onStartLesson={lesson.startLesson}
        onResumeLesson={lesson.resumeLesson}
        onStartOver={lesson.startOver}
      />
    );
  }

  // ========================================
  // NORMAL MODE: ACTIVE LESSON
  // ========================================

  let activityToRender = lesson.currentActivityData;
  let onCompleteHandler = lesson.handleActivityComplete;
  let viewModeActive = false;

  if (viewSavedMode) {
    activityToRender = lesson1Config.activities.find(a => a.type === 'adventure-composition');
    viewModeActive = true;
  } else if (viewReflectionMode) {
    activityToRender = lesson1Config.activities.find(a => a.type === 'two-stars-wish');
    viewModeActive = true;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          {activityToRender && (
            <ActivityRenderer
              activity={activityToRender}
              onComplete={onCompleteHandler}
              navToolsEnabled={sessionMode.canAccessNavTools}
              canAccessNavTools={sessionMode.canAccessNavTools}
              lessonStartTime={lesson.lessonStartTime}
              viewMode={viewModeActive}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson1;
