// /timeline/hooks/useTimelineScroll.js
import { useRef } from 'react';

export const useTimelineScroll = (timelineScrollRef, headerScrollRef, timeHeaderRef) => {
  const isScrollingSyncRef = useRef(false);

  const handleTimelineScroll = (e) => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;
    
    if (timeHeaderRef.current) {
      timeHeaderRef.current.scrollLeft = e.target.scrollLeft;
    }
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollTop = e.target.scrollTop;
    }
    
    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 10);
  };

  const handleHeaderScroll = (e) => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;
    
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollTop = e.target.scrollTop;
    }
    
    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 10);
  };

  const handleTimeHeaderScroll = (e) => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;
    
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
    
    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 10);
  };

  return {
    handleTimelineScroll,
    handleHeaderScroll,
    handleTimeHeaderScroll
  };
};