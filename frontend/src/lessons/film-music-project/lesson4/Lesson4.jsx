// File: /src/lessons/film-music-project/lesson4/Lesson4.jsx
// Epic Wildlife - Nature Documentary Video - Main lesson orchestrator
// ✅ UPDATED: Renamed from "Chef's Soundtrack" to "Epic Wildlife"
// ✅ UPDATED: Added Sectional Loop Builder game routing
// ✅ FIXED: Uses currentStage directly from context (no render loop)

import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Gamepad2, Trophy, Globe } from 'lucide-react';

// Config
import { lesson4Config, lessonStages, getActivityForStage } from './Lesson4config';

// Hooks
import { useLesson } from '../../shared/hooks/useLesson';
import { useSessionMode } from '../../shared/hooks/useSessionMode';
import { useActivityTimers } from '../../shared/hooks/useActivityTimers';

// Components
import LessonStartScreen from '../../shared/components/LessonStartScreen';
import SessionTeacherPanel from '../../shared/components/SessionTeacherPanel';
import ActivityRenderer from '../../shared/components/ActivityRenderer';
import StudentWaitingScreen from '../../../components/StudentWaitingScreen';

const LESSON_PROGRESS_KEY = 'lesson4-progress';
const LESSON_TIMER_KEY = 'lesson4-timer';

// Store presentation windows by session code
const presentationWindows = new Map();

const Lesson4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionCode,
    currentStage,  // ✅ Use direct value instead of getCurrentStage()
    setCurrentStage,
    getStudents,
    getProgressStats,
    endSession,
    markActivityComplete,
    userRole: sessionRole,
    getCurrentStage  // Keep for hooks that need it
  } = useSession();
  
  // Session mode detection and permissions
  const sessionMode = useSessionMode();
  
  // Get effective role
  const effectiveRole = sessionRole || sessionMode.urlRole;
  
  // ✅ FIXED: Memoize lessonConfig to prevent new object reference each render
  const lessonConfig = useMemo(() => ({ 
    ...lesson4Config, 
    progressKey: LESSON_PROGRESS_KEY, 
    timerKey: LESSON_TIMER_KEY 
  }), []);
  
  const lesson = useLesson(lessonConfig);
  
  // Activity timers (used in session mode) - pass currentStage VALUE, not getter function
  const timers = useActivityTimers(sessionCode, currentStage, lessonStages);

  // Check for view modes from URL params
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewReflectionMode = searchParams.get('view') === 'reflection';

  // ✅ Memoize currentStageData
  const currentStageData = useMemo(() => {
    return lessonStages.find(stage => stage.id === currentStage);
  }, [currentStage]);

  // Open presentation view in new window
  const openPresentationView = useCallback(() => {
    if (!sessionCode) {
      console.error('❌ No session code available');
      return null;
    }

    const existingWindow = presentationWindows.get(sessionCode);
    
    if (existingWindow && !existingWindow.closed) {
      console.log('🔄 Presentation window already open, focusing...');
      try {
        existingWindow.focus();
        return existingWindow;
      } catch (e) {
        console.warn('⚠️ Could not focus window, opening new one:', e);
        presentationWindows.delete(sessionCode);
      }
    }

    const presentationUrl = `/presentation?session=${sessionCode}`;
    console.log('🖼️ Opening new presentation view:', presentationUrl);
    
    const popup = window.open(
      presentationUrl, 
      `PresentationView_${sessionCode}`,
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,scrollbars=yes,resizable=yes'
    );
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      alert('Popup blocked! Please allow popups for this site and try again.');
      console.error('❌ Popup was blocked');
      return null;
    }
    
    console.log('✅ Presentation view opened successfully');
    presentationWindows.set(sessionCode, popup);
    
    const checkInterval = setInterval(() => {
      if (popup.closed) {
        console.log('🔴 Presentation window was closed');
        presentationWindows.delete(sessionCode);
        clearInterval(checkInterval);
      }
    }, 1000);
    
    const handleBeforeUnload = () => {
      if (popup && !popup.closed) {
        popup.close();
      }
      presentationWindows.delete(sessionCode);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return popup;
  }, [sessionCode]);

  // Handle session activity completion
  const handleSessionActivityComplete = useCallback((activityId) => {
    if (sessionRole === 'student') {
      markActivityComplete(activityId, 'completed');
      console.log('Student marked activity complete:', activityId);
    }
  }, [sessionRole, markActivityComplete]);

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
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-white text-3xl font-bold mb-4">Session Has Ended</h1>
            <p className="text-gray-400 text-lg">Redirecting to join page...</p>
          </div>
        </div>
      );
    }
    
    // SUMMARY SLIDES: Students see "Watch the Main Screen" message
    if (currentStageData?.type === 'summary') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
          <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">Your teacher will provide instruction</p>
        </div>
      );
    }
    
    // CLASS DEMO: Students see "Watch the Main Screen" for whole-class activities
    if (currentStageData?.type === 'class-demo') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
          <Gamepad2 className="w-32 h-32 mb-8 animate-pulse text-green-400" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">Follow along with the class demo</p>
          <p className="text-xl text-teal-400 mt-4">You'll play the game individually next!</p>
        </div>
      );
    }
    
    // RESULTS: Students see "Watch the Main Screen" for game results
    if (currentStageData?.type === 'results') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
          <Trophy className="w-32 h-32 mb-8 animate-pulse text-yellow-400" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">Viewing game results and winners!</p>
        </div>
      );
    }
    
    // VIDEO STAGES: Students see static slide
    if (currentStageData?.type === 'video') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
          <Video className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">The video is playing on the projection screen</p>
        </div>
      );
    }
    
    // DISCUSSION/CONCLUSION STAGES: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'discussion' || currentStage === 'conclusion') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 text-white p-8">
          <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">Your teacher is leading a class discussion</p>
        </div>
      );
    }
    
    // Student viewing active activity
    const displayStage = currentStage === 'reflection' ? 'wildlife-composition' : currentStage;
    const activityType = getActivityForStage(displayStage);
    
    const activity = lesson4Config.activities.find(a => a.type === activityType);
    
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
        config={lesson4Config}
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
  if (!lesson.lessonStarted && !viewSavedMode && !viewReflectionMode) {
    return (
      <LessonStartScreen
        config={lesson4Config}
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
    activityToRender = lesson4Config.activities.find(a => a.type === 'wildlife-composition-activity');
    viewModeActive = true;
  } else if (viewReflectionMode) {
    activityToRender = lesson4Config.activities.find(a => a.type === 'two-stars-wish');
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

export default Lesson4;