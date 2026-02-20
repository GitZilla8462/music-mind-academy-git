// Welcome Banner Component
// Compact side-by-side layout: videos (left) + checklist (right)
// Stays visible until all onboarding tasks are complete

import React, { useState, useRef } from 'react';
import { Play, Maximize2, Minimize2, X } from 'lucide-react';
import OnboardingChecklist from '../OnboardingChecklist';

const BANNER_DISMISSED_KEY = 'teacher-welcome-banner-dismissed';

const BANNER_VIDEOS = [
  {
    id: 'quick-start',
    title: 'Quick Start: Run Your First Lesson',
    label: 'Quick Start Video',
    duration: '4 min',
    src: '/videos/tutorials/quick-start.mp4'
  },
  {
    id: 'assessment-saving',
    title: 'Assessment and Saving Student Work',
    label: 'Assessment & Saving',
    duration: '3 min',
    src: '/videos/tutorials/assessment-saving.mp4'
  }
];

const WelcomeBanner = ({
  teacherName,
  classes = [],
  onCreateClass,
  onBrowseLessons,
  hasStartedSession = false,
  onDismiss,
}) => {
  const [expandedVideo, setExpandedVideo] = useState(null); // video object or null
  const [videoErrors, setVideoErrors] = useState({});
  const videoRef = useRef(null);

  const handleDismiss = () => {
    dismissWelcomeBanner();
    onDismiss?.();
  };

  const handleExpandVideo = (video) => {
    setExpandedVideo(video);
    setTimeout(() => {
      if (videoRef.current) videoRef.current.play();
    }, 100);
  };

  const handleVideoError = (videoId) => {
    setVideoErrors(prev => ({ ...prev, [videoId]: true }));
  };

  // Expanded video view
  if (expandedVideo) {
    return (
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 overflow-hidden mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{expandedVideo.title}</h3>
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.pause();
                setExpandedVideo(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
            >
              <Minimize2 size={14} />
              Collapse
            </button>
          </div>
          <div className="bg-black rounded-lg overflow-hidden aspect-video max-w-2xl">
            {videoErrors[expandedVideo.id] ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Play className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium text-white">Coming Soon</p>
                <p className="text-xs text-gray-500 mt-1">This video is being recorded</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={expandedVideo.src}
                className="w-full h-full"
                controls
                onError={() => handleVideoError(expandedVideo.id)}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact side-by-side view
  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 overflow-hidden mb-4">
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            Welcome{teacherName ? `, ${teacherName}` : ''}!
          </h2>
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors -mt-0.5"
            title="Don't show this anymore"
          >
            <X size={14} />
            <span>Don't show again</span>
          </button>
        </div>

        {/* Side-by-side: Videos (left) + Checklist (right) */}
        <div className="flex gap-4 items-start">
          {/* Video thumbnails — stacked vertically */}
          <div className="flex-shrink-0 flex flex-col gap-2.5">
            {BANNER_VIDEOS.map((video) => (
              <div key={video.id} className="w-48">
                <button
                  onClick={() => handleExpandVideo(video)}
                  className="w-full bg-gray-900 rounded-lg overflow-hidden aspect-video relative group cursor-pointer"
                >
                  {videoErrors[video.id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Play className="w-8 h-8 mb-1" />
                      <p className="text-xs text-white">Coming Soon</p>
                    </div>
                  ) : (
                    <>
                      <video
                        src={video.src}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        onError={() => handleVideoError(video.id)}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        <Maximize2 size={10} />
                        {video.duration}
                      </div>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-1.5 text-center">
                  {video.label}
                </p>
              </div>
            ))}
          </div>

          {/* Checklist (right) */}
          <div className="flex-1 min-w-0">
            <OnboardingChecklist
              classes={classes}
              onCreateClass={onCreateClass}
              onBrowseLessons={onBrowseLessons}
              hasStartedSession={hasStartedSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Check if banner should show (dismissed only when all checklist tasks complete)
export const shouldShowWelcomeBanner = () => {
  if (localStorage.getItem(BANNER_DISMISSED_KEY) === 'true') return false;
  return true;
};

// Called by OnboardingChecklist when all tasks are complete
export const dismissWelcomeBanner = () => {
  localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
};

// Reset banner (for testing)
export const resetWelcomeBanner = () => {
  localStorage.removeItem(BANNER_DISMISSED_KEY);
};

export default WelcomeBanner;
