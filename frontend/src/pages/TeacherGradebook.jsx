// Teacher Gradebook Page
// src/pages/TeacherGradebook.jsx
// Main gradebook interface for teachers to view and grade student work

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getClassById } from '../firebase/classes';
import { getClassRoster } from '../firebase/enrollments';
import { getAllClassSubmissions, getClassGrades } from '../firebase/grades';
import { CURRICULUM } from '../config/curriculumConfig';
import GradebookTable from '../components/teacher/GradebookTable';
import GradeEntryModal from '../components/teacher/GradeEntryModal';
import StudentWorkViewer from '../components/teacher/StudentWorkViewer';

// Build lesson columns from CURRICULUM (only lessons with activities)
const LESSONS = CURRICULUM.flatMap(unit =>
  unit.lessons
    .filter(l => l.activities.length > 0)
    .map(l => ({
      id: l.id,
      name: l.shortName || l.name,
      shortName: `${unit.icon} ${l.shortName || l.name}`,
      unitName: unit.shortName
    }))
);

const TeacherGradebook = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();

  const [classData, setClassData] = useState(null);
  const [roster, setRoster] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [workViewerOpen, setWorkViewerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Fetch class data, roster, submissions, and grades
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !classId) return;

      try {
        setLoading(true);

        // Fetch class info
        const classInfo = await getClassById(classId);
        if (!classInfo) {
          setError('Class not found');
          return;
        }

        // Verify ownership
        if (classInfo.teacherUid !== user.uid) {
          setError('You do not have access to this class');
          return;
        }

        setClassData(classInfo);

        // Fetch roster, submissions, and grades in parallel
        const [rosterData, submissionsData, gradesData] = await Promise.all([
          getClassRoster(classId),
          getAllClassSubmissions(classId),
          getClassGrades(classId)
        ]);

        setRoster(rosterData);
        setSubmissions(submissionsData);
        setGrades(gradesData);

      } catch (err) {
        console.error('Error fetching gradebook data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, classId]);

  // Handle opening grade modal
  const handleOpenGradeModal = (student, lesson) => {
    setSelectedStudent(student);
    setSelectedLesson(lesson);
    setGradeModalOpen(true);
  };

  // Handle opening work viewer
  const handleViewWork = (student, lesson, submission) => {
    setSelectedStudent(student);
    setSelectedLesson(lesson);
    setSelectedSubmission(submission);
    setWorkViewerOpen(true);
  };

  // Handle grade submission
  const handleGradeSaved = (studentUid, lessonId, gradeData) => {
    // Update local state
    setGrades(prev => ({
      ...prev,
      [studentUid]: {
        ...(prev[studentUid] || {}),
        [lessonId]: gradeData
      }
    }));

    // Update submission status
    setSubmissions(prev =>
      prev.map(s =>
        s.studentUid === studentUid && s.lessonId === lessonId
          ? { ...s, status: 'graded', grade: gradeData.grade }
          : s
      )
    );

    setGradeModalOpen(false);
  };

  // Calculate statistics
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading gradebook...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link to="/teacher" className="text-blue-400 hover:text-blue-300">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/teacher')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {classData?.name || 'Class'} - Gradebook
                </h1>
                <p className="text-sm text-gray-400">
                  Code: {classData?.classCode}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-5 h-5" />
                <span>{roster.length} students</span>
              </div>
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Clock className="w-5 h-5" />
                  <span>{pendingCount} pending</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>{gradedCount} graded</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {roster.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Students Yet</h3>
            <p className="text-gray-400 mb-4">
              Add students to your class roster to start grading their work.
            </p>
            <button
              onClick={() => navigate('/teacher')}
              className="text-blue-400 hover:text-blue-300"
            >
              Manage Class Roster
            </button>
          </div>
        ) : (
          <GradebookTable
            roster={roster}
            lessons={LESSONS}
            submissions={submissions}
            grades={grades}
            onOpenGrade={handleOpenGradeModal}
            onViewWork={handleViewWork}
          />
        )}
      </main>

      {/* Grade Entry Modal */}
      {gradeModalOpen && selectedStudent && selectedLesson && (
        <GradeEntryModal
          isOpen={gradeModalOpen}
          onClose={() => setGradeModalOpen(false)}
          student={selectedStudent}
          lesson={selectedLesson}
          classId={classId}
          currentGrade={grades[selectedStudent.studentUid]?.[selectedLesson.id]}
          onSave={handleGradeSaved}
        />
      )}

      {/* Student Work Viewer */}
      {workViewerOpen && selectedStudent && selectedSubmission && (
        <StudentWorkViewer
          isOpen={workViewerOpen}
          onClose={() => setWorkViewerOpen(false)}
          student={selectedStudent}
          lesson={selectedLesson}
          submission={selectedSubmission}
          classId={classId}
        />
      )}
    </div>
  );
};

export default TeacherGradebook;
