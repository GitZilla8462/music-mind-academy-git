import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, SkipBack, SkipForward, User, Star, MessageSquare, Save } from 'lucide-react';
import * as Tone from 'tone';

const StudentSubmissionView = ({ showToast, submissionId, embedded = false }) => {
  // Get params from URL if not embedded, otherwise use props
  const urlParams = useParams();
  const navigate = useNavigate();
  
  // Use submissionId from props if embedded, otherwise from URL params
  const currentSubmissionId = embedded ? submissionId : urlParams.submissionId;
  const { projectId, studentId } = urlParams;

  const videoRef = useRef(null);
  const audioContextInitializedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [submission, setSubmission] = useState(null);
  const [compositionData, setCompositionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioPlayers, setAudioPlayers] = useState(new Map());
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Grading state (only used if not embedded)
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  // Load submission data
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = localStorage.getItem('token');
        
        let apiUrl;
        if (embedded && currentSubmissionId) {
          // FIXED: Use the working submissions route instead of the problematic teacher route
          apiUrl = `/api/submissions/${currentSubmissionId}`;
        } else if (studentId) {
          // Original URL-based approach
          apiUrl = `/api/submissions/${studentId}`;
        } else {
          console.error('No submission identifier provided');
          return;
        }

        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const submissionData = await response.json();
          setSubmission(submissionData);
          
          // Parse the student work JSON
          try {
            const parsedComposition = JSON.parse(submissionData.studentWork);
            setCompositionData(parsedComposition);
            console.log('Loaded composition:', parsedComposition);
          } catch (parseError) {
            console.error('Error parsing composition data:', parseError);
            showToast('Error loading student composition', 'error');
          }

          // Set existing grade if available (only if not embedded)
          if (!embedded) {
            if (submissionData.grade !== undefined && submissionData.grade !== null) {
              setGrade(submissionData.grade.toString());
            }
            if (submissionData.feedback) {
              setFeedback(submissionData.feedback);
            }
          }
        } else {
          showToast('Failed to load submission', 'error');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        showToast('Error loading submission', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (currentSubmissionId || studentId) {
      fetchSubmission();
    }
  }, [currentSubmissionId, studentId, showToast, embedded]);

  // Load audio players for the composition
  useEffect(() => {
    const loadAudioPlayers = async () => {
      if (!compositionData || !compositionData.placedLoops) return;
      
      const players = new Map();
      
      try {
        await Tone.start();
        setAudioInitialized(true);
        
        for (const loop of compositionData.placedLoops) {
          try {
            const player = new Tone.Player({
              url: loop.file,
              loop: false,
              volume: Tone.gainToDb(loop.volume || 1)
            });
            
            // Connect to master output
            player.toDestination();
            
            players.set(loop.id, {
              player,
              startTime: loop.startTime,
              endTime: loop.endTime,
              duration: loop.duration,
              muted: loop.muted || false
            });
            
            console.log(`Loaded audio player for: ${loop.name}`);
          } catch (error) {
            console.error(`Failed to load audio for ${loop.name}:`, error);
          }
        }
        
        setAudioPlayers(players);
        console.log(`Loaded ${players.size} audio players`);
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    loadAudioPlayers();
  }, [compositionData]);

  // Schedule and play audio loops based on current time
  useEffect(() => {
    if (!audioInitialized || audioPlayers.size === 0) return;

    const scheduleAudio = () => {
      audioPlayers.forEach((audioData, loopId) => {
        const { player, startTime, endTime, muted } = audioData;
        
        if (isPlaying && currentTime >= startTime && currentTime < endTime && !muted) {
          if (player.state === 'stopped') {
            // Calculate offset if we're starting mid-loop
            const offset = currentTime - startTime;
            player.start(Tone.now(), offset);
          }
        } else if (player.state === 'started') {
          player.stop();
        }
      });
    };

    scheduleAudio();
  }, [isPlaying, currentTime, audioPlayers, audioInitialized]);

  // Cleanup audio players
  useEffect(() => {
    return () => {
      audioPlayers.forEach((audioData) => {
        audioData.player.dispose();
      });
    };
  }, [audioPlayers]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      Tone.Transport.seconds = video.currentTime;
      setCurrentTime(video.currentTime);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [compositionData]);

  const startAudioPlayback = async () => {
    try {
      await Tone.start();
      if (videoRef.current && videoRef.current.paused) {
        await videoRef.current.play();
      }
      setIsPlaying(true);
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  };

  const stopAudioPlayback = () => {
    // Stop all audio players
    audioPlayers.forEach((audioData) => {
      if (audioData.player.state === 'started') {
        audioData.player.stop();
      }
    });
    
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopAudioPlayback();
    } else {
      startAudioPlayback();
    }
  };

  const skipForward = () => {
    const video = videoRef.current;
    const newTime = Math.min(video.currentTime + 10, duration);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    const newTime = Math.max(video.currentTime - 10, 0);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleTimelineClick = (e) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    
    // Update volume for all audio players
    audioPlayers.forEach((audioData) => {
      audioData.player.volume.value = Tone.gainToDb(newVolume);
    });
  };

  const handleGradeSubmission = async () => {
    if (!grade || grade < 0 || grade > 100) {
      showToast('Please enter a valid grade (0-100)', 'error');
      return;
    }

    setIsGrading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/submissions/${submission._id}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade: parseFloat(grade),
          feedback: feedback
        }),
      });

      if (response.ok) {
        showToast('Grade saved successfully', 'success');
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to save grade', 'error');
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      showToast('Error saving grade', 'error');
    } finally {
      setIsGrading(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimelineWidth = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg text-white">Loading submission...</div>
      </div>
    );
  }

  if (!submission || !compositionData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400">
          <p>Submission not found or invalid format</p>
          {!embedded && (
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const { selectedVideo, placedLoops = [], submissionNotes } = compositionData;

  return (
    <div className={`${embedded ? 'h-full' : 'min-h-screen'} bg-gray-900 text-white flex flex-col`}>
      {/* Header - only show if not embedded */}
      {!embedded && (
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-300 hover:text-white mr-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold flex items-center">
                <User size={20} className="mr-2" />
                {submission.student?.name || `${submission.student?.firstName || ''} ${submission.student?.lastName || ''}`.trim() || 'Student'}'s Submission
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {selectedVideo?.title} - Submitted {new Date(submission.submittedAt || submission.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Assignment: {submission.assignment?.title}
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Sidebar with submission info - only show if not embedded */}
        {!embedded && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Submission Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-1">Video Selected</h3>
                <p className="text-white">{selectedVideo?.title || 'Unknown'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-1">Music Loops</h3>
                <p className="text-white">{placedLoops.length} loops placed</p>
              </div>

              {submissionNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Student Notes</h3>
                  <div className="bg-gray-700 p-3 rounded text-sm">
                    {submissionNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Grading Section */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Star size={18} className="mr-2" />
                Grade Submission
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Grade (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter grade"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Provide feedback to the student..."
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-400 mt-1">{feedback.length}/1000</div>
                </div>
                
                <button
                  onClick={handleGradeSubmission}
                  disabled={isGrading || !grade}
                  className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  {isGrading ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="bg-black flex items-center justify-center relative" style={{ height: embedded ? '40vh' : '50vh' }}>
            {selectedVideo ? (
              <video
                ref={videoRef}
                className="max-w-full max-h-full"
                muted={false}
                src={selectedVideo.videoPath}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-gray-400">No video selected</div>
            )}
          </div>

          {/* Transport Controls */}
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={skipBackward}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors"
                title="Skip back 10s"
              >
                <SkipBack size={20} />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="bg-blue-600 hover:bg-blue-700 p-4 rounded-full transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button
                onClick={skipForward}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors"
                title="Skip forward 10s"
              >
                <SkipForward size={20} />
              </button>

              <div className="flex items-center space-x-2 ml-8">
                <Volume2 size={20} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <div className="ml-8 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Timeline Area - Made Scrollable */}
          <div className="flex-1 bg-gray-700 p-4 overflow-y-auto min-h-0">
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold">Student's Composition Timeline</h3>
              <p className="text-sm text-gray-400">Playback view - showing {placedLoops.length} music loops</p>
            </div>

            {/* Main Timeline Scrubber */}
            <div className="mb-6 flex-shrink-0">
              <div className="timeline-container">
                <div
                  className="bg-gray-600 h-8 rounded relative cursor-pointer overflow-hidden"
                  onClick={handleTimelineClick}
                >
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                      <div
                        key={i}
                        className="border-r border-gray-500/30 flex-1 flex items-center justify-start pl-1 text-xs text-gray-400"
                        style={{ minWidth: '60px' }}
                      >
                        {i}s
                      </div>
                    ))}
                  </div>

                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500/30 rounded"
                    style={{ width: `${getTimelineWidth()}%` }}
                  />

                  <div
                    className="absolute top-0 w-1 h-full bg-yellow-400"
                    style={{ left: `${getTimelineWidth()}%` }}
                  />
                  <div
                    className="absolute top-0 w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2"
                    style={{ left: `${getTimelineWidth()}%`, top: '-2px' }}
                  />
                </div>
              </div>
            </div>

            {/* Audio Tracks with Student's Loops - Expanded to show more tracks */}
            <div className="space-y-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(trackIndex => {
                const tracksWithLoops = placedLoops.filter(loop => loop.trackIndex === trackIndex);
                const hasLoops = tracksWithLoops.length > 0;
                
                return (
                  <div key={trackIndex} className="relative">
                    <div className="text-sm text-gray-400 mb-1 flex items-center">
                      Audio Track {trackIndex + 1}
                      {hasLoops && (
                        <span className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded">
                          {tracksWithLoops.length} loop{tracksWithLoops.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-600 h-16 rounded relative overflow-hidden">
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                          <div
                            key={i}
                            className="border-r border-gray-500/20 flex-1"
                            style={{ minWidth: '60px' }}
                          />
                        ))}
                      </div>

                      {/* Student's Placed Loops */}
                      {placedLoops
                        .filter(loop => loop.trackIndex === trackIndex)
                        .map(loop => (
                          <div
                            key={loop.id}
                            className="absolute top-1 bottom-1 rounded flex items-center justify-center text-xs font-medium shadow-lg border border-white/20"
                            style={{
                              left: `${(loop.startTime / duration) * 100}%`,
                              width: `${(loop.duration / duration) * 100}%`,
                              backgroundColor: loop.color,
                              minWidth: '40px'
                            }}
                            title={`${loop.name} (${loop.category}) - ${loop.startTime.toFixed(1)}s to ${loop.endTime.toFixed(1)}s`}
                          >
                            <span className="truncate px-1 text-white drop-shadow-sm">{loop.name}</span>
                          </div>
                        ))}

                      {/* Current Time Indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10 pointer-events-none"
                        style={{ left: `${getTimelineWidth()}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {placedLoops.length === 0 && (
              <div className="mt-8 text-center text-gray-400 flex-shrink-0">
                <p>This student didn't place any music loops in their composition.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmissionView;