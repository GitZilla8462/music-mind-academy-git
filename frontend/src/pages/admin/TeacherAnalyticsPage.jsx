import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  BarChart3, Search, Filter, ChevronDown, Check, Copy, Download,
  Mail, X, Eye, Loader2, CheckCircle, AlertCircle, Users, UserX,
  GraduationCap, Clock, ClipboardList, Trash2, Link2
} from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { EMAIL_NAMES } from './emailConstants';
import { getDatabase, ref, set } from 'firebase/database';

const PERSONAL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'me.com', 'icloud.com', 'msn.com', 'aol.com', 'live.com', 'comcast.net'];
const isPersonalEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return PERSONAL_DOMAINS.includes(domain);
};

const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];

// Unit definitions — add new units here as they're built
const UNITS = {
  'film-music-project': { label: 'Film Music', short: 'U1', badgeComplete: 'bg-blue-100 text-blue-800', badgePartial: 'bg-blue-50 text-blue-600', border: 'border-blue-200', heading: 'text-blue-700' },
  'listening-lab': { label: 'Listening Lab', short: 'U2', badgeComplete: 'bg-purple-100 text-purple-800', badgePartial: 'bg-purple-50 text-purple-600', border: 'border-purple-200', heading: 'text-purple-700' },
  // Future units:
  // 'world-music': { label: 'World Music', short: 'U3', badgeComplete: 'bg-green-100 text-green-800', badgePartial: 'bg-green-50 text-green-600', border: 'border-green-200', heading: 'text-green-700' },
};

const UNIT_IDS = Object.keys(UNITS);

const STAGE_ORDER = {
  'Not Logged In': 0, 'Registered': 1, 'Explored': 2,
  'L1': 3, 'L2': 4, 'L3': 5, 'L4': 6, 'L5': 7, 'Completed': 8
};

const STAGE_COLORS = {
  'Not Logged In': 'bg-red-100 text-red-700',
  'Registered': 'bg-yellow-100 text-yellow-700',
  'Explored': 'bg-orange-100 text-orange-700',
  'L1': 'bg-blue-100 text-blue-700',
  'L2': 'bg-blue-100 text-blue-700',
  'L3': 'bg-indigo-100 text-indigo-700',
  'L4': 'bg-purple-100 text-purple-700',
  'L5': 'bg-green-100 text-green-700',
  'Completed': 'bg-green-200 text-green-800',
};

const MIN_ACTIVE_MINUTES = 10;
const MIN_STAGES = 3;

