import React from 'react';

const BackgroundVideo = ({ videoId, overlay = 'rgba(0,0,0,0.35)', children }) => {
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&disablekb=1`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <iframe
          src={src}
          title="Background Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            // Cover technique for iframes (works across modern browsers)
            width: '100vw',
            height: '56.25vw', // 9/16 of width
            minWidth: '177.78vh', // 16/9 of height
            minHeight: '100vh',
          }}
        />
        {overlay && (
          <div style={{ position: 'absolute', inset: 0, background: overlay }} />
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundVideo;
