import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';

interface PaymentOverviewCardProps {
  totalPaymentsAmount: number;
  paymentCount: number;
  avgPayment: number;
  largestPayment: number;
  currencySymbol?: string;
}

export const PaymentOverviewCard: React.FC<PaymentOverviewCardProps> = ({
  totalPaymentsAmount,
  paymentCount,
  avgPayment,
  largestPayment,
  currencySymbol = '$',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <CreditCard size={17} color="#15803D" strokeWidth={2.2} />
        <Text style={styles.heading}>Payment Overview</Text>
      </View>

      <View style={styles.grid}>
        {/* Payments Received */}
        <View style={styles.metricItem}>
          <Text style={styles.label}>TOTAL RECEIVED</Text>
          <Text numberOfLines={1} style={[styles.value, styles.receivedValue]}>
            {formatCurrency(totalPaymentsAmount, currencySymbol)}
          </Text>
        </View>

        {/* Number of Payments */}
        <View style={styles.metricItem}>
          <Text style={styles.label}>TRANSACTIONS</Text>
          <Text numberOfLines={1} style={styles.value}>
            {paymentCount} {paymentCount === 1 ? 'payment' : 'payments'}
          </Text>
        </View>

        {/* Average Payment */}
        <View style={styles.metricItem}>
          <Text style={styles.label}>AVERAGE PAYMENT</Text>
          <Text numberOfLines={1} style={styles.value}>
            {formatCurrency(avgPayment, currencySymbol)}
          </Text>
        </View>

        {/* Largest Payment */}
        <View style={styles.metricItem}>
          <Text style={styles.label}>LARGEST PAYMENT</Text>
          <Text numberOfLines={1} style={styles.value}>
            {formatCurrency(largestPayment, currencySymbol)}
          </Text>
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
    borderColor: '#E2E8F0',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  metricItem: {
    width: '50%',
    paddingRight: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  receivedValue: {
    color: '#22C55E',
  },
});
