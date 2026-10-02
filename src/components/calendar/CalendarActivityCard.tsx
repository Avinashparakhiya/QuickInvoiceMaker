import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, AlertCircle, FileText } from 'lucide-react-native';
import { Invoice, Payment } from '../../types';
import { CustomerAvatar } from '../transactions/CustomerAvatar';
import { InvoiceStatusBadge } from '../transactions/InvoiceStatusBadge';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';

interface InvoiceActivityProps {
  type: 'INVOICE';
  invoice: Invoice;
  selectedDateStr: string;
  onPress: () => void;
}

interface PaymentActivityProps {
  type: 'PAYMENT';
  payment: Payment;
  currencySymbol?: string;
  onPress: () => void;
}

type CalendarActivityCardProps = InvoiceActivityProps | PaymentActivityProps;

export const CalendarActivityCard: React.FC<CalendarActivityCardProps> = (props) => {
  if (props.type === 'PAYMENT') {
    const { payment, currencySymbol = '$', onPress } = props;
    return (
      <TouchableOpacity
        activeOpacity={0.72}
        onPress={onPress}
        style={styles.card}
      >
        <View style={styles.paymentIconCircle}>
          <ArrowDownLeft size={20} color="#15803D" strokeWidth={2.5} />
        </View>

        <View style={styles.centerCol}>
          <Text numberOfLines={1} style={styles.customerName}>
            {payment.customerName || 'Payment Received'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.invoiceNumber}>
              {payment.invoiceNumber ? `#${payment.invoiceNumber}` : payment.paymentNumber}
            </Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.eventTypeText}>Payment Received</Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.paymentAmount}>
            +{formatCurrency(payment.amount, currencySymbol)}
          </Text>
          <View style={styles.paymentPill}>
            <Text style={styles.paymentPillText}>Received</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const { invoice, selectedDateStr, onPress } = props;
  const isDueOnDay = invoice.dueDate === selectedDateStr;
  const isOverdue = invoice.status === 'OVERDUE' || (invoice.balanceDue > 0 && invoice.dueDate < selectedDateStr);
  const isPartial = invoice.status === 'PARTIAL';

  let eventLabel = 'Invoice Due';
  if (isOverdue) {
    eventLabel = 'Overdue';
  } else if (!isDueOnDay && invoice.issueDate === selectedDateStr) {
    eventLabel = 'Invoice Issued';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={styles.card}
    >
      {/* Customer Initials Avatar */}
      <CustomerAvatar name={invoice.customerName} size={42} />

      {/* Center Details */}
      <View style={styles.centerCol}>
        <Text numberOfLines={1} style={styles.customerName}>
          {invoice.customerName || 'Walk-in Customer'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={[styles.eventTypeText, isOverdue && styles.overdueEventText]}>
            {eventLabel}
          </Text>
        </View>
      </View>

      {/* Right Amount & Status */}
      <View style={styles.rightCol}>
        <Text style={styles.invoiceAmount}>
          {formatCurrency(invoice.totalAmount, invoice.currencySymbol)}
        </Text>
        <View style={styles.badgeWrapper}>
          <InvoiceStatusBadge status={invoice.status} />
        </View>

        {(isPartial || isOverdue) && invoice.balanceDue > 0 && (
          <Text
            style={[
              styles.dueBalanceText,
              isOverdue ? styles.dueBalanceOverdue : styles.dueBalanceNormal,
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
  paymentIconCircle: {
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
  eventTypeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  overdueEventText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  paymentPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  paymentPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  badgeWrapper: {
    alignSelf: 'flex-end',
  },
  dueBalanceText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  dueBalanceOverdue: {
    color: '#EF4444',
  },
  dueBalanceNormal: {
    color: '#0284C7',
  },
});
