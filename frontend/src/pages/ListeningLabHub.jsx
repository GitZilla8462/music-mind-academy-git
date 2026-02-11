// File: /pages/ListeningLabHub.jsx
// The Listening Lab Unit - Hub page for all lessons
// Unit 2: Elements of Music - Ear training through interactive games and listening maps

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { startClassSession } from '../firebase/classes';
import { ChevronDown, ChevronUp, Check, FileText, ExternalLink, Play, ArrowLeft, X } from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { logSessionCreated, logLessonVisit } from '../firebase/analytics';
import StartSessionModal from '../components/teacher/StartSessionModal';
import CreateClassModal from '../components/teacher/CreateClassModal';

const ListeningLabHub = () => {
  const navigate = useNavigate();
  const [creatingSession, setCreatingSession] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Get authenticated teacher info
  const { user, signOut } = useFirebaseAuth();

  // Default to teacher role - hub is for teachers
  const userRole = localStorage.getItem('classroom-user-role') || 'teacher';

  // Check site mode for correct join URL
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const joinUrl = isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join';

  // Check localStorage for Getting Started section state
  useEffect(() => {
    const savedState = localStorage.getItem('listeningLabGettingStartedOpen');
    if (savedState !== null) {
      setGettingStartedOpen(savedState === 'true');
    }
  }, []);

  const toggleGettingStarted = () => {
    const newState = !gettingStartedOpen;
    setGettingStartedOpen(newState);
    localStorage.setItem('listeningLabGettingStartedOpen', String(newState));
  };

  const toggleExpanded = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  // Open the start session modal
  const handleStartSession = (lesson) => {
    setSelectedLesson(lesson);
    setShowStartModal(true);
  };

  // Start session for a specific class (tracked)
  const handleStartForClass = async (selectedClass) => {
    if (!selectedLesson) return;

    setCreatingSession(selectedLesson.id);
    try {
      const classWithSession = await startClassSession(selectedClass.id, {
        lessonId: selectedLesson.id,
        lessonRoute: selectedLesson.route
      });

      if (user?.uid) {
        try {
          await logSessionCreated(user.uid, user.email, {
            sessionCode: classWithSession.classCode,
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
      const code = await createSession(teacherId, selectedLesson.id, selectedLesson.route, {
        classMode: 'guest'
      });

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
    if (selectedLesson) {
      setShowStartModal(true);
    }
  };

  const handleDemoActivity = (activityType, activityTitle) => {
    const demoUrl = `/demo?activity=${activityType}&title=${encodeURIComponent(activityTitle)}`;
    window.open(demoUrl, '_blank', 'width=1280,height=800,menubar=no,toolbar=no');
  };

  const handleOpenLessonPlan = (lessonId) => {
    const route = `/lesson-plan/listening-lab-${lessonId}`;
    window.open(route, '_blank');
  };

  const lessons = [
    // Lesson 1: Meet the Orchestra
    {
      id: 'listening-lab-lesson1',
      number: 1,
      icon: '🎻',
      title: 'Meet the Orchestra',
      concept: 'Instruments & Timbre',
      essentialQuestion: 'How does the sound of an instrument affect the mood of the music?',
      color: 'from-violet-500 to-purple-600',
      route: '/lessons/listening-lab/lesson1',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students learn to identify the four instrument families by sound, play Guess That Instrument with the class, and create their first Listening Map.',
      studentsWill: [
        'Identify instruments by their sound (strings, woodwinds, brass, percussion)',
        'Describe how different instruments contribute to the mood of a piece',
        'Create a Listening Map tracking instrument entries over time'
      ],
      activities: [
        { title: 'Opening Hook', description: 'What instruments do you hear?', time: 3 },
        { title: 'String Family', description: 'Listen to violin, viola, cello, bass', time: 2 },
        { title: 'Woodwind Family', description: 'Listen to flute, clarinet, oboe, bassoon', time: 2 },
        { title: 'Brass Family', description: 'Listen to trumpet, horn, trombone, tuba', time: 2 },
        { title: 'Percussion Family', description: 'Listen to timpani, snare, cymbals, more', time: 2 },
        { title: 'Guess That Instrument', description: 'Class game: Identify instruments by ear!', time: 12, activityType: 'guess-that-instrument' },
        { title: 'Listening Map Tutorial', description: 'Learn how to use the Listening Map', time: 3 },
        { title: 'Listening Map #1', description: 'Track instrument families in a piece', time: 15, activityType: 'listening-map-instruments' },
        { title: 'Reflection', description: 'Which instrument was easiest/hardest to identify?', time: 5, activityType: 'listening-lab-reflection' },
        { title: 'Orchestra Lab', description: 'Partner game: Pick sounds, guess instruments', time: 10, activityType: 'orchestra-lab', isBonus: true, isPartnerActivity: true }
      ]
    },
    // Lesson 2: Woodwinds & Tempo
    {
      id: 'listening-lab-lesson2',
      number: 2,
      icon: '🎵',
      title: 'Woodwinds & Tempo',
      concept: 'Instrument Families & Speed',
      essentialQuestion: 'How does the speed of music change how it makes us feel?',
      color: 'from-blue-500 to-cyan-600',
      route: '/lessons/listening-lab/lesson2',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students meet the woodwind family (flute, oboe, clarinet, bassoon), learn tempo markings (Largo to Presto), and create a Tempo Listening Map for Brahms\'s Hungarian Dance No. 5.',
      studentsWill: [
        'Identify woodwind instruments by sight and sound',
        'Define tempo markings (Largo, Adagio, Andante, Allegro, Presto)',
        'Identify tempo changes (accelerando, ritardando) in music',
        'Create a Tempo Listening Map for Hungarian Dance No. 5'
      ],
      activities: [
        { title: 'Meet the Woodwinds', description: 'See and hear flute, oboe, clarinet, bassoon', time: 5 },
        { title: 'Tempo Markings', description: 'Learn Largo, Adagio, Andante, Allegro, Presto', time: 3 },
        { title: 'Tempo Charades', description: 'Act out tempo terms for the class to guess!', time: 8, activityType: 'tempo-charades' },
        { title: 'Small Group Charades', description: 'Everyone gets a turn to act and guess', time: 10, activityType: 'tempo-charades-small-group' },
        { title: 'Active Listening', description: 'Listen to Hungarian Dance No. 5 by Brahms', time: 4 },
        { title: 'Tempo Listening Map', description: 'Map the tempo changes you hear', time: 8, activityType: 'tempo-listening-map' },
        { title: 'Reflection', description: 'What tempo terms will you remember?', time: 3, activityType: 'listening-lab-reflection' }
      ]
    },
    // Lesson 3: Thick or Thin
    {
      id: 'listening-lab-lesson3',
      number: 3,
      icon: '🥪',
      title: 'Thick or Thin',
      concept: 'Texture & Layers',
      essentialQuestion: 'How does the number of musical layers change what we hear and feel?',
      color: 'from-emerald-500 to-green-600',
      route: '/lessons/listening-lab/lesson3',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students learn about musical texture (monophonic, homophonic, polyphonic), count layers, and track texture changes in a Listening Map.',
      studentsWill: [
        'Identify texture types (monophonic, homophonic, polyphonic)',
        'Count musical layers and recognize solo vs. tutti',
        'Create a Listening Map tracking texture changes'
      ],
      activities: [
        { title: 'Introduction', description: 'What is musical texture?', time: 4 },
        { title: 'Texture Types', description: 'Monophonic, homophonic, polyphonic', time: 6 },
        { title: 'Solo vs. Tutti', description: 'One player vs. everyone together', time: 3 },
        { title: 'Thick or Thin Challenge', description: 'Class game: Identify texture and count layers!', time: 10, activityType: 'texture-game' },
        { title: 'Listening Map #3', description: 'Track texture changes and layer entries', time: 15, activityType: 'listening-map-texture' },
        { title: 'Reflection', description: 'What texture type did you hear most?', time: 5, activityType: 'listening-lab-reflection' }
      ]
    },
    // Lesson 4: Section Spotter
    {
      id: 'listening-lab-lesson4',
      number: 4,
      icon: '🔤',
      title: 'Section Spotter',
      concept: 'Form & Structure',
      essentialQuestion: 'How does recognizing patterns and sections help us understand music?',
      color: 'from-orange-500 to-amber-600',
      route: '/lessons/listening-lab/lesson4',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students learn to identify musical sections (A, B) and common forms (ABA, binary, rondo), then map the structure of a piece.',
      studentsWill: [
        'Identify A and B sections in music',
        'Recognize common forms (ABA, binary, rondo)',
        'Create a Listening Map showing musical form'
      ],
      activities: [
        { title: 'Introduction', description: 'What is musical form?', time: 3 },
        { title: 'A and B Sections', description: 'How sections repeat, contrast, and return', time: 5 },
        { title: 'Common Forms', description: 'Binary, ternary, rondo explained', time: 5 },
        { title: 'Section Spotter Challenge', description: 'Class game: Identify the form!', time: 12, activityType: 'section-spotter-game' },
        { title: 'Listening Map #4', description: 'Map the form of Turkish March', time: 15, activityType: 'listening-map-form' },
        { title: 'Reflection', description: 'What form patterns did you discover?', time: 5, activityType: 'listening-lab-reflection' }
      ]
    },
    // Lesson 5: The Full Picture
    {
      id: 'listening-lab-lesson5',
      number: 5,
      icon: '🎓',
      title: 'The Full Picture',
      concept: 'Putting It All Together',
      essentialQuestion: 'How do composers combine musical elements to create meaning and emotion?',
      color: 'from-pink-500 to-rose-600',
      route: '/lessons/listening-lab/lesson5',
      available: false,
      hasLessonPlan: false,
      inThisLesson: 'Students apply all four skills (timbre, dynamics/tempo, texture, form) to analyze a complete piece and create a comprehensive Listening Map.',
      studentsWill: [
        'Apply all listening skills to a single piece',
        'Create a comprehensive Listening Map covering all elements',
        'Reflect on how elements work together to create meaning'
      ],
      activities: [
        { title: 'Quick Review', description: 'Rapid-fire review of all four elements', time: 5 },
        { title: 'Ultimate Music Detective', description: 'Mixed questions from all lessons!', time: 12, activityType: 'ultimate-music-detective' },
        { title: 'Select Your Piece', description: 'Choose from teacher-provided options', time: 2 },
        { title: 'Listening Map #5', description: 'Comprehensive analysis - all elements', time: 20, activityType: 'listening-map-comprehensive' },
        { title: 'Written Reflection', description: 'How do elements create meaning?', time: 8, activityType: 'listening-lab-final-reflection' }
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
          <div className="w-18 h-18 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0" style={{ width: '72px', height: '72px' }}>
            <span className="text-4xl">🎧</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900">The Listening Lab</h2>
            <p className="text-xl text-slate-600 mt-1">
              Train your ears to hear the building blocks of music.
            </p>
          </div>
        </div>
        <p className="text-base text-slate-500 mt-4 ml-[92px]">
          5 Lessons  •  ~40 min each  •  Grades 6-8
        </p>
      </div>

      {/* GETTING STARTED - Collapsible */}
      <div className="max-w-5xl mx-auto px-8 pb-6">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl overflow-hidden shadow-sm">
          {/* Header - Always visible, clickable */}
          <button
            onClick={toggleGettingStarted}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-violet-100/50 transition-colors"
          >
            <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
              🚀 Getting Started
              <span className="text-sm font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">New here? Start here!</span>
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
                  <span className="flex-shrink-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center text-base font-semibold">1</span>
                  <span className="pt-0.5">Click <strong className="text-slate-900">"Start Lesson"</strong> on any lesson</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center text-base font-semibold">2</span>
                  <span className="pt-0.5">Choose <strong className="text-slate-900">"Quick Session"</strong> (no accounts needed) or <strong className="text-slate-900">"Classroom Mode"</strong> (tracks student work)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center text-base font-semibold">3</span>
                  <span className="pt-0.5">Students go to <strong className="text-violet-600">{joinUrl}</strong> and enter the code or sign in</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center text-base font-semibold">4</span>
                  <span className="pt-0.5">Click through slides (or use arrow keys) — click <strong className="text-slate-900">"Unlock"</strong> to start activities</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center text-base font-semibold">5</span>
                  <span className="pt-0.5">Click <strong className="text-slate-900">"End Session"</strong> when done</span>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800 text-base">
                  <strong>💡 Tip:</strong> Use the toggle button to preview student view
                </p>
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
                            <span className="text-base font-semibold text-violet-600">
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
                                      : 'bg-violet-500 hover:bg-violet-600 text-white'
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
                                        className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
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
                className="ml-2 text-violet-600 hover:text-violet-700 font-medium"
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
      </div>
    </div>
    </>
  );
};

export default ListeningLabHub;
