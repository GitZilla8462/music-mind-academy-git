// PressKitGradingPreview — Read-only slide preview for teacher grading view.
// Renders all 5 press kit slides in a scrollable column using the same
// renderSlideObject() used by the student editor, so WYSIWYG is guaranteed.
// Also handles Scouting Report / Genre Scouts / Claim Your Artist slides.

import React, { useState, useMemo } from 'react';
import { renderSlideObject } from '../../lessons/shared/activities/press-kit-designer/components/SlideCanvas';
import { getPalette } from '../../lessons/shared/activities/press-kit-designer/palettes';
import { generateGenreScoutsTemplateObjects } from '../../lessons/shared/activities/scouting-report/genreScoutsConfig';
import { generateClaimArtistTemplateObjects } from '../../lessons/shared/activities/scouting-report/claimArtistConfig';
import { generateScoutingTemplateObjects } from '../../lessons/shared/activities/scouting-report/scoutingReportConfig';

const CANVAS_W = 960;
const CANVAS_H = 540;

const PRESS_KIT_LABELS = ['Meet the Artist', 'Their Sound', 'Why Sign Them?', 'Press Play', 'Make Them Go Viral'];
const GENRE_SCOUTS_LABELS = ['Genre Lineup', 'Surprise Discovery', 'Sound Snapshot'];
const CLAIM_ARTIST_LABELS = ['Artist Overview', 'The Four Points', 'Fact or Opinion'];
const SCOUTING_LABELS = ['Genre Lineup', 'Surprise Discovery', 'Sound Snapshot'];

function getSlideLabels(workData) {
  const type = workData?.type || workData?.data?.type || '';
  const title = workData?.title || '';
  const slideCount = workData?.data?.slides?.length || 0;

  if (title.includes('Genre Scouts') || type === 'genre-scouts') return GENRE_SCOUTS_LABELS;
  if (title.includes('Claim') || type === 'claim-artist') return CLAIM_ARTIST_LABELS;
  if (type === 'scouting-report' && slideCount === 3) return SCOUTING_LABELS;
  return PRESS_KIT_LABELS;
}

function getObjectGenerator(workData) {
  const type = workData?.type || workData?.data?.type || '';
  const title = workData?.title || '';

  if (title.includes('Genre Scouts') || type === 'genre-scouts') return generateGenreScoutsTemplateObjects;
  if (title.includes('Claim') || type === 'claim-artist') return generateClaimArtistTemplateObjects;
  if (type === 'scouting-report') return generateScoutingTemplateObjects;
  return null;
}

// Ensure slides have objects — scouting reports save fields but may have empty objects arrays.
// Regenerate from fields so the teacher sees the student's actual content.
function ensureSlideObjects(slides, generator) {
  if (!generator) return slides;
  return slides.map((slide, i) => {
    if (!slide.objects || slide.objects.length === 0) {
      return { ...slide, objects: generator(i + 1, slide.fields || {}) };
    }
    return slide;
  });
}

const SlidePreview = ({ slide, index, isActive, onClick, slideLabels }) => {
  const palette = getPalette(slide.palette || 'midnight', slide.genre);
  const objects = slide.objects || [];
  const scale = isActive ? 0.65 : 0.25;
  const w = CANVAS_W * scale;
  const h = CANVAS_H * scale;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all ${isActive ? '' : 'opacity-70 hover:opacity-100'}`}
    >
      <div
        style={{
          width: w,
          height: h,
          backgroundColor: palette.bg,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: isActive ? 8 : 4,
          border: isActive ? `2px solid ${palette.accent}` : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Background image */}
        {slide.image?.url && (
          <img
            src={slide.image.url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
          />
        )}
        {/* Canvas objects */}
        {objects.map(obj => (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              left: (obj.x || 0) * scale,
              top: (obj.y || 0) * scale,
            }}
          >
            {renderSlideObject(obj, scale)}
          </div>
        ))}
      </div>
      {!isActive && (
        <div className="text-xs text-gray-500 text-center mt-1">
          {index + 1}. {(slideLabels || PRESS_KIT_LABELS)[index] || `Slide ${index + 1}`}
        </div>
      )}
    </div>
  );
};

const PressKitGradingPreview = ({ workData }) => {
  const rawSlides = workData?.data?.slides || [];
  const [activeSlide, setActiveSlide] = useState(0);
  const slideLabels = getSlideLabels(workData);
  const generator = getObjectGenerator(workData);

  // Regenerate objects from fields for scouting reports if objects are empty
  const slides = useMemo(() => ensureSlideObjects(rawSlides, generator), [rawSlides, generator]);

  if (slides.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>No slides submitted</p>
      </div>
    );
  }

  const current = slides[activeSlide];
  const palette = getPalette(current?.palette || 'midnight', current?.genre);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Slide thumbnails */}
      <div className="w-36 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, i) => (
          <SlidePreview
            key={i}
            slide={slide}
            index={i}
            isActive={i === activeSlide}
            onClick={() => setActiveSlide(i)}
            slideLabels={slideLabels}
          />
        ))}
      </div>

      {/* Active slide large preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-100 overflow-auto">
        <div className="text-sm font-semibold text-gray-500 mb-2">
          Slide {activeSlide + 1}: {slideLabels[activeSlide] || ''}
        </div>
        <SlidePreview
          slide={current}
          index={activeSlide}
          isActive={true}
          onClick={() => {}}
          slideLabels={slideLabels}
        />
        {/* Slide fields summary */}
        {current?.fields && Object.keys(current.fields).length > 0 && (
          <div className="mt-3 max-w-lg w-full">
            <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Content</div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1.5 text-sm">
              {Object.entries(current.fields).map(([key, value]) => {
                if (!value) return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                return (
                  <div key={key}>
                    <span className="text-gray-400 text-xs">{label}:</span>{' '}
                    <span className="text-gray-800">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PressKitGradingPreview;
