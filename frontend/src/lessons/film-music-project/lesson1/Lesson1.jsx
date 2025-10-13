// File: /src/lessons/film-music-project/lesson1/Lesson1.jsx
// Complete lesson with all activities including SchoolBeneathActivity

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home, Play, CheckCircle, X, Menu } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import VideoPlayer from '../../components/activities/video/VideoPlayer';
import DAWTutorialActivity from './activities/daw-tutorial/DAWTutorialActivity';
import SchoolBeneathActivity from './activities/SchoolBeneathActivity';

const Lesson1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentActivity, setCurrentActivity] = useState(0);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState({});
  const [showNavigation, setShowNavigation] = useState(true);

  // Check if viewing saved work
  const searchParams = new URLSearchParams(location.search);
  const viewSavedMode = searchParams.get('view') === 'saved';

  // If viewing saved work, skip to the SchoolBeneathActivity and start lesson
  useEffect(() => {
    if (viewSavedMode) {
      setCurrentActivity(3); // Index of school-beneath-activity
      setLessonStarted(true);
    }
  }, [viewSavedMode]);

  // COMPLETE LESSON CONFIGURATION - moved before callbacks
  const lesson1Config = {
    title: "Introduction to Film Music",
    description: "Learn the basics of film music composition and create your first mysterious score.",
    estimatedTime: 45,
    difficulty: "beginner",
    learningObjectives: [
      "Understand how music enhances storytelling in films",
      "Learn the fundamental concepts of film music composition",
      "Master the DAW interface and basic controls",
      "Practice placing and manipulating music loops",
      "Create a mysterious film score using layering techniques"
    ],
    activities: [
      {
        id: 1,
        type: "video",
        title: "Lesson Introduction",
        description: "Introduction to film music composition",
        src: "/lessons/film-music-project/lesson1/Lesson1intro.mp4"
      },
      {
        id: 2,
        type: "daw-tutorial",
        title: "DAW Basics Interactive Tutorial",
        description: "Learn the DAW interface through guided challenges"
      },
      {
        id: 3,
        type: "video",
        title: "Activity Introduction",
        description: "Your composition assignment for The School Beneath",
        src: "/lessons/film-music-project/lesson1/Lesson1activityintro.mp4"
      },
      {
        id: 4,
        type: "school-beneath-activity",
        title: "The School Beneath - Composition Exercise",
        description: "Create a mysterious film score using instrumentation, layering, and structure"
      }
    ]
  };

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
    }
  }, [currentActivity, lesson1Config.activities.length]);

  const startLesson = useCallback(() => {
    setLessonStarted(true);
  }, []);

  const toggleNavigation = useCallback(() => {
    setShowNavigation(prev => !prev);
  }, []);

  const currentActivityData = lesson1Config.activities[currentActivity];
  const isLessonComplete = currentActivity >= lesson1Config.activities.length;
  const progressPercent = ((currentActivity + 1) / lesson1Config.activities.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
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
              {viewSavedMode ? 'Viewing Saved Work' : 'Intro to the DAW'}
            </div>

            {/* Lesson Title */}
            <div className="text-sm text-white font-medium flex-shrink-0">
              {lesson1Config.title}
            </div>

            {/* Progress Bar - Grows to fill available space */}
            {!viewSavedMode && (
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
            {!viewSavedMode && (
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
          // Lesson Start Screen
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson1Config.title}</h1>
                <p className="text-gray-600">{lesson1Config.description}</p>
              </div>

              {/* Learning Objectives */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                <ul className="space-y-2">
                  {lesson1Config.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lesson Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{lesson1Config.estimatedTime}</div>
                  <div className="text-sm text-gray-500">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 capitalize">{lesson1Config.difficulty}</div>
                  <div className="text-sm text-gray-500">Difficulty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{lesson1Config.activities.length}</div>
                  <div className="text-sm text-gray-500">Activities</div>
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button 
                  onClick={startLesson}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold inline-flex items-center space-x-2 transform hover:scale-105"
                >
                  <Play size={24} />
                  <span>Start Lesson</span>
                </button>
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