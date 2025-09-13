import { useState, useEffect } from 'react';

// Tailwind default breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

type ScreenSizeHook = {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isIPadOrLess: boolean;
  breakpoint: BreakpointKey | 'xs';
};

export const useScreenSize = (): ScreenSizeHook => {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const handleResize = () => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = screenSize;

  const getBreakpoint = (width: number): BreakpointKey | 'xs' => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };

  const breakpoint = getBreakpoint(width);

  return {
    width,
    height,
    isMobile: width < BREAKPOINTS.sm, // < 640px
    isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg, // 640px - 1023px
    isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl, // 1024px - 1279px
    isLargeDesktop: width >= BREAKPOINTS.xl, // >= 1280px
    isIPadOrLess: width < BREAKPOINTS.lg, // < 1024px (iPad and smaller)
    breakpoint,
  };
};

export default useScreenSize;
