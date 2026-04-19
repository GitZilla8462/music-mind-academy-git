// ViewingPartyMode.jsx
// Teacher-facing read-only playback of student projects
// Shows student's film score with video + audio in sync

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Users, Film } from 'lucide-react';
import FilmMusicCompositionActivity from '../../../shared/activities/FilmMusicCompositionActivity';

const ViewingPartyMode = ({ onComplete, isSessionMode = false }) => {
  // In a real implementation, this would pull student projects from Firebase
  // For now, it loads the current device's project (localStorage)
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [isShowingDAW, setIsShowingDAW] = useState(false);

  // Placeholder student list — in production, pull from Firebase session data
  const students = [
    { id: 'local', name: 'My Project' }
  ];

  const handlePrev = useCallback(() => {
    setCurrentStudentIndex(prev => Math.max(0, prev - 1));
    setIsShowingDAW(false);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStudentIndex(prev => Math.min(students.length - 1, prev + 1));
    setIsShowingDAW(false);
  }, [students.length]);

  const currentStudent = students[currentStudentIndex];

  if (isShowingDAW) {
    return (
      <div className="h-screen flex flex-col">
        {/* Student header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <button
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
            onClick={() => setIsShowingDAW(false)}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to List
          </button>
          <span className="text-white font-medium text-sm">
            {currentStudent.name} — {currentStudentIndex + 1} of {students.length}
          </span>
          <div className="flex gap-2">
            <button
              className="p-1.5 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              onClick={handlePrev}
              disabled={currentStudentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
              onClick={handleNext}
              disabled={currentStudentIndex === students.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Read-only composition */}
        <div className="flex-1">
          <FilmMusicCompositionActivity viewMode />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 p-8">
      <Film className="w-16 h-16 text-orange-400 mb-4" />
      <h1 className="text-3xl font-bold text-white mb-2">Viewing Party</h1>
      <p className="text-gray-400 text-lg mb-8">
        Watch each student's scored film — no commentary during, applause after!
      </p>

      {/* Student list */}
      <div className="w-full max-w-md space-y-2 mb-8">
        {students.map((student, i) => (
          <button
            key={student.id}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              i === currentStudentIndex
                ? 'bg-orange-600/20 border border-orange-500 text-white'
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => {
              setCurrentStudentIndex(i);
              setIsShowingDAW(true);
            }}
          >
            <Users className="w-5 h-5 text-gray-500" />
            <span className="font-medium">{student.name}</span>
            <Play className="w-4 h-4 ml-auto text-gray-500" />
          </button>
        ))}
      </div>

      {/* Play selected */}
      <button
        className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all"
        onClick={() => setIsShowingDAW(true)}
      >
        <Play className="w-5 h-5" />
        Play {currentStudent.name}
      </button>
    </div>
  );
};

export default ViewingPartyMode;
