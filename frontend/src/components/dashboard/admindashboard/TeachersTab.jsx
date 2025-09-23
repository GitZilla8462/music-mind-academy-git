// /src/components/dashboard/admindashboard/TeachersTab.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Search, Edit3, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext'; 

const API_BASE_URL = 'http://localhost:5000/api/admin';

const TeachersTab = ({ showToast }) => {
  const { user, token } = useAuth(); // This will now work correctly
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);

  const fetchTeachers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      if (error.response && error.response.status === 401) {
        showToast('Session expired. Please log in again.', 'error');
      } else {
        showToast('Error loading teachers', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast, token]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchTeachers();
    }
  }, [fetchTeachers, token]);

  const handleCreateTeacher = useCallback(async (teacherData) => {
    const teacherWithRole = {
      ...teacherData,
      role: 'teacher'
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/teachers`, teacherWithRole, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      setTeachers(prev => [...prev, response.data.teacher || response.data]);
      setShowCreateModal(false);
      showToast('Teacher account created successfully!', 'success');
    } catch (error) {
      console.error('Error creating teacher:', error.response?.data || error);
      showToast(error.response?.data?.error || error.message, 'error');
    }
  }, [showToast, token]);

  const handleDeleteTeacher = useCallback(async (teacherId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this teacher account?');
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/teachers/${teacherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTeachers(prev => prev.filter(teacher => teacher._id !== teacherId));
      showToast(response.data.message, 'success');
    } catch (error) {
      console.error('Error deleting teacher:', error.response?.data || error);
      showToast(error.response?.data?.error || error.message, 'error');
    }
  }, [showToast, token]);

  const handleEditTeacher = useCallback(async (updatedTeacher) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/teachers/${updatedTeacher._id}`, updatedTeacher, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      setTeachers(prev => prev.map(t => (t._id === response.data.teacher._id ? response.data.teacher : t)));
      showToast(response.data.message, 'success');
      setEditingTeacher(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error updating teacher:', error.response?.data || error);
      showToast(error.response?.data?.error || error.message, 'error');
    }
  }, [showToast, token]);

  const filteredTeachers = teachers.filter(teacher =>
    (teacher.name && teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (teacher.school && teacher.school.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const CreateTeacherModal = () => {
    const [formData, setFormData] = useState(
      editingTeacher || {
        name: '',
        email: '',
        phone: '',
        school: '',
        subjects: [],
        password: ''
      }
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.name.trim()) {
        showToast('Name is required', 'error');
        return;
      }
      if (!formData.email.trim()) {
        showToast('Email is required', 'error');
        return;
      }
      if (!formData.school.trim()) {
        showToast('School is required', 'error');
        return;
      }
      if (!editingTeacher && !formData.password.trim()) {
        showToast('Password is required', 'error');
        return;
      }

      if (editingTeacher) {
        await handleEditTeacher(formData);
      } else {
        await handleCreateTeacher(formData);
      }
    };

    const handleSubjectChange = (subject) => {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.includes(subject)
          ? prev.subjects.filter(s => s !== subject)
          : [...prev.subjects, subject]
      }));
    };

    const availableSubjects = ['Music Theory', 'Vocal Training', 'Piano', 'Guitar', 'Composition', 'Music History'];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTeacher ? 'Edit Teacher' : 'Create New Teacher Account'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="organization"
                />
              </div>
              {!editingTeacher && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="6"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSubjects.map(subject => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectChange(subject)}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600">Manage teacher accounts and permissions</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setEditingTeacher(null);
          }}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Teacher
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers by name, email, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No teachers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School & Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-sm text-gray-500">{teacher.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" /> {teacher.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" /> {teacher.school}
                      </div>
                      <div className="text-sm text-gray-500">
                        {teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'No subjects assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        teacher.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {teacher.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.studentsCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingTeacher(teacher);
                            setShowCreateModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit teacher"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete teacher"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showCreateModal && <CreateTeacherModal />}
    </div>
  );
};

export default TeachersTab;