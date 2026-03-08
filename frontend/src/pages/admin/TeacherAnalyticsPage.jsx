import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  BarChart3, Search, Filter, ChevronDown, Check, Copy, Download,
  Mail, X, Eye, Loader2, CheckCircle, AlertCircle, Users, UserX,
  GraduationCap, Clock, ClipboardList
} from 'lucide-react';
import { useAdminData } from './AdminDataContext';
import { getDatabase, ref, set } from 'firebase/database';

const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];

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
    toggleOutreach, setSuccess, formatDuration, formatDate
  } = useAdminData();

  const [analyticsSort, setAnalyticsSort] = useState({ column: 'stage', direction: 'desc' });
  const [stageFilter, setStageFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [expandedTeachers, setExpandedTeachers] = useState({});
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [funnelFilter, setFunnelFilter] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Build session data by teacher email
  const sessionsByTeacher = useMemo(() => {
    const map = {};
    pilotSessions.forEach(session => {
      const email = session.teacherEmail?.toLowerCase();
      if (!email) return;
      let lessonNum = null;
      if (session.lessonRoute?.includes('lesson1')) lessonNum = 1;
      else if (session.lessonRoute?.includes('lesson2')) lessonNum = 2;
      else if (session.lessonRoute?.includes('lesson3')) lessonNum = 3;
      else if (session.lessonRoute?.includes('lesson4')) lessonNum = 4;
      else if (session.lessonRoute?.includes('lesson5')) lessonNum = 5;
      if (!lessonNum) return;

      if (!map[email]) map[email] = { lessons: { 1: [], 2: [], 3: [], 4: [], 5: [] }, totalStudents: 0, totalSessions: 0, lastSessionTime: 0 };

      const stageTimes = session.stageTimes || {};
      const activeTimeMs = Object.values(stageTimes).reduce((sum, t) => sum + (t || 0), 0);
      const activeTimeMins = Math.round(activeTimeMs / 60000);
      const stageCount = Object.keys(stageTimes).length;

      map[email].lessons[lessonNum].push({
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

      // Determine stage
      let stage = 'Not Logged In';
      let l1Done = false, l2Done = false, l3Done = false, l4Done = false, l5Done = false;

      if (reg || sessions) {
        stage = 'Registered';
        if (sessions) {
          l1Done = isLessonCompleted(sessions.lessons[1]);
          l2Done = isLessonCompleted(sessions.lessons[2]);
          l3Done = isLessonCompleted(sessions.lessons[3]);
          l4Done = isLessonCompleted(sessions.lessons[4]);
          l5Done = isLessonCompleted(sessions.lessons[5]);

          if (l5Done) stage = 'Completed';
          else if (l4Done) stage = 'L4';
          else if (l3Done) stage = 'L3';
          else if (l2Done) stage = 'L2';
          else if (l1Done) stage = 'L1';
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

      result.push({
        email, teacherName, school, stage,
        l1Done, l2Done, l3Done, l4Done, l5Done,
        lessons: sessions?.lessons || { 1: [], 2: [], 3: [], 4: [], 5: [] },
        totalStudents: sessions?.totalStudents || 0,
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
  }, [academyEmails, registeredByEmail, sessionsByTeacher, teacherOutreach, applicationsByEmail, midPilotSurveys, finalPilotSurveys, pilotSessions, emailHistoryByTeacher]);

  // Detect duplicate names (different emails, same name)
  const duplicateNames = useMemo(() => {
    const byName = {};
    teachers.forEach(t => {
      const name = t.teacherName?.toLowerCase().trim();
      if (!name) return;
      if (!byName[name]) byName[name] = [];
      byName[name].push(t.email);
    });
    const flagged = {};
    Object.values(byName).forEach(emails => {
      if (emails.length < 2) return;
      const uniqueEmails = [...new Set(emails)];
      if (uniqueEmails.length < 2) return;
      uniqueEmails.forEach(email => {
        flagged[email] = uniqueEmails.filter(e => e !== email);
      });
    });
    return flagged;
  }, [teachers]);

  // Funnel counts
  const funnelCounts = useMemo(() => {
    const now = Date.now();
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    let notLoggedIn = 0, registered = 0, teaching = 0, stalled = 0, surveyDue = 0;

    teachers.forEach(t => {
      if (t.stage === 'Not Logged In') notLoggedIn++;
      else if (t.stage === 'Registered') registered++;

      if (STAGE_ORDER[t.stage] >= STAGE_ORDER['L1']) teaching++;

      // Stalled: has any activity but none in 14 days
      if (t.lastActive > 0 && (now - t.lastActive) > fourteenDays) stalled++;

      // Survey due: L3+ but no mid-pilot survey
      if (STAGE_ORDER[t.stage] >= STAGE_ORDER['L3'] && !t.hasL3Survey && !t.manualL3Survey) surveyDue++;
    });

    return { notLoggedIn, registered, teaching, stalled, surveyDue };
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

    // Funnel filter overrides
    if (funnelFilter === 'notLoggedIn') list = list.filter(t => t.stage === 'Not Logged In');
    else if (funnelFilter === 'registered') list = list.filter(t => t.stage === 'Registered');
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
  }, [teachers, analyticsSearch, stageFilter, activityFilter, funnelFilter, analyticsSort]);

  const getLessonScore = (teacher, lessonNum) => {
    if (teacher[`l${lessonNum}Done`]) return 2;
    if (teacher.lessons[lessonNum] && teacher.lessons[lessonNum].length > 0) return 1;
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

      {/* Funnel Cards */}
      <div className="flex flex-wrap gap-3">
        <FunnelCard label="Not Logged In" count={funnelCounts.notLoggedIn} colorClass="bg-red-50 text-red-800" filterKey="notLoggedIn" icon={UserX} />
        <FunnelCard label="Registered" count={funnelCounts.registered} colorClass="bg-yellow-50 text-yellow-800" filterKey="registered" icon={Users} />
        <FunnelCard label="Teaching (L1+)" count={funnelCounts.teaching} colorClass="bg-green-50 text-green-800" filterKey="teaching" icon={GraduationCap} />
        <FunnelCard label="Stalled 14+ days" count={funnelCounts.stalled} colorClass="bg-red-50 text-red-700" filterKey="stalled" icon={Clock} />
        <FunnelCard label="Survey Due" count={funnelCounts.surveyDue} colorClass="bg-purple-50 text-purple-800" filterKey="surveyDue" icon={ClipboardList} />
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
                {(stageFilter !== 'all' || activityFilter !== 'all' || funnelFilter) && ' (filtered)'}
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
              {/* Clear filters */}
              {(stageFilter !== 'all' || activityFilter !== 'all' || funnelFilter || analyticsSearch) && (
                <button
                  onClick={() => { setStageFilter('all'); setActivityFilter('all'); setFunnelFilter(null); setAnalyticsSearch(''); }}
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
                  <SortHeader column="l1" center>L1</SortHeader>
                  <SortHeader column="l2" center>L2</SortHeader>
                  <SortHeader column="l3" center>L3</SortHeader>
                  <SortHeader column="l4" center>L4</SortHeader>
                  <SortHeader column="l5" center>L5</SortHeader>
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
                        <td className="px-2 py-2 max-w-[240px]">
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
                            </>
                          ) : (
                            <>
                              <div className="font-medium text-gray-800 text-sm">{teacher.email.split('@')[0]}</div>
                              <div className="text-xs text-gray-400">@{teacher.email.split('@')[1]}</div>
                            </>
                          )}
                        </td>
                        {/* School */}
                        <td className="px-2 py-2 text-sm text-gray-600 max-w-[160px] truncate">
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
                        <td className="px-2 py-2 max-w-[220px]">
                          {Object.keys(teacher.emailHistory).length > 0 ? (
                            <div className="space-y-0.5">
                              {Object.entries(teacher.emailHistory)
                                .sort((a, b) => (a[1].sentAt || 0) - (b[1].sentAt || 0))
                                .map(([type, data]) => {
                                  const names = {
                                    'drip-1': 'Welcome Email',
                                    'drip-2': '7-Day Follow-up',
                                    'drip-3': 'Final Reminder',
                                    'survey-l3': 'Mid-Pilot Survey',
                                    'survey-l5': 'Final Survey',
                                  };
                                  const name = names[type] || data.subject || type;
                                  const date = data.sentAt ? new Date(data.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                                  return (
                                    <div key={type} className="text-xs text-gray-600 whitespace-nowrap">
                                      <span className="font-medium text-gray-700">{name}</span>
                                      {date && <span className="text-gray-400 ml-1">{date}</span>}
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs">--</span>
                          )}
                        </td>
                        {/* L1-L5 */}
                        <LessonCell sessions={teacher.lessons[1]} isCompleted={teacher.l1Done} />
                        <LessonCell sessions={teacher.lessons[2]} isCompleted={teacher.l2Done} />
                        <LessonCell sessions={teacher.lessons[3]} isCompleted={teacher.l3Done} />
                        <LessonCell sessions={teacher.lessons[4]} isCompleted={teacher.l4Done} />
                        <LessonCell sessions={teacher.lessons[5]} isCompleted={teacher.l5Done} />
                        {/* Students */}
                        <td className="px-2 py-2 text-center font-medium text-gray-800">
                          {teacher.totalStudents || <span className="text-gray-300">--</span>}
                        </td>
                      </tr>

                      {/* Expanded details */}
                      {isExpanded && canExpand && (
                        <tr className="bg-gray-50">
                          <td colSpan={14} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Email History Card */}
                              {hasEmails && (
                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-1.5">
                                    <Mail size={14} className="text-blue-600" /> Emails Sent
                                  </h4>
                                  <div className="space-y-1.5 text-sm">
                                    {Object.entries(teacher.emailHistory)
                                      .sort((a, b) => (a[1].sentAt || 0) - (b[1].sentAt || 0))
                                      .map(([type, data]) => {
                                        const labels = {
                                          'drip-1': 'Welcome Email',
                                          'drip-2': '7-Day Follow-up',
                                          'drip-3': 'Final Reminder',
                                          'survey-l3': 'Mid-Pilot Survey',
                                          'survey-l5': 'Final Survey',
                                        };
                                        return (
                                          <div key={type} className="flex items-center justify-between">
                                            <span className="text-gray-700">{labels[type] || type}</span>
                                            <span className="text-gray-500 text-xs">
                                              {data.sentAt ? new Date(data.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                                            </span>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                              {hasSessions && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <div>Total Sessions: <span className="font-medium">{teacher.totalSessions}</span></div>
                                    <div>Total Students: <span className="font-medium">{teacher.totalStudents}</span></div>
                                    <div>Last Active: <span className="font-medium">
                                      {teacher.lastActive ? new Date(teacher.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                                    </span></div>
                                  </div>
                                </div>
                              )}
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
                                        {sessions.length} session{sessions.length > 1 ? 's' : ''} | {totalStudents} students | {formatDuration(totalTime)}
                                      </span>
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {sessions.sort((a, b) => (b.date || 0) - (a.date || 0)).map((session, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                          <span className="text-gray-600">
                                            {session.date ? new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'}
                                          </span>
                                          <span className="text-gray-500">
                                            {session.students} stu | {session.activeTimeMins}min | {session.stageCount} stages
                                          </span>
                                          <span className={session.activeTimeMins >= MIN_ACTIVE_MINUTES && session.stageCount >= MIN_STAGES ? 'text-green-600' : 'text-yellow-600'}>
                                            {session.activeTimeMins >= MIN_ACTIVE_MINUTES && session.stageCount >= MIN_STAGES ? '✓' : 'test'}
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
  const iframeRef = useRef(null);

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
    if (!confirm(`Send email to ${teachers.length} teacher(s)?`)) return;

    setSending(true);
    setProgress({ sent: 0, failed: 0, total: teachers.length });

    try {
      const recipients = teachers.map(t => ({
        email: t.email,
        firstName: getFirstName(t),
      }));

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
      setProgress({ sent: result.sent || 0, failed: result.failed || 0, total: teachers.length });
      setDone(true);

      // Track sent emails in Firebase so they show in email history
      if (result.sent > 0) {
        const db = getDatabase();
        const now = Date.now();
        const emailType = selectedTemplate || 'custom';
        const trackLabel = selectedTemplate || `custom-${now}`;
        for (const t of teachers) {
          const emailKey = t.email.toLowerCase().replace(/\./g, ',');
          try {
            await set(ref(db, `emailsSent/${emailKey}/${trackLabel}`), {
              sentAt: now,
              subject: subject,
              type: emailType,
            });
          } catch (e) {
            console.warn('Failed to track email for', t.email, e.message);
          }
        }
      }
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
                    <option key={t.type} value={t.type}>{t.type}</option>
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
                    Send to {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
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
