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
        <Text style={styles.label}>BILLED</Text>
        <Text numberOfLines={1} style={[styles.value, styles.billedValue]}>
          {formatCurrency(billed, currencySymbol)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* COLLECTED Column */}
      <View style={styles.metricItem}>
        <Text style={styles.label}>COLLECTED</Text>
        <Text numberOfLines={1} style={[styles.value, styles.collectedValue]}>
          {formatCurrency(collected, currencySymbol)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* OUTSTANDING Column */}
      <View style={styles.metricItem}>
        <Text style={styles.label}>OUTSTANDING</Text>
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  billedValue: {
    color: '#0F172A',
  },
  collectedValue: {
    color: '#22C55E',
  },
  outstandingValue: {
    color: '#F59E0B',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
});
