/**
 * BrushEngine.js - Advanced Brush Rendering System
 * 
 * Implements multiple brush types:
 * - Standard brushes (brush, pencil, marker)
 * - Effect brushes (spray, airbrush, neon)
 * - Textured brushes (crayon, chalk, watercolor)
 * - Special brushes (calligraphy)
 */

import { TOOL_TYPES, getToolById } from '../config/tools.js';

// ============================================================================
// BRUSH ENGINE CLASS
// ============================================================================

export class BrushEngine {
  constructor(ctx) {
    this.ctx = ctx;
    this.lastPoint = null;
    this.points = [];
    this.velocity = { x: 0, y: 0 };
  }

  // ==========================================================================
  // MAIN DRAWING METHOD
  // ==========================================================================

  /**
   * Draw a stroke segment from one point to another
   */
  drawStroke(fromX, fromY, toX, toY, options = {}) {
    const {
      tool = TOOL_TYPES.BRUSH,
      color = '#FFFFFF',
      size = 8,
      opacity = 1,
      pressure = 1
    } = options;

    // Calculate velocity for pressure simulation
    this.updateVelocity(fromX, fromY, toX, toY);
    
    // Get tool settings
    const toolConfig = getToolById(tool);
    const settings = { ...toolConfig?.settings, ...options };

    // Set base styles
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalAlpha = opacity * (settings.opacity || 1);

    // Route to appropriate brush renderer
    switch (tool) {
      case TOOL_TYPES.BRUSH:
        this.drawBrush(fromX, fromY, toX, toY, size, settings);
        break;
      case TOOL_TYPES.PENCIL:
        this.drawPencil(fromX, fromY, toX, toY, size, settings);
        break;
      case TOOL_TYPES.MARKER:
        this.drawMarker(fromX, fromY, toX, toY, size, settings);
        break;
      case TOOL_TYPES.HIGHLIGHTER:
        this.drawHighlighter(fromX, fromY, toX, toY, size, color, settings);
        break;
      case TOOL_TYPES.SPRAY:
        this.drawSpray(toX, toY, size, settings);
        break;
      case TOOL_TYPES.AIRBRUSH:
        this.drawAirbrush(toX, toY, size, settings);
        break;
      case TOOL_TYPES.CRAYON:
        this.drawCrayon(fromX, fromY, toX, toY, size, settings);
        break;
      case TOOL_TYPES.CHALK:
        this.drawChalk(fromX, fromY, toX, toY, size, settings);
        break;
      case TOOL_TYPES.NEON:
        this.drawNeon(fromX, fromY, toX, toY, size, color, settings);
        break;
      case TOOL_TYPES.CALLIGRAPHY:
        this.drawCalligraphy(fromX, fromY, toX, toY, size, settings);
        break;
      case TOOL_TYPES.WATERCOLOR:
        this.drawWatercolor(fromX, fromY, toX, toY, size, color, settings);
        break;
      default:
        this.drawBrush(fromX, fromY, toX, toY, size, settings);
    }

    // Reset alpha
    this.ctx.globalAlpha = 1;
    
    // Store last point
    this.lastPoint = { x: toX, y: toY };
  }

  /**
   * Start a new stroke
   */
  beginStroke(x, y) {
    this.lastPoint = { x, y };
    this.points = [{ x, y, time: Date.now() }];
    this.velocity = { x: 0, y: 0 };
  }

  /**
   * End current stroke
   */
  endStroke() {
    this.lastPoint = null;
    this.points = [];
    this.velocity = { x: 0, y: 0 };
  }

  // ==========================================================================
  // BRUSH RENDERERS
  // ==========================================================================

  /**
   * Standard smooth brush
   */
  drawBrush(fromX, fromY, toX, toY, size, settings) {
    this.ctx.lineWidth = size;
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  }

