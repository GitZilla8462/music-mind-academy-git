// Delete Class Confirmation Modal
// src/components/teacher/DeleteClassModal.jsx
// Confirmation dialog before deleting a class

import React, { useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { deleteClass } from '../../firebase/classes';

const DeleteClassModal = ({ isOpen, onClose, classData, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      await deleteClass(classData.id);
      onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const className = classData?.name || 'this class';
  const canDelete = confirmText.toLowerCase() === 'delete';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Delete Class</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{className}</strong>?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            <p className="font-semibold mb-2">This action cannot be undone!</p>
            <p>Deleting this class will permanently remove:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>All student roster information</li>
              <li>All student submissions</li>
              <li>All grades and feedback</li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Type "delete" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
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
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || !canDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Class
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteClassModal;
