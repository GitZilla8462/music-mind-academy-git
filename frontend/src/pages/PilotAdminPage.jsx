// Admin page for managing pilot program teachers
// src/pages/PilotAdminPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getDatabase, ref, get, set, remove, onValue } from 'firebase/database';
import { Users, UserPlus, Trash2, Mail, Calendar, Shield, ArrowLeft, RefreshCw, BarChart3, Clock, BookOpen, Play, Building2, GraduationCap } from 'lucide-react';
import { getTeacherAnalytics, getPilotSessions, getPilotSummaryStats, subscribeToAnalytics } from '../firebase/analytics';
import { SITE_TYPES } from '../firebase/approvedEmails';

// Your admin email(s) - only these can access this page
const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];

const PilotAdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();

  // Site selection for approved emails (academy or edu)
  const [selectedSite, setSelectedSite] = useState(SITE_TYPES.ACADEMY);

  // Separate approved email lists
  const [academyEmails, setAcademyEmails] = useState([]);
  const [eduEmails, setEduEmails] = useState([]);

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('approved');

  // Get current approved emails based on selected site
  const approvedEmails = selectedSite === SITE_TYPES.ACADEMY ? academyEmails : eduEmails;

  // Analytics state
  const [teacherAnalytics, setTeacherAnalytics] = useState([]);
  const [pilotSessions, setPilotSessions] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);

  const database = getDatabase();

  // Check if current user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  // Fetch data
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Listen to Academy approved emails
    const academyRef = ref(database, 'approvedEmails/academy');
    const unsubAcademy = onValue(academyRef, (snapshot) => {
      if (snapshot.exists()) {
        const emails = [];
        snapshot.forEach((child) => {
          emails.push({ id: child.key, ...child.val() });
        });
        emails.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
        setAcademyEmails(emails);
      } else {
        setAcademyEmails([]);
      }
    });

    // Listen to Edu approved emails
    const eduRef = ref(database, 'approvedEmails/edu');
    const unsubEdu = onValue(eduRef, (snapshot) => {
      if (snapshot.exists()) {
        const emails = [];
        snapshot.forEach((child) => {
          emails.push({ id: child.key, ...child.val() });
        });
        emails.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
        setEduEmails(emails);
      } else {
        setEduEmails([]);
      }
    });

    // Listen to registered users
    const usersRef = ref(database, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((child) => {
          users.push({ id: child.key, ...child.val() });
        });
        // Sort by createdAt descending
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRegisteredUsers(users);
      } else {
        setRegisteredUsers([]);
      }
      setLoading(false);
    });

    // Subscribe to analytics updates
    const unsubAnalytics = subscribeToAnalytics(({ stats, teachers, sessions }) => {
      setSummaryStats(stats);
      setTeacherAnalytics(teachers);
      setPilotSessions(sessions);
    });

    return () => {
      unsubAcademy();
      unsubEdu();
      unsubUsers();
      unsubAnalytics();
    };
  }, [user, isAdmin, database]);

  // Add approved email
  const handleAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setAdding(true);
    setError(null);
    setSuccess(null);

    try {
      const emailKey = newEmail.toLowerCase().trim().replace(/\./g, ',');
      const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);

      await set(emailRef, {
        email: newEmail.toLowerCase().trim(),
        approvedAt: Date.now(),
        notes: newNotes.trim(),
        approvedBy: user.email,
        siteType: selectedSite
      });

      const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
      setSuccess(`Added ${newEmail} to ${siteName}`);
      setNewEmail('');
      setNewNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  // Remove approved email
  const handleRemoveEmail = async (emailKey, email) => {
    const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
    if (!confirm(`Remove ${email} from ${siteName}?`)) return;

    try {
      const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);
      await remove(emailRef);
      setSuccess(`Removed ${email} from ${siteName}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration in minutes
  const formatDuration = (ms) => {
    if (!ms) return '0 min';
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Get lesson name from route
  const getLessonName = (lessonId, lessonRoute) => {
    if (lessonRoute?.includes('lesson1')) return 'Lesson 1: Mood & Expression';
    if (lessonRoute?.includes('lesson2')) return 'Lesson 2: Instrumentation';
    if (lessonRoute?.includes('lesson3')) return 'Lesson 3: Texture';
    if (lessonRoute?.includes('lesson4')) return 'Lesson 4: Form';
    if (lessonRoute?.includes('lesson5')) return 'Lesson 5: Capstone';
    return lessonId || 'Unknown';
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Access Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Pilot Program Admin</h1>
              <p className="text-sm text-gray-500">Manage approved teachers</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield size={16} className="text-green-500" />
            Admin: {user.email}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-blue-200 bg-blue-50">
            <div className="text-2xl font-bold text-blue-600">{academyEmails.length}</div>
            <div className="text-sm text-gray-500">Academy Approved</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-violet-200 bg-violet-50">
            <div className="text-2xl font-bold text-violet-600">{eduEmails.length}</div>
            <div className="text-sm text-gray-500">Edu Approved</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{registeredUsers.length}</div>
            <div className="text-sm text-gray-500">Registered Users</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {summaryStats?.totalSessions || 0}
            </div>
            <div className="text-sm text-gray-500">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(summaryStats?.avgSessionDuration)}
            </div>
            <div className="text-sm text-gray-500">Avg Session</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-teal-600">
              {summaryStats?.mostPopularLesson !== 'N/A'
                ? getLessonName(null, summaryStats?.mostPopularLesson).split(':')[0]
                : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Most Popular</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-pink-600">
              {summaryStats?.retentionRate || 0}%
            </div>
            <div className="text-sm text-gray-500">Return Rate</div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
            {success}
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">×</button>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">×</button>
          </div>
        )}

        {/* Site Selection Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedSite(SITE_TYPES.ACADEMY)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedSite === SITE_TYPES.ACADEMY
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Building2 size={20} />
            Music Mind Academy
            <span className={`px-2 py-0.5 rounded-full text-sm ${
              selectedSite === SITE_TYPES.ACADEMY ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              {academyEmails.length}
            </span>
          </button>
          <button
            onClick={() => setSelectedSite(SITE_TYPES.EDU)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              selectedSite === SITE_TYPES.EDU
                ? 'bg-violet-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <GraduationCap size={20} />
            Music Room Tools
            <span className={`px-2 py-0.5 rounded-full text-sm ${
              selectedSite === SITE_TYPES.EDU ? 'bg-violet-500' : 'bg-gray-200'
            }`}>
              {eduEmails.length}
            </span>
          </button>
        </div>

        {/* Add Email Form */}
        <div className={`rounded-xl border p-6 mb-8 ${
          selectedSite === SITE_TYPES.ACADEMY
            ? 'bg-blue-50 border-blue-200'
            : 'bg-violet-50 border-violet-200'
        }`}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} />
            Add Email to {selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools'}
          </h2>
          <form onSubmit={handleAddEmail} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="teacher@school.edu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notes (optional) - e.g., School name, grade level"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                selectedSite === SITE_TYPES.ACADEMY
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {adding ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Add Email
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Approved Emails ({approvedEmails.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Registered Users ({registeredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 size={18} />
            Teacher Analytics
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Play size={18} />
            Sessions ({pilotSessions.length})
          </button>
        </div>

        {/* Approved Emails List */}
        {activeTab === 'approved' && (
          <div className={`rounded-xl border overflow-hidden ${
            selectedSite === SITE_TYPES.ACADEMY ? 'border-blue-200' : 'border-violet-200'
          }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              selectedSite === SITE_TYPES.ACADEMY
                ? 'bg-blue-50 border-blue-200'
                : 'bg-violet-50 border-violet-200'
            }`}>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {selectedSite === SITE_TYPES.ACADEMY ? <Building2 size={20} /> : <GraduationCap size={20} />}
                {selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools'} - Approved Emails
              </h2>
            </div>

            {approvedEmails.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No approved emails yet. Add one above!
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {approvedEmails.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.email}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(item.approvedAt)}
                        </span>
                        {item.notes && <span>• {item.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase()) ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          Signed Up
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                          Pending
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveEmail(item.id, item.email)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Registered Users List */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users size={20} />
                Registered Users
              </h2>
            </div>

            {registeredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No users have signed up yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {registeredUsers.map((user) => (
                  <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{user.displayName || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Joined: {formatDate(user.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Last login: {formatDate(user.lastLoginAt)}
                      </div>
                    </div>
                    {user.isPilot && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                        Pilot
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teacher Analytics */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} />
                Teacher Activity
              </h2>
            </div>

            {teacherAnalytics.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No teacher activity recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lessons Tried</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teacherAnalytics.map((teacher) => (
                      <tr key={teacher.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-800">{teacher.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(teacher.firstLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(teacher.lastActivity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {teacher.totalSessions}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1 flex-wrap">
                            {teacher.lessonsVisited.length > 0 ? (
                              teacher.lessonsVisited.map((lesson, i) => (
                                <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  {lesson.replace('lesson', 'L').replace('-mood', '')}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">None yet</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(teacher.totalTimeOnSite)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sessions List */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Play size={20} />
                Session History
              </h2>
            </div>

            {pilotSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No sessions created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pilotSessions.map((session) => (
                      <tr key={session.sessionCode} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-600">{session.sessionCode}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.teacherEmail?.split('@')[0] || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            {getLessonName(session.lessonId, session.lessonRoute).split(':')[0]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(session.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.duration ? formatDuration(session.duration) : (
                            <span className="text-green-500 flex items-center gap-1">
                              <Clock size={14} /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                            {session.studentsJoined || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {session.completed ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              Completed
                            </span>
                          ) : (
                            <span className="text-gray-500">{session.lastStage}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PilotAdminPage;
