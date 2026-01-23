/**
 * ErrorLogViewer - Admin component to view first-party error logs
 * Used in PilotAdminPage to see errors that bypass school firewalls
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle, Eye, Trash2, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const ErrorLogViewer = () => {
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', severity: '', errorType: '' });
  const [expandedError, setExpandedError] = useState(null);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.severity) params.append('severity', filter.severity);
      if (filter.errorType) params.append('errorType', filter.errorType);
      params.append('limit', '50');

      const response = await fetch(`${API_URL}/api/errors?${params}`);
      const data = await response.json();
      setErrors(data.errors || []);
    } catch (err) {
      console.error('Failed to fetch errors:', err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/errors/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch error stats:', err);
    }
  };

  useEffect(() => {
    fetchErrors();
    fetchStats();
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/api/errors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchErrors();
      fetchStats();
    } catch (err) {
      console.error('Failed to update error:', err);
    }
  };

  const deleteError = async (id) => {
    if (!confirm('Delete this error log?')) return;
    try {
      await fetch(`${API_URL}/api/errors/${id}`, { method: 'DELETE' });
      fetchErrors();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete error:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'ignored': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total (7 days)</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.byStatus?.new || 0}</div>
            <div className="text-sm text-gray-500">New</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-red-600">{stats.bySeverity?.critical || 0}</div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">{stats.byStatus?.resolved || 0}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>

          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filter.errorType}
            onChange={(e) => setFilter({ ...filter, errorType: e.target.value })}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="">All Types</option>
            <option value="javascript">JavaScript</option>
            <option value="react">React</option>
            <option value="network">Network</option>
            <option value="audio">Audio</option>
          </select>

          <button
            onClick={() => { fetchErrors(); fetchStats(); }}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Error Logs ({errors.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading errors...</div>
        ) : errors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-2 text-green-400" />
            No errors found
          </div>
        ) : (
          <div className="divide-y">
            {errors.map((error) => (
              <div key={error._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Error message */}
                    <div className="font-mono text-sm text-gray-900 truncate">
                      {error.message}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(error.severity)}`}>
                        {error.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(error.status)}`}>
                        {error.status}
                      </span>
                      <span className="text-xs text-gray-500">{error.page}</span>
                      <span className="text-xs text-gray-400">{error.device}</span>
                      <span className="text-xs text-gray-400">{formatDate(error.createdAt)}</span>
                    </div>

                    {/* Expanded stack trace */}
                    {expandedError === error._id && error.stack && (
                      <pre className="mt-3 p-3 bg-gray-900 text-green-400 text-xs rounded overflow-x-auto max-h-48">
                        {error.stack}
                      </pre>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {error.stack && (
                      <button
                        onClick={() => setExpandedError(expandedError === error._id ? null : error._id)}
                        className="p-1.5 hover:bg-gray-200 rounded"
                        title="View stack trace"
                      >
                        {expandedError === error._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                    {error.status === 'new' && (
                      <button
                        onClick={() => updateStatus(error._id, 'seen')}
                        className="p-1.5 hover:bg-blue-100 rounded text-blue-600"
                        title="Mark as seen"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {error.status !== 'resolved' && (
                      <button
                        onClick={() => updateStatus(error._id, 'resolved')}
                        className="p-1.5 hover:bg-green-100 rounded text-green-600"
                        title="Mark as resolved"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteError(error._id)}
                      className="p-1.5 hover:bg-red-100 rounded text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Pages with Errors */}
      {stats?.topPages?.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Top Pages with Errors</h3>
          <div className="space-y-2">
            {stats.topPages.map((page, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">{page._id}</span>
                <span className="text-sm font-medium text-gray-900">{page.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorLogViewer;
