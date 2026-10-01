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
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { invoiceRepository } from '../../database/repositories/invoiceRepository';
import { customerRepository } from '../../database/repositories/customerRepository';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { buildPaymentReceiptHtml } from '../../pdf/receiptBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { format } from 'date-fns';
import { Invoice, Customer, PaymentMethod, PaymentType } from '../../types';

export const RecordPaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const invoiceId = route.params?.invoiceId;

  const { activeOrg } = useOrgStore();
  const { loadDashboardData, loadInvoices } = useInvoiceStore();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [paymentType, setPaymentType] = useState<PaymentType>('PAYMENT');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      loadInitialData();
    }
  }, [activeOrg?.id]);

  const loadInitialData = async () => {
    if (!activeOrg) return;
    const [allInvs, allCusts] = await Promise.all([
      invoiceRepository.getAll({ orgId: activeOrg.id }),
      customerRepository.getByOrg(activeOrg.id),
    ]);

    const pending = allInvs.filter((i) => i.balanceDue > 0);
    setInvoices(pending);
    setCustomers(allCusts);

    if (invoiceId) {
      const match = allInvs.find((i) => i.id === invoiceId);
      if (match) {
        setSelectedInvoice(match);
        setAmount(match.balanceDue.toString());
      }
    } else if (pending.length > 0) {
      setSelectedInvoice(pending[0]);
      setAmount(pending[0].balanceDue.toString());
    } else if (allCusts.length > 0) {
      setSelectedCustomer(allCusts[0]);
    }
  };

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setAmount(inv.balanceDue.toString());
  };

  const handleSaveAndShareReceipt = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }
    if (!activeOrg) {
      Alert.alert('Error', 'No active business profile selected.');
      return;
    }

    const customerId = selectedInvoice?.customerId || selectedCustomer?.id || customers[0]?.id;
    if (!customerId) {
      Alert.alert('Required', 'Please select a customer or linked invoice.');
      return;
    }

    setLoading(true);
    try {
      const paymentId = `pay-${Date.now()}`;
      const paymentNumber = `RCP-${Date.now().toString().slice(-5)}`;

      const paymentRecord = await paymentRepository.recordPayment({
        id: paymentId,
        organizationId: activeOrg.id,
        invoiceId: selectedInvoice?.id,
        customerId,
        paymentNumber,
        amount: parsedAmount,
        paymentDate,
        paymentType,
        paymentMethod,
        referenceNumber,
        notes,
      });

      await loadDashboardData(activeOrg.id);
      await loadInvoices(activeOrg.id);

      Alert.alert(
        'Payment Recorded Successfully!',
        `Payment voucher #${paymentNumber} of ${formatCurrency(parsedAmount, activeOrg.currencySymbol)} has been logged.`,
        [
          {
            text: 'Share Official Receipt PDF',
            onPress: async () => {
              try {
                const receiptHtml = buildPaymentReceiptHtml(paymentRecord, activeOrg, selectedInvoice);
                const { uri } = await Print.printToFileAsync({ html: receiptHtml });
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(uri, {
                    UTI: '.pdf',
                    mimeType: 'application/pdf',
                    dialogTitle: `Payment Receipt ${paymentNumber}`,
                  });
                }
              } catch (e) {
                console.error(e);
              }
              navigation.goBack();
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  const paymentTypes: { key: PaymentType; label: string; desc: string }[] = [
    { key: 'PAYMENT', label: 'Invoice Payment', desc: 'Settle open invoice balance' },
    { key: 'ADVANCE_RETAINER', label: 'Advance / Retainer', desc: 'Customer deposit for future work' },
    { key: 'REFUND', label: 'Refund / Reversal', desc: 'Return funds to client' },
  ];

  const methods: { key: PaymentMethod; label: string }[] = [
    { key: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { key: 'UPI', label: 'UPI / QR' },
    { key: 'CASH', label: 'Cash' },
    { key: 'CARD', label: 'Card' },
    { key: 'CHEQUE', label: 'Cheque' },
    { key: 'ONLINE', label: 'Online Gateway' },
  ];

  const currencySymbol = activeOrg?.currencySymbol || '$';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Record Transaction"
        subtitle="Log payment, retainer or refund"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Payment Type Selector */}
        <View style={styles.typeSelectorRow}>
          {paymentTypes.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setPaymentType(t.key)}
              style={[
                styles.typeBtn,
                paymentType === t.key && styles.typeBtnActive,
              ]}
            >
              <Text style={[styles.typeBtnText, paymentType === t.key && styles.typeBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Invoice Linkage (If Invoice Payment) */}
        {paymentType === 'PAYMENT' ? (
          <Card variant="elevated" padding={16} style={styles.card}>
            <Text style={styles.sectionHeading}>Link to Outstanding Invoice</Text>
            {invoices.length === 0 ? (
              <Text style={styles.noInvoicesText}>No open invoices with balance due.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.invScroll}>
                {invoices.map((inv) => {
                  const isSelected = selectedInvoice?.id === inv.id;
                  return (
                    <TouchableOpacity
                      key={inv.id}
                      activeOpacity={0.7}
                      onPress={() => handleSelectInvoice(inv)}
                      style={[
                        styles.invPill,
                        isSelected && styles.invPillSelected,
                      ]}
                    >
                      <Text style={[styles.invPillNumber, isSelected && styles.invPillNumberSelected]}>
                        {inv.invoiceNumber}
                      </Text>
                      <Text numberOfLines={1} style={[styles.invPillCustomer, isSelected && styles.invPillCustomerSelected]}>
                        {inv.customerName || 'Customer'}
                      </Text>
                      <Text style={[styles.invPillBalance, isSelected && styles.invPillBalanceSelected]}>
                        Bal: {formatCurrency(inv.balanceDue, inv.currencySymbol)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Card>
        ) : (
          <Card variant="elevated" padding={16} style={styles.card}>
            <Text style={styles.sectionHeading}>Customer / Client</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {customers.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCustomer(c)}
                  style={[
                    styles.custPill,
                    selectedCustomer?.id === c.id && styles.custPillActive,
                  ]}
                >
                  <Text style={[styles.custPillText, selectedCustomer?.id === c.id && styles.custPillTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Amount & Settlement */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <View style={styles.amountHeaderRow}>
            <Text style={styles.sectionHeading}>Amount Received</Text>
            {selectedInvoice && paymentType === 'PAYMENT' ? (
              <TouchableOpacity
                onPress={() => setAmount(selectedInvoice.balanceDue.toString())}
                style={styles.fullAmountBtn}
              >
                <Text style={styles.fullAmountBtnText}>
                  Pay Full ({formatCurrency(selectedInvoice.balanceDue, currencySymbol)})
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            prefix={currencySymbol}
            inputStyle={{ fontSize: 22, fontWeight: '800' }}
            required
          />

          <Input
            label="Transaction Date (YYYY-MM-DD)"
            value={paymentDate}
            onChangeText={setPaymentDate}
          />
        </Card>

        {/* Payment Method Selector */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Payment Mode</Text>
          <View style={styles.methodGrid}>
            {methods.map((m) => {
              const isSelected = paymentMethod === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  activeOpacity={0.7}
                  onPress={() => setPaymentMethod(m.key)}
                  style={[
                    styles.methodChip,
                    isSelected && styles.methodChipActive,
                  ]}
                >
                  <Text style={[styles.methodText, isSelected && styles.methodTextActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Transaction / Reference # (Optional)"
            placeholder="e.g. UTR-982181 / Wire Ref #1002"
            value={referenceNumber}
            onChangeText={setReferenceNumber}
            containerStyle={{ marginTop: 12 }}
          />

          <Input
            label="Notes / Description"
            placeholder="e.g. Milestone 1 advance deposit"
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        <Button
          title="Record Payment & Generate Voucher"
          onPress={handleSaveAndShareReceipt}
          loading={loading}
          size="lg"
          fullWidth
          style={styles.saveBtn}
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
  typeSelectorRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeBtnActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  typeBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  card: {
    marginBottom: 14,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  noInvoicesText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
    color: colors.danger,
    marginTop: 4,
    fontWeight: '700',
  },
  invPillBalanceSelected: {
    color: colors.primaryDarker,
  },
  custPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    marginRight: 8,
  },
  custPillActive: {
    backgroundColor: colors.primary,
  },
  custPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  custPillTextActive: {
    color: '#FFFFFF',
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fullAmountBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.primarySoft,
  },
  fullAmountBtnText: {
    ...typography.micro,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  methodTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});
