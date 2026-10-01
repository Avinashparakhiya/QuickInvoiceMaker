import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
  Alert,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { X, Share2, Printer, Palette, Check } from 'lucide-react-native';
import { Button } from '../../components/common/Button';
import { buildInvoiceHtml } from '../../pdf/htmlBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { Invoice, Organization, TemplateId } from '../../types';

interface InvoicePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice;
  org: Organization;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  visible,
  onClose,
  invoice,
  org,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>(
    invoice.templateId || 'classic_green'
  );
  const [loading, setLoading] = useState(false);

  const templates: { id: TemplateId; name: string }[] = [
    { id: 'classic_green', name: '01 Classic' },
    { id: 'minimal_slate', name: '02 Minimal' },
    { id: 'modern_card', name: '03 Modern' },
    { id: 'business_pro', name: '04 Corporate' },
    { id: 'gst_india', name: '05 GST India' },
    { id: 'service_detailed', name: '06 Hourly' },
    { id: 'retail_compact', name: '07 Retail' },
    { id: 'freelancer_chic', name: '08 Portfolio' },
    { id: 'editorial_serif', name: '09 Elegant' },
    { id: 'bold_contrast', name: '10 Bold' },
    { id: 'receipt_slip', name: '11 Receipt' },
    { id: 'simple_sage', name: '12 Sage' },
  ];

  const handleShare = async () => {
    setLoading(true);
    try {
      const html = buildInvoiceHtml(invoice, org, selectedTemplate);
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
      Alert.alert('Share Error', err.message || 'Failed to share invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      const html = buildInvoiceHtml(invoice, org, selectedTemplate);
      await Print.printAsync({ html });
    } catch (err: any) {
      Alert.alert('Print Error', err.message || 'Failed to print invoice.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Invoice Live Preview</Text>
            <Text style={styles.subtitle}>
              #{invoice.invoiceNumber} • {formatCurrency(invoice.totalAmount, invoice.currencySymbol)}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 12-Template Selector Strip */}
        <View style={styles.templateStrip}>
          <Text style={styles.stripLabel}>Select Template Design (12 Styles):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateScroll}>
            {templates.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <TouchableOpacity
                  key={tpl.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedTemplate(tpl.id)}
                  style={[
                    styles.templateChip,
                    isSelected && styles.templateChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.templateChipText,
                      isSelected && styles.templateChipTextSelected,
                    ]}
                  >
                    {tpl.name}
                  </Text>
                  {isSelected ? <Check size={14} color="#FFFFFF" /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Preview Summary Box */}
        <ScrollView style={styles.previewContainer} contentContainerStyle={styles.previewContent}>
          <View style={styles.sheetPaper}>
            <View style={styles.paperHeader}>
              <Text style={styles.paperBrand}>{org.displayName || org.name}</Text>
              <Text style={styles.paperInvTitle}>INVOICE</Text>
            </View>

            <View style={styles.paperDivider} />

            <View style={styles.paperMetaRow}>
              <View>
                <Text style={styles.paperLabel}>Billed To:</Text>
                <Text style={styles.paperVal}>{invoice.customerName || 'Client'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.paperLabel}>Invoice #:</Text>
                <Text style={styles.paperVal}>{invoice.invoiceNumber}</Text>
              </View>
            </View>

            <View style={styles.itemsTable}>
              {(invoice.items || []).map((itm, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.itemDesc}>{itm.description}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(itm.lineTotal, invoice.currencySymbol)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.paperDivider} />

            <View style={styles.paperTotalRow}>
              <Text style={styles.paperTotalLabel}>Grand Total:</Text>
              <Text style={styles.paperTotalValue}>
                {formatCurrency(invoice.totalAmount, invoice.currencySymbol)}
              </Text>
            </View>

            <View style={styles.templateActiveBadge}>
              <Text style={styles.templateActiveText}>
                Active Template: {selectedTemplate.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomBar}>
          <Button
            title="Share PDF / WhatsApp"
            onPress={handleShare}
            icon={<Share2 size={18} color="#FFFFFF" />}
            loading={loading}
            style={{ flex: 1.5, marginRight: 10 }}
          />
          <Button
            title="Print"
            onPress={handlePrint}
            variant="white"
            icon={<Printer size={18} color={colors.text} />}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateStrip: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stripLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 6,
    fontWeight: '700',
  },
  templateScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    gap: 4,
  },
  templateChipSelected: {
    backgroundColor: colors.primary,
  },
  templateChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  templateChipTextSelected: {
    color: '#FFFFFF',
  },
  previewContainer: {
    flex: 1,
  },
  previewContent: {
    padding: 20,
  },
  sheetPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 400,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  paperBrand: {
    ...typography.h2,
    color: colors.primaryDarker,
  },
  paperInvTitle: {
    ...typography.h3,
    color: colors.text,
  },
  paperDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 14,
  },
  paperMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paperLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  paperVal: {
    ...typography.bodySemiBold,
    color: colors.text,
    marginTop: 2,
  },
  itemsTable: {
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  itemDesc: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  itemPrice: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  paperTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  paperTotalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  paperTotalValue: {
    ...typography.h2,
    color: colors.primaryDarker,
  },
  templateActiveBadge: {
    alignSelf: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 24,
  },
  templateActiveText: {
    ...typography.micro,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
