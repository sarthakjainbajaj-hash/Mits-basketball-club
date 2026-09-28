import React, { createContext, useContext, useState } from 'react';
import soundService from '../services/soundService';

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => soundService.isEnabled());

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    soundService.setEnabled(nextVal);
    setSoundEnabled(nextVal);
    if (nextVal) {
      soundService.playClick();
    }
  };

  const playShotClockBuzzer = () => soundService.playShotClockBuzzer();
  const playGameEndHorn = () => soundService.playGameEndHorn();
  const playWhistle = () => soundService.playWhistle();
  const playClick = () => soundService.playClick();

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playShotClockBuzzer,
        playGameEndHorn,
        playWhistle,
        playClick,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export default SoundContext;
