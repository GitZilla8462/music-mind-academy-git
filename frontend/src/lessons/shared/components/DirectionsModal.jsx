// Shared directions modal for Unit 2/3 activities
// Two modes: single-page (numbered steps) or multi-page (with navigation)
// Style: white card, purple gradient header, prominent centered display
// Responsive: scales down text/spacing on shorter viewports (Chromebook, laptop)

import React, { useState } from 'react';
import { HelpCircle, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

// ============================================================================
// MAIN MODAL
// ============================================================================

const DirectionsModal = ({ title, isOpen, onClose, steps, pages, bonusText }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const isMultiPage = !!pages && pages.length > 0;

  if (!isOpen) return null;

  // Reset page when reopened
  const handleClose = () => {
    setCurrentPage(0);
    onClose();
  };

  // ── Single-page mode: numbered steps ──
  if (!isMultiPage) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-black text-white">{title}</h2>
            <button onClick={handleClose} className="text-white/70 hover:text-white text-2xl font-bold leading-none">
              <X size={18} />
            </button>
          </div>
          <div className="px-5 py-3 space-y-2.5 overflow-y-auto flex-1">
            {(steps || []).map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-lg font-black text-purple-600 w-6 text-center flex-shrink-0">{i + 1}</span>
                <p className="text-sm sm:text-base text-gray-700">{step.text || step}</p>
              </div>
            ))}
            {bonusText && (
              <div className="flex items-start gap-2.5 bg-yellow-50 rounded-xl p-2.5 -mx-1">
                <span className="text-lg font-black text-yellow-500 w-6 text-center flex-shrink-0">*</span>
                <p className="text-sm sm:text-base text-gray-700 font-medium">Bonus: {bonusText}</p>
              </div>
            )}
          </div>
          <div className="px-5 pb-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-base font-bold rounded-xl transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Multi-page mode: pages with navigation ──
  const page = pages[currentPage];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with title + step dots */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-black text-white">{page.title}</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {pages.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentPage ? 'bg-white scale-125' : i < currentPage ? 'bg-white/60' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button onClick={handleClose} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Page content — numbered steps */}
        <div className="px-5 py-3 space-y-2.5 overflow-y-auto flex-1">
          {(page.items || []).map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-lg font-black text-purple-600 w-6 text-center flex-shrink-0">{i + 1}</span>
              <p className="text-sm sm:text-base text-gray-700">{item}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 pb-4 flex-shrink-0">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            className={`px-3 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-1 ${
              currentPage === 0 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>
          {currentPage < pages.length - 1 ? (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-1"
            >
              <Check size={16} /> Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RE-OPEN BUTTON (shown after modal is dismissed)
// ============================================================================

export const DirectionsReopenButton = ({ onClick, label = 'Directions' }) => (
  <button
    onClick={onClick}
    className="fixed top-2 right-2 z-[900] flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:text-gray-900 transition-all"
  >
    <HelpCircle size={16} />
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

export default DirectionsModal;
