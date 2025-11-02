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
  const [expandedSections, setExpandedSections] = useState(new Set(['introduction'])); // First section expanded by default

  const currentStage = getCurrentStage();
  const students = getStudents();
  const studentCount = students?.length || 0;

  // Calculate total lesson time
  const totalLessonTime = config.lessonSections?.reduce((total, section) => {
    return total + (section.estimatedTime || 0);
  }, 0) || 0;

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

  // Keyboard navigation - Right arrow advances to next stage
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Right arrow key
      if (event.key === 'ArrowRight') {
        const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
        const nextStageIndex = currentStageIndex + 1;
        
        if (nextStageIndex < lessonStages.length) {
          setCurrentStage(lessonStages[nextStageIndex].id);
          console.log('⏭️ Advanced to next stage via keyboard');
        }
      }
      
      // Left arrow key - go back to previous stage
      if (event.key === 'ArrowLeft') {
        const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
        const previousStageIndex = currentStageIndex - 1;
        
        if (previousStageIndex >= 0) {
          setCurrentStage(lessonStages[previousStageIndex].id);
          console.log('⏮️ Went back to previous stage via keyboard');
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

  // Jump to a specific stage
  const jumpToStage = (stageId) => {
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
            <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white">
              <Clock size={20} />
              <span className="font-semibold">{totalLessonTime} min total</span>
            </div>
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-mono font-bold">
              {sessionCode}
            </div>
            <button
              onClick={onOpenPresentation}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ExternalLink size={18} />
              Open Presentation
            </button>
          </div>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Use <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300">←</kbd> and <kbd className="px-2 py-1 bg-gray-200 rounded border border-gray-300">→</kbd> arrow keys to navigate stages
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
              className={`rounded-xl border-2 border-blue-500 overflow-hidden transition-all shadow-md ${
                sectionStatus === 'active' ? 'bg-blue-100' : 'bg-gray-50'
              }`}
            >
              {/* Section Header - Clickable */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-opacity-80 transition-colors"
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

                  {/* Time Estimate */}
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-semibold text-gray-900">{section.estimatedTime} min</div>
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

                            {/* Stage Info */}
                            <div>
                              <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                {index + 1}. {stage.label}
                              </div>
                              <div className="text-xs text-gray-600">{stage.description}</div>
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
                                {/* Plus Button */}
                                <button
                                  onClick={(e) => increaseTimer(stage.id, e)}
                                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  title="Increase 1 min"
                                >
                                  <Plus size={16} />
                                </button>
                                
                                {/* Timer Display */}
                                <div className="font-mono text-lg font-bold text-blue-700 min-w-[60px] text-center">
                                  {formatTime(timerData?.timeRemaining || (stage.duration * 60))}
                                </div>
                                
                                {/* Minus Button */}
                                <button
                                  onClick={(e) => decreaseTimer(stage.id, e)}
                                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  title="Decrease 1 min"
                                >
                                  <Minus size={16} />
                                </button>

                                {/* Start Timer / Reset Button */}
                                {!isTimerRunning ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startActivityTimer(stage.id, stage.duration);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                                  >
                                    Start Timer
                                  </button>
                                ) : (
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
                                    setCurrentStage(lessonStages[nextStageIndex].id);
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
                      onClick={() => setCurrentStage(section.stages[0].id)}
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