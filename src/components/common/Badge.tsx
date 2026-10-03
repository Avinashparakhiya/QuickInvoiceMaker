import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { InvoiceStatus } from '../../types';

interface BadgeProps {
  status?: InvoiceStatus | string;
  label?: string;
  variant?: 'paid' | 'unpaid' | 'partial' | 'overdue' | 'draft' | 'cancelled' | 'custom';
  bgColor?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  variant,
  bgColor,
  textColor,
  size = 'md',
  style,
}) => {
  let resolvedVariant = variant;
  if (!resolvedVariant && status) {
    switch (status.toUpperCase()) {
      case 'PAID':
        resolvedVariant = 'paid';
        break;
      case 'UNPAID':
        resolvedVariant = 'unpaid';
        break;
      case 'PARTIAL':
      case 'PARTIALLY_PAID':
        resolvedVariant = 'partial';
        break;
      case 'OVERDUE':
        resolvedVariant = 'overdue';
        break;
      case 'DRAFT':
        resolvedVariant = 'draft';
        break;
      case 'CANCELLED':
        resolvedVariant = 'cancelled';
        break;
      default:
        resolvedVariant = 'draft';
    }
  }

  const getBadgeStyle = (): { container: ViewStyle; text: TextStyle; dot: ViewStyle } => {
    let bg: string = colors.status.draft.bg;
    let txt: string = colors.status.draft.text;
    let bdr: string = colors.status.draft.border;
    let dt: string = colors.status.draft.dot;

    switch (resolvedVariant) {
      case 'paid':
        bg = colors.status.paid.bg;
        txt = colors.status.paid.text;
        bdr = colors.status.paid.border;
        dt = colors.status.paid.dot;
        break;
      case 'unpaid':
        bg = colors.status.unpaid.bg;
        txt = colors.status.unpaid.text;
        bdr = colors.status.unpaid.border;
        dt = colors.status.unpaid.dot;
        break;
      case 'partial':
        bg = colors.status.partial.bg;
        txt = colors.status.partial.text;
        bdr = colors.status.partial.border;
        dt = colors.status.partial.dot;
        break;
      case 'overdue':
        bg = colors.status.overdue.bg;
        txt = colors.status.overdue.text;
        bdr = colors.status.overdue.border;
        dt = colors.status.overdue.dot;
        break;
      case 'draft':
        bg = colors.status.draft.bg;
        txt = colors.status.draft.text;
        bdr = colors.status.draft.border;
        dt = colors.status.draft.dot;
        break;
      case 'cancelled':
        bg = colors.status.cancelled.bg;
        txt = colors.status.cancelled.text;
        bdr = colors.status.cancelled.border;
        dt = colors.status.cancelled.dot;
        break;
    }

    if (bgColor) bg = bgColor;
    if (textColor) txt = textColor;

    return {
      container: {
        backgroundColor: bg,
        borderColor: bdr,
      },
      text: {
        color: txt,
      },
      dot: {
        backgroundColor: dt,
      },
    };
  };

  const displayText = label || (status ? formatStatusLabel(status) : '');
  const badgeStyle = getBadgeStyle();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.badgeSm : styles.badgeMd,
        badgeStyle.container,
        style,
      ]}
    >
      <View style={[styles.dot, badgeStyle.dot]} />
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          badgeStyle.text,
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
};

function formatStatusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case 'PAID':
      return 'Paid';
    case 'UNPAID':
      return 'Unpaid';
    case 'PARTIAL':
      return 'Partial';
    case 'OVERDUE':
      return 'Overdue';
    case 'DRAFT':
      return 'Draft';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 11,
  },
});
