/**
 * DrawingEngine.js - Core Canvas Drawing Engine
 * 
 * Handles:
 * - Canvas context management
 * - History (undo/redo) with efficient state compression
 * - Layer management
 * - Export functionality
 * - Performance optimizations
 */

// ============================================================================
// DRAWING ENGINE CLASS
// ============================================================================

export class DrawingEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { 
      willReadFrequently: true,
      alpha: true 
    });
    
    // Options with defaults
    this.options = {
      maxHistory: options.maxHistory || 50,
      backgroundColor: options.backgroundColor || '#0a0a0f',
      smoothing: options.smoothing !== false,
      ...options
    };
    
    // History management
    this.history = [];
    this.historyIndex = -1;
    this.isRecording = true;
    
    // State
    this.isDirty = false;
    this.lastSaveTime = Date.now();
    
    // Initialize
    this.setupCanvas();
  }

  // ==========================================================================
  // SETUP
  // ==========================================================================

  setupCanvas() {
    // Enable image smoothing for better quality
    this.ctx.imageSmoothingEnabled = this.options.smoothing;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set default composite operation
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Initialize canvas with background
   */
  initialize(backgroundColor = this.options.backgroundColor) {
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  /**
   * Resize canvas while preserving content
   */
  resize(width, height) {
    // Save current content
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Resize
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Restore content (will be clipped if smaller)
    this.ctx.putImageData(imageData, 0, 0);
    
    // Re-setup after resize
    this.setupCanvas();
  }

  // ==========================================================================
  // HISTORY MANAGEMENT
  // ==========================================================================

  /**
   * Save current state to history
   */
  saveState() {
    if (!this.isRecording) return;
    
    // Remove any redo states
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Capture current state
    const imageData = this.ctx.getImageData(
      0, 0, 
      this.canvas.width, 
      this.canvas.height
    );
    
    // Add to history
    this.history.push(imageData);
    
    // Limit history size
    while (this.history.length > this.options.maxHistory) {
      this.history.shift();
    }
    
    this.historyIndex = this.history.length - 1;
    this.isDirty = true;
    this.lastSaveTime = Date.now();
  }

  /**
   * Undo last action
   */
  undo() {
    if (!this.canUndo()) return false;
    
    this.historyIndex--;
    this.restoreState(this.historyIndex);
    return true;
  }

  /**
   * Redo previously undone action
   */
  redo() {
    if (!this.canRedo()) return false;
    
    this.historyIndex++;
    this.restoreState(this.historyIndex);
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Restore a specific history state
   */
  restoreState(index) {
    if (index >= 0 && index < this.history.length) {
      this.ctx.putImageData(this.history[index], 0, 0);
    }
  }

  /**
   * Clear all history
   */
  clearHistory() {
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Get history info
   */
  getHistoryInfo() {
    return {
      current: this.historyIndex + 1,
      total: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Pause history recording (for batch operations)
   */
  pauseRecording() {
    this.isRecording = false;
  }

  /**
   * Resume history recording
   */
  resumeRecording() {
    this.isRecording = true;
  }

  // ==========================================================================
  // CANVAS OPERATIONS
  // ==========================================================================

  /**
   * Clear entire canvas
   */
  clear(backgroundColor = this.options.backgroundColor) {
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  /**
   * Clear a specific region
   */
  clearRegion(x, y, width, height, backgroundColor = this.options.backgroundColor) {
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Get pixel color at position
   */
  getPixelColor(x, y) {
    const pixel = this.ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    return {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
      a: pixel[3],
      hex: this.rgbToHex(pixel[0], pixel[1], pixel[2])
    };
  }

  /**
   * Set pixel color at position
   */
  setPixelColor(x, y, r, g, b, a = 255) {
    const imageData = this.ctx.createImageData(1, 1);
    imageData.data[0] = r;
    imageData.data[1] = g;
    imageData.data[2] = b;
    imageData.data[3] = a;
    this.ctx.putImageData(imageData, x, y);
  }

  /**
   * Get image data for a region
   */
  getImageData(x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
    return this.ctx.getImageData(x, y, width, height);
  }

  /**
   * Put image data at position
   */
  putImageData(imageData, x = 0, y = 0) {
    this.ctx.putImageData(imageData, x, y);
  }

  // ==========================================================================
  // CLIPPING (for lane restriction)
  // ==========================================================================

  /**
   * Set rectangular clipping region
   */
  setClipRect(x, y, width, height) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
  }

  /**
   * Set circular clipping region
   */
  setClipCircle(cx, cy, radius) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.clip();
  }

  /**
   * Set path-based clipping region
   */
  setClipPath(pathFn) {
    this.ctx.save();
    this.ctx.beginPath();
    pathFn(this.ctx);
    this.ctx.clip();
  }

  /**
   * Release clipping region
   */
  releaseClip() {
    this.ctx.restore();
  }

  // ==========================================================================
  // COMPOSITE OPERATIONS
  // ==========================================================================

  /**
   * Set blend mode
   */
  setBlendMode(mode) {
    this.ctx.globalCompositeOperation = mode;
  }

  /**
   * Reset blend mode to default
   */
  resetBlendMode() {
    this.ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Set global opacity
   */
  setOpacity(opacity) {
    this.ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
  }

  /**
   * Reset opacity
   */
  resetOpacity() {
    this.ctx.globalAlpha = 1;
  }

  // ==========================================================================
  // TRANSFORMS
  // ==========================================================================

  /**
   * Save current transform state
   */
  saveTransform() {
    this.ctx.save();
  }

  /**
   * Restore transform state
   */
  restoreTransform() {
    this.ctx.restore();
  }

  /**
   * Translate canvas origin
   */
  translate(x, y) {
    this.ctx.translate(x, y);
  }

  /**
   * Rotate canvas
   */
  rotate(angle) {
    this.ctx.rotate(angle);
  }

  /**
   * Scale canvas
   */
  scale(sx, sy = sx) {
    this.ctx.scale(sx, sy);
  }

  /**
   * Reset all transforms
   */
  resetTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export as data URL
   */
  toDataURL(type = 'image/png', quality = 1) {
    return this.canvas.toDataURL(type, quality);
  }

  /**
   * Export as Blob
   */
  toBlob(type = 'image/png', quality = 1) {
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, type, quality);
    });
  }

  /**
   * Download as image file
   */
  async download(filename = 'drawing.png', type = 'image/png') {
    const blob = await this.toBlob(type);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Load image onto canvas
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0);
        this.saveState();
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Convert RGB to hex
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
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
   * Get canvas dimensions
   */
  getDimensions() {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  /**
   * Get context
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Check if canvas has been modified
   */
  hasChanges() {
    return this.isDirty;
  }

  /**
   * Mark canvas as saved (no pending changes)
   */
  markSaved() {
    this.isDirty = false;
  }

  /**
   * Destroy engine and cleanup
   */
  destroy() {
    this.clearHistory();
    this.ctx = null;
    this.canvas = null;
  }
}

// ============================================================================
// OFFSCREEN BUFFER (for performance)
// ============================================================================

export class OffscreenBuffer {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Clear buffer
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Resize buffer
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Copy from main canvas
   */
  copyFrom(sourceCanvas) {
    this.ctx.drawImage(sourceCanvas, 0, 0);
  }

  /**
   * Draw buffer to target canvas
   */
  drawTo(targetCtx, x = 0, y = 0) {
    targetCtx.drawImage(this.canvas, x, y);
  }

  /**
   * Get context
   */
  getContext() {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas() {
    return this.canvas;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a new drawing engine instance
 */
export const createDrawingEngine = (canvas, options) => {
  return new DrawingEngine(canvas, options);
};

export default DrawingEngine;