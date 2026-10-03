import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { getDueStatusText, formatDate } from '../../utils/dates';

interface UpcomingInvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export const UpcomingInvoiceCard: React.FC<UpcomingInvoiceCardProps> = ({
  invoice,
  onPress,
}) => {
  const dueInfo = getDueStatusText(invoice.dueDate);
  const isOverdue = dueInfo.isOverdue;

  const getCustomerInitials = (name?: string) => {
    if (!name) return 'WK';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: isOverdue ? '#FECDD3' : '#FDE68A' },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isOverdue ? '#FFF1F2' : '#FFFBEB' },
        ]}
      >
        <Text
          style={[
            styles.avatarText,
            { color: isOverdue ? '#E11D48' : '#D97706' },
          ]}
        >
          {getCustomerInitials(invoice.customerName)}
        </Text>
      </View>

      <View style={styles.detailsCol}>
        <Text numberOfLines={1} style={styles.customerName}>
          {invoice.customerName || 'Walk-in Customer'}
        </Text>
        <View style={styles.subRow}>
          <Text numberOfLines={1} style={styles.invoiceNumber}>
            {invoice.invoiceNumber}
          </Text>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.dateText}>
            Due {formatDate(invoice.dueDate, 'dd MMM')}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          {formatCurrency(invoice.balanceDue || invoice.totalAmount, invoice.currencySymbol)}
        </Text>
        <View
          style={[
            styles.dueBadge,
            {
              backgroundColor: isOverdue ? '#FFF1F2' : '#FFFBEB',
              borderColor: isOverdue ? '#FECDD3' : '#FDE68A',
            },
          ]}
        >
          <View
            style={[
              styles.dueDot,
              { backgroundColor: isOverdue ? '#EF4444' : '#F59E0B' },
            ]}
          />
          <Text
            style={[
              styles.dueBadgeText,
              { color: isOverdue ? '#BE123C' : '#B45309' },
            ]}
          >
            {dueInfo.text}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1.5,
    minHeight: 58,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  customerName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  invoiceNumber: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  bulletDot: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  dateText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  dueDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
  },
  dueBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

