import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Inbox, BarChart3, BookOpen, Building2, GraduationCap } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

const ADMIN_EMAILS = ['robtaube90@gmail.com', 'robtaube92@gmail.com'];

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    academyEmails, eduEmails, registeredUsers,
    summaryStats, pilotSessions, applications,
    formatDuration, getLessonName
  } = useAdminData();

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  // Compute funnel from academyEmails as single source of truth
  const funnel = useMemo(() => {
    const regEmails = new Set(registeredUsers.map(u => u.email?.toLowerCase()).filter(Boolean));
    const teachingEmails = new Set();
    pilotSessions.forEach(s => {
      const email = s.teacherEmail?.toLowerCase();
      if (email) teachingEmails.add(email);
    });

    let approved = 0, neverLoggedIn = 0, onlyLoggedIn = 0, teaching = 0;
    academyEmails.forEach(entry => {
      const email = entry.email?.toLowerCase();
      if (!email || ADMIN_EMAILS.includes(email)) return;
      approved++;
      if (teachingEmails.has(email)) teaching++;
      else if (regEmails.has(email)) onlyLoggedIn++;
      else neverLoggedIn++;
    });
    return { approved, neverLoggedIn, onlyLoggedIn, teaching };
  }, [academyEmails, registeredUsers, pilotSessions]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>

      {/* Teacher Funnel — Never Logged In + Only Logged In + Teaching = Approved */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{funnel.approved}</div>
          <div className="text-sm font-medium text-blue-800">Approved Users</div>
        </div>
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <div className="text-3xl font-bold text-red-600">{funnel.neverLoggedIn}</div>
          <div className="text-sm font-medium text-red-800">Never Logged In</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600">{funnel.onlyLoggedIn}</div>
          <div className="text-sm font-medium text-yellow-800">Only Logged In</div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <div className="text-3xl font-bold text-green-600">{funnel.teaching}</div>
          <div className="text-sm font-medium text-green-800">Teaching</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-violet-200 bg-violet-50">
          <div className="text-2xl font-bold text-violet-600">{eduEmails.length}</div>
          <div className="text-sm text-gray-500">Edu Approved</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{summaryStats?.totalSessions || 0}</div>
          <div className="text-sm text-gray-500">Total Sessions</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{formatDuration(summaryStats?.avgSessionDuration)}</div>
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
          <div className="text-2xl font-bold text-pink-600">{summaryStats?.retentionRate || 0}%</div>
          <div className="text-sm text-gray-500">Return Rate</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingCount > 0 && (
          <button
            onClick={() => navigate('/admin/applications')}
            className="bg-white border-2 border-yellow-300 rounded-xl p-6 text-left hover:bg-yellow-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Inbox className="text-yellow-600" size={24} />
              <div>
                <div className="font-semibold text-gray-800">{pendingCount} Pending Application{pendingCount !== 1 ? 's' : ''}</div>
                <div className="text-sm text-gray-500">Click to review and approve</div>
              </div>
            </div>
          </button>
        )}
        <button
          onClick={() => navigate('/admin/teachers')}
          className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={24} />
            <div>
              <div className="font-semibold text-gray-800">Teacher Analytics</div>
              <div className="text-sm text-gray-500">View pilot progress and survey status</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