  /**
   * Pencil with slight texture
   */
  drawPencil(fromX, fromY, toX, toY, size, settings) {
    const adjustedSize = Math.max(1, size * 0.7);
    this.ctx.lineWidth = adjustedSize;
    
    // Main line
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    
    // Add texture points
    if (settings.texture === 'grain') {
      const dist = Math.hypot(toX - fromX, toY - fromY);
      const steps = Math.floor(dist / 3);
      
      for (let i = 0; i < steps; i++) {
        if (Math.random() > 0.7) {
          const t = i / steps;
          const x = fromX + (toX - fromX) * t + (Math.random() - 0.5) * size;
          const y = fromY + (toY - fromY) * t + (Math.random() - 0.5) * size;
          this.ctx.globalAlpha = Math.random() * 0.3;
          this.ctx.beginPath();
          this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.globalAlpha = settings.opacity || 0.9;
    }
  }

  /**
   * Wide semi-transparent marker
   */
  drawMarker(fromX, fromY, toX, toY, size, settings) {
    const width = size * (settings.widthMultiplier || 1.5);
    this.ctx.lineWidth = width;
    this.ctx.globalAlpha = settings.opacity || 0.7;
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  }

  /**
   * Highlighter with multiply blend
   */
  drawHighlighter(fromX, fromY, toX, toY, size, color, settings) {
    const width = size * (settings.widthMultiplier || 2);
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.globalAlpha = settings.opacity || 0.4;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'square';
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  /**
   * Spray paint with particles
   */
  drawSpray(x, y, size, settings) {
    const density = settings.density || 30;
    const spread = size * (settings.spread || 1.5);
    const particleSize = settings.particleSize || 1;
    
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      
      // Vary opacity based on distance from center
      const distRatio = radius / spread;
      this.ctx.globalAlpha = (1 - distRatio) * (settings.opacity || 0.3);
      
      this.ctx.beginPath();
      this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Soft airbrush with gradual buildup
   */
  drawAirbrush(x, y, size, settings) {
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, this.ctx.fillStyle);
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.save();
    this.ctx.globalAlpha = settings.opacity || 0.1;
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Crayon with waxy texture
   */
  drawCrayon(fromX, fromY, toX, toY, size, settings) {
    const roughness = settings.roughness || 0.6;
    
    // Draw multiple offset lines for texture
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * size * roughness;
      const offsetY = (Math.random() - 0.5) * size * roughness;
      
      this.ctx.globalAlpha = (settings.opacity || 0.85) * (0.5 + Math.random() * 0.5);
      this.ctx.lineWidth = size * (0.7 + Math.random() * 0.3);
      
      this.ctx.beginPath();
      this.ctx.moveTo(fromX + offsetX, fromY + offsetY);
      this.ctx.lineTo(toX + offsetX, toY + offsetY);
      this.ctx.stroke();
    }
    
    // Add texture dots
    const dist = Math.hypot(toX - fromX, toY - fromY);
    const dots = Math.floor(dist * roughness);
    
    for (let i = 0; i < dots; i++) {
      const t = Math.random();
      const x = fromX + (toX - fromX) * t + (Math.random() - 0.5) * size;
      const y = fromY + (toY - fromY) * t + (Math.random() - 0.5) * size;
      
      this.ctx.globalAlpha = Math.random() * 0.5;
      this.ctx.beginPath();
      this.ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Chalk with dusty texture
   */
  drawChalk(fromX, fromY, toX, toY, size, settings) {
    const roughness = settings.roughness || 0.8;
    
    // Draw scattered particles along the line
    const dist = Math.hypot(toX - fromX, toY - fromY);
    const particles = Math.floor(dist * 2);
    
    for (let i = 0; i < particles; i++) {
      const t = i / particles;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      
      // Scatter particles around the line
      for (let j = 0; j < 5; j++) {
        const offsetX = (Math.random() - 0.5) * size * roughness;
        const offsetY = (Math.random() - 0.5) * size * roughness;
        
        this.ctx.globalAlpha = Math.random() * (settings.opacity || 0.7);
        this.ctx.beginPath();
        this.ctx.arc(x + offsetX, y + offsetY, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  /**
   * Neon glow effect
   */
  drawNeon(fromX, fromY, toX, toY, size, color, settings) {
    const glowSize = settings.glowSize || 10;
    const glowIntensity = settings.glowIntensity || 0.5;
    
    // Draw outer glow layers
    for (let i = glowSize; i > 0; i -= 2) {
      this.ctx.lineWidth = size + i * 2;
      this.ctx.globalAlpha = glowIntensity * (1 - i / glowSize) * 0.3;
      
      this.ctx.beginPath();
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(toX, toY);
      this.ctx.stroke();
    }
    
    // Draw bright core
    this.ctx.lineWidth = size;
    this.ctx.globalAlpha = 1;
    this.ctx.strokeStyle = '#FFFFFF';
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    
    // Restore color
    this.ctx.strokeStyle = color;
  }

  /**
   * Calligraphy with angle-sensitive width
   */
  drawCalligraphy(fromX, fromY, toX, toY, size, settings) {
    const angle = (settings.angle || 45) * Math.PI / 180;
    const variation = settings.widthVariation || 0.7;
    
    // Calculate stroke direction
    const dx = toX - fromX;
    const dy = toY - fromY;
    const strokeAngle = Math.atan2(dy, dx);
    
    // Width varies based on angle difference
    const angleDiff = Math.abs(Math.sin(strokeAngle - angle));
    const width = size * (1 - variation + variation * angleDiff);
    
    this.ctx.lineWidth = Math.max(1, width);
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
  }

  /**
   * Watercolor with wet edges
   */
  drawWatercolor(fromX, fromY, toX, toY, size, color, settings) {
    const wetness = settings.wetness || 0.7;
    
    // Parse color for manipulation
    const rgb = this.hexToRgb(color);
    if (!rgb) return;
    
    // Draw multiple translucent layers
    for (let i = 0; i < 3; i++) {
      const layerSize = size * (1 + i * wetness * 0.3);
      const layerOpacity = (settings.opacity || 0.6) / (i + 1);
      
      this.ctx.globalAlpha = layerOpacity;
      this.ctx.lineWidth = layerSize;
      
      // Slight color variation
      const variation = 20;
      const r = Math.min(255, Math.max(0, rgb.r + (Math.random() - 0.5) * variation));
      const g = Math.min(255, Math.max(0, rgb.g + (Math.random() - 0.5) * variation));
      const b = Math.min(255, Math.max(0, rgb.b + (Math.random() - 0.5) * variation));
      this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      
      this.ctx.beginPath();
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(toX, toY);
      this.ctx.stroke();
    }
    
    // Edge bleeding effect
    if (settings.edgeBleed) {
      const bleedSize = size * wetness;
      const bleedOpacity = (settings.opacity || 0.6) * 0.2;
      
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * bleedSize;
        const x = toX + Math.cos(angle) * dist;
        const y = toY + Math.sin(angle) * dist;
        
        this.ctx.globalAlpha = bleedOpacity * Math.random();
        this.ctx.beginPath();
        this.ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // Restore
    this.ctx.strokeStyle = color;
  }

  // ==========================================================================
  // ERASER
  // ==========================================================================

  /**
   * Erase to background or transparent
   */
  drawEraser(fromX, fromY, toX, toY, size, backgroundColor = null) {
    this.ctx.save();
    
    if (backgroundColor) {
      // Erase to color
      this.ctx.strokeStyle = backgroundColor;
      this.ctx.lineWidth = size;
      this.ctx.lineCap = 'round';
      
      this.ctx.beginPath();
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(toX, toY);
      this.ctx.stroke();
    } else {
      // Erase to transparent
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = size;
      this.ctx.lineCap = 'round';
      
      this.ctx.beginPath();
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(toX, toY);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Update velocity for pressure simulation
   */
  updateVelocity(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    this.velocity = { x: dx, y: dy };
  }

  /**
   * Get simulated pressure based on velocity
   */
  getSimulatedPressure() {
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    // Faster = lighter pressure
    return Math.max(0.2, 1 - Math.min(speed / 50, 0.8));
  }

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Set context
   */
  setContext(ctx) {
    this.ctx = ctx;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const createBrushEngine = (ctx) => {
  return new BrushEngine(ctx);
};

export default BrushEngine;