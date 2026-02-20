// Admin page for managing pilot program teachers
// src/pages/PilotAdminPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { getDatabase, ref, get, set, remove, onValue, update } from 'firebase/database';
import { Users, UserPlus, Trash2, Mail, Calendar, Shield, ArrowLeft, RefreshCw, BarChart3, Clock, BookOpen, Play, Building2, GraduationCap, ChevronDown, ChevronUp, MessageSquare, Star, Download, DatabaseBackup, AlertTriangle, Search, Filter, ArrowUpDown, Check, X, FileText } from 'lucide-react';
import ErrorLogViewer from '../components/admin/ErrorLogViewer';
import { getTeacherAnalytics, getPilotSessions, getPilotSummaryStats, subscribeToAnalytics } from '../firebase/analytics';
import { SITE_TYPES } from '../firebase/approvedEmails';
import * as XLSX from 'xlsx';

// Your admin email(s) - only these can access this page
const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];

// Emails to exclude from teacher analytics (test accounts, duplicates, never registered)
const EXCLUDED_ANALYTICS_EMAILS = [
  'abross0930@gmail.com',      // Reached L1, but never registered
  'tshepard@ccsfw.org',        // Reached L1, never registered
  'rencro123@gmail.com',       // Test Only, never registered
  'lchiesa@fmschools.org',     // Test Only, never registered
  'd.vasileska@gmail.com',     // Test Only, never registered
  'afisher@theoaksacademy.org', // Test Only, never registered
  'brandonvalerino@gmail.com', // Test Only, never registered (duplicate of bvalerino)
];

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

  // Teacher type for new additions
  const [newTeacherType, setNewTeacherType] = useState('pilot');

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

  // Teacher Analytics Pipeline state
  const [analyticsSort, setAnalyticsSort] = useState({ column: 'lastActive', direction: 'desc' });
  const [analyticsFilter, setAnalyticsFilter] = useState('all');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [expandedTeachers, setExpandedTeachers] = useState({});
  const [teacherOutreach, setTeacherOutreach] = useState({});

  // Approved emails sort state
  const [approvedEmailsSort, setApprovedEmailsSort] = useState({ column: 'email', direction: 'asc' });
  const [selectedEmails, setSelectedEmails] = useState({});
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Registered users selection state
  const [selectedUsers, setSelectedUsers] = useState({});
  const [bulkDeletingUsers, setBulkDeletingUsers] = useState(false);

  // Backfill state
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);

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
        emails.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
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
        emails.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
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
      // Filter out excluded emails from analytics
      const filteredTeachers = teachers.filter(t =>
        !EXCLUDED_ANALYTICS_EMAILS.includes(t.email?.toLowerCase())
      );
      setTeacherAnalytics(filteredTeachers);
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

    // Listen to teacher outreach data
    const outreachRef = ref(database, 'teacherOutreach');
    const unsubOutreach = onValue(outreachRef, (snapshot) => {
      if (snapshot.exists()) {
        setTeacherOutreach(snapshot.val());
      } else {
        setTeacherOutreach({});
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
      unsubOutreach();
    };
  }, [user, isAdmin, database]);

  // Toggle outreach checkbox or set value (emailed L3, emailed Done, teacherType, etc.)
  const toggleOutreach = async (teacherEmail, field, explicitValue = null) => {
    const emailKey = teacherEmail.toLowerCase().replace(/\./g, ',');
    const outreachRef = ref(database, `teacherOutreach/${emailKey}`);

    try {
      let updates = { email: teacherEmail };

      if (explicitValue !== null) {
        // Set explicit value (e.g., teacherType dropdown)
        updates[field] = explicitValue;
      } else {
        // Toggle boolean value
        const currentValue = teacherOutreach[emailKey]?.[field] || false;
        updates[field] = !currentValue;
        updates[`${field}At`] = !currentValue ? Date.now() : null;
      }

      await update(outreachRef, updates);
    } catch (err) {
      console.error('Failed to update outreach:', err);
      setError('Failed to update outreach status');
    }
  };

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

      // Also set teacher type in outreach tracking
      const outreachRef = ref(database, `teacherOutreach/${emailKey}`);
      await update(outreachRef, {
        email: newEmail.toLowerCase().trim(),
        teacherType: newTeacherType,
        addedAt: Date.now()
      });

      const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
      const typeLabel = newTeacherType === 'purchased' ? 'Purchased' : 'Pilot';
      setSuccess(`Added ${newEmail} to ${siteName} as ${typeLabel}`);
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
      // Parse lines — supports:
      //   email\tschool name   (tab-separated, each line gets its own note)
      //   email   school name  (multiple spaces as separator)
      //   email                (plain email, uses shared batchNotes)
      const entries = [];
      const lines = batchEmails.split(/\n/).filter(l => l.trim());

      for (const line of lines) {
        // Try tab-separated first, then 2+ spaces
        let parts = line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/);
        const lineEmails = [];
        let note = '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          // Check if this part contains an email
          const emailMatch = trimmed.match(/[^\s,;]+@[^\s,;]+/g);
          if (emailMatch) {
            lineEmails.push(...emailMatch.map(e => e.toLowerCase().trim()));
          } else {
            // Non-email text is the school/note
            note = trimmed;
          }
        }

        for (const email of lineEmails) {
          entries.push({ email, note: note || batchNotes.trim() });
        }
      }

      if (entries.length === 0) {
        setError('No valid emails found. Make sure each email contains @');
        setBatchAdding(false);
        return;
      }

      // Remove duplicates (keep first occurrence)
      const seen = new Set();
      const uniqueEntries = entries.filter(e => {
        if (seen.has(e.email)) return false;
        seen.add(e.email);
        return true;
      });

      let added = 0;
      let skipped = 0;

      for (const { email, note } of uniqueEntries) {
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
          notes: note,
          approvedBy: user.email,
          siteType: selectedSite
        });

        // Also set teacher type in outreach tracking
        const outreachRef = ref(database, `teacherOutreach/${emailKey}`);
        await update(outreachRef, {
          email: email,
          teacherType: newTeacherType,
          school: note,
          addedAt: Date.now()
        });

        added++;
      }

      const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
      const typeLabel = newTeacherType === 'purchased' ? 'Purchased' : 'Pilot';
      setSuccess(`Added ${added} ${typeLabel} email${added !== 1 ? 's' : ''} to ${siteName}${skipped > 0 ? ` (${skipped} already existed)` : ''}`);
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

  // Bulk delete selected emails
  const handleBulkDelete = async () => {
    const selectedIds = Object.entries(selectedEmails).filter(([_, selected]) => selected).map(([id]) => id);
    if (selectedIds.length === 0) return;

    const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
    if (!confirm(`Delete ${selectedIds.length} email(s) from ${siteName}?`)) return;

    setBulkDeleting(true);
    try {
      for (const emailKey of selectedIds) {
        const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);
        await remove(emailRef);
      }
      setSuccess(`Removed ${selectedIds.length} email(s) from ${siteName}`);
      setSelectedEmails({});
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  // Toggle select all emails
  const toggleSelectAll = () => {
    const allSelected = approvedEmails.every(item => selectedEmails[item.id]);
    if (allSelected) {
      setSelectedEmails({});
    } else {
      const newSelected = {};
      approvedEmails.forEach(item => { newSelected[item.id] = true; });
      setSelectedEmails(newSelected);
    }
  };

  // Bulk delete selected users
  const handleBulkDeleteUsers = async () => {
    const selectedIds = Object.entries(selectedUsers).filter(([_, selected]) => selected).map(([id]) => id);
    if (selectedIds.length === 0) return;

    if (!confirm(`Delete ${selectedIds.length} user account(s)? They will no longer be able to log in.`)) return;

    setBulkDeletingUsers(true);
    try {
      for (const oderId of selectedIds) {
        const userRef = ref(database, `users/${oderId}`);
        await remove(userRef);
      }
      setSuccess(`Removed ${selectedIds.length} user account(s)`);
      setSelectedUsers({});
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkDeletingUsers(false);
    }
  };

  // Toggle select all users
  const toggleSelectAllUsers = () => {
    const allSelected = registeredUsers.every(user => selectedUsers[user.id]);
    if (allSelected) {
      setSelectedUsers({});
    } else {
      const newSelected = {};
      registeredUsers.forEach(user => { newSelected[user.id] = true; });
      setSelectedUsers(newSelected);
    }
  };

  // Get users not in approved emails (for easy selection)
  const getUsersNotApproved = () => {
    const approvedEmailSet = new Set(approvedEmails.map(e => e.email?.toLowerCase()));
    return registeredUsers.filter(user => !approvedEmailSet.has(user.email?.toLowerCase()));
  };

  // Select only users not in approved emails
  const selectUnapprovedUsers = () => {
    const unapproved = getUsersNotApproved();
    const newSelected = {};
    unapproved.forEach(user => { newSelected[user.id] = true; });
    setSelectedUsers(newSelected);
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

  // Export all data to Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Helper to format date for Excel
    const excelDate = (timestamp) => {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    };

    // Helper to format duration in minutes
    const durationMins = (ms) => {
      if (!ms) return 0;
      return Math.round(ms / 60000);
    };

    // Compute active teaching time from stage times (sum of all stage durations)
    const getActiveTimeMins = (stageTimes) => {
      if (!stageTimes || typeof stageTimes !== 'object') return 0;
      return Math.round(Object.values(stageTimes).reduce((sum, time) => sum + (time || 0), 0) / 60000);
    };

    // Determine if a session was a real class (not just a test)
    const isRealClass = (session) => {
      const activeMin = getActiveTimeMins(session.stageTimes);
      const stageCount = session.stageTimes ? Object.keys(session.stageTimes).length : 0;
      // Real class: at least 10 min active time AND moved through 3+ stages
      return activeMin >= 10 && stageCount >= 3;
    };

    // Compute summary stats from sessions using active time
    const realClassSessions = pilotSessions.filter(s => isRealClass(s));
    const totalActiveMinutes = pilotSessions.reduce((sum, s) => sum + getActiveTimeMins(s.stageTimes), 0);
    const avgActiveTime = realClassSessions.length > 0
      ? Math.round(realClassSessions.reduce((sum, s) => sum + getActiveTimeMins(s.stageTimes), 0) / realClassSessions.length)
      : 0;

    // Sheet 1: Summary Stats
    const summaryData = [
      ['Music Mind Academy Pilot Program Report'],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['Summary Statistics'],
      ['Academy Approved Emails', academyEmails.length],
      ['Edu Approved Emails', eduEmails.length],
      ['Registered Users', registeredUsers.length],
      ['Total Sessions', pilotSessions.length],
      ['Real Classes (10+ min, 3+ stages)', realClassSessions.length],
      ['Avg Active Teaching Time (min)', avgActiveTime],
      ['Most Popular Lesson', summaryStats?.mostPopularLesson || 'N/A'],
      ['Return Rate (%)', summaryStats?.retentionRate || 0],
      [''],
      ['⚠️ DATA NOTES'],
      ['"Active Time" = sum of tracked stage durations (reliable). "Wall Clock" = session start to end (unreliable — teachers often forget to end).'],
      ['"Real Class" = session with 10+ min active time AND 3+ stages visited (filters out quick tests).'],
      ['Student counts before Jan 10, 2025 are inflated due to a duplicate-on-refresh bug. Fixed Jan 10, 2025.'],
      ['Student count race condition fixed Feb 9, 2025 (atomic increments). Older sessions may show 0 incorrectly.'],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Teacher Progress (L1-L5 grid)
    const teacherLessonData = {};
    pilotSessions.forEach(session => {
      const email = session.teacherEmail;
      if (!email) return;
      let lessonNum = null;
      if (session.lessonRoute?.includes('lesson1')) lessonNum = 1;
      else if (session.lessonRoute?.includes('lesson2')) lessonNum = 2;
      else if (session.lessonRoute?.includes('lesson3')) lessonNum = 3;
      else if (session.lessonRoute?.includes('lesson4')) lessonNum = 4;
      else if (session.lessonRoute?.includes('lesson5')) lessonNum = 5;
      if (!lessonNum) return;

      if (!teacherLessonData[email]) {
        teacherLessonData[email] = { email, lessons: { 1: [], 2: [], 3: [], 4: [], 5: [] } };
      }
      teacherLessonData[email].lessons[lessonNum].push({
        students: session.studentsJoined || 0,
        activeTime: getActiveTimeMins(session.stageTimes),
        realClass: isRealClass(session),
        date: session.startTime
      });
    });

    const teacherRows = [['Teacher Email', 'L1 Real Classes', 'L1 Students', 'L1 Active Time (min)', 'L1 Taught',
      'L2 Real Classes', 'L2 Students', 'L2 Active Time (min)', 'L2 Taught',
      'L3 Real Classes', 'L3 Students', 'L3 Active Time (min)', 'L3 Taught',
      'L4 Real Classes', 'L4 Students', 'L4 Active Time (min)', 'L4 Taught',
      'L5 Real Classes', 'L5 Students', 'L5 Active Time (min)', 'L5 Taught',
      'Total Real Classes', 'Total Students', 'Total Active Time (min)']];

    Object.values(teacherLessonData).forEach(teacher => {
      const row = [teacher.email];
      let totalRealClasses = 0, totalStudents = 0, totalActiveTime = 0;

      [1, 2, 3, 4, 5].forEach(lessonNum => {
        const sessions = teacher.lessons[lessonNum];
        const realClasses = sessions.filter(s => s.realClass).length;
        const students = sessions.reduce((sum, s) => sum + s.students, 0);
        const activeTime = sessions.reduce((sum, s) => sum + s.activeTime, 0);
        const taught = realClasses > 0;

        row.push(realClasses, students, activeTime, taught ? 'Yes' : 'No');
        totalRealClasses += realClasses;
        totalStudents += students;
        totalActiveTime += activeTime;
      });

      row.push(totalRealClasses, totalStudents, totalActiveTime);
      teacherRows.push(row);
    });

    const teacherSheet = XLSX.utils.aoa_to_sheet(teacherRows);
    XLSX.utils.book_append_sheet(workbook, teacherSheet, 'Teacher Progress');

    // Sheet 3: All Sessions
    const sessionRows = [['Session Code', 'Teacher Email', 'Lesson', 'Start Time', 'Active Time (min)',
      'Wall Clock (min)', 'Students Joined', 'Real Class', 'Completed', 'Last Stage', 'Stage Times']];

    pilotSessions.forEach(session => {
      const stageTimes = session.stageTimes
        ? Object.entries(session.stageTimes).map(([stage, time]) => `${stage}: ${durationMins(time)}m`).join('; ')
        : '';

      sessionRows.push([
        session.sessionCode,
        session.teacherEmail || '',
        getLessonName(session.lessonId, session.lessonRoute),
        excelDate(session.startTime),
        getActiveTimeMins(session.stageTimes),
        durationMins(session.duration),
        session.studentsJoined || 0,
        isRealClass(session) ? 'Yes' : 'No',
        session.completed ? 'Yes' : 'No',
        session.lastStage || '',
        stageTimes
      ]);
    });

    const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionRows);
    XLSX.utils.book_append_sheet(workbook, sessionsSheet, 'Sessions');

    // Sheet 4: Mid-Pilot Surveys
    const midPilotRows = [['Session Code', 'Student Count', 'Date', 'Favorite Feature',
      'Improvement Suggestion', 'Skipped Parts', 'Student Quotes', 'On Track to Finish']];

    midPilotSurveys.forEach(survey => {
      midPilotRows.push([
        survey.sessionCode || survey.id,
        survey.studentCount || '',
        excelDate(survey.savedAt || survey.submittedAt),
        survey.favoriteFeature || '',
        survey.improvementSuggestion || '',
        survey.skippedParts || '',
        survey.studentQuotes || '',
        survey.onTrack || ''
      ]);
    });

    const midPilotSheet = XLSX.utils.aoa_to_sheet(midPilotRows);
    XLSX.utils.book_append_sheet(workbook, midPilotSheet, 'Mid-Pilot Surveys');

    // Sheet 5: Final Surveys
    const finalRows = [['Session Code', 'Student Count', 'Date', 'PMF Score',
      'Would Recommend', 'Feedback', 'Other Comments']];

    finalPilotSurveys.forEach(survey => {
      const otherFields = Object.entries(survey)
        .filter(([key]) => !['id', 'sessionCode', 'studentCount', 'savedAt', 'submittedAt',
          'surveyType', 'pmfScore', 'wouldRecommend', 'feedback'].includes(key))
        .filter(([_, value]) => value && typeof value === 'string')
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

      finalRows.push([
        survey.sessionCode || survey.id,
        survey.studentCount || '',
        excelDate(survey.savedAt || survey.submittedAt),
        survey.pmfScore || '',
        survey.wouldRecommend ? 'Yes' : 'No',
        survey.feedback || '',
        otherFields
      ]);
    });

    const finalSheet = XLSX.utils.aoa_to_sheet(finalRows);
    XLSX.utils.book_append_sheet(workbook, finalSheet, 'Final Surveys');

    // Sheet 6: Quick Feedback
    const quickRows = [['Session Code', 'Date', 'Rating', 'Feedback']];

    quickSurveys.forEach(survey => {
      quickRows.push([
        survey.sessionCode || survey.id,
        excelDate(survey.savedAt),
        survey.rating || '',
        survey.feedback || survey.comment || ''
      ]);
    });

    const quickSheet = XLSX.utils.aoa_to_sheet(quickRows);
    XLSX.utils.book_append_sheet(workbook, quickSheet, 'Quick Feedback');

    // Sheet 7: Academy Approved Emails
    const academyRows = [['Email', 'Approved Date', 'Notes', 'Approved By', 'Signed Up']];
    academyEmails.forEach(item => {
      const signedUp = registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase());
      academyRows.push([
        item.email,
        excelDate(item.approvedAt),
        item.notes || '',
        item.approvedBy || '',
        signedUp ? 'Yes' : 'No'
      ]);
    });
    const academySheet = XLSX.utils.aoa_to_sheet(academyRows);
    XLSX.utils.book_append_sheet(workbook, academySheet, 'Academy Emails');

    // Sheet 8: Edu Approved Emails
    const eduRows = [['Email', 'Approved Date', 'Notes', 'Approved By', 'Signed Up']];
    eduEmails.forEach(item => {
      const signedUp = registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase());
      eduRows.push([
        item.email,
        excelDate(item.approvedAt),
        item.notes || '',
        item.approvedBy || '',
        signedUp ? 'Yes' : 'No'
      ]);
    });
    const eduSheet = XLSX.utils.aoa_to_sheet(eduRows);
    XLSX.utils.book_append_sheet(workbook, eduSheet, 'Edu Emails');

    // Sheet 9: Registered Users
    const userRows = [['Display Name', 'Email', 'Created Date', 'Last Login', 'Is Pilot']];
    registeredUsers.forEach(u => {
      userRows.push([
        u.displayName || '',
        u.email || '',
        excelDate(u.createdAt),
        excelDate(u.lastLoginAt),
        u.isPilot ? 'Yes' : 'No'
      ]);
    });
    const userSheet = XLSX.utils.aoa_to_sheet(userRows);
    XLSX.utils.book_append_sheet(workbook, userSheet, 'Registered Users');

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `PilotProgram_Export_${dateStr}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  // Backfill student counts from sessions/ to pilotSessions/
  const backfillStudentCounts = async () => {
    if (!confirm('This will look up actual student counts from live session data and update analytics. Continue?')) {
      return;
    }

    setIsBackfilling(true);
    setBackfillResult(null);

    try {
      // Get all pilotSessions
      const pilotSessionsRef = ref(database, 'pilotSessions');
      const pilotSnapshot = await get(pilotSessionsRef);

      if (!pilotSnapshot.exists()) {
        setBackfillResult({ success: false, message: 'No pilot sessions found' });
        setIsBackfilling(false);
        return;
      }

      let updated = 0;
      let notFound = 0;
      let alreadyCorrect = 0;
      let errors = 0;
      const details = [];

      const pilotData = pilotSnapshot.val();
      const sessionCodes = Object.keys(pilotData);

      for (const sessionCode of sessionCodes) {
        const pilotSession = pilotData[sessionCode];
        const currentCount = pilotSession.studentsJoined || 0;

        try {
          // Look up the actual session data
          const liveSessionRef = ref(database, `sessions/${sessionCode}`);
          const liveSnapshot = await get(liveSessionRef);

          if (!liveSnapshot.exists()) {
            notFound++;
            details.push({ code: sessionCode, status: 'not_found', oldCount: currentCount });
            continue;
          }

          const liveSession = liveSnapshot.val();
          const actualCount = liveSession.studentsJoined
            ? Object.keys(liveSession.studentsJoined).length
            : 0;

          if (actualCount === currentCount) {
            alreadyCorrect++;
            continue;
          }

          // Update pilotSessions with the correct count
          const updateRef = ref(database, `pilotSessions/${sessionCode}`);
          await update(updateRef, { studentsJoined: actualCount });

          updated++;
          details.push({
            code: sessionCode,
            status: 'updated',
            oldCount: currentCount,
            newCount: actualCount,
            teacher: pilotSession.teacherEmail
          });

        } catch (err) {
          errors++;
          details.push({ code: sessionCode, status: 'error', error: err.message });
        }
      }

      setBackfillResult({
        success: true,
        message: `Backfill complete: ${updated} updated, ${alreadyCorrect} already correct, ${notFound} live sessions not found, ${errors} errors`,
        updated,
        alreadyCorrect,
        notFound,
        errors,
        details: details.filter(d => d.status === 'updated') // Only show updated ones
      });

      console.log('Backfill details:', details);

    } catch (err) {
      setBackfillResult({ success: false, message: `Error: ${err.message}` });
    } finally {
      setIsBackfilling(false);
    }
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

          <div className="flex items-center gap-4">
            <button
              onClick={backfillStudentCounts}
              disabled={isBackfilling}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors"
              title="Recover student counts from live session data"
            >
              {isBackfilling ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <DatabaseBackup size={18} />
              )}
              {isBackfilling ? 'Backfilling...' : 'Recover Student Data'}
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Export to Excel
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield size={16} className="text-green-500" />
              Admin: {user.email}
            </div>
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

        {/* Backfill Results */}
        {backfillResult && (
          <div className={`mb-4 p-4 rounded-lg border ${
            backfillResult.success ? 'bg-orange-50 border-orange-300' : 'bg-red-100 border-red-400'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${backfillResult.success ? 'text-orange-800' : 'text-red-700'}`}>
                {backfillResult.message}
              </span>
              <button
                onClick={() => setBackfillResult(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            {backfillResult.details && backfillResult.details.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto">
                <p className="text-sm font-medium text-orange-700 mb-2">Updated sessions:</p>
                <div className="space-y-1">
                  {backfillResult.details.map((d, i) => (
                    <div key={i} className="text-sm text-gray-700 bg-white p-2 rounded">
                      <span className="font-mono font-bold text-blue-600">{d.code}</span>
                      <span className="mx-2">•</span>
                      <span>{d.teacher?.split('@')[0]}</span>
                      <span className="mx-2">•</span>
                      <span className="text-red-500">{d.oldCount}</span>
                      <span className="mx-1">→</span>
                      <span className="text-green-600 font-bold">{d.newCount}</span>
                      <span className="text-gray-500 ml-1">students</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <form onSubmit={handleAddEmail} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="School name, grade level"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select
                  value={newTeacherType}
                  onChange={(e) => setNewTeacherType(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium ${
                    newTeacherType === 'purchased' ? 'text-green-700' : 'text-blue-700'
                  }`}
                >
                  <option value="pilot">Pilot</option>
                  <option value="purchased">Purchased</option>
                </select>
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
                  Paste emails — one per line, optionally with school name (tab or double-space separated)
                </label>
                <textarea
                  value={batchEmails}
                  onChange={(e) => setBatchEmails(e.target.value)}
                  placeholder={"teacher1@school.edu\tLincoln Middle School\nteacher2@school.edu\tWashington Academy\nteacher3@school.edu"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white h-32 font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {batchEmails.split(/\n/).filter(l => l.trim()).filter(l => l.match(/[^\s,;]+@[^\s,;]+/)).length} email(s) detected
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes for all (optional)</label>
                  <input
                    type="text"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    placeholder="e.g., Winter 2025 cohort"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={newTeacherType}
                    onChange={(e) => setNewTeacherType(e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium ${
                      newTeacherType === 'purchased' ? 'text-green-700' : 'text-blue-700'
                    }`}
                  >
                    <option value="pilot">Pilot</option>
                    <option value="purchased">Purchased</option>
                  </select>
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
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'errors'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle size={18} />
            Error Logs
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
                {/* Sort controls and bulk actions */}
                <div className="px-6 py-2 bg-gray-50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleSelectAll}
                      className="px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
                    >
                      <input
                        type="checkbox"
                        checked={approvedEmails.length > 0 && approvedEmails.every(item => selectedEmails[item.id])}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                      <span>Select All</span>
                    </button>
                    {Object.values(selectedEmails).filter(Boolean).length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={bulkDeleting}
                        className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete {Object.values(selectedEmails).filter(Boolean).length} Selected
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-gray-500 text-sm">Sort by:</label>
                    <select
                      value={`${approvedEmailsSort.column}-${approvedEmailsSort.direction}`}
                      onChange={(e) => {
                        const [column, direction] = e.target.value.split('-');
                        setApprovedEmailsSort({ column, direction });
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="email-asc">Email (A-Z)</option>
                      <option value="email-desc">Email (Z-A)</option>
                      <option value="date-desc">Date (Newest)</option>
                      <option value="date-asc">Date (Oldest)</option>
                      <option value="status-desc">Status (Signed Up first)</option>
                      <option value="status-asc">Status (Pending first)</option>
                      <option value="type-desc">Type (Paid first)</option>
                      <option value="type-asc">Type (Pilot first)</option>
                    </select>
                  </div>
                </div>
                {[...approvedEmails].sort((a, b) => {
                  let comparison = 0;
                  const aEmailKey = a.email?.toLowerCase().replace(/\./g, ',');
                  const bEmailKey = b.email?.toLowerCase().replace(/\./g, ',');
                  const aType = teacherOutreach[aEmailKey]?.teacherType || 'pilot';
                  const bType = teacherOutreach[bEmailKey]?.teacherType || 'pilot';

                  if (approvedEmailsSort.column === 'email') {
                    comparison = (a.email || '').localeCompare(b.email || '');
                  } else if (approvedEmailsSort.column === 'date') {
                    comparison = (b.approvedAt || 0) - (a.approvedAt || 0);
                  } else if (approvedEmailsSort.column === 'status') {
                    const aSignedUp = registeredUsers.some(u => u.email?.toLowerCase() === a.email?.toLowerCase()) ? 1 : 0;
                    const bSignedUp = registeredUsers.some(u => u.email?.toLowerCase() === b.email?.toLowerCase()) ? 1 : 0;
                    comparison = bSignedUp - aSignedUp;
                  } else if (approvedEmailsSort.column === 'type') {
                    // purchased = 1, pilot = 0
                    comparison = (bType === 'purchased' ? 1 : 0) - (aType === 'purchased' ? 1 : 0);
                  }
                  return approvedEmailsSort.direction === 'asc' ? comparison : -comparison;
                }).map((item) => {
                  const emailKey = item.email?.toLowerCase().replace(/\./g, ',');
                  const teacherType = teacherOutreach[emailKey]?.teacherType || 'pilot';
                  return (
                  <div key={item.id} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 ${selectedEmails[item.id] ? 'bg-red-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selectedEmails[item.id]}
                        onChange={(e) => setSelectedEmails(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        className="rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{item.email}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(item.approvedAt)}
                          </span>
                          {item.notes && <span>• {item.notes}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {teacherType === 'purchased' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          Pilot
                        </span>
                      )}
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
                );})}
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
                {/* Bulk actions toolbar */}
                <div className="px-6 py-2 bg-gray-50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleSelectAllUsers}
                      className="px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
                    >
                      <input
                        type="checkbox"
                        checked={registeredUsers.length > 0 && registeredUsers.every(user => selectedUsers[user.id])}
                        onChange={toggleSelectAllUsers}
                        className="rounded"
                      />
                      <span>Select All</span>
                    </button>
                    <button
                      onClick={selectUnapprovedUsers}
                      className="px-3 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200"
                    >
                      Select Not Approved ({getUsersNotApproved().length})
                    </button>
                    {Object.values(selectedUsers).filter(Boolean).length > 0 && (
                      <button
                        onClick={handleBulkDeleteUsers}
                        disabled={bulkDeletingUsers}
                        className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete {Object.values(selectedUsers).filter(Boolean).length} Selected
                      </button>
                    )}
                  </div>
                </div>
                {[...registeredUsers].sort((a, b) => {
                  const aEmailKey = a.email?.toLowerCase().replace(/\./g, ',');
                  const bEmailKey = b.email?.toLowerCase().replace(/\./g, ',');
                  const aType = teacherOutreach[aEmailKey]?.teacherType || 'pilot';
                  const bType = teacherOutreach[bEmailKey]?.teacherType || 'pilot';
                  // Sort purchased first, then pilot
                  return (bType === 'purchased' ? 1 : 0) - (aType === 'purchased' ? 1 : 0);
                }).map((user) => {
                  const isApproved = approvedEmails.some(e => e.email?.toLowerCase() === user.email?.toLowerCase());
                  const emailKey = user.email?.toLowerCase().replace(/\./g, ',');
                  const teacherType = teacherOutreach[emailKey]?.teacherType || 'pilot';
                  return (
                    <div key={user.id} className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 ${selectedUsers[user.id] ? 'bg-red-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!selectedUsers[user.id]}
                        onChange={(e) => setSelectedUsers(prev => ({ ...prev, [user.id]: e.target.checked }))}
                        className="rounded"
                      />
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
                      {teacherType === 'purchased' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          Pilot
                        </span>
                      )}
                      {isApproved ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          Approved
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                          Not Approved
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Teacher Analytics - Pipeline View */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {(() => {
              // Constants for "real class" threshold
              const MIN_STUDENTS = 10;
              const MIN_DURATION = 15 * 60 * 1000; // 15 minutes in ms

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
                    lessons: { 1: [], 2: [], 3: [], 4: [], 5: [] },
                    totalStudents: 0,
                    totalSessions: 0,
                    lastActive: 0
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

                // Update totals
                teacherLessonData[email].totalStudents += session.studentsJoined || 0;
                teacherLessonData[email].totalSessions += 1;
                if (session.startTime > teacherLessonData[email].lastActive) {
                  teacherLessonData[email].lastActive = session.startTime;
                }
              });

              // Helper to check if lesson is "completed" (real class)
              // A real class = 10+ students AND 15+ minutes (regardless of whether session was formally ended)
              const isLessonCompleted = (sessions) => {
                return sessions.some(s =>
                  s.students >= MIN_STUDENTS && s.duration >= MIN_DURATION
                );
              };

              // Calculate stage and survey status for each teacher
              const teachers = Object.values(teacherLessonData).map(teacher => {
                const emailKey = teacher.email.toLowerCase().replace(/\./g, ',');
                const outreach = teacherOutreach[emailKey] || {};

                // Check which lessons are completed
                const l1Done = isLessonCompleted(teacher.lessons[1]);
                const l2Done = isLessonCompleted(teacher.lessons[2]);
                const l3Done = isLessonCompleted(teacher.lessons[3]);
                const l4Done = isLessonCompleted(teacher.lessons[4]);
                const l5Done = isLessonCompleted(teacher.lessons[5]);

                // Determine stage
                let stage = 'Signed Up';
                if (l5Done) stage = 'Completed';
                else if (l4Done) stage = 'Reached L4';
                else if (l3Done) stage = 'Reached L3';
                else if (l2Done) stage = 'Reached L2';
                else if (l1Done) stage = 'Reached L1';
                else if (teacher.totalSessions > 0) stage = 'Test Only';

                // Check survey status
                const hasL3Survey = midPilotSurveys.some(s =>
                  s.teacherEmail?.toLowerCase() === teacher.email.toLowerCase() ||
                  pilotSessions.some(ps =>
                    ps.sessionCode === s.sessionCode &&
                    ps.teacherEmail?.toLowerCase() === teacher.email.toLowerCase()
                  )
                );
                const hasFinalSurvey = finalPilotSurveys.some(s =>
                  s.teacherEmail?.toLowerCase() === teacher.email.toLowerCase() ||
                  pilotSessions.some(ps =>
                    ps.sessionCode === s.sessionCode &&
                    ps.teacherEmail?.toLowerCase() === teacher.email.toLowerCase()
                  )
                );

                return {
                  ...teacher,
                  stage,
                  l1Done, l2Done, l3Done, l4Done, l5Done,
                  hasL3Survey,
                  hasFinalSurvey,
                  manualL3Survey: outreach.manualL3Survey || false,
                  manualFinalSurvey: outreach.manualFinalSurvey || false,
                  emailedL3: outreach.emailedL3 || false,
                  emailedL3At: outreach.emailedL3At,
                  emailedDone: outreach.emailedDone || false,
                  emailedDoneAt: outreach.emailedDoneAt,
                  teacherType: outreach.teacherType || 'pilot', // 'pilot' or 'purchased'
                  pilotUnit: outreach.pilotUnit || '1' // Unit 1-6
                };
              });

              // Apply search filter
              let filteredTeachers = teachers.filter(t =>
                t.email.toLowerCase().includes(analyticsSearch.toLowerCase())
              );

              // Apply dropdown filter
              if (analyticsFilter === 'pilotOnly') {
                filteredTeachers = filteredTeachers.filter(t => t.teacherType === 'pilot');
              } else if (analyticsFilter === 'purchasedOnly') {
                filteredTeachers = filteredTeachers.filter(t => t.teacherType === 'purchased');
              } else if (analyticsFilter === 'notEmailedL3') {
                filteredTeachers = filteredTeachers.filter(t => t.l3Done && !t.emailedL3);
              } else if (analyticsFilter === 'notEmailedDone') {
                filteredTeachers = filteredTeachers.filter(t => t.l5Done && !t.emailedDone);
              } else if (analyticsFilter === 'missingL3Survey') {
                filteredTeachers = filteredTeachers.filter(t => t.l3Done && !t.hasL3Survey && !t.manualL3Survey);
              } else if (analyticsFilter === 'missingFinalSurvey') {
                filteredTeachers = filteredTeachers.filter(t => t.l5Done && !t.hasFinalSurvey && !t.manualFinalSurvey);
              }

              // Apply sorting
              const stageOrder = { 'Completed': 6, 'Reached L4': 5, 'Reached L3': 4, 'Reached L2': 3, 'Reached L1': 2, 'Test Only': 1, 'Signed Up': 0 };
              const typeOrder = { 'purchased': 1, 'pilot': 0 };

              // Helper to get lesson completion score (for sorting)
              const getLessonScore = (teacher, lessonNum) => {
                const done = teacher[`l${lessonNum}Done`];
                const sessions = teacher.lessons[lessonNum];
                if (done) return 2; // Completed
                if (sessions && sessions.length > 0) return 1; // Test only
                return 0; // Not started
              };

              filteredTeachers.sort((a, b) => {
                let comparison = 0;
                switch (analyticsSort.column) {
                  case 'teacher':
                    comparison = a.email.localeCompare(b.email);
                    break;
                  case 'type':
                    comparison = (typeOrder[b.teacherType] || 0) - (typeOrder[a.teacherType] || 0);
                    break;
                  case 'unit':
                    comparison = (parseInt(a.pilotUnit) || 1) - (parseInt(b.pilotUnit) || 1);
                    break;
                  case 'stage':
                    comparison = (stageOrder[b.stage] || 0) - (stageOrder[a.stage] || 0);
                    break;
                  case 'l1':
                    comparison = getLessonScore(b, 1) - getLessonScore(a, 1);
                    break;
                  case 'l2':
                    comparison = getLessonScore(b, 2) - getLessonScore(a, 2);
                    break;
                  case 'l3':
                    comparison = getLessonScore(b, 3) - getLessonScore(a, 3);
                    break;
                  case 'l4':
                    comparison = getLessonScore(b, 4) - getLessonScore(a, 4);
                    break;
                  case 'l5':
                    comparison = getLessonScore(b, 5) - getLessonScore(a, 5);
                    break;
                  case 'students':
                    comparison = b.totalStudents - a.totalStudents;
                    break;
                  case 'l3Survey':
                    const aL3Survey = (a.hasL3Survey || a.manualL3Survey) ? 1 : 0;
                    const bL3Survey = (b.hasL3Survey || b.manualL3Survey) ? 1 : 0;
                    comparison = bL3Survey - aL3Survey;
                    break;
                  case 'emailedL3':
                    comparison = (b.emailedL3 ? 1 : 0) - (a.emailedL3 ? 1 : 0);
                    break;
                  case 'finalSurvey':
                    const aFinalSurvey = (a.hasFinalSurvey || a.manualFinalSurvey) ? 1 : 0;
                    const bFinalSurvey = (b.hasFinalSurvey || b.manualFinalSurvey) ? 1 : 0;
                    comparison = bFinalSurvey - aFinalSurvey;
                    break;
                  case 'emailedDone':
                    comparison = (b.emailedDone ? 1 : 0) - (a.emailedDone ? 1 : 0);
                    break;
                  case 'sessions':
                    comparison = b.totalSessions - a.totalSessions;
                    break;
                  case 'lastActive':
                  default:
                    comparison = b.lastActive - a.lastActive;
                    break;
                }
                return analyticsSort.direction === 'asc' ? -comparison : comparison;
              });

              // Sortable header component
              const SortHeader = ({ column, children, className = '', center = false, bgColor = '' }) => (
                <th
                  className={`px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap ${center ? 'text-center' : 'text-left'} ${bgColor} ${className}`}
                  onClick={() => {
                    if (analyticsSort.column === column) {
                      setAnalyticsSort({ column, direction: analyticsSort.direction === 'asc' ? 'desc' : 'asc' });
                    } else {
                      setAnalyticsSort({ column, direction: 'desc' });
                    }
                  }}
                >
                  <div className={`flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
                    {children}
                    {analyticsSort.column === column && (
                      <span className="text-blue-600">{analyticsSort.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              );

              // Lesson cell component
              const LessonCell = ({ sessions, isCompleted }) => {
                if (sessions.length === 0) {
                  return <td className="px-1 py-2 text-center text-gray-300">—</td>;
                }

                const sessionCount = sessions.length;

                return (
                  <td className="px-1 py-2 text-center">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                      isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isCompleted ? '✓' : 'test'}
                      {sessionCount > 1 && <span>×{sessionCount}</span>}
                    </span>
                  </td>
                );
              };

              // Simple toggle square - empty or green check
              const ToggleCell = ({ checked, onChange, disabled }) => {
                const handleClick = (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!disabled) onChange();
                };

                return (
                  <td className="px-1 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    {disabled ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleClick}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                          checked
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-400 bg-white hover:border-green-500 hover:bg-green-50'
                        }`}
                      >
                        {checked && <Check size={16} strokeWidth={3} />}
                      </button>
                    )}
                  </td>
                );
              };

              return (
                <>
                  {/* Header with filters */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <BarChart3 size={20} />
                          Teacher Pilot
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''}
                          {analyticsFilter !== 'all' && ' (filtered)'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search teachers..."
                            value={analyticsSearch}
                            onChange={(e) => setAnalyticsSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                          />
                        </div>

                        {/* Filter dropdown */}
                        <div className="relative">
                          <select
                            value={analyticsFilter}
                            onChange={(e) => setAnalyticsFilter(e.target.value)}
                            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                          >
                            <option value="all">All Teachers</option>
                            <option value="pilotOnly">Pilot Only</option>
                            <option value="purchasedOnly">Purchased Only</option>
                            <option value="notEmailedL3">Not Emailed L3</option>
                            <option value="notEmailedDone">Not Emailed Done</option>
                            <option value="missingL3Survey">Missing L3 Survey</option>
                            <option value="missingFinalSurvey">Missing Final Survey</option>
                          </select>
                          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Mark All as Pilot button */}
                        <button
                          onClick={async () => {
                            if (!confirm(`Mark all ${filteredTeachers.length} teachers as Pilot?`)) return;
                            for (const teacher of filteredTeachers) {
                              await toggleOutreach(teacher.email, 'teacherType', 'pilot');
                            }
                            setSuccess(`Marked ${filteredTeachers.length} teachers as Pilot`);
                          }}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                        >
                          Mark All as Pilot
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  {filteredTeachers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      {teachers.length === 0 ? 'No teacher activity recorded yet.' : 'No teachers match your filter.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="w-6 px-1 py-2 bg-gray-50"></th>
                            <SortHeader column="teacher" bgColor="bg-gray-50">Teacher</SortHeader>
                            <SortHeader column="type" center bgColor="bg-gray-50">Type</SortHeader>
                            <SortHeader column="unit" center bgColor="bg-gray-50">Unit</SortHeader>
                            <SortHeader column="stage" bgColor="bg-gray-50">Stage</SortHeader>
                            <SortHeader column="l1" center bgColor="bg-gray-50">L1<br/><span className="font-normal normal-case">Mood</span></SortHeader>
                            <SortHeader column="l2" center bgColor="bg-gray-50">L2<br/><span className="font-normal normal-case">Inst</span></SortHeader>
                            <SortHeader column="l3" center bgColor="bg-purple-50">L3<br/><span className="font-normal normal-case">Text</span></SortHeader>
                            <SortHeader column="l4" center bgColor="bg-gray-50">L4<br/><span className="font-normal normal-case">Form</span></SortHeader>
                            <SortHeader column="l5" center bgColor="bg-amber-50">L5<br/><span className="font-normal normal-case">Cap</span></SortHeader>
                            <SortHeader column="students" bgColor="bg-gray-50">Students</SortHeader>
                            <SortHeader column="l3Survey" center bgColor="bg-purple-50">L3<br/>Survey</SortHeader>
                            <SortHeader column="emailedL3" center bgColor="bg-purple-50">Emailed<br/>L3</SortHeader>
                            <SortHeader column="finalSurvey" center bgColor="bg-amber-50">Final<br/>Survey</SortHeader>
                            <SortHeader column="emailedDone" center bgColor="bg-amber-50">Emailed<br/>Done</SortHeader>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredTeachers.map((teacher) => {
                            const isExpanded = expandedTeachers[teacher.email];

                            return (
                              <React.Fragment key={teacher.email}>
                                <tr
                                  className="hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setExpandedTeachers(prev => ({
                                    ...prev,
                                    [teacher.email]: !prev[teacher.email]
                                  }))}
                                >
                                  <td className="px-1 py-2 text-center">
                                    <ChevronDown
                                      size={14}
                                      className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <div className="font-medium text-gray-800 text-sm">
                                      {teacher.email.split('@')[0]}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      @{teacher.email.split('@')[1]}
                                    </div>
                                  </td>
                                  <td className="px-1 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <select
                                      value={teacher.teacherType}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleOutreach(teacher.email, 'teacherType', e.target.value);
                                      }}
                                      className={`px-1 py-0.5 rounded text-xs font-medium border-0 cursor-pointer ${
                                        teacher.teacherType === 'purchased'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      <option value="pilot">Pilot</option>
                                      <option value="purchased">Purchased</option>
                                    </select>
                                  </td>
                                  <td className="px-1 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                    <select
                                      value={teacher.pilotUnit || '1'}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleOutreach(teacher.email, 'pilotUnit', e.target.value);
                                      }}
                                      className="px-1 py-0.5 rounded text-xs font-medium border-0 cursor-pointer bg-gray-100 text-gray-800"
                                    >
                                      <option value="1">U1</option>
                                      <option value="2">U2</option>
                                      <option value="3">U3</option>
                                      <option value="4">U4</option>
                                      <option value="5">U5</option>
                                      <option value="6">U6</option>
                                    </select>
                                  </td>
                                  <td className="px-1 py-2">
                                    <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                      teacher.stage === 'Completed' ? 'bg-green-100 text-green-800' :
                                      teacher.stage === 'Reached L3' || teacher.stage === 'Reached L4' ? 'bg-blue-100 text-blue-800' :
                                      teacher.stage === 'Test Only' ? 'bg-gray-100 text-gray-600' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {teacher.stage}
                                    </span>
                                  </td>
                                  <LessonCell sessions={teacher.lessons[1]} isCompleted={teacher.l1Done} />
                                  <LessonCell sessions={teacher.lessons[2]} isCompleted={teacher.l2Done} />
                                  <LessonCell sessions={teacher.lessons[3]} isCompleted={teacher.l3Done} />
                                  <LessonCell sessions={teacher.lessons[4]} isCompleted={teacher.l4Done} />
                                  <LessonCell sessions={teacher.lessons[5]} isCompleted={teacher.l5Done} />
                                  <td className="px-1 py-2 text-center font-medium text-gray-800">
                                    {teacher.totalStudents}
                                  </td>
                                  <ToggleCell
                                    checked={teacher.hasL3Survey || teacher.manualL3Survey}
                                    onChange={() => toggleOutreach(teacher.email, 'manualL3Survey')}
                                    disabled={!teacher.l3Done}
                                  />
                                  <ToggleCell
                                    checked={teacher.emailedL3}
                                    onChange={() => toggleOutreach(teacher.email, 'emailedL3')}
                                    disabled={!teacher.l3Done}
                                  />
                                  <ToggleCell
                                    checked={teacher.hasFinalSurvey || teacher.manualFinalSurvey}
                                    onChange={() => toggleOutreach(teacher.email, 'manualFinalSurvey')}
                                    disabled={!teacher.l5Done}
                                  />
                                  <ToggleCell
                                    checked={teacher.emailedDone}
                                    onChange={() => toggleOutreach(teacher.email, 'emailedDone')}
                                    disabled={!teacher.l5Done}
                                  />
                                </tr>

                                {/* Expanded row */}
                                {isExpanded && (
                                  <tr className="bg-gray-50">
                                    <td colSpan={15} className="px-6 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Summary */}
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                          <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                                          <div className="space-y-1 text-sm text-gray-600">
                                            <div>Total Sessions: <span className="font-medium">{teacher.totalSessions}</span></div>
                                            <div>Total Students: <span className="font-medium">{teacher.totalStudents}</span></div>
                                            <div>Last Active: <span className="font-medium">
                                              {teacher.lastActive ? new Date(teacher.lastActive).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                              }) : 'Never'}
                                            </span></div>
                                          </div>
                                        </div>

                                        {/* Session details per lesson */}
                                        {[1, 2, 3, 4, 5].map(lessonNum => {
                                          const sessions = teacher.lessons[lessonNum];
                                          if (sessions.length === 0) return null;

                                          const lessonNames = { 1: 'Mood', 2: 'Instrumentation', 3: 'Texture', 4: 'Form', 5: 'Capstone' };
                                          const totalStudents = sessions.reduce((sum, s) => sum + s.students, 0);
                                          const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

                                          return (
                                            <div key={lessonNum} className="bg-white rounded-lg p-4 border border-gray-200">
                                              <h4 className="font-medium text-gray-800 mb-2">
                                                L{lessonNum}: {lessonNames[lessonNum]}
                                                <span className="ml-2 text-xs font-normal text-gray-500">
                                                  {sessions.length} session{sessions.length > 1 ? 's' : ''} · {totalStudents} students · {formatDuration(totalTime)}
                                                </span>
                                              </h4>
                                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {sessions
                                                  .sort((a, b) => (b.date || 0) - (a.date || 0))
                                                  .map((session, i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm">
                                                      <span className="text-gray-600">
                                                        {session.date ? new Date(session.date).toLocaleDateString('en-US', {
                                                          month: 'short', day: 'numeric'
                                                        }) : 'Unknown'}
                                                      </span>
                                                      <span className="text-gray-500">
                                                        {session.students} stu · {formatDuration(session.duration)}
                                                      </span>
                                                      <span className={session.students >= MIN_STUDENTS && session.duration >= MIN_DURATION ? 'text-green-600' : 'text-yellow-600'}>
                                                        {session.students >= MIN_STUDENTS && session.duration >= MIN_DURATION ? '✓' : 'test'}
                                                      </span>
                                                    </div>
                                                  ))}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Legend */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">✓×3</span>
                          <span>= Taught (10+ students, 15+ min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">test×2</span>
                          <span>= Test run only</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">—</span>
                          <span>= Not started</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-gray-400 rounded bg-white inline-block"></span>
                          <span>= Click to mark emailed</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
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

        {/* Error Logs Tab */}
        {activeTab === 'errors' && (
          <ErrorLogViewer />
        )}
        </>
        )}
      </main>
    </div>
  );
};

export default PilotAdminPage;
