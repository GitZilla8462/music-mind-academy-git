// Student Classwork Component
// src/components/student/StudentClasswork.jsx
// Simple flat list: Unit → Assignments (no lesson sub-grouping)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Music,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getStudentSubmissions } from '../../firebase/grades';
import { getConductedLessons } from '../../firebase/classes';
import { CURRICULUM } from '../../config/curriculumConfig';
import { getAllStudentWork, saveStudentWork, parseActivityId } from '../../utils/studentWorkStorage';

// Unit styling — matches ClassDetailPage
const UNIT_STYLE = {
  'film-music':          { number: 1, title: 'The Loop Lab',                 color: '#3b82f6' },
  'listening-lab':       { number: 2, title: 'The Listening Lab',           color: '#8b5cf6' },
  'music-journalist':    { number: 3, title: 'The Music Agent',             color: '#0d9488' },
  'film-music-scoring':  { number: 4, title: 'Film Music: Scoring the Story', color: '#f97316' },
  'production-studio':   { number: 5, title: 'The Production Studio',       color: '#ec4899' },
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
  // expandedActivity removed — rows navigate directly now
  const [expandedUnits, setExpandedUnits] = useState([]);
  const [conductedLessonIds, setConductedLessonIds] = useState(null);

  // Real-time listener for grades so they update automatically when teacher saves
  // UID must match getStudentId() format: seat-{classId}-{seatNumber}
  const seatUid = currentStudentInfo?.classId != null && currentStudentInfo?.seatNumber != null
    ? `seat-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`
    : null;

  useEffect(() => {
    if (!isAuthenticated || !isPinAuth || !seatUid) return;

    const db = getDatabase();
    const gradesRef = ref(db, `grades/${currentStudentInfo.classId}/${seatUid}`);

    const unsubscribe = onValue(gradesRef, (snapshot) => {
      setGrades(snapshot.exists() ? snapshot.val() : {});
    }, (error) => {
      console.error('Error listening to grades:', error);
    });

    return () => unsubscribe();
  }, [isAuthenticated, isPinAuth, seatUid, currentStudentInfo?.classId]);

  // Fetch submissions, conducted lessons, and local work (one-time)
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !currentStudentInfo?.classId || !seatUid) {
        setLoading(false);
        return;
      }

      try {
        // Also try legacy UID formats for backward compatibility
        const legacySeatUid = `seat-${currentStudentInfo.seatNumber}`;
        const pinUid = `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`;

        const conducted = await getConductedLessons(currentStudentInfo.classId);
        setConductedLessonIds(conducted);

        // Try correct format first, then legacy formats
        let subs = await getStudentSubmissions(currentStudentInfo.classId, seatUid);
        if (!subs || subs.length === 0) {
          subs = await getStudentSubmissions(currentStudentInfo.classId, legacySeatUid);
        }
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

    for (let li = 0; li < unit.lessons.length; li++) {
      const lesson = unit.lessons[li];
      if (!lesson.route) continue;
      if (conductedLessonIds && !conductedLessonIds.has(lesson.id)) continue;

      const lessonNumber = li + 1;
      const assignments = [];
      for (const activity of lesson.activities) {
        if (activity.type !== 'composition' && activity.type !== 'reflection' && activity.type !== 'exit-ticket' && activity.type !== 'scouting-report') continue;

        const sub = getSubmission(lesson.id, activity.id);
        const grade = getGrade(lesson.id);
        const isGraded = sub?.status === 'graded' && grade?.points !== undefined;

        assignments.push({
          key: `${lesson.id}-${activity.id}`,
          lessonId: lesson.id,
          activityId: activity.id,
          name: activity.name,
          lessonName: lesson.name,
          lessonNumber,
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
          lessonNumber,
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
                    <div className="px-4 py-2 pl-11 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Lesson {lessonGroup.lessonNumber}: {lessonGroup.lessonName}
                      </span>
                    </div>

                    {/* Activities under this lesson */}
                    <div className="divide-y divide-gray-50">
                      {lessonGroup.assignments.map(assignment => {
                        const pct = assignment.isGraded ? Math.round((assignment.grade.points / assignment.grade.maxPoints) * 100) : null;

                        // Icon per activity type, in a colored circle
                        const ActivityIcon = assignment.type === 'reflection' ? MessageSquare
                          : assignment.type === 'exit-ticket' ? ClipboardCheck
                          : Music;

                        return (
                          <button
                            key={assignment.key}
                            onClick={() => {
                              if (!assignment.route) return;
                              if (assignment.type === 'exit-ticket') {
                                navigate(`${assignment.route}?activity=exit-ticket`);
                                return;
                              }
                              const viewParam = assignment.type === 'reflection' ? 'reflection' : 'saved';
                              const activityParam = assignment.activityId ? `&activity=${assignment.activityId}` : '';
                              navigate(`${assignment.route}?view=${viewParam}${activityParam}`);
                            }}
                            className="w-full px-4 py-3.5 pl-14 flex items-center gap-3.5 hover:bg-blue-50 active:bg-blue-100 transition-colors text-left cursor-pointer"
                          >
                            {/* Colored circle icon */}
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: style.color }}
                            >
                              <ActivityIcon size={18} className="text-white" />
                            </div>

                            {/* Name + submitted date */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{assignment.name}</div>
                              <div className="text-xs text-gray-400">
                                {assignment.submission?.submittedAt
                                  ? `Turned in ${formatDate(assignment.submission.submittedAt)}`
                                  : assignment.type === 'exit-ticket' ? 'Not completed' : 'Not started'}
                              </div>
                            </div>

                            {/* Grade — only show when graded */}
                            {assignment.isGraded && (
                              <span className={`text-sm font-bold tabular-nums ${getPercentColor(pct).text}`}>
                                {assignment.grade.points}/{assignment.grade.maxPoints}
                              </span>
                            )}
                          </button>
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
