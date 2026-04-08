import React, { useState } from 'react';
import { Building2, GraduationCap, UserPlus, Trash2, UserX, Calendar, RefreshCw, MailX } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

const ApprovedEmailsPage = () => {
  const {
    selectedSite, setSelectedSite, approvedEmails,
    academyEmails, eduEmails, registeredUsers, teacherOutreach,
    emailUnsubscribes,
    handleAddEmail, handleBatchAdd, handleRemoveEmail, handleBulkDelete,
    removeTeacherCompletely,
    formatDate, SITE_TYPES
  } = useAdminData();

  const [newEmail, setNewEmail] = useState('');
  const [newPersonalEmail, setNewPersonalEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newTeacherType, setNewTeacherType] = useState('pilot');
  const [adding, setAdding] = useState(false);

  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [batchEmails, setBatchEmails] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [batchAdding, setBatchAdding] = useState(false);

  const [selectedEmails, setSelectedEmails] = useState({});
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [approvedEmailsSort, setApprovedEmailsSort] = useState({ column: 'email', direction: 'asc' });

  const toggleSelectAll = () => {
    const allSelected = approvedEmails.every(item => selectedEmails[item.id]);
    if (allSelected) setSelectedEmails({});
    else {
      const newSelected = {};
      approvedEmails.forEach(item => { newSelected[item.id] = true; });
      setSelectedEmails(newSelected);
    }
  };

  const onAddEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAdding(true);
    const success = await handleAddEmail(newEmail, newNotes, newTeacherType, newPersonalEmail);
    if (success) { setNewEmail(''); setNewNotes(''); setNewPersonalEmail(''); }
    setAdding(false);
  };

  const onBatchAdd = async (e) => {
    e.preventDefault();
    if (!batchEmails.trim()) return;
    setBatchAdding(true);
    const success = await handleBatchAdd(batchEmails, batchNotes, newTeacherType);
    if (success) { setBatchEmails(''); setBatchNotes(''); setShowBatchAdd(false); }
    setBatchAdding(false);
  };

  const onBulkDelete = async () => {
    const selectedIds = Object.entries(selectedEmails).filter(([_, selected]) => selected).map(([id]) => id);
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    const success = await handleBulkDelete(selectedIds);
    if (success) setSelectedEmails({});
    setBulkDeleting(false);
  };

  const sortedEmails = [...approvedEmails].sort((a, b) => {
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
      comparison = (bType === 'purchased' ? 1 : 0) - (aType === 'purchased' ? 1 : 0);
    }
    return approvedEmailsSort.direction === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6">
      {/* Site Selection */}
      <div className="flex gap-2">
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
          <span className={`px-2 py-0.5 rounded-full text-sm ${selectedSite === SITE_TYPES.ACADEMY ? 'bg-blue-500' : 'bg-gray-200'}`}>
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
          <span className={`px-2 py-0.5 rounded-full text-sm ${selectedSite === SITE_TYPES.EDU ? 'bg-violet-500' : 'bg-gray-200'}`}>
            {eduEmails.length}
          </span>
        </button>
      </div>

      {/* Add Email Form */}
      <div className={`rounded-xl border p-6 ${
        selectedSite === SITE_TYPES.ACADEMY ? 'bg-blue-50 border-blue-200' : 'bg-violet-50 border-violet-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UserPlus size={20} />
            Add Email to {selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools'}
          </h2>
          <button
            onClick={() => setShowBatchAdd(!showBatchAdd)}
            className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
              showBatchAdd ? 'bg-gray-200 text-gray-700'
                : selectedSite === SITE_TYPES.ACADEMY ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
            }`}
          >
            {showBatchAdd ? 'Single Email' : 'Batch Add'}
          </button>
        </div>

        {!showBatchAdd ? (
          <form onSubmit={onAddEmail} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="teacher@school.edu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" required />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
              <input type="text" value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                placeholder="School name, grade level"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Personal Email (optional)</label>
              <input type="email" value={newPersonalEmail} onChange={(e) => setNewPersonalEmail(e.target.value)}
                placeholder="teacher@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={newTeacherType} onChange={(e) => setNewTeacherType(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium ${
                  newTeacherType === 'purchased' ? 'text-green-700' : 'text-blue-700'
                }`}>
                <option value="pilot">Pilot</option>
                <option value="purchased">Purchased</option>
              </select>
            </div>
            <button type="submit" disabled={adding}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                selectedSite === SITE_TYPES.ACADEMY ? 'bg-blue-600 hover:bg-blue-700' : 'bg-violet-600 hover:bg-violet-700'
              }`}>
              {adding ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
              Add Email
            </button>
          </form>
        ) : (
          <form onSubmit={onBatchAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paste from Excel (Name, Email, School) or just emails — one per line
              </label>
              <textarea value={batchEmails} onChange={(e) => setBatchEmails(e.target.value)}
                placeholder={"Jane Smith\tteacher1@school.edu\tLincoln Middle School\nJohn Doe\tteacher2@school.edu\tWashington Academy\nteacher3@school.edu"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white h-32 font-mono text-sm" required />
              <p className="text-xs text-gray-500 mt-1">
                {batchEmails.split(/\n/).filter(l => l.trim()).filter(l => l.match(/[^\s,;()]+@[^\s,;()]+/)).length} email(s) detected
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes for all (optional)</label>
                <input type="text" value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="e.g., Winter 2025 cohort"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={newTeacherType} onChange={(e) => setNewTeacherType(e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium ${
                    newTeacherType === 'purchased' ? 'text-green-700' : 'text-blue-700'
                  }`}>
                  <option value="pilot">Pilot</option>
                  <option value="purchased">Purchased</option>
                </select>
              </div>
              <button type="submit" disabled={batchAdding}
                className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                  selectedSite === SITE_TYPES.ACADEMY ? 'bg-blue-600 hover:bg-blue-700' : 'bg-violet-600 hover:bg-violet-700'
                }`}>
                {batchAdding ? <RefreshCw size={18} className="animate-spin" /> : <UserPlus size={18} />}
                Add All Emails
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Email List */}
      <div className={`rounded-xl border overflow-hidden ${
        selectedSite === SITE_TYPES.ACADEMY ? 'border-blue-200' : 'border-violet-200'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          selectedSite === SITE_TYPES.ACADEMY ? 'bg-blue-50 border-blue-200' : 'bg-violet-50 border-violet-200'
        }`}>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {selectedSite === SITE_TYPES.ACADEMY ? <Building2 size={20} /> : <GraduationCap size={20} />}
            {selectedSite === SITE_TYPES.ACADEMY ? 'Music Mind Academy' : 'Music Room Tools'} - Approved Emails
          </h2>
        </div>

        {approvedEmails.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white">No approved emails yet. Add one above!</div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white">
            {/* Sort controls and bulk actions */}
            <div className="px-6 py-2 bg-gray-50 flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <button onClick={toggleSelectAll} className="px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1">
                  <input type="checkbox"
                    checked={approvedEmails.length > 0 && approvedEmails.every(item => selectedEmails[item.id])}
                    onChange={toggleSelectAll} className="rounded" />
                  <span>Select All</span>
                </button>
                {Object.values(selectedEmails).filter(Boolean).length > 0 && (
                  <button onClick={onBulkDelete} disabled={bulkDeleting}
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-1">
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
                  className="px-2 py-1 border border-gray-300 rounded text-sm">
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

            {sortedEmails.map((item) => {
              const emailKey = item.email?.toLowerCase().replace(/\./g, ',');
              const teacherType = teacherOutreach[emailKey]?.teacherType || 'pilot';
              return (
                <div key={item.id} className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 ${selectedEmails[item.id] ? 'bg-red-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={!!selectedEmails[item.id]}
                      onChange={(e) => setSelectedEmails(prev => ({ ...prev, [item.id]: e.target.checked }))} className="rounded" />
                    <div>
                      <div className="font-medium text-gray-800">{item.email}</div>
                      {item.personalEmail && (
                        <div className="text-xs text-orange-500">↳ {item.personalEmail}</div>
                      )}
                      <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(item.approvedAt)}</span>
                        {item.notes && <span>• {item.notes}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {emailUnsubscribes[emailKey] && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full flex items-center gap-1" title={`Unsubscribed ${emailUnsubscribes[emailKey].unsubscribedAt ? formatDate(emailUnsubscribes[emailKey].unsubscribedAt) : ''}`}>
                        <MailX size={14} /> Unsubscribed
                      </span>
                    )}
                    {teacherType === 'purchased' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Paid</span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Pilot</span>
                    )}
                    {registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase()) ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Signed Up</span>
                    ) : (
                      <>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">Pending</span>
                        {teacherOutreach[emailKey]?.dripWelcomeSent && (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs rounded-full" title="Welcome email sent">W</span>
                        )}
                        {teacherOutreach[emailKey]?.dripFollowup1Sent && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full" title="Follow-up 1 sent (day 7)">F1</span>
                        )}
                        {teacherOutreach[emailKey]?.dripFollowup2Sent && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full" title="Follow-up 2 sent (day 14)">F2</span>
                        )}
                      </>
                    )}
                    <button onClick={() => handleRemoveEmail(item.id, item.email)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove from approved list">
                      <Trash2 size={18} />
                    </button>
                    {registeredUsers.some(u => u.email?.toLowerCase() === item.email?.toLowerCase()) && (
                      <button onClick={() => removeTeacherCompletely(item.email)}
                        className="p-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors" title="Remove completely (account, classes, all data)">
                        <UserX size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedEmailsPage;
