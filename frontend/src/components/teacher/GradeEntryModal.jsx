// Grade Entry Modal Component
// src/components/teacher/GradeEntryModal.jsx
// Modal for teachers to enter grades and feedback - supports points or letter grades

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Check } from 'lucide-react';
import { gradeSubmission } from '../../firebase/grades';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';

const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'F'];

// Quick feedback labels for compositions
const QUICK_FEEDBACK = [
  { id: 'great-layering', label: 'Great layering', positive: true },
  { id: 'fits-mood', label: 'Fits the mood', positive: true },
  { id: 'creative-choices', label: 'Creative choices', positive: true },
  { id: 'good-timing', label: 'Good timing', positive: true },
  { id: 'nice-variety', label: 'Nice variety', positive: true },
  { id: 'strong-form', label: 'Strong form', positive: true },
  { id: 'needs-variety', label: 'Try more variety', positive: false },
  { id: 'consider-timing', label: 'Consider timing', positive: false },
  { id: 'add-layers', label: 'Add more layers', positive: false },
  { id: 'match-mood', label: 'Match the mood', positive: false }
];

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
  const { user } = useFirebaseAuth();

  // Grading type: 'points' or 'letter'
  const [gradeType, setGradeType] = useState(currentGrade?.type || 'points');

  // Letter grade
  const [letterGrade, setLetterGrade] = useState(currentGrade?.grade || '');

  // Points-based grade
  const [points, setPoints] = useState(currentGrade?.points?.toString() || '');
  const [maxPoints, setMaxPoints] = useState(currentGrade?.maxPoints?.toString() || '100');

  // Feedback
  const [selectedFeedback, setSelectedFeedback] = useState(currentGrade?.quickFeedback || []);
  const [feedback, setFeedback] = useState(currentGrade?.feedback || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens with new student/lesson
  useEffect(() => {
    setGradeType(currentGrade?.type || 'points');
    setLetterGrade(currentGrade?.grade || '');
    setPoints(currentGrade?.points?.toString() || '');
    setMaxPoints(currentGrade?.maxPoints?.toString() || '100');
    setSelectedFeedback(currentGrade?.quickFeedback || []);
    setFeedback(currentGrade?.feedback || '');
    setError(null);
  }, [currentGrade, student?.studentUid, lesson?.id]);

  const toggleFeedback = (id) => {
    setSelectedFeedback(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    // Validate
    if (gradeType === 'letter' && !letterGrade) {
      setError('Please select a letter grade');
      return;
    }
    if (gradeType === 'points' && !points) {
      setError('Please enter a point value');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const gradeData = {
        type: gradeType,
        ...(gradeType === 'letter' ? {
          grade: letterGrade
        } : {
          points: parseInt(points, 10),
          maxPoints: parseInt(maxPoints, 10)
        }),
        quickFeedback: selectedFeedback,
        feedback: feedback || null,
        activityId: activity?.id || null,
        activityType: activity?.type || 'composition'
      };

      const result = await gradeSubmission(
        classId,
        student.studentUid,
        lesson.id,
        gradeData,
        user.uid
      );

      onSave(student.studentUid, lesson.id, result);
    } catch (err) {
      console.error('Error saving grade:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="p-6 space-y-6">
          {/* Grade Type Toggle */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Grading Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGradeType('points')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  gradeType === 'points'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Points
              </button>
              <button
                onClick={() => setGradeType('letter')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  gradeType === 'letter'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Letter Grade
              </button>
            </div>
          </div>

          {/* Points Input */}
          {gradeType === 'points' && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Points</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  placeholder="0"
                  min="0"
                  max={maxPoints}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-500 text-lg">/</span>
                <input
                  type="number"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  placeholder="100"
                  min="1"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-500 ml-2">points</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set the max points for this assignment
              </p>
            </div>
          )}

          {/* Letter Grade Selection */}
          {gradeType === 'letter' && (
            <div>
              <label className="block text-gray-700 font-medium mb-3">Grade</label>
              <div className="flex gap-2">
                {GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setLetterGrade(g)}
                    className={`w-14 h-14 rounded-lg text-xl font-bold transition-all ${
                      letterGrade === g
                        ? g === 'A'
                          ? 'bg-green-600 text-white ring-2 ring-green-400'
                          : g === 'B'
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                          : g === 'C'
                          ? 'bg-yellow-600 text-white ring-2 ring-yellow-400'
                          : g === 'D'
                          ? 'bg-orange-600 text-white ring-2 ring-orange-400'
                          : 'bg-red-600 text-white ring-2 ring-red-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Feedback Labels */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Quick Feedback</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_FEEDBACK.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleFeedback(item.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedFeedback.includes(item.id)
                      ? item.positive
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-400'
                        : 'bg-amber-100 text-amber-700 ring-2 ring-amber-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {selectedFeedback.includes(item.id) && (
                    <Check size={12} className="inline mr-1" />
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Additional Comments (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add personalized feedback for this student..."
              className="w-full h-24 border border-gray-300 rounded-lg p-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This feedback will be visible to the student
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
            disabled={saving || (gradeType === 'letter' && !letterGrade) || (gradeType === 'points' && !points)}
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
                Save Grade
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeEntryModal;
