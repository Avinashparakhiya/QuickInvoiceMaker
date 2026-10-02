import { useWindowDimensions, Platform } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideScreen: boolean; // tablet or desktop (>= 768px)
  isExtraWide: boolean;  // >= 1280px
  contentMaxWidth: number;
  horizontalPadding: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWideScreen = width >= 768;
  const isExtraWide = width >= 1280;

  let contentMaxWidth = 1200;
  if (isMobile) {
    contentMaxWidth = 600;
  } else if (isTablet) {
    contentMaxWidth = 900;
  } else {
    contentMaxWidth = 1200;
  }

  const horizontalPadding = isMobile ? 16 : isTablet ? 24 : 32;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWideScreen,
    isExtraWide,
    contentMaxWidth,
    horizontalPadding,
  };
}
