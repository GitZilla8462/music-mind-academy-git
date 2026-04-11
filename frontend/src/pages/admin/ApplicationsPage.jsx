import React, { useState, useMemo } from 'react';
import { Inbox, ChevronDown, ChevronUp, Upload, X, Table, LayoutList, Search, Download, Copy } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

/**
 * Parse TSV pasted from Google Sheets into application objects
 */
const parseTSV = (tsv) => {
  const lines = tsv.split('\n').map(line => line.split('\t'));
  if (lines.length < 2) return [];

  const headers = lines[0];
  const applications = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    // Skip empty rows
    if (!row || row.length < 4 || !row.some(cell => cell.trim())) continue;

    // Map by header index
    const get = (headerFragment) => {
      const idx = headers.findIndex(h => h.toLowerCase().includes(headerFragment.toLowerCase()));
      return idx >= 0 ? (row[idx] || '').trim() : '';
    };

    const timestamp = get('Timestamp');
    const formEmail = get('Email Address');
    const schoolEmailCol = headers.findIndex(h => h.toLowerCase().includes('school email'));
    const schoolEmailVal = schoolEmailCol >= 0 ? (row[schoolEmailCol] || '').trim() : '';
    const firstName = get('First Name');
    const lastName = get('Last Name');
    const schoolName = get('School Name');
    const cityState = get('City');
    const gradesRaw = get('grades');
    const devicesRaw = get('devices');
    const classSize = get('typical class');
    const biggestChallenge = get('biggest challenge');
    const whyPilot = get('Why do you want');
    const toolsRaw = get('music education tools');
    const canCommit = get('commit');
    const anythingElse = get('Anything else');
    const personalEmailCol = headers.findIndex(h => h.toLowerCase().includes('personal email'));
    const personalEmail = personalEmailCol >= 0 ? (row[personalEmailCol] || '').trim() : '';

    // Determine school email: prefer explicit school email column, fall back to form email
    const schoolEmail = (schoolEmailVal || formEmail).toLowerCase().trim();
    if (!schoolEmail || !firstName) continue;

    // Split city/state
    let city = '', state = '';
    if (cityState) {
      const lastComma = cityState.lastIndexOf(',');
      if (lastComma > 0) {
        city = cityState.substring(0, lastComma).trim();
        state = cityState.substring(lastComma + 1).trim();
      } else {
        city = cityState;
      }
    }

    // Parse arrays
    const grades = gradesRaw ? gradesRaw.split(',').map(g => g.trim()).filter(Boolean) : [];
    const devices = devicesRaw ? devicesRaw.split(',').map(d => d.trim()).filter(Boolean) : [];
    const toolsUsed = toolsRaw ? toolsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Parse timestamp
    let submittedAt = Date.now();
    if (timestamp) {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) submittedAt = parsed.getTime();
    }

    applications.push({
      firstName, lastName, schoolEmail, schoolName,
      personalEmail: personalEmail || formEmail || '',
      city, state, grades, devices, classSize,
      biggestChallenge, whyPilot, toolsUsed, canCommit,
      anythingElse, submittedAt
    });
  }

  return applications;
};

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-500',
  imported: 'bg-blue-100 text-blue-700',
};

const ApplicationsPage = () => {
  const { applications, approvingId, handleApproveApplication, handleRejectApplication } = useAdminData();
  const [expandedApplications, setExpandedApplications] = useState({});
  const [showImport, setShowImport] = useState(false);
  const [tsvInput, setTsvInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableSort, setTableSort] = useState({ col: 'submittedAt', dir: 'desc' });

  const handleParse = () => {
    const apps = parseTSV(tsvInput);
    setParsed(apps);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!parsed || parsed.length === 0) return;
    setImporting(true);
    setImportResult(null);
    try {
      const resp = await fetch('/api/applications/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications: parsed })
      });
      const data = await resp.json();
      setImportResult(data);
      if (data.success) {
        setParsed(null);
        setTsvInput('');
      }
    } catch (err) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setImporting(false);
    }
  };

  // Filter and search
  const filteredApps = useMemo(() => {
    let list = applications;
    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        (a.firstName || '').toLowerCase().includes(q) ||
        (a.lastName || '').toLowerCase().includes(q) ||
        (a.schoolEmail || '').toLowerCase().includes(q) ||
        (a.personalEmail || '').toLowerCase().includes(q) ||
        (a.schoolName || '').toLowerCase().includes(q) ||
        (a.city || '').toLowerCase().includes(q) ||
        (a.state || '').toLowerCase().includes(q)
      );
    }
    // Sort for table view
    const { col, dir } = tableSort;
    list = [...list].sort((a, b) => {
      let va = a[col] || '', vb = b[col] || '';
      if (col === 'submittedAt') { va = va || 0; vb = vb || 0; }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [applications, statusFilter, searchQuery, tableSort]);

  const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'imported').length;

  const handleSort = (col) => {
    setTableSort(prev => ({
      col,
      dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortArrow = ({ col }) => {
    if (tableSort.col !== col) return null;
    return <span className="ml-0.5">{tableSort.dir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  // CSV export
  const handleExportCSV = () => {
    const headers = ['First Name', 'Last Name', 'School Email', 'Personal Email', 'School', 'City', 'State', 'Grades', 'Devices', 'Class Size', 'Biggest Challenge', 'Why Pilot', 'Tools Used', 'Can Commit', 'Other', 'Status', 'Applied'];
    const escape = (v) => {
      const s = String(v || '').replace(/"/g, '""');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
    };
    const rows = filteredApps.map(a => [
      a.firstName, a.lastName, a.schoolEmail, a.personalEmail, a.schoolName,
      a.city, a.state, (a.grades || []).join('; '), (a.devices || []).join('; '),
      a.classSize, a.biggestChallenge, a.whyPilot, (a.toolsUsed || []).join('; '),
      a.canCommit, a.anythingElse, a.status,
      a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : ''
    ].map(escape).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pilot-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-green-200 overflow-hidden bg-white">
      {/* Header */}
      <div className="px-6 py-4 bg-green-50 border-b border-green-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Inbox size={20} />
          Pilot Applications
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {pendingCount} pending / {applications.length} total
          </span>
          <button
            onClick={() => { setShowImport(!showImport); setParsed(null); setImportResult(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          >
            <Upload size={14} />
            Import
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Import from Google Sheets</h3>
            <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Copy all rows from your Google Sheet (including the header row) and paste below.
          </p>
          <textarea
            value={tsvInput}
            onChange={(e) => { setTsvInput(e.target.value); setParsed(null); setImportResult(null); }}
            placeholder="Paste TSV data here (Ctrl+V from Google Sheets)..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-y focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleParse}
              disabled={!tsvInput.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              Parse Data
            </button>
            {parsed && (
              <>
                <span className="text-sm text-gray-700">
                  Found <strong>{parsed.length}</strong> applications ready to import
                </span>
                <button
                  onClick={handleImport}
                  disabled={importing || parsed.length === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : `Import ${parsed.length} Applications`}
                </button>
              </>
            )}
          </div>
          {importResult && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {importResult.success
                ? `Imported ${importResult.imported} applications. ${importResult.skipped} skipped (duplicates or missing email).`
                : `Error: ${importResult.error}`}
            </div>
          )}
        </div>
      )}

      {/* Toolbar: search, filters, view toggle, export */}
      {applications.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, school..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-300 focus:border-green-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="imported">Imported</option>
            <option value="rejected">Declined</option>
          </select>
          <span className="text-sm text-gray-500">{filteredApps.length} shown</span>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
              title="Export CSV"
            >
              <Download size={14} /> CSV
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
              title="Card view"
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
              title="Table view"
            >
              <Table size={18} />
            </button>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No applications yet. Teachers will apply at musicmindacademy.com/apply
        </div>
      ) : viewMode === 'table' ? (
        /* ============ TABLE / SPREADSHEET VIEW ============ */
        <div className="overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'firstName', label: 'Name', w: 'w-[14%]' },
                  { key: 'schoolEmail', label: 'Email', w: 'w-[20%]' },
                  { key: 'schoolName', label: 'School', w: 'w-[16%]' },
                  { key: 'city', label: 'Location', w: 'w-[12%]' },
                  { key: 'grades', label: 'Grades', w: 'w-[8%]' },
                  { key: 'devices', label: 'Devices', w: 'w-[10%]' },
                  { key: 'status', label: 'Status', w: 'w-[8%]' },
                  { key: 'submittedAt', label: 'Applied', w: 'w-[7%]' },
                ].map(({ key, label, w }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`${w} px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none`}
                  >
                    {label}<SortArrow col={key} />
                  </th>
                ))}
                <th className="w-[5%] px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Act.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.map((app) => {
                const st = (app.status || '').toLowerCase();
                const isPending = st === 'pending' || st === 'imported';
                const isApproved = st === 'approved';
                const expanded = expandedApplications[app.id];
                return (
                  <React.Fragment key={app.id}>
                    <tr
                      className={`hover:bg-gray-50 cursor-pointer ${app.status === 'rejected' ? 'opacity-50' : ''}`}
                      onClick={() => setExpandedApplications(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                    >
                      <td className="px-2 py-2 font-medium text-gray-800 truncate" title={`${app.firstName} ${app.lastName}`}>
                        {app.firstName} {app.lastName}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate" title={app.schoolEmail}>
                        {app.schoolEmail}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate" title={app.schoolName}>
                        {app.schoolName}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate" title={`${app.city || ''}${app.state ? ', ' + app.state : ''}`}>
                        {app.city || '--'}{app.state ? `, ${app.state}` : ''}
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">{(app.grades || []).join(', ') || '--'}</td>
                      <td className="px-2 py-2 text-gray-600 truncate text-xs">{(app.devices || []).join(', ') || '--'}</td>
                      <td className="px-2 py-2">
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGE[app.status] || 'bg-gray-100 text-gray-500'}`}>
                          {app.status === 'rejected' ? 'Declined' : (app.status || '?').charAt(0).toUpperCase() + (app.status || '').slice(1)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-gray-500 text-xs">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
                      </td>
                      <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        {(isPending || isApproved) && (
                          <button
                            onClick={() => handleApproveApplication(app)}
                            disabled={approvingId === app.id}
                            className={`px-2 py-1 text-white rounded text-xs font-medium disabled:opacity-50 ${
                              isApproved ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {approvingId === app.id ? '...' : isApproved ? 'Re' : 'OK'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div><span className="text-gray-500">Personal Email:</span> <span className="text-gray-800">{app.personalEmail || '--'}</span></div>
                            <div><span className="text-gray-500">Class Size:</span> <span className="text-gray-800">{app.classSize || '--'}</span></div>
                            {app.toolsUsed?.length > 0 && <div><span className="text-gray-500">Tools Used:</span> <span className="text-gray-800">{app.toolsUsed.join(', ')}</span></div>}
                            {app.canCommit && <div><span className="text-gray-500">Can Commit:</span> <span className="text-gray-800">{app.canCommit}</span></div>}
                            {app.biggestChallenge && (
                              <div className="col-span-2 lg:col-span-3">
                                <span className="text-gray-500">Biggest Challenge:</span>
                                <p className="text-gray-800 mt-1">{app.biggestChallenge}</p>
                              </div>
                            )}
                            {app.whyPilot && (
                              <div className="col-span-2 lg:col-span-3">
                                <span className="text-gray-500">Why Pilot:</span>
                                <p className="text-gray-800 mt-1">{app.whyPilot}</p>
                              </div>
                            )}
                            {app.anythingElse && (
                              <div className="col-span-2 lg:col-span-3">
                                <span className="text-gray-500">Other:</span>
                                <p className="text-gray-800 mt-1">{app.anythingElse}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ============ CARD VIEW ============ */
        <div className="divide-y divide-gray-100">
          {filteredApps.map((app) => {
            const cst = (app.status || '').toLowerCase();
            const isPending = cst === 'pending';
            const isImported = cst === 'imported';
            const isApprovedCard = cst === 'approved';
            const expanded = expandedApplications[app.id];

            return (
              <div key={app.id} className={`px-6 py-4 ${app.status === 'rejected' ? 'bg-gray-50 opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800">
                        {app.firstName} {app.lastName}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_BADGE[app.status] || 'bg-gray-100 text-gray-500'}`}>
                        {app.status === 'rejected' ? 'Declined' : (app.status || 'unknown').charAt(0).toUpperCase() + (app.status || '').slice(1)}
                      </span>
                      {app.source === 'google-form' && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">Google Form</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {app.schoolEmail} &middot; {app.schoolName}
                      {app.city && ` \u00B7 ${app.city}${app.state ? ', ' + app.state : ''}`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Applied {new Date(app.submittedAt).toLocaleDateString()} at {new Date(app.submittedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedApplications(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {(isPending || isImported || isApprovedCard) && (
                      <>
                        <button
                          onClick={() => handleApproveApplication(app)}
                          disabled={approvingId === app.id}
                          className={`px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 ${
                            isApprovedCard ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {approvingId === app.id ? 'Approving...' : isApprovedCard ? 'Re-approve' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app)}
                          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Personal Email:</span> <span className="text-gray-800">{app.personalEmail}</span></div>
                    <div><span className="text-gray-500">School Email:</span> <span className="text-gray-800">{app.schoolEmail}</span></div>
                    {app.grades?.length > 0 && <div><span className="text-gray-500">Grades:</span> <span className="text-gray-800">{app.grades.join(', ')}</span></div>}
                    {app.devices?.length > 0 && <div><span className="text-gray-500">Devices:</span> <span className="text-gray-800">{app.devices.join(', ')}</span></div>}
                    {app.classSize && <div><span className="text-gray-500">Class Size:</span> <span className="text-gray-800">{app.classSize}</span></div>}
                    {app.toolsUsed?.length > 0 && <div><span className="text-gray-500">Tools Used:</span> <span className="text-gray-800">{app.toolsUsed.join(', ')}</span></div>}
                    {app.canCommit && <div className="col-span-2"><span className="text-gray-500">Can Commit:</span> <span className="text-gray-800">{app.canCommit}</span></div>}
                    {app.biggestChallenge && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Biggest Challenge:</span>
                        <p className="text-gray-800 mt-1">{app.biggestChallenge}</p>
                      </div>
                    )}
                    {app.whyPilot && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Why Pilot:</span>
                        <p className="text-gray-800 mt-1">{app.whyPilot}</p>
                      </div>
                    )}
                    {app.anythingElse && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Other:</span>
                        <p className="text-gray-800 mt-1">{app.anythingElse}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
