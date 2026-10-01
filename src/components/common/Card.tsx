import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: 'elevated' | 'flat' | 'outlined' | 'softGreen';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 16,
}) => {
  const getCardStyle = (): StyleProp<ViewStyle> => {
    const list: any[] = [styles.base, { padding }];

    switch (variant) {
      case 'elevated':
        list.push(styles.elevated, shadows.card);
        break;
      case 'flat':
        list.push(styles.flat);
        break;
      case 'outlined':
        list.push(styles.outlined);
        break;
      case 'softGreen':
        list.push(styles.softGreen);
        break;
    }

    if (style) list.push(style);
    return list;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={getCardStyle()}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getCardStyle()}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.card,
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  softGreen: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
