// Student Classwork Component
// src/components/student/StudentClasswork.jsx
// Simple flat list: Unit → Assignments (no lesson sub-grouping)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Eye,
  PenLine,
} from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getStudentSubmissions } from '../../firebase/grades';
import { getConductedLessons } from '../../firebase/classes';
import { CURRICULUM } from '../../config/curriculumConfig';
import { getAllStudentWork, saveStudentWork, parseActivityId } from '../../utils/studentWorkStorage';

// Quick feedback labels (matches GradeForm)
const FEEDBACK_LABELS = {
  'great-work': 'Great work!',
  'creative': 'Creative choices',
  'good-effort': 'Good effort',
  'needs-variety': 'More variety',
  'incomplete': 'Incomplete',
  'revise': 'Please revise'
};

const POSITIVE_FEEDBACK = ['great-work', 'creative', 'good-effort'];

// Unit styling — matches ClassDetailPage
const UNIT_STYLE = {
  'film-music':        { number: 1, title: 'The Loop Lab',           color: '#3b82f6' },
  'listening-lab':     { number: 2, title: 'The Listening Lab',     color: '#8b5cf6' },
  'production-studio': { number: 3, title: 'The Production Studio', color: '#f97316' },
};

// Grade percentage → color
const getPercentColor = (pct) => {
  if (pct >= 80) return { text: 'text-green-700', bg: 'bg-green-500' };
  if (pct >= 60) return { text: 'text-blue-700', bg: 'bg-blue-500' };
  if (pct >= 40) return { text: 'text-amber-700', bg: 'bg-amber-500' };
  return { text: 'text-red-700', bg: 'bg-red-500' };
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const StudentClasswork = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentStudentInfo, isPinAuth } = useStudentAuth();
  const [grades, setGrades] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState(() => CURRICULUM.map(u => u.id));
  const [conductedLessonIds, setConductedLessonIds] = useState(null);

  // Real-time listener for grades so they update automatically when teacher saves
  useEffect(() => {
    if (!isAuthenticated || !isPinAuth || !currentStudentInfo?.classId) return;

    const db = getDatabase();
    const seatUid = `seat-${currentStudentInfo.seatNumber}`;
    const gradesRef = ref(db, `grades/${currentStudentInfo.classId}/${seatUid}`);

    const unsubscribe = onValue(gradesRef, (snapshot) => {
      setGrades(snapshot.exists() ? snapshot.val() : {});
    }, (error) => {
      console.error('Error listening to grades:', error);
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentStudentInfo?.classId, currentStudentInfo?.seatNumber, isPinAuth]);

  // Fetch submissions, conducted lessons, and local work (one-time)
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !currentStudentInfo?.classId) {
        setLoading(false);
        return;
      }

      try {
        const seatUid = `seat-${currentStudentInfo.seatNumber}`;
        const pinUid = `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`;

        const conducted = await getConductedLessons(currentStudentInfo.classId);
        setConductedLessonIds(conducted);

        let subs = await getStudentSubmissions(currentStudentInfo.classId, seatUid);
        if (!subs || subs.length === 0) {
          subs = await getStudentSubmissions(currentStudentInfo.classId, pinUid);
        }

        const localWork = getAllStudentWork();
        const existingKeys = new Set((subs || []).map(s => `${s.lessonId}::${s.activityId}`));

        for (const item of localWork) {
          const { lessonId, activityId: mappedActivityId } = parseActivityId(item.activityId);
          if (lessonId !== 'unknown' && !existingKeys.has(`${lessonId}::${mappedActivityId}`)) {
            subs.push({
              lessonId,
              activityId: mappedActivityId,
              studentUid: seatUid,
              status: 'pending',
              submittedAt: item.lastSaved ? new Date(item.lastSaved).getTime() : Date.now(),
              source: 'local'
            });
            existingKeys.add(`${lessonId}::${mappedActivityId}`);

            saveStudentWork(item.activityId, {
              title: item.title,
              emoji: item.emoji,
              viewRoute: item.viewRoute,
              subtitle: item.subtitle,
              category: item.category,
              data: item.data
            }, null, { uid: seatUid, classId: currentStudentInfo.classId });
          }
        }

        setSubmissions(subs || []);
      } catch (error) {
        console.error('Error fetching classwork data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, currentStudentInfo, isPinAuth]);

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev =>
      prev.includes(unitId) ? prev.filter(id => id !== unitId) : [...prev, unitId]
    );
  };

  const toggleActivity = (key) => {
    setExpandedActivity(expandedActivity === key ? null : key);
  };

  const getSubmission = (lessonId, activityId) => {
    return submissions.find(s => s.lessonId === lessonId && s.activityId === activityId);
  };

  const getGrade = (lessonId) => {
    return grades[lessonId] || null;
  };

  const hasSubmission = (lessonId, activityId) => {
    return submissions.some(s => s.lessonId === lessonId && s.activityId === activityId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Build assignment list per unit, grouped by lesson
  const activeUnits = CURRICULUM.map(unit => {
    const lessonGroups = [];

    for (const lesson of unit.lessons) {
      if (!lesson.route) continue;
      if (conductedLessonIds && !conductedLessonIds.has(lesson.id)) continue;

      const assignments = [];
      for (const activity of lesson.activities) {
        if (activity.type !== 'composition' && activity.type !== 'reflection') continue;
        if (!hasSubmission(lesson.id, activity.id)) continue;

        const sub = getSubmission(lesson.id, activity.id);
        const grade = getGrade(lesson.id);
        const isGraded = sub?.status === 'graded' && grade?.points !== undefined;

        assignments.push({
          key: `${lesson.id}-${activity.id}`,
          lessonId: lesson.id,
          activityId: activity.id,
          name: activity.name,
          lessonName: lesson.name,
          route: lesson.route,
          type: activity.type,
          submission: sub,
          grade,
          isGraded,
        });
      }

      if (assignments.length > 0) {
        lessonGroups.push({
          lessonId: lesson.id,
          lessonName: lesson.name,
          assignments,
        });
      }
    }

    if (lessonGroups.length === 0) return null;
    const totalAssignments = lessonGroups.reduce((sum, lg) => sum + lg.assignments.length, 0);
    return { ...unit, lessonGroups, totalAssignments };
  }).filter(Boolean);

  if (activeUnits.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-2">No assignments yet</p>
        <p className="text-gray-400 text-sm">
          Your assignments will appear here after you complete activities in class.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeUnits.map(unit => {
        const style = UNIT_STYLE[unit.id] || { number: null, title: unit.name, color: '#6b7280' };
        const isExpanded = expandedUnits.includes(unit.id);

        return (
          <div key={unit.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Colored top bar */}
            <div className="h-1" style={{ backgroundColor: style.color }} />

            {/* Unit Header */}
            <button
              onClick={() => toggleUnit(unit.id)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown size={18} style={{ color: style.color }} />
                ) : (
                  <ChevronRight size={18} style={{ color: style.color }} />
                )}
                <div>
                  {style.number && (
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: style.color }}>
                      Unit {style.number}
                    </div>
                  )}
                  <div className="font-bold text-gray-900 text-left">{style.title}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{unit.totalAssignments} assignment{unit.totalAssignments !== 1 ? 's' : ''}</span>
            </button>

            {/* Assignment list grouped by lesson */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {unit.lessonGroups.map((lessonGroup) => (
                  <div key={lessonGroup.lessonId}>
                    {/* Lesson sub-header */}
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                      <BookOpen size={14} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {lessonGroup.lessonName}
                      </span>
                    </div>

                    {/* Assignments within this lesson */}
                    <div className="divide-y divide-gray-100">
                      {lessonGroup.assignments.map(assignment => {
                        const isActivityExpanded = expandedActivity === assignment.key;
                        const pct = assignment.isGraded ? Math.round((assignment.grade.points / assignment.grade.maxPoints) * 100) : null;

                        return (
                          <div key={assignment.key}>
                            <button
                              onClick={() => toggleActivity(assignment.key)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              {/* Status icon */}
                              {assignment.isGraded ? (
                                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                              ) : (
                                <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 flex-shrink-0" />
                              )}

                              {/* Assignment name */}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{assignment.name}</div>
                              </div>

                              {/* Grade or Not Graded */}
                              {assignment.isGraded ? (
                                <span className={`text-sm font-bold tabular-nums ${getPercentColor(pct).text}`}>
                                  {assignment.grade.points}/{assignment.grade.maxPoints}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Not Graded</span>
                              )}

                              {/* Expand chevron */}
                              {isActivityExpanded
                                ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                                : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                              }
                            </button>

                            {/* Expanded detail panel */}
                            {isActivityExpanded && (
                              <div className="px-4 pb-4 pt-1 pl-11 space-y-3 bg-gray-50/50">
                                {/* Points bar */}
                                {assignment.isGraded && (
                                  <div>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                      <span>Score</span>
                                      <span>{assignment.grade.points} out of {assignment.grade.maxPoints}</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${getPercentColor(pct).bg}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Rubric criteria */}
                                {assignment.grade?.rubricCriteria?.length > 0 && (
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-gray-500">Rubric</p>
                                    {assignment.grade.rubricCriteria.map((c, i) => (
                                      <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">{c.name}</span>
                                        <span className="text-gray-500 tabular-nums">
                                          {c.levelPoints !== undefined ? c.levelPoints : '--'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Quick feedback chips */}
                                {assignment.grade?.quickFeedback?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {assignment.grade.quickFeedback.map(id => (
                                      <span
                                        key={id}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                          POSITIVE_FEEDBACK.includes(id)
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}
                                      >
                                        {FEEDBACK_LABELS[id] || id}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Written feedback */}
                                {assignment.grade?.feedback && (
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs text-gray-500 mb-0.5">Teacher Feedback:</p>
                                      <p className="text-sm text-gray-800">{assignment.grade.feedback}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Dates */}
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  {assignment.submission?.submittedAt && (
                                    <span>Submitted {formatDate(assignment.submission.submittedAt)}</span>
                                  )}
                                  {assignment.grade?.gradedAt && (
                                    <span>Graded {formatDate(assignment.grade.gradedAt)}</span>
                                  )}
                                </div>

                                {/* View Work / Edit & Resubmit */}
                                {assignment.route && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`${assignment.route}?view=saved`);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      <Eye size={13} />
                                      View My Work
                                    </button>
                                    {assignment.isGraded && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`${assignment.route}?view=saved&resubmit=true`);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                      >
                                        <PenLine size={13} />
                                        Edit & Resubmit
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudentClasswork;
