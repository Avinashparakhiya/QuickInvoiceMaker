import { Platform, ViewStyle } from 'react-native';

export const shadows = {
  none: {},
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  elevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  modal: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  fab: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#16A34A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
} as const;
