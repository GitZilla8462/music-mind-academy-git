/**
 * ShapeEngine.js - Geometric Shape Drawing System
 * 
 * Implements:
 * - Basic shapes (line, rect, circle, ellipse, triangle)
 * - Advanced shapes (star, heart, polygon, arrow)
 * - Special shapes (wave, spiral, speech bubble, lightning)
 * - Shape styling (fill, stroke, gradient, shadow)
 */

import { TOOL_TYPES } from '../config/tools.js';

// ============================================================================
// SHAPE ENGINE CLASS
// ============================================================================

export class ShapeEngine {
  constructor(ctx) {
    this.ctx = ctx;
  }

  // ==========================================================================
  // MAIN DRAWING METHOD
  // ==========================================================================

  /**
   * Draw a shape from start to end point
   */
  drawShape(type, startX, startY, endX, endY, options = {}) {
    const {
      strokeColor = '#FFFFFF',
      fillColor = null,
      strokeWidth = 2,
      opacity = 1,
      filled = true,
      shadowed = false,
      gradient = null,
      cornerRadius = 0,
      sides = 6,
      points = 5,
      innerRadius = 0.4
    } = options;

    // Calculate dimensions
    const width = endX - startX;
    const height = endY - startY;
    const centerX = startX + width / 2;
    const centerY = startY + height / 2;

    // Set styles
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Set fill (solid or gradient)
    if (gradient) {
      this.ctx.fillStyle = this.createGradient(startX, startY, endX, endY, gradient);
    } else if (fillColor) {
      this.ctx.fillStyle = fillColor;
    }

    // Add shadow if enabled
    if (shadowed) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    }

    // Draw the shape
    this.ctx.beginPath();

    switch (type) {
      case TOOL_TYPES.LINE:
        this.drawLine(startX, startY, endX, endY);
        break;
      case TOOL_TYPES.ARROW:
        this.drawArrow(startX, startY, endX, endY, options);
        break;
      case TOOL_TYPES.RECT:
        this.drawRect(startX, startY, width, height);
        break;
      case TOOL_TYPES.ROUNDED_RECT:
        this.drawRoundedRect(startX, startY, width, height, cornerRadius);
        break;
      case TOOL_TYPES.CIRCLE:
        this.drawCircle(centerX, centerY, Math.min(Math.abs(width), Math.abs(height)) / 2);
        break;
      case TOOL_TYPES.ELLIPSE:
        this.drawEllipse(centerX, centerY, Math.abs(width) / 2, Math.abs(height) / 2);
        break;
      case TOOL_TYPES.TRIANGLE:
        this.drawTriangle(startX, startY, width, height);
        break;
      case TOOL_TYPES.POLYGON:
        this.drawPolygon(centerX, centerY, Math.min(Math.abs(width), Math.abs(height)) / 2, sides);
        break;
      case TOOL_TYPES.STAR:
        this.drawStar(centerX, centerY, Math.min(Math.abs(width), Math.abs(height)) / 2, points, innerRadius);
        break;
      case TOOL_TYPES.HEART:
        this.drawHeart(centerX, centerY, Math.min(Math.abs(width), Math.abs(height)) / 2);
        break;
      case TOOL_TYPES.LIGHTNING:
        this.drawLightning(startX, startY, endX, endY);
        break;
      case TOOL_TYPES.SPEECH_BUBBLE:
        this.drawSpeechBubble(startX, startY, width, height, options);
        break;
      case TOOL_TYPES.WAVE:
        this.drawWave(startX, startY, endX, endY, options);
        break;
      case TOOL_TYPES.SPIRAL:
        this.drawSpiral(centerX, centerY, Math.min(Math.abs(width), Math.abs(height)) / 2, options);
        break;
      default:
        this.drawRect(startX, startY, width, height);
    }

    // Apply fill and stroke
    if (filled && fillColor) {
      this.ctx.fill();
    }
    if (strokeWidth > 0) {
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // ==========================================================================
  // BASIC SHAPES
  // ==========================================================================

  drawLine(x1, y1, x2, y2) {
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
  }

  drawRect(x, y, width, height) {
    this.ctx.rect(x, y, width, height);
  }

  drawRoundedRect(x, y, width, height, radius) {
    const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
    
    // Handle negative dimensions
    const left = width > 0 ? x : x + width;
    const top = height > 0 ? y : y + height;
    const w = Math.abs(width);
    const h = Math.abs(height);

    this.ctx.moveTo(left + r, top);
    this.ctx.lineTo(left + w - r, top);
    this.ctx.quadraticCurveTo(left + w, top, left + w, top + r);
    this.ctx.lineTo(left + w, top + h - r);
    this.ctx.quadraticCurveTo(left + w, top + h, left + w - r, top + h);
    this.ctx.lineTo(left + r, top + h);
    this.ctx.quadraticCurveTo(left, top + h, left, top + h - r);
    this.ctx.lineTo(left, top + r);
    this.ctx.quadraticCurveTo(left, top, left + r, top);
    this.ctx.closePath();
  }

  drawCircle(cx, cy, radius) {
    this.ctx.arc(cx, cy, Math.abs(radius), 0, Math.PI * 2);
    this.ctx.closePath();
  }

  drawEllipse(cx, cy, radiusX, radiusY) {
    this.ctx.ellipse(cx, cy, Math.abs(radiusX), Math.abs(radiusY), 0, 0, Math.PI * 2);
    this.ctx.closePath();
  }

  drawTriangle(x, y, width, height) {
    this.ctx.moveTo(x + width / 2, y);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.lineTo(x, y + height);
    this.ctx.closePath();
  }

  // ==========================================================================
  // ADVANCED SHAPES
  // ==========================================================================

  drawPolygon(cx, cy, radius, sides) {
    const angle = (Math.PI * 2) / sides;
    
    this.ctx.moveTo(cx + radius * Math.cos(-Math.PI / 2), cy + radius * Math.sin(-Math.PI / 2));
    
    for (let i = 1; i <= sides; i++) {
      const a = angle * i - Math.PI / 2;
      this.ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
    }
    
    this.ctx.closePath();
  }

  drawStar(cx, cy, outerRadius, points, innerRadiusRatio = 0.4) {
    const innerRadius = outerRadius * innerRadiusRatio;
    const step = Math.PI / points;
    let rotation = -Math.PI / 2;

    this.ctx.moveTo(cx + outerRadius * Math.cos(rotation), cy + outerRadius * Math.sin(rotation));

    for (let i = 0; i < points; i++) {
      // Outer point
      rotation += step;
      this.ctx.lineTo(cx + innerRadius * Math.cos(rotation), cy + innerRadius * Math.sin(rotation));
      
      // Inner point
      rotation += step;
      this.ctx.lineTo(cx + outerRadius * Math.cos(rotation), cy + outerRadius * Math.sin(rotation));
    }

    this.ctx.closePath();
  }

  drawHeart(cx, cy, size) {
    const width = size * 2;
    const height = size * 2;
    const topCurveHeight = height * 0.3;

    this.ctx.moveTo(cx, cy + height * 0.35);

    // Left curve
    this.ctx.bezierCurveTo(
      cx - width / 2, cy,
      cx - width / 2, cy - topCurveHeight,
      cx, cy - topCurveHeight * 0.5
    );

    // Right curve
    this.ctx.bezierCurveTo(
      cx + width / 2, cy - topCurveHeight,
      cx + width / 2, cy,
      cx, cy + height * 0.35
    );

    this.ctx.closePath();
  }

  drawArrow(x1, y1, x2, y2, options = {}) {
    const headSize = options.headSize || 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Draw line
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);

    // Draw arrowhead
    this.ctx.lineTo(
      x2 - headSize * Math.cos(angle - Math.PI / 6),
      y2 - headSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headSize * Math.cos(angle + Math.PI / 6),
      y2 - headSize * Math.sin(angle + Math.PI / 6)
    );
  }

  drawLightning(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    const segments = 5;
    const jitter = length * 0.15;

    this.ctx.moveTo(x1, y1);

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + dx * t + (Math.random() - 0.5) * jitter;
      const y = y1 + dy * t;
      this.ctx.lineTo(x, y);
    }

    this.ctx.lineTo(x2, y2);
  }

  drawSpeechBubble(x, y, width, height, options = {}) {
    const radius = Math.min(15, Math.abs(width) / 4, Math.abs(height) / 4);
    const tailSize = Math.abs(height) * 0.2;
    const tailPosition = options.tailPosition || 'bottom-left';

    // Main bubble (rounded rect)
    const bubbleHeight = Math.abs(height) - tailSize;
    
    this.drawRoundedRect(x, y, width, bubbleHeight, radius);

    // Tail
    const tailX = x + Math.abs(width) * 0.2;
    const tailY = y + bubbleHeight;

    this.ctx.moveTo(tailX, tailY);
    this.ctx.lineTo(tailX - 10, tailY + tailSize);
    this.ctx.lineTo(tailX + 20, tailY);
  }

  drawWave(x1, y1, x2, y2, options = {}) {
    const amplitude = options.amplitude || 20;
    const frequency = options.frequency || 0.05;
    const length = x2 - x1;
    const steps = Math.abs(length);

    this.ctx.moveTo(x1, y1);

    for (let i = 0; i <= steps; i++) {
      const x = x1 + i;
      const y = y1 + Math.sin(i * frequency) * amplitude;
      this.ctx.lineTo(x, y);
    }
  }

  drawSpiral(cx, cy, maxRadius, options = {}) {
    const turns = options.turns || 3;
    const spacing = options.spacing || maxRadius / (turns * 10);
    const steps = turns * 100;

    this.ctx.moveTo(cx, cy);

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * turns * Math.PI * 2;
      const radius = (i / steps) * maxRadius;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      this.ctx.lineTo(x, y);
    }
  }

  // ==========================================================================
  // GRADIENT HELPERS
  // ==========================================================================

  createGradient(x1, y1, x2, y2, gradientConfig) {
    const { type = 'linear', colors } = gradientConfig;

    let gradient;
    if (type === 'radial') {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const radius = Math.hypot(x2 - x1, y2 - y1) / 2;
      gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    } else {
      gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    }

    if (Array.isArray(colors)) {
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });
    }

    return gradient;
  }

  // ==========================================================================
  // PREVIEW (for shape preview while dragging)
  // ==========================================================================

  drawPreview(type, startX, startY, endX, endY, options = {}) {
    // Draw with dashed stroke for preview
    this.ctx.save();
    this.ctx.setLineDash([5, 5]);
    this.ctx.globalAlpha = 0.6;
    
    this.drawShape(type, startX, startY, endX, endY, {
      ...options,
      filled: false,
      shadowed: false
    });
    
    this.ctx.restore();
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

export const createShapeEngine = (ctx) => {
  return new ShapeEngine(ctx);
};

export default ShapeEngine;