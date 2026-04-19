// renderWithSampler.js
// Renders notes to WAV using real instrument samples when available
// Pre-fetches sample buffers so Tone.Offline can use them
// Falls back to PolySynth for instruments without samples

import * as Tone from 'tone';
import { INSTRUMENTS } from '../../../../lessons/film-music/shared/virtual-instrument/instrumentConfig';

// Convert AudioBuffer to WAV blob
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const totalLength = 44 + dataLength;
  const ab = new ArrayBuffer(totalLength);
  const v = new DataView(ab);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, totalLength - 8, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, numChannels, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * blockAlign, true);
  v.setUint16(32, blockAlign, true); v.setUint16(34, bitDepth, true); ws(36, 'data');
  v.setUint32(40, dataLength, true);
  const chs = []; for (let c = 0; c < numChannels; c++) chs.push(buffer.getChannelData(c));
  let off = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      v.setInt16(off, Math.max(-1, Math.min(1, chs[c][i])) * 0x7FFF, true); off += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
};

// Cache pre-fetched sample ArrayBuffers so we don't re-fetch every render
const sampleCache = {};

// Pre-fetch sample files as ArrayBuffers (works in any AudioContext)
const prefetchSamples = async (inst) => {
  if (!inst.useSampler || !inst.samples) return null;

  const cacheKey = inst.id;
  if (sampleCache[cacheKey]) return sampleCache[cacheKey];

  const buffers = {};
  try {
    for (const [note, file] of Object.entries(inst.samples.urls)) {
      const response = await fetch(inst.samples.baseUrl + file);
      if (response.ok) {
        buffers[note] = await response.arrayBuffer();
      }
    }
    sampleCache[cacheKey] = buffers;
    return buffers;
  } catch (e) {
    console.warn('Failed to prefetch samples for', inst.id, e);
    return null;
  }
};

/**
 * Render notes to a WAV blob URL using real instrument samples
 * @param {Array} notes - [{note, timestamp, duration}, ...]
 * @param {string} instrumentId - key from INSTRUMENTS config
 * @returns {Promise<{blobURL: string, duration: number} | null>}
 */
export const renderNotesToWav = async (notes, instrumentId) => {
  if (!notes || notes.length === 0) return null;

  const inst = INSTRUMENTS[instrumentId || 'piano'];
  if (!inst) return null;

  const lastNote = notes.reduce((a, b) =>
    (a.timestamp + a.duration) > (b.timestamp + b.duration) ? a : b
  );
  const totalDuration = lastNote.timestamp + lastNote.duration + 0.5;

  // Try to pre-fetch samples for offline rendering
  const sampleBuffers = await prefetchSamples(inst);

  try {
    const offlineBuffer = await Tone.Offline(async ({ transport }) => {
      let synth;

      if (sampleBuffers && Object.keys(sampleBuffers).length > 0) {
        // Use Sampler with pre-fetched buffers
        // Decode ArrayBuffers in the offline context
        const decodedUrls = {};
        for (const [note, arrayBuf] of Object.entries(sampleBuffers)) {
          try {
            const audioBuffer = await Tone.context.decodeAudioData(arrayBuf.slice(0));
            decodedUrls[note] = new Tone.ToneAudioBuffer(audioBuffer);
          } catch (e) {
            // Skip failed decodes
          }
        }

        if (Object.keys(decodedUrls).length > 0) {
          synth = new Tone.Sampler({
            urls: decodedUrls,
            attack: inst.samplerAttack || 0,
            release: inst.config?.envelope?.release || 1,
          }).toDestination();
          synth.volume.value = -6;
        }
      }

      // Fallback to PolySynth
      if (!synth) {
        synth = new Tone.PolySynth(Tone.Synth, inst.config).toDestination();
        synth.volume.value = -6;
      }

      notes.forEach(({ note, timestamp, duration }) => {
        synth.triggerAttackRelease(note, duration, timestamp);
      });
    }, totalDuration);

    const wavBlob = audioBufferToWav(offlineBuffer);
    const blobURL = URL.createObjectURL(wavBlob);
    return { blobURL, duration: totalDuration };
  } catch (e) {
    console.error('Error rendering notes to WAV:', e);
    return null;
  }
};

export default renderNotesToWav;
