// File: /lessons/film-music-project/lesson2/Lesson2.jsx
// Sports Highlight Reel Music - Main lesson orchestrator

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Gamepad2, Trophy } from 'lucide-react';

// Config
import { lesson2Config, lessonStages, getActivityForStage } from './Lesson2config';

// Hooks
import { useLesson } from '../../shared/hooks/useLesson';
import { useSessionMode } from '../../shared/hooks/useSessionMode';
import { useActivityTimers } from '../../shared/hooks/useActivityTimers';

// Components
import LessonStartScreen from '../../shared/components/LessonStartScreen';
import SessionTeacherPanel from '../../shared/components/SessionTeacherPanel';
import ActivityRenderer from '../../shared/components/ActivityRenderer';
import StudentWaitingScreen from '../../../components/StudentWaitingScreen';

const LESSON_PROGRESS_KEY = 'lesson2-progress';
const LESSON_TIMER_KEY = 'lesson2-timer';

// Store presentation windows by session code
const presentationWindows = new Map();

// Separate component for Layer Detective to avoid React hooks violations
const LayerDetectiveLoader = ({ onComplete }) => {
  const [LayerDetective, setLayerDetective] = React.useState(null);
  const [loadError, setLoadError] = React.useState(false);
  
  React.useEffect(() => {
    // Try to dynamically import the component
    import('../../shared/activities/layer-detective/LayerDetectiveActivity')
      .then(module => {
        console.log('✅ LayerDetectiveActivity loaded');
        setLayerDetective(() => module.default);
      })
      .catch(error => {
        console.error('❌ Failed to load LayerDetectiveActivity:', error);
        setLoadError(true);
      });
  }, []);
  
  if (loadError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-white p-8">
        <div className="text-8xl mb-8">⚠️</div>
        <h1 className="text-5xl font-bold mb-4">Component Not Found</h1>
        <p className="text-2xl mb-8">LayerDetectiveActivity.jsx is missing</p>
        <div className="bg-white/20 rounded-xl p-6 max-w-2xl backdrop-blur-sm text-left">
          <p className="text-lg mb-4">
            <strong>Teacher:</strong> Please add these files to your project:
          </p>
          <ol className="text-base opacity-90 space-y-2 list-decimal list-inside">
            <li>LayerDetectiveActivity.jsx</li>
            <li>loopData.js (for layer detective)</li>
            <li>NameThatLoopActivity.jsx</li>
          </ol>
          <p className="text-sm mt-4 opacity-75">
            Place at: <code className="bg-black/30 px-2 py-1 rounded">src/lessons/shared/activities/layer-detective/</code>
          </p>
        </div>
      </div>
    );
  }
  
  if (!LayerDetective) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading Layer Detective...</div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col">
      <LayerDetective
        onComplete={onComplete}
        viewMode={false}
      />
    </div>
  );
};

const Lesson2 = () => {
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
  
  // Get effective role
  const effectiveRole = sessionRole || sessionMode.urlRole;
  
  console.log('🏀 Lesson2 Render:', {
    isSessionMode: sessionMode.isSessionMode,
    sessionRole,
    effectiveRole,
    sessionCode,
    urlRole: sessionMode.urlRole,
    sessionInitialized: sessionMode.sessionInitialized
  });
  
  // Main lesson state (only used in non-session mode)
  const lessonConfig = { 
    ...lesson2Config, 
    progressKey: LESSON_PROGRESS_KEY, 
    timerKey: LESSON_TIMER_KEY 
  };
  const lesson = useLesson(lessonConfig);
  
  // Activity timers (used in session mode)
  const timers = useActivityTimers(sessionCode, getCurrentStage, lessonStages);

  // Check for view modes from URL params
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewReflectionMode = searchParams.get('view') === 'reflection';

  // Open presentation view in new window
  const openPresentationView = React.useCallback(() => {
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

  // Show loading while session is initializing
  if (sessionMode.isSessionMode && !effectiveRole) {
    console.log('⏳ Waiting for session role to be set...');
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
    console.log('👱 Rendering STUDENT view');
    
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
    const currentStageData = lessonStages.find(stage => stage.id === currentStage);
    if (currentStageData?.type === 'summary') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
          <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
        </div>
      );
    }
    
    // CLASS DEMO: Students see "Watch the Main Screen" for whole-class activities
    if (currentStageData?.type === 'class-demo') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 text-white p-8">
          <Gamepad2 className="w-32 h-32 mb-8 animate-pulse text-white" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">Follow along with the class demo</p>
          <p className="text-xl text-gray-400 mt-4">You'll play the game individually next!</p>
        </div>
      );
    }
    
    // RESULTS: Students see "Watch the Main Screen" for game results
    if (currentStageData?.type === 'results') {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 text-white p-8">
          <Trophy className="w-32 h-32 mb-8 animate-pulse text-yellow-400" />
          <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
          <p className="text-2xl text-gray-300">Viewing game results and scores</p>
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
    
    // DISCUSSION/CONCLUSION STAGES: Students see "Watch the Main Screen"
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
    const displayStage = currentStage === 'reflection' ? 'sports-composition' : currentStage;
    const activityType = getActivityForStage(displayStage);
    
    // Special case: Layer Detective activity - render separate component
    if (currentStage === 'layer-detective') {
      return <LayerDetectiveLoader onComplete={() => handleSessionActivityComplete(currentStage)} />;
    }
    
    const activity = lesson2Config.activities.find(a => a.type === activityType);
    
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
        config={lesson2Config}
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
    console.log('🖼️ Rendering NORMAL lesson start screen');
    return (
      <LessonStartScreen
        config={lesson2Config}
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
  
  console.log('🖯 Rendering NORMAL active lesson');
  
  // Handle view modes
  let activityToRender = lesson.currentActivityData;
  let onCompleteHandler = lesson.handleActivityComplete;
  let viewModeActive = false;
  
  if (viewSavedMode) {
    activityToRender = lesson2Config.activities.find(a => a.type === 'sports-composition-activity');
    viewModeActive = true;
  } else if (viewReflectionMode) {
    activityToRender = lesson2Config.activities.find(a => a.type === 'two-stars-wish');
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

export default Lesson2;