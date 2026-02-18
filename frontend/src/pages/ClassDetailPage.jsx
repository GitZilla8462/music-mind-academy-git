// Class Detail Page
// src/pages/ClassDetailPage.jsx
// Google Classroom-style: Students | Classwork | Grades

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getClassById, getConductedLessons } from '../firebase/classes';
import { getClassRoster } from '../firebase/enrollments';
import { getAllClassSubmissions, getClassGrades, deleteActivitySubmissions, deleteGrade } from '../firebase/grades';
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
  Trash2,
  AlertTriangle,
  Loader2,
  Key
} from 'lucide-react';
import TeacherHeader from '../components/teacher/TeacherHeader';
import RosterManager from '../components/teacher/RosterManager';
import StudentDetailModal from '../components/teacher/StudentDetailModal';
import GradeEntryModal from '../components/teacher/GradeEntryModal';
import ActivityGradingView from '../components/teacher/ActivityGradingView';
import AnswerKeyModal from '../components/teacher/AnswerKeyModal';
import PrintableLoginCards from '../components/teacher/PrintableLoginCards';
import { getAllAnswerKeys } from '../firebase/answerKeys';

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
  'film-music':        { number: 1, title: 'The Loop Lab',           color: '#3b82f6' },
  'listening-lab':     { number: 2, title: 'The Listening Lab',     color: '#8b5cf6' },
  'production-studio': { number: 3, title: 'The Production Studio', color: '#f97316' },
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
  const [conductedLessonIds, setConductedLessonIds] = useState(null); // Set of lesson IDs conducted for this class
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [expandedUnits, setExpandedUnits] = useState(() => CURRICULUM.map(u => u.id));

  // Students tab sorting
  const [sortBy, setSortBy] = useState('seat-asc');

  // Modal states
  const [showRosterManager, setShowRosterManager] = useState(false);
  const [showPrintCards, setShowPrintCards] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeModalData, setGradeModalData] = useState(null);
  const [activityGradingData, setActivityGradingData] = useState(null);
  const [deleteGradeConfirm, setDeleteGradeConfirm] = useState(null); // { studentUid, studentName, lessonId, lessonName }
  const [deletingGrade, setDeletingGrade] = useState(false);
  const [answerKeyModalData, setAnswerKeyModalData] = useState(null);
  const [answerKeyIds, setAnswerKeyIds] = useState(new Set());

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

        const [subs, gradesData, conducted] = await Promise.all([
          getAllClassSubmissions(classId),
          getClassGrades(classId),
          getConductedLessons(classId)
        ]);
        console.log('📊 ClassDetail fetch — classId:', classId, '| submissions:', subs?.length || 0, '| conductedLessons:', conducted ? [...conducted].join(', ') || 'empty set' : 'null');
        setSubmissions(subs || []);
        setGrades(gradesData || {});
        setConductedLessonIds(conducted);

        // Fetch answer key IDs for the key icon state
        try {
          const keys = await getAllAnswerKeys(user.uid);
          setAnswerKeyIds(new Set(Object.keys(keys)));
        } catch { /* answer keys fetch is non-critical */ }
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

    const [subs, gradesData, conducted] = await Promise.all([
      getAllClassSubmissions(classId),
      getClassGrades(classId),
      getConductedLessons(classId)
    ]);
    setSubmissions(subs || []);
    setGrades(gradesData || {});
    setConductedLessonIds(conducted);
  };

  const getEffectiveUid = (student) => {
    return student.studentUid || `seat-${student.seatNumber}`;
  };

  const getActivityStats = (lessonId, activityId) => {
    // Only count submissions from students in the roster so counts match the grading view
    const rosterUids = new Set(roster.map(s => s.studentUid || `seat-${s.seatNumber}`));
    const activitySubs = submissions.filter(s =>
      s.lessonId === lessonId && s.activityId === activityId && rosterUids.has(s.studentUid)
    );
    return {
      submitted: activitySubs.filter(s => s.status === 'submitted' || s.status === 'pending' || s.status === 'graded').length,
      pending: activitySubs.filter(s => s.status === 'submitted' || s.status === 'pending').length
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

  const handleDeleteGrade = async () => {
    if (!deleteGradeConfirm) return;
    setDeletingGrade(true);

    const { studentUid, lessonId } = deleteGradeConfirm;

    try {
      await deleteGrade(classId, studentUid, lessonId);

      // Also remove the submission record
      const { getDatabase, ref, remove } = await import('firebase/database');
      const db = getDatabase();
      await remove(ref(db, `submissions/${classId}/${lessonId}/${studentUid}`)).catch(() => {});

      // Also try deleting studentWork
      const lesson = CURRICULUM.flatMap(u => u.lessons).find(l => l.id === lessonId);
      if (lesson) {
        const firstActivity = lesson.activities.find(a => a.type === 'composition') || lesson.activities[0];
        if (firstActivity) {
          const workKey = `${lessonId}-${firstActivity.id}`;
          await remove(ref(db, `studentWork/${studentUid}/${workKey}`)).catch(() => {});
        }
      }

      await refreshData();
    } catch (err) {
      console.error('Error deleting grade:', err);
    } finally {
      setDeletingGrade(false);
      setDeleteGradeConfirm(null);
    }
  };

  // Note: grading notification counts removed — they were inaccurate and noisy

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
    { id: 'grades', label: 'Grades', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherHeader />

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
            </div>

            <div className="space-y-3">
              {CURRICULUM.map((unit) => {
                const isExpanded = expandedUnits.includes(unit.id);

                // Build lesson groups with gradable activities (no games)
                // Listening Lab: only L3-L5 listening journeys are graded
                const unitLessons = [];
                unit.lessons.forEach(lesson => {
                  if (!lesson.route || lesson.activities.length === 0) return;
                  // Show lesson if conducted OR if any student has submitted work for it
                  const hasSubmissions = submissions.some(s => s.lessonId === lesson.id);
                  if (conductedLessonIds && !conductedLessonIds.has(lesson.id) && !hasSubmissions) return;
                  // Filter: skip games
                  const gradableActivities = lesson.activities
                    .filter(a => a.type !== 'game')
                    .map(activity => {
                      const stats = getActivityStats(lesson.id, activity.id);
                      return { ...activity, stats };
                    });
                  if (gradableActivities.length > 0) {
                    unitLessons.push({ ...lesson, gradableActivities });
                  }
                });

                // Hide units with no conducted lessons
                if (unitLessons.length === 0) return null;

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
                    </button>

                    {/* Lessons grouped with activities */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {unitLessons.map((lesson) => (
                          <div key={lesson.id}>
                            {/* Lesson header */}
                            <div className="px-4 py-2 pl-11 bg-gray-50 border-b border-gray-100">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {lesson.name}
                              </span>
                            </div>
                            {/* Activities under this lesson */}
                            <div className="divide-y divide-gray-50">
                              {lesson.gradableActivities.map((activity) => {
                                const Icon = getActivityIcon(activity.type);
                                return (
                                  <div
                                    key={`${lesson.id}-${activity.id}`}
                                    className="px-4 py-3 pl-14 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
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
                                        activity.type === 'composition' ? 'bg-blue-100' : 'bg-gray-100'
                                      }`}>
                                        <Icon size={16} className={
                                          activity.type === 'composition' ? 'text-blue-600' : 'text-gray-600'
                                        } />
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900 text-sm">
                                          {activity.name}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="text-gray-400">
                                        {activity.stats.submitted}/{roster.length}
                                      </span>
                                      {activity.stats.pending > 0 && (
                                        <span className="flex items-center gap-1 text-amber-600">
                                          <Clock size={12} />
                                          {activity.stats.pending}
                                        </span>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAnswerKeyModalData({
                                            lessonId: lesson.id,
                                            activityId: activity.id,
                                            activityName: activity.name,
                                            activityType: activity.type
                                          });
                                        }}
                                        className={`p-1 transition-colors ${
                                          answerKeyIds.has(`${lesson.id}-${activity.id}`)
                                            ? 'text-amber-500 hover:text-amber-600'
                                            : 'text-gray-300 hover:text-gray-500'
                                        }`}
                                        title={answerKeyIds.has(`${lesson.id}-${activity.id}`) ? 'Edit answer key' : 'Create answer key'}
                                      >
                                        <Key size={14} />
                                      </button>
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty state when no lessons have been conducted */}
              {(!conductedLessonIds || conductedLessonIds.size === 0) && submissions.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No assignments yet</h3>
                  <p className="text-sm text-gray-500">
                    Assignments will appear here once you start a lesson.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== Grades Tab ==================== */}
        {activeTab === 'grades' && (() => {
          // Build per-activity columns grouped by unit
          const gradebookColumns = [];
          const unitSpans = []; // { unitId, title, color, icon, colCount }

          for (const unit of CURRICULUM) {
            const style = UNIT_STYLE[unit.id] || { number: null, title: unit.name, color: '#6b7280' };
            let unitColCount = 0;

            for (const lesson of unit.lessons) {
              if (lesson.activities.length === 0) continue;
              if (conductedLessonIds && !conductedLessonIds.has(lesson.id)) continue;

              // Extract lesson number from id (e.g., 'fm-lesson2' → 2, 'll-lesson3' → 3)
              const lessonNum = lesson.id.match(/lesson(\d+)/)?.[1] || '?';

              // Only gradable activities (skip games)
              const gradableActivities = lesson.activities.filter(a => a.type !== 'game');
              for (const activity of gradableActivities) {
                // Short label for column header
                let shortLabel;
                if (activity.type === 'composition') shortLabel = 'Comp';
                else if (activity.type === 'reflection') shortLabel = 'Refl';
                else if (activity.id.includes('listening-journey')) shortLabel = 'Journey';
                else shortLabel = activity.name.split(' ')[0];

                gradebookColumns.push({
                  unitId: unit.id,
                  unitColor: style.color,
                  lessonId: lesson.id,
                  lessonNum,
                  lessonName: lesson.name,
                  lessonShortName: lesson.shortName,
                  activityId: activity.id,
                  activityName: activity.name,
                  activityType: activity.type,
                  label: `L${lessonNum} ${shortLabel}`
                });
                unitColCount++;
              }
            }

            if (unitColCount > 0) {
              unitSpans.push({
                unitId: unit.id,
                title: style.title,
                color: style.color,
                icon: unit.icon,
                colCount: unitColCount
              });
            }
          }

          const getGradeColor = (points, maxPoints) => {
            const pct = Math.round((points / maxPoints) * 100);
            if (pct >= 80) return 'text-green-700';
            if (pct >= 60) return 'text-blue-700';
            if (pct >= 40) return 'text-amber-700';
            return 'text-red-700';
          };

          const exportCSV = () => {
            const headers = ['Last Name', 'First Name', 'Seat', 'Unit', 'Lesson', 'Assignment', 'Points', 'Max Points', 'Percentage', 'Date Graded'];
            const rows = [];

            for (const student of roster) {
              const uid = getEffectiveUid(student);
              const fullName = student.displayName || `Seat ${student.seatNumber}`;
              const nameParts = fullName.trim().split(/\s+/);
              const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
              const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

              for (const col of gradebookColumns) {
                const g = grades[uid]?.[col.lessonId];
                const unitStyle = UNIT_STYLE[col.unitId] || { title: col.unitId };
                const lessonLabel = `L${col.lessonNum}: ${col.lessonShortName || col.lessonName}`;
                const assignmentLabel = col.activityName;

                let points = '';
                let maxPoints = '';
                let pct = '';
                let dateGraded = '';

                if (g && g.points !== undefined && g.maxPoints) {
                  points = g.points;
                  maxPoints = g.maxPoints;
                  pct = Math.round((g.points / g.maxPoints) * 100);
                  if (g.gradedAt) {
                    dateGraded = new Date(g.gradedAt).toISOString().split('T')[0];
                  }
                }

                rows.push([lastName, firstName, student.seatNumber, unitStyle.title, lessonLabel, assignmentLabel, points, maxPoints, pct, dateGraded]);
              }
            }

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

          if (gradebookColumns.length === 0) {
            return (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grades</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No grades yet</h3>
                  <p className="text-sm text-gray-500">
                    Grades will appear here once you conduct lessons with this class.
                  </p>
                </div>
              </div>
            );
          }

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
                      {/* Row 1: Unit grouping headers */}
                      <tr className="border-b border-gray-200">
                        <th className="sticky left-0 z-10 bg-white" rowSpan={2} />
                        {unitSpans.map(u => (
                          <th
                            key={u.unitId}
                            colSpan={u.colCount}
                            className="px-2 py-2 text-center text-xs font-bold text-white tracking-wide"
                            style={{ backgroundColor: u.color }}
                          >
                            {u.icon} {u.title}
                          </th>
                        ))}
                      </tr>
                      {/* Row 2: Activity column labels */}
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {gradebookColumns.map(col => (
                          <th
                            key={`${col.lessonId}-${col.activityId}`}
                            className="px-2 py-2 font-medium text-gray-600 text-center min-w-[80px]"
                            title={`${col.lessonName} — ${col.activityName}`}
                          >
                            <span className="text-[11px] leading-tight whitespace-nowrap">{col.label}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {roster.map(student => {
                        const uid = getEffectiveUid(student);
                        const studentName = student.displayName || `Seat ${student.seatNumber}`;
                        return (
                          <tr key={student.seatNumber} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10 min-w-[160px] border-r border-gray-100">
                              {studentName}
                            </td>
                            {gradebookColumns.map(col => {
                              const g = grades[uid]?.[col.lessonId];
                              const sub = submissions.find(s =>
                                s.studentUid === uid && s.lessonId === col.lessonId &&
                                (s.activityId === col.activityId || !s.activityId)
                              );
                              const isPending = sub && (sub.status === 'pending' || sub.status === 'submitted');
                              const hasData = g || isPending;

                              return (
                                <td
                                  key={`${col.lessonId}-${col.activityId}`}
                                  className={`px-2 py-3 text-center relative group ${hasData ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''}`}
                                  onClick={() => {
                                    if (hasData) {
                                      setActivityGradingData({
                                        lessonId: col.lessonId,
                                        activityId: col.activityId,
                                        lessonName: col.lessonName,
                                        activityName: col.activityName,
                                        activityType: col.activityType
                                      });
                                    }
                                  }}
                                >
                                  {g && g.points !== undefined && g.maxPoints ? (
                                    <span className={`font-bold tabular-nums text-xs ${getGradeColor(g.points, g.maxPoints)}`}>
                                      {g.points}/{g.maxPoints}
                                    </span>
                                  ) : g?.grade ? (
                                    <span className="font-bold text-gray-700 text-xs">{g.grade}</span>
                                  ) : isPending ? (
                                    <Clock size={13} className="text-amber-500 mx-auto" />
                                  ) : (
                                    <span className="text-gray-300 text-xs">--</span>
                                  )}
                                  {g && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteGradeConfirm({
                                          studentUid: uid,
                                          studentName,
                                          lessonId: col.lessonId,
                                          lessonName: col.lessonShortName || col.lessonName
                                        });
                                      }}
                                      className="absolute top-0.5 right-0.5 p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                      title="Delete grade"
                                    >
                                      <Trash2 size={10} />
                                    </button>
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

      {answerKeyModalData && (
        <AnswerKeyModal
          isOpen={!!answerKeyModalData}
          onClose={(saved) => {
            setAnswerKeyModalData(null);
            if (saved) {
              // Refresh answer key IDs
              getAllAnswerKeys(user.uid)
                .then(keys => setAnswerKeyIds(new Set(Object.keys(keys))))
                .catch(() => {});
            }
          }}
          lessonId={answerKeyModalData.lessonId}
          activityId={answerKeyModalData.activityId}
          activityName={answerKeyModalData.activityName}
          activityType={answerKeyModalData.activityType}
          teacherUid={user.uid}
        />
      )}

      {/* Delete Grade Confirmation Modal */}
      {deleteGradeConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Grade?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              This will permanently delete the grade for <strong>{deleteGradeConfirm.studentName}</strong> on <strong>{deleteGradeConfirm.lessonName}</strong>:
            </p>
            <ul className="text-sm text-gray-500 mb-5 ml-4 list-disc space-y-0.5">
              <li>Grade and rubric scores</li>
              <li>Feedback</li>
              <li>Student submission record</li>
            </ul>
            <p className="text-xs text-red-600 font-medium mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteGradeConfirm(null)}
                disabled={deletingGrade}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGrade}
                disabled={deletingGrade}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingGrade ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailPage;
