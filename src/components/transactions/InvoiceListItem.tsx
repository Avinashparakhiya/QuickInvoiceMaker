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

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}
    >
      {/* Left: Customer Avatar */}
      <CustomerAvatar name={invoice.customerName} size={42} />

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
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dotSeparator: {
    marginHorizontal: 5,
    fontSize: 10,
    color: '#94A3B8',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '400',
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
  badgeWrapper: {
    alignSelf: 'flex-end',
  },
  dueText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: -0.1,
  },
  dueTextOverdue: {
    color: '#EF4444',
  },
  dueTextNormal: {
    color: '#0284C7',
  },
});
