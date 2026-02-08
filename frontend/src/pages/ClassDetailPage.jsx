// Class Detail Page
// src/pages/ClassDetailPage.jsx
// Google Classroom-style: click into a class to see students, grades, work
// Uses CURRICULUM config for Unit → Lesson → Activity organization

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getClassById } from '../firebase/classes';
import { getClassRoster } from '../firebase/enrollments';
import { getAllClassSubmissions, getClassGrades, gradeSubmission } from '../firebase/grades';
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
  Lock,
  Loader2,
  Download
} from 'lucide-react';
import TeacherHeader from '../components/teacher/TeacherHeader';
import RosterManager from '../components/teacher/RosterManager';
import StudentDetailModal from '../components/teacher/StudentDetailModal';
import GradeEntryModal from '../components/teacher/GradeEntryModal';
import ActivityGradingView from '../components/teacher/ActivityGradingView';
import PrintableLoginCards from '../components/teacher/PrintableLoginCards';
import { seedDynamicsListeningMap } from '../utils/seedTestSubmissions';

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
  const [activityGradingData, setActivityGradingData] = useState(null);

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
    // Don't close modals here — auto-save calls this frequently.
    // Modals have their own close buttons.
    refreshData();
  };

  // Quick grade on Students tab
  const [quickGradeActivity, setQuickGradeActivity] = useState(null); // { lessonId, activityId, lessonName, activityName, activityType }
  const [quickGradeMaxPoints, setQuickGradeMaxPoints] = useState('100');
  const [quickGradeInputs, setQuickGradeInputs] = useState({});
  const [quickGradeSaving, setQuickGradeSaving] = useState({});
  const [quickGradeSaved, setQuickGradeSaved] = useState({});

  // Build list of all activities that have at least one submission
  const allActivitiesWithSubs = [];
  CURRICULUM.forEach(unit => {
    unit.lessons.forEach(lesson => {
      if (!lesson.route) return;
      lesson.activities.forEach(activity => {
        const hasSubs = submissions.some(s => s.lessonId === lesson.id && s.activityId === activity.id);
        if (hasSubs) {
          allActivitiesWithSubs.push({
            lessonId: lesson.id,
            activityId: activity.id,
            lessonName: lesson.name,
            activityName: activity.name,
            activityType: activity.type,
            label: `${activity.name} (${lesson.name})`
          });
        }
      });
    });
  });

  const initQuickGrade = (activityInfo) => {
    if (!activityInfo) {
      setQuickGradeActivity(null);
      setQuickGradeInputs({});
      return;
    }
    setQuickGradeActivity(activityInfo);
    const initial = {};
    let detectedMax = null;
    roster.forEach(student => {
      const uid = getEffectiveUid(student);
      const grade = grades[uid]?.[activityInfo.lessonId];
      if (grade?.points !== undefined) {
        initial[uid] = grade.points.toString();
        if (grade.maxPoints && !detectedMax) detectedMax = grade.maxPoints.toString();
      }
    });
    setQuickGradeInputs(initial);
    if (detectedMax) setQuickGradeMaxPoints(detectedMax);
    setQuickGradeSaving({});
    setQuickGradeSaved({});
  };

  const saveQuickGrade = async (studentUid) => {
    if (!quickGradeActivity) return;
    const value = quickGradeInputs[studentUid];
    if (!value || value.trim() === '') return;
    const pts = parseInt(value, 10);
    if (isNaN(pts)) return;
    const maxPts = parseInt(quickGradeMaxPoints, 10) || 100;

    setQuickGradeSaving(prev => ({ ...prev, [studentUid]: true }));
    setQuickGradeSaved(prev => ({ ...prev, [studentUid]: false }));
    try {
      const gradeData = {
        type: 'points',
        points: pts,
        maxPoints: maxPts,
        grade: `${pts}/${maxPts}`,
        quickFeedback: grades[studentUid]?.[quickGradeActivity.lessonId]?.quickFeedback || [],
        feedback: grades[studentUid]?.[quickGradeActivity.lessonId]?.feedback || null,
        activityId: quickGradeActivity.activityId,
        activityType: quickGradeActivity.activityType || 'composition'
      };
      const result = await gradeSubmission(classId, studentUid, quickGradeActivity.lessonId, gradeData, user.uid);
      handleGradeSaved(studentUid, quickGradeActivity.lessonId, result);
      setQuickGradeSaved(prev => ({ ...prev, [studentUid]: true }));
      setTimeout(() => setQuickGradeSaved(prev => ({ ...prev, [studentUid]: false })), 2000);
    } catch (err) {
      console.error('Error saving quick grade:', err);
    } finally {
      setQuickGradeSaving(prev => ({ ...prev, [studentUid]: false }));
    }
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
                <span>Gradebook</span>
                <span>·</span>
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
              <h2 className="text-lg font-semibold text-gray-900">
                Classwork
              </h2>
              <div className="flex items-center gap-3">
                {totalPending > 0 && (
                  <span className="text-sm text-amber-600 font-medium">
                    {totalPending} total to grade
                  </span>
                )}
                {/* TEMP: Seed test data button - remove after testing */}
                <button
                  onClick={async () => {
                    if (roster.length === 0) { alert('Add students to roster first'); return; }
                    try {
                      const count = await seedDynamicsListeningMap(classId, roster);
                      alert(`Seeded ${count} submissions! Refreshing...`);
                      window.location.reload();
                    } catch (err) {
                      alert('Seed error: ' + err.message);
                      console.error('Seed error:', err);
                    }
                  }}
                  className="px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                >
                  Seed Test Data
                </button>
              </div>
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
                                        className="px-4 py-3 pl-20 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
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
                                            <div className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors">
                                              {activity.name}
                                            </div>
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
        {activeTab === 'grades' && (() => {
          // Build lesson columns from CURRICULUM (only built lessons)
          const gradebookLessons = CURRICULUM.flatMap(unit =>
            unit.lessons
              .filter(l => l.activities.length > 0)
              .map(l => ({ id: l.id, name: l.shortName || l.name, unitIcon: unit.icon, unitName: unit.shortName }))
          );

          const totalGraded = Object.values(grades).reduce((sum, studentGrades) => sum + Object.keys(studentGrades).length, 0);

          // Grade color helper
          const getGradeColor = (points, maxPoints) => {
            const pct = Math.round((points / maxPoints) * 100);
            if (pct >= 80) return 'text-green-700';
            if (pct >= 60) return 'text-blue-700';
            if (pct >= 40) return 'text-amber-700';
            return 'text-red-700';
          };

          // CSV export
          const exportCSV = () => {
            const headers = ['Student Name', 'Seat', ...gradebookLessons.map(l => `${l.unitIcon} ${l.name}`)];
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Grades
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {totalGraded} graded
                    {totalPending > 0 && (
                      <span className="text-amber-600 ml-1">· {totalPending} pending</span>
                    )}
                  </span>
                </h2>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>

              {/* Pending submissions banner */}
              {totalPending > 0 && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <Clock size={16} />
                    <span>{totalPending} submission{totalPending !== 1 ? 's' : ''} need grading</span>
                  </div>
                </div>
              )}

              {/* Gradebook Table */}
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
                              <span className="text-xs leading-tight">{l.name}</span>
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

                              return (
                                <td key={l.id} className="p-3 text-center">
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

      {/* Activity Grading View (SpeedGrader) */}
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
