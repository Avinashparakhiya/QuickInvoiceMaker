import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Share2,
  Printer,
  CreditCard,
  Trash2,
  Edit,
  CheckCircle2,
  FileText,
  Bell,
  Eye,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { invoiceRepository } from '../../database/repositories/invoiceRepository';
import { buildInvoiceHtml } from '../../pdf/htmlBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Invoice } from '../../types';

import { InvoicePreviewModal } from './InvoicePreviewModal';
import { PaymentReminderModal } from './PaymentReminderModal';

export const InvoiceDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const invoiceId = route.params?.invoiceId;

  const { activeOrg } = useOrgStore();
  const { deleteInvoice } = useInvoiceStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice(invoiceId);
    }
  }, [invoiceId]);

  const loadInvoice = async (id: string) => {
    const inv = await invoiceRepository.getById(id);
    setInvoice(inv);
  };

  const handlePrintOrPdf = async () => {
    if (!invoice || !activeOrg) return;
    try {
      const html = buildInvoiceHtml(invoice, activeOrg);
      await Print.printAsync({ html });
    } catch (err: any) {
      Alert.alert('Print Error', err.message || 'Unable to print invoice.');
    }
  };

  const handleSharePdf = async () => {
    if (!invoice || !activeOrg) return;
    setLoading(true);
    try {
      const html = buildInvoiceHtml(invoice, activeOrg);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice ${invoice.invoiceNumber}`,
        });
      } else {
        await Share.share({
          message: `Invoice ${invoice.invoiceNumber} for ${invoice.customerName} - Total: ${formatCurrency(invoice.totalAmount, invoice.currencySymbol)}`,
        });
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message || 'Unable to share invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!invoice || !activeOrg) return;
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete invoice ${invoice.invoiceNumber}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteInvoice(invoice.id, activeOrg.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Header title="Invoice Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      </View>
    );
  }

  const symbol = invoice.currencySymbol || '$';

  return (
    <View style={styles.container}>
      <Header
        title={invoice.invoiceNumber}
        subtitle={`Issued ${formatDate(invoice.issueDate)}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('InvoicePreview', { invoice })}
              style={styles.previewIconBtn}
            >
              <Eye size={18} color={colors.primaryDarker} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status & Total Header Card */}
        <Card variant="softGreen" padding={18} style={styles.card}>
          <View style={styles.statusRow}>
            <Badge status={invoice.status} size="md" />
            <Text style={styles.dueText}>Due: {formatDate(invoice.dueDate)}</Text>
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Invoiced Amount</Text>
            <Text style={styles.totalAmount}>{formatCurrency(invoice.totalAmount, symbol)}</Text>
          </View>

          {invoice.balanceDue > 0 ? (
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Remaining Balance Due:</Text>
              <Text style={styles.balanceValue}>{formatCurrency(invoice.balanceDue, symbol)}</Text>
            </View>
          ) : (
            <View style={styles.settledRow}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={styles.settledText}>Fully settled & paid in full</Text>
            </View>
          )}
        </Card>

        {/* Live Template Preview Action Card */}
        <Card variant="elevated" padding={14} style={[styles.card, { borderColor: colors.primary }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ ...typography.bodySemiBold, color: colors.text }}>12 Invoice Templates</Text>
              <Text style={{ ...typography.captionRegular, color: colors.textSecondary }}>
                Switch styles & preview live PDF before sending
              </Text>
            </View>
            <Button
              title="Preview"
              onPress={() => navigation.navigate('InvoicePreview', { invoice })}
              size="sm"
              icon={<Eye size={16} color="#FFFFFF" />}
            />
          </View>
        </Card>

        {/* Primary Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Share PDF / WhatsApp"
            onPress={handleSharePdf}
            icon={<Share2 size={18} color="#FFFFFF" />}
            loading={loading}
            style={styles.actionBtn}
          />
          <View style={{ width: 10 }} />
          <Button
            title="Print"
            onPress={handlePrintOrPdf}
            variant="white"
            icon={<Printer size={18} color={colors.text} />}
            style={styles.actionBtn}
          />
        </View>

        {invoice.balanceDue > 0 ? (
          <View style={{ marginBottom: 14, gap: 10 }}>
            <Button
              title="Record Payment"
              onPress={() => navigation.navigate('RecordPayment', { invoiceId: invoice.id })}
              variant="secondary"
              size="lg"
              icon={<CreditCard size={20} color={colors.primaryDark} />}
            />
            <Button
              title="Send Payment Reminder (WhatsApp/Email)"
              onPress={() => setReminderModalVisible(true)}
              variant="outline"
              size="md"
              icon={<Bell size={18} color={colors.primaryDarker} />}
            />
          </View>
        ) : null}

        {/* Customer Information */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Customer Details</Text>
          <Text style={styles.customerName}>{invoice.customerName || 'Walk-in Client'}</Text>
          {invoice.customerEmail ? <Text style={styles.metaText}>{invoice.customerEmail}</Text> : null}
          {invoice.poNumber ? <Text style={styles.metaText}>PO Ref: {invoice.poNumber}</Text> : null}
        </Card>

        {/* Line Items */}
        <Card variant="elevated" padding={16} style={styles.card}>
          <Text style={styles.sectionHeading}>Items & Charges ({(invoice.items || []).length})</Text>

          {(invoice.items || []).map((item, idx) => (
            <View key={item.id || idx} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemDesc}>{item.description}</Text>
                <Text style={styles.itemSub}>
                  {item.quantity} {item.unit || 'pcs'} × {formatCurrency(item.rate, symbol)}
                  {item.taxRate > 0 ? ` • Tax ${item.taxRate}%` : ''}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatCurrency(item.lineTotal, symbol)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>{formatCurrency(invoice.subtotal, symbol)}</Text>
          </View>
          {invoice.taxAmount > 0 ? (
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryVal}>{formatCurrency(invoice.taxAmount, symbol)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryLine}>
            <Text style={[styles.summaryLabel, { fontWeight: '700', color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.summaryVal, { fontWeight: '700', color: colors.primaryDarker }]}>
              {formatCurrency(invoice.totalAmount, symbol)}
            </Text>
          </View>
        </Card>

        {/* Payments History */}
        {(invoice.payments || []).length > 0 ? (
          <Card variant="elevated" padding={16} style={styles.card}>
            <Text style={styles.sectionHeading}>Payment History ({(invoice.payments || []).length})</Text>
            {invoice.payments?.map((p) => (
              <View key={p.id} style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentNum}>{p.paymentNumber} • {p.paymentMethod}</Text>
                  <Text style={styles.metaText}>{formatDate(p.paymentDate)}</Text>
                </View>
                <Text style={styles.paymentAmount}>{formatCurrency(p.amount, symbol)}</Text>
              </View>
            ))}
          </Card>
        ) : null}
      </ScrollView>

      {/* 12-Template Live Preview Modal */}
      {activeOrg ? (
        <InvoicePreviewModal
          visible={previewModalVisible}
          onClose={() => setPreviewModalVisible(false)}
          invoice={invoice}
          org={activeOrg}
        />
      ) : null}

      {/* Smart Payment Reminder Modal */}
      {activeOrg ? (
        <PaymentReminderModal
          visible={reminderModalVisible}
          onClose={() => setReminderModalVisible(false)}
          invoice={invoice}
          org={activeOrg}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  previewIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dueText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalBox: {
    marginBottom: 12,
  },
  totalLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
  },
  totalAmount: {
    ...typography.hero,
    color: colors.primaryDarker,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  balanceValue: {
    ...typography.bodySemiBold,
    color: colors.danger,
    fontSize: 16,
  },
  settledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  settledText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 12,
  },
  customerName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  metaText: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 12,
  },
  itemDesc: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  itemSub: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 10,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryVal: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paymentNum: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  paymentAmount: {
    ...typography.bodySemiBold,
    color: colors.success,
  },
});
