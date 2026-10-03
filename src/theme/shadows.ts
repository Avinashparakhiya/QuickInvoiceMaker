import { Platform, ViewStyle } from 'react-native';

export const shadows = {
  none: {},
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: {
      elevation: 1.5,
    },
    default: {
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
    } as any,
  }),
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {
      boxShadow: '0 3px 8px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
    } as any,
  }),
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.03)',
    } as any,
  }),
  modal: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
    },
    android: {
      elevation: 10,
    },
    default: {
      boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)',
    } as any,
  }),
  fab: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
    },
    android: {
      elevation: 8,
    },
    default: {
      boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.4)',
    } as any,
  }),
  glow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
    },
    android: {
      elevation: 5,
    },
    default: {
      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
    } as any,
  }),
} as const;

