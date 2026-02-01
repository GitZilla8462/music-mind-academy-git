// Start Session Modal
// src/components/teacher/StartSessionModal.jsx
// Asks teacher: "For my class" (tracked) or "Quick session" (not tracked)

import React, { useState, useEffect } from 'react';
import { X, Users, Zap, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { getTeacherClasses } from '../../firebase/classes';

const StartSessionModal = ({
  isOpen,
  onClose,
  lesson,
  teacherUid,
  onStartForClass,
  onStartQuickSession,
  onCreateClass
}) => {
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [starting, setStarting] = useState(false);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacherUid || !isOpen) return;

      setLoadingClasses(true);
      try {
        const classesData = await getTeacherClasses(teacherUid);
        setClasses(classesData);
        // Auto-select first class if only one
        if (classesData.length === 1) {
          setSelectedClassId(classesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [teacherUid, isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedClassId('');
      setStarting(false);
    }
  }, [isOpen]);

  const handleStartForClass = async () => {
    if (!selectedClassId) return;
    setStarting(true);
    const selectedClass = classes.find(c => c.id === selectedClassId);
    await onStartForClass(selectedClass);
  };

  const handleStartQuickSession = async () => {
    setStarting(true);
    await onStartQuickSession();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Start Lesson</h2>
              <p className="text-sky-100 text-sm mt-1">
                {lesson?.title || 'Lesson'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            How do you want to run this lesson?
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Option 1: Quick Session (LEFT - Primary) */}
            <div className="border-2 border-emerald-200 bg-emerald-50/50 rounded-xl p-5 hover:border-emerald-400 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Session</h3>
                  <span className="text-xs text-emerald-600 font-medium">Fastest way to start</span>
                </div>
              </div>

              <ul className="text-sm text-gray-600 space-y-1.5 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  No student accounts needed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Students join with 4-digit code
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  Just like Kahoot - instant start
                </li>
              </ul>

              <button
                onClick={handleStartQuickSession}
                disabled={starting}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Start Now
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Work saves on student devices only
              </p>
            </div>

            {/* Option 2: For My Class (RIGHT - Coming Soon) */}
            <div className="border-2 border-gray-200 rounded-xl p-5 opacity-50 cursor-not-allowed relative">
              <div className="absolute top-3 right-3 bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                Coming Soon
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-500">For My Class</h3>
              </div>

              <ul className="text-sm text-gray-400 space-y-1.5 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">•</span>
                  Students sign in with username + PIN
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">•</span>
                  Work saves to your gradebook
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">•</span>
                  You can grade and give feedback
                </li>
              </ul>

              <button
                disabled
                className="w-full px-4 py-2.5 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSessionModal;
