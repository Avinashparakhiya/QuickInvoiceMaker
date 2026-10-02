import React, { useEffect, useState, useMemo } from 'react';
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
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { generateInvoicesCsv } from '../../utils/exportImport';
import { buildFinancialReportPdfHtml } from '../../pdf/reportPdfBuilder';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { Payment, Invoice } from '../../types';
import { useResponsive } from '../../utils/useResponsive';
import { subMonths, format } from 'date-fns';

type DateRangeType = 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'LAST_30_DAYS' | 'ALL_TIME';

const AVATAR_COLORS = [
  { bg: '#DCFCE7', text: '#15803D' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#FEE2E2', text: '#B91C1C' },
  { bg: '#F3E8FF', text: '#7E22CE' },
];

const getAvatarTheme = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string) => {
  if (!name) return 'WK';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const ReportsScreen: React.FC = () => {
  const { contentMaxWidth, isWideScreen } = useResponsive();
  const { activeOrg } = useOrgStore();
  const { kpiSummary, invoices, loadDashboardData, loadInvoices } = useInvoiceStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('THIS_MONTH');
  const [selectedChartMonth, setSelectedChartMonth] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrg) {
      loadDashboardData(activeOrg.id);
      loadInvoices(activeOrg.id);
      paymentRepository.getByOrg(activeOrg.id).then(setPayments);
    }
  }, [activeOrg?.id]);

  const currencySymbol = activeOrg?.currencySymbol || '$';

  // Filter invoices and payments by date range
  const now = new Date();
  const thisMonthStr = format(now, 'yyyy-MM');
  const thisYearStr = format(now, 'yyyy');

  const filteredInvoices = useMemo(() => {
    switch (dateRange) {
      case 'THIS_MONTH':
        return invoices.filter((i) => i.issueDate.startsWith(thisMonthStr));
      case 'THIS_YEAR':
        return invoices.filter((i) => i.issueDate.startsWith(thisYearStr));
      case 'LAST_30_DAYS':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        return invoices.filter((i) => i.issueDate >= thirtyDaysAgo);
      case 'THIS_QUARTER':
      case 'ALL_TIME':
      default:
        return invoices;
    }
  }, [invoices, dateRange, thisMonthStr, thisYearStr]);

  const filteredPayments = useMemo(() => {
    switch (dateRange) {
      case 'THIS_MONTH':
        return payments.filter((p) => p.paymentDate.startsWith(thisMonthStr));
      case 'THIS_YEAR':
        return payments.filter((p) => p.paymentDate.startsWith(thisYearStr));
      case 'LAST_30_DAYS':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        return payments.filter((p) => p.paymentDate >= thirtyDaysAgo);
      case 'THIS_QUARTER':
      case 'ALL_TIME':
      default:
        return payments;
    }
  }, [payments, dateRange, thisMonthStr, thisYearStr]);

  const totalSales = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  }, [filteredInvoices]);

  const totalPaid = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [filteredPayments]);

  const totalOutstanding = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  }, [filteredInvoices]);

  const totalOverdue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return filteredInvoices
      .filter((i) => i.status === 'OVERDUE' || (i.status === 'UNPAID' && i.dueDate < today))
      .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  }, [filteredInvoices]);

  const totalTax = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
  }, [filteredInvoices]);

  const collectionRate = totalSales > 0 ? Math.min(100, Math.round((totalPaid / totalSales) * 100)) : 0;
  const outstandingRate = 100 - collectionRate;

  // Monthly 6-month historical Bar Chart data
  const monthlyChartData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const mStr = format(d, 'yyyy-MM');
      const label = format(d, 'MMM');
      const billed = invoices
        .filter((inv) => inv.issueDate.startsWith(mStr))
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      const collected = payments
        .filter((p) => p.paymentDate.startsWith(mStr))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      months.push({ mStr, label, billed, collected });
    }
    return months;
  }, [invoices, payments]);

  const maxChartValue = useMemo(() => {
    let max = 1000;
    monthlyChartData.forEach((m) => {
      if (m.billed > max) max = m.billed;
      if (m.collected > max) max = m.collected;
    });
    return max;
  }, [monthlyChartData]);

  // Top 5 Customers
  const topCustomers = useMemo(() => {
    const customerMap: Record<string, { name: string; total: number; count: number }> = {};
    filteredInvoices.forEach((inv) => {
      const name = inv.customerName || 'Walk-in Customer';
      if (!customerMap[name]) {
        customerMap[name] = { name, total: 0, count: 0 };
      }
      customerMap[name].total += inv.totalAmount;
      customerMap[name].count += 1;
    });

    return Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredInvoices]);

  // Status breakdown
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { PAID: 0, UNPAID: 0, PARTIAL: 0, OVERDUE: 0, DRAFT: 0 };
    filteredInvoices.forEach((inv) => {
      if (counts[inv.status] !== undefined) {
        counts[inv.status] += 1;
      }
    });
    return counts;
  }, [filteredInvoices]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const csvContent = generateInvoicesCsv(filteredInvoices);
      const filename = `Invoices_Report_${Date.now()}.csv`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('Exported', `Downloaded ${filename}`);
        return;
      }

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
      const html = buildFinancialReportPdfHtml(activeOrg, kpiSummary, filteredInvoices, filteredPayments);
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

  const dateRangeTabs: { label: string; value: DateRangeType }[] = [
    { label: 'This Month', value: 'THIS_MONTH' },
    { label: 'This Quarter', value: 'THIS_QUARTER' },
    { label: 'This Year', value: 'THIS_YEAR' },
    { label: 'Last 30 Days', value: 'LAST_30_DAYS' },
    { label: 'All Time', value: 'ALL_TIME' },
  ];

  const selectedChartItem = monthlyChartData.find((m) => m.mStr === selectedChartMonth);

  return (
    <View style={styles.container}>
      <Header
        title="Reports & Analytics"
        subtitle={activeOrg?.displayName || activeOrg?.name || 'Workspace'}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range Selector Strip */}
        <View style={styles.dateFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateFilterRow}>
            {dateRangeTabs.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                activeOpacity={0.7}
                onPress={() => setDateRange(tab.value)}
                style={[
                  styles.dateFilterChip,
                  dateRange === tab.value && styles.dateFilterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.dateFilterText,
                    dateRange === tab.value && styles.dateFilterTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Export Action Buttons */}
        <View style={styles.exportStrip}>
          <Button
            title="Export CSV"
            onPress={handleExportCsv}
            variant="white"
            size="sm"
            icon={<FileSpreadsheet size={16} color={colors.primaryDarker} />}
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

        {/* 2 Main KPI Cards (Matching Reference Screen 4) */}
        <View style={styles.kpiCardsRow}>
          {/* Card 1: Total Billed */}
          <Card variant="elevated" padding={14} style={[styles.kpiCard, styles.kpiCardLeft]}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiCardLabel}>Total Sales</Text>
              <View style={styles.trendBadge}>
                <ArrowUpRight size={12} color="#15803D" />
                <Text style={styles.trendText}>+14.2%</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.kpiCardValue}>
              {formatCurrency(totalSales, currencySymbol)}
            </Text>
            <Text style={styles.kpiCardSub}>{filteredInvoices.length} invoices generated</Text>
          </Card>

          {/* Card 2: Cash Collected */}
          <Card variant="elevated" padding={14} style={[styles.kpiCard, styles.kpiCardRight]}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiCardLabel}>Cash Inflow</Text>
              <View style={[styles.trendBadge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={styles.trendText}>{collectionRate}%</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={[styles.kpiCardValue, { color: colors.success }]}>
              {formatCurrency(totalPaid, currencySymbol)}
            </Text>
            <Text style={styles.kpiCardSub}>{filteredPayments.length} payments collected</Text>
          </Card>
        </View>

        {isWideScreen ? (
          <View style={styles.desktopColumns}>
            {/* Left Column */}
            <View style={styles.desktopLeftCol}>
              {/* 6-Month Invoiced vs Collected Bar Chart */}
              <Card variant="elevated" padding={16} style={styles.sectionCard}>
                <View style={styles.chartHeaderRow}>
                  <View>
                    <Text style={styles.cardHeading}>Revenue vs Inflow (6 Mo)</Text>
                    <Text style={styles.chartSubtitle}>Monthly comparison</Text>
                  </View>
                  <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
                      <Text style={styles.legendLabel}>Billed</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
                      <Text style={styles.legendLabel}>Paid</Text>
                    </View>
                  </View>
                </View>

                {selectedChartItem && (
                  <View style={styles.chartTooltip}>
                    <Text style={styles.tooltipMonth}>{selectedChartItem.label} Details:</Text>
                    <Text style={styles.tooltipText}>
                      Billed: <Text style={{ fontWeight: '700' }}>{formatCurrency(selectedChartItem.billed, currencySymbol)}</Text> • Collected: <Text style={{ fontWeight: '700', color: colors.success }}>{formatCurrency(selectedChartItem.collected, currencySymbol)}</Text>
                    </Text>
                  </View>
                )}

                <View style={styles.barsContainer}>
                  {monthlyChartData.map((item) => {
                    const billedHeight = maxChartValue > 0 ? Math.max(6, Math.round((item.billed / maxChartValue) * 110)) : 6;
                    const paidHeight = maxChartValue > 0 ? Math.max(6, Math.round((item.collected / maxChartValue) * 110)) : 6;
                    const isSelected = selectedChartMonth === item.mStr;

                    return (
                      <TouchableOpacity
                        key={item.mStr}
                        activeOpacity={0.8}
                        onPress={() => setSelectedChartMonth(isSelected ? null : item.mStr)}
                        style={[styles.chartColWrapper, isSelected && styles.chartColSelected]}
                      >
                        <View style={styles.barPair}>
                          <View style={[styles.bar, { height: billedHeight, backgroundColor: colors.primary }]} />
                          <View style={[styles.bar, { height: paidHeight, backgroundColor: '#10B981' }]} />
                        </View>
                        <Text style={[styles.monthLabel, isSelected && styles.monthLabelActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>

              {/* Visual Inflow vs Outstanding Ratio Bar Card */}
              <Card variant="elevated" padding={16} style={styles.sectionCard}>
                <Text style={styles.cardHeading}>Collection Efficiency</Text>
                <View style={styles.ratioBarContainer}>
                  <View style={styles.ratioBarLabels}>
                    <Text style={[styles.ratioLabel, { color: colors.success }]}>
                      Collected ({collectionRate}%)
                    </Text>
                    <Text style={[styles.ratioLabel, { color: colors.warning }]}>
                      Pending ({outstandingRate}%)
                    </Text>
                  </View>
                  <View style={styles.ratioTrack}>
                    <View style={[styles.ratioFillPaid, { width: `${collectionRate}%` }]} />
                    <View style={[styles.ratioFillPending, { width: `${outstandingRate}%` }]} />
                  </View>
                </View>

                <View style={styles.miniMetricsGrid}>
                  <View style={styles.miniMetricCol}>
                    <Text style={styles.miniMetricLabel}>Outstanding</Text>
                    <Text numberOfLines={1} style={[styles.miniMetricVal, { color: colors.warning }]}>
                      {formatCurrency(totalOutstanding, currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.miniMetricDivider} />
                  <View style={styles.miniMetricCol}>
                    <Text style={styles.miniMetricLabel}>Overdue</Text>
                    <Text numberOfLines={1} style={[styles.miniMetricVal, { color: colors.danger }]}>
                      {formatCurrency(totalOverdue, currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.miniMetricDivider} />
                  <View style={styles.miniMetricCol}>
                    <Text style={styles.miniMetricLabel}>Tax Billed</Text>
                    <Text numberOfLines={1} style={styles.miniMetricVal}>
                      {formatCurrency(totalTax, currencySymbol)}
                    </Text>
                  </View>
                </View>
              </Card>

              {/* Receivables Aging Analysis */}
              <Card variant="elevated" padding={16} style={styles.sectionCard}>
                <View style={styles.cardTitleRow}>
                  <Clock size={18} color={colors.primaryDarker} />
                  <Text style={styles.cardHeading}>Receivables Aging Analysis</Text>
                </View>

                <View style={styles.agingItem}>
                  <View style={styles.agingHeader}>
                    <Text style={styles.agingLabel}>Current (0 – 30 Days)</Text>
                    <Text style={styles.agingAmount}>
                      {formatCurrency(Math.max(0, totalOutstanding - totalOverdue), currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '75%', backgroundColor: colors.primary }]} />
                  </View>
                </View>

                <View style={styles.agingItem}>
                  <View style={styles.agingHeader}>
                    <Text style={styles.agingLabel}>31 – 60 Days Overdue</Text>
                    <Text style={[styles.agingAmount, { color: colors.warning }]}>
                      {formatCurrency(totalOverdue, currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: totalOverdue > 0 ? '35%' : '0%', backgroundColor: colors.warning }]} />
                  </View>
                </View>

                <View style={styles.agingItem}>
                  <View style={styles.agingHeader}>
                    <Text style={styles.agingLabel}>60+ Days Overdue</Text>
                    <Text style={[styles.agingAmount, { color: colors.danger }]}>
                      {formatCurrency(0, currencySymbol)}
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '0%', backgroundColor: colors.danger }]} />
                  </View>
                </View>
              </Card>
            </View>

            {/* Right Column */}
            <View style={styles.desktopRightCol}>
              {/* Top 5 Customers by Revenue */}
              <Card variant="elevated" padding={16} style={styles.sectionCard}>
                <View style={styles.cardTitleRow}>
                  <Users size={18} color={colors.primaryDarker} />
                  <Text style={styles.cardHeading}>Top Clients by Revenue</Text>
                </View>

                {topCustomers.length === 0 ? (
                  <Text style={styles.emptyText}>No customer invoice data available.</Text>
                ) : (
                  topCustomers.map((cust, idx) => {
                    const avatarTheme = getAvatarTheme(cust.name);
                    const initials = getInitials(cust.name);

                    return (
                      <View key={cust.name} style={styles.custRow}>
                        <View style={styles.custRankBadge}>
                          <Text style={styles.custRankText}>#{idx + 1}</Text>
                        </View>
                        <View style={[styles.custAvatar, { backgroundColor: avatarTheme.bg }]}>
                          <Text style={[styles.custAvatarText, { color: avatarTheme.text }]}>{initials}</Text>
                        </View>
                        <View style={styles.custInfo}>
                          <Text numberOfLines={1} style={styles.custName}>{cust.name}</Text>
                          <Text style={styles.custCount}>{cust.count} {cust.count === 1 ? 'Invoice' : 'Invoices'}</Text>
                        </View>
                        <Text style={styles.custTotal}>
                          {formatCurrency(cust.total, currencySymbol)}
                        </Text>
                      </View>
                    );
                  })
                )}
              </Card>

              {/* Invoice Status Counts Grid */}
              <Card variant="elevated" padding={16} style={styles.sectionCard}>
                <Text style={styles.cardHeading}>Invoice Status Overview</Text>
                <View style={styles.statusGrid}>
                  <View style={styles.statusBox}>
                    <Text style={[styles.statusBoxCount, { color: colors.success }]}>{statusCounts.PAID}</Text>
                    <Text style={styles.statusBoxLabel}>Paid</Text>
                  </View>
                  <View style={styles.statusBox}>
                    <Text style={[styles.statusBoxCount, { color: '#E11D48' }]}>{statusCounts.UNPAID}</Text>
                    <Text style={styles.statusBoxLabel}>Unpaid</Text>
                  </View>
                  <View style={styles.statusBox}>
                    <Text style={[styles.statusBoxCount, { color: colors.warning }]}>{statusCounts.PARTIAL}</Text>
                    <Text style={styles.statusBoxLabel}>Partial</Text>
                  </View>
                  <View style={styles.statusBox}>
                    <Text style={[styles.statusBoxCount, { color: colors.danger }]}>{statusCounts.OVERDUE}</Text>
                    <Text style={styles.statusBoxLabel}>Overdue</Text>
                  </View>
                  <View style={styles.statusBox}>
                    <Text style={[styles.statusBoxCount, { color: '#64748B' }]}>{statusCounts.DRAFT}</Text>
                    <Text style={styles.statusBoxLabel}>Draft</Text>
                  </View>
                </View>
              </Card>
            </View>
          </View>
        ) : (
          <>
            {/* Visual Inflow vs Outstanding Ratio Bar Card */}
            <Card variant="elevated" padding={16} style={styles.sectionCard}>
              <Text style={styles.cardHeading}>Collection Efficiency</Text>
              <View style={styles.ratioBarContainer}>
                <View style={styles.ratioBarLabels}>
                  <Text style={[styles.ratioLabel, { color: colors.success }]}>
                    Collected ({collectionRate}%)
                  </Text>
                  <Text style={[styles.ratioLabel, { color: colors.warning }]}>
                    Pending ({outstandingRate}%)
                  </Text>
                </View>
                <View style={styles.ratioTrack}>
                  <View style={[styles.ratioFillPaid, { width: `${collectionRate}%` }]} />
                  <View style={[styles.ratioFillPending, { width: `${outstandingRate}%` }]} />
                </View>
              </View>

              <View style={styles.miniMetricsGrid}>
                <View style={styles.miniMetricCol}>
                  <Text style={styles.miniMetricLabel}>Outstanding</Text>
                  <Text numberOfLines={1} style={[styles.miniMetricVal, { color: colors.warning }]}>
                    {formatCurrency(totalOutstanding, currencySymbol)}
                  </Text>
                </View>
                <View style={styles.miniMetricDivider} />
                <View style={styles.miniMetricCol}>
                  <Text style={styles.miniMetricLabel}>Overdue</Text>
                  <Text numberOfLines={1} style={[styles.miniMetricVal, { color: colors.danger }]}>
                    {formatCurrency(totalOverdue, currencySymbol)}
                  </Text>
                </View>
                <View style={styles.miniMetricDivider} />
                <View style={styles.miniMetricCol}>
                  <Text style={styles.miniMetricLabel}>Tax Billed</Text>
                  <Text numberOfLines={1} style={styles.miniMetricVal}>
                    {formatCurrency(totalTax, currencySymbol)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* 6-Month Invoiced vs Collected Bar Chart */}
            <Card variant="elevated" padding={16} style={styles.sectionCard}>
              <View style={styles.chartHeaderRow}>
                <View>
                  <Text style={styles.cardHeading}>Revenue vs Inflow (6 Mo)</Text>
                  <Text style={styles.chartSubtitle}>Monthly comparison</Text>
                </View>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendLabel}>Billed</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendLabel}>Paid</Text>
                  </View>
                </View>
              </View>

              {selectedChartItem && (
                <View style={styles.chartTooltip}>
                  <Text style={styles.tooltipMonth}>{selectedChartItem.label} Details:</Text>
                  <Text style={styles.tooltipText}>
                    Billed: <Text style={{ fontWeight: '700' }}>{formatCurrency(selectedChartItem.billed, currencySymbol)}</Text> • Collected: <Text style={{ fontWeight: '700', color: colors.success }}>{formatCurrency(selectedChartItem.collected, currencySymbol)}</Text>
                  </Text>
                </View>
              )}

              <View style={styles.barsContainer}>
                {monthlyChartData.map((item) => {
                  const billedHeight = maxChartValue > 0 ? Math.max(6, Math.round((item.billed / maxChartValue) * 110)) : 6;
                  const paidHeight = maxChartValue > 0 ? Math.max(6, Math.round((item.collected / maxChartValue) * 110)) : 6;
                  const isSelected = selectedChartMonth === item.mStr;

                  return (
                    <TouchableOpacity
                      key={item.mStr}
                      activeOpacity={0.8}
                      onPress={() => setSelectedChartMonth(isSelected ? null : item.mStr)}
                      style={[styles.chartColWrapper, isSelected && styles.chartColSelected]}
                    >
                      <View style={styles.barPair}>
                        <View style={[styles.bar, { height: billedHeight, backgroundColor: colors.primary }]} />
                        <View style={[styles.bar, { height: paidHeight, backgroundColor: '#10B981' }]} />
                      </View>
                      <Text style={[styles.monthLabel, isSelected && styles.monthLabelActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* Receivables Aging Analysis */}
            <Card variant="elevated" padding={16} style={styles.sectionCard}>
              <View style={styles.cardTitleRow}>
                <Clock size={18} color={colors.primaryDarker} />
                <Text style={styles.cardHeading}>Receivables Aging Analysis</Text>
              </View>

              <View style={styles.agingItem}>
                <View style={styles.agingHeader}>
                  <Text style={styles.agingLabel}>Current (0 – 30 Days)</Text>
                  <Text style={styles.agingAmount}>
                    {formatCurrency(Math.max(0, totalOutstanding - totalOverdue), currencySymbol)}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '75%', backgroundColor: colors.primary }]} />
                </View>
              </View>

              <View style={styles.agingItem}>
                <View style={styles.agingHeader}>
                  <Text style={styles.agingLabel}>31 – 60 Days Overdue</Text>
                  <Text style={[styles.agingAmount, { color: colors.warning }]}>
                    {formatCurrency(totalOverdue, currencySymbol)}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: totalOverdue > 0 ? '35%' : '0%', backgroundColor: colors.warning }]} />
                </View>
              </View>

              <View style={styles.agingItem}>
                <View style={styles.agingHeader}>
                  <Text style={styles.agingLabel}>60+ Days Overdue</Text>
                  <Text style={[styles.agingAmount, { color: colors.danger }]}>
                    {formatCurrency(0, currencySymbol)}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: '0%', backgroundColor: colors.danger }]} />
                </View>
              </View>
            </Card>

            {/* Top 5 Customers by Revenue */}
            <Card variant="elevated" padding={16} style={styles.sectionCard}>
              <View style={styles.cardTitleRow}>
                <Users size={18} color={colors.primaryDarker} />
                <Text style={styles.cardHeading}>Top Clients by Revenue</Text>
              </View>

              {topCustomers.length === 0 ? (
                <Text style={styles.emptyText}>No customer invoice data available.</Text>
              ) : (
                topCustomers.map((cust, idx) => {
                  const avatarTheme = getAvatarTheme(cust.name);
                  const initials = getInitials(cust.name);

                  return (
                    <View key={cust.name} style={styles.custRow}>
                      <View style={styles.custRankBadge}>
                        <Text style={styles.custRankText}>#{idx + 1}</Text>
                      </View>
                      <View style={[styles.custAvatar, { backgroundColor: avatarTheme.bg }]}>
                        <Text style={[styles.custAvatarText, { color: avatarTheme.text }]}>{initials}</Text>
                      </View>
                      <View style={styles.custInfo}>
                        <Text numberOfLines={1} style={styles.custName}>{cust.name}</Text>
                        <Text style={styles.custCount}>{cust.count} {cust.count === 1 ? 'Invoice' : 'Invoices'}</Text>
                      </View>
                      <Text style={styles.custTotal}>
                        {formatCurrency(cust.total, currencySymbol)}
                      </Text>
                    </View>
                  );
                })
              )}
            </Card>

            {/* Invoice Status Counts Grid */}
            <Card variant="elevated" padding={16} style={styles.sectionCard}>
              <Text style={styles.cardHeading}>Invoice Status Overview</Text>
              <View style={styles.statusGrid}>
                <View style={styles.statusBox}>
                  <Text style={[styles.statusBoxCount, { color: colors.success }]}>{statusCounts.PAID}</Text>
                  <Text style={styles.statusBoxLabel}>Paid</Text>
                </View>
                <View style={styles.statusBox}>
                  <Text style={[styles.statusBoxCount, { color: '#E11D48' }]}>{statusCounts.UNPAID}</Text>
                  <Text style={styles.statusBoxLabel}>Unpaid</Text>
                </View>
                <View style={styles.statusBox}>
                  <Text style={[styles.statusBoxCount, { color: colors.warning }]}>{statusCounts.PARTIAL}</Text>
                  <Text style={styles.statusBoxLabel}>Partial</Text>
                </View>
                <View style={styles.statusBox}>
                  <Text style={[styles.statusBoxCount, { color: colors.danger }]}>{statusCounts.OVERDUE}</Text>
                  <Text style={styles.statusBoxLabel}>Overdue</Text>
                </View>
                <View style={styles.statusBox}>
                  <Text style={[styles.statusBoxCount, { color: '#64748B' }]}>{statusCounts.DRAFT}</Text>
                  <Text style={styles.statusBoxLabel}>Draft</Text>
                </View>
              </View>
            </Card>
          </>
        )}
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
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  desktopColumns: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 1.3,
  },
  desktopRightCol: {
    flex: 1,
  },
  dateFilterContainer: {
    paddingTop: 10,
    marginBottom: 8,
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  dateFilterChipActive: {
    backgroundColor: colors.primaryDarker,
    borderColor: colors.primaryDarker,
  },
  dateFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  exportStrip: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  kpiCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  kpiCardLeft: {},
  kpiCardRight: {},
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  kpiCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  kpiCardSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sectionCard: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7E5DC',
  },
  cardHeading: {
    ...typography.h3,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratioBarContainer: {
    marginTop: 10,
  },
  ratioBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratioLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  ratioTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
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
  miniMetricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  miniMetricCol: {
    flex: 1,
    alignItems: 'center',
  },
  miniMetricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  miniMetricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  miniMetricDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendBox: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chartTooltip: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  tooltipMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  tooltipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chartColWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  chartColSelected: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginBottom: 6,
  },
  bar: {
    width: 12,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  monthLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  monthLabelActive: {
    color: colors.primaryDarker,
    fontWeight: '700',
  },
  agingItem: {
    marginBottom: 10,
  },
  agingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  agingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  agingAmount: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  custRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  custRankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  custRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  custAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  custAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  custInfo: {
    flex: 1,
  },
  custName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  custCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  custTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 10,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 2,
  },
  statusBoxCount: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusBoxLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
