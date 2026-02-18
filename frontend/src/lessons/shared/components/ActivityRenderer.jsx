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

// ✅ ADDED: Film Music Lesson 1 - Leitmotif & Melody Activities
import LeitmotifDetectiveActivity from '../activities/leitmotif-detective';
import MotifBuilderActivity from '../activities/motif-builder';
import KeyboardTutorialActivity from '../activities/keyboard-tutorial';

// ✅ ADDED: Unit 2 - The Listening Lab Activities
import { GuessThatInstrumentActivity } from '../activities/guess-that-instrument';
import { OrchestraLabActivity } from '../activities/orchestra-lab';

// ✅ ADDED: String Detective for Lesson 1 (Strings & Dynamics)
import { StringDetectiveActivity } from '../activities/string-detective';

// ✅ ADDED: Dynamics Dash for Lesson 1 (Strings & Dynamics)
import { DynamicsDashActivity } from '../activities/dynamics-dash';
import DynamicsDashStudentView from '../activities/dynamics-dash/DynamicsDashStudentView';

// ✅ ADDED: Strings & Dynamics Lab for Lesson 1 (Bonus Activity)
import StringsDynamicsLabActivity from '../activities/strings-dynamics-lab/StringsDynamicsLabActivity';

// ✅ ADDED: Tempo Charades for Lesson 2 (Woodwinds & Tempo)
import TempoCharadesStudentView from '../activities/tempo-charades/TempoCharadesStudentView';
import TempoCharadesSmallGroup from '../activities/tempo-charades/TempoCharadesSmallGroup';

// ✅ ADDED: Section Spotter for Lesson 4 (Form & Structure)
import SectionSpotterStudentView from '../activities/section-spotter/SectionSpotterStudentView';

// ✅ ADDED: Rondo Form Game for Lesson 3 (Brass & Form)
import RondoFormGameStudent from '../activities/rondo-form-game/RondoFormGameStudent';

// ✅ ADDED: Listening Journey for Lesson 4 (Form & Structure)
import ListeningJourney from '../activities/listening-journey';

// ✅ ADDED: Name That Element review game (Listening Lab Lesson 4 - Review)
import NameThatElementStudentView from '../activities/name-that-element/NameThatElementStudentView';

// ✅ ADDED: Four Corners review game (Listening Lab Lesson 3 - Bonus)
import FourCornersStudentView from '../activities/four-corners/FourCornersStudentView';

