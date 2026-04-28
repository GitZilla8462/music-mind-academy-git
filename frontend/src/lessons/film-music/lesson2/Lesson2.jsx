// File: /lessons/film-music/lesson2/Lesson2.jsx
// Film Music Lesson 2: WHAT Do They Feel? — Instruments & Emotion
// Hook → 4 instrument demos → Scene Composer (draw + record two character themes)
// Uses TeacherLessonView for combined sidebar + presentation

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Music, Clock, X, Play } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Config
import { fmLesson2Config, lessonStages, getActivityForStage } from './Lesson2config';

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

const LESSON_PROGRESS_KEY = 'fm-lesson2-progress';
const LESSON_TIMER_KEY = 'fm-lesson2-timer';

const SHARE_AND_PAIR_STEPS = [
  'Hide your screen from your partner — no peeking!',
  'Play your score and let them just listen.',
  'Your partner guesses: What characters or scenes do they hear? When does the mood change?',
  'Reveal your drawings and see how close they got!',
  'Switch roles!',
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

const Lesson2 = () => {
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

  const sessionMode = useSessionMode();
  const effectiveRole = sessionRole || sessionMode.urlRole;

  const lessonConfig = useMemo(() => ({
    ...fmLesson2Config,
    progressKey: LESSON_PROGRESS_KEY,
    timerKey: LESSON_TIMER_KEY
  }), []);

  const lesson = useLesson(lessonConfig);

  const isTeacher = effectiveRole === 'teacher';
  const timers = useActivityTimers(sessionCode, currentStage, lessonStages, isTeacher);

  const searchParams = new URLSearchParams(location.search);
  const isPreviewMode = searchParams.get('preview') === 'true';
  const isMuted = searchParams.get('muted') === 'true';
  const viewSavedMode = searchParams.get('view') === 'saved';

  const currentStageData = useMemo(() => {
    return lessonStages.find(stage => stage.id === currentStage);
  }, [currentStage]);

  // Mute audio in preview mode
  useEffect(() => {
    if (isPreviewMode || isMuted) {
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

  const handleSessionActivityComplete = useCallback((activityId) => {
    if (sessionRole === 'student') {
      markActivityComplete(activityId, 'completed');
    }
  }, [sessionRole, markActivityComplete]);

  // Transition overlay for students
  const [showTransition, setShowTransition] = useState(false);
  const lastSaveCommandRef = React.useRef(null);

  const effectiveSessionCode = sessionCode || sessionMode.urlClassCode;
  useEffect(() => {
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
        setShowTransition(true);
        setTimeout(() => setShowTransition(false), 7000);
      }
    });

    return () => unsubscribe();
  }, [effectiveSessionCode, sessionMode.isSessionMode, effectiveRole]);

  // Loading
  if (sessionMode.isSessionMode && !effectiveRole) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing session...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // SESSION MODE: STUDENT VIEW
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'student') {
    if (!currentStage || currentStage === 'join-code') {
      return <StudentWaitingScreen />;
    }

    if (currentStage === 'ended') {
      return null;
    }

    // Summary/discussion/demo/video slides: watch the main screen
    if (currentStageData?.type === 'summary' || currentStageData?.type === 'discussion' || currentStageData?.type === 'demo' || currentStageData?.type === 'video') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 relative">
            <ExitSessionButton />
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">
              {currentStageData?.type === 'discussion'
                ? 'Your teacher is leading a class discussion'
                : currentStageData?.type === 'demo'
                  ? 'Your teacher is demonstrating'
                  : 'Your teacher will provide instruction'}
            </p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // Share & Pair: show scene composer with directions modal overlay
    if (currentStage === 'share-and-pair') {
      const sceneComposerActivity = fmLesson2Config.activities.find(a => a.type === 'scene-composer');
      return (
        <>
          <div className="h-screen flex flex-col">
            <div className="flex-1 overflow-hidden">
              <ActivityRenderer
                activity={sceneComposerActivity}
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
    const activity = fmLesson2Config.activities.find(a => a.type === activityType);

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
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'teacher') {
    return (
      <TeacherLessonView
        config={fmLesson2Config}
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
  // VIEW SAVED MODE: Read-only composition viewer
  // ========================================
  if (viewSavedMode) {
    const savedActivity = fmLesson2Config.activities.find(a => a.type === 'scene-composer');
    return (
      <div className="h-screen flex flex-col bg-gray-900">
        <div className="flex-1 overflow-hidden">
          <ActivityRenderer
            activity={savedActivity}
            onComplete={() => {}}
            viewMode={true}
            isSessionMode={false}
          />
        </div>
      </div>
    );
  }

  // ========================================
  // NORMAL MODE: LESSON START SCREEN
  // ========================================
  if (!lesson.lessonStarted) {
    return (
      <LessonStartScreen
        config={fmLesson2Config}
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
  const activityToRender = lesson.currentActivityData;
  const onCompleteHandler = lesson.handleActivityComplete;

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
              viewMode={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson2;
