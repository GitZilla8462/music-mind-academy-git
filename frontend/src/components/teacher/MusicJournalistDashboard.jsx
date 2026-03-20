// Music Journalist Dashboard
// src/components/teacher/MusicJournalistDashboard.jsx
// Dashboard panel for Unit 3 (Music Journalist) — shows student progress,
// article stats, and research status. Embeddable in ClassDetailPage.

import React, { useState, useMemo } from 'react';
import {
  Users,
  BookOpen,
  FileText,
  Presentation,
  ChevronDown,
  ChevronRight,
  Eye,
  Search,
  Newspaper,
  Highlighter,
  LayoutDashboard
} from 'lucide-react';

// ============================================================
// STATUS HELPERS
// ============================================================

const STATUS_CONFIG = {
  'Not Started':          { color: 'text-gray-400',   bg: 'bg-gray-700',        dot: 'bg-gray-400' },
  'Researching':          { color: 'text-blue-400',   bg: 'bg-blue-900/30',     dot: 'bg-blue-400' },
  'Building Slides':      { color: 'text-yellow-400', bg: 'bg-yellow-900/30',   dot: 'bg-yellow-400' },
  'Presentation Ready':   { color: 'text-green-400',  bg: 'bg-green-900/30',    dot: 'bg-green-400' },
  'Presented':            { color: 'text-emerald-400',bg: 'bg-emerald-900/30',  dot: 'bg-emerald-400' },
};

/**
 * Compute a student's Music Journalist status from their progress data.
 * In production this will read from Firebase; for now uses mock data shape.
 */
const computeStatus = (progress) => {
  if (!progress) return 'Not Started';
  if (progress.presented) return 'Presented';
  if (progress.slidesDone === 4) return 'Presentation Ready';
  if (progress.slidesDone > 0) return 'Building Slides';
  if (progress.articlesRead > 0 || progress.highlights > 0) return 'Researching';
  return 'Not Started';
};

// ============================================================
// MOCK DATA — Replace with Firebase queries when wired up
// ============================================================

const generateMockProgress = (students) => {
  const topics = [
    'Taylor Swift Eras Tour', 'AI in Music Production', 'Rise of K-Pop',
    'Music Streaming Economics', 'Hip-Hop History', 'Women in Country Music',
    'Music Festival Culture', 'Vinyl Revival', 'TikTok and Music Discovery',
    'Video Game Soundtracks'
  ];

  const statuses = ['Not Started', 'Researching', 'Building Slides', 'Presentation Ready', 'Presented'];

  return students.map((student, i) => {
    const statusIdx = i % statuses.length;
    const isNotStarted = statusIdx === 0;

    return {
      uid: student.uid || student.id || `student-${i}`,
      name: student.displayName || student.name || `Student ${i + 1}`,
      topic: isNotStarted ? null : topics[i % topics.length],
      articlesRead: isNotStarted ? 0 : Math.floor(Math.random() * 6) + 1,
      highlights: isNotStarted ? 0 : Math.floor(Math.random() * 12) + 1,
      slidesDone: [0, 0, 1, 4, 4][statusIdx],
      presented: statusIdx === 4,
      gameScores: isNotStarted ? {} : {
        'fact-opinion-sorter': Math.floor(Math.random() * 5) + 5,
        'source-or-not': statusIdx >= 2 ? Math.floor(Math.random() * 5) + 5 : null,
        'headline-writer': statusIdx >= 3 ? Math.floor(Math.random() * 5) + 5 : null,
      },
      slideDetails: isNotStarted ? [] : Array.from({ length: [0, 0, 1, 4, 4][statusIdx] }, (_, j) => ({
        slideNumber: j + 1,
        title: ['Intro', 'Key Facts', 'My Take', 'Conclusion'][j],
        complete: true
      }))
    };
  });
};

const MOCK_POPULAR_ARTICLES = [
  { headline: 'Taylor Swift Breaks Another Streaming Record', source: 'Rolling Stone', views: 24 },
  { headline: 'How AI Is Changing the Way We Make Music', source: 'Wired', views: 18 },
  { headline: 'K-Pop Group NewJeans Announces World Tour', source: 'Billboard', views: 15 },
  { headline: 'Spotify Raises Prices Again — What It Means for Artists', source: 'The Verge', views: 12 },
  { headline: 'Why Vinyl Sales Keep Growing in a Digital World', source: 'NPR', views: 9 },
];

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({ icon: Icon, label, value, accent = '#1e3a5f' }) => (
  <div
    className="rounded-xl p-4 flex items-center gap-4"
    style={{ backgroundColor: accent + '22', border: `1px solid ${accent}66` }}
  >
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: accent + '44' }}
    >
      <Icon className="w-5 h-5" style={{ color: accent.replace('#1e3a5f', '#60a5fa') }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  </div>
);

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Not Started'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
};

// ============================================================
// EXPANDED ROW DETAIL
// ============================================================

const StudentDetail = ({ student }) => (
  <tr>
    <td colSpan={6} className="bg-gray-800/50 px-6 py-4 border-b border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Research Board Preview */}
        <div className="bg-gray-900 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
            <LayoutDashboard className="w-4 h-4" /> Research Board
          </h4>
          {student.articlesRead > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                {student.articlesRead} article{student.articlesRead !== 1 ? 's' : ''} saved
              </p>
              <p className="text-xs text-gray-400">
                {student.highlights} highlight{student.highlights !== 1 ? 's' : ''} collected
              </p>
              <p className="text-xs text-blue-400 mt-2">
                Topic: {student.topic || 'Not chosen yet'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No research started</p>
          )}
        </div>

        {/* Slide Completion */}
        <div className="bg-gray-900 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Slide Progress
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {['Intro', 'Key Facts', 'My Take', 'Conclusion'].map((title, i) => {
              const done = student.slideDetails && student.slideDetails.some(s => s.slideNumber === i + 1);
              return (
                <div
                  key={i}
                  className={`text-xs px-2 py-1.5 rounded text-center ${
                    done ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-500 border border-gray-700'
                  }`}
                >
                  {i + 1}. {title}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Scores */}
        <div className="bg-gray-900 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Game Scores
          </h4>
          <div className="space-y-1.5">
            {[
              { key: 'fact-opinion-sorter', label: 'Fact/Opinion Sorter' },
              { key: 'source-or-not', label: 'Source or Not?' },
              { key: 'headline-writer', label: 'Headline Writer' },
            ].map(({ key, label }) => {
              const score = student.gameScores?.[key];
              return (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-gray-400">{label}</span>
                  <span className={score != null ? 'text-white font-medium' : 'text-gray-600'}>
                    {score != null ? `${score}/10` : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </td>
  </tr>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const MusicJournalistDashboard = ({ classId, students = [] }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Generate mock progress from roster
  const progressData = useMemo(() => generateMockProgress(students), [students]);

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return progressData;
    const q = searchQuery.toLowerCase();
    return progressData.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.topic && s.topic.toLowerCase().includes(q))
    );
  }, [progressData, searchQuery]);

  // Compute stats
  const stats = useMemo(() => {
    const started = progressData.filter(s => computeStatus(s) !== 'Not Started').length;
    const avgArticles = progressData.length > 0
      ? (progressData.reduce((sum, s) => sum + s.articlesRead, 0) / progressData.length).toFixed(1)
      : 0;
    const projectsComplete = progressData.filter(s => s.slidesDone === 4).length;
    const presented = progressData.filter(s => s.presented).length;
    return { started, avgArticles, projectsComplete, presented };
  }, [progressData]);

  const toggleRow = (uid) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
          <Newspaper className="w-4 h-4 text-blue-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Music Journalist Dashboard</h2>
          <p className="text-xs text-gray-400">Unit 3 progress overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Students Started" value={stats.started} />
        <StatCard icon={BookOpen} label="Avg Articles Read" value={stats.avgArticles} />
        <StatCard icon={FileText} label="Projects Complete" value={stats.projectsComplete} />
        <StatCard icon={Presentation} label="Presentations Delivered" value={stats.presented} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or topic..."
          className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Student Progress Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Topic</th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">
                  <span className="flex items-center justify-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Articles</span>
                </th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">
                  <span className="flex items-center justify-center gap-1"><Highlighter className="w-3.5 h-3.5" /> Highlights</span>
                </th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">
                  <span className="flex items-center justify-center gap-1"><FileText className="w-3.5 h-3.5" /> Slides</span>
                </th>
                <th className="text-center px-4 py-3 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {students.length === 0
                      ? 'No students in this class yet'
                      : 'No students match your search'}
                  </td>
                </tr>
              ) : (
                filteredData.map((student) => {
                  const status = computeStatus(student);
                  const isExpanded = expandedRows.has(student.uid);
                  return (
                    <React.Fragment key={student.uid}>
                      <tr
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer transition-colors"
                        onClick={() => toggleRow(student.uid)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isExpanded
                              ? <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              : <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            }
                            <span className="text-white font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">
                          {student.topic || <span className="text-gray-600 italic">No topic</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={student.articlesRead > 0 ? 'text-white' : 'text-gray-600'}>
                            {student.articlesRead}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={student.highlights > 0 ? 'text-white' : 'text-gray-600'}>
                            {student.highlights}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={student.slidesDone > 0 ? 'text-white' : 'text-gray-600'}>
                            {student.slidesDone}/4
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                      {isExpanded && <StudentDetail student={student} />}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Newspaper className="w-4 h-4" /> Popular Articles Across Class
        </h3>
        <div className="space-y-2">
          {MOCK_POPULAR_ARTICLES.map((article, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{article.headline}</p>
                <p className="text-xs text-gray-500">{article.source}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                <Eye className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400 tabular-nums">{article.views}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center">
          Article view tracking based on mock data — live analytics coming soon
        </p>
      </div>
    </div>
  );
};

export default MusicJournalistDashboard;
