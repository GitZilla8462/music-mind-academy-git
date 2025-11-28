/**
 * FillEngine.js - Fill Algorithms
 * 
 * Implements:
 * - Flood fill (paint bucket)
 * - Pattern fill
 * - Gradient fill
 * - Tolerance-based filling
 */

import { hexToRgb } from '../config/colors.js';

// ============================================================================
// FILL ENGINE CLASS
// ============================================================================

export class FillEngine {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  // ==========================================================================
  // FLOOD FILL (PAINT BUCKET)
  // ==========================================================================

  /**
   * Flood fill starting from a point
   */
  floodFill(startX, startY, fillColor, options = {}) {
    const {
      tolerance = 32,
      contiguous = true,
      maxPixels = 500000
    } = options;

    const x = Math.floor(startX);
    const y = Math.floor(startY);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Get starting pixel color
    const startIndex = (y * width + x) * 4;
    const startColor = {
      r: data[startIndex],
      g: data[startIndex + 1],
      b: data[startIndex + 2],
      a: data[startIndex + 3]
    };

    // Parse fill color
    const fill = hexToRgb(fillColor);
    if (!fill) return false;

    // Don't fill if clicking on same color
    if (this.colorsMatch(startColor, { ...fill, a: 255 }, 5)) {
      return false;
    }

    if (contiguous) {
      // Scanline flood fill (more efficient)
      this.scanlineFill(data, width, height, x, y, startColor, fill, tolerance, maxPixels);
    } else {
      // Global color replacement
      this.globalReplace(data, width, height, startColor, fill, tolerance);
    }

    // Put modified data back
    this.ctx.putImageData(imageData, 0, 0);
    return true;
  }

  /**
   * Scanline flood fill algorithm (efficient)
   */
  scanlineFill(data, width, height, startX, startY, targetColor, fillColor, tolerance, maxPixels) {
    const stack = [[startX, startY]];
    const visited = new Set();
    let pixelCount = 0;

    while (stack.length > 0 && pixelCount < maxPixels) {
      const [x, y] = stack.pop();
      
      // Skip if out of bounds
      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      const index = (y * width + x) * 4;
      const currentColor = {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3]
      };

      // Check if color matches target
      if (!this.colorsMatch(currentColor, targetColor, tolerance)) continue;

      // Mark as visited
      visited.add(key);
      pixelCount++;

      // Fill this pixel
      data[index] = fillColor.r;
      data[index + 1] = fillColor.g;
      data[index + 2] = fillColor.b;
      data[index + 3] = 255;

      // Add neighbors (4-connected)
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }

