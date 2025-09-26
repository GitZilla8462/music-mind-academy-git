// /src/components/exercises/VexFlowStaff.jsx - Mobile Responsive Version
import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter } from 'vexflow';

const VexFlowStaff = ({ 
  pattern,           
  currentNoteIndex,  
  isPlaying,         
  completedNotes,    
  incorrectNotes,    
  playingFullPattern,
  currentPlaybackIndex,
  width = 900,       
  height = 300       
}) => {
  const staffRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isMobile, setIsMobile] = useState(false);

  // Responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const screenWidth = window.innerWidth;
        const isMobileView = screenWidth < 768;
        
        setIsMobile(isMobileView);
        
        // Calculate responsive dimensions
        const maxWidth = containerWidth - 32; // Account for padding
        const responsiveWidth = Math.min(maxWidth, isMobileView ? 350 : 900);
        const responsiveHeight = isMobileView ? 200 : 300;
        
        setDimensions({ 
          width: Math.max(320, responsiveWidth), // Minimum 320px
          height: responsiveHeight 
        });
      }
    };

    // Initial calculation
    updateDimensions();

    // Listen for resize events
    window.addEventListener('resize', updateDimensions);
    
    // Use ResizeObserver if available
    let resizeObserver;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!staffRef.current || !pattern || pattern.length < 8) return;

    // Clear previous content
    staffRef.current.innerHTML = '';

    try {
      const { width: currentWidth, height: currentHeight } = dimensions;
      
      // Create VexFlow renderer with responsive dimensions
      const renderer = new Renderer(staffRef.current, Renderer.Backends.SVG);
      renderer.resize(currentWidth, currentHeight);
      const context = renderer.getContext();

      // Calculate responsive stave dimensions
      const padding = isMobile ? 20 : 60;
      const staveWidth = isMobile ? 
        (currentWidth - padding * 2) / 2 : // Mobile: split width evenly, no gap
        Math.min(380, (currentWidth - padding * 2) / 2); // Desktop: max 380px per stave
      
      const staveY = isMobile ? 30 : 50;
      const stave1X = padding;
      const stave2X = stave1X + staveWidth; // No gap - measures connect

      // Create first measure
      const stave1 = new Stave(stave1X, staveY, staveWidth);
      stave1.addClef('treble');
      if (!isMobile) { // Hide time signature on mobile to save space
        stave1.addTimeSignature('4/4');
      }
      stave1.setContext(context).draw();

      // Create second measure
      const stave2 = new Stave(stave2X, staveY, staveWidth);
      stave2.setEndBarType(3); // Double barline at the end
      stave2.setContext(context).draw();

      const getVexFlowNote = (pitch) => {
        const noteMap = {
          'C4': 'c/4',
          'D4': 'd/4', 
          'E4': 'e/4',
          'F4': 'f/4',
          'G4': 'g/4',
          'A4': 'a/4',
          'B4': 'b/4'
        };
        return noteMap[pitch] || 'c/4';
      };

      // Create notes for first measure
      const measure1Notes = pattern.slice(0, 4).map((noteData, index) => {
        const note = new StaveNote({
          clef: 'treble',
          keys: [getVexFlowNote(noteData.pitch)],
          duration: 'q'
        });

        // Note styling logic (same as original)
        if (playingFullPattern && index === currentPlaybackIndex) {
          note.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#1d4ed8' });
        } else if (playingFullPattern) {
          // Keep neutral during full pattern playback
        } else if (index === currentNoteIndex && isPlaying && !playingFullPattern) {
          note.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#1d4ed8' });
        } else if (completedNotes && completedNotes[index]) {
          note.setStyle({ fillStyle: '#10b981', strokeStyle: '#059669' });
        } else if (incorrectNotes && incorrectNotes[index]) {
          note.setStyle({ fillStyle: '#eab308', strokeStyle: '#ca8a04' });
        }

        return note;
      });

      // Create notes for second measure
      const measure2Notes = pattern.slice(4, 8).map((noteData, index) => {
        const actualIndex = index + 4;
        const note = new StaveNote({
          clef: 'treble',
          keys: [getVexFlowNote(noteData.pitch)],
          duration: 'q'
        });

        // Note styling logic (same as original)
        if (playingFullPattern && actualIndex === currentPlaybackIndex) {
          note.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#1d4ed8' });
        } else if (playingFullPattern) {
          // Keep neutral during full pattern playback
        } else if (actualIndex === currentNoteIndex && isPlaying && !playingFullPattern) {
          note.setStyle({ fillStyle: '#3b82f6', strokeStyle: '#1d4ed8' });
        } else if (completedNotes && completedNotes[actualIndex]) {
          note.setStyle({ fillStyle: '#10b981', strokeStyle: '#059669' });
        } else if (incorrectNotes && incorrectNotes[actualIndex]) {
          note.setStyle({ fillStyle: '#eab308', strokeStyle: '#ca8a04' });
        }

        return note;
      });

      // Create and format voices with responsive spacing
      const voice1 = new Voice({ num_beats: 4, beat_value: 4 });
      voice1.addTickables(measure1Notes);
      
      const voice2 = new Voice({ num_beats: 4, beat_value: 4 });
      voice2.addTickables(measure2Notes);

      // Format with responsive spacing
      const noteSpacing = staveWidth - (isMobile ? 40 : 80); // Account for clef space
      
      const formatter1 = new Formatter();
      formatter1.joinVoices([voice1]).format([voice1], noteSpacing);
      
      const formatter2 = new Formatter();
      formatter2.joinVoices([voice2]).format([voice2], noteSpacing);

      // Draw the voices
      voice1.draw(context, stave1);
      voice2.draw(context, stave2);

      // Add responsive solfege text
      const allNotes = [...measure1Notes, ...measure2Notes];
      
      allNotes.forEach((note, index) => {
        if (index < pattern.length) {
          const noteData = pattern[index];
          
          // Get the actual x position of the note from VexFlow
          const noteX = note.getAbsoluteX();
          const textY = staveY + (isMobile ? 120 : 140); // Responsive text position
          
          // Only show text for completed OR incorrect notes
          const shouldShowText = (completedNotes && completedNotes[index]) || 
                                (incorrectNotes && incorrectNotes[index]);
          
          if (shouldShowText) {
            // Determine text color and size
            let textColor = '#10b981'; // Green for correct
            const fontSize = isMobile ? 12 : 16; // Smaller font on mobile
            
            if (incorrectNotes && incorrectNotes[index]) {
              textColor = '#eab308'; // Yellow for incorrect
            }
            
            // Set font and color
            context.setFont('Arial', fontSize, 'bold');
            context.setFillStyle(textColor);
            
            // Draw the text centered under the note
            const textWidth = context.measureText(noteData.syllable).width;
            context.fillText(noteData.syllable, noteX - (textWidth / 2), textY);
          }
        }
      });

    } catch (error) {
      console.error('VexFlow rendering error:', error);
      
      // Responsive fallback
      staffRef.current.innerHTML = `
        <div style="
          width: 100%; 
          height: ${dimensions.height}px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: white; 
          border: 1px solid #ccc; 
          border-radius: 8px;
          font-size: ${isMobile ? '14px' : '18px'};
          color: #666;
          text-align: center;
          padding: 16px;
        ">
          Loading music notation...
        </div>
      `;
    }
  }, [pattern, currentNoteIndex, isPlaying, completedNotes, incorrectNotes, playingFullPattern, currentPlaybackIndex, dimensions, isMobile]);

  return (
    <div ref={containerRef} className="flex justify-center mb-4 md:mb-8 w-full">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 md:p-6 w-full max-w-4xl overflow-hidden">
        {/* Mobile header with question number */}
        {isMobile && (
          <div className="mb-2 text-center">
            <div className="text-sm text-gray-600">
              Question {Math.max(0, currentNoteIndex) + 1} of {pattern.length}
            </div>
          </div>
        )}
        
        {/* Staff container with horizontal scroll on mobile if needed */}
        <div className="w-full overflow-x-auto">
          <div ref={staffRef} className="min-w-full"></div>
        </div>
        
        {/* Mobile legend */}
        {isMobile && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                <span>Incorrect</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VexFlowStaff;