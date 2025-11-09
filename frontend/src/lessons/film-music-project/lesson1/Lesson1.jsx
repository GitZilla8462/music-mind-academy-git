// File: /lessons/film-music-project/lesson1/Lesson1.jsx
// REFACTORED - Main lesson orchestrator using shared hooks and components
// FIXED: Keep SchoolBeneathActivity mounted during reflection stage
// UPDATED: Students see "Watch Main Screen" for ALL summary slides (not PNG images)

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";

// Config
import { lesson1Config, lessonStages, getActivityForStage } from './lesson1Config';

// Hooks
import { useLesson } from '../../shared/hooks/useLesson';
import { useSessionMode } from '../../shared/hooks/useSessionMode';
import { useActivityTimers } from '../../shared/hooks/useActivityTimers';

// Components
import LessonStartScreen from '../../shared/components/LessonStartScreen';
import SessionTeacherPanel from '../../shared/components/SessionTeacherPanel';
import ActivityRenderer from '../../shared/components/ActivityRenderer';
import StudentWaitingScreen from '../../../components/StudentWaitingScreen';

const LESSON_PROGRESS_KEY = 'lesson1-progress';
const LESSON_TIMER_KEY = 'lesson1-timer';

// Map stages to slide image filenames (matching PresentationView)
const slideImages = {
  'welcome-instructions': 'welcome-instructions.png',
  'intro-summary': 'intro-summary.png',
  'daw-summary': 'daw-summary.png',
  'daw-tutorial': 'daw-tutorial.png',
  'activity-summary': 'activity-summary.png',
  'school-summary': 'school-summary.png',
  'school-beneath': 'school-beneath.png',
  'reflection-summary': 'reflection-summary.png',
  'reflection': 'reflection.png',
  'conclusion': 'conclusion.png'
};

const Lesson1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionCode,
    getCurrentStage, 
    setCurrentStage,
    getStudents,
    getProgressStats,
    endSession,
    markActivityComplete,
    userRole: sessionRole
  } = useSession();
  
  // Session mode detection and permissions
  const sessionMode = useSessionMode();
  
  // Get effective role - use urlRole as fallback
  const effectiveRole = sessionRole || sessionMode.urlRole;
  
  // Debug logging
  console.log('📋 Lesson1 Render:', {
    isSessionMode: sessionMode.isSessionMode,
    sessionRole,
    effectiveRole,
    sessionCode,
    urlRole: sessionMode.urlRole,
    sessionInitialized: sessionMode.sessionInitialized
  });
  
  // Main lesson state (only used in non-session mode)
  const lessonConfig = { 
    ...lesson1Config, 
    progressKey: LESSON_PROGRESS_KEY, 
    timerKey: LESSON_TIMER_KEY 
  };
  const lesson = useLesson(lessonConfig);
  
  // Activity timers (used in session mode)
  const timers = useActivityTimers(sessionCode, getCurrentStage, lessonStages, effectiveRole);

  // Check for view modes from URL params
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewBonusMode = searchParams.get('view') === 'bonus';
  const viewReflectionMode = searchParams.get('view') === 'reflection';

  // Open presentation view in new window
  const openPresentationView = () => {
    const presentationUrl = `/presentation?session=${sessionCode}`;
    console.log('🎬 Opening presentation view:', presentationUrl);
    
    const popup = window.open(
      presentationUrl, 
      'PresentationView', 
      'width=1920,height=1080,menubar=no,toolbar=no,location=no'
    );
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      alert('Popup blocked! Please allow popups for this site and try again.');
      console.error('❌ Popup was blocked');
    } else {
      console.log('✅ Presentation view opened successfully');
    }
  };

  // Handle session activity completion
  const handleSessionActivityComplete = (activityId) => {
    if (sessionRole === 'student') {
      markActivityComplete(activityId, 'completed');
      console.log('Student marked activity complete:', activityId);
    }
  };

  // Get current stage for students
  const currentStage = sessionMode.isSessionMode && sessionRole === 'student' 
    ? getCurrentStage() 
    : null;

  // Show loading while session is initializing - only if we have NO role at all
  if (sessionMode.isSessionMode && !effectiveRole) {
    console.log('⏳ Waiting for session role to be set...');
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
    console.log('📱 Rendering STUDENT view');
    
    // Student waiting for teacher to start
    if (!currentStage || currentStage === 'locked') {
      return <StudentWaitingScreen />;
    }
    
    // Session has ended - redirect to join page
    if (currentStage === 'ended') {
      console.log('📤 Session ended, redirecting to join page');
      // Use a slight delay to ensure state updates complete
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
    
    // 📊 SUMMARY SLIDES: Students see "Watch the Main Screen" message
    const currentStageData = lessonStages.find(stage => stage.id === currentStage);
    if (currentStageData?.type === 'summary') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <div className="text-8xl mb-8 animate-pulse">🖥️</div>
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
        </div>
      );
    }
    
    // 🎬 VIDEO STAGES: Students see static slide (not the video)
    if (currentStageData?.type === 'video') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <div className="text-8xl mb-8 animate-pulse">🎬</div>
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">The video is playing on the projection screen</p>
        </div>
      );
    }
    
    // Student viewing active activity
    let activityType = getActivityForStage(currentStage);
    
    // ✅ CRITICAL FIX: Keep School Beneath mounted during reflection
    // The reflection modal will appear ON TOP of the composition
    // This prevents the composition from being unmounted and losing student work
    if (currentStage === 'reflection') {
      console.log('🎭 Reflection stage detected - keeping SchoolBeneathActivity mounted');
      activityType = 'school-beneath-activity';
    }
    
    const activity = lesson1Config.activities.find(a => a.type === activityType);
    
    if (!activity) {
      return <StudentWaitingScreen />;
    }
    
    return (
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
    );
  }

  // ========================================
  // SESSION MODE: TEACHER VIEW
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'teacher') {
    console.log('👨‍🏫 Rendering TEACHER control panel');
    return (
      <SessionTeacherPanel
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
        onOpenPresentation={openPresentationView}
      />
    );
  }

  // ========================================
  // NORMAL MODE: LESSON START SCREEN
  // ========================================
  if (!lesson.lessonStarted && !viewSavedMode && !viewBonusMode && !viewReflectionMode) {
    console.log('🎬 Rendering NORMAL lesson start screen');
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
  
  console.log('🎯 Rendering NORMAL active lesson');
  
  // Handle view modes (saved work, reflection, bonus)
  let activityToRender = lesson.currentActivityData;
  let onCompleteHandler = lesson.handleActivityComplete;
  let viewModeActive = false;
  
  if (viewSavedMode) {
    activityToRender = lesson1Config.activities.find(a => a.type === 'school-beneath-activity');
    viewModeActive = true;
  } else if (viewBonusMode) {
    activityToRender = lesson1Config.activities.find(a => a.type === 'school-beneath-activity');
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
              viewBonusMode={viewBonusMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson1;