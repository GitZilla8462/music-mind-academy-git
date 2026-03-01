import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { getDatabase, ref, get, set, remove, onValue, update } from 'firebase/database';
import { subscribeToAnalytics } from '../../firebase/analytics';
import { SITE_TYPES } from '../../firebase/approvedEmails';
import { processDripEmails } from '../../firebase/dripProcessor';
import { sendTeacherEmail } from '../../firebase/emailTracking';
import * as XLSX from 'xlsx';

const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];

const EXCLUDED_ANALYTICS_EMAILS = [
  'abross0930@gmail.com',
  'tshepard@ccsfw.org',
  'rencro123@gmail.com',
  'lchiesa@fmschools.org',
  'd.vasileska@gmail.com',
  'afisher@theoaksacademy.org',
  'brandonvalerino@gmail.com',
];

const AdminDataContext = createContext(null);

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
};

export const AdminDataProvider = ({ children }) => {
  const { user, loading: authLoading } = useFirebaseAuth();

  const [selectedSite, setSelectedSite] = useState(SITE_TYPES.ACADEMY);
  const [academyEmails, setAcademyEmails] = useState([]);
  const [eduEmails, setEduEmails] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [teacherAnalytics, setTeacherAnalytics] = useState([]);
  const [pilotSessions, setPilotSessions] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);

  const [quickSurveys, setQuickSurveys] = useState([]);
  const [midPilotSurveys, setMidPilotSurveys] = useState([]);
  const [finalPilotSurveys, setFinalPilotSurveys] = useState([]);

  const [teacherOutreach, setTeacherOutreach] = useState({});
  const [emailsSent, setEmailsSent] = useState({});
  const [applications, setApplications] = useState([]);

  const [approvingId, setApprovingId] = useState(null);
  const [dripProcessing, setDripProcessing] = useState(false);
  const [dripResult, setDripResult] = useState(null);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);
  const [hubspotSyncing, setHubspotSyncing] = useState(false);
  const [hubspotSyncResult, setHubspotSyncResult] = useState(null);

  const database = getDatabase();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  const approvedEmails = selectedSite === SITE_TYPES.ACADEMY ? academyEmails : eduEmails;

  // Firebase listeners
  useEffect(() => {
    if (!user || !isAdmin) return;

    const academyRef = ref(database, 'approvedEmails/academy');
    const unsubAcademy = onValue(academyRef, (snapshot) => {
      if (snapshot.exists()) {
        const emails = [];
        snapshot.forEach((child) => { emails.push({ id: child.key, ...child.val() }); });
        emails.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
        setAcademyEmails(emails);
      } else { setAcademyEmails([]); }
    });

    const eduRef = ref(database, 'approvedEmails/edu');
    const unsubEdu = onValue(eduRef, (snapshot) => {
      if (snapshot.exists()) {
        const emails = [];
        snapshot.forEach((child) => { emails.push({ id: child.key, ...child.val() }); });
        emails.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
        setEduEmails(emails);
      } else { setEduEmails([]); }
    });

    const usersRef = ref(database, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((child) => { users.push({ id: child.key, ...child.val() }); });
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRegisteredUsers(users);
      } else { setRegisteredUsers([]); }
      setLoading(false);
    });

    const unsubAnalytics = subscribeToAnalytics(({ stats, teachers, sessions }) => {
      setSummaryStats(stats);
      const filteredTeachers = teachers.filter(t =>
        !EXCLUDED_ANALYTICS_EMAILS.includes(t.email?.toLowerCase())
      );
      setTeacherAnalytics(filteredTeachers);
      setPilotSessions(sessions);
    });

    const quickSurveysRef = ref(database, 'surveys');
    const unsubQuickSurveys = onValue(quickSurveysRef, (snapshot) => {
      if (snapshot.exists()) {
        const surveys = [];
        snapshot.forEach((child) => {
          if (child.key === 'midPilot' || child.key === 'finalPilot') return;
          const data = child.val();
          if (data && data.surveyType === 'quick') surveys.push({ id: child.key, ...data });
        });
        surveys.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        setQuickSurveys(surveys);
      } else { setQuickSurveys([]); }
    });

    const midPilotRef = ref(database, 'surveys/midPilot');
    const unsubMidPilot = onValue(midPilotRef, (snapshot) => {
      if (snapshot.exists()) {
        const surveys = [];
        snapshot.forEach((child) => { surveys.push({ id: child.key, ...child.val() }); });
        surveys.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        setMidPilotSurveys(surveys);
      } else { setMidPilotSurveys([]); }
    });

    const finalPilotRef = ref(database, 'surveys/finalPilot');
    const unsubFinalPilot = onValue(finalPilotRef, (snapshot) => {
      if (snapshot.exists()) {
        const surveys = [];
        snapshot.forEach((child) => { surveys.push({ id: child.key, ...child.val() }); });
        surveys.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
        setFinalPilotSurveys(surveys);
      } else { setFinalPilotSurveys([]); }
    });

    const outreachRef = ref(database, 'teacherOutreach');
    const unsubOutreach = onValue(outreachRef, (snapshot) => {
      if (snapshot.exists()) { setTeacherOutreach(snapshot.val()); }
      else { setTeacherOutreach({}); }
    });

    const emailsSentRef = ref(database, 'emailsSent');
    const unsubEmailsSent = onValue(emailsSentRef, (snapshot) => {
      if (snapshot.exists()) { setEmailsSent(snapshot.val()); }
      else { setEmailsSent({}); }
    });

    const applicationsRef = ref(database, 'pilotApplications');
    const unsubApplications = onValue(applicationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const apps = [];
        snapshot.forEach((child) => { apps.push({ id: child.key, ...child.val() }); });
        apps.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        setApplications(apps);
      } else { setApplications([]); }
    });

    return () => {
      unsubAcademy(); unsubEdu(); unsubUsers(); unsubAnalytics();
      unsubQuickSurveys(); unsubMidPilot(); unsubFinalPilot();
      unsubOutreach(); unsubEmailsSent(); unsubApplications();
    };
  }, [user, isAdmin, database]);

  // Auto-run drip processor
  useEffect(() => {
    if (!isAdmin || loading || academyEmails.length === 0) return;
    const runDrip = async () => {
      try {
        const approvedMap = {};
        academyEmails.forEach(e => {
          const key = e.email?.toLowerCase().replace(/\./g, ',');
          if (key) approvedMap[key] = e;
        });
        const registeredSet = new Set(registeredUsers.map(u => u.email?.toLowerCase()).filter(Boolean));
        const result = await processDripEmails(approvedMap, registeredSet, teacherOutreach);
        if (result.drip2Sent > 0 || result.drip3Sent > 0) {
          setDripResult(result);
          console.log('[DripProcessor] Auto-run results:', result);
        }
      } catch (err) { console.error('[DripProcessor] Auto-run error:', err); }
    };
    runDrip();
  }, [isAdmin, loading, academyEmails.length, registeredUsers.length]);

  // --- Action Handlers ---

  const handleApproveApplication = async (app) => {
    setApprovingId(app.id);
    try {
      const schoolEmail = app.schoolEmail.toLowerCase();
      const emailKey = schoolEmail.replace(/\./g, ',');
      const now = Date.now();

      await update(ref(database, `pilotApplications/${app.id}`), { status: 'approved', approvedAt: now });
      await set(ref(database, `approvedEmails/academy/${emailKey}`), {
        email: schoolEmail, approvedAt: now,
        name: `${app.firstName} ${app.lastName}`, school: app.schoolName, source: 'pilot-application'
      });
      await update(ref(database, `teacherOutreach/${emailKey}`), {
        email: schoolEmail, name: `${app.firstName} ${app.lastName}`,
        school: app.schoolName, approvedAt: now, source: 'pilot-application'
      });
      await sendTeacherEmail(app.personalEmail || schoolEmail, app.firstName, 'drip-1', { name: app.firstName });

      try {
        await fetch('/api/hubspot/update-status', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: schoolEmail, displayName: `${app.firstName} ${app.lastName}`, status: 'approved' })
        });
      } catch (hsErr) { console.error('HubSpot sync failed:', hsErr); }

      setSuccess(`Approved ${app.firstName} ${app.lastName} — welcome email sent`);
    } catch (err) {
      console.error('Failed to approve:', err);
      setError(`Failed to approve: ${err.message}`);
    }
    setApprovingId(null);
  };

  const handleRejectApplication = async (app) => {
    try {
      await update(ref(database, `pilotApplications/${app.id}`), { status: 'rejected', rejectedAt: Date.now() });
      setSuccess(`Declined ${app.firstName} ${app.lastName}`);
    } catch (err) { setError(`Failed to decline: ${err.message}`); }
  };

  const toggleOutreach = async (teacherEmail, field, explicitValue = null) => {
    const emailKey = teacherEmail.toLowerCase().replace(/\./g, ',');
    const outreachRef = ref(database, `teacherOutreach/${emailKey}`);
    try {
      let updates = { email: teacherEmail };
      if (explicitValue !== null) {
        updates[field] = explicitValue;
      } else {
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

  const handleAddEmail = async (email, notes, teacherType) => {
    try {
      const emailKey = email.toLowerCase().trim().replace(/\./g, ',');
      const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);
      await set(emailRef, {
        email: email.toLowerCase().trim(), approvedAt: Date.now(),
        notes: notes.trim(), approvedBy: user.email, siteType: selectedSite
      });
      const outreachRef = ref(database, `teacherOutreach/${emailKey}`);
      await update(outreachRef, { email: email.toLowerCase().trim(), teacherType, addedAt: Date.now() });

      const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
      const typeLabel = teacherType === 'purchased' ? 'Purchased' : 'Pilot';
      setSuccess(`Added ${email} to ${siteName} as ${typeLabel}`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleBatchAdd = async (batchEmails, batchNotes, teacherType) => {
    try {
      const entries = [];
      const lines = batchEmails.split(/\n/).filter(l => l.trim());

      for (const line of lines) {
        const parts = (line.includes('\t') ? line.split('\t') : line.split(/\s{2,}/))
          .map(p => p.trim()).filter(Boolean);
        const emails = [];
        const textParts = [];

        for (const part of parts) {
          const emailMatch = part.match(/[^\s,;()]+@[^\s,;()]+/g);
          if (emailMatch) emails.push(...emailMatch.map(e => e.toLowerCase().trim()));
          else textParts.push(part);
        }

        if (emails.length === 0) continue;

        let name = '', school = '';
        if (textParts.length >= 2) {
          name = textParts[0]; school = textParts[textParts.length - 1];
        } else if (textParts.length === 1) {
          const firstPart = parts[0].trim();
          const firstHasEmail = firstPart.match(/[^\s,;()]+@[^\s,;()]+/);
          if (firstHasEmail) school = textParts[0];
          else name = textParts[0];
        }

        for (const email of emails) {
          entries.push({ email, name, school: school || batchNotes.trim() });
        }
      }

      if (entries.length === 0) {
        setError('No valid emails found. Make sure each line has an email address.');
        return false;
      }

      const seen = new Set();
      const uniqueEntries = entries.filter(e => {
        if (seen.has(e.email)) return false;
        seen.add(e.email); return true;
      });

      let added = 0, skipped = 0;
      for (const { email, name, school } of uniqueEntries) {
        const emailKey = email.replace(/\./g, ',');
        const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);
        const snapshot = await get(emailRef);
        if (snapshot.exists()) { skipped++; continue; }

        await set(emailRef, {
          email, name: name || '', approvedAt: Date.now(),
          notes: school, approvedBy: user.email, siteType: selectedSite
        });
        const outreachRef = ref(database, `teacherOutreach/${emailKey}`);
        await update(outreachRef, { email, name: name || '', teacherType, school, addedAt: Date.now() });
        added++;
      }

      const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
      const typeLabel = teacherType === 'purchased' ? 'Purchased' : 'Pilot';
      setSuccess(`Added ${added} ${typeLabel} email${added !== 1 ? 's' : ''} to ${siteName}${skipped > 0 ? ` (${skipped} already existed)` : ''}`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleRemoveEmail = async (emailKey, email) => {
    const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
    if (!confirm(`Remove ${email} from ${siteName}?`)) return;
    try {
      const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);
      await remove(emailRef);
      setSuccess(`Removed ${email} from ${siteName}`);
    } catch (err) { setError(err.message); }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (selectedIds.length === 0) return;
    const siteName = selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools';
    if (!confirm(`Delete ${selectedIds.length} email(s) from ${siteName}?`)) return;
    try {
      for (const emailKey of selectedIds) {
        const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);
        await remove(emailRef);
      }
      setSuccess(`Removed ${selectedIds.length} email(s) from ${siteName}`);
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  const handleBulkDeleteUsers = async (selectedIds) => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} user account(s)? They will no longer be able to log in.`)) return;
    try {
      for (const userId of selectedIds) {
        const userRef = ref(database, `users/${userId}`);
        await remove(userRef);
      }
      setSuccess(`Removed ${selectedIds.length} user account(s)`);
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  // Utility helpers
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (ms) => {
    if (!ms) return '0 min';
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const getLessonName = (lessonId, lessonRoute) => {
    if (lessonRoute?.includes('lesson1')) return 'Lesson 1: Mood & Expression';
    if (lessonRoute?.includes('lesson2')) return 'Lesson 2: Instrumentation';
    if (lessonRoute?.includes('lesson3')) return 'Lesson 3: Texture';
    if (lessonRoute?.includes('lesson4')) return 'Lesson 4: Form';
    if (lessonRoute?.includes('lesson5')) return 'Lesson 5: Capstone';
    return lessonId || 'Unknown';
  };

  const backfillStudentCounts = async () => {
    if (!confirm('This will look up actual student counts from live session data and update analytics. Continue?')) return;
    setIsBackfilling(true);
    setBackfillResult(null);
    try {
      const pilotSessionsRef = ref(database, 'pilotSessions');
      const pilotSnapshot = await get(pilotSessionsRef);
      if (!pilotSnapshot.exists()) {
        setBackfillResult({ success: false, message: 'No pilot sessions found' });
        setIsBackfilling(false);
        return;
      }

      let updated = 0, notFound = 0, alreadyCorrect = 0, errors = 0;
      const details = [];
      const pilotData = pilotSnapshot.val();

      for (const sessionCode of Object.keys(pilotData)) {
        const pilotSession = pilotData[sessionCode];
        const currentCount = pilotSession.studentsJoined || 0;
        try {
          const liveSessionRef = ref(database, `sessions/${sessionCode}`);
          const liveSnapshot = await get(liveSessionRef);
          if (!liveSnapshot.exists()) { notFound++; details.push({ code: sessionCode, status: 'not_found', oldCount: currentCount }); continue; }
          const liveSession = liveSnapshot.val();
          const actualCount = liveSession.studentsJoined ? Object.keys(liveSession.studentsJoined).length : 0;
          if (actualCount === currentCount) { alreadyCorrect++; continue; }
          const updateRef = ref(database, `pilotSessions/${sessionCode}`);
          await update(updateRef, { studentsJoined: actualCount });
          updated++;
          details.push({ code: sessionCode, status: 'updated', oldCount: currentCount, newCount: actualCount, teacher: pilotSession.teacherEmail });
        } catch (err) { errors++; details.push({ code: sessionCode, status: 'error', error: err.message }); }
      }

      setBackfillResult({
        success: true,
        message: `Backfill complete: ${updated} updated, ${alreadyCorrect} already correct, ${notFound} live sessions not found, ${errors} errors`,
        updated, alreadyCorrect, notFound, errors,
        details: details.filter(d => d.status === 'updated')
      });
    } catch (err) {
      setBackfillResult({ success: false, message: `Error: ${err.message}` });
    } finally { setIsBackfilling(false); }
  };

  const syncToHubSpot = async () => {
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

      const stageTimes = session.stageTimes || {};
      const activeTimeMs = Object.values(stageTimes).reduce((sum, t) => sum + (t || 0), 0);
      const activeTimeMins = Math.round(activeTimeMs / 60000);
      const stageCount = Object.keys(stageTimes).length;
      const isReal = activeTimeMins >= 10 && stageCount >= 3;

      if (!teacherLessonData[email]) teacherLessonData[email] = { email, highestLesson: 0 };
      if (isReal && lessonNum > teacherLessonData[email].highestLesson) {
        teacherLessonData[email].highestLesson = lessonNum;
      }
    });

    const teacherPayload = Object.values(teacherLessonData).map(t => ({
      email: t.email, displayName: '', lessonReached: t.highestLesson
    }));

    const sessionEmails = new Set(Object.keys(teacherLessonData).map(e => e.toLowerCase()));
    registeredUsers.forEach(u => {
      if (u.email && !sessionEmails.has(u.email.toLowerCase())) {
        teacherPayload.push({ email: u.email, displayName: u.displayName || '', lessonReached: 0 });
      }
    });

    if (!confirm(`Sync ${teacherPayload.length} teachers to HubSpot?`)) return;
    setHubspotSyncing(true);
    setHubspotSyncResult(null);
    try {
      const res = await fetch('/api/hubspot/batch-sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachers: teacherPayload })
      });
      const result = await res.json();
      setHubspotSyncResult(result);
      setSuccess(`HubSpot sync: ${result.updated || 0} updated, ${result.created || 0} created, ${result.failed || 0} failed`);
    } catch (err) {
      setError('HubSpot sync failed: ' + err.message);
    } finally { setHubspotSyncing(false); }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const excelDate = (timestamp) => {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    };
    const durationMins = (ms) => ms ? Math.round(ms / 60000) : 0;
    const getActiveTimeMins = (stageTimes) => {
      if (!stageTimes || typeof stageTimes !== 'object') return 0;
      return Math.round(Object.values(stageTimes).reduce((sum, time) => sum + (time || 0), 0) / 60000);
    };
    const isRealClass = (session) => {
      const activeMin = getActiveTimeMins(session.stageTimes);
      const stageCount = session.stageTimes ? Object.keys(session.stageTimes).length : 0;
      return activeMin >= 10 && stageCount >= 3;
    };

    const realClassSessions = pilotSessions.filter(s => isRealClass(s));
    const avgActiveTime = realClassSessions.length > 0
      ? Math.round(realClassSessions.reduce((sum, s) => sum + getActiveTimeMins(s.stageTimes), 0) / realClassSessions.length)
      : 0;

    // Summary
    const summaryData = [
      ['Music Mind Academy Pilot Program Report'], ['Generated', new Date().toLocaleString()], [''],
      ['Summary Statistics'],
      ['Academy Approved Emails', academyEmails.length], ['Edu Approved Emails', eduEmails.length],
      ['Registered Users', registeredUsers.length], ['Total Sessions', pilotSessions.length],
      ['Real Classes (10+ min, 3+ stages)', realClassSessions.length],
      ['Avg Active Teaching Time (min)', avgActiveTime],
      ['Most Popular Lesson', summaryStats?.mostPopularLesson || 'N/A'],
      ['Return Rate (%)', summaryStats?.retentionRate || 0], [''],
      ['DATA NOTES'],
      ['"Active Time" = sum of tracked stage durations (reliable). "Wall Clock" = session start to end (unreliable).'],
      ['"Real Class" = session with 10+ min active time AND 3+ stages visited.'],
      ['Student counts before Jan 10, 2025 are inflated due to a duplicate-on-refresh bug.'],
      ['Student count race condition fixed Feb 9, 2025 (atomic increments).'],
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

    // Teacher Progress
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

      if (!teacherLessonData[email]) teacherLessonData[email] = { email, lessons: { 1: [], 2: [], 3: [], 4: [], 5: [] } };
      teacherLessonData[email].lessons[lessonNum].push({
        students: session.studentsJoined || 0, activeTime: getActiveTimeMins(session.stageTimes),
        realClass: isRealClass(session), date: session.startTime
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
        row.push(realClasses, students, activeTime, realClasses > 0 ? 'Yes' : 'No');
        totalRealClasses += realClasses; totalStudents += students; totalActiveTime += activeTime;
      });
      row.push(totalRealClasses, totalStudents, totalActiveTime);
      teacherRows.push(row);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(teacherRows), 'Teacher Progress');

    // Sessions
    const sessionRows = [['Session Code', 'Teacher Email', 'Lesson', 'Start Time', 'Active Time (min)',
      'Wall Clock (min)', 'Students Joined', 'Real Class', 'Completed', 'Last Stage', 'Stage Times']];
    pilotSessions.forEach(session => {
      const stageTimes = session.stageTimes
        ? Object.entries(session.stageTimes).map(([stage, time]) => `${stage}: ${durationMins(time)}m`).join('; ') : '';
      sessionRows.push([
        session.sessionCode, session.teacherEmail || '', getLessonName(session.lessonId, session.lessonRoute),
        excelDate(session.startTime), getActiveTimeMins(session.stageTimes), durationMins(session.duration),
        session.studentsJoined || 0, isRealClass(session) ? 'Yes' : 'No',
        session.completed ? 'Yes' : 'No', session.lastStage || '', stageTimes
      ]);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sessionRows), 'Sessions');

    // Surveys
    const midPilotRows = [['Session Code', 'Student Count', 'Date', 'Favorite Feature',
      'Improvement Suggestion', 'Skipped Parts', 'Student Quotes', 'On Track to Finish']];
    midPilotSurveys.forEach(survey => {
      midPilotRows.push([survey.sessionCode || survey.id, survey.studentCount || '',
        excelDate(survey.savedAt || survey.submittedAt), survey.favoriteFeature || '',
        survey.improvementSuggestion || '', survey.skippedParts || '',
        survey.studentQuotes || '', survey.onTrack || '']);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(midPilotRows), 'Mid-Pilot Surveys');

    const finalRows = [['Session Code', 'Student Count', 'Date', 'PMF Score', 'Would Recommend', 'Feedback', 'Other Comments']];
    finalPilotSurveys.forEach(survey => {
      const otherFields = Object.entries(survey)
        .filter(([key]) => !['id', 'sessionCode', 'studentCount', 'savedAt', 'submittedAt', 'surveyType', 'pmfScore', 'wouldRecommend', 'feedback'].includes(key))
        .filter(([_, value]) => value && typeof value === 'string')
        .map(([key, value]) => `${key}: ${value}`).join('; ');
      finalRows.push([survey.sessionCode || survey.id, survey.studentCount || '',
        excelDate(survey.savedAt || survey.submittedAt), survey.pmfScore || '',
        survey.wouldRecommend ? 'Yes' : 'No', survey.feedback || '', otherFields]);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(finalRows), 'Final Surveys');

    const quickRows = [['Session Code', 'Date', 'Rating', 'Feedback']];
    quickSurveys.forEach(survey => {
      quickRows.push([survey.sessionCode || survey.id, excelDate(survey.savedAt), survey.rating || '', survey.feedback || survey.comment || '']);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(quickRows), 'Quick Feedback');

    // Approved emails sheets
    const academyRows = [['Email', 'Approved Date', 'Notes', 'Approved By', 'Signed Up']];
    academyEmails.forEach(item => {
      const signedUp = registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase());
      academyRows.push([item.email, excelDate(item.approvedAt), item.notes || '', item.approvedBy || '', signedUp ? 'Yes' : 'No']);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(academyRows), 'Academy Emails');

    const eduRows = [['Email', 'Approved Date', 'Notes', 'Approved By', 'Signed Up']];
    eduEmails.forEach(item => {
      const signedUp = registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase());
      eduRows.push([item.email, excelDate(item.approvedAt), item.notes || '', item.approvedBy || '', signedUp ? 'Yes' : 'No']);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(eduRows), 'Edu Emails');

    const userRows = [['Display Name', 'Email', 'Created Date', 'Last Login', 'Is Pilot']];
    registeredUsers.forEach(u => {
      userRows.push([u.displayName || '', u.email || '', excelDate(u.createdAt), excelDate(u.lastLoginAt), u.isPilot ? 'Yes' : 'No']);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(userRows), 'Registered Users');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `PilotProgram_Export_${dateStr}.xlsx`);
  };

  const value = {
    user, authLoading, isAdmin, loading,
    error, setError, success, setSuccess,
    selectedSite, setSelectedSite, approvedEmails,
    academyEmails, eduEmails, registeredUsers,
    teacherAnalytics, pilotSessions, summaryStats,
    quickSurveys, midPilotSurveys, finalPilotSurveys,
    teacherOutreach, emailsSent, applications,
    approvingId, dripProcessing, dripResult,
    isBackfilling, backfillResult, setBackfillResult,
    hubspotSyncing, hubspotSyncResult,
    // Actions
    handleApproveApplication, handleRejectApplication,
    toggleOutreach,
    handleAddEmail, handleBatchAdd,
    handleRemoveEmail, handleBulkDelete, handleBulkDeleteUsers,
    backfillStudentCounts, syncToHubSpot, exportToExcel,
    // Utilities
    formatDate, formatDuration, getLessonName,
    SITE_TYPES,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};
