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
        return { bg: '#DCFCE7', color: '#15803D', label: 'Accepted' };
      case 'SENT':
        return { bg: '#E0F2FE', color: '#0369A1', label: 'Sent' };
      case 'CONVERTED':
        return { bg: '#E0F2FE', color: '#0284C7', label: 'Converted' };
      case 'DECLINED':
        return { bg: '#FEE2E2', color: '#EF4444', label: 'Declined' };
      case 'EXPIRED':
        return { bg: '#FEF3C7', color: '#D97706', label: 'Expired' };
      case 'DRAFT':
      default:
        return { bg: '#F1F5F9', color: '#64748B', label: 'Draft' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}
    >
      {/* Left: Quote Icon Circle */}
      <View style={styles.iconCircle}>
        <FileSpreadsheet size={20} color="#0284C7" strokeWidth={2.2} />
      </View>

      {/* Center: Quote Number + Customer + Valid Date */}
      <View style={styles.centerCol}>
        <Text numberOfLines={1} style={styles.quoteNumber}>
          {quote.estimateNumber}
        </Text>
        <Text numberOfLines={1} style={styles.customerName}>
          {quote.customerName || 'Potential Client'}
        </Text>
        <Text style={styles.validityText}>
          {quote.expiryDate ? `Valid till ${formatDate(quote.expiryDate, 'dd MMM yyyy')}` : 'No expiry set'}
        </Text>
      </View>

      {/* Right: Amount + Status */}
      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          {formatCurrency(quote.totalAmount, quote.currencySymbol || currencySymbol)}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 74,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  quoteNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  validityText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
