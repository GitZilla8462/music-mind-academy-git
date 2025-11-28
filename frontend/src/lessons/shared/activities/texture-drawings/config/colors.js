/**
 * colors.js - Comprehensive Color System
 * 
 * Features:
 * - 50+ preset colors organized by category
 * - Gradient presets
 * - Pattern definitions
 * - Color utility functions
 */

// ============================================================================
// COLOR PALETTES
// ============================================================================

export const COLOR_PALETTES = {
  // Vibrant colors - bold and bright
  vibrant: [
    '#FF3B30', '#FF6B35', '#FF9500', '#FFCC00', '#FFEB3B',
    '#CDDC39', '#8BC34A', '#4CAF50', '#009688', '#00BCD4',
    '#03A9F4', '#2196F3', '#3F51B5', '#673AB7', '#9C27B0',
    '#E91E63', '#F44336', '#FF5722', '#795548', '#607D8B'
  ],
  
  // Pastel colors - soft and gentle
  pastel: [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
    '#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8', '#FFDFD3',
    '#B5EAD7', '#C7CEEA', '#FF9AA2', '#FFB7B2', '#FFDAC1',
    '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F0E6EF', '#E8DFF5'
  ],
  
  // Neon colors - glowing and electric
  neon: [
    '#FF0080', '#FF00FF', '#8000FF', '#0040FF', '#00FFFF',
    '#00FF80', '#00FF00', '#80FF00', '#FFFF00', '#FF8000',
    '#FF073A', '#39FF14', '#00FFEF', '#FF10F0', '#DFFF00',
    '#FF3131', '#5EFF31', '#31FFFF', '#FF31FF', '#FFFF31'
  ],
  
  // Earth tones - natural and warm
  earth: [
    '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2B48C',
    '#BC8F8F', '#F4A460', '#DAA520', '#B8860B', '#CD5C5C',
    '#8FBC8F', '#556B2F', '#6B8E23', '#808000', '#9ACD32',
    '#2E8B57', '#3CB371', '#20B2AA', '#5F9EA0', '#4682B4'
  ],
  
  // Grayscale - neutral tones
  grayscale: [
    '#FFFFFF', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD',
    '#9E9E9E', '#757575', '#616161', '#424242', '#212121',
    '#000000', '#FAFAFA', '#F0F0F0', '#D9D9D9', '#C0C0C0',
    '#A8A8A8', '#909090', '#787878', '#606060', '#484848'
  ],
  
  // Music themed - inspired by instruments and sound
  music: [
    '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', // Purple (strings)
    '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', // Amber (brass)
    '#10B981', '#059669', '#047857', '#065F46', '#064E3B', // Emerald (woodwinds)
    '#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'  // Pink (percussion)
  ],
  
  // Rainbow spectrum
  rainbow: [
    '#FF0000', '#FF4000', '#FF8000', '#FFBF00', '#FFFF00',
    '#BFFF00', '#80FF00', '#40FF00', '#00FF00', '#00FF40',
    '#00FF80', '#00FFBF', '#00FFFF', '#00BFFF', '#0080FF',
    '#0040FF', '#0000FF', '#4000FF', '#8000FF', '#BF00FF'
  ]
};

// Quick access palette (shown by default)
export const QUICK_PALETTE = [
  // Row 1 - Primary colors + variations
  '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE',
  '#30B0C7', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
  // Row 2 - Lighter versions
  '#FF6961', '#FFB347', '#FDFD96', '#77DD77', '#40E0D0',
  '#89CFF0', '#6495ED', '#9370DB', '#DA70D6', '#FF69B4',
  // Row 3 - Darker versions  
  '#8B0000', '#CC5500', '#B8860B', '#228B22', '#008B8B',
  '#00008B', '#191970', '#4B0082', '#800080', '#C71585',
  // Row 4 - Neutrals
  '#FFFFFF', '#E5E5E5', '#CCCCCC', '#808080', '#333333',
  '#000000', '#F5DEB3', '#D2691E', '#8B4513', '#2F1810'
];

// ============================================================================
// GRADIENTS
// ============================================================================

