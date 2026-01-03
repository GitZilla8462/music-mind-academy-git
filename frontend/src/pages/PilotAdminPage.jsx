// Admin page for managing pilot program teachers
// src/pages/PilotAdminPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getDatabase, ref, get, set, remove, onValue } from 'firebase/database';
import { Users, UserPlus, Trash2, Mail, Calendar, Shield, ArrowLeft, RefreshCw, BarChart3, Clock, BookOpen, Play, Building2, GraduationCap, ChevronDown, ChevronUp, MessageSquare, Star } from 'lucide-react';
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

  // Batch add state
  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [batchEmails, setBatchEmails] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [batchAdding, setBatchAdding] = useState(false);

  // Get current approved emails based on selected site
  const approvedEmails = selectedSite === SITE_TYPES.ACADEMY ? academyEmails : eduEmails;

  // Analytics state
  const [teacherAnalytics, setTeacherAnalytics] = useState([]);
  const [pilotSessions, setPilotSessions] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});

  // Survey state
  const [quickSurveys, setQuickSurveys] = useState([]);
  const [midPilotSurveys, setMidPilotSurveys] = useState([]);
  const [finalPilotSurveys, setFinalPilotSurveys] = useState([]);

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

    // Listen to quick surveys (at root level)
    const quickSurveysRef = ref(database, 'surveys');
    const unsubQuickSurveys = onValue(quickSurveysRef, (snapshot) => {
      if (snapshot.exists()) {
        const surveys = [];
        snapshot.forEach((child) => {
          // Skip midPilot and finalPilot folders
          if (child.key === 'midPilot' || child.key === 'finalPilot') return;
          const data = child.val();
          if (data && data.surveyType === 'quick') {
            surveys.push({ id: child.key, ...data });
          }
        });
        surveys.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        setQuickSurveys(surveys);
      } else {
        setQuickSurveys([]);
      }
    });

    // Listen to mid-pilot surveys
    const midPilotRef = ref(database, 'surveys/midPilot');
    const unsubMidPilot = onValue(midPilotRef, (snapshot) => {
      if (snapshot.exists()) {
        const surveys = [];
        snapshot.forEach((child) => {
          surveys.push({ id: child.key, ...child.val() });
        });
        surveys.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        setMidPilotSurveys(surveys);
      } else {
        setMidPilotSurveys([]);
      }
    });

    // Listen to final pilot surveys
    const finalPilotRef = ref(database, 'surveys/finalPilot');
    const unsubFinalPilot = onValue(finalPilotRef, (snapshot) => {
      if (snapshot.exists()) {
        const surveys = [];
        snapshot.forEach((child) => {
          surveys.push({ id: child.key, ...child.val() });
        });
        surveys.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        setFinalPilotSurveys(surveys);
      } else {
        setFinalPilotSurveys([]);
      }
    });

    return () => {
      unsubAcademy();
      unsubEdu();
      unsubUsers();
      unsubAnalytics();
      unsubQuickSurveys();
      unsubMidPilot();
      unsubFinalPilot();
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

  // Batch add emails
  const handleBatchAdd = async (e) => {
    e.preventDefault();
    if (!batchEmails.trim()) return;

    setBatchAdding(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse emails - split by commas, newlines, spaces, or semicolons
      const emailList = batchEmails
        .split(/[\s,;\n]+/)
        .map(email => email.toLowerCase().trim())
        .filter(email => email && email.includes('@'));

      if (emailList.length === 0) {
        setError('No valid emails found. Make sure each email contains @');
        setBatchAdding(false);
        return;
      }

      // Remove duplicates
      const uniqueEmails = [...new Set(emailList)];

      let added = 0;
      let skipped = 0;

      for (const email of uniqueEmails) {
        const emailKey = email.replace(/\./g, ',');
        const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);

        // Check if already exists
        const snapshot = await get(emailRef);
        if (snapshot.exists()) {
          skipped++;
          continue;
        }

        await set(emailRef, {
          email: email,
          approvedAt: Date.now(),
          notes: batchNotes.trim(),
          approvedBy: user.email,
          siteType: selectedSite
        });
        added++;
      }

      const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
      setSuccess(`Added ${added} email${added !== 1 ? 's' : ''} to ${siteName}${skipped > 0 ? ` (${skipped} already existed)` : ''}`);
      setBatchEmails('');
      setBatchNotes('');
      setShowBatchAdd(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBatchAdding(false);
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

  // Auth loading - show minimal spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Checking authentication...</p>
        </div>
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
        {/* Data loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading admin data...</p>
            </div>
          </div>
        ) : (
        <>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <UserPlus size={20} />
              Add Email to {selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools'}
            </h2>
            <button
              onClick={() => setShowBatchAdd(!showBatchAdd)}
              className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                showBatchAdd
                  ? 'bg-gray-200 text-gray-700'
                  : selectedSite === SITE_TYPES.ACADEMY
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              }`}
            >
              {showBatchAdd ? 'Single Email' : 'Batch Add'}
            </button>
          </div>

          {!showBatchAdd ? (
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
          ) : (
            <form onSubmit={handleBatchAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paste multiple emails (separated by commas, spaces, or new lines)
                </label>
                <textarea
                  value={batchEmails}
                  onChange={(e) => setBatchEmails(e.target.value)}
                  placeholder="teacher1@school.edu, teacher2@school.edu&#10;teacher3@school.edu&#10;teacher4@school.edu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white h-32 font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {batchEmails.split(/[\s,;\n]+/).filter(e => e && e.includes('@')).length} email(s) detected
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    placeholder="Notes for all emails (optional) - e.g., Winter 2025 cohort"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={batchAdding}
                  className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                    selectedSite === SITE_TYPES.ACADEMY
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-violet-600 hover:bg-violet-700'
                  }`}
                >
                  {batchAdding ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
                  Add All Emails
                </button>
              </div>
            </form>
          )}
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
            onClick={() => setActiveTab('lessonAnalytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'lessonAnalytics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={18} />
            Lesson Analytics
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
          <button
            onClick={() => setActiveTab('surveys')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'surveys'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={18} />
            Surveys ({midPilotSurveys.length + finalPilotSurveys.length + quickSurveys.length})
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
                Teacher Progress
              </h2>
              <p className="text-sm text-gray-500 mt-1">Click on a lesson cell to see session details</p>
            </div>

            {(() => {
              // Build teacher lesson data from sessions
              const teacherLessonData = {};

              pilotSessions.forEach(session => {
                const email = session.teacherEmail;
                if (!email) return;

                // Determine lesson number
                let lessonNum = null;
                if (session.lessonRoute?.includes('lesson1')) lessonNum = 1;
                else if (session.lessonRoute?.includes('lesson2')) lessonNum = 2;
                else if (session.lessonRoute?.includes('lesson3')) lessonNum = 3;
                else if (session.lessonRoute?.includes('lesson4')) lessonNum = 4;
                else if (session.lessonRoute?.includes('lesson5')) lessonNum = 5;

                if (!lessonNum) return;

                // Initialize teacher data
                if (!teacherLessonData[email]) {
                  teacherLessonData[email] = {
                    email,
                    lessons: { 1: [], 2: [], 3: [], 4: [], 5: [] }
                  };
                }

                // Add session to lesson
                teacherLessonData[email].lessons[lessonNum].push({
                  sessionCode: session.sessionCode,
                  date: session.startTime,
                  students: session.studentsJoined || 0,
                  duration: session.duration || 0,
                  completed: session.completed || false
                });
              });

              const teachers = Object.values(teacherLessonData).sort((a, b) =>
                a.email.localeCompare(b.email)
              );

              if (teachers.length === 0) {
                return (
                  <div className="p-8 text-center text-gray-500">
                    No teacher activity recorded yet.
                  </div>
                );
              }

              // Render lesson cell
              const LessonCell = ({ sessions, lessonNum, teacherEmail }) => {
                const [expanded, setExpanded] = useState(false);

                if (sessions.length === 0) {
                  return (
                    <td className="px-3 py-4 text-center">
                      <span className="text-gray-300">—</span>
                    </td>
                  );
                }

                const totalStudents = sessions.reduce((sum, s) => sum + s.students, 0);
                const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
                const sessionCount = sessions.length;

                // Only count as "completed" if: completed + 10+ students + 15+ minutes
                const MIN_STUDENTS = 10;
                const MIN_DURATION = 15 * 60 * 1000; // 15 minutes in ms
                const hasCompleted = sessions.some(s =>
                  s.completed && s.students >= MIN_STUDENTS && s.duration >= MIN_DURATION
                );

                return (
                  <td className="px-2 py-2 relative">
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        hasCompleted
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {hasCompleted ? '✓' : '⏳'}
                        <span>{totalStudents}</span>
                        {sessionCount > 1 && (
                          <span className="text-xs opacity-70">×{sessionCount}</span>
                        )}
                      </div>
                      <div className="text-xs opacity-70 mt-0.5">
                        {formatDuration(totalTime)}
                      </div>
                    </button>

                    {/* Expanded dropdown */}
                    {expanded && (
                      <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            Lesson {lessonNum} Details
                          </span>
                          <button
                            onClick={() => setExpanded(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {sessionCount} session{sessionCount > 1 ? 's' : ''} · {totalStudents} students · {formatDuration(totalTime)}
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {sessions
                            .sort((a, b) => (b.date || 0) - (a.date || 0))
                            .map((session, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded text-xs ${
                                  session.completed ? 'bg-green-50' : 'bg-yellow-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {session.date ? new Date(session.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    }) : 'Unknown'}
                                  </span>
                                  <span className={session.completed ? 'text-green-600' : 'text-yellow-600'}>
                                    {session.completed ? '✓ Done' : '⏳ Partial'}
                                  </span>
                                </div>
                                <div className="text-gray-500 mt-1">
                                  {session.students} students · {formatDuration(session.duration)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </td>
                );
              };

              return (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">L1</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">L2</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 bg-purple-50">L3</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">L4</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 bg-amber-50">L5</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teachers.map((teacher) => (
                        <tr key={teacher.email} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800 text-sm">
                              {teacher.email.split('@')[0]}
                            </div>
                            <div className="text-xs text-gray-400">
                              @{teacher.email.split('@')[1]}
                            </div>
                          </td>
                          <LessonCell sessions={teacher.lessons[1]} lessonNum={1} teacherEmail={teacher.email} />
                          <LessonCell sessions={teacher.lessons[2]} lessonNum={2} teacherEmail={teacher.email} />
                          <LessonCell sessions={teacher.lessons[3]} lessonNum={3} teacherEmail={teacher.email} />
                          <LessonCell sessions={teacher.lessons[4]} lessonNum={4} teacherEmail={teacher.email} />
                          <LessonCell sessions={teacher.lessons[5]} lessonNum={5} teacherEmail={teacher.email} />
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Legend */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓ 25</span>
                      <span>= Completed (10+ students, 15+ min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">⏳ 15</span>
                      <span>= Test run / partial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">—</span>
                      <span>= Not started</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-50 px-2 py-1 rounded">L3</span>
                      <span>= Survey needed</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Lesson Analytics */}
        {activeTab === 'lessonAnalytics' && (
          <div className="space-y-6">
            {(() => {
              // Calculate lesson-level analytics from sessions
              const lessonData = {};
              const lessons = ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5'];

              lessons.forEach(lessonId => {
                lessonData[lessonId] = {
                  sessions: [],
                  totalDuration: 0,
                  stageTimes: {},
                  completed: 0
                };
              });

              // Process all sessions
              pilotSessions.forEach(session => {
                const lessonId = session.lessonRoute?.includes('lesson1') ? 'lesson1'
                  : session.lessonRoute?.includes('lesson2') ? 'lesson2'
                  : session.lessonRoute?.includes('lesson3') ? 'lesson3'
                  : session.lessonRoute?.includes('lesson4') ? 'lesson4'
                  : session.lessonRoute?.includes('lesson5') ? 'lesson5'
                  : null;

                if (lessonId && lessonData[lessonId]) {
                  lessonData[lessonId].sessions.push(session);
                  lessonData[lessonId].totalDuration += session.duration || 0;
                  if (session.completed) lessonData[lessonId].completed++;

                  // Aggregate stage times
                  if (session.stageTimes) {
                    Object.entries(session.stageTimes).forEach(([stage, time]) => {
                      if (!lessonData[lessonId].stageTimes[stage]) {
                        lessonData[lessonId].stageTimes[stage] = { total: 0, count: 0 };
                      }
                      lessonData[lessonId].stageTimes[stage].total += time;
                      lessonData[lessonId].stageTimes[stage].count++;
                    });
                  }
                }
              });

              const lessonNames = {
                lesson1: 'Lesson 1: Mood & Expression',
                lesson2: 'Lesson 2: Instrumentation',
                lesson3: 'Lesson 3: Texture',
                lesson4: 'Lesson 4: Form',
                lesson5: 'Lesson 5: Capstone'
              };

              const lessonColors = {
                lesson1: 'blue',
                lesson2: 'purple',
                lesson3: 'green',
                lesson4: 'orange',
                lesson5: 'pink'
              };

              return lessons.map(lessonId => {
                const data = lessonData[lessonId];
                const sessionCount = data.sessions.length;
                const avgDuration = sessionCount > 0 ? data.totalDuration / sessionCount : 0;
                const completionRate = sessionCount > 0 ? Math.round((data.completed / sessionCount) * 100) : 0;

                // Sort stages by total time
                const sortedStages = Object.entries(data.stageTimes)
                  .map(([stage, stats]) => ({
                    stage,
                    total: stats.total,
                    avg: stats.count > 0 ? stats.total / stats.count : 0,
                    count: stats.count
                  }))
                  .sort((a, b) => b.total - a.total);

                // Find max for bar chart scaling
                const maxTime = sortedStages.length > 0 ? sortedStages[0].total : 0;

                return (
                  <div key={lessonId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className={`px-6 py-4 border-b bg-${lessonColors[lessonId]}-50 border-${lessonColors[lessonId]}-200`}>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {lessonNames[lessonId]}
                      </h2>
                    </div>

                    <div className="p-6">
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{sessionCount}</div>
                          <div className="text-sm text-gray-500">Sessions</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{formatDuration(avgDuration)}</div>
                          <div className="text-sm text-gray-500">Avg Duration</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                          <div className="text-sm text-gray-500">Completed</div>
                        </div>
                      </div>

                      {/* Stage Times Bar Chart */}
                      {sortedStages.length > 0 ? (
                        <div>
                          <h3 className="font-medium text-gray-700 mb-3">Time by Activity</h3>
                          <div className="space-y-2">
                            {sortedStages.map(({ stage, total, avg, count }) => (
                              <div key={stage} className="flex items-center gap-3">
                                <div className="w-40 text-sm text-gray-600 truncate" title={stage}>
                                  {stage}
                                </div>
                                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                                    style={{ width: `${maxTime > 0 ? (total / maxTime) * 100 : 0}%`, minWidth: '40px' }}
                                  >
                                    <span className="text-xs text-white font-medium">
                                      {formatDuration(total)}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-24 text-xs text-gray-500 text-right">
                                  avg: {formatDuration(avg)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-4">
                          No activity data yet
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
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
                    {pilotSessions.map((session) => {
                      const isExpanded = expandedSessions[session.sessionCode];
                      const hasStageData = session.stageTimes && Object.keys(session.stageTimes).length > 0;

                      return (
                        <React.Fragment key={session.sessionCode}>
                          <tr
                            className={`hover:bg-gray-50 ${hasStageData ? 'cursor-pointer' : ''}`}
                            onClick={() => hasStageData && setExpandedSessions(prev => ({
                              ...prev,
                              [session.sessionCode]: !prev[session.sessionCode]
                            }))}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {hasStageData && (
                                  isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />
                                )}
                                <span className="font-mono font-bold text-blue-600">{session.sessionCode}</span>
                              </div>
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

                          {/* Expanded stage times row */}
                          {isExpanded && hasStageData && (
                            <tr className="bg-gray-50">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-700 mb-2">Time per Stage:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(session.stageTimes)
                                      .sort((a, b) => b[1] - a[1]) // Sort by time descending
                                      .map(([stage, time]) => (
                                        <span
                                          key={stage}
                                          className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs"
                                        >
                                          <span className="font-medium text-gray-700">{stage}:</span>{' '}
                                          <span className="text-blue-600">{formatDuration(time)}</span>
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Surveys Tab */}
        {activeTab === 'surveys' && (
          <div className="space-y-6">
            {/* Mid-Pilot Surveys (After Lesson 3) */}
            <div className="bg-white rounded-xl border border-purple-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-purple-200 bg-purple-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MessageSquare size={20} className="text-purple-600" />
                  Mid-Pilot Surveys (After Lesson 3)
                  <span className="ml-2 px-2 py-0.5 bg-purple-200 text-purple-700 text-sm rounded-full">
                    {midPilotSurveys.length}
                  </span>
                </h2>
              </div>

              {midPilotSurveys.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No mid-pilot surveys submitted yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {midPilotSurveys.map((survey) => (
                    <div key={survey.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="font-mono font-bold text-purple-600">{survey.sessionCode || survey.id}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {survey.studentCount} students
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDate(survey.savedAt || survey.submittedAt)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* Favorite Feature */}
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-purple-700 mb-1">
                            Favorite Feature
                          </p>
                          <p className="text-gray-800">{survey.favoriteFeature || '—'}</p>
                        </div>

                        {/* Improvement Suggestion */}
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-orange-700 mb-1">
                            Improvement Suggestion
                          </p>
                          <p className="text-gray-800">{survey.improvementSuggestion || '—'}</p>
                        </div>

                        {/* Skipped Parts */}
                        {survey.skippedParts && (
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-yellow-700 mb-1">
                              Skipped/Modified Parts
                            </p>
                            <p className="text-gray-800">{survey.skippedParts}</p>
                          </div>
                        )}

                        {/* Student Quotes */}
                        {survey.studentQuotes && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 mb-1">
                              Student Quotes
                            </p>
                            <p className="text-gray-800 italic">"{survey.studentQuotes}"</p>
                          </div>
                        )}

                        {/* On Track */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Will finish all 5 lessons?</span>
                          <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                            survey.onTrack === 'yes' ? 'bg-green-100 text-green-700' :
                            survey.onTrack === 'probably' ? 'bg-blue-100 text-blue-700' :
                            survey.onTrack === 'not-sure' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {survey.onTrack === 'yes' ? 'Yes' :
                             survey.onTrack === 'probably' ? 'Probably' :
                             survey.onTrack === 'not-sure' ? 'Not Sure' :
                             survey.onTrack === 'no' ? 'No' : survey.onTrack || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Pilot Surveys (After Lesson 5) */}
            <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-green-200 bg-green-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Star size={20} className="text-green-600" />
                  Final Pilot Surveys (After Lesson 5)
                  <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-700 text-sm rounded-full">
                    {finalPilotSurveys.length}
                  </span>
                </h2>
              </div>

              {finalPilotSurveys.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No final surveys submitted yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {finalPilotSurveys.map((survey) => (
                    <div key={survey.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="font-mono font-bold text-green-600">{survey.sessionCode || survey.id}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {survey.studentCount} students
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDate(survey.savedAt || survey.submittedAt)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {/* PMF Score */}
                        {survey.pmfScore && (
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-700 mb-1">
                              Product-Market Fit Score
                            </p>
                            <p className="text-gray-800 font-semibold">{survey.pmfScore}</p>
                          </div>
                        )}

                        {/* Would Recommend */}
                        {survey.wouldRecommend !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Would recommend?</span>
                            <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${
                              survey.wouldRecommend ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {survey.wouldRecommend ? 'Yes' : 'No'}
                            </span>
                          </div>
                        )}

                        {/* Feedback */}
                        {survey.feedback && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-700 mb-1">
                              Feedback
                            </p>
                            <p className="text-gray-800">{survey.feedback}</p>
                          </div>
                        )}

                        {/* All other fields */}
                        {Object.entries(survey).filter(([key]) =>
                          !['id', 'sessionCode', 'studentCount', 'savedAt', 'submittedAt', 'surveyType',
                            'pmfScore', 'wouldRecommend', 'feedback'].includes(key)
                        ).map(([key, value]) => (
                          value && typeof value === 'string' && value.trim() && (
                            <div key={key} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs font-medium text-gray-600 mb-1 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-gray-800">{value}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Feedback Surveys */}
            <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-200 bg-blue-50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-600" />
                  Quick Session Feedback
                  <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-700 text-sm rounded-full">
                    {quickSurveys.length}
                  </span>
                </h2>
              </div>

              {quickSurveys.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No quick feedback submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {quickSurveys.map((survey) => (
                        <tr key={survey.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-blue-600">{survey.sessionCode || survey.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            {survey.rating && (
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={16}
                                    className={star <= survey.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                            {survey.feedback || survey.comment || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {formatDate(survey.savedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
};

export default PilotAdminPage;
