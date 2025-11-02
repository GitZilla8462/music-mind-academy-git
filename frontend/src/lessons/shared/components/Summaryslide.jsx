// File: /src/lessons/shared/components/Summaryslide.jsx
// Instructional slide shown before each major activity
// UPDATED: Simplified format - just text points, no titles. Smaller numbers, larger text.

import React from 'react';
import { Clock } from 'lucide-react';

const SummarySlide = ({ title, points, estimatedTime, icon, sessionCode }) => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center overflow-hidden">
      {/* 16:9 Container - Like Google Slides */}
      <div className="w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center p-12">
        <div className="w-full h-full flex flex-col">
          
          {/* Header: Session Code */}
          {sessionCode && (
            <div className="text-center mb-6">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg px-6 py-2">
                <span className="text-gray-300 text-xl">Code: </span>
                <span className="text-white text-3xl font-bold tracking-wider font-mono">{sessionCode}</span>
              </div>
            </div>
          )}

          {/* Main Content Card - Fits perfectly on screen */}
          <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 flex flex-col">
            
            {/* Title Section - Top 30% */}
            <div className="text-center mb-8">
              {icon && (
                <div className="text-8xl mb-4">
                  {icon}
                </div>
              )}
              <h1 className="text-6xl font-bold text-gray-900 mb-3 leading-tight">
                {title}
              </h1>
              {estimatedTime && (
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-3">
                  <Clock size={28} />
                  <span className="text-2xl font-semibold">Time: {estimatedTime}</span>
                </div>
              )}
            </div>

            {/* Three Points - Middle 60% - LARGE TEXT, SMALLER NUMBERS */}
            <div className="flex-1 flex flex-col justify-center space-y-6">
              {points.map((point, index) => (
                <div key={index} className="flex items-center gap-6">
                  {/* Number Circle - SMALLER */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">{index + 1}</span>
                  </div>
                  
                  {/* Content - LARGER TEXT, READABLE FROM BACK OF ROOM */}
                  <div className="flex-1">
                    <div className="text-5xl text-gray-800 font-semibold leading-snug">
                      {point}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Bottom 10% */}
            <div className="mt-6 pt-6 border-t-2 border-gray-300 text-center">
              <p className="text-gray-600 text-2xl font-semibold">
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