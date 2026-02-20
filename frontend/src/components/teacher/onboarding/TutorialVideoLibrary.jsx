// Tutorial Video Library
// Help panel with all tutorial videos, accessible from TeacherHeader
// Videos are self-hosted MP4s — shows "Coming Soon" if file not available

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  Mail,
  ChevronLeft
} from 'lucide-react';
import {
  TUTORIAL_VIDEOS,
  markVideoWatched,
  isVideoWatched,
  getUnwatchedCount
} from './tutorialVideos';

const TutorialVideoLibrary = ({ isOpen, onClose }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoError, setVideoError] = useState({});
  const [watchedState, setWatchedState] = useState({});
  const videoRef = useRef(null);

  // Load watched state
  useEffect(() => {
    if (isOpen) {
      const state = {};
      TUTORIAL_VIDEOS.forEach(v => {
        state[v.id] = isVideoWatched(v.id);
      });
      setWatchedState(state);
    }
  }, [isOpen]);

  const handlePlay = (video) => {
    setActiveVideo(video);
    markVideoWatched(video.id);
    setWatchedState(prev => ({ ...prev, [video.id]: true }));
  };

  const handleBack = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
  };

  const handleVideoError = (videoId) => {
    setVideoError(prev => ({ ...prev, [videoId]: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {activeVideo && (
              <button
                onClick={handleBack}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {activeVideo ? activeVideo.title : 'Help & Tutorials'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {activeVideo ? (
            // Video Player View
            <div className="p-5">
              <div className="bg-black rounded-lg overflow-hidden mb-4 aspect-video">
                {videoError[activeVideo.id] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-900">
                    <Clock className="w-10 h-10 mb-3" />
                    <p className="text-sm font-medium">Coming Soon</p>
                    <p className="text-xs text-gray-500 mt-1">This tutorial is being recorded</p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={activeVideo.src}
                    controls
                    autoPlay
                    className="w-full h-full"
                    onError={() => handleVideoError(activeVideo.id)}
                  >
                    Your browser does not support video playback.
                  </video>
                )}
              </div>
              <p className="text-sm text-gray-600">{activeVideo.description}</p>
            </div>
          ) : (
            // Video List View
            <div className="p-5 space-y-5">
              {/* Tutorial Videos */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Tutorial Videos
                </h3>
                <div className="space-y-2">
                  {TUTORIAL_VIDEOS.map((video) => {
                    const Icon = video.icon;
                    const watched = watchedState[video.id];

                    return (
                      <button
                        key={video.id}
                        onClick={() => handlePlay(video)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          watched ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {watched ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Icon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${watched ? 'text-gray-500' : 'text-gray-900'}`}>
                            {video.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {video.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400">{video.duration}</span>
                          <Play className="w-4 h-4 text-blue-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Reference */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Reference
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 text-sm">
                  <p className="font-medium text-blue-900 mb-2">Two ways to use the platform:</p>
                  <ul className="text-blue-800 space-y-1">
                    <li><strong>Quick Join:</strong> Students join with a 4-digit code. No accounts needed.</li>
                    <li><strong>Classroom Mode:</strong> Students log in to save work, get grades, and track progress.</li>
                  </ul>
                </div>
              </div>

              {/* Support Links */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Support
                </h3>
                <a
                  href="mailto:rob@musicmindacademy.com"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Email Rob</div>
                    <div className="text-gray-500">rob@musicmindacademy.com</div>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialVideoLibrary;
