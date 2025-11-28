// File: ToolsPanel.jsx
// Tools panel for Sound Garden - brush options, stickers, actions

import React from 'react';
import { brushColors, brushSizes, brushStyles, stickerCategories } from '../data/themes';

const ToolsPanel = ({
  activeTool,
  setActiveTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  brushStyle,
  setBrushStyle,
  activeSticker,
  setActiveSticker,
  stickerCategory,
  setStickerCategory,
  stats,
  onUndo,
  onClear,
  canUndo,
}) => {
  const tools = [
    { id: 'bloom', emoji: '🌸', name: 'Bloom', description: 'Click notes to bloom' },
    { id: 'brush', emoji: '🖌️', name: 'Brush', description: 'Paint over notation' },
    { id: 'sticker', emoji: '⭐', name: 'Sticker', description: 'Place stickers' },
    { id: 'eraser', emoji: '🧹', name: 'Eraser', description: 'Erase strokes' },
  ];

  return (
    <div className="tools-panel bg-gray-900/90 backdrop-blur border-t border-gray-700 p-3">
      <div className="flex items-center gap-4 flex-wrap">
        
        {/* Tool Selection */}
        <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-2 rounded-lg transition-all ${
                activeTool === tool.id 
                  ? 'bg-purple-600 scale-110' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              title={tool.description}
            >
              <span className="text-xl">{tool.emoji}</span>
            </button>
          ))}
        </div>

        {/* Brush Options - show when brush or eraser selected */}
        {(activeTool === 'brush' || activeTool === 'eraser') && (
          <>
            {/* Colors */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
              <span className="text-gray-400 text-xs mr-1">Color:</span>
              <div className="flex flex-wrap gap-1" style={{ maxWidth: '160px' }}>
                {brushColors.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setBrushColor(color.hex)}
                    className={`w-5 h-5 rounded transition-all ${
                      brushColor === color.hex 
                        ? 'ring-2 ring-white scale-110' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
              <span className="text-gray-400 text-xs mr-1">Size:</span>
              {brushSizes.map(size => (
                <button
                  key={size.id}
                  onClick={() => setBrushSize(size.size)}
                  className={`p-1.5 rounded transition-all flex items-center justify-center ${
                    brushSize === size.size 
                      ? 'bg-purple-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={size.name}
                  style={{ width: 28, height: 28 }}
                >
                  <div 
                    className="rounded-full bg-white"
                    style={{ 
                      width: Math.min(size.size, 20), 
                      height: Math.min(size.size, 20) 
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Styles */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
              <span className="text-gray-400 text-xs mr-1">Style:</span>
              {brushStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setBrushStyle(style.id)}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    brushStyle === style.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  title={style.description}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Sticker Options - show when sticker selected */}
        {activeTool === 'sticker' && (
          <>
            {/* Categories */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
              <span className="text-gray-400 text-xs mr-1">Category:</span>
              {Object.entries(stickerCategories).map(([catId, cat]) => (
                <button
                  key={catId}
                  onClick={() => setStickerCategory(catId)}
                  className={`p-1.5 rounded transition-all ${
                    stickerCategory === catId 
                      ? 'bg-purple-600' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  title={cat.name}
                >
                  <span className="text-lg">{cat.emoji}</span>
                </button>
              ))}
            </div>

            {/* Stickers */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
              <div className="flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
                {stickerCategories[stickerCategory]?.stickers.map((sticker, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSticker(sticker)}
                    className={`p-1 rounded transition-all ${
                      activeSticker === sticker 
                        ? 'bg-purple-600 scale-110' 
                        : 'hover:bg-gray-700 hover:scale-110'
                    }`}
                  >
                    <span className="text-xl">{sticker}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm border-r border-gray-700 pr-4">
          <span className="text-pink-400">🌸 {stats.blooms}</span>
          <span className="text-blue-400">🖌️ {stats.strokes}</span>
          <span className="text-yellow-400">⭐ {stats.stickers}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              canUndo 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            ↩ Undo
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded text-sm font-medium bg-red-600/80 hover:bg-red-600 text-white transition-all"
          >
            🗑 Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolsPanel;