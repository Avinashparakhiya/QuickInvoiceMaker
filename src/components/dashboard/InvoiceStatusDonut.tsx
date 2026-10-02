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
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Segments definition
  const segments = [
    { key: 'PAID', count: paidCount, color: '#22C55E', label: 'Paid' },
    { key: 'UNPAID', count: unpaidCount, color: '#F59E0B', label: 'Unpaid' },
    { key: 'PARTIAL', count: partialCount, color: '#3B82F6', label: 'Partial' },
    { key: 'OVERDUE', count: overdueCount, color: '#EF4444', label: 'Overdue' },
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
        <Text style={styles.cardTitle}>Invoice Status</Text>
        <Text style={styles.totalBadge}>
          {totalInvoices} {totalInvoices === 1 ? 'Invoice' : 'Invoices'}
        </Text>
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
                stroke="#E2E8F0"
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
          {segments.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              onPress={() => onSelectStatus?.(item.key)}
              style={styles.legendRow}
            >
              <View style={styles.legendLeft}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel}>{item.label}</Text>
              </View>
              <Text style={[styles.legendCount, { color: colors.text }]}>
                {item.count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
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
    marginBottom: 14,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  totalBadge: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
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
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
  },
  centerSubtext: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: -1,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 24,
    justifyContent: 'center',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  legendCount: {
    ...typography.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
  },
});
