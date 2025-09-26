// src/components/dashboard/studentdashboard/StudentGradesTab.jsx
import React from 'react';
import { TrendingUp, Award, Clock, FileText } from 'lucide-react';

const StudentGradesTab = ({ grades = {}, showToast }) => {
  // Use the actual grades data passed from the parent component
  const displayGrades = grades;

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'practice': return '🎵';
      case 'test': return '📝';
      case 'quiz': return '❓';
      case 'assessment': return '📊';
      default: return '📄';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Grades</h2>
        <div className="text-sm text-gray-500">
          {displayGrades.completedAssignments?.length || 0} graded assignment{(displayGrades.completedAssignments?.length || 0) !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Show message if no grades available */}
      {(!displayGrades.completedAssignments || displayGrades.completedAssignments.length === 0) ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grades yet</h3>
          <p className="text-gray-500">Your assignments haven't been graded yet.</p>
        </div>
      ) : (
        <>
          {/* Recent Assignments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Graded Assignments</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {displayGrades.completedAssignments.map((assignment) => (
                <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(assignment.type)}</span>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {assignment.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500 capitalize">
                              {assignment.type}
                            </span>
                            <span className="text-sm text-gray-500">
                              Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {assignment.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Feedback:</strong> {assignment.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(assignment.score)}`}>
                          {assignment.score}%
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(assignment.grade)}`}>
                          {assignment.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentGradesTab;