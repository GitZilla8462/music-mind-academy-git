// /src/pages/EditClassPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, X, AlertTriangle } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://music-mind-academy-git-production.up.railway.app' 
    : 'http://localhost:5000';

const EditClassPage = ({ showToast }) => {
  const { classId } = useParams();
  const navigate = useNavigate();

  // State for form data
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [students, setStudents] = useState([]); // Students are managed on the ClassManagementPage
  const [studentInput, setStudentInput] = useState('');

  // State for UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const getToken = useCallback(() => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }, []);

  const handleError = useCallback((err, type = 'general') => {
    let prefix = '';
    switch (type) {
      case 'fetch': prefix = 'Error loading class: '; break;
      case 'update': prefix = 'Error updating class: '; break;
      case 'delete': prefix = 'Error deleting class: '; break;
      default: prefix = 'Error: ';
    }
    const message = err.response?.data?.error || err.message;
    showToast(`${prefix}${message}`, 'error');
    console.error(`${prefix} Full error:`, err.response?.data || err);
  }, [showToast]);

  useEffect(() => {
    const fetchClassData = async () => {
      const token = getToken();
      if (!token) {
        showToast('You must be logged in to edit class details', 'error');
        navigate('/login');
        return;
      }
      if (!classId) {
        showToast('Class ID is missing. Unable to fetch class details.', 'error');
        navigate('/teacher'); // Navigate to teacher dashboard
        return;
      }
      
      try {
        setIsLoading(true);
        // ✅ Use Axios and correct URL for your Node.js backend
        const response = await axios.get(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = response.data;
        
        // This page is for editing class details, not students. We will not use students state here.
        setClassName(data.className || '');
        setDescription(data.description || '');
        setOriginalData({ 
          className: data.className || '', 
          description: data.description || ''
        });
        
      } catch (err) {
        handleError(err, 'fetch');
        setTimeout(() => navigate('/teacher'), 2000); // Navigate back to dashboard
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClassData();
  }, [classId, navigate, showToast, handleError, getToken]);

  const hasUnsavedChanges = useCallback(() => {
    if (!originalData) return false;
    // We only check for changes to class name and description
    return className !== originalData.className || description !== originalData.description;
  }, [className, description, originalData]);

  const validateForm = () => {
    const newErrors = {};
    if (!className.trim()) newErrors.className = 'Class name is required';
    if (Object.keys(newErrors).length > 0) {
      showToast('Please fix the form errors.', 'warning');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!hasUnsavedChanges()) {
      showToast('No changes were made to save', 'info');
      navigate('/teacher');
      return;
    }
    const token = getToken();
    if (!token) {
      showToast('Authentication error. Please log in again.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const updatedData = { 
        className: className.trim(), 
        description: description.trim() 
      };
      
      // ✅ Use Axios and correct URL for your Node.js backend
      await axios.put(`${API_BASE_URL}/api/teachers/classes/${classId}`, updatedData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showToast('Class updated successfully!', 'success');
      navigate('/teacher');
    } catch (err) {
      handleError(err, 'update');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    const token = getToken();
    if (!token || !classId) return;
    
    try {
      // ✅ Use Axios and correct URL for your Node.js backend
      await axios.delete(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showToast('Class deleted successfully', 'success');
      navigate('/teacher');
      
    } catch (err) {
      handleError(err, 'delete');
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Helper functions for students are no longer needed on this page
  const handleBack = () => { 
    if (hasUnsavedChanges()) {
      setShowUnsavedModal(true); 
    } else {
      navigate('/teacher'); 
    }
  };
  const confirmNavigateAway = () => { setShowUnsavedModal(false); navigate('/teacher'); };

  if (isLoading) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button onClick={handleBack} className="flex items-center text-blue-600 hover:underline">
        <ArrowLeft className="mr-2" size={18} />
        Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold">Edit Class</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Class Name</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center text-red-600 hover:underline"
          >
            <Trash2 className="mr-1" size={18} />
            Delete Class
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-lg">
            <h3 className="text-lg font-bold">Confirm Delete</h3>
            <p>Are you sure you want to delete this class? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-500" size={24} />
              <h3 className="text-lg font-bold">Unsaved Changes</h3>
            </div>
            <p>You have unsaved changes. Are you sure you want to leave without saving?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowUnsavedModal(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button onClick={confirmNavigateAway} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClassPage;