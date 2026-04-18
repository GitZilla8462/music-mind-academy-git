// ScoutingReportGradingPreview — Scrollable slideshow preview for teacher grading.
// Default: Report 1 slides fill the view. Tabs to switch between reports if multiple.

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { renderSlideObject } from '../../lessons/shared/activities/press-kit-designer/components/SlideCanvas';
import { getPalette } from '../../lessons/shared/activities/press-kit-designer/palettes';
import { generateGenreScoutsTemplateObjects } from '../../lessons/shared/activities/scouting-report/genreScoutsConfig';
import { generateClaimArtistTemplateObjects } from '../../lessons/shared/activities/scouting-report/claimArtistConfig';
import { generateScoutingTemplateObjects } from '../../lessons/shared/activities/scouting-report/scoutingReportConfig';

const CANVAS_W = 960;
const CANVAS_H = 540;

function getGenerator(workData) {
  const type = workData?.type || workData?.data?.type || '';
  const title = workData?.title || '';
  const activityId = workData?.activityId || '';
  if (title.includes('Genre Scouts') || type === 'genre-scouts' || activityId === 'mj-genre-scouts') return generateGenreScoutsTemplateObjects;
  if (title.includes('Claim') || type === 'claim-artist' || activityId === 'mj-claim-artist') return generateClaimArtistTemplateObjects;
  return generateScoutingTemplateObjects;
}

function ensureObjects(slides, generator) {
  return slides.map((slide, i) => {
    if (!slide.objects || slide.objects.length === 0) {
      return { ...slide, objects: generator(i + 1, slide.fields || {}) };
    }
    return slide;
  });
}

const SlideCanvas = ({ slide }) => {
  const palette = getPalette(slide.palette || 'midnight', slide.genre);
  const objects = slide.objects || [];
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setScale(el.offsetWidth / CANVAS_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden shadow-lg"
      style={{
        width: '100%',
        paddingBottom: `${(CANVAS_H / CANVAS_W) * 100}%`,
        backgroundColor: palette.bg,
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        {slide.image?.url && (
          <img
            src={slide.image.url}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: CANVAS_W,
            height: CANVAS_H,
          }}
        >
          {objects.map(obj => (
            <div
              key={obj.id}
              style={{
                position: 'absolute',
                left: obj.x || 0,
                top: obj.y || 0,
              }}
            >
              {renderSlideObject(obj, 1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ScoutingReportGradingPreview = ({ workData }) => {
  const generator = getGenerator(workData);
  const currentSlides = workData?.data?.slides || [];
  const completedReports = workData?.data?.completedReports || [];
  const [activeReport, setActiveReport] = useState(0);

  // Build report groups: completed first (oldest → newest = Artist 1, 2, ...), then current last
  const reportGroups = useMemo(() => {
    const groups = [];
    let count = 0;

    // Completed reports in chronological order (Artist 1 first)
    completedReports.forEach((cr) => {
      if (cr.slides && cr.slides.length > 0) {
        count++;
        groups.push({
          label: cr.artistName && cr.artistName !== 'Untitled' ? cr.artistName : `Artist ${count}`,
          slides: ensureObjects(cr.slides, generator),
          completedAt: cr.completedAt,
        });
      }
    });

    // Current/in-progress report last
    if (currentSlides.length > 0) {
      count++;
      const currentArtist = currentSlides[0]?.fields?.artistName;
      groups.push({
        label: currentArtist && currentArtist !== 'Untitled' ? currentArtist : `Artist ${count}`,
        slides: ensureObjects(currentSlides, generator),
      });
    }

    return groups;
  }, [currentSlides, completedReports, generator]);

  if (reportGroups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>No slides submitted</p>
      </div>
    );
  }

  const hasMultiple = reportGroups.length > 1;
  const activeGroup = reportGroups[activeReport] || reportGroups[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-800">
      {hasMultiple && (
        <div className="flex items-center gap-1 bg-gray-900 px-4 py-2 border-b border-gray-700 flex-shrink-0">
          {reportGroups.map((group, i) => (
            <button
              key={i}
              onClick={() => setActiveReport(i)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                i === activeReport
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {group.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-500">
            {reportGroups.length} report{reportGroups.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto pt-2 pb-6 px-3 space-y-3">
          {activeGroup.slides.map((slide, si) => (
            <SlideCanvas key={si} slide={slide} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoutingReportGradingPreview;
