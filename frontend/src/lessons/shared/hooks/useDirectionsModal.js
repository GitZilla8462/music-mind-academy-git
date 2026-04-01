// Hook for managing directions modal state
// Auto-shows on first entry to a stage, re-openable anytime

import { useState, useCallback, useRef, useEffect } from 'react';

const useDirectionsModal = (stageId) => {
  const [isOpen, setIsOpen] = useState(false);
  const seenRef = useRef(false);

  // Auto-show on first call to triggerIfUnseen()
  const triggerIfUnseen = useCallback(() => {
    if (!seenRef.current) {
      seenRef.current = true;
      setIsOpen(true);
    }
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Reset when stageId changes
  useEffect(() => {
    seenRef.current = false;
  }, [stageId]);

  return { isOpen, open, close, triggerIfUnseen };
};

export default useDirectionsModal;
