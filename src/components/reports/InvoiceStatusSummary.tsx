import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusCounts {
  PAID: number;
  UNPAID: number;
  PARTIAL: number;
  OVERDUE: number;
  DRAFT: number;
}

interface InvoiceStatusSummaryProps {
  statusCounts: StatusCounts;
}

export const InvoiceStatusSummary: React.FC<InvoiceStatusSummaryProps> = ({ statusCounts }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Invoice Status Overview</Text>

      <View style={styles.grid}>
        {/* Paid */}
        <View style={styles.box}>
          <Text style={[styles.count, { color: '#22C55E' }]}>{statusCounts.PAID}</Text>
          <Text style={styles.label}>Paid</Text>
        </View>

        {/* Unpaid */}
        <View style={styles.box}>
          <Text style={[styles.count, { color: '#F59E0B' }]}>{statusCounts.UNPAID}</Text>
          <Text style={styles.label}>Unpaid</Text>
        </View>

        {/* Partial */}
        <View style={styles.box}>
          <Text style={[styles.count, { color: '#3B82F6' }]}>{statusCounts.PARTIAL}</Text>
          <Text style={styles.label}>Partial</Text>
        </View>

        {/* Overdue */}
        <View style={styles.box}>
          <Text style={[styles.count, { color: '#EF4444' }]}>{statusCounts.OVERDUE}</Text>
          <Text style={styles.label}>Overdue</Text>
        </View>

        {/* Draft */}
        <View style={styles.box}>
          <Text style={[styles.count, { color: '#64748B' }]}>{statusCounts.DRAFT}</Text>
          <Text style={styles.label}>Draft</Text>
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
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  box: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  count: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});
