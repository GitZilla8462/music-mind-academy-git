// Product Tour Component
// src/components/teacher/ProductTour.jsx
// Research-backed: Interactive walkthroughs increase activation by 10%
// 3-5 step guided tour for first-time users

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Users,
  Play,
  BarChart3,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const TOUR_COMPLETED_KEY = 'teacher-product-tour-completed';
const TOUR_SKIPPED_KEY = 'teacher-product-tour-skipped';

// Define tour steps
const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Music Mind Academy!',
    description: 'Let\'s take a quick tour to help you get started. This will only take a minute.',
    icon: Sparkles,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    tip: null
  },
  {
    id: 'browse-lessons',
    title: 'Browse Lessons',
    description: 'Explore our curriculum of 5 lessons covering mood, texture, form, and more. Each lesson includes interactive activities and compositions.',
    icon: BookOpen,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tip: 'Click "Browse Lessons" in the header anytime to explore'
  },
  {
    id: 'start-session',
    title: 'Start a Live Session',
    description: 'When you\'re ready to teach, click "Start Session" on any lesson. Students join with a simple 4-digit code - no accounts needed!',
    icon: Play,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    tip: 'Students go to the join page and enter your code'
  },
  {
    id: 'class-management',
    title: 'Create Classes (Optional)',
    description: 'Want to track student progress and give grades? Create a class in "Classroom Mode." Students log in to save their work and you\'ll have a gradebook.',
    icon: Users,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    tip: 'Classes are optional - you can teach without them'
  },
  {
    id: 'gradebook',
    title: 'Review & Grade Work',
    description: 'When students submit work, you\'ll see a notification. Open the Gradebook to review submissions and provide feedback.',
    icon: BarChart3,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    tip: 'Look for the bell icon to see pending submissions'
  }
];

const ProductTour = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_SKIPPED_KEY, 'true');
    onClose?.();
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    onComplete?.();
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{currentStep + 1}</span>
            <span>of</span>
            <span>{TOUR_STEPS.length}</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          {/* Icon */}
          <div className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${step.iconColor}`} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-4">
            {step.description}
          </p>

          {/* Tip */}
          {step.tip && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">{step.tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          {/* Skip link */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tour
            </button>
          )}
          {isLastStep && <div />}

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles size={16} />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Check if tour should be shown
export const shouldShowProductTour = () => {
  const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
  const skipped = localStorage.getItem(TOUR_SKIPPED_KEY);
  return completed !== 'true' && skipped !== 'true';
};

// Reset tour (for testing)
export const resetProductTour = () => {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
  localStorage.removeItem(TOUR_SKIPPED_KEY);
};

export default ProductTour;
