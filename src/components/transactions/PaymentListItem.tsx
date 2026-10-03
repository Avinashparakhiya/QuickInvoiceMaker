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
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, { borderColor: '#A7F3D0' }]}
    >
      {/* Left: Green Payment Icon Circle */}
      <View style={styles.iconCircle}>
        <ArrowDownLeft size={20} color="#059669" strokeWidth={2.4} />
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
          <View style={styles.methodTag}>
            <Text style={styles.methodText}>{formatMethod(payment.paymentMethod)}</Text>
          </View>
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
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>Received</Text>
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
    backgroundColor: '#ECFDF5',
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
  invoiceRef: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  methodTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
  },
  dateText: {
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
    color: '#047857',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
});

