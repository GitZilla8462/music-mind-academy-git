// File: /src/lessons/shared/components/SessionTeacherPanel.jsx
// REDESIGNED: Left column (Steps 1-3), Right column (Info boxes stacked + Student View)

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, SkipForward, CheckCircle, Users, ChevronDown, ChevronUp, ExternalLink, Plus, Minus, RotateCcw, Copy, Check, QrCode, Monitor, Video, Gamepad2, Music, MessageSquare } from 'lucide-react';

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
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`;
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
      if (onOpenPresentation) {
        onOpenPresentation();
        setPresentationOpened(true);
      }
      setShouldOpenPresentation(false);
    }
  }, [currentStage, shouldOpenPresentation, onOpenPresentation]);

  // Calculate total lesson time dynamically
  const totalLessonTime = React.useMemo(() => {
    if (!config.lessonSections) return 0;
    let total = 0;
    config.lessonSections.forEach(section => {
      section.stages.forEach(stage => {
        if (stage.duration) {
          if (stage.hasTimer) {
            const timerData = activityTimers[stage.id];
            total += timerData?.presetTime ?? stage.duration;
          } else {
            total += stage.duration;
          }
        }
      });
    });
    return total;
  }, [config.lessonSections, activityTimers]);

  // Auto-expand active section and collapse others
  useEffect(() => {
    if (!config.lessonSections) return;
    const activeSection = config.lessonSections.find(section =>
      section.stages.some(stage => stage.id === currentStage)
    );
    if (activeSection) {
      setExpandedSections(new Set([activeSection.id]));
    }
  }, [currentStage, config.lessonSections]);

  // Keyboard navigation - Arrow keys to move between stages
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lessonStages || lessonStages.length === 0) return;
      
      const currentIndex = lessonStages.findIndex(s => s.id === currentStage);
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < lessonStages.length - 1) {
          const nextStage = lessonStages[currentIndex + 1];
          setCurrentStage(nextStage.id);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevStage = lessonStages[currentIndex - 1];
          setCurrentStage(prevStage.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, lessonStages, setCurrentStage]);

  // Get current stage data
  const currentStageData = lessonStages?.find(stage => stage.id === currentStage);

  // Toggle section expansion - opening one collapses others
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      if (prev.has(sectionId)) {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      } else {
        return new Set([sectionId]);
      }
    });
  };

  // Jump to a specific stage
  const jumpToStage = (stageId) => {
    setCurrentStage(stageId);
  };

  // Get section status
  const getSectionStatus = (section) => {
    const stageIds = section.stages.map(s => s.id);
    const currentIndex = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const sectionStageIndices = stageIds.map(id => lessonStages?.findIndex(s => s.id === id) ?? -1);
    
    if (sectionStageIndices.includes(currentIndex)) return 'active';
    if (sectionStageIndices.every(i => i < currentIndex)) return 'completed';
    return 'upcoming';
  };

  // Get stage status
  const getStageStatus = (stageId) => {
    const currentIndex = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const stageIndex = lessonStages?.findIndex(s => s.id === stageId) ?? -1;
    if (stageId === currentStage) return 'active';
    if (stageIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  // Get section progress
  const getSectionProgress = (section) => {
    const completed = section.stages.filter(stage => getStageStatus(stage.id) === 'completed').length;
    return { completed, total: section.stages.length };
  };

  // Get section estimated time
  const getSectionEstimatedTime = (section) => {
    return section.stages.reduce((sum, stage) => {
      if (stage.hasTimer) {
        const timerData = activityTimers[stage.id];
        return sum + (timerData?.presetTime ?? stage.duration ?? 0);
      }
      return sum + (stage.duration || 0);
    }, 0);
  };

  // Handle Start Lesson click
  const handleStartLesson = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStage === 'join-code') {
      if (onOpenPresentation) {
        onOpenPresentation();
        setPresentationOpened(true);
      }
      return;
    }
    
    jumpToStage('join-code');
    setShouldOpenPresentation(true);
    setPresentationOpened(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3">
      <div className="max-w-6xl mx-auto">
        
        {/* ==================== HEADER ==================== */}
        <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{config.title}</h1>
            <p className="text-gray-400 text-sm">Teacher Control Panel</p>
          </div>
          <button
            onClick={() => {
              const lessonId = config.id || 'lesson1';
              const lessonPlanUrl = `/lesson-plan/${lessonId}`;
              window.open(lessonPlanUrl, 'LessonPlanPDF', 'width=1000,height=800,menubar=yes,toolbar=yes,scrollbars=yes');
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            📄 Lesson Plan
          </button>
        </div>

        {/* ==================== MAIN LAYOUT: 2 COLUMNS ==================== */}
        <div className="grid grid-cols-5 gap-3">
          
          {/* LEFT COLUMN: Steps 1-3 + End Session (3/5 width) */}
          <div className="col-span-3 space-y-3">
            
            {/* STEP 1: Start Lesson */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Start Lesson</h3>
                  <p className="text-xs text-gray-500">Opens presentation for whiteboard/projector</p>
                </div>
                <button
                  onClick={handleStartLesson}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
                >
                  <Monitor size={18} />
                  Open Presentation
                  <ExternalLink size={14} className="opacity-70" />
                </button>
                {presentationOpened && <Check size={20} className="text-green-600" />}
              </div>
            </div>

            {/* STEP 2: Students Join */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Students Join</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Go to:</span>
                      <span className="font-mono font-bold text-gray-700">{getJoinUrl()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Code:</span>
                      <span className="font-mono font-bold text-2xl text-blue-600 tracking-wider">{sessionCode}</span>
                    </div>
                    <button
                      onClick={copyJoinCode}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                        copied ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                        showQR ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <QrCode size={12} />
                      QR
                    </button>
                  </div>
                </div>
                <div className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                  {studentCount} joined
                </div>
              </div>
              
              {/* QR Code (expandable) */}
              {showQR && (
                <div className="mt-3 ml-11 bg-white rounded p-3 border border-gray-200 inline-block">
                  <img src={getQRCodeUrl()} alt="QR" style={{ width: 120, height: 120 }} />
                </div>
              )}
              
              {/* Student names */}
              {studentCount > 0 && (
                <div className="mt-2 ml-11 flex flex-wrap gap-1">
                  {students.slice(0, 10).map((student, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                      {student.name || student.displayName || `Student ${i + 1}`}
                    </span>
                  ))}
                  {studentCount > 10 && (
                    <span className="text-gray-400 text-xs px-2 py-0.5">+{studentCount - 10} more</span>
                  )}
                </div>
              )}
            </div>

            {/* STEP 3: Control Lesson */}
            <div className="bg-white rounded-lg border-2 border-gray-300 p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Control Lesson</h3>
                  <p className="text-xs text-gray-500">
                    Click sections below or use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">←</kbd> <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">→</kbd> arrow keys
                  </p>
                </div>
              </div>
              
              {/* Lesson Sections */}
              <div className="ml-11 space-y-2">
                {config.lessonSections?.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const sectionStatus = getSectionStatus(section);
                  const sectionProgress = getSectionProgress(section);
                  const isFirstSection = config.lessonSections.indexOf(section) === 0;
                  const shouldHighlight = isFirstSection && presentationOpened && currentStage === 'join-code';

                  return (
                    <div
                      key={section.id}
                      className={`rounded-lg border-2 overflow-hidden transition-all ${
                        shouldHighlight ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50' :
                        sectionStatus === 'active' ? 'border-blue-400 ring-1 ring-blue-200' :
                        sectionStatus === 'completed' ? 'border-gray-300 bg-gray-50' :
                        'border-gray-200'
                      }`}
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => {
                          toggleSection(section.id);
                          if (section.stages?.length > 0) {
                            jumpToStage(section.stages[0].id);
                          }
                        }}
                        className={`w-full px-3 py-2 flex items-center justify-between hover:bg-opacity-80 transition-colors ${
                          shouldHighlight ? 'bg-blue-100' :
                          sectionStatus === 'active' ? 'bg-blue-50' : 
                          sectionStatus === 'completed' ? 'bg-gray-100' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            shouldHighlight ? 'bg-blue-500' : 
                            sectionStatus === 'active' ? 'bg-blue-500 animate-pulse' :
                            sectionStatus === 'completed' ? 'bg-gray-400' : 'bg-gray-300'
                          }`} />
                          <div className="text-left">
                            <div>
                              <span className="font-bold text-gray-900">{section.title}</span>
                              <span className="text-gray-500 text-sm ml-2">{section.subtitle}</span>
                            </div>
                            {shouldHighlight && (
                              <div className="mt-1">
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
                                  👈 Click here to start!
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{sectionProgress.completed}/{sectionProgress.total}</span>
                          <span>{getSectionEstimatedTime(section)}m</span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {/* Section Content */}
                      {isExpanded && (
                        <div className="px-3 py-2 bg-white border-t border-gray-200 space-y-1">
                          {section.stages.map((stage) => {
                            const stageStatus = getStageStatus(stage.id);
                            const isActive = stage.id === currentStage;
                            const timerData = activityTimers[stage.id];
                            const isTimerRunning = timerData?.isActive;

                            return (
                              <div
                                key={stage.id}
                                onClick={() => jumpToStage(stage.id)}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                                  isActive ? 'bg-blue-100 border-2 border-blue-500' :
                                  stageStatus === 'completed' ? 'bg-gray-50 border border-gray-200' :
                                  'bg-gray-50 border border-gray-200 hover:bg-blue-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {stageStatus === 'completed' ? (
                                    <CheckCircle size={14} className="text-gray-400" />
                                  ) : isActive ? (
                                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-pulse" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{stage.label}</div>
                                    <div className="text-xs text-gray-500">{stage.description}</div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Timer controls for activity stages */}
                                  {stage.hasTimer && (
                                    <div className="flex items-center gap-1">
                                      {!isTimerRunning && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); adjustPresetTime(stage.id, -1); }}
                                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                          <Minus size={10} />
                                        </button>
                                      )}
                                      <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                                        isTimerRunning ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {isTimerRunning ? formatTime(timerData?.timeRemaining || 0) : `${timerData?.presetTime ?? stage.duration}m`}
                                      </span>
                                      {!isTimerRunning && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); adjustPresetTime(stage.id, 1); }}
                                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                          <Plus size={10} />
                                        </button>
                                      )}
                                      {!isTimerRunning ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startActivityTimer(stage.id, timerData?.presetTime ?? stage.duration);
                                          }}
                                          className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-medium"
                                        >
                                          Start
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); resetActivityTimer(stage.id); }}
                                          className="px-2 py-0.5 bg-gray-500 text-white rounded text-xs font-medium"
                                        >
                                          Reset
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {/* Duration badge for non-timer stages */}
                                  {!stage.hasTimer && stage.duration && (
                                    <span className="text-xs text-gray-400">{stage.duration}m</span>
                                  )}

                                  {/* Next button for active stage */}
                                  {isActive && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const nextIndex = lessonStages.findIndex(s => s.id === stage.id) + 1;
                                        if (nextIndex < lessonStages.length) {
                                          jumpToStage(lessonStages[nextIndex].id);
                                        }
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium"
                                    >
                                      Next <SkipForward size={10} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* End Session Button */}
            <button
              onClick={endSession}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors"
            >
              End Session
            </button>
          </div>

          {/* RIGHT COLUMN: Info boxes stacked + Student Preview (2/5 width) */}
          <div className="col-span-2 space-y-3">
            
            {/* Info Boxes - Stacked vertically */}
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">Class Code</div>
              <div className="font-mono font-bold text-2xl text-gray-800">{sessionCode}</div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">Students</div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-500" />
                <span className="font-bold text-2xl text-gray-800">{studentCount}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">Lesson Time</div>
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-gray-500" />
                <span className="font-bold text-2xl text-gray-800">{totalLessonTime} min</span>
              </div>
            </div>

            {/* Student View Preview */}
            <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-700 text-white p-3">
                <h3 className="font-bold text-sm">Student View</h3>
                <p className="text-xs text-gray-300">Live preview of student screens</p>
              </div>
              
              {/* Mini browser chrome */}
              <div className="bg-gray-200 px-2 py-1 flex items-center gap-2 border-b">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded px-2 py-0.5 text-xs text-gray-500 truncate">
                  {getJoinUrl()}?code={sessionCode}
                </div>
              </div>
              
              {/* Actual student view via iframe - scaled down and NO AUDIO */}
              <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                <div className="absolute inset-0 origin-top-left" style={{ 
                  width: '400%', 
                  height: '400%', 
                  transform: 'scale(0.25)',
                  transformOrigin: 'top left'
                }}>
                  <iframe
                    src={`${window.location.origin}${config.lessonPath || `/lessons/film-music-project/${config.id}`}?session=${sessionCode}&role=student&preview=true&muted=true`}
                    className="w-full h-full border-0 pointer-events-none"
                    title="Student Preview"
                    sandbox="allow-same-origin allow-scripts"
                    allow=""
                    style={{ 
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
              
              {/* Student count footer */}
              <div className="bg-gray-100 p-2 text-center text-sm text-gray-600 border-t">
                👥 {studentCount} student{studentCount !== 1 ? 's' : ''} viewing this screen
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTeacherPanel;