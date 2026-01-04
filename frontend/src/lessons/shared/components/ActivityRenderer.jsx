// File: /lessons/shared/components/ActivityRenderer.jsx
// Renders activities based on type - reusable across all lessons
// NOTE: NO countdown timers in student view - only in presentation view
// ✅ UPDATED: Added Sectional Loop Builder activity for Lesson 4 (Epic Wildlife)
// ✅ UPDATED: Added Robot Melody Maker bonus activity for Lesson 3
// ✅ UPDATED: Added ListeningMapActivity for Lesson 3 (City Soundscapes)
// ✅ UPDATED: Added WildlifeCompositionActivity for Lesson 4 (Epic Wildlife)

import React from 'react';
import VideoPlayer from './video/VideoPlayer';
import DAWTutorialActivity from '../activities/daw-tutorial/DAWTutorialActivity';
import SchoolBeneathActivity from '../activities/SchoolBeneathActivity';
import TwoStarsAndAWishActivity from '../activities/two-stars-and-a-wish/TwoStarsAndAWishActivity';
import SoundEffectsActivity from '../activities/SoundEffectsActivity';
import NameThatLoopActivity from '../activities/layer-detective/NameThatLoopActivity';
import LayerDetectiveActivity from '../activities/layer-detective/LayerDetectiveActivity';
import LayerDetectiveStudentView from '../activities/layer-detective/LayerDetectiveStudentView';
import SportsCompositionActivity from "../activities/SportsCompositionActivity";
import CityCompositionActivity from "../activities/CityCompositionActivity";
import WildlifeCompositionActivity from "../activities/WildlifeCompositionActivity";
import GameCompositionActivity from "../activities/GameCompositionActivity";

// ✅ ADDED: Listening Map Activity for Lesson 3
import ListeningMapActivity from '../activities/texture-drawings/ListeningMapActivity';

// ✅ ADDED: Sectional Loop Builder for Lesson 4 (Epic Wildlife)
import SectionalLoopBuilderActivity from '../activities/sectional-loop-builder/SectionalLoopBuilderActivity';

// ✅ ADDED: Robot Melody Maker bonus activity for Lesson 3
import RobotMelodyMaker from '../activities/robot-melody-maker';

// ✅ ADDED: Melody Escape Room activity for Lesson 2
import MelodyEscapeRoomActivity from '../activities/melody-escape-room';

// ✅ ADDED: Mood Match Game for Lesson 1 (Score the Adventure)
import MoodMatchGameActivity from '../activities/mood-match-game';

// ✅ ADDED: Layer Lab for Lesson 2 (Sports Highlights - Instrumentation)
import LayerLabActivity from '../activities/layer-lab';

// ✅ ADDED: Loop Lab partner game for Lesson 2 (Instrumentation & Timbre)
import LoopLabActivity from '../activities/loop-lab/LoopLabActivity';

// ✅ ADDED: Beat Maker drum grid for Lesson 2 (Rhythm & Beat Creation)
import BeatMakerActivity from '../activities/beat-maker';

// ✅ ADDED: Student Beat Maker for Lesson 4 (Form & Structure)
import { StudentBeatMakerActivity } from '../activities/beat-maker';

// ✅ ADDED: Beat Escape Room partner activity for Lesson 4 (Form & Structure)
import { BeatEscapeRoomActivity } from '../activities/beat-escape-room';

// ✅ ADDED: Melody Maker for Lesson 5 (Game On - Melody & Contour)
import MelodyMakerActivity, { StudentMelodyMakerActivity } from '../activities/melody-maker';
import MelodyBuilderTeacherDemo from '../activities/melody-maker/MelodyBuilderTeacherDemo';

// ✅ ADDED: Melody Mystery for Lesson 5 (Game On - Bonus Activity)
import MelodyMysteryActivity from '../activities/melody-mystery';

// ✅ ADDED: Name That Game for Lesson 5 (Game On - Intro Demo)
import NameThatGameActivity from '../activities/name-that-game';

