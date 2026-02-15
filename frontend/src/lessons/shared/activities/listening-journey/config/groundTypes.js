// 5 ground CSS definitions — bottom 12% strip, scrolls at 1.0x speed
// Textures use wider bands for visibility on Chromebook screens

const GROUND_TYPES = [
  {
    id: 'grass',
    name: 'Grass',
    background: '#2D5A27',
    texture: 'repeating-linear-gradient(90deg, #2D5A27 0px, #357A2E 8px, #2D5A27 12px, #245020 16px, #2D5A27 20px), linear-gradient(180deg, #3A7D32 0%, #2D5A27 30%, #1E4420 100%)',
    topEdge: '#4CAF50'
  },
  {
    id: 'pavement',
    name: 'Pavement',
    background: '#3D3D3D',
    texture: 'repeating-linear-gradient(90deg, #3D3D3D 0px, #4A4A4A 20px, #3D3D3D 22px, #333 40px), repeating-linear-gradient(0deg, transparent 0px, transparent 18px, #555 19px, transparent 20px)',
    topEdge: '#888'
  },
  {
    id: 'rock',
    name: 'Rock',
    background: '#5C5C5C',
    texture: 'repeating-linear-gradient(105deg, #5C5C5C 0px, #6B6B6B 12px, #555 18px, #666 24px), linear-gradient(180deg, #7A7A7A 0%, #5C5C5C 40%, #444 100%)',
    topEdge: '#999'
  },
  {
    id: 'water',
    name: 'Water',
    background: '#1A5276',
    texture: 'repeating-linear-gradient(90deg, #1A5276 0px, #2178A6 14px, #1A5276 20px, #164A6B 28px), linear-gradient(180deg, #2E86C1 0%, #1A5276 50%, #123A5C 100%)',
    topEdge: '#5DADE2'
  },
  {
    id: 'sand',
    name: 'Sand',
    background: '#C2A63D',
    texture: 'repeating-linear-gradient(90deg, #C2A63D 0px, #D4B84A 10px, #B89A30 16px, #C8AE40 22px), linear-gradient(180deg, #D4B84A 0%, #C2A63D 40%, #A08428 100%)',
    topEdge: '#E0CA5E'
  }
];

// Auto-mapping from scene to default ground type
export const SCENE_GROUND_MAP = {
  forest: 'grass',
  city: 'pavement',
  mountains: 'rock',
  ocean: 'water',
  desert: 'sand',
  spaceStation: 'rock',
  'night-mountain': 'rock',
  'dark-forest': 'grass',
  'autumn-forest': 'grass'
};

export const getGroundTypeById = (id) => GROUND_TYPES.find(g => g.id === id) || GROUND_TYPES[0];

export default GROUND_TYPES;
