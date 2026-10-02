import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/currency';

export interface MonthlyChartPoint {
  mStr: string;
  label: string;
  billed: number;
  collected: number;
}

interface RevenueInflowChartProps {
  data: MonthlyChartPoint[];
  currencySymbol?: string;
}

export const RevenueInflowChart: React.FC<RevenueInflowChartProps> = ({
  data,
  currencySymbol = '$',
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  let maxValue = 500;
  data.forEach((d) => {
    if (d.billed > maxValue) maxValue = d.billed;
    if (d.collected > maxValue) maxValue = d.collected;
  });

  const selectedItem = data.find((d) => d.mStr === selectedMonth);
  const hasAnyData = data.some((d) => d.billed > 0 || d.collected > 0);

  return (
    <View style={styles.card}>
      {/* Header with Title and Legend */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Revenue vs Inflow (6 Mo)</Text>
          <Text style={styles.subheading}>Monthly comparison</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Billed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#15803D' }]} />
            <Text style={styles.legendText}>Paid</Text>
          </View>
        </View>
      </View>

      {/* Tooltip Popup on Tap */}
      {selectedItem && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>{selectedItem.label} Breakdown:</Text>
          <Text style={styles.tooltipContent}>
            Billed: <Text style={styles.boldText}>{formatCurrency(selectedItem.billed, currencySymbol)}</Text> • Collected: <Text style={[styles.boldText, { color: '#15803D' }]}>{formatCurrency(selectedItem.collected, currencySymbol)}</Text>
          </Text>
        </View>
      )}

      {/* Bar Chart Area */}
      {!hasAnyData ? (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>No revenue data recorded for this period</Text>
        </View>
      ) : (
        <View style={styles.barsContainer}>
          {data.map((item) => {
            const billedHeight = Math.max(6, Math.round((item.billed / maxValue) * 110));
            const paidHeight = Math.max(6, Math.round((item.collected / maxValue) * 110));
            const isSelected = selectedMonth === item.mStr;

            return (
              <TouchableOpacity
                key={item.mStr}
                activeOpacity={0.8}
                onPress={() => setSelectedMonth(isSelected ? null : item.mStr)}
                style={[styles.colWrapper, isSelected && styles.colWrapperSelected]}
              >
                <View style={styles.barPair}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: item.billed > 0 ? billedHeight : 4,
                        backgroundColor: '#22C55E',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      {
                        height: item.collected > 0 ? paidHeight : 4,
                        backgroundColor: '#15803D',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.monthLabel, isSelected && styles.monthLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  tooltip: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tooltipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  tooltipContent: {
    fontSize: 12,
    color: '#64748B',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyChart: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 135,
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  colWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  colWrapperSelected: {
    backgroundColor: '#F8FAFC',
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: 6,
  },
  bar: {
    width: 12,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  monthLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  monthLabelActive: {
    color: '#15803D',
    fontWeight: '800',
  },
});
