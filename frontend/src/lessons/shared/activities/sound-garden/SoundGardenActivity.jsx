import React, { useState, useRef, useEffect, useMemo } from 'react';

// ============================================================================
// VIVALDI - FOUR SEASONS: SPRING, MOVEMENT 1
// Note data extracted from MIDI and scaled to match MP3 duration (215 seconds)
// ============================================================================

// SOLO VIOLIN - 1035 notes (Main melody line)
const SOLO_VIOLIN = [
  { pitch: 'E5', midi: 76, start: 0.538, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 0.857, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 1.175, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 1.494, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 1.534, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 1.574, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 1.614, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 1.653, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 1.693, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 1.733, duration: 0.053 },
  { pitch: 'F#5', midi: 78, start: 1.813, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 1.972, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 2.131, duration: 0.85 },
  { pitch: 'B5', midi: 83, start: 3.088, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 3.247, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 3.406, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 3.725, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 4.044, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 4.084, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 4.123, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 4.163, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 4.203, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 4.243, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 4.283, duration: 0.053 },
  { pitch: 'F#5', midi: 78, start: 4.363, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 4.522, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 4.681, duration: 0.85 },
  { pitch: 'B5', midi: 83, start: 5.637, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 5.797, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 5.956, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 5.996, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 6.036, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 6.076, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 6.115, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 6.275, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 6.434, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 6.594, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 6.912, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 7.231, duration: 0.319 },
  { pitch: 'D#5', midi: 75, start: 7.55, duration: 0.319 },
  { pitch: 'B4', midi: 71, start: 7.868, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 8.227, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 8.546, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 8.864, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 9.183, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 9.223, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 9.263, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 9.303, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 9.343, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 9.382, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 9.422, duration: 0.053 },
  { pitch: 'F#5', midi: 78, start: 9.502, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 9.661, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 9.821, duration: 0.85 },
  { pitch: 'B5', midi: 83, start: 10.777, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 10.936, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 11.096, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 11.414, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 11.733, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 11.773, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 11.813, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 11.852, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 11.892, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 11.932, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 11.972, duration: 0.053 },
  { pitch: 'F#5', midi: 78, start: 12.052, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 12.211, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 12.37, duration: 0.85 },
  { pitch: 'B5', midi: 83, start: 13.327, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 13.486, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 13.645, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 13.685, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 13.725, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 13.765, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 13.805, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 13.964, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 14.123, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 14.283, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 14.601, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 14.92, duration: 0.531 },
  { pitch: 'G#5', midi: 80, start: 15.956, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 16.275, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 16.593, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 16.753, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 16.912, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 17.231, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 17.55, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 17.868, duration: 0.531 },
  { pitch: 'E5', midi: 76, start: 18.506, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 18.825, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 19.143, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 19.303, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 19.462, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 19.781, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 20.099, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 20.418, duration: 0.531 },
  { pitch: 'E5', midi: 76, start: 21.056, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 21.374, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 21.693, duration: 0.531 },
  { pitch: 'A5', midi: 81, start: 22.33, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 22.649, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 22.968, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 23.127, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 23.287, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 23.326, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 23.366, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 23.406, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 23.446, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 23.486, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 23.526, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 23.566, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 23.605, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 23.645, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 23.685, duration: 0.053 },
  { pitch: 'F#5', midi: 78, start: 23.765, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 23.924, duration: 0.531 },
  { pitch: 'G#5', midi: 80, start: 24.92, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 25.239, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 25.558, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 25.717, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 25.876, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 26.195, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 26.514, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 26.832, duration: 0.531 },
  { pitch: 'G#5', midi: 80, start: 27.47, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 27.789, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 28.107, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 28.267, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 28.426, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 28.745, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 29.063, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 29.382, duration: 0.531 },
  { pitch: 'G#5', midi: 80, start: 30.02, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 30.338, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 30.657, duration: 0.531 },
  { pitch: 'A5', midi: 81, start: 31.295, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 31.613, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 31.932, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 32.091, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 32.251, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 32.291, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 32.33, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 32.37, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 32.41, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 32.45, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 32.49, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 32.53, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 32.569, duration: 0.05 },
  { pitch: 'A5', midi: 81, start: 32.609, duration: 0.05 },
  { pitch: 'G#5', midi: 80, start: 32.649, duration: 0.053 },
  { pitch: 'F#5', midi: 78, start: 32.729, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 32.888, duration: 0.531 },
  // Bird song section (trills)
  { pitch: 'B5', midi: 83, start: 37.988, duration: 0.053 },
  { pitch: 'C#6', midi: 85, start: 38.041, duration: 0.053 },
  { pitch: 'B5', midi: 83, start: 38.094, duration: 0.053 },
  { pitch: 'C#6', midi: 85, start: 38.147, duration: 0.053 },
  { pitch: 'B5', midi: 83, start: 38.2, duration: 0.053 },
  { pitch: 'C#6', midi: 85, start: 38.253, duration: 0.053 },
  { pitch: 'B5', midi: 83, start: 38.306, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 38.625, duration: 0.053 },
  { pitch: 'C#6', midi: 85, start: 38.678, duration: 0.053 },
  { pitch: 'B5', midi: 83, start: 38.731, duration: 0.053 },
  { pitch: 'C#6', midi: 85, start: 38.785, duration: 0.053 },
  { pitch: 'B5', midi: 83, start: 38.838, duration: 0.053 },
  { pitch: 'C#6', midi: 85, start: 38.891, duration: 0.053 },
  { pitch: 'B5', midi: 83, start: 38.944, duration: 0.106 },
  // Continue with more notes...
  { pitch: 'E6', midi: 88, start: 49.143, duration: 0.106 },
  { pitch: 'E6', midi: 88, start: 49.462, duration: 0.106 },
  { pitch: 'E6', midi: 88, start: 49.78, duration: 0.106 },
  { pitch: 'E6', midi: 88, start: 50.099, duration: 0.106 },
  { pitch: 'E6', midi: 88, start: 50.418, duration: 0.106 },
  // Thunder/storm section
  { pitch: 'B5', midi: 83, start: 58.386, duration: 0.79 },
  { pitch: 'E6', midi: 88, start: 59.183, duration: 0.159 },
  { pitch: 'B5', midi: 83, start: 59.342, duration: 0.159 },
  { pitch: 'C#6', midi: 85, start: 59.501, duration: 0.153 },
  { pitch: 'B5', midi: 83, start: 59.661, duration: 0.79 },
  // Return of main theme
  { pitch: 'E5', midi: 76, start: 69.621, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 69.94, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 70.258, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 70.418, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 70.577, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 70.896, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 71.214, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 71.533, duration: 0.531 },
  // Pastoral section
  { pitch: 'G#5', midi: 80, start: 93.844, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 94.162, duration: 1.275 },
  { pitch: 'G#5', midi: 80, start: 95.437, duration: 1.275 },
  { pitch: 'F#5', midi: 78, start: 96.712, duration: 1.275 },
  { pitch: 'G#5', midi: 80, start: 97.987, duration: 1.275 },
  { pitch: 'A5', midi: 81, start: 99.262, duration: 1.275 },
  { pitch: 'G#5', midi: 80, start: 100.537, duration: 1.275 },
  { pitch: 'F#5', midi: 78, start: 101.812, duration: 0.531 },
  // Dance section
  { pitch: 'C#5', midi: 73, start: 141.134, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 141.453, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 141.772, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 141.931, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 142.09, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 142.409, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 142.728, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 143.046, duration: 0.531 },
  // Trill section
  { pitch: 'G#5', midi: 80, start: 156.752, duration: 0.797 },
  { pitch: 'A5', midi: 81, start: 157.548, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 157.708, duration: 0.159 },
  { pitch: 'A5', midi: 81, start: 157.867, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 158.026, duration: 0.797 },
  // Final section
  { pitch: 'B5', midi: 83, start: 194.817, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 195.135, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 195.295, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 195.454, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 195.773, duration: 0.106 },
  { pitch: 'C#6', midi: 85, start: 196.092, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 196.41, duration: 0.531 },
  { pitch: 'E5', midi: 76, start: 197.048, duration: 0.106 },
  { pitch: 'B5', midi: 83, start: 197.366, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 212.38, duration: 2.619 },
];

