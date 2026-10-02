import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';

export type KPITone = 'green' | 'amber' | 'red' | 'blue' | 'slate';

interface KPIStatCardProps {
  title: string;
  amount?: number;
  value?: string | number;
  isCurrency?: boolean;
  currencySymbol?: string;
  count?: number;
  countLabel?: string;
  icon?: React.ReactNode;
  tone?: KPITone;
  style?: ViewStyle;
  onPress?: () => void;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  title,
  amount,
  value,
  isCurrency = true,
  currencySymbol = '$',
  count,
  countLabel = 'invoices',
  icon,
  tone = 'green',
  style,
  onPress,
}) => {
  const getToneColors = () => {
    switch (tone) {
      case 'green':
        return {
          accent: '#22C55E',
          softBg: '#DCFCE7',
          textColor: '#15803D',
        };
      case 'amber':
        return {
          accent: '#F59E0B',
          softBg: '#FEF3C7',
          textColor: '#B45309',
        };
      case 'red':
        return {
          accent: '#EF4444',
          softBg: '#FEE2E2',
          textColor: '#B91C1C',
        };
      case 'blue':
        return {
          accent: '#3B82F6',
          softBg: '#E0F2FE',
          textColor: '#0369A1',
        };
      case 'slate':
      default:
        return {
          accent: '#64748B',
          softBg: '#F1F5F9',
          textColor: '#475569',
        };
    }
  };

  const toneConfig = getToneColors();

  const displayValue = isCurrency && amount !== undefined
    ? formatCurrency(amount, currencySymbol, 'BEFORE', 2)
    : value !== undefined
    ? String(value)
    : '0';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={[styles.title, tone === 'red' && { color: '#EF4444' }]}>
            {title}
          </Text>
          {icon ? (
            <View style={[styles.iconBox, { backgroundColor: toneConfig.softBg }]}>
              {icon}
            </View>
          ) : (
            <View style={[styles.indicatorDot, { backgroundColor: toneConfig.accent }]} />
          )}
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.amount,
            tone === 'green' && { color: '#15803D' },
            tone === 'amber' && { color: '#D97706' },
            tone === 'red' && { color: '#EF4444' },
          ]}
        >
          {displayValue}
        </Text>

        {count !== undefined && countLabel ? (
          <Text numberOfLines={1} style={styles.countText}>
            {count} {countLabel}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    minHeight: 84,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countText: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 3,
  },
});
