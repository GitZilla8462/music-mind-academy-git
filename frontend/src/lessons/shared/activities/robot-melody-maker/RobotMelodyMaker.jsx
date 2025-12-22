/**
 * FILE: robot-melody-maker/RobotMelodyMaker.jsx
 *
 * ROBOT BAND BUILDER
 * - 4 robots to customize (tabs 1-4 in stage header)
 * - Right panel toggles between Melody Grid and Song Arranger
 * - Each robot has its own appearance, melody, and stage theme
 * ✅ UPDATED: Saves to Join page using saveStudentWork
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  RobotAvatar,
  RobotCustomizer,
  MelodyGrid,
  StageBackground,
  ControlBar,
  SaveModal,
} from './components';
import useMelodyEngine from './hooks/useMelodyEngine';
import { DEFAULT_MONSTER_CONFIG } from './config/defaults';
import { saveStudentWork } from '../../../../utils/studentWorkStorage';
import styles from './RobotMelodyMaker.module.css';

// Create empty 8x16 pattern grid
const createEmptyPattern = () => 
  Array(8).fill(null).map(() => Array(16).fill(false));

// Default config for new robots - first option for everything, no accessories/patterns
const createDefaultRobotConfig = () => ({
  ...DEFAULT_MONSTER_CONFIG,
  accessory: 'none',
  pattern: 'none',
});

// Create a new robot with defaults
const createDefaultRobot = (id) => ({
  id,
  name: `Robot ${id}`,
  config: createDefaultRobotConfig(),
  melody: createEmptyPattern(),
  stageTheme: 'space',
});

// Check if a robot has any notes in its melody
const robotHasMelody = (robot) => {
  if (!robot?.melody || !Array.isArray(robot.melody)) return false;
  return robot.melody.some(row => Array.isArray(row) && row.some(cell => cell === true));
};

const MonsterMelodyMaker = ({ 
  onSave, 
  onSubmit, 
  savedData,
  studentName,
  assignmentId 
}) => {
  // ===== ROBOT BAND STATE =====

  // Validate and repair robot data to ensure melodies are valid arrays
  const validateRobot = (robot, id) => {
    if (!robot) return createDefaultRobot(id);
    return {
      ...robot,
      id: robot.id || id,
      name: robot.name || `Robot ${id}`,
      config: robot.config || createDefaultRobotConfig(),
      melody: Array.isArray(robot.melody) ? robot.melody : createEmptyPattern(),
      stageTheme: robot.stageTheme || 'space',
    };
  };

  // 4 robots with their own config, melody, and stage
  const [robots, setRobots] = useState(() => {
    if (savedData?.robots && Array.isArray(savedData.robots)) {
      // Validate each robot to ensure melodies are valid arrays
      return savedData.robots.map((robot, idx) => validateRobot(robot, idx + 1));
    }
    return [
      createDefaultRobot(1),
      createDefaultRobot(2),
      createDefaultRobot(3),
      createDefaultRobot(4),
    ];
  });

  // Currently selected robot for editing (1-4)
  const [selectedRobotId, setSelectedRobotId] = useState(1);

  // Right panel view mode: 'melody' or 'arranger'
  const [rightPanelView, setRightPanelView] = useState('melody');

  // Song arranger - 4 slots, each can hold a robot id or null
  const [songSlots, setSongSlots] = useState(() => {
    if (savedData?.songSlots) {
      return savedData.songSlots;
    }
    return [
      { slotId: 1, robotId: null },
      { slotId: 2, robotId: null },
      { slotId: 3, robotId: null },
      { slotId: 4, robotId: null },
    ];
  });

  // ===== PLAYBACK STATE =====
  
  // Tempo: 60-130 BPM, starts at 100
  const [tempo, setTempo] = useState(() => savedData?.tempo || 100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  // Song playback state
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [currentSongSlotIndex, setCurrentSongSlotIndex] = useState(-1);
  const songStepCountRef = useRef(0);
  const filledSlotsRef = useRef([]);

  // Animation state
  const [animationState, setAnimationState] = useState({
    singing: false,
    pitch: null,
  });

  // Dance preview state
  const [previewDance, setPreviewDance] = useState(false);

  // Save modal
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [creationName, setCreationName] = useState(() => 
    savedData?.name || ''
  );

  // ===== DERIVED STATE =====
  
  // Get currently selected robot
  const selectedRobot = robots.find(r => r.id === selectedRobotId) || robots[0];
  
  // Get robot currently shown on stage (during song playback, show the current robot)
  const getSongRobot = useCallback(() => {
    if (!isPlayingSong || currentSongSlotIndex < 0) return null;
    const filledSlots = filledSlotsRef.current;
    if (currentSongSlotIndex < filledSlots.length) {
      const robotId = filledSlots[currentSongSlotIndex].robotId;
      return robots.find(r => r.id === robotId);
    }
    return null;
  }, [isPlayingSong, currentSongSlotIndex, robots]);

  const displayedRobot = getSongRobot() || selectedRobot;

  // ===== MELODY ENGINE =====
  
  const handleNotePlay = useCallback((pitch) => {
    if (pitch !== null) {
      setAnimationState({ singing: true, pitch });
    } else {
      setAnimationState({ singing: false, pitch: null });
    }
  }, []);

  const handleStep = useCallback((step) => {
    setCurrentStep(step);
    
    // Track steps during song playback
    if (isPlayingSong) {
      songStepCountRef.current += 1;
      
      // After 16 steps, move to next slot
      if (songStepCountRef.current >= 16) {
        songStepCountRef.current = 0;
        setCurrentSongSlotIndex(prev => prev + 1);
      }
    }
  }, [isPlayingSong]);

  // Get the pattern to play
  const getCurrentPattern = useCallback(() => {
    if (isPlayingSong) {
      const songRobot = getSongRobot();
      return songRobot?.melody || createEmptyPattern();
    }
    return selectedRobot.melody;
  }, [isPlayingSong, getSongRobot, selectedRobot.melody]);

  // Use melody engine
  useMelodyEngine({
    pattern: getCurrentPattern(),
    tempo,
    isPlaying: isPlaying || isPlayingSong,
    onNotePlay: handleNotePlay,
    onStep: handleStep,
  });

  // ===== SONG PLAYBACK =====
  
  // Check if song is complete
  useEffect(() => {
    if (!isPlayingSong) return;
    
    const filledSlots = filledSlotsRef.current;
    
    if (currentSongSlotIndex >= filledSlots.length) {
      // Song finished
      setIsPlayingSong(false);
      setCurrentSongSlotIndex(-1);
      setCurrentStep(-1);
      setAnimationState({ singing: false, pitch: null });
    }
  }, [currentSongSlotIndex, isPlayingSong]);

  const handlePlaySong = useCallback(() => {
    const filledSlots = songSlots.filter(slot => slot.robotId !== null);
    
    if (filledSlots.length === 0) {
      return;
    }

    // Stop preview if playing
    setIsPlaying(false);
    setCurrentStep(-1);
    
    // Start song playback
    songStepCountRef.current = 0;
    filledSlotsRef.current = filledSlots;
    setCurrentSongSlotIndex(0);
    setIsPlayingSong(true);
  }, [songSlots]);

  const handleStopSong = useCallback(() => {
    setIsPlayingSong(false);
    setCurrentSongSlotIndex(-1);
    setCurrentStep(-1);
    songStepCountRef.current = 0;
    setAnimationState({ singing: false, pitch: null });
  }, []);

  // ===== ROBOT SELECTION =====
  
  const handleSelectRobot = useCallback((robotId) => {
    // Stop any playback when switching robots
    setIsPlaying(false);
    setIsPlayingSong(false);
    setCurrentStep(-1);
    setCurrentSongSlotIndex(-1);
    setAnimationState({ singing: false, pitch: null });
    setSelectedRobotId(robotId);
  }, []);

  // ===== ROBOT EDITING =====

  // Update robot name
  const handleRobotNameChange = useCallback((robotId, newName) => {
    setRobots(prev => prev.map(robot => 
      robot.id === robotId 
        ? { ...robot, name: newName || `Robot ${robotId}` }
        : robot
    ));
  }, []);

  // Update robot config (appearance)
  const handleMonsterChange = useCallback((newConfig) => {
    setRobots(prev => prev.map(robot => 
      robot.id === selectedRobotId 
        ? { ...robot, config: newConfig }
        : robot
    ));
  }, [selectedRobotId]);

  // Update robot melody
  const handlePatternChange = useCallback((newPattern) => {
    setRobots(prev => prev.map(robot => 
      robot.id === selectedRobotId 
        ? { ...robot, melody: newPattern }
        : robot
    ));
  }, [selectedRobotId]);

  // Update robot stage theme
  const handleStageThemeChange = useCallback((newTheme) => {
    setRobots(prev => prev.map(robot => 
      robot.id === selectedRobotId 
        ? { ...robot, stageTheme: newTheme }
        : robot
    ));
  }, [selectedRobotId]);

  // ===== PREVIEW CONTROLS =====
  
  const handlePlay = useCallback(() => {
    if (isPlayingSong) {
      handleStopSong();
    }
    setIsPlaying(true);
  }, [isPlayingSong, handleStopSong]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setIsPlayingSong(false);
    setCurrentStep(-1);
    setCurrentSongSlotIndex(-1);
    setAnimationState({ singing: false, pitch: null });
  }, []);

  // ===== SAVE =====
  
  const handleSaveClick = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  const handleSaveConfirm = useCallback(() => {
    const robotsWithMelodies = robots.filter(r => robotHasMelody(r)).length;
    const saveName = creationName || 'My Robot Band';
    
    const saveData = {
      name: saveName,
      robots,
      songSlots,
      tempo,
      studentName,
      assignmentId,
      timestamp: new Date().toISOString(),
    };

    // Save to old localStorage key for backward compatibility
    localStorage.setItem('robot-band-creation', JSON.stringify(saveData));

    // ✅ Save to new student work system (appears on Join page)
    saveStudentWork('robot-melody-maker', {
      title: saveName,
      emoji: '🤖',
      viewRoute: '/lessons/film-music-project/lesson3?view=melody',
      subtitle: `${robotsWithMelodies} robot${robotsWithMelodies !== 1 ? 's' : ''} with melodies`,
      category: 'Film Music Project',
      data: saveData
    });

    if (onSave) {
      onSave(saveData);
    }

    setShowSaveModal(false);
    console.log('💾 Saved to Join page:', saveData);
  }, [creationName, robots, songSlots, tempo, studentName, assignmentId, onSave]);

  // Auto-save on changes
  useEffect(() => {
    const saveData = {
      name: creationName,
      robots,
      songSlots,
      tempo,
    };
    localStorage.setItem('robot-band-autosave', JSON.stringify(saveData));
  }, [robots, songSlots, tempo, creationName]);

  // ===== RENDER =====

  // Get which original slot index is currently playing
  const getPlayingSlotOriginalIndex = () => {
    if (!isPlayingSong || currentSongSlotIndex < 0) return -1;
    const filledSlots = songSlots
      .map((slot, idx) => ({ ...slot, originalIndex: idx }))
      .filter(slot => slot.robotId !== null);
    return filledSlots[currentSongSlotIndex]?.originalIndex ?? -1;
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        {/* Left panel - Customizer */}
        <aside className={styles.leftPanel}>
          {/* Robot name input */}
          <div className={styles.robotNameSection}>
            <label className={styles.nameLabel}>Robot Name:</label>
            <input
              type="text"
              className={styles.robotNameInput}
              value={selectedRobot.name}
              onChange={(e) => handleRobotNameChange(selectedRobotId, e.target.value)}
              placeholder={`Robot ${selectedRobotId}`}
              maxLength={12}
            />
          </div>
          
          <RobotCustomizer
            config={selectedRobot.config}
            onChange={handleMonsterChange}
            stageTheme={selectedRobot.stageTheme}
            onStageThemeChange={handleStageThemeChange}
            onPreviewDance={setPreviewDance}
          />
        </aside>

        {/* Center panel - Monster stage */}
        <section className={styles.centerPanel}>
          {/* Robot selector tabs - only show in melody view */}
          {rightPanelView === 'melody' && (
            <div className={styles.robotTabs}>
              {[1, 2, 3, 4].map((id) => {
                const robot = robots.find(r => r.id === id);
                // Robot is unlocked if: it's robot 1, OR the previous robot has a melody
                const prevRobot = robots.find(r => r.id === id - 1);
                const isUnlocked = id === 1 || robotHasMelody(prevRobot);
                return (
                  <button
                    key={id}
                    className={`${styles.robotTab} ${styles[`robotTab${id}`]} ${selectedRobotId === id ? styles.robotTabActive : ''} ${!isUnlocked ? styles.robotTabLocked : ''}`}
                    onClick={() => isUnlocked && handleSelectRobot(id)}
                    disabled={!isUnlocked}
                    title={isUnlocked ? robot?.name : `Add notes to Robot ${id - 1} first`}
                  >
                    Robot {id}
                  </button>
                );
              })}
            </div>
          )}

          {/* Single robot view (Melody mode) */}
          {rightPanelView === 'melody' && (
            <div className={styles.stageWrapper}>
              <StageBackground theme={displayedRobot.stageTheme} />
              <div className={styles.monsterWrapper}>
                <RobotAvatar
                  config={displayedRobot.config}
                  animationState={animationState}
                  isPlaying={isPlaying || isPlayingSong}
                  tempo={previewDance ? 100 : tempo}
                  previewDance={previewDance}
                />
              </div>

              {/* Show which robot is playing during song */}
              {isPlayingSong && (
                <div className={styles.nowPlaying}>
                  🎵 {displayedRobot.name}
                </div>
              )}
            </div>
          )}

          {/* 4-robot split view (Arranger mode) */}
          {rightPanelView === 'arranger' && (
            <div className={styles.splitStageWrapper}>
              {robots.map((robot) => {
                // Check if this robot is currently playing in the song
                const isCurrentlyPlaying = isPlayingSong && getSongRobot()?.id === robot.id;
                const hasMelody = robotHasMelody(robot);

                return (
                  <div
                    key={robot.id}
                    className={`${styles.miniStage} ${isCurrentlyPlaying ? styles.miniStageActive : ''} ${!hasMelody ? styles.miniStageEmpty : ''}`}
                    onClick={() => handleSelectRobot(robot.id)}
                  >
                    <StageBackground theme={robot.stageTheme} />
                    <div className={styles.miniMonsterWrapper}>
                      <RobotAvatar
                        config={robot.config}
                        animationState={isCurrentlyPlaying ? animationState : { singing: false, pitch: null }}
                        isPlaying={isCurrentlyPlaying}
                        tempo={tempo}
                        size="small"
                        isActive={isCurrentlyPlaying}
                      />
                    </div>
                    <div className={styles.miniRobotLabel}>
                      {robot.name}
                      {isCurrentlyPlaying && <span className={styles.playingIndicator}>🎵</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Control bar below stage */}
          <ControlBar
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            tempo={tempo}
            onTempoChange={setTempo}
            onSave={handleSaveClick}
            minTempo={60}
            maxTempo={130}
          />
        </section>

        {/* Right panel - Melody or Arranger */}
        <section className={styles.rightPanel}>
          {/* Toggle tabs */}
          <div className={styles.rightPanelTabs}>
            <button
              className={`${styles.panelTab} ${rightPanelView === 'melody' ? styles.panelTabActive : ''}`}
              onClick={() => setRightPanelView('melody')}
            >
              🎹 Melody
            </button>
            <button
              className={`${styles.panelTab} ${rightPanelView === 'arranger' ? styles.panelTabActive : ''}`}
              onClick={() => setRightPanelView('arranger')}
            >
              🎵 Arranger
            </button>
          </div>

          {/* Melody Grid View */}
          {rightPanelView === 'melody' && (
            <div className={styles.melodyView}>
              <MelodyGrid
                pattern={selectedRobot.melody}
                onChange={handlePatternChange}
              />
            </div>
          )}

          {/* Song Arranger View - 4 mini grids with dropdowns */}
          {rightPanelView === 'arranger' && (
            <div className={styles.arrangerView}>
              <div className={styles.arrangerGrids}>
                {songSlots.map((slot, index) => {
                  const robot = slot.robotId ? robots.find(r => r.id === slot.robotId) : null;
                  const isCurrentlyPlaying = getPlayingSlotOriginalIndex() === index;
                  // Slot is unlocked if: it's slot 0, OR the previous slot has a robot assigned
                  const isSlotUnlocked = index === 0 || songSlots[index - 1].robotId !== null;
                  
                  // Get list of robots that have at least one note (available to use)
                  const availableRobots = robots.filter(r => robotHasMelody(r));
                  
                  return (
                    <div 
                      key={slot.slotId} 
                      className={`${styles.miniGridContainer} ${isCurrentlyPlaying ? styles.miniGridPlaying : ''} ${!isSlotUnlocked ? styles.miniGridLocked : ''}`}
                    >
                      {/* Dropdown to select robot */}
                      <select
                        className={`${styles.robotSelect} ${robot ? styles[`robotSelect${robot.id}`] : ''}`}
                        value={slot.robotId || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          setSongSlots(prev => prev.map((s, idx) => 
                            idx === index ? { ...s, robotId: value } : s
                          ));
                        }}
                        disabled={!isSlotUnlocked}
                      >
                        <option value="">▼ Pick</option>
                        {availableRobots.map(r => (
                          <option key={r.id} value={r.id}>Robot {r.id}</option>
                        ))}
                      </select>
                      
                      {/* Mini melody grid */}
                      <div className={styles.miniGridWrapper}>
                        {robot ? (
                          <div className={`${styles.miniGrid} ${styles[`miniGrid${robot.id}`]}`}>
                            {robot.melody.map((row, rowIndex) =>
                              row.map((cell, colIndex) => {
                                const isCurrentStep = isCurrentlyPlaying && currentStep === colIndex;
                                return (
                                  <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`${styles.miniCell} ${cell ? styles.active : ''} ${isCurrentStep ? styles.currentStep : ''}`}
                                  />
                                );
                              })
                            )}
                          </div>
                        ) : (
                          <div className={styles.emptyGrid}>
                            <span>Empty</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.arrangerControls}>
                {!isPlayingSong ? (
                  <button 
                    className={styles.playSongBtn}
                    onClick={handlePlaySong}
                    disabled={!songSlots.some(s => s.robotId)}
                  >
                    ▶️ Play
                  </button>
                ) : (
                  <button 
                    className={styles.stopSongBtn}
                    onClick={handleStopSong}
                  >
                    ⏹️ Stop
                  </button>
                )}
                
                <button 
                  className={styles.clearSongBtn}
                  onClick={() => {
                    setSongSlots([
                      { slotId: 1, robotId: null },
                      { slotId: 2, robotId: null },
                      { slotId: 3, robotId: null },
                      { slotId: 4, robotId: null },
                    ]);
                  }}
                  disabled={isPlayingSong}
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}
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