const TeacherAnalyticsPage = () => {
  const {
    academyEmails, registeredUsers, pilotSessions, teacherOutreach,
    midPilotSurveys, finalPilotSurveys, applications, emailsSent,
    studentCountByUid,
    toggleOutreach, setSuccess, formatDuration, formatDate,
    removeTeacherCompletely, mergeTeacherEntries,
    nameFixing, nameFixResult, setNameFixResult, fixTeacherNames
  } = useAdminData();

  const [analyticsSort, setAnalyticsSort] = useState({ column: 'stage', direction: 'desc' });
  const [stageFilter, setStageFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [surveyFilter, setSurveyFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [expandedTeachers, setExpandedTeachers] = useState({});
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [funnelFilter, setFunnelFilter] = useState(null);
  const [toast, setToast] = useState(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showMarkSentModal, setShowMarkSentModal] = useState(false);
  const [unitFilter, setUnitFilter] = useState('all'); // 'all' or a unit ID like 'film-music-project'

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Build session data by teacher email — organized by unit
  const sessionsByTeacher = useMemo(() => {
    const map = {};
    const emptyUnits = () => {
      const u = {};
      UNIT_IDS.forEach(id => { u[id] = { 1: [], 2: [], 3: [], 4: [], 5: [] }; });
      return u;
    };

    pilotSessions.forEach(session => {
      const email = session.teacherEmail?.toLowerCase();
      if (!email) return;
      const route = session.lessonRoute || '';

      // Extract unit and lesson from route like /lessons/film-music-project/lesson3
      let unitId = null;
      let lessonNum = null;
      for (const id of UNIT_IDS) {
        if (route.includes(id)) { unitId = id; break; }
      }
      // Fallback: if no unit matched but has lesson, assume film-music-project (legacy)
      const lessonMatch = route.match(/lesson(\d)/);
      if (lessonMatch) lessonNum = parseInt(lessonMatch[1]);
      if (!unitId && lessonNum) unitId = 'film-music-project';
      if (!unitId || !lessonNum) return;

      if (!map[email]) map[email] = { units: emptyUnits(), totalStudents: 0, totalSessions: 0, lastSessionTime: 0 };

      const stageTimes = session.stageTimes || {};
      const activeTimeMs = Object.values(stageTimes).reduce((sum, t) => sum + (t || 0), 0);
      const activeTimeMins = Math.round(activeTimeMs / 60000);
      const stageCount = Object.keys(stageTimes).length;

      map[email].units[unitId][lessonNum].push({
        sessionCode: session.sessionCode, date: session.startTime,
        students: session.studentsJoined || 0, duration: session.duration || 0,
        activeTimeMins, stageCount, completed: session.completed || false
      });
      map[email].totalStudents += session.studentsJoined || 0;
      map[email].totalSessions += 1;
      if (session.startTime > map[email].lastSessionTime) map[email].lastSessionTime = session.startTime;
    });
    return map;
  }, [pilotSessions]);

  // Build application lookup by email
  const applicationsByEmail = useMemo(() => {
    const map = {};
    (applications || []).forEach(app => {
      const email = app.schoolEmail?.toLowerCase();
      if (email) map[email] = app;
    });
    return map;
  }, [applications]);

  // Build registered users lookup
  const registeredByEmail = useMemo(() => {
    const map = {};
    registeredUsers.forEach(u => {
      if (u.email) map[u.email.toLowerCase()] = u;
    });
    return map;
  }, [registeredUsers]);

  const isLessonCompleted = (sessions) => {
    return sessions.some(s => s.activeTimeMins >= MIN_ACTIVE_MINUTES && s.stageCount >= MIN_STAGES);
  };

  // Build email history lookup from emailsSent
  const emailHistoryByTeacher = useMemo(() => {
    const map = {};
    Object.entries(emailsSent).forEach(([emailKey, types]) => {
      const email = emailKey.replace(/,/g, '.').toLowerCase();
      map[email] = types; // e.g. { 'drip-1': { sentAt: 123 }, 'drip-2': { sentAt: 456 } }
    });
    return map;
  }, [emailsSent]);

  // Unified teacher list
  const teachers = useMemo(() => {
    const emailSet = new Set();
    const result = [];

    // Start with all academyEmails as base
    academyEmails.forEach(approved => {
      const email = approved.email?.toLowerCase();
      if (!email || ADMIN_EMAILS.includes(email) || emailSet.has(email)) return;
      emailSet.add(email);

      const emailKey = email.replace(/\./g, ',');
      const outreach = teacherOutreach[emailKey] || {};
      const reg = registeredByEmail[email];
      const sessions = sessionsByTeacher[email];
      const app = applicationsByEmail[email];

      // Determine name
      const teacherName = outreach.name || reg?.displayName || approved.name || (app ? `${app.firstName} ${app.lastName}` : '');
      const school = outreach.school || approved.notes || (app ? app.schoolName : '');

      // Build per-unit progress
      const unitProgress = {};
      let highestLesson = 0;
      let unitsComplete = 0;
      let unitsStarted = 0;
      let totalLessonsDone = 0;

      if (sessions) {
        UNIT_IDS.forEach(uid => {
          const lessons = sessions.units[uid];
          const done = [1, 2, 3, 4, 5].map(n => isLessonCompleted(lessons[n]));
          const started = [1, 2, 3, 4, 5].map(n => lessons[n].length > 0);
          const lessonsDone = done.filter(Boolean).length;
          const lessonsStarted = started.filter(Boolean).length;
          unitProgress[uid] = { done, started, lessonsDone, lessonsStarted };
          totalLessonsDone += lessonsDone;
          if (lessonsDone === 5) unitsComplete++;
          if (lessonsStarted > 0) unitsStarted++;
        });
      }

      // Determine stage (based on highest progress across all units)
      let stage = 'Not Logged In';

      if (reg || sessions) {
        stage = 'Registered';
        if (sessions) {
          // Find highest completed lesson across all units
          UNIT_IDS.forEach(uid => {
            const up = unitProgress[uid];
            if (!up) return;
            for (let i = 4; i >= 0; i--) {
              if (up.done[i] && (i + 1) > highestLesson) highestLesson = i + 1;
            }
          });

          if (unitsComplete > 0 && highestLesson === 5) stage = 'Completed';
          else if (highestLesson >= 4) stage = 'L4';
          else if (highestLesson >= 3) stage = 'L3';
          else if (highestLesson >= 2) stage = 'L2';
          else if (highestLesson >= 1) stage = 'L1';
          else if (sessions.totalSessions > 0) stage = 'Explored';
        }
      }

      // Last active: latest of lastLoginAt or last session time
      const lastActive = Math.max(reg?.lastLoginAt || 0, sessions?.lastSessionTime || 0);

      // Survey checks
      const hasL3Survey = midPilotSurveys.some(s =>
        s.teacherEmail?.toLowerCase() === email ||
        pilotSessions.some(ps => ps.sessionCode === s.sessionCode && ps.teacherEmail?.toLowerCase() === email)
      );
      const hasFinalSurvey = finalPilotSurveys.some(s =>
        s.teacherEmail?.toLowerCase() === email ||
        pilotSessions.some(ps => ps.sessionCode === s.sessionCode && ps.teacherEmail?.toLowerCase() === email)
      );

      // Get personal email from approved entry or application data
      const personalEmail = approved.personalEmail?.toLowerCase().trim() || app?.personalEmail?.toLowerCase().trim() || '';
      const hasPersonalEmail = personalEmail && personalEmail !== email;

      // Get unique student account count from teacherClasses data
      const teacherUid = reg?.id;
      const uniqueStudents = teacherUid ? (studentCountByUid[teacherUid] || 0) : 0;

      result.push({
        email, teacherName, school, stage,
        personalEmail: hasPersonalEmail ? personalEmail : '',
        unitProgress,
        unitsComplete, unitsStarted, totalLessonsDone,
        units: sessions?.units || {},
        totalStudents: uniqueStudents,
        totalSessions: sessions?.totalSessions || 0,
        lastActive,
        approvedAt: approved.approvedAt || 0,
        hasL3Survey, hasFinalSurvey,
        manualL3Survey: outreach.manualL3Survey || false,
        manualFinalSurvey: outreach.manualFinalSurvey || false,
        teacherType: outreach.teacherType || 'pilot',
        emailHistory: emailHistoryByTeacher[email] || {},
      });
    });

    return result;
  }, [academyEmails, registeredByEmail, sessionsByTeacher, teacherOutreach, applicationsByEmail, midPilotSurveys, finalPilotSurveys, pilotSessions, emailHistoryByTeacher, studentCountByUid]);

  // Detect duplicate teachers: same name OR same email prefix
  const { duplicateNames, duplicatePairs } = useMemo(() => {
    // Build set of known linked email pairs (personalEmail relationships)
    const linkedPairs = new Set();
    teachers.forEach(t => {
      if (t.personalEmail) {
        const key = [t.email, t.personalEmail].sort().join('|');
        linkedPairs.add(key);
      }
    });

    // Group by name
    const byName = {};
    teachers.forEach(t => {
      const name = t.teacherName?.toLowerCase().trim();
      if (!name) return;
      if (!byName[name]) byName[name] = [];
      byName[name].push(t);
    });

    // Group by email prefix (part before @)
    const byPrefix = {};
    teachers.forEach(t => {
      const prefix = t.email.split('@')[0].toLowerCase().replace(/[._-]/g, '');
      if (!prefix || prefix.length < 4) return;
      if (!byPrefix[prefix]) byPrefix[prefix] = [];
      byPrefix[prefix].push(t);
    });

    // Build unique duplicate pairs
    const pairSet = new Set();
    const pairs = [];
    const addPair = (t1, t2) => {
      const key = [t1.email, t2.email].sort().join('|');
      if (pairSet.has(key) || linkedPairs.has(key)) return;
      pairSet.add(key);
      // Determine which is school vs personal
      const t1Personal = isPersonalEmail(t1.email);
      const t2Personal = isPersonalEmail(t2.email);
      const keep = t1Personal && !t2Personal ? t2 : !t1Personal && t2Personal ? t1 : (t1.teacherName ? t1 : t2);
      const remove = keep === t1 ? t2 : t1;
      pairs.push({ keep, remove, matchType: 'name' });
    };

    // Name-based pairs
    Object.values(byName).forEach(group => {
      if (group.length < 2) return;
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (group[i].email !== group[j].email) addPair(group[i], group[j]);
        }
      }
    });

    // Prefix-based pairs (catches nameless entries with matching prefix)
    Object.values(byPrefix).forEach(group => {
      if (group.length < 2) return;
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (group[i].email !== group[j].email) {
            const key = [group[i].email, group[j].email].sort().join('|');
            if (!pairSet.has(key) && !linkedPairs.has(key)) {
              pairSet.add(key);
              const t1Personal = isPersonalEmail(group[i].email);
              const t2Personal = isPersonalEmail(group[j].email);
              const keep = t1Personal && !t2Personal ? group[j] : !t1Personal && t2Personal ? group[i] : (group[i].teacherName ? group[i] : group[j]);
              const rem = keep === group[i] ? group[j] : group[i];
              pairs.push({ keep, remove: rem, matchType: 'prefix' });
            }
          }
        }
      }
    });

    // Build flagged map for "Dup?" badges
    const flagged = {};
    pairs.forEach(({ keep, remove: rem }) => {
      if (!flagged[keep.email]) flagged[keep.email] = [];
      if (!flagged[rem.email]) flagged[rem.email] = [];
      flagged[keep.email].push(rem.email);
      flagged[rem.email].push(keep.email);
    });

    return { duplicateNames: flagged, duplicatePairs: pairs };
  }, [teachers]);

  // Funnel counts
  const funnelCounts = useMemo(() => {
    const now = Date.now();
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    let notLoggedIn = 0, loggedIn = 0, explored = 0, teaching = 0, stalled = 0, surveyDue = 0;

    teachers.forEach(t => {
      // Primary funnel: these 4 add up to total
      if (t.stage === 'Not Logged In') notLoggedIn++;
      else if (t.stage === 'Registered') loggedIn++;
      else if (t.stage === 'Explored') explored++;
      else teaching++; // L1+

      // Cross-cutting filters (overlap with above)
      if (t.lastActive > 0 && (now - t.lastActive) > fourteenDays) stalled++;
      if (STAGE_ORDER[t.stage] >= STAGE_ORDER['L3'] && !t.hasL3Survey && !t.manualL3Survey) surveyDue++;
    });

    return { total: teachers.length, notLoggedIn, loggedIn, explored, teaching, stalled, surveyDue };
  }, [teachers]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let list = [...teachers];

    // Search
    const q = analyticsSearch.toLowerCase();
    if (q) {
      list = list.filter(t =>
        t.email.includes(q) || (t.teacherName && t.teacherName.toLowerCase().includes(q)) || (t.school && t.school.toLowerCase().includes(q))
      );
    }

    // Stage filter
    if (stageFilter !== 'all') {
      list = list.filter(t => t.stage === stageFilter);
    }

    // Activity filter
    if (activityFilter === 'activeWeek') list = list.filter(t => t.lastActive > 0 && (now - t.lastActive) < 7 * day);
    else if (activityFilter === 'inactive7') list = list.filter(t => t.lastActive > 0 && (now - t.lastActive) >= 7 * day);
    else if (activityFilter === 'inactive14') list = list.filter(t => t.lastActive > 0 && (now - t.lastActive) >= 14 * day);
    else if (activityFilter === 'inactive30') list = list.filter(t => t.lastActive > 0 && (now - t.lastActive) >= 30 * day);

    // Survey filter
    if (surveyFilter === 'hasL3') list = list.filter(t => t.hasL3Survey || t.manualL3Survey);
    else if (surveyFilter === 'missingL3') list = list.filter(t => STAGE_ORDER[t.stage] >= STAGE_ORDER['L3'] && !t.hasL3Survey && !t.manualL3Survey);
    else if (surveyFilter === 'hasL5') list = list.filter(t => t.hasFinalSurvey || t.manualFinalSurvey);
    else if (surveyFilter === 'missingL5') list = list.filter(t => STAGE_ORDER[t.stage] >= STAGE_ORDER['Completed'] && !t.hasFinalSurvey && !t.manualFinalSurvey);

    // Email filter
    if (emailFilter === 'none') list = list.filter(t => Object.keys(t.emailHistory).length === 0);
    else if (emailFilter === 'missingWelcome') list = list.filter(t => !t.emailHistory['drip-1']);
    else if (emailFilter === 'missingFollowup') list = list.filter(t => !t.emailHistory['drip-2']);
    else if (emailFilter === 'missingFinal') list = list.filter(t => !t.emailHistory['drip-3']);
    else if (emailFilter === 'missingSurveyL3') list = list.filter(t => !t.emailHistory['survey-l3']);
    else if (emailFilter === 'missingSurveyL5') list = list.filter(t => !t.emailHistory['survey-l5']);
    else if (emailFilter === 'hasWelcome') list = list.filter(t => !!t.emailHistory['drip-1']);
    else if (emailFilter === 'hasFollowup') list = list.filter(t => !!t.emailHistory['drip-2']);
    else if (emailFilter === 'hasFinal') list = list.filter(t => !!t.emailHistory['drip-3']);

    // Funnel filter overrides
    if (funnelFilter === 'notLoggedIn') list = list.filter(t => t.stage === 'Not Logged In');
    else if (funnelFilter === 'loggedIn') list = list.filter(t => t.stage === 'Registered' || t.stage === 'Explored');
    else if (funnelFilter === 'teaching') list = list.filter(t => STAGE_ORDER[t.stage] >= STAGE_ORDER['L1']);
    else if (funnelFilter === 'stalled') list = list.filter(t => t.lastActive > 0 && (now - t.lastActive) > 14 * day);
    else if (funnelFilter === 'surveyDue') list = list.filter(t => STAGE_ORDER[t.stage] >= STAGE_ORDER['L3'] && !t.hasL3Survey && !t.manualL3Survey);

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      switch (analyticsSort.column) {
        case 'name': cmp = (a.teacherName || a.email).localeCompare(b.teacherName || b.email); break;
        case 'school': cmp = (a.school || '').localeCompare(b.school || ''); break;
        case 'stage': cmp = (STAGE_ORDER[a.stage] || 0) - (STAGE_ORDER[b.stage] || 0); break;
        case 'days': cmp = (a.approvedAt || 0) - (b.approvedAt || 0); break;
        case 'lastActive': cmp = (a.lastActive || 0) - (b.lastActive || 0); break;
        case 'units': cmp = (a.totalLessonsDone || 0) - (b.totalLessonsDone || 0); break;
        case 'l1': cmp = getLessonScore(a, 1) - getLessonScore(b, 1); break;
        case 'l2': cmp = getLessonScore(a, 2) - getLessonScore(b, 2); break;
        case 'l3': cmp = getLessonScore(a, 3) - getLessonScore(b, 3); break;
        case 'l4': cmp = getLessonScore(a, 4) - getLessonScore(b, 4); break;
        case 'l5': cmp = getLessonScore(a, 5) - getLessonScore(b, 5); break;
        case 'students': cmp = a.totalStudents - b.totalStudents; break;
        default: cmp = (a.lastActive || 0) - (b.lastActive || 0); break;
      }
      return analyticsSort.direction === 'desc' ? -cmp : cmp;
    });

    return list;
  }, [teachers, analyticsSearch, stageFilter, activityFilter, surveyFilter, emailFilter, unitFilter, funnelFilter, analyticsSort]);

  const getLessonScore = (teacher, lessonNum) => {
    // When filtering by unit, score based on that unit's data
    const uid = unitFilter !== 'all' ? unitFilter : 'film-music-project';
    const up = teacher.unitProgress[uid];
    if (!up) return 0;
    if (up.done[lessonNum - 1]) return 2;
    if (up.started[lessonNum - 1]) return 1;
    return 0;
  };

  // Selection helpers
  const allFilteredSelected = filteredTeachers.length > 0 && filteredTeachers.every(t => selectedEmails.has(t.email));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredTeachers.map(t => t.email)));
    }
  };

  const toggleSelect = (email) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const selectedTeachers = filteredTeachers.filter(t => selectedEmails.has(t.email));

  // Copy emails
  const handleCopyEmails = () => {
    const emails = selectedTeachers.map(t => t.email).join(', ');
    navigator.clipboard.writeText(emails).then(() => showToast('Copied!'));
  };

  // Export CSV
  const handleExportCSV = () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const rows = [['First Name', 'Email', 'School', 'Stage', 'Days Since Approved', 'Last Active']];
    selectedTeachers.forEach(t => {
      const firstName = t.teacherName ? t.teacherName.split(' ')[0] : t.email.split('@')[0];
      const daysSinceApproved = t.approvedAt ? Math.round((now - t.approvedAt) / day) : '';
      const lastActiveStr = t.lastActive ? new Date(t.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';
      rows.push([firstName, t.email, t.school || '', t.stage, daysSinceApproved, lastActiveStr]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${selectedTeachers.length} teachers`);
  };

  // Funnel card click
  const handleFunnelClick = (key) => {
    if (funnelFilter === key) {
      setFunnelFilter(null);
    } else {
      setFunnelFilter(key);
      // Reset other filters when using funnel
      setStageFilter('all');
      setActivityFilter('all');
    }
  };

  const daysSince = (timestamp) => {
    if (!timestamp) return '';
    return Math.round((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
  };

  // Sub-components

  const SortHeader = ({ column, children, className = '', center = false }) => (
    <th
      className={`px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap bg-gray-50 ${center ? 'text-center' : 'text-left'} ${className}`}
      onClick={() => {
        if (analyticsSort.column === column) setAnalyticsSort({ column, direction: analyticsSort.direction === 'asc' ? 'desc' : 'asc' });
        else setAnalyticsSort({ column, direction: 'desc' });
      }}
    >
      <div className={`flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
        {children}
        {analyticsSort.column === column && <span className="text-blue-600">{analyticsSort.direction === 'asc' ? '↑' : '↓'}</span>}
      </div>
    </th>
  );

  const LessonCell = ({ sessions, isCompleted }) => {
    if (!sessions || sessions.length === 0) return <td className="px-1 py-2 text-center text-gray-300">--</td>;
    return (
      <td className="px-1 py-2 text-center">
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
          isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isCompleted ? '✓' : 'test'}
          {sessions.length > 1 && <span>x{sessions.length}</span>}
        </span>
      </td>
    );
  };

  const FunnelCard = ({ label, count, colorClass, filterKey, icon: Icon }) => {
    const active = funnelFilter === filterKey;
    return (
      <button
        onClick={() => handleFunnelClick(filterKey)}
        className={`flex-1 min-w-[140px] rounded-lg p-3 border-2 transition-all text-left ${
          active ? 'border-gray-800 shadow-md ring-2 ring-gray-300' : 'border-transparent hover:border-gray-300'
        } ${colorClass}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon size={16} />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <div className="text-2xl font-bold">{count}</div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Funnel Cards — top row adds up to total */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3">
          <FunnelCard label="Never Logged In" count={funnelCounts.notLoggedIn} colorClass="bg-red-50 text-red-800" filterKey="notLoggedIn" icon={UserX} />
          <FunnelCard label="Only Logged In" count={funnelCounts.loggedIn + funnelCounts.explored} colorClass="bg-yellow-50 text-yellow-800" filterKey="loggedIn" icon={Users} />
          <FunnelCard label="Teaching (L1+)" count={funnelCounts.teaching} colorClass="bg-green-50 text-green-800" filterKey="teaching" icon={GraduationCap} />
        </div>
        <div className="text-xs text-gray-400 ml-1">{funnelCounts.notLoggedIn} + {funnelCounts.loggedIn + funnelCounts.explored} + {funnelCounts.teaching} = {funnelCounts.total} approved</div>
        <div className="flex flex-wrap gap-3">
          <FunnelCard label="Stalled 14+ days" count={funnelCounts.stalled} colorClass="bg-gray-50 text-gray-700" filterKey="stalled" icon={Clock} />
          <FunnelCard label="Survey Due" count={funnelCounts.surveyDue} colorClass="bg-purple-50 text-purple-800" filterKey="surveyDue" icon={ClipboardList} />
        </div>
      </div>

      {/* Duplicates button */}
      {duplicatePairs.length > 0 && (
        <button
          onClick={() => setShowDuplicates(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100"
        >
          <Link2 size={16} />
          {duplicatePairs.length} Duplicate{duplicatePairs.length !== 1 ? 's' : ''} Detected — Clean Up
        </button>
      )}

      {/* Fix Names button */}
      <div className="flex items-center gap-3">
        <button
          onClick={fixTeacherNames}
          disabled={nameFixing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
        >
          {nameFixing ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
          {nameFixing ? 'Fixing Names...' : 'Fix Teacher Names'}
        </button>
        {nameFixResult && (
          <div className={`flex items-center gap-2 text-sm ${nameFixResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {nameFixResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {nameFixResult.message}
            <button onClick={() => setNameFixResult(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header with filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} />
                Teacher Pipeline
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredTeachers.length} of {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
                {(stageFilter !== 'all' || activityFilter !== 'all' || surveyFilter !== 'all' || emailFilter !== 'all' || unitFilter !== 'all' || funnelFilter) && ' (filtered)'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text" placeholder="Search name, email, school..."
                  value={analyticsSearch} onChange={(e) => setAnalyticsSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56"
                />
              </div>
              {/* Stage filter */}
              <div className="relative">
                <select
                  value={stageFilter}
                  onChange={(e) => { setStageFilter(e.target.value); setFunnelFilter(null); }}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Stages</option>
                  <option value="Not Logged In">Not Logged In</option>
                  <option value="Registered">Registered</option>
                  <option value="Explored">Explored</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                  <option value="L4">L4</option>
                  <option value="L5">L5</option>
                  <option value="Completed">Completed</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {/* Activity filter */}
              <select
                value={activityFilter}
                onChange={(e) => { setActivityFilter(e.target.value); setFunnelFilter(null); }}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Activity</option>
                <option value="activeWeek">Active this week</option>
                <option value="inactive7">Inactive 7+ days</option>
                <option value="inactive14">Inactive 14+ days</option>
                <option value="inactive30">Inactive 30+ days</option>
              </select>
              {/* Survey filter */}
              <select
                value={surveyFilter}
                onChange={(e) => { setSurveyFilter(e.target.value); setFunnelFilter(null); }}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Surveys</option>
                <option value="hasL3">Has Mid-Pilot Survey</option>
                <option value="missingL3">Missing Mid-Pilot Survey</option>
                <option value="hasL5">Has Final Survey</option>
                <option value="missingL5">Missing Final Survey</option>
              </select>
              {/* Email filter */}
              <select
                value={emailFilter}
                onChange={(e) => { setEmailFilter(e.target.value); setFunnelFilter(null); }}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Emails</option>
                <option value="none">No emails sent</option>
                <option value="hasWelcome">Has Welcome Email</option>
                <option value="missingWelcome">Missing Welcome Email</option>
                <option value="hasFollowup">Has 7-Day Follow-up</option>
                <option value="missingFollowup">Missing 7-Day Follow-up</option>
                <option value="hasFinal">Has Final Reminder</option>
                <option value="missingFinal">Missing Final Reminder</option>
                <option value="missingSurveyL3">Missing Mid-Pilot Survey email</option>
                <option value="missingSurveyL5">Missing Final Survey email</option>
              </select>
              {/* Unit filter */}
              <select
                value={unitFilter}
                onChange={(e) => { setUnitFilter(e.target.value); setFunnelFilter(null); }}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Units</option>
                {UNIT_IDS.map((uid, i) => (
                  <option key={uid} value={uid}>Unit {i + 1}: {UNITS[uid].label}</option>
                ))}
              </select>
              {/* Clear filters */}
              {(stageFilter !== 'all' || activityFilter !== 'all' || surveyFilter !== 'all' || emailFilter !== 'all' || unitFilter !== 'all' || funnelFilter || analyticsSearch) && (
                <button
                  onClick={() => { setStageFilter('all'); setActivityFilter('all'); setSurveyFilter('all'); setEmailFilter('all'); setUnitFilter('all'); setFunnelFilter(null); setAnalyticsSearch(''); }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Batch action toolbar */}
        {selectedEmails.size > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-4 sticky top-0 z-20">
            <span className="text-sm font-medium text-blue-800">
              {selectedEmails.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button onClick={handleCopyEmails} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Copy size={14} /> Copy Emails
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Download size={14} /> Export CSV
              </button>
              <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <Mail size={14} /> Send Email
              </button>
              <button onClick={() => setShowMarkSentModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Check size={14} /> Mark Email Sent
              </button>
            </div>
            <button onClick={() => setSelectedEmails(new Set())} className="ml-auto text-sm text-blue-600 hover:text-blue-800">
              Clear selection
            </button>
          </div>
        )}

        {/* Table */}
        {filteredTeachers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {teachers.length === 0 ? 'No teachers found. Add approved emails first.' : 'No teachers match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  {/* Checkbox */}
                  <th className="w-8 px-2 py-2 bg-gray-50">
                    <input
                      type="checkbox" checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="w-6 px-1 py-2 bg-gray-50"></th>
                  <SortHeader column="name">Name</SortHeader>
                  <SortHeader column="school">School</SortHeader>
                  <SortHeader column="stage">Stage</SortHeader>
                  <SortHeader column="days" center>Days</SortHeader>
                  <SortHeader column="lastActive">Last Active</SortHeader>
                  <th className="px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left bg-gray-50 whitespace-nowrap">Emails Sent</th>
                  {unitFilter === 'all' ? (
                    <SortHeader column="units" center>Units</SortHeader>
                  ) : (
                    <>
                      <SortHeader column="l1" center>L1</SortHeader>
                      <SortHeader column="l2" center>L2</SortHeader>
                      <SortHeader column="l3" center>L3</SortHeader>
                      <SortHeader column="l4" center>L4</SortHeader>
                      <SortHeader column="l5" center>L5</SortHeader>
                    </>
                  )}
                  <SortHeader column="students" center>Students</SortHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((teacher) => {
                  const isExpanded = expandedTeachers[teacher.email];
                  const isSelected = selectedEmails.has(teacher.email);
                  const daysApproved = daysSince(teacher.approvedAt);
                  const hasSessions = teacher.totalSessions > 0;
                  const hasEmails = Object.keys(teacher.emailHistory).length > 0;
                  const canExpand = hasSessions || hasEmails;

                  return (
                    <React.Fragment key={teacher.email}>
                      <tr
                        className={`hover:bg-gray-50 ${canExpand ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          if (canExpand) setExpandedTeachers(prev => ({ ...prev, [teacher.email]: !prev[teacher.email] }));
                        }}
                      >
                        {/* Checkbox */}
                        <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox" checked={isSelected}
                            onChange={() => toggleSelect(teacher.email)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        {/* Expand arrow */}
                        <td className="px-1 py-2 text-center">
                          {canExpand ? (
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          ) : (
                            <span className="text-gray-200">-</span>
                          )}
                        </td>
                        {/* Name */}
                        <td className="px-2 py-2 max-w-[160px]">
                          {teacher.teacherName ? (
                            <>
                              <div className="font-medium text-gray-800 text-sm truncate">
                                {teacher.teacherName}
                                {duplicateNames[teacher.email] && (
                                  <span
                                    className="ml-1 inline-block px-1 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-600 rounded cursor-help"
                                    title={`Same name as: ${duplicateNames[teacher.email].join(', ')}`}
                                  >Dup?</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 truncate">{teacher.email}</div>
                              {teacher.personalEmail && (
                                <div className="text-[10px] text-orange-500 truncate" title={teacher.personalEmail}>↳ {teacher.personalEmail}</div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-gray-800 text-sm">{teacher.email.split('@')[0]}</div>
                              <div className="text-xs text-gray-400">@{teacher.email.split('@')[1]}</div>
                              {teacher.personalEmail && (
                                <div className="text-[10px] text-orange-500 truncate" title={teacher.personalEmail}>↳ {teacher.personalEmail}</div>
                              )}
                            </>
                          )}
                        </td>
                        {/* School */}
                        <td className="px-2 py-2 text-sm text-gray-600 max-w-[120px] truncate">
                          {teacher.school || <span className="text-gray-300">--</span>}
                        </td>
                        {/* Stage badge */}
                        <td className="px-2 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STAGE_COLORS[teacher.stage] || 'bg-gray-100 text-gray-600'}`}>
                            {teacher.stage}
                          </span>
                        </td>
                        {/* Days since approved */}
                        <td className="px-2 py-2 text-center text-sm text-gray-600">
                          {daysApproved !== '' ? daysApproved : '--'}
                        </td>
                        {/* Last active */}
                        <td className="px-2 py-2 text-sm text-gray-600 whitespace-nowrap">
                          {teacher.lastActive ? new Date(teacher.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : <span className="text-gray-300">Never</span>}
                        </td>
                        {/* Emails Sent */}
                        <td className="px-2 py-2 max-w-[160px]">
                          {(() => {
                            const entries = Object.entries(teacher.emailHistory)
                              .sort((a, b) => (a[1].sentAt || 0) - (b[1].sentAt || 0));
                            const count = entries.length;
                            if (count === 0) return <span className="text-gray-300 text-xs">--</span>;
                            const latest = entries[count - 1];
                            const latestName = EMAIL_NAMES[latest[0]] || latest[1].subject || latest[0];
                            const latestDate = latest[1].sentAt ? new Date(latest[1].sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                            return (
                              <div className="text-xs">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                  <Mail size={10} /> {count}
                                </span>
                                <div className="text-gray-500 mt-0.5 whitespace-nowrap truncate" title={`${latestName} ${latestDate}`}>
                                  {latestName} {latestDate && <span className="text-gray-400">{latestDate}</span>}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        {/* Units / L1-L5 */}
                        {unitFilter === 'all' ? (
                          <td className="px-2 py-2 text-center">
                            {teacher.unitsStarted === 0 ? (
                              <span className="text-gray-300">--</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                {UNIT_IDS.map(uid => {
                                  const up = teacher.unitProgress[uid];
                                  if (!up || up.lessonsStarted === 0) return null;
                                  const complete = up.lessonsDone === 5;
                                  const unitDef = UNITS[uid];
                                  return (
                                    <span
                                      key={uid}
                                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                                        complete ? unitDef.badgeComplete : unitDef.badgePartial
                                      }`}
                                      title={`${unitDef.label}: ${up.lessonsDone}/5 lessons`}
                                    >
                                      {unitDef.short}
                                      <span className="text-[10px]">{up.lessonsDone}/5</span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        ) : (
                          <>
                            {[1, 2, 3, 4, 5].map(n => {
                              const lessons = teacher.units[unitFilter]?.[n] || [];
                              const done = teacher.unitProgress[unitFilter]?.done[n - 1] || false;
                              return <LessonCell key={n} sessions={lessons} isCompleted={done} />;
                            })}
                          </>
                        )}
                        {/* Students */}
                        <td className="px-2 py-2 text-center font-medium text-gray-800">
                          {teacher.totalStudents || <span className="text-gray-300">--</span>}
                        </td>
                      </tr>

                      {/* Expanded details */}
                      {isExpanded && canExpand && (
                        <tr className="bg-gray-50">
                          <td colSpan={unitFilter === 'all' ? 10 : 14} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Personal Email */}
                              {teacher.personalEmail && (
                                <div className="bg-white rounded-lg p-4 border border-orange-200">
                                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                                    <Mail size={14} className="text-orange-500" /> Personal Email
                                  </h4>
                                  <a href={`mailto:${teacher.personalEmail}`} className="text-sm text-blue-600 hover:underline">{teacher.personalEmail}</a>
                                </div>
                              )}
                              {/* Email History Card */}
                              {hasEmails && (
                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                                    <Mail size={14} className="text-blue-600" /> Emails Sent
                                  </h4>
                                  <div className="space-y-1.5 text-sm">
                                    {Object.entries(teacher.emailHistory)
                                      .sort((a, b) => (a[1].sentAt || 0) - (b[1].sentAt || 0))
                                      .map(([type, data]) => (
                                        <div key={type} className="flex items-center justify-between">
                                          <span className="text-gray-700">{EMAIL_NAMES[type] || data.subject || type}</span>
                                          <span className="text-gray-500 text-xs">
                                            {data.sentAt ? new Date(data.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                              {hasSessions && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div>Total Sessions: <span className="font-medium">{teacher.totalSessions}</span></div>
                                    <div>Total Students: <span className="font-medium">{teacher.totalStudents}</span></div>
                                    <div>Units Started: <span className="font-medium">{teacher.unitsStarted}</span></div>
                                    <div>Units Complete: <span className="font-medium">{teacher.unitsComplete}</span></div>
                                    <div>Last Active: <span className="font-medium">
                                      {teacher.lastActive ? new Date(teacher.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                                    </span></div>
                                  </div>
                                </div>
                              )}
                              {/* Per-unit lesson breakdown */}
                              {UNIT_IDS.map(uid => {
                                const unitLessons = teacher.units[uid];
                                if (!unitLessons) return null;
                                const up = teacher.unitProgress[uid];
                                if (!up || up.lessonsStarted === 0) return null;
                                const unitDef = UNITS[uid];
                                const lessonNames = uid === 'film-music-project'
                                  ? { 1: 'Mood', 2: 'Instrumentation', 3: 'Texture', 4: 'Form', 5: 'Capstone' }
                                  : { 1: 'Lesson 1', 2: 'Lesson 2', 3: 'Lesson 3', 4: 'Lesson 4', 5: 'Lesson 5' };
                                return (
                                  <div key={uid} className={`bg-white rounded-lg p-4 border ${unitDef.border} col-span-1 md:col-span-2 lg:col-span-3`}>
                                    <h4 className={`font-medium mb-3 ${unitDef.heading}`}>
                                      {unitDef.label}
                                      <span className="ml-2 text-xs font-normal text-gray-500">{up.lessonsDone}/5 lessons complete</span>
                                    </h4>
                                    <div className="grid grid-cols-5 gap-2">
                                      {[1, 2, 3, 4, 5].map(lessonNum => {
                                        const sessions = unitLessons[lessonNum];
                                        const done = up.done[lessonNum - 1];
                                        const started = up.started[lessonNum - 1];
                                        const totalStudents = sessions.reduce((sum, s) => sum + s.students, 0);
                                        return (
                                          <div key={lessonNum} className={`rounded-lg p-2 text-xs border ${done ? 'bg-green-50 border-green-200' : started ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                                            <div className="font-medium text-gray-700 mb-1">L{lessonNum}: {lessonNames[lessonNum]}</div>
                                            {sessions.length > 0 ? (
                                              <div className="text-gray-500">
                                                {sessions.length} session{sessions.length > 1 ? 's' : ''}
                                                <div className="mt-1 space-y-0.5">
                                                  {sessions.sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 3).map((s, i) => (
                                                    <div key={i} className="flex justify-between">
                                                      <span>{s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '?'}</span>
                                                      <span className={s.activeTimeMins >= MIN_ACTIVE_MINUTES && s.stageCount >= MIN_STAGES ? 'text-green-600' : 'text-yellow-600'}>
                                                        {s.activeTimeMins >= MIN_ACTIVE_MINUTES && s.stageCount >= MIN_STAGES ? '✓' : 'test'}
                                                      </span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ) : (
                                              <span className="text-gray-300">Not started</span>
                                            )}
                                          </div>
                                        );
                                      })}
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
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">✓x3</span>
                <span>= Taught (10+ min, 3+ stages)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">testx2</span>
                <span>= Test run only</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-300">--</span>
                <span>= Not started</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mark Sent Modal */}
      {showMarkSentModal && (
        <MarkSentModal
          teachers={selectedTeachers}
          onClose={() => setShowMarkSentModal(false)}
          onDone={(count, label) => { setShowMarkSentModal(false); showToast(`Marked ${label} as sent for ${count} teachers`); setSelectedEmails(new Set()); }}
        />
      )}

      {/* Duplicates Modal */}
      {showDuplicates && (
        <DuplicatesModal
          pairs={duplicatePairs}
          onRemove={async (email) => {
            const ok = await removeTeacherCompletely(email, true);
            if (ok) showToast(`Removed ${email}`);
            return ok;
          }}
          onMerge={async (keepEmail, removeEmail) => {
            const ok = await mergeTeacherEntries(keepEmail, removeEmail);
            if (ok) showToast(`Merged ${removeEmail} → ${keepEmail}`);
            return ok;
          }}
          onClose={() => setShowDuplicates(false)}
          onBulkDone={(count) => { setShowDuplicates(false); showToast(`Removed ${count} duplicate(s)`); }}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <BatchEmailModal
          teachers={selectedTeachers}
          teacherOutreach={teacherOutreach}
          applicationsByEmail={applicationsByEmail}
          onClose={() => setShowEmailModal(false)}
          onSuccess={(msg) => { setShowEmailModal(false); setSuccess(msg); setSelectedEmails(new Set()); }}
        />
      )}
    </div>
  );
};

// --- Mark Sent Modal ---

const MarkSentModal = ({ teachers, onClose, onDone }) => {
  const [emailType, setEmailType] = useState('drip-2');
  const [marking, setMarking] = useState(false);

  const EMAIL_OPTIONS = [
    { value: 'drip-1', label: 'Welcome Email' },
    { value: 'drip-2', label: '7-Day Follow-up' },
    { value: 'drip-3', label: 'Final Reminder' },
    { value: 'survey-l3', label: 'Mid-Pilot Survey' },
    { value: 'survey-l5', label: 'Final Survey' },
  ];

  const handleMark = async () => {
    if (!confirm(`Mark "${EMAIL_OPTIONS.find(o => o.value === emailType)?.label}" as sent for ${teachers.length} teacher(s)?`)) return;
    setMarking(true);
    const db = getDatabase();
    const now = Date.now();
    let count = 0;
    // Use Promise.all in batches of 20 for reliability
    const batch = [];
    for (const t of teachers) {
      const emailKey = t.email.toLowerCase().replace(/\./g, ',');
      batch.push(
        set(ref(db, `emailsSent/${emailKey}/${emailType}`), {
          sentAt: now,
          subject: EMAIL_OPTIONS.find(o => o.value === emailType)?.label || emailType,
          type: emailType,
        }).then(() => { count++; }).catch(e => console.warn('Failed:', t.email, e.message))
      );
      // Flush in batches of 20
      if (batch.length >= 20) {
        await Promise.all(batch.splice(0));
      }
    }
    if (batch.length > 0) await Promise.all(batch);
    setMarking(false);
    onDone(count, EMAIL_OPTIONS.find(o => o.value === emailType)?.label);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Mark Email as Sent</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-gray-600">
            Stamp tracking for <strong>{teachers.length}</strong> teacher{teachers.length !== 1 ? 's' : ''} without re-sending the email.
            Use this if emails were sent but tracking wasn't recorded.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Type</label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {EMAIL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" disabled={marking}>
              Cancel
            </button>
            <button
              onClick={handleMark}
              disabled={marking}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {marking ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Mark {teachers.length} as Sent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Duplicates Modal ---

const DISMISSED_DUPS_KEY = 'dismissedDuplicatePairs';
const getDismissedPairs = () => {
  try { return JSON.parse(localStorage.getItem(DISMISSED_DUPS_KEY) || '[]'); } catch { return []; }
};

const DuplicatesModal = ({ pairs, onRemove, onMerge, onClose, onBulkDone }) => {
  const [removed, setRemoved] = useState(new Set());
  const [dismissed, setDismissed] = useState(() => new Set(getDismissedPairs()));
  const [removing, setRemoving] = useState(null);
  const [merging, setMerging] = useState(null);
  const [bulkRemoving, setBulkRemoving] = useState(false);

  const handleRemoveOne = async (email) => {
    setRemoving(email);
    const ok = await onRemove(email);
    if (ok) setRemoved(prev => new Set([...prev, email]));
    setRemoving(null);
  };

  const handleMergeOne = async (keepEmail, removeEmail) => {
    setMerging(removeEmail);
    const ok = await onMerge(keepEmail, removeEmail);
    if (ok) setRemoved(prev => new Set([...prev, removeEmail]));
    setMerging(null);
  };

  const handleKeepBoth = (keep, rem) => {
    const key = [keep.email, rem.email].sort().join('|');
    setDismissed(prev => {
      const next = new Set([...prev, key]);
      localStorage.setItem(DISMISSED_DUPS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const isPairDismissed = (keep, rem) => {
    const key = [keep.email, rem.email].sort().join('|');
    return dismissed.has(key);
  };

  const handleRemoveAll = async () => {
    const toRemove = activePairs
      .filter(p => isPersonalEmail(p.remove.email) && !removed.has(p.remove.email))
      .map(p => p.remove.email);
    if (toRemove.length === 0) return;
    if (!confirm(`Remove ${toRemove.length} personal email duplicate(s)? This keeps the school email for each teacher.`)) return;
    setBulkRemoving(true);
    let count = 0;
    for (const email of toRemove) {
      const ok = await onRemove(email);
      if (ok) { count++; setRemoved(prev => new Set([...prev, email])); }
    }
    setBulkRemoving(false);
    onBulkDone(count);
  };

  const activePairs = pairs.filter(p => !removed.has(p.remove.email) && !removed.has(p.keep.email) && !isPairDismissed(p.keep, p.remove));
  const personalDups = activePairs.filter(p => isPersonalEmail(p.remove.email));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Link2 size={20} />
              Duplicate Teachers ({activePairs.length} pairs)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Same person with multiple email addresses. Merge to keep both emails on one entry, or remove the duplicate.
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Bulk action */}
        {personalDups.length > 0 && (
          <div className="px-6 py-3 bg-orange-50 border-b border-orange-200 flex items-center justify-between shrink-0">
            <span className="text-sm text-orange-800">
              <strong>{personalDups.length}</strong> personal email{personalDups.length !== 1 ? 's' : ''} can be merged (links personal email to school email)
            </span>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const toMerge = personalDups.filter(p => !removed.has(p.remove.email));
                  if (toMerge.length === 0) return;
                  if (!confirm(`Merge ${toMerge.length} duplicate(s)? Each personal email will be linked to its school email.`)) return;
                  setBulkRemoving(true);
                  let count = 0;
                  for (const { keep, remove: rem } of toMerge) {
                    const ok = await onMerge(keep.email, rem.email);
                    if (ok) { count++; setRemoved(prev => new Set([...prev, rem.email])); }
                  }
                  setBulkRemoving(false);
                  onBulkDone(count);
                }}
                disabled={bulkRemoving}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {bulkRemoving ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                Merge All
              </button>
              <button
                onClick={handleRemoveAll}
                disabled={bulkRemoving}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50 font-medium"
              >
                {bulkRemoving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Remove All
              </button>
            </div>
          </div>
        )}

        {/* Pairs list */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {activePairs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No duplicates remaining!</div>
          ) : (
            <div className="space-y-3">
              {activePairs.map(({ keep, remove: rem, matchType }, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Keep */}
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Keep</span>
                        <span className="font-medium text-gray-800">{keep.teacherName || keep.email.split('@')[0]}</span>
                        <span className="text-sm text-gray-500">{keep.email}</span>
                        {keep.school && <span className="text-xs text-gray-400">({keep.school})</span>}
                        {!isPersonalEmail(keep.email) && <span className="text-[10px] text-blue-600 font-medium">School</span>}
                      </div>
                      {/* Remove */}
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Remove</span>
                        <span className="text-gray-600">{rem.teacherName || rem.email.split('@')[0]}</span>
                        <span className="text-sm text-gray-500">{rem.email}</span>
                        {isPersonalEmail(rem.email) && <span className="text-[10px] text-orange-600 font-medium">Personal</span>}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1.5">
                      <button
                        onClick={() => handleMergeOne(keep.email, rem.email)}
                        disabled={merging === rem.email}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 disabled:opacity-50"
                      >
                        {merging === rem.email ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                        Merge
                      </button>
                      <button
                        onClick={() => handleRemoveOne(rem.email)}
                        disabled={removing === rem.email}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        {removing === rem.email ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Remove
                      </button>
                      <button
                        onClick={() => handleKeepBoth(keep, rem)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100"
                      >
                        <Check size={12} />
                        Keep Both
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    Matched by {matchType === 'name' ? 'same name' : 'similar email prefix'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Batch Email Modal ---

const BatchEmailModal = ({ teachers, teacherOutreach, applicationsByEmail, onClose, onSuccess }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [mode, setMode] = useState('write'); // 'write' = plain text, 'html' = raw HTML
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [alsoSendPersonal, setAlsoSendPersonal] = useState(false);
  const iframeRef = useRef(null);

  const teachersWithPersonal = teachers.filter(t => t.personalEmail);
  const personalCount = teachersWithPersonal.length;

  // Convert plain text to styled HTML email
  const plainTextToHtml = (text) => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const paragraphs = escaped.split(/\n\n+/).map(p =>
      `<p style="margin: 0 0 16px 0; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`
    ).join('');
    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">${paragraphs}</div>`;
  };

  // Load templates
  React.useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch('/api/email/templates');
        if (res.ok) {
          const data = await res.json();
          setTemplates(Array.isArray(data) ? data : data.templates || []);
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
      }
      setLoadingTemplates(false);
    };
    loadTemplates();
  }, []);

  const handleTemplateChange = (templateType) => {
    setSelectedTemplate(templateType);
    if (templateType) {
      const tmpl = templates.find(t => t.type === templateType);
      if (tmpl) {
        setSubject(tmpl.subject || '');
        setBody(tmpl.htmlContent || '');
        setMode('html'); // templates are HTML
      }
    } else {
      // Cleared template — back to plain text
      setBody('');
      setSubject('');
      setMode('write');
    }
  };

  const getFirstName = (teacher) => {
    const emailKey = teacher.email.toLowerCase().replace(/\./g, ',');
    const outreach = teacherOutreach[emailKey] || {};
    const app = applicationsByEmail[teacher.email.toLowerCase()];
    if (teacher.teacherName) return teacher.teacherName.split(' ')[0];
    if (outreach.name) return outreach.name.split(' ')[0];
    if (app?.firstName) return app.firstName;
    return 'there';
  };

  const handlePreview = () => {
    setShowPreview(true);
    setTimeout(() => {
      if (iframeRef.current) {
        const sampleFirstName = teachers.length > 0 ? getFirstName(teachers[0]) : 'there';
        const htmlContent = mode === 'write' ? plainTextToHtml(body) : body;
        const previewHtml = htmlContent.replace(/\{\{firstName\}\}/g, sampleFirstName);
        const doc = iframeRef.current.contentDocument;
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><base target="_blank"></head><body style="margin:0;padding:16px;background:#f3f4f6;">${previewHtml}</body></html>`);
        doc.close();
      }
    }, 100);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    const personalNote = alsoSendPersonal && personalCount > 0 ? ` + ${personalCount} personal emails` : '';
    if (!confirm(`Send email to ${teachers.length} teacher(s)${personalNote}?`)) return;

    setSending(true);
    const totalToSend = teachers.length + (alsoSendPersonal ? personalCount : 0);
    setProgress({ sent: 0, failed: 0, total: totalToSend });

    try {
      // Build recipients: school emails first
      const recipients = teachers.map(t => ({
        email: t.email,
        firstName: getFirstName(t),
      }));

      // Add personal emails if checked
      if (alsoSendPersonal) {
        teachersWithPersonal.forEach(t => {
          recipients.push({
            email: t.personalEmail,
            firstName: getFirstName(t),
          });
        });
      }

      const htmlBody = mode === 'write' ? plainTextToHtml(body) : body;

      const res = await fetch('/api/email/batch-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          customSubject: subject,
          customHtml: htmlBody,
          templateType: selectedTemplate || undefined,
        }),
      });

      const result = await res.json();
      setProgress({ sent: result.sent || 0, failed: result.failed || 0, total: totalToSend });

      // Track sent emails in Firebase BEFORE showing done (so closing modal doesn't kill tracking)
      if (result.sent > 0) {
        const db = getDatabase();
        const now = Date.now();
        const emailType = selectedTemplate || 'custom';
        const trackLabel = selectedTemplate || `custom-${now}`;
        // Write in parallel batches of 20 for speed + reliability
        const batch = [];
        for (const t of teachers) {
          const emailKey = t.email.toLowerCase().replace(/\./g, ',');
          batch.push(
            set(ref(db, `emailsSent/${emailKey}/${trackLabel}`), {
              sentAt: now,
              subject: subject,
              type: emailType,
            }).then(() => console.log('✅ Tracked email for', t.email))
              .catch(e => console.error('❌ Failed to track email for', t.email, e.message, e))
          );
          if (batch.length >= 20) {
            await Promise.all(batch.splice(0));
          }
        }
        if (batch.length > 0) await Promise.all(batch);
      }

      setDone(true);
    } catch (err) {
      console.error('Batch send failed:', err);
      setProgress(prev => ({ ...prev, failed: prev.total }));
      setDone(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Mail size={20} />
            Send Email to {teachers.length} Teacher{teachers.length !== 1 ? 's' : ''}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {done ? (
            // Results
            <div className="text-center py-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${progress.failed === 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {progress.failed === 0 ? <CheckCircle size={32} className="text-green-600" /> : <AlertCircle size={32} className="text-yellow-600" />}
              </div>
              <div className="text-lg font-medium text-gray-800 mb-2">
                {progress.sent} sent{progress.failed > 0 ? `, ${progress.failed} failed` : ''}
              </div>
              <button
                onClick={() => onSuccess(`Sent ${progress.sent} email(s)`)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Template picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  disabled={loadingTemplates}
                >
                  <option value="">{loadingTemplates ? 'Loading templates...' : 'Select a template (or write custom)'}</option>
                  {templates.map(t => (
                    <option key={t.type} value={t.type}>{EMAIL_NAMES[t.type] || t.type}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    {mode === 'write' ? 'Message' : 'HTML Body'}{' '}
                    <span className="font-normal text-gray-400">(use {'{{firstName}}'} for personalization)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'write' ? 'html' : 'write')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {mode === 'write' ? 'Switch to HTML' : 'Switch to Plain Text'}
                  </button>
                </div>
                <textarea
                  value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder={mode === 'write'
                    ? "Hi {{firstName}},\n\nJust wanted to check in..."
                    : "<p>Hi {{firstName}},</p>..."}
                  rows={10}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${mode === 'html' ? 'font-mono text-xs' : ''}`}
                />
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium">PREVIEW</div>
                  <iframe ref={iframeRef} className="w-full h-64 bg-white" title="Email Preview" />
                </div>
              )}

              {/* Sending progress */}
              {sending && !done && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 size={16} className="animate-spin" />
                    Sending emails...
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* Also send to personal email */}
              {personalCount > 0 && (
                <label className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoSendPersonal}
                    onChange={(e) => setAlsoSendPersonal(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    Also send to personal email <span className="text-orange-600 font-medium">({personalCount} of {teachers.length} have one)</span>
                  </span>
                </label>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  disabled={sending}
                >
                  <Eye size={14} /> Preview
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800" disabled={sending}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || !subject.trim() || !body.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    Send to {teachers.length}{alsoSendPersonal && personalCount > 0 ? ` + ${personalCount} personal` : ''} email{teachers.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsPage;
