import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileSpreadsheet } from 'lucide-react-native';
import { Estimate } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';

interface QuoteListItemProps {
  quote: Estimate;
  currencySymbol?: string;
  onPress: () => void;
}

export const QuoteListItem: React.FC<QuoteListItemProps> = ({
  quote,
  currencySymbol = '$',
  onPress,
}) => {
  const getStatusConfig = () => {
    switch (quote.status) {
      case 'ACCEPTED':
        return { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857', dot: '#10B981', label: 'Accepted' };
      case 'SENT':
        return { bg: '#EEF2FF', border: '#C7D2FE', color: '#4338CA', dot: '#6366F1', label: 'Sent' };
      case 'CONVERTED':
        return { bg: '#F0F9FF', border: '#BAE6FD', color: '#0369A1', dot: '#0EA5E9', label: 'Converted' };
      case 'DECLINED':
        return { bg: '#FFF1F2', border: '#FECDD3', color: '#BE123C', dot: '#EF4444', label: 'Declined' };
      case 'EXPIRED':
        return { bg: '#FFFBEB', border: '#FDE68A', color: '#B45309', dot: '#F59E0B', label: 'Expired' };
      case 'DRAFT':
      default:
        return { bg: '#F1F5F9', border: '#E2E8F0', color: '#475569', dot: '#94A3B8', label: 'Draft' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, { borderColor: statusConfig.border }]}
    >
      {/* Left: Quote Icon Circle */}
      <View style={[styles.iconCircle, { backgroundColor: statusConfig.bg }]}>
        <FileSpreadsheet size={19} color={statusConfig.color} strokeWidth={2.4} />
      </View>

      {/* Center: Customer + Quote Number + Valid Date */}
      <View style={styles.centerCol}>
        <Text numberOfLines={1} style={styles.customerName}>
          {quote.customerName || 'Potential Client'}
        </Text>
        <View style={styles.subRow}>
          <Text numberOfLines={1} style={styles.quoteNumber}>
            {quote.estimateNumber}
          </Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.validityText}>
            {quote.expiryDate ? `Exp ${formatDate(quote.expiryDate, 'dd MMM')}` : 'No expiry'}
          </Text>
        </View>
      </View>

      {/* Right: Amount + Status */}
      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          {formatCurrency(quote.totalAmount, quote.currencySymbol || currencySymbol)}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
          <Text style={[styles.statusPillText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    padding: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 74,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quoteNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  validityText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