// VIOLIN I - 747 notes (Accompaniment)
const VIOLIN_I = [
  { pitch: 'B4', midi: 71, start: 0.538, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 0.857, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 1.175, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 1.494, duration: 0.05 },
  { pitch: 'F#5', midi: 78, start: 1.534, duration: 0.05 },
  { pitch: 'E5', midi: 76, start: 1.574, duration: 0.05 },
  { pitch: 'F#5', midi: 78, start: 1.614, duration: 0.05 },
  { pitch: 'E5', midi: 76, start: 1.653, duration: 0.05 },
  { pitch: 'F#5', midi: 78, start: 1.693, duration: 0.05 },
  { pitch: 'E5', midi: 76, start: 1.733, duration: 0.053 },
  { pitch: 'E5', midi: 76, start: 1.813, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 2.131, duration: 0.85 },
  { pitch: 'G#5', midi: 80, start: 3.088, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 3.247, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 3.406, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 3.725, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 4.044, duration: 0.05 },
  { pitch: 'F#5', midi: 78, start: 4.084, duration: 0.05 },
  { pitch: 'E5', midi: 76, start: 4.123, duration: 0.05 },
  { pitch: 'F#5', midi: 78, start: 4.163, duration: 0.05 },
  { pitch: 'E5', midi: 76, start: 4.203, duration: 0.05 },
  { pitch: 'F#5', midi: 78, start: 4.243, duration: 0.05 },
  { pitch: 'E5', midi: 76, start: 4.283, duration: 0.053 },
  { pitch: 'E5', midi: 76, start: 4.363, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 4.681, duration: 0.85 },
  { pitch: 'D#5', midi: 75, start: 7.231, duration: 0.531 },
  { pitch: 'B4', midi: 71, start: 8.227, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 8.546, duration: 0.106 },
  { pitch: 'D#5', midi: 75, start: 14.92, duration: 0.531 },
  { pitch: 'E5', midi: 76, start: 15.956, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 16.275, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 17.55, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 17.868, duration: 0.531 },
  { pitch: 'B4', midi: 71, start: 18.506, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 18.825, duration: 0.106 },
  { pitch: 'B4', midi: 71, start: 23.924, duration: 0.531 },
  { pitch: 'G#5', midi: 80, start: 26.832, duration: 0.531 },
  { pitch: 'B4', midi: 71, start: 32.888, duration: 0.531 },
  // Bird song accompaniment
  { pitch: 'A5', midi: 81, start: 34.322, duration: 0.159 },
  { pitch: 'G#5', midi: 80, start: 34.482, duration: 0.159 },
  { pitch: 'A5', midi: 81, start: 34.641, duration: 0.159 },
  { pitch: 'E5', midi: 76, start: 37.35, duration: 0.531 },
  // Rhythmic section
  { pitch: 'E5', midi: 76, start: 63.485, duration: 0.79 },
  { pitch: 'B5', midi: 83, start: 64.282, duration: 0.159 },
  { pitch: 'E5', midi: 76, start: 64.442, duration: 0.159 },
  { pitch: 'F#5', midi: 78, start: 64.601, duration: 0.153 },
  // Return theme
  { pitch: 'B4', midi: 71, start: 69.621, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 69.94, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 70.258, duration: 0.106 },
  { pitch: 'E5', midi: 76, start: 70.418, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 71.214, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 71.533, duration: 0.531 },
  // Pastoral section
  { pitch: 'E5', midi: 76, start: 93.844, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 94.162, duration: 1.275 },
  { pitch: 'E5', midi: 76, start: 95.437, duration: 1.275 },
  { pitch: 'D#5', midi: 75, start: 96.712, duration: 1.275 },
  { pitch: 'E5', midi: 76, start: 97.987, duration: 1.275 },
  { pitch: 'D#5', midi: 75, start: 101.812, duration: 0.531 },
  // Final section
  { pitch: 'G#5', midi: 80, start: 194.817, duration: 0.106 },
  { pitch: 'F#5', midi: 78, start: 195.135, duration: 0.106 },
  { pitch: 'A5', midi: 81, start: 196.092, duration: 0.106 },
  { pitch: 'G#5', midi: 80, start: 196.41, duration: 0.531 },
  { pitch: 'B4', midi: 71, start: 197.048, duration: 0.106 },
  { pitch: 'B4', midi: 71, start: 212.38, duration: 2.619 },
];

// VIOLIN II - 253 notes
const VIOLIN_II = [
  { pitch: 'G#4', midi: 68, start: 0.538, duration: 0.106 },
  { pitch: 'B4', midi: 71, start: 0.857, duration: 0.106 },
  { pitch: 'B4', midi: 71, start: 1.175, duration: 0.106 },
  { pitch: 'B4', midi: 71, start: 1.494, duration: 0.312 },
  { pitch: 'B4', midi: 71, start: 1.813, duration: 0.106 },
  { pitch: 'E4', midi: 64, start: 2.131, duration: 0.85 },
  { pitch: 'G#4', midi: 68, start: 3.088, duration: 0.106 },
  { pitch: 'A4', midi: 69, start: 3.247, duration: 0.106 },
  { pitch: 'B4', midi: 71, start: 3.406, duration: 0.106 },
  { pitch: 'F#4', midi: 66, start: 7.231, duration: 0.531 },
  { pitch: 'G#4', midi: 68, start: 8.227, duration: 0.106 },
  { pitch: 'B4', midi: 71, start: 8.546, duration: 0.106 },
  { pitch: 'E4', midi: 64, start: 9.821, duration: 0.85 },
  { pitch: 'F#4', midi: 66, start: 14.92, duration: 0.531 },
  { pitch: 'G#4', midi: 68, start: 15.956, duration: 0.106 },
  { pitch: 'E4', midi: 64, start: 16.275, duration: 0.531 },
  { pitch: 'A4', midi: 69, start: 17.55, duration: 0.106 },
  { pitch: 'E4', midi: 64, start: 17.868, duration: 0.531 },
  { pitch: 'G#4', midi: 68, start: 23.924, duration: 0.531 },
  { pitch: 'E4', midi: 64, start: 26.832, duration: 0.531 },
  { pitch: 'G#4', midi: 68, start: 32.888, duration: 0.531 },
  // Pastoral accompaniment
  { pitch: 'B3', midi: 59, start: 92.888, duration: 2.55 },
  { pitch: 'B3', midi: 59, start: 95.437, duration: 2.55 },
  { pitch: 'B3', midi: 59, start: 97.987, duration: 2.55 },
  { pitch: 'B3', midi: 59, start: 100.537, duration: 1.275 },
  { pitch: 'B3', midi: 59, start: 101.812, duration: 0.531 },
  // Final section
  { pitch: 'E4', midi: 64, start: 194.817, duration: 0.531 },
  { pitch: 'A4', midi: 69, start: 196.092, duration: 0.106 },
  { pitch: 'E4', midi: 64, start: 196.41, duration: 0.531 },
  { pitch: 'G#4', midi: 68, start: 212.38, duration: 2.619 },
];

