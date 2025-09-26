// /src/pages/ClassManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Trash2, Edit2, ChevronLeft, Users, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get the token

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '' 
    : 'http://localhost:5000';
    
const ClassManagementPage = ({ showToast }) => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth(); // ✅ Get the token from the AuthContext
  
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [isBulkAddingLoading, setIsBulkAddingLoading] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [numberOfStudents, setNumberOfStudents] = useState(1);
  const [bulkAccounts, setBulkAccounts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteClassModal, setShowDeleteClassModal] = useState(false);

  // ✅ FIXED: No need for getToken() helper, as you can get the token directly from useAuth()
  useEffect(() => {
    const fetchClassData = async () => {
      if (!token) {
        showToast('Authentication error. Please log in again.', 'error');
        navigate('/login');
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClassData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error loading class:', err);
        setError(err.response?.data?.error || `Failed to load class data. Server returned a ${err.response?.status} error.`);
        if (err.response && err.response.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [classId, showToast, navigate, token, logout]);

  const generateRandomAccount = () => {
    const instruments = ['flute', 'piano', 'oboe', 'harp', 'lute', 'drum', 'lyre', 'cello', 'viola', 'organ', 'tuba', 'cymbal', 'horn'];
    const filteredInstruments = instruments.filter(inst => inst.length >= 4 && inst.length <= 5);
    const instrument = filteredInstruments[Math.floor(Math.random() * filteredInstruments.length)];
    const number = Math.floor(100 + Math.random() * 900);
    const generatedName = `${instrument}${number}`;
    
    const animals = ['shark', 'bear', 'lion', 'eagle', 'tiger', 'wolf', 'cat', 'dog', 'zebra', 'mouse', 'snake', 'gecko'];
    const filteredAnimals = animals.filter(animal => animal.length >= 4 && animal.length <= 5);
    const animal = filteredAnimals[Math.floor(Math.random() * filteredAnimals.length)];
    const randomNumber = Math.floor(100 + Math.random() * 900);
    const generatedPass = `${animal}${randomNumber}`;
    
    setAccountName(generatedName);
    setGeneratedPassword(generatedPass);
  };
  
  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!accountName || !generatedPassword) {
      showToast('Please generate an account name and password.', 'warning');
      return;
    }
    
    // ✅ FIXED: Use the token from AuthContext
    try {
      const response = await axios.post(`${API_BASE_URL}/api/teachers/classes/${classId}/students`, {
        name: accountName,
        password: generatedPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast(response.data.message, 'success');
      setIsAddingStudent(false);
      setAccountName('');
      setGeneratedPassword('');
      setClassData(prevData => ({
        ...prevData,
        students: [...prevData.students, response.data.student]
      }));
      
    } catch (err) {
      console.error('Add student error:', err);
      showToast(err.response?.data?.error || 'Failed to add student.', 'error');
    }
  };
  
  const handleBulkAddStudents = async (e) => {
    e.preventDefault();
    // ✅ FIXED: Use the token from AuthContext
    setIsBulkAddingLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/teachers/classes/${classId}/students/bulk`, {
        numberOfStudents
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast(response.data.message, 'success');
      setBulkAccounts(response.data.accounts);

      const updatedResponse = await axios.get(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassData(updatedResponse.data);

    } catch (err) {
      console.error('Bulk add students error:', err.response?.data || err.message);
      showToast(err.response?.data?.error || 'Failed to add students.', 'error');
    } finally {
      setIsBulkAddingLoading(false);
    }
  };

  const handleCopyAccounts = () => {
    const textToCopy = bulkAccounts.map(acc => `Name: ${acc.accountName}, Password: ${acc.password}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    showToast('Student accounts copied to clipboard!', 'info');
  };

  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    // ✅ FIXED: Use the token from AuthContext
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/teachers/classes/${classId}/students/${studentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast(response.data.message, 'success');
      
      setClassData(prevData => ({
        ...prevData,
        students: prevData.students.filter(s => s._id !== studentToDelete._id)
      }));
      
      closeDeleteModal();
    } catch (err) {
      console.error('Delete student error:', err);
      showToast(err.response?.data?.error || 'Failed to delete student.', 'error');
      closeDeleteModal();
    }
  };

  const handleDeleteClass = async () => {
    // ✅ FIXED: Use the token from AuthContext
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/teachers/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast(response.data.message, 'success');
      navigate('/teacher');
      
    } catch (err) {
      console.error('Delete class error:', err);
      showToast(err.response?.data?.error || 'Failed to delete class.', 'error');
    } finally {
      setShowDeleteClassModal(false);
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const StudentRow = ({ student, onView }) => (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">
          {student.name.charAt(0)}
        </div>
        <div>
          <p className="text-gray-800 font-medium">{student.name}</p>
          <p className="text-gray-500 text-sm">Progress: {student.progress}%</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onView(student._id)}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
          aria-label="View student details"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => openDeleteModal(student)}
          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
          aria-label="Delete student"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-500">Loading class data...</p>
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
          Go Back
        </button>
      </div>
    );
  }
  
  if (!classData) {
    return <div className="text-center p-8 text-gray-500">Class not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate('/teacher')} className="text-gray-600 hover:text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">{classData.className}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Students ({classData.students.length})</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setIsBulkAdding(false);
                  setIsAddingStudent(true);
                  generateRandomAccount();
                }} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-md"
              >
                <PlusCircle size={20} className="mr-2" />
                Add Student
              </button>
              <button 
                onClick={() => {
                  setIsAddingStudent(false);
                  setIsBulkAdding(true);
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800 transition-colors shadow-md"
              >
                <Users size={20} className="mr-2" />
                Bulk Add
              </button>
            </div>
          </div>
          
          {classData.students.length === 0 ? (
            <div className="text-center p-10 bg-gray-100 rounded-lg">
              <p className="text-gray-500 italic">No students in this class yet. Add some to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {classData.students.map(student => (
                <StudentRow key={student._id} student={student} onView={handleViewStudent} />
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Class Details</h2>
          <div className="space-y-2">
            <p className="text-gray-600"><strong>Teacher:</strong> {classData.teacherName}</p>
            <p className="text-gray-600"><strong>Students:</strong> {classData.students.length}</p>
          </div>
          <button
            onClick={() => setShowDeleteClassModal(true)}
            className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Class
          </button>
        </div>
      </div>
      
      {isAddingStudent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add a New Student</h3>
            <form onSubmit={handleAddStudent}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Account Name</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={generateRandomAccount}
                    className="ml-2 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <div className="flex items-center relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 pr-10"
                    value={generatedPassword}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 text-gray-500"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isBulkAdding && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl">
            <h3 className="text-2xl font-bold mb-4">Bulk Add Students</h3>
            <p className="text-gray-600 mb-6">Create multiple student accounts at once. We'll generate a list of unique usernames and passwords for you to print and share.</p>

            <form onSubmit={handleBulkAddStudents}>
              <div className="mb-6">
                <label htmlFor="numberOfStudents" className="block text-gray-700 text-sm font-bold mb-2">
                  Number of Students
                </label>
                <input
                  type="number"
                  id="numberOfStudents"
                  value={numberOfStudents}
                  onChange={(e) => setNumberOfStudents(Number(e.target.value))}
                  min="1"
                  max="50"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkAdding(false);
                    setBulkAccounts([]);
                  }}
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBulkAddingLoading}
                  className={`bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors ${isBulkAddingLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {isBulkAddingLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : 'Generate Accounts'}
                </button>
              </div>
            </form>

            {bulkAccounts.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-bold mb-3">Generated Accounts:</h4>
                <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Username</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkAccounts.map((account, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-gray-800">{account.accountName}</td>
                          <td className="px-4 py-2 text-gray-800">{account.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleCopyAccounts}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition-colors"
                  >
                    <Copy size={20} className="inline mr-2" />
                    Copy Accounts
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700">Are you sure you want to delete this student?</p>
            <p className="text-red-500 font-bold mt-2">This action cannot be undone.</p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteClassModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Confirm Class Deletion</h3>
            <p className="text-gray-700">
              Are you sure you want to delete the class **{classData.className}**?
            </p>
            <p className="text-red-500 font-bold mt-2">
              This will also permanently delete all {classData.students.length} students within this class.
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowDeleteClassModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagementPage;