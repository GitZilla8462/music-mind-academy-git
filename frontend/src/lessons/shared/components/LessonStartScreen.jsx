// File: /lessons/shared/components/LessonStartScreen.jsx
// Lesson start/resume screen - reusable across all lessons

import React from 'react';
import { Play, RotateCcw, CheckCircle } from 'lucide-react';

const LessonStartScreen = ({ 
  config, 
  savedProgress, 
  onStartLesson, 
  onResumeLesson, 
  onStartOver 
}) => {
  return (
    <div className="flex-1 flex items-start justify-center pt-12 p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="bg-white rounded-xl shadow-2xl p-5 max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header - Centered Title */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-4"></div>
          
          {/* Start/Resume Buttons - Centered Under Title */}
          <div className="space-y-2.5 max-w-sm mx-auto">
            {savedProgress ? (
              <>
                <button 
                  onClick={onResumeLesson}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-base font-semibold inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl w-full"
                >
                  <RotateCcw size={20} />
                  <span>Resume Lesson</span>
                </button>
                <button 
                  onClick={onStartOver}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium inline-flex items-center justify-center space-x-2 border-2 border-gray-200 hover:border-gray-300 w-full"
                >
                  <Play size={16} />
                  <span>Start Over</span>
                </button>
              </>
            ) : (
              <button 
                onClick={onStartLesson}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-base font-semibold inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl w-full"
              >
                <Play size={20} />
                <span>Start Lesson</span>
              </button>
            )}
          </div>
        </div>

        {/* Resume Notice */}
        {savedProgress && (
          <div className="mb-3 bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <div className="ml-2">
                <h3 className="text-xs font-medium text-blue-800">Resume Your Progress</h3>
                <div className="mt-0.5 text-xs text-blue-700">
                  <p>You were on Activity {savedProgress.currentActivity + 1}: <strong>{config.activities[savedProgress.currentActivity]?.title}</strong></p>
                  <p className="text-xs mt-0.5 text-blue-600">Last saved: {new Date(savedProgress.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Activities */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-800 flex items-center">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-1.5">#</span>
                Activities
              </h2>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Total: ~{config.activities.reduce((acc, act) => {
                  const time = parseInt(act.estimatedTime);
                  return acc + (isNaN(time) ? 0 : time);
                }, 0)} min
              </span>
            </div>
            <div className="space-y-2">
              {config.activities.map((activity, index) => (
                <div key={index} className="bg-white p-2 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="bg-blue-100 text-blue-700 font-bold w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="font-medium text-gray-800 text-xs">{activity.title}</div>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 ml-2 whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded-full">
                      {activity.estimatedTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
            <h2 className="text-base font-bold mb-2 text-gray-800 flex items-center">
              <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-1.5">✓</span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {config.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2 bg-white p-2 rounded-lg shadow-sm border border-green-100">
                  <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-700 text-xs leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonStartScreen;