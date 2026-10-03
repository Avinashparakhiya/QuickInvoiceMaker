import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getContainerStyle = (): StyleProp<ViewStyle> => {
    const list: any[] = [styles.base];

    if (fullWidth) list.push(styles.fullWidth);

    // Size
    if (size === 'sm') list.push(styles.sizeSm);
    else if (size === 'lg') list.push(styles.sizeLg);
    else list.push(styles.sizeMd);

    // Variant
    switch (variant) {
      case 'primary':
        list.push(styles.primary, shadows.glow);
        break;
      case 'secondary':
        list.push(styles.secondary);
        break;
      case 'outline':
        list.push(styles.outline);
        break;
      case 'danger':
        list.push(styles.danger);
        break;
      case 'ghost':
        list.push(styles.ghost);
        break;
      case 'white':
        list.push(styles.white, shadows.sm);
        break;
    }

    if (disabled || loading) {
      list.push(styles.disabled);
    }

    if (style) list.push(style);

    return list;
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const list: any[] = [styles.textBase];

    if (size === 'sm') list.push(styles.textSm);
    else if (size === 'lg') list.push(styles.textLg);
    else list.push(styles.textMd);

    switch (variant) {
      case 'primary':
        list.push(styles.textPrimary);
        break;
      case 'secondary':
        list.push(styles.textSecondary);
        break;
      case 'outline':
        list.push(styles.textOutline);
        break;
      case 'danger':
        list.push(styles.textDanger);
        break;
      case 'ghost':
        list.push(styles.textGhost);
        break;
      case 'white':
        list.push(styles.textWhite);
        break;
    }

    if (textStyle) list.push(textStyle);

    return list;
  };

  const spinnerColor = variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconLeft}>{icon}</View> : null}
          <Text style={getTextStyle()}>{title}</Text>
          {iconRight ? <View style={styles.iconRight}>{iconRight}</View> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  sizeLg: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  primary: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#059669',
  },
  secondary: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  outline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.9)',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  white: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  textSm: {
    fontSize: 13,
    lineHeight: 18,
  },
  textMd: {
    fontSize: 15,
    lineHeight: 20,
  },
  textLg: {
    fontSize: 16,
    lineHeight: 22,
  },
  textPrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textSecondary: {
    color: '#047857',
    fontWeight: '700',
  },
  textOutline: {
    color: '#0F172A',
    fontWeight: '700',
  },
  textDanger: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textGhost: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  textWhite: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
