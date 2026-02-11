// File: /pages/MusicLoopsInMediaHub.jsx
// Music for Media Unit - Hub page for all lessons
// Updated: Added Getting Started banner and unit cards grid
// Updated: Added analytics tracking for pilot program

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { startClassSession } from '../firebase/classes';
import { ChevronDown, ChevronUp, Check, FileText, ExternalLink, Play, ArrowLeft, X } from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { logSessionCreated, logLessonVisit } from '../firebase/analytics';
import StartSessionModal from '../components/teacher/StartSessionModal';
import CreateClassModal from '../components/teacher/CreateClassModal';

const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';

// First-time tutorial modal for teachers
const TutorialModal = ({ onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('mma-tutorial-seen', 'true');
    }
    onClose();
  };

  const handleWatchVideo = () => {
    window.open('/lessons/TutorialVideo.mp4', '_blank', 'width=1280,height=720,menubar=no,toolbar=no');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">New to {isEduSite ? 'Music Room Tools' : 'Music Mind Academy'}?</h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-gray-700 text-lg mb-5">
            Watch the tutorial video below to learn how to run a lesson!
          </p>

          {/* Watch Tutorial Button */}
          <button
            onClick={handleWatchVideo}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all mb-4"
          >
            <Play size={20} fill="currentColor" />
            Watch: How to Run a Lesson (2 min)
          </button>

          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm">Don't show this again</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            Got it, let's start!
          </button>
        </div>
      </div>
    </div>
  );
};

