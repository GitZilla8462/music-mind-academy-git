import React, { useState } from 'react';
import { Users, Trash2, Download, KeyRound, Check } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useAdminData } from './AdminDataContext';

const RegisteredUsersPage = () => {
  const {
    registeredUsers, approvedEmails, teacherOutreach,
    handleBulkDeleteUsers, formatDate
  } = useAdminData();

  const [selectedUsers, setSelectedUsers] = useState({});
  const [bulkDeletingUsers, setBulkDeletingUsers] = useState(false);
  const [resetStatus, setResetStatus] = useState({});

  const handleEmailResetLink = async (userEmail, userName) => {
    if (!userEmail) return;
    setResetStatus(prev => ({ ...prev, [userEmail]: 'emailing' }));
    try {
      const idToken = await getAuth().currentUser.getIdToken();
      const res = await fetch('/api/firebase-admin/send-reset-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ email: userEmail, name: userName })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      setResetStatus(prev => ({ ...prev, [userEmail]: 'email-sent' }));
    } catch (err) {
      console.error('Email reset link failed for', userEmail, err);
      setResetStatus(prev => ({ ...prev, [userEmail]: 'error' }));
    }
  };

  const toggleSelectAllUsers = () => {
    const allSelected = registeredUsers.every(user => selectedUsers[user.id]);
    if (allSelected) setSelectedUsers({});
    else {
      const newSelected = {};
      registeredUsers.forEach(user => { newSelected[user.id] = true; });
      setSelectedUsers(newSelected);
    }
  };

  const getUsersNotApproved = () => {
    const approvedEmailSet = new Set(approvedEmails.map(e => e.email?.toLowerCase()));
    return registeredUsers.filter(user => !approvedEmailSet.has(user.email?.toLowerCase()));
  };

  const selectUnapprovedUsers = () => {
    const unapproved = getUsersNotApproved();
    const newSelected = {};
    unapproved.forEach(user => { newSelected[user.id] = true; });
    setSelectedUsers(newSelected);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Joined', 'Last Login', 'Type', 'Approved'];
    const rows = [...registeredUsers].sort((a, b) => {
      const aEmailKey = a.email?.toLowerCase().replace(/\./g, ',');
      const bEmailKey = b.email?.toLowerCase().replace(/\./g, ',');
      const aType = teacherOutreach[aEmailKey]?.teacherType || 'pilot';
      const bType = teacherOutreach[bEmailKey]?.teacherType || 'pilot';
      return (bType === 'purchased' ? 1 : 0) - (aType === 'purchased' ? 1 : 0);
    }).map(user => {
      const isApproved = approvedEmails.some(e => e.email?.toLowerCase() === user.email?.toLowerCase());
      const emailKey = user.email?.toLowerCase().replace(/\./g, ',');
      const teacherType = teacherOutreach[emailKey]?.teacherType || 'pilot';
      return [
        `"${(user.displayName || 'Unknown').replace(/"/g, '""')}"`,
        user.email || '',
        user.createdAt ? new Date(user.createdAt).toISOString() : '',
        user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : '',
        teacherType,
        isApproved ? 'Yes' : 'No'
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registered-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onBulkDelete = async () => {
    const selectedIds = Object.entries(selectedUsers).filter(([_, selected]) => selected).map(([id]) => id);
    if (selectedIds.length === 0) return;
    setBulkDeletingUsers(true);
    const success = await handleBulkDeleteUsers(selectedIds);
    if (success) setSelectedUsers({});
    setBulkDeletingUsers(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Users size={20} />
          Registered Users
        </h2>
      </div>

      {registeredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No users have signed up yet.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {/* Bulk actions toolbar */}
          <div className="px-4 sm:px-6 py-2 bg-gray-50 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button onClick={toggleSelectAllUsers} className="px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1">
                <input type="checkbox"
                  checked={registeredUsers.length > 0 && registeredUsers.every(user => selectedUsers[user.id])}
                  onChange={toggleSelectAllUsers} className="rounded" />
                <span>Select All</span>
              </button>
              <button onClick={selectUnapprovedUsers}
                className="px-3 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200">
                Not Approved ({getUsersNotApproved().length})
              </button>
              {Object.values(selectedUsers).filter(Boolean).length > 0 && (
                <button onClick={onBulkDelete} disabled={bulkDeletingUsers}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-1">
                  <Trash2 size={14} />
                  Delete {Object.values(selectedUsers).filter(Boolean).length}
                </button>
              )}
            </div>
            <button onClick={exportCSV}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
              <Download size={14} />
              CSV
            </button>
          </div>

          {[...registeredUsers].sort((a, b) => {
            const aEmailKey = a.email?.toLowerCase().replace(/\./g, ',');
            const bEmailKey = b.email?.toLowerCase().replace(/\./g, ',');
            const aType = teacherOutreach[aEmailKey]?.teacherType || 'pilot';
            const bType = teacherOutreach[bEmailKey]?.teacherType || 'pilot';
            return (bType === 'purchased' ? 1 : 0) - (aType === 'purchased' ? 1 : 0);
          }).map((user, index) => {
            const isApproved = approvedEmails.some(e => e.email?.toLowerCase() === user.email?.toLowerCase());
            const emailKey = user.email?.toLowerCase().replace(/\./g, ',');
            const teacherType = teacherOutreach[emailKey]?.teacherType || 'pilot';
            return (
              <div key={user.id} className={`px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 ${selectedUsers[user.id] ? 'bg-red-50' : ''}`}>
                {/* Desktop: horizontal row */}
                <div className="hidden sm:flex items-center gap-4">
                  <span className="text-xs text-gray-400 w-6 text-right font-mono">{index + 1}</span>
                  <input type="checkbox" checked={!!selectedUsers[user.id]}
                    onChange={(e) => setSelectedUsers(prev => ({ ...prev, [user.id]: e.target.checked }))} className="rounded" />
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
                    <div className="text-sm text-gray-500">Joined: {formatDate(user.createdAt)}</div>
                    <div className="text-sm text-gray-500">Last login: {formatDate(user.lastLoginAt)}</div>
                  </div>
                  {teacherType === 'purchased' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Paid</span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Pilot</span>
                  )}
                  {isApproved ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Approved</span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">Not Approved</span>
                  )}
                  {resetStatus[user.email] === 'email-sent' ? (
                    <span className="px-3 py-1 text-sm rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                      <Check size={14} /> Reset Link Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEmailResetLink(user.email, user.displayName)}
                      disabled={resetStatus[user.email] === 'emailing'}
                      className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 transition-colors ${
                        resetStatus[user.email] === 'error'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      } disabled:opacity-50`}
                      title="Emails a password reset link to this teacher (you get a CC)"
                    >
                      <KeyRound size={14} />
                      {resetStatus[user.email] === 'emailing' ? 'Sending...'
                        : resetStatus[user.email] === 'error' ? 'Failed — Retry'
                        : 'Reset Password'}
                    </button>
                  )}
                </div>

                {/* Mobile: stacked card */}
                <div className="sm:hidden">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={!!selectedUsers[user.id]}
                      onChange={(e) => setSelectedUsers(prev => ({ ...prev, [user.id]: e.target.checked }))} className="rounded" />
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{user.displayName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-2 ml-12 flex flex-wrap items-center gap-1.5">
                    {teacherType === 'purchased' ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Paid</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Pilot</span>
                    )}
                    {isApproved ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Approved</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Not Approved</span>
                    )}
                    <span className="text-xs text-gray-400">Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="mt-2 ml-12">
                    {resetStatus[user.email] === 'email-sent' ? (
                      <span className="px-2 py-1 text-xs rounded-full inline-flex items-center gap-1 bg-green-100 text-green-700">
                        <Check size={12} /> Reset Link Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEmailResetLink(user.email, user.displayName)}
                        disabled={resetStatus[user.email] === 'emailing'}
                        className={`px-2 py-1 text-xs rounded-full inline-flex items-center gap-1 transition-colors ${
                          resetStatus[user.email] === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        } disabled:opacity-50`}
                      >
                        <KeyRound size={12} />
                        {resetStatus[user.email] === 'emailing' ? 'Sending...'
                          : resetStatus[user.email] === 'error' ? 'Failed — Retry'
                          : 'Reset Password'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RegisteredUsersPage;
