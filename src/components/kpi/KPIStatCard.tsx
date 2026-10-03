import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { TrendingUp, Clock, AlertCircle, FileText, CheckCircle2 } from 'lucide-react-native';
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
  const getToneConfig = () => {
    switch (tone) {
      case 'green':
        return {
          accent: '#10B981',
          softBg: '#ECFDF5',
          textColor: '#047857',
          borderColor: '#A7F3D0',
          defaultIcon: <TrendingUp size={14} color="#059669" strokeWidth={2.4} />,
        };
      case 'amber':
        return {
          accent: '#F59E0B',
          softBg: '#FFFBEB',
          textColor: '#B45309',
          borderColor: '#FDE68A',
          defaultIcon: <Clock size={14} color="#D97706" strokeWidth={2.4} />,
        };
      case 'red':
        return {
          accent: '#EF4444',
          softBg: '#FFF1F2',
          textColor: '#BE123C',
          borderColor: '#FECDD3',
          defaultIcon: <AlertCircle size={14} color="#E11D48" strokeWidth={2.4} />,
        };
      case 'blue':
        return {
          accent: '#0EA5E9',
          softBg: '#F0F9FF',
          textColor: '#0369A1',
          borderColor: '#BAE6FD',
          defaultIcon: <CheckCircle2 size={14} color="#0284C7" strokeWidth={2.4} />,
        };
      case 'slate':
      default:
        return {
          accent: '#64748B',
          softBg: '#F1F5F9',
          textColor: '#475569',
          borderColor: '#E2E8F0',
          defaultIcon: <FileText size={14} color="#64748B" strokeWidth={2.4} />,
        };
    }
  };

  const config = getToneConfig();

  const displayValue = isCurrency && amount !== undefined
    ? formatCurrency(amount, currencySymbol, 'BEFORE', 2)
    : value !== undefined
    ? String(value)
    : '0';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={[styles.topAccentBar, { backgroundColor: config.accent }]} />
      <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <View style={[styles.iconBox, { backgroundColor: config.softBg }]}>
            {icon || config.defaultIcon}
          </View>
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.amount,
            tone === 'green' && { color: '#047857' },
            tone === 'amber' && { color: '#B45309' },
            tone === 'red' && { color: '#BE123C' },
          ]}
        >
          {displayValue}
        </Text>

        {count !== undefined && countLabel ? (
          <View style={styles.countPill}>
            <Text numberOfLines={1} style={styles.countText}>
              {count} {countLabel}
            </Text>
          </View>
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
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 90,
  },
  topAccentBar: {
    height: 3,
    width: '100%',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.1,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  countPill: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.1,
  },
});
