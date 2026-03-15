// Environment definitions for parallax backgrounds
// Image-based environments use pre-made PNG layers from /images/parallax/
// Each layer scrolls at a different speed to create depth

// Helper: generate a sky environment from the sky-N asset pack
// Layer_1 = foreground (fastest), last layer = sky background (static)
// In config array: far (slowest) → near (fastest)
const SPEED_MAP = {
  1: [0.35],
  2: [0.15, 0.55],
  3: [0.15, 0.35, 0.55],
  4: [0.1, 0.25, 0.4, 0.6],
  5: [0.08, 0.18, 0.3, 0.45, 0.6],
};

const makeSky = (num, name, layerCount) => {
  const parallaxCount = layerCount - 1; // last layer is static sky
  const speeds = SPEED_MAP[parallaxCount] || SPEED_MAP[3];
  // Layers go from furthest (highest layer number, slowest) to nearest (layer-1, fastest)
  const layers = [];
  for (let i = parallaxCount; i >= 1; i--) {
    const speedIdx = parallaxCount - i; // 0 = slowest, N-1 = fastest
    layers.push({
      src: `/images/parallax/sky-${num}/layer-${i}.png`,
      speed: speeds[speedIdx] || 0.35,
      bgTile: true, // use CSS background tiling (scales height without breaking seamless repeat)
    });
  }
  return {
    id: `sky-${num}`,
    name,
    icon: '\u2601\uFE0F',
    type: 'image',
    category: 'sky',
    sky: `/images/parallax/sky-${num}/sky.png`,
    layers,
  };
};

const ENVIRONMENTS = [
  // Original environments (forests, mountains, city)
  {
    id: 'blue-forest',
    name: 'Blue Forest',
    icon: '\uD83C\uDF32',
    type: 'image',
    category: 'nature',
    sky: '/images/parallax/blue-forest/sky.png',
    layers: [
      { src: '/images/parallax/blue-forest/far.png', speed: 0.15 },
      { src: '/images/parallax/blue-forest/mid.png', speed: 0.35 },
      { src: '/images/parallax/blue-forest/near.png', speed: 0.55 },
      { src: '/images/parallax/blue-forest/ground.png', speed: 0.75 },
      { src: '/images/parallax/blue-forest/mist.png', speed: 0.85 },
    ],
  },
  {
    id: 'mountain-peak',
    name: 'Mountain Peak',
    icon: '\u26F0\uFE0F',
    type: 'image',
    category: 'nature',
    sky: '/images/parallax/mountain-peak/sky.png',
    layers: [
      { src: '/images/parallax/mountain-peak/far.png', speed: 0.15 },
      { src: '/images/parallax/mountain-peak/mid.png', speed: 0.35 },
      { src: '/images/parallax/mountain-peak/near.png', speed: 0.55 },
      { src: '/images/parallax/mountain-peak/ground.png', speed: 0.75 },
    ],
  },
  {
    id: 'winter-night',
    name: 'Winter Night',
    icon: '\u2744\uFE0F',
    type: 'image',
    category: 'nature',
    sky: '/images/parallax/winter-night/sky.png',
    layers: [
      { src: '/images/parallax/winter-night/far.png', speed: 0.15 },
      { src: '/images/parallax/winter-night/mid.png', speed: 0.3 },
      { src: '/images/parallax/winter-night/near.png', speed: 0.55 },
      { src: '/images/parallax/winter-night/ground.png', speed: 0.75 },
    ],
  },
  {
    id: 'night-mountain',
    name: 'Night Mountain',
    icon: '\uD83C\uDFD4\uFE0F',
    type: 'image',
    category: 'nature',
    sky: '/images/parallax/night-mountain/sky.png',
    layers: [
      { src: '/images/parallax/night-mountain/far.png', speed: 0.2 },
      { src: '/images/parallax/night-mountain/near.png', speed: 0.55 },
    ],
  },
  {
    id: 'dark-forest',
    name: 'Dark Forest',
    icon: '\uD83C\uDF33',
    type: 'image',
    category: 'nature',
    sky: '/images/parallax/dark-forest/sky.png',
    layers: [
      { src: '/images/parallax/dark-forest/far.png', speed: 0.2 },
      { src: '/images/parallax/dark-forest/mid.png', speed: 0.45 },
      { src: '/images/parallax/dark-forest/near.png', speed: 0.75 },
    ],
  },
  {
    id: 'autumn-forest',
    name: 'Autumn Forest',
    icon: '\uD83C\uDF42',
    type: 'image',
    category: 'nature',
    sky: '/images/parallax/autumn-forest/sky.png',
    layers: [
      { src: '/images/parallax/autumn-forest/mid.png', speed: 0.5 },
    ],
  },
  {
    id: 'city',
    name: 'City',
    icon: '\uD83C\uDFD9\uFE0F',
    type: 'image',
    category: 'nature',
    sky: '/images/parallax/city/sky.png',
    layers: [
      { src: '/images/parallax/city/buildings.png', speed: 0.2 },
      { src: '/images/parallax/city/wall1.png', speed: 0.4 },
      { src: '/images/parallax/city/wall2.png', speed: 0.55 },
      { src: '/images/parallax/city/road.png', speed: 0.75 },
    ],
  },
  // Original cloud environments (pixel art)
  {
    id: 'clouds-day',
    name: 'Day Clouds',
    icon: '\u2601\uFE0F',
    type: 'image',
    category: 'clouds-original',
    sky: '/images/parallax/clouds-day/sky.png',
    layers: [
      { src: '/images/parallax/clouds-day/far.png', speed: 0.15 },
      { src: '/images/parallax/clouds-day/mid.png', speed: 0.35 },
      { src: '/images/parallax/clouds-day/near.png', speed: 0.55 },
    ],
  },
  {
    id: 'clouds-lavender',
    name: 'Lavender Clouds',
    icon: '\uD83D\uDC9C',
    type: 'image',
    category: 'clouds-original',
    sky: '/images/parallax/clouds-lavender/sky.png',
    layers: [
      { src: '/images/parallax/clouds-lavender/far.png', speed: 0.15 },
      { src: '/images/parallax/clouds-lavender/mid.png', speed: 0.35 },
      { src: '/images/parallax/clouds-lavender/near.png', speed: 0.55 },
      { src: '/images/parallax/clouds-lavender/ground.png', speed: 0.75 },
    ],
  },
  {
    id: 'clouds-sunset',
    name: 'Sunset Clouds',
    icon: '\uD83C\uDF05',
    type: 'image',
    category: 'clouds-original',
    sky: '/images/parallax/clouds-sunset/sky.png',
    layers: [
      { src: '/images/parallax/clouds-sunset/far.png', speed: 0.15 },
      { src: '/images/parallax/clouds-sunset/mid.png', speed: 0.35 },
      { src: '/images/parallax/clouds-sunset/near.png', speed: 0.55 },
    ],
  },
  {
    id: 'clouds-night',
    name: 'Night Clouds',
    icon: '\uD83C\uDF19',
    type: 'image',
    category: 'clouds-original',
    sky: '/images/parallax/clouds-night/sky.png',
    layers: [
      { src: '/images/parallax/clouds-night/far.png', speed: 0.15 },
      { src: '/images/parallax/clouds-night/mid.png', speed: 0.35 },
      { src: '/images/parallax/clouds-night/near.png', speed: 0.55 },
    ],
  },

  // ── Sky Backgrounds Collection (10 curated cloud parallax skies) ──
  makeSky(1, 'Blue Cumulus', 4),      // bright blue day
  makeSky(2, 'Pink Sunset', 4),       // lavender/pink sunset
  makeSky(5, 'Pastel Dawn', 5),       // soft pastel blue
  makeSky(10, 'Teal Dusk', 2),        // dark starry night + teal
  makeSky(14, 'Cherry Blossom', 5),   // warm pink/salmon
  makeSky(17, 'Powder Blue', 4),      // clean white-blue

  // Solid color backgrounds
  {
    id: 'plain-white',
    name: 'White',
    icon: '\u2B1C',
    type: 'color',
    category: 'solid',
    backgroundColor: '#FFFFFF',
    layers: [],
  },
  {
    id: 'plain-black',
    name: 'Black',
    icon: '\u2B1B',
    type: 'color',
    category: 'solid',
    backgroundColor: '#000000',
    layers: [],
  },
];

export const getEnvironmentById = (id) => ENVIRONMENTS.find(e => e.id === id) || ENVIRONMENTS[0];

export default ENVIRONMENTS;
