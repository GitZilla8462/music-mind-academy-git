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
            <div className={styles.trees}>
              <div className={`${styles.tree} ${styles.tree1}`} />
              <div className={`${styles.tree} ${styles.tree2}`} />
              <div className={`${styles.tree} ${styles.tree3}`} />
              <div className={`${styles.tree} ${styles.tree4}`} />
            </div>
            <div className={styles.fireflies}>
              {randomPositions.fireflies.map((pos, i) => (
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
            <div className={styles.fish}>🐠</div>
            <div className={styles.fish2}>🐟</div>
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
              {randomPositions.sprinkles.map((pos, i) => (
                <div 
                  key={i}
                  className={styles.sprinkle}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y * 0.5}%`,
                    backgroundColor: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1'][i % 5],
                    transform: `rotate(${pos.delay * 72}deg)`
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
        
      case 'sunset':
        return (
          <>
            <div className={styles.sun} />
            <div className={styles.birds}>
              <span className={styles.bird}>🐦</span>
              <span className={styles.bird}>🐦</span>
              <span className={styles.bird}>🐦</span>
            </div>
          </>
        );

      case 'volcano':
        return (
          <>
            <div className={styles.volcanoMountain} />
            <div className={styles.lavaGlow} />
            <div className={styles.ashParticles}>
              {randomPositions.ash.map((pos, i) => (
                <div 
                  key={i}
                  className={styles.ash}
                  style={{
                    left: `${pos.x}%`,
                    animationDelay: `${pos.delay}s`,
                    animationDuration: `${2 + pos.duration}s`
                  }}
                />
              ))}
            </div>
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
              <span className={styles.bat}>🦇</span>
              <span className={styles.bat}>🦇</span>
              <span className={styles.bat}>🦇</span>
            </div>
            <div className={styles.fog} />
          </>
        );

      case 'city':
        return (
          <>
            <div className={styles.cityscape}>
              <div className={`${styles.building} ${styles.building1}`} />
              <div className={`${styles.building} ${styles.building2}`} />
              <div className={`${styles.building} ${styles.building3}`} />
              <div className={`${styles.building} ${styles.building4}`} />
              <div className={`${styles.building} ${styles.building5}`} />
            </div>
            <div className={styles.cityLights}>
              {randomPositions.stars.slice(0, 20).map((pos, i) => (
                <div 
                  key={i}
                  className={styles.cityLight}
                  style={{
                    left: `${pos.x}%`,
                    top: `${15 + pos.y * 0.35}%`,
                    animationDelay: `${pos.delay}s`
                  }}
                />
              ))}
            </div>
          </>
        );

      case 'beach':
        return (
          <>
            <div className={styles.beachSun} />
            <div className={styles.palmTrees}>
              <div className={`${styles.palm} ${styles.palm1}`}>🌴</div>
              <div className={`${styles.palm} ${styles.palm2}`}>🌴</div>
            </div>
            <div className={styles.beachWaves} />
            <div className={styles.umbrella}>🏖️</div>
          </>
        );

      case 'arctic':
        return (
          <>
            <div className={styles.northernLights} />
            <div className={styles.snowfall}>
              {randomPositions.snow.map((pos, i) => (
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
            <div className={styles.penguin}>🐧</div>
          </>
        );

      case 'jungle':
        return (
          <>
            <div className={styles.jungleVines}>
              <div className={`${styles.vine} ${styles.vine1}`} />
              <div className={`${styles.vine} ${styles.vine2}`} />
              <div className={`${styles.vine} ${styles.vine3}`} />
            </div>
            <div className={styles.jungleLeaves}>
              {randomPositions.leaves.map((pos, i) => (
                <div 
                  key={i}
                  className={styles.leaf}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y * 0.25}%`,
                    animationDelay: `${pos.delay}s`
                  }}
                />
              ))}
            </div>
            <div className={styles.parrot}>🦜</div>
            <div className={styles.monkey}>🐒</div>
          </>
        );

      case 'storm':
        return (
          <>
            <div className={styles.stormClouds} />
            <div className={styles.lightning} />
            <div className={styles.raindrops}>
              {randomPositions.rain.map((pos, i) => (
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
            <div className={styles.coinBlocks}>
              <div className={`${styles.coinBlock} ${styles.coinBlock1}`}>❓</div>
              <div className={`${styles.coinBlock} ${styles.coinBlock2}`}>❓</div>
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
            <div className={styles.speakers}>
              <div className={`${styles.speaker} ${styles.speakerLeft}`}>🔊</div>
              <div className={`${styles.speaker} ${styles.speakerRight}`}>🔊</div>
            </div>
            <div className={styles.confettiContainer}>
              {randomPositions.confetti.map((pos, i) => (
                <div 
                  key={i}
                  className={styles.confettiPiece}
                  style={{
                    left: `${pos.x}%`,
                    backgroundColor: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#fff'][i % 6],
                    animationDelay: `${pos.delay}s`,
                    animationDuration: `${2 + pos.duration}s`
                  }}
                />
              ))}
            </div>
          </>
        );

      case 'station':
        return (
          <>
            <div className={styles.spaceWindow}>
              <div className={styles.earth} />
            </div>
            <div className={styles.stationLights}>
              <div className={`${styles.stationLight} ${styles.stationLight1}`} />
              <div className={`${styles.stationLight} ${styles.stationLight2}`} />
            </div>
            <div className={styles.floatingItems}>
              <span className={styles.floatItem}>🛸</span>
              <span className={styles.floatItem}>⭐</span>
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