// 8 sky mood definitions — CSS gradients with transition support
// Sky layer does NOT scroll; it transitions on section change (1.5s ease)

const SKY_MOODS = [
  {
    id: 'clear-day',
    name: 'Clear Day',
    gradient: 'linear-gradient(180deg, #4A90D9 0%, #87CEEB 40%, #B0E0E6 100%)',
    hasStars: false
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    gradient: 'linear-gradient(180deg, #FF6B35 0%, #F7931E 30%, #FFD700 70%, #FFF8DC 100%)',
    hasStars: false
  },
  {
    id: 'stormy',
    name: 'Stormy',
    gradient: 'linear-gradient(180deg, #2C3E50 0%, #4A5568 40%, #718096 100%)',
    hasStars: false
  },
  {
    id: 'night',
    name: 'Night',
    gradient: 'linear-gradient(180deg, #0B0D17 0%, #1A1A2E 40%, #16213E 100%)',
    hasStars: true
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    gradient: 'linear-gradient(180deg, #2D1B69 0%, #E74C3C 30%, #F39C12 60%, #F1C40F 100%)',
    hasStars: false
  },
  {
    id: 'overcast',
    name: 'Overcast',
    gradient: 'linear-gradient(180deg, #9E9E9E 0%, #BDBDBD 40%, #CFD8DC 100%)',
    hasStars: false
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    gradient: 'linear-gradient(180deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    hasStars: true
  },
  {
    id: 'aurora',
    name: 'Aurora',
    gradient: 'linear-gradient(180deg, #0B0D17 0%, #1B4332 30%, #2D6A4F 50%, #40916C 70%, #0B0D17 100%)',
    hasStars: true
  }
];

export const getSkyMoodById = (id) => SKY_MOODS.find(s => s.id === id) || SKY_MOODS[0];

export default SKY_MOODS;
