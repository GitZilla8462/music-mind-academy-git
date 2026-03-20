// File: /pages/MusicJournalistHub.jsx
// Music Journalist Unit - Hub page for all lessons
// Unit 3: Read, Research, and Report on the World of Music

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { startClassSession } from '../firebase/classes';
import { ChevronDown, ChevronUp, Check, Play, ArrowLeft } from 'lucide-react';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { logSessionCreated, logLessonVisit } from '../firebase/analytics';
import StartSessionModal from '../components/teacher/StartSessionModal';
import CreateClassModal from '../components/teacher/CreateClassModal';
import TeacherHeader from '../components/teacher/TeacherHeader';

const MusicJournalistHub = () => {
  const navigate = useNavigate();
  const [creatingSession, setCreatingSession] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [newlyCreatedClass, setNewlyCreatedClass] = useState(null);

  const { user, signOut } = useFirebaseAuth();
  const userRole = localStorage.getItem('classroom-user-role') || 'teacher';
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const joinUrl = isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join';

  useEffect(() => {
    const savedState = localStorage.getItem('musicJournalistGettingStartedOpen');
    if (savedState !== null) {
      setGettingStartedOpen(savedState === 'true');
    }
  }, []);

  const toggleGettingStarted = () => {
    const newState = !gettingStartedOpen;
    setGettingStartedOpen(newState);
    localStorage.setItem('musicJournalistGettingStartedOpen', String(newState));
  };

  const toggleExpanded = (lessonId) => {
    setExpandedLessons(prev => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  const handleStartSession = (lesson) => {
    setSelectedLesson(lesson);
    setShowStartModal(true);
  };

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
        } catch (e) { console.warn('Analytics failed:', e); }
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

  const handleStartQuickSession = async () => {
    if (!selectedLesson) return;
    setCreatingSession(selectedLesson.id);
    try {
      const teacherId = user?.uid || 'teacher';
      const code = await createSession(teacherId, selectedLesson.id, selectedLesson.route, { classMode: 'guest' });
      if (user?.uid) {
        try {
          await logSessionCreated(user.uid, user.email, { sessionCode: code, lessonId: selectedLesson.id, lessonRoute: selectedLesson.route, isQuickSession: true });
          await logLessonVisit(user.uid, user.email, selectedLesson.id);
        } catch (e) { console.warn('Analytics failed:', e); }
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

  const handleCreateClassFromModal = () => {
    setShowStartModal(false);
    setShowCreateClassModal(true);
  };

  const handleClassCreated = (createdClass) => {
    setShowCreateClassModal(false);
    setNewlyCreatedClass(createdClass || null);
    if (selectedLesson) setShowStartModal(true);
  };

  const lessons = [
    {
      id: 'mj-lesson1',
      number: 1,
      icon: '📰',
      title: 'Read Like a Journalist',
      concept: 'Analyze Music News',
      essentialQuestion: 'What makes a music story worth telling?',
      color: 'from-blue-900 to-indigo-800',
      route: '/lessons/music-journalist/lesson1',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students read a featured music news article together, learn to annotate text by highlighting main ideas, vocabulary, and opinions, distinguish facts from opinions in journalism, and play the Fact or Opinion Sorter game.',
      studentsWill: [
        'Identify main idea and supporting details in a music news article',
        'Distinguish fact from opinion in journalism',
        'Use annotation tools to highlight and save key information'
      ],
      activities: [
        { title: 'What Is Music Journalism?', description: 'Explore three types of music writing: news, reviews, and features', time: 5 },
        { title: 'Read the Featured Article', description: 'Class reads a real music article together on the projector', time: 10 },
        { title: 'Annotation Practice', description: 'Learn to highlight facts, vocabulary, and opinions', time: 8 },
        { title: 'Fact or Opinion Sorter', description: 'Class game: Sort 10 music statements into fact or opinion', time: 10, activityType: 'fact-opinion-sorter' },
        { title: 'Reflection', description: 'What was the most interesting thing from today\'s article?', time: 5, activityType: 'mj-lesson1-reflection' }
      ]
    },
    {
      id: 'mj-lesson2',
      number: 2,
      icon: '🔍',
      title: 'Find Your Beat',
      concept: 'Choose Your Topic',
      essentialQuestion: 'What story do YOU want to tell?',
      color: 'from-indigo-800 to-blue-700',
      route: '/lessons/music-journalist/lesson2',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students browse the MMA news feed to find their research topic, evaluate topics for research readiness, learn about their partner assignment (if applicable), begin building their research board, and play Source or Not? to learn about news credibility.',
      studentsWill: [
        'Browse and evaluate multiple music news articles',
        'Select a research topic with enough available coverage',
        'Begin populating a research board with annotated highlights and saved images'
      ],
      activities: [
        { title: 'Browse the News Feed', description: 'Explore articles by genre, artist, or topic', time: 7 },
        { title: 'Choose Your Topic', description: 'Select a research-ready topic and lock it in', time: 5 },
        { title: 'Start Your Research Board', description: 'Read 2 articles and save highlights to your board', time: 15 },
        { title: 'Source or Not?', description: 'Class game: Can you spot credible vs. fake sources?', time: 8, activityType: 'source-or-not' },
        { title: 'Reflection', description: 'What is your topic and why did you choose it?', time: 5, activityType: 'mj-lesson2-reflection' }
      ]
    },
    {
      id: 'mj-lesson3',
      number: 3,
      icon: '📚',
      title: 'Deep Dive',
      concept: 'Research & Evidence',
      essentialQuestion: 'What makes evidence strong enough to support your story?',
      color: 'from-blue-700 to-cyan-700',
      route: '/lessons/music-journalist/lesson3',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students read and annotate a minimum of three articles, evaluate and save images from the MMA image library, organize their research board by tagging highlights with slide numbers, and play Headline Writer to practice writing compelling headlines.',
      studentsWill: [
        'Read and annotate a minimum of three articles on their chosen topic',
        'Evaluate and save images from the MMA image library',
        'Organize research board for presentation building'
      ],
      activities: [
        { title: 'Evidence Check', description: 'Review your research — is it specific and strong?', time: 5 },
        { title: 'Read Your Third Article', description: 'Find a new angle or detail for your topic', time: 12 },
        { title: 'Image Library', description: 'Search and save images for your presentation', time: 8 },
        { title: 'Organize Research Board', description: 'Tag each highlight with a slide number', time: 8 },
        { title: 'Headline Writer', description: 'Write the best headline — class votes on the winner!', time: 10, activityType: 'headline-writer' }
      ]
    },
    {
      id: 'mj-lesson4',
      number: 4,
      icon: '🛠️',
      title: 'Build Your Story',
      concept: 'Slide Builder',
      essentialQuestion: 'How do you turn research into a story people want to hear?',
      color: 'from-cyan-700 to-teal-600',
      route: '/lessons/music-journalist/lesson4',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students open the MMA slide builder to construct their 4-slide presentation. They drag highlights and images from their research board directly into slides. Partners see each other\'s work in real time and have assigned slide ownership.',
      studentsWill: [
        'Use the MMA slide builder to construct a 4-slide presentation',
        'Drag annotated highlights and saved images into slides',
        'Write original slide text using research as evidence'
      ],
      activities: [
        { title: 'Presentation Structure', description: 'Learn the 4-slide format: Intro, Why It Matters, Interesting, Your Take', time: 5 },
        { title: 'Slide Builder', description: 'Build your presentation — drag from research board into slides', time: 30, activityType: 'mj-slide-builder' }
      ]
    },
    {
      id: 'mj-lesson5',
      number: 5,
      icon: '🎤',
      title: 'Press Day',
      concept: 'Present & Reflect',
      essentialQuestion: 'What does it mean to share your story with the world?',
      color: 'from-teal-600 to-emerald-600',
      route: '/lessons/music-journalist/lesson5',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Presentation day! Students deliver 2-3 minute presentations from their completed slides. Speaker notes are visible only on the presenter\'s device. After each presentation, classmates submit structured peer feedback. All work auto-saves to student portfolio.',
      studentsWill: [
        'Deliver a 2-3 minute presentation from completed slides',
        'Practice public speaking with notes-view support',
        'Provide and receive structured peer feedback'
      ],
      activities: [
        { title: 'Presentation Format', description: 'Review expectations: 2-3 minutes, both partners speak', time: 3 },
        { title: 'Presentations', description: 'Present your story — slides full screen, notes on your device', time: 30, activityType: 'mj-presentation' },
        { title: 'Peer Feedback', description: 'Write specific feedback for each presenter', time: 10, activityType: 'mj-peer-feedback' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-[#1a2744] to-gray-900">
      <TeacherHeader user={user} signOut={signOut} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(isEduSite ? '/teacher-dashboard' : '/music-classroom-resources')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Units
        </button>

        {/* Unit Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📰</div>
          <h1 className="text-4xl font-black text-white mb-2">Music Journalist</h1>
          <p className="text-lg text-[#f0b429] font-semibold mb-1">Read, Research & Report on the World of Music</p>
          <p className="text-white/50 max-w-2xl mx-auto">
            Students explore current music news, develop research skills, annotate real articles,
            and produce a multimedia presentation about an artist or music topic of their choice.
          </p>
        </div>

        {/* Getting Started */}
        <div className="mb-6">
          <button
            onClick={toggleGettingStarted}
            className="w-full flex items-center justify-between bg-[#1a2744]/80 border border-[#f0b429]/20 rounded-xl px-5 py-3 text-left hover:bg-[#1a2744] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚀</span>
              <span className="text-white font-bold">Getting Started</span>
            </div>
            {gettingStartedOpen ? <ChevronUp size={18} className="text-white/50" /> : <ChevronDown size={18} className="text-white/50" />}
          </button>
          {gettingStartedOpen && (
            <div className="mt-2 bg-[#1a2744]/60 border border-white/10 rounded-xl p-5 space-y-3">
              {[
                { step: 1, text: 'Create a class (or use an existing one) in your teacher dashboard' },
                { step: 2, text: 'Click "Start Session" on any lesson below to get a join code' },
                { step: 3, text: `Students go to ${joinUrl} and enter the code` },
                { step: 4, text: 'Navigate through slides — students see activities on their devices' }
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f0b429] text-[#1a2744] flex items-center justify-center text-sm font-black flex-shrink-0">{step}</div>
                  <p className="text-white/80 text-sm pt-0.5">{text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lesson Cards */}
        <div className="space-y-3">
          {lessons.map(lesson => {
            const isExpanded = expandedLessons[lesson.id];
            return (
              <div key={lesson.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-[#f0b429]/30 transition-colors">
                {/* Lesson header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <button onClick={() => toggleExpanded(lesson.id)} className="flex items-center gap-4 flex-1 text-left">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lesson.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {lesson.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">Lesson {lesson.number}:</span>
                        <span className="text-white">{lesson.title}</span>
                      </div>
                      <p className="text-white/50 text-sm">{lesson.concept}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
                  </button>
                  <button
                    onClick={() => handleStartSession(lesson)}
                    disabled={!lesson.available || creatingSession === lesson.id}
                    className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      lesson.available
                        ? 'bg-[#f0b429] text-[#1a2744] hover:bg-[#f0b429]/90 hover:scale-105'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <Play size={14} fill="currentColor" />
                    {creatingSession === lesson.id ? 'Starting...' : 'Start Session'}
                  </button>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                    <div>
                      <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">In This Lesson</h4>
                      <p className="text-white/80 text-sm">{lesson.inThisLesson}</p>
                    </div>

                    <div>
                      <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Students Will</h4>
                      <ul className="space-y-1">
                        {lesson.studentsWill.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <Check size={14} className="text-[#f0b429] mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Essential Question</h4>
                      <p className="text-[#f0b429] text-sm italic">{lesson.essentialQuestion}</p>
                    </div>

                    {/* Activities table */}
                    <div>
                      <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Activities</h4>
                      <div className="bg-black/20 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-white/40 text-xs uppercase">
                              <th className="text-left px-3 py-2">Activity</th>
                              <th className="text-left px-3 py-2">Description</th>
                              <th className="text-right px-3 py-2">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lesson.activities.map((activity, i) => (
                              <tr key={i} className="border-t border-white/5">
                                <td className="px-3 py-2 text-white font-medium">{activity.title}</td>
                                <td className="px-3 py-2 text-white/60">{activity.description}</td>
                                <td className="px-3 py-2 text-white/50 text-right whitespace-nowrap">{activity.time} min</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Session Modal */}
      <StartSessionModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false);
          setSelectedLesson(null);
          setNewlyCreatedClass(null);
        }}
        lesson={selectedLesson}
        teacherUid={user?.uid}
        onStartForClass={handleStartForClass}
        onStartQuickSession={handleStartQuickSession}
        onCreateClass={handleCreateClassFromModal}
        preselectedClassId={newlyCreatedClass?.id}
      />

      {/* Create Class Modal */}
      <CreateClassModal
        isOpen={showCreateClassModal}
        onClose={() => setShowCreateClassModal(false)}
        teacherUid={user?.uid}
        onClassCreated={handleClassCreated}
        fromLessonStart={!!selectedLesson}
      />
    </div>
  );
};

export default MusicJournalistHub;