    return pixelCount;
  }

  /**
   * Global color replacement (non-contiguous)
   */
  globalReplace(data, width, height, targetColor, fillColor, tolerance) {
    for (let i = 0; i < data.length; i += 4) {
      const currentColor = {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3]
      };

      if (this.colorsMatch(currentColor, targetColor, tolerance)) {
        data[i] = fillColor.r;
        data[i + 1] = fillColor.g;
        data[i + 2] = fillColor.b;
        data[i + 3] = 255;
      }
    }
  }

  /**
   * Check if two colors match within tolerance
   */
  colorsMatch(color1, color2, tolerance) {
    return (
      Math.abs(color1.r - color2.r) <= tolerance &&
      Math.abs(color1.g - color2.g) <= tolerance &&
      Math.abs(color1.b - color2.b) <= tolerance
    );
  }

  // ==========================================================================
  // PATTERN FILL
  // ==========================================================================

  /**
   * Create a pattern and fill an area
   */
  patternFill(startX, startY, patternConfig, options = {}) {
    const { tolerance = 32 } = options;
    
    // Create pattern
    const pattern = this.createPattern(patternConfig);
    if (!pattern) return false;

    // Get the region to fill
    const region = this.getContiguousRegion(startX, startY, tolerance);
    if (region.length === 0) return false;

    // Apply pattern to region
    this.ctx.save();
    this.ctx.fillStyle = pattern;

    // Create a path from the region and fill it
    this.ctx.beginPath();
    // This is simplified - in production you'd trace the boundary
    region.forEach(([x, y]) => {
      this.ctx.rect(x, y, 1, 1);
    });
    this.ctx.fill();
    this.ctx.restore();

    return true;
  }

  /**
   * Create a canvas pattern from config
   */
  createPattern(config) {
    const { type, color = '#000000', spacing = 10, thickness = 2 } = config;

    // Create offscreen canvas for pattern
    const patternCanvas = document.createElement('canvas');
    const patternCtx = patternCanvas.getContext('2d');

    switch (type) {
      case 'horizontal-lines':
        patternCanvas.width = 10;
        patternCanvas.height = spacing;
        patternCtx.strokeStyle = color;
        patternCtx.lineWidth = thickness;
        patternCtx.beginPath();
        patternCtx.moveTo(0, spacing / 2);
        patternCtx.lineTo(10, spacing / 2);
        patternCtx.stroke();
        break;

      case 'vertical-lines':
        patternCanvas.width = spacing;
        patternCanvas.height = 10;
        patternCtx.strokeStyle = color;
        patternCtx.lineWidth = thickness;
        patternCtx.beginPath();
        patternCtx.moveTo(spacing / 2, 0);
        patternCtx.lineTo(spacing / 2, 10);
        patternCtx.stroke();
        break;

      case 'diagonal-lines':
        patternCanvas.width = spacing;
        patternCanvas.height = spacing;
        patternCtx.strokeStyle = color;
        patternCtx.lineWidth = thickness;
        patternCtx.beginPath();
        patternCtx.moveTo(0, spacing);
        patternCtx.lineTo(spacing, 0);
        patternCtx.stroke();
        break;

      case 'dots':
        const radius = config.radius || 2;
        patternCanvas.width = spacing;
        patternCanvas.height = spacing;
        patternCtx.fillStyle = color;
        patternCtx.beginPath();
        patternCtx.arc(spacing / 2, spacing / 2, radius, 0, Math.PI * 2);
        patternCtx.fill();
        break;

      case 'checkerboard':
        const size = config.size || 10;
        patternCanvas.width = size * 2;
        patternCanvas.height = size * 2;
        patternCtx.fillStyle = color;
        patternCtx.fillRect(0, 0, size, size);
        patternCtx.fillRect(size, size, size, size);
        break;

      case 'crosshatch':
        patternCanvas.width = spacing;
        patternCanvas.height = spacing;
        patternCtx.strokeStyle = color;
        patternCtx.lineWidth = thickness;
        // Diagonal lines both ways
        patternCtx.beginPath();
        patternCtx.moveTo(0, spacing);
        patternCtx.lineTo(spacing, 0);
        patternCtx.moveTo(0, 0);
        patternCtx.lineTo(spacing, spacing);
        patternCtx.stroke();
        break;

      case 'waves':
        const amplitude = config.amplitude || 5;
        patternCanvas.width = 40;
        patternCanvas.height = amplitude * 2 + 4;
        patternCtx.strokeStyle = color;
        patternCtx.lineWidth = thickness;
        patternCtx.beginPath();
        for (let x = 0; x <= 40; x++) {
          const y = amplitude + Math.sin(x * 0.3) * amplitude;
          if (x === 0) {
            patternCtx.moveTo(x, y);
          } else {
            patternCtx.lineTo(x, y);
          }
        }
        patternCtx.stroke();
        break;

      case 'staff':
        const lineSpacing = config.lineSpacing || 6;
        patternCanvas.width = 10;
        patternCanvas.height = lineSpacing * 5;
        patternCtx.strokeStyle = color;
        patternCtx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          patternCtx.beginPath();
          patternCtx.moveTo(0, i * lineSpacing + lineSpacing / 2);
          patternCtx.lineTo(10, i * lineSpacing + lineSpacing / 2);
          patternCtx.stroke();
        }
        break;

      default:
        return null;
    }

    return this.ctx.createPattern(patternCanvas, 'repeat');
  }

  /**
   * Get contiguous region starting from a point
   */
  getContiguousRegion(startX, startY, tolerance, maxPixels = 100000) {
    const x = Math.floor(startX);
    const y = Math.floor(startY);

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    const startIndex = (y * width + x) * 4;
    const targetColor = {
      r: data[startIndex],
      g: data[startIndex + 1],
      b: data[startIndex + 2],
      a: data[startIndex + 3]
    };

    const region = [];
    const stack = [[x, y]];
    const visited = new Set();

    while (stack.length > 0 && region.length < maxPixels) {
      const [px, py] = stack.pop();

      if (px < 0 || px >= width || py < 0 || py >= height) continue;

      const key = `${px},${py}`;
      if (visited.has(key)) continue;

      const index = (py * width + px) * 4;
      const currentColor = {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3]
      };

      if (!this.colorsMatch(currentColor, targetColor, tolerance)) continue;

      visited.add(key);
      region.push([px, py]);

      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }

    return region;
  }

  // ==========================================================================
  // GRADIENT FILL
  // ==========================================================================

  /**
   * Fill area with gradient
   */
  gradientFill(startX, startY, gradientConfig, options = {}) {
    const {
      x1 = startX - 50,
      y1 = startY - 50,
      x2 = startX + 50,
      y2 = startY + 50,
      colors = ['#FF0000', '#0000FF'],
      type = 'linear'
    } = gradientConfig;

    let gradient;
    if (type === 'radial') {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const radius = Math.hypot(x2 - x1, y2 - y1) / 2;
      gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    } else {
      gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    }

    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });

    // Get region and fill
    const region = this.getContiguousRegion(startX, startY, options.tolerance || 32);
    if (region.length === 0) return false;

    // Create temporary image data
    const tempImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const tempData = tempImageData.data;

    // Draw gradient to temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    const gradientData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

    // Apply gradient only to region
    region.forEach(([x, y]) => {
      const index = (y * this.canvas.width + x) * 4;
      tempData[index] = gradientData[index];
      tempData[index + 1] = gradientData[index + 1];
      tempData[index + 2] = gradientData[index + 2];
      tempData[index + 3] = 255;
    });

    this.ctx.putImageData(tempImageData, 0, 0);
    return true;
  }

  /**
   * Set context and canvas
   */
  setContext(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const createFillEngine = (ctx, canvas) => {
  return new FillEngine(ctx, canvas);
};

export default FillEngine;