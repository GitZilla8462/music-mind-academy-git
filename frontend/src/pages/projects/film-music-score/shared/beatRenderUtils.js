// beatRenderUtils.js
// Utility functions for rendering Beat Maker patterns to audio
// Used by BeatMakerPanel and for re-rendering saved beats

import * as Tone from 'tone';

// Drum track configuration
const INSTRUMENTS = [
  { id: 'hihat', name: 'Hi-Hat' },
  { id: 'openhat', name: 'Open Hat' },
  { id: 'snare', name: 'Snare' },
  { id: 'clap', name: 'Clap' },
  { id: 'kick', name: 'Kick' }
];

// Kit presets with synth parameters
const KITS = {
  electronic: {
    name: 'Electronic',
    synths: {
      kick: { pitchDecay: 0.05, octaves: 4, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 } },
      snare: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 } },
      clap: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.15 } },
      hihat: { frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -10 },
      openhat: { frequency: 180, envelope: { attack: 0.001, decay: 0.3, release: 0.1 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -8 }
    }
  },
  acoustic: {
    name: 'Acoustic',
    synths: {
      kick: { pitchDecay: 0.08, octaves: 3, envelope: { attack: 0.002, decay: 0.3, sustain: 0.02, release: 0.8 } },
      snare: { noise: { type: 'pink' }, envelope: { attack: 0.002, decay: 0.25, sustain: 0.02, release: 0.25 } },
      clap: { noise: { type: 'brown' }, envelope: { attack: 0.005, decay: 0.2, sustain: 0.01, release: 0.2 } },
      hihat: { frequency: 300, envelope: { attack: 0.002, decay: 0.08, release: 0.02 }, harmonicity: 4, modulationIndex: 20, resonance: 3000, octaves: 1.2, volume: -12 },
      openhat: { frequency: 280, envelope: { attack: 0.002, decay: 0.4, release: 0.15 }, harmonicity: 4, modulationIndex: 20, resonance: 3000, octaves: 1.2, volume: -10 }
    }
  },
  '808': {
    name: '808',
    synths: {
      kick: { pitchDecay: 0.15, octaves: 6, envelope: { attack: 0.001, decay: 0.8, sustain: 0.01, release: 2 } },
      snare: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 } },
      clap: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 } },
      hihat: { frequency: 250, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 6, modulationIndex: 40, resonance: 5000, octaves: 2, volume: -8 },
      openhat: { frequency: 220, envelope: { attack: 0.001, decay: 0.25, release: 0.08 }, harmonicity: 6, modulationIndex: 40, resonance: 5000, octaves: 2, volume: -6 }
    }
  }
};

// Convert AudioBuffer to WAV blob
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

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

// Pre-render drum samples for a kit
const preRenderDrumSamples = async (kitName) => {
  const kitConfig = KITS[kitName] || KITS.electronic;
  const sampleDuration = 0.5;

  const renderSample = async (createSynth, triggerFn) => {
    return await Tone.Offline(({ transport }) => {
      const synth = createSynth();
      triggerFn(synth);
      transport.start(0);
    }, sampleDuration);
  };

  return {
    kick: await renderSample(
      () => new Tone.MembraneSynth(kitConfig.synths.kick).toDestination(),
      (s) => s.triggerAttackRelease('C1', '8n', 0.01)
    ),
    snare: await renderSample(
      () => new Tone.NoiseSynth(kitConfig.synths.snare).toDestination(),
      (s) => s.triggerAttackRelease('16n', 0.01)
    ),
    clap: await renderSample(
      () => new Tone.NoiseSynth(kitConfig.synths.clap).toDestination(),
      (s) => s.triggerAttackRelease('16n', 0.01)
    ),
    hihat: await renderSample(
      () => new Tone.MetalSynth(kitConfig.synths.hihat).toDestination(),
      (s) => s.triggerAttackRelease('32n', 0.01)
    ),
    openhat: await renderSample(
      () => new Tone.MetalSynth(kitConfig.synths.openhat).toDestination(),
      (s) => s.triggerAttackRelease('16n', 0.01)
    )
  };
};

/**
 * Render a beat pattern to a WAV blob URL
 * @param {Object} beatData - The beat data containing pattern, bpm, kit, steps
 * @returns {Promise<string>} - Blob URL of the rendered audio
 */
export const renderBeatToBlob = async (beatData) => {
  const { pattern, bpm, kit = 'electronic', steps = 16 } = beatData;

  if (!pattern || !Array.isArray(pattern)) {
    throw new Error('Invalid beat pattern');
  }

  console.log(`🔄 Re-rendering beat: ${steps} steps, ${bpm} BPM, ${kit} kit`);

  // Pre-render drum samples
  const samples = await preRenderDrumSamples(kit);

  // Calculate duration
  const bars = steps === 16 ? 1 : 2;
  const secondsPerBeat = 60 / bpm;
  const singlePatternDuration = secondsPerBeat * 4 * bars;
  const LOOP_REPEATS = 4;
  const duration = singlePatternDuration * LOOP_REPEATS;

  // Create output buffer
  const sampleRate = samples.kick.sampleRate;
  const outputLength = Math.ceil(duration * sampleRate);
  const outputBuffer = Tone.context.createBuffer(2, outputLength, sampleRate);
  const leftChannel = outputBuffer.getChannelData(0);
  const rightChannel = outputBuffer.getChannelData(1);

  const stepDuration = (60 / bpm) / 4;
  const baseOffset = 0.005;

  // Mix samples into output buffer
  for (let repeat = 0; repeat < LOOP_REPEATS; repeat++) {
    const repeatOffset = repeat * singlePatternDuration;

    for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
      const stepTime = baseOffset + repeatOffset + (stepIndex * stepDuration);
      const startSample = Math.floor(stepTime * sampleRate);

      INSTRUMENTS.forEach((inst, instIndex) => {
        if (pattern[instIndex] && pattern[instIndex][stepIndex]) {
          const sampleBuffer = samples[inst.id];
          const sampleLeft = sampleBuffer.getChannelData(0);
          const sampleRight = sampleBuffer.numberOfChannels > 1
            ? sampleBuffer.getChannelData(1)
            : sampleLeft;

          for (let i = 0; i < sampleLeft.length && startSample + i < outputLength; i++) {
            leftChannel[startSample + i] += sampleLeft[i];
            rightChannel[startSample + i] += sampleRight[i];
          }
        }
      });
    }
  }

  // Normalize to prevent clipping
  let maxSample = 0;
  for (let i = 0; i < outputLength; i++) {
    maxSample = Math.max(maxSample, Math.abs(leftChannel[i]), Math.abs(rightChannel[i]));
  }
  if (maxSample > 1) {
    const scale = 0.95 / maxSample;
    for (let i = 0; i < outputLength; i++) {
      leftChannel[i] *= scale;
      rightChannel[i] *= scale;
    }
  }

  // Convert to WAV
  const wavBlob = audioBufferToWav(outputBuffer);
  const blobURL = URL.createObjectURL(wavBlob);

  console.log(`✅ Beat re-rendered: ${duration.toFixed(2)}s, ${(wavBlob.size / 1024).toFixed(1)}KB`);

  return { blobURL, duration };
};

export { INSTRUMENTS, KITS };
