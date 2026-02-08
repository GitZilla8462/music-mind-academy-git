// Student Classwork Component
// src/components/student/StudentClasswork.jsx
// Google Classroom-style view: all activities by unit/lesson with status + grades

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Circle,
  PenLine,
  Gamepad2,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { getStudentGrades, getStudentSubmissions } from '../../firebase/grades';
import { CURRICULUM } from '../../config/curriculumConfig';

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

// Activity type → badge config
const TYPE_BADGES = {
  game: { label: 'Game', color: 'bg-purple-100 text-purple-700', icon: Gamepad2 },
  composition: { label: 'Create', color: 'bg-blue-100 text-blue-700', icon: PenLine },
  reflection: { label: 'Reflect', color: 'bg-teal-100 text-teal-700', icon: MessageSquare }
};

// Grade percentage → color
const getPercentColor = (pct) => {
  if (pct >= 80) return { text: 'text-green-700', bg: 'bg-green-500', badge: 'text-green-700 bg-green-50' };
  if (pct >= 60) return { text: 'text-blue-700', bg: 'bg-blue-500', badge: 'text-blue-700 bg-blue-50' };
  if (pct >= 40) return { text: 'text-amber-700', bg: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50' };
  return { text: 'text-red-700', bg: 'bg-red-500', badge: 'text-red-700 bg-red-50' };
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const StudentClasswork = () => {
  const { isAuthenticated, currentStudentInfo, isPinAuth } = useStudentAuth();
  const [grades, setGrades] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [collapsedUnits, setCollapsedUnits] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !isPinAuth || !currentStudentInfo?.classId) {
        setLoading(false);
        return;
      }

      try {
        const seatUid = `seat-${currentStudentInfo.seatNumber}`;
        const pinUid = `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`;

        // Fetch grades — try seat UID first, then pin UID
        let gradesData = await getStudentGrades(currentStudentInfo.classId, seatUid);
        if (!gradesData || Object.keys(gradesData).length === 0) {
          gradesData = await getStudentGrades(currentStudentInfo.classId, pinUid);
        }
        setGrades(gradesData || {});

        // Fetch submissions — try seat UID first, then pin UID
        let subs = await getStudentSubmissions(currentStudentInfo.classId, seatUid);
        if (!subs || subs.length === 0) {
          subs = await getStudentSubmissions(currentStudentInfo.classId, pinUid);
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
    setCollapsedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleActivity = (key) => {
    setExpandedActivity(expandedActivity === key ? null : key);
  };

  // Get submission for an activity
  const getSubmission = (lessonId, activityId) => {
    return submissions.find(s => s.lessonId === lessonId && s.activityId === activityId);
  };

  // Get grade for a lesson
  const getGrade = (lessonId) => {
    return grades[lessonId] || null;
  };

  // Determine activity status
  const getActivityStatus = (lessonId, activityId) => {
    const sub = getSubmission(lessonId, activityId);
    if (!sub) return 'not-started';
    if (sub.status === 'graded') return 'graded';
    if (sub.status === 'pending' || sub.status === 'submitted') return 'submitted';
    return 'in-progress';
  };

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'graded':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'submitted':
        return <Clock size={16} className="text-amber-500" />;
      case 'in-progress':
        return <PenLine size={16} className="text-blue-500" />;
      default:
        return <Circle size={16} className="text-gray-300" />;
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'graded': return 'Graded';
      case 'submitted': return 'Submitted';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Filter to units with built lessons (have activities)
  const activeUnits = CURRICULUM.filter(unit =>
    unit.lessons.some(l => l.activities.length > 0)
  );

  if (activeUnits.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-2">No assignments yet</p>
        <p className="text-gray-400 text-sm">
          Your assignments will appear here when your teacher assigns them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeUnits.map(unit => {
        const isCollapsed = collapsedUnits[unit.id];
        const activeLessons = unit.lessons.filter(l => l.activities.length > 0);

        return (
          <div key={unit.id}>
            {/* Unit header */}
            <button
              onClick={() => toggleUnit(unit.id)}
              className="flex items-center gap-2 mb-3 group"
            >
              <span className="text-lg">{unit.icon}</span>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
                {unit.shortName}
              </h3>
              {isCollapsed
                ? <ChevronRight size={14} className="text-gray-400" />
                : <ChevronDown size={14} className="text-gray-400" />
              }
            </button>

            {!isCollapsed && (
              <div className="space-y-4">
                {activeLessons.map(lesson => {
                  const grade = getGrade(lesson.id);

                  return (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Lesson header */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-800 text-sm">{lesson.name}</span>
                          </div>
                          {/* Overall lesson grade if exists */}
                          {grade && grade.points !== undefined && grade.maxPoints && (
                            <span className={`text-sm font-bold ${getPercentColor(Math.round((grade.points / grade.maxPoints) * 100)).text}`}>
                              {grade.points}/{grade.maxPoints}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Activity rows */}
                      <div className="divide-y divide-gray-100">
                        {lesson.activities.map(activity => {
                          const actKey = `${lesson.id}-${activity.id}`;
                          const status = getActivityStatus(lesson.id, activity.id);
                          const sub = getSubmission(lesson.id, activity.id);
                          const isExpanded = expandedActivity === actKey;
                          const badge = TYPE_BADGES[activity.type] || TYPE_BADGES.game;
                          const BadgeIcon = badge.icon;

                          return (
                            <div key={activity.id}>
                              <button
                                onClick={() => toggleActivity(actKey)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                              >
                                <StatusIcon status={status} />

                                <span className="flex-1 text-sm text-gray-800">
                                  {activity.name}
                                </span>

                                {/* Type badge */}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                                  <BadgeIcon size={10} />
                                  {badge.label}
                                </span>

                                {/* Grade display */}
                                {status === 'graded' && grade && grade.points !== undefined ? (
                                  <span className={`text-sm font-bold tabular-nums ${getPercentColor(Math.round((grade.points / grade.maxPoints) * 100)).text}`}>
                                    {grade.points}/{grade.maxPoints}
                                  </span>
                                ) : (
                                  <span className={`text-xs ${
                                    status === 'submitted' ? 'text-amber-600' :
                                    status === 'in-progress' ? 'text-blue-600' :
                                    'text-gray-400'
                                  }`}>
                                    {statusLabel(status)}
                                  </span>
                                )}

                                {(status === 'graded' || status === 'submitted') && (
                                  isExpanded
                                    ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                                    : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                                )}
                              </button>

                              {/* Expanded detail */}
                              {isExpanded && (status === 'graded' || status === 'submitted') && (
                                <div className="px-4 pb-3 pl-10 space-y-3">
                                  {/* Points bar */}
                                  {grade && grade.points !== undefined && grade.maxPoints && (
                                    <div>
                                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Score</span>
                                        <span>{grade.points} out of {grade.maxPoints}</span>
                                      </div>
                                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${getPercentColor(Math.round((grade.points / grade.maxPoints) * 100)).bg}`}
                                          style={{ width: `${Math.min(Math.round((grade.points / grade.maxPoints) * 100), 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Rubric criteria */}
                                  {grade?.rubricCriteria?.length > 0 && (
                                    <div className="space-y-1.5">
                                      <p className="text-xs font-medium text-gray-500">Rubric</p>
                                      {grade.rubricCriteria.map((c, i) => (
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
                                  {grade?.quickFeedback?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {grade.quickFeedback.map(id => (
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
                                  {grade?.feedback && (
                                    <div className="flex items-start gap-2">
                                      <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Teacher Feedback:</p>
                                        <p className="text-sm text-gray-800">{grade.feedback}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Dates */}
                                  <div className="flex items-center gap-4 text-xs text-gray-400">
                                    {sub?.submittedAt && (
                                      <span>Submitted {formatDate(sub.submittedAt)}</span>
                                    )}
                                    {grade?.gradedAt && (
                                      <span>Graded {formatDate(grade.gradedAt)}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
  );
};

export default StudentClasswork;
