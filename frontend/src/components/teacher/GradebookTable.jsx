// Gradebook Table Component
// src/components/teacher/GradebookTable.jsx
// Displays a grid of students x lessons with grades and submission status

import React from 'react';
import { Clock, CheckCircle, Eye, Edit2, FileText } from 'lucide-react';

/**
 * Grade cell component
 */
const GradeCell = ({ student, lesson, submission, grade, onOpenGrade, onViewWork }) => {
  const hasSubmission = !!submission;
  const hasGrade = !!grade;
  const isPending = hasSubmission && submission.status === 'pending';
  const isGraded = hasSubmission && submission.status === 'graded';

  // Determine cell background color
  const getBgColor = () => {
    if (!hasSubmission) return 'bg-gray-800';
    if (isPending) return 'bg-yellow-900/30';
    if (isGraded) return 'bg-green-900/30';
    return 'bg-gray-800';
  };

  // Determine grade color for letter grades
  const getGradeColor = (gradeValue) => {
    const colors = {
      A: 'text-green-400',
      B: 'text-blue-400',
      C: 'text-yellow-400',
      D: 'text-orange-400',
      F: 'text-red-400'
    };
    return colors[gradeValue] || 'text-gray-400';
  };

  // Points-based grade color
  const getPointsColor = (points, maxPoints) => {
    const pct = Math.round((points / maxPoints) * 100);
    if (pct >= 80) return 'text-green-400';
    if (pct >= 60) return 'text-blue-400';
    if (pct >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const isPoints = hasGrade && grade.points !== undefined && grade.maxPoints;

  return (
    <td className={`border border-gray-700 p-2 ${getBgColor()}`}>
      <div className="flex flex-col items-center gap-1">
        {/* Grade display */}
        {hasGrade && isPoints ? (
          <span className={`text-sm font-bold tabular-nums ${getPointsColor(grade.points, grade.maxPoints)}`}>
            {grade.points}/{grade.maxPoints}
          </span>
        ) : hasGrade ? (
          <span className={`text-xl font-bold ${getGradeColor(grade.grade)}`}>
            {grade.grade}
          </span>
        ) : isPending ? (
          <Clock className="w-5 h-5 text-yellow-400" />
        ) : (
          <span className="text-gray-600">-</span>
        )}

        {/* Action buttons */}
        {hasSubmission && (
          <div className="flex gap-1">
            <button
              onClick={() => onViewWork(student, lesson, submission)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="View work"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenGrade(student, lesson)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title={hasGrade ? 'Edit grade' : 'Grade submission'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </td>
  );
};

/**
 * Main Gradebook Table component
 */
const GradebookTable = ({
  roster,
  lessons,
  submissions,
  grades,
  onOpenGrade,
  onViewWork
}) => {
  // Create a map of submissions for quick lookup
  const submissionMap = {};
  for (const sub of submissions) {
    const key = `${sub.studentUid}-${sub.lessonId}`;
    submissionMap[key] = sub;
  }

  // Get submission for a student/lesson
  const getSubmission = (studentUid, lessonId) => {
    return submissionMap[`${studentUid}-${lessonId}`];
  };

  // Get grade for a student/lesson
  const getGrade = (studentUid, lessonId) => {
    return grades[studentUid]?.[lessonId];
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900">
              <th className="border-b border-r border-gray-700 p-3 text-left text-gray-300 font-medium sticky left-0 bg-gray-900 z-10">
                Student
              </th>
              <th className="border-b border-r border-gray-700 p-3 text-center text-gray-300 font-medium w-16">
                Seat
              </th>
              {lessons.map((lesson) => (
                <th
                  key={lesson.id}
                  className="border-b border-gray-700 p-3 text-center text-gray-300 font-medium min-w-[100px]"
                  title={lesson.name}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{lesson.shortName}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[90px]">
                      {lesson.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.map((student) => {
              // For PIN-based students, use the seat-based UID
              const studentUid = student.studentUid || `seat-${student.seatNumber}`;

              return (
                <tr key={student.seatNumber} className="hover:bg-gray-700/30">
                  <td className="border-b border-r border-gray-700 p-3 text-white sticky left-0 bg-gray-800 z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.displayName || `Student ${student.seatNumber}`}</span>
                      {student.studentUid && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded">
                          Linked
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-r border-gray-700 p-3 text-center text-gray-400">
                    {student.seatNumber}
                  </td>
                  {lessons.map((lesson) => (
                    <GradeCell
                      key={lesson.id}
                      student={{ ...student, studentUid }}
                      lesson={lesson}
                      submission={getSubmission(studentUid, lesson.id)}
                      grade={getGrade(studentUid, lesson.id)}
                      onOpenGrade={onOpenGrade}
                      onViewWork={onViewWork}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-700 p-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-400">Pending review</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-gray-400">Graded</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">-</span>
          <span className="text-gray-400">No submission</span>
        </div>
      </div>
    </div>
  );
};

export default GradebookTable;