const ActivityRenderer = ({
  activity,
  onComplete,
  navToolsEnabled = false,
  canAccessNavTools = false,
  lessonStartTime = null,
  viewMode = false,
  viewBonusMode = false,
  showCountdown = false,  // Only true for presentation view
  isSessionMode = false,
  studentName = 'Student',
  assignmentId = null
}) => {
  if (!activity) return null;

  switch (activity.type) {
    case 'video':
      return (
        <VideoPlayer 
          key={`video-${activity.id}`}
          src={activity.src}
          onComplete={onComplete}
          title={activity.title}
          allowSeeking={false}
          showNotice={false}
          allowFullscreen={false}
        />
      );

    case 'daw-tutorial':
      return (
        <DAWTutorialActivity 
          key={`daw-tutorial-${activity.id}`}
          onComplete={onComplete}
          navToolsEnabled={navToolsEnabled}
          canAccessNavTools={canAccessNavTools}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
        />
      );

    case 'school-beneath-activity':
      return (
        <SchoolBeneathActivity 
          key={`school-beneath-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          viewBonusMode={viewBonusMode}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
        />
      );

    case 'sports-composition-activity':
      return (
        <SportsCompositionActivity 
          key={`sports-composition-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ City Composition Activity (Lesson 3)
    case 'city-composition-activity':
      return (
        <CityCompositionActivity 
          key={`city-composition-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Listening Map Activity (Lesson 3 - City Soundscapes)
    case 'listening-map':
      return (
        <ListeningMapActivity
          key={`listening-map-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Sectional Loop Builder Game (Lesson 4 - Epic Wildlife)
    case 'sectional-loop-builder':
      return (
        <SectionalLoopBuilderActivity 
          key={`sectional-loop-builder-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ Wildlife Composition Activity (Lesson 4 - Epic Wildlife)
    case 'wildlife-composition-activity':
      return (
        <WildlifeCompositionActivity 
          key={`wildlife-composition-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Robot Melody Maker (Lesson 3 - Epic Wildlife Bonus)
    case 'robot-melody-maker':
    case 'monster-melody-maker':  // backward compatibility
      return (
        <RobotMelodyMaker
          key={`robot-melody-maker-${activity.id}`}
          onSave={(data) => {
            console.log('Robot Melody saved:', data);
            localStorage.setItem('robot-band-creation', JSON.stringify(data));
          }}
          onSubmit={onComplete ? () => onComplete('robot-melody-maker') : undefined}
          studentName={studentName}
          assignmentId={assignmentId}
          savedData={(() => {
            try {
              // Try new student work storage first
              const studentWork = localStorage.getItem('mma-saved-robot-melody-maker');
              if (studentWork) {
                const parsed = JSON.parse(studentWork);
                return parsed.data || parsed;
              }
              // Fall back to direct localStorage save
              const saved = localStorage.getItem('robot-band-creation');
              return saved ? JSON.parse(saved) : null;
            } catch {
              return null;
            }
          })()}
        />
      );

    case 'two-stars-wish':
    case 'two-stars-and-a-wish':
      return (
        <TwoStarsAndAWishActivity
          key={`reflection-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    case 'sound-effects':
      return (
        <SoundEffectsActivity 
          key={`sound-effects-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          lessonStartTime={lessonStartTime}
        />
      );

    // ✅ Name That Loop bonus activity
    case 'name-that-loop':
      return (
        <NameThatLoopActivity 
          key={`name-that-loop-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      );

    // ✅ Layer Detective warm-up activity (Lesson 2)
    // Uses synchronized student view in session mode, self-paced otherwise
    case 'layer-detective':
      if (isSessionMode) {
        return (
          <LayerDetectiveStudentView
            key={`layer-detective-student-${activity.id}`}
            onComplete={onComplete}
            isSessionMode={isSessionMode}
          />
        );
      }
      return (
        <LayerDetectiveActivity
          key={`layer-detective-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      );

    // ✅ ADDED: Melody Escape Room activity (Lesson 2)
    case 'melody-escape-room':
      return (
        <MelodyEscapeRoomActivity
          key={`melody-escape-room-${activity.id}`}
          onComplete={onComplete}
        />
      );

    // ✅ ADDED: Mood Match Game (Lesson 1 - Score the Adventure)
    case 'mood-match-game':
      return (
        <MoodMatchGameActivity
          key={`mood-match-game-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Adventure Composition (Lesson 1 - Score the Adventure)
    // Uses SchoolBeneathActivity with adventure video
    case 'adventure-composition':
      return (
        <SchoolBeneathActivity
          key={`adventure-composition-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          viewBonusMode={viewBonusMode}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
          title="Score the Adventure"
          videoPath="/lessons/film-music-project/lesson1/NatureDroneFootage.mp4"
          storageKey="adventure-composition"
        />
      );

    // ✅ ADDED: Layer Lab (Lesson 2 - Sports Highlights - Instrumentation)
    case 'layer-lab':
      return (
        <LayerLabActivity
          key={`layer-lab-${activity.id}`}
          onComplete={onComplete}
        />
      );

    // ✅ ADDED: Loop Lab partner game (Lesson 2 - Instrumentation & Timbre)
    case 'loop-lab':
      return (
        <LoopLabActivity
          key={`loop-lab-${activity.id}`}
          onComplete={onComplete}
        />
      );

    // ✅ ADDED: Instrument Spotlight Reflection (Lesson 2)
    // Reuses SportsCompositionActivity which handles reflection display
    case 'instrument-spotlight':
      return (
        <SportsCompositionActivity
          key={`instrument-spotlight-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Beat Maker drum grid (Lesson 2 - Rhythm & Beat Creation)
    case 'beat-maker':
      return (
        <BeatMakerActivity
          key={`beat-maker-${activity.id}`}
          onComplete={onComplete}
        />
      );

    // ✅ ADDED: Student Beat Maker (Lesson 4 - Form & Structure)
    // Uses the new BeatMakerPanel for students to create custom beats
    case 'student-beat-maker':
      return (
        <StudentBeatMakerActivity
          key={`student-beat-maker-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Teacher Beat Maker Demo (Lesson 4 - Form & Structure)
    // Same as student but in teacher demo mode
    case 'beat-maker-demo':
      return (
        <StudentBeatMakerActivity
          key={`beat-maker-demo-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
          isTeacherDemo={true}
        />
      );

    // ✅ ADDED: Beat Spotlight Reflection (Lesson 2 - Rhythm & Beat Creation)
    case 'beat-spotlight':
      return (
        <TwoStarsAndAWishActivity
          key={`beat-spotlight-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Beat Escape Room partner activity (Lesson 4 - Form & Structure)
    case 'beat-escape-room':
      return (
        <BeatEscapeRoomActivity
          key={`beat-escape-room-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Melody Maker (Lesson 5 - Game On)
    case 'melody-maker':
      return (
        <MelodyMakerActivity
          key={`melody-maker-${activity.id}`}
          onComplete={onComplete}
        />
      );

    // ✅ ADDED: Student Melody Maker (Lesson 5 - Game On)
    case 'student-melody-maker':
      return (
        <StudentMelodyMakerActivity
          key={`student-melody-maker-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Melody Builder Teacher Demo (Lesson 5 - Game On)
    case 'melody-builder-demo':
      return (
        <MelodyBuilderTeacherDemo
          key={`melody-builder-demo-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      );

    // ✅ ADDED: Melody Spotlight Reflection (Lesson 5 - Game On)
    case 'melody-spotlight':
      return (
        <TwoStarsAndAWishActivity
          key={`melody-spotlight-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Melody Mystery partner activity (Lesson 5 - Game On Bonus)
    case 'melody-mystery':
      return (
        <MelodyMysteryActivity
          key={`melody-mystery-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Game Composition Activity (Lesson 5 - video game montage with DAW)
    case 'game-composition-activity':
      return (
        <GameCompositionActivity
          key={`game-composition-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Name That Game demo activity (Lesson 5 - Game On)
    case 'name-that-game':
      return (
        <NameThatGameActivity
          key={`name-that-game-${activity.id}`}
          onComplete={onComplete}
        />
      );

    default:
      return (
        <div className="h-full flex items-center justify-center bg-gray-800 text-white">
          <div className="text-center">
            <p className="text-xl mb-2">Unknown Activity Type</p>
            <p className="text-gray-400">Activity type "{activity.type}" is not supported</p>
          </div>
        </div>
      );
  }
};

export default ActivityRenderer;