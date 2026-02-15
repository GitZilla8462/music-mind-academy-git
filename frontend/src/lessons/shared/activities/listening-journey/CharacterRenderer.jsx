// Alto's Adventure inspired character — small geometric figure with flowing scarf
// Minimal: circle head, rounded body, simple legs, trailing animated scarf
// Character is small relative to the landscape

import React, { useMemo } from 'react';
import { getTempoById, getDynamicsById } from './characterAnimations';

const CharacterRenderer = ({
  characterColor = '#3B82F6',
  accent = '#60A5FA',
  tempo = 'andante',
  dynamics = 'mf',
  articulation = 'legato',
  isPlaying = false
}) => {
  const tempoData = getTempoById(tempo);
  const dynamicsData = getDynamicsById(dynamics);

  const cycleDuration = useMemo(() => {
    const base = 0.6;
    return base / tempoData.speed;
  }, [tempoData.speed]);

  const characterScale = 0.7 + (dynamicsData.scale - 0.6) * 0.5; // Subtler scale range

  // Scarf wave speed tied to tempo
  const scarfDuration = useMemo(() => `${1.2 / tempoData.speed}s`, [tempoData.speed]);
  const strideDuration = useMemo(() => `${cycleDuration}s`, [cycleDuration]);

  return (
    <>
      <style>{`
        @keyframes runner-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes runner-stride-front {
          0%, 100% { transform: rotate(-18deg); }
          50% { transform: rotate(18deg); }
        }
        @keyframes runner-stride-back {
          0%, 100% { transform: rotate(18deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes scarf-wave {
          0% { d: path("M0 0 C-4 -2, -12 1, -20 -1 C-28 -3, -34 2, -42 0"); }
          33% { d: path("M0 0 C-4 2, -12 -2, -20 1 C-28 3, -34 -1, -42 2"); }
          66% { d: path("M0 0 C-4 -1, -12 3, -20 0 C-28 -2, -34 3, -42 1"); }
          100% { d: path("M0 0 C-4 -2, -12 1, -20 -1 C-28 -3, -34 2, -42 0"); }
        }
        @keyframes scarf-simple {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          25% { transform: rotate(-3deg) scaleX(1.05); }
          50% { transform: rotate(1deg) scaleX(0.95); }
          75% { transform: rotate(-2deg) scaleX(1.02); }
        }
      `}</style>
      <div
        style={{
          transform: `scale(${characterScale})`,
          transition: 'transform 0.5s ease',
          animation: isPlaying ? `runner-bounce ${strideDuration} ease-in-out infinite` : 'none',
        }}
      >
        <svg width="70" height="52" viewBox="-45 -8 70 52" fill="none">
          {/* Scarf — flowing behind, signature Alto's Adventure element */}
          <g
            style={{
              transformOrigin: '0px 8px',
              animation: isPlaying ? `scarf-simple ${scarfDuration} ease-in-out infinite` : 'none',
            }}
          >
            <path
              d="M0 8 C-5 5, -12 10, -18 7 C-24 4, -30 9, -36 6 C-40 4, -42 7, -44 5"
              stroke={accent}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
            <path
              d="M0 8 C-5 8, -12 12, -18 10 C-24 8, -30 12, -36 10 C-40 8, -42 11, -44 9"
              stroke={accent}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </g>

          {/* Body — small rounded capsule, leaning slightly forward */}
          <ellipse cx="4" cy="18" rx="6" ry="9" fill={characterColor}
            transform="rotate(-8 4 18)" />

          {/* Head — circle, slightly forward */}
          <circle cx="8" cy="5" r="7" fill={characterColor} />

          {/* Eye — tiny white dot on right side */}
          <circle cx="11" cy="4" r="1.5" fill="white" />

          {/* Back leg */}
          <g style={{
            transformOrigin: '3px 26px',
            animation: isPlaying ? `runner-stride-back ${strideDuration} ease-in-out infinite` : 'none',
          }}>
            <line x1="3" y1="26" x2="0" y2="38" stroke={characterColor} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
            <ellipse cx="-1" cy="39" rx="3.5" ry="2" fill={characterColor} opacity="0.6" />
          </g>

          {/* Front leg */}
          <g style={{
            transformOrigin: '5px 26px',
            animation: isPlaying ? `runner-stride-front ${strideDuration} ease-in-out infinite` : 'none',
          }}>
            <line x1="5" y1="26" x2="8" y2="38" stroke={characterColor} strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="10" cy="39" rx="4" ry="2" fill={characterColor} />
          </g>
        </svg>
      </div>
    </>
  );
};

export default CharacterRenderer;
