// File: /src/lessons/shared/components/SessionTeacherPanel.jsx
// ENHANCED: Card-based teacher control panel with section groupings
// UPDATED: Removed blocking navigation and Save All Student Work buttons

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, SkipForward, CheckCircle, Users, ChevronDown, ChevronUp, ExternalLink, Plus, Minus, RotateCcw } from 'lucide-react';
import { getDatabase, ref, onValue, set } from 'firebase/database';

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
  const [shouldOpenPresentation, setShouldOpenPresentation] = useState(false); // Track if we need to open presentation
  
  const currentStage = getCurrentStage();
  const students = getStudents();
  const studentCount = students?.length || 0;

  // Open presentation when stage changes to join-code (if flag is set)
  useEffect(() => {
    if (shouldOpenPresentation && currentStage === 'join-code') {
      console.log('✅ Stage changed to join-code via useEffect! Opening presentation...');
      console.log('  Current stage:', currentStage);
      
      if (onOpenPresentation) {
        onOpenPresentation();
      }
      
      setShouldOpenPresentation(false); // Reset flag
    }
  }, [currentStage, shouldOpenPresentation, onOpenPresentation]);

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
            console.log(`📊 ${stage.id}: ${adjustedDuration} min (adjusted: ${timerData?.presetTime ? 'yes' : 'no'})`);
          } else {
            // For videos and other timed stages without hasTimer, just use duration
            total += stage.duration;
            console.log(`📊 ${stage.id}: ${stage.duration} min (fixed duration)`);
          }
        }
      });
    });
    console.log(`📊 Total lesson time: ${total} minutes`);
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
    console.log('🔄 Auto-expand effect triggered');
    console.log('  Current stage:', currentStage);
    
    if (currentStage) {
      // Find which section contains the current stage
      const activeSection = config.lessonSections?.find(section => 
        section.stages.some(stage => stage.id === currentStage)
      );
      
      console.log('  Active section found:', activeSection?.id, activeSection?.title);
      
      if (activeSection) {
        console.log('  📂 Expanding section:', activeSection.id);
        setExpandedSections(new Set([activeSection.id]));
      }
    }
  }, [currentStage, config.lessonSections]);

  // Keyboard navigation - Right arrow advances to next stage
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Right arrow key
      if (event.key === 'ArrowRight') {
        const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
        const nextStageIndex = currentStageIndex + 1;
        
        if (nextStageIndex < lessonStages.length) {
          const nextStage = lessonStages[nextStageIndex];
          jumpToStage(nextStage.id);
          console.log('⏩️ Advanced to next stage via keyboard');
        } else {
          console.log('⏩️ Already at last stage');
        }
      }
      
      // Left arrow key - go back to previous stage
      if (event.key === 'ArrowLeft') {
        const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
        const prevStageIndex = currentStageIndex - 1;
        
        // Only go back if we're not at the first stage (welcome-instructions)
        if (prevStageIndex >= 0 && currentStageIndex > 0) {
          const prevStage = lessonStages[prevStageIndex];
          jumpToStage(prevStage.id);
          console.log('⏪ Went back to previous stage via keyboard');
        } else {
          console.log('⏪ Already at first stage (welcome-instructions)');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStage, lessonStages]);

  // Get status of a stage
  const getStageStatus = (stageId) => {
    const currentIndex = lessonStages.findIndex(s => s.id === currentStage);
    const stageIndex = lessonStages.findIndex(s => s.id === stageId);
    
    if (stageId === currentStage) return 'active';
    if (stageIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  // Get status of a section
  const getSectionStatus = (section) => {
    const hasActiveStage = section.stages.some(stage => stage.id === currentStage);
    if (hasActiveStage) return 'active';
    
    const allCompleted = section.stages.every(stage => {
      const status = getStageStatus(stage.id);
      return status === 'completed';
    });
    if (allCompleted) return 'completed';
    
    return 'upcoming';
  };

  // Get progress within a section
  const getSectionProgress = (section) => {
    const completed = section.stages.filter(stage => {
      const status = getStageStatus(stage.id);
      return status === 'completed';
    }).length;
    
    return {
      completed,
      total: section.stages.length
    };
  };

  // Get estimated time for a section (with adjusted timers)
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

  // Jump to a specific stage - NO BLOCKING
  const jumpToStage = (stageId) => {
    console.log('🎯 jumpToStage() called');
    console.log('  Target stage ID:', stageId);
    console.log('  Current stage:', currentStage);
    console.log('  Timestamp:', new Date().toISOString());
    console.log('  Call stack:', new Error().stack);
    
    setCurrentStage(stageId);
    
    console.log('✅ setCurrentStage called with:', stageId);
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

  // Section color mapping - PROFESSIONAL EDUCATION BLUE PALETTE
  // Based on research: Blue promotes trust, calm, and reduces cognitive load
  // Monochromatic with strategic accent colors for hierarchy
  const sectionColors = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700',
      accent: 'bg-blue-100'
    },
    purple: {
      border: 'border-indigo-400',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      accent: 'bg-indigo-100'
    },
    yellow: {
      border: 'border-amber-400',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      button: 'bg-amber-600 hover:bg-amber-700',
      accent: 'bg-amber-100'
    },
    green: {
      border: 'border-teal-400',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      button: 'bg-teal-600 hover:bg-teal-700',
      accent: 'bg-teal-100'
    },
    gray: {
      border: 'border-slate-300',
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      button: 'bg-slate-600 hover:bg-slate-700',
      accent: 'bg-slate-100'
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
    <div className="min-h-screen bg-white text-gray-900 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-blue-900">{config.title}</h1>
          <p className="text-gray-600 mt-1">Teacher Control Panel</p>
        </div>
        
        {/* Compact Info Boxes - 3 across */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Class Code */}
          <div className="bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-600 font-medium mb-1">Class Code</div>
            <div className="text-slate-900 font-mono font-bold text-2xl">{sessionCode}</div>
          </div>
          
          {/* Students */}
          <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 shadow-sm">
            <div className="text-xs text-blue-700 font-medium mb-1">Students</div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              <span className="font-bold text-2xl text-blue-900">{studentCount}</span>
            </div>
          </div>
          
          {/* Lesson Time */}
          <div className="bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-200 shadow-sm">
            <div className="text-xs text-indigo-700 font-medium mb-1">Lesson Time</div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" />
              <span className="font-bold text-2xl text-indigo-900">{totalLessonTime} min</span>
            </div>
          </div>
        </div>
        
        {/* Lesson Plan Overview Button - Full Width */}
        <button
          onClick={() => {
            // Open lesson plan PDF in new window
            const lessonPlanUrl = '/lesson-plan/lesson1';
            const popup = window.open(
              lessonPlanUrl,
              'LessonPlanPDF',
              'width=1000,height=800,menubar=yes,toolbar=yes,location=no,scrollbars=yes'
            );
            
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
              alert('Popup blocked! Please allow popups for this site and try again.');
            } else {
              popup.focus();
            }
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 border border-indigo-700 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Lesson Plan Overview
        </button>
        
        {/* Info Row */}
        <div className="text-xs text-gray-500 mt-3">
          💡 Use <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300">←</kbd> and <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300">→</kbd> arrow keys to navigate stages
        </div>
      </div>

      {/* START LESSON - Standalone card at the very top */}
      <div className="mb-4">
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎬 START LESSON CLICKED');
            console.log('  Current stage:', currentStage);
            
            // If already at join-code, just open presentation immediately
            if (currentStage === 'join-code') {
              console.log('  Already at join-code, opening presentation immediately');
              if (onOpenPresentation) {
                onOpenPresentation();
              }
              return;
            }
            
            // Jump to join-code stage (shows join code screen)
            console.log('  Jumping to join-code...');
            jumpToStage('join-code');
            
            // Set flag so useEffect will open presentation when stage changes
            setShouldOpenPresentation(true);
            console.log('  Flag set - will open presentation when stage changes to join-code');
          }}
          className="rounded-xl border-2 border-green-500 bg-green-600 hover:bg-green-700 overflow-hidden transition-all shadow-md cursor-pointer"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎬</div>
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
                  console.log('📦 Section header clicked:', section.id);
                  console.log('  Section title:', section.title);
                  console.log('  First stage in section:', section.stages?.[0]?.id);
                  
                  toggleSection(section.id);
                  // Jump to first stage in section
                  if (section.stages && section.stages.length > 0) {
                    console.log('  🎯 Auto-jumping to first stage:', section.stages[0].id);
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

                  {/* Time Estimate - ✔️ NOW DYNAMIC */}
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
                          onClick={(e) => {
                            console.log('📋 Stage row clicked:', stage.id);
                            console.log('  Stage label:', stage.label);
                            console.log('  Click target:', e.target);
                            console.log('  Current target:', e.currentTarget);
                            console.log('  Timestamp:', new Date().toISOString());
                            
                            // Only jump if clicking the stage row itself, not child elements
                            if (e.target === e.currentTarget) {
                              jumpToStage(stage.id);
                            } else {
                              console.log('  ⚠️ Click on child element - ignoring to prevent accidental navigation');
                            }
                          }}
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
                                  <div className="flex gap-3">
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
                                      Stop
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