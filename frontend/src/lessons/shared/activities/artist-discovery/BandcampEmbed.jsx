import React from 'react';
import { getBandcampEmbedUrl } from './artistDatabase';

const SIZE_DIMS = {
  small: { width: '100%', height: '42px' },
  mini: { width: '100%', height: '42px' },
  medium: { width: '100%', height: '120px' },
  large: { width: '100%', height: '470px' },
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

  const src = getBandcampEmbedUrl(albumId, { size, bgColor, linkColor, tracklist });
  const dims = SIZE_DIMS[size] || SIZE_DIMS.large;

  return (
    <div className={`bandcamp-embed ${className}`}>
      <iframe
        style={{ border: 0, width: dims.width, height: dims.height }}
        src={src}
        seamless
        title="Bandcamp Player"
        allow="autoplay"
        loading="lazy"
      />
    </div>
  );
};

export default BandcampEmbed;
