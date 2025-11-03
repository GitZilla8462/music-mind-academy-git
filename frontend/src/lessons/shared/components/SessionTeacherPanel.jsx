// File: /src/lessons/shared/components/SessionTeacherPanel.jsx
// ENHANCED: Card-based teacher control panel with section groupings

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, SkipForward, CheckCircle, Users, ChevronDown, ChevronUp, ExternalLink, Plus, Minus, RotateCcw } from 'lucide-react';

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
  const [expandedSections, setExpandedSections] = useState(new Set()); // All sections closed by default

  const currentStage = getCurrentStage();
  const students = getStudents();
  const studentCount = students?.length || 0;

  // Calculate total lesson time dynamically from activity timers
  const totalLessonTime = React.useMemo(() => {
    if (!config.lessonSections) return 0;
    
    let total = 0;
    config.lessonSections.forEach(section => {
      section.stages.forEach(stage => {
        if (stage.duration) {
          // For stages with hasTimer, check if timer has been adjusted
          if (stage.hasTimer) {
            const timerData = activityTimers[stage.id];
            const adjustedDuration = timerData?.presetTime ?? stage.duration;
            total += adjustedDuration;
            console.log(`ðŸ“Š ${stage.id}: ${adjustedDuration} min (adjusted: ${timerData?.presetTime ? 'yes' : 'no'})`);
          } else {
            // For videos and other timed stages without hasTimer, just use duration
            total += stage.duration;
            console.log(`ðŸ“Š ${stage.id}: ${stage.duration} min (fixed duration)`);
          }
        }
      });
    });
    console.log(`ðŸ“Š Total lesson time: ${total} minutes`);
    return total;
  }, [config.lessonSections, activityTimers]);

  // Toggle section expansion - ACCORDION STYLE (only one open at a time)
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set();
      if (!prev.has(sectionId)) {
        newSet.add(sectionId); // Open this section, close all others
      }
      // If clicking the same section, close it (empty set)
      return newSet;
    });
  };

  // Auto-expand section when stage changes
  useEffect(() => {
    if (currentStage) {
      // Find which section contains the current stage
      const activeSection = config.lessonSections?.find(section => 
        section.stages.some(stage => stage.id === currentStage)
      );
      
      if (activeSection) {
        setExpandedSections(new Set([activeSection.id]));
      }
    }
  }, [currentStage, config.lessonSections]);

  // ✅ Auto-advance to bonus activity when all students complete reflection
  useEffect(() => {
    console.log('🔍 Auto-advance useEffect running...');
    console.log('   Current stage:', currentStage);
    
    if (currentStage !== 'reflection') {
      console.log('   ❌ Not on reflection stage, skipping');
      return;
    }
    
    const currentStudents = getStudents();
    console.log('   Students:', currentStudents);
    console.log('   Student count:', currentStudents?.length || 0);
    
    if (!currentStudents || currentStudents.length === 0) {
      console.log('   ❌ No students found, skipping');
      return;
    }
    
    const reflectionStats = getProgressStats('reflection');
    console.log('   Reflection stats:', reflectionStats);
    console.log('   Completed:', reflectionStats.completed, '/', reflectionStats.total);
    
    if (reflectionStats.total > 0 && reflectionStats.completed === reflectionStats.total) {
      console.log('🎉 All students completed reflection! Auto-advancing to Name That Loop bonus...');
      console.log('   Students:', reflectionStats.completed, '/', reflectionStats.total);
      
      const timer = setTimeout(() => {
        setCurrentStage('name-that-loop');
        console.log('✅ Auto-advanced to name-that-loop stage');
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('   ⏳ Waiting for all students to complete...');
    }
  }, [currentStage, getProgressStats, setCurrentStage, getStudents, students]);

  // Keyboard navigation - Right arrow advances to next stage
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Right arrow key
      if (event.key === 'ArrowRight') {
        const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
        const nextStageIndex = currentStageIndex + 1;
        
        if (nextStageIndex < lessonStages.length) {
          const nextStage = lessonStages[nextStageIndex];
          jumpToStage(nextStage.id); // Use jumpToStage to trigger auto-timer
          console.log('âž¡ï¸ Advanced to next stage via keyboard');
        }
      }
      
      // Left arrow key - go back to previous stage
      if (event.key === 'ArrowLeft') {
        const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
        const previousStageIndex = currentStageIndex - 1;
        
        if (previousStageIndex >= 0) {
          const previousStage = lessonStages[previousStageIndex];
          jumpToStage(previousStage.id); // Use jumpToStage to trigger auto-timer
          console.log('â¬…ï¸ Went back to previous stage via keyboard');
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStage, lessonStages, setCurrentStage]);

  // Get status for a stage
  const getStageStatus = (stageId) => {
    if (stageId === currentStage) return 'active';
    
    const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
    const stageIndex = lessonStages.findIndex(s => s.id === stageId);
    
    if (stageIndex < currentStageIndex) return 'completed';
    return 'upcoming';
  };

  // Get status for entire section
  const getSectionStatus = (section) => {
    const stageStatuses = section.stages.map(stage => getStageStatus(stage.id));
    
    if (stageStatuses.includes('active')) return 'active';
    if (stageStatuses.every(status => status === 'completed')) return 'completed';
    if (stageStatuses.some(status => status === 'completed')) return 'in-progress';
    return 'upcoming';
  };

  // Get progress for a section
  const getSectionProgress = (section) => {
    const completedStages = section.stages.filter(stage => 
      getStageStatus(stage.id) === 'completed'
    ).length;
    return { completed: completedStages, total: section.stages.length };
  };

  // âœ… NEW: Get dynamic estimated time for a section based on adjusted timers
  const getSectionEstimatedTime = (section) => {
    let total = 0;
    section.stages.forEach(stage => {
      if (stage.duration) {
        if (stage.hasTimer) {
          // Use adjusted timer value if available
          const timerData = activityTimers[stage.id];
          const adjustedDuration = timerData?.presetTime ?? stage.duration;
          total += adjustedDuration;
        } else {
          // Use static duration for non-timer stages
          total += stage.duration;
        }
      }
    });
    return total;
  };

  // Jump to a specific stage
  const jumpToStage = (stageId) => {
    console.log('ðŸŽ¯ Jumping to stage:', stageId);
    setCurrentStage(stageId);
    
  };

  // Increase timer by 1 minute
  const increaseTimer = (stageId, e) => {
    e.stopPropagation(); // Prevent row click
    adjustPresetTime(stageId, 1);
  };

  // Decrease timer by 1 minute
  const decreaseTimer = (stageId, e) => {
    e.stopPropagation(); // Prevent row click
    adjustPresetTime(stageId, -1);
  };

  // Section color mapping - WHITE AND BLUE THEME
  const sectionColors = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    purple: {
      border: 'border-blue-400',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600'
    },
    yellow: {
      border: 'border-blue-400',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600'
    },
    green: {
      border: 'border-blue-400',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      button: 'bg-blue-500 hover:bg-blue-600'
    },
    gray: {
      border: 'border-gray-400',
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      button: 'bg-gray-600 hover:bg-gray-700'
    }
  };

  // Status indicator colors
  const statusColors = {
    active: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    'in-progress': 'bg-yellow-500',
    upcoming: 'bg-gray-300'
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{config.title}</h1>
            <p className="text-gray-600 mt-1">Teacher Control Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white">
              <Users size={20} />
              <span className="font-semibold">{studentCount} Students</span>
            </div>
            <div className="bg-gray-200 px-4 py-2 rounded-lg text-center">
              <div className="text-xs text-gray-600 font-medium">Class Code</div>
              <div className="text-gray-900 font-mono font-bold text-xl">{sessionCode}</div>
            </div>
            <div className="bg-blue-600 px-4 py-2 rounded-lg text-white text-center">
              <div className="text-xs text-blue-200 font-medium">Total Lesson Time</div>
              <div className="flex items-center gap-1 justify-center">
                <Clock size={18} />
                <span className="font-bold text-xl">{totalLessonTime} min</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="text-xs text-gray-500 mt-2">
          ðŸ’¡ Tip: Use <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300">â†</kbd> and <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300">â†’</kbd> arrow keys to navigate stages
        </div>
      </div>

      {/* START LESSON - Standalone card at the very top */}
      <div className="mb-4">
        <div
          onClick={onOpenPresentation}
          className="rounded-xl border-2 border-green-500 bg-green-600 hover:bg-green-700 overflow-hidden transition-all shadow-md cursor-pointer"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">ðŸŽ¬</div>
              <div>
                <h2 className="text-xl font-bold text-white">Start Lesson</h2>
                <p className="text-sm text-green-100">Open Presentation</p>
              </div>
            </div>
            <ExternalLink size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="space-y-4">
        {config.lessonSections?.map((section) => {
          const sectionStatus = getSectionStatus(section);
          const sectionProgress = getSectionProgress(section);
          const isExpanded = expandedSections.has(section.id);
          const colors = sectionColors[section.color] || sectionColors.gray;

          return (
            <div
              key={section.id}
              className={`rounded-xl border-2 overflow-hidden transition-all shadow-md ${
                sectionStatus === 'active' 
                  ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-300' 
                  : 'border-gray-300 bg-white'
              }`}
            >
              {/* Section Header - Clickable */}
              <button
                onClick={() => {
                  toggleSection(section.id);
                  // Jump to first stage in section
                  if (section.stages && section.stages.length > 0) {
                    jumpToStage(section.stages[0].id);
                  }
                }}
                className={`w-full px-6 py-4 flex items-center justify-between hover:bg-opacity-80 transition-colors ${
                  sectionStatus === 'active' ? 'bg-blue-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className={`w-3 h-3 rounded-full ${statusColors[sectionStatus]}`} />
                  
                  {/* Icon & Title */}
                  <div className="text-4xl">{section.icon}</div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-600">{section.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress */}
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="font-semibold text-gray-900">
                      {sectionProgress.completed}/{sectionProgress.total} steps
                    </div>
                  </div>

                  {/* Time Estimate - âœ… NOW DYNAMIC */}
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-semibold text-gray-900">{getSectionEstimatedTime(section)} min</div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  {isExpanded ? (
                    <ChevronUp size={24} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={24} className="text-gray-600" />
                  )}
                </div>
              </button>

              {/* Section Content - Collapsible */}
              {isExpanded && (
                <div className="border-t border-blue-300 px-6 py-4">
                  {/* Stage List */}
                  <div className="space-y-2 mb-4">
                    {section.stages.map((stage, index) => {
                      const stageStatus = getStageStatus(stage.id);
                      const isActive = stage.id === currentStage;
                      const timerData = activityTimers[stage.id];
                      const isTimerRunning = timerData?.isActive;

                      return (
                        <div
                          key={stage.id}
                          onClick={() => jumpToStage(stage.id)}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                            isActive ? 'bg-blue-200 border-2 border-blue-600' :
                            stageStatus === 'completed' ? 'bg-green-50 border border-green-300 hover:bg-green-100' :
                            'bg-white border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Status Icon */}
                            {stageStatus === 'completed' ? (
                              <CheckCircle size={20} className="text-green-500" />
                            ) : isActive ? (
                              <div className="w-5 h-5 rounded-full bg-blue-500 animate-pulse" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                            )}

                            {/* Stage Info with THREE LINES */}
                            <div>
                              <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                {index + 1}. {stage.label}
                              </div>
                              <div className="text-xs text-gray-600">{stage.description}</div>
                              {/* Third line for bonus description */}
                              {stage.bonusDescription && (
                                <div className="text-xs text-purple-600 font-medium mt-0.5">
                                  {stage.bonusDescription}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Duration Badge */}
                            {stage.duration && !stage.hasTimer && (
                              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                <Clock size={12} />
                                <span>{stage.duration} min</span>
                              </div>
                            )}

                            {/* Timer Controls for Stage with Timer */}
                            {stage.hasTimer && (
                              <div className="flex items-center gap-2">
                                {/* Plus Button - Only show when timer not running */}
                                {!isTimerRunning && (
                                  <button
                                    onClick={(e) => increaseTimer(stage.id, e)}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    title="Increase 1 min"
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                                
                                {/* Timer Display - Shows countdown in MM:SS when running, or preset time when not */}
                                <div className={`flex items-center gap-1 px-3 py-1 rounded font-mono font-bold text-lg min-w-[80px] justify-center ${
                                  isTimerRunning 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {isTimerRunning ? (
                                    // Show countdown in MM:SS format when running
                                    <span>{formatTime(timerData?.timeRemaining || 0)}</span>
                                  ) : (
                                    // Show preset minutes when not running
                                    <>
                                      <Clock size={14} />
                                      <span>{timerData?.presetTime ?? stage.duration} min</span>
                                    </>
                                  )}
                                </div>
                                
                                {/* Minus Button - Only show when timer not running */}
                                {!isTimerRunning && (
                                  <button
                                    onClick={(e) => decreaseTimer(stage.id, e)}
                                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    title="Decrease 1 min"
                                  >
                                    <Minus size={16} />
                                  </button>
                                )}

                                {/* Timer Control Buttons */}
                                {!isTimerRunning ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Use adjusted preset time, not original duration
                                      const adjustedTime = timerData?.presetTime ?? stage.duration;
                                      startActivityTimer(stage.id, adjustedTime);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                                  >
                                    Start Timer
                                  </button>
                                ) : (
                                  <div className="flex gap-2">
                                    {/* Reset Button - LEFT */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resetActivityTimer(stage.id);
                                      }}
                                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                      <RotateCcw size={16} />
                                      Reset
                                    </button>
                                    
                                    {/* Pause Button - RIGHT */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        pauseActivityTimer(stage.id);
                                      }}
                                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                      <Pause size={16} />
                                      Pause
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Progress Tracking */}
                            {stage.trackProgress && getProgressStats && (
                              <div className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                {getProgressStats(stage.id)?.completed || 0}/{studentCount} completed
                              </div>
                            )}

                            {/* Next Button - Only for active stage */}
                            {isActive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStageIndex = lessonStages.findIndex(s => s.id === stage.id) + 1;
                                  if (nextStageIndex < lessonStages.length) {
                                    jumpToStage(lessonStages[nextStageIndex].id);
                                  }
                                }}
                                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                              >
                                Next
                                <SkipForward size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Start Button */}
                  {sectionStatus === 'upcoming' && (
                    <button
                      onClick={() => jumpToStage(section.stages[0].id)}
                      className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${colors.button} flex items-center justify-center gap-2`}
                    >
                      <Play size={20} />
                      Start {section.title}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* End Session Button */}
      <div className="mt-6">
        <button
          onClick={endSession}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-md"
        >
          End Session & Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SessionTeacherPanel;