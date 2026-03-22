import React from 'react';
import { getBandcampEmbedUrl } from './artistDatabase';

// CSS dimensions for our container
const SIZE_DIMS = {
  small: { height: '46px' },
  mini: { height: '42px' },
  medium: { height: '120px' },
  compact: { height: '340px' },
  large: { height: '470px' },
};

// What Bandcamp actually accepts in the URL (only 'small' or 'large')
const BANDCAMP_SIZE = {
  small: 'small',
  mini: 'small',
  medium: 'large',
  compact: 'large',
  large: 'large',
};

const BandcampEmbed = ({
  albumId,
  size = 'large',
  bgColor = '181922',
  linkColor = '056cc4',
  tracklist = false,
  className = '',
}) => {
  if (!albumId) return null;

  const bandcampSize = BANDCAMP_SIZE[size] || 'large';
  const src = getBandcampEmbedUrl(albumId, { size: bandcampSize, bgColor, linkColor, tracklist });
  const dims = SIZE_DIMS[size] || SIZE_DIMS.large;

  return (
    <div className={`bandcamp-embed ${className}`} style={{ overflow: 'hidden', height: dims.height }}>
      <iframe
        style={{ border: 0, width: '100%', height: '470px' }}
        src={src}
        title="Bandcamp Player"
        allow="autoplay; encrypted-media"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default BandcampEmbed;
