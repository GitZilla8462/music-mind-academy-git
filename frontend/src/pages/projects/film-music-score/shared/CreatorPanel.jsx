// File: CreatorPanel.jsx
// Fixed panel on left side of video area with creator tools
// Shows: Beat Maker, Melody Maker, and optionally Virtual Instrument + Loop Library

import React from 'react';
import { Disc3, Piano, Music, Library, ChevronRight } from 'lucide-react';

const CreatorPanel = ({
  onOpenBeatMaker,
  onOpenMelodyMaker,
  onOpenVirtualInstrument,
  onOpenLoopLibrary,
  activeTool = null,
  primaryTool = null, // When set, this tool appears first and others are dimmed
}) => {
  const tools = [
    {
      id: 'beat-maker',
      icon: Disc3,
      label: 'Beat Maker',
      description: 'Create drum patterns',
      bgColor: 'bg-red-600',
      onClick: onOpenBeatMaker,
      enabled: true,
      show: true
    },
    {
      id: 'melody-maker',
      icon: Piano,
      label: 'Melody Maker',
      description: 'Create melodies',
      bgColor: 'bg-purple-600',
      onClick: onOpenMelodyMaker,
      enabled: true,
      show: true
    },
    {
      id: 'virtual-instrument',
      icon: Music,
      label: 'Instrument',
      description: 'Play & record live',
      bgColor: 'bg-blue-600',
      onClick: onOpenVirtualInstrument,
      enabled: true,
      show: !!onOpenVirtualInstrument // Only show if callback provided
    },
    {
      id: 'loop-library',
      icon: Library,
      label: 'Loop Library',
      description: 'Browse loops & SFX',
      bgColor: 'bg-amber-600',
      onClick: onOpenLoopLibrary,
      enabled: true,
      show: !!onOpenLoopLibrary // Only show if callback provided
    }
  ];

  let visibleTools = tools.filter(t => t.show);

  // When primaryTool is set, move it first
  if (primaryTool) {
    const primary = visibleTools.find(t => t.id === primaryTool);
    const rest = visibleTools.filter(t => t.id !== primaryTool);
    if (primary) visibleTools = [primary, ...rest];
  }

  return (
    <div className="w-48 h-full bg-gray-850 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
        <h3 className="text-white font-semibold text-sm">Create Your Own</h3>
      </div>

      {/* Tool Options */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        {visibleTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          const isDisabled = !tool.enabled;
          const isDimmed = primaryTool && !isActive && tool.id !== primaryTool;

          return (
            <button
              key={tool.id}
              onClick={tool.onClick}
              disabled={isDisabled}
              className={`
                w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all
                ${isActive
                  ? `${tool.bgColor} text-white shadow-lg`
                  : isDisabled
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    : isDimmed
                      ? 'bg-gray-800/40 text-gray-400 hover:bg-gray-700 hover:text-white'
                      : `bg-gray-800 text-white hover:bg-gray-700`
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                ${isActive
                  ? 'bg-white/20'
                  : isDisabled
                    ? 'bg-gray-700/50'
                    : tool.bgColor
                }
              `}>
                <Icon size={18} className={isDisabled ? 'text-gray-500' : 'text-white'} />
              </div>

              {/* Label & Description */}
              <div className="flex-1 text-left min-w-0">
                <div className={`text-sm font-medium truncate ${isDisabled ? 'text-gray-500' : ''}`}>
                  {tool.label}
                </div>
                <div className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                  {isDisabled ? 'Coming Soon' : tool.description}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <ChevronRight size={16} className="text-white/70 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="px-3 py-2 border-t border-gray-700 bg-gray-800/50">
        <p className="text-gray-500 text-xs text-center">
          Create loops for your project
        </p>
      </div>
    </div>
  );
};

export default CreatorPanel;
