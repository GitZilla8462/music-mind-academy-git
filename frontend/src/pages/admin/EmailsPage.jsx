import React, { useState, useMemo, useEffect } from 'react';
import { Mail, Send, Eye, EyeOff, Clock, CheckCircle, AlertCircle, Pencil, RotateCcw, Save, X } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

const EMAIL_TEMPLATES = [
  {
    id: 'drip-1',
    name: 'Welcome Email',
    subject: "You're in! Music Mind Academy pilot access is ready",
    trigger: 'Immediately on approval',
    description: 'Sent to teachers when their application is approved. Contains login instructions and pilot dates.',
    color: 'sky',
    outreachField: 'dripWelcomeSent',
    from: 'Rob Taube - Music Mind Academy',
    variables: ['firstName', 'siteUrl', 'loginUrl'],
  },
  {
    id: 'drip-2',
    name: '7-Day Follow-up',
    subject: 'Just checking in - have you had a chance to log in?',
    trigger: '7 days after approval, if no login',
    description: 'Auto-sent to teachers who were approved but haven\'t logged in after a week.',
    color: 'blue',
    outreachField: 'dripFollowup1Sent',
    from: 'Rob Taube - Music Mind Academy',
    variables: ['firstName', 'siteUrl', 'loginUrl'],
  },
  {
    id: 'drip-3',
    name: 'Final Reminder',
    subject: 'Last reminder - your pilot access is waiting',
    trigger: '14 days after approval, if no login',
    description: 'Last automated reminder for teachers who still haven\'t logged in.',
    color: 'indigo',
    outreachField: 'dripFollowup2Sent',
    from: 'Rob Taube - Music Mind Academy',
    variables: ['firstName', 'siteUrl', 'loginUrl'],
  },
  {
    id: 'survey-l3',
    name: 'Mid-Pilot Survey',
    subject: "You're halfway through the pilot! Quick survey inside",
    trigger: 'After Lesson 3 real class (10+ min, 3+ stages)',
    description: 'Automatically sent when a teacher completes Lesson 3 with a real class.',
    color: 'purple',
    outreachField: 'emailedL3',
    from: 'Music Mind Academy',
    variables: ['firstName', 'surveyUrl', 'siteUrl'],
  },
  {
    id: 'survey-l5',
    name: 'Final Survey',
    subject: 'You finished the pilot! Final survey inside',
    trigger: 'After Lesson 5 real class (10+ min, 3+ stages)',
    description: 'Automatically sent when a teacher completes Lesson 5 with a real class.',
    color: 'green',
    outreachField: 'emailedDone',
    from: 'Music Mind Academy',
    variables: ['firstName', 'surveyUrl', 'siteUrl'],
  },
  {
    id: 'application-notify',
    name: 'Application Notification',
    subject: 'New pilot application: [Name]',
    trigger: 'When teacher submits application form',
    description: 'Sent to admin (rob@musicmindacademy.com) with application details and approve/decline buttons.',
    color: 'orange',
    outreachField: null,
    from: 'Music Mind Academy',
    variables: ['fullName', 'applicationTable', 'applicationDetails', 'approveUrl', 'declineUrl', 'siteUrl'],
  },
];

