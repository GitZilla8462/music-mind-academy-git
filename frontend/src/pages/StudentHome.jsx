// Student Home Page (Dashboard)
// src/pages/StudentHome.jsx
// This is the main page students see after logging in

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { getStudentEnrollments } from '../firebase/students';
import { getClassSessionByCode, joinClassSession, subscribeToClassSession } from '../firebase/classes';
import { LogOut, Play, Award, BookOpen, FolderHeart, ClipboardList } from 'lucide-react';
import StudentGradesList from '../components/student/StudentGradesList';
import StudentPortfolio from '../components/student/StudentPortfolio';
import StudentClasswork from '../components/student/StudentClasswork';

const StudentHome = () => {
  const navigate = useNavigate();
  const { student, pinSession, currentStudentInfo, isGoogleAuth, isPinAuth, signOut } = useStudentAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classwork');
  const [activeSession, setActiveSession] = useState(null);
  const [joiningClass, setJoiningClass] = useState(false);

  // Check which site we're on
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const siteName = isEduSite ? 'Music Room Tools' : 'Music Mind Academy';

  // Fetch student's enrolled classes
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (isGoogleAuth && student?.uid) {
        try {
          const data = await getStudentEnrollments(student.uid);
          setEnrollments(data);
        } catch (err) {
          console.error('Error fetching enrollments:', err);
        }
      } else if (isPinAuth && pinSession) {
        setEnrollments([{
          classId: pinSession.classId,
          className: pinSession.className,
          seatNumber: pinSession.seatNumber
        }]);
      }
      setLoading(false);
    };

    fetchEnrollments();
  }, [student?.uid, isGoogleAuth, isPinAuth, pinSession]);

  // Real-time listener for active class session (PIN auth students)
  useEffect(() => {
    if (!isPinAuth || !pinSession?.classId) return;

    const unsubscribe = subscribeToClassSession(pinSession.classId, (sessionData) => {
      if (sessionData?.active) {
        setActiveSession({
          classData: {
            id: pinSession.classId,
            classCode: pinSession.classCode,
            currentSession: sessionData
          }
        });
      } else {
        setActiveSession(null);
      }
    });

    return () => unsubscribe();
  }, [isPinAuth, pinSession?.classId, pinSession?.classCode]);

  const handleJoinClass = async () => {
    if (!activeSession?.classData || !pinSession) return;

    setJoiningClass(true);
    try {
      const seatId = `seat-${pinSession.seatNumber}`;
      await joinClassSession(activeSession.classData.id, seatId, {
        seatNumber: pinSession.seatNumber,
        name: pinSession.displayName || pinSession.username
      });

      const lessonRoute = activeSession.classData.currentSession?.lessonRoute || '/lessons/film-music-project/lesson1';
      window.location.href = `${lessonRoute}?classId=${activeSession.classData.id}&role=student&classCode=${activeSession.classData.classCode}&seatId=${seatId}&username=${pinSession.username}`;
    } catch (err) {
      console.error('Error joining class:', err);
      setJoiningClass(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/student-login');
  };

  const tabs = [
    { id: 'classwork', label: 'Classwork', icon: ClipboardList },
    { id: 'portfolio', label: 'Portfolio', icon: FolderHeart },
    ...(isPinAuth ? [
      { id: 'grades', label: 'Grades', icon: Award },
    ] : []),
    { id: 'classes', label: 'Classes', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header — matches TeacherHeader pattern */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo + Site Name */}
            <div className="flex items-center gap-2">
              {!isEduSite && (
                <img
                  src="/MusicMindAcademyLogo.png"
                  alt="Music Mind Academy"
                  className="h-8 w-auto"
                />
              )}
              <span className="font-semibold text-gray-900 hidden sm:block">{siteName}</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right side — user info + sign out */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {currentStudentInfo?.photoURL ? (
                  <img
                    src={currentStudentInfo.photoURL}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {currentStudentInfo?.displayName?.charAt(0) || 'S'}
                  </div>
                )}
                <span className="text-sm text-gray-700 font-medium hidden md:block max-w-[120px] truncate">
                  {currentStudentInfo?.displayName?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {currentStudentInfo?.displayName?.split(' ')[0] || 'Student'}
            </h1>
            {isPinAuth && currentStudentInfo?.className && (
              <p className="text-sm text-gray-500 mt-0.5">{currentStudentInfo.className}</p>
            )}
          </div>
        </div>

        {/* Join Class banner — big and obvious when active session exists */}
        {activeSession ? (
          <button
            onClick={handleJoinClass}
            disabled={joiningClass}
            className="w-full mb-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {joiningClass ? (
              <>
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xl font-bold">Joining...</span>
              </>
            ) : (
              <>
                <Play size={24} fill="white" />
                <span className="text-xl font-bold">Join Class</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate('/join')}
            className="w-full mb-6 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-xl p-4 transition-all flex items-center justify-center gap-2"
          >
            <Play size={18} />
            <span className="text-sm font-medium">Join a Session</span>
          </button>
        )}

        {/* Tab Content */}
        {activeTab === 'classwork' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                <ClipboardList size={18} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">My Classwork</h2>
            </div>
            <StudentClasswork />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <StudentPortfolio />
        )}

        {activeTab === 'grades' && isPinAuth && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <Award size={18} className="text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">My Grades</h2>
            </div>
            <StudentGradesList />
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : enrollments.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.classId}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{enrollment.className || 'Music Class'}</h3>
                      <p className="text-sm text-gray-500">Seat {enrollment.seatNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 mb-1">No classes yet</p>
                <p className="text-gray-400 text-sm">
                  Your teacher will give you a class code to join.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentHome;
