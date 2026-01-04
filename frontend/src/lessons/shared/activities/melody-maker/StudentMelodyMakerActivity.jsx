// File: /lessons/shared/activities/melody-maker/StudentMelodyMakerActivity.jsx
// Student-facing melody maker for session mode
// Wraps MelodyMakerActivity with session-aware save functionality

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MelodyMakerActivity from './MelodyMakerActivity';
import { saveStudentWork } from '../../../../utils/studentWorkStorage';
import { useSession } from '../../../../context/SessionContext';

const StudentMelodyMakerActivity = ({
  onComplete,
  viewMode = false,
  isSessionMode = false,
  isTeacherDemo = false,
  lockedMood = null  // null = allow all moods, set a mood id to lock
}) => {
  const [hasSaved, setHasSaved] = useState(false);
  const { sessionData, currentStage } = useSession() || {};
  const prevStageRef = useRef(currentStage);

  // Handle save from melody maker
  const handleSave = useCallback((melodyData) => {
    // Save to Join page for Chromebook compatibility
    saveStudentWork('melody-maker', {
      title: 'My Melody',
      emoji: '',
      viewRoute: '/join?viewMelody=true',
      subtitle: `${melodyData.contour} melody | ${melodyData.instrument}`,
      category: 'Lesson 5 - Game On',
      data: melodyData
    });

    setHasSaved(true);
    console.log('Melody saved:', melodyData);
  }, []);

  // Auto-save when session ends or teacher moves to next stage
  useEffect(() => {
    const isEnded = currentStage === 'ended';
    const stageChanged = currentStage && prevStageRef.current && currentStage !== prevStageRef.current;

    if ((isEnded || stageChanged) && !hasSaved) {
      // Get current melody from localStorage and save
      try {
        const saved = localStorage.getItem('melody-maker-grid');
        if (saved) {
          const grid = JSON.parse(saved);
          const savedMelody = localStorage.getItem('melody-maker-saved');
          let melodyData = { grid };

          if (savedMelody) {
            melodyData = JSON.parse(savedMelody);
          }

          console.log('Auto-saving melody on stage change');
          handleSave(melodyData);
        }
      } catch (e) {
        console.error('Error auto-saving melody:', e);
      }
    }

    prevStageRef.current = currentStage;
  }, [currentStage, hasSaved, handleSave]);

  return (
    <MelodyMakerActivity
      onComplete={onComplete}
      onSave={handleSave}
      viewMode={viewMode || isTeacherDemo}
      isSessionMode={isSessionMode}
      showSaveButton={!isTeacherDemo}
      lockedMood={lockedMood}
    />
  );
};

export default StudentMelodyMakerActivity;
