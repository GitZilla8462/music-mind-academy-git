// composer/components/NotesPanel.jsx - Submission notes sidebar
import React from 'react';

const NotesPanel = ({ submissionNotes, setSubmissionNotes, setHasUnsavedChanges }) => {
  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
      <h3 className="text-lg font-semibold mb-3">Submission Notes</h3>
      <textarea
        value={submissionNotes}
        onChange={(e) => {
          setSubmissionNotes(e.target.value);
          setHasUnsavedChanges(true);
        }}
        placeholder="Describe your creative choices, what mood you were trying to create, or any challenges you faced..."
        className="w-full h-40 p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
        maxLength={1000}
      />
      <div className="text-xs text-gray-400 mt-1">
        {submissionNotes.length}/1000 characters
      </div>
      <p className="text-sm text-gray-400 mt-3">
        These notes will be submitted with your composition and help your teacher understand your creative process.
      </p>
    </div>
  );
};

export default NotesPanel;