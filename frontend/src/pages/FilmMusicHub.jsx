// File: /pages/FilmMusicHub.jsx
// Film Music: Scoring the Story - Hub page for all lessons
// Developer-only access for now

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { ChevronDown, ChevronUp, Check, FileText, ExternalLink, Play, ArrowLeft, Lock } from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { logSessionCreated, logLessonVisit } from '../firebase/analytics';

// Developer-only access
const DEVELOPER_EMAILS = ['robtaube90@gmail.com'];

const FilmMusicHub = () => {
  const navigate = useNavigate();
  const [creatingSession, setCreatingSession] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);

  // Get authenticated teacher info
  const { user, signOut } = useFirebaseAuth();

  // Check if user is developer
  const isDeveloper = user && DEVELOPER_EMAILS.includes(user.email?.toLowerCase());

  // Default to teacher role - hub is for teachers
  const userRole = localStorage.getItem('classroom-user-role') || 'teacher';

  // Check site mode for correct join URL
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const joinUrl = isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join';

  // Check localStorage for Getting Started section state
  useEffect(() => {
    const savedState = localStorage.getItem('filmMusicGettingStartedOpen');
    if (savedState !== null) {
      setGettingStartedOpen(savedState === 'true');
    }
  }, []);

  const toggleGettingStarted = () => {
    const newState = !gettingStartedOpen;
    setGettingStartedOpen(newState);
    localStorage.setItem('filmMusicGettingStartedOpen', String(newState));
  };

  const toggleExpanded = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleStartSession = async (lessonId, lessonRoute) => {
    setCreatingSession(lessonId);
    try {
      const teacherId = user?.uid || 'teacher';
      const teacherEmail = user?.email || 'anonymous';

      const code = await createSession(teacherId, lessonId, lessonRoute);

      // Log analytics for pilot tracking
      if (user?.uid) {
        try {
          await logSessionCreated(user.uid, user.email, {
            sessionCode: code,
            lessonId,
            lessonRoute
          });
          await logLessonVisit(user.uid, user.email, lessonId);
        } catch (analyticsError) {
          console.warn('Analytics logging failed (non-critical):', analyticsError);
        }
      }

      navigate(`${lessonRoute}?session=${code}&role=teacher`);
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
    const route = `/lesson-plan/film-music/${lessonId}`;
    window.open(route, '_blank');
  };

  const lessons = [
    // Lesson 1: WHO Is In The Story? (Leitmotif)
    {
      id: 'fm-lesson1',
      number: 1,
      icon: '🎭',
      title: 'WHO Is In The Story?',
      concept: 'Leitmotif & Melody',
      essentialQuestion: 'How does music give characters identity?',
      color: 'from-orange-500 to-amber-600',
      route: '/lessons/film-music/lesson1',
      available: true, // Now available!
      hasLessonPlan: false,
      inThisLesson: 'Students discover how composers create character identity through melody. They learn keyboard basics, play Leitmotif Detective, then create their own character theme.',
      studentsWill: [
        'Understand what a leitmotif is and how it identifies characters',
        'Play melodies using the computer keyboard (A-S-D-F-G-H-J = C-D-E-F-G-A-B)',
        'Create a 4-8 note character theme (Theme A) for a video clip'
      ],
      activities: [
        { title: 'Hook', description: 'Darth Vader breathing... then Imperial March. "You knew who was coming."', time: 3 },
        { title: 'Learn', description: 'What is a leitmotif? How composers create identity through melody.', time: 7 },
        { title: 'Keyboard Basics', description: 'Computer keyboard mapping to notes', time: 5, activityType: 'keyboard-tutorial' },
        { title: 'Leitmotif Detective', description: 'Identify character types from themes (Hero, Villain, Love Interest, etc.)', time: 10, activityType: 'leitmotif-detective' },
        { title: 'Motif Builder', description: 'Create Theme A (4-8 notes) for your character', time: 12, activityType: 'motif-builder' },
        { title: 'Two Stars & a Wish', description: 'Reflect on your theme', time: 3, activityType: 'two-stars-wish' }
      ]
    },
    // Lesson 2: WHAT Do They Feel? (Orchestration/Bass)
    {
      id: 'fm-lesson2',
      number: 2,
      icon: '💭',
      title: 'WHAT Do They Feel?',
      concept: 'Orchestration & Bass',
      essentialQuestion: 'How do instruments reveal inner emotion?',
      color: 'from-blue-500 to-indigo-600',
      route: '/lessons/film-music/lesson2',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students learn that we hear what characters feel inside, even when they hide it. They explore how different instruments change emotional meaning, then add a bassline to their theme.',
      studentsWill: [
        'Understand how instrument choice (timbre) affects emotional meaning',
        'Play bass notes with the left hand (slower, sustained notes)',
        'Add a bassline underneath Theme A from Lesson 1'
      ],
      activities: [
        { title: 'Hook', description: 'Scene: Character smiles but music is sad. "What do they REALLY feel?"', time: 3 },
        { title: 'Learn', description: 'Instruments carry emotion. Same melody, different instrument = different feeling.', time: 5 },
        { title: 'Bass Basics', description: 'Bass clef range, playing with left hand, slower movement', time: 5, activityType: 'bass-tutorial' },
        { title: 'Instrument Emotion Lab', description: 'Same melody, 6 instruments, rate emotions', time: 8, activityType: 'instrument-emotion-lab' },
        { title: 'Bass Builder', description: 'Experiment with bass notes under your melody', time: 7, activityType: 'bass-builder' },
        { title: 'Compose', description: 'Add bassline underneath Theme A from Lesson 1', time: 10, activityType: 'fm-composition' },
        { title: 'Partner Share', description: 'Why did you choose that bass approach?', time: 2 }
      ]
    },
    // Lesson 3: WHEN Does Music Speak? (Spotting/Silence)
    {
      id: 'fm-lesson3',
      number: 3,
      icon: '🔇',
      title: 'WHEN Does Music Speak?',
      concept: 'Spotting & Silence',
      essentialQuestion: 'When should music talk and when should it listen?',
      color: 'from-slate-500 to-gray-700',
      route: '/lessons/film-music/lesson3',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students discover that silence is powerful. They learn spotting (deciding where music goes), explore sound effects, then adjust their composition with intentional silence.',
      studentsWill: [
        'Understand spotting: deciding where music enters and exits',
        'Identify diegetic vs. non-diegetic sound',
        'Use intentional silence and sound effects purposefully'
      ],
      activities: [
        { title: 'Hook', description: 'Same scene: with music vs. without. "Which is more powerful? When?"', time: 4 },
        { title: 'Learn', description: 'Spotting = deciding where music goes. Diegetic vs. non-diegetic.', time: 5 },
        { title: 'SFX Intro', description: 'Types of SFX: ambient, impact, tension, transition', time: 4, activityType: 'sfx-intro' },
        { title: 'Silence Study', description: 'Compare scenes with/without strategic silence', time: 8, activityType: 'silence-study' },
        { title: 'Spotting Session', description: 'Mark IN/OUT points on professional scene', time: 8, activityType: 'spotting-session' },
        { title: 'Compose', description: 'Adjust Theme A + Bass placement, add silence and SFX', time: 9, activityType: 'fm-composition' },
        { title: 'Reflect', description: 'Why did you put silence THERE?', time: 2 }
      ]
    },
    // Lesson 4: HOW Does Tension Build? (Harmony)
    {
      id: 'fm-lesson4',
      number: 4,
      icon: '😰',
      title: 'HOW Does Tension Build?',
      concept: 'Tension & Harmony',
      essentialQuestion: 'How does music follow the story arc?',
      color: 'from-red-500 to-rose-700',
      route: '/lessons/film-music/lesson4',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students learn that music follows the story arc. When the story gets tense, the music builds. They explore tension techniques and add harmony (chords/pads) to their composition.',
      studentsWill: [
        'Understand tension techniques: drone, layers, dissonance, accelerando',
        'Play chords (3+ notes together) and understand major vs minor',
        'Add a harmonic pad with chord changes to create tension and release'
      ],
      activities: [
        { title: 'Hook', description: 'Jaws: Two notes. "How does music make us feel what\'s coming?"', time: 3 },
        { title: 'Learn', description: 'Tension techniques: drone, layers, dissonance, accelerando', time: 5 },
        { title: 'Chord Basics', description: 'A chord = 3+ notes together, major vs minor, pads sustain chords', time: 5, activityType: 'chord-tutorial' },
        { title: 'Tension Timeline', description: 'Graph tension level over suspense scene', time: 8, activityType: 'tension-timeline' },
        { title: 'Harmony Lab', description: 'Try different chord/pad options under melody', time: 7, activityType: 'harmony-lab' },
        { title: 'Compose', description: 'Add harmonic pad underneath Theme A + Bass', time: 10, activityType: 'fm-composition' },
        { title: 'Reflect', description: 'Where is your tension? Where is your release?', time: 2 }
      ]
    },
    // Lesson 5: Complete Story (Integration)
    {
      id: 'fm-lesson5',
      number: 5,
      icon: '🎬',
      title: 'Complete Story',
      concept: 'Integration & Refinement',
      essentialQuestion: 'How do all elements serve the narrative?',
      color: 'from-emerald-500 to-teal-600',
      route: '/lessons/film-music/lesson5',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students bring everything together. They refine their cumulative composition, participate in peer review, and complete Composer\'s Notes explaining their creative choices.',
      studentsWill: [
        'Review and apply all concepts: WHO, WHAT, WHEN, HOW',
        'Refine their complete film score with all elements',
        'Present work with written explanation of expressive intent (Composer\'s Notes)'
      ],
      activities: [
        { title: 'Hook', description: 'Watch a perfectly scored scene. "Everything works together."', time: 3 },
        { title: 'Review', description: 'WHO (leitmotif) + WHAT (timbre/bass) + WHEN (spotting) + HOW (harmony)', time: 5 },
        { title: 'Final Composition', description: 'Refinements, hit points, timing, balance', time: 15, activityType: 'fm-composition-final' },
        { title: 'Peer Review', description: 'Watch partner\'s score, give Glow/Grow feedback', time: 10, activityType: 'peer-review' },
        { title: 'Composer\'s Notes', description: 'Complete written reflection explaining choices', time: 5, activityType: 'composer-notes' },
        { title: 'Share', description: 'Volunteer shares or teacher highlights examples', time: 2 }
      ]
    }
  ];

  const getTotalTime = (activities) => {
    return activities
      .filter(a => !a.isBonus)
      .reduce((sum, a) => sum + (a.time || 0), 0);
  };

  return (
    <>
      <style>{`
        @media (max-width: 1400px) {
          .hub-wrapper {
            height: 100vh;
            overflow: auto;
          }
          .hub-container {
            transform: scale(0.75);
            transform-origin: top left;
            width: 133.33%;
            min-height: 133.33%;
          }
        }
      `}</style>
      <div className="hub-wrapper">
        <div className="hub-container min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/music-classroom-resources')}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Units</span>
              </button>
            </div>
            {user && (
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    localStorage.removeItem('classroom-logged-in');
                    navigate('/login');
                  } catch (err) {
                    console.error('Logout failed:', err);
                  }
                }}
                className="text-lg text-slate-600 hover:text-slate-900 font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DEVELOPER BANNER */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-8 py-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Lock size={18} />
            <span className="font-medium">Developer Preview</span>
            <span className="text-amber-600">— This unit is under development. Lessons are not yet available.</span>
          </div>
        </div>
      </div>

      {/* UNIT HEADER */}
      <div className="max-w-5xl mx-auto px-8 pt-8 pb-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0" style={{ width: '72px', height: '72px' }}>
            <span className="text-4xl">🎵</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900">Film Music: Scoring the Story</h2>
            <p className="text-xl text-slate-600 mt-1">
              Tell stories through music — the way Hollywood composers do.
            </p>
          </div>
        </div>
        <p className="text-base text-slate-500 mt-4 ml-[92px]">
          5 Lessons  •  ~40 min each  •  Grades 6-8  •  Cumulative Project
        </p>
      </div>

      {/* WHAT MAKES THIS DIFFERENT */}
      <div className="max-w-5xl mx-auto px-8 pb-6">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={toggleGettingStarted}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-orange-100/50 transition-colors"
          >
            <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
              🎬 What Makes This Unit Different?
            </h2>
            {gettingStartedOpen ? (
              <ChevronUp className="w-6 h-6 text-slate-500" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-500" />
            )}
          </button>

          {gettingStartedOpen && (
            <div className="px-6 pb-6 border-t border-orange-100">
              <div className="mt-5 grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Music for Media (Current)</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      Drone footage, city, sports, games
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      Loop-based DAW only
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      What music SOUNDS like (elements)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-slate-400">•</span>
                      Each lesson = new composition
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-800 mb-3">Film Music: Scoring the Story</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Narrative scenes with characters & dialogue
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Virtual keyboard instrument + loops
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      What music MEANS (story, intent)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Cumulative — build ONE project across all 5 lessons
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">The Big Ideas</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div>• Film composers are storytellers</div>
                  <div>• Music reveals the invisible</div>
                  <div>• Music identifies characters</div>
                  <div>• Music foreshadows what's coming</div>
                  <div>• Silence is a choice</div>
                  <div>• Instruments have meaning</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUMULATIVE MODEL BANNER */}
      <div className="max-w-5xl mx-auto px-8 pb-6">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
            🎼 Cumulative Composition Model
          </h3>
          <p className="text-emerald-800 mb-4">
            Students build ONE project across all 5 lessons. Each lesson adds a new layer:
          </p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg">L1: Theme</span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg">L2: + Bass</span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg">L3: + Silence/SFX</span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg">L4: + Harmony</span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg">L5: Complete Score</span>
          </div>
        </div>
      </div>

      {/* LESSON CARDS */}
      <div className="max-w-5xl mx-auto px-8 pb-10">
        <div className="space-y-4">
              {lessons.map((lesson) => {
                const isExpanded = expandedLessons[lesson.id];
                const totalTime = getTotalTime(lesson.activities);

                return (
                  <div
                    key={lesson.id}
                    className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all ${
                      lesson.available ? '' : 'opacity-70'
                    }`}
                  >
                    {/* COLLAPSED CARD HEADER */}
                    <div
                      className="px-5 py-4 cursor-pointer hover:bg-slate-50"
                      onClick={() => toggleExpanded(lesson.id)}
                    >
                      <div className="flex items-center gap-5">
                        {/* Gradient Icon */}
                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${lesson.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-2xl">{lesson.icon}</span>
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-semibold text-orange-600">
                              Lesson {lesson.number}
                            </span>
                            <span className="text-slate-300">•</span>
                            <h3 className="text-xl font-bold text-slate-900">
                              {lesson.title}
                            </h3>
                            <span className="text-slate-300">•</span>
                            <span className="text-base text-slate-600">
                              {lesson.concept}
                            </span>
                          </div>
                        </div>

                        {/* Right side: Time + Actions */}
                        <div className="flex items-center gap-5 flex-shrink-0">
                          <span className="text-base text-slate-500">
                            ~{totalTime} min
                          </span>
                          {!lesson.available && (
                            <span className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-100 rounded-full">
                              Coming Soon
                            </span>
                          )}
                          {/* Expand/Collapse indicator */}
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-slate-400" />
                          )}

                          {/* Start Session Button - disabled for now */}
                          {lesson.available && userRole === 'teacher' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartSession(lesson.id, lesson.route);
                              }}
                              disabled={creatingSession === lesson.id}
                              className={`font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 text-base ${
                                creatingSession === lesson.id
                                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white'
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
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED CONTENT */}
                    {isExpanded && (
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

                          {/* Activities Table */}
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
                                  {activity.activityType && lesson.available ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDemoActivity(activity.activityType, activity.title);
                                      }}
                                      className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                                    >
                                      <Play size={14} />
                                      Preview
                                    </button>
                                  ) : activity.activityType ? (
                                    <span className="text-sm text-slate-400">
                                      Coming
                                    </span>
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
                              Total:
                            </span>
                            <span className="text-base font-semibold text-slate-800 ml-2">
                              ~{totalTime} min
                            </span>
                          </div>
                        </div>

                        {/* Not Available Notice */}
                        {!lesson.available && (
                          <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
                            <div className="flex items-center gap-2 text-amber-800">
                              <Lock size={18} />
                              <span>This lesson is under development and not yet available for sessions.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </div>

      {/* FOOTER HELP LINKS */}
      <div className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center justify-center text-base text-slate-600">
            <span>Need help?</span>
            <a
              href="mailto:rob@musicmindacademy.com"
              className="ml-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              rob@musicmindacademy.com
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default FilmMusicHub;
