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

  const collectedPct = totalSales > 0 ? Math.round((collected / grandTotal) * 100) : 0;
  const outstandingPct = totalSales > 0 ? Math.round(((outstanding - overdue) / grandTotal) * 100) : 0;
  const overduePct = totalSales > 0 ? Math.round((overdue / grandTotal) * 100) : 0;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.82 : 1}
      onPress={onPress}
      style={styles.card}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <TrendingUp size={15} color="#059669" strokeWidth={2.4} />
          </View>
          <Text style={styles.title}>Cashflow Breakdown</Text>
        </View>

        {onPress && (
          <View style={styles.viewReportsRow}>
            <Text style={styles.viewReportsText}>View Analytics</Text>
            <ArrowUpRight size={13} color="#059669" strokeWidth={2.4} />
          </View>
        )}
      </View>

      {/* Progress Bar Visualization */}
      <View style={styles.barContainer}>
        {collected > 0 && (
          <View
            style={[
              styles.barSegment,
              { flex: Math.max(1, collectedPct), backgroundColor: '#10B981' },
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
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.metricLabel}>Collected ({collectedPct}%)</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#047857' }]}>
            {formatCurrency(collected, currencySymbol)}
          </Text>
        </View>

        {/* Outstanding */}
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.metricLabel}>Pending ({outstandingPct}%)</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#B45309' }]}>
            {formatCurrency(outstanding - overdue, currencySymbol)}
          </Text>
        </View>

        {/* Overdue */}
        <View style={styles.metricItem}>
          <View style={styles.metricLabelRow}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.metricLabel}>Overdue ({overduePct}%)</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#BE123C' }]}>
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  viewReportsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewReportsText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 11,
  },
  barContainer: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
    gap: 2,
  },
  barSegment: {
    height: '100%',
    borderRadius: 3,
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
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

