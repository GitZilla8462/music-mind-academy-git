// Onboarding Checklist Component
// src/components/teacher/OnboardingChecklist.jsx
// Research-backed: "3 small wins" pattern — progressive disclosure, not overwhelming
// Dependent steps merged (create roster + print cards = one flow)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  BookOpen,
  Users,
  Play
} from 'lucide-react';
import { dismissWelcomeBanner } from './onboarding/WelcomeBanner';

const CHECKLIST_STATE_KEY = 'teacher-onboarding-checklist';
const CHECKLIST_DISMISSED_KEY = 'teacher-onboarding-checklist-dismissed';
const LESSON_PREVIEWED_KEY = 'teacher-previewed-lesson';

// 3 small wins — research-backed onboarding pattern
const ONBOARDING_TASKS = [
  {
    id: 'preview-lesson',
    title: 'Preview a lesson',
    icon: BookOpen,
    action: 'preview-lesson',
  },
  {
    id: 'setup-class',
    title: 'Set up your class',
    icon: Users,
    action: 'setup-class',
  },
  {
    id: 'run-first-class',
    title: 'Run your first class',
    icon: Play,
    action: 'run-first-class',
  }
];

const OnboardingChecklist = ({
  classes = [],
  onCreateClass,
  onBrowseLessons,
  hasStartedSession = false,
}) => {
  const navigate = useNavigate();
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

    // Step 1: previewed a lesson (flag set when they navigate to a lesson)
    if (localStorage.getItem(LESSON_PREVIEWED_KEY) === 'true' && !completedTasks['preview-lesson']) {
      newCompleted['preview-lesson'] = true;
      changed = true;
    }

    // Step 2: class exists = setup complete
    if (classes.length > 0 && !completedTasks['setup-class']) {
      newCompleted['setup-class'] = true;
      changed = true;
      setCelebrateTask('setup-class');
      setTimeout(() => setCelebrateTask(null), 2000);
    }

    // Step 3: started a session
    if (hasStartedSession && !completedTasks['run-first-class']) {
      newCompleted['run-first-class'] = true;
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
      case 'preview-lesson': {
        // Scroll to Unit 1 card and highlight it so teachers discover the navigation
        const unitCard = document.getElementById('unit-card-1');
        if (unitCard) {
          unitCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          unitCard.classList.add('onboarding-highlight');
          setTimeout(() => unitCard.classList.remove('onboarding-highlight'), 3000);
        }
        break;
      }
      case 'setup-class':
        // Smart step: if no class yet, create one. If class exists, go to it.
        if (classes.length > 0) {
          navigate(`/teacher/class/${classes[0].id}`);
        } else {
          onCreateClass?.();
        }
        break;
      case 'run-first-class':
        onBrowseLessons?.();
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

  // Don't show if dismissed
  if (isDismissed) return null;

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${allComplete ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">{completedCount}/{totalTasks}</span>
      </div>

      {/* Task List */}
      <div className="space-y-1.5">
        {ONBOARDING_TASKS.map((task, index) => {
          const isComplete = completedTasks[task.id];
          const isCelebrating = celebrateTask === task.id;
          const Icon = task.icon;

          return (
            <div
              key={task.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                isComplete
                  ? 'bg-white/40'
                  : 'bg-white/80 hover:bg-white cursor-pointer hover:shadow-sm'
              } ${isCelebrating ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
              onClick={() => !isComplete && handleTaskAction(task)}
            >
              {/* Step number / check */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform duration-300 ${isCelebrating ? 'scale-125' : ''}`}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm leading-tight ${isComplete ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {task.title}
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
      </div>

      {/* All complete message */}
      {allComplete && (
        <div className="text-center pt-3">
          <p className="text-green-700 font-medium text-sm">You're all set!</p>
          <button
            onClick={() => {
              handleDismiss();
              dismissWelcomeBanner();
              window.location.reload();
            }}
            className="mt-1 text-xs text-green-600 hover:text-green-700 underline"
          >
            Hide this guide
          </button>
        </div>
      )}
    </div>
  );
};

// Export function to reset checklist (for testing)
export const resetOnboardingChecklist = () => {
  localStorage.removeItem(CHECKLIST_STATE_KEY);
  localStorage.removeItem(CHECKLIST_DISMISSED_KEY);
  localStorage.removeItem(LESSON_PREVIEWED_KEY);
};

// Export function to check if checklist should show
export const shouldShowOnboardingChecklist = () => {
  return localStorage.getItem(CHECKLIST_DISMISSED_KEY) !== 'true';
};

export default OnboardingChecklist;
