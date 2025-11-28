/**
 * MainToolbar.jsx - Primary Tool Selection Toolbar
 * 
 * Professional art app style:
 * - Clean, minimal design
 * - Light theme with subtle shadows
 * - Tools + brush sizes on left
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { TOOL_TYPES, TOOL_GROUPS, BRUSH_TOOLS, UTILITY_TOOLS } from '../../config/tools.js';

// ============================================================================
// STYLES - Professional art app aesthetic
// ============================================================================

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'column',
    width: '52px',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e0e0e0',
    padding: '8px 4px',
    gap: '2px',
    overflowY: 'auto',
    overflowX: 'hidden',
    flexShrink: 0,
    zIndex: 100,
    boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '6px 4px'
  },
  toolButton: {
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.15s ease',
    position: 'relative',
    color: '#374151'
  },
  toolButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  },
  toolButtonHover: {
    backgroundColor: '#e5e7eb'
  },
  expandIndicator: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '0',
    height: '0',
    borderLeft: '3px solid transparent',
    borderRight: '3px solid transparent',
    borderTop: '3px solid #9ca3af'
  },
  popup: {
    position: 'fixed',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '8px',
    zIndex: 9999,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    minWidth: '150px'
  },
  popupTitle: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    padding: '0 4px'
  },
  popupGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  popupItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%',
    textAlign: 'left',
    color: '#374151'
  },
  popupItemActive: {
    backgroundColor: '#3b82f6',
    color: '#fff'
  },
  popupItemHover: {
    backgroundColor: '#f3f4f6'
  },
  popupItemIcon: {
    fontSize: '16px',
    width: '24px',
    textAlign: 'center'
  },
  popupItemLabel: {
    fontSize: '13px',
    fontWeight: '500'
  },
  historySection: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingTop: '8px'
  },
  historyButton: {
    width: '42px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
    transition: 'all 0.15s ease'
  },
  historyButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed'
  },
  // Brush size styles
  brushSizeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'center'
  },
  brushSizeButton: {
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  brushSizeButtonActive: {
    backgroundColor: '#e5e7eb'
  }
};

// ============================================================================
// TOOL BUTTON COMPONENT
// ============================================================================

const ToolButton = React.forwardRef(({ tool, isActive, onClick, showExpandIndicator = false }, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = (e) => {
    console.log('🔘 ToolButton handleClick START:', tool.name);
    e.preventDefault();
    e.stopPropagation();
    console.log('🔘 ToolButton calling onClick for:', tool.name);
    onClick?.();
    console.log('🔘 ToolButton handleClick END:', tool.name);
  };
  
  return (
    <button
      ref={ref}
      type="button"
      style={{
        ...styles.toolButton,
        ...(isActive ? styles.toolButtonActive : {}),
        ...(isHovered && !isActive ? styles.toolButtonHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      title={tool.name || tool.label}
    >
      {tool.icon}
      {showExpandIndicator && <span style={styles.expandIndicator} />}
    </button>
  );
});

ToolButton.displayName = 'ToolButton';

// ============================================================================
// POPUP ITEM COMPONENT
// ============================================================================

const PopupItem = ({ tool, isActive, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = (e) => {
    console.log('🎯 PopupItem handleClick START:', tool.name, tool.id);
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 PopupItem calling onSelect for:', tool.name, tool.id);
    onSelect?.();
    console.log('🎯 PopupItem handleClick END:', tool.name, tool.id);
  };
  
  return (
    <button
      type="button"
      style={{
        ...styles.popupItem,
        ...(isActive ? styles.popupItemActive : {}),
        ...(isHovered && !isActive ? styles.popupItemHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      title={tool.description || tool.name}
    >
      <span style={styles.popupItemIcon}>{tool.icon}</span>
      <span style={styles.popupItemLabel}>{tool.name}</span>
    </button>
  );
};

// ============================================================================
// TOOL POPUP COMPONENT
// ============================================================================

const ToolPopup = React.forwardRef(({ title, tools, activeTool, onSelectTool, onClose, buttonRef }, ref) => {
  console.log('🎪 ToolPopup RENDERING:', title, 'tools:', tools?.length, 'activeTool:', activeTool);
  
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Calculate position based on button location
  useEffect(() => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.right + 8
      });
    }
  }, [buttonRef]);
  
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };
  
  const popupContent = (
    <div 
      ref={ref} 
      style={{
        ...styles.popup,
        position: 'fixed',
        top: position.top,
        left: position.left
      }} 
      onClick={handlePopupClick}
    >
      <div style={styles.popupTitle}>{title}</div>
      <div style={styles.popupGrid}>
        {tools.map((tool) => (
          <PopupItem
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onSelect={() => {
              onSelectTool(tool.id);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
  
  // Use portal to render popup in document.body, bypassing overflow:hidden
  return ReactDOM.createPortal(popupContent, document.body);
});

ToolPopup.displayName = 'ToolPopup';

// ============================================================================
// MAIN TOOLBAR COMPONENT
// ============================================================================

const MainToolbar = ({
  activeTool,
  onToolChange,
  brushSize = 12,
  onBrushSizeChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenStickers,
  onOpenColors
}) => {
  const [openPopup, setOpenPopup] = useState(null);
  const [hoveredSize, setHoveredSize] = useState(null);
  const toolbarRef = useRef(null);
  const popupRef = useRef(null);
  const lastToggleTimeRef = useRef(0);
  const drawButtonRef = useRef(null);
  
  // Available brush sizes
  const brushSizes = [4, 8, 12, 20, 32];

  // Click outside detection using useEffect
  useEffect(() => {
    if (!openPopup) return;

    const handleClickOutside = (e) => {
      // Check if click is outside toolbar and popup
      const isOutsideToolbar = toolbarRef.current && !toolbarRef.current.contains(e.target);
      const isOutsidePopup = !popupRef.current || !popupRef.current.contains(e.target);
      
      if (isOutsideToolbar && isOutsidePopup) {
        setOpenPopup(null);
      }
    };

    // Use a small delay to avoid catching the click that opened the popup
    console.log('👁️ Setting up click listener with 100ms delay');
    const timeoutId = setTimeout(() => {
      console.log('👁️ Adding document mousedown listener');
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      console.log('👁️ Cleanup: removing listener');
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPopup]);

  // Handle tool change with logging
  const handleToolChange = useCallback((toolId) => {
    console.log('🔧 handleToolChange called with:', toolId);
    if (typeof onToolChange === 'function') {
      console.log('🔧 Calling onToolChange prop');
      onToolChange(toolId);
    } else {
      console.log('❌ onToolChange is not a function!', typeof onToolChange);
    }
  }, [onToolChange]);

  // Get the icon for the currently active tool in a group
  const getGroupIcon = (groupId) => {
    const group = TOOL_GROUPS?.[groupId];
    if (!group) return '🔧';
    
    const activeInGroup = group.tools?.find(t => t === activeTool);
    if (activeInGroup) {
      const tool = [...(BRUSH_TOOLS || []), ...(UTILITY_TOOLS || [])].find(t => t.id === activeInGroup);
      return tool?.icon || group.icon;
    }
    return group.icon;
  };

  // Check if a group contains the active tool
  const isGroupActive = (groupId) => {
    const group = TOOL_GROUPS?.[groupId];
    return group?.tools?.includes(activeTool) || false;
  };

  const togglePopup = (popupId) => {
    console.log('📂 togglePopup called with:', popupId, 'current openPopup:', openPopup);
    
    // Debounce: ignore clicks within 300ms of each other
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) {
      console.log('📂 IGNORING - too soon after last toggle:', now - lastToggleTimeRef.current, 'ms');
      return;
    }
    lastToggleTimeRef.current = now;
    
    setOpenPopup(prev => {
      const newValue = prev === popupId ? null : popupId;
      return newValue;
    });
  };

  return (
    <div ref={toolbarRef} style={styles.toolbar}>
      {/* Drawing Tools */}
      <div style={styles.section}>
        <div style={{ position: 'relative' }}>
          <ToolButton
            ref={drawButtonRef}
            tool={{ icon: getGroupIcon('draw'), name: 'Drawing Tools' }}
            isActive={isGroupActive('draw')}
            onClick={() => togglePopup('draw')}
            showExpandIndicator
          />
          {openPopup === 'draw' && (
            <ToolPopup
              ref={popupRef}
              title="Drawing Tools"
              tools={BRUSH_TOOLS || []}
              activeTool={activeTool}
              onSelectTool={handleToolChange}
              onClose={() => setOpenPopup(null)}
              buttonRef={drawButtonRef}
            />
          )}
        </div>
      </div>

      <div style={styles.divider} />

      {/* Utility Tools (direct access) */}
      <div style={styles.section}>
        {(UTILITY_TOOLS || []).map((tool) => (
          <ToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onClick={() => handleToolChange(tool.id)}
          />
        ))}
      </div>

      <div style={styles.divider} />

      {/* Stickers */}
      <div style={styles.section}>
        <ToolButton
          tool={{ icon: '😀', name: 'Stickers' }}
          isActive={activeTool === TOOL_TYPES?.STICKER}
          onClick={() => {
            handleToolChange(TOOL_TYPES?.STICKER || 'sticker');
            onOpenStickers?.();
          }}
        />
      </div>

      <div style={styles.divider} />
      
      {/* Brush Sizes */}
      <div style={styles.brushSizeSection}>
        <div style={{ fontSize: '9px', color: '#9ca3af', fontWeight: '600', marginBottom: '4px' }}>SIZE</div>
        {brushSizes.map((size) => (
          <button
            key={size}
            type="button"
            style={{
              ...styles.brushSizeButton,
              ...(brushSize === size ? styles.brushSizeButtonActive : {}),
              ...(hoveredSize === size && brushSize !== size ? { backgroundColor: '#f3f4f6' } : {})
            }}
            onMouseEnter={() => setHoveredSize(size)}
            onMouseLeave={() => setHoveredSize(null)}
            onClick={() => onBrushSizeChange?.(size)}
            title={`${size}px`}
          >
            <div 
              style={{
                width: Math.min(size, 24),
                height: Math.min(size, 24),
                borderRadius: '50%',
                backgroundColor: brushSize === size ? '#3b82f6' : '#6b7280'
              }}
            />
          </button>
        ))}
      </div>

      {/* History (Undo/Redo) */}
      <div style={styles.historySection}>
        <div style={styles.divider} />
        <button
          type="button"
          style={{
            ...styles.historyButton,
            ...(canUndo ? {} : styles.historyButtonDisabled)
          }}
          onClick={() => onUndo?.()}
          disabled={!canUndo}
          title="Undo"
        >
          ↩️
        </button>
        <button
          type="button"
          style={{
            ...styles.historyButton,
            ...(canRedo ? {} : styles.historyButtonDisabled)
          }}
          onClick={() => onRedo?.()}
          disabled={!canRedo}
          title="Redo"
        >
          ↪️
        </button>
      </div>
    </div>
  );
};

export default MainToolbar;