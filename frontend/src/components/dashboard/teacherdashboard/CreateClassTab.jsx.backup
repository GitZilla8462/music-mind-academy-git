// /src/components/dashboard/teacherdashboard/CreateClassTab.jsx

import React, { useState, useCallback } from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth to get the token

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://music-mind-academy-git-production.up.railway.app' 
    : 'http://localhost:5000';

const CreateClassTab = ({ showToast, setActiveTab, onClassCreated }) => {
  const [className, setClassName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { token } = useAuth(); // ✅ Get the token from the AuthContext

  const handleCreateClass = useCallback(async () => {
    if (!className) {
      showToast('Please enter a class name.', 'error');
      return;
    }

    setIsCreating(true);
    
    // ✅ FIXED: Use the token from the AuthContext, which is guaranteed to be correct.
    if (!token) {
      showToast('Authentication token not found. Please log in again.', 'error');
      setIsCreating(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/teachers/classes`,
        { className },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const newClass = response.data.class;
      showToast('Class created successfully!', 'success');
      onClassCreated(newClass);
      setActiveTab('classesAndAssignments');

    } catch (error) {
      console.error('Error creating class:', error.response?.data?.error || error.message);
      showToast(error.response?.data?.error || 'Failed to create class. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  }, [className, showToast, setActiveTab, onClassCreated, token]);

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setActiveTab('classesAndAssignments')}
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Create New Class</h2>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class Name</label>
          <input
            type="text"
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Music Theory 101"
          />
        </div>
        
        <button
          onClick={handleCreateClass}
          disabled={isCreating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isCreating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <PlusCircle size={20} className="mr-2" />
              Create Class
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateClassTab;