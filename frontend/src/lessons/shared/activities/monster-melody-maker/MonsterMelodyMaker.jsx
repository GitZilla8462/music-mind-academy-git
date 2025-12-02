/**
 * FILE: monster-melody-maker/MonsterMelodyMaker.jsx
 * 
 * Main component for Monster Melody Maker activity
 * - Left panel: Monster customization
 * - Center: Monster stage with smooth lerp animation
 * - Right panel: Melody grid
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  MonsterAvatar,
  MonsterCustomizer,
  MelodyGrid,
  StageBackground,
  ControlBar,
  SaveModal,
} from './components';
import useMelodyEngine from './hooks/useMelodyEngine';
import { DEFAULT_MONSTER_CONFIG } from './config/defaults';
import styles from './MonsterMelodyMaker.module.css';

// Create empty 8x16 pattern grid
const createEmptyPattern = () => 
  Array(8).fill(null).map(() => Array(16).fill(false));

const MonsterMelodyMaker = ({ 
  onSave, 
  onSubmit, 
  savedData,
  studentName,
  assignmentId 
}) => {
  // Pattern state - 8 rows (pitches) x 16 columns (steps)
  const [pattern, setPattern] = useState(() => 
    savedData?.pattern || createEmptyPattern()
  );

  // Monster customization
  const [monsterConfig, setMonsterConfig] = useState(() => 
    savedData?.monsterConfig || DEFAULT_MONSTER_CONFIG
  );

  // Stage theme
  const [stageTheme, setStageTheme] = useState(() => 
    savedData?.stageTheme || 'space'
  );

  // Playback state
  const [tempo, setTempo] = useState(() => savedData?.tempo || 120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  // Animation state - pitch is now a number (0-7) or null
  const [animationState, setAnimationState] = useState({
    singing: false,
    pitch: null, // 0-7 (row index) or null
  });

  // Dance preview state - triggers 3 second dance at 100 BPM
  const [previewDance, setPreviewDance] = useState(false);

  // Save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [creationName, setCreationName] = useState(() => 
    savedData?.name || ''
  );

  // Handle note play - receives row index (0-7) or null
  const handleNotePlay = useCallback((pitch) => {
    if (pitch !== null) {
      setAnimationState({
        singing: true,
        pitch: pitch, // 0-7
      });
    } else {
      setAnimationState({
        singing: false,
        pitch: null,
      });
    }
  }, []);

  // Handle step update
  const handleStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  // Initialize melody engine
  useMelodyEngine({
    pattern,
    tempo,
    isPlaying,
    onNotePlay: handleNotePlay,
    onStep: handleStep,
  });

  // Playback controls
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setAnimationState({ singing: false, pitch: null });
  }, []);

  // Pattern change
  const handlePatternChange = useCallback((newPattern) => {
    setPattern(newPattern);
  }, []);

  // Monster config change
  const handleMonsterChange = useCallback((newConfig) => {
    setMonsterConfig(newConfig);
  }, []);

  // Save functionality
  const handleSaveClick = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  const handleSaveConfirm = useCallback(() => {
    const saveData = {
      name: creationName || 'My Monster Melody',
      pattern,
      monsterConfig,
      stageTheme,
      tempo,
      studentName,
      assignmentId,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem('monster-melody-creation', JSON.stringify(saveData));

    // Call parent save handler if provided
    if (onSave) {
      onSave(saveData);
    }

    setShowSaveModal(false);
    console.log('💾 Saved:', saveData);
  }, [creationName, pattern, monsterConfig, stageTheme, tempo, studentName, assignmentId, onSave]);

  // Auto-save on changes
  useEffect(() => {
    const saveData = {
      name: creationName,
      pattern,
      monsterConfig,
      stageTheme,
      tempo,
    };
    localStorage.setItem('monster-melody-autosave', JSON.stringify(saveData));
  }, [pattern, monsterConfig, stageTheme, tempo, creationName]);

  return (
    <div className={styles.container}>
      {/* Main content area */}
      <main className={styles.mainContent}>
        {/* Left panel - Customizer */}
        <aside className={styles.leftPanel}>
          <MonsterCustomizer 
            config={monsterConfig}
            onChange={handleMonsterChange}
            stageTheme={stageTheme}
            onStageThemeChange={setStageTheme}
            onPreviewDance={setPreviewDance}
          />
        </aside>

        {/* Center panel - Monster stage */}
        <section className={styles.centerPanel}>
          <div className={styles.stageWrapper}>
            <StageBackground theme={stageTheme} />
            <div className={styles.monsterWrapper}>
              <MonsterAvatar 
                config={monsterConfig}
                animationState={animationState}
                isPlaying={isPlaying}
                tempo={previewDance ? 100 : tempo}
                previewDance={previewDance}
              />
            </div>
          </div>
          
          {/* Control bar below stage */}
          <ControlBar
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            tempo={tempo}
            onTempoChange={setTempo}
            onSave={handleSaveClick}
          />
        </section>

        {/* Right panel - Melody grid */}
        <section className={styles.rightPanel}>
          <MelodyGrid
            pattern={pattern}
            onChange={handlePatternChange}
            currentStep={currentStep}
            isPlaying={isPlaying}
          />
        </section>
      </main>

      {/* Save modal */}
      {showSaveModal && (
        <SaveModal
          name={creationName}
          onNameChange={setCreationName}
          onSave={handleSaveConfirm}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
};

export default MonsterMelodyMaker;