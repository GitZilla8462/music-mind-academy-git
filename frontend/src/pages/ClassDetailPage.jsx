// Class Detail Page
// src/pages/ClassDetailPage.jsx
// Google Classroom-style: click into a class to see students, grades, work

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getClassById } from '../firebase/classes';
import { getClassRoster } from '../firebase/enrollments';
import { getAllClassSubmissions, getClassGrades } from '../firebase/grades';
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
  UserPlus,
  Music,
  Gamepad2,
  FileText,
  Play,
  CreditCard,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import TeacherHeader from '../components/teacher/TeacherHeader';
import RosterManager from '../components/teacher/RosterManager';
import StudentDetailModal from '../components/teacher/StudentDetailModal';
import GradeEntryModal from '../components/teacher/GradeEntryModal';
import PrintableLoginCards from '../components/teacher/PrintableLoginCards';

// Lesson definitions
const LESSONS = [
  { id: 'lesson1', name: 'Lesson 1: Mood & Expression', activities: [
    { id: 'mood-match', name: 'Mood Match Game', type: 'game' },
    { id: 'adventure-composition', name: 'Adventure Composition', type: 'composition' },
    { id: 'lesson1-reflection', name: 'Reflection', type: 'reflection' }
  ]},
  { id: 'lesson2', name: 'Lesson 2: Instrumentation', activities: [
    { id: 'melody-escape', name: 'Melody Escape Room', type: 'game' },
    { id: 'sports-composition', name: 'Sports Composition', type: 'composition' },
    { id: 'lesson2-reflection', name: 'Reflection', type: 'reflection' }
  ]},
  { id: 'lesson3', name: 'Lesson 3: Texture & Layering', activities: [
    { id: 'listening-map', name: 'Listening Map', type: 'game' },
    { id: 'city-composition', name: 'City Composition', type: 'composition' },
    { id: 'lesson3-reflection', name: 'Reflection', type: 'reflection' }
  ]},
  { id: 'lesson4', name: 'Lesson 4: Form & Structure', activities: [
    { id: 'sectional-builder', name: 'Sectional Loop Builder', type: 'game' },
    { id: 'wildlife-composition', name: 'Wildlife Composition', type: 'composition' },
    { id: 'lesson4-reflection', name: 'Reflection', type: 'reflection' }
  ]}
];

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
  const [expandedLessons, setExpandedLessons] = useState(['lesson1']);

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
      // Clear the param so it doesn't reopen on refresh
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

        // Always fetch submissions and grades
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'game': return Gamepad2;
      case 'composition': return Music;
      case 'reflection': return FileText;
      default: return FileText;
    }
  };

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
              {/* Start Lesson Button */}
              <button
                onClick={() => navigate('/music-classroom-resources')}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition-colors"
              >
                <Play size={18} fill="currentColor" />
                Start Lesson
              </button>

              {/* Join Code - smaller, below button */}
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
        {/* Students Tab */}
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
                        const status = getStudentStatus(student.studentUid);

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

        {/* Classwork Tab */}
        {activeTab === 'classwork' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Classwork
              </h2>
            </div>

            <div className="space-y-4">
              {LESSONS.map((lesson) => {
                const isExpanded = expandedLessons.includes(lesson.id);
                let lessonSubmitted = 0;
                let lessonPending = 0;

                lesson.activities.forEach(activity => {
                  const stats = getActivityStats(lesson.id, activity.id);
                  lessonSubmitted += stats.submitted;
                  lessonPending += stats.pending;
                });

                return (
                  <div key={lesson.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleLesson(lesson.id)}
                      className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          size={20}
                          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <span className="font-semibold text-gray-900">{lesson.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {lessonPending > 0 && (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {lessonPending} to grade
                          </span>
                        )}
                        <span className="text-gray-500">
                          {lessonSubmitted} submitted
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 divide-y divide-gray-100">
                        {lesson.activities.map((activity) => {
                          const stats = getActivityStats(lesson.id, activity.id);
                          const Icon = getActivityIcon(activity.type);

                          return (
                            <div
                              key={activity.id}
                              className="px-4 py-3 pl-12 flex items-center justify-between hover:bg-gray-50"
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
                                  <div className="font-medium text-gray-900">{activity.name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{activity.type}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500">
                                  {stats.submitted}/{roster.length} submitted
                                </span>
                                {stats.pending > 0 && (
                                  <span className="flex items-center gap-1 text-amber-600">
                                    <Clock size={14} />
                                    {stats.pending} pending
                                  </span>
                                )}
                                {activity.type === 'composition' && (
                                  <button
                                    onClick={() => navigate(`/teacher/gradebook/${classId}?activity=${activity.id}`)}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
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
          </div>
        )}

        {/* Grades Tab */}
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
                    const student = roster.find(r => r.studentUid === submission.studentUid);
                    const lesson = LESSONS.find(l => l.id === submission.lessonId);
                    const activity = lesson?.activities.find(a => a.id === submission.activityId);

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
            // Could open a work viewer here
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
          currentGrade={grades[gradeModalData.student?.studentUid]?.[gradeModalData.lesson?.id]}
          submission={gradeModalData.submission}
          onSave={handleGradeSaved}
        />
      )}

    </div>
  );
};

export default ClassDetailPage;
