// File: /src/lessons/shared/components/SessionTeacherPanel.jsx
// ENHANCED: Card-based teacher control panel with section groupings
// UPDATED: Added clear Step 1, 2, 3 instructions for teachers

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, SkipForward, CheckCircle, Users, ChevronDown, ChevronUp, ExternalLink, Plus, Minus, RotateCcw, Copy, Check, QrCode, Monitor } from 'lucide-react';
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
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [shouldOpenPresentation, setShouldOpenPresentation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [presentationOpened, setPresentationOpened] = useState(false);
  
  const currentStage = getCurrentStage();
  const students = getStudents();
  const studentCount = students?.length || 0;

  // Get the join URL based on environment
  const getJoinUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    return isProduction 
      ? 'musicroomtools.org/join' 
      : 'localhost:5173/join';
  };

  // Generate QR code URL
  const getQRCodeUrl = () => {
    const joinUrl = `https://${getJoinUrl()}?code=${sessionCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`;
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

  // Open presentation when stage changes to join-code (if flag is set)
  useEffect(() => {
    if (shouldOpenPresentation && currentStage === 'join-code') {
      console.log('✅ Stage changed to join-code via useEffect! Opening presentation...');
      console.log('  Current stage:', currentStage);
      
      if (onOpenPresentation) {
        onOpenPresentation();
        setPresentationOpened(true);
      }
      
      setShouldOpenPresentation(false);
    }
  }, [currentStage, shouldOpenPresentation, onOpenPresentation]);

  // Calculate total lesson time dynamically from activity timers
  const totalLessonTime = React.useMemo(() => {
    if (!config.lessonSections) return 0;
    
    let total = 0;
    config.lessonSections.forEach(section => {
      section.stages.forEach(stage => {
        if (stage.duration) {
          if (stage.hasTimer) {
            const timerData = activityTimers[stage.id];
            const adjustedDuration = timerData?.presetTime ?? stage.duration;
            total += adjustedDuration;
            console.log(`📊 ${stage.id}: ${adjustedDuration} min (adjusted: ${timerData?.presetTime ? 'yes' : 'no'})`);
          } else {
            total += stage.duration;
            console.log(`📊 ${stage.id}: ${stage.duration} min (fixed duration)`);
          }
        }
      });
    });
    console.log(`📊 Total lesson time: ${total} minutes`);
    return total;
  }, [config.lessonSections, activityTimers]);

  // Toggle section expansion - ACCORDION STYLE
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set();
      if (!prev.has(sectionId)) {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Auto-expand section when stage changes
  useEffect(() => {
    console.log('🔄 Auto-expand effect triggered');
    console.log('  Current stage:', currentStage);
    
    if (currentStage) {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
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
      
      if (event.key === 'ArrowLeft') {
        const currentStageIndex = lessonStages.findIndex(s => s.id === currentStage);
        const prevStageIndex = currentStageIndex - 1;
        
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

  // Get estimated time for a section
  const getSectionEstimatedTime = (section) => {
    let total = 0;
    section.stages.forEach(stage => {
      if (stage.duration) {
        if (stage.hasTimer) {
          const timerData = activityTimers[stage.id];
          const adjustedDuration = timerData?.presetTime ?? stage.duration;
          total += adjustedDuration;
        } else {
          total += stage.duration;
        }
      }
    });
    return total;
  };

  // Jump to a specific stage
  const jumpToStage = (stageId) => {
    console.log('🎯 jumpToStage() called');
    console.log('  Target stage ID:', stageId);
    console.log('  Current stage:', currentStage);
    console.log('  Timestamp:', new Date().toISOString());
    console.log('  Call stack:', new Error().stack);
    
    setCurrentStage(stageId);
    
    console.log('✅ setCurrentStage called with:', stageId);
  };

  // Timer controls
  const increaseTimer = (stageId, e) => {
    e.stopPropagation();
    adjustPresetTime(stageId, 1);
  };

  const decreaseTimer = (stageId, e) => {
    e.stopPropagation();
    adjustPresetTime(stageId, -1);
  };

  // Section color mapping
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

  // Handle Start Lesson click
  const handleStartLesson = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎬 START LESSON CLICKED');
    console.log('  Current stage:', currentStage);
    
    if (currentStage === 'join-code') {
      console.log('  Already at join-code, opening presentation immediately');
      if (onOpenPresentation) {
        onOpenPresentation();
        setPresentationOpened(true);
      }
      return;
    }
    
    console.log('  Jumping to join-code...');
    jumpToStage('join-code');
    
    setShouldOpenPresentation(true);
    setPresentationOpened(true);
    console.log('  Flag set - will open presentation when stage changes to join-code');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4 max-w-5xl mx-auto">
      {/* ==================== HEADER ==================== */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">{config.title}</h1>
            <p className="text-gray-500 text-sm">Teacher Control Panel</p>
          </div>
          
          {/* Lesson Plan Button - Top Right */}
          <button
            onClick={() => {
              // Determine lesson plan URL based on config
              const lessonId = config.id || 'lesson1';
              const lessonPlanUrl = `/lesson-plan/${lessonId}`;
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Lesson Plan
          </button>
        </div>
        
        {/* Compact Info Boxes - 3 across */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-500 font-medium">Class Code</div>
            <div className="text-slate-900 font-mono font-bold text-xl">{sessionCode}</div>
          </div>
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">Students</div>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              <span className="font-bold text-xl text-blue-900">{studentCount}</span>
            </div>
          </div>
          <div className="bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
            <div className="text-xs text-indigo-600 font-medium">Lesson Time</div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              <span className="font-bold text-xl text-indigo-900">{totalLessonTime} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== STEPS 1, 2, 3 - COMPACT HORIZONTAL LAYOUT ==================== */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        
        {/* STEP 1: START LESSON */}
        <div className="rounded-lg border-2 border-green-500 bg-green-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">1</div>
            <span className="font-bold text-green-800 text-sm">Start Lesson</span>
            {presentationOpened && <Check size={14} className="text-green-600 ml-auto" />}
          </div>
          
          <button
            onClick={handleStartLesson}
            className="w-full bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 mb-2"
          >
            <Monitor size={16} />
            Open Presentation
            <ExternalLink size={12} className="opacity-70" />
          </button>
          
          <div className="text-xs text-green-700 bg-green-100 rounded p-2">
            📺 Opens presentation view for your whiteboard/projector
          </div>
        </div>

        {/* STEP 2: STUDENTS JOIN */}
        <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">2</div>
            <span className="font-bold text-blue-800 text-sm">Students Join</span>
            <span className="ml-auto text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">{studentCount} joined</span>
          </div>
          
          <div className="bg-white rounded p-2 mb-2 border border-blue-200">
            <div className="text-xs text-gray-500">Go to:</div>
            <div className="font-mono font-bold text-blue-900 text-sm">{getJoinUrl()}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded p-2 border border-blue-200">
              <div className="text-xs text-gray-500">Code:</div>
              <div className="font-mono font-bold text-amber-500 text-xl tracking-wider">{sessionCode}</div>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={copyJoinCode}
                className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                  copied ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                  showQR ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <QrCode size={12} />
                QR
              </button>
            </div>
          </div>
          
          {showQR && (
            <div className="mt-2 bg-white rounded p-2 text-center border border-blue-200">
              <img src={getQRCodeUrl()} alt="QR" className="mx-auto" style={{ width: 100, height: 100 }} />
            </div>
          )}
        </div>

        {/* STEP 3: CONTROL LESSON */}
        <div className="rounded-lg border-2 border-purple-400 bg-purple-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">3</div>
            <span className="font-bold text-purple-800 text-sm">Control Lesson</span>
          </div>
          
          <div className="text-xs text-purple-800 bg-amber-100 border border-amber-300 rounded p-2 mb-2">
            👇 Click <strong>Introduction</strong> below to start first slide
          </div>
          
          <div className="bg-purple-100 rounded p-2 text-xs text-purple-800">
            <div className="flex items-center gap-1 mb-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-purple-300 text-xs">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-purple-300 text-xs">→</kbd>
              <span className="ml-1">Arrow keys</span>
            </div>
            <div className="flex items-center gap-1">
              <span>▶️</span>
              <span>Or click <strong>Next</strong> buttons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student names row (if any joined) */}
      {studentCount > 0 && (
        <div className="mb-3 bg-blue-50 rounded-lg p-2 border border-blue-200">
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-blue-600 font-medium mr-2">Students:</span>
            {students.slice(0, 15).map((student, i) => (
              <span key={i} className="bg-white text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-200">
                {student.name || student.displayName || `Student ${i + 1}`}
              </span>
            ))}
            {studentCount > 15 && (
              <span className="text-gray-500 text-xs px-2 py-0.5">+{studentCount - 15} more</span>
            )}
          </div>
        </div>
      )}

      {/* Section Cards */}
      <div className="space-y-2">
        {config.lessonSections?.map((section, sectionIndex) => {
          const sectionStatus = getSectionStatus(section);
          const sectionProgress = getSectionProgress(section);
          const isExpanded = expandedSections.has(section.id);
          const colors = sectionColors[section.color] || sectionColors.gray;
          
          // Highlight first section if presentation opened but still on join-code
          const isFirstSection = sectionIndex === 0;
          const shouldHighlightStart = isFirstSection && presentationOpened && currentStage === 'join-code';

          return (
            <div
              key={section.id}
              className={`rounded-xl border-2 overflow-hidden transition-all shadow-md ${
                shouldHighlightStart
                  ? 'border-amber-500 bg-amber-50 shadow-lg ring-2 ring-amber-400 animate-pulse'
                  : sectionStatus === 'active' 
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
                  if (section.stages && section.stages.length > 0) {
                    console.log('  🎯 Auto-jumping to first stage:', section.stages[0].id);
                    jumpToStage(section.stages[0].id);
                  }
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-colors ${
                  shouldHighlightStart ? 'bg-amber-100' :
                  sectionStatus === 'active' ? 'bg-blue-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    shouldHighlightStart ? 'bg-amber-500 animate-ping' : statusColors[sectionStatus]
                  }`} />
                  
                  {/* Icon & Title */}
                  <div className="text-2xl">{section.icon}</div>
                  <div className="text-left">
                    <h2 className="text-base font-bold text-gray-900">
                      {section.title}
                      {shouldHighlightStart && (
                        <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full animate-bounce inline-block">
                          👈 Click to start!
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-gray-500">{section.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress */}
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Progress</div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {sectionProgress.completed}/{sectionProgress.total}
                    </div>
                  </div>

                  {/* Time Estimate */}
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Time</div>
                    <div className="font-semibold text-gray-900 text-sm">{getSectionEstimatedTime(section)}m</div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </button>

              {/* Section Content - Collapsible */}
              {isExpanded && (
                <div className="border-t border-blue-300 px-4 py-3">
                  {/* Stage List */}
                  <div className="space-y-1.5 mb-3">
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
                            if (e.target === e.currentTarget) {
                              jumpToStage(stage.id);
                            }
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer ${
                            isActive ? 'bg-blue-200 border-2 border-blue-600' :
                            stageStatus === 'completed' ? 'bg-green-50 border border-green-300 hover:bg-green-100' :
                            'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {/* Status Icon */}
                            {stageStatus === 'completed' ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : isActive ? (
                              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}

                            {/* Stage Info */}
                            <div>
                              <div className={`font-medium text-sm ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                {index + 1}. {stage.label}
                              </div>
                              {stage.description && (
                                <div className="text-xs text-gray-500">{stage.description}</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Duration Badge */}
                            {stage.duration && !stage.hasTimer && (
                              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                <Clock size={10} />
                                <span>{stage.duration}m</span>
                              </div>
                            )}

                            {/* Timer Controls */}
                            {stage.hasTimer && (
                              <div className="flex items-center gap-1">
                                {!isTimerRunning && (
                                  <button
                                    onClick={(e) => increaseTimer(stage.id, e)}
                                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  >
                                    <Plus size={12} />
                                  </button>
                                )}
                                
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-sm min-w-[60px] justify-center ${
                                  isTimerRunning ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {isTimerRunning ? (
                                    <span>{formatTime(timerData?.timeRemaining || 0)}</span>
                                  ) : (
                                    <span>{timerData?.presetTime ?? stage.duration}m</span>
                                  )}
                                </div>
                                
                                {!isTimerRunning && (
                                  <button
                                    onClick={(e) => decreaseTimer(stage.id, e)}
                                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                  >
                                    <Minus size={12} />
                                  </button>
                                )}

                                {!isTimerRunning ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const adjustedTime = timerData?.presetTime ?? stage.duration;
                                      startActivityTimer(stage.id, adjustedTime);
                                    }}
                                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium transition-colors"
                                  >
                                    Start
                                  </button>
                                ) : (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        resetActivityTimer(stage.id);
                                      }}
                                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium transition-colors"
                                    >
                                      Reset
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        pauseActivityTimer(stage.id);
                                      }}
                                      className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs font-medium transition-colors"
                                    >
                                      Stop
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Next Button */}
                            {isActive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStageIndex = lessonStages.findIndex(s => s.id === stage.id) + 1;
                                  if (nextStageIndex < lessonStages.length) {
                                    jumpToStage(lessonStages[nextStageIndex].id);
                                  }
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium transition-colors"
                              >
                                Next
                                <SkipForward size={12} />
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
                      className={`w-full py-2 rounded-lg font-semibold text-white transition-colors ${colors.button} flex items-center justify-center gap-2 text-sm`}
                    >
                      <Play size={16} />
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
      <div className="mt-4">
        <button
          onClick={endSession}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors shadow-md text-sm"
        >
          End Session & Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SessionTeacherPanel;