/**
 * FILE: monster-melody-maker/components/StageBackground.jsx
 * Animated themed backgrounds (Space, Forest, Ocean, etc.)
 */

import React from 'react';
import styles from './StageBackground.module.css';

const StageBackground = ({ theme = 'space', children }) => {
  // Get theme-specific elements
  const renderThemeElements = () => {
    switch (theme) {
      case 'space':
        return (
          <>
            <div className={styles.stars}>
              {Array.from({ length: 50 }, (_, i) => (
                <div 
                  key={i} 
                  className={styles.star}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            <div className={styles.planet} />
            <div className={styles.moon} />
          </>
        );
        
      case 'forest':
        return (
          <>
            <div className={styles.trees}>
              <div className={`${styles.tree} ${styles.tree1}`} />
              <div className={`${styles.tree} ${styles.tree2}`} />
              <div className={`${styles.tree} ${styles.tree3}`} />
            </div>
            <div className={styles.grass} />
            <div className={styles.fireflies}>
              {Array.from({ length: 8 }, (_, i) => (
                <div 
                  key={i}
                  className={styles.firefly}
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${Math.random() * 4}s`
                  }}
                />
              ))}
            </div>
          </>
        );
        
      case 'ocean':
        return (
          <>
            <div className={styles.waves}>
              <div className={`${styles.wave} ${styles.wave1}`} />
              <div className={`${styles.wave} ${styles.wave2}`} />
              <div className={`${styles.wave} ${styles.wave3}`} />
            </div>
            <div className={styles.bubbles}>
              {Array.from({ length: 12 }, (_, i) => (
                <div 
                  key={i}
                  className={styles.bubble}
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 3}s`
                  }}
                />
              ))}
            </div>
            <div className={styles.seaweed}>
              <div className={`${styles.seaweedStrand} ${styles.seaweed1}`} />
              <div className={`${styles.seaweedStrand} ${styles.seaweed2}`} />
              <div className={`${styles.seaweedStrand} ${styles.seaweed3}`} />
            </div>
          </>
        );
        
      case 'candy':
        return (
          <>
            <div className={styles.candyElements}>
              <div className={`${styles.lollipop} ${styles.lollipop1}`}>🍭</div>
              <div className={`${styles.lollipop} ${styles.lollipop2}`}>🍬</div>
              <div className={`${styles.lollipop} ${styles.lollipop3}`}>🍭</div>
            </div>
            <div className={styles.sprinkles}>
              {Array.from({ length: 20 }, (_, i) => (
                <div 
                  key={i}
                  className={styles.sprinkle}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1'][Math.floor(Math.random() * 5)],
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
            <div className={styles.clouds}>
              <div className={`${styles.cloud} ${styles.cloud1}`} />
              <div className={`${styles.cloud} ${styles.cloud2}`} />
            </div>
          </>
        );
        
      case 'neon':
        return (
          <>
            <div className={styles.neonGrid} />
            <div className={styles.neonGlow}>
              <div className={`${styles.neonShape} ${styles.neonCircle}`} />
              <div className={`${styles.neonShape} ${styles.neonTriangle}`} />
              <div className={`${styles.neonShape} ${styles.neonSquare}`} />
            </div>
            <div className={styles.scanlines} />
          </>
        );
        
      case 'sunset':
        return (
          <>
            <div className={styles.sun} />
            <div className={styles.mountainRange}>
              <div className={`${styles.mountain} ${styles.mountain1}`} />
              <div className={`${styles.mountain} ${styles.mountain2}`} />
              <div className={`${styles.mountain} ${styles.mountain3}`} />
            </div>
            <div className={styles.birds}>
              <span className={styles.bird}>🐦</span>
              <span className={styles.bird}>🐦</span>
              <span className={styles.bird}>🐦</span>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.stage} ${styles[theme]}`}>
      <div className={styles.backdrop}>
        {renderThemeElements()}
      </div>
      <div className={styles.spotlight} />
      <div className={styles.stageFloor} />
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default StageBackground;