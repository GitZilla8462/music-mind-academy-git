import React from 'react';

const TheirSound = ({ artist }) => {
  const hasMoods = artist.moods?.length > 0;
  const hasInfluences = artist.influences?.length > 0;

  if (!hasMoods && !hasInfluences) return null;

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
      <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">
        Their Sound
      </h2>

      {/* Mood pills */}
      {hasMoods && (
        <div className="flex flex-wrap gap-2 mb-4">
          {artist.moods.map(mood => (
            <span
              key={mood}
              className="bg-white/[0.08] text-white/60 px-3 py-1 rounded-full text-xs"
            >
              {mood}
            </span>
          ))}
        </div>
      )}

      {/* Influences */}
      {hasInfluences && (
        <div className="mb-3">
          <span className="text-white/40 text-xs">Influenced by: </span>
          {artist.influences.map((inf, i) => (
            <span key={inf}>
              <span className="text-white/70 text-xs font-medium">{inf}</span>
              {i < artist.influences.length - 1 && (
                <span className="text-white/30 text-xs">, </span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Callout */}
      {hasInfluences && artist.influences.length >= 1 && (
        <div className="mt-3 bg-white/[0.04] rounded-lg px-4 py-3">
          <p className="text-white/50 text-sm">
            If you like <span className="text-white/80 font-semibold">{artist.influences[0]}</span>, you'll love <span className="text-white/80 font-semibold">{artist.name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TheirSound;
