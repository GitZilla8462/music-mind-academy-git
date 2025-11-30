/**
 * FILE: monster-melody-maker/components/MonsterCustomizer.jsx
 * 
 * Inline dropdown customizer - menus expand in sidebar
 * 10+ options per category, designed for middle school students
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from './MonsterCustomizer.module.css';

const MonsterCustomizer = ({ config, onChange, stageTheme, onStageThemeChange, onPreviewDance }) => {
  const [openSection, setOpenSection] = useState(null);
  const previewTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const updateConfig = (key, value) => {
    onChange({ ...config, [key]: value });
    
    // If changing dance style, trigger 3 second preview
    if (key === 'danceStyle' && onPreviewDance) {
      // Clear any existing timeout
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      
      // Start preview
      onPreviewDance(true);
      
      // Stop preview after 3 seconds
      previewTimeoutRef.current = setTimeout(() => {
        onPreviewDance(false);
      }, 3000);
    }
  };

  const handleStageThemeChange = (value) => {
    onStageThemeChange(value);
    // Keep dropdown open so user can browse
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // All options - 10+ each, middle school appropriate
  const options = {
    danceStyle: {
      title: '💃 Dance Style',
      items: [
        { value: 'robot', emoji: '🤖', label: 'Robot' },
        { value: 'disco', emoji: '🕺', label: 'Disco' },
        { value: 'hiphop', emoji: '🎤', label: 'Hip Hop' },
        { value: 'silly', emoji: '🤪', label: 'Goofy' },
        { value: 'wave', emoji: '🌊', label: 'Wave' },
        { value: 'bounce', emoji: '⬆️', label: 'Bounce' },
        { value: 'headbang', emoji: '🎸', label: 'Headbang' },
        { value: 'smooth', emoji: '😎', label: 'Smooth' },
        { value: 'hyper', emoji: '⚡', label: 'Hyper' },
        { value: 'chill', emoji: '🧊', label: 'Chill' },
        { value: 'glitch', emoji: '👾', label: 'Glitch' },
        { value: 'swagger', emoji: '🔥', label: 'Swagger' },
      ],
    },
    bodyShape: {
      title: '🔷 Body Shape',
      items: [
        { value: 'blob', emoji: '🫧', label: 'Blob' },
        { value: 'round', emoji: '⚫', label: 'Round' },
        { value: 'square', emoji: '⬛', label: 'Square' },
        { value: 'triangle', emoji: '🔺', label: 'Triangle' },
        { value: 'fuzzy', emoji: '☁️', label: 'Fuzzy' },
        { value: 'hexagon', emoji: '⬡', label: 'Hexagon' },
        { value: 'star', emoji: '⭐', label: 'Star' },
        { value: 'diamond', emoji: '💎', label: 'Diamond' },
        { value: 'ghost', emoji: '👻', label: 'Ghost' },
        { value: 'spike', emoji: '📍', label: 'Spiky' },
      ],
    },
    bodyColor: {
      title: '🎨 Color',
      items: [
        { value: '#8B5CF6', label: 'Purple' },
        { value: '#3B82F6', label: 'Blue' },
        { value: '#10B981', label: 'Green' },
        { value: '#EC4899', label: 'Pink' },
        { value: '#F97316', label: 'Orange' },
        { value: '#EF4444', label: 'Red' },
        { value: '#14B8A6', label: 'Teal' },
        { value: '#EAB308', label: 'Gold' },
        { value: '#84CC16', label: 'Lime' },
        { value: '#6366F1', label: 'Indigo' },
        { value: '#F43F5E', label: 'Rose' },
        { value: '#06B6D4', label: 'Cyan' },
        { value: '#000000', label: 'Black' },
        { value: '#ffffff', label: 'White' },
        { value: '#7C3AED', label: 'Violet' },
        { value: '#DC2626', label: 'Crimson' },
      ],
    },
    eyeStyle: {
      title: '👁️ Eyes',
      items: [
        { value: 'big', emoji: '👀', label: 'Big' },
        { value: 'cyclops', emoji: '👁️', label: 'Cyclops' },
        { value: 'sleepy', emoji: '😑', label: 'Sleepy' },
        { value: 'angry', emoji: '😠', label: 'Angry' },
        { value: 'multiple', emoji: '🕷️', label: 'Spider' },
        { value: 'robot', emoji: '🤖', label: 'LED' },
        { value: 'cool', emoji: '😎', label: 'Shades' },
        { value: 'hearts', emoji: '😍', label: 'Hearts' },
        { value: 'money', emoji: '🤑', label: 'Money' },
        { value: 'dead', emoji: '💀', label: 'X Eyes' },
        { value: 'laser', emoji: '🔴', label: 'Laser' },
        { value: 'anime', emoji: '✨', label: 'Anime' },
      ],
    },
    mouthStyle: {
      title: '👄 Mouth',
      items: [
        { value: 'happy', emoji: '😊', label: 'Happy' },
        { value: 'toothy', emoji: '😬', label: 'Toothy' },
        { value: 'tongue', emoji: '😛', label: 'Tongue' },
        { value: 'surprised', emoji: '😮', label: 'Surprised' },
        { value: 'grumpy', emoji: '😒', label: 'Grumpy' },
        { value: 'fangs', emoji: '🧛', label: 'Fangs' },
        { value: 'braces', emoji: '🦷', label: 'Braces' },
        { value: 'smile', emoji: '😏', label: 'Smirk' },
        { value: 'drool', emoji: '🤤', label: 'Drool' },
        { value: 'zipper', emoji: '🤐', label: 'Zipper' },
        { value: 'fire', emoji: '🔥', label: 'Fire' },
        { value: 'grill', emoji: '💰', label: 'Grill' },
      ],
    },
    accessory: {
      title: '🎩 Accessory',
      items: [
        { value: 'none', emoji: '❌', label: 'None' },
        { value: 'crown', emoji: '👑', label: 'Crown' },
        { value: 'horns', emoji: '😈', label: 'Horns' },
        { value: 'antenna', emoji: '📡', label: 'Antenna' },
        { value: 'headphones', emoji: '🎧', label: 'Headphones' },
        { value: 'cap', emoji: '🧢', label: 'Cap' },
        { value: 'beanie', emoji: '🎿', label: 'Beanie' },
        { value: 'mohawk', emoji: '🦔', label: 'Mohawk' },
        { value: 'halo', emoji: '😇', label: 'Halo' },
        { value: 'flames', emoji: '🔥', label: 'Flames' },
        { value: 'gaming', emoji: '🎮', label: 'VR Set' },
        { value: 'alien', emoji: '👽', label: 'Alien' },
      ],
    },
    pattern: {
      title: '✨ Pattern',
      items: [
        { value: 'none', emoji: '❌', label: 'None' },
        { value: 'spots', emoji: '🔵', label: 'Spots' },
        { value: 'stripes', emoji: '🦓', label: 'Stripes' },
        { value: 'stars', emoji: '⭐', label: 'Stars' },
        { value: 'hearts', emoji: '❤️', label: 'Hearts' },
        { value: 'lightning', emoji: '⚡', label: 'Lightning' },
        { value: 'flames', emoji: '🔥', label: 'Flames' },
        { value: 'camo', emoji: '🌲', label: 'Camo' },
        { value: 'glitch', emoji: '📺', label: 'Glitch' },
        { value: 'binary', emoji: '💻', label: 'Binary' },
        { value: 'galaxy', emoji: '🌌', label: 'Galaxy' },
        { value: 'drip', emoji: '💧', label: 'Drip' },
      ],
    },
    stageTheme: {
      title: '🎭 Stage',
      items: [
        { value: 'space', emoji: '🌌', label: 'Space' },
        { value: 'neon', emoji: '💜', label: 'Neon' },
        { value: 'forest', emoji: '🌲', label: 'Forest' },
        { value: 'ocean', emoji: '🌊', label: 'Ocean' },
        { value: 'candy', emoji: '🍭', label: 'Candy' },
        { value: 'sunset', emoji: '🌅', label: 'Sunset' },
      ],
    },
  };

  const getCurrentDisplay = (key) => {
    const currentValue = key === 'stageTheme' ? stageTheme : config[key];
    const option = options[key].items.find(item => item.value === currentValue);
    
    if (key === 'bodyColor') {
      const colorOption = options.bodyColor.items.find(item => item.value === currentValue);
      return (
        <>
          <span className={styles.colorDot} style={{ backgroundColor: currentValue }} />
          <span className={styles.currentLabel}>{colorOption?.label || 'Custom'}</span>
        </>
      );
    }
    
    return option ? (
      <>
        <span className={styles.currentEmoji}>{option.emoji}</span>
        <span className={styles.currentLabel}>{option.label}</span>
      </>
    ) : null;
  };

  const randomize = () => {
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    onChange({
      danceStyle: randomItem(options.danceStyle.items).value,
      bodyShape: randomItem(options.bodyShape.items).value,
      bodyColor: randomItem(options.bodyColor.items).value,
      eyeStyle: randomItem(options.eyeStyle.items).value,
      mouthStyle: randomItem(options.mouthStyle.items).value,
      accessory: randomItem(options.accessory.items).value,
      pattern: randomItem(options.pattern.items).value,
      patternColor: '#ffffff66',
    });
    onStageThemeChange(randomItem(options.stageTheme.items).value);
    // Keep sections as they are
  };

  const optionKeys = ['danceStyle', 'bodyShape', 'bodyColor', 'eyeStyle', 'mouthStyle', 'accessory', 'pattern', 'stageTheme'];

  return (
    <div className={styles.customizer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Customize</h3>
        <button className={styles.randomButton} onClick={randomize} title="Randomize">
          🎲
        </button>
      </div>
      
      <div className={styles.sections}>
        {optionKeys.map(key => (
          <div key={key} className={styles.section}>
            {/* Section Header - Click to expand */}
            <button
              className={`${styles.sectionHeader} ${openSection === key ? styles.open : ''}`}
              onClick={() => toggleSection(key)}
            >
              <span className={styles.sectionTitle}>{options[key].title}</span>
              <div className={styles.sectionValue}>
                {getCurrentDisplay(key)}
                <span className={styles.arrow}>{openSection === key ? '▲' : '▼'}</span>
              </div>
            </button>
            
            {/* Dropdown Content */}
            {openSection === key && (
              <div className={styles.dropdown}>
                {key === 'bodyColor' ? (
                  <div className={styles.colorGrid}>
                    {options[key].items.map(item => (
                      <button
                        key={item.value}
                        className={`${styles.colorOption} ${config[key] === item.value ? styles.selected : ''}`}
                        style={{ backgroundColor: item.value }}
                        onClick={() => updateConfig(key, item.value)}
                        title={item.label}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.optionGrid}>
                    {options[key].items.map(item => {
                      const currentValue = key === 'stageTheme' ? stageTheme : config[key];
                      return (
                        <button
                          key={item.value}
                          className={`${styles.optionItem} ${currentValue === item.value ? styles.selected : ''}`}
                          onClick={() => key === 'stageTheme' 
                            ? handleStageThemeChange(item.value) 
                            : updateConfig(key, item.value)
                          }
                        >
                          <span className={styles.optionEmoji}>{item.emoji}</span>
                          <span className={styles.optionLabel}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonsterCustomizer;