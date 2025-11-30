import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { Clock, Play, Pause, SkipForward, RefreshCw, Users, Monitor, Copy, Check, QrCode, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const TeacherControlPanel = ({ sessionCode, lessonStages, currentStageId }) => {
  const [currentStage, setCurrentStage] = useState(currentStageId || 'locked');
  const [students, setStudents] = useState([]);
  const [countdownTime, setCountdownTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [presentationOpened, setPresentationOpened] = useState(false);
  const [showAllStages, setShowAllStages] = useState(false);
  const timerIntervalRef = useRef(null);
  const lastFirebaseUpdateRef = useRef(0);
  const FIREBASE_UPDATE_INTERVAL = 5000;

  // Get the join URL based on environment
  const getJoinUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    return isProduction 
      ? 'musicroomtools.org/join' 
      : 'localhost:5173/join';
  };

  // Generate QR code URL using a free API
  const getQRCodeUrl = () => {
    const joinUrl = `https://${getJoinUrl()}?code=${sessionCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`;
  };

  // Copy join code to clipboard
  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Open presentation view
  const openPresentation = () => {
    window.open(`/presentation?session=${sessionCode}`, '_blank');
    setPresentationOpened(true);
    // Also advance to first stage if still locked
    if (currentStage === 'locked') {
      advanceToStage('welcome-instructions');
    }
  };

  // Listen to session updates
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentStage(data.currentStage || 'locked');
        
        if (!timerIntervalRef.current && data.countdownTime !== undefined) {
          setCountdownTime(data.countdownTime);
          setIsCountingDown(data.countdownTime > 0);
        }
        
        if (data.students) {
          setStudents(Object.values(data.students));
        } else if (data.studentsJoined) {
          setStudents(Object.values(data.studentsJoined));
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Countdown timer effect
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!isCountingDown || countdownTime <= 0) return;

    timerIntervalRef.current = setInterval(() => {
      setCountdownTime(prevTime => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0) {
          setIsCountingDown(false);
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Time\'s Up!', {
              body: 'The countdown timer has finished.',
              icon: '/icon.png'
            });
          }
          
          const db = getDatabase();
          const sessionRef = ref(db, `sessions/${sessionCode}`);
          set(sessionRef, {
            currentStage,
            countdownTime: 0,
            timerActive: false,
            timestamp: Date.now()
          });
          
          return 0;
        }

        const now = Date.now();
        if (now - lastFirebaseUpdateRef.current >= FIREBASE_UPDATE_INTERVAL) {
          lastFirebaseUpdateRef.current = now;
          
          const db = getDatabase();
          const sessionRef = ref(db, `sessions/${sessionCode}`);
          set(sessionRef, {
            currentStage,
            countdownTime: newTime,
            timerActive: true,
            timestamp: now
          });
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isCountingDown, sessionCode, currentStage]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCountdown = (minutes) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const seconds = minutes * 60;
    setCountdownTime(seconds);
    setIsCountingDown(true);
    lastFirebaseUpdateRef.current = Date.now();

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    set(sessionRef, {
      currentStage,
      countdownTime: seconds,
      timerActive: true,
      timerStartTime: Date.now(),
      timestamp: Date.now()
    });
  };

  const pauseTimer = () => {
    setIsCountingDown(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    set(sessionRef, {
      currentStage,
      countdownTime,
      timerActive: false,
      timestamp: Date.now()
    });
  };

  const resumeTimer = () => {
    if (countdownTime > 0) {
      setIsCountingDown(true);
      lastFirebaseUpdateRef.current = Date.now();

      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      set(sessionRef, {
        currentStage,
        countdownTime,
        timerActive: true,
        timerStartTime: Date.now(),
        timestamp: Date.now()
      });
    }
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setCountdownTime(0);
    setIsCountingDown(false);

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    set(sessionRef, {
      currentStage,
      countdownTime: 0,
      timerActive: false,
      timestamp: Date.now()
    });
  };

  const advanceToStage = (stageId) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setIsCountingDown(false);

    const stageDefaultTimes = {
      'locked': 0,
      'welcome-instructions': 0,
      'intro-summary': 0,
      'intro-video': 0,
      'daw-summary': 0,
      'daw-tutorial': 300,
      'activity-summary': 0,
      'activity-intro': 0,
      'school-summary': 0,
      'school-beneath': 600,
      'reflection-summary': 0,
      'reflection': 180,
      'sound-effects': 300
    };

    const defaultTime = stageDefaultTimes[stageId] || 0;
    setCountdownTime(defaultTime);

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    
    set(sessionRef, {
      currentStage: stageId,
      countdownTime: defaultTime,
      timerActive: false,
      timestamp: Date.now()
    });

    setCurrentStage(stageId);
  };

  const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
  const currentStageData = lessonStages[currentStageIndex];

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-1">🎵 Teacher Control Panel</h2>
        <p className="text-gray-400 text-sm">Follow the steps below to start your lesson</p>
      </div>

      {/* ==================== STEP 1: START LESSON ==================== */}
      <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-lg p-5 mb-4 border-2 border-green-600">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h3 className="text-lg font-bold text-green-400">Start Lesson</h3>
          {presentationOpened && (
            <span className="ml-auto bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Check size={12} /> Opened
            </span>
          )}
        </div>
        
        <p className="text-gray-300 text-sm mb-4 ml-11">
          Opens the presentation view for your projector or smartboard
        </p>
        
        <button
          onClick={openPresentation}
          className="w-full bg-green-600 hover:bg-green-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-green-500/25"
        >
          <Monitor size={24} />
          Start Lesson
          <ExternalLink size={18} className="opacity-70" />
        </button>
      </div>

      {/* ==================== STEP 2: STUDENTS JOIN ==================== */}
      <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-lg p-5 mb-4 border-2 border-blue-600">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h3 className="text-lg font-bold text-blue-400">Students Join</h3>
          <span className="ml-auto bg-blue-600/50 text-blue-200 text-sm px-3 py-1 rounded-full flex items-center gap-2">
            <Users size={14} />
            {students.length} joined
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-4 ml-11">
          Tell students to go to the website and enter the join code
        </p>

        {/* Join URL */}
        <div className="bg-gray-800 rounded-lg p-4 mb-3">
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Website</div>
          <div className="text-2xl font-mono font-bold text-white">
            {getJoinUrl()}
          </div>
        </div>

        {/* Join Code */}
        <div className="bg-gray-800 rounded-lg p-4 mb-3">
          <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Join Code</div>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-mono font-bold text-yellow-400 tracking-widest">
              {sessionCode}
            </div>
            <button
              onClick={copyJoinCode}
              className={`ml-auto px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showQR 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              <QrCode size={18} />
              QR
            </button>
          </div>
        </div>

        {/* QR Code (expandable) */}
        {showQR && (
          <div className="bg-white rounded-lg p-4 text-center">
            <img 
              src={getQRCodeUrl()} 
              alt="QR Code to join" 
              className="mx-auto mb-2"
              style={{ width: 200, height: 200 }}
            />
            <p className="text-gray-600 text-sm">Students can scan this to join instantly</p>
          </div>
        )}

        {/* Student List Preview */}
        {students.length > 0 && (
          <div className="mt-3 bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Students in session:</div>
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 10).map((student, i) => (
                <span key={i} className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-sm">
                  {student.name || student.displayName || `Student ${i + 1}`}
                </span>
              ))}
              {students.length > 10 && (
                <span className="text-gray-400 text-sm">+{students.length - 10} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== STEP 3: CONTROL LESSON ==================== */}
      <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-lg p-5 mb-4 border-2 border-purple-600">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="text-lg font-bold text-purple-400">Control Lesson</h3>
        </div>

        <p className="text-gray-300 text-sm mb-4 ml-11">
          Use the buttons below to guide students through each activity
        </p>

        {/* Current Stage Display */}
        {currentStageData && (
          <div className="bg-purple-600 rounded-lg p-4 mb-4">
            <div className="text-sm text-purple-200 mb-1">Now Showing</div>
            <div className="text-xl font-bold">{currentStageData.label}</div>
            {currentStageData.description && (
              <div className="text-sm text-purple-200 mt-1">{currentStageData.description}</div>
            )}
          </div>
        )}

        {/* Next Button - Most Important */}
        {currentStageIndex < lessonStages.length - 1 && (
          <button
            onClick={() => advanceToStage(lessonStages[currentStageIndex + 1].id)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg mb-4"
          >
            <SkipForward size={24} />
            Next: {lessonStages[currentStageIndex + 1]?.label}
          </button>
        )}

        {/* Show All Stages Toggle */}
        <button
          onClick={() => setShowAllStages(!showAllStages)}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
        >
          {showAllStages ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showAllStages ? 'Hide All Stages' : 'Show All Stages'}
        </button>

        {/* All Stage Buttons (collapsible) */}
        {showAllStages && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {lessonStages.map((stage, index) => {
              const isCurrent = stage.id === currentStage;
              const isPast = index < currentStageIndex;
              
              return (
                <button
                  key={stage.id}
                  onClick={() => advanceToStage(stage.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-purple-600 text-white'
                      : isPast
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{stage.label}</div>
                      {stage.description && (
                        <div className="text-xs opacity-70">{stage.description}</div>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="bg-white text-purple-600 px-2 py-0.5 rounded text-xs font-bold">
                        NOW
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== TIMER (Optional) ==================== */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2 text-gray-300">
            <Clock size={18} />
            Activity Timer
            <span className="text-xs text-gray-500">(optional)</span>
          </h3>
          {countdownTime > 0 && (
            <div className={`text-2xl font-mono font-bold ${
              countdownTime <= 60 ? 'text-red-400 animate-pulse' : 'text-blue-400'
            }`}>
              {formatTime(countdownTime)}
            </div>
          )}
        </div>

        {/* Quick Timer Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => startCountdown(3)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            3 min
          </button>
          <button
            onClick={() => startCountdown(5)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            5 min
          </button>
          <button
            onClick={() => startCountdown(10)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            10 min
          </button>
          <button
            onClick={() => startCountdown(15)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            15 min
          </button>
        </div>

        {/* Custom Timer */}
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min="1"
            max="60"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
            className="flex-1 bg-gray-700 px-3 py-2 rounded-lg text-white text-sm"
            placeholder="Minutes"
          />
          <button
            onClick={() => startCountdown(customMinutes)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Start
          </button>
        </div>

        {/* Timer Controls */}
        {(isCountingDown || countdownTime > 0) && (
          <div className="flex gap-2">
            {isCountingDown ? (
              <button
                onClick={pauseTimer}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Pause size={14} />
                Pause
              </button>
            ) : countdownTime > 0 ? (
              <button
                onClick={resumeTimer}
                className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Play size={14} />
                Resume
              </button>
            ) : null}
            <button
              onClick={resetTimer}
              className="flex-1 bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Footer - Quick Tips */}
      <div className="mt-4 text-center text-xs text-gray-500">
        💡 Tip: Keep this tab open to control what students see on their screens
      </div>
    </div>
  );
};

export default TeacherControlPanel;