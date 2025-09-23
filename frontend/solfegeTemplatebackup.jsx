import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { ArrowLeft, RotateCcw, Star, Trophy, CheckCircle } from 'lucide-react';

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
  const [vexflowLoaded, setVexflowLoaded] = useState(false);
  const [useCanvasFallback, setUseCanvasFallback] = useState(false);
  const [loadingError, setLoadingError] = useState('');

  // Fixed VexFlow loading with correct CDN URLs
  useEffect(() => {
    if (window.Vex?.Flow) {
      console.log('VexFlow already loaded');
      setVexflowLoaded(true);
      return;
    }

    const tryLoadVexFlow = async () => {
      // Updated CDN URLs that actually work in 2025
      const cdnUrls = [
        'https://cdn.jsdelivr.net/npm/vexflow@5.0.0/build/cjs/vexflow.js',
        'https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js',
        'https://unpkg.com/vexflow@5.0.0/build/cjs/vexflow.js',
        'https://unpkg.com/vexflow@4.2.2/build/cjs/vexflow.js',
        'https://cdnjs.cloudflare.com/ajax/libs/vexflow/1.2.93/vexflow-min.js'
      ];

      for (const url of cdnUrls) {
        try {
          console.log(`Trying to load VexFlow from: ${url}`);
          await loadScript(url);
          
          // Check if VexFlow is actually available
          if (window.Vex?.Flow) {
            console.log('VexFlow loaded successfully from:', url);
            setVexflowLoaded(true);
            setLoadingError('');
            return;
          } else {
            console.warn(`Script loaded but VexFlow not found for: ${url}`);
          }
        } catch (error) {
          console.warn(`Failed to load VexFlow from ${url}:`, error);
        }
      }

      console.log('All VexFlow CDN sources failed, using canvas fallback');
      setLoadingError('VexFlow CDN loading failed');
      setUseCanvasFallback(true);
    };

    tryLoadVexFlow();
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        if (window.Vex?.Flow) {
          resolve();
        } else {
          // Script exists but VexFlow not loaded, remove and try again
          existingScript.remove();
        }
      }

      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        // Give it a moment for the library to initialize
        setTimeout(() => {
          if (window.Vex?.Flow) {
            resolve();
          } else {
            reject(new Error('VexFlow not found after script load'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        script.remove();
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  };

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
        
        // Calculate available space for notes after clef and time signature
        const clefTimeWidth = 35; // Even more aggressive - notes very close to time signature
        const clefOnlyWidth = 15;  // Even more aggressive - notes very close to clef
        
        const usableWidth1 = staveWidth - clefTimeWidth; // First staff
        const usableWidth2 = staveWidth - clefOnlyWidth; // Second staff
        
        // Create voices with proper rhythmic spacing
        let voice1, voice2;
        
        if (system1Notes.length > 0) {
          voice1 = new VF.Voice({ num_beats: 16, beat_value: 4 }); // 4 measures of 4/4
          voice1.addTickables(system1Notes);
          
          // Use VexFlow formatter with tighter spacing for eighth notes
          const formatter1 = new VF.Formatter({ 
            softmaxFactor: 3,  // FIXED: Reduced from 5 to 3 for tighter spacing
            globalSoftmax: true
          });
          formatter1.joinVoices([voice1]);
          
          // Calculate minimum width needed and adjust if necessary
          formatter1.preCalculateMinTotalWidth([voice1]);
          const minWidth1 = formatter1.getMinTotalWidth();
          const availableWidth1 = usableWidth1;
          
          // Use the larger of minimum required width or available width
          const formatWidth1 = Math.max(minWidth1, availableWidth1);
          
          // Format with tighter spacing for eighth notes
          formatter1.formatToStave([voice1], stave1, {
            align_rests: true,
            context: context,
            stave: stave1,
            auto_beam: true  // FIXED: Enable auto-beaming for tighter eighth note groups
          });
          
          voice1.draw(context, stave1);
          
          // FIXED: Draw beams for eighth notes in system 1
          system1Beams.forEach(beam => beam.setContext(context).draw());
          
          console.log(`Staff 1 - Min width: ${minWidth1}, Available: ${availableWidth1}, Using: ${formatWidth1}`);
        }
        
        if (system2Notes.length > 0) {
          voice2 = new VF.Voice({ num_beats: 16, beat_value: 4 }); // 4 measures of 4/4  
          voice2.addTickables(system2Notes);
          
          // Use VexFlow formatter with tighter spacing for eighth notes
          const formatter2 = new VF.Formatter({ 
            softmaxFactor: 3,  // FIXED: Reduced from 5 to 3 for tighter spacing
            globalSoftmax: true
          });
          formatter2.joinVoices([voice2]);
          
          // Calculate minimum width needed and adjust if necessary
          formatter2.preCalculateMinTotalWidth([voice2]);
          const minWidth2 = formatter2.getMinTotalWidth();
          const availableWidth2 = usableWidth2;
          
          // Use the larger of minimum required width or available width
          const formatWidth2 = Math.max(minWidth2, availableWidth2);
          
          // Format with tighter spacing for eighth notes
          formatter2.formatToStave([voice2], stave2, {
            align_rests: true,
            context: context,
            stave: stave2,
            auto_beam: true  // FIXED: Enable auto-beaming for tighter eighth note groups
          });
          
          voice2.draw(context, stave2);
          
          // FIXED: Draw beams for eighth notes in system 2
          system2Beams.forEach(beam => beam.setContext(context).draw());
          
          console.log(`Staff 2 - Min width: ${minWidth2}, Available: ${availableWidth2}, Using: ${formatWidth2}`);
        }

        // Now that notes are rendered, add bar lines based on actual note positions
        addBarLines(context, stave1, stave2, system1Notes, system2Notes, clefTimeWidth, clefOnlyWidth);

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
  }, [pattern, vexflowLoaded, useCanvasFallback]); // FIXED: Removed config dependency to prevent infinite re-renders

  const convertPatternToVexFlowNotes = (pattern, config) => {
    const VF = window.Vex.Flow;
    const system1Notes = [];
    const system2Notes = [];
    let currentBeat = 0;
    
    // Process each note and add to appropriate system
    pattern.forEach((note, index) => {
      const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
      const measureNumber = Math.floor(currentBeat / 4) + 1; // 4 beats per measure
      
      let vexflowNote;
      
      try {
        if (note.type === 'rest') {
          const duration = getDurationString(note.duration);
          // FIXED: Position quarter rest on line 3 (middle line, B line in treble clef)
          // This centers the quarter rest symbol properly on the staff
          vexflowNote = new VF.StaveNote({
            keys: ['b/4'],  // B line (third line) is the standard position for quarter rests
            duration: duration + 'r'
          });
        } else {
          const duration = getDurationString(note.duration);
          const vexflowPitch = convertPitchToVexFlow(note.pitch);
          
          vexflowNote = new VF.StaveNote({
            keys: [vexflowPitch],
            duration: duration
          });
          
          // Note: Accidentals are not displayed - using key signature instead
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
        const measureNum = Math.floor(usedBeats / 4) + 1;
        const systemCheck = (startBeat === 0) ? measureNum <= 4 : measureNum > 4;
        
        if (systemCheck) {
          beat += noteBeats;
        }
        usedBeats += noteBeats;
      });
      
      // Fill remaining beats with quarter rests
      while (beat < endBeat) {
        const remainingInMeasure = 4 - (beat % 4);
        let restDuration = 'qr'; // Default to quarter rest
        
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
        
        const restNote = new VF.StaveNote({
          keys: ['b/4'], // All rests positioned on middle line (B line)
          duration: restDuration
        });
        
        notes.push(restNote);
      }
    };
    
    // Fill system 1 (measures 1-4, beats 0-15)
    if (system1Notes.length > 0) {
      fillMeasuresWithRests(system1Notes, 0, 16);
    } else {
      // If no notes in system 1, fill with whole rests
      for (let i = 0; i < 4; i++) {
        system1Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'wr' })); // Middle of staff
      }
    }
    
    // Fill system 2 (measures 5-8, beats 16-31)
    if (system2Notes.length > 0) {
      fillMeasuresWithRests(system2Notes, 16, 32);
    } else {
      // If no notes in system 2, fill with whole rests
      for (let i = 0; i < 4; i++) {
        system2Notes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'wr' })); // Middle of staff
      }
    }
    
    // FIXED: Add beaming for eighth notes with tighter grouping
    // Group consecutive eighth notes and create beams for them
    const addBeamsToSystem = (notes) => {
      const beams = [];
      let currentEighthGroup = [];
      
      notes.forEach((note, index) => {
        if (note.getDuration() === '8' && !note.isRest()) {
          // Add eighth note to current group
          currentEighthGroup.push(note);
        } else {
          // End current group if we have 2 or more eighth notes
          if (currentEighthGroup.length >= 2) {
            // Create beam with tighter spacing
            const beam = new VF.Beam(currentEighthGroup);
            // FIXED: Adjust beam properties for closer spacing
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
      
      // Handle any remaining eighth notes at the end
      if (currentEighthGroup.length >= 2) {
        const beam = new VF.Beam(currentEighthGroup);
        // FIXED: Adjust beam properties for closer spacing
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
    // Handle flats and sharps properly
    // Expected formats: 'C4', 'Bb4', 'F#4', etc.
    
    // Find where the octave number starts
    const octaveIndex = pitch.search(/\d/);
    
    if (octaveIndex === -1) {
      // Fallback if no number found
      console.warn('No octave found in pitch:', pitch);
      return 'c/4';
    }
    
    const noteName = pitch.substring(0, octaveIndex).toLowerCase();
    const octave = pitch.substring(octaveIndex);
    
    return `${noteName}/${octave}`;
  };

  const addBarLines = (context, stave1, stave2, system1Notes, system2Notes, clefTimeWidth, clefOnlyWidth) => {
    // Calculate bar line positions based on actual beat accumulation from the pattern
    const calculateBarLinePositions = (notes, stave, clefWidth, startPatternIndex = 0) => {
      const positions = [];
      let currentBeat = 0;
      let currentX = stave.getX() + clefWidth;
      
      notes.forEach((vfNote, vfIndex) => {
        const patternIndex = startPatternIndex + vfIndex;
        if (patternIndex >= pattern.length) return;
        
        const patternNote = pattern[patternIndex];
        const beats = patternNote.duration === 'h' ? 2 : patternNote.duration === 'e' ? 0.5 : 1;
        
        // Try to get the actual VexFlow note position
        let noteX;
        try {
          if (vfNote.getAbsoluteX) {
            noteX = vfNote.getAbsoluteX();
          } else if (vfNote.attrs && vfNote.attrs.x) {
            noteX = vfNote.attrs.x;
          } else {
            // Fallback to estimated position
            const progress = (currentBeat + beats) / 16; // 16 beats per staff
            const usableWidth = stave.getWidth() - clefWidth;
            noteX = stave.getX() + clefWidth + (progress * usableWidth);
          }
        } catch (e) {
          // Final fallback
          const progress = (currentBeat + beats) / 16;
          const usableWidth = stave.getWidth() - clefWidth;
          noteX = stave.getX() + clefWidth + (progress * usableWidth);
        }
        
        currentBeat += beats;
        
        // Add bar line position at every 4 beats (end of measure)
        if (currentBeat % 4 === 0 && currentBeat < 16) {
          // Position bar line with more space after the note
          positions.push(noteX + 35); // Increased from 15 to 35 for more spacing
        }
      });
      
      return positions;
    };
    
    // Calculate bar line positions for both staves based on actual note positions
    const barLinePositions1 = calculateBarLinePositions(system1Notes, stave1, clefTimeWidth, 0);
    const barLinePositions2 = calculateBarLinePositions(system2Notes, stave2, clefOnlyWidth, system1Notes.length);
    
    // Draw bar lines for first staff
    barLinePositions1.forEach(barX => {
      if (barX < stave1.getX() + stave1.getWidth() - 20) {
        context.setLineWidth(1);
        context.beginPath();
        context.moveTo(barX, stave1.getYForLine(0));
        context.lineTo(barX, stave1.getYForLine(4));
        context.stroke();
      }
    });
    
    // Draw bar lines for second staff
    barLinePositions2.forEach(barX => {
      if (barX < stave2.getX() + stave2.getWidth() - 20) {
        context.setLineWidth(1);
        context.beginPath();
        context.moveTo(barX, stave2.getYForLine(0));
        context.lineTo(barX, stave2.getYForLine(4));
        context.stroke();
      }
    });
    
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

  const calculateVexFlowNotePositions = (stave1, stave2, system1Notes, system2Notes) => {
    const positions = [];
    let noteIndex = 0;
    
    // Get actual positions from rendered VexFlow notes
    system1Notes.forEach((vfNote, vfIndex) => {
      if (noteIndex < pattern.length && pattern[noteIndex].type !== 'rest') {
        let noteX;
        
        try {
          // Try to get the actual rendered position from VexFlow
          if (vfNote.getAbsoluteX) {
            noteX = vfNote.getAbsoluteX();
          } else if (vfNote.attrs && vfNote.attrs.x) {
            noteX = vfNote.attrs.x;
          } else {
            // Fallback: estimate based on note index and formatting
            const progress = vfIndex / Math.max(system1Notes.length - 1, 1);
            const usableWidth = stave1.getWidth() - 35; // Updated to match new clefTimeWidth
            noteX = stave1.getX() + 35 + (progress * usableWidth);
          }
        } catch (e) {
          // Final fallback
          const progress = vfIndex / Math.max(system1Notes.length - 1, 1);
          const usableWidth = stave1.getWidth() - 35; // Updated to match new clefTimeWidth
          noteX = stave1.getX() + 35 + (progress * usableWidth);
        }
        
        positions[noteIndex] = {
          x: noteX - 8,
          y: stave1.getYForLine(4) - 8,
          width: 16,
          height: 16,
          centerX: noteX + 8, // Shifted right to center under note head
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
          // Try to get the actual rendered position from VexFlow
          if (vfNote.getAbsoluteX) {
            noteX = vfNote.getAbsoluteX();
          } else if (vfNote.attrs && vfNote.attrs.x) {
            noteX = vfNote.attrs.x;
          } else {
            // Fallback: estimate based on note index and formatting
            const progress = vfIndex / Math.max(system2Notes.length - 1, 1);
            const usableWidth = stave2.getWidth() - 15; // Updated to match new clefOnlyWidth
            noteX = stave2.getX() + 15 + (progress * usableWidth);
          }
        } catch (e) {
          // Final fallback
          const progress = vfIndex / Math.max(system2Notes.length - 1, 1);
          const usableWidth = stave2.getWidth() - 15; // Updated to match new clefOnlyWidth
          noteX = stave2.getX() + 15 + (progress * usableWidth);
        }
        
        positions[noteIndex] = {
          x: noteX - 8,
          y: stave2.getYForLine(4) - 8,
          width: 16,
          height: 16,
          centerX: noteX + 8, // Shifted right to center under note head
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
  }, [pattern, useCanvasFallback]); // FIXED: Removed config dependency to prevent infinite re-renders

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
    
    // Draw time signature
    ctx.font = '14px serif';
    ctx.fillText('4', staveX + 35, staveY1 + 12);
    ctx.fillText('4', staveX + 35, staveY1 + 24);
    ctx.fillText('4', staveX + 35, staveY2 + 12);
    ctx.fillText('4', staveX + 35, staveY2 + 24);
  };

  const drawCanvasNotes = (ctx, pattern, width, height) => {
    const staveWidth = width - 100;
    const baseNoteSpacing = staveWidth / 16; // 16 beats per staff
    let currentX = 100; // Start after clef and time signature
    let currentBeat = 0;
    
    ctx.fillStyle = '#000';
    
    pattern.forEach((note, index) => {
      const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
      const measureNumber = Math.floor(currentBeat / 4) + 1;
      const staveY = measureNumber <= 4 ? 60 : 160;
      
      // FIXED: Adjust spacing for eighth notes to be closer together
      let noteSpacing = baseNoteSpacing;
      if (note.duration === 'e') {
        const nextNote = pattern[index + 1];
        if (nextNote && nextNote.duration === 'e' && nextNote.type !== 'rest') {
          noteSpacing = baseNoteSpacing * 0.7; // 30% closer for consecutive eighth notes
        }
      }
      
      if (measureNumber > 4) {
        currentX = 100; // Reset X for second staff
      }
      
      if (note.type !== 'rest') {
        const noteY = getNoteY(note.pitch, staveY);
        
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
        
        // Draw stem for quarter and eighth notes
        if (note.duration !== 'w' && note.duration !== 'h') {
          ctx.beginPath();
          ctx.moveTo(currentX + 4, noteY);
          ctx.lineTo(currentX + 4, noteY - 24);
          ctx.stroke();
        } else if (note.duration === 'h') {
          // Half note stem
          ctx.beginPath();
          ctx.moveTo(currentX + 4, noteY);
          ctx.lineTo(currentX + 4, noteY - 24);
          ctx.stroke();
        }
        
        // FIXED: Handle eighth note beaming in canvas fallback with closer spacing
        // For eighth notes, we need to check if the next note is also an eighth note
        // and draw beams between consecutive eighth notes
        if (note.duration === 'e') {
          const nextNote = pattern[index + 1];
          if (nextNote && nextNote.duration === 'e' && nextNote.type !== 'rest') {
            // Calculate next note position with tighter spacing
            const nextBeats = nextNote.duration === 'h' ? 2 : nextNote.duration === 'e' ? 0.5 : 1;
            const tighterSpacing = noteSpacing * 0.8; // FIXED: 20% closer spacing for eighth notes
            const nextX = currentX + tighterSpacing * nextBeats;
            const nextNoteY = getNoteY(nextNote.pitch, staveY);
            
            // Draw beam between eighth notes
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.moveTo(currentX + 4, noteY - 24);
            ctx.lineTo(nextX + 4, nextNoteY - 24);
            ctx.stroke();
            ctx.lineWidth = 1;
          }
        }
      } else {
        // Draw rest - FIXED: Position quarter rest on middle line (third line)
        const restY = staveY + 16; // Position on middle line of staff (B line)
        
        if (note.duration === 'q') {
          // Draw quarter rest as a zigzag pattern centered on the middle line
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.moveTo(currentX - 3, restY - 6);
          ctx.lineTo(currentX + 3, restY - 2);
          ctx.lineTo(currentX - 2, restY + 2);
          ctx.lineTo(currentX + 4, restY + 6);
          ctx.stroke();
          ctx.lineWidth = 1;
        } else {
          // Other rests - simple rectangle for now
          ctx.fillRect(currentX - 2, restY - 4, 4, 8);
        }
      }
      
      currentX += noteSpacing * beats;
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
      'C5': staveY + 12
    };
    return pitchMap[pitch] || staveY + 24;
  };

  const calculateCanvasNotePositions = (width, height) => {
    const positions = [];
    const staveWidth = width - 100;
    const noteSpacing = staveWidth / 16;
    let currentX = 100;
    let currentBeat = 0;
    
    pattern.forEach((note, index) => {
      if (note.type !== 'rest') {
        const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
        const measureNumber = Math.floor(currentBeat / 4) + 1;
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
        
        currentX += noteSpacing * beats;
      }
      
      const beats = note.duration === 'h' ? 2 : note.duration === 'e' ? 0.5 : 1;
      currentBeat += beats;
    });

    notePositionsRef.current = positions;
  };

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
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(syllable, pos.centerX, pos.syllableY);
      }
    });
  }, [completedNotes, incorrectNotes, pattern, currentNoteIndex]);

  return (
    <div ref={containerRef} className="flex justify-center mb-6 w-full">
      <div
        className="bg-white rounded-lg p-6 w-3/4 relative shadow-md border border-gray-200"
        style={{ minHeight: '450px' }}
      >
        {/* Loading status */}
        {!vexflowLoaded && !useCanvasFallback && (
          <div className="text-center mb-4">
            <div className="text-blue-600">Loading VexFlow...</div>
          </div>
        )}

        {/* Error message */}
        {loadingError && useCanvasFallback && (
          <div className="text-center mb-4">
            <div className="text-orange-600 text-sm">
              Using fallback renderer (VexFlow CDN unavailable)
            </div>
          </div>
        )}

        {/* Instructions at the very top */}
        {!exerciseComplete && (vexflowLoaded || useCanvasFallback) && (
          <div className="text-center mb-1">
            <h3 className="text-lg font-semibold text-gray-800">
              Identify the solfege syllable for the highlighted note.
            </h3>
          </div>
        )}

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

        {/* Solfege Buttons */}
        {!exerciseComplete && (vexflowLoaded || useCanvasFallback) && (
          <div className="absolute bottom-16 left-6 right-6" style={{ zIndex: 10 }}> {/* FIXED: Changed from bottom-20 to bottom-16 */}
            <div className="flex flex-wrap justify-center gap-3">
              {syllables?.map((syllable) => {
                let buttonStyle =
                  'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400';

                if (showResult) {
                  if (syllable === correctAnswer) {
                    buttonStyle = 'bg-green-500 text-white border-green-600 shadow-lg';
                  } else if (syllable === selectedAnswer && syllable !== correctAnswer) {
                    buttonStyle = 'bg-red-500 text-white border-red-600 shadow-lg';
                  }
                }

                return (
                  <button
                    key={syllable}
                    onClick={() => onSelect?.(syllable)}
                    disabled={disabled}
                    className={`px-6 py-3 text-lg font-bold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${buttonStyle} ${
                      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {syllable}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback message */}
        {!exerciseComplete && showResult && (
          <div className="absolute bottom-4 left-6 right-6 text-center" style={{ zIndex: 11 }}> {/* FIXED: Changed from bottom-8 to bottom-4 */}
            {selectedAnswer === correctAnswer ? (
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Correct!</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
                <span className="font-semibold">Incorrect</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SolfegeIDTemplate = ({ config = {}, onClose }) => {
  const [synth, setSynth] = useState(null);
  const [solfegeAudio, setSolfegeAudio] = useState(null);
  const [pattern, setPattern] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [completedNotes, setCompletedNotes] = useState(new Array(25).fill(false));
  const [incorrectNotes, setIncorrectNotes] = useState(new Array(25).fill(false));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // FIXED: Add initialization flag

  const BPM = config.bpm || 120;

  useEffect(() => {
    // FIXED: Prevent multiple initializations
    if (isInitialized) return;

    const initSynth = async () => {
      try {
        await Tone.start();
        const newSynth = new Tone.Synth({
          oscillator: {
            type: 'triangle',
            harmonicity: 2
          },
          envelope: {
            attack: 0.02,
            decay: 0.3,
            sustain: 0.2,
            release: 2
          },
          filter: {
            type: 'lowpass',
            frequency: 2000,
            rolloff: -12
          }
        }).toDestination();

        const reverb = new Tone.Reverb({
          decay: 1.5,
          wet: 0.3
        }).toDestination();
        newSynth.connect(reverb);
        setSynth(newSynth);
      } catch (error) {
        console.error('Synth initialization failed:', error);
      }
    };

    const initVocalAudio = async () => {
      try {
        const audio = {};
        const audioFiles = config?.audioFiles || {};
        for (const [syllable, audioPath] of Object.entries(audioFiles)) {
          audio[syllable] = new Audio(audioPath);
          audio[syllable].preload = 'auto';
          audio[syllable].volume = 0.8;
        }
        setSolfegeAudio(audio);
      } catch (error) {
        console.warn('Vocal audio initialization failed:', error);
      }
    };

    const initPattern = () => {
      if (config?.generatePattern) {
        const newPattern = config.generatePattern();
        setPattern(newPattern);
        console.log(
          '🎵 Pattern:',
          newPattern.map((note) => note.syllable || 'rest').join('-')
        );

        // Skip any initial rests
        let firstNoteIndex = 0;
        while (
          firstNoteIndex < newPattern.length &&
          newPattern[firstNoteIndex].type === 'rest'
        ) {
          firstNoteIndex++;
        }
        setCurrentIndex(firstNoteIndex);
      }
    };

    // Initialize everything
    initSynth();
    initVocalAudio();
    initPattern();
    
    // Mark as initialized to prevent re-running
    setIsInitialized(true);

    return () => {
      // Cleanup function will only run on unmount
      setSynth((currentSynth) => {
        if (currentSynth) {
          currentSynth.dispose();
        }
        return null;
      });
    };
  }, []); // Empty dependency array - run only once on mount

  const playCurrentNote = useCallback(() => {
    if (synth && pattern.length > 0 && currentIndex < pattern.length) {
      setIsPlaying(true);
      const currentNote = pattern[currentIndex];
      const duration =
        currentNote.duration === 'h'
          ? '2n'
          : currentNote.duration === 'e'
          ? '8n'
          : '4n';
      synth.triggerAttackRelease(currentNote.pitch, duration);

      const quarterNoteDuration = (60 / BPM) * 1000;
      const timeout =
        currentNote.duration === 'h'
          ? quarterNoteDuration * 2
          : currentNote.duration === 'e'
          ? quarterNoteDuration * 0.5
          : quarterNoteDuration;

      setTimeout(() => setIsPlaying(false), timeout);
    }
  }, [synth, pattern, currentIndex, BPM]);

  const handleAnswerSelect = async (selectedSyllable) => {
    if (
      showResult ||
      exerciseComplete ||
      !pattern.length ||
      currentIndex >= pattern.length
    )
      return;
    const currentNote = pattern[currentIndex];
    if (!currentNote || currentNote.type === 'rest') return;

    const isCorrect = selectedSyllable === currentNote.syllable;
    if (solfegeAudio && solfegeAudio[selectedSyllable]) {
      try {
        solfegeAudio[selectedSyllable].currentTime = 0;
        await solfegeAudio[selectedSyllable].play();
      } catch (e) {
        synth?.triggerAttackRelease(currentNote.pitch, '4n');
      }
    } else {
      synth?.triggerAttackRelease(currentNote.pitch, '4n');
    }

    setSelectedAnswer(selectedSyllable);
    setShowResult(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCompletedNotes((prev) => {
        const arr = [...prev];
        arr[currentIndex] = true;
        return arr;
      });
    } else {
      setIncorrectNotes((prev) => {
        const arr = [...prev];
        arr[currentIndex] = true;
        return arr;
      });
    }

    const nextQuestionDelay = isCorrect ? 0 : 1500;
    const buttonDisableDelay = isCorrect ? 200 : 1500;

    setTimeout(() => {
      let nextIndex = currentIndex + 1;
      while (
        nextIndex < pattern.length &&
        pattern[nextIndex].type === 'rest'
      ) {
        nextIndex++;
      }
      if (nextIndex >= pattern.length) {
        setExerciseComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setShowResult(false);
        setSelectedAnswer(null);
      }
    }, nextQuestionDelay);

    if (isCorrect) {
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
      }, buttonDisableDelay);
    }
  };

  const handleTryAgain = () => {
    if (config.generatePattern) {
      const currentPatternIndex = pattern._patternIndex || -1;
      const newPattern = config.generatePattern(currentPatternIndex);
      setPattern(newPattern);
      console.log(
        '🎵 Pattern:',
        newPattern.map((note) => note.syllable || 'rest').join('-')
      );
      let firstNoteIndex = 0;
      while (
        firstNoteIndex < newPattern.length &&
        newPattern[firstNoteIndex].type === 'rest'
      ) {
        firstNoteIndex++;
      }
      setCurrentIndex(firstNoteIndex);
    }
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setExerciseComplete(false);
    setIsProcessing(false);
    setCompletedNotes(new Array(25).fill(false));
    setIncorrectNotes(new Array(25).fill(false));
  };

  const currentNote = pattern[currentIndex];
  const percentage = exerciseComplete
    ? Math.round(
        (score / pattern.filter((n) => n.type !== 'rest').length) * 100
      )
    : 0;
  const isExcellent = percentage >= 90;
  const isGood = percentage >= 70;

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  {config.title || 'Solfege Exercise'}
                </h1>
                <div className="text-sm text-gray-600 mt-1">
                  {config.subtitle || 'Solfege Identification Exercise'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!exerciseComplete && (
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="ml-2 font-semibold text-gray-800">
                    {pattern.filter(
                      (note, idx) => idx <= currentIndex && note.type !== 'rest'
                    ).length}{' '}
                    / {pattern.filter((n) => n.type !== 'rest').length}
                  </span>
                </div>
              )}
              <button
                onClick={handleTryAgain}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Card */}
        {exerciseComplete && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div
                  className={`${
                    isExcellent ? 'bg-yellow-500' : isGood ? 'bg-blue-500' : 'bg-green-500'
                  } text-white p-4 rounded-lg`}
                >
                  {isExcellent ? (
                    <Trophy className="w-8 h-8" />
                  ) : isGood ? (
                    <Star className="w-8 h-8" />
                  ) : (
                    <CheckCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">
                    {isExcellent ? 'Excellent!' : isGood ? 'Well Done!' : 'Good Try!'}
                  </h2>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {percentage}%
                  </div>
                  <div className="text-gray-600">
                    {score} out of {pattern.filter((n) => n.type !== 'rest').length} correct
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleTryAgain}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Submit Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Music Staff */}
        {pattern.length > 0 && (
          <CanvasMusicStaff
            pattern={pattern}
            currentNoteIndex={exerciseComplete ? -1 : currentIndex}
            isPlaying={isPlaying}
            completedNotes={completedNotes}
            incorrectNotes={incorrectNotes}
            bpm={BPM}
            exerciseComplete={exerciseComplete}
            syllables={config.syllables || ['Do', 'Re', 'Mi', 'Fa', 'Sol']}
            onSelect={handleAnswerSelect}
            disabled={showResult || exerciseComplete || isProcessing}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentNote?.syllable}
            showResult={showResult}
            config={config}
          />
        )}
      </div>
    </div>
  );
};

export default SolfegeIDTemplate;