export const colors = {
  // Brand Colors (Vibrant Emerald & Mint FinTech Theme)
  primary: '#10B981', // Modern Emerald Green
  primaryDark: '#059669',
  primaryDarker: '#047857',
  primaryLight: '#6EE7B7',
  primarySoft: '#ECFDF5',
  primarySubtle: '#F0FDF4',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',

  // Secondary Brand & Accent Colors
  accent: '#0EA5E9', // Sky Blue
  accentSoft: '#F0F9FF',
  indigo: '#6366F1',
  indigoSoft: '#EEF2FF',
  purple: '#8B5CF6',
  purpleSoft: '#F5F3FF',

  // Background & Surfaces
  background: '#F8FAF9', // Crisp, modern canvas background with soft mint undertone
  backgroundSecondary: '#F1F5F9',
  backgroundMint: '#F0FDF4',
  ambientMint: '#E6F9F0',
  ambientMintSoft: '#EDFAF3',
  card: '#FFFFFF',
  cardSecondary: '#F8FAFC',
  cardPressed: '#F1F5F9',
  cardHover: '#F8FAFC',
  overlay: 'rgba(15, 23, 42, 0.55)',
  glassBg: 'rgba(255, 255, 255, 0.92)',
  glassBorder: 'rgba(226, 232, 240, 0.8)',

  // Borders & Dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  borderFocus: '#10B981',

  // Typography / Text Hierarchy (Rich Slate & Onyx)
  text: '#0F172A', // Slate 900
  textPrimary: '#0F172A',
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textLight: '#CBD5E1',
  textInverse: '#FFFFFF',

  // Status Badges & Lifecycle Colors
  status: {
    paid: {
      text: '#047857',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      dot: '#10B981',
    },
    unpaid: {
      text: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
      dot: '#F59E0B',
    },
    partial: {
      text: '#0369A1',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      dot: '#0EA5E9',
    },
    overdue: {
      text: '#BE123C',
      bg: '#FFF1F2',
      border: '#FECDD3',
      dot: '#F43F5E',
    },
    draft: {
      text: '#475569',
      bg: '#F1F5F9',
      border: '#E2E8F0',
      dot: '#94A3B8',
    },
    cancelled: {
      text: '#64748B',
      bg: '#F8FAFC',
      border: '#E2E8F0',
      dot: '#CBD5E1',
    },
    accepted: {
      text: '#047857',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      dot: '#10B981',
    },
    declined: {
      text: '#BE123C',
      bg: '#FFF1F2',
      border: '#FECDD3',
      dot: '#F43F5E',
    },
    sent: {
      text: '#4338CA',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      dot: '#6366F1',
    },
  },

  // Functional Colors
  success: '#10B981',
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
