// /src/components/dashboard/teacherdashboard/ClassesTab.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Users, Book, Edit2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_CLASSES_URL = process.env.NODE_ENV === 'production' 
    ? '/api/teacher/classes' 
    : 'http://localhost:5000/api/teacher/classes';

const ClassesTab = ({ showToast, setActiveTab }) => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // [OK] FIXED: Use the correct, consistent key and storage methods
  const getToken = useCallback(() => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }, []);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const token = getToken();
    if (!token) {
      showToast('Authentication error. Please log in again.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(API_CLASSES_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setClasses(response.data);
      showToast(`Loaded ${response.data.length} classes.`, 'success');
      
    } catch (err) {
      console.error('Fetch classes error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load classes.');
      showToast(err.response?.data?.error || 'Failed to load classes.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [getToken, showToast]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleRefresh = () => {
    fetchClasses();
  };

  const ClassCard = ({ classInfo }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h3 className="font-semibold text-lg text-gray-800">{classInfo.className}</h3>
        <div className="mt-4">
          <div className="flex items-center">
            <Users size={16} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">{classInfo.students.length} students</span>
          </div>
          <div className="flex items-center mt-1">
            <Book size={16} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-500">0 assignments</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            className="text-gray-600 text-sm flex items-center hover:text-gray-800 transition-colors"
            onClick={() => navigate(`/teacher/class/${classInfo._id}`)}
            aria-label={`Manage ${classInfo.className} class`}
          >
            <Edit2 size={14} className="mr-1" />
            Manage
          </button>
        </div>
      </div>
    );
  };
  
  const ClassesSkeleton = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(key => (
          <div key={key} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <div className="h-4 bg-gray-200 rounded w-16 mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const ErrorState = ({ error, onRetry }) => {
    return (
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center max-w-md mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Classes</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={onRetry}
          aria-label="Try loading classes again"
        >
          Try Again
        </button>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Classes</h2>
        <div className="flex space-x-2">
          {!isLoading && (
            <button 
              className="text-gray-600 px-3 py-2 rounded-md flex items-center hover:bg-gray-100 transition-colors"
              onClick={handleRefresh}
              aria-label="Refresh classes list"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          )}
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
            onClick={() => setActiveTab('createClass')}
            aria-label="Create a new class"
          >
            <PlusCircle className="mr-2" size={20} />
            Create a Class
          </button>
        </div>
      </div>

      {isLoading ? (
        <ClassesSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRefresh} />
      ) : classes.length === 0 ? (
        <div className="text-center text-gray-600">No classes available. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <ClassCard 
              key={cls._id} 
              classInfo={cls} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesTab;