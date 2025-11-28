/**
 * ColorPanel.jsx - Comprehensive Color Selection Panel
 * 
 * Features:
 * - Quick color palette
 * - Multiple themed palettes
 * - HSL color picker
 * - Recent colors
 * - Opacity slider
 * - Eyedropper integration
 * 
 * FIXED: Added defensive checks for all callback props
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { QUICK_PALETTE, COLOR_PALETTES, GRADIENT_PRESETS, hexToRgb, rgbToHex, hslToRgb, rgbToHsl } from '../../config/colors.js';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  panel: {
    position: 'absolute',
    left: '60px',
    top: '0',
    width: '280px',
    backgroundColor: '#1a1a22',
    border: '1px solid #2a2a35',
    borderRadius: '12px',
    padding: '12px',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    maxHeight: '500px',
    overflowY: 'auto'
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
  currentColor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  colorPreview: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    border: '2px solid #3a3a45',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
  },
  colorInfo: {
    flex: 1
  },
  hexInput: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#0a0a0f',
    border: '1px solid #2a2a35',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  paletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '3px'
  },
  colorSwatch: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.1s ease',
    outline: 'none'
  },
  colorSwatchSelected: {
    transform: 'scale(1.2)',
    boxShadow: '0 0 0 2px #fff',
    zIndex: 1,
    position: 'relative'
  },
  paletteTabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  paletteTab: {
    padding: '4px 8px',
    fontSize: '11px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#2a2a35',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  paletteTabActive: {
    backgroundColor: '#3b82f6',
    color: '#fff'
  },
  sliderContainer: {
    marginBottom: '12px'
  },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#888',
    marginBottom: '4px'
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    appearance: 'none',
    background: '#2a2a35',
    outline: 'none',
    cursor: 'pointer'
  },
  hueSlider: {
    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
  },
  saturationSlider: {
    // Will be set dynamically
  },
  lightnessSlider: {
    // Will be set dynamically
  },
  opacitySlider: {
    background: 'linear-gradient(to right, transparent, #fff)'
  },
  recentColors: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap'
  },
  recentSwatch: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid #2a2a35',
    cursor: 'pointer'
  },
  gradientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px'
  },
  gradientSwatch: {
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.1s ease'
  },
  eyedropperButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '8px',
    border: '1px dashed #3a3a45',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#888',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};

// ============================================================================
// COLOR SWATCH COMPONENT
// ============================================================================

const ColorSwatch = ({ color, isSelected, onClick, size = 'normal' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const swatchStyle = {
    ...styles.colorSwatch,
    backgroundColor: color,
    ...(isSelected ? styles.colorSwatchSelected : {}),
    ...(isHovered && !isSelected ? { transform: 'scale(1.1)' } : {})
  };

  if (size === 'small') {
    swatchStyle.width = '24px';
    swatchStyle.height = '24px';
  }

  // FIXED: Defensive check for onClick
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick(color);
    }
  };

  return (
    <button
      style={swatchStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={color}
    />
  );
};

// ============================================================================
// HSL SLIDERS COMPONENT
// ============================================================================

const HSLSliders = ({ color, onChange }) => {
  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 100, l: 50 };

  // FIXED: Defensive check for onChange in all handlers
  const handleHueChange = (e) => {
    if (typeof onChange !== 'function') return;
    const newRgb = hslToRgb(parseInt(e.target.value), hsl.s, hsl.l);
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleSatChange = (e) => {
    if (typeof onChange !== 'function') return;
    const newRgb = hslToRgb(hsl.h, parseInt(e.target.value), hsl.l);
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleLightChange = (e) => {
    if (typeof onChange !== 'function') return;
    const newRgb = hslToRgb(hsl.h, hsl.s, parseInt(e.target.value));
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div>
      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Hue</span>
          <span>{hsl.h}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={hsl.h}
          onChange={handleHueChange}
          style={{ ...styles.slider, ...styles.hueSlider }}
        />
      </div>

      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Saturation</span>
          <span>{hsl.s}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={hsl.s}
          onChange={handleSatChange}
          style={{
            ...styles.slider,
            background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`
          }}
        />
      </div>

      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Lightness</span>
          <span>{hsl.l}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={hsl.l}
          onChange={handleLightChange}
          style={{
            ...styles.slider,
            background: `linear-gradient(to right, #000, hsl(${hsl.h}, ${hsl.s}%, 50%), #fff)`
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COLOR PANEL COMPONENT
// ============================================================================

const ColorPanel = ({
  currentColor = '#FFFFFF',
  onColorChange,
  opacity = 1,
  onOpacityChange,
  recentColors = [],
  onClose,
  onEyedropper
}) => {
  const [activePalette, setActivePalette] = useState('quick');
  const [hexInput, setHexInput] = useState(currentColor);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update hex input when color changes externally
  useEffect(() => {
    setHexInput(currentColor);
  }, [currentColor]);

  // FIXED: Safe color change handler
  const safeColorChange = useCallback((newColor) => {
    if (typeof onColorChange === 'function') {
      onColorChange(newColor);
    }
  }, [onColorChange]);

  // Handle hex input change
  const handleHexChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
    
    // Validate and apply
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      safeColorChange(value);
    }
  };

  // Handle hex input blur
  const handleHexBlur = () => {
    // Reset to current color if invalid
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(currentColor);
    }
  };

  // FIXED: Safe close handler
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // FIXED: Safe eyedropper handler
  const handleEyedropper = () => {
    if (typeof onEyedropper === 'function') {
      onEyedropper();
    }
  };

  // FIXED: Safe opacity change handler
  const handleOpacityChange = (e) => {
    if (typeof onOpacityChange === 'function') {
      onOpacityChange(parseInt(e.target.value) / 100);
    }
  };

  // Get colors for active palette
  const getPaletteColors = () => {
    switch (activePalette) {
      case 'quick':
        return QUICK_PALETTE;
      case 'vibrant':
        return COLOR_PALETTES.vibrant;
      case 'pastel':
        return COLOR_PALETTES.pastel;
      case 'neon':
        return COLOR_PALETTES.neon;
      case 'earth':
        return COLOR_PALETTES.earth;
      case 'grayscale':
        return COLOR_PALETTES.grayscale;
      case 'music':
        return COLOR_PALETTES.music;
      case 'rainbow':
        return COLOR_PALETTES.rainbow;
      default:
        return QUICK_PALETTE;
    }
  };

  return (
    <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Colors</span>
        <button style={styles.closeButton} onClick={handleClose}>✕</button>
      </div>

      {/* Current Color Preview */}
      <div style={styles.currentColor}>
        <div style={{ ...styles.colorPreview, backgroundColor: currentColor }} />
        <div style={styles.colorInfo}>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            onBlur={handleHexBlur}
            style={styles.hexInput}
            placeholder="#FFFFFF"
          />
        </div>
      </div>

      {/* Eyedropper */}
      {onEyedropper && (
        <button style={styles.eyedropperButton} onClick={handleEyedropper}>
          👉 Pick color from canvas
        </button>
      )}

      {/* Opacity Slider */}
      {onOpacityChange && (
        <div style={{ ...styles.section, marginTop: '12px' }}>
          <div style={styles.sliderLabel}>
            <span>Opacity</span>
            <span>{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity * 100}
            onChange={handleOpacityChange}
            style={{
              ...styles.slider,
              background: `linear-gradient(to right, transparent, ${currentColor})`
            }}
          />
        </div>
      )}

      {/* Palette Tabs */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Palettes</div>
        <div style={styles.paletteTabs}>
          {['quick', 'vibrant', 'pastel', 'neon', 'earth', 'music', 'rainbow'].map((palette) => (
            <button
              key={palette}
              style={{
                ...styles.paletteTab,
                ...(activePalette === palette ? styles.paletteTabActive : {})
              }}
              onClick={() => setActivePalette(palette)}
            >
              {palette.charAt(0).toUpperCase() + palette.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Palette Grid */}
        <div style={styles.paletteGrid}>
          {getPaletteColors().map((color, index) => (
            <ColorSwatch
              key={`${color}-${index}`}
              color={color}
              isSelected={currentColor === color}
              onClick={safeColorChange}
            />
          ))}
        </div>
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Recent</div>
          <div style={styles.recentColors}>
            {recentColors.slice(0, 10).map((color, index) => (
              <button
                key={`recent-${index}`}
                style={{ ...styles.recentSwatch, backgroundColor: color }}
                onClick={() => safeColorChange(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Advanced HSL Sliders (collapsible) */}
      <div style={styles.section}>
        <button
          style={{
            ...styles.paletteTab,
            width: '100%',
            marginBottom: '8px'
          }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Color Picker
        </button>
        
        {showAdvanced && (
          <HSLSliders color={currentColor} onChange={safeColorChange} />
        )}
      </div>

      {/* Gradient Presets */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Gradients (for shapes)</div>
        <div style={styles.gradientGrid}>
          {GRADIENT_PRESETS.slice(0, 8).map((gradient) => (
            <button
              key={gradient.id}
              style={{
                ...styles.gradientSwatch,
                background: `linear-gradient(${gradient.direction}, ${gradient.colors.join(', ')})`
              }}
              onClick={() => {
                // Select first color from gradient
                safeColorChange(gradient.colors[0]);
              }}
              title={gradient.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPanel;