import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Invoice } from '../../types';
import { CustomerAvatar } from './CustomerAvatar';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getDueStatusText } from '../../utils/dates';

interface InvoiceListItemProps {
  invoice: Invoice;
  onPress: () => void;
}

export const InvoiceListItem: React.FC<InvoiceListItemProps> = ({ invoice, onPress }) => {
  const isOverdue = invoice.status === 'OVERDUE' || (invoice.balanceDue > 0 && getDueStatusText(invoice.dueDate).isOverdue);
  const isPartial = invoice.status === 'PARTIAL';

  const getStatusConfig = () => {
    if (isOverdue) {
      return {
        border: '#FECDD3',
        avatarBg: '#FFF1F2',
        avatarText: '#E11D48',
      };
    }
    switch (invoice.status) {
      case 'PAID':
        return {
          border: '#A7F3D0',
          avatarBg: '#ECFDF5',
          avatarText: '#047857',
        };
      case 'PARTIAL':
        return {
          border: '#BAE6FD',
          avatarBg: '#F0F9FF',
          avatarText: '#0284C7',
        };
      case 'DRAFT':
        return {
          border: '#E2E8F0',
          avatarBg: '#F1F5F9',
          avatarText: '#475569',
        };
      case 'CANCELLED':
        return {
          border: '#E2E8F0',
          avatarBg: '#F8FAFC',
          avatarText: '#64748B',
        };
      case 'UNPAID':
      default:
        return {
          border: '#FDE68A',
          avatarBg: '#FFFBEB',
          avatarText: '#D97706',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.card, { borderColor: statusConfig.border }]}
    >
      {/* Left: Customer Avatar */}
      <CustomerAvatar
        name={invoice.customerName}
        size={36}
        backgroundColor={statusConfig.avatarBg}
        textColor={statusConfig.avatarText}
      />

      {/* Center: Customer Name + Invoice Number • Date */}
      <View style={styles.centerCol}>
        <Text numberOfLines={1} style={styles.customerName}>
          {invoice.customerName || 'Walk-in Customer'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.dateText}>
            {formatDate(invoice.issueDate, 'MMM dd, yyyy')}
          </Text>
        </View>
      </View>

      {/* Right: Amount + Status Badge + Due Balance if Partial/Overdue */}
      <View style={styles.rightCol}>
        <Text style={styles.amount}>
          {formatCurrency(invoice.totalAmount, invoice.currencySymbol)}
        </Text>
        <View style={styles.badgeWrapper}>
          <InvoiceStatusBadge status={invoice.status} />
        </View>

        {(isPartial || isOverdue) && invoice.balanceDue > 0 && (
          <Text
            style={[
              styles.dueText,
              isOverdue ? styles.dueTextOverdue : styles.dueTextNormal,
            ]}
          >
            Due: {formatCurrency(invoice.balanceDue, invoice.currencySymbol)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1.5,
    minHeight: 58,
  },
  centerCol: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 1,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invoiceNumber: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  dotSeparator: {
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
  badgeWrapper: {
    marginTop: 1,
  },
  dueText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  dueTextOverdue: {
    color: '#BE123C',
  },
  dueTextNormal: {
    color: '#B45309',
  },
});
