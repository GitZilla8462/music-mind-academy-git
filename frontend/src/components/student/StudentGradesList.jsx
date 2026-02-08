// Student Grades List Component
// src/components/student/StudentGradesList.jsx
// Displays grades grouped by unit → lesson, handles points-based and letter grades

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Award, Loader2, BookOpen, ChevronDown, ChevronRight, Eye, PenLine } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { getStudentGrades } from '../../firebase/grades';
import { CURRICULUM, getActivityById, getLessonById } from '../../config/curriculumConfig';

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

// Grade percentage → color
const getPercentColor = (pct) => {
  if (pct >= 80) return { text: 'text-green-700', bg: 'bg-green-500', badge: 'text-green-700 bg-green-50 border-green-200' };
  if (pct >= 60) return { text: 'text-blue-700', bg: 'bg-blue-500', badge: 'text-blue-700 bg-blue-50 border-blue-200' };
  if (pct >= 40) return { text: 'text-amber-700', bg: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { text: 'text-red-700', bg: 'bg-red-500', badge: 'text-red-700 bg-red-50 border-red-200' };
};

// Letter grade → color
const getLetterColor = (letter) => {
  const colors = {
    A: 'text-green-700 bg-green-50 border-green-200',
    B: 'text-blue-700 bg-blue-50 border-blue-200',
    C: 'text-amber-700 bg-amber-50 border-amber-200',
    D: 'text-orange-700 bg-orange-50 border-orange-200',
    F: 'text-red-700 bg-red-50 border-red-200'
  };
  return colors[letter] || 'text-gray-500 bg-gray-100 border-gray-200';
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const StudentGradesList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentStudentInfo, isPinAuth } = useStudentAuth();
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!isAuthenticated || !isPinAuth || !currentStudentInfo?.classId) {
        setLoading(false);
        return;
      }

      try {
        // Try seat-based UID first (what teacher saves under), then pin-based
        const seatUid = `seat-${currentStudentInfo.seatNumber}`;
        let gradesData = await getStudentGrades(currentStudentInfo.classId, seatUid);

        if (!gradesData || Object.keys(gradesData).length === 0) {
          const pinUid = `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`;
          gradesData = await getStudentGrades(currentStudentInfo.classId, pinUid);
        }

        setGrades(gradesData || {});
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [isAuthenticated, currentStudentInfo, isPinAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  const hasGrades = Object.keys(grades).length > 0;

  if (!hasGrades) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 mb-2">No grades yet</p>
        <p className="text-gray-400 text-sm">
          Your grades will appear here after your teacher reviews your work.
        </p>
      </div>
    );
  }

  // Filter to only units/lessons that have grades
  const gradedUnits = CURRICULUM.map(unit => {
    const gradedLessons = unit.lessons.filter(lesson => grades[lesson.id]);
    if (gradedLessons.length === 0) return null;
    return { ...unit, lessons: gradedLessons };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      {gradedUnits.map(unit => (
        <div key={unit.id}>
          {/* Unit header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{unit.icon}</span>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{unit.shortName}</h3>
          </div>

          <div className="space-y-3">
            {unit.lessons.map(lesson => {
              const grade = grades[lesson.id];
              const isExpanded = expandedLesson === lesson.id;

              // Determine grade display
              const isPoints = grade.points !== undefined && grade.maxPoints;
              const pct = isPoints ? Math.round((grade.points / grade.maxPoints) * 100) : null;
              const isLetter = !isPoints && grade.grade && ['A', 'B', 'C', 'D', 'F'].includes(grade.grade);

              return (
                <div
                  key={lesson.id}
                  className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                >
                  <button
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {(() => {
                          const activity = grade.activityId ? getActivityById(lesson.id, grade.activityId) : null;
                          return activity ? activity.name : (lesson.shortName || lesson.name);
                        })()}
                      </span>
                      {isExpanded
                        ? <ChevronDown size={16} className="text-gray-400" />
                        : <ChevronRight size={16} className="text-gray-400" />
                      }
                    </div>

                    {/* Grade badge */}
                    {isPoints ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getPercentColor(pct).text}`}>
                          {grade.points}/{grade.maxPoints}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getPercentColor(pct).badge}`}>
                          {pct}%
                        </span>
                      </div>
                    ) : isLetter ? (
                      <span className={`text-xl font-bold px-3 py-1 rounded border ${getLetterColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    ) : grade.grade ? (
                      <span className="text-lg font-bold text-gray-700">{grade.grade}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Not graded</span>
                    )}
                  </button>

                  {/* Expanded view */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="pt-3 space-y-3">
                        {/* Points bar */}
                        {isPoints && (
                          <div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Score</span>
                              <span>{grade.points} out of {grade.maxPoints}</span>
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
                        {grade.rubricCriteria?.length > 0 && (
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
                        {grade.quickFeedback?.length > 0 && (
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
                        {grade.feedback ? (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Teacher Feedback:</p>
                              <p className="text-gray-800">{grade.feedback}</p>
                            </div>
                          </div>
                        ) : !grade.quickFeedback?.length ? (
                          <p className="text-sm text-gray-400 italic">No feedback provided</p>
                        ) : null}

                        {grade.gradedAt && (
                          <p className="text-xs text-gray-400">
                            Graded on {formatDate(grade.gradedAt)}
                          </p>
                        )}

                        {/* View Work / Edit & Resubmit */}
                        {lesson.route && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => navigate(`${lesson.route}?view=saved`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Eye size={13} />
                              View My Work
                            </button>
                            <button
                              onClick={() => navigate(`${lesson.route}?view=saved&resubmit=true`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <PenLine size={13} />
                              Edit & Resubmit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentGradesList;
