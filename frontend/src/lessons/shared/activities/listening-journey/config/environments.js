// Environment definitions for parallax backgrounds
// Image-based environments use pre-made PNG layers from /images/parallax/
// All images are 576x324 for Chromebook performance
// Each layer scrolls at a different speed to create depth

const ENVIRONMENTS = [
  {
    id: 'blue-forest',
    name: 'Blue Forest',
    icon: '\uD83C\uDF32',
    type: 'image',
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
    sky: '/images/parallax/city/sky.png',
    layers: [
      { src: '/images/parallax/city/buildings.png', speed: 0.2 },
      { src: '/images/parallax/city/wall1.png', speed: 0.4 },
      { src: '/images/parallax/city/wall2.png', speed: 0.55 },
      { src: '/images/parallax/city/road.png', speed: 0.75 },
    ],
  },
];

export const getEnvironmentById = (id) => ENVIRONMENTS.find(e => e.id === id) || ENVIRONMENTS[0];

export default ENVIRONMENTS;
