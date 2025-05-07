import React from 'react';

const VolumeSlider = ({ volume, setVolume }) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4">
      <input
        type="range"
        min="none"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-full accent-purple-500"
      />
    </div>
  );
};

export default VolumeSlider;