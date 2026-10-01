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
      <View style={[styles.leftAccent, { backgroundColor: toneConfig.accent }]} />
      
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {icon ? (
            <View style={[styles.iconBox, { backgroundColor: toneConfig.softBg }]}>
              {icon}
            </View>
          ) : null}
        </View>

        <Text numberOfLines={1} style={styles.amount}>
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
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 88,
  },
  leftAccent: {
    width: 4,
    height: '100%',
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
