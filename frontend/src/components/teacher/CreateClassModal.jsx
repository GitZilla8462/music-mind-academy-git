// Create Class Modal
// src/components/teacher/CreateClassModal.jsx
// Updated: Paste names instead of entering count, shows musical usernames

import React, { useState } from 'react';
import { X, Users, Hash, Loader2, Copy, Check, Printer } from 'lucide-react';
import { createClass } from '../../firebase/classes';
import { bulkAddSeats } from '../../firebase/enrollments';

import { useNavigate } from 'react-router-dom';

const CreateClassModal = ({ isOpen, onClose, teacherUid, onClassCreated }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Name & Mode, 2: Add Students, 3: Success
  const [className, setClassName] = useState('');
  const [addMode, setAddMode] = useState('names'); // 'names' or 'count'
  const [studentNames, setStudentNames] = useState('');
  const [studentCount, setStudentCount] = useState(30);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [createdClass, setCreatedClass] = useState(null);
  const [createdSeats, setCreatedSeats] = useState([]);
  const [copied, setCopied] = useState(false);

  // Parse names from textarea (one per line, skip empty)
  const parseNames = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(name => name.length > 0);
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
    const names = addMode === 'names' ? parseNames(studentNames) : [];
    const count = addMode === 'names' ? names.length : studentCount;

    if (count === 0) {
      setError(addMode === 'names'
        ? 'Please enter at least one student name'
        : 'Please enter the number of students');
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
    setAddMode('names');
    setStudentNames('');
    setStudentCount(30);
    setError(null);
    setCreatedClass(null);
    setCreatedSeats([]);
    setCopied(false);
    onClose();
  };

  const handleFinish = () => {
    if (createdClass) {
      onClassCreated?.(createdClass);
      // Navigate to the class page
      navigate(`/teacher/class/${createdClass.id}`);
    }
    handleClose();
  };

  const copyRosterToClipboard = () => {
    const rosterText = createdSeats
      .map(seat => `${seat.displayName}\t${seat.username}\t${seat.pin}`)
      .join('\n');

    const fullText = `Class: ${className}\n\nName\tUsername\tPIN\n${rosterText}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (createdClass) {
      onClassCreated?.(createdClass);
      // Navigate to class page with print modal open
      navigate(`/teacher/class/${createdClass.id}?print=true`);
    }
    handleClose();
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
                {/* Mode Toggle */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setAddMode('names')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      addMode === 'names'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users size={16} />
                    Paste Names
                  </button>
                  <button
                    onClick={() => setAddMode('count')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      addMode === 'count'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Hash size={16} />
                    Enter Count
                  </button>
                </div>

                {/* Names Mode */}
                {addMode === 'names' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Names (one per line)
                    </label>
                    <textarea
                      value={studentNames}
                      onChange={(e) => setStudentNames(e.target.value)}
                      placeholder="Sarah M.&#10;John D.&#10;Emma W.&#10;..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40 resize-none font-mono text-sm"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Tip: Copy from a spreadsheet or type names directly.
                      {parseNames(studentNames).length > 0 && (
                        <span className="text-blue-600 font-medium ml-1">
                          {parseNames(studentNames).length} student{parseNames(studentNames).length !== 1 ? 's' : ''} detected
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Count Mode */}
                {addMode === 'count' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Students
                    </label>
                    <input
                      type="number"
                      value={studentCount}
                      onChange={(e) => setStudentCount(Math.min(40, Math.max(1, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={40}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Students will be named "Seat 1", "Seat 2", etc. You can add names later.
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Each student gets a unique <strong>musical username</strong> (like "tuba123")
                    and a <strong>4-digit PIN</strong> for signing in.
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
                            <th className="px-3 py-2 text-left text-gray-600 font-medium">PIN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {createdSeats.map((seat) => (
                            <tr key={seat.seatNumber} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-900">{seat.displayName}</td>
                              <td className="px-3 py-2 font-mono text-blue-600 font-medium">{seat.username}</td>
                              <td className="px-3 py-2 font-mono font-bold text-gray-900">{seat.pin}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <strong>Next step:</strong> Print login cards to give each student their username and PIN.
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
                  disabled={isCreating || (addMode === 'names' && parseNames(studentNames).length === 0)}
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
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={handleFinish}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Skip for now
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <Printer size={18} />
                  Print Login Cards
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
