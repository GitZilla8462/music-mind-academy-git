// /timeline/components/VideoTrackHeader.jsx
// FIXED: Reduced width from 192px to 154px (80% width)
import React from 'react';
import { TIMELINE_CONSTANTS } from '../constants/timelineConstants';

const VideoTrackHeader = () => {
  return (
    <div 
      className="bg-gray-700 border-r border-gray-600 border-b border-gray-700"
      style={{ width: '154px', height: TIMELINE_CONSTANTS.VIDEO_TRACK_HEIGHT }}
    >
      <div className="p-2 flex items-center h-full">
        <span className="text-white text-sm font-medium">Video</span>
      </div>
    </div>
  );
};

export default VideoTrackHeader;