// Empty Classes State Component
// src/components/teacher/EmptyClassesState.jsx
// Research-backed empty state design with positive messaging and clear CTAs

import React from 'react';
import {
  Users,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play
} from 'lucide-react';

const EmptyClassesState = ({ onCreateClass, onBrowseLessons }) => {
  return (
    <div className="text-center py-8 px-4">
      {/* Hero illustration */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl transform rotate-6"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
          <div className="text-5xl">🎵</div>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-yellow-600" />
        </div>
      </div>

      {/* Positive headline */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Ready to get started!
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        You have two ways to use Music Mind Academy. Choose what works best for your classroom.
      </p>

      {/* Two paths */}
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
        {/* Path 1: Quick Start */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Quick Start</h4>
              <span className="text-xs text-green-600 font-medium">No setup needed</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Browse lessons and start teaching immediately. Students join with a 4-digit code.
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No student accounts required
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Works on any device
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Zero PII collected
            </li>
          </ul>
          <button
            onClick={onBrowseLessons}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            <BookOpen size={16} />
            Browse Lessons
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Path 2: Full Setup */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Create Classes</h4>
              <span className="text-xs text-blue-600 font-medium">For ongoing use</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Set up classes to track student progress, save work, and enter grades.
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Track student progress
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Students save their work
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Gradebook with feedback
            </li>
          </ul>
          <button
            onClick={onCreateClass}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Users size={16} />
            Create First Class
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-400">
        You can always add classes later from this dashboard
      </p>
    </div>
  );
};

export default EmptyClassesState;
