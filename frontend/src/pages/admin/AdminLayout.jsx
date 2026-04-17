import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Users, UserCheck, BarChart3, BookOpen, Play, MessageSquare, AlertTriangle, Mail, ArrowLeft, Shield, Download, RefreshCw, DatabaseBackup, Menu, X } from 'lucide-react';
import { AdminDataProvider, useAdminData } from './AdminDataContext';

const AdminLayoutInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    user, authLoading, isAdmin, loading,
    applications, error, setError, success, setSuccess,
    backfillResult, setBackfillResult,
    isBackfilling, backfillStudentCounts,
    exportToExcel
  } = useAdminData();

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Access Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button onClick={() => navigate('/teacher/dashboard')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  const navSections = [
    {
      label: 'OVERVIEW',
      items: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
      ]
    },
    {
      label: 'PEOPLE',
      items: [
        { to: '/admin/applications', icon: Inbox, label: 'Applications', badge: pendingCount > 0 ? pendingCount : null },
        { to: '/admin/approved', icon: UserCheck, label: 'Approved Emails' },
        { to: '/admin/registered', icon: Users, label: 'Registered Users' },
      ]
    },
    {
      label: 'ANALYTICS',
      items: [
        { to: '/admin/teachers', icon: BarChart3, label: 'Teachers' },
        { to: '/admin/lessons', icon: BookOpen, label: 'Lessons' },
        { to: '/admin/sessions', icon: Play, label: 'Sessions' },
      ]
    },
    {
      label: 'FEEDBACK',
      items: [
        { to: '/admin/surveys', icon: MessageSquare, label: 'Surveys' },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { to: '/admin/emails', icon: Mail, label: 'Emails' },
        { to: '/admin/errors', icon: AlertTriangle, label: 'Error Logs' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — fixed on desktop, slide-over on mobile */}
      <aside className={`w-56 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } sm:translate-x-0`}>
        {/* Logo / Title */}
        <div className="px-4 py-5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">Music Mind Academy</h1>
            <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="sm:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-4 mb-1 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                {section.label}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white border-l-2 border-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`
                  }
                >
                  <item.icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield size={14} className="text-green-500" />
            <span className="truncate">{user.email}</span>
          </div>
          <button
            onClick={() => { navigate('/teacher/dashboard'); setSidebarOpen(false); }}
            className="flex items-center gap-2 mt-3 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 sm:ml-56">
        {/* Top bar with actions */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="sm:hidden text-gray-600 hover:text-gray-900">
              <Menu size={22} />
            </button>
            <div className="flex-1" />
            <button
              onClick={backfillStudentCounts}
              disabled={isBackfilling}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors"
              title="Recover student counts from live session data"
            >
              {isBackfilling ? <RefreshCw size={14} className="animate-spin" /> : <DatabaseBackup size={14} />}
              {isBackfilling ? 'Backfilling...' : 'Recover Students'}
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Excel</span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
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
          {backfillResult && (
            <div className={`mb-4 p-4 rounded-lg border ${backfillResult.success ? 'bg-orange-50 border-orange-300' : 'bg-red-100 border-red-400'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${backfillResult.success ? 'text-orange-800' : 'text-red-700'}`}>
                  {backfillResult.message}
                </span>
                <button onClick={() => setBackfillResult(null)} className="text-gray-500 hover:text-gray-700">×</button>
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Loading admin data...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => (
  <AdminDataProvider>
    <AdminLayoutInner />
  </AdminDataProvider>
);

export default AdminLayout;
