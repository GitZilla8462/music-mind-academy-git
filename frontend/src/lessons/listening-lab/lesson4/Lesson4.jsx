// File: /lessons/listening-lab/lesson4/Lesson4.jsx
// Review + Start Capstone
// Uses TeacherLessonView for combined sidebar + presentation

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Gamepad2, Trophy, Clock } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Config
import { lesson4Config, lessonStages, getActivityForStage, getPieceById, buildPieceConfig } from './lesson4Config';

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

const LESSON_PROGRESS_KEY = 'listening-lab-lesson4-progress';
const LESSON_TIMER_KEY = 'listening-lab-lesson4-timer';

const Lesson4 = () => {
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
    ...lesson4Config,
    progressKey: LESSON_PROGRESS_KEY,
    timerKey: LESSON_TIMER_KEY
  }), []);

  const lesson = useLesson(lessonConfig);

  // Activity timers - ONLY for teachers
  const isTeacher = effectiveRole === 'teacher';
  const timers = useActivityTimers(sessionCode, currentStage, lessonStages, isTeacher);

  // Get selected piece config for Listening Journey
  const getSelectedPieceConfig = useCallback(() => {
    let config;
    try {
      const saved = localStorage.getItem('listening-lab-lesson4-selected-piece');
      if (saved) {
        const { pieceId } = JSON.parse(saved);
        config = buildPieceConfig(getPieceById(pieceId));
      }
    } catch (e) { /* ignore */ }
    if (!config) config = buildPieceConfig(getPieceById('mountain-king'));
    // Tag with lesson ID so saves are filed under L4 for teacher visibility
    return { ...config, lessonId: 'll-lesson4' };
  }, []);

  // Check for view modes from URL params
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewReflectionMode = searchParams.get('view') === 'reflection';
  const isPreviewMode = searchParams.get('preview') === 'true';
  const isMuted = searchParams.get('muted') === 'true';

  // Memoize currentStageData
  const currentStageData = useMemo(() => {
    return lessonStages.find(stage => stage.id === currentStage);
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
  React.useEffect(() => {
    if (!sessionCode || !sessionMode.isSessionMode || effectiveRole !== 'student') return;

    const db = getDatabase();
    const saveCommandRef = ref(db, `sessions/${sessionCode}/saveCommand`);

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
      console.log('📚 Session ended, redirecting to classroom resources');
      setTimeout(() => {
        window.location.href = '/music-classroom-resources';
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
    if (currentStageData?.type === 'summary' || currentStageData?.type === 'discussion') {
      console.log('📺 Showing Watch the Main Screen for stage:', currentStage);
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
          </div>
          {showTransition && (
            <TransitionOverlay
              message="Great work! Moving to the next section..."
              onComplete={() => setShowTransition(false)}
            />
          )}
        </>
      );
    }

    // VIDEO/DEMO SLIDES: Students watch with teacher
    if (currentStageData?.type === 'video' || currentStageData?.type === 'demo') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
            <Video className="w-32 h-32 mb-8 text-purple-400" />
            <h1 className="text-5xl font-bold mb-4">Watch the Video</h1>
            <p className="text-2xl text-gray-400">Look at the main screen</p>
          </div>
          {showTransition && (
            <TransitionOverlay
              message="Great work! Moving to the next section..."
              onComplete={() => setShowTransition(false)}
            />
          )}
        </>
      );
    }

    // ACTIVITY STAGES: Students do the activity
    if (currentStageData?.type === 'activity') {
      const activityType = getActivityForStage(currentStage);

      return (
        <>
          <ActivityRenderer
            activity={{ type: activityType, id: currentStage, ...(activityType === 'listening-journey' ? { pieceConfig: getSelectedPieceConfig() } : {}) }}
            onComplete={handleSessionActivityComplete}
            sessionCode={sessionCode}
            viewMode={false}
            isSessionMode={true}
            lessonConfig={lessonConfig}
            currentStage={currentStage}
          />
          {showTransition && (
            <TransitionOverlay
              message="Great work! Moving to the next section..."
              onComplete={() => setShowTransition(false)}
            />
          )}
        </>
      );
    }

    // Fallback - watch main screen
    return (
      <>
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
        </div>
        {showTransition && (
          <TransitionOverlay
            message="Great work! Moving to the next section..."
            onComplete={() => setShowTransition(false)}
          />
        )}
      </>
    );
  }

  // ========================================
  // SESSION MODE: TEACHER VIEW
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'teacher') {
    return (
      <TeacherLessonView
        config={lesson4Config}
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

  // View saved work mode
  if (viewSavedMode || viewReflectionMode) {
    return (
      <ActivityRenderer
        activity={{ type: viewReflectionMode ? 'listening-lab-lesson4-reflection' : 'listening-journey', id: 'saved-view', ...(viewSavedMode ? { pieceConfig: getSelectedPieceConfig() } : {}) }}
        onComplete={() => navigate('/music-classroom-resources')}
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
        <p className="text-xl text-gray-400 mb-8">Great job reviewing and starting your capstone!</p>
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
      activity={{ type: currentActivity.type, id: currentActivity.id, ...(currentActivity.type === 'listening-journey' ? { pieceConfig: getSelectedPieceConfig() } : {}) }}
      onComplete={lesson.handleActivityComplete}
      viewMode={false}
      isSessionMode={false}
      lessonConfig={lessonConfig}
      currentStage={currentActivity.type}
    />
  );
};

export default Lesson4;
