/**
 * StickerPanel.jsx - Emoji and Sticker Selection Panel
 * 
 * Features:
 * - Categorized sticker library (music, expression, shapes, etc.)
 * - Size control
 * - Recent stickers
 * - Search/filter
 */

import React, { useState, useMemo } from 'react';
import { STICKER_CATEGORIES, ALL_STICKERS } from '../../config/tools.js';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  panel: {
    position: 'absolute',
    left: '60px',
    top: '0',
    width: '320px',
    backgroundColor: '#1a1a22',
    border: '1px solid #2a2a35',
    borderRadius: '12px',
    padding: '12px',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    maxHeight: '480px',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexShrink: 0
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff'
  },
  closeButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#888',
    fontSize: '16px'
  },
  searchContainer: {
    marginBottom: '12px',
    flexShrink: 0
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#0a0a0f',
    border: '1px solid #2a2a35',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none'
  },
  categoryTabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '12px',
    flexWrap: 'wrap',
    flexShrink: 0
  },
  categoryTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2a2a35',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  categoryTabActive: {
    backgroundColor: '#3b82f6',
    color: '#fff'
  },
  categoryIcon: {
    fontSize: '14px'
  },
  stickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '4px',
    overflowY: 'auto',
    flex: 1,
    padding: '4px 0'
  },
  stickerButton: {
    width: '100%',
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '22px',
    transition: 'all 0.1s ease'
  },
  stickerButtonSelected: {
    backgroundColor: '#3b82f6',
    transform: 'scale(1.1)'
  },
  stickerButtonHover: {
    backgroundColor: '#2a2a35',
    transform: 'scale(1.1)'
  },
  sizeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderTop: '1px solid #2a2a35',
    marginTop: '8px',
    flexShrink: 0
  },
  sizeLabel: {
    fontSize: '12px',
    color: '#888',
    minWidth: '40px'
  },
  sizeSlider: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    background: '#2a2a35',
    outline: 'none',
    cursor: 'pointer'
  },
  sizePreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: '#0a0a0f',
    borderRadius: '8px',
    border: '1px solid #2a2a35'
  },
  recentSection: {
    marginBottom: '12px',
    flexShrink: 0
  },
  recentTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  },
  recentStickers: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap'
  },
  recentSticker: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #2a2a35',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '18px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    color: '#666',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '13px'
  }
};

// ============================================================================
// STICKER BUTTON COMPONENT
// ============================================================================

const StickerButton = ({ sticker, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      style={{
        ...styles.stickerButton,
        ...(isSelected ? styles.stickerButtonSelected : {}),
        ...(isHovered && !isSelected ? styles.stickerButtonHover : {})
      }}
      onClick={() => onClick(sticker)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={sticker}
    >
      {sticker}
    </button>
  );
};

// ============================================================================
// MAIN STICKER PANEL COMPONENT
// ============================================================================

const StickerPanel = ({
  selectedSticker,
  onStickerSelect,
  stickerSize = 32,
  onSizeChange,
  recentStickers = [],
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState('music');
  const [searchQuery, setSearchQuery] = useState('');

  // Get filtered stickers based on category and search
  const filteredStickers = useMemo(() => {
    let stickers;
    
    if (activeCategory === 'all') {
      stickers = ALL_STICKERS;
    } else {
      stickers = STICKER_CATEGORIES[activeCategory]?.stickers || [];
    }

    // Note: Emoji search is limited - mostly for future expansion
    if (searchQuery.trim()) {
      // Simple filter - in production you might want emoji metadata
      return stickers;
    }

    return stickers;
  }, [activeCategory, searchQuery]);

  // Category tabs
  const categories = [
    { id: 'all', name: 'All', icon: '🎯' },
    ...Object.entries(STICKER_CATEGORIES).map(([id, cat]) => ({
      id,
      name: cat.name,
      icon: cat.icon
    }))
  ];

  return (
    <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.title}>Stickers</span>
        <button style={styles.closeButton} onClick={onClose}>✕</button>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search stickers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Recent Stickers */}
      {recentStickers.length > 0 && (
        <div style={styles.recentSection}>
          <div style={styles.recentTitle}>Recent</div>
          <div style={styles.recentStickers}>
            {recentStickers.slice(0, 8).map((sticker, index) => (
              <button
                key={`recent-${index}`}
                style={{
                  ...styles.recentSticker,
                  ...(selectedSticker === sticker ? { backgroundColor: '#3b82f6' } : {})
                }}
                onClick={() => onStickerSelect(sticker)}
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            style={{
              ...styles.categoryTab,
              ...(activeCategory === cat.id ? styles.categoryTabActive : {})
            }}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span style={styles.categoryIcon}>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Sticker Grid */}
      {filteredStickers.length > 0 ? (
        <div style={styles.stickerGrid}>
          {filteredStickers.map((sticker, index) => (
            <StickerButton
              key={`${sticker}-${index}`}
              sticker={sticker}
              isSelected={selectedSticker === sticker}
              onClick={onStickerSelect}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🔍</span>
          <span style={styles.emptyText}>No stickers found</span>
        </div>
      )}

      {/* Size Control */}
      <div style={styles.sizeControl}>
        <span style={styles.sizeLabel}>Size</span>
        <input
          type="range"
          min="16"
          max="96"
          value={stickerSize}
          onChange={(e) => onSizeChange?.(parseInt(e.target.value))}
          style={styles.sizeSlider}
        />
        <div style={styles.sizePreview}>
          <span style={{ fontSize: `${Math.min(stickerSize, 40)}px` }}>
            {selectedSticker || '😀'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StickerPanel;