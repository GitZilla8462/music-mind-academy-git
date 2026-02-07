// Class Detail Page
// src/pages/ClassDetailPage.jsx
// Google Classroom-style: click into a class to see students, grades, work
// Uses CURRICULUM config for Unit → Lesson → Activity organization

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getClassById } from '../firebase/classes';
import { getClassRoster } from '../firebase/enrollments';
import { getAllClassSubmissions, getClassGrades } from '../firebase/grades';
import { CURRICULUM, getLessonById } from '../config/curriculumConfig';
import {
  ArrowLeft,
  Users,
  ClipboardList,
  BookOpen,
  Copy,
  Check,
  Clock,
  CheckCircle2,
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
  Lock
} from 'lucide-react';
import TeacherHeader from '../components/teacher/TeacherHeader';
import RosterManager from '../components/teacher/RosterManager';
import StudentDetailModal from '../components/teacher/StudentDetailModal';
import GradeEntryModal from '../components/teacher/GradeEntryModal';
import PrintableLoginCards from '../components/teacher/PrintableLoginCards';

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
  const [codeCopied, setCodeCopied] = useState(false);

  // Accordion state: track expanded units and lessons separately
  const [expandedUnits, setExpandedUnits] = useState([]);
  const [expandedLessons, setExpandedLessons] = useState([]);

  // Modal states
  const [showRosterManager, setShowRosterManager] = useState(false);
  const [showPrintCards, setShowPrintCards] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeModalData, setGradeModalData] = useState(null);

  // Sorting state: 'name-asc', 'name-desc', 'seat-asc', 'seat-desc'
  const [sortBy, setSortBy] = useState('seat-asc');

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

  const handleCopyCode = () => {
    const code = classData?.classCode || classData?.code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

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

  const getStudentStatus = (studentUid) => {
    const studentSubs = submissions.filter(s => s.studentUid === studentUid);
    const pending = studentSubs.filter(s => s.status === 'pending' || s.status === 'submitted').length;
    const graded = studentSubs.filter(s => s.status === 'graded').length;
    return { pending, graded, total: studentSubs.length };
  };

  const getActivityStats = (lessonId, activityId) => {
    const activitySubs = submissions.filter(s =>
      s.lessonId === lessonId && s.activityId === activityId
    );
    return {
      submitted: activitySubs.filter(s => s.status === 'submitted' || s.status === 'graded').length,
      graded: activitySubs.filter(s => s.status === 'graded').length,
      pending: activitySubs.filter(s => s.status === 'submitted').length
    };
  };

  // Get aggregate stats for an entire lesson
  const getLessonStats = (lesson) => {
    let submitted = 0;
    let pending = 0;
    let graded = 0;
    lesson.activities.forEach(activity => {
      const stats = getActivityStats(lesson.id, activity.id);
      submitted += stats.submitted;
      pending += stats.pending;
      graded += stats.graded;
    });
    return { submitted, pending, graded };
  };

  // Get aggregate stats for an entire unit
  const getUnitStats = (unit) => {
    let submitted = 0;
    let pending = 0;
    let graded = 0;
    let lessonsWithSubmissions = 0;
    unit.lessons.forEach(lesson => {
      const stats = getLessonStats(lesson);
      submitted += stats.submitted;
      pending += stats.pending;
      graded += stats.graded;
      if (stats.submitted > 0) lessonsWithSubmissions++;
    });
    return { submitted, pending, graded, lessonsWithSubmissions };
  };

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

  const handleGradeSaved = (studentUid, lessonId, gradeData) => {
    setGrades(prev => ({
      ...prev,
      [studentUid]: {
        ...(prev[studentUid] || {}),
        [lessonId]: gradeData
      }
    }));
    setGradeModalData(null);
    refreshData();
  };

  const totalPending = submissions.filter(s => s.status === 'pending' || s.status === 'submitted').length;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'game': return Gamepad2;
      case 'composition': return Music;
      case 'reflection': return FileText;
      default: return FileText;
    }
  };

  // For Grades tab: look up lesson/activity from curriculum config
  const findLessonAndActivity = (lessonId, activityId) => {
    const lesson = getLessonById(lessonId);
    if (!lesson) return { lesson: { id: lessonId, name: lessonId }, activity: null };
    const activity = lesson.activities.find(a => a.id === activityId) || null;
    return { lesson, activity };
  };

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

  // Color mapping for unit accent colors
  const unitColorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', headerBg: 'bg-blue-500', headerText: 'text-white', pill: 'bg-blue-100 text-blue-700' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', headerBg: 'bg-purple-500', headerText: 'text-white', pill: 'bg-purple-100 text-purple-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', headerBg: 'bg-green-500', headerText: 'text-white', pill: 'bg-green-100 text-green-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', headerBg: 'bg-orange-500', headerText: 'text-white', pill: 'bg-orange-100 text-orange-700' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', headerBg: 'bg-teal-500', headerText: 'text-white', pill: 'bg-teal-100 text-teal-700' },
  };

  const getUnitColors = (color) => unitColorMap[color] || unitColorMap.blue;

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherHeader pendingCount={totalPending} />

      {/* Class Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Classes
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{classData.name}</h1>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <span>{roster.length} students</span>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => navigate('/music-classroom-resources')}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-colors"
              >
                <Play size={18} fill="currentColor" />
                Start Lesson
              </button>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 mt-2 text-white/70 hover:text-white text-sm transition-colors mx-auto"
              >
                <span className="font-mono font-medium">
                  Code: {classData.classCode || classData.code || '----'}
                </span>
                {codeCopied ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users size={16} />
                Students
              </span>
            </button>
            <button
              onClick={() => setActiveTab('classwork')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'classwork'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen size={16} />
                Classwork
              </span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'grades'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <ClipboardList size={16} />
                Grades
                {totalPending > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                    {totalPending}
                  </span>
                )}
              </span>
            </button>
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
                Students ({roster.length})
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
                  Add students to your roster or share the join code.
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
                      <th
                        className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => setSortBy(sortBy === 'seat-asc' ? 'seat-desc' : 'seat-asc')}
                      >
                        <span className="flex items-center gap-1">
                          Seat
                          {sortBy === 'seat-asc' ? <ArrowUp size={12} /> :
                           sortBy === 'seat-desc' ? <ArrowDown size={12} /> :
                           <ArrowUpDown size={12} className="text-gray-300" />}
                        </span>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                        Actions
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
                      .map((student, index) => {
                        const effectiveUid = getEffectiveUid(student);
                        const status = getStudentStatus(effectiveUid);

                        return (
                          <tr
                            key={student.seatNumber || index}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                                  {(student.displayName || student.name || 'S').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {student.displayName || student.name || `Student ${student.seatNumber}`}
                                  </div>
                                  {student.username && (
                                    <div className="text-xs text-blue-500 font-mono">{student.username}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              #{student.seatNumber}
                            </td>
                            <td className="px-4 py-3">
                              {status && status.total > 0 ? (
                                <div className="flex items-center gap-3 text-sm">
                                  {status.pending > 0 && (
                                    <span className="flex items-center gap-1 text-amber-600">
                                      <Clock size={14} />
                                      {status.pending} pending
                                    </span>
                                  )}
                                  {status.graded > 0 && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 size={14} />
                                      {status.graded} graded
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">No submissions</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View Work →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
              <h2 className="text-lg font-semibold text-gray-900">
                Classwork
              </h2>
              {totalPending > 0 && (
                <span className="text-sm text-amber-600 font-medium">
                  {totalPending} total to grade
                </span>
              )}
            </div>

            <div className="space-y-4">
              {CURRICULUM.map((unit) => {
                const isUnitExpanded = expandedUnits.includes(unit.id);
                const unitStats = getUnitStats(unit);
                const colors = getUnitColors(unit.color);
                const builtLessons = unit.lessons.filter(l => l.route).length;

                return (
                  <div key={unit.id} className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                    {/* Unit Header */}
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isUnitExpanded ? (
                          <ChevronDown size={20} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                        <span className="text-lg mr-1">{unit.icon}</span>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">{unit.name}</div>
                          <div className="text-xs text-gray-500">
                            {builtLessons}/{unit.lessons.length} lessons
                            {unitStats.lessonsWithSubmissions > 0 && (
                              <span> · {unitStats.lessonsWithSubmissions} taught</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {unitStats.pending > 0 && (
                          <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">
                            {unitStats.pending} to grade
                          </span>
                        )}
                        {unitStats.submitted > 0 && (
                          <span className="text-gray-500">
                            {unitStats.submitted} submitted
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded Unit: Show Lessons */}
                    {isUnitExpanded && (
                      <div className="border-t border-gray-100">
                        {unit.lessons.map((lesson) => {
                          const isLessonExpanded = expandedLessons.includes(lesson.id);
                          const lessonStats = getLessonStats(lesson);
                          const isBuilt = !!lesson.route;
                          const hasActivities = lesson.activities.length > 0;

                          return (
                            <div key={lesson.id} className="border-b border-gray-50 last:border-b-0">
                              {/* Lesson Header */}
                              <button
                                onClick={() => hasActivities && toggleLesson(lesson.id)}
                                className={`w-full px-4 py-3 pl-10 flex items-center justify-between transition-colors ${
                                  hasActivities ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                                } ${!isBuilt ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-center gap-3">
                                  {hasActivities ? (
                                    isLessonExpanded ? (
                                      <ChevronDown size={16} className="text-gray-400" />
                                    ) : (
                                      <ChevronRight size={16} className="text-gray-400" />
                                    )
                                  ) : (
                                    <Lock size={16} className="text-gray-300" />
                                  )}
                                  <div className="text-left">
                                    <div className="font-semibold text-gray-900 text-sm">{lesson.name}</div>
                                    <div className="text-xs text-gray-500">{lesson.concept}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  {!isBuilt && (
                                    <span className="text-xs text-gray-400 italic">Coming soon</span>
                                  )}
                                  {lessonStats.pending > 0 && (
                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                      {lessonStats.pending} to grade
                                    </span>
                                  )}
                                  {lessonStats.submitted > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {lessonStats.submitted} submitted
                                    </span>
                                  )}
                                  {isBuilt && lessonStats.submitted === 0 && (
                                    <span className="text-xs text-gray-400">No submissions</span>
                                  )}
                                </div>
                              </button>

                              {/* Expanded Lesson: Show Activities */}
                              {isLessonExpanded && hasActivities && (
                                <div className="bg-gray-50/50 divide-y divide-gray-100">
                                  {lesson.activities.map((activity) => {
                                    const stats = getActivityStats(lesson.id, activity.id);
                                    const Icon = getActivityIcon(activity.type);

                                    return (
                                      <div
                                        key={activity.id}
                                        className="px-4 py-3 pl-20 flex items-center justify-between hover:bg-gray-50"
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
                                            <div className="font-medium text-gray-900 text-sm">{activity.name}</div>
                                            <div className="text-xs text-gray-500 capitalize">{activity.type}</div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm">
                                          <span className="text-gray-500 text-xs">
                                            {stats.submitted}/{roster.length} submitted
                                          </span>
                                          {stats.pending > 0 && (
                                            <span className="flex items-center gap-1 text-amber-600 text-xs">
                                              <Clock size={12} />
                                              {stats.pending} pending
                                            </span>
                                          )}
                                          {activity.type === 'composition' && (
                                            <button
                                              onClick={() => navigate(`/teacher/gradebook/${classId}?activity=${activity.id}`)}
                                              className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                                            >
                                              Grade All →
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== Grades Tab ==================== */}
        {activeTab === 'grades' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Grades
                {totalPending > 0 && (
                  <span className="ml-2 text-sm font-normal text-amber-600">
                    ({totalPending} need grading)
                  </span>
                )}
              </h2>
              <button
                onClick={() => navigate(`/teacher/gradebook/${classId}`)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ClipboardList size={16} />
                Full Gradebook
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No submissions yet</h3>
                <p className="text-sm text-gray-500">
                  Student work will appear here when they submit assignments.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions
                  .filter(s => s.status === 'submitted' || s.status === 'pending')
                  .slice(0, 10)
                  .map((submission) => {
                    const student = roster.find(r => getEffectiveUid(r) === submission.studentUid);
                    const { lesson, activity } = findLessonAndActivity(submission.lessonId, submission.activityId);

                    return (
                      <div
                        key={submission.id || `${submission.studentUid}-${submission.lessonId}-${submission.activityId}`}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {student?.displayName || student?.name || 'Unknown Student'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {activity?.name || lesson?.name || 'Assignment'}
                                {lesson?.unitName && (
                                  <span className="text-gray-400"> · {lesson.unitName}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                              Needs grading
                            </span>
                            <button
                              onClick={() => setGradeModalData({
                                student,
                                lesson,
                                activity,
                                submission
                              })}
                              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              Grade
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {submissions.filter(s => s.status === 'submitted' || s.status === 'pending').length > 10 && (
                  <button
                    onClick={() => navigate(`/teacher/gradebook/${classId}`)}
                    className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all submissions →
                  </button>
                )}

                {submissions.filter(s => s.status === 'submitted' || s.status === 'pending').length === 0 && (
                  <div className="bg-green-50 rounded-xl border border-green-200 p-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <h3 className="font-medium text-green-800 mb-1">All caught up!</h3>
                    <p className="text-sm text-green-600">
                      No submissions need grading right now.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Roster Manager Modal */}
      {showRosterManager && (
        <RosterManager
          classId={classId}
          className={classData.name}
          classCode={classData.classCode || classData.code}
          onClose={() => {
            setShowRosterManager(false);
            refreshData();
          }}
        />
      )}

      {/* Print Login Cards Modal */}
      {showPrintCards && roster.length > 0 && (
        <PrintableLoginCards
          roster={roster}
          className={classData.name}
          classCode={classData.classCode || classData.code}
          onClose={() => setShowPrintCards(false)}
        />
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          classId={classId}
          onViewWork={(student, lesson, activity, submission) => {
            console.log('View work:', { student, lesson, activity, submission });
          }}
          onGrade={(student, lesson, activity, submission) => {
            setSelectedStudent(null);
            setGradeModalData({ student, lesson, activity, submission });
          }}
        />
      )}

      {/* Grade Entry Modal */}
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

    </div>
  );
};

export default ClassDetailPage;
