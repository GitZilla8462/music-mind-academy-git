/**
 * RightToolbar.jsx - Drawing Tools Sidebar (Right Side)
 * 
 * Tools (in order):
 * - HAND (move/rotate) - DEFAULT
 * - Brush
 * - Pencil  
 * - Eraser
 * 
 * Plus: Size presets, colors
 */

import React, { useState } from 'react';
import { TOOL_TYPES } from '../../config/tools.js';
import { QUICK_PALETTE } from '../../config/colors.js';

// ============================================================================
// TOOL BUTTON
// ============================================================================

const ToolButton = ({ icon, name, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        backgroundColor: isActive ? '#3b82f6' : isHovered ? '#e5e7eb' : 'transparent',
        color: isActive ? '#ffffff' : '#4b5563',
        boxShadow: isActive ? '0 2px 8px rgba(59, 130, 246, 0.4)' : 'none'
      }}
      title={name}
    >
      {icon}
    </button>
  );
};

// ============================================================================
// SIZE BUTTON
// ============================================================================

const SizeButton = ({ size, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const dotSize = Math.min(size, 26);

  return (
    <button
      onClick={() => onClick(size)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        backgroundColor: isActive ? '#e5e7eb' : isHovered ? '#f3f4f6' : 'transparent'
      }}
      title={`${size}px`}
    >
      <div
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: isActive ? '#3b82f6' : '#6b7280'
        }}
      />
    </button>
  );
};

// ============================================================================
// COLOR SWATCH
// ============================================================================

const ColorSwatch = ({ color, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(color)}
      style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
        backgroundColor: color,
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
        transform: isSelected ? 'scale(1.15)' : 'scale(1)'
      }}
      title={color}
    />
  );
};

// ============================================================================
// MAIN TOOLBAR
// ============================================================================

const RightToolbar = ({
  activeTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  color,
  onColorChange,
  onOpenColorPanel
}) => {
  const brushSizes = [4, 8, 16, 24, 32];

  // Tools - HAND is first (default)
  const tools = [
    { id: TOOL_TYPES.HAND || 'hand', icon: '✋', name: 'Move & Rotate' },
    { id: TOOL_TYPES.BRUSH, icon: '🖌️', name: 'Brush' },
    { id: TOOL_TYPES.PENCIL, icon: '✏️', name: 'Pencil' },
    { id: TOOL_TYPES.ERASER, icon: '⬜', name: 'Eraser' },
  ];

  const quickColors = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  return (
    <div style={{
      width: '60px',
      backgroundColor: '#f8fafc',
      borderLeft: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 8px',
      gap: '4px',
      flexShrink: 0,
      overflowY: 'auto'
    }}>

      {/* Tools */}
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          name={tool.name}
          isActive={activeTool === tool.id}
          onClick={() => onToolChange(tool.id)}
        />
      ))}

      {/* Divider */}
      <div style={{ width: '36px', height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />

      {/* Size Label */}
      <span style={{
        fontSize: '10px',
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Size
      </span>

      {/* Size Buttons */}
      {brushSizes.map((size) => (
        <SizeButton
          key={size}
          size={size}
          isActive={brushSize === size}
          onClick={onBrushSizeChange}
        />
      ))}

      {/* Divider */}
      <div style={{ width: '36px', height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0' }} />

      {/* Current Color - Click for full panel */}
      <button
        onClick={onOpenColorPanel}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: '3px solid #e2e8f0',
          backgroundColor: activeTool === (TOOL_TYPES.ERASER) ? '#e5e7eb' : color,
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}
        title="Open Color Palette"
      />

      {/* Quick Colors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '4px',
        marginTop: '8px'
      }}>
        {quickColors.map((c) => (
          <ColorSwatch
            key={c}
            color={c}
            isSelected={color === c}
            onClick={onColorChange}
          />
        ))}
      </div>

      {/* Size indicator at bottom */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '12px',
        textAlign: 'center'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: '#9ca3af'
        }}>
          {brushSize}px
        </span>
      </div>
    </div>
  );
};

export default RightToolbar;