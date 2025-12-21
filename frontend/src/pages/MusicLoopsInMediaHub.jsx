// File: /pages/MusicLoopsInMediaHub.jsx
// Music for Media Unit - Hub page for all lessons
// Light theme with minimal collapsed cards and expanded lesson overview
// Updated: Larger sizing and better text contrast

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { ChevronDown, ChevronUp, Check, FileText, ExternalLink, Play, ArrowLeft } from 'lucide-react';

const MusicLoopsInMediaHub = () => {
  const navigate = useNavigate();
  const [creatingSession, setCreatingSession] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});

  const userRole = localStorage.getItem('classroom-user-role');

  const toggleExpanded = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleStartSession = async (lessonId, lessonRoute) => {
    setCreatingSession(lessonId);
    try {
      const code = await createSession('teacher', lessonId, lessonRoute);
      window.location.href = `${lessonRoute}?session=${code}&role=teacher`;
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
      setCreatingSession(null);
    }
  };

  const handleDemoActivity = (activityType, activityTitle) => {
    const demoUrl = `/demo?activity=${activityType}&title=${encodeURIComponent(activityTitle)}`;
    window.open(demoUrl, '_blank', 'width=1280,height=800,menubar=no,toolbar=no');
  };

  const handleOpenLessonPlan = (lessonId) => {
    const route = `/lesson-plan/${lessonId}`;
    window.open(route, '_blank');
  };

  const lessons = [
    {
      id: 'lesson1',
      number: 1,
      icon: '🎬',
      title: 'Score the Adventure',
      concept: 'Mood & Expression',
      essentialQuestion: 'Why does music affect how we feel?',
      color: 'from-purple-500 to-indigo-600',
      route: '/lessons/film-music-project/lesson1',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students discover how music creates emotion by watching the same video with different scores, then compose their own adventure soundtrack.',
      studentsWill: [
        'Identify how music creates different moods',
        'Match loops to mood categories',
        'Compose a soundtrack for drone footage'
      ],
      activities: [
        { title: 'Hook Video', description: 'Same scene, 5 different scores', time: 3 },
        { title: 'Discussion', description: 'How did the music change the feeling?', time: 3 },
        { title: 'Mood Categories', description: 'Introduce the 5 mood types', time: 3 },
        { title: 'Mood Match Game', description: 'Vote on which mood fits each loop', time: 6, activityType: 'mood-match-game' },
        { title: 'DAW Tutorial Video', description: 'Learn the basics + Chromebook setup', time: 4 },
        { title: 'Composition', description: 'Pick a mood, score drone footage', time: 14, activityType: 'adventure-composition' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your composition', time: 5, activityType: 'two-stars-wish' },
        { title: 'Share', description: '1-2 students share their work', time: 2 },
        { title: 'Name That Loop', description: 'Partner listening game', time: 5, activityType: 'name-that-loop', isBonus: true, isPartnerActivity: true }
      ]
    },
    {
      id: 'lesson2',
      number: 2,
      icon: '🏀',
      title: 'Sports Highlight Reel',
      concept: 'Instrumentation & Timbre',
      essentialQuestion: 'What sounds create the feeling?',
      color: 'from-orange-500 to-red-600',
      route: '/lessons/film-music-project/lesson2',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students master the DAW through a guided challenge, then create high-energy music for sports highlights by choosing instruments intentionally.',
      studentsWill: [
        'Navigate the DAW interface confidently',
        'Choose instruments that match the energy',
        'Create layered compositions for sports video'
      ],
      activities: [
        { title: 'Introduction', description: 'What sport do you like? What music fits?', time: 3 },
        { title: 'DAW Review', description: 'Quick refresher on DAW controls', time: 3 },
        { title: 'DAW Challenge', description: 'Click every button to master the DAW', time: 7, activityType: 'daw-tutorial' },
        { title: 'Tutorial Video', description: 'How to compose for sports highlights', time: 4 },
        { title: 'Composition', description: 'Pick a sport, create hype music', time: 15, activityType: 'sports-composition-activity' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your work', time: 5, activityType: 'two-stars-wish' },
        { title: 'Share', description: '1-2 students share their work', time: 3 },
        { title: 'Melody Escape Room', description: 'Partner puzzle game', time: 7, activityType: 'melody-escape-room', isBonus: true, isPartnerActivity: true }
      ]
    },
    {
      id: 'lesson3',
      number: 3,
      icon: '🏙️',
      title: 'City Soundscapes',
      concept: 'Texture & Layering',
      essentialQuestion: 'How many sounds play together?',
      color: 'from-cyan-500 to-blue-600',
      route: '/lessons/film-music-project/lesson3',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students visualize how layers create texture using a listening map, then build their own rich city soundscape.',
      studentsWill: [
        'Understand thin vs. thick musical texture',
        'Create a visual listening map',
        'Build layered compositions for city footage'
      ],
      activities: [
        { title: 'Introduction', description: 'What city have you visited?', time: 2 },
        { title: 'Texture Concept', description: 'How layers create thick or thin sound', time: 5 },
        { title: 'Listening Map Video', description: 'How to visualize texture', time: 3 },
        { title: 'Listening Map Activity', description: 'Draw while listening to music', time: 8, activityType: 'listening-map' },
        { title: 'Composition', description: 'Create a city soundscape with layers', time: 14, activityType: 'city-composition-activity' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your layers', time: 5, activityType: 'two-stars-wish' },
        { title: 'Share & Discussion', description: 'Compare textures across compositions', time: 3 }
      ]
    },
    {
      id: 'lesson4',
      number: 4,
      icon: '🌍',
      title: 'Epic Wildlife',
      concept: 'Form & Structure',
      essentialQuestion: 'When do sounds enter and exit?',
      color: 'from-green-500 to-teal-600',
      route: '/lessons/film-music-project/lesson4',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn how film scores follow a story arc with distinct sections, then create an epic nature documentary soundtrack.',
      studentsWill: [
        'Understand sectional song form (intro, build, climax)',
        'Place loops strategically for dramatic effect',
        'Compose a complete film score with structure'
      ],
      activities: [
        { title: 'Introduction', description: 'How do movies build tension?', time: 3 },
        { title: 'Form Concept', description: 'How music tells a story over time', time: 5 },
        { title: 'Sectional Loop Builder', description: 'Match loops to song sections', time: 8, activityType: 'sectional-loop-builder' },
        { title: 'Composition', description: 'Score wildlife footage with structure', time: 14, activityType: 'wildlife-composition-activity' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your form choices', time: 5, activityType: 'two-stars-wish' },
        { title: 'Share & Discussion', description: 'Compare story arcs in compositions', time: 5 },
        { title: 'Monster Melody Maker', description: 'Create melodies for creatures', time: 8, activityType: 'monster-melody-maker', isBonus: true }
      ]
    },
    {
      id: 'lesson5',
      number: 5,
      icon: '🎓',
      title: 'Capstone Project',
      concept: 'All Concepts Combined',
      essentialQuestion: 'How do I combine mood, instruments, texture, and form?',
      color: 'from-purple-500 to-pink-600',
      route: '/lessons/film-music-project/lesson5',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students apply mood, instrumentation, texture, and form to create a complete film score for a video of their choice.',
      studentsWill: [
        'Plan a composition using all four concepts',
        'Create a polished film score independently',
        'Present and explain their creative choices'
      ],
      activities: [
        { title: 'Review', description: 'Revisit all four music concepts', time: 5 },
        { title: 'Planning', description: 'Choose video and plan your approach', time: 5 },
        { title: 'Composition', description: 'Create your capstone score', time: 20 },
        { title: 'Share & Discuss', description: 'Present to the class', time: 10 }
      ]
    }
  ];

  const getTotalTime = (activities) => {
    return activities
      .filter(a => !a.isBonus)
      .reduce((sum, a) => sum + (a.time || 0), 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate('/music-classroom-resources')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Resources</span>
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Music for Media
          </h1>
          <p className="text-xl text-slate-700 mb-2">
            Create soundtracks for video — the way professionals do it.
          </p>
          <p className="text-base text-slate-600">
            5 lessons  •  ~40 min each  •  Grades 6-8
          </p>
        </div>
      </div>

      {/* LESSON CARDS */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {lessons.map((lesson) => {
            const isExpanded = expandedLessons[lesson.id];
            const totalTime = getTotalTime(lesson.activities);

            return (
              <div
                key={lesson.id}
                className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all ${
                  lesson.available ? '' : 'opacity-50'
                }`}
              >
                {/* COLLAPSED CARD HEADER - Always Visible */}
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {/* Gradient Icon */}
                    <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-3xl">{lesson.icon}</span>
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-base font-semibold text-blue-600 uppercase tracking-wide">
                            Lesson {lesson.number}
                          </p>
                          <h3 className="text-2xl font-bold text-slate-900 mt-1">
                            {lesson.title}
                          </h3>
                          <p className="text-base text-slate-600 mt-1">
                            {lesson.concept}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-xl font-semibold text-slate-800">
                            ~{totalTime} min
                          </span>
                          {!lesson.available && (
                            <p className="text-sm text-slate-500 mt-1">Coming Soon</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Expand Button (left) + Start Session (right) */}
                  {lesson.available && (
                    <div className="mt-4 flex items-center justify-between">
                      {/* Expand/Collapse Button - Left */}
                      <button
                        onClick={() => toggleExpanded(lesson.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-base"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-5 h-5" />
                            Hide Overview
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-5 h-5" />
                            Lesson Overview
                          </>
                        )}
                      </button>

                      {/* Start Session Button - Right (Teacher Only) */}
                      {userRole === 'teacher' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartSession(lesson.id, lesson.route);
                          }}
                          disabled={creatingSession === lesson.id}
                          className={`font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 ${
                            creatingSession === lesson.id
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {creatingSession === lesson.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Creating...
                            </>
                          ) : (
                            'Start Session'
                          )}
                        </button>
                      )}

                      {/* Practice Solo Button - Right (Student Only) */}
                      {userRole !== 'teacher' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(lesson.route);
                          }}
                          className="font-semibold py-2.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                          Practice Solo
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* EXPANDED CONTENT */}
                {isExpanded && lesson.available && (
                  <div className="border-t border-slate-200">
                    {/* Section 1: Lesson Description */}
                    <div className="px-6 py-6 bg-slate-50 border-b border-slate-200">
                      {/* In This Lesson */}
                      <div className="mb-5">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                          In This Lesson
                        </h4>
                        <p className="text-lg text-slate-800">
                          {lesson.inThisLesson}
                        </p>
                      </div>

                      {/* Students Will */}
                      <div className="mb-5">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                          Students Will
                        </h4>
                        <ul className="space-y-2">
                          {lesson.studentsWill.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-2 text-base text-slate-800">
                              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Essential Question */}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                          Essential Question
                        </h4>
                        <p className="text-lg text-slate-800 italic">
                          "{lesson.essentialQuestion}"
                        </p>
                      </div>
                    </div>

                    {/* Section 2: Activities List */}
                    {userRole === 'teacher' && (
                      <div className="px-6 py-6">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
                          Activities
                        </h4>

                        {/* Activities Header Row */}
                        <div className="grid grid-cols-[200px_1fr_auto_60px_80px] gap-x-4 items-center py-2 border-b border-slate-200 mb-1">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Activity
                          </span>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Description
                          </span>
                          <span></span>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                            Time
                          </span>
                          <span></span>
                        </div>

                        {/* Activities Table with CSS Grid */}
                        <div className="space-y-0">
                          {lesson.activities.map((activity, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-[200px_1fr_auto_60px_80px] gap-x-4 items-center py-3 border-b border-slate-100 last:border-b-0"
                            >
                              {/* Column 1: Title */}
                              <span className={`text-base font-medium truncate ${activity.isBonus ? 'text-amber-700' : 'text-slate-800'}`}>
                                {activity.title}
                              </span>

                              {/* Column 2: Description */}
                              <span className="text-slate-700 text-base truncate">
                                {activity.description}
                              </span>

                              {/* Column 3: Badges */}
                              <div className="flex gap-1">
                                {activity.isPartnerActivity && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                                    Partner
                                  </span>
                                )}
                                {activity.isBonus && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                                    Bonus
                                  </span>
                                )}
                              </div>

                              {/* Column 4: Time */}
                              <span className="text-slate-600 text-base text-right">
                                {activity.time} min
                              </span>

                              {/* Column 5: Preview Button */}
                              <div className="text-right">
                                {activity.activityType ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDemoActivity(activity.activityType, activity.title);
                                    }}
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    <Play className="w-4 h-4" />
                                    Preview
                                  </button>
                                ) : (
                                  <span className="text-sm text-slate-400">—</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total Time */}
                        <div className="flex justify-end mt-4 pt-3 border-t border-slate-200">
                          <span className="text-base text-slate-600">
                            Total (excluding bonus):
                          </span>
                          <span className="text-base font-semibold text-slate-800 ml-2">
                            ~{totalTime} min
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Section 3: Lesson Plan Link (Teacher Only) */}
                    {lesson.hasLessonPlan && userRole === 'teacher' && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLessonPlan(lesson.id);
                          }}
                          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                          View Lesson Plan
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    )}
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
