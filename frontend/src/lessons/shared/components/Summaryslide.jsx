// File: /src/lessons/shared/components/Summaryslide.jsx
// Instructional slide shown before each major activity
// UPDATED: Much larger text (4x), better chromebook fit, larger session code with URL

import React from 'react';
import { Clock } from 'lucide-react';

const SummarySlide = ({ title, points, estimatedTime, icon, sessionCode }) => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center overflow-hidden">
      {/* Fits chromebook 1366x768 and larger projector screens */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-full h-full flex flex-col max-h-screen">
          
          {/* Header: Session Code - 2x bigger */}
          {sessionCode && (
            <div className="text-center mb-6">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-8 py-3">
                <span className="text-gray-300 text-2xl">Code: </span>
                <span className="text-white text-5xl font-bold tracking-wider font-mono">{sessionCode}</span>
              </div>
            </div>
          )}

          {/* Main Content Card - Fits on screen without scrolling */}
          <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 flex flex-col overflow-hidden">
            
            {/* Title Section - Compact */}
            <div className="text-center mb-4">
              {icon && (
                <div className="text-6xl mb-2">
                  {icon}
                </div>
              )}
              <h1 className="text-5xl font-bold text-gray-900 mb-2 leading-tight">
                {title}
              </h1>
              {estimatedTime && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
                  <Clock size={24} />
                  <span className="text-xl font-semibold">Time: {estimatedTime}</span>
                </div>
              )}
            </div>

            {/* Three Points - MUCH LARGER TEXT (4x bigger) */}
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {points.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  {/* Number Circle */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl font-bold">{index + 1}</span>
                  </div>
                  
                  {/* Content - 4X BIGGER TEXT (was text-5xl, now using custom sizing) */}
                  <div className="flex-1">
                    <div className="text-gray-800 font-bold leading-tight" style={{ fontSize: '3.5rem' }}>
                      {point}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Compact */}
            <div className="mt-4 pt-4 border-t-2 border-gray-300 text-center">
              <p className="text-gray-600 text-xl font-semibold">
                Waiting for your teacher to continue...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySlide;