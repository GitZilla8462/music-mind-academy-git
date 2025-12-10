// File: /pages/MusicLoopsInMediaHub.jsx
// Music Loops in Media Project - Hub page for all lessons
// ✅ UPDATED: Added Lesson Plan button per lesson card

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { Play, ChevronDown, ChevronRight, FileText, ExternalLink } from 'lucide-react';

const MusicLoopsInMediaHub = () => {
  const navigate = useNavigate();
  const [savedProgress, setSavedProgress] = useState({});
  const [creatingSession, setCreatingSession] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  
  const userRole = localStorage.getItem('classroom-user-role');
  
  useEffect(() => {
    const progress = {
      lesson2: localStorage.getItem('lesson2-progress'),
      lesson3: localStorage.getItem('lesson3-progress'),
      lesson4: localStorage.getItem('lesson4-progress'),
      lesson5: localStorage.getItem('lesson5-progress')
    };
    setSavedProgress(progress);
  }, []);

  const handleStartSession = async (lessonId, lessonRoute) => {
    console.log('🎬 Starting session for:', { lessonId, lessonRoute });
    setCreatingSession(lessonId);
    
    try {
      const code = await createSession('teacher', lessonId, lessonRoute);
      console.log(`✅ Session created: ${code} for ${lessonId} at route ${lessonRoute}`);
      window.location.href = `${lessonRoute}?session=${code}&role=teacher`;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      alert('Failed to create session. Please try again.');
      setCreatingSession(null);
    }
  };

  const handleDemoActivity = (activityType, activityTitle) => {
    const demoUrl = `/demo?activity=${activityType}&title=${encodeURIComponent(activityTitle)}`;
    window.open(demoUrl, '_blank', 'width=1280,height=800,menubar=no,toolbar=no');
  };

  const handleOpenLessonPlan = (lessonId) => {
    // Map lesson ID to lesson plan route
    const lessonPlanRoutes = {
      'lesson2': '/lesson-plan/lesson2',
      'lesson3': '/lesson-plan/lesson3',
      'lesson4': '/lesson-plan/lesson4',
      'lesson5': '/lesson-plan/lesson5'
    };
    
    const route = lessonPlanRoutes[lessonId];
    if (route) {
      window.open(route, '_blank');
    }
  };

  const toggleLesson = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  const lessons = [
    {
      id: 'lesson2',
      number: 1,
      title: 'Sports Highlight Reel',
      concept: 'Introduction to the DAW',
      description: 'Learn how to use the digital audio workstation and create your first composition with loops for exciting sports highlights',
      icon: '🏀',
      color: 'from-orange-500 to-red-500',
      videos: ['Basketball', 'Skateboarding', 'Football'],
      duration: '35 min',
      route: '/lessons/film-music-project/lesson2',
      available: true,
      hasLessonPlan: true,
      activities: [
        { id: 'daw-tutorial', title: 'DAW Challenge', description: 'Learn the DAW interface', activityType: 'daw-tutorial' },
        { id: 'sports-composition', title: 'Sports Composition', description: 'Compose high-energy music', activityType: 'sports-composition-activity' },
        { id: 'two-stars-wish', title: 'Two Stars & a Wish', description: 'Reflection activity', activityType: 'two-stars-wish' },
        { id: 'name-that-loop', title: 'Name That Loop', description: 'Bonus game', activityType: 'name-that-loop' }
      ]
    },
    {
      id: 'lesson3',
      number: 2,
      title: 'City Soundscapes',
      concept: 'Texture & Layering',
      description: 'Understand texture and layers in music. Visualize how layers create texture with a listening map, then build your own city soundscape',
      icon: '🏙️',
      color: 'from-cyan-500 to-blue-500',
      videos: ['City Atmosphere'],
      duration: '35 min',
      route: '/lessons/film-music-project/lesson3',
      available: true,
      hasLessonPlan: true,
      activities: [
        { id: 'listening-map', title: 'Listening Map', description: 'Visualize musical layers', activityType: 'listening-map' },
        { id: 'city-composition', title: 'City Composition', description: 'Compose a soundscape', activityType: 'city-composition-activity' },
        { id: 'two-stars-wish', title: 'Two Stars & a Wish', description: 'Reflection activity', activityType: 'two-stars-wish' },
        { id: 'layer-detective', title: 'Layer Detective', description: 'Bonus game', activityType: 'layer-detective' }
      ]
    },
    {
      id: 'lesson4',
      number: 3,
      title: 'Epic Wildlife',
      concept: 'Sectional Loop Form',
      description: 'Create epic soundtracks for breathtaking nature footage with distinct sections',
      icon: '🌍',
      color: 'from-green-500 to-teal-500',
      videos: ['Underwater', 'Jungle', 'Safari'],
      duration: '35 min',
      route: '/lessons/film-music-project/lesson4',
      available: true,
      hasLessonPlan: true,
      badge: 'Beta',
      activities: [
        { id: 'sectional-loop-builder', title: 'Sectional Loop Builder', description: 'Build A-B-A sections', activityType: 'sectional-loop-builder' },
        { id: 'wildlife-composition', title: 'Wildlife Composition', description: 'Score nature footage', activityType: 'wildlife-composition-activity' },
        { id: 'two-stars-wish', title: 'Two Stars & a Wish', description: 'Reflection activity', activityType: 'two-stars-wish' }
      ]
    },
    {
      id: 'lesson5',
      number: 4,
      title: 'Video Game Montage',
      concept: 'Musical Storytelling',
      description: 'Score exciting video game footage with dynamic music',
      icon: '🎮',
      color: 'from-purple-500 to-pink-500',
      videos: ['Action', 'Adventure', 'Victory'],
      duration: '35 min',
      route: '/lessons/film-music-project/lesson5',
      available: false,
      hasLessonPlan: false
    },
    {
      id: 'sandbox',
      number: 5,
      title: 'Student Choice Sandbox',
      concept: 'Apply All Skills',
      description: 'Access all activities and choose your own video',
      icon: '🎨',
      color: 'from-indigo-500 to-violet-500',
      videos: ['All Activities', 'Student Choice'],
      duration: 'Unlimited',
      route: '/lessons/film-music-project/sandbox',
      available: false,
      hasLessonPlan: false
    }
  ];

  const getProgressBadge = (lessonId) => {
    if (savedProgress[lessonId]) {
      return (
        <div className="absolute -top-1 -left-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg z-10">
          ✓ Started
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 py-6 px-6 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🎬</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Music Loops in Media</h1>
                <p className="text-slate-400">Create soundtracks for different types of video</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱️</span>
                <span>~35 min each</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <span>Grades 6-8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Unit Overview */}
        <div className="bg-slate-800 rounded-xl p-5 mb-6 border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">Unit Overview</h2>
          <p className="text-slate-300 mb-4">
            Learn how music loops enhance different types of media. Each lesson focuses on a different context and musical concept:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏀</span>
              <div>
                <div className="font-semibold text-white text-sm">DAW Basics</div>
                <div className="text-xs text-slate-400">Learn the tools</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏙️</span>
              <div>
                <div className="font-semibold text-white text-sm">Texture & Layers</div>
                <div className="text-xs text-slate-400">Build soundscapes</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌍</span>
              <div>
                <div className="font-semibold text-white text-sm">Sectional Form</div>
                <div className="text-xs text-slate-400">Evolving sections</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <div>
                <div className="font-semibold text-white text-sm">Storytelling</div>
                <div className="text-xs text-slate-400">Dynamic scoring</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Cards */}
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const isExpanded = expandedLesson === lesson.id;
            
            return (
              <div
                key={lesson.id}
                className={`relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl transition-colors duration-200 ${
                  lesson.available 
                    ? 'hover:border-slate-500' 
                    : 'opacity-60'
                }`}
              >
                {getProgressBadge(lesson.id)}
                
                {!lesson.available && (
                  <div className="absolute top-3 right-3 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                    Coming Soon
                  </div>
                )}

                {/* Collapsed Header - Always visible */}
                <button
                  onClick={() => lesson.available && toggleLesson(lesson.id)}
                  disabled={!lesson.available}
                  className={`w-full flex items-center text-left ${
                    lesson.available ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {/* Gradient Icon Area */}
                  <div className={`bg-gradient-to-br ${lesson.color} p-5 flex items-center justify-center w-28 shrink-0 self-stretch`}>
                    <div className="text-center text-white">
                      <div className="text-4xl mb-1">{lesson.icon}</div>
                      <div className="text-sm font-bold">
                        {lesson.id === 'sandbox' ? 'Sandbox' : `Lesson ${lesson.number}`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Title & Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{lesson.title}</h3>
                      <span className="px-3 py-1 bg-slate-700 text-blue-300 text-sm rounded-full font-semibold">
                        {lesson.concept}
                      </span>
                      {lesson.badge && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-semibold border border-amber-500/30">
                          {lesson.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm">{lesson.description}</p>
                  </div>

                  {/* Duration & Chevron */}
                  <div className="flex items-center gap-4 pr-4 shrink-0">
                    <span className="text-slate-400">⏱️ {lesson.duration}</span>
                    {lesson.available && (
                      isExpanded ? 
                        <ChevronDown className="w-6 h-6 text-slate-400" /> : 
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && lesson.available && (
                  <div className="border-t border-slate-700 p-5 bg-slate-800/50">
                    {/* Video Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lesson.videos.map((video, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-lg">
                          {video}
                        </span>
                      ))}
                    </div>

                    {/* Activities - For Teachers */}
                    {userRole === 'teacher' && lesson.activities && (
                      <div className="mb-4">
                        <div className="text-slate-400 text-sm font-semibold mb-3">
                          Main Activities
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 md:grid-flow-col gap-2">
                          {lesson.activities.map((activity, index) => (
                            <div 
                              key={activity.id}
                              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 flex items-center justify-center bg-slate-600 text-white text-sm font-bold rounded-full">
                                  {index + 1}
                                </span>
                                <div>
                                  <span className="text-white font-medium">{activity.title}</span>
                                  <span className="text-slate-400 text-sm ml-2">{activity.description}</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDemoActivity(activity.activityType, activity.title);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <Play className="w-4 h-4" />
                                Demo
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {userRole === 'teacher' && (
                        <>
                          {/* Start Live Session Button */}
                          <button 
                            onClick={() => handleStartSession(lesson.id, lesson.route)}
                            disabled={creatingSession === lesson.id}
                            className={`flex-1 px-6 py-3 ${
                              creatingSession === lesson.id 
                                ? 'bg-slate-500 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            } text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2`}
                          >
                            {creatingSession === lesson.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Creating Session...</span>
                              </>
                            ) : (
                              <>
                                <span>🎬</span>
                                <span>Start Live Session</span>
                              </>
                            )}
                          </button>

                          {/* Lesson Plan Button - NEW */}
                          {lesson.hasLessonPlan && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLessonPlan(lesson.id);
                              }}
                              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 border border-slate-600"
                            >
                              <FileText className="w-5 h-5" />
                              <span>Lesson Plan</span>
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </button>
                          )}
                        </>
                      )}

                      {userRole === 'student' && (
                        <button 
                          onClick={() => navigate(lesson.route)}
                          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          Practice Solo →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MusicLoopsInMediaHub;