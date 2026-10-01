import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { Card } from '../common/Card';

export type KPITone = 'green' | 'blue' | 'amber' | 'red';

interface KPIStatCardProps {
  title: string;
  amount: number;
  currencySymbol?: string;
  count?: number;
  countLabel?: string;
  icon: React.ReactNode;
  tone?: KPITone;
  style?: ViewStyle;
  onPress?: () => void;
}

export const KPIStatCard: React.FC<KPIStatCardProps> = ({
  title,
  amount,
  currencySymbol = '$',
  count,
  countLabel = 'invoices',
  icon,
  tone = 'green',
  style,
  onPress,
}) => {
  const getToneStyles = () => {
    switch (tone) {
      case 'green':
        return {
          iconBg: colors.primarySoft,
          badgeBg: '#DCFCE7',
          badgeText: '#15803D',
        };
      case 'blue':
        return {
          iconBg: '#E0F2FE',
          badgeBg: '#E0F2FE',
          badgeText: '#0369A1',
        };
      case 'amber':
        return {
          iconBg: '#FEF3C7',
          badgeBg: '#FEF3C7',
          badgeText: '#B45309',
        };
      case 'red':
        return {
          iconBg: '#FEE2E2',
          badgeBg: '#FEE2E2',
          badgeText: '#B91C1C',
        };
    }
  };

  const toneConfig = getToneStyles();

  return (
    <Card
      variant="elevated"
      padding={14}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: toneConfig.iconBg }]}>
          {icon}
        </View>
        {count !== undefined ? (
          <View style={[styles.countBadge, { backgroundColor: toneConfig.badgeBg }]}>
            <Text style={[styles.countText, { color: toneConfig.badgeText }]}>
              {count} {countLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={1} style={styles.amount}>
          {formatCurrency(amount, currencySymbol, 'BEFORE', 2)}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    ...typography.micro,
  },
  content: {
    marginTop: 2,
  },
  title: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amount: {
    ...typography.kpiNumber,
    color: colors.text,
  },
});
