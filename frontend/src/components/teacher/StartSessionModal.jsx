// Start Session Modal
// src/components/teacher/StartSessionModal.jsx
// Asks teacher: "For my class" (tracked) or "Quick session" (not tracked)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Eye, Plus, ChevronDown, Loader2, Printer } from 'lucide-react';
import { getTeacherClasses } from '../../firebase/classes';

// Feature flag: set to true to re-enable Quick Session mode
const SHOW_QUICK_SESSION = false;

const StartSessionModal = ({
  isOpen,
  onClose,
  lesson,
  teacherUid,
  onStartForClass,
  onStartQuickSession,
  onCreateClass,
  preselectedClassId
}) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [starting, setStarting] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacherUid || !isOpen) return;

      setLoadingClasses(true);
      try {
        const classesData = await getTeacherClasses(teacherUid);
        setClasses(classesData);
        // Auto-select preselected class (just created) or first class if only one
        if (preselectedClassId) {
          setSelectedClassId(preselectedClassId);
          setJustCreated(true);
        } else if (classesData.length === 1) {
          setSelectedClassId(classesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [teacherUid, isOpen, preselectedClassId]);

  // Reset state when modal opens (but not preselectedClassId — that's handled above)
  useEffect(() => {
    if (isOpen && !preselectedClassId) {
      setSelectedClassId('');
      setStarting(false);
      setJustCreated(false);
    }
  }, [isOpen, preselectedClassId]);

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
          {SHOW_QUICK_SESSION ? (
            <>
              <p className="text-gray-600 text-center mb-6">
                How do you want to run this lesson?
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Option 1: Quick Session (LEFT) */}
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

                {/* Option 2: Classroom Mode (RIGHT) */}
                <div className="border-2 border-blue-200 bg-blue-50/50 rounded-xl p-5 hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Classroom Mode</h3>
                      <span className="text-xs text-blue-600 font-medium">Track student work</span>
                    </div>
                  </div>

                  <ul className="text-sm text-gray-600 space-y-1.5 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      Students sign in with username + password
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      Work saves to your gradebook
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      You can grade and give feedback
                    </li>
                  </ul>

                  {loadingClasses ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading classes...
                    </div>
                  ) : classes.length === 0 ? (
                    <button
                      onClick={onCreateClass}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Create a Class
                    </button>
                  ) : (
                    <>
                      <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a class...</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleStartForClass}
                        disabled={starting || !selectedClassId}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {starting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Users size={18} />
                            Start for Class
                          </>
                        )}
                      </button>
                    </>
                  )}

                  <p className="text-xs text-gray-500 text-center mt-3">
                    Work saves to your gradebook
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Classroom-only mode: clean single-panel flow */
            <div className="max-w-sm mx-auto">
              {loadingClasses ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading classes...
                </div>
              ) : classes.length === 0 ? (
                <div className="space-y-4">
                  {/* Preview option — primary for new teachers */}
                  <button
                    onClick={() => {
                      localStorage.setItem('teacher-previewed-lesson', 'true');
                      onClose();
                      navigate(`${lesson.route}?role=teacher&preview=true`);
                    }}
                    className="w-full px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    Preview Lesson
                  </button>
                  <p className="text-xs text-gray-500 text-center -mt-2">
                    Click through slides and activities — no students needed
                  </p>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
                  </div>

                  {/* Create class — secondary */}
                  <button
                    onClick={onCreateClass}
                    className="w-full px-4 py-3 border-2 border-gray-200 hover:border-blue-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Create a Class to Start with Students
                  </button>
                </div>
              ) : (
                <>
                  {justCreated && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-green-700 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Class ready! Hit Start Lesson below.</span>
                    </div>
                  )}

                  {classes.length === 1 ? (
                    /* Single class — skip the dropdown, just show the class and go */
                    <>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${justCreated ? 'bg-green-100' : 'bg-blue-100'}`}>
                          <Users className={`w-5 h-5 ${justCreated ? 'text-green-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{classes[0].name}</h3>
                          <span className="text-xs text-gray-500">Students join with their username + password</span>
                        </div>
                      </div>

                      <button
                        onClick={handleStartForClass}
                        disabled={starting}
                        className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${justCreated ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {starting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Users size={18} />
                            Start Lesson
                          </>
                        )}
                      </button>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          Student work saves to your gradebook
                        </p>
                        <button
                          onClick={() => window.open(`/teacher/class/${classes[0].id}?print=true`, '_blank')}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Printer size={12} />
                          Print login cards
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Multiple classes — show dropdown */
                    <>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Select a Class</h3>
                          <span className="text-xs text-gray-500">Students join with their username + password</span>
                        </div>
                      </div>

                      <select
                        value={selectedClassId}
                        onChange={(e) => {
                          if (e.target.value === '__create_new__') {
                            onCreateClass?.();
                          } else {
                            setSelectedClassId(e.target.value);
                            setJustCreated(false);
                          }
                        }}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${justCreated && selectedClassId ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                      >
                        <option value="">Select a class...</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                        <option value="__create_new__">+ Create new class</option>
                      </select>
                      <button
                        onClick={handleStartForClass}
                        disabled={starting || !selectedClassId}
                        className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${justCreated && selectedClassId ? 'bg-green-600 hover:bg-green-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {starting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Users size={18} />
                            Start Lesson
                          </>
                        )}
                      </button>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          Student work saves to your gradebook
                        </p>
                        {selectedClassId && (
                          <button
                            onClick={() => window.open(`/teacher/class/${selectedClassId}?print=true`, '_blank')}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Printer size={12} />
                            Print login cards
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* Preview option */}
                  <button
                    onClick={() => {
                      localStorage.setItem('teacher-previewed-lesson', 'true');
                      onClose();
                      navigate(`${lesson.route}?role=teacher&preview=true`);
                    }}
                    className="w-full mt-3 px-4 py-2.5 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye size={16} />
                    Just preview (no students)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartSessionModal;
