/**
 * colors.js - Complete Color Configuration
 * 
 * Exports:
 * - QUICK_PALETTE: 10 quick-access colors
 * - FULL_PALETTE: 7 shades × 8 color families
 * - COLOR_PALETTES: Themed palettes (vibrant, pastel, neon, earth, music, rainbow)
 * - GRADIENT_PRESETS: Pre-defined gradients
 * - Color utility functions (hexToRgb, rgbToHex, hslToRgb, rgbToHsl)
 */

// ============================================================================
// QUICK PALETTE - 10 most-used colors
// ============================================================================

export const QUICK_PALETTE = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#FF8C00', // Orange
  '#FFD700', // Yellow/Gold
  '#00FF00', // Green
  '#00BFFF', // Sky Blue
  '#0000FF', // Blue
  '#8B00FF', // Purple
  '#FF1493', // Pink
];

// ============================================================================
// FULL PALETTE - 7 shades × 8 color families (56 colors)
// ============================================================================

export const FULL_PALETTE = {
  red: ['#fee2e2', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d'],
  orange: ['#ffedd5', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#7c2d12'],
  yellow: ['#fef9c3', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#713f12'],
  green: ['#dcfce7', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d'],
  cyan: ['#cffafe', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#164e63'],
  blue: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e3a8a'],
  purple: ['#f3e8ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#581c87'],
  gray: ['#f9fafb', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#1f2937'],
};

// ============================================================================
// THEMED PALETTES
// ============================================================================

export const COLOR_PALETTES = {
  // Quick access (same as QUICK_PALETTE)
  quick: QUICK_PALETTE,
  
  // Vibrant/Saturated colors
  vibrant: [
    '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#ADFF2F',
    '#00FF00', '#00FA9A', '#00FFFF', '#1E90FF', '#0000FF',
    '#8A2BE2', '#FF00FF', '#FF1493', '#DC143C', '#FF69B4'
  ],
  
  // Soft/Pastel colors
  pastel: [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
    '#E0BBE4', '#FEC8D8', '#FFDFD3', '#D4F0F0', '#CCE2CB',
    '#B6CFB6', '#97C1A9', '#FCB9AA', '#FFDBCC', '#ECEAE4'
  ],
  
  // Neon/Electric colors
  neon: [
    '#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000',
    '#FF1493', '#00FF7F', '#FF4500', '#7FFF00', '#FF6EC7',
    '#39FF14', '#DFFF00', '#FF073A', '#0FF0FC', '#BC13FE'
  ],
  
  // Earth tones
  earth: [
    '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2B48C',
    '#BC8F8F', '#F4A460', '#DAA520', '#B8860B', '#556B2F',
    '#6B8E23', '#808000', '#BDB76B', '#F0E68C', '#EEE8AA'
  ],
  
  // Grayscale
  grayscale: [
    '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
    '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6',
    '#f2f2f2', '#ffffff', '#d9d9d9', '#bfbfbf', '#a6a6a6'
  ],
  
  // Music-themed (instrument colors)
  music: [
    '#8B4513', '#CD853F', '#FFD700', '#C0C0C0', '#2F4F4F',
    '#800000', '#000080', '#4B0082', '#FF4500', '#228B22',
    '#DC143C', '#4169E1', '#9932CC', '#FF8C00', '#00CED1'
  ],
  
  // Rainbow
  rainbow: [
    '#FF0000', '#FF4000', '#FF8000', '#FFBF00', '#FFFF00',
    '#BFFF00', '#80FF00', '#40FF00', '#00FF00', '#00FF40',
    '#00FF80', '#00FFBF', '#00FFFF', '#00BFFF', '#0080FF',
    '#0040FF', '#0000FF', '#4000FF', '#8000FF', '#BF00FF',
    '#FF00FF', '#FF00BF', '#FF0080', '#FF0040'
  ],
  
  // Full palette flattened (all 56 colors)
  full: Object.values(FULL_PALETTE).flat(),
  
  // All colors combined
  all: [
    ...QUICK_PALETTE,
    ...Object.values(FULL_PALETTE).flat()
  ]
};

// ============================================================================
// GRADIENT PRESETS
// ============================================================================

export const GRADIENT_PRESETS = [
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#FF512F', '#F09819'],
    direction: '135deg'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#2193b0', '#6dd5ed'],
    direction: '135deg'
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    colors: ['#7028e4', '#e5b2ca'],
    direction: '135deg'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    colors: ['#11998e', '#38ef7d'],
    direction: '135deg'
  },
  {
    id: 'fire',
    name: 'Fire',
    colors: ['#f12711', '#f5af19'],
    direction: '135deg'
  },
  {
    id: 'royal',
    name: 'Royal',
    colors: ['#141E30', '#243B55'],
    direction: '135deg'
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    colors: ['#ff9a9e', '#fecfef'],
    direction: '135deg'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: ['#232526', '#414345'],
    direction: '135deg'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    colors: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0000ff', '#8000ff'],
    direction: '90deg'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    colors: ['#00c6ff', '#0072ff', '#7209b7'],
    direction: '135deg'
  },
  {
    id: 'peach',
    name: 'Peach',
    colors: ['#ed4264', '#ffedbc'],
    direction: '135deg'
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#134e5e', '#71b280'],
    direction: '135deg'
  }
];

// ============================================================================
// COLOR UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color string (e.g., '#FF0000')
 * @returns {object|null} RGB object {r, g, b} or null if invalid
 */
export function hexToRgb(hex) {
  if (!hex) return null;
  
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit hex
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  if (fullHex.length !== 6) return null;
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB values to hex color string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string (e.g., '#FF0000')
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {object} HSL object {h, s, l} where h is 0-360, s and l are 0-100
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {object} RGB object {r, g, b}
 */
export function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Get contrasting text color (black or white) for a background
 * @param {string} hexColor - Background hex color
 * @returns {string} '#000000' or '#FFFFFF'
 */
export function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Lighten or darken a color
 * @param {string} hex - Hex color string
 * @param {number} amount - Amount to adjust (-100 to 100)
 * @returns {string} Adjusted hex color
 */
export function adjustColor(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (value) => Math.max(0, Math.min(255, value + amount));
  
  return rgbToHex(
    adjust(rgb.r),
    adjust(rgb.g),
    adjust(rgb.b)
  );
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  QUICK_PALETTE,
  FULL_PALETTE,
  COLOR_PALETTES,
  GRADIENT_PRESETS,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  getContrastColor,
  adjustColor
};