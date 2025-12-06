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
 */

import React, { useState } from 'react';
import { STICKER_TABS } from '../../config/stickers.js';
import { INSTRUMENT_ICONS } from '../../config/InstrumentIcons.jsx';

// ============================================================================
// STICKER ITEM
// ============================================================================

const StickerItem = ({ item, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

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
      onClick={() => onClick(item)}
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
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        minHeight: '80px',
        transform: isHovered ? 'scale(1.03)' : 'scale(1)'
      }}
      title={item.meaning || item.name}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '40px', 
        marginBottom: '6px' 
      }}>
        {renderSymbol()}
      </div>

      <span style={{
        fontSize: '11px',
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        lineHeight: '1.2'
      }}>
        {item.name}
      </span>

      {item.meaning && (
        <span style={{
          fontSize: '9px',
          color: '#475569',
          textAlign: 'center',
          marginTop: '2px',
          fontWeight: '500'
        }}>
          {item.meaning}
        </span>
      )}
    </button>
  );
};

// ============================================================================
// ACCORDION SECTION
// ============================================================================

const AccordionSection = ({ 
  tabId, 
  icon, 
  title, 
  data, 
  isOpen, 
  onToggle, 
  selectedSticker, 
  onSelect 
}) => {
  const getCurrentSelection = () => {
    for (const category of Object.values(data)) {
      const found = category.items.find(item => {
        if (item.id && selectedSticker?.id) {
          return item.id === selectedSticker.id;
        }
        if (item.symbol && selectedSticker?.symbol) {
          return item.symbol === selectedSticker.symbol && item.name === selectedSticker.name;
        }
        return item.name === selectedSticker?.name;
      });
      if (found) return found;
    }
    return null;
  };

  const current = getCurrentSelection();

  const renderPreview = (item) => {
    if (item.render === 'svg' && item.id) {
      const IconComponent = INSTRUMENT_ICONS[item.id];
      if (IconComponent) {
        return <IconComponent size={20} />;
      }
    }
    if (item.render === 'form-label') {
      return (
        <div style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{item.symbol}</span>
        </div>
      );
    }
    return <span>{item.symbol}</span>;
  };

  return (
    <div style={{
      marginBottom: '8px',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isOpen ? '#f1f5f9' : '#ffffff',
          border: 'none',
          borderBottom: isOpen ? '1px solid #e2e8f0' : 'none',
          cursor: 'pointer',
          position: isOpen ? 'sticky' : 'relative',
          top: 0,
          zIndex: 10
        }}
      >
        <span style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          {title}
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {current && !isOpen && (
            <span style={{
              fontSize: '14px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {renderPreview(current)}
            </span>
          )}
          <span style={{
            fontSize: '14px',
            color: '#94a3b8',
            fontWeight: '600'
          }}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f8fafc',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {Object.entries(data).map(([categoryKey, category]) => (
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
                    key={`${item.symbol}-${item.name}-${index}`}
                    item={item}
                    isSelected={
                      selectedSticker?.symbol === item.symbol && 
                      selectedSticker?.name === item.name
                    }
                    onClick={onSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN PANEL
// ============================================================================

const StickerPanel = ({
  selectedSticker,
  onStickerSelect,
  stickerSize = 56,
  onSizeChange,
  isOpen = true
}) => {
  const [openSection, setOpenSection] = useState('instruments');

  const toggleSection = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      width: '240px',
      backgroundColor: '#f8fafc',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      flexShrink: 0
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        flexShrink: 0
      }}>
        <span style={{
          fontSize: '16px',
          fontWeight: '800',
          color: '#1e293b'
        }}>
          🎵 Stickers
        </span>
      </div>

      {/* Sections - Scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
      }}>
        {STICKER_TABS.map((tab) => (
          <AccordionSection
            key={tab.id}
            tabId={tab.id}
            icon={tab.icon}
            title={tab.name}
            data={tab.data}
            isOpen={openSection === tab.id}
            onToggle={() => toggleSection(tab.id)}
            selectedSticker={selectedSticker}
            onSelect={onStickerSelect}
          />
        ))}
      </div>

      {/* Size Control */}
      <div style={{
        padding: '14px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#64748b'
          }}>
            SIZE
          </span>
          
          <div style={{
            flex: 1,
            position: 'relative',
            height: '24px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '6px',
              backgroundColor: '#cbd5e1',
              borderRadius: '3px'
            }} />
            
            <div style={{
              position: 'absolute',
              left: 0,
              width: `${((stickerSize - 32) / (96 - 32)) * 100}%`,
              height: '6px',
              backgroundColor: '#3b82f6',
              borderRadius: '3px'
            }} />
            
            <input
              type="range"
              min="32"
              max="96"
              value={stickerSize}
              onChange={(e) => onSizeChange?.(parseInt(e.target.value))}
              style={{
                position: 'absolute',
                width: '100%',
                height: '24px',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 2
              }}
            />
            
            <div style={{
              position: 'absolute',
              left: `calc(${((stickerSize - 32) / (96 - 32)) * 100}% - 8px)`,
              width: '16px',
              height: '16px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              pointerEvents: 'none'
            }} />
          </div>
          
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e2e8f0'
          }}>
            {selectedSticker?.render === 'svg' && selectedSticker?.id ? (
              (() => {
                const IconComponent = INSTRUMENT_ICONS[selectedSticker.id];
                return IconComponent ? <IconComponent size={32} /> : <span>🎵</span>;
              })()
            ) : selectedSticker?.render === 'form-label' ? (
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                  {selectedSticker.symbol}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: `${Math.min(stickerSize * 0.5, 32)}px` }}>
                {selectedSticker?.symbol || '🎵'}
              </span>
            )}
          </div>
        </div>

        {selectedSticker && (
          <div style={{
            marginTop: '10px',
            textAlign: 'center',
            padding: '8px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1e40af'
            }}>
              {selectedSticker.name}
            </span>
            {selectedSticker.meaning && (
              <span style={{
                fontSize: '12px',
                color: '#3b82f6',
                display: 'block',
                marginTop: '2px'
              }}>
                {selectedSticker.meaning}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerPanel;