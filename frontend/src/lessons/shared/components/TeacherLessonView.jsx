// File: /src/lessons/shared/components/TeacherLessonView.jsx
// Combined Teacher Control Sidebar + Presentation View
// Professional design: White/slate sidebar, dark presentation area
// ✅ UPDATED: Added mini live preview box below view toggle

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  Circle,
  Clock,
  Users,
  Copy,
  Monitor,
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Minimize2,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Video,
  SkipForward,
  Star,
  X,
  MessageSquare
} from 'lucide-react';
import { saveSurveyResponse, saveMidPilotSurvey, saveFinalPilotSurvey } from '../../../firebase/analytics';
import { getDatabase, ref, onValue, update } from 'firebase/database';

// ============================================
// PRESENTATION CONTENT COMPONENT
// Renders the appropriate content based on stage
// ============================================
const PresentationContent = ({
  currentStage,
  currentStageData,
  sessionCode,
  sessionData,
  lessonConfig,
  lessonBasePath,
  viewMode, // 'teacher' or 'student'
  onVideoEnded, // callback when video finishes playing
  goToNextStage, // callback to advance to next stage
  presentationZoom = 1 // zoom factor for scaling slides
}) => {
  const [LayerDetectiveLeaderboard, setLayerDetectiveLeaderboard] = useState(null);
  const [LayerDetectiveResults, setLayerDetectiveResults] = useState(null);
  const [LayerDetectiveClassDemo, setLayerDetectiveClassDemo] = useState(null);
  const [SectionalLoopBuilderLeaderboard, setSectionalLoopBuilderLeaderboard] = useState(null);
  const [SectionalLoopBuilderResults, setSectionalLoopBuilderResults] = useState(null);
  const [MoodMatchTeacherView, setMoodMatchTeacherView] = useState(null);
  const [VideoHookComparison, setVideoHookComparison] = useState(null);
  const [BeatBuilderDemo, setBeatBuilderDemo] = useState(null);
  const [NameThatGameActivity, setNameThatGameActivity] = useState(null);
  const [MelodyBuilderTeacherDemo, setMelodyBuilderTeacherDemo] = useState(null);
  const [MelodyMysteryActivity, setMelodyMysteryActivity] = useState(null);

  // Get join URL based on site (defined early for use in join-code screen)
  const isProduction = window.location.hostname !== 'localhost';
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  // Use current host for dev (handles any port), production domains for prod
  const joinUrl = !isProduction ? `${window.location.host}/join` : (isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join');

  // Load game components dynamically
  useEffect(() => {
    // Layer Detective components - NEW CLASS GAME VERSION
    import('../../shared/activities/layer-detective/LayerDetectiveClassGame')
      .then(module => setLayerDetectiveLeaderboard(() => module.default))
      .catch(() => console.log('Layer Detective class game not available'));

    import('../../shared/activities/layer-detective/LayerDetectiveResults')
      .then(module => setLayerDetectiveResults(() => module.default))
      .catch(() => console.log('Layer Detective results not available'));

    import('../../shared/activities/layer-detective/LayerDetectiveClassDemo')
      .then(module => setLayerDetectiveClassDemo(() => module.default))
      .catch(() => console.log('Layer Detective class demo not available'));

    // Sectional Loop Builder components
    import('../../shared/activities/sectional-loop-builder/SectionalLoopBuilderPresentationView')
      .then(module => setSectionalLoopBuilderLeaderboard(() => module.default))
      .catch(() => console.log('Sectional Loop Builder leaderboard not available'));

    import('../../shared/activities/sectional-loop-builder/SectionalLoopBuilderResults')
      .then(module => setSectionalLoopBuilderResults(() => module.default))
      .catch(() => console.log('Sectional Loop Builder results not available'));

    // Mood Match Teacher View
    import('../../shared/activities/mood-match-game/MoodMatchTeacherView')
      .then(module => setMoodMatchTeacherView(() => module.default))
      .catch(() => console.log('Mood Match Teacher View not available'));

    // Lesson 4: Video Hook Comparison (No Music vs With Music)
    import('../../film-music-project/lesson4/components/VideoHookComparison')
      .then(module => setVideoHookComparison(() => module.default))
      .catch(() => console.log('Video Hook Comparison not available'));

    // Lesson 4: Beat Builder Demo (Building a Beat)
    import('../../film-music-project/lesson4/components/BeatBuilderDemo')
      .then(module => setBeatBuilderDemo(() => module.default))
      .catch(() => console.log('Beat Builder Demo not available'));

    // Lesson 5: Name That Game Activity
    import('../../shared/activities/name-that-game/NameThatGameActivity')
      .then(module => setNameThatGameActivity(() => module.default))
      .catch(() => console.log('Name That Game Activity not available'));

    // Lesson 5: Melody Builder Teacher Demo
    import('../../shared/activities/melody-maker/MelodyBuilderTeacherDemo')
      .then(module => setMelodyBuilderTeacherDemo(() => module.default))
      .catch(() => console.log('Melody Builder Teacher Demo not available'));

    // Lesson 5: Melody Mystery Activity
    import('../../shared/activities/melody-mystery/MelodyMysteryActivity')
      .then(module => setMelodyMysteryActivity(() => module.default))
      .catch(() => console.log('Melody Mystery Activity not available'));
  }, []);

  // Student View Mode - Show iframe of student experience
  if (viewMode === 'student') {
    const getStudentUrl = () => {
      // Use current origin for both dev and prod to handle any port
      return `${window.location.origin}/join?code=${sessionCode}&preview=true`;
    };

    return (
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-10 bg-emerald-600 flex items-center justify-center z-10">
          <span className="text-white text-sm font-semibold flex items-center gap-2">
            <Smartphone size={16} />
            STUDENT VIEW PREVIEW
          </span>
        </div>
        <iframe
          src={getStudentUrl()}
          className="absolute top-10 left-0 w-full h-[calc(100%-40px)] border-none"
          title="Student View Preview"
        />
      </div>
    );
  }

  // Join Code Screen
  if (currentStage === 'locked' || currentStage === 'join-code') {
    const studentCount = sessionData?.studentsJoined 
      ? Object.keys(sessionData.studentsJoined).length 
      : 0;

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8">
        {/* Join Instructions */}
        <div className="text-center mb-8">
          <div className="text-slate-400 text-xl mb-2">Join at</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {joinUrl}
          </h1>
        </div>
        
        {/* Code Display */}
        <div className="bg-white rounded-2xl px-12 py-8 mb-8">
          <div className="text-8xl md:text-9xl font-bold font-mono tracking-widest text-blue-600">
            {sessionCode}
          </div>
        </div>
        
        {/* Student Count */}
        <div className="flex items-center gap-3 text-2xl text-slate-300">
          <Users size={28} />
          <span>
            {studentCount === 0 
              ? 'Waiting for students...' 
              : `${studentCount} student${studentCount !== 1 ? 's' : ''} joined`
            }
          </span>
        </div>
      </div>
    );
  }

  // Session Ended Screen
  if (currentStage === 'ended') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-8">
        <div className="text-8xl mb-6">
          <Check size={100} className="text-emerald-500" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Session Ended</h1>
        <p className="text-xl text-slate-400">
          Thank you for participating!
        </p>
      </div>
    );
  }

  // Use presentationView from lesson config
  if (currentStageData?.presentationView) {
    const { type, slidePath, videoPath, title } = currentStageData.presentationView;

    // Layer Detective Leaderboard
    if (type === 'layer-detective-leaderboard' && LayerDetectiveLeaderboard) {
      return (
        <div className="absolute inset-0">
          <LayerDetectiveLeaderboard sessionData={sessionData} onComplete={goToNextStage} />
        </div>
      );
    }

    // Layer Detective Results
    if (type === 'layer-detective-results' && LayerDetectiveResults) {
      return (
        <div className="absolute inset-0">
          <LayerDetectiveResults sessionData={sessionData} />
        </div>
      );
    }

    // Layer Detective Class Demo
    if (type === 'layer-detective-class-demo' && LayerDetectiveClassDemo) {
      return (
        <div className="absolute inset-0">
          <React.Suspense fallback={
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-pink-900">
              <div className="text-white text-2xl">Loading class demo...</div>
            </div>
          }>
            <LayerDetectiveClassDemo sessionData={sessionData} />
          </React.Suspense>
        </div>
      );
    }

    // Sectional Loop Builder Leaderboard
    if (type === 'sectional-loop-builder-leaderboard' && SectionalLoopBuilderLeaderboard) {
      return (
        <div className="absolute inset-0">
          <SectionalLoopBuilderLeaderboard sessionData={sessionData} onAdvanceLesson={goToNextStage} />
        </div>
      );
    }

    // Sectional Loop Builder Results
    if (type === 'sectional-loop-builder-results' && SectionalLoopBuilderResults) {
      return (
        <div className="absolute inset-0">
          <SectionalLoopBuilderResults sessionData={sessionData} />
        </div>
      );
    }

    // Mood Match Teacher View
    if (type === 'mood-match-teacher') {
      if (!MoodMatchTeacherView) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-white text-2xl">Loading Mood Match Game...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <MoodMatchTeacherView onAdvanceLesson={goToNextStage} />
        </div>
      );
    }

    // Video Hook Comparison (Lesson 4) - No Music vs With Music
    if (type === 'video-comparison') {
      if (!VideoHookComparison) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-white text-2xl">Loading Video Comparison...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <VideoHookComparison onAdvance={goToNextStage} />
        </div>
      );
    }

    // Beat Builder Demo (Lesson 4) - Teacher demonstrates building a beat
    if (type === 'beat-maker-demo') {
      if (!BeatBuilderDemo) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="text-white text-2xl">Loading Beat Builder Demo...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <BeatBuilderDemo onAdvance={goToNextStage} />
        </div>
      );
    }

    // Name That Game (Lesson 5) - Teacher plays game theme songs for class to guess
    if (type === 'name-that-game') {
      if (!NameThatGameActivity) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900">
            <div className="text-white text-2xl">Loading Name That Game...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <NameThatGameActivity onComplete={goToNextStage} />
        </div>
      );
    }

    // Melody Builder Demo (Lesson 5) - Teacher demonstrates building a melody
    if (type === 'melody-builder-demo') {
      if (!MelodyBuilderTeacherDemo) {
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            <div className="text-white text-2xl">Loading Melody Builder Demo...</div>
          </div>
        );
      }

      return (
        <div className="absolute inset-0">
          <MelodyBuilderTeacherDemo onComplete={goToNextStage} />
        </div>
      );
    }

    // Activity type - renders the actual activity in teacher view
    if (type === 'activity') {
      const { activityType } = currentStageData.presentationView;

      // Melody Mystery Activity
      if (activityType === 'melody-mystery') {
        if (!MelodyMysteryActivity) {
          return (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
              <div className="text-white text-2xl">Loading Melody Mystery...</div>
            </div>
          );
        }

        return (
          <div className="absolute inset-0">
            <MelodyMysteryActivity onComplete={goToNextStage} />
          </div>
        );
      }
    }

    // Summary Slide - shows title with bullet points or sections
    if (type === 'summary') {
      const { title, subtitle, bullets, sections } = currentStageData.presentationView;

      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 p-12">
          {/* Title */}
          <h1 className="text-7xl font-bold text-white mb-4 text-center">
            {title}
          </h1>

          {/* Subtitle (if provided) */}
          {subtitle && (
            <p className="text-3xl text-purple-300 mb-10 text-center">
              {subtitle}
            </p>
          )}

          {/* Spacer if no subtitle */}
          {!subtitle && <div className="mb-8" />}

          {/* Simple bullets (if provided) */}
          {bullets && bullets.length > 0 && (
            <div className="max-w-4xl">
              <ul className="space-y-6">
                {bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="text-purple-400 text-4xl mt-1">•</span>
                    <span className="text-3xl text-slate-200 leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections with headings (if provided) */}
          {sections && sections.length > 0 && (
            <div className="max-w-5xl w-full">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-8">
                  <h2 className="text-4xl font-bold text-purple-400 mb-6">
                    {section.heading}
                  </h2>
                  <ul className="space-y-4 pl-4">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-3">
                        <span className="text-purple-400 text-2xl mt-0.5">•</span>
                        <span className="text-2xl text-slate-200 leading-snug">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Image Slide - shows image with text overlay for DAW intro slides
    if (type === 'image-slide') {
      const { imagePath } = currentStageData.presentationView;

      // Get content based on stage ID
      const slideContent = {
        'what-is-daw': {
          title: 'What is a DAW?',
          subtitle: 'Digital Audio Workstation',
          points: [
            'DAW = Digital Audio Workstation — software that lets you record, edit, and create music on a computer.',
            'Before DAWs, musicians needed million-dollar recording studios with giant mixing boards, tape machines, and rooms full of equipment.',
            'In the 1990s, software like Pro Tools made it possible to do all of that on a regular computer.'
          ]
        },
        'daws-today': {
          title: 'DAWs Today',
          points: [
            'Apps like GarageBand, FL Studio, Ableton, and Logic Pro are used by professional artists to make hit songs.',
            "Billie Eilish's brother Finneas produced her Grammy-winning album in his bedroom using Logic Pro.",
            'Next we will watch a 2 minute video that introduces the DAW we will use today.'
          ]
        }
      };

      const content = slideContent[currentStage] || { title: currentStage, points: [] };

      // Apply zoom to scale 1920x1080 design to fit container
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div
            style={{
              width: 1920,
              height: 1080,
              zoom: presentationZoom,
            }}
            className="flex flex-col"
          >
            {/* Title - spans full width at top */}
            <div className="text-center pt-8 pb-4">
              <h1 className="text-6xl font-bold text-white mb-2">{content.title}</h1>
              {content.subtitle && (
                <h2 className="text-3xl text-purple-400">{content.subtitle}</h2>
              )}
            </div>

            {/* Content area - image and bullets side by side */}
            <div className="flex-1 flex">
              {/* Left side - Image */}
              <div className="w-1/2 flex items-center justify-center p-6">
                <img
                  src={imagePath}
                  alt={content.title}
                  className="object-contain rounded-lg shadow-2xl"
                  style={{ maxWidth: '85%', maxHeight: '85%' }}
                  onError={(e) => {
                    console.error('Failed to load image:', imagePath);
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Right side - Bullet points */}
              <div className="w-1/2 flex flex-col justify-center p-6 pr-12">
                <ul className="space-y-8">
                  {content.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <span className="text-purple-500 text-5xl mt-1">•</span>
                      <span className="text-4xl text-slate-200 leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Slide
    if (type === 'slide' && slidePath) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <img
            src={slidePath}
            alt={currentStage}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            onError={(e) => {
              console.error('Failed to load slide:', slidePath);
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // Activity Slide - shows slide WITH "Student Activity Time" banner on top
    if (type === 'activity-slide' && slidePath) {
      return (
        <div className="absolute inset-0 flex flex-col bg-black">
          {/* Student Activity Time Banner */}
          <div
            className="w-full flex items-center justify-center flex-shrink-0"
            style={{
              height: '64px',
              backgroundColor: '#0d9488'
            }}
          >
            <span className="text-white font-bold" style={{ fontSize: '28px' }}>
              STUDENT ACTIVITY TIME
            </span>
          </div>
          {/* Slide content */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={slidePath}
              alt={currentStage}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onError={(e) => {
                console.error('Failed to load slide:', slidePath);
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      );
    }

    // Video
    if (type === 'video' && videoPath) {
      return (
        <div className="absolute inset-0 bg-black">
          <video
            key={currentStage}
            controls
            autoPlay
            className="absolute inset-0 w-full h-full object-contain"
            onEnded={onVideoEnded}
          >
            <source src={videoPath} type="video/mp4" />
          </video>
        </div>
      );
    }
  }

  // Fallback for unknown stages
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-600">
      <Monitor size={64} className="mb-4 text-slate-400" />
      <div className="text-xl font-medium">Stage: {currentStage}</div>
      <div className="text-sm text-slate-400 mt-2">
        {currentStageData?.label || 'Loading...'}
      </div>
    </div>
  );
};

// ============================================
// MINI PREVIEW COMPONENT
// Shows scaled-down live preview of opposite view
// ============================================
const MiniPreview = ({ viewMode, sessionCode, currentStage, currentStageData, sessionData, config, onSwitch }) => {
  const getStudentUrl = () => {
    // Use current origin to handle any port in dev
    return `${window.location.origin}/join?code=${sessionCode}&preview=true`;
  };

  return (
    <div>
      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
        {viewMode === 'teacher' ? (
          <>
            <Smartphone size={12} />
            <span>Student screen:</span>
          </>
        ) : (
          <>
            <Monitor size={12} />
            <span>Teacher screen:</span>
          </>
        )}
      </div>
      <div 
        className="relative rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-900 cursor-pointer hover:border-blue-400 transition-colors"
        style={{ height: '120px' }}
        onClick={onSwitch}
        title={`Click to switch to ${viewMode === 'teacher' ? 'Student' : 'Teacher'} View`}
      >
        {viewMode === 'teacher' ? (
          // Show mini student view via iframe
          <iframe
            src={getStudentUrl()}
            className="w-full h-full border-none pointer-events-none"
            style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: '666%', height: '666%' }}
            title="Student View Preview"
          />
        ) : (
          // Show mini teacher view (presentation content)
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            <div style={{ transform: 'scale(0.1)', transformOrigin: 'top left', width: '1000%', height: '1000%' }}>
              <PresentationContent
                currentStage={currentStage}
                currentStageData={currentStageData}
                sessionCode={sessionCode}
                sessionData={sessionData}
                lessonConfig={config}
                lessonBasePath={config?.lessonPath}
                viewMode="teacher"
                goToNextStage={() => {}}
              />
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
          <span className="text-white text-xs font-medium">Click to switch</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// POST-SESSION SURVEY MODAL
// Only shown when 5+ students joined (real classroom use)
// Quick rating + any issues - takes 10 seconds
// ============================================
const PostSessionSurvey = ({
  onSubmit,
  onSkip,
  studentCount,
  lessonId,
  sessionCode
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveSurveyResponse({
        sessionCode,
        lessonId,
        studentCount,
        usedWithStudents: true, // We know it's classroom use (5+ students)
        rating,
        feedback: feedback.trim(),
        submittedAt: Date.now()
      });
    } catch (err) {
      console.error('Failed to save survey:', err);
    }
    setSubmitting(false);
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} />
            How did it go?
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Quick feedback (10 seconds)
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <p className="font-medium text-gray-800 mb-3 text-center">
              Rate this lesson
            </p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-500 mt-2 h-5">
              {rating === 1 && 'Needs work'}
              {rating === 2 && 'It was okay'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Great!'}
              {rating === 5 && 'Amazing!'}
            </div>
          </div>

          {/* Quick Feedback */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Any issues or suggestions? <span className="text-gray-400 font-normal">(optional)</span>
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What worked? What didn't? Any bugs?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              rating === 0 || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {submitting ? 'Saving...' : 'Submit & End'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MID-PILOT SURVEY (After Lesson 3)
// ============================================
const MidPilotSurvey = ({
  onSubmit,
  onSkip,
  studentCount,
  sessionCode
}) => {
  const [favoriteFeature, setFavoriteFeature] = useState('');
  const [favoriteOther, setFavoriteOther] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [skippedParts, setSkippedParts] = useState('');
  const [studentQuotes, setStudentQuotes] = useState('');
  const [onTrack, setOnTrack] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const featureOptions = [
    { id: 'daw', label: 'The DAW (composition tool)' },
    { id: 'layer-detective', label: 'Layer Detective game' },
    { id: 'video-scoring', label: 'Video scoring activities' },
    { id: 'loop-library', label: 'Loop library' },
    { id: 'other', label: 'Other' }
  ];

  const trackOptions = [
    { id: 'yes', label: 'Yes' },
    { id: 'probably', label: 'Probably' },
    { id: 'not-sure', label: 'Not sure' },
    { id: 'no', label: 'No' }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveMidPilotSurvey({
        sessionCode,
        studentCount,
        favoriteFeature: favoriteFeature === 'other' ? `Other: ${favoriteOther}` : favoriteFeature,
        improvementSuggestion: improvementSuggestion.trim(),
        skippedParts: skippedParts.trim(),
        studentQuotes: studentQuotes.trim(),
        onTrack,
        submittedAt: Date.now()
      });
    } catch (err) {
      console.error('Failed to save mid-pilot survey:', err);
    }
    setSubmitting(false);
    onSubmit();
  };

  const canSubmit = favoriteFeature && improvementSuggestion.trim() && onTrack;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} />
            Mid-Pilot Check-In
          </h2>
          <p className="text-purple-100 text-sm mt-1">
            You're halfway through! Help us make this better.
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Q1: Favorite Feature */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Which feature do students enjoy most? <span className="text-red-500">*</span>
            </p>
            <div className="space-y-2">
              {featureOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFavoriteFeature(option.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border-2 transition-all ${
                    favoriteFeature === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              {favoriteFeature === 'other' && (
                <input
                  type="text"
                  value={favoriteOther}
                  onChange={(e) => setFavoriteOther(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 mt-2"
                />
              )}
            </div>
          </div>

          {/* Q2: Improvement (required) */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              What's ONE thing that would make this significantly better? <span className="text-red-500">*</span>
            </p>
            <textarea
              value={improvementSuggestion}
              onChange={(e) => setImprovementSuggestion(e.target.value)}
              placeholder="Your most important suggestion..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-20"
            />
          </div>

          {/* Q3: Skipped Parts (optional) */}
          <div>
            <p className="font-medium text-gray-800 mb-2">
              Have you had to skip or modify any parts? If so, why?
            </p>
            <textarea
              value={skippedParts}
              onChange={(e) => setSkippedParts(e.target.value)}
              placeholder="Optional - helps us understand pacing issues"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
          </div>

          {/* Q4: Student Quotes (optional) */}
          <div>
            <p className="font-medium text-gray-800 mb-1">
              Any student quotes or reactions worth sharing?
            </p>
            <p className="text-sm text-gray-500 mb-2">These help us understand what's working!</p>
            <textarea
              value={studentQuotes}
              onChange={(e) => setStudentQuotes(e.target.value)}
              placeholder="e.g., 'This is actually fun!' or 'Can we do this again?'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
          </div>

          {/* Q5: On Track */}
          <div>
            <p className="font-medium text-gray-800 mb-3">
              Are you on track to finish all 5 lessons by end of January? <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {trackOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setOnTrack(option.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    onTrack === option.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              !canSubmit || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {submitting ? 'Saving...' : 'Submit & End'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// FINAL PMF SURVEY (After Lesson 5)
// ============================================
const FinalPilotSurvey = ({
  onSubmit,
  onSkip,
  studentCount,
  sessionCode
}) => {
  const [disappointment, setDisappointment] = useState('');
  const [targetTeacher, setTargetTeacher] = useState('');
  const [primaryBenefit, setPrimaryBenefit] = useState('');
  const [previousTool, setPreviousTool] = useState('');
  const [previousOther, setPreviousOther] = useState('');
  const [comparison, setComparison] = useState('');
  const [wouldBuy, setWouldBuy] = useState('');
  const [npsScore, setNpsScore] = useState(0);
  const [testimonialConsent, setTestimonialConsent] = useState('');
  const [finalFeedback, setFinalFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const disappointmentOptions = [
    { id: 'very', label: 'Very disappointed', color: 'green' },
    { id: 'somewhat', label: 'Somewhat disappointed', color: 'yellow' },
    { id: 'not', label: 'Not disappointed', color: 'red' }
  ];

  const previousToolOptions = [
    { id: 'nothing', label: 'Nothing' },
    { id: 'chrome-music-lab', label: 'Chrome Music Lab' },
    { id: 'bandlab', label: 'BandLab' },
    { id: 'soundtrap', label: 'Soundtrap' },
    { id: 'garageband', label: 'GarageBand' },
    { id: 'noteflight', label: 'Noteflight' },
    { id: 'other', label: 'Other' }
  ];

  const comparisonOptions = [
    { id: 'much-worse', label: 'Much worse' },
    { id: 'somewhat-worse', label: 'Somewhat worse' },
    { id: 'same', label: 'About the same' },
    { id: 'somewhat-better', label: 'Somewhat better' },
    { id: 'much-better', label: 'Much better' }
  ];

  const buyOptions = [
    { id: 'definitely-yes', label: 'Definitely yes' },
    { id: 'probably-yes', label: 'Probably yes' },
    { id: 'not-sure', label: 'Not sure' },
    { id: 'probably-not', label: 'Probably not' },
    { id: 'definitely-not', label: 'Definitely not' }
  ];

  const testimonialOptions = [
    { id: 'yes-named', label: 'Yes, with my name and school' },
    { id: 'yes-anonymous', label: 'Yes, but keep it anonymous' },
    { id: 'no', label: 'No' }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveFinalPilotSurvey({
        sessionCode,
        studentCount,
        disappointment,
        targetTeacher: targetTeacher.trim(),
        primaryBenefit: primaryBenefit.trim(),
        previousTool: previousTool === 'other' ? `Other: ${previousOther}` : previousTool,
        comparison,
        wouldBuy,
        npsScore,
        testimonialConsent,
        finalFeedback: finalFeedback.trim(),
        submittedAt: Date.now()
      });
    } catch (err) {
      console.error('Failed to save final pilot survey:', err);
    }
    setSubmitting(false);
    onSubmit();
  };

  const canSubmitPage1 = disappointment && targetTeacher.trim() && primaryBenefit.trim();
  const canSubmitPage2 = previousTool && comparison && wouldBuy && npsScore > 0 && testimonialConsent;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Star size={24} />
            Final Feedback Survey
          </h2>
          <p className="text-amber-100 text-sm mt-1">
            You completed the pilot! Your feedback shapes our future.
          </p>
          <div className="flex gap-1 mt-2">
            <div className={`h-1 flex-1 rounded ${page >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1 flex-1 rounded ${page >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {page === 1 && (
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Q1: PMF Question (Most Important!) */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-3">
                How would you feel if you could no longer use Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {disappointmentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setDisappointment(option.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      disappointment === option.id
                        ? option.id === 'very'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : option.id === 'somewhat'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Target Teacher */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                What type of teacher would benefit MOST from Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <textarea
                value={targetTeacher}
                onChange={(e) => setTargetTeacher(e.target.value)}
                placeholder="e.g., Middle school general music teachers with limited tech experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
              />
            </div>

            {/* Q3: Primary Benefit */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                What is the PRIMARY benefit you got from Music Mind Academy? <span className="text-red-500">*</span>
              </p>
              <textarea
                value={primaryBenefit}
                onChange={(e) => setPrimaryBenefit(e.target.value)}
                placeholder="e.g., Students can create music without instrument skills..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-20"
              />
            </div>
          </div>
        )}

        {page === 2 && (
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Q4: Previous Tool */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Before this pilot, what were you using for digital composition? <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {previousToolOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPreviousTool(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      previousTool === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {previousTool === 'other' && (
                <input
                  type="text"
                  value={previousOther}
                  onChange={(e) => setPreviousOther(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 mt-2"
                />
              )}
            </div>

            {/* Q5: Comparison */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Compared to what you used before, Music Mind Academy is: <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {comparisonOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setComparison(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      comparison === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q6: Would Buy */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                If Music Mind Academy cost $49/year, would you buy it? <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {buyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setWouldBuy(option.id)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      wouldBuy === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q7: NPS */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Would you recommend Music Mind Academy to a colleague? <span className="text-red-500">*</span>
              </p>
              <div className="flex justify-between gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNpsScore(num)}
                    className={`w-9 h-9 rounded-lg border-2 text-sm font-medium transition-all ${
                      npsScore === num
                        ? num <= 6
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : num <= 8
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            {/* Q8: Testimonial */}
            <div>
              <p className="font-medium text-gray-800 mb-3">
                Can we use your feedback as a testimonial? <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {testimonialOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTestimonialConsent(option.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm transition-all ${
                      testimonialConsent === option.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q9: Final Feedback */}
            <div>
              <p className="font-medium text-gray-800 mb-2">
                Any final feedback or suggestions?
              </p>
              <textarea
                value={finalFeedback}
                onChange={(e) => setFinalFeedback(e.target.value)}
                placeholder="Optional - anything else you'd like to share"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none h-16"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {page === 1 ? (
            <>
              <button
                onClick={onSkip}
                className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setPage(2)}
                disabled={!canSubmitPage1}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                  !canSubmitPage1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPage(1)}
                className="flex-1 py-2.5 px-4 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmitPage2 || submitting}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                  !canSubmitPage2 || submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {submitting ? 'Saving...' : 'Submit & End'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const TeacherLessonView = ({
  config,
  sessionCode,
  lessonStages,
  getCurrentStage,
  setCurrentStage,
  getStudents,
  getProgressStats,
  endSession,
  activityTimers,
  formatTime,
  adjustPresetTime,
  startActivityTimer,
  pauseActivityTimer,
  resumeActivityTimer,
  resetActivityTimer
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [viewMode, setViewMode] = useState('teacher'); // 'teacher' or 'student'
  const [copied, setCopied] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [timerVisible, setTimerVisible] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingStageId, setPendingStageId] = useState(null); // Track stage to navigate to after save
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [classroomTimer, setClassroomTimer] = useState({
    presetMinutes: 5,
    timeRemaining: 5 * 60, // in seconds
    isRunning: false,
    isPaused: false
  });

  // Resizable panel state
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(180);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // Presentation scaling - design at 1920x1080, scale to fit any screen
  const presentationRef = useRef(null);
  const [presentationZoom, setPresentationZoom] = useState(1);
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080;

  useEffect(() => {
    const container = presentationRef.current;
    if (!container) return;

    const calculateZoom = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Scale to fit design size in container, cap at 1 (no upscaling)
      const zoom = Math.min(
        containerWidth / DESIGN_WIDTH,
        containerHeight / DESIGN_HEIGHT,
        1
      );

      setPresentationZoom(zoom);
    };

    calculateZoom();

    const resizeObserver = new ResizeObserver(calculateZoom);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Handle sidebar horizontal resize
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const newWidth = Math.max(200, Math.min(360, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar]);

  // Handle bottom panel vertical resize
  useEffect(() => {
    if (!isResizingBottom) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      // Calculate delta from start position (dragging UP = positive delta = smaller bottom panel)
      const deltaY = e.clientY - resizeStartY.current;
      const newHeight = resizeStartHeight.current - deltaY;
      setBottomPanelHeight(Math.max(150, Math.min(500, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizingBottom(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingBottom]);

  const startBottomResize = (e) => {
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = bottomPanelHeight;
    setIsResizingBottom(true);
  };

  // Survey state - shown when 5+ students (real classroom use)
  // surveyType: 'quick' | 'midPilot' | 'finalPilot' | null
  const [surveyType, setSurveyType] = useState(null);
  const MIN_STUDENTS_FOR_SURVEY = 5;

  const currentStage = getCurrentStage();
  const students = getStudents();
  const studentCount = students?.length || 0;

  // Determine which lesson this is from config
  const getLessonNumber = () => {
    const lessonId = config.lessonId || '';
    if (lessonId.includes('lesson1') || lessonId.includes('lesson-1')) return 1;
    if (lessonId.includes('lesson2') || lessonId.includes('lesson-2')) return 2;
    if (lessonId.includes('lesson3') || lessonId.includes('lesson-3')) return 3;
    if (lessonId.includes('lesson4') || lessonId.includes('lesson-4')) return 4;
    if (lessonId.includes('lesson5') || lessonId.includes('lesson-5')) return 5;
    // Also check the route/path
    const path = window.location.pathname;
    if (path.includes('lesson1')) return 1;
    if (path.includes('lesson2')) return 2;
    if (path.includes('lesson3')) return 3;
    if (path.includes('lesson4')) return 4;
    if (path.includes('lesson5')) return 5;
    return 0;
  };

  // Handle end session with appropriate survey based on lesson
  const handleEndSession = () => {
    if (studentCount >= MIN_STUDENTS_FOR_SURVEY) {
      const lessonNum = getLessonNumber();

      if (lessonNum === 3) {
        // Mid-pilot survey after Lesson 3
        setSurveyType('midPilot');
      } else if (lessonNum === 5) {
        // Final PMF survey after Lesson 5
        setSurveyType('finalPilot');
      } else {
        // Quick survey for other lessons
        setSurveyType('quick');
      }
    } else {
      // Skip survey for testing (< 5 students)
      endSession();
    }
  };

  const handleSurveyComplete = () => {
    setSurveyType(null);
    endSession();
  };

  const handleSurveySkip = () => {
    setSurveyType(null);
    endSession();
  };

  // Check if we're on join-code (not started yet)
  const isOnJoinCode = currentStage === 'locked' || currentStage === 'join-code' || !currentStage;
  
  // Filter to content stages only (exclude join-code, locked)
  const contentStages = useMemo(() => {
    return lessonStages?.filter(s => s.id !== 'join-code' && s.id !== 'locked') || [];
  }, [lessonStages]);
  
  // Get current index within CONTENT stages (not full array)
  const currentContentIndex = contentStages.findIndex(s => s.id === currentStage);
  const isFirstStage = currentContentIndex <= 0;
  const isLastStage = currentContentIndex >= contentStages.length - 1;

  // Get current stage data
  const currentStageData = useMemo(() => {
    return lessonStages?.find(stage => stage.id === currentStage);
  }, [currentStage, lessonStages]);

  // Subscribe to session data for presentation content
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      // Use queueMicrotask to prevent setState during render
      queueMicrotask(() => {
        setSessionData(snapshot.val());
      });
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Auto-expand active section
  useEffect(() => {
    if (!config.lessonSections) return;
    const activeSection = config.lessonSections.find(section =>
      section.stages.some(stage => stage.id === currentStage)
    );
    if (activeSection) {
      setExpandedSections(new Set([activeSection.id]));
    }
  }, [currentStage, config.lessonSections]);

  // Auto-show/hide timer based on stage type
  // Timer is shown for activities with hasTimer: true, hidden otherwise
  useEffect(() => {
    if (!currentStageData) return;

    // Check if this is an activity with a timer configured
    const isTimedActivity =
      currentStageData.type === 'activity' &&
      currentStageData.hasTimer;

    if (isTimedActivity && currentStageData.duration) {
      // Show timer and set it to the activity's duration
      setTimerVisible(true);
      setClassroomTimer(prev => ({
        ...prev,
        presetMinutes: currentStageData.duration,
        timeRemaining: currentStageData.duration * 60,
        isRunning: false,
        isPaused: false
      }));
    } else {
      // Auto-minimize timer when navigating to non-timed stages
      setTimerVisible(false);
    }
  }, [currentStageData]);

  // Keyboard navigation - uses goToNextStage to trigger save modal for composition activities
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lessonStages || lessonStages.length === 0) return;
      // Don't navigate if save modal is showing
      if (showSaveModal) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextStage(); // Uses goToNextStage to trigger save modal if needed
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevStage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStage, lessonStages, showSaveModal]);

  // Copy join code
  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle section
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Get stage status
  const getStageStatus = (stageId) => {
    const currIdx = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const stageIdx = lessonStages?.findIndex(s => s.id === stageId) ?? -1;
    if (stageId === currentStage) return 'active';
    if (stageIdx < currIdx) return 'completed';
    return 'upcoming';
  };

  // Get section status
  const getSectionStatus = (section) => {
    const stageIds = section.stages.map(s => s.id);
    const currIdx = lessonStages?.findIndex(s => s.id === currentStage) ?? -1;
    const sectionStageIndices = stageIds.map(id => lessonStages?.findIndex(s => s.id === id) ?? -1);
    if (sectionStageIndices.includes(currIdx)) return 'active';
    if (sectionStageIndices.every(i => i < currIdx)) return 'completed';
    return 'upcoming';
  };

  // Classroom Timer Functions
  const formatClassroomTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustClassroomTime = (delta) => {
    setClassroomTimer(prev => {
      const newMinutes = Math.max(1, Math.min(60, prev.presetMinutes + delta));
      return {
        ...prev,
        presetMinutes: newMinutes,
        timeRemaining: newMinutes * 60
      };
    });
  };

  const startClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      timeRemaining: prev.isPaused ? prev.timeRemaining : prev.presetMinutes * 60
    }));
  };

  const pauseClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true
    }));
  };

  const resetClassroomTimer = () => {
    setClassroomTimer(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: prev.presetMinutes * 60
    }));
  };

  // Timer countdown effect
  useEffect(() => {
    if (!classroomTimer.isRunning) return;

    const interval = setInterval(() => {
      setClassroomTimer(prev => {
        if (prev.timeRemaining <= 1) {
          return {
            ...prev,
            isRunning: false,
            isPaused: false,
            timeRemaining: 0
          };
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [classroomTimer.isRunning]);

  // Check if current stage is a saveable activity (composition or listening map)
  const isSaveableActivity = currentStageData?.type === 'activity' &&
    (currentStageData?.id?.includes('composition') || currentStageData?.id === 'listening-map');

  // Send save command to all students via Firebase
  const sendSaveCommand = async () => {
    if (!sessionCode) return;

    try {
      const db = getDatabase();
      const sessionRef = ref(db, `sessions/${sessionCode}`);
      await update(sessionRef, {
        saveCommand: Date.now()
      });
      console.log('💾 Save command sent to all students');
    } catch (error) {
      console.error('Error sending save command:', error);
    }
  };

  // Navigate to next stage (within content stages only)
  const goToNextStage = () => {
    // If leaving a saveable activity, show save modal instead
    if (isSaveableActivity) {
      const nextStageId = currentContentIndex < contentStages.length - 1
        ? contentStages[currentContentIndex + 1].id
        : null;
      if (nextStageId) {
        setPendingStageId(nextStageId);
        setShowSaveModal(true);
      }
      return;
    }

    if (currentContentIndex < contentStages.length - 1) {
      setCurrentStage(contentStages[currentContentIndex + 1].id);
    }
  };

  // Handle clicking on a stage in the sidebar
  const handleStageClick = (stageId) => {
    // If leaving a saveable activity, show save modal first
    if (isSaveableActivity && stageId !== currentStage) {
      setPendingStageId(stageId);
      setShowSaveModal(true);
      return;
    }
    setCurrentStage(stageId);
  };

  // Confirm leaving saveable activity - save all and advance
  const confirmLeaveComposition = async () => {
    setIsSavingAll(true);
    await sendSaveCommand();

    // Wait for save command to propagate to all students (2 seconds)
    // This gives time for Firebase to sync and students to save
    setTimeout(() => {
      setIsSavingAll(false);
      setShowSaveModal(false);
      if (pendingStageId) {
        setCurrentStage(pendingStageId);
        setPendingStageId(null);
      }
    }, 2000);
  };

  // Navigate to previous stage (within content stages only)
  const goToPrevStage = () => {
    if (currentContentIndex > 0) {
      setCurrentStage(contentStages[currentContentIndex - 1].id);
    }
  };

  // Start the lesson - navigate to first content stage
  const handleStartLesson = () => {
    if (contentStages.length > 0) {
      const firstStageId = contentStages[0].id;
      console.log('🎬 Starting lesson, navigating to first content stage:', firstStageId);
      setCurrentStage(firstStageId);
      
      if (config.lessonSections && config.lessonSections.length > 0) {
        setExpandedSections(new Set([config.lessonSections[0].id]));
      }
    } else {
      console.error('❌ Cannot start lesson - no content stages available');
    }
  };

  const getJoinUrl = () => {
    const isProduction = window.location.hostname !== 'localhost';
    const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
    // Use current host for dev (handles any port)
    if (!isProduction) return `${window.location.host}/join`;
    return isEduSite ? 'musicroomtools.org/join' : 'musicmindacademy.com/join';
  };

  return (
    <>
      <style>{`
        @media (max-width: 1400px) {
          .teacher-lesson-wrapper {
            height: 100vh;
            overflow: hidden;
          }
          .teacher-lesson-container {
            transform: scale(0.67);
            transform-origin: top left;
            width: 149.25%;
            height: 149.25%;
          }
        }
      `}</style>
      <div className="teacher-lesson-wrapper">
        <div className="teacher-lesson-container h-screen flex bg-slate-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          id="teacher-sidebar"
          className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full overflow-hidden ${
            sidebarCollapsed ? 'w-14' : ''
          } ${!isResizingSidebar && !isResizingBottom ? 'transition-all duration-300' : ''}`}
          style={sidebarCollapsed ? {} : { width: `${sidebarWidth}px` }}
        >
          {/* Join Info - Top of Sidebar */}
          <div className={`border-b border-slate-200 flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                  title="Expand sidebar"
                >
                  <PanelLeft size={18} />
                </button>
                <div className="text-xs font-bold text-blue-600 writing-mode-vertical">
                  {sessionCode}
                </div>
                <div className="flex items-center justify-center text-slate-500">
                  <Users size={14} />
                  <span className="text-xs ml-1">{studentCount}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="text-slate-500 text-sm mb-1">{getJoinUrl()}</div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-3xl font-bold font-mono tracking-wider text-blue-600">
                    {sessionCode}
                  </span>
                  <button
                    onClick={copyJoinCode}
                    className={`p-1.5 rounded-lg transition-colors ${
                      copied 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'hover:bg-slate-100 text-slate-400'
                    }`}
                    title={copied ? 'Copied!' : 'Copy code'}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Users size={16} />
                  <span>{studentCount} student{studentCount !== 1 ? 's' : ''} joined</span>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons - AT TOP */}
          {!sidebarCollapsed && (
            <div className="p-3 border-b border-slate-200 flex-shrink-0">
              {isOnJoinCode ? (
                <div>
                  <button
                    onClick={handleStartLesson}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    <Play size={18} />
                    Start Lesson
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPrevStage}
                      disabled={isFirstStage}
                      className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                        isFirstStage
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Previous stage"
                    >
                      <ChevronLeft size={18} />
                      Back
                    </button>
                    
                    <button
                      onClick={goToNextStage}
                      disabled={isLastStage}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${
                        isLastStage
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-400 text-center">
                    or use ← → arrow keys
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsed Navigation */}
          {sidebarCollapsed && (
            <div className="p-2 border-b border-slate-200 flex flex-col gap-1">
              {/* View mode icons */}
              <button
                onClick={() => setViewMode('teacher')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'teacher' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Teacher View"
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setViewMode('student')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'student' 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
                title="Student View"
              >
                <Smartphone size={18} />
              </button>
              
              {/* Divider */}
              <div className="border-t border-slate-200 my-1"></div>
              
              {/* Navigation */}
              {isOnJoinCode ? (
                <button
                  onClick={handleStartLesson}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  title="Start Lesson"
                >
                  <Play size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={goToPrevStage}
                    disabled={isFirstStage}
                    className={`p-2 rounded-lg transition-colors ${
                      isFirstStage
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'hover:bg-slate-100 text-slate-500'
                    }`}
                    title="Back"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={goToNextStage}
                    disabled={isLastStage}
                    className={`p-2 rounded-lg transition-colors ${
                      isLastStage
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {sidebarCollapsed ? (
              // Collapsed: Show section numbers only
              <div className="p-2 space-y-1">
                {config.lessonSections?.map((section, idx) => {
                  const status = getSectionStatus(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setSidebarCollapsed(false);
                        setExpandedSections(new Set([section.id]));
                      }}
                      className={`w-full p-2 rounded-lg text-center font-bold transition-colors ${
                        status === 'active'
                          ? 'bg-blue-100 text-blue-600'
                          : status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'hover:bg-slate-100 text-slate-400'
                      }`}
                      title={section.title}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Expanded: Full navigation
              <div className="p-2">
                {config.lessonSections?.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const status = getSectionStatus(section);

                  return (
                    <div key={section.id} className="mb-1">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          status === 'active'
                            ? 'bg-blue-50 text-blue-700'
                            : status === 'completed'
                            ? 'text-emerald-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        <span className="font-semibold text-sm flex-1">
                          {section.title}
                        </span>
                        {status === 'completed' && (
                          <Check size={14} className="text-emerald-500" />
                        )}
                      </button>

                      {/* Section Stages */}
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-0.5 overflow-x-auto">
                          {section.stages.map((stage) => {
                            const stageStatus = getStageStatus(stage.id);
                            const isActive = stage.id === currentStage;

                            return (
                              <div
                                key={stage.id}
                                onClick={() => handleStageClick(stage.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors min-w-max ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-700'
                                    : stageStatus === 'completed'
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {/* Status indicator */}
                                <div className="flex-shrink-0">
                                  {stageStatus === 'completed' ? (
                                    <Check size={14} className="text-emerald-500" />
                                  ) : isActive ? (
                                    <Circle size={14} className="fill-blue-500 text-blue-500" />
                                  ) : (
                                    <Circle size={14} className="text-slate-300" />
                                  )}
                                </div>

                                {/* Stage label */}
                                <span className="flex-1 text-xs truncate" title={stage.label}>
                                  {stage.label}
                                </span>

                                {/* Duration indicator */}
                                {stage.duration && (
                                  <span className="text-xs text-slate-400">
                                    {stage.duration}m
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vertical Resize Divider */}
          {!sidebarCollapsed && (
            <div
              className="h-1 bg-slate-200 hover:bg-blue-400 cursor-row-resize transition-colors flex-shrink-0"
              onMouseDown={startBottomResize}
            />
          )}

          {/* View Mode Toggle + Mini Preview - AT BOTTOM */}
          {!sidebarCollapsed && (
            <div
              className="border-t border-slate-200 p-3 overflow-y-auto flex-shrink-0"
              style={{ height: `${bottomPanelHeight}px` }}
            >
              {/* Teacher/Student View Toggle */}
              <div className="flex bg-slate-100 rounded-lg p-1 mb-3">
                <button
                  onClick={() => setViewMode('teacher')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'teacher'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Monitor size={16} />
                  <span>Teacher</span>
                </button>
                <button
                  onClick={() => setViewMode('student')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'student'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Smartphone size={16} />
                  <span>Student</span>
                </button>
              </div>

              {/* Mini Live Preview of Opposite View - TALLER */}
              <MiniPreview
                viewMode={viewMode}
                sessionCode={sessionCode}
                currentStage={currentStage}
                currentStageData={currentStageData}
                sessionData={sessionData}
                config={config}
                onSwitch={() => setViewMode(viewMode === 'teacher' ? 'student' : 'teacher')}
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className={`border-t border-slate-200 flex-shrink-0 ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
            {sidebarCollapsed ? (
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleEndSession}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                  title="End Session"
                >
                  <LogOut size={18} />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Expand sidebar"
                >
                  <PanelLeft size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleEndSession}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  End Session
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <PanelLeftClose size={16} />
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Resize Divider */}
        {!sidebarCollapsed && (
          <div
            className="w-1 bg-slate-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
            onMouseDown={() => setIsResizingSidebar(true)}
          />
        )}

        {/* Presentation Area - scales to fit any screen size */}
        <div
          ref={presentationRef}
          className="flex-1 relative bg-slate-900 overflow-hidden"
        >
          <PresentationContent
            currentStage={currentStage}
            currentStageData={currentStageData}
            sessionCode={sessionCode}
            sessionData={sessionData}
            lessonConfig={config}
            lessonBasePath={config.lessonPath}
            viewMode={viewMode}
            onVideoEnded={goToNextStage}
            goToNextStage={goToNextStage}
            presentationZoom={presentationZoom}
          />

          {/* Floating Timer - Top Right (2x size) */}
          {timerVisible && (
            <div className="absolute top-4 right-4 z-50 bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-4 min-w-[180px]">
              {/* Timer Display */}
              <div className={`text-4xl font-bold font-mono text-center mb-2 ${
                classroomTimer.isRunning
                  ? classroomTimer.timeRemaining <= 60
                    ? 'text-red-400'
                    : 'text-white'
                  : 'text-gray-300'
              }`}>
                {formatClassroomTime(classroomTimer.timeRemaining)}
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-center gap-1">
                {/* Minus 1 min */}
                <button
                  onClick={() => adjustClassroomTime(-1)}
                  disabled={classroomTimer.presetMinutes <= 1 || classroomTimer.isRunning}
                  className={`p-2 rounded-lg transition-colors ${
                    classroomTimer.presetMinutes <= 1 || classroomTimer.isRunning
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="-1 min"
                >
                  <Minus size={20} />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={classroomTimer.isRunning ? pauseClassroomTimer : startClassroomTimer}
                  className={`p-3 rounded-lg transition-colors ${
                    classroomTimer.isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title={classroomTimer.isRunning ? 'Pause' : 'Start'}
                >
                  {classroomTimer.isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Plus 1 min */}
                <button
                  onClick={() => adjustClassroomTime(1)}
                  disabled={classroomTimer.presetMinutes >= 60 || classroomTimer.isRunning}
                  className={`p-2 rounded-lg transition-colors ${
                    classroomTimer.presetMinutes >= 60 || classroomTimer.isRunning
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title="+1 min"
                >
                  <Plus size={20} />
                </button>

                {/* Reset */}
                <button
                  onClick={resetClassroomTimer}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>

                {/* Minimize */}
                <button
                  onClick={() => setTimerVisible(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  title="Minimize timer"
                >
                  <Minimize2 size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Floating Timer Toggle Button - when timer is hidden */}
          {!timerVisible && (
            <button
              onClick={() => setTimerVisible(true)}
              className="absolute top-4 right-4 z-50 p-2 bg-gray-800/90 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg shadow-lg border border-gray-700 transition-colors"
              title="Show Timer"
            >
              <Clock size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Save Confirmation Modal - shown when leaving composition activity */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {isSavingAll ? 'Saving All Work...' : 'Moving to Reflection'}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSavingAll ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-gray-700 text-lg">Saving student work...</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-lg mb-2">
                    All student compositions will be saved automatically.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Students will see their work on the Join page.
                  </p>
                </>
              )}
            </div>

            {/* Buttons */}
            {!isSavingAll && (
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setPendingStageId(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveComposition}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                >
                  Save All & Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post-Session Survey Modals */}
      {surveyType === 'quick' && (
        <PostSessionSurvey
          onSubmit={handleSurveyComplete}
          onSkip={handleSurveySkip}
          studentCount={studentCount}
          lessonId={config.lessonId || 'unknown'}
          sessionCode={sessionCode}
        />
      )}

      {surveyType === 'midPilot' && (
        <MidPilotSurvey
          onSubmit={handleSurveyComplete}
          onSkip={handleSurveySkip}
          studentCount={studentCount}
          sessionCode={sessionCode}
        />
      )}

      {surveyType === 'finalPilot' && (
        <FinalPilotSurvey
          onSubmit={handleSurveyComplete}
          onSkip={handleSurveySkip}
          studentCount={studentCount}
          sessionCode={sessionCode}
        />
      )}
      </div>
    </div>
    </>
  );
};

export default TeacherLessonView;