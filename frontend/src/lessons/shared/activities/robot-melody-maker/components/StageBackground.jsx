/**
 * FILE: monster-melody-maker/components/StageBackground.jsx
 * Animated themed backgrounds with perspective stage floors
 */

import React, { useMemo } from 'react';
import styles from './StageBackground.module.css';

const StageBackground = ({ theme = 'space', children }) => {
  // Generate stable random positions using useMemo
  const randomPositions = useMemo(() => {
    const generatePositions = (count, seed) => {
      const positions = [];
      for (let i = 0; i < count; i++) {
        const x = ((i * 17 + seed * 31) % 100);
        const y = ((i * 23 + seed * 13) % 100);
        const delay = ((i * 7 + seed * 11) % 50) / 10;
        const duration = 1 + ((i * 13 + seed * 19) % 30) / 10;
        positions.push({ x, y, delay, duration });
      }
      return positions;
    };

    return {
      stars: generatePositions(50, 1),
      bubbles: generatePositions(12, 2),
      fireflies: generatePositions(8, 3),
      sprinkles: generatePositions(20, 4),
      snow: generatePositions(30, 5),
      rain: generatePositions(40, 6),
      confetti: generatePositions(25, 7),
      leaves: generatePositions(15, 8),
      ash: generatePositions(20, 9),
    };
  }, []);

  // Get theme-specific elements (background decorations)
  const renderThemeElements = () => {
    switch (theme) {
      case 'space':
        return (
          <>
            <div className={styles.stars}>
              {randomPositions.stars.map((pos, i) => (
                <div 
                  key={i} 
                  className={styles.star}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y * 0.6}%`,
                    animationDelay: `${pos.delay}s`,
                    animationDuration: `${pos.duration}s`
                  }}
                />
              ))}
            </div>
            <div className={styles.planet} />
            <div className={styles.spaceStation} />
          </>
        );
        
      case 'arcade':
        return (
          <>
            <div className={styles.neonGlow}>
              <div className={`${styles.neonShape} ${styles.neonCircle}`} />
              <div className={`${styles.neonShape} ${styles.neonTriangle}`} />
              <div className={`${styles.neonShape} ${styles.neonSquare}`} />
            </div>
            <div className={styles.scanlines} />
          </>
        );
        
      case 'forest':
        return (
          <>
            <div className={styles.forestTrees} />
            <div className={styles.forestMist} />
            <div className={styles.fireflies}>
              {randomPositions.fireflies.slice(0, 6).map((pos, i) => (
                <div
                  key={i}
                  className={styles.firefly}
                  style={{
                    left: `${10 + pos.x * 0.8}%`,
                    top: `${10 + pos.y * 0.4}%`,
                    animationDelay: `${pos.delay}s`
                  }}
                />
              ))}
            </div>
          </>
        );
        
      case 'ocean':
        return (
          <>
            <div className={styles.oceanRays} />
            <div className={styles.bubbles}>
              {randomPositions.bubbles.map((pos, i) => (
                <div
                  key={i}
                  className={styles.bubble}
                  style={{
                    left: `${pos.x}%`,
                    animationDelay: `${pos.delay}s`,
                    animationDuration: `${3 + pos.duration}s`
                  }}
                />
              ))}
            </div>
            <div className={styles.seaweed} />
          </>
        );
        
      case 'candy':
        return (
          <>
            <div className={styles.candyClouds}>
              <div className={`${styles.candyCloud} ${styles.candyCloud1}`} />
              <div className={`${styles.candyCloud} ${styles.candyCloud2}`} />
              <div className={`${styles.candyCloud} ${styles.candyCloud3}`} />
            </div>
            <div className={styles.candyStripes} />
          </>
        );
        
      case 'sunset':
        return (
          <>
            <div className={styles.sun} />
            <div className={styles.birds}>
              <div className={`${styles.bird} ${styles.bird1}`} />
              <div className={`${styles.bird} ${styles.bird2}`} />
              <div className={`${styles.bird} ${styles.bird3}`} />
            </div>
          </>
        );

      case 'volcano':
        return (
          <>
            <div className={styles.lavaGlow} />
            <div className={styles.lavaSplash} />
          </>
        );

      case 'haunted':
        return (
          <>
            <div className={styles.spookyMoon} />
            <div className={styles.deadTrees}>
              <div className={`${styles.deadTree} ${styles.deadTree1}`} />
              <div className={`${styles.deadTree} ${styles.deadTree2}`} />
            </div>
            <div className={styles.bats}>
              <div className={`${styles.bat} ${styles.bat1}`} />
              <div className={`${styles.bat} ${styles.bat2}`} />
              <div className={`${styles.bat} ${styles.bat3}`} />
            </div>
            <div className={styles.fog} />
          </>
        );

      case 'city':
        return (
          <>
            <div className={styles.citySkyline} />
            <div className={styles.cityWindows} />
          </>
        );

      case 'beach':
        return (
          <>
            <div className={styles.beachSun} />
            <div className={styles.beachWaves} />
            <div className={styles.beachSand} />
          </>
        );

      case 'arctic':
        return (
          <>
            <div className={styles.northernLights} />
            <div className={styles.snowfall}>
              {randomPositions.snow.slice(0, 15).map((pos, i) => (
                <div
                  key={i}
                  className={styles.snowflake}
                  style={{
                    left: `${pos.x}%`,
                    animationDelay: `${pos.delay}s`,
                    animationDuration: `${3 + pos.duration}s`
                  }}
                />
              ))}
            </div>
            <div className={styles.iceberg} />
          </>
        );

      case 'jungle':
        return (
          <>
            <div className={styles.jungleCanopy} />
            <div className={styles.jungleVines}>
              <div className={`${styles.vine} ${styles.vine1}`} />
              <div className={`${styles.vine} ${styles.vine2}`} />
              <div className={`${styles.vine} ${styles.vine3}`} />
            </div>
          </>
        );

      case 'storm':
        return (
          <>
            <div className={styles.stormClouds} />
            <div className={styles.lightning} />
            <div className={styles.raindrops}>
              {randomPositions.rain.slice(0, 12).map((pos, i) => (
                <div
                  key={i}
                  className={styles.raindrop}
                  style={{
                    left: `${pos.x}%`,
                    animationDelay: `${pos.delay * 0.1}s`,
                    animationDuration: `${0.5 + pos.duration * 0.1}s`
                  }}
                />
              ))}
            </div>
          </>
        );

      case 'pixel':
        return (
          <>
            <div className={styles.pixelClouds}>
              <div className={`${styles.pixelCloud} ${styles.pixelCloud1}`} />
              <div className={`${styles.pixelCloud} ${styles.pixelCloud2}`} />
            </div>
            <div className={styles.pixelBlocks}>
              <div className={`${styles.pixelBlock} ${styles.pixelBlock1}`} />
              <div className={`${styles.pixelBlock} ${styles.pixelBlock2}`} />
            </div>
          </>
        );

      case 'concert':
        return (
          <>
            <div className={styles.stageLights}>
              <div className={`${styles.stageLight} ${styles.stageLight1}`} />
              <div className={`${styles.stageLight} ${styles.stageLight2}`} />
              <div className={`${styles.stageLight} ${styles.stageLight3}`} />
            </div>
            <div className={styles.spotlightBeams} />
          </>
        );

      case 'station':
        return (
          <>
            <div className={styles.stationWindow} />
            <div className={styles.stationPanels} />
            <div className={styles.stationLights}>
              <div className={`${styles.stationLight} ${styles.stationLight1}`} />
              <div className={`${styles.stationLight} ${styles.stationLight2}`} />
              <div className={`${styles.stationLight} ${styles.stationLight3}`} />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.stage} ${styles[theme]}`}>
      {/* Background decorations */}
      <div className={styles.backdrop}>
        {renderThemeElements()}
      </div>
      
      {/* Perspective floor that recedes into distance */}
      <div className={styles.floorContainer}>
        <div className={styles.floorSurface} />
      </div>
      
      {/* Front edge of stage */}
      <div className={styles.stageEdge} />
      
      {/* Spotlight effect */}
      <div className={styles.spotlight} />
      
      {/* Robot stands here */}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default StageBackground;