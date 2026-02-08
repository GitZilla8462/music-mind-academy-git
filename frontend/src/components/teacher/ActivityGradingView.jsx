// Activity Grading View - SpeedGrader-style
// src/components/teacher/ActivityGradingView.jsx
// Full-screen grading view: student list | grade form | work preview

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Image,
} from 'lucide-react';
import { getStudentWorkForTeacher } from '../../firebase/studentWork';
import { gradeSubmission } from '../../firebase/grades';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import GradeForm from './GradeForm';

// Must match GradeForm LEVELS pct values
const LEVELS_PCT = [1.0, 0.75, 0.5, 0.25];

const getStatusDot = (student) => {
  if (!student.submission) return 'bg-gray-300';
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

  const submittedCount = studentData.filter(s => s.submission?.status === 'submitted' || s.submission?.status === 'graded').length;
  const gradedCount = studentData.filter(s => s.submission?.status === 'graded').length;
  const pendingCount = studentData.filter(s => s.submission?.status === 'submitted').length;

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

  // Fetch work data for the current student
  const fetchWork = useCallback(async (student) => {
    if (!student?.submission?.workKey || !student.uid) return;
    if (workCache[student.uid]) return;

    setLoadingWork(true);
    try {
      const data = await getStudentWorkForTeacher(student.uid, student.submission.workKey);
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
    if (gradeData.maxPoints) {
      setAssignmentMaxPoints(gradeData.maxPoints.toString());
    }
    onGradeSaved(studentUid, lessonId, gradeData);
  };

  const handleMaxPointsChange = (val) => {
    if (val) setAssignmentMaxPoints(val);
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

        {/* Right Panel - Work Display */}
        <div className="flex-1 bg-gray-800 flex flex-col overflow-hidden">
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
              <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                <img
                  src={currentImage}
                  alt={`${currentStudent.displayName}'s work`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
              {/* Metadata bar */}
              <div className="px-4 py-2 bg-gray-900/50 text-gray-300 text-xs flex items-center gap-4">
                {currentWork?.data?.songTitle && (
                  <span>{currentWork.data.songTitle}</span>
                )}
                {currentWork?.data?.composer && (
                  <span>by {currentWork.data.composer}</span>
                )}
                {currentStudent.submission.submittedAt && (
                  <span className="ml-auto">
                    Submitted {new Date(currentStudent.submission.submittedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Image size={48} className="mb-4" />
              <p className="text-lg font-medium">Work Submitted</p>
              <p className="text-sm mt-1">No preview available for this submission.</p>
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
  );
};

export default ActivityGradingView;
