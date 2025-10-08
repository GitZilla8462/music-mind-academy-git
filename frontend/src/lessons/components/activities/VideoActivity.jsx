import React from 'react';
import VideoPlayer from './video/VideoPlayer';

const VideoActivity = ({ 
  activity, 
  onComplete,
  lessonPath = '' 
}) => {
  // Construct video path based on lesson structure
  const videoSrc = activity.videoSrc || 
    `${lessonPath}/${activity.videoFile || 'video.mp4'}`;

  return (
    <div className="h-full">
      <VideoPlayer
        src={videoSrc}
        onComplete={onComplete}
        title={activity.title}
        allowFullscreen={activity.allowFullscreen || false}
        showNotice={activity.showSeekingNotice !== false}
      />
    </div>
  );
};

export default VideoActivity;