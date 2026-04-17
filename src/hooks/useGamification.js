import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'mathninja_user_progress';

const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const getXPForNextLevel = (currentLevel) => {
  return Math.pow(currentLevel, 2) * 100;
};

const defaultState = {
  xp: 0,
  level: 1,
  gamesPlayed: 0,
  history: []
};

export function useGamification() {
  const [progress, setProgress] = useState(defaultState);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing progress', e);
      }
    }
  }, []);

  const saveProgress = (newState) => {
    setProgress(newState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
  };

  const addXP = useCallback((amount, gameName, score) => {
    setProgress(prevProgress => {
      const newXp = prevProgress.xp + amount;
      const newLevel = calculateLevel(newXp);
      
      const newState = {
        ...prevProgress,
        xp: newXp,
        level: newLevel,
        gamesPlayed: prevProgress.gamesPlayed + 1,
        history: [
          { gameName, score, xpEarned: amount, date: new Date().toISOString() },
          ...prevProgress.history
        ].slice(0, 50)
      };
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  return {
    progress,
    addXP,
    xpToNext: getXPForNextLevel(progress.level) - progress.xp,
    totalXpForNextLevel: getXPForNextLevel(progress.level) - getXPForNextLevel(progress.level - 1)
  };
}
