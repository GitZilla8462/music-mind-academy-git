// Activity Grading View - SpeedGrader-style
// src/components/teacher/ActivityGradingView.jsx
// Full-screen grading view: student list | grade form | work preview

import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Image,
  RotateCcw,
  Key,
} from 'lucide-react';
import { getStudentWorkForTeacher } from '../../firebase/studentWork';
import { gradeSubmission } from '../../firebase/grades';
import { getAnswerKey } from '../../firebase/answerKeys';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import GradeForm from './GradeForm';
import AnswerKeyModal from './AnswerKeyModal';
// Lazy-load Listening Journey preview to avoid bundling LJ components with ClassDetailPage
const LazyLJPreview = lazy(() => import('./ListeningJourneyPreview'));
// Lazy-load Composition preview (loop blocks + video split view)
const LazyCompositionPreview = lazy(() => import('./CompositionPreview'));

// Must match GradeForm LEVELS pct values
const LEVELS_PCT = [1.0, 0.75, 0.5, 0.25];

const getStatusDot = (student) => {
  if (!student.submission) return 'bg-gray-300';
  if (student.submission.resubmittedAt && student.submission.status !== 'graded') return 'bg-blue-500';
  if (student.submission.status === 'graded') return 'bg-green-500';
  return 'bg-amber-500';
};

