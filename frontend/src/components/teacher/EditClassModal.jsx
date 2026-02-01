// Edit Class Modal Component
// src/components/teacher/EditClassModal.jsx
// Modal for editing class name and settings

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updateClass } from '../../firebase/classes';

const EditClassModal = ({ isOpen, onClose, classData, onSave }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (classData) {
      setName(classData.name || '');
      setError(null);
    }
  }, [classData]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Class name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateClass(classData.id, { name: name.trim() });
      onSave();
      onClose();
    } catch (err) {
      console.error('Error updating class:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Class Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Class Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 3rd Period Music"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Class Code (read-only) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Class Code
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg font-mono text-gray-600">
              {classData?.classCode || classData?.code || '----'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Class codes cannot be changed
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;