const colorClasses = {
  sky: { border: 'border-l-sky-500', bg: 'bg-sky-50', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700' },
  blue: { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  purple: { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  green: { border: 'border-l-green-500', bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  orange: { border: 'border-l-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
};

const EmailsPage = () => {
  const { teacherOutreach, user } = useAdminData();
  const [previewType, setPreviewType] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendingType, setSendingType] = useState(null);
  const [sendResult, setSendResult] = useState(null);

  // Edit state
  const [editingType, setEditingType] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editHtml, setEditHtml] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [customTemplates, setCustomTemplates] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  // Load custom template status on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch('/api/email/templates');
        if (res.ok) {
          const templates = await res.json();
          const map = {};
          templates.forEach(t => {
            if (t.isCustom) map[t.type] = t;
          });
          setCustomTemplates(map);
        }
      } catch (err) {
        console.warn('Failed to load template status:', err.message);
      }
    };
    loadTemplates();
  }, []);

  const stats = useMemo(() => {
    const counts = { 'drip-1': 0, 'drip-2': 0, 'drip-3': 0, 'survey-l3': 0, 'survey-l5': 0 };
    Object.values(teacherOutreach).forEach(entry => {
      if (entry.dripWelcomeSent) counts['drip-1']++;
      if (entry.dripFollowup1Sent) counts['drip-2']++;
      if (entry.dripFollowup2Sent) counts['drip-3']++;
      if (entry.emailedL3) counts['survey-l3']++;
      if (entry.emailedDone) counts['survey-l5']++;
    });
    return counts;
  }, [teacherOutreach]);

  const wrapPreviewHtml = (html) => {
    // Wrap email HTML - links open in new tab, not inside the iframe
    return `<!DOCTYPE html><html><head><base target="_blank"></head><body style="margin:0;padding:16px;background:#f3f4f6;">${html}</body></html>`;
  };

  const handlePreview = async (type) => {
    if (previewType === type) {
      setPreviewType(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewType(type);
    try {
      const res = await fetch(`/api/email/preview/${type}`);
      const data = await res.json();
      setPreviewHtml(wrapPreviewHtml(data.html));
    } catch (err) {
      setPreviewHtml(`<p style="color: red; padding: 20px;">Failed to load preview: ${err.message}</p>`);
    }
    setPreviewLoading(false);
  };

  const handleEdit = async (type) => {
    if (editingType === type) {
      setEditingType(null);
      return;
    }
    setEditLoading(true);
    setEditingType(type);
    try {
      // Load current template (custom or default) from the templates list endpoint
      const res = await fetch('/api/email/templates');
      if (res.ok) {
        const templates = await res.json();
        const template = templates.find(t => t.type === type);
        if (template) {
          setEditSubject(template.subject);
          setEditHtml(template.htmlContent);
        }
      }
    } catch (err) {
      console.warn('Failed to load template for editing:', err.message);
    }
    setEditLoading(false);
  };

  const handleSave = async (type) => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch(`/api/email/templates/${type}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editSubject,
          htmlContent: editHtml,
          updatedBy: user.email
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult({ type, success: true });
        setCustomTemplates(prev => ({ ...prev, [type]: data.template }));
        setEditingType(null);
        // Refresh preview if open
        if (previewType === type) {
          handlePreview(type);
        }
        setTimeout(() => setSaveResult(null), 3000);
      } else {
        setSaveResult({ type, success: false, error: data.error });
      }
    } catch (err) {
      setSaveResult({ type, success: false, error: err.message });
    }
    setSaving(false);
  };

  const handleReset = async (type) => {
    if (!confirm('Reset this template to the default? Your custom version will be deleted.')) return;
    try {
      const res = await fetch(`/api/email/templates/${type}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCustomTemplates(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        setEditingType(null);
        setSaveResult({ type, success: true, message: 'Reset to default' });
        if (previewType === type) {
          handlePreview(type);
        }
        setTimeout(() => setSaveResult(null), 3000);
      }
    } catch (err) {
      console.error('Failed to reset template:', err);
    }
  };

  const handleSendTest = async (type) => {
    setSendingType(type);
    setSendResult(null);
    try {
      let body;
      if (type === 'application-notify') {
        body = {
          applicationId: 'test-preview',
          firstName: 'Test', lastName: 'Teacher',
          schoolEmail: user.email, personalEmail: user.email,
          schoolName: 'Test School', city: 'Test City', state: 'TS',
          grades: ['6th', '7th'], devices: ['Chromebooks'], classSize: '25',
          whyPilot: 'This is a test application sent from the admin email preview page.',
        };
      } else if (type.startsWith('survey')) {
        body = { email: user.email, displayName: 'Rob Taube' };
      } else {
        body = { email: user.email, name: 'Rob' };
      }

      const res = await fetch(`/api/email/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setSendResult({ type, success: data.success, error: data.error });
      if (data.success) {
        setTimeout(() => setSendResult(null), 4000);
      }
    } catch (err) {
      setSendResult({ type, success: false, error: err.message });
    }
    setSendingType(null);
  };

  const totalSent = Object.values(stats).reduce((sum, n) => sum + n, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Mail size={24} />
            Email Templates
          </h1>
          <p className="text-sm text-gray-500 mt-1">Preview, edit, test, and monitor all automated emails</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{totalSent}</div>
          <div className="text-xs text-gray-500">Total emails sent</div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-3">
        {EMAIL_TEMPLATES.filter(t => t.outreachField).map(template => {
          const colors = colorClasses[template.color];
          return (
            <div key={template.id} className={`px-3 py-2 rounded-lg ${colors.badge} text-sm font-medium`}>
              {template.name}: {stats[template.id] || 0} sent
            </div>
          );
        })}
      </div>

      {/* Email template cards */}
      <div className="space-y-4">
        {EMAIL_TEMPLATES.map(template => {
          const colors = colorClasses[template.color];
          const isPreviewOpen = previewType === template.id;
          const isEditing = editingType === template.id;
          const isSending = sendingType === template.id;
          const result = sendResult?.type === template.id ? sendResult : null;
          const saved = saveResult?.type === template.id ? saveResult : null;
          const isCustom = !!customTemplates[template.id];

          return (
            <div key={template.id} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${colors.border} overflow-hidden`}>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{template.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                        {template.id}
                      </span>
                      {isCustom && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Customized
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Subject:</span> {template.subject}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {template.trigger}
                      </span>
                      <span>From: {template.from}</span>
                      {template.outreachField && (
                        <span className="flex items-center gap-1 font-medium text-gray-600">
                          <Send size={12} />
                          {stats[template.id] || 0} sent
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handlePreview(template.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isPreviewOpen
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isPreviewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
                      {isPreviewOpen ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      onClick={() => handleEdit(template.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isEditing
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      <Pencil size={14} />
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleSendTest(template.id)}
                      disabled={isSending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Send size={14} />
                      {isSending ? 'Sending...' : 'Send Test'}
                    </button>
                  </div>
                </div>

                {/* Send/save result */}
                {result && (
                  <div className={`mt-3 flex items-center gap-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {result.success ? `Test sent to ${user.email}` : `Failed: ${result.error}`}
                  </div>
                )}
                {saved && (
                  <div className={`mt-3 flex items-center gap-2 text-sm ${saved.success ? 'text-green-600' : 'text-red-600'}`}>
                    {saved.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {saved.success ? (saved.message || 'Template saved!') : `Failed: ${saved.error}`}
                  </div>
                )}
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div className="border-t border-gray-200 bg-amber-50/50 p-4">
                  {editLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Variable hints */}
                      <div className="bg-white rounded-lg border border-amber-200 p-3">
                        <p className="text-xs font-medium text-amber-700 mb-1">Available variables (use in HTML):</p>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map(v => (
                            <code key={v} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-mono">
                              {`{{${v}}}`}
                            </code>
                          ))}
                        </div>
                      </div>

                      {/* Subject line */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>

                      {/* HTML editor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">HTML Template</label>
                        <textarea
                          value={editHtml}
                          onChange={(e) => setEditHtml(e.target.value)}
                          rows={18}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 leading-relaxed"
                          spellCheck={false}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleSave(template.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Save size={14} />
                          {saving ? 'Saving...' : 'Save Template'}
                        </button>
                        {isCustom && (
                          <button
                            onClick={() => handleReset(template.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            <RotateCcw size={14} />
                            Reset to Default
                          </button>
                        )}
                        <button
                          onClick={() => setEditingType(null)}
                          className="flex items-center gap-1.5 px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preview panel */}
              {isPreviewOpen && !isEditing && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
                    Email Preview (sample data)
                    {isCustom && <span className="ml-2 text-amber-600 normal-case">showing custom version</span>}
                  </div>
                  {previewLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full border-0"
                        style={{ height: '450px' }}
                        title={`${template.name} preview`}
                        sandbox="allow-popups allow-popups-to-escape-sandbox"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmailsPage;
