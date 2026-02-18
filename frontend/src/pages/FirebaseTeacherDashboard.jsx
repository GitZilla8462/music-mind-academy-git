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
  Trash2,
  GripVertical
} from 'lucide-react';
import CreateClassModal from '../components/teacher/CreateClassModal';
import EditClassModal from '../components/teacher/EditClassModal';
import DeleteClassModal from '../components/teacher/DeleteClassModal';
import TeacherHeader from '../components/teacher/TeacherHeader';

const FirebaseTeacherDashboard = () => {
  const navigate = useNavigate();
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const { user, userData, loading } = useFirebaseAuth();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classSubmissions, setClassSubmissions] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItemRef = React.useRef(null);

  // Class ordering — persisted to localStorage
  const getOrderKey = () => user ? `class-order-${user.uid}` : null;

  const getOrderedClasses = (classList) => {
    const key = getOrderKey();
    if (!key) return classList;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (saved.length === 0) return classList;
      const ordered = [];
      for (const id of saved) {
        const found = classList.find(c => c.id === id);
        if (found) ordered.push(found);
      }
      // Append any new classes not in saved order
      for (const c of classList) {
        if (!ordered.find(o => o.id === c.id)) ordered.push(c);
      }
      return ordered;
    } catch { return classList; }
  };

  const saveOrder = (orderedClasses) => {
    const key = getOrderKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(orderedClasses.map(c => c.id)));
    }
  };

  const handleDragStart = (e, classId) => {
    dragItemRef.current = classId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, classId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (classId !== dragOverId) setDragOverId(classId);
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    setDragOverId(null);
    const sourceId = dragItemRef.current;
    if (!sourceId || sourceId === targetId) return;

    const ordered = getOrderedClasses(classes);
    const sourceIdx = ordered.findIndex(c => c.id === sourceId);
    const targetIdx = ordered.findIndex(c => c.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reordered = [...ordered];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    saveOrder(reordered);
    setClasses([...classes]); // trigger re-render
    dragItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    dragItemRef.current = null;
  };

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
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherHeader />

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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to {isEduSite ? 'Music Room Tools' : 'Music Mind Academy'}</h2>
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
          <div className="space-y-2 max-w-2xl">
            {getOrderedClasses(classes).map((classItem) => {
              const isDragTarget = dragOverId === classItem.id && dragItemRef.current !== classItem.id;

              return (
                <div
                  key={classItem.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, classItem.id)}
                  onDragOver={(e) => handleDragOver(e, classItem.id)}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={(e) => handleDrop(e, classItem.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => navigate(`/teacher/class/${classItem.id}`)}
                  className={`bg-white rounded-lg border flex items-center hover:shadow-sm transition-all cursor-pointer group ${
                    isDragTarget ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200'
                  }`}
                >
                  {/* Color accent */}
                  <div className="w-1.5 self-stretch bg-blue-500 rounded-l-lg flex-shrink-0" />

                  {/* Drag handle */}
                  <div className="px-2 flex-shrink-0 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} className="text-gray-300" />
                  </div>

                  {/* Class info */}
                  <div className="flex-1 py-3 pr-3 flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {classItem.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {classItem.studentCount || 0} students
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditClick(e, classItem); }}
                        className="p-1.5 rounded text-gray-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit class"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(e, classItem); }}
                        className="p-1.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete class"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
