import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, AlertTriangle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { getDueStatusText } from '../../utils/dates';

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

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isOverdue ? '#FEE2E2' : '#FEF3C7' },
        ]}
      >
        {isOverdue ? (
          <AlertCircle size={18} color="#EF4444" strokeWidth={2.2} />
        ) : (
          <AlertTriangle size={18} color="#F59E0B" strokeWidth={2.2} />
        )}
      </View>

      <View style={styles.detailsCol}>
        <Text numberOfLines={1} style={styles.invoiceNumber}>
          {invoice.invoiceNumber}
        </Text>
        <Text numberOfLines={1} style={styles.customerName}>
          {invoice.customerName || 'Walk-in Customer'}
        </Text>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          {formatCurrency(invoice.balanceDue || invoice.totalAmount, invoice.currencySymbol)}
        </Text>
        <View
          style={[
            styles.dueBadge,
            { backgroundColor: isOverdue ? '#FEE2E2' : '#FEF3C7' },
          ]}
        >
          <Text
            style={[
              styles.dueBadgeText,
              { color: isOverdue ? '#DC2626' : '#D97706' },
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 68,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  dueBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
