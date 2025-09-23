// src/components/exercises/1.solfege_identification/UI/SolfegeButtons.jsx
import React from 'react';
import useResponsiveMusic from '../Hooks/useResponsiveMusic';

const SolfegeButtons = ({
  syllables,
  onSelect,
  disabled,
  selectedAnswer,
  correctAnswer,
  showResult,
  exerciseComplete
}) => {
  const { deviceType, isMobile, isTablet, config } = useResponsiveMusic();

  if (exerciseComplete) return null;

  // Button styling based on device
  const getButtonClass = (syllable) => {
    let baseClasses = 'font-bold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 touch-manipulation';
    
    // Device-specific sizing
    if (isMobile) {
      baseClasses += ' px-4 py-4 text-base min-h-[48px] min-w-[48px]';
    } else if (isTablet) {
      baseClasses += ' px-6 py-3 text-lg min-h-[44px] min-w-[80px]';
    } else {
      baseClasses += ' px-6 py-3 text-lg';
    }

    // State-based styling
    let stateClasses = 'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400';

    if (showResult) {
      if (syllable === correctAnswer) {
        stateClasses = 'bg-green-500 text-white border-green-600 shadow-lg';
      } else if (syllable === selectedAnswer && syllable !== correctAnswer) {
        stateClasses = 'bg-red-500 text-white border-red-600 shadow-lg';
      }
    }

    // Disabled state
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    // Mobile-specific active state
    const mobileActiveClasses = isMobile ? 'active:scale-95 active:bg-gray-100' : '';

    return `${baseClasses} ${stateClasses} ${disabledClasses} ${mobileActiveClasses}`;
  };

  // Layout based on device type
  const renderButtons = () => {
    return syllables?.map((syllable) => (
      <button
        key={syllable}
        onClick={() => onSelect?.(syllable)}
        disabled={disabled}
        className={getButtonClass(syllable)}
        aria-label={`Select ${syllable} syllable`}
      >
        {syllable}
      </button>
    ));
  };

  return (
    <div className="w-full">
      {/* Mobile Layout: 2-column grid for better touch targets */}
      {isMobile && (
        <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
          {renderButtons()}
        </div>
      )}

      {/* Tablet Layout: Flexible grid */}
      {isTablet && (
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {renderButtons()}
        </div>
      )}

      {/* Desktop Layout: Horizontal flex */}
      {!isMobile && !isTablet && (
        <div className="flex flex-wrap justify-center gap-3">
          {renderButtons()}
        </div>
      )}
    </div>
  );
};

export default SolfegeButtons;