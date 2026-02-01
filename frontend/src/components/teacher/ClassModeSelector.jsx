// Class Mode Selector Component
// src/components/teacher/ClassModeSelector.jsx
// Allows teachers to choose between Classroom Mode and Student Accounts Mode

import React from 'react';
import { Users, UserCheck } from 'lucide-react';

const ClassModeSelector = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Class Mode
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Classroom Mode */}
        <button
          type="button"
          onClick={() => onChange('classroom')}
          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
            value === 'classroom'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
          }`}
        >
          {value === 'classroom' && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              value === 'classroom' ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              <Users className={`w-5 h-5 ${value === 'classroom' ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Classroom Mode</h3>
              <span className="text-xs text-green-600 font-medium">Recommended</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Students join with a class code and pick a musical name. No accounts needed.
          </p>

          <ul className="text-xs text-gray-500 space-y-1">
            <li className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Zero student data collected
            </li>
            <li className="flex items-center gap-1">
              <span className="text-green-500">✓</span> No DPA required
            </li>
            <li className="flex items-center gap-1">
              <span className="text-green-500">✓</span> Quick session-based access
            </li>
          </ul>
        </button>

        {/* Student Accounts Mode */}
        <button
          type="button"
          onClick={() => onChange('accounts')}
          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
            value === 'accounts'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          {value === 'accounts' && (
            <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              value === 'accounts' ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
              <UserCheck className={`w-5 h-5 ${value === 'accounts' ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Student Accounts</h3>
              <span className="text-xs text-blue-600 font-medium">Persistent Data</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Students have accounts with saved work, grades, and feedback across sessions.
          </p>

          <ul className="text-xs text-gray-500 space-y-1">
            <li className="flex items-center gap-1">
              <span className="text-blue-500">✓</span> Work saved permanently
            </li>
            <li className="flex items-center gap-1">
              <span className="text-blue-500">✓</span> Gradebook & feedback
            </li>
            <li className="flex items-center gap-1">
              <span className="text-blue-500">✓</span> Google Sign-In or PIN login
            </li>
          </ul>
        </button>
      </div>

      {/* Mode explanation */}
      <div className={`mt-4 p-3 rounded-lg text-sm ${
        value === 'classroom' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
      }`}>
        {value === 'classroom' ? (
          <p>
            <strong>Classroom Mode:</strong> Best for quick activities where you don't need to track
            individual student progress over time. Students join anonymously with a class code.
          </p>
        ) : (
          <p>
            <strong>Student Accounts Mode:</strong> Best when you want to track student work, assign grades,
            and provide feedback. Students sign in with Google or a class code + PIN. Requires school
            authorization for student data collection.
          </p>
        )}
      </div>
    </div>
  );
};

export default ClassModeSelector;
