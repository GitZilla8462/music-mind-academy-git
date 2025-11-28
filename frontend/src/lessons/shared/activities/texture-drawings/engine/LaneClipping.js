/**
 * LaneClipping.js - Lane Boundary Enforcement System
 * 
 * Manages the instrument lanes for the texture drawing activity:
 * - Calculates lane boundaries based on canvas size and instrument count
 * - Enforces clipping so drawing stays within lanes
 * - Provides visual feedback for active lane
 * - Handles lane selection and highlighting
 */

// ============================================================================
// LANE MANAGER CLASS
// ============================================================================

export class LaneManager {
  constructor(canvas, ctx, instruments = []) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.instruments = instruments;
    this.activeLane = null;
    this.isClipping = false;
    
    // Calculate lane dimensions
    this.recalculate();
  }

  // ==========================================================================
  // SETUP & CALCULATION
  // ==========================================================================

  /**
   * Set instruments and recalculate lanes
   */
  setInstruments(instruments) {
    this.instruments = instruments;
    this.recalculate();
  }

  /**
   * Recalculate lane dimensions
   */
  recalculate() {
    this.laneCount = this.instruments.length;
    this.laneHeight = this.laneCount > 0 
      ? this.canvas.height / this.laneCount 
      : this.canvas.height;
    
    // Pre-calculate lane bounds
    this.lanes = this.instruments.map((instrument, index) => ({
      index,
      instrument,
      top: index * this.laneHeight,
      bottom: (index + 1) * this.laneHeight,
      height: this.laneHeight,
      color: instrument.color
    }));
  }

  /**
   * Update canvas reference (after resize)
   */
  updateCanvas(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.recalculate();
  }

  // ==========================================================================
  // LANE DETECTION
  // ==========================================================================

  /**
   * Get lane index at a Y position
   */
  getLaneIndexAtY(y) {
    if (this.laneCount === 0) return null;
    
    const index = Math.floor(y / this.laneHeight);
    
    // Ensure within bounds
    if (index < 0 || index >= this.laneCount) return null;
    
    return index;
  }

  /**
   * Get lane object at a Y position
   */
  getLaneAtY(y) {
    const index = this.getLaneIndexAtY(y);
    return index !== null ? this.lanes[index] : null;
  }

  /**
   * Get lane by index
   */
  getLaneByIndex(index) {
    return this.lanes[index] || null;
  }

  /**
   * Get lane bounds by index
   */
  getLaneBounds(index) {
    const lane = this.lanes[index];
    if (!lane) return null;
    
    return {
      x: 0,
      y: lane.top,
      width: this.canvas.width,
      height: lane.height,
      top: lane.top,
      bottom: lane.bottom
    };
  }

  /**
   * Check if a point is within a specific lane
   */
  isPointInLane(x, y, laneIndex) {
    const lane = this.lanes[laneIndex];
    if (!lane) return false;
    
    return y >= lane.top && y < lane.bottom && x >= 0 && x < this.canvas.width;
  }

  // ==========================================================================
  // CLIPPING CONTROL
  // ==========================================================================

  /**
   * Begin clipping to a specific lane
   */
  beginClip(laneIndex) {
    const lane = this.lanes[laneIndex];
    if (!lane) return false;
    
    this.ctx.save();
    this.ctx.beginPath();
    
    // Add small padding to avoid edge artifacts
    const padding = 1;
    this.ctx.rect(
      0, 
      lane.top + padding, 
      this.canvas.width, 
      lane.height - (padding * 2)
    );
    this.ctx.clip();
    
    this.isClipping = true;
    this.activeLane = laneIndex;
    
    return true;
  }

  /**
   * End clipping and restore context
   */
  endClip() {
    if (this.isClipping) {
      this.ctx.restore();
      this.isClipping = false;
    }
  }

  /**
   * Set active lane (for visual feedback)
   */
  setActiveLane(laneIndex) {
    this.activeLane = laneIndex;
  }

  /**
   * Clear active lane
   */
  clearActiveLane() {
    this.activeLane = null;
  }

  // ==========================================================================
  // DRAWING HELPERS
  // ==========================================================================

  /**
   * Draw lane backgrounds - clean white with light grey dividers
   * Students will add color through their drawings
   */
  drawLaneBackgrounds(backgroundColor = '#ffffff') {
    // Fill base background - white canvas
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw each lane with light grey divider line
    this.lanes.forEach((lane, index) => {
      // Lane divider line - light grey
      if (index < this.laneCount - 1) {
        this.ctx.strokeStyle = '#e5e7eb'; // grey-200
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, lane.bottom);
        this.ctx.lineTo(this.canvas.width, lane.bottom);
        this.ctx.stroke();
      }
    });
  }

  /**
   * Draw lane labels on the side
   */
  drawLaneLabels(options = {}) {
    const {
      showEmoji = true,
      showName = true,
      labelWidth = 100,
      fontSize = 12,
      padding = 8
    } = options;
    
    this.lanes.forEach((lane) => {
      const centerY = lane.top + lane.height / 2;
      
      // Label background
      this.ctx.fillStyle = this.hexToRgba(lane.color, 0.85);
      this.ctx.beginPath();
      this.roundRect(padding, lane.top + padding, labelWidth - padding * 2, lane.height - padding * 2, 6);
      this.ctx.fill();
      
      // Label text
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      
      let text = '';
      if (showEmoji) text += lane.instrument.emoji + ' ';
      if (showName) text += lane.instrument.name;
      
      this.ctx.fillText(text, padding * 2, centerY);
    });
  }

  /**
   * Highlight active lane - subtle light blue tint
   */
  highlightActiveLane(opacity = 0.15) {
    if (this.activeLane === null) return;
    
    const lane = this.lanes[this.activeLane];
    if (!lane) return;
    
    // Subtle blue highlight for active lane
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.08)'; // blue-500 very light
    this.ctx.fillRect(0, lane.top, this.canvas.width, lane.height);
    
    // Light blue border
    this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'; // blue-500
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, lane.top, this.canvas.width, lane.height);
  }

  /**
   * Get background color for erasing within a lane
   * Returns white for clean canvas
   */
  getLaneBackgroundForErase(laneIndex, y) {
    return '#ffffff'; // White background
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Convert hex to RGBA
   */
  hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${alpha})`;
    
    return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
  }

  /**
   * Draw rounded rectangle helper
   */
  roundRect(x, y, width, height, radius) {
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * Get all lane info
   */
  getAllLanes() {
    return this.lanes;
  }

  /**
   * Get lane count
   */
  getLaneCount() {
    return this.laneCount;
  }

  /**
   * Get lane height
   */
  getLaneHeight() {
    return this.laneHeight;
  }

  /**
   * Get active lane index
   */
  getActiveLaneIndex() {
    return this.activeLane;
  }

  /**
   * Check if currently clipping
   */
  isCurrentlyClipping() {
    return this.isClipping;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const createLaneManager = (canvas, ctx, instruments) => {
  return new LaneManager(canvas, ctx, instruments);
};

export default LaneManager;