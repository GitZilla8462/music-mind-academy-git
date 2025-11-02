// File: /lessons/shared/components/ActivityRenderer.jsx
// Renders activities based on type - reusable across all lessons
// NOTE: NO countdown timers in student view - only in presentation view

import React from 'react';
import VideoPlayer from './video/VideoPlayer';
import DAWTutorialActivity from '../activities/daw-tutorial/DAWTutorialActivity';
import SchoolBeneathActivity from '../activities/SchoolBeneathActivity';
import TwoStarsAndAWishActivity from '../activities/two-stars-and-a-wish/TwoStarsAndAWishActivity';
import SoundEffectsActivity from '../activities/SoundEffectsActivity';

const ActivityRenderer = ({
  activity,
  onComplete,
  navToolsEnabled = false,
  canAccessNavTools = false,
  lessonStartTime = null,
  viewMode = false,
  viewBonusMode = false,
  showCountdown = false,  // Only true for presentation view
  isSessionMode = false   // ✅ ADD THIS PROP
}) => {
  if (!activity) return null;

  switch (activity.type) {
    case 'video':
      return (
        <VideoPlayer 
          key={`video-${activity.id}`}
          src={activity.src}
          onComplete={onComplete}
          title={activity.title}
          allowSeeking={false}
          showNotice={false}
          allowFullscreen={false}
        />
      );

    case 'daw-tutorial':
      return (
        <DAWTutorialActivity 
          key={`daw-tutorial-${activity.id}`}
          onComplete={onComplete}
          navToolsEnabled={navToolsEnabled}
          canAccessNavTools={canAccessNavTools}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
        />
      );

    case 'school-beneath-activity':
      return (
        <SchoolBeneathActivity 
          key={`school-beneath-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          viewBonusMode={viewBonusMode}
          lessonStartTime={lessonStartTime}
        />
      );

    case 'two-stars-wish':
      return (
        <TwoStarsAndAWishActivity 
          key={`reflection-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      );

    case 'sound-effects':
      return (
        <SoundEffectsActivity 
          key={`sound-effects-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          lessonStartTime={lessonStartTime}
        />
      );

    default:
      return (
        <div className="h-full flex items-center justify-center bg-gray-800 text-white">
          <div className="text-center">
            <p className="text-xl mb-2">Unknown Activity Type</p>
            <p className="text-gray-400">Activity type "{activity.type}" is not supported</p>
          </div>
        </div>
      );
  }
};

export default ActivityRenderer;