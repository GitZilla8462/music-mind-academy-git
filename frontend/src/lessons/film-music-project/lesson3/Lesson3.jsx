// File: /src/lessons/film-music-project/lesson3/Lesson3.jsx
// Epic Wildlife - Nature Documentary Video - Main lesson orchestrator
// ✅ UPDATED: Uses TeacherLessonView for combined sidebar + presentation
// ✅ UPDATED: Added view=melody support for Robot Melody Maker

import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Gamepad2, Trophy, Globe } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Config
import { lesson3Config, lessonStages, getActivityForStage } from './Lesson3config';

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
import SectionalLoopBuilderActivity from '../../shared/activities/sectional-loop-builder/SectionalLoopBuilderActivity';

const LESSON_PROGRESS_KEY = 'lesson3-progress';
const LESSON_TIMER_KEY = 'lesson3-timer';

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
  
  // Memoize lessonConfig to prevent new object reference each render
  const lessonConfig = useMemo(() => ({ 
    ...lesson3Config, 
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
  const viewMelodyMode = searchParams.get('view') === 'melody'; // ✅ NEW

  // Memoize currentStageData
  const currentStageData = useMemo(() => {
    return lessonStages.find(stage => stage.id === currentStage);
  }, [currentStage]);

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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
          <div className="text-center">
            <div className="text-6xl mb-4">✔</div>
            <h1 className="text-white text-3xl font-bold mb-4">Session Has Ended</h1>
            <p className="text-gray-400 text-lg">Redirecting to join page...</p>
          </div>
        </div>
      );
    }
    
    // SUMMARY SLIDES: Students see "Watch the Main Screen" message
    if (currentStageData?.type === 'summary') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-300">Your teacher will provide instruction</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // CLASS DEMO: Students see "Watch the Main Screen" for whole-class activities
    if (currentStageData?.type === 'class-demo') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
            <Gamepad2 className="w-32 h-32 mb-8 animate-pulse text-green-400" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-300">Follow along with the class demo</p>
            <p className="text-xl text-teal-400 mt-4">You'll play the game individually next!</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // Section Safari Results - Show student their score and rank (BEFORE results type check!)
    if (currentStage === 'sectional-loop-builder-results') {
      return (
        <>
          <SectionalLoopBuilderActivity
            onComplete={() => {}}
            isSessionMode={true}
            forceFinished={true}
          />
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // RESULTS: Students see "Watch the Main Screen" for game results
    if (currentStageData?.type === 'results') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
            <Trophy className="w-32 h-32 mb-8 animate-pulse text-yellow-400" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-300">Viewing game results and winners!</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // VIDEO STAGES: Students see static slide
    if (currentStageData?.type === 'video') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
            <Video className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-300">The video is playing on the projection screen</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // DISCUSSION/CONCLUSION STAGES: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'discussion' || currentStage === 'conclusion') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-300">Your teacher is leading a class discussion</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // Student viewing active activity
    const displayStage = currentStage === 'reflection' ? 'wildlife-composition' : currentStage;
    const activityType = getActivityForStage(displayStage);
    
    const activity = lesson3Config.activities.find(a => a.type === activityType);
    
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
    console.log('👨‍🏫 Rendering TEACHER control panel');
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
  // NORMAL MODE: LESSON START SCREEN
  // ========================================
  if (!lesson.lessonStarted && !viewSavedMode && !viewReflectionMode && !viewMelodyMode) {
    return (
      <LessonStartScreen
        config={lesson3Config}
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
  
  // Handle view modes
  let activityToRender = lesson.currentActivityData;
  let onCompleteHandler = lesson.handleActivityComplete;
  let viewModeActive = false;
  
  if (viewSavedMode) {
    activityToRender = lesson3Config.activities.find(a => a.type === 'wildlife-composition-activity');
    viewModeActive = true;
  } else if (viewReflectionMode) {
    activityToRender = lesson3Config.activities.find(a => a.type === 'two-stars-wish');
    viewModeActive = true;
  } else if (viewMelodyMode) {
    // ✅ NEW: View saved Robot Melody Maker
    activityToRender = lesson3Config.activities.find(a => a.type === 'robot-melody-maker');
    viewModeActive = true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
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

export default Lesson3;