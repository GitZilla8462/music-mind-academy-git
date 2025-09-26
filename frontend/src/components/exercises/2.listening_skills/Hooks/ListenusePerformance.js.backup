// /src/components/exercises/2.listening_skills/Hooks/ListenusePerformance.js
import { useState, useEffect, useRef } from 'react';

export const usePerformance = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    frameRate: 60,
    memoryUsage: 0,
    isLowPerformance: false
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef(null);

  useEffect(() => {
    let fpsArray = [];
    
    const measurePerformance = (currentTime) => {
      frameCount.current++;
      
      // Calculate FPS every second
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        fpsArray.push(fps);
        
        // Keep only last 5 measurements
        if (fpsArray.length > 5) {
          fpsArray.shift();
        }
        
        const avgFps = fpsArray.reduce((a, b) => a + b, 0) / fpsArray.length;
        
        // Get memory usage if available
        let memoryUsage = 0;
        if (performance.memory) {
          memoryUsage = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
        }
        
        // Determine if device is low performance
        const isLowPerformance = avgFps < 30 || memoryUsage > 80;
        
        setPerformanceMetrics({
          frameRate: Math.round(avgFps),
          memoryUsage,
          isLowPerformance
        });
        
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationFrameId.current = requestAnimationFrame(measurePerformance);
    };
    
    // Start monitoring
    animationFrameId.current = requestAnimationFrame(measurePerformance);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return performanceMetrics;
};

// Hook for adaptive quality based on performance
export const useAdaptiveQuality = () => {
  const { frameRate, isLowPerformance } = usePerformance();
  
  const getOptimalSettings = () => {
    if (isLowPerformance || frameRate < 30) {
      return {
        useVexFlow: false, // Use canvas fallback
        animationDuration: 100, // Faster animations
        audioQuality: 'low', // Lower audio quality
        enableEffects: false // Disable visual effects
      };
    } else if (frameRate < 45) {
      return {
        useVexFlow: true,
        animationDuration: 150,
        audioQuality: 'medium',
        enableEffects: true
      };
    } else {
      return {
        useVexFlow: true,
        animationDuration: 200,
        audioQuality: 'high',
        enableEffects: true
      };
    }
  };

  return {
    ...getOptimalSettings(),
    frameRate,
    isLowPerformance
  };
};