export const GRADIENT_PRESETS = [
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#FF512F', '#F09819'],
    direction: 'to right'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#2193b0', '#6dd5ed'],
    direction: 'to right'
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#134E5E', '#71B280'],
    direction: 'to right'
  },
  {
    id: 'fire',
    name: 'Fire',
    colors: ['#f12711', '#f5af19'],
    direction: 'to top'
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    colors: ['#7028e4', '#e5b2ca'],
    direction: 'to right'
  },
  {
    id: 'cool-blues',
    name: 'Cool Blues',
    colors: ['#2193b0', '#6dd5ed'],
    direction: 'to bottom'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    colors: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff'],
    direction: 'to right'
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    colors: ['#43cea2', '#185a9d'],
    direction: '45deg'
  },
  {
    id: 'candy',
    name: 'Candy',
    colors: ['#D4145A', '#FBB03B'],
    direction: 'to right'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: ['#232526', '#414345'],
    direction: 'to bottom'
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    colors: ['#00F260', '#0575E6'],
    direction: 'to right'
  },
  {
    id: 'warm-flame',
    name: 'Warm Flame',
    colors: ['#ff9a9e', '#fecfef'],
    direction: 'to right'
  }
];

// ============================================================================
// PATTERNS (for fill)
// ============================================================================

export const PATTERN_PRESETS = [
  {
    id: 'horizontal-lines',
    name: 'Horizontal Lines',
    type: 'lines',
    direction: 'horizontal',
    spacing: 8,
    thickness: 2
  },
  {
    id: 'vertical-lines',
    name: 'Vertical Lines',
    type: 'lines',
    direction: 'vertical',
    spacing: 8,
    thickness: 2
  },
  {
    id: 'diagonal-lines',
    name: 'Diagonal Lines',
    type: 'lines',
    direction: 'diagonal',
    spacing: 10,
    thickness: 2
  },
  {
    id: 'dots',
    name: 'Polka Dots',
    type: 'dots',
    spacing: 12,
    radius: 3
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    type: 'checkerboard',
    size: 10
  },
  {
    id: 'crosshatch',
    name: 'Crosshatch',
    type: 'crosshatch',
    spacing: 8,
    thickness: 1
  },
  {
    id: 'waves',
    name: 'Sound Waves',
    type: 'waves',
    amplitude: 5,
    frequency: 0.1
  },
  {
    id: 'music-staff',
    name: 'Music Staff',
    type: 'staff',
    lineSpacing: 6
  }
];

// ============================================================================
// COLOR UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert hex color to RGB object
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Convert hex to RGBA string
 */
export const hexToRgba = (hex, alpha = 1) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

/**
 * Convert HSL to RGB
 */
export const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4))
  };
};

/**
 * Convert RGB to HSL
 */
export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

/**
 * Lighten a color by percentage
 */
export const lightenColor = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const amount = Math.round(2.55 * percent);
  return rgbToHex(
    Math.min(255, rgb.r + amount),
    Math.min(255, rgb.g + amount),
    Math.min(255, rgb.b + amount)
  );
};

/**
 * Darken a color by percentage
 */
export const darkenColor = (hex, percent) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const amount = Math.round(2.55 * percent);
  return rgbToHex(
    Math.max(0, rgb.r - amount),
    Math.max(0, rgb.g - amount),
    Math.max(0, rgb.b - amount)
  );
};

/**
 * Get contrasting text color (black or white) for a background
 */
export const getContrastColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Blend two colors together
 */
export const blendColors = (color1, color2, ratio = 0.5) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;
  
  return rgbToHex(
    Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio),
    Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio),
    Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)
  );
};

/**
 * Generate a gradient CSS string
 */
export const generateGradientCSS = (colors, direction = 'to right') => {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
};

/**
 * Create a canvas gradient
 */
export const createCanvasGradient = (ctx, x1, y1, x2, y2, colors) => {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  return gradient;
};

// Default export
export default {
  palettes: COLOR_PALETTES,
  quick: QUICK_PALETTE,
  gradients: GRADIENT_PRESETS,
  patterns: PATTERN_PRESETS
};