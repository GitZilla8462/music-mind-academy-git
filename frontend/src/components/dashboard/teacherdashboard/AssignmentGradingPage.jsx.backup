// src/components/dashboard/teacherdashboard/AssignmentGradingPage.jsx

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle, Clock } from 'lucide-react';

const AssignmentGradingPage = ({ showToast }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  // Mock data for student submissions. In a real app, this would come from an API.
  const [students, setStudents] = useState([
    { id: 'student-1', name: 'Alice Johnson', status: 'Submitted' },
    { id: 'student-2', name: 'Bob Williams', status: 'Not Submitted' },
    { id: 'student-3', name: 'Charlie Brown', status: 'Graded', score: 95 }
  ]);

  const handleBack = () => {
    navigate('/teacher/projects');
  };

  const handleStudentClick = (studentId) => {
    navigate(`/teacher/projects/${projectId}/submission/${studentId}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Film Music Score</h1>
          <p className="text-gray-600">Student Submissions</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
        {students.map(student => (
          <div 
            key={student.id} 
            onClick={() => handleStudentClick(student.id)} 
            className="flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <User size={20} className="text-gray-500" />
              <span className="font-medium text-gray-900">{student.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {student.status === 'Submitted' && (
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Ready to Grade</span>
              )}
              {student.status === 'Graded' && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-green-700">Graded: {student.score}%</span>
                </div>
              )}
              {student.status === 'Not Submitted' && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Not Submitted</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentGradingPage;