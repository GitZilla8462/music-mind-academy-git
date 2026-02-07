// Student Detail Modal Component
// src/components/teacher/StudentDetailModal.jsx
// Shows all work from a single student, organized by Unit → Lesson → Activity

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Music,
  FileText,
  Gamepad2,
  Play,
  Loader2,
  Lock
} from 'lucide-react';
import { getStudentSubmissions } from '../../firebase/grades';
import { CURRICULUM } from '../../config/curriculumConfig';

const getActivityIcon = (type) => {
  switch (type) {
    case 'game': return Gamepad2;
    case 'composition': return Music;
    case 'reflection': return FileText;
    default: return FileText;
  }
};

const StudentDetailModal = ({
  isOpen,
  onClose,
  student,
  classId,
  onViewWork,
  onGrade
}) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, submitted, graded, missing
  const [expandedUnits, setExpandedUnits] = useState([]);
  const [expandedLessons, setExpandedLessons] = useState([]);

  // Get effective UID: Google UID if linked, otherwise seat-based ID
  const effectiveUid = student?.studentUid || (student?.seatNumber != null ? `seat-${student.seatNumber}` : null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!effectiveUid || !classId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentSubmissions(classId, effectiveUid);
        setSubmissions(data || []);
      } catch (err) {
        console.error('Error fetching student submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, effectiveUid, classId]);

  if (!isOpen) return null;

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  // Get submission for a specific activity
  const getSubmission = (lessonId, activityId) => {
    return submissions.find(s =>
      s.lessonId === lessonId && s.activityId === activityId
    );
  };

  // Get status badge
  const getStatusBadge = (submission) => {
    if (!submission) {
      return (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <AlertCircle size={12} />
          Not started
        </span>
      );
    }

    if (submission.status === 'graded') {
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 size={12} />
          Graded: {submission.grade?.points !== undefined
            ? `${submission.grade.points}/${submission.grade.maxPoints}`
            : submission.grade?.grade || 'Complete'}
        </span>
      );
    }

    if (submission.status === 'submitted') {
      return (
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <Clock size={12} />
          Submitted
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-xs text-blue-600">
        <Clock size={12} />
        In progress
      </span>
    );
  };

  // Calculate overall stats across all units
  let totalActivities = 0;
  let submitted = 0;
  let graded = 0;
  let pending = 0;

  CURRICULUM.forEach(unit => {
    unit.lessons.forEach(lesson => {
      totalActivities += lesson.activities.length;
    });
  });

  submitted = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  graded = submissions.filter(s => s.status === 'graded').length;
  pending = submissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-600">
              {(student?.displayName || student?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {student?.displayName || student?.name || `Student ${student?.seatNumber}`}
              </h2>
              <p className="text-sm text-gray-500">
                Seat #{student?.seatNumber} · {submitted}/{totalActivities} activities complete
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-6 text-sm">
          <button
            onClick={() => setFilter('all')}
            className={`font-medium ${filter === 'all' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`flex items-center gap-1 font-medium ${filter === 'submitted' ? 'text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Clock size={14} />
            Pending ({pending})
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`flex items-center gap-1 font-medium ${filter === 'graded' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <CheckCircle2 size={14} />
            Graded ({graded})
          </button>
          <button
            onClick={() => setFilter('missing')}
            className={`flex items-center gap-1 font-medium ${filter === 'missing' ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <AlertCircle size={14} />
            Missing
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {CURRICULUM.map((unit) => {
                const isUnitExpanded = expandedUnits.includes(unit.id);

                // Count submissions for this unit
                let unitSubmitted = 0;
                let unitPending = 0;
                let unitGraded = 0;
                unit.lessons.forEach(lesson => {
                  lesson.activities.forEach(activity => {
                    const sub = getSubmission(lesson.id, activity.id);
                    if (sub?.status === 'submitted') { unitSubmitted++; unitPending++; }
                    if (sub?.status === 'graded') { unitSubmitted++; unitGraded++; }
                  });
                });

                return (
                  <div key={unit.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Unit Header */}
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isUnitExpanded ? (
                          <ChevronDown size={18} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={18} className="text-gray-400" />
                        )}
                        <span className="mr-1">{unit.icon}</span>
                        <span className="font-bold text-gray-900">{unit.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {unitPending > 0 && (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {unitPending} pending
                          </span>
                        )}
                        {unitGraded > 0 && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {unitGraded} graded
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Unit Lessons */}
                    {isUnitExpanded && (
                      <div>
                        {unit.lessons.map((lesson) => {
                          const isLessonExpanded = expandedLessons.includes(lesson.id);
                          const hasActivities = lesson.activities.length > 0;
                          const isBuilt = !!lesson.route;

                          // Count for this lesson
                          let lessonPending = 0;
                          let lessonGraded = 0;
                          lesson.activities.forEach(activity => {
                            const sub = getSubmission(lesson.id, activity.id);
                            if (sub?.status === 'submitted') lessonPending++;
                            if (sub?.status === 'graded') lessonGraded++;
                          });

                          return (
                            <div key={lesson.id} className="border-t border-gray-100">
                              {/* Lesson Header */}
                              <button
                                onClick={() => hasActivities && toggleLesson(lesson.id)}
                                className={`w-full px-4 py-2.5 pl-10 flex items-center justify-between transition-colors ${
                                  hasActivities ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                                } ${!isBuilt ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center gap-2">
                                  {hasActivities ? (
                                    isLessonExpanded ? (
                                      <ChevronDown size={14} className="text-gray-400" />
                                    ) : (
                                      <ChevronRight size={14} className="text-gray-400" />
                                    )
                                  ) : (
                                    <Lock size={14} className="text-gray-300" />
                                  )}
                                  <span className="font-medium text-gray-900 text-sm">{lesson.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  {!isBuilt && (
                                    <span className="text-gray-400 italic">Coming soon</span>
                                  )}
                                  {lessonPending > 0 && (
                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                      {lessonPending} pending
                                    </span>
                                  )}
                                  {lessonGraded > 0 && (
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      {lessonGraded} graded
                                    </span>
                                  )}
                                </div>
                              </button>

                              {/* Activities */}
                              {isLessonExpanded && hasActivities && (
                                <div className="divide-y divide-gray-100">
                                  {lesson.activities.map((activity) => {
                                    const submission = getSubmission(lesson.id, activity.id);
                                    const Icon = getActivityIcon(activity.type);

                                    // Apply filter
                                    if (filter === 'submitted' && submission?.status !== 'submitted') return null;
                                    if (filter === 'graded' && submission?.status !== 'graded') return null;
                                    if (filter === 'missing' && submission) return null;

                                    return (
                                      <div
                                        key={activity.id}
                                        className="px-4 py-3 pl-16 flex items-center justify-between hover:bg-gray-50"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            activity.type === 'game' ? 'bg-purple-100' :
                                            activity.type === 'composition' ? 'bg-blue-100' : 'bg-gray-100'
                                          }`}>
                                            <Icon size={16} className={
                                              activity.type === 'game' ? 'text-purple-600' :
                                              activity.type === 'composition' ? 'text-blue-600' : 'text-gray-600'
                                            } />
                                          </div>
                                          <div>
                                            <div className="font-medium text-gray-900 text-sm">
                                              {activity.name}
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">
                                              {activity.type}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          {getStatusBadge(submission)}

                                          {submission && activity.type === 'composition' && (
                                            <div className="flex items-center gap-1">
                                              <button
                                                onClick={() => onViewWork?.(student, lesson, activity, submission)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="View Work"
                                              >
                                                <Play size={16} />
                                              </button>
                                              <button
                                                onClick={() => onGrade?.(student, lesson, activity, submission)}
                                                className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                              >
                                                {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
                                              </button>
                                            </div>
                                          )}

                                          {submission && activity.type === 'game' && submission.autoScore && (
                                            <span className="text-sm font-medium text-gray-700">
                                              {submission.autoScore.points}/{submission.autoScore.maxPoints}
                                            </span>
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
