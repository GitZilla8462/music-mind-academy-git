// src/components/dashboard/teacherdashboard/AssignmentActivities.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';

// ✅ Add projectData prop
const AssignmentActivities = ({ onAssignToStudents, projectData, onClose, onBackToAssignments }) => {
  // Mock data for assignment activities
  // ✅ Now using data passed via projectData prop
  const assignmentActivities = projectData ? projectData.activities : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={onBackToAssignments} className="text-gray-600 hover:text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Create New Assignment</h1>
      </div>

      {projectData && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">{projectData.title}</h2>
          <p className="text-gray-600">{projectData.description}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Assignment Activities</h2>
        
        {assignmentActivities.length > 0 ? (
          <ul className="space-y-4">
            {assignmentActivities.map((activity) => (
              <li key={activity.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800">{activity.name}</h3>
                <span className="text-sm text-gray-500">({activity.type})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No activities for this assignment.</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button 
          onClick={onClose} 
          className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={onAssignToStudents}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Assign to Students
        </button>
      </div>
    </div>
  );
};

export default AssignmentActivities;