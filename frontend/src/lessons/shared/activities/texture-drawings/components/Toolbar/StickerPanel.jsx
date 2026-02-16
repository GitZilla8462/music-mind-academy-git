/**
 * StickerPanel.jsx - Musical Sticker Selection Panel
 * 
 * 7 Categories:
 * 1. Instruments (PNG icons)
 * 2. Dynamics
 * 3. Tempo
 * 4. Articulation
 * 5. Symbols
 * 6. Form
 * 7. Emojis (at bottom)
 * 
 * ✅ NEW: Supports drag-from-panel to canvas
 */

import React, { useState } from 'react';
import { STICKER_TABS } from '../../config/stickers.js';
import { INSTRUMENT_ICONS } from '../../config/InstrumentIcons.jsx';

// ============================================================================
// STICKER ITEM
// ============================================================================

const StickerItem = ({ item, isSelected, onClick, onDragStart }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = (e) => {
    // Prevent text selection during drag
    e.preventDefault();
    
    // Store start position to detect drag vs click
    const startX = e.clientX;
    const startY = e.clientY;
    let hasDragged = false;
    
    const handleMouseMove = (moveEvent) => {
      const dx = Math.abs(moveEvent.clientX - startX);
      const dy = Math.abs(moveEvent.clientY - startY);
      
      // Start drag if moved more than 5px
      if (!hasDragged && (dx > 5 || dy > 5)) {
        hasDragged = true;
        if (onDragStart) {
          onDragStart(item, moveEvent);
        }
        // Clean up these listeners - parent takes over
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // If didn't drag, treat as click
      if (!hasDragged) {
        onClick(item);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderSymbol = () => {
    const renderType = item.render || 'emoji';

    switch (renderType) {
      case 'svg':
        const IconComponent = INSTRUMENT_ICONS[item.id];
        if (IconComponent) {
          return <IconComponent size={36} />;
        }
        return <span style={{ fontSize: '28px' }}>🎵</span>;

      case 'text':
        return (
          <span style={{
            fontFamily: 'Times New Roman, Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontSize: '22px',
            color: '#000000'
          }}>
            {item.symbol}
          </span>
        );

      case 'text-italic':
        return (
          <span style={{
            fontFamily: 'Times New Roman, Georgia, serif',
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#000000',
            fontWeight: '600'
          }}>
            {item.symbol}
          </span>
        );

      case 'crescendo':
        return (
          <svg width="40" height="20" viewBox="0 0 40 20">
            <path d="M36 2 L4 10 L36 18" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );

      case 'decrescendo':
        return (
          <svg width="40" height="20" viewBox="0 0 40 20">
            <path d="M4 2 L36 10 L4 18" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );

      case 'symbol':
        return (
          <span style={{
            fontFamily: 'Noto Music, Symbola, serif',
            fontSize: '28px',
            color: '#000000'
          }}>
            {item.symbol}
          </span>
        );

      case 'symbol-large':
        return (
          <span style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#000000'
          }}>
            {item.symbol}
          </span>
        );

      case 'form-label':
        return (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            border: '2px solid #1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              {item.symbol}
            </span>
          </div>
        );

      case 'form-text':
        return (
          <div style={{
            padding: '4px 8px',
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#92400e'
            }}>
              {item.symbol}
            </span>
          </div>
        );

      default:
        return (
          <span style={{ fontSize: '28px' }}>
            {item.symbol}
          </span>
        );
    }
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 6px',
        border: isSelected ? '2px solid #3b82f6' : '2px solid #e2e8f0',
        borderRadius: '10px',
        backgroundColor: isSelected ? '#dbeafe' : isHovered ? '#f1f5f9' : '#ffffff',
        cursor: 'grab',
        transition: 'all 0.15s ease',
        minHeight: '80px',
        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        userSelect: 'none'
      }}
      title={`${item.meaning || item.name} - Click to select or drag to canvas`}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '40px', 
        marginBottom: '6px',
        pointerEvents: 'none'
      }}>
        {renderSymbol()}
      </div>

      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        lineHeight: '1.2',
        pointerEvents: 'none'
      }}>
        {item.name}
      </span>

      {item.meaning && (
        <span style={{
          fontSize: '9px',
          color: '#475569',
          textAlign: 'center',
          marginTop: '2px',
          fontWeight: '500',
          pointerEvents: 'none'
        }}>
          {item.meaning}
        </span>
      )}
    </button>
  );
};

// ============================================================================
// TAB ICON BUTTON
// ============================================================================

const TabButton = ({ tab, isActive, onClick }) => (
  <button
    onClick={onClick}
    title={tab.name}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
      padding: '6px 2px',
      flex: 1,
      border: 'none',
      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
      backgroundColor: isActive ? '#eff6ff' : 'transparent',
      cursor: 'pointer',
      borderRadius: '6px 6px 0 0',
      transition: 'all 0.15s ease',
      minWidth: 0,
    }}
  >
    <span style={{ fontSize: '18px', lineHeight: 1 }}>{tab.icon}</span>
    <span style={{
      fontSize: '9px',
      fontWeight: isActive ? '800' : '600',
      color: isActive ? '#1d4ed8' : '#64748b',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
    }}>
      {tab.name}
    </span>
  </button>
);

// ============================================================================
// MAIN PANEL
// ============================================================================

const StickerPanel = ({
  selectedSticker,
  onStickerSelect,
  stickerSize = 56,
  onSizeChange,
  isOpen = true,
  onDragStart,
  availableTabs = null,
  defaultTab = null
}) => {
  const [activeTabId, setActiveTabId] = useState(defaultTab);

  // Filter tabs if availableTabs is provided
  const visibleTabs = availableTabs
    ? STICKER_TABS.filter(tab => availableTabs.includes(tab.id))
    : STICKER_TABS;

  // Default to defaultTab if provided, otherwise first tab
  const currentTabId = activeTabId && visibleTabs.some(t => t.id === activeTabId)
    ? activeTabId
    : visibleTabs[0]?.id;
  const activeTab = visibleTabs.find(t => t.id === currentTabId);

  if (!isOpen) return null;

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#f8fafc',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {/* Tab bar — all categories visible at once */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        flexShrink: 0,
        padding: '4px 4px 0',
      }}>
        {visibleTabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={currentTabId === tab.id}
            onClick={() => setActiveTabId(tab.id)}
          />
        ))}
      </div>

      {/* Items grid for active tab */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        minHeight: 0,
      }}>
        {activeTab && Object.entries(activeTab.data).map(([categoryKey, category]) => (
          <div key={categoryKey} style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '800',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
              paddingLeft: '4px'
            }}>
              {category.name}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {category.items.map((item, index) => (
                <StickerItem
                  key={`${item.symbol || item.id}-${item.name}-${index}`}
                  item={item}
                  isSelected={
                    (item.id && selectedSticker?.id && item.id === selectedSticker.id) ||
                    (item.symbol && selectedSticker?.symbol === item.symbol && selectedSticker?.name === item.name)
                  }
                  onClick={onStickerSelect}
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected sticker info */}
      {selectedSticker && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          flexShrink: 0,
          textAlign: 'center',
        }}>
          <div style={{
            padding: '6px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px'
          }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#1e40af'
            }}>
              {selectedSticker.name}
            </span>
            {selectedSticker.meaning && (
              <span style={{
                fontSize: '11px',
                color: '#3b82f6',
                display: 'block',
                marginTop: '1px'
              }}>
                {selectedSticker.meaning}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerPanel;