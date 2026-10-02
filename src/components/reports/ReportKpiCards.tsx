import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';

interface ReportKpiCardsProps {
  totalSales: number;
  totalPaid: number;
  invoiceCount: number;
  paymentCount: number;
  collectionRate: number;
  currencySymbol?: string;
  onPressSales?: () => void;
  onPressInflow?: () => void;
}

export const ReportKpiCards: React.FC<ReportKpiCardsProps> = ({
  totalSales,
  totalPaid,
  invoiceCount,
  paymentCount,
  collectionRate,
  currencySymbol = '$',
  onPressSales,
  onPressInflow,
}) => {
  return (
    <View style={styles.container}>
      {/* Total Sales Card */}
      <TouchableOpacity
        activeOpacity={onPressSales ? 0.75 : 1}
        onPress={onPressSales}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <Text style={styles.label}>TOTAL SALES</Text>
          <View style={styles.trendBadge}>
            <ArrowUpRight size={12} color="#15803D" strokeWidth={2.5} />
            <Text style={styles.trendText}>Sales</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.salesValue}>
          {formatCurrency(totalSales, currencySymbol)}
        </Text>
        <Text style={styles.subtext}>
          {invoiceCount} {invoiceCount === 1 ? 'invoice' : 'invoices'} generated
        </Text>
      </TouchableOpacity>

      {/* Cash Inflow Card */}
      <TouchableOpacity
        activeOpacity={onPressInflow ? 0.75 : 1}
        onPress={onPressInflow}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <Text style={styles.label}>CASH INFLOW</Text>
          <View style={[styles.trendBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.trendText}>{collectionRate}%</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={styles.inflowValue}>
          {formatCurrency(totalPaid, currencySymbol)}
        </Text>
        <Text style={styles.subtext}>
          {paymentCount} {paymentCount === 1 ? 'payment' : 'payments'} collected
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  salesValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  inflowValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
