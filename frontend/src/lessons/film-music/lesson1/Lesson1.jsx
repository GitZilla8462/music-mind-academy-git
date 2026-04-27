// File: /lessons/film-music/lesson1/Lesson1.jsx
// Film Music Lesson 1: WHO Is In The Story? - Leitmotif & Melody
// Uses TeacherLessonView for combined sidebar + presentation

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Music } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Config
import { fmLesson1Config, lessonStages, getActivityForStage } from './Lesson1config';

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
import DirectionsModal from '../../shared/components/DirectionsModal';

const LESSON_PROGRESS_KEY = 'fm-lesson1-progress';
const LESSON_TIMER_KEY = 'fm-lesson1-timer';

const SHARE_AND_PAIR_STEPS = [
  'Play your motif for your partner — don\'t say anything!',
  'Partner guesses: Hero, Villain, Romantic, or Sneaky?',
  'Partner guesses: What instrument family?',
  'Reveal your character and show your artwork!',
  'Switch roles! Partner B plays, Partner A guesses.',
];

const ShareAndPairModal = () => {
  const [dismissed, setDismissed] = React.useState(false);
  return (
    <DirectionsModal
      title="Share & Pair"
      isOpen={!dismissed}
      onClose={() => setDismissed(true)}
      steps={SHARE_AND_PAIR_STEPS}
    />
  );
};

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
    ...fmLesson1Config,
    progressKey: LESSON_PROGRESS_KEY,
    timerKey: LESSON_TIMER_KEY
  }), []);

  const lesson = useLesson(lessonConfig);

  // Activity timers - ONLY for teachers (students don't need local timer management)
  const isTeacher = effectiveRole === 'teacher';
  const timers = useActivityTimers(sessionCode, currentStage, lessonStages, isTeacher);

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
      console.log('🎵 Student marked activity complete:', activityId);
    }
  }, [sessionRole, markActivityComplete]);

  // Transition overlay state for students (triggered by teacher's Save & Continue)
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
  }, [effectiveSessionCode, sessionMode.isSessionMode, effectiveRole]);

  // Show loading while session is initializing
  if (sessionMode.isSessionMode && !effectiveRole) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
    if (currentStageData?.type === 'summary') {
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

    // DEMO STAGES: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'demo') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
            <ExitSessionButton />
            <Music className="w-32 h-32 mb-8 animate-pulse text-orange-400" />
            <h1 className="text-5xl font-bold mb-4">Listen Carefully!</h1>
            <p className="text-2xl text-gray-300">Can you identify the character from the music?</p>
            <p className="text-xl text-gray-400 mt-4">Watch the main screen</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // VIDEO STAGES: Students see static slide
    if (currentStageData?.type === 'video') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
            <ExitSessionButton />
            <Video className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">The video is playing on the projection screen</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // DISCUSSION/CONCLUSION STAGES
    if (currentStageData?.type === 'discussion') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
            <ExitSessionButton />
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">Your teacher is leading a class discussion</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // Share & Pair: show motif builder with directions modal overlay
    if (currentStage === 'share-and-pair') {
      const motifBuilderActivity = fmLesson1Config.activities.find(a => a.type === 'motif-builder');
      return (
        <>
          <div className="h-screen flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ActivityRenderer
                activity={{ ...motifBuilderActivity, hideDirections: true }}
                onComplete={() => {}}
                navToolsEnabled={false}
                canAccessNavTools={false}
                lessonStartTime={lesson.lessonStartTime}
                viewMode={false}
                isSessionMode={true}
                muted={isPreviewMode || isMuted}
              />
            </div>
          </div>
          <ShareAndPairModal />
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // Student viewing active activity
    const activityType = getActivityForStage(currentStage);
    const activity = fmLesson1Config.activities.find(a => a.type === activityType);

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
    return (
      <>
        <TeacherLessonView
          config={fmLesson1Config}
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
      </>
    );
  }

  // ========================================
  // NORMAL MODE: LESSON START SCREEN
  // ========================================
  if (!lesson.lessonStarted && !viewSavedMode && !viewReflectionMode) {
    return (
      <LessonStartScreen
        config={fmLesson1Config}
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
    activityToRender = fmLesson1Config.activities.find(a => a.type === 'motif-builder');
    viewModeActive = true;
  } else if (viewReflectionMode) {
    activityToRender = fmLesson1Config.activities.find(a => a.type === 'two-stars-wish');
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
