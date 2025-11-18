import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Music, X } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const VideoSelection = ({ onVideoSelect, isDemo = false, isPractice = false }) => { 
  const navigate = useNavigate(); 
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const isAssignmentMode = !!assignmentId && !isDemo && !isPractice;

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [loadingThumbnails, setLoadingThumbnails] = useState({});
  const [videoErrors, setVideoErrors] = useState({});
  const [videoDurations, setVideoDurations] = useState({});
  
  const videoRefs = useRef({});

  // Only include videos that actually exist
  const videos = [
    {
      id: 'school-mystery',
      title: 'The School Beneath',
      videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4',
      thumbnailTime: 10,
      // FIXED: Use detected duration or null (not a fallback number)
      duration: videoDurations['school-mystery'] || null
    }
    // Remove comedy and peaceful until you add those video files
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

  // FIXED: Load video durations with proper error handling and logging
  useEffect(() => {
    const loadVideoDurations = async () => {
      const videoList = [
        {
          id: 'school-mystery',
          videoPath: '/lessons/videos/film-music-loop-project/SchoolMystery.mp4'
        }
      ];

      console.log('🎬 Starting video duration detection...');

      for (const video of videoList) {
        try {
          const tempVideo = document.createElement('video');
          tempVideo.src = video.videoPath;
          tempVideo.preload = 'metadata';
          
          await new Promise((resolve, reject) => {
            tempVideo.addEventListener('loadedmetadata', () => {
              const duration = tempVideo.duration;
              console.log(`✅ Video ${video.id} detected duration: ${duration}s (${Math.floor(duration/60)}:${Math.floor(duration%60).toString().padStart(2, '0')})`);
              
              setVideoDurations(prev => ({
                ...prev,
                [video.id]: duration
              }));
              resolve();
            });
            
            tempVideo.addEventListener('error', (e) => {
              console.error(`❌ Failed to load ${video.id}:`, e);
              reject(e);
            });
            
            // Timeout after 10 seconds (increased from 5)
            setTimeout(() => {
              console.error(`⏰ Timeout loading ${video.id}`);
              reject(new Error('Timeout'));
            }, 10000);
          });
        } catch (error) {
          console.error(`❌ Failed to load duration for ${video.id}:`, error);
          // Don't set a fallback - let it stay null so we know it failed
        }
      }
      
      console.log('🎬 Video duration detection complete:', videoDurations);
    };

    loadVideoDurations();
  }, []);

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

    // Only initialize thumbnails after durations are loaded
    if (Object.keys(videoDurations).length > 0) {
      const timer = setTimeout(initializeThumbnails, 500);
      return () => clearTimeout(timer);
    }
  }, [videoDurations]);

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

  const handleStartComposing = (video, e) => {
    e.stopPropagation();
    
    // FIXED: Don't navigate if duration hasn't been detected yet
    if (!video.duration) {
      console.warn('⚠️ Cannot start composing - video duration not yet detected');
      alert('Please wait for the video to load completely before starting.');
      return;
    }
    
    console.log(`🎵 Starting composer with video duration: ${video.duration}s`);
    
    // Route based on mode and user role
    if (isDemo) {
      navigate(`/teacher/projects/film-music-score-demo/${video.id}`);
    } else if (isPractice) {
      navigate(`/student/practice/film-music-score/music-composer/${video.id}`);
    } else if (isAssignmentMode) {
      navigate(`/student/assignment/${assignmentId}/music-composer/${video.id}`);
    } else {
      navigate(`/projects/music-composer/${video.id}`);
    }
  };

  const handleBackNavigation = () => {
    if (isDemo) {
      navigate('/teacher');
    } else if (isPractice) {
      navigate('/student');
    } else if (isAssignmentMode) {
      navigate('/student');
    } else {
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

  // Determine mode label
  const getModeLabel = () => {
    if (isDemo) return 'Demo Mode';
    if (isPractice) return 'Practice Mode';
    if (isAssignmentMode) return 'Assignment Mode';
    return null;
  };

  const modeLabel = getModeLabel();

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
                {modeLabel && (
                  <span className={`ml-3 text-sm px-3 py-1 rounded-full font-medium ${
                    isDemo ? 'bg-purple-100 text-purple-800' :
                    isPractice ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {modeLabel}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 text-lg">
                {isDemo 
                  ? 'Explore the film music composer interface'
                  : isPractice
                  ? 'Practice composing music for video scenes'
                  : isAssignmentMode 
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
                
                {/* ADDED: Duration badge */}
                {video.duration && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                    {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
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
                    disabled={!video.duration}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      !video.duration
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isDemo
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : isPractice
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : isAssignmentMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Music size={18} />
                    <span>
                      {!video.duration 
                        ? 'Loading...' 
                        : isDemo ? 'Try Demo' 
                        : isPractice ? 'Practice' 
                        : isAssignmentMode ? 'Complete Assignment' 
                        : 'Compose'}
                    </span>
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