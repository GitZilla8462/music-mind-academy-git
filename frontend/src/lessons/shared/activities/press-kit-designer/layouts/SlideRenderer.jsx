// SlideRenderer — pure render component for press kit slides.
// Used by PresentationMode for fallback rendering when no free-form objects exist.
// Takes slide data and renders the correct layout with the correct palette.

import React from 'react';
import { getPalette } from '../palettes';
import SLIDE_1_LAYOUTS from './Slide1Layouts';
import SLIDE_2_LAYOUTS from './Slide2Layouts';
import SLIDE_3_LAYOUTS from './Slide3Layouts';
import SLIDE_4_LAYOUTS from './Slide4Layouts';
import SLIDE_5_LAYOUTS from './Slide5Layouts';

const LAYOUT_MAPS = {
  1: SLIDE_1_LAYOUTS,
  2: SLIDE_2_LAYOUTS,
  3: SLIDE_3_LAYOUTS,
  4: SLIDE_4_LAYOUTS,
  5: SLIDE_5_LAYOUTS,
};

/**
 * Render a single press kit slide.
 *
 * @param {object} props
 * @param {number} props.slideNumber - 1-5
 * @param {string} props.layout - layout ID (e.g. 'hero-overlay')
 * @param {string} props.paletteId - palette ID (e.g. 'genre', 'midnight')
 * @param {string} props.genre - artist genre (for genre palette)
 * @param {object} props.fields - slide-specific field data
 * @param {object|null} props.image - { url, thumbnailUrl, attribution }
 * @param {string} [props.className] - additional CSS classes
 */
const SlideRenderer = React.memo(function SlideRenderer({
  slideNumber,
  layout,
  paletteId = 'genre',
  genre = '',
  fields = {},
  image = null,
  className = '',
}) {
  const layoutMap = LAYOUT_MAPS[slideNumber];
  if (!layoutMap) return null;

  const LayoutComponent = layoutMap[layout] || Object.values(layoutMap)[0];
  if (!LayoutComponent) return null;

  const palette = getPalette(paletteId, genre);

  return (
    <div className={`w-full h-full ${className}`}>
      <LayoutComponent fields={fields} palette={palette} image={image} />
    </div>
  );
});

export default SlideRenderer;
