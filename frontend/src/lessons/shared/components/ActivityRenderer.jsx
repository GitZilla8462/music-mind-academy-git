// File: /lessons/shared/components/ActivityRenderer.jsx
// Renders activities based on type - reusable across all lessons
// NOTE: NO countdown timers in student view - only in presentation view
// ✅ UPDATED: Added Sectional Loop Builder activity for Lesson 4 (Epic Wildlife)
// ✅ UPDATED: Added Monster Melody Maker bonus activity for Lesson 4
// ✅ UPDATED: Added ListeningMapActivity for Lesson 3 (City Soundscapes)

import React from 'react';
import VideoPlayer from './video/VideoPlayer';
import DAWTutorialActivity from '../activities/daw-tutorial/DAWTutorialActivity';
import SchoolBeneathActivity from '../activities/SchoolBeneathActivity';
import TwoStarsAndAWishActivity from '../activities/two-stars-and-a-wish/TwoStarsAndAWishActivity';
import SoundEffectsActivity from '../activities/SoundEffectsActivity';
import NameThatLoopActivity from '../activities/layer-detective/NameThatLoopActivity';
import LayerDetectiveActivity from '../activities/layer-detective/LayerDetectiveActivity';
import SportsCompositionActivity from "../activities/SportsCompositionActivity";
import CityCompositionActivity from "../activities/CityCompositionActivity";

// ✅ ADDED: Listening Map Activity for Lesson 3
import ListeningMapActivity from '../activities/texture-drawings/ListeningMapActivity';

// ✅ ADDED: Sectional Loop Builder for Lesson 4 (Epic Wildlife)
import SectionalLoopBuilderActivity from '../activities/sectional-loop-builder/SectionalLoopBuilderActivity';

// ✅ ADDED: Monster Melody Maker bonus activity for Lesson 4
import MonsterMelodyMaker from '../activities/monster-melody-maker';

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

    // ✅ ADDED: Wildlife Composition Activity (Lesson 4 - Epic Wildlife)
    // This uses the same CityCompositionActivity component but with wildlife videos
    // TODO: Create dedicated WildlifeCompositionActivity if needed
    case 'wildlife-composition-activity':
      return (
        <CityCompositionActivity 
          key={`wildlife-composition-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
          lessonStartTime={lessonStartTime}
          isSessionMode={isSessionMode}
          lessonTheme="wildlife"  // Pass theme prop if component supports it
        />
      );

    // ✅ ADDED: Monster Melody Maker (Lesson 4 - Epic Wildlife Bonus)
    case 'monster-melody-maker':
      return (
        <MonsterMelodyMaker
          key={`monster-melody-maker-${activity.id}`}
          onSave={(data) => {
            console.log('Monster Melody saved:', data);
            localStorage.setItem('monster-melody-creation', JSON.stringify(data));
          }}
          onSubmit={onComplete ? () => onComplete('monster-melody-maker') : undefined}
          studentName={studentName}
          assignmentId={assignmentId}
          savedData={(() => {
            try {
              const saved = localStorage.getItem('monster-melody-creation');
              return saved ? JSON.parse(saved) : null;
            } catch {
              return null;
            }
          })()}
        />
      );

    case 'two-stars-wish':
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
    case 'layer-detective':
      return (
        <LayerDetectiveActivity 
          key={`layer-detective-${activity.id}`}
          onComplete={onComplete}
          viewMode={viewMode}
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