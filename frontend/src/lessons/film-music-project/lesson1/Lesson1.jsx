// File: /src/lessons/film-music-project/lesson1/Lesson1.jsx
// Complete lesson with navigation tools for teachers and lesson timer
// UPDATED: Now supports Nearpod-style session mode

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Play, CheckCircle, X, Menu, SkipForward, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useSession } from '../../../context/SessionContext';
import VideoPlayer from '../../components/activities/video/VideoPlayer';
import DAWTutorialActivity from './activities/daw-tutorial/DAWTutorialActivity';
import SchoolBeneathActivity from './activities/SchoolBeneathActivity';
import TwoStarsAndAWishActivity from './activities/two-stars-and-a-wish/TwoStarsAndAWishActivity';
import SoundEffectsActivity from './activities/SoundEffectsActivity';
import TeacherControlPanel from '../../../components/TeacherControlPanel';
import StudentWaitingScreen from '../../../components/StudentWaitingScreen';

const LESSON_PROGRESS_KEY = 'lesson1-progress';
const LESSON_TIMER_KEY = 'lesson1-timer';

const Lesson1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    startSession, 
    joinSession, 
    getCurrentStage, 
    setCurrentStage,
    getStudents,
    getProgressStats,
    endSession,
    markActivityComplete,
    isInSession,
    userRole: sessionRole,
    sessionCode
  } = useSession();
  
  const [currentActivity, setCurrentActivity] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState({});
  const [showNavigation, setShowNavigation] = useState(true);
  const [savedProgress, setSavedProgress] = useState(null);
  const [navToolsEnabled, setNavToolsEnabled] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState(null);
  const [sessionMode, setSessionMode] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  
  // Individual activity timers
  const [activityTimers, setActivityTimers] = useState({
    'daw-tutorial': { preset: 5, current: 0, isRunning: false },
    'school-beneath': { preset: 10, current: 0, isRunning: false },
    'reflection': { preset: 5, current: 0, isRunning: false }
  });

  // Check if viewing saved work or reflection
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewBonusMode = searchParams.get('view') === 'bonus';
  const viewReflectionMode = searchParams.get('view') === 'reflection';
  
  // Session mode detection
  const urlSessionCode = searchParams.get('session');
  const urlRole = searchParams.get('role');
  const isSessionMode = !!(urlSessionCode && urlRole);

  // Determine if user can access navigation tools
  const isDevelopment = import.meta.env.DEV;
  const isClassroomUser = localStorage.getItem('classroom-logged-in') === 'true';
  const classroomRole = localStorage.getItem('classroom-user-role');
  const isTeacher = user?.role === 'teacher' || classroomRole === 'teacher';
  
  // Navigation tools available for:
  // - Teachers (always, in any mode)
  // - Development environment (always, for debugging)
  // NOT available for students in production
  const canAccessNavTools = isTeacher || isDevelopment;
  
  // Initialize session on mount if session params exist
  useEffect(() => {
    if (isSessionMode && !sessionInitialized) {
      console.log('Session mode detected:', { urlSessionCode, urlRole });
      
      if (urlRole === 'teacher') {
        startSession(urlSessionCode, 'teacher');
        console.log('Teacher session started:', urlSessionCode);
      } else if (urlRole === 'student') {
        const studentId = localStorage.getItem('classroom-user-id') || 'student-' + Date.now();
        const studentName = localStorage.getItem('classroom-username') || 'Student';
        joinSession(urlSessionCode, studentId, studentName);
        console.log('Student joining session:', { urlSessionCode, studentId, studentName });
      }
      
      setSessionMode(true);
      setSessionInitialized(true);
    }
  }, [isSessionMode, sessionInitialized, urlSessionCode, urlRole, startSession, joinSession]);

  // COMPLETE LESSON CONFIGURATION
  const lesson1Config = {
    title: "Introduction to the Digital Audio Workstation",
    learningObjectives: [
      "Master the DAW interface and basic controls",
      "Practice placing and manipulating music loops",
      "Create a mysterious film score using layering techniques"
    ],
    activities: [
      {
        id: 1,
        type: "video",
        title: "Lesson Introduction",
        estimatedTime: "3 min",
        src: "/lessons/film-music-project/lesson1/Lesson1intro.mp4"
      },
      {
        id: 2,
        type: "daw-tutorial",
        title: "DAW Basics Interactive Tutorial",
        estimatedTime: "5 min"
      },
      {
        id: 3,
        type: "video",
        title: "Activity Introduction",
        estimatedTime: "2 min",
        src: "/lessons/film-music-project/lesson1/Lesson1activityintro.mp4"
      },
      {
        id: 4,
        type: "school-beneath-activity",
        title: "The School Beneath",
        estimatedTime: "10 min"
      },
      {
        id: 5,
        type: "two-stars-wish",
        title: "Reflection Activity",
        estimatedTime: "5 min"
      },
      {
        id: 6,
        type: "sound-effects",
        title: "Bonus: Add Sound Effects",
        estimatedTime: "Remaining time"
      }
    ]
  };
  
  // Session stages for TeacherControlPanel
  const lessonStages = [
    { 
      id: 'locked', 
      label: 'Join with Class Code', 
      description: 'Students enter session code',
      type: 'waiting'
    },
    { 
      id: 'intro-video', 
      label: 'Start Introduction Video', 
      description: 'Lesson intro video', 
      hasProgress: false,
      type: 'video',
      duration: '3:00'
    },
    { 
      id: 'daw-tutorial', 
      label: 'Unlock DAW Tutorial', 
      description: 'Interactive DAW basics', 
      hasProgress: true,
      type: 'activity',
      recommendedMinutes: 5
    },
    { 
      id: 'activity-intro', 
      label: 'Activity Introduction Video', 
      description: 'Activity introduction video', 
      hasProgress: false,
      type: 'video',
      duration: '2:00'
    },
    { 
      id: 'school-beneath', 
      label: 'Unlock School Beneath', 
      description: 'The School Beneath composition', 
      hasProgress: true,
      type: 'activity',
      recommendedMinutes: 10
    },
    { 
      id: 'reflection', 
      label: 'Unlock Reflection', 
      description: 'Two Stars and a Wish', 
      hasProgress: true,
      type: 'activity',
      recommendedMinutes: 5
    },
    { 
      id: 'sound-effects', 
      label: 'Unlock Bonus: Sound Effects', 
      description: 'Add sound effects', 
      hasProgress: true,
      type: 'bonus'
    }
  ];

  // Load saved progress on mount
  useEffect(() => {
    if (viewSavedMode) {
      setCurrentActivity(3);
      setLessonStarted(true);
      return;
    }

    if (viewBonusMode) {
      setCurrentActivity(3);
      setLessonStarted(true);
      return;
    }

    if (viewReflectionMode) {
      setCurrentActivity(4);
      setLessonStarted(true);
      return;
    }

    try {
      const saved = localStorage.getItem(LESSON_PROGRESS_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        setSavedProgress(progress);
      }

      // Load saved timer
      const savedTimer = localStorage.getItem(LESSON_TIMER_KEY);
      if (savedTimer) {
        const timerData = JSON.parse(savedTimer);
        setLessonStartTime(timerData.startTime);
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  }, [viewSavedMode, viewReflectionMode]);

  // Save progress automatically
  const saveProgress = useCallback(() => {
    if (!viewSavedMode && !viewReflectionMode) {
      const progress = {
        currentActivity,
        activityCompleted,
        lessonStarted,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress));

      // Save timer
      if (lessonStartTime) {
        const timerData = {
          startTime: lessonStartTime,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(LESSON_TIMER_KEY, JSON.stringify(timerData));
      }
    }
  }, [currentActivity, activityCompleted, lessonStarted, lessonStartTime, viewSavedMode, viewReflectionMode]);

  // Auto-save progress
  useEffect(() => {
    if (lessonStarted && !viewSavedMode && !viewReflectionMode) {
      saveProgress();
    }
  }, [currentActivity, activityCompleted, lessonStarted, lessonStartTime, saveProgress, viewSavedMode, viewReflectionMode]);

  const handleBackNavigation = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user?.role === 'teacher') {
      navigate('/teacher#assignments');
    } else if (user?.role === 'student') {
      navigate('/student#assignments');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const handleDashboardNavigation = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user?.role === 'teacher') {
      navigate('/teacher');
    } else if (user?.role === 'student') {
      navigate('/student');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  // Open presentation view in new window for projection
  const openPresentationView = () => {
    const presentationUrl = `/presentation?session=${sessionCode}`;
    console.log('🎬 Opening presentation view:', presentationUrl);
    
    const popup = window.open(presentationUrl, 'PresentationView', 'width=1920,height=1080,menubar=no,toolbar=no,location=no');
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      alert('Popup blocked! Please allow popups for this site and try again.');
      console.error('❌ Popup was blocked');
    } else {
      console.log('✅ Presentation view opened successfully');
    }
  };

  const handleActivityComplete = useCallback(() => {
    console.log('Activity complete, moving to next activity');
    
    setActivityCompleted(prev => ({
      ...prev,
      [currentActivity]: true
    }));

    if (currentActivity < lesson1Config.activities.length - 1) {
      setCurrentActivity(prev => prev + 1);
    } else {
      localStorage.removeItem(LESSON_PROGRESS_KEY);
      localStorage.removeItem(LESSON_TIMER_KEY);
      console.log('Lesson completed - progress cleared');
    }
  }, [currentActivity, lesson1Config.activities.length]);

  const startLesson = useCallback(() => {
    const startTime = Date.now();
    setLessonStartTime(startTime);
    setLessonStarted(true);
    setSavedProgress(null);
    console.log('Lesson started at:', new Date(startTime).toISOString());
  }, []);

  const resumeLesson = useCallback(() => {
    if (savedProgress) {
      setCurrentActivity(savedProgress.currentActivity);
      setActivityCompleted(savedProgress.activityCompleted);
      setLessonStarted(true);
      setSavedProgress(null);
      console.log('Resuming lesson from activity:', savedProgress.currentActivity + 1);
      
      // If no start time saved, start timer now
      if (!lessonStartTime) {
        const startTime = Date.now();
        setLessonStartTime(startTime);
        console.log('Timer started on resume at:', new Date(startTime).toISOString());
      }
    }
  }, [savedProgress, lessonStartTime]);

  const startOver = useCallback(() => {
    localStorage.removeItem(LESSON_PROGRESS_KEY);
    localStorage.removeItem(LESSON_TIMER_KEY);
    setCurrentActivity(0);
    setActivityCompleted({});
    setLessonStarted(true);
    setSavedProgress(null);
    const startTime = Date.now();
    setLessonStartTime(startTime);
    console.log('Starting lesson over from beginning at:', new Date(startTime).toISOString());
  }, []);

  const toggleNavigation = useCallback(() => {
    setShowNavigation(prev => !prev);
  }, []);

  // Skip to specific activity (for navigation tools in Lesson1)
  const skipToActivity = useCallback((index) => {
    if (index < 0 || index >= lesson1Config.activities.length) return;
    console.log('Skipping to activity:', index);
    setCurrentActivity(index);
    if (!lessonStarted) {
      setLessonStarted(true);
      const startTime = Date.now();
      setLessonStartTime(startTime);
    }
  }, [lessonStarted, lesson1Config.activities.length]);

  // Skip to next activity
  const skipNext = useCallback(() => {
    if (currentActivity < lesson1Config.activities.length - 1) {
      skipToActivity(currentActivity + 1);
    }
  }, [currentActivity, skipToActivity, lesson1Config.activities.length]);

  // Timer format helper
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Activity Timer Controls
  const adjustPresetTime = useCallback((activityId, delta) => {
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        preset: Math.max(1, Math.min(60, prev[activityId].preset + delta))
      }
    }));
  }, []);

  const startActivityTimer = useCallback((activityId) => {
    const preset = activityTimers[activityId].preset;
    const seconds = preset * 60;
    
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        current: seconds,
        isRunning: true
      }
    }));

    // Update Firebase
    if (sessionCode) {
      import('firebase/database').then(({ getDatabase, ref, set: firebaseSet }) => {
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        firebaseSet(sessionRef, {
          currentStage: getCurrentStage ? getCurrentStage() : 'locked',
          countdownTime: seconds,
          timestamp: Date.now()
        });
      });
    }
  }, [activityTimers, sessionCode, getCurrentStage]);

  const pauseActivityTimer = useCallback((activityId) => {
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        isRunning: false
      }
    }));
  }, []);

  const resumeActivityTimer = useCallback((activityId) => {
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        isRunning: true
      }
    }));
  }, []);

  const resetActivityTimer = useCallback((activityId) => {
    setActivityTimers(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        current: 0,
        isRunning: false
      }
    }));

    // Update Firebase to clear timer
    if (sessionCode) {
      import('firebase/database').then(({ getDatabase, ref, set: firebaseSet }) => {
        const db = getDatabase();
        const sessionRef = ref(db, `sessions/${sessionCode}`);
        
        firebaseSet(sessionRef, {
          currentStage: getCurrentStage ? getCurrentStage() : 'locked',
          countdownTime: 0,
          timestamp: Date.now()
        });
      });
    }
  }, [sessionCode, getCurrentStage]);

  // Activity timer countdown effect
  useEffect(() => {
    const intervals = [];
    
    Object.keys(activityTimers).forEach(activityId => {
      const timer = activityTimers[activityId];
      
      if (timer.isRunning && timer.current > 0) {
        const interval = setInterval(() => {
          setActivityTimers(prev => {
            const newCurrent = prev[activityId].current - 1;
            
            // Time's up!
            if (newCurrent <= 0) {
              // Show alert
              setTimeout(() => {
                alert(`⏰ Time's Up for ${activityId}! Students can continue working.`);
              }, 100);
              
              // Play notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Time\'s Up!', {
                  body: `${activityId} timer has finished.`
                });
              }
              
              return {
                ...prev,
                [activityId]: {
                  ...prev[activityId],
                  current: 0,
                  isRunning: false
                }
              };
            }
            
            // Update Firebase
            if (sessionCode) {
              import('firebase/database').then(({ getDatabase, ref, set: firebaseSet }) => {
                const db = getDatabase();
                const sessionRef = ref(db, `sessions/${sessionCode}`);
                
                firebaseSet(sessionRef, {
                  currentStage: getCurrentStage ? getCurrentStage() : 'locked',
                  countdownTime: newCurrent,
                  timestamp: Date.now()
                });
              });
            }
            
            return {
              ...prev,
              [activityId]: {
                ...prev[activityId],
                current: newCurrent
              }
            };
          });
        }, 1000);
        
        intervals.push(interval);
      }
    });
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [activityTimers, sessionCode, getCurrentStage]);

  // Auto-start timer when activity stage is unlocked
  useEffect(() => {
    if (!getCurrentStage) return;
    
    const currentStageId = getCurrentStage();
    const currentStageData = lessonStages.find(s => s.id === currentStageId);
    
    // If this is an activity stage with a recommended time, auto-start the timer
    if (currentStageData?.type === 'activity' && currentStageData.recommendedMinutes) {
      const timer = activityTimers[currentStageId];
      
      // Only auto-start if timer hasn't been started yet (current is 0 and not running)
      if (timer && timer.current === 0 && !timer.isRunning) {
        console.log('Auto-starting timer for', currentStageId);
        startActivityTimer(currentStageId);
      }
    }
  }, [getCurrentStage, lessonStages, activityTimers, startActivityTimer]);

  const currentActivityData = lesson1Config.activities[currentActivity];
  const isLessonComplete = currentActivity >= lesson1Config.activities.length;
  const progressPercent = ((currentActivity + 1) / lesson1Config.activities.length) * 100;
  
  // Helper function: Map session stage to activity type
  const getActivityForStage = (stage) => {
    const stageMap = {
      'intro-video': 'video',
      'daw-tutorial': 'daw-tutorial',
      'activity-intro': 'video',
      'school-beneath': 'school-beneath-activity',
      'reflection': 'two-stars-wish',
      'sound-effects': 'sound-effects'
    };
    return stageMap[stage];
  };
  
  // Helper function: Get current stage for students
  const currentStage = isSessionMode && sessionRole === 'student' ? getCurrentStage() : null;
  
  // Helper function: Determine what student should see
  const getStudentView = () => {
    if (!currentStage || currentStage === 'locked') {
      return 'locked';
    }
    return getActivityForStage(currentStage);
  };
  
  // Helper: Handle activity completion in session mode
  const handleSessionActivityComplete = useCallback((activityId) => {
    if (sessionRole === 'student') {
      markActivityComplete(activityId, 'completed');
      console.log('Student marked activity complete:', activityId);
    }
  }, [sessionRole, markActivityComplete]);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* SESSION MODE: Student View */}
      {isSessionMode && sessionRole === 'student' && (
        <>
          {getStudentView() === 'locked' ? (
            <StudentWaitingScreen />
          ) : (
            <div className="h-screen flex flex-col">
              {/* Render ONLY the current unlocked activity */}
              <div className="flex-1 overflow-hidden">
                {/* STUDENTS SKIP INTRO VIDEO - Teacher plays on projector */}
                
                {getStudentView() === 'daw-tutorial' && (
                  <DAWTutorialActivity 
                    onComplete={() => handleSessionActivityComplete('daw-tutorial')}
                    navToolsEnabled={false}
                    canAccessNavTools={false}
                    lessonStartTime={lessonStartTime}
                  />
                )}
                
                {/* STUDENTS SKIP ACTIVITY INTRO VIDEO - Teacher plays on projector */}
                
                {getStudentView() === 'school-beneath-activity' && (
                  <SchoolBeneathActivity 
                    onComplete={() => handleSessionActivityComplete('school-beneath')}
                    viewMode={false}
                    lessonStartTime={lessonStartTime}
                  />
                )}
                
                {getStudentView() === 'two-stars-wish' && (
                  <TwoStarsAndAWishActivity 
                    onComplete={() => handleSessionActivityComplete('reflection')}
                    viewMode={false}
                  />
                )}
                
                {getStudentView() === 'sound-effects' && (
                  <SoundEffectsActivity 
                    onComplete={() => handleSessionActivityComplete('sound-effects')}
                    viewMode={false}
                    lessonStartTime={lessonStartTime}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* SESSION MODE: Teacher View - Clean Control Panel Only */}
      {isSessionMode && sessionRole === 'teacher' && (
        <div className="h-screen flex flex-col bg-gray-100">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson1Config.title}</h1>
              <p className="text-sm text-gray-600 mb-4">Teacher Control Panel • Session: {sessionCode}</p>
              <button
                onClick={openPresentationView}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl inline-flex items-center space-x-3 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Open Presentation View</span>
              </button>
            </div>
          </div>

          {/* Control Panel Content - Inline (Not Floating Modal) */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Session Info Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Session Information</h2>
                    <p className="text-sm text-gray-600 mt-1">Control your live lesson from here</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Session Code</div>
                    <div className="text-3xl font-black text-blue-600 tracking-wider font-mono">{sessionCode}</div>
                  </div>
                </div>
                
                {/* Students Joined */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Students Joined</span>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {getCurrentStage ? (getStudents ? getStudents().length : 0) : 0}
                    </span>
                  </div>
                  {getCurrentStage && getStudents && getStudents().length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-2">Waiting for students to join...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getCurrentStage && getStudents && getStudents().map(student => (
                        <span key={student.id} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-blue-200">
                          {student.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Control Panel - Redesigned with Inline Timers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Lesson Control</h2>
                
                <div className="space-y-3">
                  {lessonStages.map((stage, index) => {
                    const isCurrent = getCurrentStage && stage.id === getCurrentStage();
                    const currentStageIndex = getCurrentStage ? lessonStages.findIndex(s => s.id === getCurrentStage()) : -1;
                    const isPast = index < currentStageIndex;
                    const timer = activityTimers[stage.id];

                    return (
                      <div key={stage.id} className="relative">
                        <div className={`
                          w-full p-4 rounded-lg transition-all flex items-center justify-between
                          ${isCurrent 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                            : isPast 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-white border-2 border-gray-200'
                          }
                        `}>
                          {/* Left Side: Stage Info and Button */}
                          <button
                            onClick={() => setCurrentStage && setCurrentStage(stage.id)}
                            disabled={isCurrent}
                            className={`flex items-center gap-3 flex-1 text-left ${isCurrent ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {/* Number/Icon */}
                            <div className={`
                              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                              ${isCurrent 
                                ? 'bg-white text-blue-600' 
                                : isPast 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-gray-100 text-gray-400'
                              }
                            `}>
                              {isCurrent ? '▶' : isPast ? '✓' : index + 1}
                            </div>
                            
                            {/* Label */}
                            <div className="flex-1">
                              <div className="font-semibold">{stage.label}</div>
                              {stage.description && (
                                <div className={`text-xs mt-0.5 ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {stage.description}
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Right Side: Timer Controls */}
                          <div className="flex items-center gap-2 ml-4">
                            {/* Video Duration (Static) */}
                            {stage.type === 'video' && (
                              <div className={`text-sm font-mono ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                                Duration: {stage.duration}
                              </div>
                            )}

                            {/* Activity Timer Controls */}
                            {stage.type === 'activity' && timer && (
                              <div className="flex items-center gap-2">
                                {!timer.isRunning && timer.current === 0 ? (
                                  // Before starting
                                  <>
                                    <button
                                      onClick={() => adjustPresetTime(stage.id, -1)}
                                      className={`w-7 h-7 rounded flex items-center justify-center font-bold ${
                                        isCurrent ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                      }`}
                                    >
                                      −
                                    </button>
                                    <div className={`w-16 text-center font-mono font-bold ${
                                      isCurrent ? 'text-white' : 'text-gray-800'
                                    }`}>
                                      {timer.preset}:00
                                    </div>
                                    <button
                                      onClick={() => adjustPresetTime(stage.id, 1)}
                                      className={`w-7 h-7 rounded flex items-center justify-center font-bold ${
                                        isCurrent ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                      }`}
                                    >
                                      +
                                    </button>
                                    <button
                                      onClick={() => startActivityTimer(stage.id)}
                                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded font-semibold text-sm transition-all"
                                    >
                                      Start Timer
                                    </button>
                                  </>
                                ) : timer.isRunning ? (
                                  // Timer running
                                  <>
                                    <div className={`w-20 text-center font-mono font-bold text-lg ${
                                      timer.current <= 60 ? 'text-red-400 animate-pulse' : isCurrent ? 'text-white' : 'text-blue-600'
                                    }`}>
                                      {formatTime(timer.current)}
                                    </div>
                                    <button
                                      onClick={() => pauseActivityTimer(stage.id)}
                                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded font-semibold text-sm transition-all"
                                    >
                                      Pause
                                    </button>
                                    <button
                                      onClick={() => resetActivityTimer(stage.id)}
                                      className={`px-3 py-1.5 rounded font-semibold text-sm transition-all ${
                                        isCurrent ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                      }`}
                                    >
                                      Reset
                                    </button>
                                  </>
                                ) : (
                                  // Paused or finished
                                  <>
                                    <div className={`w-20 text-center font-mono font-bold text-lg ${
                                      timer.current === 0 ? 'text-red-500' : isCurrent ? 'text-white' : 'text-blue-600'
                                    }`}>
                                      {formatTime(timer.current)}
                                    </div>
                                    {timer.current > 0 && (
                                      <button
                                        onClick={() => resumeActivityTimer(stage.id)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded font-semibold text-sm transition-all"
                                      >
                                        Resume
                                      </button>
                                    )}
                                    <button
                                      onClick={() => resetActivityTimer(stage.id)}
                                      className={`px-3 py-1.5 rounded font-semibold text-sm transition-all ${
                                        isCurrent ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                      }`}
                                    >
                                      Reset
                                    </button>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Bonus/No Timer */}
                            {stage.type === 'bonus' && (
                              <div className={`text-sm italic ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                                No time limit
                              </div>
                            )}

                            {/* Waiting Screen */}
                            {stage.type === 'waiting' && isCurrent && (
                              <div className="text-sm font-mono bg-white/20 px-3 py-1 rounded text-white">
                                Code: {sessionCode}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Stats */}
                        {isCurrent && stage.hasProgress && getProgressStats && (
                          <div className="mt-2 ml-11 bg-blue-50 rounded-lg p-3 text-sm">
                            {(() => {
                              const stats = getProgressStats(stage.id.replace('-unlocked', ''));
                              return stats ? (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-700">
                                    Progress: <strong className="text-blue-600">{stats.completed}/{stats.total}</strong> completed
                                  </span>
                                  {stats.working > 0 && (
                                    <span className="text-blue-600 text-xs">
                                      {stats.working} currently working
                                    </span>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* End Session Button */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to end this session? All students will be disconnected.')) {
                        endSession && endSession();
                        window.location.href = '/';
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    🔚 End Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* NON-SESSION MODE: Normal lesson flow - only show if NOT in session mode */}
      {!isSessionMode && (
        <>
      {/* Navigation Tools Toggle - Only for Teachers or Dev Mode */}
      {canAccessNavTools && lessonStarted && !viewSavedMode && !viewReflectionMode && (
        <button 
          onClick={() => setNavToolsEnabled(!navToolsEnabled)}
          className="fixed top-20 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          {navToolsEnabled ? 'Hide Navigation Tools' : 'Show Navigation Tools'}
        </button>
      )}

      {/* Navigation Tools Panel - Only for Lesson-Level Activities */}
      {navToolsEnabled && canAccessNavTools && lessonStarted && !viewSavedMode && !viewReflectionMode && currentActivityData?.type !== 'daw-tutorial' && (
        <div className="fixed top-32 right-4 z-50">
          <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-3 shadow-xl max-w-xs">
            <div className="text-blue-400 text-xs font-mono mb-2 font-bold">LESSON NAVIGATION</div>
            
            {/* Activity Navigator */}
            <div className="mb-3">
              <div className="text-gray-300 text-xs mb-2 font-semibold">Jump to Activity:</div>
              <div className="space-y-1">
                {lesson1Config.activities.map((activity, index) => (
                  <button
                    key={index}
                    onClick={() => skipToActivity(index)}
                    className={`w-full text-left text-xs px-3 py-2 rounded transition-colors ${
                      currentActivity === index
                        ? 'bg-purple-600 text-white font-bold'
                        : activityCompleted[index]
                        ? 'bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-semibold">{index + 1}. {activity.title}</div>
                    <div className="text-xs opacity-75">{activity.type}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-1">
              <button
                onClick={skipNext}
                disabled={currentActivity >= lesson1Config.activities.length - 1}
                className="w-full bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <SkipForward size={14} />
                Skip to Next Activity
              </button>
              <button
                onClick={() => skipToActivity(3)}
                className="w-full bg-green-600 text-white text-xs px-3 py-2 rounded hover:bg-green-700 transition-colors font-semibold"
              >
                Jump to School Beneath Activity
              </button>
              <button
                onClick={() => skipToActivity(4)}
                className="w-full bg-purple-600 text-white text-xs px-3 py-2 rounded hover:bg-purple-700 transition-colors font-semibold"
              >
                Jump to Reflection Activity
              </button>
            </div>
            
            {/* Current Status */}
            <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 font-mono">
              <div>Activity: {currentActivity + 1}/{lesson1Config.activities.length}</div>
              <div>Type: {currentActivityData?.type}</div>
              <div>Completed: {Object.keys(activityCompleted).length}</div>
              <div className="text-purple-400 mt-1 truncate" title={currentActivityData?.title}>
                {currentActivityData?.title}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Single-Line Navigation Header */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showNavigation ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-black/80 backdrop-blur-sm border-b border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between gap-4 max-w-full">
            {/* Left Section: Back Button */}
            <button
              onClick={handleBackNavigation}
              className="flex items-center text-white hover:text-gray-300 transition-colors group flex-shrink-0"
            >
              <ArrowLeft size={18} className="mr-1.5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Current Activity Title */}
            <div className="text-sm text-white font-medium flex-shrink-0">
              {viewSavedMode ? 'Viewing Saved Work' : 
               viewReflectionMode ? 'Viewing Reflection' : 
               currentActivityData ? currentActivityData.title : ''}
            </div>

            {/* Progress Bar - Grows to fill available space */}
            {!viewSavedMode && !viewReflectionMode && (
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Activity Counter */}
            {!viewSavedMode && !viewReflectionMode && (
              <div className="text-sm text-gray-300 flex-shrink-0">
                Activity {currentActivity + 1} of {lesson1Config.activities.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Show Navigation Toggle */}
      {!showNavigation && (
        <button
          onClick={toggleNavigation}
          className="fixed top-4 left-4 z-50 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content */}
      <div className={`h-screen flex flex-col ${showNavigation ? 'pt-10' : 'pt-0'} transition-all duration-300`}>
        {!lessonStarted ? (
          // Lesson Start/Resume Screen
          <div className="flex-1 flex items-start justify-center pt-12 p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            <div className="bg-white rounded-xl shadow-2xl p-5 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
              {/* Header - Centered Title */}
              <div className="mb-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson1Config.title}</h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-4"></div>
                
                {/* Start/Resume Buttons - Centered Under Title */}
                <div className="space-y-2.5 max-w-sm mx-auto">
                  {savedProgress ? (
                    <>
                      <button 
                        onClick={resumeLesson}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-base font-semibold inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl w-full"
                      >
                        <RotateCcw size={20} />
                        <span>Resume Lesson</span>
                      </button>
                      <button 
                        onClick={startOver}
                        className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium inline-flex items-center justify-center space-x-2 border-2 border-gray-200 hover:border-gray-300 w-full"
                      >
                        <Play size={16} />
                        <span>Start Over</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={startLesson}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-base font-semibold inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl w-full"
                    >
                      <Play size={20} />
                      <span>Start Lesson</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Resume Notice */}
              {savedProgress && (
                <div className="mb-3 bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="ml-2">
                      <h3 className="text-xs font-medium text-blue-800">Resume Your Progress</h3>
                      <div className="mt-0.5 text-xs text-blue-700">
                        <p>You were on Activity {savedProgress.currentActivity + 1}: <strong>{lesson1Config.activities[savedProgress.currentActivity]?.title}</strong></p>
                        <p className="text-xs mt-0.5 text-blue-600">Last saved: {new Date(savedProgress.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Activities */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-gray-800 flex items-center">
                      <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-1.5">#</span>
                      Activities
                    </h2>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Total: ~25 min
                    </span>
                  </div>
                  <div className="space-y-2">
                    {lesson1Config.activities.map((activity, index) => (
                      <div key={index} className="bg-white p-2 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <span className="bg-blue-100 text-blue-700 font-bold w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="font-medium text-gray-800 text-xs">{activity.title}</div>
                          </div>
                          <div className="text-xs font-semibold text-blue-600 ml-2 whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded-full">
                            {activity.estimatedTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What You'll Learn */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                  <h2 className="text-base font-bold mb-2 text-gray-800 flex items-center">
                    <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-1.5">?</span>
                    What You'll Learn
                  </h2>
                  <ul className="space-y-2">
                    {lesson1Config.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2 bg-white p-2 rounded-lg shadow-sm border border-green-100">
                        <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-gray-700 text-xs leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Active Lesson
          <div className="flex-1 flex flex-col">
            {/* Current Activity */}
            <div className="flex-1 overflow-hidden">
              {!isLessonComplete && currentActivityData && (
                <div className="h-full">
                  {/* Video Activity */}
                  {currentActivityData.type === 'video' && (
                    <VideoPlayer 
                      key={`video-${currentActivityData.id}`}
                      src={currentActivityData.src}
                      onComplete={handleActivityComplete}
                      title={currentActivityData.title}
                      allowSeeking={false}
                      showNotice={false}
                      allowFullscreen={false}
                    />
                  )}

                  {/* DAW Tutorial Activity */}
                  {currentActivityData.type === 'daw-tutorial' && (
                    <DAWTutorialActivity 
                      key={`daw-tutorial-${currentActivity}`}
                      onComplete={handleActivityComplete}
                      navToolsEnabled={navToolsEnabled}
                      canAccessNavTools={canAccessNavTools}
                      lessonStartTime={lessonStartTime}
                    />
                  )}

                  {/* School Beneath Composition Activity */}
                  {currentActivityData.type === 'school-beneath-activity' && (
                    <SchoolBeneathActivity 
                      key={`school-beneath-${currentActivity}`}
                      onComplete={handleActivityComplete}
                      viewMode={viewSavedMode || viewBonusMode}
                      viewBonusMode={viewBonusMode}
                      lessonStartTime={lessonStartTime}
                    />
                  )}

                  {/* Two Stars and a Wish Reflection Activity */}
                  {currentActivityData.type === 'two-stars-wish' && (
                    <TwoStarsAndAWishActivity 
                      key={`reflection-${currentActivity}`}
                      onComplete={handleActivityComplete}
                      viewMode={viewReflectionMode}
                    />
                  )}

                  {/* Sound Effects Bonus Activity */}
                  {currentActivityData.type === 'sound-effects' && (
                    <SoundEffectsActivity 
                      key={`sound-effects-${currentActivity}`}
                      onComplete={handleActivityComplete}
                      viewMode={false}
                      lessonStartTime={lessonStartTime}
                    />
                  )}
                </div>
              )}

              {/* Lesson Complete */}
              {isLessonComplete && (
                <div className="h-full flex items-center justify-center bg-green-50">
                  <div className="text-center p-8">
                    <CheckCircle className="mx-auto text-green-500 mb-6" size={96} />
                    <h2 className="text-4xl font-bold text-green-800 mb-4">
                      Lesson Complete!
                    </h2>
                    <p className="text-green-700 mb-8 text-xl">
                      You've successfully completed {lesson1Config.title}
                    </p>
                    <div className="space-x-4">
                      <button
                        onClick={() => navigate('/lessons/film-music-project/lesson2')}
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                      >
                        Next Lesson
                      </button>
                      <button
                        onClick={handleDashboardNavigation}
                        className="bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 transition-colors text-lg"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default Lesson1;