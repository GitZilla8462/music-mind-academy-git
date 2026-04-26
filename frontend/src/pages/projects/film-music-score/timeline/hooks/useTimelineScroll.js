// /timeline/hooks/useTimelineScroll.js
import { useRef } from 'react';

export const useTimelineScroll = (timelineScrollRef, headerScrollRef, timeHeaderRef) => {
  const isScrollingSyncRef = useRef(false);

  const handleTimelineScroll = (e) => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    const scrollLeft = e.target.scrollLeft;
    const scrollTop = e.target.scrollTop;

    if (timeHeaderRef.current) {
      timeHeaderRef.current.scrollLeft = scrollLeft;
    }
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollTop = scrollTop;
    }

    requestAnimationFrame(() => {
      isScrollingSyncRef.current = false;
    });
  };

  const handleHeaderScroll = (e) => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollTop = e.target.scrollTop;
    }

    requestAnimationFrame(() => {
      isScrollingSyncRef.current = false;
    });
  };

  const handleTimeHeaderScroll = (e) => {
    if (isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = e.target.scrollLeft;
    }

    requestAnimationFrame(() => {
      isScrollingSyncRef.current = false;
    });
  };

  return {
    handleTimelineScroll,
    handleHeaderScroll,
    handleTimeHeaderScroll
  };
};
