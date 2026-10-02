import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InvoiceStatus } from '../../types';
import { colors } from '../../theme/colors';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus | string;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PAID':
        return {
          bg: colors.status.paid.bg,
          color: colors.status.paid.text,
          border: colors.status.paid.border,
          label: 'Paid',
        };
      case 'PARTIAL':
      case 'PARTIALLY_PAID':
        return {
          bg: colors.status.partial.bg,
          color: colors.status.partial.text,
          border: colors.status.partial.border,
          label: 'Partially Paid',
        };
      case 'OVERDUE':
        return {
          bg: colors.status.overdue.bg,
          color: colors.status.overdue.text,
          border: colors.status.overdue.border,
          label: 'Overdue',
        };
      case 'DRAFT':
        return {
          bg: colors.status.draft.bg,
          color: colors.status.draft.text,
          border: colors.status.draft.border,
          label: 'Draft',
        };
      case 'CANCELLED':
        return {
          bg: colors.status.cancelled.bg,
          color: colors.status.cancelled.text,
          border: colors.status.cancelled.border,
          label: 'Cancelled',
        };
      case 'UNPAID':
      default:
        return {
          bg: colors.status.unpaid.bg,
          color: colors.status.unpaid.text,
          border: colors.status.unpaid.border,
          label: 'Unpaid',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
