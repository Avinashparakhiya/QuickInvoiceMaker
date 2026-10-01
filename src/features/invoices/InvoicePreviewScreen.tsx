import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Download,
  Share2,
  Printer,
  Edit,
  Check,
  Building,
  FileText,
  Eye,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useOrgStore } from '../../store/useOrgStore';
import { buildInvoiceHtml } from '../../pdf/htmlBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { Invoice, TemplateId } from '../../types';

export const InvoicePreviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { activeOrg } = useOrgStore();

  const invoice: Invoice = route.params?.invoice;
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    invoice?.templateId || activeOrg?.defaultTemplateId || 'classic_green'
  );
  const [loading, setLoading] = useState(false);

  if (!invoice || !activeOrg) {
    return (
      <View style={styles.container}>
        <Header title="Invoice Preview" showBack onBack={() => navigation.goBack()} />
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyText}>Invoice data not available.</Text>
        </View>
      </View>
    );
  }

  const currencySymbol = invoice.currencySymbol || activeOrg.currencySymbol || '$';

  const handleShare = async () => {
    setLoading(true);
    try {
      const html = buildInvoiceHtml(invoice, activeOrg, selectedTemplate);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share Invoice ${invoice.invoiceNumber}`,
        });
      } else {
        await Share.share({
          message: `Invoice ${invoice.invoiceNumber} for ${invoice.customerName} - Total: ${formatCurrency(invoice.totalAmount, currencySymbol)}`,
        });
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message || 'Failed to share invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setLoading(true);
    try {
      const html = buildInvoiceHtml(invoice, activeOrg, selectedTemplate);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Download Invoice ${invoice.invoiceNumber}`,
        });
      } else {
        Alert.alert('PDF Generated', `Saved to: ${uri}`);
      }
    } catch (err: any) {
      Alert.alert('Download Error', err.message || 'Failed to generate PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      const html = buildInvoiceHtml(invoice, activeOrg, selectedTemplate);
      await Print.printAsync({ html });
    } catch (err: any) {
      Alert.alert('Print Error', err.message || 'Failed to print invoice.');
    }
  };

  const templatesList: { id: TemplateId; name: string }[] = [
    { id: 'classic_green', name: '01 Classic' },
    { id: 'minimal_slate', name: '02 Minimal' },
    { id: 'modern_card', name: '03 Modern' },
    { id: 'business_pro', name: '04 Corporate' },
    { id: 'gst_india', name: '05 GST India' },
    { id: 'service_detailed', name: '06 Service' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Invoice Preview"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.headerRight}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handlePrint}
              style={styles.headerBtn}
            >
              <Printer size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TemplateGallery', {
                currentTemplateId: selectedTemplate,
                onSelectTemplate: (tplId: TemplateId) => setSelectedTemplate(tplId),
              })}
              style={styles.headerBtn}
            >
              <Eye size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Template Switcher Bar */}
      <View style={styles.templateBar}>
        <Text style={styles.templateBarLabel}>Style:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateScroll}>
          {templatesList.map((tpl) => {
            const isSelected = selectedTemplate === tpl.id;
            return (
              <TouchableOpacity
                key={tpl.id}
                activeOpacity={0.7}
                onPress={() => setSelectedTemplate(tpl.id)}
                style={[
                  styles.tplChip,
                  isSelected && styles.tplChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.tplChipText,
                    isSelected && styles.tplChipTextSelected,
                  ]}
                >
                  {tpl.name}
                </Text>
                {isSelected ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* A4 Realistic White Document Sheet */}
        <View style={styles.documentCard}>
          {/* Org Header */}
          <View style={styles.docHeaderRow}>
            <View style={styles.orgBrandBox}>
              <View style={styles.orgAvatar}>
                <Text style={styles.orgAvatarText}>
                  {activeOrg.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.orgName}>{activeOrg.displayName || activeOrg.name}</Text>
                <Text style={styles.orgAddress}>
                  {activeOrg.addressStreet ? `${activeOrg.addressStreet}, ` : ''}
                  {activeOrg.addressCity ? `${activeOrg.addressCity}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.invTitleBox}>
              <Text style={styles.invTitle}>INVOICE</Text>
              <Text style={styles.invNumber}>{invoice.invoiceNumber}</Text>
            </View>
          </View>

          <View style={styles.docDivider} />

          {/* Bill To & Meta Info */}
          <View style={styles.metaRow}>
            <View style={styles.billToBox}>
              <Text style={styles.metaLabel}>Bill To:</Text>
              <Text style={styles.custName}>{invoice.customerName || 'Walk-in Client'}</Text>
              {invoice.customerEmail ? (
                <Text style={styles.custSub}>{invoice.customerEmail}</Text>
              ) : null}
            </View>

            <View style={styles.invoiceMetaBox}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Invoice Date:</Text>
                <Text style={styles.metaVal}>{formatDate(invoice.issueDate, 'dd MMM, yyyy')}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Due Date:</Text>
                <Text style={styles.metaVal}>{formatDate(invoice.dueDate, 'dd MMM, yyyy')}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Status:</Text>
                <Badge status={invoice.status || 'UNPAID'} size="sm" />
              </View>
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 0.4 }]}>#</Text>
            <Text style={[styles.th, { flex: 2.2 }]}>Description</Text>
            <Text style={[styles.th, { flex: 0.6, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Price</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>Amount</Text>
          </View>

          {/* Items Rows */}
          {(invoice.items || []).map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 0.4, color: colors.textMuted }]}>{idx + 1}</Text>
              <Text style={[styles.td, { flex: 2.2, fontWeight: '500' }]}>{item.description}</Text>
              <Text style={[styles.td, { flex: 0.6, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: 'right' }]}>
                {formatCurrency(item.rate, currencySymbol)}
              </Text>
              <Text style={[styles.td, { flex: 1.2, textAlign: 'right', fontWeight: '700' }]}>
                {formatCurrency(item.lineTotal, currencySymbol)}
              </Text>
            </View>
          ))}

          <View style={styles.docDivider} />

          {/* Totals Breakdown */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalVal}>{formatCurrency(invoice.subtotal, currencySymbol)}</Text>
            </View>

            {invoice.discountAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount:</Text>
                <Text style={[styles.totalVal, { color: '#15803D' }]}>
                  -{formatCurrency(invoice.discountAmount, currencySymbol)}
                </Text>
              </View>
            ) : null}

            {invoice.taxAmount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalVal}>+{formatCurrency(invoice.taxAmount, currencySymbol)}</Text>
              </View>
            ) : null}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalVal}>
                {formatCurrency(invoice.totalAmount, currencySymbol)}
              </Text>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              {invoice.termsConditions || invoice.notes || 'Thank you for your business! Please settle the balance according to the agreed due date.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Download PDF"
          onPress={handleDownloadPdf}
          loading={loading}
          icon={<Download size={18} color="#FFFFFF" />}
          style={styles.downloadBtn}
        />
        <Button
          title="Share"
          variant="outline"
          onPress={handleShare}
          icon={<Share2 size={18} color={colors.primaryDarker} />}
          style={styles.shareBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  templateBarLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginRight: 10,
  },
  templateScroll: {
    gap: 8,
  },
  tplChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
  },
  tplChipSelected: {
    backgroundColor: colors.primary,
  },
  tplChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tplChipTextSelected: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D7E5DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  docHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orgBrandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#15803D',
  },
  orgName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  orgAddress: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },
  invTitleBox: {
    alignItems: 'flex-end',
  },
  invTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  invNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  docDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  billToBox: {
    flex: 1,
  },
  metaLabel: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  custName: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 14,
  },
  custSub: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 1,
  },
  invoiceMetaBox: {
    alignItems: 'flex-end',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaVal: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  th: {
    ...typography.micro,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  td: {
    ...typography.captionRegular,
    color: colors.text,
    fontSize: 12,
  },
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 170,
    paddingVertical: 2,
  },
  totalLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 12,
  },
  totalVal: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 170,
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  grandTotalLabel: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
  },
  grandTotalVal: {
    ...typography.bodySemiBold,
    color: '#15803D',
    fontSize: 16,
    fontWeight: '700',
  },
  termsBox: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  termsTitle: {
    ...typography.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  termsText: {
    ...typography.micro,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  downloadBtn: {
    flex: 1.6,
  },
  shareBtn: {
    flex: 1,
  },
});
