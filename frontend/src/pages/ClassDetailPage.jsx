// Class Detail Page
// src/pages/ClassDetailPage.jsx
// Google Classroom-style: Students | Classwork | Grades

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getClassById } from '../firebase/classes';
import { getClassRoster } from '../firebase/enrollments';
import { getAllClassSubmissions, getClassGrades, deleteActivitySubmissions } from '../firebase/grades';
import { CURRICULUM } from '../config/curriculumConfig';
import {
  ArrowLeft,
  Users,
  ClipboardList,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Music,
  Gamepad2,
  FileText,
  Play,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Trash2
} from 'lucide-react';
import TeacherHeader from '../components/teacher/TeacherHeader';
import RosterManager from '../components/teacher/RosterManager';
import StudentDetailModal from '../components/teacher/StudentDetailModal';
import GradeEntryModal from '../components/teacher/GradeEntryModal';
import ActivityGradingView from '../components/teacher/ActivityGradingView';
import PrintableLoginCards from '../components/teacher/PrintableLoginCards';

const getActivityIcon = (type) => {
  switch (type) {
    case 'game': return Gamepad2;
    case 'composition': return Music;
    case 'reflection': return FileText;
    default: return FileText;
  }
};

// Unit styling to match MusicClassroomResources page
const UNIT_STYLE = {
  'listening-lab': { number: 1, title: 'The Listening Lab', color: '#8b5cf6' },
  'film-music':    { number: 4, title: 'Music for Media',   color: '#3b82f6' },
};

