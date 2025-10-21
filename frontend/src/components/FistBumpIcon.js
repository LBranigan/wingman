import React, { useState } from 'react';

const FistBumpIcon = ({ size = 32, className = '' }) => {
  const [isBumping, setIsBumping] = useState(false);

  const handleClick = () => {
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 600);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block'
      }}
    >
      <img
        src="https://user-gen-media-assets.s3.amazonaws.com/seedream_images/28723c11-4811-4644-af28-817030430f37.png"
        alt="Fist Bump"
        width={size}
        height={size}
        className={className}
        style={{
          display: 'block',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          padding: '4px',
          animation: isBumping ? 'fistBump 0.6s ease-in-out' : 'none',
          transformOrigin: 'center'
        }}
      />
      <style>{`
        @keyframes fistBump {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(0.85) translateX(-3px);
          }
          50% {
            transform: scale(1.1) translateX(0px);
          }
          75% {
            transform: scale(0.95) translateX(3px);
          }
          100% {
            transform: scale(1) translateX(0px);
          }
        }
      `}</style>
    </div>
  );
};

export default FistBumpIcon;
