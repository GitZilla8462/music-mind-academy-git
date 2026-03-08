// exportComposition.js
// Bounces all placed loops into a single stereo WAV file and triggers a download.
// Uses OfflineAudioContext (no Tone.js dependency).

const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 2;
const BIT_DEPTH = 16;

/**
 * Convert an AudioBuffer to a WAV Blob (16-bit PCM, stereo).
 * Self-contained copy — intentionally not imported from beatRenderUtils.
 */
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = BIT_DEPTH;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

/**
 * Fetch and decode an audio file into an AudioBuffer using an OfflineAudioContext.
 */
const fetchAndDecode = async (url, offlineCtx) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${url} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return offlineCtx.decodeAudioData(arrayBuffer);
};

/**
 * Export a composition (array of placed loops) to a WAV file and trigger a download.
 *
 * @param {Array} placedLoops - Each loop: { file, startTime, endTime, trackIndex, volume, muted, name, type }
 * @param {number} duration - Total composition duration in seconds
 * @param {string} [filename='my-composition'] - Download filename (without extension)
 * @param {Function|null} [onProgress=null] - Optional callback: (stage, percent) => void
 * @returns {Promise<Blob>} The WAV blob that was downloaded
 */
export const exportCompositionToWav = async (
  placedLoops,
  duration,
  filename = 'my-composition',
  onProgress = null
) => {
  if (!placedLoops || placedLoops.length === 0) {
    throw new Error('No loops to export');
  }

  if (!duration || duration <= 0) {
    throw new Error('Invalid duration');
  }

  const progress = (stage, percent) => {
    if (onProgress) {
      try {
        onProgress(stage, percent);
      } catch (e) {
        // Ignore callback errors
      }
    }
  };

  progress('preparing', 0);

  // Filter out muted loops, loops with no file, and blob URLs (custom beats/melodies)
  const activeLoops = placedLoops.filter((loop) => {
    if (loop.muted) return false;
    if (!loop.file) return false;

    // Blob URLs can't be re-fetched reliably — skip with a warning
    if (loop.file.startsWith('blob:')) {
      console.warn(
        `Skipping "${loop.name || 'unnamed'}" — blob URLs cannot be exported. ` +
        'Re-render custom beats/melodies before exporting.'
      );
      return false;
    }

    return true;
  });

  if (activeLoops.length === 0) {
    throw new Error('No exportable loops found (all muted, empty, or blob-based)');
  }

  // Create OfflineAudioContext: stereo, at 44100 Hz, for the full duration
  const totalSamples = Math.ceil(duration * SAMPLE_RATE);
  const offlineCtx = new OfflineAudioContext(NUM_CHANNELS, totalSamples, SAMPLE_RATE);

  // Fetch and decode all audio files
  progress('loading', 0);

  const decodedBuffers = [];
  for (let i = 0; i < activeLoops.length; i++) {
    const loop = activeLoops[i];
    try {
      const audioBuffer = await fetchAndDecode(loop.file, offlineCtx);
      decodedBuffers.push({ loop, audioBuffer });
    } catch (err) {
      console.warn(`Failed to load "${loop.name || loop.file}": ${err.message}. Skipping.`);
    }
    progress('loading', Math.round(((i + 1) / activeLoops.length) * 100));
  }

  if (decodedBuffers.length === 0) {
    throw new Error('Failed to load any audio files');
  }

  // Schedule each loop into the offline context
  progress('mixing', 0);

  for (let i = 0; i < decodedBuffers.length; i++) {
    const { loop, audioBuffer } = decodedBuffers[i];

    const startTime = Math.max(0, loop.startTime || 0);
    const endTime = Math.min(duration, loop.endTime != null ? loop.endTime : duration);
    const loopDuration = endTime - startTime;

    if (loopDuration <= 0) continue;

    // Apply volume via a gain node
    const gainNode = offlineCtx.createGain();
    const vol = loop.volume != null ? loop.volume : 1;
    gainNode.gain.value = Math.max(0, Math.min(2, vol));
    gainNode.connect(offlineCtx.destination);

    const bufferDuration = audioBuffer.duration;

    if (loopDuration <= bufferDuration) {
      // Single play — clip to the needed duration
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNode);
      source.start(startTime, 0, loopDuration);
    } else {
      // Loop: tile the buffer to fill the region
      let offset = 0;
      while (offset < loopDuration) {
        const remaining = loopDuration - offset;
        const playDuration = Math.min(bufferDuration, remaining);

        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.start(startTime + offset, 0, playDuration);

        offset += bufferDuration;
      }
    }

    progress('mixing', Math.round(((i + 1) / decodedBuffers.length) * 100));
  }

  // Render the offline context
  progress('rendering', 0);
  const renderedBuffer = await offlineCtx.startRendering();
  progress('rendering', 100);

  // Convert to WAV
  progress('encoding', 0);
  const wavBlob = audioBufferToWav(renderedBuffer);
  progress('encoding', 100);

  // Trigger download
  progress('downloading', 0);
  const url = URL.createObjectURL(wavBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename}.wav`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up the object URL after a short delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  progress('done', 100);

  return wavBlob;
};
