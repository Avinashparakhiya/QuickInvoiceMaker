import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';

interface TransactionSummaryProps {
  billed: number;
  collected: number;
  outstanding: number;
  currencySymbol?: string;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  billed,
  collected,
  outstanding,
  currencySymbol = '$',
}) => {
  return (
    <View style={styles.card}>
      {/* BILLED Column */}
      <View style={styles.metricItem}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: '#64748B' }]} />
          <Text style={styles.label}>Billed</Text>
        </View>
        <Text numberOfLines={1} style={[styles.value, styles.billedValue]}>
          {formatCurrency(billed, currencySymbol)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* COLLECTED Column */}
      <View style={styles.metricItem}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.label}>Collected</Text>
        </View>
        <Text numberOfLines={1} style={[styles.value, styles.collectedValue]}>
          {formatCurrency(collected, currencySymbol)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* OUTSTANDING Column */}
      <View style={styles.metricItem}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.label}>Pending</Text>
        </View>
        <Text numberOfLines={1} style={[styles.value, styles.outstandingValue]}>
          {formatCurrency(outstanding, currencySymbol)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
    letterSpacing: -0.1,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  billedValue: {
    color: '#0F172A',
  },
  collectedValue: {
    color: '#047857',
  },
  outstandingValue: {
    color: '#B45309',
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: '#F1F5F9',
  },
});

