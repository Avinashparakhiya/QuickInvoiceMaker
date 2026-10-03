import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { KPISummary } from '../../types';

interface InvoiceStatusDonutProps {
  kpiSummary: KPISummary | null;
  onSelectStatus?: (status: string) => void;
}

export const InvoiceStatusDonut: React.FC<InvoiceStatusDonutProps> = ({
  kpiSummary,
  onSelectStatus,
}) => {
  const paidCount = kpiSummary?.paidCount || 0;
  const unpaidCount = kpiSummary?.unpaidCount || 0;
  const partialCount = kpiSummary?.partialCount || 0;
  const overdueCount = kpiSummary?.overdueCount || 0;

  const totalInvoices = paidCount + unpaidCount + partialCount + overdueCount;

  // Donut geometry
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Segments definition
  const segments = [
    { key: 'PAID', count: paidCount, color: '#10B981', label: 'Paid', bg: '#ECFDF5' },
    { key: 'UNPAID', count: unpaidCount, color: '#F59E0B', label: 'Unpaid', bg: '#FFFBEB' },
    { key: 'PARTIAL', count: partialCount, color: '#0EA5E9', label: 'Partial', bg: '#F0F9FF' },
    { key: 'OVERDUE', count: overdueCount, color: '#EF4444', label: 'Overdue', bg: '#FFF1F2' },
  ];

  // Calculate segment stroke dashes
  let accumulatedLength = 0;
  const renderedSegments = segments
    .filter((s) => s.count > 0)
    .map((s) => {
      const fraction = totalInvoices > 0 ? s.count / totalInvoices : 0;
      const strokeDash = fraction * circumference;
      const strokeOffset = -accumulatedLength;
      accumulatedLength += strokeDash;
      return {
        ...s,
        strokeDash,
        strokeOffset,
      };
    });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Invoice Distribution</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>
            {totalInvoices} {totalInvoices === 1 ? 'Total' : 'Total'}
          </Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        {/* Donut Chart Container */}
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G rotation="-90" origin={`${center}, ${center}`}>
              {/* Background Ring */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Render non-zero slices */}
              {renderedSegments.map((segment) => (
                <Circle
                  key={segment.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segment.strokeDash} ${circumference}`}
                  strokeDashoffset={segment.strokeOffset}
                  strokeLinecap="butt"
                  fill="none"
                />
              ))}
            </G>
          </Svg>

          {/* Center Label */}
          <View style={styles.centerLabel}>
            <Text style={styles.centerNumber}>{totalInvoices}</Text>
            <Text style={styles.centerSubtext}>Invoices</Text>
          </View>
        </View>

        {/* Legend Breakdown List */}
        <View style={styles.legendContainer}>
          {segments.map((item) => {
            const pct = totalInvoices > 0 ? Math.round((item.count / totalInvoices) * 100) : 0;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.72}
                onPress={() => onSelectStatus?.(item.key)}
                style={styles.legendRow}
              >
                <View style={styles.legendLeft}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
                <View style={styles.legendRight}>
                  <Text style={styles.legendPct}>{pct}%</Text>
                  <Text style={styles.legendCount}>
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
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
  cardTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  totalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  totalBadgeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  centerSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -1,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
    gap: 7,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendPct: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  legendCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
