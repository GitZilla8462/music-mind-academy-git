// /src/pages/SolfegeDemo.jsx - Cleaned version (Exercise 1 now has direct route)
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const SolfegeDemo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exerciseId = searchParams.get('exercise') || '2';

  const exerciseInfo = {
    2: { title: 'Do-Re-Mi', description: 'Identify Do, Re, and Mi notes' },
    3: { title: 'Do-Re-Mi-Fa', description: 'Identify Do through Fa' },
    4: { title: 'Do-Re-Mi-Fa-Sol', description: 'Identify Do through Sol' },
    5: { title: 'Do-Re-Mi-Fa-Sol-La', description: 'Identify Do through La' },
    6: { title: 'Full Scale', description: 'Complete solfege scale' }
  };

  const currentExercise = exerciseInfo[exerciseId] || exerciseInfo['2'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.close()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Close Demo</span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <Home className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Teacher Preview Mode
            </div>
          </div>
        </div>
      </div>

      {/* Demo content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Exercise {exerciseId}: {currentExercise.title}
          </h1>
          <p className="text-lg text-gray-600">
            {currentExercise.description}
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
            <p className="text-yellow-800 text-sm">
              🎯 This is a preview for teachers. Students will see the same interactive exercise.
            </p>
          </div>
        </div>

        {/* Exercise Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="text-6xl">🎵</div>
            <h3 className="text-xl font-semibold text-gray-800">
              {currentExercise.title} Exercise Preview
            </h3>
            
            <div className="space-y-4">
              <p className="text-gray-600 max-w-2xl mx-auto">
                This exercise is coming soon! Exercise 1 (Do-Re) is currently available as a direct demo.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <h4 className="font-medium text-gray-800 mb-4">Planned Features:</h4>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li>• Interactive musical staff notation</li>
                  <li>• Audio playback of solfege notes</li>
                  <li>• Multiple solfege syllable options</li>
                  <li>• Progressive difficulty</li>
                  <li>• Real-time progress tracking</li>
                  <li>• Detailed completion analytics</li>
                </ul>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/exercise-1')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Exercise 1 (Do-Re)
                </button>
                <button
                  onClick={() => window.close()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolfegeDemo;