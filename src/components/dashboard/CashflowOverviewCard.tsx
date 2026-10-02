import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, ArrowUpRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { KPISummary } from '../../types';

interface CashflowOverviewCardProps {
  kpiSummary: KPISummary | null;
  currencySymbol?: string;
  onPress?: () => void;
}

export const CashflowOverviewCard: React.FC<CashflowOverviewCardProps> = ({
  kpiSummary,
  currencySymbol = '$',
  onPress,
}) => {
  const totalSales = kpiSummary?.totalSales || 0;
  const outstanding = kpiSummary?.outstanding || 0;
  const overdue = kpiSummary?.overdue || 0;
  const collected = Math.max(0, totalSales - outstanding);

  const grandTotal = totalSales > 0 ? totalSales : (collected + outstanding + overdue) || 1;

  const collectedPct = Math.round((collected / grandTotal) * 100);
  const outstandingPct = Math.round(((outstanding - overdue) / grandTotal) * 100);
  const overduePct = Math.round((overdue / grandTotal) * 100);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={styles.card}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <TrendingUp size={16} color="#15803D" />
          </View>
          <Text style={styles.title}>Cashflow Overview</Text>
        </View>

        {onPress && (
          <View style={styles.viewReportsRow}>
            <Text style={styles.viewReportsText}>Reports</Text>
            <ArrowUpRight size={14} color="#15803D" />
          </View>
        )}
      </View>

      {/* Progress Bar Visualization */}
      <View style={styles.barContainer}>
        {collected > 0 && (
          <View
            style={[
              styles.barSegment,
              { flex: Math.max(1, collectedPct), backgroundColor: '#22C55E' },
            ]}
          />
        )}
        {(outstanding - overdue) > 0 && (
          <View
            style={[
              styles.barSegment,
              { flex: Math.max(1, outstandingPct), backgroundColor: '#F59E0B' },
            ]}
          />
        )}
        {overdue > 0 && (
          <View
            style={[
              styles.barSegment,
              { flex: Math.max(1, overduePct), backgroundColor: '#EF4444' },
            ]}
          />
        )}
        {totalSales === 0 && (
          <View style={[styles.barSegment, { flex: 1, backgroundColor: '#E2E8F0' }]} />
        )}
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Collected */}
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.metricLabel}>Collected</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#15803D' }]}>
            {formatCurrency(collected, currencySymbol)}
          </Text>
        </View>

        {/* Outstanding */}
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.metricLabel}>Outstanding</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#D97706' }]}>
            {formatCurrency(outstanding, currencySymbol)}
          </Text>
        </View>

        {/* Overdue */}
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.metricLabel}>Overdue</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#DC2626' }]}>
            {formatCurrency(overdue, currencySymbol)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EAF8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.captionSemiBold,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  viewReportsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewReportsText: {
    ...typography.micro,
    color: '#15803D',
    fontWeight: '700',
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
    gap: 2,
  },
  barSegment: {
    height: '100%',
    borderRadius: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
