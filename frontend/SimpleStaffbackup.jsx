// /src/components/exercises/SimpleStaff.jsx
import React from 'react';

const SimpleStaff = ({ currentNote, isPlaying, width = 600, height = 200 }) => {
  const notePositions = {
    'C4': { y: 135, ledger: true, name: 'C (Do)' },
    'D4': { y: 127, ledger: false, name: 'D (Re)' },
    'E4': { y: 120, ledger: false, name: 'E (Mi)' },
    'F4': { y: 112, ledger: false, name: 'F (Fa)' },
    'G4': { y: 105, ledger: false, name: 'G (Sol)' },
    'A4': { y: 97, ledger: false, name: 'A (La)' },
    'B4': { y: 90, ledger: false, name: 'B (Ti)' }
  };

  const position = notePositions[currentNote?.pitch];

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <style>
              {`
                .staff-line { stroke: #2d3748; stroke-width: 1.5; }
                .note-playing { 
                  fill: #ef4444; 
                  stroke: #dc2626;
                  filter: drop-shadow(0 0 8px #ef4444);
                  animation: noteGlow 0.6s ease-in-out infinite;
                }
                .note-static { fill: #2d3748; stroke: #1a202c; }
                @keyframes noteGlow {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
              `}
            </style>
          </defs>

          {/* Staff lines */}
          {[60, 75, 90, 105, 120].map((y, index) => (
            <line 
              key={index} 
              x1="50" 
              y1={y} 
              x2={width - 50} 
              y2={y} 
              className="staff-line"
            />
          ))}

          {/* Treble clef symbol */}
          <text x="65" y="115" fontSize="48" fill="#3182ce" fontFamily="serif">𝄞</text>

          {/* Time signature */}
          <text x="120" y="85" fontSize="20" fill="#2d3748" fontFamily="serif" fontWeight="bold">4</text>
          <text x="120" y="105" fontSize="20" fill="#2d3748" fontFamily="serif" fontWeight="bold">4</text>

          {/* Bar line */}
          <line x1="150" y1="60" x2="150" y2="120" stroke="#2d3748" strokeWidth="2" />

          {/* Current Note */}
          {position && (
            <g>
              {/* Ledger line for middle C */}
              {position.ledger && (
                <line
                  x1={width/2 - 20}
                  y1={position.y}
                  x2={width/2 + 20}
                  y2={position.y}
                  stroke="#2d3748"
                  strokeWidth="1.5"
                />
              )}

              {/* Note head */}
              <ellipse
                cx={width/2}
                cy={position.y}
                rx="12"
                ry="8"
                className={isPlaying ? "note-playing" : "note-static"}
                transform={`rotate(-15 ${width/2} ${position.y})`}
              />

              {/* Note stem */}
              <line
                x1={position.y > 90 ? width/2 - 10 : width/2 + 10}
                y1={position.y}
                x2={position.y > 90 ? width/2 - 10 : width/2 + 10}
                y2={position.y > 90 ? position.y + 35 : position.y - 35}
                stroke={isPlaying ? "#ef4444" : "#2d3748"}
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Note name below */}
              <text
                x={width/2}
                y={height - 20}
                fontSize="16"
                fill={isPlaying ? "#ef4444" : "#4a5568"}
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
              >
                {position.name}
                {isPlaying && " ♪"}
              </text>
            </g>
          )}

          {/* End bar line */}
          <line x1={width - 80} y1="60" x2={width - 80} y2="120" stroke="#2d3748" strokeWidth="2" />
          <line x1={width - 75} y1="60" x2={width - 75} y2="120" stroke="#2d3748" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
};

export default SimpleStaff;