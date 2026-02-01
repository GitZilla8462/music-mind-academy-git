// Student Grades List Component
// src/components/student/StudentGradesList.jsx
// Displays a list of student's grades and teacher feedback

import React, { useState, useEffect } from 'react';
import { MessageSquare, Award, Loader2, BookOpen } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { getStudentGrades } from '../../firebase/grades';

// Lesson definitions
const LESSONS = [
  { id: 'lesson1', name: 'Mood & Expression' },
  { id: 'lesson2', name: 'Instrumentation' },
  { id: 'lesson3', name: 'Texture & Layering' },
  { id: 'lesson4', name: 'Form & Structure' },
  { id: 'lesson5', name: 'Capstone' }
];

const StudentGradesList = () => {
  const { isAuthenticated, currentStudentInfo, isPinAuth } = useStudentAuth();
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      // Only fetch grades for PIN auth students (they have a classId)
      if (!isAuthenticated || !isPinAuth || !currentStudentInfo?.classId) {
        setLoading(false);
        return;
      }

      try {
        const studentUid = `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`;
        const gradesData = await getStudentGrades(currentStudentInfo.classId, studentUid);
        setGrades(gradesData);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [isAuthenticated, currentStudentInfo, isPinAuth]);

  const getGradeColor = (grade) => {
    const colors = {
      A: 'text-green-400 bg-green-900/50',
      B: 'text-blue-400 bg-blue-900/50',
      C: 'text-yellow-400 bg-yellow-900/50',
      D: 'text-orange-400 bg-orange-900/50',
      F: 'text-red-400 bg-red-900/50'
    };
    return colors[grade] || 'text-gray-400 bg-gray-700';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Check if student has any grades
  const hasGrades = Object.keys(grades).length > 0;

  if (!hasGrades) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 mb-2">No grades yet</p>
        <p className="text-gray-500 text-sm">
          Your grades will appear here after your teacher reviews your work.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {LESSONS.map((lesson) => {
        const grade = grades[lesson.id];
        const isExpanded = expandedLesson === lesson.id;

        return (
          <div
            key={lesson.id}
            className="bg-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-650 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-white">{lesson.name}</span>
              </div>

              {grade ? (
                <span className={`text-xl font-bold px-3 py-1 rounded ${getGradeColor(grade.grade)}`}>
                  {grade.grade}
                </span>
              ) : (
                <span className="text-sm text-gray-500">Not graded</span>
              )}
            </button>

            {/* Expanded view with feedback */}
            {isExpanded && grade && (
              <div className="px-4 pb-4 border-t border-gray-600">
                <div className="pt-3">
                  {grade.feedback ? (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Teacher Feedback:</p>
                        <p className="text-white">{grade.feedback}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No feedback provided</p>
                  )}

                  {grade.gradedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Graded on {formatDate(grade.gradedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StudentGradesList;
