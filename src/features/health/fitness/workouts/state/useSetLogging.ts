import { useState } from 'react';

export function useStartSetLogging() {
  const [isLogging, setIsLogging] = useState(false);
  
  return {
    isLogging,
    setIsLogging,
  };
}