// File: /src/lessons/film-music-project/lesson1/Lesson1.jsx
// Complete lesson with COMPACT introduction screen
// UPDATED: Added Two Stars and a Wish reflection activity support

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Play, CheckCircle, X, Menu, SkipForward, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import VideoPlayer from '../../components/activities/video/VideoPlayer';
import DAWTutorialActivity from './activities/daw-tutorial/DAWTutorialActivity';
import SchoolBeneathActivity from './activities/SchoolBeneathActivity';
import TwoStarsAndAWishActivity from './activities/two-stars-and-a-wish/TwoStarsAndAWishActivity';

const LESSON_PROGRESS_KEY = 'lesson1-progress';

const Lesson1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState({});
  const [showNavigation, setShowNavigation] = useState(true);
  const [showSkipTools, setShowSkipTools] = useState(false);
  const [savedProgress, setSavedProgress] = useState(null);

  // Check if viewing saved work
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';
  const viewReflectionMode = searchParams.get('view') === 'reflection';

  // COMPLETE LESSON CONFIGURATION
  const lesson1Config = {
    title: "Introduction to the Digital Audio Workstation",
    learningObjectives: [
      "Master the DAW interface and basic controls",
      "Practice placing and manipulating music loops",
      "Create a mysterious film score using layering techniques",
      "Reflect on your creative process and musical decisions"
    ],
    activities: [
      {
        id: 1,
        type: "video",
        title: "Lesson Introduction",
        estimatedTime: "3 min",
        src: "/lessons/film-music-project/lesson1/Lesson1intro.mp4"
      },
      {
        id: 2,
        type: "daw-tutorial",
        title: "DAW Basics Interactive Tutorial",
        estimatedTime: "5 min"
      },
      {
        id: 3,
        type: "video",
        title: "Activity Introduction",
        estimatedTime: "2 min",
        src: "/lessons/film-music-project/lesson1/Lesson1activityintro.mp4"
      },
      {
        id: 4,
        type: "school-beneath-activity",
        title: "The School Beneath",
        estimatedTime: "10 min"
      },
      {
        id: 5,
        type: "two-stars-wish",
        title: "Reflection Activity",
        estimatedTime: "5 min"
      }
    ]
  };

  // Load saved progress on mount
  useEffect(() => {
    if (viewSavedMode) {
      setCurrentActivity(3); // Index of school-beneath-activity
      setLessonStarted(true);
      return;
    }

    if (viewReflectionMode) {
      setCurrentActivity(4); // Index of reflection activity
      setLessonStarted(true);
      return;
    }

    const saved = localStorage.getItem(LESSON_PROGRESS_KEY);
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        console.log('Found saved lesson progress:', progress);
        setSavedProgress(progress);
      } catch (error) {
        console.error('Error loading saved progress:', error);
        localStorage.removeItem(LESSON_PROGRESS_KEY);
      }
    }
  }, [viewSavedMode, viewReflectionMode]);

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (viewSavedMode || viewReflectionMode) return; // Don't save progress in view mode

    const progress = {
      currentActivity,
      activityCompleted,
      timestamp: new Date().toISOString(),
      lessonStarted
    };
    
    localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress));
    console.log('Lesson progress saved:', progress);
  }, [currentActivity, activityCompleted, lessonStarted, viewSavedMode, viewReflectionMode]);

  // Save progress whenever it changes
  useEffect(() => {
    if (lessonStarted && !viewSavedMode && !viewReflectionMode) {
      saveProgress();
    }
  }, [currentActivity, activityCompleted, lessonStarted, saveProgress, viewSavedMode, viewReflectionMode]);

  const handleBackNavigation = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user?.role === 'teacher') {
      navigate('/teacher#assignments');
    } else if (user?.role === 'student') {
      navigate('/student#assignments');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const handleDashboardNavigation = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (user?.role === 'teacher') {
      navigate('/teacher');
    } else if (user?.role === 'student') {
      navigate('/student');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const handleActivityComplete = useCallback(() => {
    console.log('Activity complete, moving to next activity');
    
    setActivityCompleted(prev => ({
      ...prev,
      [currentActivity]: true
    }));

    if (currentActivity < lesson1Config.activities.length - 1) {
      setCurrentActivity(prev => prev + 1);
    } else {
      // Lesson complete - clear progress
      localStorage.removeItem(LESSON_PROGRESS_KEY);
      console.log('Lesson completed - progress cleared');
    }
  }, [currentActivity, lesson1Config.activities.length]);

  const startLesson = useCallback(() => {
    setLessonStarted(true);
    setSavedProgress(null);
  }, []);

  const resumeLesson = useCallback(() => {
    if (savedProgress) {
      setCurrentActivity(savedProgress.currentActivity);
      setActivityCompleted(savedProgress.activityCompleted);
      setLessonStarted(true);
      setSavedProgress(null);
      console.log('Resuming lesson from activity:', savedProgress.currentActivity + 1);
    }
  }, [savedProgress]);

  const startOver = useCallback(() => {
    localStorage.removeItem(LESSON_PROGRESS_KEY);
    setCurrentActivity(0);
    setActivityCompleted({});
    setLessonStarted(true);
    setSavedProgress(null);
    console.log('Starting lesson over from beginning');
  }, []);

  const toggleNavigation = useCallback(() => {
    setShowNavigation(prev => !prev);
  }, []);

  // Skip to specific activity
  const skipToActivity = useCallback((index) => {
    if (index < 0 || index >= lesson1Config.activities.length) return;
    console.log('Skipping to activity:', index);
    setCurrentActivity(index);
    if (!lessonStarted) {
      setLessonStarted(true);
    }
  }, [lessonStarted, lesson1Config.activities.length]);

  // Skip to next activity
  const skipNext = useCallback(() => {
    if (currentActivity < lesson1Config.activities.length - 1) {
      skipToActivity(currentActivity + 1);
    }
  }, [currentActivity, skipToActivity, lesson1Config.activities.length]);

  const currentActivityData = lesson1Config.activities[currentActivity];
  const isLessonComplete = currentActivity >= lesson1Config.activities.length;
  const progressPercent = ((currentActivity + 1) / lesson1Config.activities.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Skip Tools - Available in all environments */}
      {lessonStarted && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowSkipTools(!showSkipTools)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-mono hover:bg-blue-700 transition-colors shadow-lg mb-2"
          >
            {showSkipTools ? 'Hide' : 'Show'} Skip Tools
          </button>
          
          {showSkipTools && (
            <div className="bg-gray-800 border-2 border-blue-500 rounded-lg p-3 shadow-xl max-w-xs">
              <div className="text-blue-400 text-xs font-mono mb-2 font-bold">🛠️ LESSON NAVIGATION</div>
              
              {/* Activity Navigator */}
              <div className="mb-3">
                <div className="text-gray-300 text-xs mb-2 font-semibold">Jump to Activity:</div>
                <div className="space-y-1">
                  {lesson1Config.activities.map((activity, index) => (
                    <button
                      key={index}
                      onClick={() => skipToActivity(index)}
                      className={`w-full text-left text-xs px-3 py-2 rounded transition-colors ${
                        currentActivity === index
                          ? 'bg-purple-600 text-white font-bold'
                          : activityCompleted[index]
                          ? 'bg-green-700 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{index + 1}. {activity.title}</div>
                      <div className="text-xs opacity-75">{activity.type}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="space-y-1">
                <button
                  onClick={skipNext}
                  disabled={currentActivity >= lesson1Config.activities.length - 1}
                  className="w-full bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <SkipForward size={14} />
                  Skip to Next Activity
                </button>
                <button
                  onClick={() => skipToActivity(3)}
                  className="w-full bg-green-600 text-white text-xs px-3 py-2 rounded hover:bg-green-700 transition-colors font-semibold"
                >
                  🎵 Jump to School Beneath Activity
                </button>
              </div>
              
              {/* Current Status */}
              <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-400 font-mono">
                <div>Activity: {currentActivity + 1}/{lesson1Config.activities.length}</div>
                <div>Type: {currentActivityData?.type}</div>
                <div>Completed: {Object.keys(activityCompleted).length}</div>
                <div className="text-purple-400 mt-1 truncate" title={currentActivityData?.title}>
                  {currentActivityData?.title}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compact Single-Line Navigation Header */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          showNavigation ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="bg-black/80 backdrop-blur-sm border-b border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between gap-4 max-w-full">
            {/* Left Section: Back Button */}
            <button
              onClick={handleBackNavigation}
              className="flex items-center text-white hover:text-gray-300 transition-colors group flex-shrink-0"
            >
              <ArrowLeft size={18} className="mr-1.5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            {/* Lesson Context */}
            <div className="text-xs text-gray-400 flex-shrink-0">
              {viewSavedMode ? 'Viewing Saved Composition' : viewReflectionMode ? 'Viewing Saved Reflection' : 'Intro to the DAW'}
            </div>

            {/* Lesson Title */}
            <div className="text-sm text-white font-medium flex-shrink-0">
              {lesson1Config.title}
            </div>

            {/* Progress Bar - Grows to fill available space */}
            {!viewSavedMode && !viewReflectionMode && (
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Activity Counter */}
            {!viewSavedMode && !viewReflectionMode && (
              <div className="text-sm text-gray-300 flex-shrink-0">
                Activity {currentActivity + 1} of {lesson1Config.activities.length}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={toggleNavigation}
              className="text-gray-300 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Show Navigation Toggle */}
      {!showNavigation && (
        <button
          onClick={toggleNavigation}
          className="fixed top-4 left-4 z-50 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content */}
      <div className={`h-screen flex flex-col ${showNavigation ? 'pt-10' : 'pt-0'} transition-all duration-300`}>
        {!lessonStarted ? (
          // COMPACT Lesson Start/Resume Screen
          <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            <div className="bg-white rounded-xl shadow-2xl p-5 max-w-4xl w-full">
              {/* Header */}
              <div className="mb-5 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson1Config.title}</h1>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
              </div>

              {/* Resume Notice */}
              {savedProgress && (
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-2.5 rounded">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <RotateCcw className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="ml-2">
                      <h3 className="text-xs font-medium text-blue-800">Resume Your Progress</h3>
                      <div className="mt-1 text-xs text-blue-700">
                        <p>You were on Activity {savedProgress.currentActivity + 1}: <strong>{lesson1Config.activities[savedProgress.currentActivity]?.title}</strong></p>
                        <p className="text-xs mt-0.5 text-blue-600">Last saved: {new Date(savedProgress.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                {/* Activities - LEFT COLUMN */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">📋</span>
                      Activities
                    </h2>
                    <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      Total: ~25 min
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {lesson1Config.activities.map((activity, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2.5 flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="font-medium text-gray-800 text-sm">{activity.title}</div>
                          </div>
                          <div className="text-xs font-semibold text-blue-600 ml-2 whitespace-nowrap bg-blue-50 px-2.5 py-1 rounded-full">
                            ≈ {activity.estimatedTime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What You'll Learn - RIGHT COLUMN */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                    <span className="bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">🎯</span>
                    What You'll Learn
                  </h2>
                  <ul className="space-y-2.5">
                    {lesson1Config.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2.5 bg-white p-3 rounded-lg shadow-sm border border-green-100">
                        <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-gray-700 text-sm leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Start/Resume Buttons */}
              <div className="space-y-2.5">
                {savedProgress ? (
                  <>
                    <button 
                      onClick={resumeLesson}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-base font-semibold inline-flex items-center justify-center space-x-2 transform hover:scale-105 w-full shadow-lg hover:shadow-xl"
                    >
                      <RotateCcw size={20} />
                      <span>Resume Lesson</span>
                    </button>
                    <button 
                      onClick={startOver}
                      className="bg-gray-100 text-gray-700 px-8 py-2.5 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium inline-flex items-center justify-center space-x-2 w-full border-2 border-gray-200 hover:border-gray-300"
                    >
                      <Play size={16} />
                      <span>Start Over</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={startLesson}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-base font-semibold inline-flex items-center justify-center space-x-2 transform hover:scale-105 w-full shadow-lg hover:shadow-xl"
                  >
                    <Play size={20} />
                    <span>Start Lesson</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Active Lesson
          <div className="flex-1 flex flex-col">
            {/* Current Activity */}
            <div className="flex-1 overflow-hidden">
              {!isLessonComplete && currentActivityData && (
                <div className="h-full">
                  {/* Video Activity */}
                  {currentActivityData.type === 'video' && (
                    <VideoPlayer 
                      key={`video-${currentActivityData.id}`}
                      src={currentActivityData.src}
                      onComplete={handleActivityComplete}
                      title={currentActivityData.title}
                      allowSeeking={false}
                      showNotice={false}
                      allowFullscreen={false}
                    />
                  )}

                  {/* DAW Tutorial Activity */}
                  {currentActivityData.type === 'daw-tutorial' && (
                    <DAWTutorialActivity 
                      key={`daw-tutorial-${currentActivity}`}
                      onComplete={handleActivityComplete}
                    />
                  )}

                  {/* School Beneath Composition Activity */}
                  {currentActivityData.type === 'school-beneath-activity' && (
                    <SchoolBeneathActivity 
                      key={`school-beneath-${currentActivity}`}
                      onComplete={handleActivityComplete}
                      viewMode={viewSavedMode}
                    />
                  )}

                  {/* Two Stars and a Wish Reflection Activity */}
                  {currentActivityData.type === 'two-stars-wish' && (
                    <TwoStarsAndAWishActivity 
                      key={`reflection-${currentActivity}`}
                      onComplete={handleActivityComplete}
                      viewMode={viewReflectionMode}
                    />
                  )}
                </div>
              )}

              {/* Lesson Complete */}
              {isLessonComplete && (
                <div className="h-full flex items-center justify-center bg-green-50">
                  <div className="text-center p-8">
                    <CheckCircle className="mx-auto text-green-500 mb-6" size={96} />
                    <h2 className="text-4xl font-bold text-green-800 mb-4">
                      Lesson Complete!
                    </h2>
                    <p className="text-green-700 mb-8 text-xl">
                      You've successfully completed {lesson1Config.title}
                    </p>
                    <div className="space-x-4">
                      <button
                        onClick={() => navigate('/lessons/film-music-project/lesson2')}
                        className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                      >
                        Next Lesson
                      </button>
                      <button
                        onClick={handleDashboardNavigation}
                        className="bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 transition-colors text-lg"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lesson1;