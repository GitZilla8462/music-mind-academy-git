// "Exit Session" button for students in session mode
// Positioned absolute top-right within parent container
// Parent must have `relative` positioning
// src/components/ExitSessionButton.jsx

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useSession } from '../context/SessionContext';

const ExitSessionButton = () => {
  const { leaveSession } = useSession();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExit = () => {
    leaveSession();
    const isProduction = window.location.hostname !== 'localhost';
    const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
    let redirectUrl = 'http://localhost:5173/join';
    if (isProduction) {
      redirectUrl = isEduSite ? 'https://musicroomtools.org/join' : 'https://musicmindacademy.com/join';
    }
    window.location.href = redirectUrl;
  };

  if (showConfirm) {
    return (
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-gray-900/95 px-3 py-2 rounded-lg border border-gray-600">
        <span className="text-sm text-gray-200 whitespace-nowrap">Leave session?</span>
        <button
          onClick={handleExit}
          className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
        >
          Yes, Exit
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 border border-gray-700 transition-colors"
    >
      <LogOut size={14} />
      Exit Session
    </button>
  );
};

export default ExitSessionButton;
