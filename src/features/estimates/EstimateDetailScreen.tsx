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
  FileSpreadsheet,
  ArrowRight,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  FileCheck,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useOrgStore } from '../../store/useOrgStore';
import { estimateRepository } from '../../database/repositories/estimateRepository';
import { buildEstimatePdfHtml } from '../../pdf/estimatePdfBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/dates';
import { useResponsive } from '../../utils/useResponsive';
import { Estimate } from '../../types';

export const EstimateDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const estimateId = route.params?.estimateId;

  const { activeOrg } = useOrgStore();
  const { contentMaxWidth, isWideScreen } = useResponsive();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (estimateId) {
      loadEstimate(estimateId);
    }
  }, [estimateId]);

  const loadEstimate = async (id: string) => {
    const est = await estimateRepository.getById(id);
    setEstimate(est);
  };

  const handleUpdateStatus = async (newStatus: Estimate['status']) => {
    if (!estimate) return;
    await estimateRepository.updateStatus(estimate.id, newStatus);
    await loadEstimate(estimate.id);
  };

  const handleConvertToInvoice = async () => {
    if (!estimate) return;
    try {
      Alert.alert(
        'Convert to Invoice',
        `Convert estimate ${estimate.estimateNumber} into a new invoice?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Convert Now',
            onPress: async () => {
              const invoice = await estimateRepository.convertToInvoice(estimate.id);
              await loadEstimate(estimate.id);
              Alert.alert(
                'Converted to Invoice!',
                `Invoice ${invoice.invoiceNumber} created successfully.`,
                [
                  {
                    text: 'View Invoice',
                    onPress: () => navigation.navigate('InvoiceDetail', { invoiceId: invoice.id }),
                  },
                  { text: 'Stay Here' },
                ]
              );
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Conversion Failed', err.message || 'Unable to convert estimate.');
    }
  };

  const handlePrint = async () => {
    if (!estimate || !activeOrg) return;
    try {
      const html = buildEstimatePdfHtml(estimate, activeOrg);
      await Print.printAsync({ html });
    } catch (err: any) {
      Alert.alert('Print Error', err.message || 'Unable to print proposal.');
    }
  };

  const handleSharePdf = async () => {
    if (!estimate || !activeOrg) return;
    setLoading(true);
    try {
      const html = buildEstimatePdfHtml(estimate, activeOrg);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share Estimate ${estimate.estimateNumber}`,
        });
      } else {
        await Share.share({
          message: `Estimate ${estimate.estimateNumber} for ${estimate.customerName} - Total: ${formatCurrency(estimate.totalAmount, estimate.currencySymbol)}`,
        });
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message || 'Unable to share estimate.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!estimate) return;
    Alert.alert(
      'Delete Estimate',
      `Are you sure you want to delete estimate ${estimate.estimateNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await estimateRepository.delete(estimate.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!estimate) {
    return (
      <View style={styles.container}>
        <Header title="Estimate Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading estimate...</Text>
        </View>
      </View>
    );
  }

  const symbol = estimate.currencySymbol || activeOrg?.currencySymbol || '$';

  return (
    <View style={styles.container}>
      <Header
        title={estimate.estimateNumber}
        subtitle={`Issued ${formatDate(estimate.issueDate)}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Trash2 size={18} color={colors.danger} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]} showsVerticalScrollIndicator={false}>
        <View style={isWideScreen ? styles.desktopColumns : undefined}>
          {/* Left Column (Desktop) */}
          <View style={isWideScreen ? styles.colLeft : undefined}>
            {/* Status & Amount Card */}
            <Card variant="softGreen" padding={18} style={styles.card}>
              <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{estimate.status}</Text>
                </View>
                <Text style={styles.expiryText}>Valid Until: {formatDate(estimate.expiryDate)}</Text>
              </View>

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Estimated Proposal Amount</Text>
                <Text style={styles.totalAmount}>{formatCurrency(estimate.totalAmount, symbol)}</Text>
              </View>

              {/* Status Changer Chips */}
              <View style={styles.statusSwitcherRow}>
                <Text style={styles.statusSwitcherLabel}>Set Status:</Text>
                <View style={styles.statusChips}>
                  {(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED'] as Estimate['status'][]).map((st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => handleUpdateStatus(st)}
                      style={[
                        styles.statusChip,
                        estimate.status === st && styles.statusChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          estimate.status === st && styles.statusChipTextActive,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>

            {/* 1-Tap Convert to Invoice Banner */}
            {estimate.status !== 'CONVERTED' ? (
              <Card variant="elevated" padding={16} style={[styles.card, styles.convertBanner]}>
                <View style={styles.convertRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.convertTitle}>Ready to Bill?</Text>
                    <Text style={styles.convertSubtitle}>
                      Convert this quote to an active invoice with 1 tap.
                    </Text>
                  </View>
                  <Button
                    title="Convert to Invoice"
                    onPress={handleConvertToInvoice}
                    size="md"
                    icon={<ArrowRight size={16} color="#FFFFFF" />}
                  />
                </View>
              </Card>
            ) : (
              <Card variant="elevated" padding={14} style={[styles.card, { borderColor: colors.info }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <FileCheck size={24} color={colors.info} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...typography.bodySemiBold, color: colors.text }}>
                      Converted to Invoice
                    </Text>
                    <Text style={{ ...typography.captionRegular, color: colors.textSecondary }}>
                      This estimate was converted into an active invoice.
                    </Text>
                  </View>
                  {estimate.convertedInvoiceId ? (
                    <Button
                      title="View"
                      size="sm"
                      variant="secondary"
                      onPress={() =>
                        navigation.navigate('InvoiceDetail', {
                          invoiceId: estimate.convertedInvoiceId,
                        })
                      }
                    />
                  ) : null}
                </View>
              </Card>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
              <Button
                title="Share Proposal PDF"
                onPress={handleSharePdf}
                icon={<Share2 size={18} color="#FFFFFF" />}
                loading={loading}
                style={styles.actionBtn}
              />
              <View style={{ width: 10 }} />
              <Button
                title="Print"
                onPress={handlePrint}
                variant="white"
                icon={<Printer size={18} color={colors.text} />}
                style={styles.actionBtn}
              />
            </View>

            {/* Customer Information */}
            <Card variant="elevated" padding={16} style={styles.card}>
              <Text style={styles.sectionHeading}>Proposed For</Text>
              <Text style={styles.customerName}>{estimate.customerName || 'Potential Client'}</Text>
            </Card>
          </View>

          {/* Right Column (Desktop) */}
          <View style={isWideScreen ? styles.colRight : undefined}>
            {/* Line Items */}
            <Card variant="elevated" padding={16} style={styles.card}>
              <Text style={styles.sectionHeading}>
                Scope / Proposed Deliverables ({(estimate.items || []).length})
              </Text>

              {(estimate.items || []).map((item, idx) => (
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

              {/* Breakdown */}
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(estimate.subtotal, symbol)}</Text>
              </View>

              {estimate.discountAmount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Discount</Text>
                  <Text style={[styles.breakdownValue, { color: colors.danger }]}>
                    -{formatCurrency(estimate.discountAmount, symbol)}
                  </Text>
                </View>
              )}

              {estimate.taxAmount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Tax</Text>
                  <Text style={styles.breakdownValue}>{formatCurrency(estimate.taxAmount, symbol)}</Text>
                </View>
              )}

              <View style={[styles.breakdownRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Estimated Total</Text>
                <Text style={styles.grandTotalValue}>
                  {formatCurrency(estimate.totalAmount, symbol)}
                </Text>
              </View>
            </Card>

            {/* Notes & Terms */}
            {(estimate.notes || estimate.termsConditions) && (
              <Card variant="elevated" padding={16} style={styles.card}>
                {estimate.notes ? (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.noteTitle}>Proposal Notes</Text>
                    <Text style={styles.noteBody}>{estimate.notes}</Text>
                  </View>
                ) : null}

                {estimate.termsConditions ? (
                  <View>
                    <Text style={styles.noteTitle}>Terms & Validity</Text>
                    <Text style={styles.noteBody}>{estimate.termsConditions}</Text>
                  </View>
                ) : null}
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
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
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  desktopColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  colLeft: {
    flex: 1.1,
  },
  colRight: {
    flex: 1.3,
  },
  card: {
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  statusBadgeText: {
    ...typography.caption,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  expiryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    ...typography.h1,
    color: colors.primaryDarker,
    fontSize: 32,
  },
  statusSwitcherRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.2)',
    paddingTop: 12,
  },
  statusSwitcherLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statusChipActive: {
    backgroundColor: colors.primaryDarker,
    borderColor: colors.primaryDarker,
  },
  statusChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
  convertBanner: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  convertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convertTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  convertSubtitle: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginTop: 2,
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 8,
  },
  itemDesc: {
    ...typography.bodyMedium,
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
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 6,
  },
  grandTotalLabel: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 16,
  },
  grandTotalValue: {
    ...typography.h3,
    color: colors.primaryDarker,
  },
  noteTitle: {
    ...typography.bodySemiBold,
    color: colors.text,
    marginBottom: 4,
  },
  noteBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 8,
  },
});
