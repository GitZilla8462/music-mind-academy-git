// Grade Entry Modal Component
// src/components/teacher/GradeEntryModal.jsx
// Modal wrapper for GradeForm - used for standalone grading from Grades tab / StudentDetailModal

import React from 'react';
import { X } from 'lucide-react';
import GradeForm from './GradeForm';

const GradeEntryModal = ({
  isOpen,
  onClose,
  student,
  lesson,
  activity,
  classId,
  currentGrade,
  submission,
  onSave
}) => {
  if (!isOpen) return null;

  const displayName = student?.displayName || student?.name || `Student ${student?.seatNumber}`;
  const activityName = activity?.name || lesson?.name || 'Assignment';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Grade Submission</h2>
            <p className="text-sm text-gray-500">
              {displayName} - {activityName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <GradeForm
            student={student}
            lesson={lesson}
            activity={activity}
            classId={classId}
            currentGrade={currentGrade}
            submission={submission}
            onSave={onSave}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeEntryModal;
