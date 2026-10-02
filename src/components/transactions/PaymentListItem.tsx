import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft } from 'lucide-react-native';
import { Payment } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';

interface PaymentListItemProps {
  payment: Payment;
  currencySymbol?: string;
  onPress: () => void;
}

export const PaymentListItem: React.FC<PaymentListItemProps> = ({
  payment,
  currencySymbol = '$',
  onPress,
}) => {
  const formatMethod = (method: string) => {
    return method.replace(/_/g, ' ');
  };

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}
    >
      {/* Left: Green Payment Icon Circle */}
      <View style={styles.iconCircle}>
        <ArrowDownLeft size={20} color="#15803D" strokeWidth={2.5} />
      </View>

      {/* Center: Customer Name + Invoice Reference + Method • Date */}
      <View style={styles.centerCol}>
        <Text numberOfLines={1} style={styles.customerName}>
          {payment.customerName || 'Customer Payment'}
        </Text>
        <Text numberOfLines={1} style={styles.invoiceRef}>
          {payment.invoiceNumber ? `Payment for #${payment.invoiceNumber}` : 'Direct Advance Payment'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.methodText}>{formatMethod(payment.paymentMethod)}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.dateText}>
            {formatDate(payment.paymentDate, 'dd MMM yyyy')}
          </Text>
        </View>
      </View>

      {/* Right: +Amount Received */}
      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          +{formatCurrency(payment.amount, currencySymbol)}
        </Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>Received</Text>
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
    backgroundColor: '#DCFCE7',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  invoiceRef: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  dotSeparator: {
    marginHorizontal: 5,
    fontSize: 10,
    color: '#94A3B8',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
});
