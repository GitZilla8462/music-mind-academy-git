/**
 * FILE: monster-melody-maker/components/ControlBar.jsx
 * 
 * Playback controls: Play, Pause, Stop, Tempo, Save
 */

import React from 'react';
import styles from './ControlBar.module.css';

const ControlBar = ({
  isPlaying,
  onPlay,
  onPause,
  onStop,
  tempo,
  onTempoChange,
  onSave,
}) => {
  return (
    <div className={styles.controlBar}>
      {/* Playback buttons */}
      <div className={styles.playbackControls}>
        {!isPlaying ? (
          <button 
            className={`${styles.btn} ${styles.playBtn}`}
            onClick={onPlay}
            title="Play"
          >
            ▶️ Play
          </button>
        ) : (
          <button 
            className={`${styles.btn} ${styles.pauseBtn}`}
            onClick={onPause}
            title="Pause"
          >
            ⏸️ Pause
          </button>
        )}
        
        <button 
          className={`${styles.btn} ${styles.stopBtn}`}
          onClick={onStop}
          title="Stop"
        >
          ⏹️ Stop
        </button>
      </div>

      {/* Tempo control */}
      <div className={styles.tempoControl}>
        <label className={styles.tempoLabel}>
          🎵 Tempo: {tempo}
        </label>
        <input
          type="range"
          min="60"
          max="120"
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className={styles.tempoSlider}
        />
      </div>

      {/* Save button */}
      <button 
        className={`${styles.btn} ${styles.saveBtn}`}
        onClick={onSave}
        title="Save your creation"
      >
        💾 Save
      </button>
    </div>
  );
};

export default ControlBar;