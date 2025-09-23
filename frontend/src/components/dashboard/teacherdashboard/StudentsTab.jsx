// src/components/dashboard/teacherdashboard/StudentsTab.jsx - REAL API VERSION
import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

const StudentsTab = ({ classes, showToast }) => {
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
        
        // In development, create a dev token if none exists
        if (!token && process.env.NODE_ENV === 'development') {
          console.log('Development mode: creating dev token for API testing');
          sessionStorage.setItem('access_token', 'dev-token-for-testing');
        }
        
        const finalToken = token || 'dev-token-for-testing';

        // Use proxy URL for development, direct URL for production
        let url = process.env.NODE_ENV === 'development' 
          ? '/api/get_students.php' 
          : 'https://api.vocalgrid.com/api/get_students.php';
          
        if (selectedClassId !== 'all') {
          url += `?class_id=${selectedClassId}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${finalToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem('access_token');
            if (process.env.NODE_ENV === 'production') {
              window.location.href = '/login.php';
            } else {
              showToast('Authentication failed - check your API token', 'error');
            }
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error(`Error loading students (${response.status})`);
        }

        const data = await response.json();
        if (data.success) {
          setStudents(data.students);
          showToast(`Loaded ${data.students.length} students from API`, 'success');
        } else {
          showToast(data.error || 'Failed to load students', 'error');
        }
      } catch (err) {
        showToast('Error loading students', 'error');
        console.error('API Error:', err);
      }
    };

    fetchStudents();
  }, [selectedClassId, showToast]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFilteredStudents = [...students]
    .filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Students</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-64"
              aria-label="Search students"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <select 
            className="border rounded-md px-3 py-2"
            aria-label="Filter by class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="all">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('class_name')}
                >
                  Class {sortConfig.key === 'class_name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedFilteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    {students.length === 0 ? 'No students found' : 'No students match your search'}
                  </td>
                </tr>
              ) : (
                sortedFilteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">{student.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.class_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => showToast('Student profile view coming soon!', 'info')}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;