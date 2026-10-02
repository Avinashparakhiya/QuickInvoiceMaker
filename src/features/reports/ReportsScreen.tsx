import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Header } from '../../components/common/Header';
import { DateRangeFilter, DateRangeType } from '../../components/reports/DateRangeFilter';
import { ExportButtonsStrip } from '../../components/reports/ExportButtonsStrip';
import { ReportKpiCards } from '../../components/reports/ReportKpiCards';
import { CollectionEfficiencyCard } from '../../components/reports/CollectionEfficiencyCard';
import { RevenueInflowChart, MonthlyChartPoint } from '../../components/reports/RevenueInflowChart';
import { ReceivablesAgingCard } from '../../components/reports/ReceivablesAgingCard';
import { PaymentOverviewCard } from '../../components/reports/PaymentOverviewCard';
import { TopCustomersCard, TopCustomerItem } from '../../components/reports/TopCustomersCard';
import { InvoiceStatusSummary } from '../../components/reports/InvoiceStatusSummary';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { paymentRepository } from '../../database/repositories/paymentRepository';
import { generateInvoicesCsv } from '../../utils/exportImport';
import { buildFinancialReportPdfHtml } from '../../pdf/reportPdfBuilder';
import { colors } from '../../theme/colors';
import { Payment, Invoice } from '../../types';
import { useResponsive } from '../../utils/useResponsive';
import { subMonths, format } from 'date-fns';

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { contentMaxWidth, horizontalPadding, isWideScreen } = useResponsive();
  const { activeOrg } = useOrgStore();
  const { kpiSummary, invoices, loadDashboardData, loadInvoices, setFilterStatus } = useInvoiceStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('THIS_MONTH');

  const loadAllData = async () => {
    if (!activeOrg) return;
    await Promise.all([
      loadDashboardData(activeOrg.id),
      loadInvoices(activeOrg.id),
      paymentRepository.getByOrg(activeOrg.id).then(setPayments),
    ]);
  };

  useEffect(() => {
    if (activeOrg && isFocused) {
      loadAllData();
    }
  }, [activeOrg?.id, isFocused]);

  const onRefresh = async () => {
    if (!activeOrg) return;
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

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
        const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
        const quarterStartDate = new Date(now.getFullYear(), currentQuarterMonth, 1).toISOString().slice(0, 10);
        return invoices.filter((i) => i.issueDate >= quarterStartDate);
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
        const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
        const quarterStartDate = new Date(now.getFullYear(), currentQuarterMonth, 1).toISOString().slice(0, 10);
        return payments.filter((p) => p.paymentDate >= quarterStartDate);
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

  // Receivables Aging Breakdown
  const currentReceivables = Math.max(0, totalOutstanding - totalOverdue);
  const overdue30 = totalOverdue; // Under 60 days
  const overdue60 = 0;

  // Payment Analytics
  const avgPayment = filteredPayments.length > 0 ? Math.round(totalPaid / filteredPayments.length) : 0;
  const largestPayment = filteredPayments.length > 0 ? Math.max(...filteredPayments.map((p) => p.amount)) : 0;

  // Monthly 6-month historical Bar Chart data
  const monthlyChartData: MonthlyChartPoint[] = useMemo(() => {
    const months: MonthlyChartPoint[] = [];
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

  // Top 5 Customers by Revenue
  const topCustomers: TopCustomerItem[] = useMemo(() => {
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
    const counts = { PAID: 0, UNPAID: 0, PARTIAL: 0, OVERDUE: 0, DRAFT: 0 };
    filteredInvoices.forEach((inv) => {
      if (counts[inv.status as keyof typeof counts] !== undefined) {
        counts[inv.status as keyof typeof counts] += 1;
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

  const handleNavigateToInvoices = (status?: string) => {
    if (status) {
      setFilterStatus(status);
    }
    navigation.navigate('TransactionsTab');
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Title, Org Name, and Notification Button */}
      <Header
        title="Reports & Analytics"
        subtitle={activeOrg?.displayName || activeOrg?.name || 'Workspace'}
        onPressNotifications={() => navigation.navigate('NotificationSettings')}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { maxWidth: contentMaxWidth, paddingHorizontal: horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 2. Date Range Filter Strip */}
        <DateRangeFilter
          selectedValue={dateRange}
          onSelect={setDateRange}
        />

        {/* 3. Export CSV and Statement PDF Buttons */}
        <ExportButtonsStrip
          onExportCsv={handleExportCsv}
          onExportPdf={handleShareReportPdf}
          exporting={exporting}
        />

        {/* 4. Two Main KPI Cards (TOTAL SALES & CASH INFLOW) */}
        <ReportKpiCards
          totalSales={totalSales}
          totalPaid={totalPaid}
          invoiceCount={filteredInvoices.length}
          paymentCount={filteredPayments.length}
          collectionRate={collectionRate}
          currencySymbol={currencySymbol}
          onPressSales={() => handleNavigateToInvoices('ALL')}
          onPressInflow={() => navigation.navigate('PaymentList')}
        />

        {/* 5. Responsive Layout: Desktop 2-Columns vs Mobile Single Stack */}
        {isWideScreen ? (
          <View style={styles.desktopColumns}>
            {/* Left Column: Charts & Analysis */}
            <View style={styles.desktopLeftCol}>
              <RevenueInflowChart
                data={monthlyChartData}
                currencySymbol={currencySymbol}
              />

              <CollectionEfficiencyCard
                collectionRate={collectionRate}
                outstandingRate={outstandingRate}
                outstanding={totalOutstanding}
                overdue={totalOverdue}
                taxBilled={totalTax}
                currencySymbol={currencySymbol}
                onPressOutstanding={() => handleNavigateToInvoices('UNPAID')}
                onPressOverdue={() => handleNavigateToInvoices('OVERDUE')}
              />

              <ReceivablesAgingCard
                currentAmount={currentReceivables}
                overdue30Amount={overdue30}
                overdue60Amount={overdue60}
                currencySymbol={currencySymbol}
              />
            </View>

            {/* Right Column: Payments, Top Clients, Statuses */}
            <View style={styles.desktopRightCol}>
              <PaymentOverviewCard
                totalPaymentsAmount={totalPaid}
                paymentCount={filteredPayments.length}
                avgPayment={avgPayment}
                largestPayment={largestPayment}
                currencySymbol={currencySymbol}
              />

              <TopCustomersCard
                customers={topCustomers}
                currencySymbol={currencySymbol}
              />

              <InvoiceStatusSummary
                statusCounts={statusCounts}
              />
            </View>
          </View>
        ) : (
          <>
            {/* Collection Efficiency Card */}
            <CollectionEfficiencyCard
              collectionRate={collectionRate}
              outstandingRate={outstandingRate}
              outstanding={totalOutstanding}
              overdue={totalOverdue}
              taxBilled={totalTax}
              currencySymbol={currencySymbol}
              onPressOutstanding={() => handleNavigateToInvoices('UNPAID')}
              onPressOverdue={() => handleNavigateToInvoices('OVERDUE')}
            />

            {/* 6-Month Invoiced vs Collected Bar Chart */}
            <RevenueInflowChart
              data={monthlyChartData}
              currencySymbol={currencySymbol}
            />

            {/* Receivables Aging Analysis */}
            <ReceivablesAgingCard
              currentAmount={currentReceivables}
              overdue30Amount={overdue30}
              overdue60Amount={overdue60}
              currencySymbol={currencySymbol}
            />

            {/* Payment Overview */}
            <PaymentOverviewCard
              totalPaymentsAmount={totalPaid}
              paymentCount={filteredPayments.length}
              avgPayment={avgPayment}
              largestPayment={largestPayment}
              currencySymbol={currencySymbol}
            />

            {/* Top 5 Customers by Revenue */}
            <TopCustomersCard
              customers={topCustomers}
              currencySymbol={currencySymbol}
            />

            {/* Invoice Status Overview */}
            <InvoiceStatusSummary
              statusCounts={statusCounts}
            />
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
    paddingTop: 8,
    paddingBottom: 96,
  },
  desktopColumns: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    width: '100%',
  },
  desktopLeftCol: {
    flex: 1.25,
  },
  desktopRightCol: {
    flex: 1,
  },
});
