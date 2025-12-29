// File: /src/lessons/film-music-project/lesson2/Lesson2.jsx
// City Soundscapes - Main lesson orchestrator
// ✅ UPDATED: Uses TeacherLessonView for combined sidebar + presentation

import React, { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from "../../../context/SessionContext";
import { Monitor, Video, Gamepad2, Trophy } from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// Config
import { lesson2Config, lessonStages, getActivityForStage } from './Lesson2config';

// Hooks
import { useLesson } from '../../shared/hooks/useLesson';
import { useSessionMode } from '../../shared/hooks/useSessionMode';
import { useActivityTimers } from '../../shared/hooks/useActivityTimers';

// Components
import LessonStartScreen from '../../shared/components/LessonStartScreen';
import TeacherLessonView from '../../shared/components/TeacherLessonView'; // ✅ NEW
import ActivityRenderer from '../../shared/components/ActivityRenderer';
import StudentWaitingScreen from '../../../components/StudentWaitingScreen';
import TransitionOverlay from '../../shared/components/TransitionOverlay';

// Storage for viewing saved work
import { loadStudentWork } from '../../../utils/studentWorkStorage';

const LESSON_PROGRESS_KEY = 'lesson2-progress';
const LESSON_TIMER_KEY = 'lesson2-timer';

// Component to show student their own results
const StudentResultsBadge = ({ sessionCode, userId }) => {
  const [myData, setMyData] = React.useState(null);
  const [myRank, setMyRank] = React.useState(null);
  
  React.useEffect(() => {
    if (!sessionCode || !userId) return;
    
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}/studentsJoined`);
    
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const students = snapshot.val();
      if (!students) return;
      
      const myStudentData = students[userId];
      if (!myStudentData) return;
      
      setMyData({
        name: myStudentData.playerName || myStudentData.displayName || 'You',
        score: myStudentData.score || 0,
        playerColor: myStudentData.playerColor || '#3B82F6',
        playerEmoji: myStudentData.playerEmoji || '🎵'
      });
      
      const allStudents = Object.entries(students)
        .map(([id, data]) => ({ id, score: data.score || 0 }))
        .sort((a, b) => b.score - a.score);
      
      const rank = allStudents.findIndex(s => s.id === userId) + 1;
      setMyRank(rank);
    });
    
    return () => unsubscribe();
  }, [sessionCode, userId]);
  
  if (!myData) return null;
  
  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };
  
  const isTopThree = myRank && myRank <= 3;
  
  return (
    <div className="mt-8 animate-fadeIn">
      <div 
        className={`bg-gradient-to-r ${
          isTopThree 
            ? 'from-yellow-500/30 to-orange-500/30 border-yellow-400' 
            : 'from-white/10 to-white/5 border-white/20'
        } backdrop-blur-lg rounded-2xl p-6 border-2 shadow-2xl max-w-md mx-auto`}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{myData.playerEmoji}</div>
          <h3 className="text-2xl font-bold mb-1" style={{ color: myData.playerColor }}>
            {myData.name}
          </h3>
          <div className="text-sm text-gray-300">That's you!</div>
        </div>
        
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{getMedalEmoji(myRank)}</div>
            <div className="text-sm text-gray-300">
              {myRank === 1 ? '1st Place' : myRank === 2 ? '2nd Place' : myRank === 3 ? '3rd Place' : `${myRank}th Place`}
            </div>
          </div>
          
          <div className="h-16 w-px bg-white/20"></div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-1">{myData.score}</div>
            <div className="text-sm text-gray-300">Points</div>
          </div>
        </div>
        
        {isTopThree && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-1 bg-yellow-500/20 px-4 py-2 rounded-full">
              <span className="text-yellow-400 font-bold">🌟 Top 3 Finisher!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Listening Map Loader
const ListeningMapLoader = ({ onComplete, onBack, isSessionMode = false }) => {
  const [ListeningMap, setListeningMap] = React.useState(null);
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    import('../../shared/activities/texture-drawings/ListeningMapActivity')
      .then(module => {
        console.log('✅ ListeningMapActivity loaded');
        setListeningMap(() => module.default);
      })
      .catch(error => {
        console.error('❌ Failed to load ListeningMapActivity:', error);
        setLoadError(true);
      });
  }, []);

  if (loadError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-8">
        <div className="text-8xl mb-8">⚠️</div>
        <h1 className="text-5xl font-bold mb-4">Component Not Found</h1>
        <p className="text-2xl mb-8">ListeningMapActivity.jsx is missing</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
          >
            ← Back to Join Page
          </button>
        )}
      </div>
    );
  }

  if (!ListeningMap) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️🎵</div>
          <div className="text-white text-xl font-bold">Loading Listening Map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ListeningMap onComplete={onComplete} isSessionMode={isSessionMode} />
    </div>
  );
};

// Wrapper component to handle view mode BEFORE any session hooks run
const Lesson2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const viewListeningMapMode = searchParams.get('view') === 'listening-map';

  if (viewListeningMapMode) {
    return (
      <ListeningMapLoader
        onComplete={() => navigate('/join')}
        onBack={() => navigate('/join')}
      />
    );
  }

  return <Lesson2Content />;
};

// The actual lesson content with all session hooks
const Lesson2Content = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    sessionCode, 
    userId, 
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
  
  // Check URL for view modes
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewReflectionMode = searchParams.get('view') === 'reflection';
  
  // Custom hooks
  const lesson = useLesson(lesson2Config, LESSON_PROGRESS_KEY, LESSON_TIMER_KEY);
  const isTeacher = effectiveRole === 'teacher';
  const timers = useActivityTimers(sessionCode, currentStage, lessonStages, isTeacher);

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
            <div className="text-6xl mb-4">✔</div>
            <h1 className="text-white text-3xl font-bold mb-4">Session Has Ended</h1>
            <p className="text-gray-400 text-lg">Redirecting to join page...</p>
          </div>
        </div>
      );
    }
    
    // SUMMARY SLIDES: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'summary') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">Your teacher will provide instruction</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // CLASS DEMO: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'class-demo') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 text-white p-8">
            <Gamepad2 className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-300">Follow along with the class demo</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // VIDEO STAGES: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'video') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
            <Video className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">The video is playing on the projection screen</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // RESULTS: Students see results
    if (currentStageData?.type === 'results') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 text-white p-8">
            <Trophy className="w-32 h-32 mb-8 animate-pulse text-yellow-400" />
            <h1 className="text-5xl font-bold mb-4">Great Job!</h1>
            <p className="text-2xl text-gray-300">Check the main screen to see final scores!</p>
            {sessionCode && userId && (
              <StudentResultsBadge sessionCode={sessionCode} userId={userId} />
            )}
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // DISCUSSION/CONCLUSION: Students see "Watch the Main Screen"
    if (currentStageData?.type === 'discussion' || currentStage === 'conclusion') {
      return (
        <>
          <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8">
            <Monitor className="w-32 h-32 mb-8 animate-pulse text-white" />
            <h1 className="text-5xl font-bold mb-4">Watch the Main Screen</h1>
            <p className="text-2xl text-gray-400">Your teacher is leading a class discussion</p>
          </div>
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }
    
    // Listening Map activity
    if (currentStage === 'listening-map' || currentStage === 'texture-drawings') {
      return (
        <>
          <ListeningMapLoader onComplete={() => handleSessionActivityComplete(currentStage)} isSessionMode={true} />
          <TransitionOverlay isVisible={showTransition} />
        </>
      );
    }

    // Standard activity rendering
    const displayStage = currentStage === 'reflection' ? 'city-composition' : currentStage;
    const activityType = getActivityForStage(displayStage);

    const activity = lesson2Config.activities.find(a => a.type === activityType);

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
  // ✅ NOW USES TeacherLessonView
  // ========================================
  if (sessionMode.isSessionMode && effectiveRole === 'teacher') {
    console.log('👨‍🏫 Rendering TEACHER lesson view');
    return (
      <TeacherLessonView
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
      />
    );
  }

  // ========================================
  // NORMAL MODE: LESSON START SCREEN
  // ========================================
  if (!lesson.lessonStarted && !viewSavedMode && !viewReflectionMode) {
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
  
  let activityToRender = lesson.currentActivityData;
  let onCompleteHandler = lesson.handleActivityComplete;
  let viewModeActive = false;
  
  if (viewSavedMode) {
    activityToRender = lesson2Config.activities.find(a => a.type === 'city-composition-activity');
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