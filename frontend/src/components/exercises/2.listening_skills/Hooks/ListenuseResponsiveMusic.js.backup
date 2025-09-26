// /src/components/exercises/2.listening_skills/Hooks/ListenuseResponsiveMusic.js
import { useState, useEffect, useCallback } from 'react';

export const useResponsiveMusic = () => {
  const [dimensions, setDimensions] = useState({
    width: 320,
    height: 140
  });
  const [deviceType, setDeviceType] = useState('desktop');
  const [orientation, setOrientation] = useState('portrait');

  const updateDimensions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspectRatio = screenWidth / screenHeight;
    const isLandscape = aspectRatio > 1.3;
    
    // Detect device type more accurately
    const isMobile = screenWidth < 640 || (window.navigator && /Mobi|Android/i.test(window.navigator.userAgent));
    const isTablet = screenWidth >= 640 && screenWidth < 1024 && !isMobile;
    const isDesktop = screenWidth >= 1024;
    
    // Set device type
    let currentDeviceType = 'mobile';
    if (isTablet) currentDeviceType = 'tablet';
    if (isDesktop) currentDeviceType = 'desktop';
    
    setDeviceType(currentDeviceType);
    setOrientation(isLandscape ? 'landscape' : 'portrait');
    
    // Responsive dimensions with better optimization
    if (isMobile) {
      if (isLandscape) {
        // Mobile landscape - use more width, less height
        setDimensions({
          width: Math.min(400, screenWidth - 20),
          height: 100
        });
      } else {
        // Mobile portrait - compact size
        setDimensions({
          width: Math.min(280, screenWidth - 20),
          height: 110
        });
      }
    } else if (isTablet) {
      if (isLandscape) {
        // Tablet landscape - larger dimensions
        setDimensions({
          width: Math.min(450, screenWidth * 0.4),
          height: 140
        });
      } else {
        // Tablet portrait
        setDimensions({
          width: Math.min(350, screenWidth * 0.45),
          height: 130
        });
      }
    } else {
      // Desktop - optimal viewing size
      setDimensions({
        width: Math.min(380, screenWidth * 0.25),
        height: 160
      });
    }
  }, []);

  useEffect(() => {
    // Set initial dimensions
    updateDimensions();

    // Debounced resize listener for better performance
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 150);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', updateDimensions);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', updateDimensions);
      clearTimeout(timeoutId);
    };
  }, [updateDimensions]);

  return { 
    dimensions, 
    deviceType, 
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isLandscape: orientation === 'landscape'
  };
};