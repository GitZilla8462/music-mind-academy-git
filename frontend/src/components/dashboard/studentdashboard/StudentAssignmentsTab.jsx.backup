import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const StudentAssignmentsTab = ({ assignments = [], showToast }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const displayAssignments = assignments;

  const handleStartAssignment = (assignment) => {
    showToast(`Starting assignment: ${assignment.title}`, 'info');
    
    // Navigate to the specific project with assignment context
    if (assignment.project === 'film-music-score') {
      navigate(`/student/assignment/${assignment._id}/video-selection`);
    } else if (assignment.project === 'solfege') {
      navigate(`/student/assignment/${assignment._id}/solfege`);
    } else if (assignment.project === 'listening') {
      navigate(`/student/assignment/${assignment._id}/listening`);
    } else {
      // Default fallback for other project types
      navigate(`/student/assignment/${assignment._id}/project/${assignment.project}`);
    }
  };

  const getStatusBadge = (assignment) => {
    // You can extend this logic based on submission status from backend
    // For now, return a default status
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-green-600 border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
        <div className="text-sm text-gray-500">
          {displayAssignments.length} assignment{displayAssignments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {displayAssignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-500">Your teacher hasn't assigned any exercises yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayAssignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    {getStatusBadge(assignment)}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{assignment.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <span className="font-medium">Type:</span>
                      <span className="ml-1 capitalize">{assignment.project || 'Unknown'}</span>
                    </span>
                    {assignment.dueDate && (
                      <span className="flex items-center">
                        <span className="font-medium">Due:</span>
                        <span className="ml-1">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    {assignment.mode && (
                      <span className="flex items-center">
                        <span className="font-medium">Mode:</span>
                        <span className="ml-1 capitalize">{assignment.mode}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <button
                    onClick={() => handleStartAssignment(assignment)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsTab;