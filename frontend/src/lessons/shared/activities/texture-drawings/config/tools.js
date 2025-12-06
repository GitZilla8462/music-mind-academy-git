/**
 * tools.js - Drawing Tool Configuration
 * 
 * HAND tool is DEFAULT - allows selecting, moving, and rotating stickers
 */

export const TOOL_TYPES = {
  HAND: 'hand',        // Select, move, rotate stickers (DEFAULT)
  BRUSH: 'brush',      // Freehand drawing with soft edges
  PENCIL: 'pencil',    // Fine line drawing
  ERASER: 'eraser',    // Remove drawn content
  STICKER: 'sticker',  // Place stickers (auto-enabled when sticker selected)
};

export const TOOL_INFO = {
  [TOOL_TYPES.HAND]: {
    name: 'Move & Rotate',
    icon: '✋',
    cursor: 'default',
    description: 'Select stickers to move or rotate them'
  },
  [TOOL_TYPES.BRUSH]: {
    name: 'Brush',
    icon: '🖌️',
    cursor: 'crosshair',
    description: 'Draw with a soft brush'
  },
  [TOOL_TYPES.PENCIL]: {
    name: 'Pencil',
    icon: '✏️',
    cursor: 'crosshair',
    description: 'Draw fine lines'
  },
  [TOOL_TYPES.ERASER]: {
    name: 'Eraser',
    icon: '⬜',
    cursor: 'cell',
    description: 'Erase drawn content'
  },
  [TOOL_TYPES.STICKER]: {
    name: 'Sticker',
    icon: '🎵',
    cursor: 'copy',
    description: 'Place stickers on the canvas'
  }
};

export const DEFAULT_TOOL = TOOL_TYPES.HAND;

export default {
  TOOL_TYPES,
  TOOL_INFO,
  DEFAULT_TOOL
};