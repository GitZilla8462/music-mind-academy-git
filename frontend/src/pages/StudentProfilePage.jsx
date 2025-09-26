// /src/pages/StudentProfilePage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Key, User, BookOpen, AlertTriangle } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' 
    : 'http://localhost:5000';
    
const StudentProfilePage = ({ showToast }) => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Helper function to get the authentication token
  const getToken = useCallback(() => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }, []);

  // API Call to fetch student data
  const fetchStudentData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      showToast('Authentication error. Please log in again.', 'error');
      navigate('/login');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/teachers/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading student data:', err);
      setError(err.response?.data?.error || `Failed to load student data.`);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, showToast, navigate, getToken]);

  // Handle password reset
  const handlePasswordReset = useCallback(async () => {
    const token = getToken();
    const newRandomPassword = generateRandomPassword();
    setNewPassword(newRandomPassword);
    
    try {
      setIsResetting(true);
      const response = await axios.post(`${API_BASE_URL}/api/teachers/students/${studentId}/reset-password`, {
        newPassword: newRandomPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(response.data.message, 'success');
      
    } catch (err) {
      console.error('Password reset error:', err);
      showToast(err.response?.data?.error || 'Failed to reset password.', 'error');
    } finally {
      setIsResetting(false);
    }
  }, [studentId, getToken, showToast]);

  // Helper function to generate a random password (same as your bulk add logic)
  const generateRandomPassword = () => {
    const animals = ['shark', 'bear', 'lion', 'eagle', 'tiger', 'wolf', 'cat', 'dog', 'zebra', 'mouse', 'snake', 'gecko'];
    const filteredAnimals = animals.filter(animal => animal.length >= 4 && animal.length <= 5);
    const animal = filteredAnimals[Math.floor(Math.random() * filteredAnimals.length)];
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `${animal}${randomNumber}`;
  };

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-500">Loading student profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => navigate('/teacher')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  if (!studentData) {
    return <div className="text-center p-8 text-gray-500">Student not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{studentData.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Student Information Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl">
            {studentData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-gray-600 font-semibold text-lg">{studentData.name}</p>
            <p className="text-gray-500 text-sm">Role: Student</p>
          </div>
        </div>

        {/* Password Management Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Key size={20} className="text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-700">Password</h2>
          </div>
          <p className="text-gray-600 mb-4">Reset this student's password and provide them with a new one.</p>
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg flex items-center justify-center hover:bg-yellow-600 transition-colors"
          >
            <Key size={18} className="mr-2" />
            Reset Password
          </button>
        </div>

        {/* Progress Card (Placeholder) */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen size={20} className="text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-700">Progress</h2>
          </div>
          <div className="bg-gray-100 rounded-full h-4 mb-2">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${studentData.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-gray-600 text-sm">{studentData.progress || 0}% Overall Progress</p>
        </div>
      </div>

      {/* Placeholder for future sections */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Assignments & Grades</h2>
        <p className="text-gray-500 italic">This section will be available soon to show detailed assignment history and grades.</p>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reset Password</h3>
            <p className="text-gray-700 mb-4">A new password will be generated for {studentData.name}. You will need to provide it to them.</p>
            
            <div className="flex items-center space-x-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              <p className="text-yellow-600 font-semibold text-sm">The new password will not be saved anywhere else.</p>
            </div>
            
            {newPassword && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <p className="font-bold text-gray-800">New Password:</p>
                <p className="text-blue-700 text-lg font-mono break-all">{newPassword}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setNewPassword('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={isResetting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Generate & Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePage;