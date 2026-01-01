// Teacher Dashboard for Firebase-authenticated teachers
// src/pages/FirebaseTeacherDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getDatabase, ref, get } from 'firebase/database';
import { LogOut, Plus, Users, BookOpen } from 'lucide-react';

const FirebaseTeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, userData, signOut, loading } = useFirebaseAuth();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Fetch teacher's classes from Realtime Database
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user) return;

      try {
        const database = getDatabase();
        const classesRef = ref(database, `teacherClasses/${user.uid}`);
        const snapshot = await get(classesRef);

        if (snapshot.exists()) {
          const classesData = [];
          snapshot.forEach((child) => {
            classesData.push({ id: child.key, ...child.val() });
          });
          setClasses(classesData);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-semibold text-xl text-gray-800">Music Mind Academy</span>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.displayName?.charAt(0) || 'T'}
                </div>
              )}
              <div className="hidden md:block">
                <div className="font-medium text-gray-800">{user?.displayName}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.displayName?.split(' ')[0] || 'Teacher'}!
          </h1>
          <p className="text-gray-600">
            Manage your classes and assignments from your dashboard.
          </p>
        </div>

        {/* Pilot Status Banner */}
        {userData?.isPilot && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-semibold">Pilot Program Member</div>
              <div className="text-sm text-purple-100">Thank you for being an early adopter!</div>
            </div>
          </div>
        )}

        {/* Classes Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">My Classes</h2>
                <p className="text-sm text-gray-500">{classes.length} {classes.length === 1 ? 'class' : 'classes'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                // TODO: Implement create class modal
                alert('Create Class feature coming soon!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Create Class
            </button>
          </div>

          <div className="p-6">
            {loadingClasses ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Create your first class to start assigning lessons and activities to your students.
                </p>
                <button
                  onClick={() => {
                    // TODO: Implement create class modal
                    alert('Create Class feature coming soon!');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Create Your First Class
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{classItem.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {classItem.studentCount || 0} students
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {classItem.code || 'No code'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/music-loops-in-media')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">Browse Lessons</h3>
            <p className="text-sm text-gray-500">Explore available lessons and activities</p>
          </button>

          <button
            onClick={() => window.open('https://docs.google.com/forms', '_blank')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">Feedback</h3>
            <p className="text-sm text-gray-500">Share your thoughts and suggestions</p>
          </button>

          <button
            onClick={() => window.open('mailto:rob@musicmindacademy.com', '_blank')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">Get Help</h3>
            <p className="text-sm text-gray-500">Contact support for assistance</p>
          </button>
        </div>
      </main>
    </div>
  );
};

export default FirebaseTeacherDashboard;
