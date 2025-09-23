import React, { useState, useEffect, useCallback, useRef } from 'react';

// UI Components
import SolfegeButtons from './UI/SolfegeButtons';
import FeedbackMessage from './UI/FeedbackMessage';
import LoadingStates from './UI/LoadingStates';

// Hooks
import useVexFlowLoader from './Hooks/useVexFlowLoader';

const CanvasMusicStaff = ({
  pattern,
  currentNoteIndex,
  isPlaying,
  completedNotes,
  incorrectNotes,
  bpm = 68,
  exerciseComplete,
  syllables,
  onSelect,
  disabled,
  selectedAnswer,
  correctAnswer,
  showResult,
  config
}) => {
  const containerRef = useRef(null);
  const vexflowRef = useRef(null);
  const canvasRef = useRef(null);
  const highlightCanvasRef = useRef(null);
  const syllableCanvasRef = useRef(null);
  const notePositionsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const rendererRef = useRef(null);
  const isInitializedRef = useRef(false);
  const currentPatternHashRef = useRef(null);
  
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);

  const { vexflowLoaded, useCanvasFallback: hookUseCanvasFallback, loadingError } = useVexFlowLoader();

  // VexFlow renderer
  useEffect(() => {
    if (!vexflowLoaded || !pattern.length || useCanvasFallback) {
      return;
    }

    const VF = window.Vex.Flow;
    
    if (!VF) {
      console.error('VexFlow not available');
      setUseCanvasFallback(true);
      return;
    }
    
    // Build a hash of the pattern so we only reinitialize when it actually changes
    const patternHash = pattern
      .map((n) => `${n.syllable || 'rest'}-${n.duration}-${n.pitch || 'none'}`)
      .join('|');

    if (isInitializedRef.current && currentPatternHashRef.current === patternHash) {
      console.log('Skipping VexFlow init – same pattern');
      return;
    }

    console.log('Starting VexFlow initialization for pattern hash:', patternHash);

    const initializeRenderer = () => {
      try {
        const container = containerRef.current;
        const vexflowDiv = vexflowRef.current;
        const highlightCanvas = highlightCanvasRef.current;
        const syllableCanvas = syllableCanvasRef.current;
        
        if (!container || !vexflowDiv || !highlightCanvas || !syllableCanvas) {
          console.log('Missing DOM elements for VexFlow initialization');
          return;
        }

        // Clear previous content
        vexflowDiv.innerHTML = '';
        
        // Set dimensions
        const width = vexflowDiv.clientWidth || 600;
        const height = 300;
        
        // Set up canvas overlays
        [highlightCanvas, syllableCanvas].forEach((canvas) => {
          canvas.width = width;
          canvas.height = height;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        });

        // Create VexFlow renderer using the correct API
        const renderer = new VF.Renderer(vexflowDiv, VF.Renderer.Backends.SVG);
        renderer.resize(width, height);
        rendererRef.current = renderer;
        
        const context = renderer.getContext();
        context.setFont('Arial', 10);

        // Create two staves with identical widths
        const staveWidth = width - 100; // Leave margins
        const stave1 = new VF.Stave(20, 40, staveWidth);
        const stave2 = new VF.Stave(20, 140, staveWidth);
        
        // Add time signature and clef to first stave only
        const timeSignature = config?.timeSignature || '4/4';
        stave1.addClef('treble').addTimeSignature(timeSignature);
        stave2.addClef('treble'); // Second staff only gets clef, no time signature
        
        // Draw staves
        stave1.setContext(context).draw();
        stave2.setContext(context).draw();

        // Convert pattern to VexFlow notes and split into two systems
        const { system1Notes, system2Notes, system1Beams, system2Beams } = convertPatternToVexFlowNotes(pattern, config || {});
        
        console.log('System 1 notes:', system1Notes.length);
        console.log('System 2 notes:', system2Notes.length);
        console.log('System 1 beams:', system1Beams.length);
        console.log('System 2 beams:', system2Beams.length);
        
        // Get time signature info for spacing
        const timeSig = config?.timeSignature || '4/4';
        const beatsPerMeasure = timeSig === '3/4' ? 3 : 4;
        const totalBeatsPerSystem = beatsPerMeasure * 4; // 4 measures per system
        
        // Calculate available space for notes after clef and time signature
        // Different spacing for 3/4 vs 4/4
        const clefTimeWidth = timeSig === '3/4' ? 40 : 35;
        const clefOnlyWidth = timeSig === '3/4' ? 20 : 15;
        
        const usableWidth1 = staveWidth - clefTimeWidth; // First staff
        const usableWidth2 = staveWidth - clefOnlyWidth; // Second staff
        
        // Create voices with proper rhythmic spacing
        let voice1, voice2;
        
        if (system1Notes.length > 0) {
          voice1 = new VF.Voice({ num_beats: totalBeatsPerSystem, beat_value: 4 }); // Dynamically set beats
          voice1.addTickables(system1Notes);
          
          // Use VexFlow formatter with different spacing for 3/4 vs 4/4
          const formatter1 = new VF.Formatter({ 
            softmaxFactor: timeSig === '3/4' ? 4 : 3,  // More space for 3/4 time
            globalSoftmax: true
          });
          formatter1.joinVoices([voice1]);
          
          // Calculate minimum width needed and adjust if necessary
          formatter1.preCalculateMinTotalWidth([voice1]);
          const minWidth1 = formatter1.getMinTotalWidth();
          const availableWidth1 = usableWidth1;
          
          // Use the larger of minimum required width or available width
          const formatWidth1 = Math.max(minWidth1, availableWidth1);
          
          // Format with even spacing for 3/4 time
          formatter1.formatToStave([voice1], stave1, {
            align_rests: true,
            context: context,
            stave: stave1,
            auto_beam: timeSig !== '3/4'  // Disable auto-beaming for 3/4 for even spacing
          });
          
          voice1.draw(context, stave1);
          
          // Draw beams for eighth notes in system 1
          system1Beams.forEach(beam => beam.setContext(context).draw());
          
          console.log(`Staff 1 - Min width: ${minWidth1}, Available: ${availableWidth1}, Using: ${formatWidth1}`);
        }
        
        if (system2Notes.length > 0) {
          voice2 = new VF.Voice({ num_beats: totalBeatsPerSystem, beat_value: 4 }); // Dynamically set beats
          voice2.addTickables(system2Notes);
          
          // Use VexFlow formatter with different spacing for 3/4 vs 4/4
          const formatter2 = new VF.Formatter({ 
            softmaxFactor: timeSig === '3/4' ? 4 : 3,  // More space for 3/4 time
            globalSoftmax: true
          });
          formatter2.joinVoices([voice2]);
          
          // Calculate minimum width needed and adjust if necessary
          formatter2.preCalculateMinTotalWidth([voice2]);
          const minWidth2 = formatter2.getMinTotalWidth();
          const availableWidth2 = usableWidth2;
          
          // Use the larger of minimum required width or available width
          const formatWidth2 = Math.max(minWidth2, availableWidth2);
          
          // Format with even spacing for 3/4 time
          formatter2.formatToStave([voice2], stave2, {
            align_rests: true,
            context: context,
            stave: stave2,
            auto_beam: timeSig !== '3/4'  // Disable auto-beaming for 3/4 for even spacing
          });
          
          voice2.draw(context, stave2);
          
          // Draw beams for eighth notes in system 2
          system2Beams.forEach(beam => beam.setContext(context).draw());
          
          console.log(`Staff 2 - Min width: ${minWidth2}, Available: ${availableWidth2}, Using: ${formatWidth2}`);
        }

        // Now that notes are rendered, add bar lines based on actual note positions
        addBarLines(context, stave1, stave2, system1Notes, system2Notes, clefTimeWidth, clefOnlyWidth, config);

        // Add dynamics markings if present
        // addDynamics(context, stave1, stave2, pattern, config);

        // Calculate note positions for highlighting after rendering
        calculateVexFlowNotePositions(stave1, stave2, system1Notes, system2Notes);
        
        isInitializedRef.current = true;
        currentPatternHashRef.current = patternHash;
        console.log('VexFlow initialization complete');
        
      } catch (error) {
        console.error('VexFlow renderer initialization failed:', error);
        console.log('Falling back to canvas renderer');
        setUseCanvasFallback(true);
      }
    };

    initializeRenderer();

    return () => {
      isInitializedRef.current = false;
      if (rendererRef.current) {
        rendererRef.current = null;
      }
    };
  }, [pattern, vexflowLoaded, useCanvasFallback, config]);

  const convertPatternToVexFlowNotes = (pattern, config) => {
    const VF = window.Vex.Flow;
    const system1Notes = [];
    const system2Notes = [];
    let currentBeat = 0;
    
    // Get time signature info
    const timeSignature = config?.timeSignature || '4/4';
    const beatsPerMeasure = timeSignature === '3/4' ? 3 : 4;
    
    // Helper function to determine if a note should have stem down
    // Notes on middle line (B4) and higher should have stems down
    const shouldHaveStemDown = (pitch) => {
      const noteLineMap = {
        'F4': 5,   // Below staff - STEM UP
        'G4': 4.5, // Between lines - STEM UP
        'A4': 4,   // Bottom line - STEM UP
        'Bb4': 3.5, // Between lines - STEM UP
        'B4': 3,   // Middle line - STEM DOWN
        'C5': 2.5, // Between lines - STEM DOWN
        'D5': 2,   // Second line - STEM DOWN
        'E5': 1.5, // Between lines - STEM DOWN
        'F5': 1    // Top line - STEM DOWN
      };
      
      const line = noteLineMap[pitch];
      return line !== undefined && line <= 3; // Middle line (3) and higher get stems down
    };
    
    // Process each note and add to appropriate system
    pattern.forEach((note, index) => {
      const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
      const measureNumber = Math.floor(currentBeat / beatsPerMeasure) + 1;
      
      let vexflowNote;
      
      try {
        if (note.type === 'rest') {
          const duration = getDurationString(note.duration);
          vexflowNote = new VF.StaveNote({
            keys: ['b/4'],  // B4 middle line position
            duration: duration + 'r'
          });
          
          // Try alternative positioning if VexFlow is misaligning rests
          try {
            // Force consistent rest positioning on middle line
            vexflowNote.rest_line = 2; // Middle line (0-indexed from bottom)
          } catch (e) {
            // If rest_line property doesn't exist, continue with default
          }
        } else {
          const duration = getDurationString(note.duration);
          const vexflowPitch = convertPitchToVexFlow(note.pitch);
          
          // Create note configuration with proper stem direction
          const noteConfig = {
            keys: [vexflowPitch],
            duration: duration,
            clef: 'treble'  // Important for accurate auto-stemming
          };
          
          // Set stem direction based on pitch position
          if (shouldHaveStemDown(note.pitch)) {
            noteConfig.stem_direction = VF.Stem.DOWN;
            console.log(`Setting stem DOWN for ${note.pitch} (${vexflowPitch})`);
          } else {
            noteConfig.stem_direction = VF.Stem.UP;
            console.log(`Setting stem UP for ${note.pitch} (${vexflowPitch})`);
          }
          
          vexflowNote = new VF.StaveNote(noteConfig);
        }
        
        // Add to appropriate system (measures 1-4 go to system1, 5-8 go to system2)
        if (measureNumber <= 4) {
          system1Notes.push(vexflowNote);
        } else {
          system2Notes.push(vexflowNote);
        }
      } catch (error) {
        console.error('Error creating VexFlow note:', error, note);
      }
      
      currentBeat += beats;
    });
    
    // Add rests to complete partial measures and fill remaining measures
    const fillMeasuresWithRests = (notes, startBeat, endBeat) => {
      let beat = startBeat;
      
      // Calculate current beats used by existing notes
      let usedBeats = 0;
      pattern.forEach((note, index) => {
        const noteBeats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
        const measureNum = Math.floor(usedBeats / beatsPerMeasure) + 1;
        const systemCheck = (startBeat === 0) ? measureNum <= 4 : measureNum > 4;
        
        if (systemCheck) {
          beat += noteBeats;
        }
        usedBeats += noteBeats;
      });
      
      // Fill remaining beats with quarter rests
      while (beat < endBeat) {
        const remainingInMeasure = beatsPerMeasure - (beat % beatsPerMeasure);
        let restDuration = 'qr'; // Default to quarter rest
        
        if (timeSignature === '3/4') {
          // For 3/4 time, use appropriate rests
          if (remainingInMeasure >= 3) {
            restDuration = 'hr'; // Half rest + quarter rest = 3 beats, but use half rest for visual simplicity
            beat += 2; // Half rest = 2 beats
          } else {
            restDuration = 'qr'; // Quarter rest
            beat += 1;
          }
        } else {
          // For 4/4 time (original logic)
          if (remainingInMeasure >= 4) {
            restDuration = 'wr'; // Whole rest
            beat += 4;
          } else if (remainingInMeasure >= 2) {
            restDuration = 'hr'; // Half rest
            beat += 2;
          } else {
            restDuration = 'qr'; // Quarter rest
            beat += 1;
          }
        }
        
        const restNote = new VF.StaveNote({
          keys: ['b/4'], // All rests positioned on middle line (B line)
          duration: restDuration
        });
        
        notes.push(restNote);
      }
    };
    
    // Calculate end beats for each system based on time signature
    const totalBeatsPerSystem = beatsPerMeasure * 4; // 4 measures per system
    
    // Fill system 1 (measures 1-4)
    if (system1Notes.length > 0) {
      fillMeasuresWithRests(system1Notes, 0, totalBeatsPerSystem);
    } else {
      // If no notes in system 1, fill with appropriate rests
      for (let i = 0; i < 4; i++) {
        if (timeSignature === '3/4') {
          // For 3/4, add a half rest and quarter rest per measure
          system1Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'hr' })); // 2 beats
          system1Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'qr' })); // 1 beat
        } else {
          system1Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'wr' })); // 4 beats
        }
      }
    }
    
    // Fill system 2 (measures 5-8)
    if (system2Notes.length > 0) {
      fillMeasuresWithRests(system2Notes, totalBeatsPerSystem, totalBeatsPerSystem * 2);
    } else {
      // If no notes in system 2, fill with appropriate rests
      for (let i = 0; i < 4; i++) {
        if (timeSignature === '3/4') {
          // For 3/4, add a half rest and quarter rest per measure
          system2Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'hr' })); // 2 beats
          system2Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'qr' })); // 1 beat
        } else {
          system2Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'wr' })); // 4 beats
        }
      }
    }
    
    // Add beaming for eighth notes with proper stem direction handling
    const addBeamsToSystem = (notes) => {
      const beams = [];
      let currentEighthGroup = [];
      
      notes.forEach((note, index) => {
        if (note.getDuration() === '8' && !note.isRest()) {
          currentEighthGroup.push(note);
        } else {
          if (currentEighthGroup.length >= 2) {
            // Create beam with auto stem direction based on the group
            const beam = new VF.Beam(currentEighthGroup, true); // true = auto_stem
            beam.render_options = {
              beam_width: 5,
              max_slope: 0.25,
              min_slope: -0.25,
              slope_iterations: 25,
              slope_cost: 25,
              show_stemlets: true,
              stemlet_extension: 7,
              partial_beam_length: 10
            };
            beams.push(beam);
          }
          currentEighthGroup = [];
        }
      });
      
      if (currentEighthGroup.length >= 2) {
        // Create beam with auto stem direction based on the group
        const beam = new VF.Beam(currentEighthGroup, true); // true = auto_stem
        beam.render_options = {
          beam_width: 5,
          max_slope: 0.25,
          min_slope: -0.25,
          slope_iterations: 25,
          slope_cost: 25,
          show_stemlets: true,
          stemlet_extension: 7,
          partial_beam_length: 10
        };
        beams.push(beam);
      }
      
      return beams;
    };
    
    const system1Beams = addBeamsToSystem(system1Notes);
    const system2Beams = addBeamsToSystem(system2Notes);
    
    return { 
      system1Notes, 
      system2Notes, 
      system1Beams, 
      system2Beams 
    };
  };

  const getDurationString = (duration) => {
    switch (duration) {
      case 'e': return '8';   // eighth
      case 'q': return 'q';   // quarter  
      case 'h': return 'h';   // half
      case 'w': return 'w';   // whole
      default: return 'q';
    }
  };

  const convertPitchToVexFlow = (pitch) => {
    const octaveIndex = pitch.search(/\d/);
    
    if (octaveIndex === -1) {
      console.warn('No octave found in pitch:', pitch);
      return 'c/4';
    }
    
    const noteName = pitch.substring(0, octaveIndex).toLowerCase();
    const octave = pitch.substring(octaveIndex);
    
    return `${noteName}/${octave}`;
  };

  const addBarLines = (context, stave1, stave2, system1Notes, system2Notes, clefTimeWidth, clefOnlyWidth, config) => {
    // Get time signature info
    const timeSignature = config?.timeSignature || '4/4';
    const beatsPerMeasure = timeSignature === '3/4' ? 3 : 4;
    
    // Helper function to add bar lines based on actual note positions
    const addBarLinesToStaff = (stave, notes, clefWidth) => {
      if (notes.length === 0) return;
      
      let currentBeat = 0;
      const positions = [];
      
      notes.forEach((note, index) => {
        // Get note duration in beats
        let noteDuration = 1; // default quarter note
        if (note.getDuration() === 'h' || note.getDuration() === 'hr') noteDuration = 2;
        else if (note.getDuration() === 'w' || note.getDuration() === 'wr') noteDuration = 4;
        else if (note.getDuration() === '8') noteDuration = 0.5;
        
        currentBeat += noteDuration;
        
        // Check if we've completed a measure
        if (currentBeat % beatsPerMeasure === 0 && currentBeat < (beatsPerMeasure * 4)) {
          // Get the actual X position of this note
          let noteX;
          try {
            if (note.getAbsoluteX) {
              noteX = note.getAbsoluteX();
            } else if (note.attrs && note.attrs.x) {
              noteX = note.attrs.x;
            } else {
              // Fallback to proportional spacing
              const progress = currentBeat / (beatsPerMeasure * 4);
              const usableWidth = stave.getWidth() - clefWidth;
              noteX = stave.getX() + clefWidth + (progress * usableWidth);
            }
            
            // Position bar line slightly to the right of the note
            const barX = noteX + 35;
            if (barX < stave.getX() + stave.getWidth() - 20) {
              positions.push(barX);
            }
          } catch (e) {
            // Fallback positioning
            const progress = currentBeat / (beatsPerMeasure * 4);
            const usableWidth = stave.getWidth() - clefWidth;
            const barX = stave.getX() + clefWidth + (progress * usableWidth) + 20;
            if (barX < stave.getX() + stave.getWidth() - 20) {
              positions.push(barX);
            }
          }
        }
      });
      
      // Draw the bar lines
      positions.forEach(barX => {
        context.setLineWidth(1);
        context.beginPath();
        context.moveTo(barX, stave.getYForLine(0));
        context.lineTo(barX, stave.getYForLine(4));
        context.stroke();
      });
    };
    
    // Add bar lines to both staves
    addBarLinesToStaff(stave1, system1Notes, clefTimeWidth);
    addBarLinesToStaff(stave2, system2Notes, clefOnlyWidth);
    
    // Double bar line only at end of second staff (final ending)
    const endX2 = stave2.getX() + stave2.getWidth();
    context.setLineWidth(1);
    context.beginPath();
    context.moveTo(endX2 - 4, stave2.getYForLine(0));
    context.lineTo(endX2 - 4, stave2.getYForLine(4));
    context.stroke();
    
    context.setLineWidth(3);
    context.beginPath();
    context.moveTo(endX2, stave2.getYForLine(0));
    context.lineTo(endX2, stave2.getYForLine(4));
    context.stroke();
    context.setLineWidth(1);
  };

  const addDynamics = (context, stave1, stave2, pattern, config) => {
    // Check if pattern has dynamics information
    const dynamics = pattern._dynamics || (pattern.length > 0 && pattern[0]._dynamics);
    
    if (!dynamics) {
      return; // No dynamics to display
    }
    
    // Set font for dynamics
    context.setFont('italic bold 24px Times, serif');
    context.fillStyle = '#000';
    context.textAlign = 'left';
    context.textBaseline = 'alphabetic';
    
    // Add dynamics to top staff
    if (dynamics.topStaff) {
      const dynamicX = stave1.getX() + 55; // Position under time signature, not over first note
      const dynamicY = stave1.getYForLine(4) + 25; // Below the staff
      context.fillText(dynamics.topStaff, dynamicX, dynamicY);
    }
    
    // Add dynamics to bottom staff
    if (dynamics.bottomStaff) {
      const dynamicX = stave2.getX() + 35; // Position after clef, before first note
      const dynamicY = stave2.getYForLine(4) + 25; // Below the staff
      context.fillText(dynamics.bottomStaff, dynamicX, dynamicY);
    }
  };

  const calculateVexFlowNotePositions = (stave1, stave2, system1Notes, system2Notes) => {
    const positions = [];
    let noteIndex = 0;
    
    // Get actual positions from rendered VexFlow notes
    system1Notes.forEach((vfNote, vfIndex) => {
      if (noteIndex < pattern.length && pattern[noteIndex].type !== 'rest') {
        let noteX;
        
        try {
          if (vfNote.getAbsoluteX) {
            noteX = vfNote.getAbsoluteX();
          } else if (vfNote.attrs && vfNote.attrs.x) {
            noteX = vfNote.attrs.x;
          } else {
            const progress = vfIndex / Math.max(system1Notes.length - 1, 1);
            const usableWidth = stave1.getWidth() - 35;
            noteX = stave1.getX() + 35 + (progress * usableWidth);
          }
        } catch (e) {
          const progress = vfIndex / Math.max(system1Notes.length - 1, 1);
          const usableWidth = stave1.getWidth() - 35;
          noteX = stave1.getX() + 35 + (progress * usableWidth);
        }
        
        positions[noteIndex] = {
          x: noteX - 8,
          y: stave1.getYForLine(4) - 8,
          width: 16,
          height: 16,
          centerX: noteX + 8,
          centerY: stave1.getYForLine(2),
          syllableY: stave1.getYForLine(4) + 25
        };
      }
      
      noteIndex++;
    });
    
    // Get actual positions for system 2 notes
    system2Notes.forEach((vfNote, vfIndex) => {
      if (noteIndex < pattern.length && pattern[noteIndex].type !== 'rest') {
        let noteX;
        
        try {
          if (vfNote.getAbsoluteX) {
            noteX = vfNote.getAbsoluteX();
          } else if (vfNote.attrs && vfNote.attrs.x) {
            noteX = vfNote.attrs.x;
          } else {
            const progress = vfIndex / Math.max(system2Notes.length - 1, 1);
            const usableWidth = stave2.getWidth() - 15;
            noteX = stave2.getX() + 15 + (progress * usableWidth);
          }
        } catch (e) {
          const progress = vfIndex / Math.max(system2Notes.length - 1, 1);
          const usableWidth = stave2.getWidth() - 15;
          noteX = stave2.getX() + 15 + (progress * usableWidth);
        }
        
        positions[noteIndex] = {
          x: noteX - 8,
          y: stave2.getYForLine(4) - 8,
          width: 16,
          height: 16,
          centerX: noteX + 8,
          centerY: stave2.getYForLine(2),
          syllableY: stave2.getYForLine(4) + 25
        };
      }
      
      noteIndex++;
    });

    notePositionsRef.current = positions;
  };

  // Canvas fallback renderer
  useEffect(() => {
    if (!useCanvasFallback || !pattern.length) {
      return;
    }

    const patternHash = pattern
      .map((n) => `${n.syllable || 'rest'}-${n.duration}-${n.pitch || 'none'}`)
      .join('|');

    if (isInitializedRef.current && currentPatternHashRef.current === patternHash) {
      console.log('Skipping Canvas init – same pattern');
      return;
    }

    console.log('Starting Canvas fallback initialization');

    const initializeCanvasRenderer = () => {
      try {
        const canvas = canvasRef.current;
        const highlightCanvas = highlightCanvasRef.current;
        const syllableCanvas = syllableCanvasRef.current;
        
        if (!canvas || !highlightCanvas || !syllableCanvas) {
          return;
        }

        // Set dimensions
        const width = canvas.clientWidth || 600;
        const height = 300;
        
        [canvas, highlightCanvas, syllableCanvas].forEach((c) => {
          c.width = width;
          c.height = height;
          c.style.width = `${width}px`;
          c.style.height = `${height}px`;
        });

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        
        // Draw simple staff notation
        drawCanvasStaff(ctx, width, height);
        drawCanvasNotes(ctx, pattern, width, height);
        
        // Add dynamics markings for canvas fallback
        // drawCanvasDynamics(ctx, pattern, width, height);
        
        // Calculate note positions for highlighting
        calculateCanvasNotePositions(width, height);
        
        isInitializedRef.current = true;
        currentPatternHashRef.current = patternHash;
        console.log('Canvas fallback initialization complete');
        
      } catch (error) {
        console.error('Canvas fallback initialization failed:', error);
      }
    };

    initializeCanvasRenderer();

    return () => {
      isInitializedRef.current = false;
    };
  }, [pattern, useCanvasFallback, config]);

  const drawCanvasStaff = (ctx, width, height) => {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    // Draw two 5-line staves
    const staveY1 = 60;
    const staveY2 = 160;
    const staveWidth = width - 100;
    const staveX = 50;
    
    // First staff
    for (let i = 0; i < 5; i++) {
      const y = staveY1 + i * 8;
      ctx.beginPath();
      ctx.moveTo(staveX, y);
      ctx.lineTo(staveX + staveWidth, y);
      ctx.stroke();
    }
    
    // Second staff
    for (let i = 0; i < 5; i++) {
      const y = staveY2 + i * 8;
      ctx.beginPath();
      ctx.moveTo(staveX, y);
      ctx.lineTo(staveX + staveWidth, y);
      ctx.stroke();
    }
    
    // Draw treble clefs (simplified)
    ctx.font = '24px serif';
    ctx.fillStyle = '#000';
    ctx.fillText('𝄞', staveX + 5, staveY1 + 24);
    ctx.fillText('𝄞', staveX + 5, staveY2 + 24);
    
    // Draw time signature - dynamically based on config
    const timeSignature = config?.timeSignature || '4/4';
    const [numerator, denominator] = timeSignature.split('/');
    
    ctx.font = '14px serif';
    ctx.fillText(numerator, staveX + 35, staveY1 + 12);
    ctx.fillText(denominator, staveX + 35, staveY1 + 24);
    ctx.fillText(numerator, staveX + 35, staveY2 + 12);
    ctx.fillText(denominator, staveX + 35, staveY2 + 24);
  };

  const drawCanvasDynamics = (ctx, pattern, width, height) => {
    // Check if pattern has dynamics information
    const dynamics = pattern._dynamics || (pattern.length > 0 && pattern[0]._dynamics);
    
    if (!dynamics) {
      return; // No dynamics to display
    }
    
    const staveY1 = 60;
    const staveY2 = 160;
    const staveX = 50;
    
    // Set font for dynamics
    ctx.font = 'italic bold 24px Times, serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    
    // Add dynamics to top staff
    if (dynamics.topStaff) {
      const dynamicX = staveX + 55; // Position under time signature, not over first note
      const dynamicY = staveY1 + 32 + 25; // Below the staff (staveY1 + staff height + margin)
      ctx.fillText(dynamics.topStaff, dynamicX, dynamicY);
    }
    
    // Add dynamics to bottom staff
    if (dynamics.bottomStaff) {
      const dynamicX = staveX + 35; // Position after clef, before first note
      const dynamicY = staveY2 + 32 + 25; // Below the staff (staveY2 + staff height + margin)
      ctx.fillText(dynamics.bottomStaff, dynamicX, dynamicY);
    }
  };

  // Helper function to determine if a note should have stem down (for canvas fallback)
  const shouldCanvasNoteHaveStemDown = (pitch) => {
    // Notes on middle line (B4) and higher should have stems down
    const notesToStemDown = ['B4', 'C5', 'D5', 'E5', 'F5'];
    return notesToStemDown.includes(pitch);
  };

  const drawCanvasNotes = (ctx, pattern, width, height) => {
    const staveWidth = width - 100;
    const timeSignature = config?.timeSignature || '4/4';
    const beatsPerMeasure = timeSignature === '3/4' ? 3 : 4;
    const totalBeatsPerSystem = beatsPerMeasure * 4; // 4 measures per system
    
    // For 3/4 time, use even spacing for all 12 beats per system
    const baseNoteSpacing = staveWidth / totalBeatsPerSystem;
    let currentX = 100; // Start after clef and time signature
    let currentBeat = 0;
    
    ctx.fillStyle = '#000';
    
    pattern.forEach((note, index) => {
      const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
      const measureNumber = Math.floor(currentBeat / beatsPerMeasure) + 1;
      const staveY = measureNumber <= 4 ? 60 : 160;
      
      // For 3/4 time, use completely even spacing
      let noteSpacing;
      if (timeSignature === '3/4') {
        noteSpacing = baseNoteSpacing; // Even spacing for all notes
      } else {
        // Original proportional spacing for 4/4 time
        noteSpacing = baseNoteSpacing;
        if (note.duration === 'h') {
          noteSpacing = baseNoteSpacing * 1.8;
        } else if (note.duration === 'q') {
          noteSpacing = baseNoteSpacing * 1.0;
        } else if (note.duration === 'e') {
          noteSpacing = baseNoteSpacing * 0.6;
          const nextNote = pattern[index + 1];
          if (nextNote && nextNote.duration === 'e' && nextNote.type !== 'rest') {
            noteSpacing = baseNoteSpacing * 0.5;
          }
        }
      }
      
      if (measureNumber > 4) {
        currentX = 100; // Reset X for second staff
      }
      
      if (note.type !== 'rest') {
        const noteY = getNoteY(note.pitch, staveY);
        const stemDown = shouldCanvasNoteHaveStemDown(note.pitch);
        
        // Draw note head
        ctx.beginPath();
        if (note.duration === 'h') {
          // Half note - hollow
          ctx.arc(currentX, noteY, 4, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          // Quarter note or eighth note - filled
          ctx.arc(currentX, noteY, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Draw stem for quarter and eighth notes with proper direction
        if (note.duration !== 'w' && note.duration !== 'h') {
          ctx.beginPath();
          if (stemDown) {
            // Stem down - goes on left side of notehead
            ctx.moveTo(currentX - 4, noteY);
            ctx.lineTo(currentX - 4, noteY + 24);
          } else {
            // Stem up - goes on right side of notehead
            ctx.moveTo(currentX + 4, noteY);
            ctx.lineTo(currentX + 4, noteY - 24);
          }
          ctx.stroke();
        } else if (note.duration === 'h') {
          // Half note stem with proper direction
          ctx.beginPath();
          if (stemDown) {
            // Stem down - goes on left side of notehead
            ctx.moveTo(currentX - 4, noteY);
            ctx.lineTo(currentX - 4, noteY + 24);
          } else {
            // Stem up - goes on right side of notehead
            ctx.moveTo(currentX + 4, noteY);
            ctx.lineTo(currentX + 4, noteY - 24);
          }
          ctx.stroke();
        }
        
        // Handle eighth note beaming in canvas fallback with proper stem direction
        if (note.duration === 'e' && timeSignature !== '3/4') {
          const nextNote = pattern[index + 1];
          if (nextNote && nextNote.duration === 'e' && nextNote.type !== 'rest') {
            const nextBeats = nextNote.duration === 'h' ? 2 : nextNote.duration === 'e' ? 0.5 : 1;
            let nextNoteSpacing = baseNoteSpacing;
            if (nextNote.duration === 'e') {
              nextNoteSpacing = baseNoteSpacing * 0.5;
            }
            const nextX = currentX + nextNoteSpacing * nextBeats;
            const nextNoteY = getNoteY(nextNote.pitch, staveY);
            const nextStemDown = shouldCanvasNoteHaveStemDown(nextNote.pitch);
            
            // Draw beam between eighth notes - connect from stem tip to stem tip
            ctx.beginPath();
            ctx.lineWidth = 3;
            
            // Get stem tip positions for both notes
            let currentStemTipX, currentStemTipY, nextStemTipX, nextStemTipY;
            
            if (stemDown) {
              currentStemTipX = currentX - 4; // Left side for down stems
              currentStemTipY = noteY + 24;   // Down 24 pixels
            } else {
              currentStemTipX = currentX + 4; // Right side for up stems  
              currentStemTipY = noteY - 24;   // Up 24 pixels
            }
            
            if (nextStemDown) {
              nextStemTipX = nextX - 4;       // Left side for down stems
              nextStemTipY = nextNoteY + 24;  // Down 24 pixels
            } else {
              nextStemTipX = nextX + 4;       // Right side for up stems
              nextStemTipY = nextNoteY - 24;  // Up 24 pixels
            }
            
            // Draw beam connecting the stem tips
            ctx.moveTo(currentStemTipX, currentStemTipY);
            ctx.lineTo(nextStemTipX, nextStemTipY);
            
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        }
      } else {
        // Draw rest - Position quarter rest on middle line (third line)
        const restY = staveY + 16; // Middle line of staff (3rd line from top)
        
        if (note.duration === 'q') {
          // Draw quarter rest as a zigzag pattern centered on the middle line
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.moveTo(currentX - 3, restY - 8);
          ctx.lineTo(currentX + 3, restY - 4);
          ctx.lineTo(currentX - 2, restY);
          ctx.lineTo(currentX + 4, restY + 4);
          ctx.stroke();
          ctx.lineWidth = 1;
        } else if (note.duration === 'h') {
          // Half rest - rectangle sitting on middle line
          ctx.fillRect(currentX - 3, restY - 4, 6, 4);
        } else if (note.duration === 'w') {
          // Whole rest - rectangle hanging from 4th line
          ctx.fillRect(currentX - 3, restY - 8, 6, 4);
        } else {
          // Other rests - simple rectangle for now
          ctx.fillRect(currentX - 2, restY - 4, 4, 8);
        }
      }
      
      // For 3/4 time, advance by exactly one beat spacing for each note
      if (timeSignature === '3/4') {
        currentX += noteSpacing;
      } else {
        currentX += noteSpacing * beats;
      }
      currentBeat += beats;
    });
  };

  const getNoteY = (pitch, staveY) => {
    const pitchMap = {
      'C4': staveY + 40, // Below staff
      'D4': staveY + 36,
      'E4': staveY + 32, // Bottom line
      'F4': staveY + 28,
      'G4': staveY + 24, // Second line
      'A4': staveY + 20,
      'B4': staveY + 16, // Middle line
      'Bb4': staveY + 16, // Same as B4
      'C5': staveY + 12,
      'D5': staveY + 8,
      'E5': staveY + 4,
      'F5': staveY + 0
    };
    return pitchMap[pitch] || staveY + 24;
  };

  const calculateCanvasNotePositions = (width, height) => {
    const positions = [];
    const staveWidth = width - 100;
    const timeSignature = config?.timeSignature || '4/4';
    const beatsPerMeasure = timeSignature === '3/4' ? 3 : 4;
    const totalBeatsPerSystem = beatsPerMeasure * 4;
    const baseNoteSpacing = staveWidth / totalBeatsPerSystem;
    let currentX = 100;
    let currentBeat = 0;
    
    pattern.forEach((note, index) => {
      if (note.type !== 'rest') {
        const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
        const measureNumber = Math.floor(currentBeat / beatsPerMeasure) + 1;
        const staveY = measureNumber <= 4 ? 60 : 160;
        
        if (measureNumber > 4) {
          currentX = 100; // Reset for second staff
        }
        
        positions[index] = {
          x: currentX - 6,
          y: staveY + 16,
          width: 12,
          height: 8,
          centerX: currentX,
          centerY: staveY + 16,
          syllableY: staveY + 100
        };
        
        // Apply spacing based on time signature
        let noteSpacing;
        if (timeSignature === '3/4') {
          noteSpacing = baseNoteSpacing; // Even spacing
        } else {
          // Original proportional spacing for 4/4
          noteSpacing = baseNoteSpacing;
          if (note.duration === 'h') {
            noteSpacing = baseNoteSpacing * 1.8;
          } else if (note.duration === 'q') {
            noteSpacing = baseNoteSpacing * 1.0;
          } else if (note.duration === 'e') {
            noteSpacing = baseNoteSpacing * 0.6;
            const nextNote = pattern[index + 1];
            if (nextNote && nextNote.duration === 'e' && nextNote.type !== 'rest') {
              noteSpacing = baseNoteSpacing * 0.5;
            }
          }
        }
        
        if (timeSignature === '3/4') {
          currentX += noteSpacing;
        } else {
          currentX += noteSpacing * beats;
        }
      }
      
      const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
      currentBeat += beats;
    });

    notePositionsRef.current = positions;
  };

  // Track canvas fallback state
  useEffect(() => {
    setUseCanvasFallback(hookUseCanvasFallback);
  }, [hookUseCanvasFallback]);

  useEffect(() => {
    const updateHighlights = () => {
      const highlightCanvas = highlightCanvasRef.current;
      if (!highlightCanvas) return;
      const ctx = highlightCanvas.getContext('2d');
      const positions = notePositionsRef.current;
      ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);

      positions.forEach((pos, index) => {
        if (!pos) return;
        if (
          index === currentNoteIndex &&
          !completedNotes[index] &&
          !incorrectNotes[index]
        ) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const lineY = Math.round(pos.syllableY);
          const lineStartX = Math.round(pos.centerX - 15);
          const lineEndX = Math.round(pos.centerX + 15);
          ctx.moveTo(lineStartX, lineY);
          ctx.lineTo(lineEndX, lineY);
          ctx.stroke();
        }
      });
    };

    const animate = () => {
      updateHighlights();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentNoteIndex, completedNotes, incorrectNotes, pattern, bpm]);

  useEffect(() => {
    const syllableCanvas = syllableCanvasRef.current;
    if (!syllableCanvas) return;
    const ctx = syllableCanvas.getContext('2d');
    const positions = notePositionsRef.current;
    ctx.clearRect(0, 0, syllableCanvas.width, syllableCanvas.height);

    positions.forEach((pos, index) => {
      if (!pos) return;
      const isCompletionPage = currentNoteIndex === -1;
      const shouldShowText = isCompletionPage
        ? true
        : completedNotes[index] || incorrectNotes[index];
      if (shouldShowText && pattern[index] && pattern[index].type !== 'rest') {
        const syllable = pattern[index].syllable;
        let color = '#6b7280';
        if (isCompletionPage) {
          if (completedNotes[index]) color = '#10b981';
          else if (incorrectNotes[index]) color = '#eab308';
        } else {
          if (completedNotes[index]) color = '#10b981';
          else if (incorrectNotes[index]) color = '#eab308';
        }
        
        // Adjust syllable position when exercise is complete to account for ResultsCard
        const syllableY = exerciseComplete ? pos.syllableY - 20 : pos.syllableY;
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(syllable, pos.centerX, syllableY);
      }
    });
  }, [completedNotes, incorrectNotes, pattern, currentNoteIndex, exerciseComplete]);

  return (
    <div ref={containerRef} className="flex justify-center mb-6 w-full">
      <div
        className={`bg-white rounded-lg p-6 w-3/4 relative shadow-md border border-gray-200 transition-all duration-300 ${
          exerciseComplete ? 'transform translate-y-4' : ''
        }`}
        style={{ minHeight: '450px' }}
      >
        <LoadingStates
          vexflowLoaded={vexflowLoaded}
          useCanvasFallback={useCanvasFallback}
          loadingError={loadingError}
          exerciseComplete={exerciseComplete}
        />

        {/* VexFlow container */}
        {vexflowLoaded && !useCanvasFallback && (
          <div ref={vexflowRef} className="w-full h-80 mb-4" style={{ zIndex: 1 }} />
        )}

        {/* Canvas fallback */}
        {useCanvasFallback && (
          <canvas
            ref={canvasRef}
            className="absolute top-16 left-6"
            style={{ zIndex: 1 }}
          />
        )}

        {/* Canvas overlays */}
        <canvas
          ref={highlightCanvasRef}
          className="absolute top-16 left-6 pointer-events-none"
          style={{ zIndex: 2 }}
        />
        <canvas
          ref={syllableCanvasRef}
          className="absolute top-16 left-6 pointer-events-none"
          style={{ zIndex: 3 }}
        />

        <SolfegeButtons
          syllables={syllables}
          onSelect={onSelect}
          disabled={disabled}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          showResult={showResult}
          exerciseComplete={exerciseComplete}
        />

        <FeedbackMessage
          exerciseComplete={exerciseComplete}
          showResult={showResult}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
        />
      </div>
    </div>
  );
};

export default CanvasMusicStaff;