import React from 'react';
import { CheckCircle } from 'lucide-react';

const FeedbackMessage = ({
  exerciseComplete,
  showResult,
  selectedAnswer,
  correctAnswer
}) => {
  if (exerciseComplete || !showResult) return null;

  return (
    <div className="absolute bottom-4 left-6 right-6 text-center" style={{ zIndex: 11 }}>
      {selectedAnswer === correctAnswer ? (
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Correct!</span>
        </div>
      ) : (
        <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
          <span className="font-semibold">Incorrect</span>
        </div>
      )}
    </div>
  );
};

export default FeedbackMessage;