// /src/components/exercises/2.listening_skills/Hooks/ListenuseVexFlowLoader.js
import { useState, useEffect } from 'react';

export const useVexFlowLoader = () => {
  const [vexFlowLoaded, setVexFlowLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    const checkVexFlow = () => {
      try {
        // Check if VexFlow is available
        if (typeof window !== 'undefined') {
          // Try to import VexFlow components
          import('vexflow').then((VF) => {
            if (VF.Renderer && VF.Stave && VF.StaveNote && VF.Voice && VF.Formatter) {
              setVexFlowLoaded(true);
              setLoadingError(null);
            } else {
              throw new Error('VexFlow components not fully available');
            }
          }).catch((error) => {
            console.warn('VexFlow import failed:', error);
            setVexFlowLoaded(false);
            setLoadingError(error);
          });
        }
      } catch (error) {
        console.warn('VexFlow check failed:', error);
        setVexFlowLoaded(false);
        setLoadingError(error);
      }
    };

    // Initial check
    checkVexFlow();

    // Retry mechanism with timeout
    const retryTimeout = setTimeout(() => {
      if (!vexFlowLoaded) {
        checkVexFlow();
      }
    }, 1000);

    return () => {
      clearTimeout(retryTimeout);
    };
  }, [vexFlowLoaded]);

  return { 
    vexFlowLoaded, 
    loadingError,
    isLoading: !vexFlowLoaded && !loadingError
  };
};