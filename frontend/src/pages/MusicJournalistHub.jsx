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
      icon: '🔍',
      title: 'How Artists Blow Up',
      concept: 'Discover & Explore',
      essentialQuestion: 'What does it take to discover the next big artist?',
      color: 'from-blue-900 to-indigo-800',
      route: '/lessons/music-journalist/lesson1',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students learn what music agents and A&R reps do, explore 20 emerging artists across 10 genres on the discovery platform, play the Genre Match game, and learn the difference between facts and opinions as agent research skills.',
      studentsWill: [
        'Understand what music agents and A&R reps do in the music industry',
        'Explore and identify characteristics of different musical genres',
        'Distinguish fact from opinion when evaluating artist potential'
      ],
      activities: [
        { title: 'Welcome to the Agency', description: 'How Billie Eilish, Chance, and BTS went from zero to fame', time: 5 },
        { title: 'Explore the Platform', description: 'Browse 20 emerging artists across 10 genres — star your favorites', time: 10, activityType: 'artist-discovery' },
        { title: 'Genre Match Game', description: 'Hear a clip, identify the genre — test your ear', time: 8, activityType: 'genre-match' },
        { title: 'The Assignment', description: 'Learn the 5-lesson arc: discover, research, listen, build, pitch', time: 5 },
        { title: 'Preview', description: 'Which genre surprised you? Who caught your ear?', time: 3 }
      ]
    },
    {
      id: 'mj-lesson2',
      number: 2,
      icon: '🎯',
      title: 'Claim Your Artist',
      concept: 'Choose & Research',
      essentialQuestion: 'What makes an artist worth believing in?',
      color: 'from-indigo-800 to-blue-700',
      route: '/lessons/music-journalist/lesson2',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students choose their emerging artist from the platform, research their story using the artist profile, learn to distinguish strong evidence from weak evidence, save facts to their Research Board, and play Fact or Opinion to sharpen their skills.',
      studentsWill: [
        'Select an emerging artist and commit to representing them',
        'Identify strong vs weak evidence for building a case',
        'Save at least 5 specific facts to their Research Board'
      ],
      activities: [
        { title: 'What Makes an Artist Worth It?', description: 'The 4-point checklist: unique sound, story, growth, your gut', time: 4 },
        { title: 'Choose Your Artist', description: 'Browse the platform and lock in your pick — first come, first served', time: 12, activityType: 'artist-discovery' },
        { title: 'Strong vs Weak Evidence', description: 'Learn what would convince a label vs what falls flat', time: 4 },
        { title: 'Research Session', description: 'Dig into your artist\'s profile — save 5+ facts to Research Board', time: 12, activityType: 'artist-discovery' },
        { title: 'Fact or Opinion Game', description: 'Sort 10 statements — agents need evidence, not just vibes', time: 7, activityType: 'fact-opinion-sorter' }
      ]
    },
    {
      id: 'mj-lesson3',
      number: 3,
      icon: '🎧',
      title: 'Build Your Case',
      concept: 'Listen & Describe',
      essentialQuestion: 'How do you describe music so other people can hear it through your words?',
      color: 'from-blue-700 to-cyan-700',
      route: '/lessons/music-journalist/lesson3',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students listen critically to their artist\'s tracks using 6 music descriptors (tempo, mood, instrumentation, hook, production, influence), write a Sound Statement, form 3 evidence-backed reasons why their artist should go viral, and play Source or Not to evaluate credibility.',
      studentsWill: [
        'Analyze music using 6 specific descriptors from the Music Description Toolkit',
        'Write a Sound Statement that captures their artist\'s unique sound in one sentence',
        'Form 3 evidence-backed reasons why their artist deserves to go viral'
      ],
      activities: [
        { title: 'Hook: Same Genre, Different Sound', description: 'Two "rock" clips that sound nothing alike — describe the difference', time: 3 },
        { title: 'Music Description Toolkit', description: 'Learn 6 ways to describe music: tempo, mood, instrumentation, hook, production, influence', time: 5 },
        { title: 'Critical Listening Session', description: 'Listen to your artist\'s tracks and fill out the Listening Guide', time: 15, activityType: 'listening-guide' },
        { title: 'Source or Not?', description: 'Can you spot a credible music source vs random noise?', time: 7, activityType: 'source-or-not' },
        { title: 'Preview', description: 'Bring your Research Board, Sound Statement, and 3 reasons to Lesson 4', time: 3 }
      ]
    },
    {
      id: 'mj-lesson4',
      number: 4,
      icon: '🎨',
      title: 'Design the Campaign',
      concept: 'Press Kit Builder',
      essentialQuestion: 'How do you tell someone\'s story in a way that makes people care?',
      color: 'from-cyan-700 to-teal-600',
      route: '/lessons/music-journalist/lesson4',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Students use the Press Kit Designer to build a 5-slide visual campaign for their artist. They choose layouts, pick colors, place images, and drag text — all pre-populated from their research. Partners review each other\'s work and give feedback.',
      studentsWill: [
        'Design a 5-slide press kit with layouts, colors, images, and evidence-backed content',
        'Pull research from their Research Board and Listening Guide into the presentation',
        'Give and receive constructive peer feedback'
      ],
      activities: [
        { title: 'The 5-Slide Structure', description: 'Learn each slide: Meet, Sound, Why, Listen, Go Viral', time: 5 },
        { title: 'Build Your Press Kit', description: 'Design your campaign — layouts, colors, images, text', time: 25, activityType: 'mj-press-kit' },
        { title: 'Peer Review', description: 'Swap with a partner — strongest slide? What\'s missing?', time: 5, activityType: 'mj-peer-feedback' },
        { title: 'Presentation Prep', description: 'Polish and prepare for Launch Day', time: 5 }
      ]
    },
    {
      id: 'mj-lesson5',
      number: 5,
      icon: '🚀',
      title: 'Launch Day',
      concept: 'Pitch & Vote',
      essentialQuestion: 'Can you convince someone to care about something you believe in?',
      color: 'from-teal-600 to-emerald-600',
      route: '/lessons/music-journalist/lesson5',
      available: true,
      hasLessonPlan: false,
      inThisLesson: 'Launch Day! Students present their 2-3 minute pitches with press kits on screen and music playing. Classmates submit peer feedback after each pitch. The class votes on whose artist goes viral. Awards: Gone Viral, Best Hook, Best Sound Statement, Strongest Case, Best Campaign Design, Crowd Favorite.',
      studentsWill: [
        'Deliver a persuasive 2-3 minute pitch backed by evidence',
        'Listen critically and provide constructive peer feedback',
        'Vote on whose artist deserves to go viral based on pitch quality'
      ],
      activities: [
        { title: 'Welcome to Launch Day', description: 'Set the scene — you are agents, this room is your audience', time: 3 },
        { title: 'The Pitches', description: '2-3 min per agent — press kit on screen, music plays, make your case', time: 25, activityType: 'mj-presentation' },
        { title: 'Peer Feedback', description: 'One thing that convinced you + one thing to improve', time: 3, activityType: 'mj-peer-feedback' },
        { title: 'The Vote', description: 'Whose artist goes viral? Class votes now.', time: 3, activityType: 'artist-vote' },
        { title: 'Results & Awards', description: 'Gone Viral, Best Hook, Strongest Case, Crowd Favorite', time: 5 }
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
