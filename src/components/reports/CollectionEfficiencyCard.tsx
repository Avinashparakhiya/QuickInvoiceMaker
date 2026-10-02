import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/currency';

interface CollectionEfficiencyCardProps {
  collectionRate: number;
  outstandingRate: number;
  outstanding: number;
  overdue: number;
  taxBilled: number;
  currencySymbol?: string;
  onPressOutstanding?: () => void;
  onPressOverdue?: () => void;
}

export const CollectionEfficiencyCard: React.FC<CollectionEfficiencyCardProps> = ({
  collectionRate,
  outstandingRate,
  outstanding,
  overdue,
  taxBilled,
  currencySymbol = '$',
  onPressOutstanding,
  onPressOverdue,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Collection Efficiency</Text>

      {/* Progress Bar with Labels */}
      <View style={styles.ratioContainer}>
        <View style={styles.ratioLabels}>
          <Text style={styles.collectedLabel}>
            Collected ({collectionRate}%)
          </Text>
          <Text style={styles.pendingLabel}>
            Pending ({outstandingRate}%)
          </Text>
        </View>

        <View style={styles.track}>
          {collectionRate > 0 && (
            <View style={[styles.fillPaid, { flex: Math.max(1, collectionRate) }]} />
          )}
          {outstandingRate > 0 && (
            <View style={[styles.fillPending, { flex: Math.max(1, outstandingRate) }]} />
          )}
          {collectionRate === 0 && outstandingRate === 0 && (
            <View style={[styles.fillPaid, { flex: 1, backgroundColor: '#E2E8F0' }]} />
          )}
        </View>
      </View>

      {/* 3 Metrics Footer */}
      <View style={styles.metricsFooter}>
        {/* Outstanding */}
        <TouchableOpacity
          activeOpacity={onPressOutstanding ? 0.7 : 1}
          onPress={onPressOutstanding}
          style={styles.metricCol}
        >
          <Text style={styles.metricLabel}>OUTSTANDING</Text>
          <Text numberOfLines={1} style={[styles.metricValue, styles.outstandingVal]}>
            {formatCurrency(outstanding, currencySymbol)}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Overdue */}
        <TouchableOpacity
          activeOpacity={onPressOverdue ? 0.7 : 1}
          onPress={onPressOverdue}
          style={styles.metricCol}
        >
          <Text style={styles.metricLabel}>OVERDUE</Text>
          <Text numberOfLines={1} style={[styles.metricValue, styles.overdueVal]}>
            {formatCurrency(overdue, currencySymbol)}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Tax Billed */}
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>TAX BILLED</Text>
          <Text numberOfLines={1} style={[styles.metricValue, styles.taxVal]}>
            {formatCurrency(taxBilled, currencySymbol)}
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
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  ratioContainer: {
    marginBottom: 14,
  },
  ratioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  collectedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
  },
  pendingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  fillPaid: {
    backgroundColor: '#22C55E',
    height: '100%',
    borderRadius: 2,
  },
  fillPending: {
    backgroundColor: '#F59E0B',
    height: '100%',
    borderRadius: 2,
  },
  metricsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  outstandingVal: {
    color: '#F59E0B',
  },
  overdueVal: {
    color: '#EF4444',
  },
  taxVal: {
    color: '#0F172A',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
});
