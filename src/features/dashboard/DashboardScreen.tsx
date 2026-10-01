import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { KPIStatCard } from '../../components/kpi/KPIStatCard';
import { InvoiceStatusDonut } from '../../components/dashboard/InvoiceStatusDonut';
import { OrgSwitcherModal } from '../../components/common/OrgSwitcherModal';
import { EmptyState } from '../../components/common/EmptyState';
import { useOrgStore } from '../../store/useOrgStore';
import { useInvoiceStore } from '../../store/useInvoiceStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { formatCurrency } from '../../utils/currency';
import { formatDate, getDueStatusText } from '../../utils/dates';
import { Invoice, InvoiceStatus } from '../../types';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeOrg, initialize } = useOrgStore();
  const {
    kpiSummary,
    dueSoonInvoices,
    recentInvoices,
    loadDashboardData,
    setFilterStatus,
  } = useInvoiceStore();

  const [orgSwitcherVisible, setOrgSwitcherVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (activeOrg) {
      loadDashboardData(activeOrg.id);
    }
  }, [activeOrg?.id]);

  const onRefresh = async () => {
    if (!activeOrg) return;
    setRefreshing(true);
    await loadDashboardData(activeOrg.id);
    setRefreshing(false);
  };

  const currencySymbol = activeOrg?.currencySymbol || '$';

  const totalInvoicesCount =
    (kpiSummary?.paidCount || 0) +
    (kpiSummary?.unpaidCount || 0) +
    (kpiSummary?.partialCount || 0) +
    (kpiSummary?.overdueCount || 0);

  const handleStatusPress = (status: string) => {
    setFilterStatus(status);
    navigation.navigate('TransactionsTab');
  };

  const getStatusItemTheme = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return {
          iconBg: '#DCFCE7',
          iconColor: '#16A34A',
          statusColor: '#16A34A',
          statusText: 'Paid',
          Icon: CheckCircle2,
        };
      case 'PARTIAL':
        return {
          iconBg: '#E0F2FE',
          iconColor: '#0284C7',
          statusColor: '#0284C7',
          statusText: 'Partial',
          Icon: FileText,
        };
      case 'OVERDUE':
        return {
          iconBg: '#FEE2E2',
          iconColor: '#EF4444',
          statusColor: '#EF4444',
          statusText: 'Overdue',
          Icon: AlertTriangle,
        };
      case 'UNPAID':
      default:
        return {
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
          statusColor: '#D97706',
          statusText: 'Unpaid',
          Icon: FileText,
        };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        activeOrg={activeOrg}
        onPressOrgSwitcher={() => setOrgSwitcherVisible(true)}
        onPressSettings={() => navigation.navigate('Settings')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {/* KPI Grid (2x2) */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KPIStatCard
              title="Total Sales"
              amount={kpiSummary?.totalSales || 0}
              currencySymbol={currencySymbol}
              tone="green"
              onPress={() => handleStatusPress('ALL')}
            />
            <View style={styles.kpiGap} />
            <KPIStatCard
              title="Outstanding"
              amount={kpiSummary?.outstanding || 0}
              currencySymbol={currencySymbol}
              tone="amber"
              onPress={() => handleStatusPress('UNPAID')}
            />
          </View>

          <View style={styles.kpiRow}>
            <KPIStatCard
              title="Overdue"
              amount={kpiSummary?.overdue || 0}
              currencySymbol={currencySymbol}
              tone="red"
              onPress={() => handleStatusPress('OVERDUE')}
            />
            <View style={styles.kpiGap} />
            <KPIStatCard
              title="Total Invoices"
              value={totalInvoicesCount}
              isCurrency={false}
              tone="slate"
              onPress={() => handleStatusPress('ALL')}
            />
          </View>
        </View>

        {/* Invoice Status Donut Chart */}
        <InvoiceStatusDonut
          kpiSummary={kpiSummary}
          onSelectStatus={handleStatusPress}
        />

        {/* Due Soon Section */}
        {dueSoonInvoices.length > 0 ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Upcoming Due Dates</Text>
              <Text style={styles.badgeCount}>{dueSoonInvoices.length}</Text>
            </View>

            {dueSoonInvoices.map((inv: Invoice) => {
              const dueInfo = getDueStatusText(inv.dueDate);
              return (
                <TouchableOpacity
                  key={inv.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                  style={styles.invoiceCard}
                >
                  <View style={[styles.invIconBox, { backgroundColor: '#FEE2E2' }]}>
                    <AlertCircle size={20} color="#EF4444" />
                  </View>

                  <View style={styles.invDetails}>
                    <Text numberOfLines={1} style={styles.invNumber}>
                      {inv.invoiceNumber}
                    </Text>
                    <Text numberOfLines={1} style={styles.invCustomer}>
                      {inv.customerName || 'Walk-in Customer'}
                    </Text>
                  </View>

                  <View style={styles.invRightAlign}>
                    <Text style={styles.invAmount}>
                      {formatCurrency(inv.balanceDue, inv.currencySymbol)}
                    </Text>
                    <Text style={styles.invDueText}>{dueInfo.text}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Recent Invoices Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setFilterStatus('ALL');
                navigation.navigate('TransactionsTab');
              }}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={14} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>

          {recentInvoices.length === 0 ? (
            <EmptyState
              icon={<FileText size={28} color={colors.primaryDark} />}
              title="No Invoices Yet"
              description="Create your first invoice in under 60 seconds with 12+ professional templates."
              actionTitle="+ Create Invoice"
              onAction={() => navigation.navigate('InvoiceCreate', {})}
            />
          ) : (
            recentInvoices.map((inv: Invoice) => {
              const theme = getStatusItemTheme(inv.status);
              const StatusIcon = theme.Icon;

              return (
                <TouchableOpacity
                  key={inv.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                  style={styles.invoiceCard}
                >
                  <View style={[styles.invIconBox, { backgroundColor: theme.iconBg }]}>
                    <StatusIcon size={20} color={theme.iconColor} />
                  </View>

                  <View style={styles.invDetails}>
                    <Text numberOfLines={1} style={styles.invNumber}>
                      {inv.invoiceNumber}
                    </Text>
                    <Text numberOfLines={1} style={styles.invCustomer}>
                      {inv.customerName || 'Walk-in Customer'}
                    </Text>
                  </View>

                  <View style={styles.invRightAlign}>
                    <Text style={styles.invAmount}>
                      {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                    </Text>
                    <Text style={[styles.invStatusLabel, { color: theme.statusColor }]}>
                      {theme.statusText}
                    </Text>
                    <Text style={styles.invDateText}>
                      {formatDate(inv.issueDate, 'dd MMM, yyyy')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Organization Switcher Modal */}
      <OrgSwitcherModal
        visible={orgSwitcherVisible}
        onClose={() => setOrgSwitcherVisible(false)}
        onAddNewOrg={() => navigation.navigate('OrganizationForm', {})}
      />
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
    paddingTop: 8,
    paddingBottom: 32,
  },
  kpiGrid: {
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  kpiGap: {
    width: 10,
  },
  sectionContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  badgeCount: {
    ...typography.caption,
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: '700',
    fontSize: 11,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '600',
    marginRight: 2,
  },
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  invIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  invDetails: {
    flex: 1,
    paddingRight: 8,
  },
  invNumber: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  invCustomer: {
    ...typography.captionRegular,
    color: colors.textSecondary,
    fontSize: 13,
  },
  invRightAlign: {
    alignItems: 'flex-end',
  },
  invAmount: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  invStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  invDateText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  invDueText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
});
