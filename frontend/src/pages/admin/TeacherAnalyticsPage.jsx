import React, { useState } from 'react';
import { BarChart3, Search, Filter, ChevronDown, Check } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

const TeacherAnalyticsPage = () => {
  const {
    pilotSessions, registeredUsers, teacherOutreach,
    midPilotSurveys, finalPilotSurveys,
    toggleOutreach, setSuccess, formatDuration
  } = useAdminData();

  const [analyticsSort, setAnalyticsSort] = useState({ column: 'lastActive', direction: 'desc' });
  const [analyticsFilter, setAnalyticsFilter] = useState('all');
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [expandedTeachers, setExpandedTeachers] = useState({});

  const MIN_ACTIVE_MINUTES = 10;
  const MIN_STAGES = 3;

  // Build teacher lesson data from sessions
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
      teacherLessonData[email] = { email, lessons: { 1: [], 2: [], 3: [], 4: [], 5: [] }, totalStudents: 0, totalSessions: 0, lastActive: 0 };
    }

    const sessionStageTimes = session.stageTimes || {};
    const activeTimeMs = Object.values(sessionStageTimes).reduce((sum, t) => sum + (t || 0), 0);
    const activeTimeMins = Math.round(activeTimeMs / 60000);
    const stageCount = Object.keys(sessionStageTimes).length;

    teacherLessonData[email].lessons[lessonNum].push({
      sessionCode: session.sessionCode, date: session.startTime,
      students: session.studentsJoined || 0, duration: session.duration || 0,
      activeTimeMins, stageCount, completed: session.completed || false
    });

    teacherLessonData[email].totalStudents += session.studentsJoined || 0;
    teacherLessonData[email].totalSessions += 1;
    if (session.startTime > teacherLessonData[email].lastActive) {
      teacherLessonData[email].lastActive = session.startTime;
    }
  });

  const isLessonCompleted = (sessions) => {
    return sessions.some(s => s.activeTimeMins >= MIN_ACTIVE_MINUTES && s.stageCount >= MIN_STAGES);
  };

  const teachers = Object.values(teacherLessonData).map(teacher => {
    const emailKey = teacher.email.toLowerCase().replace(/\./g, ',');
    const outreach = teacherOutreach[emailKey] || {};

    const l1Done = isLessonCompleted(teacher.lessons[1]);
    const l2Done = isLessonCompleted(teacher.lessons[2]);
    const l3Done = isLessonCompleted(teacher.lessons[3]);
    const l4Done = isLessonCompleted(teacher.lessons[4]);
    const l5Done = isLessonCompleted(teacher.lessons[5]);

    let stage = 'Signed Up';
    if (l5Done) stage = 'Completed';
    else if (l4Done) stage = 'Reached L4';
    else if (l3Done) stage = 'Reached L3';
    else if (l2Done) stage = 'Reached L2';
    else if (l1Done) stage = 'Reached L1';
    else if (teacher.totalSessions > 0) stage = 'Test Only';

    const hasL3Survey = midPilotSurveys.some(s =>
      s.teacherEmail?.toLowerCase() === teacher.email.toLowerCase() ||
      pilotSessions.some(ps => ps.sessionCode === s.sessionCode && ps.teacherEmail?.toLowerCase() === teacher.email.toLowerCase())
    );
    const hasFinalSurvey = finalPilotSurveys.some(s =>
      s.teacherEmail?.toLowerCase() === teacher.email.toLowerCase() ||
      pilotSessions.some(ps => ps.sessionCode === s.sessionCode && ps.teacherEmail?.toLowerCase() === teacher.email.toLowerCase())
    );

    const registeredUser = registeredUsers.find(u => u.email?.toLowerCase() === teacher.email.toLowerCase());
    const teacherName = outreach.name || registeredUser?.displayName || '';

    return {
      ...teacher, teacherName, stage, l1Done, l2Done, l3Done, l4Done, l5Done,
      hasL3Survey, hasFinalSurvey,
      manualL3Survey: outreach.manualL3Survey || false,
      manualFinalSurvey: outreach.manualFinalSurvey || false,
      emailedL3: outreach.emailedL3 || false, emailedL3At: outreach.emailedL3At,
      emailedDone: outreach.emailedDone || false, emailedDoneAt: outreach.emailedDoneAt,
      teacherType: outreach.teacherType || 'pilot',
      pilotUnit: outreach.pilotUnit || '1'
    };
  });

  // Apply filters
  let filteredTeachers = teachers.filter(t => {
    const q = analyticsSearch.toLowerCase();
    return t.email.toLowerCase().includes(q) || (t.teacherName && t.teacherName.toLowerCase().includes(q));
  });

  if (analyticsFilter === 'pilotOnly') filteredTeachers = filteredTeachers.filter(t => t.teacherType === 'pilot');
  else if (analyticsFilter === 'purchasedOnly') filteredTeachers = filteredTeachers.filter(t => t.teacherType === 'purchased');
  else if (analyticsFilter === 'notEmailedL3') filteredTeachers = filteredTeachers.filter(t => t.l3Done && !t.emailedL3);
  else if (analyticsFilter === 'notEmailedDone') filteredTeachers = filteredTeachers.filter(t => t.l5Done && !t.emailedDone);
  else if (analyticsFilter === 'missingL3Survey') filteredTeachers = filteredTeachers.filter(t => t.l3Done && !t.hasL3Survey && !t.manualL3Survey);
  else if (analyticsFilter === 'missingFinalSurvey') filteredTeachers = filteredTeachers.filter(t => t.l5Done && !t.hasFinalSurvey && !t.manualFinalSurvey);

  // Sort
  const stageOrder = { 'Completed': 6, 'Reached L4': 5, 'Reached L3': 4, 'Reached L2': 3, 'Reached L1': 2, 'Test Only': 1, 'Signed Up': 0 };
  const typeOrder = { 'purchased': 1, 'pilot': 0 };
  const getLessonScore = (teacher, lessonNum) => {
    const done = teacher[`l${lessonNum}Done`];
    const sessions = teacher.lessons[lessonNum];
    if (done) return 2;
    if (sessions && sessions.length > 0) return 1;
    return 0;
  };

  filteredTeachers.sort((a, b) => {
    let comparison = 0;
    switch (analyticsSort.column) {
      case 'teacher': comparison = a.email.localeCompare(b.email); break;
      case 'type': comparison = (typeOrder[b.teacherType] || 0) - (typeOrder[a.teacherType] || 0); break;
      case 'unit': comparison = (parseInt(a.pilotUnit) || 1) - (parseInt(b.pilotUnit) || 1); break;
      case 'stage': comparison = (stageOrder[b.stage] || 0) - (stageOrder[a.stage] || 0); break;
      case 'l1': comparison = getLessonScore(b, 1) - getLessonScore(a, 1); break;
      case 'l2': comparison = getLessonScore(b, 2) - getLessonScore(a, 2); break;
      case 'l3': comparison = getLessonScore(b, 3) - getLessonScore(a, 3); break;
      case 'l4': comparison = getLessonScore(b, 4) - getLessonScore(a, 4); break;
      case 'l5': comparison = getLessonScore(b, 5) - getLessonScore(a, 5); break;
      case 'students': comparison = b.totalStudents - a.totalStudents; break;
      case 'l3Survey': comparison = ((b.hasL3Survey || b.manualL3Survey) ? 1 : 0) - ((a.hasL3Survey || a.manualL3Survey) ? 1 : 0); break;
      case 'emailedL3': comparison = (b.emailedL3 ? 1 : 0) - (a.emailedL3 ? 1 : 0); break;
      case 'finalSurvey': comparison = ((b.hasFinalSurvey || b.manualFinalSurvey) ? 1 : 0) - ((a.hasFinalSurvey || a.manualFinalSurvey) ? 1 : 0); break;
      case 'emailedDone': comparison = (b.emailedDone ? 1 : 0) - (a.emailedDone ? 1 : 0); break;
      case 'sessions': comparison = b.totalSessions - a.totalSessions; break;
      case 'lastActive': default: comparison = b.lastActive - a.lastActive; break;
    }
    return analyticsSort.direction === 'asc' ? -comparison : comparison;
  });

  const SortHeader = ({ column, children, className = '', center = false, bgColor = '' }) => (
    <th
      className={`px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap ${center ? 'text-center' : 'text-left'} ${bgColor} ${className}`}
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
    if (sessions.length === 0) return <td className="px-1 py-2 text-center text-gray-300">—</td>;
    return (
      <td className="px-1 py-2 text-center">
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
          isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isCompleted ? '✓' : 'test'}
          {sessions.length > 1 && <span>×{sessions.length}</span>}
        </span>
      </td>
    );
  };

  const ToggleCell = ({ checked, onChange, disabled }) => {
    const handleClick = (e) => { e.stopPropagation(); e.preventDefault(); if (!disabled) onChange(); };
    return (
      <td className="px-1 py-2 text-center" onClick={(e) => e.stopPropagation()}>
        {disabled ? (
          <span className="text-gray-300">—</span>
        ) : (
          <button type="button" onClick={handleClick}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
              checked ? 'bg-green-600 border-green-600 text-white' : 'border-gray-400 bg-white hover:border-green-500 hover:bg-green-50'
            }`}>
            {checked && <Check size={16} strokeWidth={3} />}
          </button>
        )}
      </td>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search teachers..." value={analyticsSearch}
                onChange={(e) => setAnalyticsSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48" />
            </div>
            <div className="relative">
              <select value={analyticsFilter} onChange={(e) => setAnalyticsFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
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
            <button
              onClick={async () => {
                if (!confirm(`Mark all ${filteredTeachers.length} teachers as Pilot?`)) return;
                for (const teacher of filteredTeachers) await toggleOutreach(teacher.email, 'teacherType', 'pilot');
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
                    <tr className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedTeachers(prev => ({ ...prev, [teacher.email]: !prev[teacher.email] }))}>
                      <td className="px-1 py-2 text-center">
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </td>
                      <td className="px-2 py-2">
                        {teacher.teacherName ? (
                          <>
                            <div className="font-medium text-gray-800 text-sm">{teacher.teacherName}</div>
                            <div className="text-xs text-gray-400">{teacher.email}</div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-gray-800 text-sm">{teacher.email.split('@')[0]}</div>
                            <div className="text-xs text-gray-400">@{teacher.email.split('@')[1]}</div>
                          </>
                        )}
                      </td>
                      <td className="px-1 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <select value={teacher.teacherType}
                          onChange={(e) => { e.stopPropagation(); toggleOutreach(teacher.email, 'teacherType', e.target.value); }}
                          className={`px-1 py-0.5 rounded text-xs font-medium border-0 cursor-pointer ${
                            teacher.teacherType === 'purchased' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                          <option value="pilot">Pilot</option>
                          <option value="purchased">Purchased</option>
                        </select>
                      </td>
                      <td className="px-1 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <select value={teacher.pilotUnit || '1'}
                          onChange={(e) => { e.stopPropagation(); toggleOutreach(teacher.email, 'pilotUnit', e.target.value); }}
                          className="px-1 py-0.5 rounded text-xs font-medium border-0 cursor-pointer bg-gray-100 text-gray-800">
                          <option value="1">U1</option><option value="2">U2</option><option value="3">U3</option>
                          <option value="4">U4</option><option value="5">U5</option><option value="6">U6</option>
                        </select>
                      </td>
                      <td className="px-1 py-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          teacher.stage === 'Completed' ? 'bg-green-100 text-green-800' :
                          teacher.stage === 'Reached L3' || teacher.stage === 'Reached L4' ? 'bg-blue-100 text-blue-800' :
                          teacher.stage === 'Test Only' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {teacher.stage}
                        </span>
                      </td>
                      <LessonCell sessions={teacher.lessons[1]} isCompleted={teacher.l1Done} />
                      <LessonCell sessions={teacher.lessons[2]} isCompleted={teacher.l2Done} />
                      <LessonCell sessions={teacher.lessons[3]} isCompleted={teacher.l3Done} />
                      <LessonCell sessions={teacher.lessons[4]} isCompleted={teacher.l4Done} />
                      <LessonCell sessions={teacher.lessons[5]} isCompleted={teacher.l5Done} />
                      <td className="px-1 py-2 text-center font-medium text-gray-800">{teacher.totalStudents}</td>
                      <ToggleCell checked={teacher.hasL3Survey || teacher.manualL3Survey}
                        onChange={() => toggleOutreach(teacher.email, 'manualL3Survey')} disabled={!teacher.l3Done} />
                      <ToggleCell checked={teacher.emailedL3}
                        onChange={() => toggleOutreach(teacher.email, 'emailedL3')} disabled={!teacher.l3Done} />
                      <ToggleCell checked={teacher.hasFinalSurvey || teacher.manualFinalSurvey}
                        onChange={() => toggleOutreach(teacher.email, 'manualFinalSurvey')} disabled={!teacher.l5Done} />
                      <ToggleCell checked={teacher.emailedDone}
                        onChange={() => toggleOutreach(teacher.email, 'emailedDone')} disabled={!teacher.l5Done} />
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={15} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    {sessions.sort((a, b) => (b.date || 0) - (a.date || 0)).map((session, i) => (
                                      <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                          {session.date ? new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'}
                                        </span>
                                        <span className="text-gray-500">
                                          {session.students} stu · {session.activeTimeMins}min active · {session.stageCount} stages
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
    </div>
  );
};

export default TeacherAnalyticsPage;
