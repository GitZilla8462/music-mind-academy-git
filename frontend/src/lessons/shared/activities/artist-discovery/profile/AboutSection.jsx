import React from 'react';
import { Zap } from 'lucide-react';

const AboutSection = ({ artist }) => {
  if (!artist.bio) return null;

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
      <h2 className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">
        About
      </h2>
      <p className="text-white/70 text-[15px] leading-relaxed">{artist.bio}</p>

      {artist.funFacts?.length > 0 && (
        <>
          <p className="text-white/50 text-xs uppercase tracking-wider mt-4 mb-2 font-semibold">
            Fun Facts
          </p>
          <div className="space-y-2">
            {artist.funFacts.map((fact, i) => (
              <div key={i} className="flex items-start gap-2">
                <Zap size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">{fact}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AboutSection;
