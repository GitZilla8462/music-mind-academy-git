import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { Clock, Play, Pause, SkipForward, RefreshCw, Users, Save, CheckCircle } from 'lucide-react';

const TeacherControlPanel = ({ sessionCode, lessonStages, currentStageId }) => {
  const [currentStage, setCurrentStage] = useState(currentStageId || 'locked');
  const [students, setStudents] = useState([]);
  const [countdownTime, setCountdownTime] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [studentsFinalized, setStudentsFinalized] = useState({});
  const timerIntervalRef = useRef(null);
  const lastFirebaseUpdateRef = useRef(0);
  const FIREBASE_UPDATE_INTERVAL = 5000; // Only update Firebase every 5 seconds

  // Listen to session updates
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentStage(data.currentStage || 'locked');
        
        // Only update local state if timer isn't running locally
        if (!timerIntervalRef.current && data.countdownTime !== undefined) {
          setCountdownTime(data.countdownTime);
          setIsCountingDown(data.countdownTime > 0);
        }
        
        if (data.students) {
          setStudents(Object.values(data.students));
        }
      }
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Listen to students finalization progress
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const finalizedRef = ref(db, `sessions/${sessionCode}/studentsFinalized`);

    const unsubscribe = onValue(finalizedRef, (snapshot) => {
      const data = snapshot.val();
      setStudentsFinalized(data || {});
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Countdown timer effect - LOCAL ONLY, periodic Firebase sync
  useEffect(() => {
    // Clear any existing interval first
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
          
          // Play sound or show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Time\'s Up!', {
              body: 'The countdown timer has finished.',
              icon: '/icon.png'
            });
          }
          
          // Update Firebase - timer finished
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

        // Only update Firebase every 5 seconds to reduce load
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
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const seconds = minutes * 60;
    setCountdownTime(seconds);
    setIsCountingDown(true);
    lastFirebaseUpdateRef.current = Date.now();

    // Update Firebase with initial time
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    set(sessionRef, {
      currentStage,
      countdownTime: seconds,
      timerActive: true,
      timerStartTime: Date.now(), // Add start time for client-side calculation
      timestamp: Date.now()
    });
  };

  const pauseTimer = () => {
    setIsCountingDown(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Update Firebase - timer paused
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

      // Update Firebase - timer resumed
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
    // Clear the interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setCountdownTime(0);
    setIsCountingDown(false);

    // Update Firebase
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    set(sessionRef, {
      currentStage,
      countdownTime: 0,
      timerActive: false,
      timestamp: Date.now()
    });
  };

  const finalizeStudentWork = async () => {
    setIsFinalizing(true);
    setStudentsFinalized({});
    
    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    
    // Set the finalize flag
    await set(ref(db, `sessions/${sessionCode}/finalizeWork`), true);
    
    console.log('💾 Requesting all students to save their work...');
  };

  const clearFinalizeSignal = async () => {
    const db = getDatabase();
    
    // Clear the finalize flag and finalized students
    await set(ref(db, `sessions/${sessionCode}/finalizeWork`), false);
    await set(ref(db, `sessions/${sessionCode}/studentsFinalized`), null);
    
    setIsFinalizing(false);
    setStudentsFinalized({});
    
    console.log('✅ Finalize signal cleared');
  };

  const advanceToStage = (stageId) => {
    // CRITICAL: Stop the current timer before advancing
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setIsCountingDown(false);

    // ✔️ Default countdown times for each stage (in seconds)
    const stageDefaultTimes = {
      'locked': 0,
      'welcome-instructions': 0,
      'intro-summary': 0,
      'intro-video': 0,
      'daw-summary': 0,
      'daw-tutorial': 300,        // 5 minutes
      'activity-summary': 0,
      'activity-intro': 0,
      'school-summary': 0,
      'school-beneath': 600,       // 10 minutes
      'reflection-summary': 0,
      'reflection': 180,           // 3 minutes
      'sound-effects': 300         // 5 minutes
    };

    const defaultTime = stageDefaultTimes[stageId] || 0;
    setCountdownTime(defaultTime);

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);
    
    set(sessionRef, {
      currentStage: stageId,
      countdownTime: defaultTime,  // ✔️ Write the default time!
      timerActive: false,
      timestamp: Date.now()
    });

    setCurrentStage(stageId);
  };

  const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
  const currentStageData = lessonStages[currentStageIndex];

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Teacher Control Panel</h2>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>{students.length} Students</span>
          </div>
          <div className="bg-blue-600 px-3 py-1 rounded-full font-mono text-white">
            Session: {sessionCode}
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={20} />
            Activity Timer
          </h3>
          {countdownTime > 0 && (
            <div className={`text-3xl font-mono font-bold ${
              countdownTime <= 60 ? 'text-red-400 animate-pulse' : 'text-blue-400'
            }`}>
              {formatTime(countdownTime)}
            </div>
          )}
        </div>

        {/* Timer Action Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => startCountdown(5)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            5 Min
          </button>
          <button
            onClick={() => startCountdown(10)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            10 Min
          </button>
          <button
            onClick={() => startCountdown(15)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            15 Min
          </button>
        </div>

        {/* Custom Timer Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min="1"
            max="60"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
            className="flex-1 bg-gray-700 px-3 py-2 rounded-lg text-white"
            placeholder="Minutes"
          />
          <button
            onClick={() => startCountdown(customMinutes)}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Start
          </button>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex gap-2">
          {isCountingDown ? (
            <button
              onClick={pauseTimer}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Pause size={16} />
              Stop
            </button>
          ) : countdownTime > 0 ? (
            <button
              onClick={resumeTimer}
              className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Resume
            </button>
          ) : null}
          {countdownTime > 0 && (
            <button
              onClick={resetTimer}
              className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Stage Navigation */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Lesson Progress</h3>
        
        {/* Current Stage Display */}
        {currentStageData && (
          <div className="bg-blue-600 rounded-lg p-4 mb-4">
            <div className="text-sm text-blue-200 mb-1">Current Activity</div>
            <div className="text-xl font-bold">{currentStageData.label}</div>
            <div className="text-sm text-blue-200 mt-1">{currentStageData.description}</div>
          </div>
        )}

        {/* Stage Buttons */}
        <div className="space-y-2">
          {/* START LESSON - First stage-like row */}
          <a
            href={`/presentation?session=${sessionCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left px-4 py-3 rounded-lg transition-all bg-green-600 hover:bg-green-700 text-white"
          >
            <div className="font-semibold text-lg">Start Lesson</div>
            <div className="text-sm text-gray-200 opacity-75">Open Presentation</div>
          </a>
          
          {lessonStages.map((stage, index) => {
            const isCurrent = stage.id === currentStage;
            const isPast = index < currentStageIndex;
            
            return (
              <button
                key={stage.id}
                onClick={() => advanceToStage(stage.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-semibold'
                    : isPast
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{stage.label}</div>
                    <div className="text-sm opacity-75">{stage.description}</div>
                  </div>
                  {isCurrent && (
                    <div className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold">
                      ACTIVE
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Finalize Student Work Button */}
        {currentStage === 'school-beneath' && (
          <div className="mt-4">
            {!isFinalizing ? (
              <button
                onClick={finalizeStudentWork}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Save size={20} />
                Save All Student Work
              </button>
            ) : (
              <div className="bg-yellow-900 border-2 border-yellow-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-yellow-200">Saving Student Work...</span>
                  <span className="text-yellow-200 font-mono">
                    {Object.keys(studentsFinalized).length} / {students.length}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${students.length > 0 ? (Object.keys(studentsFinalized).length / students.length) * 100 : 0}%` 
                    }}
                  />
                </div>
                
                <div className="flex gap-2">
                  {Object.keys(studentsFinalized).length === students.length ? (
                    <button
                      onClick={clearFinalizeSignal}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      All Saved! Continue
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={clearFinalizeSignal}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={clearFinalizeSignal}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium transition-colors"
                      >
                        Continue Anyway
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-2 text-center">
              Click this before advancing to ensure all work is saved to Firebase
            </p>
          </div>
        )}

        {/* Next Button - Prominent */}
        {currentStageIndex < lessonStages.length - 1 && (
          <button
            onClick={() => advanceToStage(lessonStages[currentStageIndex + 1].id)}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <SkipForward size={24} />
            Next Activity
          </button>
        )}
      </div>
    </div>
  );
};

export default TeacherControlPanel;