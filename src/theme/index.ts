import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, layout } from './spacing';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  layout,
  shadows,
};

export { colors, typography, spacing, borderRadius, layout, shadows };
export type Theme = typeof theme;
