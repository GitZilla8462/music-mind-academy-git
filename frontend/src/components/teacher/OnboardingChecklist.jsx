// Onboarding Checklist Component
// src/components/teacher/OnboardingChecklist.jsx
// Research-backed: Progress bars increase completion by 12%, checklists by 21%
// Shows teachers their setup progress with 3-5 actionable tasks

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  BookOpen,
  Users,
  Play,
  ClipboardCheck
} from 'lucide-react';

const CHECKLIST_STATE_KEY = 'teacher-onboarding-checklist';
const CHECKLIST_DISMISSED_KEY = 'teacher-onboarding-checklist-dismissed';

// Define the onboarding tasks
const ONBOARDING_TASKS = [
  {
    id: 'create-class',
    title: 'Create your first class',
    description: 'Set up a class to organize students and track progress',
    icon: Users,
    action: 'create-class',
    helpText: 'Classes let you manage rosters and view student work'
  },
  {
    id: 'start-session',
    title: 'Start a lesson session',
    description: 'Launch a lesson and get your 4-digit join code',
    icon: Play,
    action: 'browse-lessons',
    helpText: 'Students join with a simple code - no accounts needed'
  },
  {
    id: 'explore-lessons',
    title: 'Browse available lessons',
    description: 'Explore the Music for Media curriculum',
    icon: BookOpen,
    action: 'browse-lessons',
    helpText: '5 lessons covering mood, texture, form, and more'
  },
  {
    id: 'review-help',
    title: 'Review the help guide',
    description: 'Learn about Classroom vs Student Accounts modes',
    icon: ClipboardCheck,
    action: 'open-help',
    helpText: 'Understand the two ways to use the platform'
  }
];

const OnboardingChecklist = ({
  classes = [],
  onCreateClass,
  onBrowseLessons,
  onOpenHelp,
  hasStartedSession = false
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const [celebrateTask, setCelebrateTask] = useState(null);

  // Load saved state
  useEffect(() => {
    const savedState = localStorage.getItem(CHECKLIST_STATE_KEY);
    const dismissed = localStorage.getItem(CHECKLIST_DISMISSED_KEY);

    if (savedState) {
      try {
        setCompletedTasks(JSON.parse(savedState));
      } catch (e) {
        console.error('Error loading checklist state:', e);
      }
    }

    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Auto-detect completed tasks based on actual data
  useEffect(() => {
    const newCompleted = { ...completedTasks };
    let changed = false;

    // Check if they have any classes
    if (classes.length > 0 && !completedTasks['create-class']) {
      newCompleted['create-class'] = true;
      changed = true;
      setCelebrateTask('create-class');
      setTimeout(() => setCelebrateTask(null), 2000);
    }

    // Check if they've started a session (passed as prop)
    if (hasStartedSession && !completedTasks['start-session']) {
      newCompleted['start-session'] = true;
      changed = true;
    }

    if (changed) {
      setCompletedTasks(newCompleted);
      localStorage.setItem(CHECKLIST_STATE_KEY, JSON.stringify(newCompleted));
    }
  }, [classes, hasStartedSession]);

  // Mark task as complete manually
  const markComplete = (taskId) => {
    const newCompleted = { ...completedTasks, [taskId]: true };
    setCompletedTasks(newCompleted);
    localStorage.setItem(CHECKLIST_STATE_KEY, JSON.stringify(newCompleted));
    setCelebrateTask(taskId);
    setTimeout(() => setCelebrateTask(null), 2000);
  };

  // Handle task action
  const handleTaskAction = (task) => {
    switch (task.action) {
      case 'create-class':
        onCreateClass?.();
        break;
      case 'browse-lessons':
        if (task.id === 'explore-lessons') {
          markComplete('explore-lessons');
        }
        onBrowseLessons?.();
        break;
      case 'open-help':
        markComplete('review-help');
        onOpenHelp?.();
        break;
      default:
        break;
    }
  };

  // Dismiss checklist
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(CHECKLIST_DISMISSED_KEY, 'true');
  };

  // Calculate progress
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = ONBOARDING_TASKS.length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);
  const allComplete = completedCount === totalTasks;

  // Don't show if dismissed or all complete
  if (isDismissed) return null;

  return (
    <div className={`bg-gradient-to-r ${allComplete ? 'from-green-50 to-emerald-50 border-green-200' : 'from-blue-50 to-indigo-50 border-blue-200'} rounded-xl border-2 overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${allComplete ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
            {allComplete ? (
              <Sparkles className="w-5 h-5 text-green-600" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${allComplete ? 'text-green-900' : 'text-gray-900'}`}>
              {allComplete ? 'Setup Complete!' : 'Getting Started'}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${allComplete ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{completedCount}/{totalTasks}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!allComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Task List */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {ONBOARDING_TASKS.map((task) => {
            const isComplete = completedTasks[task.id];
            const isCelebrating = celebrateTask === task.id;
            const Icon = task.icon;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isComplete
                    ? 'bg-white/60'
                    : 'bg-white hover:bg-white/80 cursor-pointer hover:shadow-sm'
                } ${isCelebrating ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
                onClick={() => !isComplete && handleTaskAction(task)}
              >
                {/* Checkbox */}
                <div className={`flex-shrink-0 transition-transform duration-300 ${isCelebrating ? 'scale-125' : ''}`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                </div>

                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isComplete ? 'bg-gray-100' : 'bg-blue-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isComplete ? 'text-gray-400' : 'text-blue-600'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${isComplete ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </div>
                  <div className={`text-xs ${isComplete ? 'text-gray-300' : 'text-gray-500'}`}>
                    {task.description}
                  </div>
                </div>

                {/* Action indicator */}
                {!isComplete && (
                  <div className="text-xs text-blue-600 font-medium whitespace-nowrap">
                    Do this →
                  </div>
                )}
              </div>
            );
          })}

          {/* All complete message */}
          {allComplete && (
            <div className="text-center py-3">
              <p className="text-green-700 font-medium">You're all set!</p>
              <button
                onClick={handleDismiss}
                className="mt-2 text-sm text-green-600 hover:text-green-700 underline"
              >
                Dismiss this checklist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Export function to reset checklist (for testing)
export const resetOnboardingChecklist = () => {
  localStorage.removeItem(CHECKLIST_STATE_KEY);
  localStorage.removeItem(CHECKLIST_DISMISSED_KEY);
};

// Export function to check if checklist should show
export const shouldShowOnboardingChecklist = () => {
  return localStorage.getItem(CHECKLIST_DISMISSED_KEY) !== 'true';
};

export default OnboardingChecklist;
