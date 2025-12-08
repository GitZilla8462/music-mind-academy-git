// File: /src/lessons/shared/components/TeacherLessonView.jsx
// Combined Teacher Control Sidebar + Presentation View
// Professional design: White/slate sidebar, dark presentation area

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  Circle,
  Clock, 
  Users, 
  Copy, 
  Monitor,
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Video,
  SkipForward
} from 'lucide-react';
import { getDatabase, ref, onValue } from 'firebase/database';

// ============================================
// PRESENTATION CONTENT COMPONENT
// Renders the appropriate content based on stage
// ============================================
const PresentationContent = ({ 
  currentStage, 
  currentStageData, 
  sessionCode, 
  sessionData,
  lessonConfig,
  lessonBasePath,
  viewMode // 'teacher' or 'student'
}) => {
  const [LayerDetectiveLeaderboard, setLayerDetectiveLeaderboard] = useState(null);
  const [LayerDetectiveResults, setLayerDetectiveResults] = useState(null);
  const [LayerDetectiveClassDemo, setLayerDetectiveClassDemo] = useState(null);
  const [SectionalLoopBuilderLeaderboard, setSectionalLoopBuilderLeaderboard] = useState(null);
  const [SectionalLoopBuilderResults, setSectionalLoopBuilderResults] = useState(null);
  const [SectionalLoopBuilderClassDemo, setSectionalLoopBuilderClassDemo] = useState(null);

  // Load game components dynamically
  useEffect(() => {
    // Layer Detective components
    import('../../shared/activities/layer-detective/LayerDectectivePresentationView')
      .then(module => setLayerDetectiveLeaderboard(() => module.default))
      .catch(() => console.log('Layer Detective leaderboard not available'));
    
    import('../../shared/activities/layer-detective/LayerDetectiveResults')
      .then(module => setLayerDetectiveResults(() => module.default))
      .catch(() => console.log('Layer Detective results not available'));

    import('../../shared/activities/layer-detective/LayerDetectiveClassDemo')
      .then(module => setLayerDetectiveClassDemo(() => module.default))
      .catch(() => console.log('Layer Detective class demo not available'));

    // Sectional Loop Builder components
    import('../../shared/activities/sectional-loop-builder/SectionalLoopBuilderPresentationView')
      .then(module => setSectionalLoopBuilderLeaderboard(() => module.default))
      .catch(() => console.log('Sectional Loop Builder leaderboard not available'));
    
    import('../../shared/activities/sectional-loop-builder/SectionalLoopBuilderResults')
      .then(module => setSectionalLoopBuilderResults(() => module.default))
      .catch(() => console.log('Sectional Loop Builder results not available'));

    import('../../shared/activities/sectional-loop-builder/SectionalLoopBuilderClassDemo')
      .then(module => setSectionalLoopBuilderClassDemo(() => module.default))
      .catch(() => console.log('Sectional Loop Builder class demo not available'));
  }, []);

  // Student View Mode - Show iframe of student experience
  if (viewMode === 'student') {
    const getStudentUrl = () => {
      const isProduction = window.location.hostname !== 'localhost';
      const baseUrl = isProduction 
        ? 'https://musicroomtools.org' 
        : 'http://localhost:5173';
      return `${baseUrl}/join?code=${sessionCode}&preview=true`;
    };

    return (
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-10 bg-emerald-600 flex items-center justify-center z-10">
          <span className="text-white text-sm font-semibold flex items-center gap-2">
            <Smartphone size={16} />
            STUDENT VIEW PREVIEW
          </span>
        </div>
        <iframe
          src={getStudentUrl()}
          className="absolute top-10 left-0 w-full h-[calc(100%-40px)] border-none"
          title="Student View Preview"
        />
      </div>
    );
  }

  // Join Code Screen
  if (currentStage === 'locked' || currentStage === 'join-code') {
    const studentCount = sessionData?.studentsJoined 
      ? Object.keys(sessionData.studentsJoined).length 
      : 0;

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8">
        {/* Join Instructions */}
        <div className="text-center mb-8">
          <div className="text-slate-400 text-xl mb-2">Join at</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            musicroomtools.org/join
          </h1>
        </div>
        
        {/* Code Display */}
        <div className="bg-white rounded-2xl px-12 py-8 mb-8">
          <div className="text-8xl md:text-9xl font-bold font-mono tracking-widest text-blue-600">
            {sessionCode}
          </div>
        </div>
        
        {/* Student Count */}
        <div className="flex items-center gap-3 text-2xl text-slate-300">
          <Users size={28} />
          <span>
            {studentCount === 0 
              ? 'Waiting for students...' 
              : `${studentCount} student${studentCount !== 1 ? 's' : ''} joined`
            }
          </span>
        </div>
      </div>
    );
  }

  // Session Ended Screen
  if (currentStage === 'ended') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8">
        <div className="text-8xl mb-6">
          <Check size={100} className="text-emerald-500" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Session Ended</h1>
        <p className="text-xl text-slate-400">
          Thank you for participating!
        </p>
      </div>
    );
  }

  // Use presentationView from lesson config
  if (currentStageData?.presentationView) {
    const { type, slidePath, videoPath, title } = currentStageData.presentationView;

    // Layer Detective Leaderboard
    if (type === 'layer-detective-leaderboard' && LayerDetectiveLeaderboard) {
      return (
        <div className="absolute inset-0">
          <LayerDetectiveLeaderboard sessionData={sessionData} />
        </div>
      );
    }

    // Layer Detective Results
    if (type === 'layer-detective-results' && LayerDetectiveResults) {
      return (
        <div className="absolute inset-0">
          <LayerDetectiveResults sessionData={sessionData} />
        </div>
      );
    }

    // Layer Detective Class Demo
    if (type === 'layer-detective-class-demo' && LayerDetectiveClassDemo) {
      return (
        <div className="absolute inset-0">
          <React.Suspense fallback={
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
              <div className="text-white text-2xl">Loading class demo...</div>
            </div>
          }>
            <LayerDetectiveClassDemo sessionData={sessionData} />
          </React.Suspense>
        </div>
      );
    }

    // Sectional Loop Builder Leaderboard
    if (type === 'sectional-loop-builder-leaderboard' && SectionalLoopBuilderLeaderboard) {
      return (
        <div className="absolute inset-0">
          <SectionalLoopBuilderLeaderboard sessionData={sessionData} />
        </div>
      );
    }

    // Sectional Loop Builder Results
    if (type === 'sectional-loop-builder-results' && SectionalLoopBuilderResults) {
      return (
        <div className="absolute inset-0">
          <SectionalLoopBuilderResults sessionData={sessionData} />
        </div>
      );
    }

    // Sectional Loop Builder Class Demo
    if (type === 'sectional-loop-builder-class-demo' && SectionalLoopBuilderClassDemo) {
      return (
        <div className="absolute inset-0">
          <React.Suspense fallback={
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900">
              <div className="text-white text-2xl">Loading class demo...</div>
            </div>
          }>
            <SectionalLoopBuilderClassDemo sessionData={sessionData} />
          </React.Suspense>
        </div>
      );
    }

    // Slide
    if (type === 'slide' && slidePath) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <img
            src={slidePath}
            alt={currentStage}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onError={(e) => {
              console.error('Failed to load slide:', slidePath);
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // Video
    if (type === 'video' && videoPath) {
      return (
        <div className="absolute inset-0 bg-black">
          <video
            key={currentStage}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-contain"
          >
            <source src={videoPath} type="video/mp4" />
          </video>
        </div>
      );
    }
  }

  // Fallback for unknown stages
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-600">
      <Monitor size={64} className="mb-4 text-slate-400" />
      <div className="text-xl font-medium">Stage: {currentStage}</div>
      <div className="text-sm text-slate-400 mt-2">
        {currentStageData?.label || 'Loading...'}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const TeacherLessonView = ({
  config,
  sessionCode,
  lessonStages,
  getCurrentStage,
  setCurrentStage,
  getStudents,
  getProgressStats,
  endSession,
  activityTimers,
  formatTime,
  adjustPresetTime,
  startActivityTimer,
  pauseActivityTimer,
  resumeActivityTimer,
  resetActivityTimer
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [viewMode, setViewMode] = useState('teacher'); // 'teacher' or 'student'
  const [copied, setCopied] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  // Tutorial state - COMMENTED OUT (outdated video)
  // const [showTutorial, setShowTutorial] = useState(false);
  // const [videoKey, setVideoKey] = useState(0);
  const [timerVisible, setTimerVisible] = useState(false);
  const [classroomTimer, setClassroomTimer] = useState({
    presetMinutes: 5,
    timeRemaining: 5 * 60, // in seconds
    isRunning: false,
    isPaused: false
  });

  const currentStage = getCurrentStage();
  const students = getStudents();
  const studentCount = students?.length || 0;

  // Check if we're on join-code (not started yet)
  const isOnJoinCode = currentStage === 'locked' || currentStage === 'join-code' || !currentStage;
  
  // Filter to content stages only (exclude join-code, locked)
  const contentStages = useMemo(() => {
    return lessonStages?.filter(s => s.id !== 'join-code' && s.id !== 'locked') || [];
  }, [lessonStages]);
  
  // Get current index within CONTENT stages (not full array)
  const currentContentIndex = contentStages.findIndex(s => s.id === currentStage);
  const isFirstStage = currentContentIndex <= 0;
  const isLastStage = currentContentIndex >= contentStages.length - 1;

  // Get current stage data
  const currentStageData = useMemo(() => {
    return lessonStages?.find(stage => stage.id === currentStage);
  }, [currentStage, lessonStages]);

  // Subscribe to session data for presentation content
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      setSessionData(snapshot.val());
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Auto-expand active section
  useEffect(() => {
    if (!config.lessonSections) return;
    const activeSection = config.lessonSections.find(section =>
      section.stages.some(stage => stage.id === currentStage)
    );
    if (activeSection) {
      setExpandedSections(new Set([activeSection.id]));
    }
  }, [currentStage, config.lessonSections]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lessonStages || lessonStages.length === 0) return;
      
      const currentIdx = lessonStages.findIndex(s => s.id === currentStage);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIdx < lessonStages.length - 1) {
          setCurrentStage(lessonStages[currentIdx + 1].id);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIdx > 0) {
          setCurrentStage(lessonStages[currentIdx - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, lessonStages, setCurrentStage]);

  // Copy join code
  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle section
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Get stage status
  const getStageStatus = (stageId) => {
    const currIdx = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const stageIdx = lessonStages?.findIndex(s => s.id === stageId) ?? -1;
    if (stageId === currentStage) return 'active';
    if (stageIdx < currIdx) return 'completed';
    return 'upcoming';
  };

  // Get section status
  const getSectionStatus = (section) => {
    const stageIds = section.stages.map(s => s.id);
    const currIdx = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const sectionStageIndices = stageIds.map(id => lessonStages?.findIndex(s => s.id === id) ?? -1);
    if (sectionStageIndices.includes(currIdx)) return 'active';
    if (sectionStageIndices.every(i => i < currIdx)) return 'completed';
    return 'upcoming';
  };

  // Handle tutorial open/close - COMMENTED OUT (outdated video)
  // const handleOpenTutorial = () => {
  //   if (window.Tone && window.Tone.context && window.Tone.context.state === 'running') {
  //     window.Tone.context.suspend();
  //   }
  //   setVideoKey(prev => prev + 1);
  //   setShowTutorial(true);
  // };

  // const handleCloseTutorial = () => {
  //   setShowTutorial(false);
  //   if (window.Tone && window.Tone.context && window.Tone.context.state === 'suspended') {
  //     window.Tone.context.resume();
  //   }
  // };

  // Classroom Timer Functions
  const formatClassroomTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustClassroomTime = (delta) => {
    setClassroomTimer(prev => {
      const newMinutes = Math.max(1, Math.min(60, prev.presetMinutes + delta));
      return {
        ...prev,
        presetMinutes: newMinutes,
        timeRemaining: newMinutes * 60
      };
    });
  };

  const startClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      timeRemaining: prev.isPaused ? prev.timeRemaining : prev.presetMinutes * 60
    }));
  };

  const pauseClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true
    }));
  };

  const resetClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: prev.presetMinutes * 60
    }));
  };

  // Timer countdown effect
  useEffect(() => {
    if (!classroomTimer.isRunning) return;

    const interval = setInterval(() => {
      setClassroomTimer(prev => {
        if (prev.timeRemaining <= 1) {
          // Timer finished - could add sound here
          return {
            ...prev,
            isRunning: false,
            isPaused: false,
            timeRemaining: 0
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [classroomTimer.isRunning]);

  // Navigate to next stage (within content stages only)
  const goToNextStage = () => {
    if (currentContentIndex < contentStages.length - 1) {
      setCurrentStage(contentStages[currentContentIndex + 1].id);
    }
  };

  // Navigate to previous stage (within content stages only)
  const goToPrevStage = () => {
    if (currentContentIndex > 0) {
      setCurrentStage(contentStages[currentContentIndex - 1].id);
    }
  };

  // Start the lesson - navigate to first content stage
  const handleStartLesson = () => {
    if (contentStages.length > 0) {
      const firstStageId = contentStages[0].id;
      console.log('🎬 Starting lesson, navigating to first content stage:', firstStageId);
      setCurrentStage(firstStageId);
      
      // Also expand the first section
      if (config.lessonSections && config.lessonSections.length > 0) {
        setExpandedSections(new Set([config.lessonSections[0].id]));
      }
    } else {
      console.error('❌ Cannot start lesson - no content stages available');
    }
  };

  const getJoinUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    return isProduction ? 'musicroomtools.org/join' : 'localhost:5173/join';
  };

  return (
    <div className="h-screen flex bg-slate-900 overflow-hidden">
      {/* Tutorial Modal - COMMENTED OUT (outdated video)
      {showTutorial && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-5"
          onClick={handleCloseTutorial}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseTutorial}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center text-2xl"
            >
              ×
            </button>
            <video
              key={videoKey}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="w-full"
            >
              <source src="/lessons/film-music-project/Lesson Tutorial.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
      */}

      {/* Main Content Area - No header, just sidebar + presentation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - responsive width that maintains proportion */}
        <div 
          className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 flex-shrink-0 ${
            sidebarCollapsed ? 'w-14' : ''
          }`}
          style={sidebarCollapsed ? {} : { width: 'clamp(240px, 18vw, 320px)' }}
        >
          {/* Join Info - Top of Sidebar */}
          <div className={`border-b border-slate-200 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                  title="Expand sidebar"
                >
                  <PanelLeft size={18} />
                </button>
                <div className="text-xs font-bold text-blue-600 writing-mode-vertical">
                  {sessionCode}
                </div>
                <div className="flex items-center justify-center text-slate-500">
                  <Users size={14} />
                  <span className="text-xs ml-1">{studentCount}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="text-slate-500 text-sm mb-1">{getJoinUrl()}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl font-bold font-mono tracking-wider text-blue-600">
                    {sessionCode}
                  </span>
                  <button
                    onClick={copyJoinCode}
                    className={`p-1.5 rounded-lg transition-colors ${
                      copied 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'hover:bg-slate-100 text-slate-400'
                    }`}
                    title={copied ? 'Copied!' : 'Copy code'}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Users size={16} />
                  <span>{studentCount} student{studentCount !== 1 ? 's' : ''} joined</span>
                </div>
              </>
            )}
          </div>

          {/* View Mode Toggle + Navigation Buttons */}
          {!sidebarCollapsed && (
            <div className="p-3 border-b border-slate-200">
              {/* Teacher/Student View Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 mb-3">
                <button
                  onClick={() => setViewMode('teacher')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'teacher'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Monitor size={16} />
                  <span>Teacher View</span>
                </button>
                <button
                  onClick={() => setViewMode('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'student'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Smartphone size={16} />
                  <span>Student View</span>
                </button>
              </div>

              {/* Navigation Buttons */}
              {isOnJoinCode ? (
                // Start Lesson button
                <div>
                  <button
                    onClick={handleStartLesson}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Play size={18} />
                    Start Lesson
                  </button>
                </div>
              ) : (
                // Back/Next buttons
                <div>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPrevStage}
                      disabled={isFirstStage}
                      className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                        isFirstStage
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Previous stage"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                    
                    <button
                      onClick={goToNextStage}
                      disabled={isLastStage}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                        isLastStage
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-400 text-center">
                    or use ← → arrow keys
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsed Navigation */}
          {sidebarCollapsed && (
            <div className="p-2 border-b border-slate-200 flex flex-col gap-1">
              {/* View mode icons */}
              <button
                onClick={() => setViewMode('teacher')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'teacher' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Teacher View"
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setViewMode('student')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'student' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Student View"
              >
                <Smartphone size={18} />
              </button>
              
              {/* Divider */}
              <div className="border-t border-slate-200 my-1"></div>
              
              {/* Navigation */}
              {isOnJoinCode ? (
                <button
                  onClick={handleStartLesson}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  title="Start Lesson"
                >
                  <Play size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={goToPrevStage}
                    disabled={isFirstStage}
                    className={`p-2 rounded-lg transition-colors ${
                      isFirstStage
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'hover:bg-slate-100 text-slate-500'
                    }`}
                    title="Back"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={goToNextStage}
                    disabled={isLastStage}
                    className={`p-2 rounded-lg transition-colors ${
                      isLastStage
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {sidebarCollapsed ? (
              // Collapsed: Show section numbers only
              <div className="p-2 space-y-1">
                {config.lessonSections?.map((section, idx) => {
                  const status = getSectionStatus(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setSidebarCollapsed(false);
                        setExpandedSections(new Set([section.id]));
                      }}
                      className={`w-full p-2 rounded-lg text-center font-bold transition-colors ${
                        status === 'active'
                          ? 'bg-blue-100 text-blue-600'
                          : status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'hover:bg-slate-100 text-slate-400'
                      }`}
                      title={section.title}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Expanded: Full navigation
              <div className="p-2">
                {config.lessonSections?.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const status = getSectionStatus(section);

                  return (
                    <div key={section.id} className="mb-1">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          status === 'active'
                            ? 'bg-blue-50 text-blue-700'
                            : status === 'completed'
                            ? 'text-emerald-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <span className="font-semibold text-sm flex-1">
                          {section.title}
                        </span>
                        {status === 'completed' && (
                          <Check size={14} className="text-emerald-500" />
                        )}
                      </button>

                      {/* Section Stages */}
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-0.5">
                          {section.stages.map((stage) => {
                            const stageStatus = getStageStatus(stage.id);
                            const isActive = stage.id === currentStage;

                            return (
                              <div
                                key={stage.id}
                                onClick={() => setCurrentStage(stage.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-700'
                                    : stageStatus === 'completed'
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {/* Status indicator */}
                                <div className="flex-shrink-0">
                                  {stageStatus === 'completed' ? (
                                    <Check size={14} className="text-emerald-500" />
                                  ) : isActive ? (
                                    <Circle size={14} className="fill-blue-500 text-blue-500" />
                                  ) : (
                                    <Circle size={14} className="text-slate-300" />
                                  )}
                                </div>

                                {/* Stage label */}
                                <span className="flex-1 text-sm truncate">
                                  {stage.label}
                                </span>

                                {/* Duration indicator */}
                                {stage.duration && (
                                  <span className="text-xs text-slate-400">
                                    {stage.duration}m
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Classroom Timer Section */}
          {!sidebarCollapsed && (
            <div className="border-t border-slate-200 p-3">
              {timerVisible ? (
                <div className="bg-slate-50 rounded-xl p-4">
                  {/* Timer Header with Hide Button */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Timer</span>
                    <button
                      onClick={() => setTimerVisible(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                  
                  {/* Timer Display */}
                  <div className="text-center mb-3">
                    <div className={`text-5xl font-bold font-mono ${
                      classroomTimer.isRunning 
                        ? classroomTimer.timeRemaining <= 60 
                          ? 'text-red-500' 
                          : 'text-blue-600'
                        : 'text-slate-700'
                    }`}>
                      {formatClassroomTime(classroomTimer.timeRemaining)}
                    </div>
                  </div>
                  
                  {/* Time Adjustment - only show when not running */}
                  {!classroomTimer.isRunning && (
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <button
                        onClick={() => adjustClassroomTime(-1)}
                        disabled={classroomTimer.presetMinutes <= 1}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          classroomTimer.presetMinutes <= 1
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                        }`}
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-lg font-semibold text-slate-600 w-16 text-center">
                        {classroomTimer.presetMinutes} min
                      </span>
                      <button
                        onClick={() => adjustClassroomTime(1)}
                        disabled={classroomTimer.presetMinutes >= 60}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          classroomTimer.presetMinutes >= 60
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                        }`}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                  
                  {/* Timer Controls */}
                  <div className="flex gap-2">
                    {!classroomTimer.isRunning ? (
                      <>
                        <button
                          onClick={startClassroomTimer}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          <Play size={18} />
                          {classroomTimer.isPaused ? 'Resume' : 'Start'}
                        </button>
                        {classroomTimer.isPaused && (
                          <button
                            onClick={resetClassroomTimer}
                            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-semibold transition-colors"
                            title="Reset"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={pauseClassroomTimer}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          <Pause size={18} />
                          Pause
                        </button>
                        <button
                          onClick={resetClassroomTimer}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-semibold transition-colors"
                        >
                          <RotateCcw size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // Collapsed timer - just a button to show it
                <button
                  onClick={() => setTimerVisible(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Clock size={16} />
                  <span className="text-sm">Show Timer</span>
                </button>
              )}
            </div>
          )}

          {/* Collapsed Timer Icon */}
          {sidebarCollapsed && (
            <div className="border-t border-slate-200 p-2">
              <button
                onClick={() => {
                  setSidebarCollapsed(false);
                  setTimerVisible(true);
                }}
                className={`w-full p-2 rounded-lg transition-colors ${
                  classroomTimer.isRunning 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title={classroomTimer.isRunning ? formatClassroomTime(classroomTimer.timeRemaining) : 'Timer'}
              >
                <Clock size={18} />
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className={`border-t border-slate-200 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
            {sidebarCollapsed ? (
              <div className="flex flex-col gap-1">
                {/* Help Button - COMMENTED OUT (outdated video)
                <button
                  onClick={handleOpenTutorial}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Help"
                >
                  <HelpCircle size={18} />
                </button>
                */}
                <button
                  onClick={endSession}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  title="End Session"
                >
                  <LogOut size={18} />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Expand sidebar"
                >
                  <PanelLeft size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Help Button - COMMENTED OUT (outdated video)
                <button
                  onClick={handleOpenTutorial}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <HelpCircle size={16} />
                  Help
                </button>
                */}
                <button
                  onClick={endSession}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  End Session
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <PanelLeftClose size={16} />
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Presentation Area */}
        <div className="flex-1 relative bg-slate-900">
          <PresentationContent
            currentStage={currentStage}
            currentStageData={currentStageData}
            sessionCode={sessionCode}
            sessionData={sessionData}
            lessonConfig={config}
            lessonBasePath={config.lessonPath}
            viewMode={viewMode}
          />

        </div>
      </div>
    </div>
  );
};

export default TeacherLessonView;