const MusicLoopsInMediaHub = () => {
  const navigate = useNavigate();
  const [creatingSession, setCreatingSession] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Get authenticated teacher info
  const { user, signOut } = useFirebaseAuth();

  // Show tutorial modal for first-time visitors
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('mma-tutorial-seen') === 'true';
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Default to teacher role - hub is for teachers
  const userRole = localStorage.getItem('classroom-user-role') || 'teacher';

  // Check site mode for correct join URL
  const joinUrl = isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join';

  // Check localStorage for Getting Started section state
  // Collapsed by default, user can expand if needed
  useEffect(() => {
    const savedState = localStorage.getItem('gettingStartedOpen');
    if (savedState !== null) {
      setGettingStartedOpen(savedState === 'true');
    }
    // If no saved state, keep default (false/collapsed)
  }, []);

  const toggleGettingStarted = () => {
    const newState = !gettingStartedOpen;
    setGettingStartedOpen(newState);
    localStorage.setItem('gettingStartedOpen', String(newState));
  };

  const toggleExpanded = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  // Open the start session modal instead of immediately starting
  const handleStartSession = (lesson) => {
    setSelectedLesson(lesson);
    setShowStartModal(true);
  };

  // Start session for a specific class (tracked)
  // Uses the permanent class code instead of generating a new session code
  const handleStartForClass = async (selectedClass) => {
    if (!selectedLesson) return;

    setCreatingSession(selectedLesson.id);
    try {
      // Start session on the class record (uses class code, not session code)
      const classWithSession = await startClassSession(selectedClass.id, {
        lessonId: selectedLesson.id,
        lessonRoute: selectedLesson.route
      });

      // Log analytics - use classCode as sessionCode for class sessions
      if (user?.uid) {
        try {
          await logSessionCreated(user.uid, user.email, {
            sessionCode: classWithSession.classCode, // Use class code as session identifier
            lessonId: selectedLesson.id,
            lessonRoute: selectedLesson.route,
            classId: selectedClass.id,
            className: selectedClass.name,
            isClassSession: true
          });
          await logLessonVisit(user.uid, user.email, selectedLesson.id);
        } catch (analyticsError) {
          console.warn('Analytics logging failed:', analyticsError);
        }
      }

      setShowStartModal(false);
      // Navigate with classId - students will use the class code to join
      navigate(`${selectedLesson.route}?classId=${selectedClass.id}&role=teacher&classCode=${classWithSession.classCode}`);
    } catch (error) {
      console.error('Error starting class session:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setCreatingSession(null);
    }
  };

  // Start a quick session (not tracked)
  const handleStartQuickSession = async () => {
    if (!selectedLesson) return;

    setCreatingSession(selectedLesson.id);
    try {
      const teacherId = user?.uid || 'teacher';
      // Pass guest mode for quick sessions - no sign-in required
      const code = await createSession(teacherId, selectedLesson.id, selectedLesson.route, {
        classMode: 'guest'
      });

      // Log analytics
      if (user?.uid) {
        try {
          await logSessionCreated(user.uid, user.email, {
            sessionCode: code,
            lessonId: selectedLesson.id,
            lessonRoute: selectedLesson.route,
            isQuickSession: true
          });
          await logLessonVisit(user.uid, user.email, selectedLesson.id);
        } catch (analyticsError) {
          console.warn('Analytics logging failed:', analyticsError);
        }
      }

      setShowStartModal(false);
      navigate(`${selectedLesson.route}?session=${code}&role=teacher`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setCreatingSession(null);
    }
  };

  // Handle class creation from the modal
  const handleCreateClassFromModal = () => {
    setShowStartModal(false);
    setShowCreateClassModal(true);
  };

  // After class is created, reopen the start modal
  const handleClassCreated = () => {
    setShowCreateClassModal(false);
    // Reopen start modal so they can select the new class
    if (selectedLesson) {
      setShowStartModal(true);
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
    // Lesson 1: Mood (Drone Footage)
    {
      id: 'lesson1',
      number: 1,
      icon: '🎬',
      title: 'Score the Adventure',
      concept: 'Mood & Expression',
      essentialQuestion: 'How does music create an emotional atmosphere?',
      color: 'from-purple-500 to-indigo-600',
      route: '/lessons/film-music-project/lesson1',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students discover how music creates emotion by watching the same video with different scores, then compose their own adventure soundtrack.',
      studentsWill: [
        'Identify how music creates different moods',
        'Match loops to mood categories (Heroic, Hype, Mysterious, Scary, Upbeat)',
        'Compose a soundtrack for drone footage'
      ],
      activities: [
        { title: 'Introduction', description: 'Welcome, agenda, and hook setup', time: 3 },
        { title: 'Hook Video', description: 'Same scene with different scores', time: 3 },
        { title: 'Mood Discussion', description: 'How did the music change the feeling?', time: 2 },
        { title: 'Mood Categories', description: 'Introduce the 5 mood types', time: 2 },
        { title: 'Mood Match Game', description: 'Listen to loops, match to moods', time: 5, activityType: 'mood-match-game' },
        { title: 'DAW Tutorial Video', description: 'Learn to use the composition tool', time: 2 },
        { title: 'Composition', description: 'Pick a mood, score drone footage with 5+ loops', time: 12, activityType: 'adventure-composition' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your composition', time: 5, activityType: 'two-stars-wish' },
        { title: 'Conclusion', description: 'Share moods and discuss', time: 2 }
      ]
    },
    // Lesson 2: Layers/Texture (City Soundscape)
    {
      id: 'lesson2',
      number: 2,
      icon: '🏙️',
      title: 'City Soundscapes',
      concept: 'Texture & Layering',
      essentialQuestion: 'How do layers of sound create texture?',
      color: 'from-cyan-500 to-blue-600',
      route: '/lessons/film-music-project/lesson2',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn how layers create texture through the sandwich analogy, practice identifying layers in Layer Detective, then compose their own city soundscape.',
      studentsWill: [
        'Understand thin vs. thick musical texture (sandwich analogy)',
        'Identify the number of layers in music (Layer Detective game)',
        'Build layered compositions for city footage'
      ],
      activities: [
        { title: 'Introduction', description: 'Texture concept with sandwich analogy', time: 5 },
        { title: 'Layer Detective', description: 'Class game: Count layers, earn points!', time: 5, activityType: 'layer-detective' },
        { title: 'Composition', description: 'Create a city soundscape with 5+ layers', time: 12, activityType: 'city-composition-activity' },
        { title: 'Two Stars and a Wish', description: 'Reflect on your layers', time: 6, activityType: 'two-stars-wish' },
        { title: 'Robot Melody Maker', description: 'Create loops and watch your robot dance', time: 10, activityType: 'robot-melody-maker', isBonus: true }
      ]
    },
    // Lesson 3: Form/Structure (Epic Wildlife)
    {
      id: 'lesson3',
      number: 3,
      icon: '🌍',
      title: 'Epic Wildlife',
      concept: 'Form & Structure',
      essentialQuestion: 'How do sections organize to tell a musical story?',
      color: 'from-green-500 to-teal-600',
      route: '/lessons/film-music-project/lesson3',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn how film scores follow a story arc with distinct sections (Intro → A → A\' → Outro). They play a section-matching game, then compose an epic nature documentary soundtrack.',
      studentsWill: [
        'Identify sections in sectional loop form (Intro, A, A\', Outro)',
        'Compose a complete film score with clear structure',
        '(Bonus) Create a listening map visualizing song form'
      ],
      activities: [
        { title: 'Introduction', description: 'Song form and sectional loop structure (Intro → A → A\' → Outro)', time: 3 },
        { title: 'Sectional Loop Form', description: 'Learn how A\' differs from A while staying connected', time: 3 },
        { title: 'Section Safari', description: 'Game: Listen to clips and identify which section is playing. Leaderboard on projector!', time: 12, activityType: 'sectional-loop-builder' },
        { title: 'Composition', description: 'Score epic wildlife footage with Intro → A → A\' → Outro structure', time: 14, activityType: 'wildlife-composition-activity' },
        { title: 'Reflection & Wrap-Up', description: 'Two Stars and a Wish + class discussion', time: 8, activityType: 'two-stars-wish' },
        { title: 'Listening Map', description: 'Watch video explanation, then draw along to Vivaldi\'s Spring', time: 14, activityType: 'listening-map', isBonus: true }
      ]
    },
    // Lesson 4: Beat/Rhythm (Sports Highlight)
    {
      id: 'lesson4',
      number: 4,
      icon: '🏀',
      title: 'Sports Highlight Reel',
      concept: 'Rhythm & Beat',
      essentialQuestion: 'How do rhythmic phrases convey energy?',
      color: 'from-orange-500 to-red-600',
      route: '/lessons/film-music-project/lesson4',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn how rhythm and beat create energy by comparing video with/without music, learn drum sounds, create their own beat, then score a sports highlight.',
      studentsWill: [
        'Explain the role of kick, snare, and hi-hat in a beat',
        'Create an original 4-bar rhythmic pattern',
        'Combine beats with loops to score a sports video'
      ],
      activities: [
        { title: 'Hook', description: 'Compare video with and without music', time: 6 },
        { title: 'Beat Basics', description: 'Beat, measure, kick, snare, hi-hat', time: 5 },
        { title: 'Build Your Beat', description: 'Create a drum pattern using the grid', time: 8, activityType: 'student-beat-maker' },
        { title: 'Composition', description: 'Use your beat + 3 loops to score sports video', time: 13, activityType: 'sports-composition-activity' },
        { title: 'Beat Spotlight', description: 'Reflect on your rhythmic choices', time: 4, activityType: 'beat-spotlight' },
        { title: 'Conclusion', description: 'Rhythm is the heartbeat of your music', time: 1 },
        { title: 'Beat Escape Room', description: 'Create beat puzzles for a partner to solve', time: 10, activityType: 'beat-escape-room', isBonus: true, isPartnerActivity: true }
      ]
    },
    // Lesson 5: Melody & Contour (Game On!)
    {
      id: 'lesson5',
      number: 5,
      icon: '🎮',
      title: 'Game On!',
      concept: 'Melody & Contour',
      essentialQuestion: 'How do melodic phrases create memorable themes?',
      color: 'from-pink-500 to-purple-600',
      route: '/lessons/film-music-project/lesson5',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students discover how melody creates memorable themes by analyzing famous game music, learning about contour patterns (ascending, descending, arch), and composing their own video game soundtrack.',
      studentsWill: [
        'Identify and describe contour patterns in melodies',
        'Create an 8-beat melody using pentatonic scale',
        'Compose a video game soundtrack with layered melodies'
      ],
      activities: [
        { title: 'Hook', description: 'Guess the game from the melody', time: 4 },
        { title: 'Vocabulary', description: 'Melody, contour, phrase, ascending/descending', time: 4 },
        { title: 'Building a Melody Demo', description: 'Teacher demonstrates contour patterns', time: 3, activityType: 'melody-builder-demo' },
        { title: 'Make Your Melody', description: 'Create an 8-beat melody with contour', time: 8, activityType: 'student-melody-maker' },
        { title: 'Composition', description: 'Layer melodies to score game footage', time: 12, activityType: 'game-composition-activity' },
        { title: 'Melody Spotlight', description: 'Reflect on your melodic choices', time: 5, activityType: 'melody-spotlight' },
        { title: 'Discussion', description: 'What contour did you use? Why?', time: 2 },
        { title: 'Melody Mystery', description: 'Create melody puzzles for a partner to solve', time: 10, activityType: 'melody-mystery', isBonus: true, isPartnerActivity: true }
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

      {/* UNIT HEADER */}
      <div className="max-w-5xl mx-auto px-8 pt-8 pb-6">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0" style={{ width: '72px', height: '72px' }}>
            <span className="text-4xl">🎬</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900">Music for Media</h2>
            <p className="text-xl text-slate-600 mt-1">
              Create soundtracks for video — the way professionals do it.
            </p>
          </div>
        </div>
        <p className="text-base text-slate-500 mt-4 ml-[92px]">
          5 Lessons  •  ~40 min each  •  Grades 6-8
        </p>
      </div>

      {/* GETTING STARTED - Collapsible */}
      <div className="max-w-5xl mx-auto px-8 pb-6">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl overflow-hidden shadow-sm">
          {/* Header - Always visible, clickable */}
          <button
            onClick={toggleGettingStarted}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-sky-100/50 transition-colors"
          >
            <h2 className="text-xl font-bold text-sky-900 flex items-center gap-2">
              🚀 Getting Started
              <span className="text-sm font-medium text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">New here? Start here!</span>
            </h2>
            {gettingStartedOpen ? (
              <ChevronUp className="w-6 h-6 text-slate-500" />
            ) : (
              <ChevronDown className="w-6 h-6 text-slate-500" />
            )}
          </button>

          {/* Content - Collapsible */}
          {gettingStartedOpen && (
            <div className="px-6 pb-6 border-t border-slate-100">
              <ol className="mt-5 space-y-4 text-lg text-slate-700">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-base font-semibold">1</span>
                  <span className="pt-0.5">Click <strong className="text-slate-900">"Start Lesson"</strong> on any lesson</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-base font-semibold">2</span>
                  <span className="pt-0.5">Choose <strong className="text-slate-900">"Quick Session"</strong> (no accounts needed) or <strong className="text-slate-900">"Classroom Mode"</strong> (tracks student work)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-base font-semibold">3</span>
                  <span className="pt-0.5">Students go to <strong className="text-sky-600">{joinUrl}</strong> and enter the code or sign in</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-base font-semibold">4</span>
                  <span className="pt-0.5">Click through slides (or use arrow keys) — click <strong className="text-slate-900">"Unlock"</strong> to start activities</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center text-base font-semibold">5</span>
                  <span className="pt-0.5">Click <strong className="text-slate-900">"End Session"</strong> when done</span>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-base">
                  <strong>💡 Tip:</strong> Use the toggle button to preview student view
                </p>
              </div>

              {/* Tutorial Video Thumbnail */}
              <div className="mt-6">
                <button
                  onClick={() => window.open('/lessons/TutorialVideo.mp4', '_blank', 'width=1280,height=720,menubar=no,toolbar=no')}
                  className="group relative w-full max-w-md rounded-xl overflow-hidden border-2 border-slate-200 hover:border-sky-400 transition-all shadow-sm hover:shadow-lg"
                >
                  {/* Video Thumbnail Background */}
                  <div className="aspect-video bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 flex items-center justify-center relative">
                    {/* Decorative elements */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-lg"></div>
                      <div className="absolute bottom-4 right-4 w-24 h-3 bg-white rounded"></div>
                      <div className="absolute bottom-10 right-4 w-16 h-3 bg-white rounded"></div>
                    </div>

                    {/* Play Button */}
                    <div className="w-20 h-20 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-sky-600 ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="bg-white px-4 py-3 text-left">
                    <p className="font-semibold text-slate-900 text-base">Watch: How to Run a Lesson</p>
                    <p className="text-sm text-slate-500">2 min tutorial</p>
                  </div>
                </button>
              </div>
            </div>
          )}
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
                      lesson.available ? '' : 'opacity-50'
                    }`}
                  >
                    {/* COLLAPSED CARD HEADER - Clickable to expand/collapse */}
                    <div
                      className={`px-5 py-4 ${lesson.available ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                      onClick={() => lesson.available && toggleExpanded(lesson.id)}
                    >
                      <div className="flex items-center gap-5">
                        {/* Gradient Icon */}
                        <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${lesson.color} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-2xl">{lesson.icon}</span>
                        </div>

                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-semibold text-sky-600">
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
                            ~40 min
                          </span>
                          {!lesson.available && (
                            <span className="text-base text-slate-400">Coming Soon</span>
                          )}
                          {lesson.available && (
                            <>
                              {/* Expand/Collapse indicator */}
                              {isExpanded ? (
                                <ChevronUp className="w-6 h-6 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-6 h-6 text-slate-400" />
                              )}

                              {/* Start Session Button */}
                              {userRole === 'teacher' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartSession(lesson);
                                  }}
                                  disabled={creatingSession === lesson.id}
                                  className={`font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 text-base ${
                                    creatingSession === lesson.id
                                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                      : 'bg-sky-500 hover:bg-sky-600 text-white'
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
                            </>
                          )}
                        </div>
                      </div>
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
                                        className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 font-medium"
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
                                ~40 min
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

      {/* FOOTER HELP LINKS */}
      {!isEduSite && (
        <div className="border-t border-slate-200 bg-white mt-8">
          <div className="max-w-5xl mx-auto px-8 py-8">
            <div className="flex items-center justify-center text-base text-slate-600">
              <span>Need help?</span>
              <a
                href="mailto:rob@musicmindacademy.com"
                className="ml-2 text-sky-600 hover:text-sky-700 font-medium"
              >
                rob@musicmindacademy.com
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Start Session Modal */}
      <StartSessionModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
        teacherUid={user?.uid}
        onStartForClass={handleStartForClass}
        onStartQuickSession={handleStartQuickSession}
        onCreateClass={handleCreateClassFromModal}
      />

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        teacherUid={user?.uid}
        onClassCreated={handleClassCreated}
      />

      {/* Tutorial Modal - shows for first-time visitors */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}
      </div>
    </div>
    </>
  );
};

export default MusicLoopsInMediaHub;
