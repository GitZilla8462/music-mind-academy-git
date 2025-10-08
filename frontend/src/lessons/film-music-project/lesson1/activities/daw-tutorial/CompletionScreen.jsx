// File: /src/lessons/film-music-project/lesson1/activities/daw-tutorial/CompletionScreen.jsx

import React from 'react';
import { CheckCircle } from 'lucide-react';

const CompletionScreen = () => {
  return (
    <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center p-8">
        <CheckCircle className="mx-auto text-green-500 mb-6" size={96} />
        <h2 className="text-4xl font-bold text-green-800 mb-4">
          DAW Basics Complete!
        </h2>
        <p className="text-green-700 mb-8 text-xl">
          You've mastered the fundamentals of the DAW interface!
        </p>
        <div className="text-gray-600">Moving to next activity...</div>
      </div>
    </div>
  );
};

export default CompletionScreen;