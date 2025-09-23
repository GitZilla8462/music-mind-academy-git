// src/components/dashboard/admindashboard/SchoolsTab.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, School, Users, GraduationCap, MapPin } from 'lucide-react';

const SchoolsTab = ({ showToast }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSchool, setEditingSchool] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const mockSchools = [
        {
          id: 1,
          name: 'Lincoln Elementary School',
          address: '123 Main Street, Springfield, IL 62701',
          phone: '(555) 100-2000',
          email: 'admin@lincoln.edu',
          principal: 'Dr. Jane Anderson',
          teacherCount: 12,
          studentCount: 245,
          status: 'active',
          type: 'Elementary',
          addedDate: '2023-08-15'
        },
        {
          id: 2,
          name: 'Roosevelt High School',
          address: '456 Oak Avenue, Springfield, IL 62702',
          phone: '(555) 200-3000',
          email: 'office@roosevelt.edu',
          principal: 'Mr. Robert Wilson',
          teacherCount: 25,
          studentCount: 892,
          status: 'active',
          type: 'High School',
          addedDate: '2023-07-20'
        },
        {
          id: 3,
          name: 'Washington Middle School',
          address: '789 Pine Street, Springfield, IL 62703',
          phone: '(555) 300-4000',
          email: 'contact@washington.edu',
          principal: 'Ms. Sarah Davis',
          teacherCount: 8,
          studentCount: 156,
          status: 'pending',
          type: 'Middle School',
          addedDate: '2024-01-10'
        }
      ];
      
      setSchools(mockSchools);
    } catch (error) {
      console.error('Error fetching schools:', error);
      showToast('Error loading schools', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (schoolData) => {
    try {
      // API call to create school
      console.log('Creating school:', schoolData);
      
      const newSchool = {
        id: Date.now(),
        ...schoolData,
        teacherCount: 0,
        studentCount: 0,
        status: 'active',
        addedDate: new Date().toISOString().split('T')[0]
      };
      
      setSchools(prev => [...prev, newSchool]);
      setShowCreateModal(false);
      showToast('School added successfully', 'success');
    } catch (error) {
      console.error('Error creating school:', error);
      showToast('Error adding school', 'error');
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (window.confirm('Are you sure you want to delete this school? This will affect all associated teachers and students.')) {
      try {
        // API call to delete school
        setSchools(prev => prev.filter(school => school.id !== schoolId));
        showToast('School deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting school:', error);
        showToast('Error deleting school', 'error');
      }
    }
  };

  const handleEditSchool = (school) => {
    setEditingSchool(school);
    setShowCreateModal(true);
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.principal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CreateSchoolModal = () => {
    const [formData, setFormData] = useState(
      editingSchool || {
        name: '',
        address: '',
        phone: '',
        email: '',
        principal: '',
        type: ''
      }
    );

    const schoolTypes = ['Elementary', 'Middle School', 'High School', 'K-12', 'Other'];

    const handleSubmit = (e) => {
      e.preventDefault();
      if (editingSchool) {
        // Update logic
        setSchools(prev => prev.map(s => s.id === editingSchool.id ? { ...s, ...formData } : s));
        showToast('School updated successfully', 'success');
      } else {
        handleCreateSchool(formData);
      }
      setShowCreateModal(false);
      setEditingSchool(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSchool ? 'Edit School' : 'Add New School'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
                <input
                  type="text"
                  value={formData.principal}
                  onChange={(e) => setFormData(prev => ({ ...prev, principal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select school type</option>
                  {schoolTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSchool(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  {editingSchool ? 'Update School' : 'Add School'}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600">Manage participating schools and institutions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add School
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search schools by name, address, or principal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Schools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No schools found</p>
          </div>
        ) : (
          filteredSchools.map((school) => (
            <div key={school.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <School className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        school.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {school.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSchool(school)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchool(school.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{school.address}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Principal:</strong> {school.principal}</p>
                    <p><strong>Type:</strong> {school.type}</p>
                    <p><strong>Phone:</strong> {school.phone}</p>
                    <p><strong>Email:</strong> {school.email}</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      <span>{school.teacherCount} Teachers</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{school.studentCount} Students</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Added: {new Date(school.addedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && <CreateSchoolModal />}
    </div>
  );
};

export default SchoolsTab;