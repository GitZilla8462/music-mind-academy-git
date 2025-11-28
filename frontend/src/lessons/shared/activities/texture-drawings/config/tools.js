/**
 * tools.js - Tool Configuration
 * 
 * Defines all available drawing tools, their icons, and groupings.
 * SIMPLIFIED: Brushes, eraser, fill, and stickers only. No shapes.
 */

// ============================================================================
// TOOL TYPE CONSTANTS
// ============================================================================

export const TOOL_TYPES = {
  // Brush tools
  BRUSH: 'brush',
  PENCIL: 'pencil',
  MARKER: 'marker',
  ERASER: 'eraser',
  
  // Utility tools
  FILL: 'fill',
  
  // Special
  STICKER: 'sticker'
};

// ============================================================================
// BRUSH SIZES
// ============================================================================

export const BRUSH_SIZES = {
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 16,
  XLARGE: 24
};

// ============================================================================
// TOOL DEFINITIONS
// ============================================================================

export const BRUSH_TOOLS = [
  {
    id: TOOL_TYPES.BRUSH,
    name: 'Brush',
    icon: '🖌️',
    description: 'Smooth brush for drawing'
  },
  {
    id: TOOL_TYPES.PENCIL,
    name: 'Pencil',
    icon: '✏️',
    description: 'Sharp pencil for fine lines'
  },
  {
    id: TOOL_TYPES.MARKER,
    name: 'Marker',
    icon: '🖍️',
    description: 'Thick marker for bold strokes'
  }
];

// Utility tools
export const UTILITY_TOOLS = [
  {
    id: TOOL_TYPES.ERASER,
    name: 'Eraser',
    icon: '🧽',
    description: 'Erase your drawings'
  },
  {
    id: TOOL_TYPES.FILL,
    name: 'Fill',
    icon: '🪣',
    description: 'Fill areas with color'
  }
];

// ============================================================================
// TOOL GROUPS
// ============================================================================

export const TOOL_GROUPS = {
  draw: {
    id: 'draw',
    name: 'Drawing Tools',
    icon: '🖌️',
    tools: [TOOL_TYPES.BRUSH, TOOL_TYPES.PENCIL, TOOL_TYPES.MARKER]
  },
  utility: {
    id: 'utility',
    name: 'Utility Tools',
    icon: '🛠️',
    tools: [TOOL_TYPES.ERASER, TOOL_TYPES.FILL]
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a tool is a shape tool - always false (shapes removed)
 */
export const isShapeTool = (toolId) => {
  return false;
};

/**
 * Check if a tool is a brush-style tool (continuous drawing)
 */
export const isBrushTool = (toolId) => {
  return [TOOL_TYPES.BRUSH, TOOL_TYPES.PENCIL, TOOL_TYPES.MARKER].includes(toolId);
};

/**
 * Get tool info by ID
 */
export const getToolById = (toolId) => {
  return [...BRUSH_TOOLS, ...UTILITY_TOOLS].find(t => t.id === toolId);
};

// ============================================================================
// STICKER CONFIGURATION
// ============================================================================

export const STICKER_CATEGORIES = [
  {
    id: 'music',
    name: 'Music',
    icon: '🎵',
    stickers: ['🎵', '🎶', '🎼', '🎹', '🎸', '🎺', '🎷', '🥁', '🎻', '🪕', '🎤', '🎧', '🔊', '🔉', '🔈', '📯']
  },
  {
    id: 'expression',
    name: 'Expressions',
    icon: '😀',
    stickers: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤨', '😐', '😑', '😶', '😏', '🙄', '😬', '😌', '😔', '😴', '🤠', '🥳', '😎', '🤓', '🧐']
  },
  {
    id: 'shapes',
    name: 'Shapes',
    icon: '⭐',
    stickers: ['⭐', '🌟', '✨', '💫', '⚡', '🔥', '💥', '💨', '🌈', '☀️', '🌙', '⭕', '❌', '❓', '❗', '💯', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🔲', '🔳']
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    stickers: ['🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌺', '🌻', '🌼', '🌷', '🌹', '🥀', '💐', '🌸', '💮', '🏵️', '🌱', '🪴', '🎋', '🎍']
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🐾',
    stickers: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔']
  },
  {
    id: 'hands',
    name: 'Hands',
    icon: '👋',
    stickers: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪']
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '💡',
    stickers: ['💡', '🔦', '🕯️', '📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀', '🎥', '📷', '📹', '📼', '🔍', '🔎', '🔬', '🔭', '📡', '🚪', '🛏️', '🛋️', '🪑', '🧴', '🧷', '🧹', '🧺', '🧼', '🪥', '🧽', '🧯', '🛒']
  }
];

// Flatten all stickers into a single array
export const ALL_STICKERS = STICKER_CATEGORIES.flatMap(cat => cat.stickers);