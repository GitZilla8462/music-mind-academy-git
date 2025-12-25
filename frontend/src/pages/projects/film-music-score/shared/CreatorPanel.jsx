// File: CreatorPanel.jsx
// Fixed panel on left side of video area with creator tools
// Shows: Beat Maker, Melody Maker, Record Audio

import React from 'react';
import { Disc3, Piano, Mic, ChevronRight } from 'lucide-react';

const CreatorPanel = ({
  onOpenBeatMaker,
  onOpenMelodyMaker,
  onOpenRecordAudio,
  activeTool = null // 'beat-maker' | 'melody-maker' | 'record-audio' | null
}) => {
  const tools = [
    {
      id: 'beat-maker',
      icon: Disc3,
      label: 'Beat Maker',
      description: 'Create drum patterns',
      color: 'red',
      bgColor: 'bg-red-600',
      hoverBg: 'hover:bg-red-700',
      onClick: onOpenBeatMaker,
      enabled: true
    },
    {
      id: 'melody-maker',
      icon: Piano,
      label: 'Melody Maker',
      description: 'Create melodies',
      color: 'purple',
      bgColor: 'bg-purple-600',
      hoverBg: 'hover:bg-purple-700',
      onClick: onOpenMelodyMaker,
      enabled: true
    },
    {
      id: 'record-audio',
      icon: Mic,
      label: 'Record Audio',
      description: 'Use your microphone',
      color: 'green',
      bgColor: 'bg-green-600',
      hoverBg: 'hover:bg-green-700',
      onClick: onOpenRecordAudio,
      enabled: false // Coming soon
    }
  ];

  return (
    <div className="w-48 h-full bg-gray-850 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
        <h3 className="text-white font-semibold text-sm">Create Your Own</h3>
      </div>

      {/* Tool Options */}
      <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          const isDisabled = !tool.enabled;

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