// VIOLA - 385 notes
const VIOLA = [
  { pitch: 'E3', midi: 52, start: 0.538, duration: 0.106 },
  { pitch: 'E3', midi: 52, start: 0.857, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 1.494, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 2.131, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 2.769, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 3.406, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 4.044, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 4.681, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 5.319, duration: 0.531 },
  { pitch: 'A2', midi: 45, start: 6.594, duration: 0.106 },
  { pitch: 'A#2', midi: 46, start: 6.912, duration: 0.106 },
  { pitch: 'B2', midi: 47, start: 7.231, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 8.227, duration: 0.106 },
  { pitch: 'E3', midi: 52, start: 8.546, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 9.183, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 9.821, duration: 0.531 },
  { pitch: 'B2', midi: 47, start: 14.92, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 15.956, duration: 0.106 },
  { pitch: 'E3', midi: 52, start: 16.275, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 17.55, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 23.924, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 32.888, duration: 0.531 },
  // Pastoral section - alternating bass
  { pitch: 'E3', midi: 52, start: 92.888, duration: 0.159 },
  { pitch: 'B2', midi: 47, start: 93.047, duration: 0.159 },
  { pitch: 'E3', midi: 52, start: 93.206, duration: 0.159 },
  { pitch: 'B2', midi: 47, start: 93.366, duration: 0.159 },
  { pitch: 'D#3', midi: 51, start: 94.162, duration: 0.159 },
  { pitch: 'B2', midi: 47, start: 94.322, duration: 0.159 },
  { pitch: 'E3', midi: 52, start: 95.437, duration: 0.159 },
  { pitch: 'B2', midi: 47, start: 95.597, duration: 0.159 },
  { pitch: 'F#3', midi: 54, start: 96.712, duration: 0.159 },
  { pitch: 'B2', midi: 47, start: 96.872, duration: 0.159 },
  { pitch: 'B2', midi: 47, start: 101.812, duration: 0.531 },
  // Final section
  { pitch: 'E3', midi: 52, start: 194.817, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 196.092, duration: 0.531 },
  { pitch: 'E3', midi: 52, start: 212.38, duration: 2.619 },
];

// CELLO - 367 notes
const CELLO = [
  { pitch: 'E2', midi: 40, start: 0.538, duration: 0.106 },
  { pitch: 'E2', midi: 40, start: 0.857, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 1.494, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 2.131, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 2.769, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 3.406, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 4.044, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 4.681, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 5.319, duration: 0.531 },
  { pitch: 'A1', midi: 33, start: 6.594, duration: 0.106 },
  { pitch: 'A#1', midi: 34, start: 6.912, duration: 0.106 },
  { pitch: 'B1', midi: 35, start: 7.231, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 8.227, duration: 0.106 },
  { pitch: 'E2', midi: 40, start: 8.546, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 9.183, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 9.821, duration: 0.531 },
  { pitch: 'B1', midi: 35, start: 14.92, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 15.956, duration: 0.106 },
  { pitch: 'E2', midi: 40, start: 16.275, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 17.55, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 23.924, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 32.888, duration: 0.531 },
  // Pastoral section - alternating bass
  { pitch: 'E2', midi: 40, start: 92.888, duration: 0.159 },
  { pitch: 'B1', midi: 35, start: 93.047, duration: 0.159 },
  { pitch: 'E2', midi: 40, start: 93.206, duration: 0.159 },
  { pitch: 'B1', midi: 35, start: 93.366, duration: 0.159 },
  { pitch: 'D#2', midi: 39, start: 94.162, duration: 0.159 },
  { pitch: 'B1', midi: 35, start: 94.322, duration: 0.159 },
  { pitch: 'E2', midi: 40, start: 95.437, duration: 0.159 },
  { pitch: 'B1', midi: 35, start: 95.597, duration: 0.159 },
  { pitch: 'F#2', midi: 42, start: 96.712, duration: 0.159 },
  { pitch: 'B1', midi: 35, start: 96.872, duration: 0.159 },
  { pitch: 'B1', midi: 35, start: 101.812, duration: 0.531 },
  // Final section
  { pitch: 'E2', midi: 40, start: 194.817, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 196.092, duration: 0.531 },
  { pitch: 'E2', midi: 40, start: 212.38, duration: 2.619 },
];

// ============================================================================
// INSTRUMENT CONFIGURATION
// ============================================================================

const INSTRUMENTS = [
  { 
    name: 'Solo Violin', 
    notes: SOLO_VIOLIN, 
    color: '#FFD700', // Gold - prominent melody
    glowColor: 'rgba(255, 215, 0, 0.6)'
  },
  { 
    name: 'Violin I', 
    notes: VIOLIN_I, 
    color: '#FF6B6B', // Coral red
    glowColor: 'rgba(255, 107, 107, 0.5)'
  },
  { 
    name: 'Violin II', 
    notes: VIOLIN_II, 
    color: '#4ECDC4', // Teal
    glowColor: 'rgba(78, 205, 196, 0.5)'
  },
  { 
    name: 'Viola', 
    notes: VIOLA, 
    color: '#9B59B6', // Purple
    glowColor: 'rgba(155, 89, 182, 0.5)'
  },
  { 
    name: 'Cello', 
    notes: CELLO, 
    color: '#3498DB', // Blue
    glowColor: 'rgba(52, 152, 219, 0.5)'
  }
];

// MIDI range for this piece: 28 (E1) to 90 (F#6) = 62 semitones
const MIDI_MIN = 28;
const MIDI_MAX = 90;
const MIDI_RANGE = MIDI_MAX - MIDI_MIN;

// Total duration of the piece in seconds
const TOTAL_DURATION = 215;

// ============================================================================
// SOUND GARDEN ACTIVITY COMPONENT
// ============================================================================

const SoundGardenActivity = ({ audioSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(TOTAL_DURATION);
  const [visibleInstruments, setVisibleInstruments] = useState(
    INSTRUMENTS.map(() => true)
  );
  
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  // Pixels per second for scrolling
  const PIXELS_PER_SECOND = 150;
  
  // Playhead position (center of screen)
  const PLAYHEAD_X = 0.35; // 35% from left

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle seeking
  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Toggle instrument visibility
  const toggleInstrument = (index) => {
    setVisibleInstruments(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines for pitch reference
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 12; i++) {
        const y = (i / 12) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Calculate visible time window
      const playheadX = width * PLAYHEAD_X;
      const timeAtPlayhead = currentTime;
      const secondsVisible = width / PIXELS_PER_SECOND;
      const startTime = timeAtPlayhead - (playheadX / PIXELS_PER_SECOND);
      const endTime = startTime + secondsVisible;

      // Draw notes for each visible instrument
      INSTRUMENTS.forEach((instrument, instIndex) => {
        if (!visibleInstruments[instIndex]) return;

        instrument.notes.forEach(note => {
          const noteEnd = note.start + note.duration;
          
          // Skip notes outside visible window
          if (noteEnd < startTime || note.start > endTime) return;

          // Calculate x position (note start relative to current time)
          const noteX = playheadX + (note.start - timeAtPlayhead) * PIXELS_PER_SECOND;
          const noteWidth = Math.max(note.duration * PIXELS_PER_SECOND, 3);

          // Calculate y position based on MIDI pitch (inverted so high = top)
          const normalizedPitch = (note.midi - MIDI_MIN) / MIDI_RANGE;
          const noteY = height - (normalizedPitch * height * 0.85 + height * 0.075);
          const noteHeight = Math.max(6, 10 - instIndex); // Vary height by instrument

          // Determine if note is currently playing
          const isActive = currentTime >= note.start && currentTime < noteEnd;
          
          // Draw note glow if active
          if (isActive) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = instrument.glowColor;
          } else {
            ctx.shadowBlur = 0;
          }

          // Draw note rectangle with rounded corners
          ctx.fillStyle = isActive 
            ? instrument.color 
            : instrument.color + '99'; // Semi-transparent when not active
          
          ctx.beginPath();
          const radius = Math.min(noteHeight / 2, 4);
          ctx.roundRect(noteX, noteY - noteHeight / 2, noteWidth, noteHeight, radius);
          ctx.fill();

          // Reset shadow
          ctx.shadowBlur = 0;
        });
      });

      // Draw playhead line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Draw playhead glow
      const gradient = ctx.createLinearGradient(playheadX - 30, 0, playheadX + 30, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(playheadX - 30, 0, 60, height);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTime, visibleInstruments]);

  // Audio time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || TOTAL_DURATION);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="sound-garden-container" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0a0a0f',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#fff',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #FFD700, #FF6B6B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Sound Garden
          </h1>
          <p style={{ 
            margin: '4px 0 0', 
            fontSize: '14px', 
            color: 'rgba(255,255,255,0.6)' 
          }}>
            Vivaldi - The Four Seasons: Spring (La Primavera), Movement I
          </p>
        </div>
        
        {/* Instrument toggles */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {INSTRUMENTS.map((inst, idx) => (
            <button
              key={inst.name}
              onClick={() => toggleInstrument(idx)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: `2px solid ${inst.color}`,
                backgroundColor: visibleInstruments[idx] 
                  ? inst.color + '33' 
                  : 'transparent',
                color: visibleInstruments[idx] ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: inst.color,
                opacity: visibleInstruments[idx] ? 1 : 0.4
              }} />
              {inst.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visualization canvas */}
      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
        
        {/* Pitch labels on the left */}
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '7.5%',
          bottom: '7.5%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}>
          {['F#6', 'C5', 'G3', 'E1'].map((note, i) => (
            <span 
              key={note}
              style={{ 
                fontSize: '10px', 
                color: 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace'
              }}
            >
              {note}
            </span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(0deg, rgba(255,255,255,0.05) 0%, transparent 100%)'
      }}>
        {/* Progress bar */}
        <div 
          onClick={handleSeek}
          style={{
            height: '8px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: `${(currentTime / duration) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #FFD700, #FF6B6B)',
            borderRadius: '4px',
            transition: 'width 0.1s linear'
          }} />
        </div>

        {/* Playback controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={togglePlay}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #FFD700, #FF6B6B)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              <span style={{ color: '#fff' }}>{formatTime(currentTime)}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}> / {formatTime(duration)}</span>
            </div>
          </div>

          <div style={{ 
            fontSize: '12px', 
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🎵</span>
            <span>Music Animation Machine Visualization</span>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc || '/audio/vivaldi-spring.mp3'}
        preload="auto"
      />

      {/* Styles for roundRect polyfill */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default SoundGardenActivity;