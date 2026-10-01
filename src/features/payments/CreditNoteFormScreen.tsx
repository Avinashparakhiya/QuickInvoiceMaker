import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { invoiceRepository } from '../../database/repositories/invoiceRepository';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { Invoice } from '../../types';

export const CreditNoteFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { activeOrg } = useOrgStore();
  const { loadDashboardData, loadInvoices } = useInvoiceStore();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [creditNumber, setCreditNumber] = useState(`CN-${Date.now().toString().slice(-4)}`);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Product Return / Billing Adjustment');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      invoiceRepository.getAll({ orgId: activeOrg.id }).then((all) => {
        setInvoices(all);
        if (all.length > 0) setSelectedInvoice(all[0]);
      });
    }
  }, [activeOrg?.id]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid credit note amount.');
      return;
    }
    if (!selectedInvoice || !activeOrg) {
      Alert.alert('Required', 'Please select an invoice to apply credit to.');
      return;
    }

    setLoading(true);
    try {
      const paymentId = `cn-${Date.now()}`;
      await paymentRepository.recordPayment({
        id: paymentId,
        organizationId: activeOrg.id,
        invoiceId: selectedInvoice.id,
        customerId: selectedInvoice.customerId,
        paymentNumber: creditNumber,
        amount: parsedAmount,
        paymentDate: date,
        paymentType: 'CREDIT_NOTE',
        paymentMethod: 'OTHER',
        notes: `Credit Note: ${reason}`,
      });

      await loadDashboardData(activeOrg.id);
      await loadInvoices(activeOrg.id);

      Alert.alert(
        'Credit Note Issued',
        `Credit Note ${creditNumber} of ${formatCurrency(parsedAmount, activeOrg.currencySymbol)} has been applied to invoice #${selectedInvoice.invoiceNumber}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to issue credit note.');
    } finally {
      setLoading(false);
    }
  };

  const symbol = activeOrg?.currencySymbol || '$';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Issue Credit Note"
        subtitle="Reverse charges or process client refund"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Credit Note Details</Text>
          <Input label="Credit Note Number" value={creditNumber} onChangeText={setCreditNumber} />
          <Input label="Issue Date" value={date} onChangeText={setDate} />
        </Card>

        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Apply to Invoice</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.invScroll}>
            {invoices.map((inv) => {
              const isSelected = selectedInvoice?.id === inv.id;
              return (
                <TouchableOpacity
                  key={inv.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedInvoice(inv)}
                  style={[styles.invPill, isSelected && styles.invPillSelected]}
                >
                  <Text style={[styles.invPillNumber, isSelected && styles.invPillNumberSelected]}>
                    {inv.invoiceNumber}
                  </Text>
                  <Text style={[styles.invPillCustomer, isSelected && styles.invPillCustomerSelected]}>
                    {inv.customerName || 'Customer'}
                  </Text>
                  <Text style={[styles.invPillBalance, isSelected && styles.invPillBalanceSelected]}>
                    Total: {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Credit Amount & Reason</Text>
          <Input
            label="Credit Amount"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            prefix={symbol}
            required
          />
          <Input
            label="Reason for Credit Note"
            placeholder="e.g. Return of goods or revised project scope"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
          />
        </Card>

        <Button
          title="Issue Credit Note"
          onPress={handleSave}
          loading={loading}
          size="lg"
          fullWidth
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  invScroll: {
    flexDirection: 'row',
  },
  invPill: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    minWidth: 130,
  },
  invPillSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  invPillNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  invPillNumberSelected: {
    color: colors.primaryDarker,
  },
  invPillCustomer: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  invPillCustomerSelected: {
    color: colors.primaryDark,
  },
  invPillBalance: {
    ...typography.micro,
    color: colors.primaryDarker,
    marginTop: 4,
    fontWeight: '700',
  },
  invPillBalanceSelected: {
    color: colors.primaryDarker,
  },
});
