import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, FileText, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { Invoice, InvoiceStatus } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onPress }) => {
  const getStatusConfig = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return {
          iconBg: '#DCFCE7',
          iconColor: '#22C55E',
          statusColor: '#16A34A',
          statusText: 'Paid',
          Icon: CheckCircle2,
        };
      case 'PARTIAL':
        return {
          iconBg: '#E0F2FE',
          iconColor: '#3B82F6',
          statusColor: '#0284C7',
          statusText: 'Partially Paid',
          Icon: FileText,
        };
      case 'OVERDUE':
        return {
          iconBg: '#FEE2E2',
          iconColor: '#EF4444',
          statusColor: '#EF4444',
          statusText: 'Overdue',
          Icon: AlertTriangle,
        };
      case 'UNPAID':
      default:
        return {
          iconBg: '#FEF3C7',
          iconColor: '#F59E0B',
          statusColor: '#D97706',
          statusText: 'Unpaid',
          Icon: FileText,
        };
    }
  };

  const config = getStatusConfig(invoice.status);
  const StatusIcon = config.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}
    >
      {/* Left Status Icon Box */}
      <View style={[styles.iconBox, { backgroundColor: config.iconBg }]}>
        <StatusIcon size={20} color={config.iconColor} strokeWidth={2.2} />
      </View>

      {/* Middle: Invoice # + Customer Name */}
      <View style={styles.detailsCol}>
        <Text numberOfLines={1} style={styles.invoiceNumber}>
          {invoice.invoiceNumber}
        </Text>
        <Text numberOfLines={1} style={styles.customerName}>
          {invoice.customerName || 'Walk-in Customer'}
        </Text>
      </View>

      {/* Right: Total Amount + Status & Date */}
      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          {formatCurrency(invoice.totalAmount, invoice.currencySymbol)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.statusText, { color: config.statusColor }]}>
            {config.statusText}
          </Text>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.dateText}>
            {formatDate(invoice.issueDate, 'dd MMM, yyyy')}
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
    minHeight: 70,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
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
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bulletDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '400',
  },
});
