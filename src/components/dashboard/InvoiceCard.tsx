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
          iconBg: '#ECFDF5',
          iconColor: '#059669',
          statusColor: '#047857',
          statusBg: '#ECFDF5',
          statusBorder: '#A7F3D0',
          statusText: 'Paid',
          Icon: CheckCircle2,
        };
      case 'PARTIAL':
        return {
          iconBg: '#F0F9FF',
          iconColor: '#0284C7',
          statusColor: '#0369A1',
          statusBg: '#F0F9FF',
          statusBorder: '#BAE6FD',
          statusText: 'Partial',
          Icon: FileText,
        };
      case 'OVERDUE':
        return {
          iconBg: '#FFF1F2',
          iconColor: '#E11D48',
          statusColor: '#BE123C',
          statusBg: '#FFF1F2',
          statusBorder: '#FECDD3',
          statusText: 'Overdue',
          Icon: AlertTriangle,
        };
      case 'UNPAID':
      default:
        return {
          iconBg: '#FFFBEB',
          iconColor: '#D97706',
          statusColor: '#B45309',
          statusBg: '#FFFBEB',
          statusBorder: '#FDE68A',
          statusText: 'Unpaid',
          Icon: FileText,
        };
    }
  };

  const config = getStatusConfig(invoice.status);

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
      style={styles.card}
    >
      {/* Left Avatar Box */}
      <View style={[styles.avatarBox, { backgroundColor: config.iconBg }]}>
        <Text style={[styles.avatarText, { color: config.iconColor }]}>
          {getCustomerInitials(invoice.customerName)}
        </Text>
      </View>

      {/* Middle: Customer Name + Invoice Number */}
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
            {formatDate(invoice.issueDate, 'dd MMM')}
          </Text>
        </View>
      </View>

      {/* Right: Total Amount + Status Pill */}
      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          {formatCurrency(invoice.totalAmount, invoice.currencySymbol)}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: config.statusBg, borderColor: config.statusBorder }]}>
          <View style={[styles.statusDot, { backgroundColor: config.iconColor }]} />
          <Text style={[styles.statusText, { color: config.statusColor }]}>
            {config.statusText}
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
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 70,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  bulletDot: {
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
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
