// src/components/exercises/1.solfege_identification/Hooks/useResponsiveMusic.js
import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive music notation components
 * Provides device type detection and responsive utilities
 */
export default function useResponsiveMusic({ 
  defaultValue = 'desktop',
  breakpoints = {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)'
  }
} = {}) {
  const [deviceType, setDeviceType] = useState(() => {
    // SSR-safe initialization
    if (typeof window === 'undefined') return defaultValue;
    
    if (window.matchMedia(breakpoints.mobile).matches) return 'mobile';
    if (window.matchMedia(breakpoints.tablet).matches) return 'tablet';
    return 'desktop';
  });
  
  useEffect(() => {
    const updateDeviceType = () => {
      if (window.matchMedia(breakpoints.mobile).matches) {
        setDeviceType('mobile');
      } else if (window.matchMedia(breakpoints.tablet).matches) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // Create media query listeners
    const mediaQueries = Object.values(breakpoints).map(query => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', updateDeviceType);
      return mq;
    });
    
    // Cleanup listeners on unmount
    return () => {
      mediaQueries.forEach(mq => 
        mq.removeEventListener('change', updateDeviceType)
      );
    };
  }, [breakpoints]);
  
  // Music-specific responsive configurations
  const musicConfig = {
    mobile: {
      staffWidth: '100%',
      staffHeight: 280,
      measuresPerLine: 2,
      buttonSize: 'lg',
      touchOptimized: true,
      fontSize: 'sm'
    },
    tablet: {
      staffWidth: '100%',
      staffHeight: 320,
      measuresPerLine: 4,
      buttonSize: 'md',
      touchOptimized: true,
      fontSize: 'base'
    },
    desktop: {
      staffWidth: '100%',
      staffHeight: 350,
      measuresPerLine: 6,
      buttonSize: 'md',
      touchOptimized: false,
      fontSize: 'base'
    }
  };
  
  return {
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    config: musicConfig[deviceType],
    // Utility functions
    getStaffDimensions: () => ({
      width: musicConfig[deviceType].staffWidth,
      height: musicConfig[deviceType].staffHeight
    }),
    getMeasuresPerLine: () => musicConfig[deviceType].measuresPerLine,
    shouldOptimizeTouch: () => deviceType !== 'desktop'
  };
}