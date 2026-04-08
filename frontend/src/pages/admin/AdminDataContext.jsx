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
  const [studentCountByEmail, setStudentCountByEmail] = useState({});

  const [quickSurveys, setQuickSurveys] = useState([]);
  const [midPilotSurveys, setMidPilotSurveys] = useState([]);
  const [finalPilotSurveys, setFinalPilotSurveys] = useState([]);

  const [teacherOutreach, setTeacherOutreach] = useState({});
  const [emailsSent, setEmailsSent] = useState({});
  const [emailUnsubscribes, setEmailUnsubscribes] = useState({});
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

    // Count unique student accounts per teacher (keyed by email)
    // Uses teacherClasses (uid → classIds) + classRosters (classId → seats)
    // Maps UIDs to emails via the users node (already loaded as registeredUsers)
    const loadStudentCounts = async () => {
      try {
        const [tcSnap, rostersSnap, usersSnap] = await Promise.all([
          get(ref(database, 'teacherClasses')),
          get(ref(database, 'classRosters')),
          get(ref(database, 'users'))
        ]);

        // Build UID → email map from users
        const uidToEmail = {};
        if (usersSnap.exists()) {
          usersSnap.forEach((u) => {
            if (u.val()?.email) uidToEmail[u.key] = u.val().email.toLowerCase();
          });
        }

        // Build classId → teacher email map from teacherClasses
        const classToEmail = {};
        if (tcSnap.exists()) {
          tcSnap.forEach((teacherChild) => {
            const uid = teacherChild.key;
            const email = uidToEmail[uid];
            if (email) {
              teacherChild.forEach((classChild) => {
                classToEmail[classChild.key] = email;
              });
            }
          });
        }

        // Count roster entries per teacher email
        const counts = {};
        if (rostersSnap.exists()) {
          rostersSnap.forEach((classChild) => {
            const classId = classChild.key;
            const email = classToEmail[classId];
            if (email) {
              let rosterSize = 0;
              classChild.forEach(() => { rosterSize++; });
              counts[email] = (counts[email] || 0) + rosterSize;
            }
          });
        }
        setStudentCountByEmail(counts);
      } catch (err) {
        console.error('Error loading student counts:', err);
      }
    };
    loadStudentCounts();
    const unsubTeacherClasses = () => {}; // no-op for cleanup compatibility

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

    const unsubscribesRef = ref(database, 'emailUnsubscribes');
    const unsubUnsubscribes = onValue(unsubscribesRef, (snapshot) => {
      if (snapshot.exists()) { setEmailUnsubscribes(snapshot.val()); }
      else { setEmailUnsubscribes({}); }
    });

    return () => {
      unsubAcademy(); unsubEdu(); unsubUsers(); unsubAnalytics(); unsubTeacherClasses();
      unsubQuickSurveys(); unsubMidPilot(); unsubFinalPilot();
      unsubOutreach(); unsubEmailsSent(); unsubApplications(); unsubUnsubscribes();
    };
  }, [user, isAdmin, database]);

  // Auto-run drip processor
  // DRIP PROCESSOR DISABLED — was auto-sending emails on every admin page load
  // To re-enable, uncomment below and add a manual "Run Drip" button instead
  /*
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
  */

  // --- Action Handlers ---

  const handleApproveApplication = async (app) => {
    setApprovingId(app.id);
    try {
      const schoolEmail = app.schoolEmail.toLowerCase();
      const emailKey = schoolEmail.replace(/\./g, ',');
      const now = Date.now();

      await update(ref(database, `pilotApplications/${app.id}`), { status: 'approved', approvedAt: now });
      const personalEmail = (app.personalEmail || '').toLowerCase().trim();
      await set(ref(database, `approvedEmails/academy/${emailKey}`), {
        email: schoolEmail, approvedAt: now,
        name: `${app.firstName} ${app.lastName}`, school: app.schoolName, source: 'pilot-application',
        ...(personalEmail && personalEmail !== schoolEmail ? { personalEmail } : {})
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

  const handleAddEmail = async (email, notes, teacherType, personalEmail = '') => {
    try {
      const emailKey = email.toLowerCase().trim().replace(/\./g, ',');
      const normalizedPersonal = personalEmail?.toLowerCase().trim() || '';
      const emailRef = ref(database, `approvedEmails/${selectedSite}/${emailKey}`);
      await set(emailRef, {
        email: email.toLowerCase().trim(), approvedAt: Date.now(),
        notes: notes.trim(), approvedBy: user.email, siteType: selectedSite,
        ...(normalizedPersonal && normalizedPersonal !== email.toLowerCase().trim() ? { personalEmail: normalizedPersonal } : {})
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

  const removeTeacherCompletely = async (email, skipConfirm = false) => {
    const emailKey = email.toLowerCase().replace(/\./g, ',');
    if (!skipConfirm && !confirm(`Permanently remove ${email} and ALL their classes/student data? This cannot be undone.`)) return false;
    try {
      // Find teacher's UID from registeredUsers so we can delete their classes
      const matchingUser = registeredUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (matchingUser?.id) {
        const { deleteTeacherAndAllData } = await import('../../firebase/classes');
        const result = await deleteTeacherAndAllData(matchingUser.id);
        console.log('Teacher data cleanup:', result);
      }

      // Remove approval, outreach, and email tracking
      await remove(ref(database, `approvedEmails/academy/${emailKey}`));
      await remove(ref(database, `approvedEmails/edu/${emailKey}`));
      await remove(ref(database, `teacherOutreach/${emailKey}`));
      await remove(ref(database, `emailsSent/${emailKey}`));
      if (!skipConfirm) setSuccess(`Removed ${email} and all associated data`);
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  const updatePersonalEmail = async (primaryEmail, personalEmail) => {
    try {
      const emailKey = primaryEmail.toLowerCase().replace(/\./g, ',');
      const normalizedPersonal = personalEmail?.toLowerCase().trim() || '';
      await update(ref(database, `approvedEmails/academy/${emailKey}`), {
        personalEmail: normalizedPersonal
      });
      await update(ref(database, `approvedEmails/edu/${emailKey}`), {
        personalEmail: normalizedPersonal
      }).catch(() => {}); // edu entry may not exist
      return true;
    } catch (err) { setError(err.message); return false; }
  };

  const mergeTeacherEntries = async (keepEmail, removeEmail) => {
    const keepKey = keepEmail.toLowerCase().replace(/\./g, ',');
    const removeKey = removeEmail.toLowerCase().replace(/\./g, ',');
    try {
      // 1. Set personalEmail on the kept entry
      await update(ref(database, `approvedEmails/academy/${keepKey}`), {
        personalEmail: removeEmail.toLowerCase().trim()
      });

      // 2. Merge outreach data (fill gaps only)
      const removeOutreach = teacherOutreach[removeKey];
      if (removeOutreach) {
        const keepOutreach = teacherOutreach[keepKey] || {};
        const mergedFields = {};
        if (!keepOutreach.name && removeOutreach.name) mergedFields.name = removeOutreach.name;
        if (!keepOutreach.school && removeOutreach.school) mergedFields.school = removeOutreach.school;
        if (Object.keys(mergedFields).length > 0) {
          await update(ref(database, `teacherOutreach/${keepKey}`), mergedFields);
        }
      }

      // 3. Merge emailsSent data
      const removeEmailsSentSnap = await get(ref(database, `emailsSent/${removeKey}`));
      if (removeEmailsSentSnap.exists()) {
        const keepEmailsSentSnap = await get(ref(database, `emailsSent/${keepKey}`));
        const keepData = keepEmailsSentSnap.exists() ? keepEmailsSentSnap.val() : {};
        const removeData = removeEmailsSentSnap.val();
        const mergedEmailsSent = {};
        Object.entries(removeData).forEach(([type, val]) => {
          if (!keepData[type]) mergedEmailsSent[type] = val;
        });
        if (Object.keys(mergedEmailsSent).length > 0) {
          await update(ref(database, `emailsSent/${keepKey}`), mergedEmailsSent);
        }
      }

      // 4. Remove the duplicate entry completely
      await remove(ref(database, `approvedEmails/academy/${removeKey}`));
      await remove(ref(database, `approvedEmails/edu/${removeKey}`)).catch(() => {});
      await remove(ref(database, `teacherOutreach/${removeKey}`));
      await remove(ref(database, `emailsSent/${removeKey}`));

      setSuccess(`Merged ${removeEmail} → ${keepEmail}`);
      return true;
    } catch (err) {
      setError(`Failed to merge: ${err.message}`);
      return false;
    }
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

      // Helper: look up classId from a class code via classCodes/{code}
      const classIdCache = {};
      const getClassIdForCode = async (code) => {
        if (classIdCache[code] !== undefined) return classIdCache[code];
        try {
          const snap = await get(ref(database, `classCodes/${code}`));
          classIdCache[code] = snap.exists() ? snap.val() : null;
        } catch { classIdCache[code] = null; }
        return classIdCache[code];
      };

      for (const sessionCode of Object.keys(pilotData)) {
        const pilotSession = pilotData[sessionCode];
        const currentCount = pilotSession.studentsJoined || 0;
        try {
          let actualCount = 0;
          let found = false;

          // Try quick-join session first
          const liveSessionRef = ref(database, `sessions/${sessionCode}`);
          const liveSnapshot = await get(liveSessionRef);
          if (liveSnapshot.exists()) {
            const liveSession = liveSnapshot.val();
            actualCount = liveSession.studentsJoined ? Object.keys(liveSession.studentsJoined).length : 0;
            found = true;
          }

          // Try class-based session (use stored classId or look up by class code)
          if (!found || actualCount === 0) {
            const matchedClassId = pilotSession.classId || await getClassIdForCode(sessionCode);
            if (matchedClassId) {
              const classStudentsRef = ref(database, `classes/${matchedClassId}/currentSession/studentsJoined`);
              const classSnap = await get(classStudentsRef);
              if (classSnap.exists()) {
                const classCount = Object.keys(classSnap.val()).length;
                actualCount = Math.max(actualCount, classCount);
                found = true;
              }
              // Also store classId on the pilotSession for future lookups
              if (!pilotSession.classId) {
                await update(ref(database, `pilotSessions/${sessionCode}`), { classId: matchedClassId, isClassSession: true });
              }
            }
          }

          if (!found) { notFound++; details.push({ code: sessionCode, status: 'not_found', oldCount: currentCount }); continue; }
          if (actualCount <= currentCount) { alreadyCorrect++; continue; }
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
      ['Activation Funnel'],
      ['Approved (total)', [...academyEmails, ...eduEmails].length],
      ['Signed Up', registeredUsers.length],
      ['Explored (started session, no real class)', registeredUsers.filter(u => {
        const email = u.email?.toLowerCase();
        const analytics = teacherAnalytics.find(t => t.email?.toLowerCase() === email);
        const hasSessions = (analytics?.totalSessions || 0) > 0;
        const hasRealClass = pilotSessions.some(s => s.teacherEmail?.toLowerCase() === email && isRealClass(s));
        return hasSessions && !hasRealClass;
      }).length],
      ['Teaching (1+ real class)', new Set(realClassSessions.map(s => s.teacherEmail?.toLowerCase())).size],
      ['Never Logged In', [...academyEmails, ...eduEmails].filter(item =>
        !registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase())
      ).length], [''],
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

    const teacherRows = [['Teacher Email', 'L1 Real Classes', 'L1 Active Time (min)', 'L1 Taught',
      'L2 Real Classes', 'L2 Active Time (min)', 'L2 Taught',
      'L3 Real Classes', 'L3 Active Time (min)', 'L3 Taught',
      'L4 Real Classes', 'L4 Active Time (min)', 'L4 Taught',
      'L5 Real Classes', 'L5 Active Time (min)', 'L5 Taught',
      'Total Real Classes', 'Student Accounts', 'Total Active Time (min)']];

    Object.values(teacherLessonData).forEach(teacher => {
      const row = [teacher.email];
      let totalRealClasses = 0, totalActiveTime = 0;
      [1, 2, 3, 4, 5].forEach(lessonNum => {
        const sessions = teacher.lessons[lessonNum];
        const realClasses = sessions.filter(s => s.realClass).length;
        const activeTime = sessions.reduce((sum, s) => sum + s.activeTime, 0);
        row.push(realClasses, activeTime, realClasses > 0 ? 'Yes' : 'No');
        totalRealClasses += realClasses; totalActiveTime += activeTime;
      });
      const uniqueStudents = studentCountByEmail[teacher.email?.toLowerCase()] || 0;
      row.push(totalRealClasses, uniqueStudents, totalActiveTime);
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

    // Activation Funnel — shows every approved teacher's journey from approval to teaching
    const allApproved = [...academyEmails, ...eduEmails];
    const funnelRows = [['Email', 'Stage', 'Signed Up', 'Signup Date', 'Last Login', 'Total Sessions', 'Real Classes', 'Lessons Visited', 'Last Activity']];
    allApproved.forEach(item => {
      const email = item.email?.toLowerCase();
      const reg = registeredUsers.find(u => u.email?.toLowerCase() === email);
      const analytics = teacherAnalytics.find(t => t.email?.toLowerCase() === email);
      const teacherSessions = pilotSessions.filter(s => s.teacherEmail?.toLowerCase() === email);
      const realClasses = teacherSessions.filter(s => isRealClass(s)).length;
      const totalSessions = analytics?.totalSessions || teacherSessions.length;
      const lessonsVisited = analytics?.lessonsVisited?.map(l => l.lessonId).join(', ') || '';

      let stage = 'Not Logged In';
      if (reg) {
        stage = 'Registered';
        if (totalSessions > 0) stage = 'Explored';
        // Check if they taught real classes
        let highestLesson = 0;
        teacherSessions.forEach(s => {
          if (!isRealClass(s)) return;
          let num = 0;
          if (s.lessonRoute?.includes('lesson1')) num = 1;
          else if (s.lessonRoute?.includes('lesson2')) num = 2;
          else if (s.lessonRoute?.includes('lesson3')) num = 3;
          else if (s.lessonRoute?.includes('lesson4')) num = 4;
          else if (s.lessonRoute?.includes('lesson5')) num = 5;
          if (num > highestLesson) highestLesson = num;
        });
        if (highestLesson >= 1) stage = `Teaching (L${highestLesson})`;
      }

      funnelRows.push([
        item.email, stage, reg ? 'Yes' : 'No',
        reg ? excelDate(reg.createdAt) : '',
        reg ? excelDate(reg.lastLoginAt) : '',
        totalSessions, realClasses, lessonsVisited,
        analytics?.lastActivity ? excelDate(analytics.lastActivity) : ''
      ]);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(funnelRows), 'Activation Funnel');

    // Applications
    const appRows = [['First Name', 'Last Name', 'School Email', 'Personal Email', 'School', 'City', 'State',
      'Grades', 'Devices', 'Class Size', 'Biggest Challenge', 'Why Pilot', 'Tools Used',
      'Can Commit', 'Other', 'Status', 'Applied']];
    applications.forEach(a => {
      appRows.push([
        a.firstName || '', a.lastName || '', a.schoolEmail || '', a.personalEmail || '',
        a.schoolName || '', a.city || '', a.state || '',
        (a.grades || []).join('; '), (a.devices || []).join('; '), a.classSize || '',
        a.biggestChallenge || '', a.whyPilot || '', (a.toolsUsed || []).join('; '),
        a.canCommit || '', a.anythingElse || '', a.status || '',
        a.submittedAt ? excelDate(a.submittedAt) : ''
      ]);
    });
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(appRows), 'Applications');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `PilotProgram_Export_${dateStr}.xlsx`);
  };

  const [nameFixing, setNameFixing] = useState(false);
  const [nameFixResult, setNameFixResult] = useState(null);

  const fixTeacherNames = async () => {
    const NAME_FIXES = {"augustaitis.inga@ccsd59.org":"Inga Augustaitis","amccormick@eastlakeacademy.org":"Alexis McCormick","apoll@fcps.edu":"Amelia Poll","ehanson@longmeadow.k12.ma.us":"Erin Hanson","fooyta@kalamazoopublicschools.net":"Taryn Fooy","anewton@msad11.org":"Adam Newton","jessica.vu@mytas.edu.vn":"Jessica Vu","carriejirava@gmail.com":"Carrie Jirava","10017296@casdschools.org":"Luther March","dwilson539@go.tahomasd.us":"Dylan Wilson","10015017@casdschools.org":"Niema Davis","kimberly.collison@oneontacsd.org":"Kimberly Collison","quarlesm@casdschools.org":"Matthew Quarles","rconnelly@fmschools.org":"Rose Connelly","rmobley@ofr5.com":"Robert Mobley","mrsagoins@gmail.com":"Ara-Viktoria McKinney-Bookman","emilyabolles@gmail.com":"Emily Bo","rebekka_rosen@greenwich.k12.ct.us":"Rebekka Rosen","jayjay497@gmail.com":"Jose Falcon","23mstone@gmail.com":"Madison Stone","jrickeytrumpet@gmail.com":"Jason Rickey","hilary.toerner@gmail.com":"Hilary Toerner","andberrmull@gmail.com":"Andrea Mulligan","sharonskaggs84@gmail.com":"Sharon Skaggs","pamwgambrell@gmail.com":"Pamela Gambrell","zannetasmith@gmail.com":"Zanneta Kubajak","emma.vogel@colchestersd.org":"Emma Vogel","jennyrventer@gmail.com":"Jenny Venter","carrie.anne.nichols@gmail.com":"Carrie Nichols","haomeara4@gmail.com":"Haley O'Meara","danielle.haffner@gmail.com":"Danielle Haffner","rachelamov@gmail.com":"Rachel Amov","allison.friedman@me.com":"Allison Friedman","jamesludwig32@gmail.com":"James Ludwig","bestnotestudio@gmail.com":"Leslie Best","myleskifner@gmail.com":"Myles Kifner","sydneywemhoff@gmail.com":"Sydney Wemhoff","ljgroves@k12.wv.us":"Laura Groves","locopianowoman@gmail.com":"Lisa Benton","stephanie.corbett@marlboroschools.org":"Stephanie Corbett","akrolikowski@esd20.org":"Alan Krolikowski","hillarythomson@gmail.com":"Hillary Thomson","burleigh93@gmail.com":"Andrea Burleigh","johnbarryblack@gmail.com":"Lynda Black","ilikecanadianmusic@gmail.com":"Andrea Phillips","springera@nwlschools.org":"Alyssa Springer","p.mann@stpaulkensington.org":"Polina Mann","brandonvalerino@gmail.com":"Brandon Valerino","rencro123@gmail.com":"Renae Cross","rcarruthers@jd.cnyric.org":"Robin Carruthers","musiceducationmama@gmail.com":"Tiffany Wilson","aross@mcspresidents.org":"Alexander Ross","ataube@fmschools.org":"Anna Taube","bsulecki@attleborops.net":"Bethany Sulecki","polhemust@newmilfordps.org":"Tim Polhemus","eberg@stjohnbaptist.net":"Erin Berg","masons@newmilfordps.org":"Scott Mason","rhucko@allendalecolumbia.org":"Rachel Hucko","jundem@isd2144.org":"Jacquie Undem","earnhearta@hfparishschool.org":"Anne Earnheart","sgrant@medford.k12.ma.us":"Sarah Grant","sjschouweile@cps.edu":"Samantha Soto","ehulse@farmingdaleschools.org":"Eric Hulse","dreynolds@isaz.org":"Daniel Reynolds","ymygdanis@acg.edu":"Yannis Mygdanis","katherine_silcott@olsd.us":"Katie Silcott","rfarris@hamptonhawks.us":"Regina Farris","becky.rhodes@lemondenorman.org":"Becky Rhodes","jlee@communityprep.org":"Janine Lee","egknieriemen@cps.edu":"Emilie Knieriemen","rachel.hucko@gmail.com":"Rachel Hucko","jmclaughlin1@wssdgmail.org":"James McLaughlin","jennifer.stepp@cobbk12.org":"Jennifer Stepp","emma.bergman@orecity.k12.or.us":"Emma Bergman","ethan.krebs@yrdsb.ca":"Ethan Krebs","michael.frontz@watertown.k12.ma.us":"Michael Frontz","ssukeforth@rsu21.net":"Sarah Sukeforth","madison.gaudet@bhrsd.org":"Madison Gaudet","msparzak@saintraphael.org":"Monica Sparzak","lj213708@ddsb.ca":"Leslie Best","aromanoski@mmrschool.org":"Amy Romanoski","lbenton@gcalions.com":"Lisa Benton","dornr@wws.k12.in.us":"Rebecca Dorn","krennar@sjp2school.com":"Karen Rennar","nsciacaluga@loreto.gi":"Nina Sciacaluga Azopardi","jmeyerand@eastpointsc.org":"Jordan Meyerand","kathryn_e_archer@mcpsmd.org":"Katie Archer","shariffskull068@edmonds.wednet.edu":"Lisa Shariffskul","tbrundage@drregional.org":"Tyler Brundage","mansfie250@gmail.com":"Lisa Mansfie","cjirava@holyrosarycc.org":"Carrie Jirava","jskrivseth@mcpsmt.org":"Jenny Skrivseth","aburleigh@montoursville.k12.pa.us":"Andrea Burleigh","gillisk@hrce.ca":"Kate Gillis","shahs@sau29.org":"Sue Hahs","kmcclain@mpspride.org":"Karla McClain","sketchell@cedarburg.k12.wi.us":"Summer Ketchell","msinicropi@gccschool.org":"Mark Sinicropi","fancher_kevin@cusdk8.org":"Kevin Fancher","amiekelp@ahchristian.com":"Amie Kelp","kmccallie@moscowcharterschool.org":"Kori McCallie","sgiliberto1@pghschools.org":"Sarah Giliberto","beddowsd@newmilfordps.org":"Diana Beddows","pahayden@madison.k12.wi.us":"Parlee Hayden","ninahazel6@gmail.com":"Nina Sciacaluga Azopardi","aruiz@amschool.org":"Anissa Ruiz","ljgrovesljgroves@gmail.com":"Laura Groves","gmassimini@stpiusbowie.org":"Gerianna Massimini","cpowell@crockerschools.org":"Candice Powell","christina.carpenter@pallisersd.ab.ca":"Christina Carpenter","jennie.grimes@lcps.org":"Jennie Grimes","lisachouinard@akcs.org":"Lisa Chouinard","ndellomas@glenullinbearcats.org":"Nino Dellomas","krista.chapman@gpsjackets.org":"Krista Chapman","dcheney@upsala.k12.mn.us":"Denise Cheney","jlskrivseth@gmail.com":"Jenny Skrivseth","dsnavely@tahomasd.us":"Dean Snavely","bissetc@pitt.k12.nc.us":"Caroline Bissette","slevasseur@st-anns.ca":"Samantha Levasseur","mbrandhandler@sd113a.org":"Micah Brandhandler","kbowers@madison.k12.al.us":"Kristi Bowers","aschneider@bradleyschools.com":"Amy Schneider","jatchue@magnoliasd.org":"Jennifer Atchue","mbarnes@ofr5.com":"Mary Kate Barnes","sstromberg1@pghschools.org":"Shayne Stromberg","sheilacoop@gmail.com":"Sheila Cooper","matt.chaffins@peake.k12.oh.us":"Matt Chaffins","ljacky@hillsboro-indians.org":"Laura Jacky","jordanmeyerand@gmail.com":"Jordan Meyerand","jwasserman@sgabriel.org":"JoAnne Wasserman","jthornell@hanoverschools.org":"Julienne Thornell","jelanitbrown@gmail.com":"Jenlanit Brown","stonemadison@bcsdschools.net":"Madison Stone","cassandra.mccormick@stanlycountyschools.org":"Cassie McCormick","ccummings@pycsd.org":"Carole Cummings","magoedewaldt@gmail.com":"Maggie Oedewaldt","spencer.caldwell@menifeeusd.org":"Spencer Caldwell","bjarrett@amherst.k12.va.us":"Brenda Jarrett","tylerrae.durkee@wilsonschoolsnc.net":"Tyler Rae Durkee","ejacobsonholtz@neenah.k12.wi.us":"Betsy Jacobson-Holtz","emilybo@cciu.org":"Emily Bo","pcorrea5@cps.edu":"Paris Correa","jrickey@necsd.net":"Jason Rickey","leslie.best@ddsb.ca":"Leslie Best","renae_s_cross@dekalbschoolsga.org":"Renae Cross","susan.reid@hcps.org":"Susan Reid","rslater@npd117.net":"Rob Slater","fsehirlioglu@besaturkey.org":"Feryal Sehirlioglu","lweatherly@nppsd.org":"Lenore Weatherly","jpiper@mamkschools.org":"Jordan Piper","dragana.milenkovic@tdsb.on.ca":"Dragana Milenkovic","lblack@qasbc.ca":"Lynda Black","haffnerd@mdusd.org":"Danielle Haffner","jtatevosian@elmhurst205.org":"Jessica Tatevosian","joshua.fletcher@lincoln.kyschools.us":"Josh Fletcher","d.vasileska@gmail.com":"Dance Vasileska","amckinney-bookman@lexington1.net":"Ara-Viktoria McKinney-Bookman","emma.vogel@gmail.com":"Emma Vogel","ajimenez2@bostonpublicschools.org":"Alana Jimenez","kpope@c-ischools.org":"Katie Pope","rachel.amov@springscs.org":"Rachel Amov","kcorso@wps.org":"Keri Corso","twilson@stmonica.school":"Tiffany Wilson","abross0930@gmail.com":"Alex Ross","ahamilton@veronaschools.org":"Amanda Hamilton","avenkus@staff.colonialsd.org":"Amy Venkus","csmith@warrenk12nc.org":"Cherita Smith","andberr@msn.com":"Andrea Mulligan","kathrynhillary.thomson@tdsb.on.ca":"Hillary Thomson","cooperk@llsd.org":"Kiri Cooper","auskb@groveslearning.org":"Becca Ausk","msh23@scasd.org":"Marisa Hickey","zkubajak@cps.edu":"Zanneta Kubajak","haley.omeara@k12.wv.us":"Haley O'Meara","rrosen1311@gmail.com":"Rebekka Rosen","tashkandim@chelseaschools.com":"Meredith Tashkandi","tshepard@ccsfw.org":"Tyler Shepard","agstudios516@gmail.com":"Angela Gaynor","allisontesta@gmail.com":"Allison Testa","jevaj@crestviewacademy.org":"Jessica Jevanord","clister@nrpsk12.org":"Carla Lister","sfitts@northwood.k12.nh.us":"Sarah Fitts","kirsty.kelly@iszl.ch":"Kirsty Kelly","megan.dixson@stleonards.org":"Megan Dixson","claire.jansenvanrensburg@fideleschristianschool.com":"Claire Jansen Van Rensburg","jludwig@herricksk12.org":"James Ludwig","kkrennar@gmail.com":"Karen Rennar","htoerner@stalbertschool.org":"Hilary Toerner","ann.schertzer@bexley.us":"Ann Schertzer","jnygoodman@gmail.com":"Jen Goodman","sydneywemhoff@leigh.esu7.org":"Sydney Wemhoff","jleclerc05@gmail.com":"Justin Leclerc","mshelleman@cdschools.org":"Mark Shelleman","lmsilveyra@cps.edu":"Mari Silveyra","schroeter_danielle@mybps.us":"Danielle Schroeter","kdennison@sjdrsaints.org":"Katherine Dennison","pottss@wyomingcityschools.org":"Sara Potts","alyssapspringer82@yahoo.com":"Alyssa Springer","esmith@veritassav.org":"Erin Smith","pamela.gambrell@cabarrus.k12.nc.us":"Pamela Gambrell","asutton@fallscityps.org":"Alisha Sutton","holly.huff@whcsd.org":"Holly Stephens","jsullivan@miltonps.org":"Julia Sullivan","wandaleecarew@nlesd.ca":"Wanda-Lee Carew","aknighton@candorcs.org":"Amelia Knighton","katarina.franjic@southtechschools.org":"Katarina Franjic","sfonda@stlouisschool.org":"Sarah Fonda","ldean@paulding.k12.ga.us":"Liz Dean","cmcintire.teacher@gmail.com":"Carrie McIntire","carrieannenichols@gmail.com":"Carrie Nichols","jessica.belanger@rccdsb.ca":"Jessica Belanger","afisher@theoaksacademy.org":"April Fisher","j.venter@eisp.it":"Jenny Venter","bvalerino@westgenesee.org":"Brandon Valerino","a.smorynski@taftsd90.org":"Alicia Smorynski","monica.white@qacps.org":"Monica White","lisa.bolieu@usd417.org":"Lisa Bolieu","moorea@columbiak12.com":"Allyson Moore","rcagle@warrensburgr6.org":"Bob Cagle","ccain@nhshawks.com":"Carrie Cain","frzbdgz@gmail.com":"Renee Owens","danabottomley@johnston.k12.nc.us":"Dana Bottomley","hbrown@monessensd.org":"Hilary Brown","julissamartinez0728@gmail.com":"Julissa Martinez","sgomez44@schools.nyc.gov":"Steven Gomez","frankgilchriest@gmail.com":"Francis Gilchriest","gacj@oacsd.org":"Jenny Gac","coest@milltownps.org":"Cindy Oest","dibarra0513@gmail.com":"Deisy Ibarra","gkapiniak@rvschools.ab.ca":"Greg Kapiniak","tnelsonpayne@allsaintskenosha.org":"Tami Payne","mdavis@stpaulvalpo.org":"Melissa Davis","paigegrahammusic@gmail.com":"Paige Graham","afriedman@portnet.org":"Allison Friedman","mkifner@edencsd.org":"Myles Kifner","sarah.pippen@crossettschools.org":"Sarah Beth Pippen","westbrookp@sw1.k12.wy.us":"Physhaunt Westbrook","jfalcon@bridgeportedu.net":"Jose Falcon","phillipsan@hdsb.ca":"Andrea Phillips","sskaggs@bentonvillek12.org":"Sharon Skaggs","maryannwahl@tguschools.org":"Maryann Wahl","sternea@lmsd.org":"Anne Sterner-Porreca","lballard@sau39.org":"Larry Ballard","polina.mann@stritaschool.org":"Polina Mann","ayarbrough@halfwayschools.org":"Amanda Yarbrough","tyler.erhard@hanovertwpschools.org":"Tyler Erhard","lchiesa@fmschools.org":"Laura Chiesa"};

    setNameFixing(true);
    setNameFixResult(null);
    try {
      const approvedSnap = await get(ref(database, 'approvedEmails/academy'));
      const outreachSnap = await get(ref(database, 'teacherOutreach'));
      const approved = approvedSnap.exists() ? approvedSnap.val() : {};
      const outreach = outreachSnap.exists() ? outreachSnap.val() : {};

      const updates = {};
      let fixCount = 0;

      for (const [emailKey, data] of Object.entries(approved)) {
        const email = (data.email || emailKey.replace(/,/g, '.')).toLowerCase();
        const currentName = (data.name || '').trim();
        const correctName = NAME_FIXES[email];
        if (!correctName) continue;
        if (!currentName || currentName !== correctName) {
          updates[`approvedEmails/academy/${emailKey}/name`] = correctName;
          fixCount++;
        }
      }

      for (const [emailKey, data] of Object.entries(outreach)) {
        const email = (data.email || emailKey.replace(/,/g, '.')).toLowerCase();
        const currentName = (data.name || '').trim();
        const correctName = NAME_FIXES[email];
        if (!correctName) continue;
        if (!currentName || currentName !== correctName) {
          updates[`teacherOutreach/${emailKey}/name`] = correctName;
          fixCount++;
        }
      }

      for (const [emailKey, data] of Object.entries(approved)) {
        const email = (data.email || emailKey.replace(/,/g, '.')).toLowerCase();
        if (!outreach[emailKey] && NAME_FIXES[email]) {
          updates[`teacherOutreach/${emailKey}/email`] = email;
          updates[`teacherOutreach/${emailKey}/name`] = NAME_FIXES[email];
          updates[`teacherOutreach/${emailKey}/addedAt`] = Date.now();
          fixCount++;
        }
      }

      // Fix known email typos: delete typo entry, ensure correct entry exists
      const EMAIL_TYPO_FIXES = {
        'dwislon539@go,tahomasd,us': { correctKey: 'dwilson539@go,tahomasd,us', email: 'dwilson539@go.tahomasd.us', name: 'Dylan Wilson' }
      };

      for (const [typoKey, fix] of Object.entries(EMAIL_TYPO_FIXES)) {
        if (approved[typoKey]) {
          updates[`approvedEmails/academy/${typoKey}`] = null; // delete typo
          if (!approved[fix.correctKey]) {
            updates[`approvedEmails/academy/${fix.correctKey}`] = { email: fix.email, name: fix.name, approvedAt: Date.now(), notes: 'Fixed from typo' };
          }
          fixCount++;
        }
      }

      if (fixCount === 0) {
        setNameFixResult({ success: true, message: 'All names are already correct!' });
      } else {
        await update(ref(database), updates);
        setNameFixResult({ success: true, message: `Fixed ${fixCount} entries (names + typos).` });
      }
    } catch (err) {
      setNameFixResult({ success: false, message: `Error: ${err.message}` });
    }
    setNameFixing(false);
  };

  const value = {
    user, authLoading, isAdmin, loading,
    error, setError, success, setSuccess,
    selectedSite, setSelectedSite, approvedEmails,
    academyEmails, eduEmails, registeredUsers, studentCountByEmail,
    teacherAnalytics, pilotSessions, summaryStats,
    quickSurveys, midPilotSurveys, finalPilotSurveys,
    teacherOutreach, emailsSent, emailUnsubscribes, applications,
    approvingId, dripProcessing, dripResult,
    isBackfilling, backfillResult, setBackfillResult,
    hubspotSyncing, hubspotSyncResult,
    nameFixing, nameFixResult, setNameFixResult,
    // Actions
    handleApproveApplication, handleRejectApplication,
    toggleOutreach,
    handleAddEmail, handleBatchAdd,
    handleRemoveEmail, handleBulkDelete, handleBulkDeleteUsers, removeTeacherCompletely,
    mergeTeacherEntries, updatePersonalEmail,
    backfillStudentCounts, syncToHubSpot, exportToExcel, fixTeacherNames,
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
