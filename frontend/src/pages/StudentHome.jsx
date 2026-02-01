// Student Home Page (Dashboard)
// src/pages/StudentHome.jsx
// This is the main page students see after logging in

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { getStudentEnrollments } from '../firebase/students';
import StudentWorkList from '../components/student/StudentWorkList';
import StudentGradesList from '../components/student/StudentGradesList';

const StudentHome = () => {
  const navigate = useNavigate();
  const { student, studentData, pinSession, currentStudentInfo, isGoogleAuth, isPinAuth, signOut } = useStudentAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch student's enrolled classes (only for Google auth)
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
        // For PIN auth, they're enrolled in the class they logged into
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/student-login');
  };

  const handleJoinLiveSession = () => {
    navigate('/join');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/MusicMindAcademyLogo.png"
              alt="Music Mind Academy"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-white">Music Mind Academy</span>
          </div>

          <div className="flex items-center gap-4">
            {currentStudentInfo?.photoURL && (
              <img
                src={currentStudentInfo.photoURL}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="text-right">
              <span className="text-gray-300 block">{currentStudentInfo?.displayName}</span>
              {isPinAuth && (
                <span className="text-xs text-gray-500">Seat {currentStudentInfo?.seatNumber}</span>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {currentStudentInfo?.displayName?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-gray-400">
            {isPinAuth ? `You're signed in to ${currentStudentInfo?.className}` : "Here's your music learning dashboard"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Join Live Session */}
          <button
            onClick={handleJoinLiveSession}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-left hover:from-blue-500 hover:to-purple-500 transition-all group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Join Live Session</h3>
            <p className="text-white/70">Enter a class code to join your teacher's lesson</p>
          </button>

        </div>

        {/* My Work Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">My Work</h2>
          </div>
          <StudentWorkList />
        </div>

        {/* My Grades Section (only for PIN auth) */}
        {isPinAuth && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">My Grades</h2>
            </div>
            <StudentGradesList />
          </div>
        )}

        {/* My Classes Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">My Classes</h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.classId}
                  className="bg-gray-700 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{enrollment.className || 'Music Class'}</h3>
                    <p className="text-sm text-gray-400">Seat {enrollment.seatNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-400 mb-4">You haven't joined any classes yet</p>
              <p className="text-gray-500 text-sm">
                Your teacher will give you a class code to join, or you can join a live session above.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentHome;
