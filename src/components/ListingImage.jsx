import React, { useEffect, useState } from 'react';

// Shows the listing photo, or a calm placeholder when there is no photo or it fails to load.
export default function ListingImage({src, alt, emoji, className = '', compact = false}){
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  if(src && !broken) return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />;
  return (
    <span className={`image-fallback ${compact ? 'compact' : ''}`} role="img" aria-label={alt ? `${alt}: photo unavailable` : 'Photo unavailable'}>
      <span className="fallback-emoji" aria-hidden="true">{emoji || '📦'}</span>
      {!compact && <span className="fallback-text" aria-hidden="true">{src ? 'Photo unavailable' : 'No photo yet'}</span>}
    </span>
  );
}