const SidebarRow = ({ student, idx, isSelected, onSelect, maxPoints, onScoreSave }) => {
  const [localPts, setLocalPts] = useState(student.grade?.points?.toString() || '');

  useEffect(() => {
    setLocalPts(student.grade?.points?.toString() || '');
  }, [student.grade?.points]);

  const handleBlur = () => {
    const pts = parseInt(localPts, 10);
    if (isNaN(pts)) return;
    if (pts === student.grade?.points) return;
    onScoreSave(student.uid, pts);
  };

  return (
    <div
      data-active={isSelected}
      onClick={() => onSelect(idx)}
      className={`w-full px-2 py-2 flex items-center gap-1.5 text-left text-sm transition-colors cursor-pointer ${
        isSelected
          ? 'bg-blue-50 border-l-2 border-blue-600'
          : 'hover:bg-gray-100 border-l-2 border-transparent'
      }`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(student)}`} />
      <span className={`flex-1 min-w-0 truncate text-xs ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
        {student.displayName || `Seat ${student.seatNumber}`}
      </span>
      {student.submission?.resubmittedAt && student.submission.status !== 'graded' && (
        <RotateCcw size={11} className="text-blue-500 flex-shrink-0" title={`Resubmitted${student.submission.resubmitCount ? ` (${student.submission.resubmitCount}x)` : ''}`} />
      )}
      <div className="flex items-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="number"
          value={localPts}
          onChange={(e) => setLocalPts(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          placeholder="--"
          min="0"
          className="w-9 text-xs text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none tabular-nums py-0.5"
        />
        <span className="text-[10px] text-gray-400 tabular-nums">/{maxPoints}</span>
      </div>
    </div>
  );
};

const ActivityGradingView = ({
  isOpen,
  onClose,
  classId,
  lessonId,
  activityId,
  lessonName,
  activityName,
  activityType,
  roster,
  submissions,
  grades,
  onGradeSaved
}) => {
  const { user } = useFirebaseAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [workCache, setWorkCache] = useState({});
  const [loadingWork, setLoadingWork] = useState(false);
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState('100');
  const [showGridLines, setShowGridLines] = useState(true);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [answerKeyData, setAnswerKeyData] = useState(null);
  const [showAnswerKeyModal, setShowAnswerKeyModal] = useState(false);
  const sidebarRef = useRef(null);

  // Build enriched student list with submission/grade data for this activity
  const studentData = roster.map(student => {
    const uid = student.studentUid || `seat-${student.seatNumber}`;
    const submission = submissions.find(s =>
      s.studentUid === uid && s.lessonId === lessonId && s.activityId === activityId
    );
    const grade = grades[uid]?.[lessonId];
    return { ...student, uid, submission, grade };
  });

  const submittedCount = studentData.filter(s => s.submission?.status === 'submitted' || s.submission?.status === 'pending' || s.submission?.status === 'graded').length;
  const gradedCount = studentData.filter(s => s.submission?.status === 'graded').length;
  const pendingCount = studentData.filter(s => s.submission?.status === 'submitted' || s.submission?.status === 'pending').length;
  const resubmitCount = studentData.filter(s => s.submission?.resubmittedAt && s.submission?.status !== 'graded').length;

  const currentStudent = studentData[selectedIndex];

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setWorkCache({});
      // Detect max points from any existing grade
      const existingGrade = studentData.find(s => s.grade?.maxPoints)?.grade;
      if (existingGrade?.maxPoints) {
        setAssignmentMaxPoints(existingGrade.maxPoints.toString());
      } else {
        setAssignmentMaxPoints('100');
      }
    }
  }, [isOpen]);

  // Fetch answer key on mount
  useEffect(() => {
    if (!isOpen || !user?.uid || !lessonId || !activityId) return;
    getAnswerKey(user.uid, lessonId, activityId)
      .then(key => setAnswerKeyData(key))
      .catch(() => setAnswerKeyData(null));
  }, [isOpen, user?.uid, lessonId, activityId]);

  // Fetch work data for the current student
  const fetchWork = useCallback(async (student) => {
    if (!student?.submission?.workKey || !student.uid) return;
    if (workCache[student.uid]) return;

    setLoadingWork(true);
    try {
      console.log('📖 Fetching work:', student.uid, student.submission.workKey);
      const data = await getStudentWorkForTeacher(student.uid, student.submission.workKey);
      console.log('📖 Work data:', data ? 'found' : 'null', data ? Object.keys(data) : '');
      setWorkCache(prev => ({ ...prev, [student.uid]: data }));
    } catch (err) {
      console.error('Error fetching student work:', err);
      setWorkCache(prev => ({ ...prev, [student.uid]: null }));
    } finally {
      setLoadingWork(false);
    }
  }, [workCache]);

  // Fetch work when selected student changes
  useEffect(() => {
    if (isOpen && currentStudent?.submission) {
      fetchWork(currentStudent);
    }
  }, [isOpen, selectedIndex, currentStudent, fetchWork]);

  // Scroll sidebar to keep selected student visible
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const activeEl = sidebarRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  const navigateStudent = (direction) => {
    const newIndex = selectedIndex + direction;
    if (newIndex >= 0 && newIndex < studentData.length) {
      setSelectedIndex(newIndex);
    }
  };

  // Extract image data from work
  const getImageFromWork = (workData) => {
    if (!workData) return null;
    if (workData.data?.imageData) return workData.data.imageData;
    if (workData.imageData) return workData.imageData;
    if (typeof workData.data === 'string' && workData.data.startsWith('data:image')) return workData.data;
    return null;
  };

  const handleGradeSaved = (studentUid, lessonId, gradeData) => {
    // Sync max points across the page when any grade is saved
    if (gradeData?.maxPoints) {
      setAssignmentMaxPoints(gradeData.maxPoints.toString());
    }
    onGradeSaved(studentUid, lessonId, gradeData);
  };

  const handleMaxPointsChange = async (val) => {
    if (!val) return;
    const newMax = parseInt(val, 10);
    if (isNaN(newMax) || newMax <= 0) return;
    setAssignmentMaxPoints(val);

    // Re-save all other graded students with the new maxPoints
    for (const student of studentData) {
      if (!student.grade || student.uid === currentStudent?.uid) continue;

      const oldGrade = student.grade;
      let newPoints = oldGrade.points ?? 0;

      // Recalculate from rubric if present
      if (oldGrade.rubricCriteria?.length) {
        const perCriterion = newMax / oldGrade.rubricCriteria.length;
        const allScored = oldGrade.rubricCriteria.every(c => c.selectedLevel !== null);
        if (allScored) {
          newPoints = oldGrade.rubricCriteria.reduce((sum, c) => {
            if (c.pointsOverride !== null && c.pointsOverride !== undefined) return sum + c.pointsOverride;
            return sum + Math.round(perCriterion * LEVELS_PCT[c.selectedLevel]);
          }, 0);
        }
      }

      try {
        const gradeData = {
          ...oldGrade,
          maxPoints: newMax,
          points: newPoints,
          grade: `${newPoints}/${newMax}`
        };
        await gradeSubmission(classId, student.uid, lessonId, gradeData, user.uid);
        handleGradeSaved(student.uid, lessonId, gradeData);
      } catch (err) {
        console.error(`Error updating max points for ${student.uid}:`, err);
      }
    }
  };

  const handleSidebarScore = async (studentUid, pts) => {
    const maxPts = parseInt(assignmentMaxPoints, 10) || 100;
    try {
      const gradeData = {
        type: 'points',
        points: pts,
        maxPoints: maxPts,
        grade: `${pts}/${maxPts}`,
        activityId: activityId || null,
        activityType: activityType || 'composition'
      };
      const result = await gradeSubmission(classId, studentUid, lessonId, gradeData, user.uid);
      handleGradeSaved(studentUid, lessonId, result);
    } catch (err) {
      console.error('Error saving sidebar grade:', err);
    }
  };

  // Apply rubric criteria change to all graded students
  const handleCriteriaChanged = async (newCriteriaNames) => {
    const maxPts = parseInt(assignmentMaxPoints, 10) || 100;

    for (const student of studentData) {
      if (!student.grade || student.uid === currentStudent?.uid) continue;

      const oldCriteria = student.grade.rubricCriteria || [];
      // Map new criteria names onto existing scores (by index)
      const updatedCriteria = newCriteriaNames.map((c, i) => ({
        name: c.name,
        selectedLevel: oldCriteria[i]?.selectedLevel ?? null,
        pointsOverride: oldCriteria[i]?.pointsOverride ?? null,
        levelPoints: oldCriteria[i]?.levelPoints ?? 0
      }));

      // Recalculate points
      let total = 0;
      const allScored = updatedCriteria.every(c => c.selectedLevel !== null);
      if (allScored) {
        const perCriterion = maxPts / updatedCriteria.length;
        total = updatedCriteria.reduce((sum, c) => {
          if (c.pointsOverride !== null) return sum + c.pointsOverride;
          return sum + Math.round(perCriterion * LEVELS_PCT[c.selectedLevel]);
        }, 0);
      } else {
        total = student.grade.points ?? 0;
      }

      try {
        const gradeData = {
          ...student.grade,
          rubricCriteria: updatedCriteria,
          points: total,
          grade: `${total}/${maxPts}`
        };
        await gradeSubmission(classId, student.uid, lessonId, gradeData, user.uid);
        handleGradeSaved(student.uid, lessonId, gradeData);
      } catch (err) {
        console.error(`Error updating rubric for ${student.uid}:`, err);
      }
    }
  };

  // Helper: render a work preview from data (used for both student work and answer key)
  const renderWorkContent = (workData) => {
    if (!workData) return null;
    const img = getImageFromWork(workData);
    if (img) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <img src={img} alt="Work" className="max-w-full max-h-full rounded-lg shadow-lg" />
        </div>
      );
    }
    if (workData.data?.sections) {
      return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>}>
          <LazyLJPreview workData={workData} />
        </Suspense>
      );
    }
    if (workData.data?.star1 || workData.data?.reviewType) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-300">
            <p className="text-gray-900 leading-relaxed">
              <strong>Star 1:</strong> {workData.data.star1}<br /><br />
              <strong>Star 2:</strong> {workData.data.star2}<br /><br />
              <strong>Wish:</strong> {workData.data.wish}
            </p>
          </div>
        </div>
      );
    }
    if (workData.data?.placedLoops) {
      return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" /></div>}>
          <LazyCompositionPreview workData={workData} />
        </Suspense>
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Preview not available</p>
      </div>
    );
  };

  // ========================
  // SpeedGrader View
  // ========================
  const currentWork = currentStudent ? workCache[currentStudent.uid] : null;
  const currentImage = getImageFromWork(currentWork);
  const isLoadingCurrent = loadingWork && !workCache[currentStudent?.uid];

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="h-6 w-px bg-gray-300" />

        {/* Progress counter */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="text-green-600 font-medium">{gradedCount}</span>
          <span>/</span>
          <span>{submittedCount} graded</span>
          {pendingCount > 0 && (
            <span className="text-amber-600 ml-1">({pendingCount} pending)</span>
          )}
          {resubmitCount > 0 && (
            <span className="text-blue-600 ml-1">({resubmitCount} resubmitted)</span>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center gap-3">
          <button
            onClick={() => navigateStudent(-1)}
            disabled={selectedIndex === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center">
            <div className="font-semibold text-gray-900 text-sm">
              {currentStudent?.displayName || `Seat ${currentStudent?.seatNumber}`}
            </div>
            <div className="text-xs text-gray-500">
              {selectedIndex + 1} of {studentData.length}
            </div>
          </div>

          <button
            onClick={() => navigateStudent(1)}
            disabled={selectedIndex === studentData.length - 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="text-xs text-gray-500">{activityName}</div>

        {answerKeyData && (
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              showAnswerKey
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Key size={12} />
            {showAnswerKey ? 'Hide Key' : 'Show Key'}
          </button>
        )}

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Student List (read-only grades) */}
        <div ref={sidebarRef} className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
          {studentData.map((student, idx) => (
            <SidebarRow
              key={student.seatNumber}
              student={student}
              idx={idx}
              isSelected={idx === selectedIndex}
              onSelect={setSelectedIndex}
              maxPoints={assignmentMaxPoints}
              onScoreSave={handleSidebarScore}
            />
          ))}
        </div>

        {/* Middle Panel - Grade Form */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">
                {currentStudent?.displayName || `Seat ${currentStudent?.seatNumber}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{activityName}</p>
            </div>

            <GradeForm
              student={currentStudent}
              lesson={{ id: lessonId, name: lessonName }}
              activity={{ id: activityId, name: activityName, type: activityType }}
              classId={classId}
              currentGrade={currentStudent?.grade}
              submission={currentStudent?.submission}
              onSave={handleGradeSaved}
              maxPointsProp={assignmentMaxPoints}
              onMaxPointsChange={handleMaxPointsChange}
              onCriteriaChanged={handleCriteriaChanged}
            />

            {/* Answer Key Section */}
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 flex items-center gap-2">
                <Key size={14} className={answerKeyData ? 'text-amber-500' : 'text-gray-400'} />
                <span className="text-sm font-medium text-gray-700">Answer Key</span>
              </div>
              <div className="p-3">
                {answerKeyData ? (
                  <div className="space-y-2">
                    <p className="text-xs text-green-600 font-medium">Key created</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAnswerKey(!showAnswerKey)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                          showAnswerKey
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <Key size={11} />
                        {showAnswerKey ? 'Hide Key' : 'Show Key'}
                      </button>
                      <button
                        onClick={() => setShowAnswerKeyModal(true)}
                        className="flex-1 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-colors"
                      >
                        Edit Key
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnswerKeyModal(true)}
                    className="w-full py-2 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Key size={12} />
                    Create Answer Key
                  </button>
                )}
              </div>
            </div>

            {/* Next Student Button */}
            {selectedIndex < studentData.length - 1 && (
              <button
                onClick={() => navigateStudent(1)}
                className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Next Student
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Work Display (splits when answer key shown) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Answer Key Panel */}
          {showAnswerKey && answerKeyData && (
            <div className="w-1/2 bg-gray-800 flex flex-col overflow-hidden border-r border-gray-600">
              <div className="px-3 py-1.5 bg-amber-900/30 border-b border-amber-700/50 flex items-center gap-2 shrink-0">
                <Key size={12} className="text-amber-400" />
                <span className="text-xs font-medium text-amber-300">Answer Key</span>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                {renderWorkContent(answerKeyData)}
              </div>
            </div>
          )}

          {/* Student Work Panel */}
          <div className={`${showAnswerKey && answerKeyData ? 'w-1/2' : 'flex-1'} bg-gray-800 flex flex-col overflow-hidden`}>
            {showAnswerKey && answerKeyData && (
              <div className="px-3 py-1.5 bg-blue-900/30 border-b border-blue-700/50 flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-blue-300">Student Work</span>
              </div>
            )}
          {isLoadingCurrent ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
            </div>
          ) : !currentStudent?.submission ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <AlertCircle size={48} className="mb-4" />
              <p className="text-lg font-medium">No Submission</p>
              <p className="text-sm mt-1">This student hasn't submitted work yet.</p>
            </div>
          ) : currentImage ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                <div className="grid rounded-lg shadow-lg overflow-hidden" style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 10rem)' }}>
                  <img
                    src={currentImage}
                    alt={`${currentStudent.displayName}'s work`}
                    className="w-full h-auto block"
                    style={{ gridArea: '1 / 1', maxHeight: 'calc(100vh - 10rem)' }}
                  />
                  {/* Grid lines overlay - same grid cell as image, guaranteed same size */}
                  {showGridLines && currentWork?.data?.numRows > 1 && (
                    <div className="relative pointer-events-none" style={{ gridArea: '1 / 1' }}>
                      {Array.from({ length: currentWork.data.numRows - 1 }, (_, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${((i + 1) / currentWork.data.numRows) * 100}%`,
                            height: '1px',
                            backgroundColor: 'rgba(156, 163, 175, 0.5)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Metadata bar */}
              <div className="px-4 py-2 bg-gray-900/50 text-gray-300 text-xs flex items-center gap-4">
                {currentWork?.data?.songTitle && (
                  <span>{currentWork.data.songTitle}</span>
                )}
                {currentWork?.data?.composer && (
                  <span>by {currentWork.data.composer}</span>
                )}
                {currentWork?.data?.numRows > 1 && (
                  <button
                    onClick={() => setShowGridLines(!showGridLines)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      showGridLines
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {showGridLines ? 'Hide' : 'Show'} Grid
                  </button>
                )}
                {currentStudent.submission.resubmittedAt && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <RotateCcw size={11} />
                    Resubmitted{currentStudent.submission.resubmitCount ? ` (${currentStudent.submission.resubmitCount}x)` : ''}
                  </span>
                )}
                {currentStudent.submission.submittedAt && (
                  <span className="ml-auto">
                    Submitted {new Date(currentStudent.submission.submittedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ) : currentWork?.data?.sections ? (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-gray-400 animate-spin" /></div>}>
              <LazyLJPreview
                workData={currentWork}
                submittedAt={currentStudent.submission.submittedAt}
              />
            </Suspense>
          ) : currentWork?.data?.star1 || currentWork?.data?.reviewType ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-lg w-full space-y-4">
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-white text-lg font-semibold flex items-center justify-center gap-2">
                    <span>📝</span> Summary
                    {currentWork.data.reviewType === 'partner' && currentWork.data.partnerName && (
                      <span className="text-gray-400 text-sm font-normal">
                        (reviewing {currentWork.data.partnerName})
                      </span>
                    )}
                  </h3>
                </div>

                {/* Read aloud header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg text-center">
                  <p className="text-white font-bold text-lg">📖 Read this out loud:</p>
                </div>

                {/* Read-aloud paragraph */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-300 shadow-md">
                  <p className="text-gray-900 text-lg leading-loose">
                    {currentWork.data.reviewType === 'partner' ? (
                      <>
                        Hey <strong>{currentWork.data.partnerName}</strong>!<br /><br />
                        One thing you did really well with the DAW was <strong>{currentWork.data.star1}</strong>.<br /><br />
                        Something that worked well in your music was <strong>{currentWork.data.star2}</strong>.<br /><br />
                        I wonder what would happen if you tried <strong>{currentWork.data.wish}</strong>.<br /><br />
                        {currentWork.data.vibe && (
                          <>Overall, your composition gave off <strong>{currentWork.data.vibe.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim().toLowerCase()}</strong> vibes!</>
                        )}
                      </>
                    ) : (
                      <>
                        One thing I did well with the DAW was <strong>{currentWork.data.star1}</strong>.<br /><br />
                        Something that worked well in my music was <strong>{currentWork.data.star2}</strong>.<br /><br />
                        Next time, I want to try <strong>{currentWork.data.wish}</strong>.<br /><br />
                        {currentWork.data.vibe && (
                          <>Overall, my composition gave off <strong>{currentWork.data.vibe.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim().toLowerCase()}</strong> vibes.</>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {currentStudent.submission?.submittedAt && (
                  <p className="text-xs text-gray-500 text-center">
                    Submitted {new Date(currentStudent.submission.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ) : currentWork?.data?.placedLoops ? (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-gray-400 animate-spin" /></div>}>
              <LazyCompositionPreview
                workData={currentWork}
                submittedAt={currentStudent.submission?.submittedAt}
              />
            </Suspense>
          ) : currentWork ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full text-center">
                <p className="text-lg font-medium text-white mb-2">{currentWork.title || 'Work Submitted'}</p>
                {currentStudent.submission.submittedAt && (
                  <p className="text-xs text-gray-500 mt-3">
                    Submitted {new Date(currentStudent.submission.submittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Image size={48} className="mb-4" />
              <p className="text-lg font-medium">Work Submitted</p>
              <p className="text-sm mt-1">Loading student work...</p>
              {currentStudent.submission.submittedAt && (
                <p className="text-xs mt-2">
                  Submitted {new Date(currentStudent.submission.submittedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Answer Key Modal */}
      <AnswerKeyModal
        isOpen={showAnswerKeyModal}
        onClose={(saved) => {
          setShowAnswerKeyModal(false);
          if (saved) {
            // Refresh answer key data
            getAnswerKey(user.uid, lessonId, activityId)
              .then(key => setAnswerKeyData(key))
              .catch(() => {});
          }
        }}
        lessonId={lessonId}
        activityId={activityId}
        activityName={activityName}
        activityType={activityType}
        teacherUid={user?.uid}
      />
    </div>
  );
};

export default ActivityGradingView;
