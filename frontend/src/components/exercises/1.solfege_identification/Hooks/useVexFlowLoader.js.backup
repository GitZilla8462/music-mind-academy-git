import { useState, useEffect } from 'react';

const useVexFlowLoader = () => {
  const [vexflowLoaded, setVexflowLoaded] = useState(false);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [loadingError, setLoadingError] = useState('');

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        if (window.Vex?.Flow) {
          resolve();
        } else {
          // Script exists but VexFlow not loaded, remove and try again
          existingScript.remove();
        }
      }

      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        // Give it a moment for the library to initialize
        setTimeout(() => {
          if (window.Vex?.Flow) {
            resolve();
          } else {
            reject(new Error('VexFlow not found after script load'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        script.remove();
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (window.Vex?.Flow) {
      console.log('VexFlow already loaded');
      setVexflowLoaded(true);
      return;
    }

    const tryLoadVexFlow = async () => {
      // Updated CDN URLs that actually work in 2025
      const cdnUrls = [
        'https://cdn.jsdelivr.net/npm/vexflow@5.0.0/build/cjs/vexflow.js',
        'https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js',
        'https://unpkg.com/vexflow@5.0.0/build/cjs/vexflow.js',
        'https://unpkg.com/vexflow@4.2.2/build/cjs/vexflow.js',
        'https://cdnjs.cloudflare.com/ajax/libs/vexflow/1.2.93/vexflow-min.js'
      ];

      for (const url of cdnUrls) {
        try {
          console.log(`Trying to load VexFlow from: ${url}`);
          await loadScript(url);
          
          // Check if VexFlow is actually available
          if (window.Vex?.Flow) {
            console.log('VexFlow loaded successfully from:', url);
            setVexflowLoaded(true);
            setLoadingError('');
            return;
          } else {
            console.warn(`Script loaded but VexFlow not found for: ${url}`);
          }
        } catch (error) {
          console.warn(`Failed to load VexFlow from ${url}:`, error);
        }
      }

      console.log('All VexFlow CDN sources failed, using canvas fallback');
      setLoadingError('VexFlow CDN loading failed');
      setUseCanvasFallback(true);
    };

    tryLoadVexFlow();
  }, []);

  return {
    vexflowLoaded,
    useCanvasFallback,
    loadingError
  };
};

export default useVexFlowLoader;