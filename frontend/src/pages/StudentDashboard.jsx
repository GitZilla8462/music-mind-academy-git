// src/pages/StudentDashboard.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import ToastNotification from '../components/layout/ToastNotification';
import StudentAssignmentsTab from "../components/dashboard/studentdashboard/StudentAssignmentsTab";
import StudentGradesTab from "../components/dashboard/studentdashboard/StudentGradesTab";
import StudentExercisesTab from "../components/dashboard/studentdashboard/StudentExercisesTab";

import SolfegeIDTemplate from '../components/exercises/1.solfege_identification/SolfegeIDTemplate';
import ListenSolfegeIDTemplate from '../components/exercises/2.listening_skills/ListenSolfegeIDTemplate';

import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

const StudentDashboard = ({ showToast }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();

  const getActiveTabFromUrl = () => {
    if (location.pathname.includes('/exercise/')) {
      return 'exercises';
    }
    if (location.pathname.includes('/assignment/')) {
      return 'assignments';
    }
    // Always default to assignments, ignore sessionStorage for now
    return 'assignments';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [assignments, setAssignments] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [grades, setGrades] = useState({});
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);

  const showToastLocal = showToast || useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const newActiveTab = getActiveTabFromUrl();
    setActiveTab(newActiveTab);
    
    if (!location.pathname.includes('/exercise/') && !location.pathname.includes('/assignment/')) {
      sessionStorage.setItem('studentActiveTab', newActiveTab);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!location.pathname.includes('/exercise/') && !location.pathname.includes('/assignment/')) {
      sessionStorage.setItem('studentActiveTab', activeTab);
    }
  }, [activeTab, location.pathname]);
  
  useEffect(() => {
    const fetchStudentAssignments = async () => {
      try {
        setIsLoadingAssignments(true);
        const res = await axios.get(`${API_BASE_URL}/students/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignments(res.data);
      } catch (err) {
        console.error('Failed to fetch student assignments:', err);
        setError('Failed to load assignments.');
        showToastLocal('Failed to load your assignments', 'error');
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    const fetchStudentGrades = async () => {
      try {
        setIsLoadingGrades(true);
        const res = await axios.get(`${API_BASE_URL}/students/grades`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGrades(res.data);
      } catch (err) {
        console.error('Failed to fetch student grades:', err);
        showToastLocal('Failed to load your grades', 'error');
      } finally {
        setIsLoadingGrades(false);
      }
    };
    
    if (isAuthenticated && user?.role === 'student' && !authLoading) {
      fetchStudentAssignments();
      fetchStudentGrades();
    }
  }, [isAuthenticated, user, authLoading, showToastLocal, token]);

  const isDoingExercise = location.pathname.includes('/exercise/');
  const isDoingAssignment = location.pathname.includes('/assignment/');

  const studentName = user?.name || "Student";
  
  const notifications = [
    { id: 1, message: 'New assignment "Vocal Exercise 3" is available', type: 'assignment' },
    { id: 2, message: 'Great job on "Pitch Practice"! Score: 92%', type: 'achievement' },
    { id: 3, message: 'Practice reminder: Daily exercises help improve faster', type: 'reminder' }
  ];
  
  const availableExercises = [
    {
      id: 'film-music-score',
      title: 'Film Music Project',
      description: 'Create music to accompany film scenes',
      type: 'film-music-score',
      level: 'intermediate',
      difficulty: 'Medium',
      estimatedTime: '30 min'
    }
  ];
  
  const handleLogout = useCallback(() => {
    logout(); 
    showToastLocal('Logged out successfully', 'success');
  }, [logout, showToastLocal]);
  
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  const toggleProfile = useCallback(() => {
    setProfileOpen(prev => !prev);
  }, []);

  const handleExerciseComplete = useCallback((exerciseData) => {
    showToastLocal(`Exercise completed! Score: ${exerciseData.score}%`, 'success');
    if (isDoingAssignment) {
      navigate('/student/assignments');
    } else {
      navigate('/student/exercises');
    }
  }, [showToastLocal, navigate, isDoingAssignment]);

  const handleBackToDashboard = useCallback(() => {
    navigate('/student');
  }, [navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    if (isDoingExercise || isDoingAssignment) {
      const exerciseType = params.type || 'solfege';
      const level = params.level || 'beginner';
      const assignmentId = params.assignmentId;

      const ExerciseComponent = exerciseType === 'listening' 
        ? ListenSolfegeIDTemplate 
        : SolfegeIDTemplate;
      
      return (
        <div className="space-y-4">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center text-green-600 hover:text-green-800 transition-colors"
          >
            ← Back to Dashboard
          </button>
          
          <ExerciseComponent 
            level={level}
            assignmentId={assignmentId}
            onComplete={handleExerciseComplete}
            onClose={handleBackToDashboard}
            isAssignment={isDoingAssignment}
          />
        </div>
      );
    }
    
    if (isLoadingAssignments || isLoadingGrades) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    switch(activeTab) {
      case 'assignments':
        return (
          <StudentAssignmentsTab 
            assignments={assignments}
            showToast={showToastLocal}
          />
        );
      
      case 'exercises':
        return (
          <StudentExercisesTab 
            availableExercises={availableExercises}
            showToast={showToastLocal}
          />
        );
      
      case 'grades':
        return (
          <StudentGradesTab 
            grades={grades}
            showToast={showToastLocal}
          />
        );
      
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30 lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="p-6 flex flex-col border-b border-gray-200 bg-white">
          <div>
            <div className="text-2xl font-bold text-gray-800" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>
              Music Mind
            </div>
            <div className="text-xl font-light text-blue-500" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.1em', marginTop: '-4px'}}>
              ACADEMY
            </div>
            <div className="text-sm font-light text-gray-500 mt-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
              STUDENT PORTAL
            </div>
          </div>
        </div>
        
        <nav className="mt-6 bg-white">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Navigation</h2>
          </div>
          <div className="px-3 py-2">
            
            <button
              className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium mb-2 transition-all duration-200 ${
                activeTab === 'assignments' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => {
                setActiveTab('assignments');
                setSidebarOpen(false);
              }}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>My Assignments</span>
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium mb-2 transition-all duration-200 ${
                activeTab === 'exercises' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => {
                setActiveTab('exercises');
                setSidebarOpen(false);
              }}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-10V3a1 1 0 011-1h1a1 1 0 011 1v1m-3 0h3m-3 0h-.5a2 2 0 00-2 2v2H9m0 0v10a2 2 0 002 2h8a2 2 0 002-2V10m0 0V8a2 2 0 00-2-2h-2" />
              </svg>
              <span>Practice</span>
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium mb-2 transition-all duration-200 ${
                activeTab === 'grades' 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => {
                setActiveTab('grades');
                setSidebarOpen(false);
              }}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Grades</span>
            </button>
          </div>
          
          <div className="mt-auto px-3 py-4 border-t border-gray-100">
            <button
              className="w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              onClick={handleLogout}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar 
          activeTab={activeTab}
          toggleSidebar={toggleSidebar}
          teacherName={studentName}
          notifications={notifications}
          profileOpen={profileOpen}
          toggleProfile={toggleProfile}
          handleLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        />
        
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                  <div className="flex">
                    <div>
                      <p className="font-bold">Error</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!isDoingExercise && !isDoingAssignment && (
                <div className="mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                      Welcome back, {studentName}
                    </h1>
                    <p className="text-gray-600">
                      Continue your musical education journey. Review your assignments, practice exercises, and track your progress.
                    </p>
                  </div>
                </div>
              )}
              
              {renderTabContent()}
            </>
          )}
        </div>
      </div>
      
      {(toast || showToast) && <ToastNotification toast={toast} setToast={setToast} />}
    </div>
  );
};

export default StudentDashboard;