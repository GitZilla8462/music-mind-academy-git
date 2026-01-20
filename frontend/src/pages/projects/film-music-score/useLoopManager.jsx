// useLoopManager.jsx - Dynamic loop management hook
import { useState, useEffect, useCallback } from 'react';

export const useLoopManager = () => {
  const [loops, setLoops] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load loops from API or local storage
  const loadLoops = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to load from API first
      const response = await fetch('/api/loops');
      if (response.ok) {
        const loopsData = await response.json();
        setLoops(loopsData);
        updateCategories(loopsData);
      } else {
        // Fallback to default loops if API fails
        const defaultLoops = getDefaultLoops();
        setLoops(defaultLoops);
        updateCategories(defaultLoops);
      }
    } catch (err) {
      console.warn('Failed to load loops from API, using defaults:', err);
      const defaultLoops = getDefaultLoops();
      setLoops(defaultLoops);
      updateCategories(defaultLoops);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update categories when loops change
  const updateCategories = (loopsData) => {
    const uniqueCategories = ['All', ...new Set(loopsData.map(loop => loop.category))];
    setCategories(uniqueCategories);
  };

  // Add a new loop
  const addLoop = useCallback(async (loopData) => {
    try {
      // Validate audio file first
      const isValid = await validateAudioFile(loopData.file);
      if (!isValid) {
        throw new Error('Invalid audio file format');
      }

      const newLoop = {
        id: `loop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...loopData,
        createdAt: new Date().toISOString()
      };

      // Save to API if available
      try {
        await fetch('/api/loops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLoop)
        });
      } catch (apiError) {
        console.warn('Failed to save to API, saving locally:', apiError);
      }

      setLoops(prev => [...prev, newLoop]);
      updateCategories([...loops, newLoop]);
      
      return newLoop;
    } catch (error) {
      console.error('Failed to add loop:', error);
      throw error;
    }
  }, [loops]);

  // Remove a loop
  const removeLoop = useCallback(async (loopId) => {
    try {
      // Remove from API if available
      try {
        await fetch(`/api/loops/${loopId}`, { method: 'DELETE' });
      } catch (apiError) {
        console.warn('Failed to delete from API:', apiError);
      }

      setLoops(prev => {
        const updated = prev.filter(loop => loop.id !== loopId);
        updateCategories(updated);
        return updated;
      });
    } catch (error) {
      console.error('Failed to remove loop:', error);
      throw error;
    }
  }, []);

  // Validate audio file
  // CHROMEBOOK MEMORY OPTIMIZATION: Properly clean up Audio elements
  const validateAudioFile = async (fileUrl) => {
    return new Promise((resolve) => {
      const audio = new Audio();

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
        audio.pause();
        audio.src = '';
        audio.load(); // Force release of audio resources
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 5000);

      const onCanPlay = () => {
        clearTimeout(timeout);
        cleanup();
        resolve(true);
      };

      const onError = () => {
        clearTimeout(timeout);
        cleanup();
        resolve(false);
      };

      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError);
      audio.src = fileUrl;
    });
  };

  // Import loops from file
  const importLoops = useCallback(async (file) => {
    try {
      const text = await file.text();
      const importedLoops = JSON.parse(text);
      
      // Validate imported loops
      const validLoops = [];
      for (const loop of importedLoops) {
        if (await validateAudioFile(loop.file)) {
          validLoops.push({
            ...loop,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          });
        }
      }

      setLoops(prev => [...prev, ...validLoops]);
      updateCategories([...loops, ...validLoops]);
      
      return validLoops.length;
    } catch (error) {
      console.error('Failed to import loops:', error);
      throw error;
    }
  }, [loops]);

  // Export loops to file
  const exportLoops = useCallback(() => {
    const dataStr = JSON.stringify(loops, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `loops-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [loops]);

  // Load loops on mount
  useEffect(() => {
    loadLoops();
  }, [loadLoops]);

  return {
    loops,
    categories,
    loading,
    error,
    addLoop,
    removeLoop,
    importLoops,
    exportLoops,
    reloadLoops: loadLoops,
    validateAudioFile
  };
};

// Default loops (fallback) - using actual audio files with enhanced metadata
const getDefaultLoops = () => [
  {
    id: 'ambience-air-conditioner-180',
    name: 'Air Conditioner 180',
    file: '/projects/film-music-score/loops/Ambience Air Conditioner 180 01.wav',
    duration: 4, // Will be updated when audio loads
    category: 'Ambience',
    color: '#6B7280',
    bpm: 0, // Ambient sounds don't have BPM
    key: 'N/A',
    volume: 0.8,
    tags: ['ambience', 'air-conditioner', 'room-tone', 'indoor', 'mechanical']
  },
  {
    id: 'ambience-air-conditioner-level-three',
    name: 'Air Conditioner Level Three',
    file: '/projects/film-music-score/loops/Ambience Air Conditioner Level Three 01.wav',
    duration: 4,
    category: 'Ambience',
    color: '#6B7280',
    bpm: 0,
    key: 'N/A',
    volume: 0.8,
    tags: ['ambience', 'air-conditioner', 'background', 'hvac', 'subtle']
  },
  {
    id: 'ambience-popcorn-machine',
    name: 'Theater Popcorn Machine',
    file: '/projects/film-music-score/loops/Ambience Appliance Theater Concession Popcorn Machine 01.wav',
    duration: 4,
    category: 'Ambience',
    color: '#6B7280',
    bpm: 0,
    key: 'N/A',
    volume: 0.7,
    tags: ['ambience', 'theater', 'popcorn', 'appliance', 'concession', 'cinema']
  },
  {
    id: 'ambience-auto-detail-shop',
    name: 'Auto Detail Shop',
    file: '/projects/film-music-score/loops/Ambience Auto Detail Shop 01.wav',
    duration: 4,
    category: 'Ambience',
    color: '#6B7280',
    bpm: 0,
    key: 'N/A',
    volume: 0.75,
    tags: ['ambience', 'auto', 'industrial', 'shop', 'workspace', 'mechanical']
  },
  {
    id: 'ambience-auto-repair-shop',
    name: 'Auto Repair Shop',
    file: '/projects/film-music-score/loops/Ambience Auto Repair Shop 01.wav',
    duration: 4,
    category: 'Ambience',
    color: '#6B7280',
    bpm: 0,
    key: 'N/A',
    volume: 0.75,
    tags: ['ambience', 'auto', 'repair', 'industrial', 'garage', 'tools']
  }
];