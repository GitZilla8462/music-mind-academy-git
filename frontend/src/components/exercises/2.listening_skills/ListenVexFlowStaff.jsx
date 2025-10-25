// /src/components/exercises/2.listening_skills/ListenVexFlowStaff.jsx - FIXED F# DISPLAY
import React, { useRef, useEffect } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Beam } from 'vexflow';
import { useResponsiveMusic } from './Hooks/ListenuseResponsiveMusic';

const ListenVexFlowStaff = ({ 
  pattern, 
  label, 
  isCorrect, 
  isSelected, 
  showResult, 
  exerciseComplete, 
  playingNoteIndex, 
  isPlaying,
  patternLength = 4,
  staffHeight = 100,
  mobileScale = false,
  noteMapping = null, // NEW: Accept custom note mapping
  keySignature = null // NEW: Accept key signature
}) => {
  const containerRef = useRef(null);
  const { dimensions } = useResponsiveMusic();

  // FIXED: Duration conversion function
  const convertDurationToVexFlow = (duration) => {
    const durationMap = {
      'w': 'w',    // whole note
      'h': 'h',    // half note  
      'q': 'q',    // quarter note
      'e': '8',    // eighth note - THIS WAS THE PROBLEM
      '8': '8',    // eighth note (alternative)
      '16': '16',  // sixteenth note
      '32': '32'   // thirty-second note
    };
    
    return durationMap[duration] || 'q'; // default to quarter note
  };

  useEffect(() => {
    if (!containerRef.current || !pattern) return;

    containerRef.current.innerHTML = '';

    // Professional spacing calculations based on note durations
    const calculateNoteSpacing = (duration, isQuarterQuarterQuarterEighthEighth = false) => {
      const baseSpacing = mobileScale ? 28 : 40; // Base spacing for quarter notes - increased for more space
      switch (duration) {
        case 'w': return baseSpacing * 2.2; // Whole note gets ~2.2x spacing
        case 'h': return baseSpacing * 1.6; // Half note gets ~1.6x spacing  
        case 'q': 
          // FIXED: Give quarter notes extra space in the q,q,q,e,e pattern
          return isQuarterQuarterQuarterEighthEighth ? baseSpacing * 1.15 : baseSpacing * 1.0; 
        case 'e': return baseSpacing * 0.85; // FIXED: Increased from 0.7 to 0.85 - give eighths more space
        default: return baseSpacing;
      }
    };

    // Calculate total beats and spacing for measures
    const calculateMeasureMetrics = (notes) => {
      let totalBeats = 0;
      let totalSpacing = 0;
      
      // FIXED: Check if this is the q,q,q,e,e pattern for special spacing
      const isQuarterQuarterQuarterEighthEighth = notes.length === 5 &&
        notes[0].duration === 'q' && notes[1].duration === 'q' && 
        notes[2].duration === 'q' && notes[3].duration === 'e' && 
        notes[4].duration === 'e';
      
      notes.forEach(note => {
        const beats = note.duration === 'h' ? 2 : 
                     note.duration === 'w' ? 4 : 
                     note.duration === 'e' ? 0.5 : 1;
        totalBeats += beats;
        totalSpacing += calculateNoteSpacing(note.duration, isQuarterQuarterQuarterEighthEighth);
      });
      
      return { totalBeats, totalSpacing };
    };

    const { totalBeats } = calculateMeasureMetrics(pattern);
    console.log(`♪ Pattern analysis: ${pattern.length} notes, ${totalBeats} beats total`);

    // Base container dimensions - use fixed heights instead of proportional
    const baseDimensions = mobileScale ? {
      width: Math.floor(dimensions.width * 1.15),
      height: 100 // Fixed height for mobile to ensure consistent staff visibility
    } : {
      width: Math.floor(dimensions.width * 1.14),
      height: 120 // Fixed height for desktop to ensure consistent staff visibility
    };
    
    const width = baseDimensions.width;
    const height = baseDimensions.height + (mobileScale ? 20 : 25); // Fixed additional height
    
    console.log(`🎼 VexFlow rendering: mobile=${mobileScale}, size=${width}x${height}, patternLength=${patternLength}`);
    
    // Create container with proper overflow handling
    const containerDiv = document.createElement('div');
    containerDiv.style.width = `${width}px`;
    containerDiv.style.height = `${height}px`;
    containerDiv.style.overflow = 'visible';
    containerDiv.style.position = 'relative';
    containerDiv.style.background = 'white';
    containerDiv.style.borderRadius = '8px';
    containerDiv.style.margin = '0 auto';
    containerDiv.style.paddingBottom = '35px'; // Extra space for low notes
    
    // Determine border styling based on state
    let labelColor = '#374151';
    let borderColor = '#D1D5DB';
    let borderWidth = 1;
    
    if (showResult) {
      if (isCorrect) {
        labelColor = '#10B981';
        borderColor = '#10B981';
        borderWidth = 3;
      } else if (isSelected) {
        labelColor = '#374151';
        borderColor = '#EF4444';
        borderWidth = 3;
      }
    } else if (isSelected) {
      borderColor = '#3B82F6';
      borderWidth = 2;
    }
    
    containerDiv.style.border = `${borderWidth}px solid ${borderColor}`;
    
    // Add pattern label
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label;
    labelDiv.style.position = 'absolute';
    labelDiv.style.top = '2px';
    labelDiv.style.left = '4px';
    labelDiv.style.fontSize = `${mobileScale ? 14 : 16}px`;
    labelDiv.style.fontWeight = 'bold';
    labelDiv.style.color = labelColor;
    labelDiv.style.zIndex = '10';
    containerDiv.appendChild(labelDiv);

    try {
      const renderer = new Renderer(containerDiv, Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();

      // FIXED: Enhanced note mapping function that supports rests AND SHARPS/FLATS
      const getVexFlowNote = (noteData) => {
        // FIXED: Check if this is a rest first
        if (noteData.isRest || noteData.pitch === null || noteData.type === 'rest') {
          console.log(`♪ Creating rest with duration: ${noteData.duration}`);
          return null; // Return null to indicate this should be a rest
        }
        
        const pitch = noteData.pitch;
        
        // Use custom note mapping if provided
        if (noteMapping && noteMapping[pitch]) {
          console.log(`♪ Using custom mapping: ${pitch} → ${noteMapping[pitch]}`);
          return noteMapping[pitch];
        }
        
        // FIXED: Complete note mapping for all chromatic notes with PROPER SHARP/FLAT NOTATION
        const completeNoteMap = {
          // Octave 4
          'C4': 'c/4', 'C#4': 'c#/4', 'Db4': 'db/4', 'D4': 'd/4', 'D#4': 'd#/4', 'Eb4': 'eb/4', 
          'E4': 'e/4', 'F4': 'f/4', 'F#4': 'f#/4', 'Gb4': 'gb/4', 'G4': 'g/4', 'G#4': 'g#/4', 
          'Ab4': 'ab/4', 'A4': 'a/4', 'A#4': 'a#/4', 'Bb4': 'bb/4', 'B4': 'b/4',
          // Octave 5  
          'C5': 'c/5', 'C#5': 'c#/5', 'Db5': 'db/5', 'D5': 'd/5', 'D#5': 'd#/5', 'Eb5': 'eb/5', 
          'E5': 'e/5', 'F5': 'f/5', 'F#5': 'f#/5', 'Gb5': 'gb/5', 'G5': 'g/5', 'G#5': 'g#/5', 
          'Ab5': 'ab/5', 'A5': 'a/5', 'A#5': 'a#/5', 'Bb5': 'bb/5', 'B5': 'b/5',
          // Octave 6
          'C6': 'c/6', 'C#6': 'c#/6', 'Db6': 'db/6', 'D6': 'd/6', 'D#6': 'd#/6', 'Eb6': 'eb/6', 
          'E6': 'e/6', 'F6': 'f/6', 'F#6': 'f#/6', 'Gb6': 'gb/6', 'G6': 'g/6', 'G#6': 'g#/6', 
          'Ab6': 'ab/6', 'A6': 'a/6', 'A#6': 'a#/6', 'Bb6': 'bb/6', 'B6': 'b/6'
        };
        
        const vexFlowNote = completeNoteMap[pitch];
        if (vexFlowNote) {
          console.log(`♪ Using default mapping: ${pitch} → ${vexFlowNote}`);
          return vexFlowNote;
        } else {
          console.warn(`⚠️ Unknown pitch: ${pitch}, defaulting to c/4`);
          return 'c/4'; // Fallback
        }
      };

      // FIXED: Enhanced spacing constants with tighter barline clearance
      const margins = {
        left: mobileScale ? 2 : 4,
        clefWidth: mobileScale ? 35 : 45,
        timeSigWidth: mobileScale ? 25 : 35,
        barlineSpace: mobileScale ? 4 : 6,
        measureGap: 0,
        barlineClearance: mobileScale ? 0.5 : 1, // FIXED: Reduced from 1:2 to 0.5:1 for tighter spacing to barline
        keySignatureWidth: keySignature ? (mobileScale ? 20 : 25) : 0,
        restClearance: mobileScale ? 8 : 12
      };

      // Handle different pattern structures with proper spacing
      if (totalBeats > 4 || patternLength >= 6) {
        // Two measures side by side for longer patterns
        
        // Split pattern intelligently based on beats
        let currentBeats = 0;
        let measureBreakIndex = -1;
        
        for (let i = 0; i < pattern.length; i++) {
          const noteBeats = pattern[i].duration === 'h' ? 2 : 
                           pattern[i].duration === 'w' ? 4 : 
                           pattern[i].duration === 'e' ? 0.5 : 1;
          
          if (currentBeats + noteBeats > 4 && measureBreakIndex === -1) {
            measureBreakIndex = i;
            break;
          }
          currentBeats += noteBeats;
          
          if (currentBeats >= 4) {
            measureBreakIndex = i + 1;
            break;
          }
        }
        
        // Fallback to even split if no clean break found
        if (measureBreakIndex === -1) {
          measureBreakIndex = Math.ceil(pattern.length / 2);
        }
        
        console.log(`♪ Splitting at index ${measureBreakIndex}: Measure 1 (${measureBreakIndex} notes), Measure 2 (${pattern.length - measureBreakIndex} notes)`);
        
        // Calculate metrics for each measure
        const measure1Notes = pattern.slice(0, measureBreakIndex);
        const measure2Notes = pattern.slice(measureBreakIndex);
        
        const measure1Metrics = calculateMeasureMetrics(measure1Notes);
        const measure2Metrics = calculateMeasureMetrics(measure2Notes);
        
        // FIXED: Calculate stave widths with better balance between measures
        const availableWidth = width - margins.left * 2;
        
        // Calculate generous minimum widths to maintain proper note spacing
        const minMeasure1Width = margins.clefWidth + margins.timeSigWidth + margins.keySignatureWidth + 
                                measure1Metrics.totalSpacing + margins.barlineSpace;
        const minMeasure2Width = measure2Metrics.totalSpacing + margins.barlineSpace + 15; // FIXED: Add padding for end barline
        
        // FIXED: Better width allocation - give second measure even more space
        const measure1Percentage = mobileScale ? 0.48 : 0.50; // FIXED: Further reduced from 0.52:0.54 to 0.48:0.50
        const tentativeMeasure1Width = Math.floor(availableWidth * measure1Percentage);
        const tentativeMeasure2Width = availableWidth - tentativeMeasure1Width;
        
        // FIXED: Use let instead of const for variables that may be reassigned
        let measure1Width = Math.max(tentativeMeasure1Width, minMeasure1Width);
        let measure2Width = Math.max(tentativeMeasure2Width, minMeasure2Width);
        
        // If we exceeded available width, scale back proportionally
        const totalCalculatedWidth = measure1Width + measure2Width;
        if (totalCalculatedWidth > availableWidth) {
          const scaleFactor = availableWidth / totalCalculatedWidth;
          measure1Width = Math.floor(measure1Width * scaleFactor);
          measure2Width = availableWidth - measure1Width;
        }
        
        console.log(`♪ Measure widths: M1=${measure1Width}px (${measure1Metrics.totalBeats} beats), M2=${measure2Width}px (${measure2Metrics.totalBeats} beats)`);
        
        // Create first measure - position staff lower to show full staff
        const stave1 = new Stave(margins.left, mobileScale ? 15 : 20, measure1Width);
        stave1.addClef('treble');
        stave1.addTimeSignature('4/4');
        
        // NEW: Add key signature if provided
        if (keySignature) {
          console.log(`♪ Adding key signature: ${keySignature}`);
          stave1.addKeySignature(keySignature);
        }
        
        // FIXED: Remove end barline from first measure to prevent double barlines
        stave1.setEndBarType(0); // 0 = no end barline
        
        stave1.setContext(context).draw();
        
        // Create second measure - positioned even closer to first measure
        const stave2X = margins.left + measure1Width - 10; // FIXED: Increased from -5px to -10px to bring even closer
        const stave2 = new Stave(stave2X, mobileScale ? 15 : 20, measure2Width);
        stave2.setEndBarType(3); // Double bar line at end
        stave2.setContext(context).draw();

        // FIXED: Create notes for each measure with proper rest handling
        const notes1 = [];
        const notes2 = [];
        
        pattern.forEach((noteData, index) => {
          const vexFlowPitch = getVexFlowNote(noteData);
          
          let note;
          if (vexFlowPitch === null) {
            // FIXED: Create a rest positioned higher
            console.log(`♪ Rest ${index + 1}: duration ${noteData.duration}`);
            note = new StaveNote({
              clef: 'treble',
              keys: ['b/4'], // Higher position for rest (B4 line)
              duration: `${convertDurationToVexFlow(noteData.duration)}r`, // FIXED: Use converter
              glyph_font_scale: mobileScale ? 1.3 : 1.0,
              stroke_px: mobileScale ? 2 : 1
            });
          } else {
            // FIXED: Create a regular note
            console.log(`♪ Note ${index + 1}: ${noteData.pitch} (${noteData.syllable}) → ${vexFlowPitch}`);
            note = new StaveNote({
              clef: 'treble',
              keys: [vexFlowPitch],
              duration: convertDurationToVexFlow(noteData.duration), // FIXED: Use converter
              glyph_font_scale: mobileScale ? 1.3 : 1.0,
              stroke_px: mobileScale ? 2 : 1
            });
          }
          
          // Apply styling based on playback state (only for notes, not rests)
          if (vexFlowPitch !== null) {
            const noteStyle = {
              fillStyle: '#000000',
              strokeStyle: '#000000',
              strokeWidth: mobileScale ? 2 : 1
            };
            
            if (showResult && isCorrect) {
              if (isPlaying && playingNoteIndex === index) {
                noteStyle.fillStyle = '#F59E0B';
                noteStyle.strokeStyle = '#D97706';
              } else if (isPlaying && playingNoteIndex > index) {
                noteStyle.fillStyle = '#3B82F6';
                noteStyle.strokeStyle = '#1D4ED8';
              }
            }
            
            note.setStyle(noteStyle);
          }
          
          if (index < measureBreakIndex) {
            notes1.push(note);
          } else {
            notes2.push(note);
          }
        });

        // FIXED: Format and draw voices with special handling for q,q,q,e,e patterns
        if (notes1.length > 0) {
          const voice1 = new Voice({ 
            num_beats: measure1Metrics.totalBeats, 
            beat_value: 4 
          });
          voice1.setMode(Voice.Mode.SOFT);
          voice1.addTickables(notes1);
          
          const formatter1 = new Formatter();
          
          // FIXED: Special handling for q,q,q,e,e pattern
          const hasQuarterQuarterQuarterEighthEighth = measure1Notes.length === 5 &&
            measure1Notes[0].duration === 'q' && measure1Notes[1].duration === 'q' && 
            measure1Notes[2].duration === 'q' && measure1Notes[3].duration === 'e' && 
            measure1Notes[4].duration === 'e';
          
          let formatterWidth1;
          if (hasQuarterQuarterQuarterEighthEighth) {
            // Give even more space for this specific pattern to prevent eighth note squishing
            formatterWidth1 = measure1Width - margins.clefWidth - margins.timeSigWidth - 
                             margins.keySignatureWidth - margins.barlineSpace + 10; // FIXED: Increased from +5px to +10px
          } else {
            // Normal spacing for other patterns
            formatterWidth1 = measure1Width - margins.clefWidth - margins.timeSigWidth - 
                             margins.keySignatureWidth - margins.barlineSpace - 1;
          }
          
          formatter1.joinVoices([voice1]).format([voice1], Math.max(formatterWidth1, 80));
          
          // Add beaming for eighth notes
          const beams1 = Beam.generateBeams(notes1);
          
          voice1.draw(context, stave1);
          beams1.forEach(beam => beam.setContext(context).draw());
        }
        
        if (notes2.length > 0) {
          const voice2 = new Voice({ 
            num_beats: measure2Metrics.totalBeats, 
            beat_value: 4 
          });
          voice2.setMode(Voice.Mode.SOFT);
          voice2.addTickables(notes2);

          const formatter2 = new Formatter();
          // FIXED: Give second measure even more breathing room from end barline
          const formatterWidth2 = measure2Width - margins.barlineSpace - 15; // FIXED: Increased from 10px to 15px
          formatter2.joinVoices([voice2]).format([voice2], Math.max(formatterWidth2, 70));
          
          // Add beaming for eighth notes
          const beams2 = Beam.generateBeams(notes2);
          
          voice2.draw(context, stave2);
          beams2.forEach(beam => beam.setContext(context).draw());
        }

      } else {
        // Calculate width to fill available space
        const measureMetrics = calculateMeasureMetrics(pattern);
        const availableWidth = width - margins.left * 2;
        
        // Use most of available width for single measure
        const staveWidth = Math.max(availableWidth * 0.95, mobileScale ? 140 : 200);
        
        console.log(`♪ Single measure: ${staveWidth}px width, ${measureMetrics.totalBeats} beats`);
        
        const stave = new Stave(margins.left, mobileScale ? 0 : 1, staveWidth);
        stave.addClef('treble');
        stave.addTimeSignature('4/4');
        
        // NEW: Add key signature if provided
        if (keySignature) {
          console.log(`♪ Adding key signature: ${keySignature}`);
          stave.addKeySignature(keySignature);
        }
        
        stave.setEndBarType(3);
        stave.setContext(context).draw();

        // FIXED: Create notes with proper rest handling
        const notes = [];
        
        pattern.forEach((noteData, index) => {
          const vexFlowPitch = getVexFlowNote(noteData);
          
          let note;
          if (vexFlowPitch === null) {
            // FIXED: Create a rest positioned higher
            console.log(`♪ Rest ${index + 1}: duration ${noteData.duration}`);
            note = new StaveNote({
              clef: 'treble',
              keys: ['b/4'], // Higher position for rest (B4 line)
              duration: `${convertDurationToVexFlow(noteData.duration)}r`, // FIXED: Use converter
              glyph_font_scale: mobileScale ? 1.4 : 1.0,
              stroke_px: mobileScale ? 2 : 1
            });
          } else {
            // FIXED: Create a regular note
            console.log(`♪ Note ${index + 1}: ${noteData.pitch} (${noteData.syllable}) → ${vexFlowPitch}`);
            note = new StaveNote({
              clef: 'treble',
              keys: [vexFlowPitch],
              duration: convertDurationToVexFlow(noteData.duration), // FIXED: Use converter
              glyph_font_scale: mobileScale ? 1.4 : 1.0,
              stroke_px: mobileScale ? 2 : 1
            });
          }
          
          // Apply styling based on playback state (only for notes, not rests)
          if (vexFlowPitch !== null) {
            const noteStyle = {
              fillStyle: '#000000',
              strokeStyle: '#000000',
              strokeWidth: mobileScale ? 2 : 1
            };
            
            if (showResult && isCorrect) {
              if (isPlaying && playingNoteIndex === index) {
                noteStyle.fillStyle = '#F59E0B';
                noteStyle.strokeStyle = '#D97706';
              } else if (isPlaying && playingNoteIndex > index) {
                noteStyle.fillStyle = '#3B82F6';
                noteStyle.strokeStyle = '#1D4ED8';
              }
            }
            
            note.setStyle(noteStyle);
          }
          
          notes.push(note);
        });

        // FIXED: Single measure with compressed spacing to pull away from barline
        const voice = new Voice({ 
          num_beats: measureMetrics.totalBeats, 
          beat_value: 4 
        });
        voice.setMode(Voice.Mode.SOFT);
        voice.addTickables(notes);

        const formatter = new Formatter();
        // FIXED: Less aggressive compression for single measures with mixed durations
        const formatterWidth = staveWidth - margins.clefWidth - margins.timeSigWidth - margins.keySignatureWidth - margins.barlineSpace - margins.barlineClearance; // FIXED: Reduced clearance
        formatter.joinVoices([voice]).format([voice], Math.max(formatterWidth, 60)); // Reasonable minimum for compression

        // Add beaming for eighth notes
        const beams = Beam.generateBeams(notes);

        voice.draw(context, stave);
        beams.forEach(beam => beam.setContext(context).draw());
      }

      // FIXED: Add solfege syllables when exercise is complete (skip rests)
      if (exerciseComplete) {
        const syllableDiv = document.createElement('div');
        syllableDiv.style.position = 'absolute';
        syllableDiv.style.bottom = '8px';
        syllableDiv.style.width = '100%';
        syllableDiv.style.textAlign = 'center';
        syllableDiv.style.fontSize = `${mobileScale ? 10 : 12}px`;
        syllableDiv.style.fontWeight = 'bold';
        syllableDiv.style.color = '#059669';
        // FIXED: Filter out rests when showing syllables
        const syllableText = pattern
          .filter(note => !note.isRest && note.pitch !== null && note.type !== 'rest')
          .map(note => note.syllable)
          .join(' - ');
        syllableDiv.textContent = syllableText;
        containerDiv.appendChild(syllableDiv);
      }

      containerRef.current.appendChild(containerDiv);
      console.log('[OK] VexFlow rendered successfully with FIXED F# display');

    } catch (error) {
      console.error('[Error] VexFlow rendering error:', error);
      
      // Improved fallback display
      containerDiv.innerHTML = '';
      
      // Re-add the label
      const fallbackLabel = document.createElement('div');
      fallbackLabel.textContent = label;
      fallbackLabel.style.position = 'absolute';
      fallbackLabel.style.top = '8px';
      fallbackLabel.style.left = '8px';
      fallbackLabel.style.fontSize = `${mobileScale ? 14 : 16}px`;
      fallbackLabel.style.fontWeight = 'bold';
      fallbackLabel.style.color = labelColor;
      containerDiv.appendChild(fallbackLabel);
      
      // Create a better fallback display
      const patternDiv = document.createElement('div');
      patternDiv.style.display = 'flex';
      patternDiv.style.flexDirection = 'column';
      patternDiv.style.alignItems = 'center';
      patternDiv.style.justifyContent = 'center';
      patternDiv.style.height = '100%';
      patternDiv.style.paddingTop = '25px';
      
      const titleDiv = document.createElement('div');
      titleDiv.textContent = totalBeats > 4 ? 'Musical Pattern (Two Measures)' : 'Musical Pattern';
      titleDiv.style.fontSize = `${mobileScale ? 11 : 13}px`;
      titleDiv.style.color = '#666';
      titleDiv.style.marginBottom = '10px';
      
      const notesDiv = document.createElement('div');
      notesDiv.style.fontSize = `${mobileScale ? 13 : 15}px`;
      notesDiv.style.fontWeight = 'bold';
      notesDiv.style.display = 'flex';
      notesDiv.style.gap = '6px';
      notesDiv.style.flexWrap = 'wrap';
      notesDiv.style.justifyContent = 'center';
      notesDiv.style.maxWidth = '90%';
      
      pattern.forEach((note, index) => {
        const syllableSpan = document.createElement('span');
        
        // FIXED: Handle rests in fallback display
        if (note.isRest || note.pitch === null || note.type === 'rest') {
          syllableSpan.textContent = '𝄽'; // Rest symbol
          syllableSpan.style.color = '#666';
        } else {
          syllableSpan.textContent = note.syllable;
          syllableSpan.style.color = '#374151';
          
          // Add duration indicator
          if (note.duration === 'h') {
            syllableSpan.textContent += '♩'; // Half note symbol
          } else if (note.duration === 'w') {
            syllableSpan.textContent += '○'; // Whole note symbol
          }
        }
        
        notesDiv.appendChild(syllableSpan);
        
        if (index < pattern.length - 1) {
          const separator = document.createElement('span');
          separator.textContent = '-';
          separator.style.color = '#374151';
          notesDiv.appendChild(separator);
        }
      });
      
      patternDiv.appendChild(titleDiv);
      patternDiv.appendChild(notesDiv);
      containerDiv.appendChild(patternDiv);
      containerRef.current.appendChild(containerDiv);
    }
  }, [pattern, label, isCorrect, isSelected, showResult, exerciseComplete, playingNoteIndex, isPlaying, dimensions, patternLength, staffHeight, mobileScale, noteMapping, keySignature]);

  return (
    <div 
      ref={containerRef} 
      className="rounded-lg"
    ></div>
  );
};

export default ListenVexFlowStaff;