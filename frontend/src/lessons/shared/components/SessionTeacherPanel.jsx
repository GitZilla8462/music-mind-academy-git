// File: /src/lessons/shared/components/SessionTeacherPanel.jsx
// PROFESSIONAL COLOR SCHEME: White bg, dark text, navy accents

import React, { useState, useEffect } from 'react';
import { Clock, Play, SkipForward, CheckCircle, Users, ChevronDown, ChevronUp, ExternalLink, Plus, Minus, Copy, Check, QrCode, Monitor } from 'lucide-react';

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

  const getJoinUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    return isProduction ? 'musicroomtools.org/join' : 'localhost:5173/join';
  };

  const getQRCodeUrl = () => {
    const joinUrl = `https://${getJoinUrl()}?code=${sessionCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`;
  };

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (shouldOpenPresentation && currentStage === 'join-code') {
      if (onOpenPresentation) {
        onOpenPresentation();
        setPresentationOpened(true);
      }
      setShouldOpenPresentation(false);
    }
  }, [currentStage, shouldOpenPresentation, onOpenPresentation]);

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

  useEffect(() => {
    if (!config.lessonSections) return;
    const activeSection = config.lessonSections.find(section =>
      section.stages.some(stage => stage.id === currentStage)
    );
    if (activeSection) {
      setExpandedSections(new Set([activeSection.id]));
    }
  }, [currentStage, config.lessonSections]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lessonStages || lessonStages.length === 0) return;
      const currentIndex = lessonStages.findIndex(s => s.id === currentStage);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < lessonStages.length - 1) {
          setCurrentStage(lessonStages[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentStage(lessonStages[currentIndex - 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, lessonStages, setCurrentStage]);

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

  const jumpToStage = (stageId) => {
    setCurrentStage(stageId);
  };

  const getSectionStatus = (section) => {
    const stageIds = section.stages.map(s => s.id);
    const currentIndex = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const sectionStageIndices = stageIds.map(id => lessonStages?.findIndex(s => s.id === id) ?? -1);
    if (sectionStageIndices.includes(currentIndex)) return 'active';
    if (sectionStageIndices.every(i => i < currentIndex)) return 'completed';
    return 'upcoming';
  };

  const getStageStatus = (stageId) => {
    const currentIndex = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const stageIndex = lessonStages?.findIndex(s => s.id === stageId) ?? -1;
    if (stageId === currentStage) return 'active';
    if (stageIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  const getSectionProgress = (section) => {
    const completed = section.stages.filter(stage => getStageStatus(stage.id) === 'completed').length;
    return { completed, total: section.stages.length };
  };

  const getSectionEstimatedTime = (section) => {
    return section.stages.reduce((sum, stage) => {
      if (stage.hasTimer) {
        const timerData = activityTimers[stage.id];
        return sum + (timerData?.presetTime ?? stage.duration ?? 0);
      }
      return sum + (stage.duration || 0);
    }, 0);
  };

  const handleOpenPresentation = (e) => {
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

  const lessonStarted = currentStage !== 'join-code' && lessonStages?.findIndex(s => s.id === currentStage) > 0;

  // Color scheme constants
  const colors = {
    navy: '#1e3a5f',
    navyLight: '#2d4a6f',
    navyDark: '#0f2744',
    accent: '#3b82f6',
    success: '#059669',
    successLight: '#d1fae5',
    border: '#cbd5e1',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    bgLight: '#f8fafc',
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{config.title}</h1>
            <p className="text-slate-600">Teacher Control Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-700 font-medium"><Users size={16} className="inline mr-1" />{studentCount} students</span>
            <span className="text-slate-700 font-medium"><Clock size={16} className="inline mr-1" />{totalLessonTime} min</span>
            <button
              onClick={() => window.open(`/lesson-plan/${config.id || 'lesson1'}`, '_blank')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              📄 Lesson Plan
            </button>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="bg-white rounded-xl mb-6 overflow-hidden border-2 border-slate-300">
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-300">
            
            {/* Step 1: Open Presentation */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                <span className="font-semibold text-slate-800">Open Presentation</span>
                {presentationOpened && <Check size={18} className="text-emerald-600" />}
              </div>
              <button
                onClick={handleOpenPresentation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Monitor size={18} />
                Open for Projector
                <ExternalLink size={14} />
              </button>
            </div>

            {/* Step 2: Students Join */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                <span className="font-semibold text-slate-800">Students Join</span>
              </div>
              <div className="text-center">
                <div className="text-slate-600 text-sm mb-1">Go to <span className="font-mono font-bold text-slate-800">{getJoinUrl()}</span></div>
                <div className="text-5xl font-bold text-blue-600 tracking-widest my-2">{sessionCode}</div>
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    onClick={copyJoinCode}
                    className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 border ${
                      copied ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className={`px-3 py-1.5 rounded text-sm font-medium border ${
                      showQR ? 'bg-blue-500 text-white border-blue-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <QrCode size={14} />
                  </button>
                </div>
                {showQR && (
                  <img src={getQRCodeUrl()} alt="QR Code" className="mx-auto mt-3 rounded" style={{ width: 100, height: 100 }} />
                )}
              </div>
            </div>

            {/* Step 3: Start Lesson */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                <span className="font-semibold text-slate-800">Start Lesson</span>
              </div>
              {config.lessonSections?.[0] && (
                <button
                  onClick={() => {
                    const firstSection = config.lessonSections[0];
                    if (firstSection.stages?.length > 0) {
                      jumpToStage(firstSection.stages[0].id);
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    lessonStarted 
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {lessonStarted ? (
                    <><CheckCircle size={18} /> In Progress</>
                  ) : (
                    <><Play size={18} /> Begin Introduction</>
                  )}
                </button>
              )}
              <p className="text-slate-500 text-xs text-center mt-3">
                Use ← → arrow keys to navigate
              </p>
            </div>
          </div>
        </div>

        {/* Lesson Sections */}
        <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-300">
          {config.lessonSections?.map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionStatus = getSectionStatus(section);
            const sectionProgress = getSectionProgress(section);

            return (
              <div key={section.id} className={sectionIndex > 0 ? 'border-t-2 border-slate-300' : ''}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    sectionStatus === 'active' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {sectionStatus === 'completed' ? (
                      <CheckCircle size={20} className="text-emerald-600" />
                    ) : sectionStatus === 'active' ? (
                      <div className="w-5 h-5 rounded-full bg-blue-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400" />
                    )}
                    <span className="font-semibold text-slate-800">{section.title}</span>
                    <span className="text-slate-600 text-sm">{section.subtitle}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                    <span>{sectionProgress.completed}/{sectionProgress.total}</span>
                    <span>{getSectionEstimatedTime(section)}m</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Section Stages */}
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-2">
                    {section.stages.map((stage) => {
                      const stageStatus = getStageStatus(stage.id);
                      const isActive = stage.id === currentStage;
                      const timerData = activityTimers[stage.id];
                      const isTimerRunning = timerData?.isActive;

                      return (
                        <div
                          key={stage.id}
                          onClick={() => jumpToStage(stage.id)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                            isActive ? 'bg-blue-100 ring-2 ring-blue-500 border-blue-300' :
                            stageStatus === 'completed' ? 'bg-slate-50 border-slate-300' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {stageStatus === 'completed' ? (
                              <CheckCircle size={16} className="text-emerald-600" />
                            ) : isActive ? (
                              <div className="w-4 h-4 rounded-full bg-blue-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                            )}
                            <span className={`font-medium ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                              {stage.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {stage.hasTimer && (
                              <div className="flex items-center gap-1">
                                {!isTimerRunning && (
                                  <>
                                    <button onClick={(e) => { e.stopPropagation(); adjustPresetTime(stage.id, -1); }} className="p-1 hover:bg-slate-200 rounded"><Minus size={12} /></button>
                                    <span className="font-mono text-sm w-8 text-center text-slate-700 font-medium">{timerData?.presetTime ?? stage.duration}m</span>
                                    <button onClick={(e) => { e.stopPropagation(); adjustPresetTime(stage.id, 1); }} className="p-1 hover:bg-slate-200 rounded"><Plus size={12} /></button>
                                  </>
                                )}
                                {isTimerRunning && (
                                  <span className="font-mono text-sm font-bold text-blue-600">{formatTime(timerData?.timeRemaining || 0)}</span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isTimerRunning) {
                                      resetActivityTimer(stage.id);
                                    } else {
                                      startActivityTimer(stage.id, timerData?.presetTime ?? stage.duration);
                                    }
                                  }}
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    isTimerRunning ? 'bg-slate-300 text-slate-700' : 'bg-blue-600 text-white'
                                  }`}
                                >
                                  {isTimerRunning ? 'Reset' : 'Start'}
                                </button>
                              </div>
                            )}
                            {!stage.hasTimer && stage.duration && (
                              <span className="text-sm text-slate-600 font-medium">{stage.duration}m</span>
                            )}
                            {isActive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextIndex = lessonStages.findIndex(s => s.id === stage.id) + 1;
                                  if (nextIndex < lessonStages.length) {
                                    jumpToStage(lessonStages[nextIndex].id);
                                  }
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium flex items-center gap-1"
                              >
                                Next <SkipForward size={12} />
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

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <button 
            onClick={endSession} 
            className="bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-300 px-5 py-2 rounded-lg font-semibold transition-colors"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTeacherPanel;