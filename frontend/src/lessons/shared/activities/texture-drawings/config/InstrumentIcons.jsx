/**
 * InstrumentIcons.jsx - PNG-based icons for listening map stickers
 * 
 * All icons are located in /public/icons/instruments/
 * Only includes instruments with actual PNG files
 */

// Helper component for PNG icons
const PngIcon = ({ src, alt, size = 48 }) => (
  <img 
    src={src} 
    alt={alt} 
    style={{ width: size, height: size, objectFit: 'contain' }} 
  />
);

// String Instruments
export const ViolinIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/violin.png" alt="Violin" size={size} />
);

export const CelloIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/cello.png" alt="Cello" size={size} />
);

export const UprightBassIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/upright-bass.png" alt="Upright Bass" size={size} />
);

export const HarpIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/harp.png" alt="Harp" size={size} />
);

export const AcousticGuitarIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/acoustic-guitar.png" alt="Acoustic Guitar" size={size} />
);

export const ElectricGuitarIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/electric-guitar.png" alt="Electric Guitar" size={size} />
);

// Woodwind Instruments
export const FluteIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/flute.png" alt="Flute" size={size} />
);

export const ClarinetIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/clarinet.png" alt="Clarinet" size={size} />
);

export const OboeIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/oboe.png" alt="Oboe" size={size} />
);

export const SaxophoneIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/saxophone.png" alt="Saxophone" size={size} />
);

// Brass Instruments
export const TrumpetIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/trumpet.png" alt="Trumpet" size={size} />
);

export const TromboneIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/trombone.png" alt="Trombone" size={size} />
);

export const FrenchHornIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/french-horn.png" alt="French Horn" size={size} />
);

export const TubaIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/tuba.png" alt="Tuba" size={size} />
);

// Keyboard Instruments
export const PianoIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/piano.png" alt="Piano" size={size} />
);

export const SynthesizerIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/synthesizer.png" alt="Synthesizer" size={size} />
);

// Percussion Instruments
export const DrumsIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/drumsset.png" alt="Drum Set" size={size} />
);

export const SnareDrumIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/snare-drum.png" alt="Snare Drum" size={size} />
);

export const TimpaniIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/timpani.png" alt="Timpani" size={size} />
);

export const XylophoneIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/xylophone.png" alt="Xylophone" size={size} />
);

export const CymbalsIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/cymbals.png" alt="Cymbals" size={size} />
);

export const TriangleIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/triangle.png" alt="Triangle" size={size} />
);

export const TambourineIcon = ({ size = 48 }) => (
  <PngIcon src="/icons/instruments/tambourine.png" alt="Tambourine" size={size} />
);

// Icon mapping - IDs must match stickers.js
export const INSTRUMENT_ICONS = {
  // Strings
  'violin': ViolinIcon,
  'cello': CelloIcon,
  'upright-bass': UprightBassIcon,
  'harp': HarpIcon,
  'acoustic-guitar': AcousticGuitarIcon,
  'electric-guitar': ElectricGuitarIcon,
  
  // Woodwinds
  'flute': FluteIcon,
  'clarinet': ClarinetIcon,
  'oboe': OboeIcon,
  'saxophone': SaxophoneIcon,
  
  // Brass
  'trumpet': TrumpetIcon,
  'trombone': TromboneIcon,
  'french-horn': FrenchHornIcon,
  'tuba': TubaIcon,
  
  // Keyboards
  'piano': PianoIcon,
  'synthesizer': SynthesizerIcon,
  
  // Percussion
  'drums': DrumsIcon,
  'snare-drum': SnareDrumIcon,
  'timpani': TimpaniIcon,
  'xylophone': XylophoneIcon,
  'cymbals': CymbalsIcon,
  'triangle': TriangleIcon,
  'tambourine': TambourineIcon,
};

// Get icon component by ID
export const getInstrumentIcon = (id) => {
  return INSTRUMENT_ICONS[id] || null;
};