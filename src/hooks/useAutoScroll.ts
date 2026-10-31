import { useState, useEffect, useRef, useCallback } from 'react';

export type ScrollSpeed = 0.5 | 1 | 1.5 | 2 | 3;

export function useAutoScroll() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<ScrollSpeed>(1);

  const animFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef<ScrollSpeed>(speed);
  speedRef.current = speed;

  const stop = useCallback(() => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    setIsActive(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    setIsPaused(true);
  }, []);

  const scrollStep = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Base rate: 45 pixels per second at 1x speed
    const basePixelsPerSec = 45;
    const pixelsToScroll = (basePixelsPerSec * speedRef.current * deltaTime) / 1000;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;

    if (currentScroll >= maxScroll - 2) {
      // Reached bottom of page
      stop();
      return;
    }

    window.scrollBy({ top: pixelsToScroll, behavior: 'auto' });
    animFrameId.current = requestAnimationFrame(scrollStep);
  }, [stop]);

  const start = useCallback(() => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current);
    }
    lastTimeRef.current = 0;
    setIsActive(true);
    setIsPaused(false);
    animFrameId.current = requestAnimationFrame(scrollStep);
  }, [scrollStep]);

  const resume = useCallback(() => {
    if (animFrameId.current !== null) {
      cancelAnimationFrame(animFrameId.current);
    }
    lastTimeRef.current = 0;
    setIsPaused(false);
    animFrameId.current = requestAnimationFrame(scrollStep);
  }, [scrollStep]);

  const toggle = useCallback(() => {
    if (!isActive) {
      start();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isActive, isPaused, start, resume, pause]);

  // Clean up on unmount or page change
  useEffect(() => {
    return () => {
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  return {
    isActive,
    isPaused,
    speed,
    setSpeed,
    start,
    pause,
    resume,
    stop,
    toggle,
  };
}
