// Create Class Modal
// src/components/teacher/CreateClassModal.jsx
// Updated: Paste names instead of entering count, shows musical usernames

import React, { useState } from 'react';
import { X, Users, Loader2, Copy, Check, Printer, RotateCcw, Trash2, Pencil } from 'lucide-react';
import { createClass, deleteClass } from '../../firebase/classes';
import { bulkAddSeats, removeSeat, updateSeat } from '../../firebase/enrollments';

import { useNavigate } from 'react-router-dom';

const CreateClassModal = ({ isOpen, onClose, teacherUid, onClassCreated, fromLessonStart = false }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Name, 2: Add Students, 3: Success
  const [className, setClassName] = useState('');
  const [studentNames, setStudentNames] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [createdClass, setCreatedClass] = useState(null);
  const [createdSeats, setCreatedSeats] = useState([]);
  const [copied, setCopied] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [editName, setEditName] = useState('');

  // Parse names from pasted text — handles numbered lists, commas, tabs,
  // sequential numbers jammed into text, student IDs, and extra columns
  const parseNames = (text) => {
    // Split by newlines first
    let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // If only 1 line, try other splitting strategies
    if (lines.length === 1) {
      const line = lines[0];

      if (line.includes(',')) {
        // Comma-separated
        lines = line.split(',').map(l => l.trim()).filter(l => l.length > 0);
      } else {
        // Try splitting on numbered list patterns with punctuation: "1. Name 2. Name"
        const withPunct = line.split(/(?=\d{1,3}[\.\)\-]\s*[A-Za-z])/);
        if (withPunct.length >= 3) {
          lines = withPunct.map(l => l.trim()).filter(l => l.length > 0);
        } else {
          // Detect sequential numbers jammed into text: "Name2Name3Name"
          // Find all number occurrences and check if any form a sequence
          const matches = [...line.matchAll(/\d+/g)];
          if (matches.length >= 3) {
            // Try sequences starting from 1, 2, or 0
            for (const startVal of [1, 2, 0]) {
              const seqMatches = [];
              let expected = startVal;
              for (const m of matches) {
                if (parseInt(m[0]) === expected) {
                  seqMatches.push(m);
                  expected++;
                }
              }
              // Need at least 3 sequential hits to be confident
              if (seqMatches.length >= 3) {
                const parts = [];
                // Text before the first list number
                if (seqMatches[0].index > 0) {
                  parts.push(line.substring(0, seqMatches[0].index));
                }
                // Each segment from one list number to the next
                for (let i = 0; i < seqMatches.length; i++) {
                  const start = seqMatches[i].index;
                  const end = i < seqMatches.length - 1
                    ? seqMatches[i + 1].index
                    : line.length;
                  parts.push(line.substring(start, end));
                }
                lines = parts.map(l => l.trim()).filter(l => l.length > 0);
                break;
              }
            }
          }
        }
      }
    }

    // Clean each line
    return lines.map(line => {
      // Strip leading numbering: "1.", "1)", "1-", "1 ", "01.", etc.
      let name = line.replace(/^\d+[\.\)\-:\s]+/, '');
      // Also strip a bare leading number jammed against text: "2Barry" → "Barry"
      name = name.replace(/^\d+(?=[A-Za-z])/, '');
      // Strip leading bullet characters
      name = name.replace(/^[•\-–—\*]+\s*/, '');
      // If line has tabs (spreadsheet paste), take first non-numeric column
      if (name.includes('\t')) {
        const cols = name.split('\t').map(c => c.trim());
        name = cols.find(c => c && !/^\d+$/.test(c)) || cols[0];
      }
      // Strip standalone student IDs (4+ digit sequences)
      name = name.replace(/\b\d{4,}\b/g, '');
      // Strip email addresses
      name = name.replace(/\S+@\S+\.\S+/g, '');
      // Collapse extra whitespace
      name = name.replace(/\s+/g, ' ').trim();
      return name;
    }).filter(name => name.length > 0 && !/^\d+$/.test(name));
  };

  const handleNext = () => {
    if (!className.trim()) {
      setError('Please enter a class name');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleCreateClass = async () => {
    const names = parseNames(studentNames);
    const count = names.length;

    if (count === 0) {
      setError('Please enter at least one student name');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create the class
      const newClass = await createClass(teacherUid, {
        name: className.trim(),
        mode: 'accounts',
        description: ''
      });

      setCreatedClass(newClass);

      // Add student seats with names (or default names for count mode)
      const seats = await bulkAddSeats(newClass.id, count, 1, names);
      setCreatedSeats(seats);
      setStep(3);
    } catch (err) {
      console.error('Error creating class:', err);
      setError(err.message || 'Failed to create class');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setClassName('');
    setStudentNames('');
    setError(null);
    setCreatedClass(null);
    setCreatedSeats([]);
    setCopied(false);
    onClose();
  };

  const handleFinish = () => {
    if (createdClass) {
      onClassCreated?.(createdClass);
      // If opened from lesson start flow, don't navigate — parent reopens StartSessionModal
      if (!fromLessonStart) {
        navigate(`/teacher/class/${createdClass.id}`);
      }
    }
    handleClose();
  };

  const copyRosterToClipboard = () => {
    const rosterText = createdSeats
      .map(seat => `${seat.displayName}\t${seat.username}\t${seat.pin}`)
      .join('\n');

    const fullText = `Class: ${className}\n\nName\tUsername\tPassword\n${rosterText}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (createdClass) {
      onClassCreated?.(createdClass);
      if (fromLessonStart) {
        // Open print page in new tab so teacher stays on lesson flow
        window.open(`/teacher/class/${createdClass.id}?print=true`, '_blank');
      } else {
        navigate(`/teacher/class/${createdClass.id}?print=true`);
      }
    }
    handleClose();
  };

  // Remove a single seat from the roster
  const handleRemoveSeat = async (seat) => {
    if (!createdClass) return;
    try {
      await removeSeat(createdClass.id, seat.seatNumber);
      setCreatedSeats(prev => prev.filter(s => s.seatNumber !== seat.seatNumber));
    } catch (err) {
      console.error('Error removing seat:', err);
    }
  };

  // Rename a seat
  const handleRenameSeat = async (seat) => {
    if (!createdClass || !editName.trim()) return;
    try {
      await updateSeat(createdClass.id, seat.seatNumber, { displayName: editName.trim() });
      setCreatedSeats(prev => prev.map(s =>
        s.seatNumber === seat.seatNumber ? { ...s, displayName: editName.trim() } : s
      ));
      setEditingSeat(null);
      setEditName('');
    } catch (err) {
      console.error('Error renaming seat:', err);
    }
  };

  // Delete the just-created class and go back to step 2 to re-enter names
  const handleStartOver = async () => {
    if (createdClass) {
      try {
        await deleteClass(createdClass.id);
      } catch (err) {
        console.error('Error deleting class for redo:', err);
      }
    }
    setCreatedClass(null);
    setCreatedSeats([]);
    setCopied(false);
    setError(null);
    setStep(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 && 'Create New Class'}
              {step === 2 && 'Add Students'}
              {step === 3 && 'Class Created!'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Class Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., 3rd Period Music"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Add Students */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your student names
                  </label>
                  <textarea
                    value={studentNames}
                    onChange={(e) => setStudentNames(e.target.value)}
                    placeholder="Sarah M.&#10;John D.&#10;Emma W.&#10;..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40 resize-none font-mono text-sm"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    One per line, or comma-separated. Numbers and bullets are stripped automatically.
                    {parseNames(studentNames).length > 0 && (
                      <span className="text-blue-600 font-medium ml-1">
                        {parseNames(studentNames).length} student{parseNames(studentNames).length !== 1 ? 's' : ''} detected
                      </span>
                    )}
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Each student gets a unique <strong>musical username</strong> (like "tuba123")
                    and a <strong>password</strong> for signing in.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Success & Roster */}
            {step === 3 && createdClass && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Class created successfully!</span>
                  </div>
                </div>

                {createdSeats.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Student Logins</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={copyRosterToClipboard}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? 'Copied!' : 'Copy All'}
                        </button>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600 font-medium">Name</th>
                            <th className="px-3 py-2 text-left text-gray-600 font-medium">Username</th>
                            <th className="px-3 py-2 text-left text-gray-600 font-medium">Password</th>
                            <th className="w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {createdSeats.map((seat) => (
                            <tr key={seat.seatNumber} className="hover:bg-gray-50 group">
                              <td className="px-3 py-1.5 text-gray-900">
                                {editingSeat === seat.seatNumber ? (
                                  <form onSubmit={(e) => { e.preventDefault(); handleRenameSeat(seat); }} className="flex gap-1">
                                    <input
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full px-1.5 py-0.5 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      autoFocus
                                      onBlur={() => { setEditingSeat(null); setEditName(''); }}
                                      onKeyDown={(e) => { if (e.key === 'Escape') { setEditingSeat(null); setEditName(''); } }}
                                    />
                                  </form>
                                ) : (
                                  <span
                                    onClick={() => { setEditingSeat(seat.seatNumber); setEditName(seat.displayName); }}
                                    className="cursor-pointer hover:text-blue-600"
                                    title="Click to edit name"
                                  >
                                    {seat.displayName}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-1.5 font-mono text-blue-600 font-medium text-sm">{seat.username}</td>
                              <td className="px-3 py-1.5 font-mono font-bold text-gray-900 text-sm">{seat.pin}</td>
                              <td className="px-2 py-1.5">
                                <button
                                  onClick={() => handleRemoveSeat(seat)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                                  title="Remove student"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <strong>Next step:</strong> Print login cards to give each student their username and password.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
            {step === 1 && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  disabled={!className.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateClass}
                  disabled={isCreating || parseNames(studentNames).length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Class'
                  )}
                </button>
              </>
            )}

            {step === 3 && (
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleFinish}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    {fromLessonStart ? 'Print later' : 'Skip for now'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <Printer size={18} />
                    Print Login Cards
                  </button>
                </div>
                <button
                  onClick={handleStartOver}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mx-auto"
                >
                  <RotateCcw size={12} />
                  Names wrong? Start over
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClassModal;
