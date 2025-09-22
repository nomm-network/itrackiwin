import { useState, useEffect, useCallback, useRef } from "react";

export interface RestTimerState {
  remainingSeconds: number;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  totalSeconds: number;
}

export interface RestTimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  adjust: (seconds: number) => void;
  setDuration: (seconds: number) => void;
}

export const useRestTimer = (
  initialSeconds: number = 180,
  onComplete?: () => void,
  playNotificationSound: boolean = true
) => {
  const [state, setState] = useState<RestTimerState>({
    remainingSeconds: initialSeconds,
    isActive: false,
    isPaused: true,
    isCompleted: false,
    totalSeconds: initialSeconds,
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();

  // Initialize audio
  useEffect(() => {
    if (playNotificationSound) {
      // Create a simple notification sound using Web Audio API
      const createNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      };

      audioRef.current = { play: createNotificationSound } as any;
    }
  }, [playNotificationSound]);

  // Timer effect
  useEffect(() => {
    if (state.isActive && !state.isPaused && state.remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newRemaining = prev.remainingSeconds - 1;
          
          if (newRemaining <= 0) {
            // Timer completed
            if (audioRef.current && playNotificationSound) {
              try {
                audioRef.current.play();
              } catch (error) {
                console.warn("Could not play notification sound:", error);
              }
            }
            
            if (onComplete) {
              onComplete();
            }
            
            return {
              ...prev,
              remainingSeconds: 0,
              isActive: false,
              isPaused: true,
              isCompleted: true,
            };
          }
          
          return {
            ...prev,
            remainingSeconds: newRemaining,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.isPaused, state.remainingSeconds, onComplete, playNotificationSound]);

  const actions: RestTimerActions = {
    start: useCallback(() => {
      setState(prev => ({
        ...prev,
        isActive: true,
        isPaused: false,
        isCompleted: false,
      }));
    }, []),

    pause: useCallback(() => {
      setState(prev => ({
        ...prev,
        isPaused: true,
      }));
    }, []),

    reset: useCallback(() => {
      setState(prev => ({
        ...prev,
        remainingSeconds: prev.totalSeconds,
        isActive: false,
        isPaused: true,
        isCompleted: false,
      }));
    }, []),

    skip: useCallback(() => {
      setState(prev => ({
        ...prev,
        remainingSeconds: 0,
        isActive: false,
        isPaused: true,
        isCompleted: true,
      }));
      
      if (onComplete) {
        onComplete();
      }
    }, [onComplete]),

    adjust: useCallback((seconds: number) => {
      setState(prev => {
        const newTotal = Math.max(30, prev.totalSeconds + seconds);
        const newRemaining = Math.max(0, Math.min(prev.remainingSeconds + seconds, newTotal));
        
        return {
          ...prev,
          totalSeconds: newTotal,
          remainingSeconds: newRemaining,
          isCompleted: newRemaining === 0,
        };
      });
    }, []),

    setDuration: useCallback((seconds: number) => {
      setState(prev => ({
        ...prev,
        totalSeconds: seconds,
        remainingSeconds: seconds,
        isActive: false,
        isPaused: true,
        isCompleted: false,
      }));
    }, []),
  };

  // Update when initialSeconds changes
  useEffect(() => {
    actions.setDuration(initialSeconds);
  }, [initialSeconds, actions.setDuration]);

  return {
    state,
    actions,
  };
};