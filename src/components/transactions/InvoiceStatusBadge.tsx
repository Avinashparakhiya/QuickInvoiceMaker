import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InvoiceStatus } from '../../types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus | string;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PAID':
        return {
          bg: '#DCFCE7',
          color: '#16A34A',
          label: 'Paid',
        };
      case 'PARTIAL':
      case 'PARTIALLY_PAID':
        return {
          bg: '#E0F2FE',
          color: '#0284C7',
          label: 'Partially Paid',
        };
      case 'OVERDUE':
        return {
          bg: '#FEE2E2',
          color: '#EF4444',
          label: 'Overdue',
        };
      case 'DRAFT':
        return {
          bg: '#F1F5F9',
          color: '#64748B',
          label: 'Draft',
        };
      case 'CANCELLED':
        return {
          bg: '#F1F5F9',
          color: '#94A3B8',
          label: 'Cancelled',
        };
      case 'UNPAID':
      default:
        return {
          bg: '#FEF3C7',
          color: '#D97706',
          label: 'Unpaid',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
