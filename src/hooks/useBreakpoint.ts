import { useEffect, useRef } from 'react';

/**
 * Detects if the viewport is below a given breakpoint (default: 768px).
 * Returns a ref (not state) to avoid re-renders inside R3F.
 */
export function useBreakpoint(breakpoint = 768) {
  const isMobile = useRef(false);

  useEffect(() => {
    const check = () => {
      isMobile.current = window.innerWidth < breakpoint;
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}
