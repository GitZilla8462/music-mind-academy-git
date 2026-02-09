// Help Tooltip Component
// src/components/shared/HelpTooltip.jsx
// Contextual help icons that explain features on hover/click

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

const HelpTooltip = ({
  text,
  title,
  position = 'top', // 'top', 'bottom', 'left', 'right'
  size = 'sm', // 'sm', 'md'
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  // Arrow classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent'
  };

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        aria-label="Help"
      >
        <HelpCircle size={iconSize} />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]}`}
        >
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-3 max-w-xs">
            {title && (
              <div className="font-semibold text-sm mb-1">{title}</div>
            )}
            <div className="text-xs text-gray-200 leading-relaxed">{text}</div>
          </div>
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

// Pre-defined help content for common features
export const HELP_CONTENT = {
  classroomMode: {
    title: 'Quick Join',
    text: 'Students join with a 4-digit code. No accounts needed. Work is not saved between sessions. Best for one-time use or demonstrations.'
  },
  accountsMode: {
    title: 'Classroom Mode',
    text: 'Students log in with a username and PIN. Their work is saved automatically. You can view submissions and enter grades in the Gradebook.'
  },
  sessionCode: {
    title: 'Session Code',
    text: 'Share this 4-digit code with your students. They go to the join page and enter the code to connect to your lesson.'
  },
  pendingSubmissions: {
    title: 'Pending Submissions',
    text: 'These are student submissions waiting for your review. Click to open the Gradebook and provide grades and feedback.'
  },
  gradebook: {
    title: 'Gradebook',
    text: 'View all student submissions, enter grades (A-F), and provide written feedback. Only available for classes in Classroom Mode.'
  },
  roster: {
    title: 'Class Roster',
    text: 'Manage which students are in your class. Add students with usernames and PINs for login.'
  }
};

export default HelpTooltip;
