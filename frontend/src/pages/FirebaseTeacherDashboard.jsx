// Teacher Dashboard for Firebase-authenticated teachers
// src/pages/FirebaseTeacherDashboard.jsx
// Google Classroom-style: simple class cards, gradebook per-class

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getTeacherClasses } from '../firebase/classes';
import { getAllClassSubmissions } from '../firebase/grades';
import {
  Plus,
  Users,
  AlertCircle,
  Play,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react';
import CreateClassModal from '../components/teacher/CreateClassModal';
import EditClassModal from '../components/teacher/EditClassModal';
import DeleteClassModal from '../components/teacher/DeleteClassModal';
import TeacherHeader from '../components/teacher/TeacherHeader';

const FirebaseTeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, userData, loading } = useFirebaseAuth();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classSubmissions, setClassSubmissions] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Fetch teacher's classes
  const fetchClasses = async () => {
    if (!user) return;

    try {
      const classesData = await getTeacherClasses(user.uid);
      setClasses(classesData);

      // Fetch pending submissions for each class with accounts mode
      const submissionsMap = {};
      for (const classItem of classesData) {
        if (classItem.mode === 'accounts') {
          try {
            const submissions = await getAllClassSubmissions(classItem.id);
            submissionsMap[classItem.id] = submissions;
          } catch (err) {
            console.error(`Error fetching submissions for ${classItem.id}:`, err);
          }
        }
      }
      setClassSubmissions(submissionsMap);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const handleClassCreated = () => {
    fetchClasses();
  };

  const handleEditClick = (e, classItem) => {
    e.stopPropagation();
    setSelectedClass(classItem);
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (e, classItem) => {
    e.stopPropagation();
    setSelectedClass(classItem);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleMenuToggle = (e, classId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === classId ? null : classId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Get pending count for a specific class
  const getPendingCount = (classId) => {
    const subs = classSubmissions[classId];
    if (!subs) return 0;
    return subs.filter(s => s.status === 'pending').length;
  };

  // Calculate total pending for header notification
  const totalPending = Object.values(classSubmissions).reduce((sum, subs) => {
    return sum + (subs?.filter(s => s.status === 'pending')?.length || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherHeader pendingCount={totalPending} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus size={18} />
            Create Class
          </button>
        </div>

        {/* Pilot Banner */}
        {userData?.isPilot && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div className="text-sm">
              <span className="font-semibold">Pilot Program Member</span>
              <span className="text-purple-100 ml-2">Thank you for being an early adopter!</span>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        {loadingClasses ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : classes.length === 0 ? (
          /* Empty State - Two Paths */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">🎵</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Music Mind Academy</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              How would you like to get started?
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Quick Start - Green outline to draw attention */}
              <button
                onClick={() => navigate('/music-classroom-resources')}
                className="p-5 border-2 border-green-400 bg-green-50/50 rounded-xl text-left hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Start Teaching Now</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Jump right in - no setup required.
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Students join with a code</li>
                  <li>• No student accounts needed</li>
                  <li>• Work is not saved</li>
                </ul>
              </button>

              {/* Create Class */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-5 border-2 border-blue-200 rounded-xl text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Create a Class</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Set up once, then track everything.
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Students get login PINs</li>
                  <li>• Work saves automatically</li>
                  <li>• Grade and give feedback</li>
                </ul>
              </button>
            </div>
          </div>
        ) : (
          /* Class Cards Grid - Disabled for now */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => {
              const pendingCount = getPendingCount(classItem.id);

              return (
                <button
                  key={classItem.id}
                  onClick={() => navigate(`/teacher/class/${classItem.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-left hover:shadow-md transition-shadow relative"
                >
                  {pendingCount > 0 && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10">
                      {pendingCount} to grade
                    </div>
                  )}
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white text-lg truncate max-w-[180px]">
                        {classItem.name}
                      </h3>
                      <button
                        onClick={(e) => handleMenuToggle(e, classItem.id)}
                        className="text-white/70 hover:text-white p-1 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <span className="text-white/80 text-sm">
                      {classItem.studentCount || 0} students
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono">
                        Code: {classItem.classCode}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        View Class →
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {openMenuId === classItem.id && (
                    <div className="absolute top-12 right-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                      <button
                        onClick={(e) => handleEditClick(e, classItem)}
                        className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, classItem)}
                        className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Add Class Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer min-h-[180px]"
            >
              <Plus size={32} className="mb-2" />
              <span className="font-medium">Create Class</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        teacherUid={user?.uid}
        onClassCreated={handleClassCreated}
      />

      {/* Edit Class Modal */}
      <EditClassModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClass(null);
        }}
        classData={selectedClass}
        onSave={fetchClasses}
      />

      {/* Delete Class Modal */}
      <DeleteClassModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClass(null);
        }}
        classData={selectedClass}
        onDelete={fetchClasses}
      />
    </div>
  );
};

export default FirebaseTeacherDashboard;