const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useFirebaseAuth();

  const [classData, setClassData] = useState(null);
  const [roster, setRoster] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [expandedUnits, setExpandedUnits] = useState([]);

  // Students tab sorting
  const [sortBy, setSortBy] = useState('seat-asc');

  // Modal states
  const [showRosterManager, setShowRosterManager] = useState(false);
  const [showPrintCards, setShowPrintCards] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeModalData, setGradeModalData] = useState(null);
  const [activityGradingData, setActivityGradingData] = useState(null);

  // Handle URL parameter for auto-opening print cards
  useEffect(() => {
    if (searchParams.get('print') === 'true' && roster.length > 0) {
      setShowPrintCards(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, roster.length, setSearchParams]);

  // Fetch all class data
  useEffect(() => {
    const fetchData = async () => {
      if (!classId || !user) return;

      try {
        const classInfo = await getClassById(classId);
        if (!classInfo || classInfo.teacherUid !== user.uid) {
          navigate('/teacher/dashboard');
          return;
        }
        setClassData(classInfo);

        const rosterData = await getClassRoster(classId);
        setRoster(rosterData || []);

        const [subs, gradesData] = await Promise.all([
          getAllClassSubmissions(classId),
          getClassGrades(classId)
        ]);
        setSubmissions(subs || []);
        setGrades(gradesData || {});
      } catch (error) {
        console.error('Error fetching class data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId, user, navigate]);

  const refreshData = async () => {
    if (!classId) return;
    const rosterData = await getClassRoster(classId);
    setRoster(rosterData || []);

    const [subs, gradesData] = await Promise.all([
      getAllClassSubmissions(classId),
      getClassGrades(classId)
    ]);
    setSubmissions(subs || []);
    setGrades(gradesData || {});
  };

  const getEffectiveUid = (student) => {
    return student.studentUid || `seat-${student.seatNumber}`;
  };

  const getActivityStats = (lessonId, activityId) => {
    const activitySubs = submissions.filter(s =>
      s.lessonId === lessonId && s.activityId === activityId
    );
    return {
      submitted: activitySubs.filter(s => s.status === 'submitted' || s.status === 'graded').length,
      pending: activitySubs.filter(s => s.status === 'submitted').length
    };
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleGradeSaved = (studentUid, lessonId, gradeData) => {
    setGrades(prev => ({
      ...prev,
      [studentUid]: {
        ...(prev[studentUid] || {}),
        [lessonId]: gradeData
      }
    }));
    refreshData();
  };

  const handleDeleteActivity = async (lessonId, activityId, activityName) => {
    if (!window.confirm(`Delete all submissions for "${activityName}"? This cannot be undone.`)) return;
    try {
      await deleteActivitySubmissions(classId, lessonId, activityId);
      await refreshData();
    } catch (err) {
      console.error('Error deleting activity submissions:', err);
    }
  };

  const totalPending = submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Class not found</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  // Tabs config
  const tabs = [
    { id: 'students', label: 'Students', icon: Users },
    { id: 'classwork', label: 'Classwork', icon: BookOpen },
    { id: 'grades', label: 'Grades', icon: ClipboardList, badge: totalPending },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherHeader pendingCount={totalPending} />

      {/* Class Header — clean white */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-3 text-sm"
          >
            <ArrowLeft size={16} />
            Classes
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{roster.length} students</p>
            </div>

            <button
              onClick={() => navigate('/music-classroom-resources')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <Play size={16} fill="currentColor" />
              Start Lesson
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ==================== Students Tab ==================== */}
        {activeTab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Roster ({roster.length})
              </h2>
              <div className="flex items-center gap-2">
                {roster.length > 0 && (
                  <button
                    onClick={() => setShowPrintCards(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <CreditCard size={16} />
                    Print Login Cards
                  </button>
                )}
                <button
                  onClick={() => setShowRosterManager(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <UserPlus size={16} />
                  Manage Roster
                </button>
              </div>
            </div>

            {roster.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No students yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add students to your roster or share the class code.
                </p>
                <button
                  onClick={() => setShowRosterManager(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add Students
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th
                        className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none w-16"
                        onClick={() => setSortBy(sortBy === 'seat-asc' ? 'seat-desc' : 'seat-asc')}
                      >
                        <span className="flex items-center gap-1">
                          Seat
                          {sortBy === 'seat-asc' ? <ArrowUp size={12} /> :
                           sortBy === 'seat-desc' ? <ArrowDown size={12} /> :
                           <ArrowUpDown size={12} className="text-gray-300" />}
                        </span>
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => setSortBy(sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
                      >
                        <span className="flex items-center gap-1">
                          Student
                          {sortBy === 'name-asc' ? <ArrowUp size={12} /> :
                           sortBy === 'name-desc' ? <ArrowDown size={12} /> :
                           <ArrowUpDown size={12} className="text-gray-300" />}
                        </span>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Username
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        PIN
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...roster]
                      .sort((a, b) => {
                        const nameA = (a.displayName || a.name || '').toLowerCase();
                        const nameB = (b.displayName || b.name || '').toLowerCase();
                        if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
                        if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
                        if (sortBy === 'seat-asc') return a.seatNumber - b.seatNumber;
                        if (sortBy === 'seat-desc') return b.seatNumber - a.seatNumber;
                        return 0;
                      })
                      .map((student, index) => (
                        <tr
                          key={student.seatNumber || index}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-600 w-16">
                            #{student.seatNumber}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                                {(student.displayName || student.name || 'S').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900">
                                {student.displayName || student.name || `Student ${student.seatNumber}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">
                            {student.username || '--'}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">
                            {student.pin || '--'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== Classwork Tab ==================== */}
        {activeTab === 'classwork' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Classwork</h2>
              {totalPending > 0 && (
                <span className="text-sm text-amber-600 font-medium">
                  {totalPending} to grade
                </span>
              )}
            </div>

            <div className="space-y-3">
              {CURRICULUM.map((unit) => {
                const isExpanded = expandedUnits.includes(unit.id);

                // Only include activities that have at least one submission
                const unitActivities = [];
                let unitPending = 0;
                unit.lessons.forEach(lesson => {
                  if (!lesson.route || lesson.activities.length === 0) return;
                  lesson.activities.forEach(activity => {
                    const stats = getActivityStats(lesson.id, activity.id);
                    if (stats.submitted > 0) {
                      unitActivities.push({ ...activity, lesson, stats });
                      unitPending += stats.pending;
                    }
                  });
                });

                // Hide units with no submissions at all
                if (unitActivities.length === 0) return null;

                const style = UNIT_STYLE[unit.id] || { number: null, title: unit.name, color: '#6b7280' };

                return (
                  <div key={unit.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Colored top bar */}
                    <div className="h-1" style={{ backgroundColor: style.color }} />

                    {/* Topic Header */}
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
                      {unitPending > 0 && (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {unitPending} to grade
                        </span>
                      )}
                    </button>

                    {/* Flat activity list */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {unitActivities.map(({ lesson, stats, ...activity }) => {
                            const Icon = getActivityIcon(activity.type);

                            return (
                              <div
                                key={`${lesson.id}-${activity.id}`}
                                className="px-4 py-3 pl-12 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => setActivityGradingData({
                                  lessonId: lesson.id,
                                  activityId: activity.id,
                                  lessonName: lesson.name,
                                  activityName: activity.name,
                                  activityType: activity.type
                                })}
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
                                    <div className="text-xs text-gray-400">
                                      {lesson.shortName || lesson.name}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-gray-400">
                                    {stats.submitted}/{roster.length}
                                  </span>
                                  {stats.pending > 0 && (
                                    <span className="flex items-center gap-1 text-amber-600">
                                      <Clock size={12} />
                                      {stats.pending}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteActivity(lesson.id, activity.id, activity.name);
                                    }}
                                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                    title="Delete all submissions"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty state when no submissions exist */}
              {submissions.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No submissions yet</h3>
                  <p className="text-sm text-gray-500">
                    Assignments will appear here once students submit work.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== Grades Tab ==================== */}
        {activeTab === 'grades' && (() => {
          const gradebookLessons = CURRICULUM.flatMap(unit =>
            unit.lessons
              .filter(l => l.activities.length > 0)
              .map(l => ({ ...l, unitIcon: unit.icon }))
          );

          const getGradeColor = (points, maxPoints) => {
            const pct = Math.round((points / maxPoints) * 100);
            if (pct >= 80) return 'text-green-700';
            if (pct >= 60) return 'text-blue-700';
            if (pct >= 40) return 'text-amber-700';
            return 'text-red-700';
          };

          // Find first gradable activity for a lesson (for clickable cells)
          const getFirstActivity = (lesson) => {
            return lesson.activities.find(a => a.type === 'composition') || lesson.activities[0] || null;
          };

          const exportCSV = () => {
            const headers = ['Student Name', 'Seat', ...gradebookLessons.map(l => `${l.unitIcon} ${l.shortName || l.name}`)];
            const rows = roster.map(student => {
              const uid = getEffectiveUid(student);
              const name = student.displayName || `Seat ${student.seatNumber}`;
              const lessonGrades = gradebookLessons.map(l => {
                const g = grades[uid]?.[l.id];
                if (!g) return '';
                if (g.points !== undefined && g.maxPoints) return `${g.points}/${g.maxPoints}`;
                return g.grade || '';
              });
              return [name, student.seatNumber, ...lessonGrades];
            });

            const csv = [headers, ...rows].map(row =>
              row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            ).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${classData?.name || 'grades'}-gradebook.csv`;
            a.click();
            URL.revokeObjectURL(url);
          };

          return (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Grades</h2>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left p-3 font-medium text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[160px]">
                          Student
                        </th>
                        {gradebookLessons.map(l => (
                          <th key={l.id} className="p-3 font-medium text-gray-700 text-center min-w-[90px]">
                            <div className="flex flex-col items-center">
                              <span className="text-xs">{l.unitIcon}</span>
                              <span className="text-xs leading-tight">{l.shortName || l.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {roster.map(student => {
                        const uid = getEffectiveUid(student);
                        return (
                          <tr key={student.seatNumber} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                              {student.displayName || `Seat ${student.seatNumber}`}
                            </td>
                            {gradebookLessons.map(l => {
                              const g = grades[uid]?.[l.id];
                              const sub = submissions.find(s => s.studentUid === uid && s.lessonId === l.id);
                              const isPending = sub && (sub.status === 'pending' || sub.status === 'submitted');
                              const firstActivity = getFirstActivity(l);
                              const isClickable = (isPending || g) && firstActivity;

                              return (
                                <td
                                  key={l.id}
                                  className={`p-3 text-center ${isClickable ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''}`}
                                  onClick={() => {
                                    if (isClickable) {
                                      setActivityGradingData({
                                        lessonId: l.id,
                                        activityId: firstActivity.id,
                                        lessonName: l.name,
                                        activityName: firstActivity.name,
                                        activityType: firstActivity.type
                                      });
                                    }
                                  }}
                                >
                                  {g && g.points !== undefined && g.maxPoints ? (
                                    <span className={`font-bold tabular-nums ${getGradeColor(g.points, g.maxPoints)}`}>
                                      {g.points}/{g.maxPoints}
                                    </span>
                                  ) : g?.grade ? (
                                    <span className="font-bold text-gray-700">{g.grade}</span>
                                  ) : isPending ? (
                                    <Clock size={14} className="text-amber-500 mx-auto" />
                                  ) : (
                                    <span className="text-gray-300">--</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* ==================== Modals ==================== */}
      {showRosterManager && (
        <RosterManager
          classId={classId}
          className={classData.name}
          onClose={() => {
            setShowRosterManager(false);
            refreshData();
          }}
        />
      )}

      {showPrintCards && roster.length > 0 && (
        <PrintableLoginCards
          roster={roster}
          className={classData.name}
          onClose={() => setShowPrintCards(false)}
        />
      )}

      {selectedStudent && (
        <StudentDetailModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          classId={classId}
          onViewWork={(student, lesson, activity, submission) => {
            setSelectedStudent(null);
            setActivityGradingData({
              lessonId: lesson.id,
              activityId: activity.id,
              lessonName: lesson.name,
              activityName: activity.name,
              activityType: activity.type
            });
          }}
          onGrade={(student, lesson, activity, submission) => {
            setSelectedStudent(null);
            setGradeModalData({ student, lesson, activity, submission });
          }}
        />
      )}

      {gradeModalData && (
        <GradeEntryModal
          isOpen={!!gradeModalData}
          onClose={() => setGradeModalData(null)}
          student={gradeModalData.student}
          lesson={gradeModalData.lesson}
          activity={gradeModalData.activity}
          classId={classId}
          currentGrade={grades[gradeModalData.student ? getEffectiveUid(gradeModalData.student) : null]?.[gradeModalData.lesson?.id]}
          submission={gradeModalData.submission}
          onSave={handleGradeSaved}
        />
      )}

      {activityGradingData && (
        <ActivityGradingView
          isOpen={!!activityGradingData}
          onClose={() => setActivityGradingData(null)}
          classId={classId}
          lessonId={activityGradingData.lessonId}
          activityId={activityGradingData.activityId}
          lessonName={activityGradingData.lessonName}
          activityName={activityGradingData.activityName}
          activityType={activityGradingData.activityType}
          roster={roster}
          submissions={submissions}
          grades={grades}
          onGradeSaved={(studentUid, lessonId, gradeData) => {
            handleGradeSaved(studentUid, lessonId, gradeData);
          }}
        />
      )}
    </div>
  );
};

export default ClassDetailPage;
