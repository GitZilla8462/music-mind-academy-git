// Global waveform cache - shared across all LoopBlock components
// CHROMEBOOK OPTIMIZED: Prevents duplicate audio decoding when same loop is used multiple times
//
// Example: If "Epic Drums" is placed 5 times on timeline, audio is decoded ONCE, not 5 times

// Cache for completed waveforms
const waveformCache = new Map();

// Track in-progress generations to prevent duplicate work
const pendingGenerations = new Map();

/**
 * Get cached waveform for a file URL
 * @param {string} fileUrl - The audio file URL
 * @returns {number[]|null} - Normalized waveform data or null if not cached
 */
export const getCachedWaveform = (fileUrl) => {
  return waveformCache.get(fileUrl) || null;
};

/**
 * Check if waveform generation is already in progress for this file
 * @param {string} fileUrl - The audio file URL
 * @returns {Promise|null} - Promise if generation in progress, null otherwise
 */
export const getPendingGeneration = (fileUrl) => {
  return pendingGenerations.get(fileUrl) || null;
};

/**
 * Generate and cache waveform for an audio file
 * If generation is already in progress, returns the existing promise
 * @param {string} fileUrl - The audio file URL
 * @param {number} samples - Number of waveform samples (default 100 for Chromebook)
 * @returns {Promise<number[]>} - Normalized waveform data
 */
export const generateWaveform = async (fileUrl, samples = 100) => {
  // Check cache first
  const cached = waveformCache.get(fileUrl);
  if (cached) {
    return cached;
  }

  // Check if generation is already in progress
  const pending = pendingGenerations.get(fileUrl);
  if (pending) {
    return pending;
  }

  // Start new generation
  const generationPromise = (async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const channelData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(channelData.length / samples);
      const waveform = [];

      for (let i = 0; i < samples; i++) {
        const start = i * blockSize;
        const end = Math.min(start + blockSize, channelData.length);
        let sum = 0;

        for (let j = start; j < end; j++) {
          sum += channelData[j] * channelData[j];
        }

        const rms = Math.sqrt(sum / (end - start));
        waveform.push(rms);
      }

      const maxRms = Math.max(...waveform);
      const normalizedWaveform = maxRms > 0
        ? waveform.map(value => value / maxRms)
        : waveform;

      // Cache the result
      waveformCache.set(fileUrl, normalizedWaveform);

      // Close audio context to free resources
      audioContext.close();

      return normalizedWaveform;
    } catch (error) {
      console.error(`❌ Waveform generation failed for ${fileUrl}:`, error);

      // Generate fallback waveform
      const fallbackWaveform = Array.from({ length: samples }, (_, i) =>
        Math.abs(Math.sin(i * 0.1)) * 0.5 + Math.random() * 0.3
      );

      // Cache fallback too (so we don't retry failed files)
      waveformCache.set(fileUrl, fallbackWaveform);

      return fallbackWaveform;
    } finally {
      // Remove from pending regardless of success/failure
      pendingGenerations.delete(fileUrl);
    }
  })();

  // Store the promise so other components can wait for it
  pendingGenerations.set(fileUrl, generationPromise);

  return generationPromise;
};

/**
 * Clear all cached waveforms (useful for testing or memory management)
 */
export const clearWaveformCache = () => {
  waveformCache.clear();
  pendingGenerations.clear();
};

/**
 * Get cache statistics (for debugging)
 */
export const getCacheStats = () => ({
  cachedCount: waveformCache.size,
  pendingCount: pendingGenerations.size,
  cachedFiles: Array.from(waveformCache.keys()),
});
