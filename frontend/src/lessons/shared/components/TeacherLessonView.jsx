// File: /src/lessons/shared/components/TeacherLessonView.jsx
// Combined Teacher Control Sidebar + Presentation View
// Professional design: White/slate sidebar, dark presentation area
// ✅ UPDATED: Added mini live preview box below view toggle

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
import { getDatabase, ref, onValue, update } from 'firebase/database';

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
  viewMode, // 'teacher' or 'student'
  onVideoEnded // callback when video finishes playing
}) => {
  const [LayerDetectiveLeaderboard, setLayerDetectiveLeaderboard] = useState(null);
  const [LayerDetectiveResults, setLayerDetectiveResults] = useState(null);
  const [LayerDetectiveClassDemo, setLayerDetectiveClassDemo] = useState(null);
  const [SectionalLoopBuilderLeaderboard, setSectionalLoopBuilderLeaderboard] = useState(null);
  const [SectionalLoopBuilderResults, setSectionalLoopBuilderResults] = useState(null);
  const [MoodMatchTeacherView, setMoodMatchTeacherView] = useState(null);
  const [VideoHookComparison, setVideoHookComparison] = useState(null);
  const [BeatBuilderDemo, setBeatBuilderDemo] = useState(null);
  const [NameThatGameActivity, setNameThatGameActivity] = useState(null);
  const [MelodyBuilderTeacherDemo, setMelodyBuilderTeacherDemo] = useState(null);

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

    // Mood Match Teacher View
    import('../../shared/activities/mood-match-game/MoodMatchTeacherView')
      .then(module => setMoodMatchTeacherView(() => module.default))
      .catch(() => console.log('Mood Match Teacher View not available'));

    // Lesson 4: Video Hook Comparison (No Music vs With Music)
    import('../../film-music-project/lesson4/components/VideoHookComparison')
      .then(module => setVideoHookComparison(() => module.default))
      .catch(() => console.log('Video Hook Comparison not available'));

    // Lesson 4: Beat Builder Demo (Building a Beat)
    import('../../film-music-project/lesson4/components/BeatBuilderDemo')
      .then(module => setBeatBuilderDemo(() => module.default))
      .catch(() => console.log('Beat Builder Demo not available'));

    // Lesson 5: Name That Game Activity
    import('../../shared/activities/name-that-game/NameThatGameActivity')
      .then(module => setNameThatGameActivity(() => module.default))
      .catch(() => console.log('Name That Game Activity not available'));

    // Lesson 5: Melody Builder Teacher Demo
    import('../../shared/activities/melody-maker/MelodyBuilderTeacherDemo')
      .then(module => setMelodyBuilderTeacherDemo(() => module.default))
      .catch(() => console.log('Melody Builder Teacher Demo not available'));
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

    // Mood Match Teacher View
    if (type === 'mood-match-teacher') {
      if (!MoodMatchTeacherView) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-white text-2xl">Loading Mood Match Game...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <MoodMatchTeacherView />
        </div>
      );
    }

    // Video Hook Comparison (Lesson 4) - No Music vs With Music
    if (type === 'video-comparison') {
      if (!VideoHookComparison) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-white text-2xl">Loading Video Comparison...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <VideoHookComparison />
        </div>
      );
    }

    // Beat Builder Demo (Lesson 4) - Teacher demonstrates building a beat
    if (type === 'beat-maker-demo') {
      if (!BeatBuilderDemo) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="text-white text-2xl">Loading Beat Builder Demo...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <BeatBuilderDemo />
        </div>
      );
    }

    // Name That Game (Lesson 5) - Teacher plays game theme songs for class to guess
    if (type === 'name-that-game') {
      if (!NameThatGameActivity) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900">
            <div className="text-white text-2xl">Loading Name That Game...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <NameThatGameActivity />
        </div>
      );
    }

    // Melody Builder Demo (Lesson 5) - Teacher demonstrates building a melody
    if (type === 'melody-builder-demo') {
      if (!MelodyBuilderTeacherDemo) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="text-white text-2xl">Loading Melody Builder Demo...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <MelodyBuilderTeacherDemo />
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
            onEnded={onVideoEnded}
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
// MINI PREVIEW COMPONENT
// Shows scaled-down live preview of opposite view
// ============================================
const MiniPreview = ({ viewMode, sessionCode, currentStage, currentStageData, sessionData, config, onSwitch }) => {
  const getStudentUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    const baseUrl = isProduction 
      ? 'https://musicroomtools.org' 
      : 'http://localhost:5173';
    return `${baseUrl}/join?code=${sessionCode}&preview=true`;
  };

  return (
    <div>
      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
        {viewMode === 'teacher' ? (
          <>
            <Smartphone size={12} />
            <span>Student screen:</span>
          </>
        ) : (
          <>
            <Monitor size={12} />
            <span>Teacher screen:</span>
          </>
        )}
      </div>
      <div 
        className="relative rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900 cursor-pointer hover:border-blue-400 transition-colors"
        style={{ height: '120px' }}
        onClick={onSwitch}
        title={`Click to switch to ${viewMode === 'teacher' ? 'Student' : 'Teacher'} View`}
      >
        {viewMode === 'teacher' ? (
          // Show mini student view via iframe
          <iframe
            src={getStudentUrl()}
            className="w-full h-full border-none pointer-events-none"
            style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: '666%', height: '666%' }}
            title="Student View Preview"
          />
        ) : (
          // Show mini teacher view (presentation content)
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div style={{ transform: 'scale(0.1)', transformOrigin: 'top left', width: '1000%', height: '1000%' }}>
              <PresentationContent
                currentStage={currentStage}
                currentStageData={currentStageData}
                sessionCode={sessionCode}
                sessionData={sessionData}
                lessonConfig={config}
                lessonBasePath={config?.lessonPath}
                viewMode="teacher"
              />
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
          <span className="text-white text-xs font-medium">Click to switch</span>
        </div>
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
  const [timerVisible, setTimerVisible] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingStageId, setPendingStageId] = useState(null); // Track stage to navigate to after save
  const [isSavingAll, setIsSavingAll] = useState(false);
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
      // Use queueMicrotask to prevent setState during render
      queueMicrotask(() => {
        setSessionData(snapshot.val());
      });
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

  // Auto-show/hide timer based on stage type
  // Timer is shown for activities with hasTimer: true, hidden otherwise
  useEffect(() => {
    if (!currentStageData) return;

    // Check if this is an activity with a timer configured
    const isTimedActivity =
      currentStageData.type === 'activity' &&
      currentStageData.hasTimer;

    if (isTimedActivity && currentStageData.duration) {
      // Show timer and set it to the activity's duration
      setTimerVisible(true);
      setClassroomTimer(prev => ({
        ...prev,
        presetMinutes: currentStageData.duration,
        timeRemaining: currentStageData.duration * 60,
        isRunning: false,
        isPaused: false
      }));
    } else {
      // Auto-minimize timer when navigating to non-timed stages
      setTimerVisible(false);
    }
  }, [currentStageData]);

  // Keyboard navigation - uses goToNextStage to trigger save modal for composition activities
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lessonStages || lessonStages.length === 0) return;
      // Don't navigate if save modal is showing
      if (showSaveModal) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextStage(); // Uses goToNextStage to trigger save modal if needed
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevStage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, lessonStages, showSaveModal]);

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

  // Check if current stage is a saveable activity (composition or listening map)
  const isSaveableActivity = currentStageData?.type === 'activity' &&
    (currentStageData?.id?.includes('composition') || currentStageData?.id === 'listening-map');

  // Send save command to all students via Firebase
  const sendSaveCommand = async () => {
    if (!sessionCode) return;

    try {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      await update(sessionRef, {
        saveCommand: Date.now()
      });
      console.log('💾 Save command sent to all students');
    } catch (error) {
      console.error('Error sending save command:', error);
    }
  };

  // Navigate to next stage (within content stages only)
  const goToNextStage = () => {
    // If leaving a saveable activity, show save modal instead
    if (isSaveableActivity) {
      const nextStageId = currentContentIndex < contentStages.length - 1
        ? contentStages[currentContentIndex + 1].id
        : null;
      if (nextStageId) {
        setPendingStageId(nextStageId);
        setShowSaveModal(true);
      }
      return;
    }

    if (currentContentIndex < contentStages.length - 1) {
      setCurrentStage(contentStages[currentContentIndex + 1].id);
    }
  };

  // Handle clicking on a stage in the sidebar
  const handleStageClick = (stageId) => {
    // If leaving a saveable activity, show save modal first
    if (isSaveableActivity && stageId !== currentStage) {
      setPendingStageId(stageId);
      setShowSaveModal(true);
      return;
    }
    setCurrentStage(stageId);
  };

  // Confirm leaving saveable activity - save all and advance
  const confirmLeaveComposition = async () => {
    setIsSavingAll(true);
    await sendSaveCommand();

    // Wait for save command to propagate to all students (2 seconds)
    // This gives time for Firebase to sync and students to save
    setTimeout(() => {
      setIsSavingAll(false);
      setShowSaveModal(false);
      if (pendingStageId) {
        setCurrentStage(pendingStageId);
        setPendingStageId(null);
      }
    }, 2000);
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
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
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

          {/* Navigation Buttons - AT TOP */}
          {!sidebarCollapsed && (
            <div className="p-3 border-b border-slate-200">
              {isOnJoinCode ? (
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
                                onClick={() => handleStageClick(stage.id)}
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

          {/* View Mode Toggle + Mini Preview - AT BOTTOM */}
          {!sidebarCollapsed && (
            <div className="border-t border-slate-200 p-3">
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
                  <span>Teacher</span>
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
                  <span>Student</span>
                </button>
              </div>

              {/* Mini Live Preview of Opposite View - TALLER */}
              <MiniPreview
                viewMode={viewMode}
                sessionCode={sessionCode}
                currentStage={currentStage}
                currentStageData={currentStageData}
                sessionData={sessionData}
                config={config}
                onSwitch={() => setViewMode(viewMode === 'teacher' ? 'student' : 'teacher')}
              />
            </div>
          )}

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
            onVideoEnded={goToNextStage}
          />

          {/* Floating Timer - Top Right (2x size) */}
          {timerVisible && (
            <div className="absolute top-4 right-4 z-50 bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-6 min-w-[320px]">
              {/* Timer Display */}
              <div className={`text-6xl font-bold font-mono text-center mb-4 ${
                classroomTimer.isRunning
                  ? classroomTimer.timeRemaining <= 60
                    ? 'text-red-400'
                    : 'text-white'
                  : 'text-gray-300'
              }`}>
                {formatClassroomTime(classroomTimer.timeRemaining)}
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-center gap-2">
                {/* Minus 1 min */}
                <button
                  onClick={() => adjustClassroomTime(-1)}
                  disabled={classroomTimer.presetMinutes <= 1 || classroomTimer.isRunning}
                  className={`p-3 rounded-xl transition-colors ${
                    classroomTimer.presetMinutes <= 1 || classroomTimer.isRunning
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="-1 min"
                >
                  <Minus size={28} />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={classroomTimer.isRunning ? pauseClassroomTimer : startClassroomTimer}
                  className={`p-4 rounded-xl transition-colors ${
                    classroomTimer.isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title={classroomTimer.isRunning ? 'Pause' : 'Start'}
                >
                  {classroomTimer.isRunning ? <Pause size={32} /> : <Play size={32} />}
                </button>

                {/* Plus 1 min */}
                <button
                  onClick={() => adjustClassroomTime(1)}
                  disabled={classroomTimer.presetMinutes >= 60 || classroomTimer.isRunning}
                  className={`p-3 rounded-xl transition-colors ${
                    classroomTimer.presetMinutes >= 60 || classroomTimer.isRunning
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="+1 min"
                >
                  <Plus size={28} />
                </button>

                {/* Reset */}
                <button
                  onClick={resetClassroomTimer}
                  className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={28} />
                </button>

                {/* Close */}
                <button
                  onClick={() => setTimerVisible(false)}
                  className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors text-2xl"
                  title="Hide timer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Floating Timer Toggle Button - when timer is hidden */}
          {!timerVisible && (
            <button
              onClick={() => setTimerVisible(true)}
              className="absolute top-4 right-4 z-50 p-2 bg-gray-800/90 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg shadow-lg border border-gray-700 transition-colors"
              title="Show Timer"
            >
              <Clock size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Save Confirmation Modal - shown when leaving composition activity */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {isSavingAll ? 'Saving All Work...' : 'Moving to Reflection'}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSavingAll ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-gray-700 text-lg">Saving student work...</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-lg mb-2">
                    All student compositions will be saved automatically.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Students will see their work on the Join page.
                  </p>
                </>
              )}
            </div>

            {/* Buttons */}
            {!isSavingAll && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setPendingStageId(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveComposition}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  Save All & Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLessonView;