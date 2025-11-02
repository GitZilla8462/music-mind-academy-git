// File: /lessons/shared/components/SessionTeacherPanel.jsx
// Teacher control panel for session mode - reusable across all lessons

import React from 'react';
import { Play, CheckCircle } from 'lucide-react';

const SessionTeacherPanel = ({
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
  resetActivityTimer,
  onOpenPresentation
}) => {
  const currentStageIndex = getCurrentStage ? lessonStages.findIndex(s => s.id === getCurrentStage()) : -1;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h1>
          <p className="text-sm text-gray-600 mb-4">Teacher Control Panel • Session: {sessionCode}</p>
          <button
            onClick={onOpenPresentation}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl inline-flex items-center space-x-3 text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Open Presentation View</span>
          </button>
        </div>
      </div>

      {/* Control Panel Content */}
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

          {/* Lesson Control Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Lesson Control</h2>
            
            <div className="space-y-3">
              {lessonStages.map((stage, index) => {
                const isCurrent = getCurrentStage && stage.id === getCurrentStage();
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
                          {isCurrent ? (<Play size={14} fill="currentColor" />) : isPast ? (<CheckCircle size={14} />) : (index + 1)}
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
                📚 End Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTeacherPanel;