import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Music, X } from 'lucide-react';

const VideoSelection = ({ onVideoSelect }) => { 
  const navigate = useNavigate(); 
  const { assignmentId } = useParams(); // Get assignment ID from URL if present
  const isAssignmentMode = !!assignmentId; // Check if this is assignment mode

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [loadingThumbnails, setLoadingThumbnails] = useState({});
  const [videoErrors, setVideoErrors] = useState({});
  
  const videoRefs = useRef({});

  const videos = [
    {
      id: 'comedy',
      title: 'Comedy Scene',
      videoPath: '/projects/film-music-score/film-clips/comedy.mp4', // Fixed path
      thumbnailTime: 10
    },
    {
      id: 'mystery',
      title: 'Mystery Scene',
      videoPath: '/projects/film-music-score/film-clips/mystery.mp4', // Fixed path
      thumbnailTime: 10
    },
    {
      id: 'peaceful',
      title: 'Peaceful Scene',
      videoPath: '/projects/film-music-score/film-clips/peaceful.mp4', // Fixed path
      thumbnailTime: 10
    }
  ];

  const generateThumbnail = (videoElement, timeInSeconds = 10) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const handleLoadedData = () => {
        if (videoElement.duration < timeInSeconds) {
          videoElement.currentTime = videoElement.duration / 2;
        } else {
          videoElement.currentTime = timeInSeconds;
        }
      };

      const handleSeeked = () => {
        try {
          canvas.width = videoElement.videoWidth || 640;
          canvas.height = videoElement.videoHeight || 360;
          
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob);
              resolve(thumbnailUrl);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      };

      const handleError = (error) => {
        console.error('Video error during thumbnail generation:', error);
        reject(error);
      };

      videoElement.addEventListener('loadeddata', handleLoadedData, { once: true });
      videoElement.addEventListener('seeked', handleSeeked, { once: true });
      videoElement.addEventListener('error', handleError, { once: true });

      if (videoElement.readyState >= 1) {
        handleLoadedData();
      } else {
        videoElement.load();
      }
    });
  };

  useEffect(() => {
    const initializeThumbnails = async () => {
      for (const video of videos) {
        if (thumbnails[video.id] || loadingThumbnails[video.id] || videoErrors[video.id]) {
          continue;
        }

        setLoadingThumbnails(prev => ({ ...prev, [video.id]: true }));

        try {
          const tempVideo = document.createElement('video');
          tempVideo.src = video.videoPath;
          tempVideo.muted = true;
          tempVideo.crossOrigin = 'anonymous';
          tempVideo.preload = 'metadata';
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const thumbnailUrl = await generateThumbnail(tempVideo, video.thumbnailTime);
          setThumbnails(prev => ({ ...prev, [video.id]: thumbnailUrl }));
        } catch (error) {
          console.error(`Failed to generate thumbnail for ${video.id}:`, error);
          setVideoErrors(prev => ({ ...prev, [video.id]: true }));
        } finally {
          setLoadingThumbnails(prev => ({ ...prev, [video.id]: false }));
        }
      }
    };

    const timer = setTimeout(initializeThumbnails, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(thumbnails).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [thumbnails]);

  const handlePlayVideo = (video, e) => {
    e.stopPropagation();
    setFullscreenVideo(video);
  };

  // Updated to handle both assignment and free-play modes
  const handleStartComposing = (video, e) => {
    e.stopPropagation();
    
    if (isAssignmentMode) {
      // Navigate to music composer with assignment context
      navigate(`/student/assignment/${assignmentId}/music-composer/${video.id}`);
    } else {
      // Free-play mode navigation
      navigate(`/projects/music-composer/${video.id}`);
    }
  };

  const handleBackNavigation = () => {
    if (isAssignmentMode) {
      // Go back to student dashboard assignments tab
      navigate('/student');
    } else {
      // Go back to previous page
      navigate(-1);
    }
  };

  const closeFullscreen = () => {
    setFullscreenVideo(null);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={handleBackNavigation}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-6 p-2 rounded-lg hover:bg-white/50"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back{isAssignmentMode ? ' to Assignments' : ''}
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Choose Your Scene
                {isAssignmentMode && (
                  <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    Assignment Mode
                  </span>
                )}
              </h1>
              <p className="text-gray-600 text-lg">
                {isAssignmentMode 
                  ? 'Complete your assignment by selecting a video scene and composing music for it'
                  : 'Select a video scene to compose music for'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map(video => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
            >
              <div className="relative bg-black h-56 group overflow-hidden">
                {thumbnails[video.id] && (
                  <img 
                    src={thumbnails[video.id]}
                    alt={`${video.title} thumbnail`}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {loadingThumbnails[video.id] && !thumbnails[video.id] && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="flex flex-col items-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <span className="text-sm">Generating thumbnail...</span>
                    </div>
                  </div>
                )}

                {videoErrors[video.id] && !thumbnails[video.id] && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="flex flex-col items-center text-white">
                      <Play size={48} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-300">Preview unavailable</span>
                    </div>
                  </div>
                )}

                {!thumbnails[video.id] && !loadingThumbnails[video.id] && !videoErrors[video.id] && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Play size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">{video.title}</h3>
                
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => handlePlayVideo(video, e)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play size={18} />
                    <span>Watch</span>
                  </button>
                  
                  <button
                    onClick={(e) => handleStartComposing(video, e)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isAssignmentMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Music size={18} />
                    <span>{isAssignmentMode ? 'Complete Assignment' : 'Compose'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {fullscreenVideo && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          <video
            className="w-full h-full object-contain"
            controls
            autoPlay
            onEnded={closeFullscreen}
          >
            <source src={fullscreenVideo.videoPath} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-1">{fullscreenVideo.title}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSelection;