/**
 * BrushPanel.jsx - Brush Settings Panel
 * 
 * Features:
 * - Brush size slider with preview
 * - Opacity control
 * - Quick size presets
 * - Tool-specific settings
 */

import React, { useState } from 'react';
import { BRUSH_SIZES, BRUSH_SIZE_LABELS } from '../../config/tools.js';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  panel: {
    position: 'absolute',
    left: '60px',
    bottom: '60px',
    width: '240px',
    backgroundColor: '#1a1a22',
    border: '1px solid #2a2a35',
    borderRadius: '12px',
    padding: '12px',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff'
  },
  closeButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#888',
    fontSize: '16px'
  },
  section: {
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  slider: {
    flex: 1,
    height: '8px',
    borderRadius: '4px',
    appearance: 'none',
    background: '#2a2a35',
    outline: 'none',
    cursor: 'pointer'
  },
  sliderValue: {
    minWidth: '36px',
    fontSize: '12px',
    color: '#fff',
    textAlign: 'right',
    fontFamily: 'monospace'
  },
  previewContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80px',
    backgroundColor: '#0a0a0f',
    borderRadius: '8px',
    border: '1px solid #2a2a35',
    marginBottom: '12px'
  },
  previewDot: {
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'all 0.15s ease'
  },
  presetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px'
  },
  presetButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 4px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2a2a35',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  presetButtonActive: {
    backgroundColor: '#3b82f6'
  },
  presetDot: {
    borderRadius: '50%',
    backgroundColor: '#fff',
    marginBottom: '4px'
  },
  presetLabel: {
    fontSize: '9px',
    color: '#888'
  },
  presetLabelActive: {
    color: '#fff'
  },
  opacityBar: {
    height: '24px',
    borderRadius: '6px',
    marginBottom: '8px',
    position: 'relative',
    overflow: 'hidden'
  },
  opacityGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  opacitySlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#666'
  }
};

// ============================================================================
// SIZE PRESET BUTTON
// ============================================================================

const SizePresetButton = ({ size, label, isActive, onClick, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const dotSize = Math.min(size, 24);

  return (
    <button
      style={{
        ...styles.presetButton,
        ...(isActive ? styles.presetButtonActive : {}),
        ...(isHovered && !isActive ? { backgroundColor: '#3a3a45' } : {})
      }}
      onClick={() => onClick(size)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${size}px`}
    >
      <div
        style={{
          ...styles.presetDot,
          width: dotSize,
          height: dotSize,
          backgroundColor: color
        }}
      />
      <span
        style={{
          ...styles.presetLabel,
          ...(isActive ? styles.presetLabelActive : {})
        }}
      >
        {label}
      </span>
    </button>
  );
};

// ============================================================================
// MAIN BRUSH PANEL COMPONENT
// ============================================================================

const BrushPanel = ({
  brushSize,
  onSizeChange,
  opacity,
  onOpacityChange,
  color = '#FFFFFF',
  onClose
}) => {
  // Get preset sizes (subset of all sizes)
  const presetSizes = [4, 8, 16, 32, 48];

  return (
    <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Brush Settings</span>
        <button style={styles.closeButton} onClick={onClose}>✕</button>
      </div>

      {/* Size Preview */}
      <div style={styles.previewContainer}>
        <div
          style={{
            ...styles.previewDot,
            width: Math.min(brushSize, 64),
            height: Math.min(brushSize, 64),
            backgroundColor: color,
            opacity: opacity
          }}
        />
      </div>

      {/* Size Slider */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Size</div>
        <div style={styles.sliderContainer}>
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => onSizeChange(parseInt(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.sliderValue}>{brushSize}px</span>
        </div>
      </div>

      {/* Size Presets */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Quick Sizes</div>
        <div style={styles.presetsGrid}>
          {presetSizes.map((size) => (
            <SizePresetButton
              key={size}
              size={size}
              label={BRUSH_SIZE_LABELS[size] || `${size}`}
              isActive={brushSize === size}
              onClick={onSizeChange}
              color={color}
            />
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Opacity</div>
        <div
          style={{
            ...styles.opacityBar,
            background: `linear-gradient(to right, transparent, ${color})`
          }}
        >
          {/* Checkerboard background for transparency */}
          <div
            style={{
              ...styles.opacityGradient,
              backgroundImage: `
                linear-gradient(45deg, #333 25%, transparent 25%),
                linear-gradient(-45deg, #333 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #333 75%),
                linear-gradient(-45deg, transparent 75%, #333 75%)
              `,
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              zIndex: 0
            }}
          />
          <div
            style={{
              ...styles.opacityGradient,
              background: `linear-gradient(to right, transparent, ${color})`,
              zIndex: 1
            }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(opacity * 100)}
            onChange={(e) => onOpacityChange(parseInt(e.target.value) / 100)}
            style={styles.opacitySlider}
          />
        </div>
        <div style={styles.infoRow}>
          <span>0%</span>
          <span>{Math.round(opacity * 100)}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default BrushPanel;