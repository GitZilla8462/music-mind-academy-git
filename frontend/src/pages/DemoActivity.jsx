// File: /pages/DemoActivity.jsx
// Standalone demo page for teachers to preview activities
// Opens in new window, shows exactly what students see

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import ActivityRenderer from '../lessons/shared/components/ActivityRenderer';

const DemoActivity = () => {
  const [searchParams] = useSearchParams();
  const activityType = searchParams.get('activity');
  const activityTitle = searchParams.get('title') || 'Activity Preview';
  const [isReady, setIsReady] = useState(false);

  // Mock composition data for reflection activities that need it
  const mockCompositionData = {
    placedLoops: [
      { id: 'demo-1', name: 'Epic Drums', category: 'drums', duration: 4, trackIndex: 0, startTime: 0 },
      { id: 'demo-2', name: 'Funky Bass', category: 'bass', duration: 4, trackIndex: 1, startTime: 0 },
      { id: 'demo-3', name: 'Bright Synth', category: 'melody', duration: 4, trackIndex: 2, startTime: 0 },
      { id: 'demo-4', name: 'Piano Chords', category: 'keys', duration: 4, trackIndex: 3, startTime: 0 },
      { id: 'demo-5', name: 'String Pad', category: 'strings', duration: 4, trackIndex: 4, startTime: 0 },
    ],
    videoDuration: 30,
    videoId: 'demo',
    videoTitle: 'Demo Video',
    timestamp: Date.now()
  };

  // Set up mock data BEFORE rendering the activity
  useEffect(() => {
    if (activityType === 'two-stars-wish') {
      // Mock composition data matching what TwoStarsAndAWishActivity expects
      const mockSchoolBeneathData = {
        placedLoops: [
          { id: 'demo-1', name: 'Mysterious Piano', category: 'Mysterious', duration: 4, trackIndex: 0, startTime: 0 },
          { id: 'demo-2', name: 'Eerie Strings', category: 'Mysterious', duration: 4, trackIndex: 1, startTime: 0 },
          { id: 'demo-3', name: 'Dark Pad', category: 'Mysterious', duration: 4, trackIndex: 2, startTime: 4 },
          { id: 'demo-4', name: 'Tension Drums', category: 'Mysterious', duration: 4, trackIndex: 3, startTime: 8 },
          { id: 'demo-5', name: 'Haunting Melody', category: 'Mysterious', duration: 4, trackIndex: 4, startTime: 8 },
        ],
        requirements: {
          minLoops: 5,
          completed: true
        },
        videoDuration: 60
      };
      
      // Set the keys that TwoStarsAndAWishActivity checks
      localStorage.setItem('school-beneath-composition', JSON.stringify(mockSchoolBeneathData));
      localStorage.setItem('school-beneath', JSON.stringify(mockSchoolBeneathData));
      
      console.log('✅ Demo: Set up mock school-beneath composition data');
    }
    
    // For city composition, clear any saved video selection so teacher sees the selection screen
    if (activityType === 'city-composition-activity') {
      // Clear saved video so teacher sees the video selection experience
      localStorage.removeItem('lesson3-selected-video');
      console.log('✅ Demo: Cleared city video selection for fresh demo experience');
    }
    
    // For sports composition, clear any saved video selection
    if (activityType === 'sports-composition-activity') {
      localStorage.removeItem('lesson2-selected-video');
      console.log('✅ Demo: Cleared sports video selection for fresh demo experience');
    }
    
    // Mark as ready after mock data is set
    setIsReady(true);
    
  }, [activityType]);

  // Build activity object for ActivityRenderer
  const activity = activityType ? {
    id: 'demo',
    type: activityType,
    title: activityTitle
  } : null;

  const handleClose = () => {
    window.close();
  };

  const handleComplete = () => {
    // In demo mode, just show a completion message
    console.log('Demo activity completed');
  };

  if (!activityType) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold mb-2">No Activity Specified</h1>
          <p className="text-gray-400 mb-6">Please specify an activity type in the URL</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // Wait for mock data to be set up before rendering
  if (!isReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Demo Header Bar */}
      <div className="bg-purple-600 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">👁️ TEACHER PREVIEW</span>
          <span className="text-purple-200">|</span>
          <span className="text-purple-100">{activityTitle}</span>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit Preview</span>
        </button>
      </div>

      {/* Activity Content */}
      <div className="flex-1 overflow-hidden">
        <ActivityRenderer
          activity={activity}
          onComplete={handleComplete}
          navToolsEnabled={false}
          canAccessNavTools={false}
          viewMode={false}
          isSessionMode={false}
        />
      </div>
    </div>
  );
};

export default DemoActivity;