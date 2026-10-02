export const colors = {
  // Brand Colors
  primary: '#22C55E', // Fresh Emerald Green
  primaryDark: '#16A34A',
  primaryDarker: '#15803D',
  primaryLight: '#86EFAC',
  primarySoft: '#DCFCE7',
  primarySubtle: '#F0FDF4',

  // Background & Surfaces
  background: '#FFFFFF', // Pure White Canvas Background
  backgroundSecondary: '#F8FAFC',
  card: '#FFFFFF',
  cardPressed: '#F8FAFC',
  overlay: 'rgba(15, 23, 42, 0.45)',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#22C55E',

  // Typography / Text Hierarchy (Slate)
  text: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Status Badges & Lifecycle Colors
  status: {
    paid: {
      text: '#15803D',
      bg: '#DCFCE7',
      border: '#BBF7D0',
    },
    unpaid: {
      text: '#B45309',
      bg: '#FEF3C7',
      border: '#FDE68A',
    },
    partial: {
      text: '#0369A1',
      bg: '#E0F2FE',
      border: '#BAE6FD',
    },
    overdue: {
      text: '#DC2626',
      bg: '#FEE2E2',
      border: '#FECACA',
    },
    draft: {
      text: '#475569',
      bg: '#F1F5F9',
      border: '#E2E8F0',
    },
    cancelled: {
      text: '#64748B',
      bg: '#F8FAFC',
      border: '#E2E8F0',
    },
  },

  // Functional Colors
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Gray Palette
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
} as const;

export type ColorType = typeof colors;
