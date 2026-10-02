import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/currency';

interface MonthSummaryCardProps {
  collected: number;
  due: number;
  totalInvoices: number;
  currencySymbol?: string;
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
  collected,
  due,
  totalInvoices,
  currencySymbol = '$',
}) => {
  return (
    <View style={styles.card}>
      {/* MONTH COLLECTED */}
      <View style={styles.metricItem}>
        <Text style={styles.label}>MONTH COLLECTED</Text>
        <Text numberOfLines={1} style={[styles.value, styles.collectedValue]}>
          {formatCurrency(collected, currencySymbol)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* MONTH DUE */}
      <View style={styles.metricItem}>
        <Text style={styles.label}>MONTH DUE</Text>
        <Text numberOfLines={1} style={[styles.value, styles.dueValue]}>
          {formatCurrency(due, currencySymbol)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* TOTAL INVOICES */}
      <View style={styles.metricItem}>
        <Text style={styles.label}>TOTAL INVOICES</Text>
        <Text numberOfLines={1} style={[styles.value, styles.invoicesValue]}>
          {totalInvoices}
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
  collectedValue: {
    color: '#22C55E',
  },
  dueValue: {
    color: '#F59E0B',
  },
  invoicesValue: {
    color: '#0F172A',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
});