// ✅ ADDED: Capstone activities (Listening Lab Lesson 4)
import CapstonePieceSelection from '../activities/capstone/CapstonePieceSelection';
import CapstonePlanning from '../activities/capstone/CapstonePlanning';

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
          activityId={activity.activityId || null}
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
          reflectionActivityId="fm-lesson1-reflection"
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

    // ✅ ADDED: Keyboard Tutorial (Film Music Lesson 1 - Leitmotif & Melody)
    case 'keyboard-tutorial':
      return (
        <KeyboardTutorialActivity
          key={`keyboard-tutorial-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Leitmotif Detective (Film Music Lesson 1 - Leitmotif & Melody)
    case 'leitmotif-detective':
      return (
        <LeitmotifDetectiveActivity
          key={`leitmotif-detective-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Motif Builder (Film Music Lesson 1 - Leitmotif & Melody)
    case 'motif-builder':
      return (
        <MotifBuilderActivity
          key={`motif-builder-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ========================================
    // UNIT 2 - THE LISTENING LAB ACTIVITIES
    // ========================================

    // ✅ ADDED: Guess That Instrument game (Listening Lab Lesson 1)
    case 'guess-that-instrument':
      return (
        <GuessThatInstrumentActivity
          key={`guess-that-instrument-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      );

    // ✅ ADDED: Orchestra Lab partner game (Listening Lab Lesson 1 - Bonus)
    case 'orchestra-lab':
      return (
        <OrchestraLabActivity
          key={`orchestra-lab-${activity.id}`}
          onComplete={onComplete}
        />
      );

    // ✅ ADDED: Listening Map for Instruments (Listening Lab Lesson 1)
    case 'listening-map-instruments':
      return (
        <ListeningMapActivity
          key={`listening-map-instruments-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Listening Lab Reflection (Unit 2 - all lessons)
    case 'listening-lab-reflection':
      return (
        <TwoStarsAndAWishActivity
          key={`listening-lab-reflection-${activity.id}`}
          activityId="ll-lesson1-reflection"
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: String Detective game (Listening Lab Lesson 1 - Strings & Dynamics)
    case 'string-detective':
      return (
        <StringDetectiveActivity
          key={`string-detective-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      );

    // ✅ ADDED: Dynamics Dash game (Listening Lab Lesson 1 - Strings & Dynamics)
    // Uses synchronized student view in session mode, self-paced otherwise
    case 'dynamics-dash':
      if (isSessionMode) {
        return (
          <DynamicsDashStudentView
            key={`dynamics-dash-student-${activity.id}`}
            onComplete={onComplete}
            isSessionMode={isSessionMode}
          />
        );
      }
      return (
        <DynamicsDashActivity
          key={`dynamics-dash-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
        />
      );

    // ✅ ADDED: Dynamics Listening Map (Listening Lab Lesson 1)
    // Only shows instruments + dynamics + emojis stickers (slow release)
    case 'dynamics-listening-map':
      return (
        <ListeningMapActivity
          key={`dynamics-listening-map-${activity.id}`}
          activityId="dynamics-listening-map"
          onComplete={onComplete}
          isSessionMode={isSessionMode}
          config={{
            availableTabs: ['instruments', 'dynamics', 'emojis']
          }}
        />
      );

    // ✅ ADDED: Strings & Dynamics Lab (Listening Lab Lesson 1 - Bonus)
    // Partner game: one picks instrument + dynamic, partner guesses both
    case 'strings-dynamics-lab':
      return (
        <StringsDynamicsLabActivity
          key={`strings-dynamics-lab-${activity.id}`}
          onComplete={onComplete}
        />
      );

    // ✅ ADDED: Tempo Charades (Listening Lab Lesson 2 - Woodwinds & Tempo)
    // Synchronized student view in session mode
    case 'tempo-charades':
      return (
        <TempoCharadesStudentView
          key={`tempo-charades-student-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Tempo Charades Small Group (Listening Lab Lesson 2)
    // Students form groups and take turns acting/guessing
    case 'tempo-charades-small-group':
      return (
        <TempoCharadesSmallGroup
          key={`tempo-charades-small-group-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Tempo Listening Map (Listening Lab Lesson 2)
    // Uses the existing ListeningMapActivity with Brahms audio and tempo config
    case 'tempo-listening-map':
      return (
        <ListeningMapActivity
          key={`tempo-listening-map-${activity.id}`}
          activityId="tempo-listening-map"
          onComplete={onComplete}
          isSessionMode={isSessionMode}
          config={{
            audioFile: '/audio/classical/brahms-hungarian-dance-5.mp3',
            totalDuration: 173,
            numRows: 6,
            secondsPerRow: 29,
            rows: [
              { id: 'row1', name: '0:00 - 0:29', color: '#3b82f6', emoji: '1️⃣' },
              { id: 'row2', name: '0:29 - 0:58', color: '#8b5cf6', emoji: '2️⃣' },
              { id: 'row3', name: '0:58 - 1:27', color: '#ec4899', emoji: '3️⃣' },
              { id: 'row4', name: '1:27 - 1:56', color: '#f59e0b', emoji: '4️⃣' },
              { id: 'row5', name: '1:56 - 2:24', color: '#10b981', emoji: '5️⃣' },
              { id: 'row6', name: '2:24 - 2:53', color: '#ef4444', emoji: '6️⃣' }
            ],
            credits: {
              title: 'Hungarian Dance No. 5',
              composer: 'Johannes Brahms',
              performer: 'Netfocus Universal Sound Library',
              license: 'Public Domain',
              source: 'Internet Archive'
            },
            availableTabs: ['instruments', 'dynamics', 'tempo', 'emojis']
          }}
        />
      );

    // ✅ ADDED: Listening Lab Lesson 2 Reflection
    case 'listening-lab-lesson2-reflection':
      return (
        <TwoStarsAndAWishActivity
          key={`listening-lab-lesson2-reflection-${activity.id}`}
          activityId="ll-lesson2-reflection"
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Form Listening Map (Listening Lab Lesson 3)
    // Uses the existing ListeningMapActivity with Mountain King audio and ABA form config
    case 'form-listening-map':
      return (
        <ListeningMapActivity
          key={`form-listening-map-${activity.id}`}
          activityId="form-listening-map"
          onComplete={onComplete}
          isSessionMode={isSessionMode}
          config={{
            audioFile: '/audio/classical/grieg-mountain-king.mp3',
            volume: 0.3,
            totalDuration: 150,
            numRows: 3,
            secondsPerRow: 50,
            rows: [
              { id: 'row1', name: 'A — Sneaky Start (0:00 - 0:59)', color: '#3b82f6', emoji: '🔵' },
              { id: 'row2', name: 'B — Building Energy (0:59 - 1:44)', color: '#ef4444', emoji: '🔴' },
              { id: 'row3', name: 'A\' — Explosive Return (1:44 - 2:30)', color: '#3b82f6', emoji: '🔵' }
            ],
            credits: {
              title: 'In the Hall of the Mountain King',
              composer: 'Edvard Grieg',
              performer: 'Public Domain Recording',
              license: 'Public Domain',
              source: 'IMSLP / Musopen'
            },
            availableTabs: ['instruments', 'dynamics', 'tempo', 'form', 'emojis']
          }}
        />
      );

    // ✅ ADDED: Listening Lab Lesson 3 Reflection
    case 'listening-lab-lesson3-reflection':
      return (
        <TwoStarsAndAWishActivity
          key={`listening-lab-lesson3-reflection-${activity.id}`}
          activityId="ll-lesson3-reflection"
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Rondo Form Game for Lesson 3 (Brass & Form)
    case 'rondo-form-game':
      return (
        <RondoFormGameStudent
          key={`rondo-form-game-student-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Section Spotter for Lessons 3 & 4 (Form)
    case 'section-spotter':
      return (
        <SectionSpotterStudentView
          key={`section-spotter-student-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Listening Journey for Lesson 4 (Form & Structure)
    case 'listening-journey':
      return (
        <ListeningJourney
          key={`listening-journey-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
          pieceConfig={activity.pieceConfig || null}
        />
      );

    // ✅ ADDED: Listening Lab Lesson 4 Reflection
    case 'listening-lab-lesson4-reflection':
      return (
        <TwoStarsAndAWishActivity
          key={`listening-lab-lesson4-reflection-${activity.id}`}
          activityId="ll-lesson4-reflection"
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Name That Element review game (Listening Lab Lesson 4 - Review)
    // Students see answer buttons synced to teacher's game via Firebase
    case 'name-that-element':
      return (
        <NameThatElementStudentView
          key={`name-that-element-student-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Four Corners review game (Listening Lab Lesson 3 - Bonus)
    // Students see 4 corner buttons synced to teacher's game via Firebase
    case 'four-corners':
      return (
        <FourCornersStudentView
          key={`four-corners-student-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Capstone Piece Selection (Listening Lab Lesson 4)
    // Students browse 5 pieces, listen to previews, and select one
    case 'capstone-piece-selection':
      return (
        <CapstonePieceSelection
          key={`capstone-piece-selection-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Capstone Planning (Listening Lab Lesson 4)
    // Students sketch a plan for their Listening Journey sections
    case 'capstone-planning':
      return (
        <CapstonePlanning
          key={`capstone-planning-${activity.id}`}
          onComplete={onComplete}
          isSessionMode={isSessionMode}
        />
      );

    // ✅ ADDED: Gallery Circle (Listening Lab Lesson 5)
    // Students watch shared journeys — mostly teacher-driven from main screen
    case 'gallery-circle':
      return (
        <div
          key={`gallery-circle-${activity.id}`}
          className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-8"
        >
          <div className="text-8xl mb-6">🎪</div>
          <h1 className="text-5xl font-bold mb-4">Gallery Circle</h1>
          <p className="text-2xl text-white/70 mb-2">Watch the main screen</p>
          <p className="text-xl text-white/50">Your classmates are sharing their Listening Journeys!</p>
        </div>
      );

    // ✅ ADDED: Listening Lab Lesson 5 Reflection / Exit Ticket
    case 'listening-lab-lesson5-reflection':
      return (
        <TwoStarsAndAWishActivity
          key={`listening-lab-lesson5-reflection-${activity.id}`}
          activityId="ll-lesson5-reflection"
          onComplete={onComplete}
          viewMode={viewMode}
          isSessionMode={isSessionMode}
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