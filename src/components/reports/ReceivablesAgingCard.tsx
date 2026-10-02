import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';

interface ReceivablesAgingCardProps {
  currentAmount: number;
  overdue30Amount: number;
  overdue60Amount: number;
  currencySymbol?: string;
}

export const ReceivablesAgingCard: React.FC<ReceivablesAgingCardProps> = ({
  currentAmount,
  overdue30Amount,
  overdue60Amount,
  currencySymbol = '$',
}) => {
  const totalReceivables = Math.max(1, currentAmount + overdue30Amount + overdue60Amount);

  const currentPct = Math.round((currentAmount / totalReceivables) * 100);
  const overdue30Pct = Math.round((overdue30Amount / totalReceivables) * 100);
  const overdue60Pct = Math.round((overdue60Amount / totalReceivables) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Clock size={17} color="#15803D" strokeWidth={2.2} />
        <Text style={styles.heading}>Receivables Aging Analysis</Text>
      </View>

      {/* Row 1: Current (0-30 Days) */}
      <View style={styles.agingRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Current (0 – 30 Days)</Text>
          <Text style={styles.amount}>
            {formatCurrency(currentAmount, currencySymbol)}
          </Text>
        </View>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              {
                width: currentAmount > 0 ? `${Math.max(5, currentPct)}%` : '0%',
                backgroundColor: '#22C55E',
              },
            ]}
          />
        </View>
      </View>

      {/* Row 2: 31-60 Days Overdue */}
      <View style={styles.agingRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>31 – 60 Days Overdue</Text>
          <Text style={[styles.amount, overdue30Amount > 0 && styles.overdue30Text]}>
            {formatCurrency(overdue30Amount, currencySymbol)}
          </Text>
        </View>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              {
                width: overdue30Amount > 0 ? `${Math.max(5, overdue30Pct)}%` : '0%',
                backgroundColor: '#F59E0B',
              },
            ]}
          />
        </View>
      </View>

      {/* Row 3: 60+ Days Overdue */}
      <View style={styles.agingRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>60+ Days Overdue</Text>
          <Text style={[styles.amount, overdue60Amount > 0 && styles.overdue60Text]}>
            {formatCurrency(overdue60Amount, currencySymbol)}
          </Text>
        </View>
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              {
                width: overdue60Amount > 0 ? `${Math.max(5, overdue60Pct)}%` : '0%',
                backgroundColor: '#EF4444',
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  agingRow: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  overdue30Text: {
    color: '#F59E0B',
  },
  overdue60Text: {
    color: '#EF4444',
  },
  barBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});
