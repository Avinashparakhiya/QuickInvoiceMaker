import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import {
  TrendingUp,
  CreditCard,
  Clock,
  PieChart,
  Users,
  Download,
  Share2,
  FileSpreadsheet,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { generateInvoicesCsv } from '../../utils/exportImport';
import { buildFinancialReportPdfHtml } from '../../pdf/reportPdfBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { Payment } from '../../types';

export const ReportsScreen: React.FC = () => {
  const { activeOrg } = useOrgStore();
  const { kpiSummary, invoices, loadDashboardData, loadInvoices } = useInvoiceStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      loadDashboardData(activeOrg.id);
      loadInvoices(activeOrg.id);
      paymentRepository.getByOrg(activeOrg.id).then(setPayments);
    }
  }, [activeOrg?.id]);

  const currencySymbol = activeOrg?.currencySymbol || '$';

  // Calculate tax collected
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);

  // Group top customers
  const customerMap: Record<string, { name: string; total: number; count: number }> = {};
  invoices.forEach((inv) => {
    const name = inv.customerName || 'Walk-in Customer';
    if (!customerMap[name]) {
      customerMap[name] = { name, total: 0, count: 0 };
    }
    customerMap[name].total += inv.totalAmount;
    customerMap[name].count += 1;
  });

  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const csvContent = generateInvoicesCsv(invoices);
      const filename = `Invoices_Report_${Date.now()}.csv`;
      const fileUri = `${FileSystem.documentDirectory || ''}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Invoices CSV',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Exported', `File saved to ${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('Export Error', e.message || 'Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  const handleShareReportPdf = async () => {
    if (!activeOrg) return;
    setExporting(true);
    try {
      const html = buildFinancialReportPdfHtml(activeOrg, kpiSummary, invoices, payments);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Share Financial Statement Report',
        });
      }
    } catch (e: any) {
      Alert.alert('Report Error', e.message || 'Failed to generate report PDF.');
    } finally {
      setExporting(false);
    }
  };

  const totalSales = kpiSummary?.totalSales || 1;
  const paidRatio = Math.min(100, Math.round(((kpiSummary?.totalPaid || 0) / totalSales) * 100));
  const outstandingRatio = Math.min(100, Math.round(((kpiSummary?.outstanding || 0) / totalSales) * 100));

  return (
    <View style={styles.container}>
      <Header
        title="Reports & Analytics"
        subtitle={`Business Intelligence for ${activeOrg?.displayName || activeOrg?.name || 'Workspace'}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Export Action Strip */}
        <View style={styles.exportStrip}>
          <Button
            title="Export CSV"
            onPress={handleExportCsv}
            variant="white"
            size="sm"
            icon={<FileSpreadsheet size={16} color={colors.primaryDark} />}
            loading={exporting}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Statement PDF"
            onPress={handleShareReportPdf}
            variant="secondary"
            size="sm"
            icon={<Share2 size={16} color={colors.primaryDarker} />}
            loading={exporting}
            style={{ flex: 1 }}
          />
        </View>

        {/* Revenue Performance & Visual Ratio Bar */}
        <Card variant="softGreen" padding={18} style={styles.card}>
          <Text style={styles.cardSectionTitle}>Revenue Performance</Text>
          <View style={styles.metricRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Total Billed</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(kpiSummary?.totalSales || 0, currencySymbol)}
              </Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Cash Inflow</Text>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                {formatCurrency(kpiSummary?.totalPaid || 0, currencySymbol)}
              </Text>
            </View>
          </View>

          {/* Visual Inflow vs Pending Ratio Bar */}
          <View style={styles.ratioBarContainer}>
            <View style={styles.ratioBarLabels}>
              <Text style={[styles.ratioLabel, { color: colors.success }]}>Collected ({paidRatio}%)</Text>
              <Text style={[styles.ratioLabel, { color: colors.warning }]}>Outstanding ({outstandingRatio}%)</Text>
            </View>
            <View style={styles.ratioTrack}>
              <View style={[styles.ratioFillPaid, { width: `${paidRatio}%` }]} />
              <View style={[styles.ratioFillPending, { width: `${outstandingRatio}%` }]} />
            </View>
          </View>

          <View style={[styles.metricRow, { marginTop: 16 }]}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Unpaid Receivables</Text>
              <Text style={[styles.metricValue, { color: colors.warning }]}>
                {formatCurrency(kpiSummary?.outstanding || 0, currencySymbol)}
              </Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Tax Incurred</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(totalTax, currencySymbol)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Receivables Aging Analysis */}
        <Card variant="elevated" padding={18} style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Clock size={20} color={colors.primaryDark} />
            <Text style={styles.cardHeading}>Accounts Receivable Aging</Text>
          </View>

          <View style={styles.agingItem}>
            <View style={styles.agingHeader}>
              <Text style={styles.agingLabel}>Current (Not Due Yet)</Text>
              <Text style={styles.agingAmount}>
                {formatCurrency((kpiSummary?.outstanding || 0) - (kpiSummary?.overdue || 0), currencySymbol)}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '70%', backgroundColor: colors.primary }]} />
            </View>
          </View>

          <View style={styles.agingItem}>
            <View style={styles.agingHeader}>
              <Text style={styles.agingLabel}>1 – 30 Days Overdue</Text>
              <Text style={[styles.agingAmount, { color: colors.warning }]}>
                {formatCurrency(kpiSummary?.overdue || 0, currencySymbol)}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '30%', backgroundColor: colors.warning }]} />
            </View>
          </View>

          <View style={styles.agingItem}>
            <View style={styles.agingHeader}>
              <Text style={styles.agingLabel}>31 – 60 Days Overdue</Text>
              <Text style={styles.agingAmount}>{formatCurrency(0, currencySymbol)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '0%', backgroundColor: colors.danger }]} />
            </View>
          </View>
        </Card>

        {/* Top Customers Breakdown */}
        <Card variant="elevated" padding={18} style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Users size={20} color={colors.primaryDark} />
            <Text style={styles.cardHeading}>Top Customers by Revenue</Text>
          </View>

          {topCustomers.map((cust, idx) => (
            <View key={cust.name} style={styles.custRow}>
              <View style={styles.custRank}>
                <Text style={styles.custRankText}>#{idx + 1}</Text>
              </View>
              <View style={styles.custInfo}>
                <Text style={styles.custName}>{cust.name}</Text>
                <Text style={styles.custCount}>{cust.count} Invoices</Text>
              </View>
              <Text style={styles.custTotal}>
                {formatCurrency(cust.total, currencySymbol)}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  exportStrip: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  card: {
    marginVertical: 8,
  },
  cardSectionTitle: {
    ...typography.caption,
    color: colors.primaryDarker,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    fontWeight: '700',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardHeading: {
    ...typography.h3,
    color: colors.text,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    ...typography.h2,
    color: colors.text,
  },
  ratioBarContainer: {
    marginTop: 14,
  },
  ratioBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratioLabel: {
    ...typography.micro,
    fontWeight: '700',
  },
  ratioTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray200,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  ratioFillPaid: {
    backgroundColor: colors.success,
    height: '100%',
  },
  ratioFillPending: {
    backgroundColor: colors.warning,
    height: '100%',
  },
  agingItem: {
    marginBottom: 12,
  },
  agingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  agingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  agingAmount: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  custRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  custRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  custRankText: {
    ...typography.micro,
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  custInfo: {
    flex: 1,
  },
  custName: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  custCount: {
    ...typography.micro,
    color: colors.textMuted,
  },
  custTotal: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
});
