// AnswerKeyModal.jsx
// Full-screen modal that lets teachers create/edit answer keys
// by completing the same activity students use.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Save, Trash2, Key } from 'lucide-react';
import ActivityRenderer from '../../lessons/shared/components/ActivityRenderer';
import { saveAnswerKey, getAnswerKey, deleteAnswerKey } from '../../firebase/answerKeys';
import { getStudentId } from '../../utils/studentWorkStorage';

// Map curriculumConfig activityId → ActivityRenderer switch-case type string
const RENDERER_TYPE_MAP = {
  // Film Music compositions
  'adventure-composition': 'adventure-composition',
  'city-composition': 'city-composition-activity',
  'wildlife-composition': 'wildlife-composition-activity',
  'sports-composition': 'sports-composition-activity',
  'game-composition': 'game-composition-activity',
  // Listening Lab maps
  'dynamics-listening-map': 'dynamics-listening-map',
  'tempo-listening-map': 'tempo-listening-map',
  'form-listening-map': 'form-listening-map',
  // Listening Lab journeys
  'listening-journey': 'listening-journey',
  // Capstone planning
  'capstone-planning': 'capstone-planning',
};

// Storage keys that activities use (most match activityId directly)
const STORAGE_KEY_MAP = {
  'adventure-composition': 'adventure-composition',
  'city-composition': 'city-composition',
  'wildlife-composition': 'wildlife-composition',
  'sports-composition': 'sports-composition',
  'game-composition': 'game-composition',
  'dynamics-listening-map': 'dynamics-listening-map',
  'tempo-listening-map': 'tempo-listening-map',
  'form-listening-map': 'form-listening-map',
  'listening-journey': 'listening-journey',
  'capstone-planning': 'capstone-planning',
};

const AnswerKeyModal = ({
  isOpen,
  onClose,
  lessonId,
  activityId,
  activityName,
  activityType,
  teacherUid
}) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingKey, setExistingKey] = useState(null);
  const [loadingKey, setLoadingKey] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const studentIdRef = useRef(null);

  // Get the renderer type for ActivityRenderer
  const rendererType = RENDERER_TYPE_MAP[activityId] || activityId;
  const storageKey = STORAGE_KEY_MAP[activityId] || activityId;

  // Load existing answer key on mount
  useEffect(() => {
    if (!isOpen || !teacherUid) return;

    setLoadingKey(true);
    getAnswerKey(teacherUid, lessonId, activityId)
      .then(key => {
        setExistingKey(key);
        // If existing key, pre-populate localStorage so activity loads it
        if (key?.data) {
          const id = getStudentId();
          studentIdRef.current = id;
          const lsKey = `mma-saved-${id}-${storageKey}`;
          const saveData = {
            activityId: storageKey,
            title: 'Answer Key',
            emoji: '🔑',
            lastSaved: new Date().toISOString(),
            data: key.data
          };
          localStorage.setItem(lsKey, JSON.stringify(saveData));
        }
      })
      .catch(err => console.error('Error loading answer key:', err))
      .finally(() => setLoadingKey(false));

    return () => {
      // Cleanup temp localStorage on unmount
      cleanupLocalStorage();
    };
  }, [isOpen, teacherUid, lessonId, activityId, storageKey]);

  const cleanupLocalStorage = useCallback(() => {
    const id = studentIdRef.current || getStudentId();
    const lsKey = `mma-saved-${id}-${storageKey}`;
    localStorage.removeItem(lsKey);
  }, [storageKey]);

  const handleSave = async () => {
    console.log('🔑 Answer Key save clicked', { teacherUid, lessonId, activityId, storageKey });
    setSaving(true);
    try {
      const id = getStudentId();
      const lsKey = `mma-saved-${id}-${storageKey}`;
      const raw = localStorage.getItem(lsKey);
      console.log('🔑 localStorage key:', lsKey, '| found:', !!raw, '| length:', raw?.length);

      if (!raw) {
        alert('No work found to save. Please complete the activity first.');
        setSaving(false);
        return;
      }

      const parsed = JSON.parse(raw);
      const workData = parsed.data || parsed;
      console.log('🔑 Saving answer key to Firebase...', { dataKeys: Object.keys(workData) });

      await saveAnswerKey(teacherUid, lessonId, activityId, workData);
      console.log('🔑 Answer key saved successfully!');
      cleanupLocalStorage();
      onClose(true);
    } catch (err) {
      console.error('🔑 Error saving answer key:', err);
      alert('Failed to save answer key. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAnswerKey(teacherUid, lessonId, activityId);
      cleanupLocalStorage();
      onClose(true);
    } catch (err) {
      console.error('Error deleting answer key:', err);
      alert('Failed to delete answer key.');
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleClose = () => {
    cleanupLocalStorage();
    onClose(false);
  };

  if (!isOpen) return null;

  // Construct the activity object for ActivityRenderer
  const activity = {
    id: `answer-key-${activityId}`,
    type: rendererType,
    activityId: activityId,
    title: activityName
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gray-900">
      {/* Header — z-[10001] keeps it above any activity fixed elements (ListeningMap uses z-9999) */}
      <div className="relative z-[10001] flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="flex items-center gap-3">
          <Key size={18} className="text-amber-400" />
          <div>
            <h2 className="text-white font-semibold text-sm">
              {existingKey ? 'Edit' : 'Create'} Answer Key
            </h2>
            <p className="text-gray-400 text-xs">{activityName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {existingKey && !showConfirmDelete && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
            >
              <Trash2 size={13} />
              Delete Key
            </button>
          )}

          {showConfirmDelete && (
            <div className="flex items-center gap-2 bg-red-900/40 px-3 py-1 rounded border border-red-700">
              <span className="text-red-300 text-xs">Delete this answer key?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-2 py-0.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                No
              </button>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <Save size={13} />
            {saving ? 'Saving...' : 'Save as Answer Key'}
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Activity Area */}
      <div className="flex-1 overflow-hidden">
        {loadingKey ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <ActivityRenderer
            activity={activity}
            onComplete={() => {
              // Activity completed — teacher can now click Save
              console.log('Answer key activity completed');
            }}
            viewMode={false}
            isSessionMode={false}
          />
        )}
      </div>
    </div>
  );
};

export default AnswerKeyModal;
