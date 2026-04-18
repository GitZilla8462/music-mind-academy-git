// File: /pages/MusicJournalistHub.jsx
// Music Journalist Unit - Hub page for all lessons
// Unit 3: Read, Research, and Report on the World of Music

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../firebase/config';
import { startClassSession } from '../firebase/classes';
import { ChevronDown, ChevronUp, Check, Play, ArrowLeft, FileText, ExternalLink } from 'lucide-react';
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
      window.open(`${selectedLesson.route}?classId=${selectedClass.id}&role=teacher&classCode=${classWithSession.classCode}`, '_blank');
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

  const handleOpenLessonPlan = (lessonId) => {
    const cleanId = lessonId.replace('mj-', '');
    const route = `/lesson-plan/music-journalist-${cleanId}`;
    window.open(route, '_blank');
  };

  const lessons = [
    {
      id: 'mj-lesson1',
      number: 1,
      icon: '🔍',
      title: 'Welcome to the Agency',
      concept: 'Discover & Explore',
      essentialQuestion: 'What does it take to discover the next big artist?',
      color: 'from-blue-900 to-indigo-800',
      route: '/lessons/music-journalist/lesson1',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn what music agents and A&R reps do, explore emerging artists across genres on the discovery platform, play the Genre Match game, complete Genre Scouts — finding one artist per genre — and share discoveries with a partner.',
      studentsWill: [
        'Understand what music agents and A&R reps do in the music industry',
        'Explore and identify characteristics of different musical genres',
        'Navigate the Artist Discovery platform and preview emerging artists',
        'Find one artist that represents each genre and describe what you hear'
      ],
      activities: [
        { title: 'Welcome to the Agency', description: 'You\'ve been hired — how Billie Eilish, Chance, and BTS were discovered', time: 5 },
        { title: 'Genre Showcase', description: 'Teacher presents genres with real emerging artists and audio', time: 5 },
        { title: 'Genre Match Game', description: 'Hear a clip, identify the genre — test your ear', time: 8, activityType: 'genre-match' },
        { title: 'Genre Scouts', description: 'Explore artists, complete 3 slides: Genre Lineup, Surprise Discovery, Sound Snapshot', time: 20, activityType: 'genre-scouts' },
        { title: 'Share Out', description: 'Share your genre lineup and surprise discovery with a partner', time: 6 }
      ]
    },
    {
      id: 'mj-lesson2',
      number: 2,
      icon: '🎧',
      title: 'Listen Like an Agent',
      concept: 'Listen & Describe',
      essentialQuestion: 'How do you describe music so other people can hear it through your words?',
      color: 'from-indigo-800 to-blue-700',
      route: '/lessons/music-journalist/lesson2',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn to listen critically by analyzing 3 guided tracks as a class, then pick their own track for independent listening. They share observations with a partner and play Sign or Pass — ranking 3 mystery artists.',
      studentsWill: [
        'Listen critically and identify musical elements (tempo, mood, instrumentation)',
        'Analyze music independently using the Description Toolkit',
        'Share and defend observations with evidence from the music'
      ],
      activities: [
        { title: 'Why Listen Like an Agent?', description: 'Agents don\'t just say "I like it" — they say WHY', time: 3 },
        { title: 'Guided Listening (3 tracks)', description: 'Class listens to Ketsa, Jason Shaw, and Soft and Furious — fill out Listening Guide together', time: 14 },
        { title: 'Independent Listening', description: 'Pick 1 of 5 tracks, analyze on your own, then share with a partner', time: 15, activityType: 'independent-listening' },
        { title: 'Sign or Pass', description: 'Listen to 3 mystery artists, rank 1-3 — match your group to score!', time: 7, activityType: 'sign-or-pass' }
      ]
    },
    {
      id: 'mj-lesson3',
      number: 3,
      icon: '🎯',
      title: 'Claim Your Artist',
      concept: 'Choose & Research',
      essentialQuestion: 'What makes an artist worth believing in?',
      color: 'from-blue-700 to-cyan-700',
      route: '/lessons/music-journalist/lesson3',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn the 4-point checklist for evaluating artists (Unique Sound, Compelling Story, Signs of Growth, Gut Feeling), practice distinguishing fact from opinion, build a Scouting Report with evidence, and play Would You Sign Them?',
      studentsWill: [
        'Evaluate artists using the 4-point checklist',
        'Distinguish between strong evidence and weak evidence',
        'Classify statements as fact or opinion',
        'Build a structured Scouting Report with evidence'
      ],
      activities: [
        { title: 'The 4-Point Checklist', description: 'What agents look for: Unique Sound, Compelling Story, Signs of Growth, Gut Feeling', time: 6 },
        { title: 'Fact or Opinion', description: 'Write one fact and one opinion about your artist', time: 5, activityType: 'fact-opinion-sorter' },
        { title: 'Scouting Report', description: 'Complete 3 slides for your assigned artist with real evidence', time: 20, activityType: 'scouting-report' },
        { title: 'Share Out', description: 'Which of the four points felt strongest? Share with a partner', time: 4 },
        { title: 'Would You Sign Them?', description: 'Match evidence to the 4-point checklist', time: 7, activityType: 'would-you-sign-them' }
      ]
    },
    {
      id: 'mj-lesson4',
      number: 4,
      icon: '🎨',
      title: 'Build Your Story',
      concept: 'Press Kit Builder',
      essentialQuestion: 'How do you tell someone\'s story in a way that makes people care?',
      color: 'from-cyan-700 to-teal-600',
      route: '/lessons/music-journalist/lesson4',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Students learn what a press kit is, then build a 5-slide presentation for their artist in the Slide Builder. Partners swap and review each other\'s work, make final edits, and choose their presentation format for Launch Day.',
      studentsWill: [
        'Structure a 5-slide press kit presentation using research and listening notes',
        'Write concise, persuasive slide content with evidence from multiple sources',
        'Give and receive constructive peer feedback',
        'Prepare for a 2-3 minute presentation'
      ],
      activities: [
        { title: 'What Is a Press Kit?', description: 'How press kits get artists signed — you already have everything you need', time: 3 },
        { title: 'Build Your Story', description: 'Build 5-slide presentation in the Slide Builder', time: 25, activityType: 'mj-press-kit' },
        { title: 'Peer Review + Revise', description: 'Swap with a partner, give feedback, then make final edits', time: 9, activityType: 'mj-peer-feedback' },
        { title: 'Presentation Prep', description: 'Choose your format: Live Pitch, Voiceover, Partner Pitch, or Panel', time: 3 }
      ]
    },
    {
      id: 'mj-lesson5',
      number: 5,
      icon: '🚀',
      title: 'Launch Day',
      concept: 'Pitch & Present',
      essentialQuestion: 'Can you convince someone to care about something you believe in?',
      color: 'from-teal-600 to-emerald-600',
      route: '/lessons/music-journalist/lesson5',
      available: true,
      hasLessonPlan: true,
      inThisLesson: 'Launch Day! Students present their 2-3 minute pitches with press kits on screen and music playing. After all pitches, the class reflects on what they discovered about music throughout the unit.',
      studentsWill: [
        'Deliver a persuasive 2-3 minute presentation with evidence',
        'Listen critically to peers and provide constructive feedback',
        'Reflect on music discovery, research, and communication skills'
      ],
      activities: [
        { title: 'Welcome + Expectations', description: 'You\'re not students — you\'re agents. Presentation norms for presenters and audience', time: 5 },
        { title: 'Agent Pitches', description: '2-3 min per agent — press kit on screen, music plays, make your case', time: 25, activityType: 'launch-day' },
        { title: 'Reflection', description: 'What did you learn about music you didn\'t know before this unit?', time: 4 },
        { title: 'Celebration', description: 'You just did what real music agents do every day', time: 3 }
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
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-4xl font-black text-white mb-2">Music Agent</h1>
          <p className="text-lg text-[#f0b429] font-semibold mb-1">Discover Talent. Build the Case. Make Them Go Viral.</p>
          <p className="text-white/50 max-w-2xl mx-auto">
            Students discover emerging artists, research their stories, analyze their music,
            design a visual press kit campaign, and pitch to the class — who goes viral?
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

                    {/* Lesson Plan Link */}
                    {lesson.hasLessonPlan && userRole === 'teacher' && (
                      <div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLessonPlan(lesson.id);
                          }}
                          className="flex items-center gap-2 text-[#f0b429] hover:text-[#f0b429]/80 font-medium transition-colors text-sm"
                        >
                          <FileText size={16} />
                          View Lesson Plan
                          <ExternalLink size={14} className="text-[#f0b429]/50" />
                        </button>
                      </div>
                    )}

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
